-- Hybrid search primitives over tables a caller module owns. The caller passes
-- an open connection and a table spec; this library builds and runs the
-- dialect-specific vector (SQLite vec0, PostgreSQL pgvector) and full-text
-- (SQLite fts5, PostgreSQL tsvector) statements and fuses their rankings.
-- It owns no schema and no connection.

local sql = require("sql")
local json = require("json")

type Filter = {
    column: string,
    values: { any },
    table: string?,
}

type Spec = {
    vectors: string,
    vector_key: string,
    vector_column: string?,
    rows: string,
    row_key: string,
    partition: string,
    columns: { string },
    fts: string,
    fts_key: string,
    tsvector: string,
    json_columns: { string }?,
}

type SearchOptions = {
    partition: any,
    limit: integer?,
    filters: { Filter }?,
    query_text: string?,
}

local index = {}

index.VECTOR_DIMENSIONS = 512

-- vec0 resolves the k nearest neighbors in the partition first and applies the
-- remaining WHERE filters to that set, so a filtered SQLite search over-fetches
-- k and trims to the limit. The cap bounds the worst-case KNN scan.
local VECTOR_OVERFETCH_FACTOR = 8
local VECTOR_OVERFETCH_MAX = 500

-- Lexical ranks weigh three times a dense rank when the query carries a
-- digit-bearing term, which anchors identifiers.
local ANCHORED_LEXICAL_WEIGHT = 3

-- Encode a vector as the "[a,b,c]" literal both vec0 and pgvector accept.
function index.vector_literal(vec: { number }): string
    return "[" .. table.concat(vec, ",") .. "]"
end

-- "$start,...,$start+n-1": numbered placeholders bind positionally on both
-- PostgreSQL and SQLite.
function index.placeholders(n: number, start: number?): string
    local s = start or 1
    local parts: { string } = {}
    for i = 0, n - 1 do parts[i + 1] = "$" .. tostring(s + i) end
    return table.concat(parts, ",")
end

function index.is_sqlite(db: any): (boolean?, any?)
    local db_type, err = db:type()
    if err then return nil, errors.wrap(err, "failed to get database type") end
    return db_type == sql.type.SQLITE, nil
end

-- Multi-row INSERT in batches that stay under SQLite's 999-parameter floor.
function index.insert_rows_tx(tx: any, table_name: string, columns: { string }, rows: { any }): any?
    if #rows == 0 then return nil end
    local batch_size = math.min(100, math.floor(999 / #columns))
    for first = 1, #rows, batch_size do
        local values: { string } = {}
        local args: { any } = {}
        for i = first, math.min(first + batch_size - 1, #rows) do
            local offset = (i - first) * #columns
            values[#values + 1] = "(" .. index.placeholders(#columns, offset + 1) .. ")"
            for j = 1, #columns do args[offset + j] = rows[i][j] end
        end
        local _, err = tx:execute("INSERT INTO " .. table_name .. " (" .. table.concat(columns, ", ") ..
            ") VALUES " .. table.concat(values, ", "), args)
        if err then return err end
    end
    return nil
end

local function decode_json_columns(spec: Spec, rows: { any })
    local cols = spec.json_columns
    if not cols then return end
    for _, row in ipairs(rows) do
        for _, col in ipairs(cols) do
            local value = row[col]
            if type(value) == "string" then
                local parsed, parse_err = json.decode(value)
                row[col] = (parse_err or type(parsed) ~= "table") and {} or parsed
            elseif value == nil then
                row[col] = {}
            end
        end
    end
end

local function row_select(spec: Spec, alias_rows: string, alias_vectors: string?): string
    local fields: { string } = {}
    if alias_vectors then
        fields[1] = alias_vectors .. "." .. spec.vector_key .. " AS id"
    else
        fields[1] = alias_rows .. "." .. spec.row_key .. " AS id"
    end
    for _, col in ipairs(spec.columns) do
        fields[#fields + 1] = alias_rows .. "." .. col
    end
    return table.concat(fields, ", ")
end

-- Appends " AND <alias>.<column> IN (...)" clauses; returns the next free index.
local function append_filters(query: string, params: { any }, idx: integer, filters: { Filter }?, aliases: { [string]: string }): (string, integer)
    if not filters then return query, idx end
    for _, filter in ipairs(filters) do
        local values = filter.values
        if values and #values > 0 then
            local alias = aliases[filter.table or "rows"]
            if #values == 1 then
                idx = idx + 1
                query = query .. " AND " .. alias .. "." .. filter.column .. " = $" .. idx
                params[#params + 1] = values[1]
            else
                query = query .. " AND " .. alias .. "." .. filter.column .. " IN (" .. index.placeholders(#values, idx + 1) .. ")"
                for _, v in ipairs(values) do params[#params + 1] = v end
                idx = idx + #values
            end
        end
    end
    return query, idx
end

local function has_filters(filters: { Filter }?): boolean
    if not filters then return false end
    for _, filter in ipairs(filters) do
        if filter.values and #filter.values > 0 then return true end
    end
    return false
end

-- Nearest rows by vector distance. Each row carries `similarity` in [0, 1]:
-- exp(-distance) for vec0 L2, 1 - cosine_distance/2 for pgvector.
function index.dense_search(db: any, spec: Spec, query_vector: { number }, opts: SearchOptions): (any, any?)
    local limit = opts.limit or 10
    local sqlite, type_err = index.is_sqlite(db)
    if type_err then return nil, type_err end
    local vector_column = spec.vector_column or "embedding"
    local aliases = { vectors = "e", rows = "n" }
    local params: { any }
    local idx: integer
    local query: string
    if sqlite then
        local knn_k = limit
        if has_filters(opts.filters) then
            knn_k = math.min(limit * VECTOR_OVERFETCH_FACTOR, VECTOR_OVERFETCH_MAX)
        end
        query = "SELECT " .. row_select(spec, "n", "e") .. ", e.distance AS vector_distance" ..
            " FROM " .. spec.vectors .. " e JOIN " .. spec.rows .. " n ON n." .. spec.row_key .. " = e." .. spec.vector_key ..
            " WHERE e." .. vector_column .. " MATCH $1 AND e." .. spec.partition .. " = $2 AND e.k = $3"
        params = { index.vector_literal(query_vector), opts.partition, knn_k }
        idx = 3
        query, idx = append_filters(query, params, idx, opts.filters, aliases)
        idx = idx + 1
        query = query .. " ORDER BY e.distance LIMIT $" .. idx
    else
        query = "SELECT " .. row_select(spec, "n", nil) ..
            ", e." .. vector_column .. " <=> ('" .. index.vector_literal(query_vector) .. "'::vector) AS vector_distance" ..
            " FROM " .. spec.rows .. " n JOIN " .. spec.vectors .. " e ON n." .. spec.row_key .. " = e." .. spec.vector_key ..
            " WHERE n." .. spec.partition .. " = $1"
        params = { opts.partition }
        idx = 1
        query, idx = append_filters(query, params, idx, opts.filters, aliases)
        idx = idx + 1
        query = query .. " ORDER BY vector_distance ASC LIMIT $" .. idx
    end
    params[#params + 1] = limit
    local rows, err = db:query(query, params)
    if err then return nil, err end
    rows = rows or {}
    for _, row in ipairs(rows) do
        local distance = tonumber(row.vector_distance) or 0
        row.similarity = sqlite and math.exp(-distance) or (1 - distance / 2)
        row.vector_distance = nil
    end
    decode_json_columns(spec, rows)
    return rows, nil
end

-- Query text never enters either engine's full-text grammar unquoted. Tokens are
-- OR-joined; digit-bearing tokens are additionally AND-required as anchors.
function index.lexical_query(text: string, sqlite: boolean): (string?, boolean)
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

-- Rows matching the query text, best first (bm25 on SQLite, ts_rank on
-- PostgreSQL). Returns rows, error, and whether the query was anchored.
function index.lexical_search(db: any, spec: Spec, query_text: string, opts: SearchOptions): (any, any?, boolean)
    local sqlite, type_err = index.is_sqlite(db)
    if type_err then return nil, type_err, false end
    local match, anchored = index.lexical_query(query_text, sqlite :: boolean)
    if not match then return {}, nil, false end
    local query = "SELECT " .. row_select(spec, "n", nil)
    if sqlite then
        query = query .. " FROM " .. spec.fts .. " JOIN " .. spec.rows .. " n ON n." .. spec.row_key .. " = " .. spec.fts .. "." .. spec.fts_key ..
            " WHERE " .. spec.fts .. " MATCH $1 AND n." .. spec.partition .. " = $2"
    else
        query = query .. " FROM " .. spec.rows .. " n WHERE n." .. spec.tsvector .. " @@ to_tsquery('simple', $1) AND n." .. spec.partition .. " = $2"
    end
    local params: { any } = { match, opts.partition }
    local idx = 2
    query, idx = append_filters(query, params, idx, opts.filters, { rows = "n", vectors = "n" })
    if sqlite then
        query = query .. " ORDER BY bm25(" .. spec.fts .. "), n." .. spec.row_key
    else
        query = query .. " ORDER BY ts_rank(n." .. spec.tsvector .. ", to_tsquery('simple', $1), 32) DESC, n." .. spec.row_key
    end
    query = query .. " LIMIT $" .. (idx + 1)
    params[#params + 1] = opts.limit or 10
    local rows, err = db:query(query, params)
    if err then return nil, err, anchored end
    rows = rows or {}
    decode_json_columns(spec, rows)
    return rows, nil, anchored
end

-- Reciprocal-rank fusion of a dense and a lexical ranking by row id. Each
-- returned row keeps `vector_similarity`, `vector_rank`, `lexical_rank`,
-- `hybrid_score`, and a normalized `similarity`.
function index.fuse(dense: { any }, lexical: { any }, limit: integer, anchored: boolean): { any }
    local by_id, rows = {}, {}
    local lexical_weight = anchored and ANCHORED_LEXICAL_WEIGHT or 1
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

-- One retrieval entry point. Without query text it is a dense search. With
-- query text, lexical and dense candidates (max(50, 4 * limit) each) are fused;
-- when nothing matches lexically the dense ranking is returned unchanged.
function index.search(db: any, spec: Spec, query_vector: { number }, opts: SearchOptions): (any, any?)
    if not opts.query_text or opts.query_text == "" then
        return index.dense_search(db, spec, query_vector, opts)
    end
    local limit = opts.limit or 10
    local expanded: SearchOptions = {
        partition = opts.partition, limit = math.max(50, limit * 4), filters = opts.filters,
    }
    local lexical, lex_err, anchored = index.lexical_search(db, spec, opts.query_text :: string, expanded)
    if lex_err then return nil, errors.wrap(lex_err, "lexical search failed") end
    if #lexical == 0 then return index.dense_search(db, spec, query_vector, opts) end
    local dense, vector_err = index.dense_search(db, spec, query_vector, expanded)
    if vector_err then return nil, vector_err end
    return index.fuse(dense, lexical, limit, anchored), nil
end

return index
