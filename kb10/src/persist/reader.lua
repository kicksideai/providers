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

-- A missing parent includes every parent unless the caller requests roots.
-- Both the page and its total use the same predicate and bound parameters.
local function browse_filter(store_id: any, opts: kb10.BrowseNodesOptions)
    local clause = " FROM kb10_nodes WHERE store_id = $1"
    local params = { store_id }
    if opts.parent_id and opts.parent_id ~= "" then
        table.insert(params, opts.parent_id)
        clause = clause .. " AND parent_id = $" .. #params
    elseif opts.top_level == true then
        clause = clause .. " AND parent_id IS NULL"
    end
    if opts.node_type and opts.node_type ~= "" then
        table.insert(params, opts.node_type)
        clause = clause .. " AND node_type = $" .. #params
    end
    return clause, params
end

local function read_nodes(handle: any, db_type: any, store_id: any, browse_opts: kb10.BrowseNodesOptions)
    local fields = "id, store_id, parent_id, node_type, content_type, metadata, created_at, updated_at, external_source, external_id"
    if browse_opts.include_content then fields = fields .. ", content" end
    local clause, params = browse_filter(store_id, browse_opts)

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
    local query = "SELECT " .. fields .. clause .. order_by .. " LIMIT $" .. (#params + 1) .. " OFFSET $" .. (#params + 2)
    table.insert(params, browse_opts.limit or 50)
    table.insert(params, browse_opts.offset or 0)
    return handle:query(query, params)
end

local function count_nodes(handle: any, store_id: any, opts: kb10.BrowseNodesOptions)
    local clause, params = browse_filter(store_id, opts)
    local rows, err = handle:query("SELECT COUNT(*) AS total" .. clause, params)
    if err then return nil, err end
    return tonumber(rows[1].total)
end

local function browse_options(opts: any): kb10.BrowseNodesOptions
    return (type(opts) == "table" and opts or {}) :: kb10.BrowseNodesOptions
end

function reader.browse_nodes(store_id: any, opts: any)
    local db, err = ops.get_db()
    if err then return nil, err end
    local rows, query_err = read_nodes(db, ops.get_db_type(db), store_id, browse_options(opts))
    db:release()
    if query_err then return nil, query_err end
    rows = rows or {}
    ops.decode_metadata(rows)
    return rows
end

function reader.browse_page(store_id: any, opts: any)
    local db, err = ops.get_db()
    if err then return nil, err end
    local db_type = ops.get_db_type(db)
    local options = browse_options(opts)
    -- A concurrent insert or deletion must affect both the rows and the total together.
    local tx, begin_err = db:begin({ isolation = sql.isolation.REPEATABLE_READ, read_only = true })
    if begin_err then
        db:release()
        return nil, begin_err
    end
    local rows, query_err = read_nodes(tx, db_type, store_id, options)
    local total
    if not query_err then total, query_err = count_nodes(tx, store_id, options) end
    local _, finish_err
    if query_err then _, finish_err = tx:rollback() else _, finish_err = tx:commit() end
    db:release()
    if query_err or finish_err then return nil, query_err or finish_err end
    rows = rows or {}
    ops.decode_metadata(rows)
    return { nodes = rows, total = total }
end

function reader.count_nodes(store_id: any, opts: any)
    local db, err = ops.get_db()
    if err then return nil, err end
    local total, count_err = count_nodes(db, store_id, browse_options(opts))
    db:release()
    return total, count_err
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

function reader.find_by_external_id(store_id: any, external_source: any, external_id: any)
    if not store_id or not external_id then
        return nil, errors.new({ message = "store_id and external_id are required", kind = errors.INVALID })
    end
    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type, type_err = ops.get_db_type(db)
    if type_err then db:release(); return nil, type_err end
    local rows, query_err = ops.find_source_nodes_tx(db, db_type, store_id, external_source, external_id)
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
