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
