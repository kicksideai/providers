-- Read side of the kb10 persistence layer. Every method acquires a pooled
-- connection through ops, runs a SELECT against the kb10_* tables, releases the
-- connection, and returns rows as values. No writes. Connection acquisition and
-- dialect resolution, the IN-clause placeholder builder, and in-place metadata
-- decoding are shared with the writer through the ops library.

local sql = require("sql")
local json = require("json")
local ops = require("kb10_ops")
local kb10 = require("kb10")

local reader = {}

-- vec0 KNN resolves k nearest THEN applies SQL filters, so a filtered SQLite
-- vector search must over-fetch k and trim to limit afterward to still return
-- a full page of matching rows. The cap bounds worst-case KNN scan cost.
local VECTOR_OVERFETCH_FACTOR = 8
local VECTOR_OVERFETCH_MAX = 500

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

local function dense_search(store_id: any, query_vector: any, opts: any)
    local search_opts = (type(opts) == "table" and opts or {}) :: kb10.VectorSearchOptions
    local limit = search_opts.limit or 10
    local node_types = search_opts.node_types
    local parent_id = search_opts.parent_id

    local db, err = ops.get_db()
    if err then return nil, err end

    local db_type = ops.get_db_type(db)
    local results

    if db_type == sql.type.SQLITE then
        local select_fields = {
            "e.node_id as id",
            "e.store_id",
            "e.node_type",
            "e.parent_id",
            "e.distance",
            "n.content",
            "n.content_type",
            "n.metadata",
            "n.created_at",
            "n.updated_at"
        }

        local has_filter = (node_types and #node_types > 0) or (parent_id and parent_id ~= "")

        -- vec0 resolves the k nearest neighbors in the partition FIRST, then the
        -- WHERE filters trim that set — so a filtered search using k = limit
        -- under-returns (the limit nearest are mostly filtered out). Over-fetch
        -- k when filters are present, then trim to limit after filtering.
        local knn_k = limit
        if has_filter then
            knn_k = limit * VECTOR_OVERFETCH_FACTOR
            if knn_k > VECTOR_OVERFETCH_MAX then knn_k = VECTOR_OVERFETCH_MAX end
        end

        local query = "SELECT " .. table.concat(select_fields, ", ") ..
            " FROM kb10_embeddings e" ..
            " LEFT JOIN kb10_nodes n ON n.id = e.node_id" ..
            " WHERE e.embedding MATCH $1" ..
            " AND e.store_id = $2" ..
            " AND e.k = $3"

        local params = { ops.vector_to_string(query_vector), store_id, knn_k }
        local idx = 3

        if node_types and #node_types > 0 then
            if #node_types == 1 then
                idx = idx + 1
                query = query .. " AND e.node_type = $" .. idx
                table.insert(params, node_types[1])
            else
                for _, nt in ipairs(node_types) do table.insert(params, nt) end
                query = query .. " AND e.node_type IN (" .. ops.placeholders(#node_types, idx + 1) .. ")"
                idx = idx + #node_types
            end
        end

        if parent_id and parent_id ~= "" then
            idx = idx + 1
            query = query .. " AND e.parent_id = $" .. idx
            table.insert(params, parent_id)
        end

        idx = idx + 1
        query = query .. " ORDER BY e.distance LIMIT $" .. idx
        table.insert(params, limit)

        results, err = db:query(query, params)
        if results then
            for i = 1, #results do
                local row = results[i]
                if row.distance then
                    row.similarity = math.exp(-(tonumber(row.distance) or 0))
                    row.distance = nil
                end
            end
        end
    else
        local select_fields = {
            "n.id",
            "n.store_id",
            "n.node_type",
            "n.parent_id",
            "n.content",
            "n.content_type",
            "n.metadata",
            "n.created_at",
            "n.updated_at",
            "e.embedding <=> ('" .. ops.vector_to_string(query_vector) .. "'::vector) as vector_distance"
        }

        local query = "SELECT " .. table.concat(select_fields, ", ") ..
            " FROM kb10_nodes n" ..
            " JOIN kb10_embeddings e ON n.id = e.node_id" ..
            " WHERE n.store_id = $1"

        local params = { store_id }
        local idx = 1

        if node_types and #node_types > 0 then
            if #node_types == 1 then
                idx = idx + 1
                query = query .. " AND n.node_type = $" .. idx
                table.insert(params, node_types[1])
            else
                for _, nt in ipairs(node_types) do table.insert(params, nt) end
                query = query .. " AND n.node_type IN (" .. ops.placeholders(#node_types, idx + 1) .. ")"
                idx = idx + #node_types
            end
        end

        if parent_id and parent_id ~= "" then
            idx = idx + 1
            query = query .. " AND n.parent_id = $" .. idx
            table.insert(params, parent_id)
        end

        idx = idx + 1
        query = query .. " ORDER BY vector_distance ASC LIMIT $" .. idx
        table.insert(params, limit)

        results, err = db:query(query, params)
        if results then
            for i = 1, #results do
                local row = results[i]
                if row.vector_distance then
                    row.similarity = 1 - (row.vector_distance / 2)
                    row.vector_distance = nil
                end
            end
        end
    end

    db:release()

    if err then return nil, err end

    if results then
        for i = 1, #results do
            local row = results[i]
            if row.metadata and type(row.metadata) == "string" then
                local parsed, parse_err = json.decode(row.metadata)
                row.metadata = parse_err and {} or parsed
            elseif not row.metadata then
                row.metadata = {}
            end
        end
    end

    return results or {}
end

-- Query text never enters either engine's FTS grammar unquoted. Word boundaries
-- match the upgraded indexes; digit-bearing terms anchor arbitrary identifiers,
-- while the remaining terms rank their surrounding attributes and prose.
local function lexical_query(text: string, sqlite: boolean): (string?, boolean)
    local terms, anchors, seen = {}, {}, {}
    for token in text:lower():gmatch("[%w\128-\255]+") do
        if not seen[token] then
            seen[token] = true
            local quoted = sqlite and ('"' .. token .. '"') or ("'" .. token:gsub("'", "''") .. "'")
            terms[#terms + 1] = quoted
            if token:find("%d") then anchors[#anchors + 1] = quoted end
            if #terms >= 64 then break end
        end
    end
    if #terms == 0 then return nil, false end
    local or_op, and_op = sqlite and " OR " or " | ", sqlite and " AND " or " & "
    local query = "(" .. table.concat(terms, or_op) .. ")"
    if #anchors > 0 then query = "(" .. table.concat(anchors, and_op) .. ")" .. and_op .. query end
    return query, #anchors > 0
end

local function lexical_search(store_id: any, query_text: string, opts: kb10.VectorSearchOptions): (any, any, boolean)
    local db, err = ops.get_db()
    if err then return nil, err, false end
    local sqlite = ops.get_db_type(db) == sql.type.SQLITE
    local match, anchored = lexical_query(query_text, sqlite)
    if not match then db:release(); return {}, nil, false end
    local query = "SELECT n.id, n.store_id, n.node_type, n.parent_id, n.content, n.content_type, n.metadata, n.created_at, n.updated_at"
    if sqlite then
        query = query .. " FROM kb10_nodes_fts JOIN kb10_nodes n ON n.id = kb10_nodes_fts.node_id WHERE kb10_nodes_fts MATCH $1 AND n.store_id = $2"
    else
        query = query .. " FROM kb10_nodes n WHERE n.search_vector @@ to_tsquery('simple', $1) AND n.store_id = $2"
    end
    local params: { any } = { match, store_id }
    local idx = 2
    if opts.node_types and #opts.node_types > 0 then
        query = query .. " AND n.node_type IN (" .. ops.placeholders(#opts.node_types, idx + 1) .. ")"
        for _, nt in ipairs(opts.node_types) do params[#params + 1] = nt end
        idx = idx + #opts.node_types
    end
    if opts.parent_id and opts.parent_id ~= "" then
        idx = idx + 1
        query = query .. " AND n.parent_id = $" .. idx
        params[#params + 1] = opts.parent_id
    end
    query = query .. (sqlite and " ORDER BY bm25(kb10_nodes_fts), n.id" or " ORDER BY ts_rank(n.search_vector, to_tsquery('simple', $1), 32) DESC, n.id")
    query = query .. " LIMIT $" .. (idx + 1)
    params[#params + 1] = opts.limit or 10
    local rows, query_err = db:query(query, params)
    db:release()
    if query_err then return nil, query_err, anchored end
    ops.decode_metadata(rows)
    return rows or {}, nil, anchored
end

-- One retrieval entry point, used by query_func and internal concept retrieval.
-- Vector-only callers retain their existing semantics. Query-bearing callers
-- fuse candidates from the maintained lexical index and vector index by node
-- id before applying the requested limit; no document-summary gate can discard
-- a lexical-only passage. Missing embeddings do not hide indexed text.
function reader.vector_search(store_id: any, query_vector: any, opts: any)
    local options = (type(opts) == "table" and opts or {}) :: kb10.VectorSearchOptions
    if not options.query_text or options.query_text == "" then
        return dense_search(store_id, query_vector, options)
    end
    local limit = options.limit or 10
    local candidates = math.max(50, limit * 4)
    local expanded: kb10.VectorSearchOptions = {
        limit = candidates, node_types = options.node_types, parent_id = options.parent_id,
    }
    local lexical, lex_err, anchored = lexical_search(store_id, options.query_text, expanded)
    if lex_err then return nil, errors.wrap(lex_err, "lexical search failed") end
    if #lexical == 0 then return dense_search(store_id, query_vector, options) end
    local dense, vector_err = dense_search(store_id, query_vector, expanded)
    if vector_err then return nil, vector_err end
    local by_id, rows = {}, {}
    local lexical_weight = anchored and 3 or 1
    for rank, row in ipairs(dense) do
        row.vector_similarity = row.similarity
        row.vector_rank = rank
        row.hybrid_score = 1 / (10 + rank)
        by_id[row.id] = row
        rows[#rows + 1] = row
    end
    for rank, row in ipairs(lexical) do
        local found = by_id[row.id]
        if not found then
            found = row
            found.hybrid_score = 0
            by_id[row.id] = found
            rows[#rows + 1] = found
        end
        found.lexical_rank = rank
        found.hybrid_score = found.hybrid_score + lexical_weight / (10 + rank)
    end
    table.sort(rows, function(a, b)
        if a.hybrid_score ~= b.hybrid_score then return a.hybrid_score > b.hybrid_score end
        return a.id < b.id
    end)
    local results = {}
    for i = 1, math.min(limit, #rows) do
        local row = rows[i]
        row.similarity = row.hybrid_score * 11 / (1 + lexical_weight)
        results[#results + 1] = row
    end
    return results
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
