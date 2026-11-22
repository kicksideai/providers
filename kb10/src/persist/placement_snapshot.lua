-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local ops = require("ops")
local sql = require("sql")
local uuid = require("uuid")

local DISCOVERY_LIMIT = 32
local MAX_METADATA_CHARS = 8192
local reader = {}

local function query(statement: string, args: {any}): (any?, error?)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local rows, err = db:query(statement, args)
    local _, release_err = db:release()
    if err or release_err then return nil, err or release_err end
    return rows, nil
end

local function metadata(value: any): (table?, error?)
    if value == nil then return {}, nil end
    if #value > MAX_METADATA_CHARS then
        return nil, errors.new({kind = errors.INVALID, message = "placement metadata exceeds the read limit"})
    end
    local decoded, err = json.decode(value)
    if err then return nil, err end
    return type(decoded) == "table" and decoded or {}, nil
end

local function decode_node(row: any): (any?, error?)
    if not row then return nil, nil end
    local decoded, err = metadata(row.metadata)
    if err then return nil, err end
    row.id, row.metadata = tostring(row.id), decoded
    return row, nil
end

local function read_input(tx: any, dialect: string, store_id: string, component_id: string, document_id: string): (table?, error?)
    local stores, store_err = tx:query([[SELECT substr(CAST(config AS TEXT),1,$1) AS config
        FROM kb10_stores WHERE id=$2 AND component_id=$3]], {MAX_METADATA_CHARS + 1, store_id, component_id})
    if store_err then return nil, store_err end
    if not stores[1] then
        return nil, errors.new({kind = errors.NOT_FOUND, message = "knowledge graph store not found for this component"})
    end
    local config, config_err = metadata(stores[1].config)
    if config_err then return nil, config_err end

    local docs, doc_err = tx:query([[SELECT id,node_type,substr(content,1,2000) AS content,
        substr(CAST(metadata AS TEXT),1,$1) AS metadata
        FROM kb10_nodes WHERE store_id=$2 AND id=$3 AND node_type='document' AND parent_id IS NULL]],
        {MAX_METADATA_CHARS + 1, store_id, document_id})
    if doc_err then return nil, doc_err end
    local document, decode_err = decode_node(docs[1])
    if decode_err then return nil, decode_err end
    if not document then
        return nil, errors.new({kind = errors.NOT_FOUND, message = "document not found in this knowledge graph"})
    end
    if document.metadata.status == "failed" then
        return nil, errors.new({kind = errors.INVALID, message = "failed documents cannot be placed"})
    end
    local summaries, summary_err = tx:query([[SELECT substr(content,1,6000) AS content
        FROM kb10_nodes WHERE store_id=$1 AND parent_id=$2 AND node_type='summary'
        ORDER BY created_at,id LIMIT 1]], {store_id, document.id})
    if summary_err then return nil, summary_err end
    local root, root_err = ops.taxonomy_root_tx(tx, dialect, store_id, true)
    if not root then return nil, root_err end
    return {config = config, document = document, summary = summaries[1] and summaries[1].content,
        root_id = root, postgres = dialect == sql.type.POSTGRES}, nil
end

function reader.input(store_id: string, component_id: string, document_id: string): (table?, error?)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local dialect, type_err = ops.get_db_type(db)
    if not dialect then db:release(); return nil, type_err end
    if dialect == sql.type.POSTGRES and not uuid.validate(document_id) then
        db:release()
        return nil, errors.new({kind = errors.INVALID, message = "document ID must be a UUID on PostgreSQL"})
    end
    local tx, begin_err = db:begin({isolation = sql.isolation.REPEATABLE_READ, read_only = true})
    if not tx then db:release(); return nil, begin_err end
    local value, err = read_input(tx, dialect, store_id, component_id, document_id)
    local _, end_err = tx:rollback()
    local _, release_err = db:release()
    if err or end_err or release_err then return nil, err or end_err or release_err end
    return value, nil
end

local function scalar(column: string, key: string, postgres: boolean): string
    if postgres then
        return "CASE WHEN jsonb_typeof(" .. column .. "->'" .. key .. "')='string' THEN substr("
            .. column .. "->>'" .. key .. "',1,256) END"
    end
    local path = "'$." .. key .. "'"
    return "CASE WHEN json_valid(" .. column .. ") THEN CASE WHEN json_type(" .. column .. "," .. path
        .. ")='text' THEN substr(json_extract(" .. column .. "," .. path .. "),1,256) END END"
end

local function lock_column(column: string, postgres: boolean): string
    return "CASE WHEN " .. ops.locked_graph_metadata(column, postgres and sql.type.POSTGRES or sql.type.SQLITE)
        .. " THEN 1 ELSE 0 END"
end

local function node_columns(postgres: boolean, children: boolean): string
    return "n.id,n.node_type," .. scalar("n.metadata", "label", postgres) .. " AS label,"
        .. lock_column("n.metadata", postgres) .. " AS locked"
        .. (children and [[,CASE WHEN n.node_type='concept' AND EXISTS (
            SELECT 1 FROM kb10_nodes child WHERE child.store_id=n.store_id AND child.parent_id=n.id
        ) THEN 1 ELSE 0 END AS has_children]] or "")
end

local function prepare_node(row: any): any
    if not row then return nil end
    row.id = tostring(row.id)
    row.metadata = {label = row.label, locked = tonumber(row.locked) == 1}
    row.label, row.locked = nil, nil
    return row
end

function reader.node(store_id: string, id: string, postgres: boolean): (any?, error?)
    local rows, err = query("SELECT " .. node_columns(postgres, true) .. [[ FROM kb10_nodes n
        WHERE n.store_id=$1 AND n.id=$2]], {store_id, id})
    if err then return nil, err end
    return prepare_node(rows[1]), nil
end

local function exclude_ids(params: {any}, excluded: {[string]: boolean}): string
    local marks = {}
    for id in pairs(excluded) do
        params[#params + 1] = id
        marks[#marks + 1] = "$" .. #params
    end
    return #marks == 0 and "" or " AND n.id NOT IN (" .. table.concat(marks, ",") .. ")"
end

function reader.label(store_id: string, label_key: string, excluded: {[string]: boolean}, postgres: boolean): (any?, error?)
    local params = {store_id, label_key}
    local rows, err = query("SELECT " .. node_columns(postgres, true) .. [[ FROM kb10_nodes n
        WHERE n.store_id=$1 AND n.node_type='concept' AND n.placement_label_key=$2]]
        .. exclude_ids(params, excluded) .. " ORDER BY n.id LIMIT 1", params)
    if err then return nil, err end
    return prepare_node(rows[1]), nil
end

function reader.discovery(store_id: string, excluded: {[string]: boolean}, postgres: boolean): ({any}?, boolean?, error?)
    local params = {store_id}
    -- Keep PostgreSQL's leading scope column in the sort so it seeks the
    -- store index instead of scanning globally ordered node IDs.
    local scope = postgres and "n.store_id >= $1 AND n.store_id <= $1" or "n.store_id=$1"
    local order = postgres and "n.store_id,n.id" or "n.id"
    local parent = postgres and "json_build_array(p.id,p.to_node_id)" or "json_array(p.id,p.to_node_id)"
    local rows, err = query("WITH sample AS MATERIALIZED (SELECT " .. node_columns(postgres, false)
        .. " FROM kb10_nodes n WHERE " .. scope .. " AND n.node_type='concept'"
        .. exclude_ids(params, excluded) .. " ORDER BY " .. order .. " LIMIT " .. tostring(DISCOVERY_LIMIT + 1)
        .. ") SELECT s.*,(SELECT " .. parent .. [[ FROM kb10_edges p
            WHERE p.from_node_id=s.id AND p.store_id=$1 AND p.edge_type='subtopic_of' LIMIT 1) AS parent
        FROM sample s ORDER BY s.id]], params)
    if err then return nil, nil, err end
    local more = #rows > DISCOVERY_LIMIT
    if more then table.remove(rows) end
    for _, row in ipairs(rows) do
        prepare_node(row)
        if row.parent then
            local parent_ids, decode_err = json.decode(row.parent)
            if decode_err then return nil, nil, decode_err end
            row.parent_edge_id, row.parent_id = parent_ids[1], parent_ids[2]
            row.parent = nil
        end
    end
    return rows, more, nil
end

-- The direction and filter are selected by the draft, never from model strings.
function reader.edges(store_id: string, node_id: string, postgres: boolean, direction: string, edge_type: string?, limit: number,
    after: string?, ordered: boolean?): ({any}?, error?)
    local target = direction == "in" and "e.to_node_id" or "e.from_node_id"
    local params = {store_id, node_id}
    local scope, order
    if postgres then
        -- Retain the composite index order even when one endpoint owns most
        -- edges. A PostgreSQL equality filter alone can favor a global scan.
        local endpoint = target .. ",e.store_id"
        order = " ORDER BY " .. endpoint
        if ordered then
            order = order .. ",e.id"
            local lower = "($2,$1,'00000000-0000-0000-0000-000000000000')"
            local operator = ">="
            if after then
                params[3], lower, operator = after, "($2,$1,$3)", ">"
            end
            scope = "(" .. endpoint .. ",e.id)" .. operator .. lower .. " AND (" .. endpoint
                .. ",e.id)<=($2,$1,'ffffffff-ffff-ffff-ffff-ffffffffffff')"
        else
            scope = "(" .. endpoint .. ")>=($2,$1) AND (" .. endpoint .. ")<=($2,$1)"
        end
    else
        scope = "e.store_id=$1 AND " .. target .. "=$2"
        order = ordered and " ORDER BY e.id" or ""
        if after then
            params[3] = after
            scope = scope .. " AND e.id>$3"
        end
    end
    if edge_type == "categorized_as" then
        scope = scope .. " AND e.edge_type='categorized_as'"
    elseif edge_type == "subtopic_of" then
        scope = scope .. " AND e.edge_type='subtopic_of'"
    end
    params[#params + 1] = limit
    local rows, err = query("SELECT e.id,e.from_node_id,e.to_node_id,e.edge_type,"
        .. lock_column("e.metadata", postgres) .. " AS locked FROM kb10_edges e WHERE " .. scope
        .. order .. " LIMIT $" .. #params, params)
    if err then return nil, err end
    for _, edge in ipairs(rows) do
        edge.id, edge.from_node_id, edge.to_node_id = tostring(edge.id), tostring(edge.from_node_id), tostring(edge.to_node_id)
        edge.metadata, edge.locked = {locked = tonumber(edge.locked) == 1}, nil
    end
    return rows, nil
end

function reader.edge_matches(store_id: string, into_id: string, members: {any}, postgres: boolean): ({[string]: string}?, error?)
    if #members == 0 then return {}, nil end
    local params, requested = {}, {}
    for _, edge in ipairs(members) do
        local index = #params + 1
        params[index], params[index + 1] = edge.from_node_id, edge.edge_type
        local id = "$" .. index
        if postgres then id = "CAST(" .. id .. " AS UUID)" end
        requested[#requested + 1] = "(" .. id .. ",$" .. (index + 1) .. ")"
    end
    params[#params + 1], params[#params + 2] = store_id, into_id
    local rows, err = query("WITH requested(source_id,kind) AS (VALUES " .. table.concat(requested, ",") .. [[)
        SELECT r.source_id,r.kind,(SELECT e.id FROM kb10_edges e WHERE e.from_node_id=r.source_id
            AND e.edge_type=r.kind AND e.store_id=$]] .. (#params - 1) .. " AND e.to_node_id=$" .. #params ..
        " LIMIT 1) AS matched FROM requested r", params)
    if err then return nil, err end
    local result = {}
    for _, row in ipairs(rows) do
        if row.matched then result[tostring(row.source_id) .. "\0" .. row.kind] = tostring(row.matched) end
    end
    return result, nil
end

function reader.nodes(store_id: string, ids: {string}, postgres: boolean): ({[string]: any}?, error?)
    if #ids == 0 then return {}, nil end
    local params = {store_id}
    for _, id in ipairs(ids) do params[#params + 1] = id end
    local rows, err = query("SELECT " .. node_columns(postgres, true) .. [[ FROM kb10_nodes n
        WHERE n.store_id=$1 AND n.id IN (]] .. ops.placeholders(#ids, 2) .. ")", params)
    if err then return nil, err end
    local nodes = {}
    for _, row in ipairs(rows) do
        local node = prepare_node(row)
        nodes[node.id] = node
    end
    return nodes, nil
end

function reader.documents(store_id: string, ids: {string}, postgres: boolean): ({any}?, error?)
    if #ids == 0 then return {}, nil end
    local params = {store_id}
    for _, id in ipairs(ids) do params[#params + 1] = id end
    local rows, err = query("SELECT id,node_type," .. scalar("metadata", "title", postgres)
        .. " AS title FROM kb10_nodes WHERE store_id=$1 AND id IN (" .. ops.placeholders(#ids, 2)
        .. ") AND node_type='document'", params)
    if err then return nil, err end
    local documents = {}
    for _, row in ipairs(rows) do
        local id = tostring(row.id)
        documents[id] = {id = id, node_type = row.node_type, title = row.title}
    end
    return documents, nil
end

return reader
