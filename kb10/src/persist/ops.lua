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

function ops.source_key(metadata: any): (string?, string?)
    if type(metadata) ~= "table" then return nil, nil end
    local source, id = metadata.external_source, metadata.external_id
    if type(source) ~= "string" or source == "" or type(id) ~= "string" or id == "" then
        return nil, nil
    end
    return source, id
end

function ops.source_key_expression(db_type: any, store: string, source: string, id: string): string
    if db_type == sql.type.POSTGRES then
        return "ROW(" .. store .. ", " .. source .. ", " .. id .. ")::kb10_source_key"
    end
    return "(" .. store .. ", " .. source .. ", " .. id .. ")"
end

function ops.source_metadata_columns(db_type: any): (string, string)
    if db_type == sql.type.POSTGRES then
        return "(metadata->>'external_source')", "(metadata->>'external_id')"
    end
    return "json_extract(metadata, '$.external_source')", "json_extract(metadata, '$.external_id')"
end

local function source_filter(db_type: any, source: string, id: string): string
    return source .. " IS NOT NULL AND " .. id .. " IS NOT NULL AND " ..
        ops.source_key_expression(db_type, "store_id", source, id) .. " = " ..
        ops.source_key_expression(db_type, "$1", "$2", "$3")
end

function ops.find_source_root_tx(tx: any, db_type: any, store_id: any, source: any, id: any)
    local rows, err = tx:query("SELECT id FROM kb10_nodes WHERE " ..
        source_filter(db_type, "external_source", "external_id"), { store_id, source, id })
    if err then return nil, err end
    return rows[1] and tostring(rows[1].id), nil
end

function ops.find_source_nodes_tx(tx: any, db_type: any, store_id: any, source: any, id: any, documents_only: boolean?)
    local columns = "id, store_id, parent_id, node_type, content, content_type, metadata"
    local member_filter = "external_source IS NULL AND " .. source_filter(db_type, ops.source_metadata_columns(db_type))
    if documents_only then
        columns = "id"
        member_filter = member_filter .. " AND node_type = 'document'"
    end
    local select = "SELECT " .. columns .. " FROM kb10_nodes WHERE "
    return tx:query(select .. source_filter(db_type, "external_source", "external_id") .. " UNION ALL " ..
        select .. member_filter, { store_id, source, id })
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
