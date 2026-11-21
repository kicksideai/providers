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
local search_index = require("search_index")
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

local insert_rows_tx = search_index.insert_rows_tx

function writer.insert_nodes_tx(tx: any, db_type: any, store_id: any, nodes: {any}, bindings: any?): ({string}?, any?)
    local sqlite = db_type == sql.type.SQLITE
    local columns = { "id", "store_id", "parent_id", "node_type", "content", "content_type",
        "external_source", "external_id", "source_scope" }
    if sqlite then columns[#columns + 1] = "fts_rowid" end
    columns[#columns + 1] = "metadata"
    local ids: {string} = {}
    local rows: {any} = {}
    local fts: {any} = {}
    local last_fts_rowid: number? = nil
    for i, node in ipairs(nodes) do
        local input = node :: kb10.NodeInput
        local id = input.id or uuid.v7()
        ids[i] = id
        local binding
        if input.node_type == kb10.NODE_TYPE.DOCUMENT and input.parent_id == nil then
            if bindings then
                binding = bindings[i]
            else
                local metadata = type(input.metadata) == "table" and input.metadata or {}
                binding = ops.source_binding(store_id, metadata.external_source, metadata.external_id)
            end
        end
        local fts_rowid: number? = nil
        if sqlite and input.content then
            if last_fts_rowid == nil then
                local tail, tail_err = tx:query("SELECT rowid FROM kb10_nodes_fts ORDER BY rowid DESC LIMIT 1")
                if tail_err then return nil, errors.wrap(tail_err, "fts rowid allocation failed") end
                last_fts_rowid = #tail > 0 and tail[1].rowid or 0
            end
            fts_rowid = (last_fts_rowid :: number) + 1
            last_fts_rowid = fts_rowid
            fts[#fts + 1] = { fts_rowid, id, input.content, input.node_type }
        end
        local row = { id, store_id, input.parent_id, input.node_type, input.content,
            input.content_type, binding and binding.external_source,
            binding and binding.external_id, binding and binding.source_scope }
        if sqlite then row[#columns - 1] = fts_rowid end
        row[#columns] = json.encode(input.metadata or {})
        rows[i] = row
    end
    local err = insert_rows_tx(tx, "kb10_nodes", columns, rows)
    if err then return nil, err end
    local fts_err = insert_rows_tx(tx, "kb10_nodes_fts", { "rowid", "node_id", "content", "node_type" }, fts)
    if fts_err then return nil, errors.wrap(fts_err, "fts insert failed") end
    return ids, nil
end

local function insert_node_tx(tx: any, db_type: any, store_id: any, node: any, binding: any?): (string?, any?)
    local ids, err = writer.insert_nodes_tx(tx, db_type, store_id,
        { type(node) == "table" and node or {} }, binding and {binding})
    if err or not ids then return nil, err end
    return ids[1], nil
end

local function insert_embeddings_tx(tx: any, db_type: any, store_id: any, embeddings: {any},
        replace: boolean?, encoded: boolean?): ({string}?, any?)
    local sqlite = db_type == sql.type.SQLITE
    local ids: {string} = {}
    local rows: {any} = {}
    local owners: {any} = {}
    local owner_count = 0
    local embedding_type = encoded and "string" or "table"
    for i, input in ipairs(embeddings) do
        if type(input.embedding) ~= embedding_type then
            return nil, errors.new({ message = "embedding is required", kind = errors.INVALID })
        end
        local parent_id = input.parent_id
        ids[i] = uuid.v7()
        if sqlite then
            if not is_str(input.node_id) then
                return nil, errors.new({ message = "node_id is required", kind = errors.INVALID })
            end
            parent_id = parent_id or ""
            local owner = owners[input.node_id]
            if not owner then
                owner = {}
                owners[input.node_id] = owner
                owner_count = owner_count + 1
            end
            owner[#owner + 1] = ids[i]
        end
        local vector = encoded and input.embedding or ops.vector_to_string(input.embedding)
        rows[i] = {ids[i], input.node_id, store_id, input.node_type, parent_id, vector}
    end
    local err = insert_rows_tx(tx, "kb10_embeddings", { "id", "node_id", "store_id", "node_type", "parent_id", "embedding" }, rows)
    if err then return nil, err end
    if owner_count > 0 then
        local assignment = "owner.value"
        if not replace then
            assignment = [[CASE WHEN n.embedding_ids IS NULL THEN owner.value ELSE (
                SELECT json_group_array(value) FROM (
                    SELECT value FROM json_each(n.embedding_ids)
                    UNION ALL SELECT value FROM json_each(owner.value)
                )
            ) END]]
        end
        local encoded, encode_err = json.encode(owners)
        if encode_err then return nil, errors.wrap(encode_err, "embedding ownership encoding failed") end
        local links, link_err = tx:execute("UPDATE kb10_nodes AS n SET embedding_ids = " .. assignment ..
            " FROM json_each($1) AS owner WHERE n.id = owner.key AND n.store_id = $2",
            { encoded, store_id })
        if link_err then return nil, errors.wrap(link_err, "embedding ownership update failed") end
        if tonumber(links and links.rows_affected) ~= owner_count then
            return nil, errors.new({ message = "embedding node not found in store", kind = errors.NOT_FOUND })
        end
    end
    return ids, nil
end

local function delete_sqlite_embeddings_tx(tx: any, owners: string, params: {any}): any?
    local _, err = tx:execute("DELETE FROM kb10_embeddings WHERE id IN (" ..
        "SELECT key.value FROM (" .. owners .. ") n CROSS JOIN json_each(n.embedding_ids) key)", params)
    return err
end

local function insert_embedding_tx(tx: any, db_type: any, store_id: any, node_id: any, node_type: any, parent_id: any, embedding: any): (string?, any?)
    if type(embedding) ~= "table" then return nil, errors.new({ message = "embedding is required", kind = errors.INVALID }) end
    local clear_err
    if db_type == sql.type.SQLITE then
        clear_err = delete_sqlite_embeddings_tx(tx,
            "SELECT embedding_ids FROM kb10_nodes WHERE store_id = $1 AND id = $2", { store_id, node_id })
    else
        _, clear_err = tx:execute(
            "DELETE FROM kb10_embeddings WHERE store_id = $1 AND node_id = $2", { store_id, node_id })
    end
    if clear_err then return nil, clear_err end
    local ids, err = insert_embeddings_tx(tx, db_type, store_id, {
        { node_id = node_id, node_type = node_type, parent_id = parent_id, embedding = embedding },
    }, true)
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

local function descendants_cte(db_type: any, include_root: boolean, point_lookup: boolean?): string
    local seed = "SELECT id FROM kb10_nodes WHERE parent_id = $1 AND store_id = $2"
    if include_root then
        seed = db_type == sql.type.POSTGRES and "SELECT $1::uuid"
            or "SELECT id FROM kb10_nodes WHERE id = $1 AND store_id = $2"
    end
    local walk = "SELECT n.id FROM descendants d CROSS JOIN kb10_nodes n WHERE n.store_id = $2 AND n.parent_id = d.id"
    if point_lookup and db_type == sql.type.POSTGRES then
        -- Keep the recursive parent lookup tied to each descendant. A wide
        -- store can otherwise make the planner hash against the whole store.
        walk = [[SELECT n.id FROM descendants d CROSS JOIN LATERAL (
            SELECT id FROM kb10_nodes WHERE store_id = $2 AND parent_id = d.id OFFSET 0) n]]
    end
    return "WITH RECURSIVE descendants(id) AS (" .. seed .. " UNION ALL " .. walk .. ") "
end

local function delete_sqlite_fts_tx(tx: any, owners: string, params: {any}): any?
    local _, fts_err = tx:execute(
        "DELETE FROM kb10_nodes_fts WHERE rowid IN (SELECT fts_rowid FROM (" .. owners ..
        ") WHERE fts_rowid IS NOT NULL)", params)
    if fts_err then return errors.wrap(fts_err, "failed to delete fts") end
    return nil
end

local function delete_sqlite_subtree_tx(tx: any, store_id: any, node_id: any, include_root: boolean): any?
    local cte = descendants_cte(sql.type.SQLITE, include_root)
    local params = { node_id, store_id }
    local _, edge_err = tx:execute(cte .. [[DELETE FROM kb10_edges WHERE id IN (
        SELECT e.id FROM descendants d CROSS JOIN kb10_edges e INDEXED BY idx_kb10_edges_from
            WHERE e.from_node_id = d.id AND e.store_id = $2
        UNION ALL
        SELECT e.id FROM descendants d CROSS JOIN kb10_edges e INDEXED BY idx_kb10_edges_to
            WHERE e.to_node_id = d.id AND e.store_id = $2)]], params)
    if edge_err then return errors.wrap(edge_err, "failed to delete edges") end
    local owners = cte .. [[SELECT n.fts_rowid, n.embedding_ids
        FROM descendants d CROSS JOIN kb10_nodes n WHERE n.id = d.id]]
    local emb_err = delete_sqlite_embeddings_tx(tx, owners, params)
    if emb_err then return errors.wrap(emb_err, "failed to delete embeddings") end
    local fts_err = delete_sqlite_fts_tx(tx, owners, params)
    if fts_err then return fts_err end
    local _, node_err = tx:execute(cte .. "DELETE FROM kb10_nodes WHERE id IN (SELECT id FROM descendants)", params)
    if node_err then return errors.wrap(node_err, "failed to delete nodes") end
    return nil
end

local function subtree_source_counts_tx(tx: any, db_type: any, store_id: any, node_id: any,
        count_embeddings: boolean?): (kb10.Map?, any?)
    if not is_str(node_id) then return nil, errors.new({ message = "node_id is required", kind = errors.INVALID }) end
    local failed, root
    if db_type == sql.type.SQLITE then
        failed = "json_extract(metadata, '$.status') = 'failed'"
        root = "json_type(metadata, '$.is_root') = 'true' OR json_extract(metadata, '$.concept_type') = 'root'"
    else
        failed = "metadata->>'status' = 'failed'"
        root = "metadata->'is_root' = 'true'::jsonb OR metadata->>'concept_type' = 'root'"
    end
    local nodes, embeddings = "CROSS JOIN kb10_nodes n WHERE n.id = d.id AND n.store_id = $2", ""
    if count_embeddings then
        local count = "COALESCE(json_array_length(n.embedding_ids),0)"
        if db_type == sql.type.POSTGRES then
            count = "owned.total"
            nodes = [[CROSS JOIN LATERAL (
                SELECT id,node_type,metadata FROM kb10_nodes WHERE id=d.id AND store_id=$2 OFFSET 0) n
                CROSS JOIN LATERAL (SELECT count(*) AS total FROM kb10_embeddings e
                    WHERE e.node_id=n.id AND e.store_id=$2) owned]]
        end
        embeddings = ", COALESCE(sum(" .. count .. "),0) AS embedding_count" ..
            ", COALESCE(sum(" .. count .. ") FILTER (WHERE n.id<>$1),0) AS child_embedding_count"
    end
    local rows, err = tx:query(
        descendants_cte(db_type, true, count_embeddings) ..
        "SELECT count(*) FILTER (WHERE node_type = 'document' AND NOT COALESCE(" .. failed .. ", false)) AS document_count," ..
        " count(*) FILTER (WHERE node_type = 'document' AND " .. failed .. ") AS failed_document_count," ..
        " count(*) FILTER (WHERE node_type = 'chunk') AS chunk_count," ..
        " count(*) FILTER (WHERE node_type = 'summary') AS summary_count," ..
        " count(*) FILTER (WHERE node_type = 'concept' AND (" .. root .. ")) AS root_count" .. embeddings ..
        " FROM descendants d " .. nodes,
        { node_id, store_id }
    )
    if err then return nil, errors.wrap(err, "source count lookup failed") end
    return rows[1], nil
end

local function source_checkpoint_state(db: any, dialect: string, store_id: string, id: string?,
        count_subtree: boolean): (table?, any?)
    if not id then return {}, nil end
    local rows, read_err = db:query([[SELECT CAST(updated_at AS TEXT) AS updated_at,CAST(metadata AS TEXT) AS revision
        FROM kb10_nodes WHERE store_id=$1 AND id=$2]], {store_id, id})
    if read_err then return nil, read_err end
    local root = rows[1]
    if not root then
        return nil, errors.new({kind = errors.CONFLICT, retryable = true, message = "source document changed while preparing checkpoint"})
    end
    local counts, err
    if count_subtree then
        counts, err = subtree_source_counts_tx(db, dialect, store_id, id, true)
        if err then return nil, err end
    end
    local metadata = decode_metadata(root.revision)
    return {id = id, updated_at = root.updated_at, revision = root.revision,
        status = metadata.status, publication_id = metadata.upload_publication_id, counts = counts}, nil
end

local function checkpoint_conflict(): error
    return errors.new({kind = errors.CONFLICT, retryable = true, message = "source document changed before checkpoint"})
end

local function confirm_source_checkpoint(tx: any, dialect: string, store_id: string, id: string?, before: table,
        count_subtree: boolean): (table?, any?)
    if id ~= before.id then return nil, checkpoint_conflict() end
    local current, err = source_checkpoint_state(tx, dialect, store_id, id, count_subtree)
    if not current then return nil, err end
    if before.chained then
        -- An earlier checked mutation in this same store transaction owns the
        -- revision. Validate its predicted state before consuming this step.
        if current.status ~= before.status or current.publication_id ~= before.publication_id then return nil, checkpoint_conflict() end
    elseif current.revision ~= before.revision or current.updated_at ~= before.updated_at then return nil, checkpoint_conflict() end
    for key, count in pairs(before.counts or {}) do
        if not current.counts or tonumber(current.counts[key]) ~= tonumber(count) then return nil, checkpoint_conflict() end
    end
    return current, nil
end

-- Delete a node and its whole subtree (chunks/summaries) plus their embeddings,
-- fts rows and edges. SQLite has foreign_keys OFF in the pool, so the cascade is
-- done by hand — but in a fixed number of statements via a recursive CTE that
-- collects every descendant id, so deleting a document with thousands of chunks
-- is 4 statements, not O(nodes) Lua round-trips. Postgres relies on its
-- ON DELETE CASCADE: explicit edge cleanup for the node, then one node delete.
local function delete_node_tx(tx: any, db_type: any, store_id: any, node_id: any,
        removed_counts: kb10.Map?): (boolean, any?, kb10.Map?)
    if not removed_counts then
        local count_err
        removed_counts, count_err = subtree_source_counts_tx(tx, db_type, store_id, node_id)
        if not removed_counts then return false, count_err end
    end
    if tonumber(removed_counts.root_count) > 0 then
        return false, errors.new({ message = "root concept cannot be deleted", kind = errors.INVALID })
    end

    if db_type == sql.type.SQLITE then
        local err = delete_sqlite_subtree_tx(tx, store_id, node_id, true)
        if err then return false, err end
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
    if exec_err then return false, exec_err end
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
        return delete_sqlite_subtree_tx(tx, store_id, node_id, false)
    end

    local _, exec_err = tx:execute(
        "DELETE FROM kb10_nodes WHERE store_id = $1 AND parent_id = $2",
        { store_id, node_id }
    )
    if exec_err then return errors.wrap(exec_err, "failed to delete child nodes") end
    return nil
end

local function write_sqlite_fts_tx(tx: any, node_id: any, content: any, node_type: any): any?
    if content == nil then
        local _, del_err = tx:execute(
            "DELETE FROM kb10_nodes_fts WHERE rowid = (SELECT fts_rowid FROM kb10_nodes WHERE id = $1)", { node_id })
        if del_err then return errors.wrap(del_err, "fts delete failed") end
        local _, link_err = tx:execute(
            "UPDATE kb10_nodes SET fts_rowid = NULL WHERE id = $1 AND fts_rowid IS NOT NULL", { node_id })
        if link_err then return errors.wrap(link_err, "fts ownership update failed") end
    else
        local _, write_err = tx:execute([[INSERT OR REPLACE INTO kb10_nodes_fts (rowid, node_id, content, node_type)
            VALUES ((SELECT fts_rowid FROM kb10_nodes WHERE id = $1), $1, $2, $3)]], { node_id, content, node_type })
        if write_err then return errors.wrap(write_err, "fts insert failed") end
        local _, link_err = tx:execute([[UPDATE kb10_nodes SET fts_rowid = last_insert_rowid()
            WHERE id = $1 AND fts_rowid IS NULL]], { node_id })
        if link_err then return errors.wrap(link_err, "fts ownership update failed") end
    end
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
    if exec_err then return exec_err end

    if db_type == sql.type.SQLITE then
        return write_sqlite_fts_tx(tx, node_id, node_input.content, node_input.node_type)
    end

    return nil
end

-- PostgreSQL serializes mutations on the store before taking node locks.
-- SQLite checks existence in the same transaction as source replacement.
local function lock_store_tx(tx: any, db_type: any, store_id: any, check_exists: boolean?): (any?, any?)
    local postgres = db_type == sql.type.POSTGRES
    if not postgres and not check_exists then return nil, nil end
    local lock = postgres and " FOR NO KEY UPDATE" or ""
    local rows, err = tx:query("SELECT id FROM kb10_stores WHERE id = $1" .. lock, {store_id})
    if err then return nil, errors.wrap(err, "failed to lock document store") end
    return rows[1], nil
end

local function require_store_tx(tx: any, db_type: any, store_id: any): any?
    local locked, err = lock_store_tx(tx, db_type, store_id, true)
    if err then return err end
    if not locked then return errors.new({kind = errors.NOT_FOUND, message = "document store not found"}) end
    return nil
end

-- Both ordinary and checkpointed fan-out acquire store locks in this order.
function writer.lock_source_fanout_tx(tx, dialect, stores)
    local ids = {}
    for id in pairs(stores) do ids[#ids + 1] = id end
    table.sort(ids)
    local lock = dialect == sql.type.POSTGRES and " FOR NO KEY UPDATE" or ""
    for _, id in ipairs(ids) do
        local rows, lock_err = tx:query([[SELECT component_id, embedding_model, CAST(config AS TEXT) AS config,
            kb_type, source_publication_token
            FROM kb10_stores WHERE id = $1]] .. lock, {id})
        if lock_err then return lock_err end
        local current, expected = rows[1], stores[id]
        -- New stores always get a fresh token, including successors of a
        -- legacy store whose token was NULL.
        if not current or current.component_id ~= expected.component_id
            or current.source_publication_token ~= expected.source_publication_token
            or current.embedding_model ~= expected.embedding_model
            or current.config ~= expected.config_snapshot or current.kb_type ~= expected.kb_type then
            return errors.new({kind = errors.CONFLICT, retryable = true,
                message = "source fan-out destination changed during preparation"})
        end
    end
    return nil
end

function writer.write_source_fanout(stores, write)
    local db, err = ops.get_db()
    if not db then return nil, err end
    local dialect, type_err = ops.get_db_type(db)
    if type_err then db:release(); return nil, type_err end
    local tx, begin_err = db:begin()
    if not tx then db:release(); return nil, begin_err end

    local ok, result, write_err = pcall(function()
        local lock_err = writer.lock_source_fanout_tx(tx, dialect, stores)
        if lock_err then return nil, lock_err end
        return write(tx, dialect)
    end)
    if not ok then return fail_tx(tx, db, result) end
    if not result or write_err then return fail_tx(tx, db, write_err) end
    local committed, commit_err = commit_tx(tx, db, "source fan-out")
    if not committed then return nil, commit_err end
    return result, nil
end

-- Atomically replace the materialized tree for one canonical source document.
-- The worker computes embeddings outside this transaction; kb10 owns the commit
-- boundary for doc + children + vectors + prior-version cleanup.
--
-- The document node's id is the document's identity, not the generation's:
-- consumers fold it into their own rows and resolve the document by it long
-- after this write. So a replacement of the same source in the same scope
-- keeps the node that already carries that identity and swaps the generation
-- underneath it — content, children, vectors. Children re-mint their ids; they
-- are content. A caller-supplied document.id only seeds a first
-- materialization: on replacement the stored identity wins.
local function replace_document_tx(tx: any, db_type: any, store_id: any, replacement: any, before: table?,
        encoded_embeddings: boolean?)
    if not is_str(store_id) then return nil, errors.new({ message = "store_id is required", kind = errors.INVALID }) end
    local spec = type(replacement) == "table" and replacement or {}
    local document = type(spec.document) == "table" and spec.document or nil
    if not document then return nil, errors.new({ message = "document is required", kind = errors.INVALID }) end
    if document.node_type ~= kb10.NODE_TYPE.DOCUMENT or document.parent_id ~= nil then
        return nil, errors.new({ message = "document root is required", kind = errors.INVALID })
    end

    local metadata = type(document.metadata) == "table" and document.metadata or {}
    local binding = ops.source_binding(store_id, metadata.external_source, metadata.external_id, spec.source_thread_id)
    if not binding then
        return nil, errors.new({ message = "document metadata.external_source and external_id are required", kind = errors.INVALID })
    end
    local lock_err = require_store_tx(tx, db_type, store_id)
    if lock_err then return nil, lock_err end
    local reused_id, ownership_err = ops.find_source_root_tx(tx, db_type, store_id, binding)
    if ownership_err then return nil, ownership_err end
    local reused_counts
    if before then
        local current, confirm_err = confirm_source_checkpoint(tx, db_type, store_id, reused_id, before, true)
        if not current then return nil, confirm_err end
        reused_counts = current.counts
    elseif reused_id then
        local count_err
        reused_counts, count_err = subtree_source_counts_tx(tx, db_type, store_id, reused_id)
        if count_err then return nil, count_err end
    end

    local removed = 0
    local removed_completed_documents = 0
    local removed_failed_documents = 0
    local removed_summaries = 0
    local removed_chunks = 0

    local doc_id: any
    if reused_id then
        -- The generation being replaced still counts as a removed document: the
        -- deltas the caller derives from these counts describe the knowledge
        -- base's document population, not node identity.
        removed = removed + 1
        removed_completed_documents = removed_completed_documents + (tonumber(reused_counts and reused_counts.document_count) or 0)
        removed_failed_documents = removed_failed_documents + (tonumber(reused_counts and reused_counts.failed_document_count) or 0)
        removed_summaries = removed_summaries + (tonumber(reused_counts and reused_counts.summary_count) or 0)
        removed_chunks = removed_chunks + (tonumber(reused_counts and reused_counts.chunk_count) or 0)

        local children_err = delete_children_tx(tx, db_type, store_id, reused_id)
        if children_err then return nil, errors.wrap(children_err, "delete prior generation failed") end
        local overwrite_err = overwrite_document_tx(tx, db_type, store_id, reused_id, document)
        if overwrite_err then return nil, errors.wrap(overwrite_err, "replace document failed") end
        doc_id = reused_id
    else
        local new_id, doc_err = insert_node_tx(tx, db_type, store_id, document, binding)
        if doc_err or not new_id then return nil, errors.wrap(doc_err, "insert document failed") end
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
    local child_ids, child_err = writer.insert_nodes_tx(tx, db_type, store_id, nodes)
    if child_err or not child_ids then return nil, errors.wrap(child_err, "insert child failed") end
    local embeddings: {any} = {}
    for i, child_spec in ipairs(children) do
        embeddings[i] = { node_id = child_ids[i], node_type = nodes[i].node_type,
            parent_id = doc_id, embedding = child_spec.embedding }
    end
    local embedding_ids, emb_err = insert_embeddings_tx(tx, db_type, store_id, embeddings, nil, encoded_embeddings)
    if emb_err or not embedding_ids then return nil, errors.wrap(emb_err, "insert child embedding failed") end

    return {
        document_node_id = doc_id,
        removed = removed,
        removed_document_count = removed_completed_documents,
        removed_failed_document_count = removed_failed_documents,
        removed_summary_count = removed_summaries,
        removed_chunk_count = removed_chunks,
        summary_count = summary_count,
        chunk_count = chunk_count,
        embedding_count = before and #embedding_ids or nil,
        removed_embedding_count = before and (tonumber(reused_counts and reused_counts.child_embedding_count) or 0) or nil,
    }, nil
end

function writer.replace_document_tx(tx: any, db_type: any, store_id: any, replacement: any)
    return replace_document_tx(tx, db_type, store_id, replacement)
end

-- Use the same SQL parameter format as single-document writes. Preparing it
-- once lets fan-out drop the numeric tables before preparing the next store.
function writer.encode_source_fanout_embeddings(replacement: any)
    for _, child in ipairs(replacement.children) do
        local vector = child.embedding :: {number}
        child.embedding = ops.vector_to_string(vector)
    end
end

function writer.replace_source_fanout_document_tx(tx: any, db_type: any, store_id: any, replacement: any)
    return replace_document_tx(tx, db_type, store_id, replacement, nil, true)
end

local function mutate_source_document(store_id: any, mutate: any, ...)
    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local result, write_err = mutate(tx, db_type, store_id, ...)
    if write_err then return fail_tx(tx, db, write_err) end
    local ok, commit_err = commit_tx(tx, db, "document replacement")
    if not ok then return nil, commit_err end
    return result, nil
end

function writer.replace_document(store_id: any, replacement: any)
    return mutate_source_document(store_id, writer.replace_document_tx, replacement)
end

-- Record an attempted immutable revision without rewriting an accepted tree.
local SOURCE_REJECTIONS = {
    artifact_reference_not_found = {kind = errors.NOT_FOUND, message = "The selected artifact is missing."},
    artifact_bytes_not_found = {kind = errors.NOT_FOUND, message = "The selected artifact's stored content is missing."},
    artifact_length_mismatch = {kind = errors.INVALID, message = "The selected artifact's byte length does not match this revision."},
    artifact_digest_mismatch = {kind = errors.INVALID, message = "The selected artifact's checksum does not match this revision."},
}

local function reject_source_revision_tx(tx: any, db_type: any, store_id: any, source_thread_id: string,
        metadata: kb10.Map, code: string, before: table?, planned_id: string?): (any?, any?, table?)
    local binding = ops.source_binding(store_id, metadata.external_source, metadata.external_id, source_thread_id)
    if not binding then
        return nil, errors.new({kind = errors.INVALID, message = "document rejection requires a source identity"})
    end
    local lock_err = require_store_tx(tx, db_type, store_id)
    if lock_err then return nil, lock_err end
    local id, lookup_err = ops.find_source_root_tx(tx, db_type, store_id, binding)
    if lookup_err then return nil, lookup_err end
    local current
    if before then
        local confirm_err
        current, confirm_err = confirm_source_checkpoint(tx, db_type, store_id, id, before, before.counts ~= nil)
        if not current then return nil, confirm_err end
    end

    local classification = SOURCE_REJECTIONS[code]
    local position = tonumber(metadata.thread_event_seq)
    if not classification or not position or not is_str(metadata.thread_event_id) then
        return nil, errors.new({kind = errors.INVALID, message = "document rejection requires a verified source revision"})
    end
    local reason = classification.message
    local rejection = {code = code, kind = classification.kind, message = reason, thread_event_seq = position,
        thread_event_id = metadata.thread_event_id, external_version = metadata.external_version}
    local stored = {}
    if id then
        if current then
            stored = decode_metadata(current.revision)
        else
            local rows, read_err = tx:query("SELECT metadata FROM kb10_nodes WHERE store_id=$1 AND id=$2", {store_id, id})
            if read_err then return nil, errors.wrap(read_err, "failed to read source revision") end
            if not rows[1] then return nil, errors.new({kind = errors.CONFLICT, message = "source document changed"}) end
            stored = decode_metadata(rows[1].metadata)
        end
        local prior = stored.source_rejection
        local previous_seq = math.max(tonumber(stored.thread_event_seq) or 0,
            tonumber(type(prior) == "table" and prior.thread_event_seq) or 0)
        if type(prior) == "table" and prior.thread_event_id == metadata.thread_event_id
            and tonumber(prior.thread_event_seq) == position and prior.code == code then
            return id, nil, {document_node_id = id, retained = stored.status ~= "failed", error = reason,
                failed_delta = tonumber(prior.failed_delta) or 0}
        end
        if previous_seq >= position then
            return nil, errors.new({kind = errors.CONFLICT, message = "source rejection no longer owns this revision"})
        end
    end
    local retained = id ~= nil and stored.status ~= "failed"
    local failed_delta = id and 0 or 1
    rejection.failed_delta = failed_delta
    if not retained then
        stored = metadata
        stored.role = kb10.NODE_TYPE.DOCUMENT
        stored.status = "failed"
        stored.source_title = stored.title
        stored.title = "Indexing failed"
        stored.error = reason
    end
    stored.source_rejection = rejection
    if not id then
        local insert_err
        id, insert_err = insert_node_tx(tx, db_type, store_id, {
            id = planned_id, node_type = kb10.NODE_TYPE.DOCUMENT, content_type = "text/plain", metadata = stored,
        }, binding)
        if insert_err then return nil, insert_err end
    else
        local encoded, encode_err = json.encode(stored)
        if encode_err then return nil, errors.wrap(encode_err, "failed to encode source rejection") end
        local updated, update_err = tx:execute([[UPDATE kb10_nodes SET metadata=$1, updated_at=CURRENT_TIMESTAMP
            WHERE store_id=$2 AND id=$3]], {encoded, store_id, id})
        if update_err then return nil, errors.wrap(update_err, "failed to record source rejection") end
        if not updated or updated.rows_affected ~= 1 then
            return nil, errors.new({kind = errors.CONFLICT, message = "source document changed"})
        end
    end
    return id, nil, {document_node_id = id, retained = retained, error = reason, failed_delta = failed_delta}
end

function writer.reject_source_revision(store_id: string, source_thread_id: string, metadata: kb10.Map, code: string)
    return mutate_source_document(store_id, function(tx, dialect, id)
        local _, err, receipt = reject_source_revision_tx(tx, dialect, id, source_thread_id, metadata, code)
        return receipt, err
    end)
end

function writer.reject_source_revision_tx(tx: any, db_type: any, store_id: any, source_thread_id: string,
        metadata: kb10.Map, code: string): (any?, any?)
    return reject_source_revision_tx(tx, db_type, store_id, source_thread_id, metadata, code)
end

local function encode_store_config(config: any)
    -- Wippy can encode an empty Lua table as an array. Store settings are an object.
    if not config or (type(config) == "table" and next(config) == nil) then return "{}" end
    return json.encode(config)
end

-- Create the per-component store row. The store id equals the component_id so
-- the control plane (graph root anchor, concept tooling) can address the store
-- by component_id. opts carries the optional kb_type / enrichment_agent_id the
-- graph KB variant needs.
function writer.create_store(component_id: any, embedding_model: any, config: any, opts: any)
    local create_opts = (type(opts) == "table" and opts or {}) :: kb10.StoreCreateOptions
    local config_json = encode_store_config(config)
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
        "INSERT INTO kb10_stores (id, component_id, embedding_model, config, kb_type, enrichment_agent_id, source_publication_token) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        { component_id, component_id, embedding_model, config_json, kb_type, enrichment_agent_id, uuid.v7() }
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
    local params = { encode_store_config(config), component_id }
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

    local db_type, dt_err = ops.get_db_type(db)
    if dt_err then db:release(); return nil, dt_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end

    local lock = db_type == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, q_err = tx:query("SELECT id FROM kb10_stores WHERE component_id = $1" .. lock, { component_id })
    if q_err then return fail_tx(tx, db, q_err) end
    if not rows or #rows == 0 then
        local ok, commit_err = commit_tx(tx, db, "store delete")
        if not ok then return nil, commit_err end
        return true
    end
    local store_id = rows[1].id

    local cascade = {}
    if db_type == sql.type.SQLITE then
        local fts_err = delete_sqlite_fts_tx(tx, "SELECT fts_rowid FROM kb10_nodes WHERE store_id = $1", { store_id })
        if fts_err then return fail_tx(tx, db, fts_err) end
    end
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_query_log WHERE store_id = $1", name = "kb10_query_log" }
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_tuning_state WHERE store_id = $1", name = "kb10_tuning_state" }
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_embeddings WHERE store_id = $1", name = "kb10_embeddings" }
    cascade[#cascade + 1] = { sql = "DELETE FROM kb10_edges WHERE store_id = $1",      name = "kb10_edges" }
    if db_type == sql.type.POSTGRES then
        cascade[#cascade + 1] = { sql = "DELETE FROM kb10_nodes WHERE store_id = $1", name = "kb10_nodes" }
    end
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
    -- SQLite counts live roots on the store row. Removing the row first avoids
    -- updating it for each removed root. Explicit cleanup also covers FK-off pools.
    if db_type == sql.type.SQLITE then
        local _, nodes_err = tx:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
        if nodes_err then return fail_tx(tx, db, errors.wrap(nodes_err, "failed to delete from kb10_nodes")) end
    end
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
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end

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
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end

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
        local fts_err = write_sqlite_fts_tx(tx, node_id, node_patch.content, node.node_type)
        if fts_err then return nil, fts_err end
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
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end

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
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end

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

    local db_type, dt_err = ops.get_db_type(db)
    if dt_err then db:release(); return nil, dt_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end
    local id, insert_err = insert_embedding_tx(tx, db_type, store_id, node_id, node_type, parent_id, embedding)
    if insert_err then return fail_tx(tx, db, insert_err) end
    local ok, commit_err = commit_tx(tx, db, "embedding insert")
    if not ok then return nil, commit_err end
    return id
end

function writer.delete_node(store_id: any, node_id: any)
    local db, err = ops.get_db()
    if err then return false, err end

    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return false, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return false, errors.wrap(tx_err, "failed to begin transaction") end
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then
        local _, err = fail_tx(tx, db, lock_err)
        return false, err
    end

    local ok, del_err = delete_node_tx(tx, db_type, store_id, node_id)
    if not ok then
        local _, msg = fail_tx(tx, db, del_err)
        return false, msg
    end
    local committed, commit_err = commit_tx(tx, db, "node delete")
    if not committed then return false, commit_err end
    return true
end

local function delete_documents_tx(tx: any, db_type: any, store_id: any, rows: any)
    local removed = 0
    local removed_completed_documents = 0
    local removed_failed_documents = 0
    local removed_summaries = 0
    local removed_chunks = 0
    for _, row in ipairs(rows) do
        local ok, del_err, removed_counts = delete_node_tx(tx, db_type, store_id, tostring(row.id), row.counts)
        if not ok then return nil, errors.wrap(del_err, "delete document failed") end
        removed = removed + 1
        removed_completed_documents = removed_completed_documents + (tonumber(removed_counts and removed_counts.document_count) or 0)
        removed_failed_documents = removed_failed_documents + (tonumber(removed_counts and removed_counts.failed_document_count) or 0)
        removed_summaries = removed_summaries + (tonumber(removed_counts and removed_counts.summary_count) or 0)
        removed_chunks = removed_chunks + (tonumber(removed_counts and removed_counts.chunk_count) or 0)
    end
    return {
        removed = removed,
        removed_document_count = removed_completed_documents,
        removed_failed_document_count = removed_failed_documents,
        removed_summary_count = removed_summaries,
        removed_chunk_count = removed_chunks,
    }
end

function writer.delete_documents_by_external_id_tx(tx: any, db_type: any, store_id: any, external_source: any, external_id: any)
    if not is_str(store_id) or not is_str(external_id) then
        return nil, errors.new({ kind = errors.INVALID, retryable = false, message = "store_id and external_id are required" })
    end
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return nil, lock_err end
    local rows, query_err = ops.find_source_nodes_tx(tx, db_type, store_id, external_source, external_id, true)
    if query_err then return nil, errors.wrap(query_err, "failed to find documents by external id") end
    return delete_documents_tx(tx, db_type, store_id, rows)
end

local function find_document_tx(tx: any, db_type: any, store_id: any, selector: any): (string?, table?, any?)
    local expected = selector.expected_publication_id
    if expected ~= nil and (selector.node_id ~= nil or type(expected) ~= "string" or not uuid.validate(expected)) then
        return nil, nil, errors.new({kind = errors.INVALID, message = "invalid document publication selector"})
    end
    if selector.node_id ~= nil then
        if type(selector.node_id) ~= "string" or not uuid.validate(selector.node_id) then
            return nil, nil, errors.new({kind = errors.INVALID, message = "invalid document node ID"})
        end
        local root, err = ops.find_document_root_tx(tx, store_id, selector.node_id)
        return root and tostring(root.id), root, err
    end
    local binding = ops.source_binding(store_id, selector.external_source, selector.external_id, selector.source_thread_id)
    if not binding then return nil, nil, errors.new({kind = errors.INVALID, message = "invalid source binding"}) end
    local id, err = ops.find_source_root_tx(tx, db_type, store_id, binding, expected)
    return id, nil, err
end

local function delete_document_tx(tx: any, db_type: any, store_id: any, selector: any, before: table?)
    local lock_err
    if before then
        lock_err = require_store_tx(tx, db_type, store_id)
    else
        local _, ordinary_lock_err = lock_store_tx(tx, db_type, store_id)
        lock_err = ordinary_lock_err
    end
    if lock_err then return nil, lock_err end
    local id, root, err = find_document_tx(tx, db_type, store_id, selector)
    if err then return nil, err end
    local counts
    if before then
        local current, confirm_err = confirm_source_checkpoint(tx, db_type, store_id, id, before, true)
        if not current then return nil, confirm_err end
        counts = current.counts
    end
    local result, delete_err = delete_documents_tx(tx, db_type, store_id, id and {{id = id, counts = counts}} or {})
    if delete_err then return nil, delete_err end
    result.document_node_id = id
    result.external_source = root and root.external_source
    result.external_id = root and root.external_id
    if before then result.removed_embedding_count = tonumber(counts and counts.embedding_count) or 0 end
    return result, nil
end

function writer.delete_document_tx(tx: any, db_type: any, store_id: any, selector: any)
    return delete_document_tx(tx, db_type, store_id, selector)
end

-- Core authorizes appends before opening the shared write transaction. Read
-- the affected subtree's contribution so the caller can declare those appends
-- and prove the same facts under the store lock before consuming the event.
function writer.source_checkpoint_before(store_id: string, selector: table, kind: string, count_rejected: boolean?): (table?, any?)
    local db, err = ops.get_db()
    if err then return nil, err end
    local dialect, type_err = ops.get_db_type(db)
    if type_err then db:release(); return nil, type_err end
    local id, root, read_err = find_document_tx(db, dialect, store_id, selector)
    local before
    if not read_err then
        before, read_err = source_checkpoint_state(db, dialect, store_id, id, kind ~= "reject" or count_rejected == true)
    end
    local _, release_err = db:release()
    if read_err or release_err then return nil, read_err or release_err end
    if before and root then
        before.external_source, before.external_id = root.external_source, root.external_id
    end
    return before, nil
end

function writer.source_checkpoint_outcome(before: table, change: table): table
    local delta: table = {status = "ready", document_delta = 0, failed_delta = 0, summary_delta = 0,
        chunk_delta = 0, embedding_delta = 0}
    if change.kind == "reject" then
        delta.status = before.id and before.status ~= "failed" and "degraded" or "error"
        local classification = SOURCE_REJECTIONS[change.code]
        delta.last_error = classification and classification.message
        delta.failed_delta = before.id and 0 or 1
        return delta
    end
    local counts = before.counts or {}
    delta.document_delta = -(tonumber(counts.document_count) or 0)
    delta.failed_delta = -(tonumber(counts.failed_document_count) or 0)
    delta.summary_delta = -(tonumber(counts.summary_count) or 0)
    delta.chunk_delta = -(tonumber(counts.chunk_count) or 0)
    if change.kind == "delete" then
        delta.embedding_delta = -(tonumber(counts.embedding_count) or 0)
        return delta
    end
    local children = change.replacement.children
    delta.embedding_delta = #children - (tonumber(counts.child_embedding_count) or 0)
    if change.replacement.document.metadata.status == "failed" then
        delta.failed_delta = delta.failed_delta + 1
    else
        delta.document_delta = delta.document_delta + 1
    end
    for _, child in ipairs(children) do
        if child.node.node_type == kb10.NODE_TYPE.SUMMARY then delta.summary_delta = delta.summary_delta + 1 end
        if child.node.node_type == kb10.NODE_TYPE.CHUNK then delta.chunk_delta = delta.chunk_delta + 1 end
    end
    return delta
end

function writer.write_source_checkpoint_tx(tx: any, dialect: string, store_id: string, selector: table,
        before: table, change: table, expected: table, encoded_embeddings: boolean?): (boolean?, any?)
    if change.kind == "reject" then
        local id, err = reject_source_revision_tx(tx, dialect, store_id, selector.source_thread_id, change.metadata,
            change.code, before, change.document_id)
        if id and change.document_id and id ~= change.document_id then return nil, checkpoint_conflict() end
        return id ~= nil, err
    end
    local written, write_err
    local added, failed = 0, 0
    if change.kind == "delete" then
        written, write_err = delete_document_tx(tx, dialect, store_id, selector, before)
    else
        written, write_err = replace_document_tx(tx, dialect, store_id, change.replacement, before, encoded_embeddings)
        if change.replacement.document.metadata.status == "failed" then failed = 1 else added = 1 end
    end
    if write_err or not written then return nil, write_err end
    if added - written.removed_document_count ~= expected.document_delta
        or failed - written.removed_failed_document_count ~= expected.failed_delta
        or (written.summary_count or 0) - written.removed_summary_count ~= expected.summary_delta
        or (written.chunk_count or 0) - written.removed_chunk_count ~= expected.chunk_delta
        or (written.embedding_count or 0) - written.removed_embedding_count ~= expected.embedding_delta then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "source writer result differs from checkpoint outcome"})
    end
    return true, nil
end

local function delete_documents(store_id: any, mutate: any, ...)
    local db, err = ops.get_db()
    if err then return 0, err end
    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return 0, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return 0, errors.wrap(tx_err, "failed to begin transaction") end

    local result, delete_err = mutate(tx, db_type, store_id, ...)
    if delete_err then
        local _, message = fail_tx(tx, db, delete_err)
        return 0, message
    end
    local ok, commit_err = commit_tx(tx, db, "document delete")
    if not ok then return 0, commit_err end
    return result, nil
end

function writer.delete_documents_by_external_id(store_id: any, external_source: any, external_id: any)
    return delete_documents(store_id, writer.delete_documents_by_external_id_tx, external_source, external_id)
end

function writer.delete_document(store_id: any, selector: any)
    return delete_documents(store_id, writer.delete_document_tx, selector)
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

    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end

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
function writer.insert_nodes(store_id: any, nodes: any, bindings: any?): (boolean?, any?)
    local list = (type(nodes) == "table" and nodes or {}) :: { any }
    if #list == 0 then return true end
    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, dt_err = ops.get_db_type(db)
    if dt_err then db:release(); return nil, dt_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    local lock_err = require_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end
    local _, insert_err = writer.insert_nodes_tx(tx, db_type, store_id, list, bindings)
    if insert_err then return fail_tx(tx, db, insert_err) end
    return commit_tx(tx, db, "node batch insert")
end

-- Insert embeddings for newly imported nodes in one transaction.
function writer.insert_embeddings(store_id: any, rows: any): (boolean?, any?)
    local list = (type(rows) == "table" and rows or {}) :: { any }
    if #list == 0 then return true end
    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type, dt_err = ops.get_db_type(db)
    if dt_err then db:release(); return nil, dt_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    local lock_err = require_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end
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
    local db_type, db_type_err = ops.get_db_type(db)
    if db_type_err then db:release(); return nil, db_type_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "failed to begin transaction") end
    local lock_err = require_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end
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
    local _, lock_err = lock_store_tx(tx, db_type, store_id)
    if lock_err then return fail_tx(tx, db, lock_err) end

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
