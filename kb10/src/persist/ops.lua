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
local trim = require("text_trim").trim

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

ops.SOURCE_BOUND = "source_scope IS NOT NULL"

function ops.document_root_sql(prefix: string?): string
    local p = prefix or ""
    return p .. "node_type = 'document' AND " .. p .. "parent_id IS NULL"
end

ops.SOURCE_ROOT = ops.document_root_sql()

function ops.failed_document_sql(db_type: any, prefix: string?): string
    local metadata = (prefix or "") .. "metadata"
    if db_type == sql.type.SQLITE then
        return "(CASE WHEN json_valid(" .. metadata .. ") THEN COALESCE(json_extract(" .. metadata ..
            ", '$.status') = 'failed', false) ELSE false END)"
    end
    return "COALESCE(" .. metadata .. "->>'status' = 'failed', false)"
end

function ops.source_binding(component_id: string?, source: any, id: any, source_thread: string?)
    source, id = trim(source), trim(id)
    if source == "" or id == "" then return nil end
    return {
        source_scope = source_thread ~= component_id and source_thread or "",
        external_source = source,
        external_id = id,
    }
end

function ops.legacy_source_binding(component_id: string?, metadata: any)
    if type(metadata) ~= "table" then return nil, nil end
    local ref = type(metadata.source_ref) == "table" and metadata.source_ref or {}
    local thread = ref.thread_id
    if type(thread) ~= "string" or thread == "" then thread = metadata.thread_id end
    local binding = ops.source_binding(component_id, metadata.external_source, metadata.external_id,
        type(thread) == "string" and thread or nil)
    return binding, binding and binding.external_source == metadata.external_source
        and binding.external_id == metadata.external_id
end

local function index_tuple(db_type: any, fields: string, pg_type: string): string
    if db_type == sql.type.POSTGRES then return "ROW(" .. fields .. ")::" .. pg_type end
    return "(" .. fields .. ")"
end

function ops.source_root_key(db_type: any, prefix: string?): string
    local p = prefix or ""
    return index_tuple(db_type, p .. "store_id, " .. p .. "source_scope, " ..
        p .. "external_source, " .. p .. "external_id", "kb10_source_key")
end

function ops.find_source_root_tx(tx: any, db_type: any, store_id: any, binding: any, expected_publication: string?)
    local args = {store_id, binding.source_scope, binding.external_source, binding.external_id}
    local version = ""
    if expected_publication ~= nil then
        local column = db_type == sql.type.POSTGRES and "metadata->>'upload_publication_id'"
            or "json_extract(metadata, '$.upload_publication_id')"
        version = " AND " .. column .. " = $5"
        args[5] = expected_publication
    end
    local rows, err = tx:query("SELECT id FROM kb10_nodes WHERE " .. ops.SOURCE_BOUND ..
        " AND " .. ops.source_root_key(db_type) .. " = " ..
        index_tuple(db_type, "$1, $2, $3, $4", "kb10_source_key") .. version, args)
    if err then return nil, errors.wrap(err, "failed to find source document") end
    return rows[1] and tostring(rows[1].id), nil
end

function ops.find_document_root_tx(tx: any, store_id: any, id: string)
    local rows, err = tx:query("SELECT id, external_source, external_id FROM kb10_nodes WHERE id = $1 AND store_id = $2 AND " ..
        ops.SOURCE_ROOT, {id, store_id})
    if err then return nil, errors.wrap(err, "failed to find selected document") end
    return rows[1], nil
end

-- Published member lookups match the external key in stored metadata byte for byte.
local function member_columns(db_type: any): (string, string)
    if db_type == sql.type.POSTGRES then
        return "metadata->>'external_source'", "metadata->>'external_id'"
    end
    return "json_extract(metadata, '$.external_source')", "json_extract(metadata, '$.external_id')"
end

function ops.source_member_key(db_type: any): (string, string)
    local source, id = member_columns(db_type)
    return index_tuple(db_type, "store_id, " .. source .. ", " .. id, "kb10_source_pair"),
        source .. " IS NOT NULL AND " .. id .. " IS NOT NULL"
end

function ops.find_source_nodes_tx(tx: any, db_type: any, store_id: any, source: any, id: any, documents: boolean?)
    local key, predicate = ops.source_member_key(db_type)
    local fields = documents and "id" or "id, store_id, parent_id, node_type, content, content_type, metadata"
    return tx:query("SELECT " .. fields .. " FROM kb10_nodes WHERE " .. predicate ..
        " AND " .. key .. " = " .. index_tuple(db_type, "$1, $2, $3", "kb10_source_pair") ..
        (documents and " AND node_type = 'document'" or ""), {store_id, source or "", id})
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
