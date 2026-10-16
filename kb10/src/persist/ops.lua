-- ops: cross-cutting helpers shared by the kb10 reader and writer. Owns the
-- connection acquisition + dialect resolution against the configured target_db, the vector literal
-- encoder, the IN-clause placeholder builder, and in-place metadata decoding.
-- Reads and writes both go through these so connection/dialect handling stays in
-- one place; each public method in reader/writer acquires a connection here,
-- runs its query, and releases it.

local sql = require("sql")
local json = require("json")
local registry = require("registry")

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

-- Encode an embedding vector as the "[a,b,c]" literal both vec0 and pgvector
-- accept.
function ops.vector_to_string(vec: any)
    return "[" .. table.concat(vec, ",") .. "]"
end

-- Build a "$start,$start+1,...,$start+n-1" placeholder list for an IN (...)
-- clause, where `start` is the 1-based position of the first of these
-- parameters within the full statement (default 1). Numbered "$N" placeholders
-- bind positionally on both PostgreSQL and SQLite (mattn/go-sqlite3), so a single
-- numbered style is correct for both dialects — no per-dialect branching needed.
function ops.placeholders(n: number, start: number?): string
    local s = start or 1
    local parts: { string } = {}
    for i = 0, n - 1 do parts[i + 1] = "$" .. tostring(s + i) end
    return table.concat(parts, ",")
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

ops.VECTOR_DIMENSIONS = 512

return ops
