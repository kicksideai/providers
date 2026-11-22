-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local ops = require("ops")
local sql = require("sql")

local MAX_CONCEPTS = 512
local MAX_EDGES = 4096
local MAX_METADATA_CHARS = 8192

local function capacity(): error
    return errors.new({kind = errors.UNAVAILABLE, retryable = false,
        message = "knowledge graph exceeds the placement draft snapshot limit",
        details = {code = "placement_draft_capacity"}})
end

local function metadata(value: any): (table?, error?)
    if value == nil then return {}, nil end
    if #value > MAX_METADATA_CHARS then return nil, capacity() end
    local decoded, err = json.decode(value)
    if err then return nil, err end
    return type(decoded) == "table" and decoded or {}, nil
end

local function document_title(dialect: string): string
    if dialect == sql.type.POSTGRES then
        return "CASE WHEN jsonb_typeof(f.metadata->'title')='string' THEN substr(f.metadata->>'title',1,256) END"
    end
    return [[CASE WHEN json_valid(f.metadata) THEN CASE WHEN json_type(f.metadata,'$.title')='text'
        THEN substr(json_extract(f.metadata,'$.title'),1,256) END END]]
end

local function read_snapshot(tx: any, dialect: string, store_id: string, component_id: string, document_id: string): (table?, error?)
    local stores, store_err = tx:query([[SELECT substr(CAST(config AS TEXT),1,$1) AS config
        FROM kb10_stores WHERE id=$2 AND component_id=$3]], {MAX_METADATA_CHARS + 1, store_id, component_id})
    if store_err then return nil, store_err end
    if not stores[1] then
        return nil, errors.new({kind = errors.NOT_FOUND, message = "knowledge graph store not found for this component"})
    end
    local config, config_err = metadata(stores[1].config)
    if config_err then return nil, config_err end

    local docs, doc_err = tx:query([[SELECT id, node_type, substr(content,1,2000) AS content,
        substr(CAST(metadata AS TEXT),1,$1) AS metadata
        FROM kb10_nodes WHERE store_id=$2 AND id=$3 AND node_type='document' AND parent_id IS NULL]],
        {MAX_METADATA_CHARS + 1, store_id, document_id})
    if doc_err then return nil, doc_err end
    local document = docs[1]
    if not document then
        return nil, errors.new({kind = errors.NOT_FOUND, message = "document not found in this knowledge graph"})
    end
    local decoded, decode_err = metadata(document.metadata)
    if decode_err then return nil, decode_err end
    document.id, document.metadata = tostring(document.id), decoded
    if document.metadata.status == "failed" then
        return nil, errors.new({kind = errors.INVALID, message = "failed documents cannot be placed"})
    end
    local summaries, summary_err = tx:query([[SELECT substr(content,1,6000) AS content
        FROM kb10_nodes WHERE store_id=$1 AND parent_id=$2 AND node_type='summary'
        ORDER BY created_at,id LIMIT 1]], {store_id, document.id})
    if summary_err then return nil, summary_err end

    local concepts, concept_err = tx:query([[SELECT n.id,n.node_type,substr(n.content,1,256) AS content,
        substr(CAST(n.metadata AS TEXT),1,$1) AS metadata,
        CASE WHEN EXISTS (SELECT 1 FROM kb10_nodes child WHERE child.store_id=n.store_id AND child.parent_id=n.id)
            THEN 1 ELSE 0 END AS has_children
        FROM kb10_nodes n WHERE n.store_id=$2 AND n.node_type='concept' LIMIT $3]],
        {MAX_METADATA_CHARS + 1, store_id, MAX_CONCEPTS + 1})
    if concept_err then return nil, concept_err end
    if #concepts > MAX_CONCEPTS then return nil, capacity() end
    for _, concept in ipairs(concepts) do
        local value, err = metadata(concept.metadata)
        if err then return nil, err end
        concept.id, concept.metadata = tostring(concept.id), value
    end

    -- Pull only graph edge facts and their endpoint types/lock flags/titles.
    -- Document bodies and embeddings other than the selected summary are never loaded.
    local locked = ops.locked_graph_metadata
    local statement = [[WITH selected AS (
        SELECT id,store_id,from_node_id,to_node_id,edge_type,metadata,created_at
        FROM kb10_edges WHERE store_id=$1 ORDER BY id LIMIT $2
    )
    SELECT e.id,e.from_node_id,e.to_node_id,e.edge_type,
        f.node_type AS from_type,t.node_type AS to_type,
        CASE WHEN ]] .. locked("e.metadata", dialect) .. [[ THEN 1 ELSE 0 END AS edge_locked,
        CASE WHEN ]] .. locked("f.metadata", dialect) .. [[ THEN 1 ELSE 0 END AS from_locked,
        CASE WHEN ]] .. locked("t.metadata", dialect) .. [[ THEN 1 ELSE 0 END AS to_locked,
        ]] .. document_title(dialect) .. [[ AS from_title
    FROM selected e
    LEFT JOIN kb10_nodes f ON f.store_id=e.store_id AND f.id=e.from_node_id
    LEFT JOIN kb10_nodes t ON t.store_id=e.store_id AND t.id=e.to_node_id
    ORDER BY e.created_at,e.id]]
    local edges, edge_err = tx:query(statement, {store_id, MAX_EDGES + 1})
    if edge_err then return nil, edge_err end
    if #edges > MAX_EDGES then return nil, capacity() end
    local nodes = {[document.id] = document}
    for _, concept in ipairs(concepts) do nodes[concept.id] = concept end
    local function add_node(id: string, kind: string?, locked_value: any, title: string?): ()
        if kind and not nodes[id] then
            nodes[id] = {id = id, node_type = kind, title = title,
                metadata = {locked = tonumber(locked_value) == 1, title = title}}
        elseif title and nodes[id] and nodes[id].node_type == "document" then
            nodes[id].title, nodes[id].metadata.title = title, title
        end
    end
    for index, edge in ipairs(edges) do
        local from_id, to_id = tostring(edge.from_node_id), tostring(edge.to_node_id)
        add_node(from_id, edge.from_type, edge.from_locked, edge.from_title)
        add_node(to_id, edge.to_type, edge.to_locked)
        edges[index] = {id = tostring(edge.id), from_node_id = from_id, to_node_id = to_id,
            edge_type = edge.edge_type, metadata = {locked = tonumber(edge.edge_locked) == 1}}
    end
    return {config = config, document = document, summary = summaries[1] and summaries[1].content,
        nodes = nodes, concepts = concepts, edges = edges}, nil
end

local function read(store_id: string, component_id: string, document_id: string): (table?, error?)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local dialect, type_err = ops.get_db_type(db)
    if not dialect then db:release(); return nil, type_err end
    local tx, begin_err = db:begin({isolation = sql.isolation.REPEATABLE_READ, read_only = true})
    if not tx then db:release(); return nil, begin_err end
    local value, err = read_snapshot(tx, dialect, store_id, component_id, document_id)
    local _, end_err = tx:rollback()
    local _, release_err = db:release()
    if err or end_err or release_err then return nil, err or end_err or release_err end
    return value, nil
end

return {read = read}
