-- Read side of the kb10 persistence layer. Every method acquires a pooled
-- connection through ops, runs a SELECT against the kb10_* tables, releases the
-- connection, and returns rows as values. No writes. Connection acquisition and
-- dialect resolution, the IN-clause placeholder builder, and in-place metadata
-- decoding are shared with the writer through the ops library.

local sql = require("sql")
local json = require("json")
local ops = require("kb10_ops")
local kb10 = require("kb10")
local search_index = require("search_index")

local reader = {}

function reader.get_store(component_id: any)
    local db, err = ops.get_db()
    if err then return nil, err end

    local rows, query_err = db:query(
        "SELECT id, component_id, embedding_model, config, auto_summary, auto_description, kb_type, enrichment_agent_id FROM kb10_stores WHERE component_id = $1",
        { component_id }
    )
    db:release()

    if query_err then return nil, query_err end
    if not rows or #rows == 0 then return nil, errors.new({ message = "store not found for component " .. component_id, kind = errors.NOT_FOUND }) end

    local row = rows[1]
    row.config_snapshot = row.config
    if row.config and type(row.config) == "string" then
        local parsed, parse_err = json.decode(row.config)
        if not parse_err then
            row.config = parsed
        else
            row.config = {}
        end
    end

    return row
end

local SEARCH_SPEC = {
    vectors = "kb10_embeddings",
    vector_key = "node_id",
    rows = "kb10_nodes",
    row_key = "id",
    partition = "store_id",
    columns = { "store_id", "node_type", "parent_id", "content", "content_type", "metadata", "created_at", "updated_at" },
    fts = "kb10_nodes_fts",
    fts_key = "node_id",
    tsvector = "search_vector",
    json_columns = { "metadata" },
}

-- One retrieval entry point, used by query_func and internal concept retrieval.
-- Vector-only callers retain their existing semantics. Query-bearing callers
-- fuse candidates from the maintained lexical index and vector index by node
-- id before applying the requested limit; no document-summary gate can discard
-- a lexical-only passage. Missing embeddings do not hide indexed text.
function reader.vector_search(store_id: any, query_vector: any, opts: any)
    local options = (type(opts) == "table" and opts or {}) :: kb10.VectorSearchOptions
    local filters: { any } = {}
    if options.node_types and #options.node_types > 0 then
        filters[#filters + 1] = { column = "node_type", values = options.node_types, table = "vectors" }
    end
    if options.parent_id and options.parent_id ~= "" then
        filters[#filters + 1] = { column = "parent_id", values = { options.parent_id }, table = "vectors" }
    end
    local db, err = ops.get_db()
    if err then return nil, err end
    local rows, search_err = search_index.search(db, SEARCH_SPEC, query_vector, {
        partition = store_id, limit = options.limit or 10, filters = filters, query_text = options.query_text,
    })
    db:release()
    if search_err then return nil, search_err end
    return rows
end

function reader.browse_nodes(store_id: any, opts: any)
    local browse_opts = (type(opts) == "table" and opts or {}) :: kb10.BrowseNodesOptions
    local parent_id = browse_opts.parent_id
    local top_level = browse_opts.top_level == true
    local node_type = browse_opts.node_type
    local limit = browse_opts.limit or 50
    local offset = browse_opts.offset or 0

    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type = ops.get_db_type(db)

    local fields = "id, store_id, parent_id, node_type, content_type, metadata, created_at, updated_at"
    if browse_opts.include_content then
        fields = fields .. ", content"
    end
    local query = "SELECT " .. fields .. " FROM kb10_nodes WHERE store_id = $1"
    local params = { store_id }
    local idx = 1

    -- A non-empty parent_id scopes to that node's children. top_level restricts to
    -- roots (parent IS NULL) and must be requested explicitly — an omitted parent_id
    -- with only a node_type filter spans ALL parents, so node-type browses (summaries,
    -- chunks, child concepts, all of which carry a non-null parent) return their rows
    -- rather than being silently filtered to roots only.
    if parent_id and parent_id ~= "" then
        idx = idx + 1
        query = query .. " AND parent_id = $" .. idx
        table.insert(params, parent_id)
    elseif top_level then
        query = query .. " AND parent_id IS NULL"
    end

    if node_type and node_type ~= "" then
        idx = idx + 1
        query = query .. " AND node_type = $" .. idx
        table.insert(params, node_type)
    end

    -- A document's chunks are all inserted in one transaction, so they share
    -- created_at (NOW()); ordering by it alone is non-deterministic. Order by the
    -- chunk_index carried in metadata first (so chunks come back in document order
    -- and offset/limit yields a contiguous window around any chunk), then by
    -- created_at and id for a stable, repeatable order across pages. Nodes without
    -- a chunk_index (concepts, documents, summaries) fall through to created_at/id.
    local order_by: string
    if db_type == sql.type.SQLITE then
        -- (expr IS NULL) sorts NULL chunk_index last without relying on the
        -- NULLS LAST syntax (SQLite >= 3.30 only).
        local ci = "CAST(json_extract(metadata, '$.chunk_index') AS INTEGER)"
        order_by = " ORDER BY (" .. ci .. " IS NULL), " .. ci .. " ASC, created_at ASC, id ASC"
    else
        order_by = " ORDER BY (metadata::jsonb ->> 'chunk_index')::int ASC NULLS LAST, created_at ASC, id ASC"
    end
    query = query .. order_by .. " LIMIT $" .. (idx + 1) .. " OFFSET $" .. (idx + 2)
    table.insert(params, limit)
    table.insert(params, offset)

    local results, query_err = db:query(query, params)
    db:release()

    if query_err then return nil, query_err end

    ops.decode_metadata(results)
    return results or {}
end

-- Count the nodes a browse_nodes call with the same filter would match, ignoring
-- limit/offset. A single COUNT(*) with no row fetch, used to surface a real total
-- for server-side pagination (the browse page shows one window; this is the size
-- of the whole match). The parent_id/top_level/node_type predicates mirror
-- browse_nodes exactly so the total agrees with what paging walks.
function reader.count_nodes(store_id: any, opts: any)
    local count_opts = (type(opts) == "table" and opts or {}) :: kb10.BrowseNodesOptions
    local parent_id = count_opts.parent_id
    local top_level = count_opts.top_level == true
    local node_type = count_opts.node_type

    local db, err = ops.get_db()
    if err then return nil, err end

    local query = "SELECT COUNT(*) AS total FROM kb10_nodes WHERE store_id = $1"
    local params = { store_id }
    local idx = 1

    if parent_id and parent_id ~= "" then
        idx = idx + 1
        query = query .. " AND parent_id = $" .. idx
        table.insert(params, parent_id)
    elseif top_level then
        query = query .. " AND parent_id IS NULL"
    end

    if node_type and node_type ~= "" then
        idx = idx + 1
        query = query .. " AND node_type = $" .. idx
        table.insert(params, node_type)
    end

    local rows, query_err = db:query(query, params)
    db:release()

    if query_err then return nil, query_err end
    if not rows or #rows == 0 then return 0 end
    return tonumber(rows[1].total) or 0
end

function reader.get_summaries(component_ids: any)
    if not component_ids or #component_ids == 0 then
        return {}
    end

    local db, err = ops.get_db()
    if err then return nil, err end

    local rows, query_err = db:query(
        "SELECT component_id, auto_summary FROM kb10_stores WHERE component_id IN (" ..
        ops.placeholders(#component_ids) .. ") AND auto_summary IS NOT NULL",
        component_ids
    )
    db:release()

    if query_err then return nil, query_err end

    local result = {}
    if rows then
        for _, row in ipairs(rows) do
            result[row.component_id] = row.auto_summary
        end
    end

    return result
end

-- Document summaries plus their parent document metadata, the corpus the digest
-- service condenses into a KB-level description. Ordered oldest-first.
function reader.list_document_summaries(store_id: any)
    local db, err = ops.get_db()
    if err then return nil, err end

    local rows, query_err = db:query(
        "SELECT n.content AS content, p.metadata AS metadata" ..
        " FROM kb10_nodes n" ..
        " JOIN kb10_nodes p ON n.parent_id = p.id AND p.node_type = '" .. kb10.NODE_TYPE.DOCUMENT .. "'" ..
        " WHERE n.store_id = $1 AND n.node_type = '" .. kb10.NODE_TYPE.SUMMARY .. "'" ..
        " ORDER BY n.created_at",
        { store_id })
    db:release()

    if query_err then return nil, query_err end

    ops.decode_metadata(rows)
    return rows or {}
end

function reader.get_node(store_id: any, node_id: any)
    local db, err = ops.get_db()
    if err then return nil, err end

    local rows, query_err = db:query(
        "SELECT id, store_id, parent_id, node_type, content, content_type, metadata, created_at, updated_at FROM kb10_nodes WHERE store_id = $1 AND id = $2",
        { store_id, node_id }
    )
    db:release()

    if query_err then return nil, query_err end
    if not rows or #rows == 0 then return nil, errors.new({ message = "node not found", kind = errors.NOT_FOUND }) end

    local row = rows[1]
    if row.metadata and type(row.metadata) == "string" then
        local parsed, parse_err = json.decode(row.metadata)
        row.metadata = parse_err and {} or parsed
    elseif not row.metadata then
        row.metadata = {}
    end

    return row
end

-- Batch form of get_node: fetch many nodes in one query. Avoids the per-node
-- round trip the graph/digest builders would otherwise do over a concept set.
function reader.get_nodes(store_id: any, node_ids: any)
    if type(node_ids) ~= "table" or #node_ids == 0 then return {} end
    local db, err = ops.get_db()
    if err then return nil, err end

    local params: { any } = { store_id }
    for _, id in ipairs(node_ids :: { any }) do params[#params + 1] = id end

    local rows, query_err = db:query(
        "SELECT id, store_id, parent_id, node_type, content, content_type, metadata, created_at, updated_at FROM kb10_nodes WHERE store_id = $1 AND id IN (" .. ops.placeholders(#node_ids, 2) .. ")",
        params
    )
    db:release()

    if query_err then return nil, query_err end
    ops.decode_metadata(rows)
    return rows or {}
end

function reader.get_edges(store_id: any, node_id: any, opts: any)
    local edge_opts = (type(opts) == "table" and opts or {}) :: kb10.EdgeQueryOptions
    local direction = edge_opts.direction or "both"
    local edge_type = edge_opts.edge_type
    local limit = edge_opts.limit or 50
    local offset = edge_opts.offset or 0

    local db, err = ops.get_db()
    if err then return nil, err end

    local query
    local params
    local idx

    if direction == "out" then
        query = "SELECT id, store_id, from_node_id, to_node_id, edge_type, weight, metadata, created_at FROM kb10_edges WHERE store_id = $1 AND from_node_id = $2"
        params = { store_id, node_id }
        idx = 2
    elseif direction == "in" then
        query = "SELECT id, store_id, from_node_id, to_node_id, edge_type, weight, metadata, created_at FROM kb10_edges WHERE store_id = $1 AND to_node_id = $2"
        params = { store_id, node_id }
        idx = 2
    else
        query = "SELECT id, store_id, from_node_id, to_node_id, edge_type, weight, metadata, created_at FROM kb10_edges WHERE store_id = $1 AND (from_node_id = $2 OR to_node_id = $3)"
        params = { store_id, node_id, node_id }
        idx = 3
    end

    if edge_type and edge_type ~= "" then
        idx = idx + 1
        query = query .. " AND edge_type = $" .. idx
        table.insert(params, edge_type)
    end

    idx = idx + 1
    query = query .. " ORDER BY created_at ASC, id ASC LIMIT $" .. idx
    table.insert(params, limit)

    idx = idx + 1
    query = query .. " OFFSET $" .. idx
    table.insert(params, offset)

    local rows, query_err = db:query(query, params)
    db:release()

    if query_err then return nil, query_err end

    ops.decode_metadata(rows)
    return rows or {}
end

-- Batch form of get_edges: one page of the edges touching any of node_ids.
-- direction filters which endpoint must match (in/out/both); edge_type is an
-- optional filter; limit/offset page over a stable created_at, id order. The
-- caller dedups by edge id.
function reader.get_edges_batch(store_id: any, node_ids: any, opts: any)
    if type(node_ids) ~= "table" or #node_ids == 0 then return {} end
    local edge_opts = (type(opts) == "table" and opts or {}) :: kb10.EdgeQueryOptions
    local direction = edge_opts.direction or "both"
    local edge_type = edge_opts.edge_type
    local limit = edge_opts.limit or 10000
    local offset = edge_opts.offset or 0

    local db, err = ops.get_db()
    if err then return nil, err end

    local cols = "SELECT id, store_id, from_node_id, to_node_id, edge_type, weight, metadata, created_at FROM kb10_edges WHERE store_id = $1 AND "
    local params: { any } = { store_id }
    local function append_ids()
        for _, id in ipairs(node_ids :: { any }) do params[#params + 1] = id end
    end

    local query: string
    local idx: number
    if direction == "out" then
        query = cols .. "from_node_id IN (" .. ops.placeholders(#node_ids, 2) .. ")"
        append_ids()
        idx = 1 + #node_ids
    elseif direction == "in" then
        query = cols .. "to_node_id IN (" .. ops.placeholders(#node_ids, 2) .. ")"
        append_ids()
        idx = 1 + #node_ids
    else
        query = cols .. "(from_node_id IN (" .. ops.placeholders(#node_ids, 2) .. ") OR to_node_id IN (" .. ops.placeholders(#node_ids, 2 + #node_ids) .. "))"
        append_ids()
        append_ids()
        idx = 1 + 2 * #node_ids
    end

    if edge_type and edge_type ~= "" then
        idx = idx + 1
        query = query .. " AND edge_type = $" .. idx
        params[#params + 1] = edge_type
    end

    query = query .. " ORDER BY created_at ASC, id ASC LIMIT $" .. (idx + 1) .. " OFFSET $" .. (idx + 2)
    params[#params + 1] = limit
    params[#params + 1] = offset

    local rows, query_err = db:query(query, params)
    db:release()

    if query_err then return nil, query_err end
    ops.decode_metadata(rows)
    return rows or {}
end

-- Breadth-first traversal from start_node_id up to opts.depth hops, holding at most
-- opts.limit nodes. Edges are visited in created_at, id order so the kept node set
-- is deterministic; only edges whose both endpoints are kept are returned.
-- truncated reports that reachable nodes within the depth were left out.
function reader.graph_traverse(store_id: any, start_node_id: any, opts: any)
    local graph_opts = (type(opts) == "table" and opts or {}) :: kb10.GraphTraverseOptions
    local max_depth = graph_opts.depth or 2
    local limit = graph_opts.limit or 100

    local db, err = ops.get_db()
    if err then return nil, err end

    local node_set: { [string]: boolean } = { [tostring(start_node_id)] = true }
    local node_ids: { string } = { tostring(start_node_id) }
    local edge_set: { [string]: boolean } = {}
    local collected_edges: { any } = {}
    local truncated = false
    local frontier: { string } = { tostring(start_node_id) }

    for _ = 1, max_depth do
        if #frontier == 0 or truncated then break end
        local params: { any } = { store_id }
        for _, nid in ipairs(frontier) do params[#params + 1] = nid end
        for _, nid in ipairs(frontier) do params[#params + 1] = nid end
        local edges, edge_err = db:query(
            "SELECT id, store_id, from_node_id, to_node_id, edge_type, weight, metadata, created_at FROM kb10_edges WHERE store_id = $1 AND (from_node_id IN (" ..
            ops.placeholders(#frontier, 2) .. ") OR to_node_id IN (" .. ops.placeholders(#frontier, 2 + #frontier) .. ")) ORDER BY created_at ASC, id ASC",
            params
        )
        if edge_err then
            db:release()
            return nil, edge_err
        end
        ops.decode_metadata(edges)

        local next_frontier: { string } = {}
        for _, edge in ipairs(edges or {}) do
            local edge_id = tostring(edge.id)
            if not edge_set[edge_id] then
                local kept = true
                for _, endpoint in ipairs({ tostring(edge.from_node_id), tostring(edge.to_node_id) }) do
                    if not node_set[endpoint] then
                        if #node_ids < limit then
                            node_set[endpoint] = true
                            node_ids[#node_ids + 1] = endpoint
                            next_frontier[#next_frontier + 1] = endpoint
                        else
                            truncated = true
                            kept = false
                        end
                    end
                end
                if kept then
                    edge_set[edge_id] = true
                    collected_edges[#collected_edges + 1] = edge
                end
            end
        end
        frontier = next_frontier
    end

    local params: { any } = { store_id }
    for _, nid in ipairs(node_ids) do params[#params + 1] = nid end
    local node_rows, node_err = db:query(
        "SELECT id, store_id, parent_id, node_type, content, content_type, metadata, created_at FROM kb10_nodes WHERE store_id = $1 AND id IN (" ..
        ops.placeholders(#node_ids, 2) .. ")",
        params
    )
    db:release()
    if node_err then return nil, node_err end
    ops.decode_metadata(node_rows)

    return { nodes = node_rows or {}, edges = collected_edges, truncated = truncated }
end

-- Find all nodes whose metadata carries the given (external_source,
-- external_id) pair. Used by deterministic source workers to reconcile
-- a source artifact (e.g. a Confluence page) on every poll: same
-- external_id ⇒ replace, not append.
function reader.find_by_external_id(store_id: any, external_source: any, external_id: any)
    if not store_id or not external_id then
        return nil, errors.new({ message = "store_id and external_id are required", kind = errors.INVALID })
    end
    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type = ops.get_db_type(db)
    local where_external
    if db_type == sql.type.SQLITE then
        where_external = "AND json_extract(metadata, '$.external_source') = $2 AND json_extract(metadata, '$.external_id') = $3"
    else
        where_external = "AND (metadata::jsonb ->> 'external_source') = $2 AND (metadata::jsonb ->> 'external_id') = $3"
    end
    local rows, query_err = db:query(
        "SELECT id, store_id, parent_id, node_type, content, content_type, metadata " ..
        "FROM kb10_nodes WHERE store_id = $1 " .. where_external,
        { store_id, external_source or "", external_id }
    )
    db:release()

    if query_err then return nil, query_err end
    if not rows then return {}, nil end

    for _, row in ipairs(rows) do
        if row.metadata and type(row.metadata) == "string" then
            local parsed, perr = json.decode(row.metadata)
            row.metadata = perr and {} or parsed
        end
    end
    return rows, nil
end

return reader
