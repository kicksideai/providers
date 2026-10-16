-- Write side of the kb10 persistence layer. Owns the kb10_* aggregate: store
-- create/config/delete, node + embedding + edge inserts, and node/edge/document
-- deletes with their explicit SQLite cascades (per-connection foreign_keys
-- defaults OFF in the pool, so ON DELETE CASCADE does not fire and teardown is
-- done by hand). Each method acquires a pooled connection through ops, runs its
-- mutation, releases the connection, and returns typed errors as values. The
-- dialect branch (SQLite vec0/fts5 vs PostgreSQL pgvector) is resolved per call
-- through ops.

local sql = require("sql")
local json = require("json")
local time = require("time")
local uuid = require("uuid")
local llm = require("llm")
local ops = require("kb10_ops")
local kb10 = require("kb10")

local writer = {}

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function fail_tx(tx: any, db: any, message: any): (nil, any?)
    tx:rollback()
    db:release()
    return nil, message
end

local function commit_tx(tx: any, db: any, label: string): (boolean?, any?)
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        db:release()
        return nil, errors.wrap(commit_err, "failed to commit")
    end
    db:release()
    return true, nil
end

local function root_concept_input(config: any, opts: kb10.StoreCreateOptions): (kb10.NodeInput, string)
    local root_label = is_str(opts.name) and (opts.name :: string) or ""
    local root_description = is_str(opts.description) and (opts.description :: string) or ""
    if root_description == "" and type(config) == "table" and is_str(config.concept_context) then
        root_description = config.concept_context
    end
    local embed_str = root_label
    if root_description ~= "" then embed_str = root_label .. ": " .. root_description end

    local node_type: string = tostring(kb10.NODE_TYPE.CONCEPT)
    local node: kb10.NodeInput = {
        node_type = node_type,
        content = root_description,
        content_type = "text/plain",
        metadata = { label = root_label, concept_type = kb10.CONCEPT_TYPE.ROOT, is_root = true },
    }
    return node, embed_str
end

local function root_embedding(embedding_model: any, embed_str: string): any?
    if not is_str(embedding_model) then return nil end
    local vec, embed_err = llm.embed({ embed_str }, { model = embedding_model, dimensions = ops.VECTOR_DIMENSIONS })
    if embed_err or not vec or not vec.result or #vec.result == 0 then
        return nil
    end
    return vec.result[1]
end

local function insert_rows_tx(tx: any, table_name: string, columns: {string}, rows: {any}): any?
    -- Stay below SQLite's 999-parameter floor and bound each statement's payload.
    local batch_size = math.min(100, math.floor(999 / #columns))
    for first = 1, #rows, batch_size do
        local values: {string} = {}
        local args: {any} = {}
        for i = first, math.min(first + batch_size - 1, #rows) do
            local offset = (i - first) * #columns
            values[#values + 1] = "(" .. ops.placeholders(#columns, offset + 1) .. ")"
            for j = 1, #columns do args[offset + j] = rows[i][j] end
        end
        local _, err = tx:execute("INSERT INTO " .. table_name .. " (" .. table.concat(columns, ", ") ..
            ") VALUES " .. table.concat(values, ", "), args)
        if err then return err end
    end
    return nil
end

local function insert_nodes_tx(tx: any, db_type: any, store_id: any, nodes: {any}): ({string}?, any?)
    local ids: {string} = {}
    local rows: {any} = {}
    local fts: {any} = {}
    for i, node in ipairs(nodes) do
        local input = node :: kb10.NodeInput
        local id = input.id or uuid.v7()
        ids[i] = id
        rows[i] = { id, store_id, input.parent_id, input.node_type, input.content,
            input.content_type, json.encode(input.metadata or {}) }
        if db_type == sql.type.SQLITE and input.content then
            fts[#fts + 1] = { id, input.content, input.node_type }
        end
    end
    local err = insert_rows_tx(tx, "kb10_nodes", { "id", "store_id", "parent_id", "node_type", "content", "content_type", "metadata" }, rows)
    if err then return nil, tostring(err) end
    local fts_err = insert_rows_tx(tx, "kb10_nodes_fts", { "node_id", "content", "node_type" }, fts)
    if fts_err then return nil, errors.wrap(fts_err, "fts insert failed") end
    return ids, nil
end

local function insert_node_tx(tx: any, db_type: any, store_id: any, node: any): (string?, any?)
    local ids, err = insert_nodes_tx(tx, db_type, store_id, { type(node) == "table" and node or {} })
    if err or not ids then return nil, err end
    return ids[1], nil
end

local function insert_embeddings_tx(tx: any, db_type: any, store_id: any, embeddings: {any}): ({string}?, any?)
    local ids: {string} = {}
    local rows: {any} = {}
    for i, input in ipairs(embeddings) do
        if type(input.embedding) ~= "table" then
            return nil, errors.new({ message = "embedding is required", kind = errors.INVALID })
        end
        local parent_id = input.parent_id
        if db_type == sql.type.SQLITE and not parent_id then parent_id = "" end
        ids[i] = uuid.v7()
        rows[i] = { ids[i], input.node_id, store_id, input.node_type, parent_id, ops.vector_to_string(input.embedding) }
    end
    local err = insert_rows_tx(tx, "kb10_embeddings", { "id", "node_id", "store_id", "node_type", "parent_id", "embedding" }, rows)
    if err then return nil, tostring(err) end
    return ids, nil
end

local function insert_embedding_tx(tx: any, db_type: any, store_id: any, node_id: any, node_type: any, parent_id: any, embedding: any): (string?, any?)
    if type(embedding) ~= "table" then return nil, errors.new({ message = "embedding is required", kind = errors.INVALID }) end
    local _, clear_err = tx:execute(
        "DELETE FROM kb10_embeddings WHERE store_id = $1 AND node_id = $2", { store_id, node_id })
    if clear_err then return nil, tostring(clear_err) end
    local ids, err = insert_embeddings_tx(tx, db_type, store_id, {
        { node_id = node_id, node_type = node_type, parent_id = parent_id, embedding = embedding },
    })
    if err or not ids then return nil, err end
    return ids[1], nil
end

local function insert_edge_tx(tx: any, store_id: any, edge: any): (string?, any?)
    local edge_input = (type(edge) == "table" and edge or {}) :: kb10.EdgeInput
    local id = uuid.v7()
    local metadata_json = json.encode(edge_input.metadata or {})

    local _, exec_err = tx:execute(
        "INSERT INTO kb10_edges (id, store_id, from_node_id, to_node_id, edge_type, weight, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        { id, store_id, edge_input.from_node_id, edge_input.to_node_id, edge_input.edge_type, edge_input.weight or 1.0, metadata_json }
    )
    if exec_err then return nil, tostring(exec_err) end
    return id, nil
end

local function decode_metadata(value: any): kb10.Map
    if type(value) == "table" then return value :: kb10.Map end
    if type(value) ~= "string" or value == "" then return {} end
    local decoded, err = json.decode(value)
    if err or type(decoded) ~= "table" then return {} end
    return decoded :: kb10.Map
end

local SOURCE_NODE_TYPES = {
    [kb10.NODE_TYPE.DOCUMENT] = true,
    [kb10.NODE_TYPE.SUMMARY] = true,
    [kb10.NODE_TYPE.CHUNK] = true,
}

local function node_type_for_edge_tx(tx: any, store_id: any, node_id: any): (string?, any?)
    if not is_str(node_id) then return nil, errors.new({ message = "edge endpoint ids are required", kind = errors.INVALID }) end
    local rows, err = tx:query(
        "SELECT node_type FROM kb10_nodes WHERE store_id = $1 AND id = $2",
        { store_id, node_id }
    )
    if err then return nil, errors.wrap(err, "edge endpoint lookup failed") end
    if not rows or #rows == 0 then return nil, errors.new({ message = "edge endpoint not found: " .. tostring(node_id), kind = errors.NOT_FOUND }) end
    return tostring(rows[1].node_type or ""), nil
end

local function validate_edge_insert_tx(tx: any, store_id: any, edge: any, op: string): any?
    local edge_input = (type(edge) == "table" and edge or {}) :: kb10.EdgeInput
    if not is_str(edge_input.edge_type) then return errors.new({ message = op .. " edge_type is required", kind = errors.INVALID }) end

    local from_type, from_err = node_type_for_edge_tx(tx, store_id, edge_input.from_node_id)
    if from_err then return from_err end
    local to_type, to_err = node_type_for_edge_tx(tx, store_id, edge_input.to_node_id)
    if to_err then return to_err end

    local from_source = SOURCE_NODE_TYPES[from_type or ""] == true
    local to_source = SOURCE_NODE_TYPES[to_type or ""] == true
    if not from_source and not to_source then return nil end

    if from_type == kb10.NODE_TYPE.DOCUMENT
        and to_type == kb10.NODE_TYPE.CONCEPT
        and edge_input.edge_type == kb10.EDGE_TYPE.CATEGORIZED_AS then
        local rows, err = tx:query(
            "SELECT metadata FROM kb10_nodes WHERE store_id = $1 AND id = $2",
            { store_id, edge_input.to_node_id }
        )
        if err then return errors.wrap(err, "root concept guard lookup failed") end
        local metadata = rows and rows[1] and decode_metadata(rows[1].metadata) or {}
        if kb10.is_root_metadata(metadata) then
            return errors.new({ message = op .. " cannot categorize documents to the root concept", kind = errors.INVALID })
        end
        return nil
    end

    return errors.new({ message = op .. " may only link source materialization through document categorized_as concept edges", kind = errors.INVALID })
end

local function descendant_cte_anchor(db_type: any): string
    if db_type == sql.type.SQLITE then return "$1" end
    return "$1::uuid"
end

local function subtree_contains_root_concept_tx(tx: any, db_type: any, store_id: any, node_id: any): (boolean, any?)
    if not is_str(node_id) then return false, errors.new({ message = "node_id is required", kind = errors.INVALID }) end
    local anchor = descendant_cte_anchor(db_type)
    local rows, err = tx:query(
        "WITH RECURSIVE descendants(id) AS (" ..
        "SELECT " .. anchor .. " UNION ALL " ..
        "SELECT n.id FROM kb10_nodes n JOIN descendants d ON n.parent_id = d.id WHERE n.store_id = $2" ..
        ") SELECT id, node_type, metadata FROM kb10_nodes WHERE store_id = $3 AND id IN (SELECT id FROM descendants)",
        { node_id, store_id, store_id }
    )
    if err then return false, errors.wrap(err, "root concept guard lookup failed") end

    for _, row in ipairs(rows or {}) do
        local metadata = decode_metadata(row.metadata)
        if row.node_type == kb10.NODE_TYPE.CONCEPT
            and kb10.is_root_metadata(metadata) then
            return true, nil
        end
    end
    return false, nil
end

local function subtree_source_counts_tx(tx: any, db_type: any, store_id: any, node_id: any): (kb10.Map?, any?)
    if not is_str(node_id) then return nil, errors.new({ message = "node_id is required", kind = errors.INVALID }) end
    local anchor = descendant_cte_anchor(db_type)
    local rows, err = tx:query(
        "WITH RECURSIVE descendants(id) AS (" ..
        "SELECT " .. anchor .. " UNION ALL " ..
        "SELECT n.id FROM kb10_nodes n JOIN descendants d ON n.parent_id = d.id WHERE n.store_id = $2" ..
        ") SELECT node_type, metadata FROM kb10_nodes WHERE store_id = $3 AND id IN (SELECT id FROM descendants)",
        { node_id, store_id, store_id }
    )
    if err then return nil, errors.wrap(err, "source count lookup failed") end

    local counts = {
        document_count = 0,
        failed_document_count = 0,
        chunk_count = 0,
        summary_count = 0,
    }
    for _, row in ipairs(rows or {}) do
        if row.node_type == kb10.NODE_TYPE.DOCUMENT then
            local metadata = decode_metadata(row.metadata)
            if metadata.status == "failed" then
                counts.failed_document_count = counts.failed_document_count + 1
            else
                counts.document_count = counts.document_count + 1
            end
        elseif row.node_type == kb10.NODE_TYPE.CHUNK then
            counts.chunk_count = counts.chunk_count + 1
        elseif row.node_type == kb10.NODE_TYPE.SUMMARY then
            counts.summary_count = counts.summary_count + 1
        end
    end
    return counts, nil
end

-- Delete a node and its whole subtree (chunks/summaries) plus their embeddings,
-- fts rows and edges. SQLite has foreign_keys OFF in the pool, so the cascade is
-- done by hand — but in a fixed number of statements via a recursive CTE that
-- collects every descendant id, so deleting a document with thousands of chunks
-- is 4 statements, not O(nodes) Lua round-trips. Postgres relies on its
-- ON DELETE CASCADE: explicit edge cleanup for the node, then one node delete.
local function delete_node_tx(tx: any, db_type: any, store_id: any, node_id: any): (boolean, any?, kb10.Map?)
    local has_root, root_err = subtree_contains_root_concept_tx(tx, db_type, store_id, node_id)
    if root_err then return false, root_err end
    if has_root then return false, errors.new({ message = "root concept cannot be deleted", kind = errors.INVALID }) end
    local removed_counts, count_err = subtree_source_counts_tx(tx, db_type, store_id, node_id)
    if count_err then return false, count_err end

    if db_type == sql.type.SQLITE then
        -- WITH-prefixed DELETE; the CTE walks parent_id from node_id down, scoped
        -- to the store. Each statement re-declares the CTE (cheap, subtree-bounded).
        local cte = "WITH RECURSIVE descendants(id) AS (" ..
            "SELECT " .. descendant_cte_anchor(db_type) .. " UNION ALL " ..
            "SELECT n.id FROM kb10_nodes n JOIN descendants d ON n.parent_id = d.id WHERE n.store_id = $2" ..
            ") "
        local _, edge_err = tx:execute(
            cte .. "DELETE FROM kb10_edges WHERE store_id = $3 AND (from_node_id IN (SELECT id FROM descendants) OR to_node_id IN (SELECT id FROM descendants))",
            { node_id, store_id, store_id }
        )
        if edge_err then return false, errors.wrap(edge_err, "failed to delete edges") end
        local _, emb_err = tx:execute(
            cte .. "DELETE FROM kb10_embeddings WHERE node_id IN (SELECT id FROM descendants)",
            { node_id, store_id }
        )
        if emb_err then return false, errors.wrap(emb_err, "failed to delete embeddings") end
        local _, fts_err = tx:execute(
            cte .. "DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM descendants)",
            { node_id, store_id }
        )
        if fts_err then return false, errors.wrap(fts_err, "failed to delete fts") end
        local _, node_err = tx:execute(
            cte .. "DELETE FROM kb10_nodes WHERE store_id = $3 AND id IN (SELECT id FROM descendants)",
            { node_id, store_id, store_id }
        )
        if node_err then return false, errors.wrap(node_err, "failed to delete nodes") end
        return true, nil, removed_counts
    end

    local _, edge_err = tx:execute(
        "DELETE FROM kb10_edges WHERE store_id = $1 AND (from_node_id = $2 OR to_node_id = $3)",
        { store_id, node_id, node_id }
    )
    if edge_err then return false, errors.wrap(edge_err, "failed to delete edges") end
    local _, exec_err = tx:execute(
        "DELETE FROM kb10_nodes WHERE id = $1 AND store_id = $2",
        { node_id, store_id }
    )
    if exec_err then return false, tostring(exec_err) end
    return true, nil, removed_counts
end

-- Delete everything below a node, leaving the node itself — and the edges that
-- reach it — standing. A document keeps its node while its generation (chunks,
-- summaries, their vectors and fts rows) is swapped underneath it. Same shape as
-- delete_node_tx: SQLite walks a recursive CTE seeded from the node's direct
-- children, Postgres deletes those children and lets ON DELETE CASCADE take
-- their descendants, embeddings and edges.
local function delete_children_tx(tx: any, db_type: any, store_id: any, node_id: any): any?
    if db_type == sql.type.SQLITE then
        local cte = "WITH RECURSIVE descendants(id) AS (" ..
            -- SQLite indexes a "$N" placeholder by first appearance, not by its
            -- number, so every statement here names them in ascending order.
            "SELECT id FROM kb10_nodes WHERE parent_id = $1 AND store_id = $2 UNION ALL " ..
            "SELECT n.id FROM kb10_nodes n JOIN descendants d ON n.parent_id = d.id WHERE n.store_id = $2" ..
            ") "
        local _, edge_err = tx:execute(
            cte .. "DELETE FROM kb10_edges WHERE store_id = $3 AND (from_node_id IN (SELECT id FROM descendants) OR to_node_id IN (SELECT id FROM descendants))",
            { node_id, store_id, store_id }
        )
        if edge_err then return errors.wrap(edge_err, "failed to delete child edges") end
        local _, emb_err = tx:execute(
            cte .. "DELETE FROM kb10_embeddings WHERE node_id IN (SELECT id FROM descendants)",
            { node_id, store_id }
        )
        if emb_err then return errors.wrap(emb_err, "failed to delete child embeddings") end
        local _, fts_err = tx:execute(
            cte .. "DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM descendants)",
            { node_id, store_id }
        )
        if fts_err then return errors.wrap(fts_err, "failed to delete child fts") end
        local _, node_err = tx:execute(
            cte .. "DELETE FROM kb10_nodes WHERE store_id = $3 AND id IN (SELECT id FROM descendants)",
            { node_id, store_id, store_id }
        )
        if node_err then return errors.wrap(node_err, "failed to delete child nodes") end
        return nil
    end

    local _, exec_err = tx:execute(
        "DELETE FROM kb10_nodes WHERE store_id = $1 AND parent_id = $2",
        { store_id, node_id }
    )
    if exec_err then return errors.wrap(exec_err, "failed to delete child nodes") end
    return nil
end

-- Write a new generation onto an existing document node, keeping its id. The
-- metadata is replaced outright rather than merged: the incoming generation's
-- lineage and status are the whole truth about the document, so a prior
-- status=failed and its error do not survive into a completed materialization.
-- node_type is not written — the row was selected as a document and stays one.
local function overwrite_document_tx(tx: any, db_type: any, store_id: any, node_id: any, document: any): any?
    local node_input = (type(document) == "table" and document or {}) :: kb10.NodeInput
    local metadata_json = json.encode(node_input.metadata or {})

    local _, exec_err = tx:execute(
        "UPDATE kb10_nodes SET content = $1, content_type = $2, metadata = $3, parent_id = $4, updated_at = CURRENT_TIMESTAMP WHERE store_id = $5 AND id = $6",
        { node_input.content, node_input.content_type, metadata_json, node_input.parent_id, store_id, node_id }
    )
    if exec_err then return tostring(exec_err) end

    if db_type == sql.type.SQLITE then
        local _, del_err = tx:execute("DELETE FROM kb10_nodes_fts WHERE node_id = $1", { node_id })
        if del_err then return errors.wrap(del_err, "fts delete failed") end
        if node_input.content then
            local _, fts_err = tx:execute(
                "INSERT INTO kb10_nodes_fts (node_id, content, node_type) VALUES ($1, $2, $3)",
                { node_id, node_input.content, node_input.node_type }
            )
            if fts_err then return errors.wrap(fts_err, "fts insert failed") end
        end
    end

    return nil
end

local function source_identity_from_document(doc: any): (string?, string?, any?)
    local metadata = type(doc.metadata) == "table" and doc.metadata or {}
    local external_source = metadata.external_source
    local external_id = metadata.external_id
    if type(external_source) ~= "string" or external_source == "" then
        return nil, nil, errors.new({ message = "document metadata.external_source is required", kind = errors.INVALID })
    end
    if type(external_id) ~= "string" or external_id == "" then
        return nil, nil, errors.new({ message = "document metadata.external_id is required", kind = errors.INVALID })
    end
    return external_source, external_id, nil
end

-- Atomically replace the materialized tree for one canonical source document.
-- The worker computes embeddings outside this transaction; kb10 owns the commit
-- boundary for doc + children + vectors + prior-version cleanup.
--
-- The document node's id is the document's identity, not the generation's:
-- consumers fold it into their own rows and resolve the document by it long
-- after this write. So a replacement of the same (external_source, external_id)
-- keeps the node that already carries that identity and swaps the generation
-- underneath it — content, children, vectors. Children re-mint their ids; they
-- are content. A caller-supplied document.id only seeds a first
-- materialization: on replacement the stored identity wins.
function writer.replace_document(store_id: any, replacement: any)
    if not store_id or store_id == "" then return nil, errors.new({ message = "store_id is required", kind = errors.INVALID }) end
    local spec = type(replacement) == "table" and replacement or {}
    local document = type(spec.document) == "table" and spec.document or nil
    if not document then return nil, errors.new({ message = "document is required", kind = errors.INVALID }) end
    if document.node_type ~= kb10.NODE_TYPE.DOCUMENT then return nil, errors.new({ message = "document node_type is required", kind = errors.INVALID }) end

    local external_source, external_id, identity_err = source_identity_from_document(document)
    if identity_err then return nil, identity_err end

    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end

    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local where_external
    if db_type == sql.type.SQLITE then
        where_external = "AND json_extract(metadata, '$.external_source') = $2 AND json_extract(metadata, '$.external_id') = $3"
    else
        where_external = "AND (metadata::jsonb ->> 'external_source') = $2 AND (metadata::jsonb ->> 'external_id') = $3"
    end
    local prior_rows, prior_err = tx:query(
        "SELECT id FROM kb10_nodes WHERE store_id = $1 AND node_type = '" .. kb10.NODE_TYPE.DOCUMENT .. "' " .. where_external .. " ORDER BY id",
        { store_id, external_source, external_id }
    )
    if prior_err then return fail_tx(tx, db, errors.wrap(prior_err, "failed to find prior documents")) end

    local removed = 0
    local removed_completed_documents = 0
    local removed_failed_documents = 0
    local removed_summaries = 0
    local removed_chunks = 0

    -- The oldest prior node wins, so once a store settles on an id for a document
    -- that id never moves again. Postgres hands back a UUID column as a UUID
    -- value, so the id is coerced to its string form here — the form every
    -- consumer stores and every helper below matches on.
    local reused_id: any = nil
    if prior_rows and prior_rows[1] and prior_rows[1].id ~= nil then
        reused_id = tostring(prior_rows[1].id)
    end

    local doc_id: any
    if reused_id then
        -- The generation being replaced still counts as a removed document: the
        -- deltas the caller derives from these counts describe the knowledge
        -- base's document population, not node identity.
        local reused_counts, count_err = subtree_source_counts_tx(tx, db_type, store_id, reused_id)
        if count_err then return fail_tx(tx, db, count_err) end
        removed = removed + 1
        removed_completed_documents = removed_completed_documents + (tonumber(reused_counts and reused_counts.document_count) or 0)
        removed_failed_documents = removed_failed_documents + (tonumber(reused_counts and reused_counts.failed_document_count) or 0)
        removed_summaries = removed_summaries + (tonumber(reused_counts and reused_counts.summary_count) or 0)
        removed_chunks = removed_chunks + (tonumber(reused_counts and reused_counts.chunk_count) or 0)

        local children_err = delete_children_tx(tx, db_type, store_id, reused_id)
        if children_err then return fail_tx(tx, db, errors.wrap(children_err, "delete prior generation failed")) end
        local overwrite_err = overwrite_document_tx(tx, db_type, store_id, reused_id, document)
        if overwrite_err then return fail_tx(tx, db, errors.wrap(overwrite_err, "replace document failed")) end
        doc_id = reused_id
    else
        local new_id, doc_err = insert_node_tx(tx, db_type, store_id, document)
        if doc_err or not new_id then return fail_tx(tx, db, errors.wrap(doc_err, "insert document failed")) end
        doc_id = new_id
    end

    local summary_count = 0
    local chunk_count = 0
    local children = type(spec.children) == "table" and spec.children or {}
    local nodes: {any} = {}
    for _, child_spec in ipairs(children) do
        local child_node = type(child_spec.node) == "table" and child_spec.node or child_spec
        child_node.parent_id = doc_id
        nodes[#nodes + 1] = child_node
        if child_node.node_type == kb10.NODE_TYPE.SUMMARY then
            summary_count = summary_count + 1
        elseif child_node.node_type == kb10.NODE_TYPE.CHUNK then
            chunk_count = chunk_count + 1
        end
    end
    local child_ids, child_err = insert_nodes_tx(tx, db_type, store_id, nodes)
    if child_err or not child_ids then return fail_tx(tx, db, errors.wrap(child_err, "insert child failed")) end
    local embeddings: {any} = {}
    for i, child_spec in ipairs(children) do
        embeddings[i] = { node_id = child_ids[i], node_type = nodes[i].node_type,
            parent_id = doc_id, embedding = child_spec.embedding }
    end
    local _, emb_err = insert_embeddings_tx(tx, db_type, store_id, embeddings)
    if emb_err then return fail_tx(tx, db, errors.wrap(emb_err, "insert child embedding failed")) end

    -- Any further node carrying the same external identity is a duplicate the
    -- reused node supersedes; it goes with its whole subtree.
    for _, row in ipairs(prior_rows or {}) do
        if tostring(row.id) ~= tostring(doc_id) then
            local ok, del_err, removed_counts = delete_node_tx(tx, db_type, store_id, row.id)
            if not ok then return fail_tx(tx, db, errors.wrap(del_err, "delete prior document failed")) end
            removed = removed + 1
            removed_completed_documents = removed_completed_documents + (tonumber(removed_counts and removed_counts.document_count) or 0)
            removed_failed_documents = removed_failed_documents + (tonumber(removed_counts and removed_counts.failed_document_count) or 0)
            removed_summaries = removed_summaries + (tonumber(removed_counts and removed_counts.summary_count) or 0)
            removed_chunks = removed_chunks + (tonumber(removed_counts and removed_counts.chunk_count) or 0)
        end
    end

    local committed, commit_err = commit_tx(tx, db, "document replacement")
    if not committed then return nil, commit_err end

    return {
        document_node_id = doc_id,
        removed = removed,
        removed_document_count = removed_completed_documents,
        removed_failed_document_count = removed_failed_documents,
        removed_summary_count = removed_summaries,
        removed_chunk_count = removed_chunks,
        summary_count = summary_count,
        chunk_count = chunk_count,
    }, nil
end

-- Create the per-component store row. The store id equals the component_id so
-- the control plane (graph root anchor, concept tooling) can address the store
-- by component_id. opts carries the optional kb_type / enrichment_agent_id the
-- graph KB variant needs.
function writer.create_store(component_id: any, embedding_model: any, config: any, opts: any)
    local create_opts = (type(opts) == "table" and opts or {}) :: kb10.StoreCreateOptions
    local config_json = json.encode(config or {})
    local kb_type = create_opts.kb_type or "document"
    local enrichment_agent_id = create_opts.enrichment_agent_id or ""
    local root_node = nil
    local root_vector = nil
    if create_opts.is_graph == true then
        local node, embed_str = root_concept_input(config, create_opts)
        root_node = node
        root_vector = root_embedding(embedding_model, embed_str)
    end

    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end

    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local _, exec_err = tx:execute(
        "INSERT INTO kb10_stores (id, component_id, embedding_model, config, kb_type, enrichment_agent_id) VALUES ($1, $2, $3, $4, $5, $6)",
        { component_id, component_id, embedding_model, config_json, kb_type, enrichment_agent_id }
    )
    if exec_err then return fail_tx(tx, db, exec_err) end

    if root_node then
        local root_id, root_err = insert_node_tx(tx, db_type, component_id, root_node)
        if root_err or not root_id then return fail_tx(tx, db, errors.wrap(root_err, "root concept seed")) end
        if root_vector then
            local _, emb_err = insert_embedding_tx(tx, db_type, component_id, root_id, kb10.NODE_TYPE.CONCEPT, nil, root_vector)
            if emb_err then return fail_tx(tx, db, errors.wrap(emb_err, "root concept embedding")) end
        end
    end

    local ok, commit_err = commit_tx(tx, db, "store creation")
    if not ok then return nil, commit_err end
    return component_id
end

function writer.update_config(component_id: any, config: any, expected_snapshot: string?, lease_token: string?)
    local db, err = ops.get_db()
    if err then return nil, err end
    local query = "UPDATE kb10_stores SET config = $1, updated_at = CURRENT_TIMESTAMP WHERE component_id = $2"
    local params = { json.encode(config or {}), component_id }
    if expected_snapshot ~= nil then
        query = query .. " AND config = $3"
        params[#params + 1] = expected_snapshot
    end
    if lease_token ~= nil then
        local index = #params + 1
        query = query .. " AND EXISTS (SELECT 1 FROM kb10_tuning_state WHERE store_id = kb10_stores.id AND lease_token = $" .. index .. " AND lease_until > $" .. (index + 1) .. ")"
        params[#params + 1] = lease_token
        params[#params + 1] = time.now():utc():format(time.RFC3339)
    end
    local rows, exec_err = db:query(query .. " RETURNING id", params)
    db:release()
    if exec_err then return nil, exec_err end
    if (expected_snapshot ~= nil or lease_token ~= nil) and #rows == 0 then
        return nil, errors.new({ kind = errors.CONFLICT, message = "KB configuration or tuning lease changes before apply" })
    end
    return true
end

function writer.delete_store(component_id: any)
    local db, err = ops.get_db()
    if err then return nil, err end

    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local rows, q_err = tx:query("SELECT id FROM kb10_stores WHERE component_id = $1", { component_id })
    if q_err then return fail_tx(tx, db, q_err) end
    if not rows or #rows == 0 then
        local ok, commit_err = commit_tx(tx, db, "store delete")
        if not ok then return nil, commit_err end
        return true
    end
    local store_id = rows[1].id

    local db_type, dt_err = ops.get_db_type(db)
    if dt_err then return fail_tx(tx, db, dt_err) end

    local cascade = {}
    -- kb10_nodes_fts is a SQLite fts5 virtual table; PostgreSQL uses the
    -- search_vector tsvector column on kb10_nodes, so it only exists on SQLite.
    if db_type == sql.type.SQLITE then
        cascade[#cascade + 1] = { sql = "DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM kb10_nodes WHERE store_id = $1)", name = "kb10_nodes_fts" }
    end
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_query_log WHERE store_id = $1", name = "kb10_query_log" }
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_tuning_state WHERE store_id = $1", name = "kb10_tuning_state" }
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_embeddings WHERE store_id = $1", name = "kb10_embeddings" }
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_edges WHERE store_id = $1",      name = "kb10_edges" }
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_nodes WHERE store_id = $1",      name = "kb10_nodes" }
    for _, t in ipairs(cascade) do
        local _, exec_err = tx:execute(t.sql, { store_id })
        if exec_err then return fail_tx(tx, db, "failed to delete from " .. t.name .. ": " .. tostring(exec_err)) end
    end

    -- Maintenance runs are keyed by the KB component, not by the store row, so
    -- they are deleted by component_id alongside the store they describe.
    local _, runs_err = tx:execute("DELETE FROM kb10_maintenance_runs WHERE component_id = $1", { component_id })
    if runs_err then return fail_tx(tx, db, errors.wrap(runs_err, "failed to delete from kb10_maintenance_runs")) end

    local _, store_err = tx:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
    if store_err then return fail_tx(tx, db, store_err) end
    return commit_tx(tx, db, "store delete")
end

function writer.insert_node(store_id: any, node: any)
    local node_input = (type(node) == "table" and node or {}) :: kb10.NodeInput
    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local id, insert_err = insert_node_tx(tx, db_type, store_id, node_input)
    if insert_err or not id then return fail_tx(tx, db, insert_err) end

    local ok, commit_err = commit_tx(tx, db, "node insert")
    if not ok then return nil, commit_err end
    return id
end

function writer.insert_graph_node(store_id: any, node: any, parent_edge: any)
    local node_input = (type(node) == "table" and node or {}) :: kb10.NodeInput
    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local id, insert_err = insert_node_tx(tx, db_type, store_id, node_input)
    if insert_err or not id then return fail_tx(tx, db, insert_err) end

    if type(parent_edge) == "table" then
        local edge = {}
        for k, v in pairs(parent_edge) do edge[k] = v end
        edge.from_node_id = id
        local validation_err = validate_edge_insert_tx(tx, store_id, edge, "insert_graph_node")
        if validation_err then return fail_tx(tx, db, validation_err) end
        local _, edge_err = insert_edge_tx(tx, store_id, edge)
        if edge_err then return fail_tx(tx, db, errors.wrap(edge_err, "parent edge failed")) end
    end

    local ok, commit_err = commit_tx(tx, db, "graph node insert")
    if not ok then return nil, commit_err end
    return id
end

local function merged_metadata(raw_metadata: any, patch: kb10.Map?)
    local current = {}
    if raw_metadata and type(raw_metadata) == "string" then
        local parsed, parse_err = json.decode(raw_metadata)
        if not parse_err and type(parsed) == "table" then current = parsed end
    elseif type(raw_metadata) == "table" then
        current = raw_metadata
    end

    local out = {}
    for k, v in pairs(current) do out[k] = v end
    if type(patch) == "table" then
        for k, v in pairs(patch) do out[k] = v end
    end
    return out
end

-- update_node_tx(tx, db_type, store_id, node_id, patch) -> (row, err): the node
-- update inside a caller's transaction, answering the node as it stood before
-- the patch so the caller reads its node_type and parent_id without a second
-- query. The caller owns the transaction and rolls it back on an error.
local function update_node_tx(tx: any, db_type: any, store_id: any, node_id: any, patch: any): (any?, any?)
    local node_patch = (type(patch) == "table" and patch or {}) :: kb10.NodePatch

    local rows, query_err = tx:query(
        "SELECT id, node_type, parent_id, content, content_type, metadata FROM kb10_nodes WHERE store_id = $1 AND id = $2",
        { store_id, node_id }
    )
    if query_err then return nil, tostring(query_err) end
    if not rows or #rows == 0 then return nil, errors.new({ message = "node not found", kind = errors.NOT_FOUND }) end

    local node = rows[1]
    local sets: { string } = {}
    local params: { any } = {}
    local idx = 0

    if type(node_patch.metadata) == "table" then
        -- json.encode returns (string, err); bind to a local so table.insert gets
        -- a single value, not the 2-value expansion (which Lua reads as pos+value).
        local meta_json = json.encode(merged_metadata(node.metadata, node_patch.metadata))
        idx = idx + 1
        table.insert(sets, "metadata = $" .. idx)
        table.insert(params, meta_json)
    end
    if node_patch.content ~= nil then
        idx = idx + 1
        table.insert(sets, "content = $" .. idx)
        table.insert(params, node_patch.content)
    end
    if node_patch.content_type ~= nil then
        idx = idx + 1
        table.insert(sets, "content_type = $" .. idx)
        table.insert(params, node_patch.content_type)
    end

    if #sets == 0 then return node, nil end

    table.insert(sets, "updated_at = CURRENT_TIMESTAMP")
    local store_idx = idx + 1
    local node_idx = idx + 2
    table.insert(params, store_id)
    table.insert(params, node_id)

    local _, exec_err = tx:execute(
        "UPDATE kb10_nodes SET " .. table.concat(sets, ", ") .. " WHERE store_id = $" .. store_idx .. " AND id = $" .. node_idx,
        params
    )
    if exec_err then return nil, tostring(exec_err) end

    if db_type == sql.type.SQLITE and node_patch.content ~= nil then
        local _, del_err = tx:execute("DELETE FROM kb10_nodes_fts WHERE node_id = $1", { node_id })
        if del_err then return nil, errors.wrap(del_err, "fts delete failed") end
        local _, fts_err = tx:execute(
            "INSERT INTO kb10_nodes_fts (node_id, content, node_type) VALUES ($1, $2, $3)",
            { node_id, node_patch.content, node.node_type }
        )
        if fts_err then return nil, errors.wrap(fts_err, "fts insert failed") end
    end

    return node, nil
end

function writer.update_node(store_id: any, node_id: any, patch: any)
    if not store_id or store_id == "" or not node_id or node_id == "" then
        return nil, errors.new({ message = "store_id and node_id are required", kind = errors.INVALID })
    end

    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local _, update_err = update_node_tx(tx, db_type, store_id, node_id, patch)
    if update_err then return fail_tx(tx, db, update_err) end

    return commit_tx(tx, db, "node update")
end

-- write_node_with_embedding(store_id, node, embedding) -> (node_id, err): a
-- node's text and the vector that indexes it, written as one fact.
--
-- Written apart, a failure between the two halves leaves the node's new content
-- or contextual prefix paired with the vector of the text it replaced, and every
-- search then scores that node on words it no longer holds. Here both writes
-- share one transaction, so a node either carries new text with the vector that
-- matches it or keeps exactly what it had.
--
-- node.id names an existing node to update -- content, content_type and a merged
-- metadata patch, the same semantics update_node has -- and its stored node_type
-- and parent_id index the vector unless the caller names others. Without an id
-- the node is inserted. The embedding replaces whatever vector the node carries.
function writer.write_node_with_embedding(store_id: any, node: any, embedding: any): (string?, any?)
    local input = (type(node) == "table" and node or {}) :: any
    if not is_str(store_id) then return nil, errors.new({ message = "store_id is required", kind = errors.INVALID }) end
    if type(embedding) ~= "table" then return nil, errors.new({ message = "embedding is required", kind = errors.INVALID }) end

    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local node_id: any = input.id
    local node_type: any = input.node_type
    local parent_id: any = input.parent_id

    if is_str(node_id) then
        local existing, update_err = update_node_tx(tx, db_type, store_id, node_id, input)
        if update_err then return fail_tx(tx, db, update_err) end
        if not is_str(node_type) then node_type = (existing :: any).node_type end
        if parent_id == nil then parent_id = (existing :: any).parent_id end
    else
        local new_id, insert_err = insert_node_tx(tx, db_type, store_id, input)
        if insert_err then return fail_tx(tx, db, insert_err) end
        node_id = new_id
    end

    local _, embed_err = insert_embedding_tx(tx, db_type, store_id, node_id, node_type, parent_id, embedding)
    if embed_err then return fail_tx(tx, db, embed_err) end

    local ok, commit_err = commit_tx(tx, db, "node and embedding write")
    if not ok then return nil, commit_err end
    return tostring(node_id), nil
end

function writer.insert_embedding(store_id: any, node_id: any, node_type: any, parent_id: any, embedding: any)
    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type = ops.get_db_type(db)
    local id = uuid.v7()

    -- SQLite vec0 metadata columns require TEXT, cannot be NULL
    local safe_parent_id = parent_id
    if db_type == sql.type.SQLITE and not safe_parent_id then
        safe_parent_id = ""
    end

    -- One current vector per node: clear the node's existing rows before
    -- inserting, or a re-embed leaves the stale vector behind to compete with
    -- the fresh one in every search.
    local _, clear_err = db:execute(
        "DELETE FROM kb10_embeddings WHERE store_id = $1 AND node_id = $2",
        { store_id, node_id }
    )
    if clear_err then
        db:release()
        return nil, clear_err
    end

    local exec_err
    if db_type == sql.type.SQLITE then
        _, exec_err = db:execute(
            "INSERT INTO kb10_embeddings (id, node_id, store_id, node_type, parent_id, embedding) VALUES ($1, $2, $3, $4, $5, $6)",
            { id, node_id, store_id, node_type, safe_parent_id, ops.vector_to_string(embedding) }
        )
    else
        _, exec_err = db:execute(
            "INSERT INTO kb10_embeddings (id, node_id, store_id, node_type, parent_id, embedding) VALUES ($1, $2, $3, $4, $5, $6)",
            { id, node_id, store_id, node_type, parent_id, ops.vector_to_string(embedding) }
        )
    end

    db:release()
    if exec_err then return nil, exec_err end
    return id
end

function writer.delete_node(store_id: any, node_id: any)
    local db, err = ops.get_db()
    if err then return false, err end

    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return false, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return false, errors.wrap(tx_err, "failed to begin transaction") end

    local ok, del_err = delete_node_tx(tx, db_type, store_id, node_id)
    if not ok then
        local _, msg = fail_tx(tx, db, del_err)
        return false, msg
    end
    local committed, commit_err = commit_tx(tx, db, "node delete")
    if not committed then return false, commit_err end
    return true
end

-- Replace any prior ingest of the same source artifact, keyed on the canonical
-- (external_source, external_id) identity a thread event carries. Same external_id
-- => replace, not append; this is what makes a projection re-run (after a crash or
-- a re-dispatch) idempotent. Deletes the matching document nodes, cascading to
-- their chunks/summaries/embeddings via delete_node.
function writer.delete_documents_by_external_id(store_id: any, external_source: any, external_id: any)
    if not store_id or not external_id or external_id == "" then return 0 end
    local db, err = ops.get_db()
    if err then return 0, err end

    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return 0, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return 0, errors.wrap(tx_err, "failed to begin transaction") end

    local query
    if db_type == sql.type.SQLITE then
        query = "SELECT id FROM kb10_nodes WHERE store_id = $1 AND node_type = '" .. kb10.NODE_TYPE.DOCUMENT ..
            "' AND json_extract(metadata, '$.external_source') = $2 AND json_extract(metadata, '$.external_id') = $3"
    else
        query = "SELECT id FROM kb10_nodes WHERE store_id = $1 AND node_type = '" .. kb10.NODE_TYPE.DOCUMENT ..
            "' AND (metadata::jsonb ->> 'external_source') = $2 AND (metadata::jsonb ->> 'external_id') = $3"
    end
    local rows, q_err = tx:query(query, { store_id, external_source or "", external_id })
    if q_err then
        local _, msg = fail_tx(tx, db, errors.wrap(q_err, "failed to find documents by external id"))
        return 0, msg
    end

    local removed = 0
    local removed_completed_documents = 0
    local removed_failed_documents = 0
    local removed_summaries = 0
    local removed_chunks = 0
    for _, row in ipairs(rows or {}) do
        local ok, del_err, removed_counts = delete_node_tx(tx, db_type, store_id, row.id)
        if not ok then
            local _, msg = fail_tx(tx, db, errors.wrap(del_err, "delete document failed"))
            return 0, msg
        end
        removed = removed + 1
        removed_completed_documents = removed_completed_documents + (tonumber(removed_counts and removed_counts.document_count) or 0)
        removed_failed_documents = removed_failed_documents + (tonumber(removed_counts and removed_counts.failed_document_count) or 0)
        removed_summaries = removed_summaries + (tonumber(removed_counts and removed_counts.summary_count) or 0)
        removed_chunks = removed_chunks + (tonumber(removed_counts and removed_counts.chunk_count) or 0)
    end
    local committed, commit_err = commit_tx(tx, db, "document delete")
    if not committed then return 0, commit_err end
    return {
        removed = removed,
        removed_document_count = removed_completed_documents,
        removed_failed_document_count = removed_failed_documents,
        removed_summary_count = removed_summaries,
        removed_chunk_count = removed_chunks,
    }
end

-- Persist the digest service's generated KB-level summary/description.
function writer.set_descriptions(store_id: any, auto_summary: any, auto_description: any)
    local db, err = ops.get_db()
    if err then return nil, err end

    local _, exec_err = db:execute(
        "UPDATE kb10_stores SET auto_summary = $1, auto_description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        { auto_summary, auto_description, store_id }
    )
    db:release()

    if exec_err then return nil, exec_err end
    return true
end

function writer.insert_edge(store_id: any, edge: any)
    local db, err = ops.get_db()
    if err then return nil, err end

    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local validation_err = validate_edge_insert_tx(tx, store_id, edge, "insert_edge")
    if validation_err then return fail_tx(tx, db, validation_err) end

    local id, insert_err = insert_edge_tx(tx, store_id, edge)
    if insert_err or not id then return fail_tx(tx, db, insert_err) end

    local ok, commit_err = commit_tx(tx, db, "edge insert")
    if not ok then return nil, commit_err end
    return id
end

function writer.delete_edge(store_id: any, edge_id: any)
    local db, err = ops.get_db()
    if err then return false, err end

    local _, exec_err = db:execute(
        "DELETE FROM kb10_edges WHERE id = $1 AND store_id = $2",
        { edge_id, store_id }
    )
    db:release()

    if exec_err then return false, exec_err end
    return true
end

-- ─── Bulk import inserts ─────────────────────────────────────────────────────
-- One transaction (one commit) for a whole batch, using bounded multi-row inserts.
-- A faithful restore moves millions of rows; a commit per row is the difference
-- between a minute and an hour, so the portability adapter streams fixed-size batches
-- through these. The caller bounds memory by the batch size; this bounds commit cost.

-- Insert many nodes in file (parent-first) order. The export emits nodes ORDER BY id
-- (uuid v7 == insert order), and a child's parent always pre-existed it, so the parent
-- carries the smaller id and lands in this batch or an earlier one -- the self-FK is
-- satisfied within the transaction without any per-row deferral.
function writer.insert_nodes(store_id: any, nodes: any): (boolean?, any?)
    local list = (type(nodes) == "table" and nodes or {}) :: { any }
    if #list == 0 then return true end
    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, dt_err = ops.get_db_type(db)
    if dt_err then db:release(); return nil, dt_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    local _, insert_err = insert_nodes_tx(tx, db_type, store_id, list)
    if insert_err then return fail_tx(tx, db, insert_err) end
    return commit_tx(tx, db, "node batch insert")
end

-- Insert embeddings for newly imported nodes. Replacement writes use the
-- single-row path; probing vec0 for every absent row makes a large import
-- quadratic on SQLite. rows: { { node_id, node_type, parent_id, embedding }, ... }.
function writer.insert_embeddings(store_id: any, rows: any): (boolean?, any?)
    local list = (type(rows) == "table" and rows or {}) :: { any }
    if #list == 0 then return true end
    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, dt_err = ops.get_db_type(db)
    if dt_err then db:release(); return nil, dt_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    local _, insert_err = insert_embeddings_tx(tx, db_type, store_id, list)
    if insert_err then return fail_tx(tx, db, insert_err) end
    return commit_tx(tx, db, "embedding batch insert")
end

-- Insert many edges. No source-materialization guard here: these edges were already
-- validated when the source KB created them, and import is a trusted reconstruction --
-- re-running validate_edge_insert_tx would only add two SELECTs per edge and risk
-- rejecting a faithful row if the guard rules shifted between versions.
function writer.insert_edges(store_id: any, edges: any): (boolean?, any?)
    local list = (type(edges) == "table" and edges or {}) :: { any }
    if #list == 0 then return true end
    local db, err = ops.get_db()
    if err then return nil, err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    for _, edge in ipairs(list) do
        local _, ierr = insert_edge_tx(tx, store_id, edge)
        if ierr then return fail_tx(tx, db, ierr) end
    end
    return commit_tx(tx, db, "edge batch insert")
end

function writer.apply_graph_patch(store_id: any, patch: any)
    if not store_id or store_id == "" then return nil, errors.new({ message = "store_id is required", kind = errors.INVALID }) end
    local spec = type(patch) == "table" and patch or {}
    local delete_edge_ids = type(spec.delete_edge_ids) == "table" and spec.delete_edge_ids or {}
    local insert_edges = type(spec.insert_edges) == "table" and spec.insert_edges or {}
    -- replace_out_edges: { { from_node_id, edge_type }, ... } — delete ALL of a
    -- node's out-edges of a type inside the transaction, so a parent reassignment
    -- can't race a concurrent edge insert into leaving two parents. Prefer this
    -- over a pre-fetched delete_edge_ids list for single-parent invariants.
    local replace_out_edges = type(spec.replace_out_edges) == "table" and spec.replace_out_edges or {}

    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local deleted_edges = 0
    for _, edge_id in ipairs(delete_edge_ids) do
        if not is_str(edge_id) then return fail_tx(tx, db, errors.new({ message = "delete_edge_ids must contain only strings", kind = errors.INVALID })) end
        local _, edge_err = tx:execute(
            "DELETE FROM kb10_edges WHERE id = $1 AND store_id = $2",
            { edge_id, store_id }
        )
        if edge_err then return fail_tx(tx, db, errors.wrap(edge_err, "edge delete failed")) end
        deleted_edges = deleted_edges + 1
    end

    for _, spec_edge in ipairs(replace_out_edges) do
        local re = (type(spec_edge) == "table" and spec_edge or {}) :: kb10.EdgeInput
        if not is_str(re.from_node_id) or not is_str(re.edge_type) then
            return fail_tx(tx, db, errors.new({ message = "replace_out_edges requires from_node_id and edge_type", kind = errors.INVALID }))
        end
        local _, re_err = tx:execute(
            "DELETE FROM kb10_edges WHERE store_id = $1 AND from_node_id = $2 AND edge_type = $3",
            { store_id, re.from_node_id, re.edge_type }
        )
        if re_err then return fail_tx(tx, db, errors.wrap(re_err, "replace_out_edges delete failed")) end
    end

    local inserted_edge_ids: { string } = {}
    for _, edge in ipairs(insert_edges) do
        local validation_err = validate_edge_insert_tx(tx, store_id, edge, "apply_graph_patch")
        if validation_err then return fail_tx(tx, db, validation_err) end
        local edge_id, edge_err = insert_edge_tx(tx, store_id, edge)
        if edge_err or not edge_id then return fail_tx(tx, db, errors.wrap(edge_err, "edge insert failed")) end
        table.insert(inserted_edge_ids, edge_id)
    end

    local deleted_node = false
    if is_str(spec.delete_node_id) then
        local ok, del_err = delete_node_tx(tx, db_type, store_id, spec.delete_node_id)
        if not ok then return fail_tx(tx, db, errors.wrap(del_err, "node delete failed")) end
        deleted_node = true
    end

    local ok, commit_err = commit_tx(tx, db, "graph patch")
    if not ok then return nil, commit_err end
    return {
        deleted_edges = deleted_edges,
        inserted_edge_ids = inserted_edge_ids,
        deleted_node = deleted_node,
    }
end

return writer
