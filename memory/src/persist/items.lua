-- Typed memory items: the fold of ledger events into the read model, the reads
-- the engine, agent surfaces and API share, and hybrid search through the
-- shared search index.

local sql = require("sql")
local json = require("json")
local db = require("memory_db")
local types = require("types")
local index = require("search_index")

local M = {}

-- Marks a column that an event clears.
local NULL = {}

local COLUMNS = {
    "component_id", "kind", "scope_family", "scope_id", "scope_key", "key", "content", "value", "status",
    "version", "valid_at", "invalid_at", "recorded_at", "superseded_by", "conflict_group", "confidence",
    "source", "priority", "last_seq",
}

local SEARCH_SPEC = {
    vectors = "kickside_memory_embeddings",
    vector_key = "item_id",
    rows = "kickside_memory_items",
    row_key = "id",
    partition = "component_id",
    columns = COLUMNS,
    fts = "kickside_memory_fts",
    fts_key = "item_id",
    tsvector = "search_vector",
    json_columns = {},
}

local SELECT = "SELECT id, " .. table.concat(COLUMNS, ", ") .. " FROM kickside_memory_items"

local function decode(row: any): any
    if type(row.value) == "string" then
        row.value = types.decode_json(row.value)
    end
    row.version = tonumber(row.version) or 0
    row.priority = tonumber(row.priority) or 0
    row.last_seq = tonumber(row.last_seq) or 0
    if row.confidence ~= nil then row.confidence = tonumber(row.confidence) end
    return row
end

local function decode_all(rows: any): { any }
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do out[#out + 1] = decode(row) end
    return out
end

local function get_tx(tx: any, item_id: string): (any?, error?)
    local rows, err = tx:query(SELECT .. " WHERE id = $1", { item_id })
    if err then return nil, types.failed("memory item read failed", err) end
    if not rows or #rows == 0 then return nil, nil end
    return decode(rows[1]), nil
end

local function set_fts_tx(tx: any, sqlite: boolean, item_id: string, content: string?): error?
    if not sqlite then return nil end
    local _, del_err = tx:execute("DELETE FROM kickside_memory_fts WHERE item_id = $1", { item_id })
    if del_err then return types.failed("memory full-text delete failed", del_err) end
    if content and content ~= "" then
        local _, ins_err = tx:execute("INSERT INTO kickside_memory_fts (item_id, content) VALUES ($1, $2)", { item_id, content })
        if ins_err then return types.failed("memory full-text insert failed", ins_err) end
    end
    return nil
end

local function add_provenance_tx(tx: any, component_id: string, item_id: string, refs: any, recorded_at: string): error?
    for _, ref in ipairs(type(refs) == "table" and refs or {}) do
        if type(ref) == "table" and types.trim(ref.event_id) ~= "" then
            local _, err = tx:execute(
                "INSERT INTO kickside_memory_provenance (item_id, component_id, host_kind, host_id, event_id, recorded_at) " ..
                "VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
                { item_id, component_id, types.trim(ref.host_kind), types.trim(ref.host_id), types.trim(ref.event_id), recorded_at })
            if err then return types.failed("memory provenance insert failed", err) end
        end
    end
    return nil
end

local function set_status_tx(tx: any, item_id: string, seq: integer, fields: { [string]: any }): error?
    local sets: { string } = {}
    local params: { any } = {}
    for _, name in ipairs({ "status", "superseded_by", "invalid_at", "conflict_group" }) do
        if fields[name] == NULL then
            sets[#sets + 1] = name .. " = NULL"
        elseif fields[name] ~= nil then
            params[#params + 1] = fields[name]
            sets[#sets + 1] = name .. " = $" .. #params
        end
    end
    params[#params + 1] = seq
    sets[#sets + 1] = "last_seq = $" .. #params
    params[#params + 1] = item_id
    params[#params + 1] = seq
    local _, err = tx:execute("UPDATE kickside_memory_items SET " .. table.concat(sets, ", ") ..
        " WHERE id = $" .. (#params - 1) .. " AND last_seq < $" .. #params, params)
    if err then return types.failed("memory item update failed", err) end
    return nil
end

local function next_version_tx(tx: any, component_id: string, scope_key: string, kind: string, key: string): (integer?, error?)
    local rows, err = tx:query(
        "SELECT MAX(version) AS version FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND kind = $3 AND key = $4",
        { component_id, scope_key, kind, key })
    if err then return nil, types.failed("memory version read failed", err) end
    local current = rows and rows[1] and tonumber(rows[1].version) or 0
    return (current or 0) + 1, nil
end

local function apply_added(tx: any, sqlite: boolean, component_id: string, seq: integer, body: any, recorded_at: string): error?
    local item_id = types.trim(body.item_id)
    if item_id == "" then return types.invalid("item.added requires item_id") end
    local existing, read_err = get_tx(tx, item_id)
    if read_err then return read_err end
    if existing then
        return add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at)
    end
    local scope_key = types.scope_key(body.scope_family, body.scope_id)
    local key = types.normalize_key(body.key)
    local version, version_err = next_version_tx(tx, component_id, scope_key, body.kind, key)
    if version_err then return version_err end
    local value = body.value
    local _, err = tx:execute(
        "INSERT INTO kickside_memory_items (id, component_id, kind, scope_family, scope_id, scope_key, key, content, value, status, " ..
        "version, valid_at, recorded_at, confidence, source, priority, last_seq) " ..
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)",
        { item_id, component_id, body.kind, body.scope_family, body.scope_id, scope_key, key, body.content,
            value ~= nil and json.encode(value) or sql.NULL, types.STATUS.CURRENT, version, body.valid_at, recorded_at,
            tonumber(body.confidence) or sql.NULL, body.source, tonumber(body.priority) or 0, seq })
    if err then return types.failed("memory item insert failed", err) end
    local fts_err = set_fts_tx(tx, sqlite, item_id, body.content)
    if fts_err then return fts_err end
    return add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at)
end

-- A contested memory replaced by another keeps its contest: the successor
-- joins the predecessor's conflict group, unless the replacement is the
-- resolution of that group.
local function supersede_tx(tx: any, item_id: string, successor_id: string, seq: integer, invalid_at: string, resolution: boolean): error?
    local before, read_err = get_tx(tx, item_id)
    if read_err then return read_err end
    local err = set_status_tx(tx, item_id, seq, {
        status = types.STATUS.SUPERSEDED, superseded_by = successor_id, invalid_at = invalid_at,
    })
    if err then return err end
    if resolution or not before or before.status ~= types.STATUS.CONFLICT or not before.conflict_group then return nil end
    local successor, successor_err = get_tx(tx, successor_id)
    if successor_err then return successor_err end
    if not successor or successor.status ~= types.STATUS.CURRENT then return nil end
    return set_status_tx(tx, successor_id, seq, { status = types.STATUS.CONFLICT, conflict_group = before.conflict_group })
end

local function apply_event(tx: any, sqlite: boolean, component_id: string, event: any): error?
    local seq = math.floor(tonumber(event.seq) or 0) :: integer
    local body = type(event.body) == "table" and event.body or {}
    local recorded_at = types.utc(event.created_at) or types.now()
    local kind = event.type
    if kind == types.EVENT.ITEM_ADDED then
        return apply_added(tx, sqlite, component_id, seq, body, recorded_at)
    elseif kind == types.EVENT.ITEM_SUPERSEDED then
        return supersede_tx(tx, types.trim(body.item_id), types.trim(body.by), seq, body.invalid_at or recorded_at,
            types.trim(body.resolved_conflict) ~= "")
    elseif kind == types.EVENT.ITEM_MERGED then
        local into = types.trim(body.into)
        for _, item_id in ipairs(type(body.item_ids) == "table" and body.item_ids or {}) do
            local _, copy_err = tx:execute(
                "INSERT INTO kickside_memory_provenance (item_id, component_id, host_kind, host_id, event_id, recorded_at) " ..
                "SELECT $1, component_id, host_kind, host_id, event_id, recorded_at FROM kickside_memory_provenance WHERE item_id = $2 " ..
                "ON CONFLICT DO NOTHING", { into, item_id })
            if copy_err then return types.failed("memory provenance merge failed", copy_err) end
            local err = supersede_tx(tx, item_id, into, seq, recorded_at, false)
            if err then return err end
        end
        return nil
    elseif kind == types.EVENT.ITEM_CONFLICTED then
        for _, item_id in ipairs(type(body.item_ids) == "table" and body.item_ids or {}) do
            local err = set_status_tx(tx, item_id, seq, { status = types.STATUS.CONFLICT, conflict_group = body.group_id })
            if err then return err end
        end
        return nil
    elseif kind == types.EVENT.ITEM_FORGOTTEN then
        return set_status_tx(tx, types.trim(body.item_id), seq, { status = types.STATUS.FORGOTTEN, invalid_at = recorded_at })
    elseif kind == types.EVENT.ITEM_RESTORED then
        return set_status_tx(tx, types.trim(body.item_id), seq, {
            status = types.STATUS.CURRENT, invalid_at = NULL, superseded_by = NULL, conflict_group = NULL,
        })
    elseif kind == types.EVENT.PROVENANCE_ADDED then
        return add_provenance_tx(tx, component_id, types.trim(body.item_id), { body }, recorded_at)
    elseif kind == types.EVENT.PROVENANCE_REMOVED then
        local _, err = tx:execute(
            "DELETE FROM kickside_memory_provenance WHERE item_id = $1 AND host_kind = $2 AND host_id = $3 AND event_id = $4",
            { types.trim(body.item_id), types.trim(body.host_kind), types.trim(body.host_id), types.trim(body.event_id) })
        if err then return types.failed("memory provenance delete failed", err) end
        return nil
    elseif kind == types.EVENT.CAPTURE_ADVANCED then
        -- Capture moves the live cursor synchronously and ahead of its derive
        -- run; the ledger fact only restores a cursor the read model lost.
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_cursors (component_id, host_kind, host_id, agent_id, last_event_id, updated_at) " ..
            "VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (component_id, host_kind, host_id) DO NOTHING",
            { component_id, types.trim(body.host_kind), types.trim(body.host_id), types.trim(body.agent_id), types.trim(body.last_event_id), recorded_at })
        if err then return types.failed("memory cursor fold failed", err) end
        return nil
    end
    return nil
end

-- Folds ledger events into the read model in one fenced transaction. Each
-- item carries the sequence of the last event applied to it, so a redelivered
-- batch changes nothing.
function M.fold(component_id: string, events: { any }): (any?, error?)
    return db.write(component_id, function(tx: any, sqlite: boolean): (any, error?)
        for _, event in ipairs(events) do
            local err = apply_event(tx, sqlite, component_id, event)
            if err then return nil, err end
        end
        return true, nil
    end)
end

function M.get(component_id: string, item_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(SELECT .. " WHERE component_id = $1 AND id = $2", { component_id, item_id })
        if err then return nil, types.failed("memory item read failed", err) end
        if not rows or #rows == 0 then return nil, nil end
        return decode(rows[1]), nil
    end)
end

type ListFilter = {
    kinds: { string }?,
    statuses: { string }?,
    scope_keys: { string }?,
    scope_family: string?,
    key: string?,
    conflict_group: string?,
    limit: integer?,
    offset: integer?,
}

function M.list(component_id: string, filter: ListFilter): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local where: { string } = { "component_id = $1" }
        local params: { any } = { component_id }
        local function add_in(column: string, values: { string }?)
            if values and #values > 0 then
                where[#where + 1] = column .. " IN (" .. index.placeholders(#values, #params + 1) .. ")"
                for _, v in ipairs(values) do params[#params + 1] = v end
            end
        end
        local function add_eq(column: string, value: string?)
            if value and value ~= "" then
                params[#params + 1] = value
                where[#where + 1] = column .. " = $" .. #params
            end
        end
        add_in("kind", filter.kinds)
        add_in("status", filter.statuses)
        add_in("scope_key", filter.scope_keys)
        add_eq("scope_family", filter.scope_family)
        add_eq("key", filter.key)
        add_eq("conflict_group", filter.conflict_group)
        params[#params + 1] = filter.limit or 100
        params[#params + 1] = filter.offset or 0
        local rows, err = conn:query(SELECT .. " WHERE " .. table.concat(where, " AND ") ..
            " ORDER BY kind, priority DESC, key, version DESC, id LIMIT $" .. (#params - 1) .. " OFFSET $" .. #params, params)
        if err then return nil, types.failed("memory item list failed", err) end
        return decode_all(rows), nil
    end)
end

-- Distinct { kind, key } pairs of the live items of a scope, ordered.
function M.keys(component_id: string, scope_key: string, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT DISTINCT kind, key FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND status IN ($3, $4) ORDER BY kind, key LIMIT $5",
            { component_id, scope_key, types.STATUS.CURRENT, types.STATUS.CONFLICT, limit })
        if err then return nil, types.failed("memory key read failed", err) end
        return rows or {}, nil
    end)
end

function M.provenance(component_id: string, item_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT host_kind, host_id, event_id, recorded_at FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2 ORDER BY recorded_at, event_id",
            { component_id, item_id })
        if err then return nil, types.failed("memory provenance read failed", err) end
        return rows or {}, nil
    end)
end

function M.has_provenance(component_id: string, item_id: string, ref: any): (boolean?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT 1 AS found FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2 AND host_kind = $3 AND host_id = $4 AND event_id = $5",
            { component_id, item_id, ref.host_kind, ref.host_id, ref.event_id })
        if err then return nil, types.failed("memory provenance read failed", err) end
        return rows ~= nil and #rows > 0, nil
    end)
end

function M.counts(component_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT status, COUNT(*) AS n FROM kickside_memory_items WHERE component_id = $1 GROUP BY status", { component_id })
        if err then return nil, types.failed("memory counts read failed", err) end
        local counts = { current = 0, superseded = 0, conflict = 0, forgotten = 0, total = 0 }
        for _, row in ipairs(rows or {}) do
            local n = tonumber(row.n) or 0
            counts[tostring(row.status)] = n
            counts.total = counts.total + n
        end
        local groups, group_err = conn:query(
            "SELECT COUNT(DISTINCT conflict_group) AS n FROM kickside_memory_items WHERE component_id = $1 AND status = $2",
            { component_id, types.STATUS.CONFLICT })
        if group_err then return nil, types.failed("memory conflict count failed", group_err) end
        counts.conflict_groups = groups and groups[1] and tonumber(groups[1].n) or 0
        return counts, nil
    end)
end

function M.set_embedding(component_id: string, item_id: string, vector: { number }): (any?, error?)
    return db.write(component_id, function(tx: any, _sqlite: boolean): (any, error?)
        local _, del_err = tx:execute("DELETE FROM kickside_memory_embeddings WHERE item_id = $1", { item_id })
        if del_err then return nil, types.failed("memory vector delete failed", del_err) end
        local err = index.insert_rows_tx(tx, "kickside_memory_embeddings", { "item_id", "component_id", "embedding" },
            { { item_id, component_id, index.vector_literal(vector) } })
        if err then return nil, types.failed("memory vector insert failed", err) end
        return true, nil
    end)
end

type SearchFilter = {
    kinds: { string }?,
    statuses: { string }?,
    scope_keys: { string }?,
    query_text: string?,
    limit: integer?,
}

-- Hybrid search over items of one memory: vector neighbors fused with
-- full-text matches, constrained by kind, status and scope.
function M.search(component_id: string, vector: { number }, filter: SearchFilter): (any?, error?)
    local filters: { any } = {}
    if filter.kinds and #filter.kinds > 0 then filters[#filters + 1] = { column = "kind", values = filter.kinds } end
    if filter.statuses and #filter.statuses > 0 then filters[#filters + 1] = { column = "status", values = filter.statuses } end
    if filter.scope_keys and #filter.scope_keys > 0 then filters[#filters + 1] = { column = "scope_key", values = filter.scope_keys } end
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = index.search(conn, SEARCH_SPEC, vector, {
            partition = component_id, limit = filter.limit or 10, filters = filters, query_text = filter.query_text,
        })
        if err then return nil, types.failed("memory search failed", err) end
        return decode_all(rows), nil
    end)
end

-- Items of the memory that have no vector yet or all items, for re-embedding.
function M.page_for_embedding(component_id: string, after_id: string, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT id, content FROM kickside_memory_items WHERE component_id = $1 AND id > $2 ORDER BY id LIMIT $3",
            { component_id, after_id, limit })
        if err then return nil, types.failed("memory embedding page read failed", err) end
        return rows or {}, nil
    end)
end

return M
