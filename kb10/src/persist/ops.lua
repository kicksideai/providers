-- ops: cross-cutting helpers shared by the kb10 reader and writer. Owns the
-- connection acquisition + dialect resolution against the configured target_db, the vector literal
-- encoder and IN-clause placeholder builder (from kickside.search_index), and in-place metadata decoding.
-- Reads and writes both go through these so connection/dialect handling stays in
-- one place; each public method in reader/writer acquires a connection here,
-- runs its query, and releases it.

local sql = require("sql")
local json = require("json")
local registry = require("registry")
local search_index = require("search_index")

local ops = { _modules = {} }

local DB_CONFIG = "kickside.kb10:db_config"

local function mod(name: string): any
    if type(ops._modules) == "table" and ops._modules[name] ~= nil then return ops._modules[name] end
    if name == "sql" then return sql end
    if name == "registry" then return registry end
    return nil
end

function ops.db_id(): string
    local entry, err = (mod("registry") :: any).get(DB_CONFIG)
    if not err and type(entry) == "table" then
        local meta: any = (entry :: any).meta or {}
        if type(meta.db_id) == "string" and meta.db_id ~= "" then return meta.db_id end
    end
    error("kickside.kb10:target_db was not linked into kickside.kb10:db_config")
end

-- Acquire a pooled connection to the kb10 tables' database. The caller releases.
function ops.get_db()
    local db, err = (mod("sql") :: any).get(ops.db_id())
    if err then return nil, errors.wrap(err, "failed to connect to database") end
    return db
end

-- Resolve the dialect of an acquired connection so callers can branch between
-- the SQLite (vec0/fts5) and PostgreSQL (pgvector) code paths.
function ops.get_db_type(db: any)
    local db_type, err = db:type()
    if err then return nil, errors.wrap(err, "failed to get database type") end
    return db_type
end

-- Vector literal and IN-clause placeholders come from the shared search index
-- library, so kb10's writes and its searches encode identically.
ops.vector_to_string = search_index.vector_literal
ops.placeholders = search_index.placeholders

local function trim_source_part(value: any): string
    if type(value) ~= "string" then return "" end
    local first = value:find("%S")
    if not first then return "" end
    local last = #value
    while last > first and value:find("%s", last) == last do
        last = last - 1
    end
    return value:sub(first, last)
end

function ops.normalize_source_key(source: any, id: any): (string, string)
    return trim_source_part(source), trim_source_part(id)
end

function ops.source_key(metadata: any): (string?, string?)
    if type(metadata) ~= "table" then return nil, nil end
    local source, id = ops.normalize_source_key(metadata.external_source, metadata.external_id)
    if source == "" or id == "" then return nil, nil end
    return source, id
end

function ops.source_thread(metadata: any): string?
    local ref = type(metadata) == "table" and metadata.source_ref
    local thread = type(ref) == "table" and ref.thread_id
    if type(thread) == "string" and thread ~= "" then return thread end
    thread = type(metadata) == "table" and metadata.thread_id
    if type(thread) == "string" and thread ~= "" then return thread end
    return nil
end

local function source_key_expression(db_type: any, store: string, source: string, id: string, lineage: string?): string
    local fields = store .. ", " .. source .. ", " .. id
    if lineage then fields = fields .. ", " .. lineage end
    if db_type == sql.type.POSTGRES then
        return "ROW(" .. fields .. ")::" .. (lineage and "kb10_source_key" or "kb10_source_pair")
    end
    return "(" .. fields .. ")"
end

ops.SOURCE_ROOT = "node_type = 'document' AND parent_id IS NULL"
ops.SOURCE_BOUND = "external_source IS NOT NULL AND external_id IS NOT NULL"

function ops.source_root_key(db_type: any, alias: string?): string
    local prefix = alias and alias .. "." or ""
    return source_key_expression(db_type, prefix .. "store_id", prefix .. "external_source", prefix .. "external_id",
        "COALESCE(" .. prefix .. "source_lineage, '')")
end

function ops.source_root_value(db_type: any, store: string, source: string, id: string, lineage: string): string
    return source_key_expression(db_type, store, source, id, "COALESCE(" .. lineage .. ", '')")
end

function ops.source_metadata_columns(db_type: any, column: string?): (string, string)
    local metadata = column or "metadata"
    if db_type == sql.type.POSTGRES then
        local whitespace = [[E'\011\012\013\014\015 ']]
        return "btrim(" .. metadata .. "->>'external_source', " .. whitespace .. ")",
            "btrim(" .. metadata .. "->>'external_id', " .. whitespace .. ")"
    end
    local whitespace = "char(9,10,11,12,13,32)"
    return "trim(json_extract(" .. metadata .. ", '$.external_source'), " .. whitespace .. ")",
        "trim(json_extract(" .. metadata .. ", '$.external_id'), " .. whitespace .. ")"
end

function ops.source_thread_column(db_type: any, metadata: string): string
    local function value(path: string, postgres_path: string, type_only: boolean?): string
        if db_type == sql.type.POSTGRES then
            local extract = metadata .. (type_only and "#>" or "#>>") .. "'{" .. postgres_path .. "}'"
            return type_only and "jsonb_typeof(" .. extract .. ")" or "(" .. extract .. ') COLLATE "C"'
        end
        return (type_only and "json_type(" or "json_extract(") .. metadata .. ", '$." .. path .. "')"
    end
    local function thread(path: string, postgres_path: string): string
        local id = value(path, postgres_path)
        local strings = db_type == sql.type.POSTGRES and "'string'" or "'text'"
        return "CASE WHEN " .. value(path, postgres_path, true) .. " = " .. strings ..
            " THEN NULLIF(" .. id .. ", '') END"
    end
    return "COALESCE(" .. thread("source_ref.thread_id", "source_ref,thread_id") ..
        ", " .. thread("thread_id", "thread_id") .. ")"
end

local function source_lookup(db_type: any, roots: boolean)
    local source, id = ops.source_metadata_columns(db_type)
    local lineage
    local predicate = "NOT (" .. ops.SOURCE_ROOT .. ") AND "
    if roots then
        source = "COALESCE(external_source, " .. source .. ")"
        id = "COALESCE(external_id, " .. id .. ")"
        lineage = "COALESCE(CASE WHEN external_source IS NULL THEN " ..
            ops.source_thread_column(db_type, "metadata") .. " ELSE source_lineage END, '')"
        predicate = ops.SOURCE_ROOT .. " AND "
    end
    predicate = predicate .. source .. " IS NOT NULL AND " .. id .. " IS NOT NULL"
    return source, id, lineage, predicate
end

function ops.source_lookup_index(db_type: any, roots: boolean): (string, string)
    local source, id, lineage, predicate = source_lookup(db_type, roots)
    if db_type == sql.type.POSTGRES then
        local key = source_key_expression(db_type, "store_id", source, id)
        if not lineage then return "USING hash ((" .. key .. "))", predicate end
        -- Fixed-width index keys admit long external IDs. The lookup also compares
        -- the original values, so hash collisions do not change membership.
        return "(hash_record(" .. key .. '), hashtext((' .. lineage .. ') COLLATE "C"))', predicate
    end
    local columns = "store_id, " .. source .. ", " .. id
    if lineage then columns = columns .. ", " .. lineage end
    return "(" .. columns .. ")", predicate
end

local function source_filter(db_type: any, roots: boolean, scoped: boolean?): (string, string?)
    local source, id, lineage, predicate = source_lookup(db_type, roots)
    local key = source_key_expression(db_type, "store_id", source, id)
    local value = source_key_expression(db_type, "$1", "$2", "$3")
    local filter = predicate .. " AND " .. key .. " = " .. value
    if roots and db_type == sql.type.POSTGRES then
        filter = filter .. " AND hash_record(" .. key .. ") = hash_record(" .. value .. ")"
    end
    if scoped and lineage then
        if db_type == sql.type.POSTGRES then
            lineage = "(" .. lineage .. ') COLLATE "C"'
            filter = filter .. " AND hashtext(" .. lineage .. ') = hashtext($4::text COLLATE "C")'
        end
        filter = filter .. " AND " .. lineage .. " = $4"
    end
    return filter, lineage
end

function ops.find_source_nodes_tx(tx: any, db_type: any, store_id: any, source: any, id: any)
    source, id = ops.normalize_source_key(source, id)
    local select = "SELECT id, store_id, parent_id, node_type, content, content_type, metadata FROM kb10_nodes WHERE "
    local roots = source_filter(db_type, true)
    return tx:query(select .. roots .. " UNION ALL " .. select .. source_filter(db_type, false),
        {store_id, source, id})
end

function ops.source_lineage_conflict()
    return errors.new({kind = errors.CONFLICT, message = "source identity belongs to more than one lineage"})
end

function ops.find_source_roots_tx(tx: any, db_type: any, store_id: any, source: any, id: any, lineage: string?)
    source, id = ops.normalize_source_key(source, id)
    local filter, owner = source_filter(db_type, true, lineage ~= nil)
    return tx:query("SELECT id, " .. owner .. " AS lineage FROM kb10_nodes WHERE " .. filter,
        {store_id, source, id, lineage})
end

function ops.find_source_root_tx(tx: any, db_type: any, store_id: any, source: any, id: any, lineage: string?)
    source, id = ops.normalize_source_key(source, id)
    local rows, err = tx:query("SELECT id FROM kb10_nodes WHERE " .. ops.SOURCE_BOUND ..
        " AND " .. ops.source_root_key(db_type) .. " = " .. ops.source_root_value(db_type, "$1", "$2", "$3", "$4"),
        {store_id, source, id, lineage or ""})
    if err then return nil, errors.wrap(err, "failed to find prior document") end
    return rows[1] and tostring(rows[1].id), nil
end

-- Decode each row's metadata json blob into a table, in place.
function ops.decode_metadata(rows: any)
    if not rows then return end
    for i = 1, #rows do
        local row = rows[i]
        if row.metadata and type(row.metadata) == "string" then
            local parsed, parse_err = json.decode(row.metadata)
            row.metadata = parse_err and {} or parsed
        elseif not row.metadata then
            row.metadata = {}
        end
    end
end

ops.VECTOR_DIMENSIONS = search_index.VECTOR_DIMENSIONS

return ops
