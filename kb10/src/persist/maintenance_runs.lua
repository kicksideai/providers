-- Data access for kb10_maintenance_runs: the durable record of one maintenance
-- run (resummarize / re-embed) over one knowledge base.
--
-- A run is minted by the endpoint that schedules the job, claimed by the worker
-- attempt that carries it out, advanced as the engine verb walks the KB, and
-- closed with its terminal counts. The record is what the surface reports: a
-- request answers in milliseconds and carries no outcome.
--
-- The record is also the claim on the knowledge base, in two places. A knowledge
-- base holds at most one unfinished run per type -- a partial unique index the
-- store enforces, so two requests that both read a free knowledge base do not
-- both mint a full regeneration of it. And exactly one job attempt may open a
-- run, so the scheduled -> running transition is a guarded update (claim) rather
-- than a write, and an attempt that loses it rewrites nothing.
--
-- Timestamps are RFC3339 UTC strings stamped here, so every reader compares the
-- same representation on both dialects. Every write stamps heartbeat_at, so a
-- run in flight reports how far along it is.

local time = require("time")
local uuid = require("uuid")
local ops = require("kb10_ops")

local M = {}

M.RUN_TYPE = {
    RESUMMARIZE = "resummarize",
    REEMBED = "reembed",
}

-- The reason create answers when the knowledge base already holds an unfinished
-- run of the type asked for: a CONFLICT naming the standing run rather than a
-- driver's uniqueness sentence, so the surface reports the standing run instead
-- of an internal error.
M.ERR_ACTIVE_RUN = "a maintenance run of this type is already active"

local function invalid(message: string): error
    return errors.new({ kind = errors.INVALID, message = message })
end

M.STATUS = {
    SCHEDULED = "scheduled",
    RUNNING = "running",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
}

-- The counters a run carries. resummarize fills the document/chunk columns and
-- re-embed fills `embedded`; both fill total/scanned. A column its run type
-- never touches stays 0, which is the truthful reading of "this run did none of
-- that".
local COUNTERS = {
    "total", "scanned", "resummarized", "chunks_reenriched",
    "chunks_failed", "documents_skipped", "embedded",
}

local TIMESTAMPS = { "started_at", "finished_at" }

local COLUMNS = "id, component_id, run_type, job_id, actor_id, actor_context, status, total, scanned, resummarized, " ..
    "chunks_reenriched, chunks_failed, documents_skipped, embedded, last_error, " ..
    "created_at, started_at, heartbeat_at, finished_at"

local function is_run_type(value: any): boolean
    return value == M.RUN_TYPE.RESUMMARIZE or value == M.RUN_TYPE.REEMBED
end
M.is_run_type = is_run_type

-- The instant every stamp in this module is written with.
function M.now(): string
    return time.now():utc():format(time.RFC3339)
end

local function text(value: any): string?
    if type(value) ~= "string" then return nil end
    return value
end

-- Rows come back with driver-native types (a UUID value, an int64, a NULL); the
-- surface and the lease compare plain Lua values, so the row is normalized here
-- once rather than at each reader.
local function normalize(row: any): any
    if type(row) ~= "table" then return nil end
    row.id = tostring(row.id)
    row.component_id = tostring(row.component_id)
    row.run_type = tostring(row.run_type)
    row.status = tostring(row.status)
    row.job_id = text(row.job_id)
    row.actor_id = text(row.actor_id)
    row.actor_context = text(row.actor_context)
    row.last_error = text(row.last_error)
    for _, name in ipairs(COUNTERS) do
        row[name] = tonumber(row[name]) or 0
    end
    row.created_at = text(row.created_at)
    row.heartbeat_at = text(row.heartbeat_at)
    for _, name in ipairs(TIMESTAMPS) do
        row[name] = text(row[name])
    end
    return row
end

-- create(component_id, run_type) -> (row, err). The run starts scheduled: the
-- job that will carry it out has not been minted yet, so nothing has run and
-- nothing has failed.
function M.create(component_id: any, run_type: any, identity_row: any): (any?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, invalid("component id is required")
    end
    if not is_run_type(run_type) then
        return nil, invalid("unknown maintenance run type: " .. tostring(run_type))
    end
    if type(identity_row) ~= "table" or type(identity_row.actor_id) ~= "string"
        or identity_row.actor_id == "" or type(identity_row.actor_context) ~= "string"
        or identity_row.actor_context == "" then
        return nil, invalid("a frozen execution identity row is required")
    end

    local db, err = ops.get_db()
    if err then return nil, err end

    local now = M.now()
    local id = uuid.v7()
    local _, exec_err = db:execute(
        "INSERT INTO kb10_maintenance_runs " ..
        "(id, component_id, run_type, actor_id, actor_context, status, created_at, heartbeat_at) " ..
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        { id, component_id, run_type, identity_row.actor_id,
            identity_row.actor_context, M.STATUS.SCHEDULED, now, now })
    db:release()
    if exec_err then
        -- The active-run index is the only thing this insert can collide with,
        -- and each dialect words that collision its own way. Asking the store
        -- what stands is the portable reading: an unfinished run of this type
        -- means the insert lost the race, anything else is the real failure.
        local standing, read_err = M.active(component_id, run_type)
        if not read_err and standing then return nil, errors.new({ kind = errors.CONFLICT, message = M.ERR_ACTIVE_RUN }) end
        return nil, errors.wrap(exec_err, "insert maintenance run")
    end

    return M.get(id)
end

-- active(component_id, run_type) -> (row, err): the run of this type that still
-- holds the knowledge base, or (nil, nil) when none does. The store admits one,
-- so this is a single row rather than the newest of several.
function M.active(component_id: any, run_type: any): (any?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, invalid("component id is required")
    end
    if not is_run_type(run_type) then
        return nil, invalid("unknown maintenance run type: " .. tostring(run_type))
    end

    local db, err = ops.get_db()
    if err then return nil, err end

    local rows, query_err = db:query(
        "SELECT " .. COLUMNS .. " FROM kb10_maintenance_runs " ..
        "WHERE component_id = $1 AND run_type = $2 AND finished_at IS NULL",
        { component_id, run_type }
    )
    db:release()
    if query_err then return nil, errors.wrap(query_err, "read active maintenance run") end
    if not rows or #(rows :: { any }) == 0 then return nil, nil end

    return normalize((rows :: { any })[1]), nil
end

-- update(run_id, patch) -> (row, err). patch carries any of status, job_id,
-- last_error, started_at, finished_at and the counters; heartbeat_at is stamped
-- on every call, so a progress report doubles as the run's liveness signal.
function M.update(run_id: any, patch: any): (any?, error?)
    if type(run_id) ~= "string" or run_id == "" then
        return nil, invalid("maintenance run id is required")
    end
    local fields = type(patch) == "table" and patch or {}

    local sets: { string } = {}
    local params: { any } = {}
    local function set(column: string, value: any)
        params[#params + 1] = value
        sets[#sets + 1] = column .. " = $" .. tostring(#params)
    end

    if fields.status ~= nil then set("status", tostring(fields.status)) end
    if fields.job_id ~= nil then set("job_id", tostring(fields.job_id)) end
    if fields.last_error ~= nil then set("last_error", tostring(fields.last_error)) end
    for _, name in ipairs(TIMESTAMPS) do
        if fields[name] ~= nil then set(name, tostring(fields[name])) end
    end
    for _, name in ipairs(COUNTERS) do
        local value = tonumber(fields[name])
        if value ~= nil then set(name, math.floor(value)) end
    end
    set("heartbeat_at", M.now())

    local db, err = ops.get_db()
    if err then return nil, err end

    params[#params + 1] = run_id
    local _, exec_err = db:execute(
        "UPDATE kb10_maintenance_runs SET " .. table.concat(sets, ", ") ..
        " WHERE id = $" .. tostring(#params),
        params
    )
    db:release()
    if exec_err then return nil, errors.wrap(exec_err, "update maintenance run") end

    return M.get(run_id)
end

-- claim(run_id) -> (owned, err). The scheduled -> running transition, guarded on
-- the run still being scheduled. A whole-KB rewrite is hours of model work, so
-- it must happen once: the record is the claim, and a zero-row update means
-- another job attempt already owns this run, which answers (false, nil) rather
-- than an error.
function M.claim(run_id: any): (boolean, error?)
    if type(run_id) ~= "string" or run_id == "" then
        return false, invalid("maintenance run id is required")
    end

    local db, err = ops.get_db()
    if err then return false, err end

    local now = M.now()
    local result, exec_err = db:execute(
        "UPDATE kb10_maintenance_runs SET status = $1, started_at = $2, heartbeat_at = $3 " ..
        "WHERE id = $4 AND status = $5",
        { M.STATUS.RUNNING, now, now, run_id, M.STATUS.SCHEDULED }
    )
    db:release()
    if exec_err then return false, errors.wrap(exec_err, "claim maintenance run") end

    return (tonumber(result and (result :: any).rows_affected) or 0) >= 1, nil
end

-- get(run_id) -> (row, err). A run id that names no row is an error, not an
-- empty row: every caller here holds an id it just wrote.
function M.get(run_id: any): (any?, error?)
    if type(run_id) ~= "string" or run_id == "" then
        return nil, invalid("maintenance run id is required")
    end

    local db, err = ops.get_db()
    if err then return nil, err end

    local rows, query_err = db:query(
        "SELECT " .. COLUMNS .. " FROM kb10_maintenance_runs WHERE id = $1",
        { run_id }
    )
    db:release()
    if query_err then return nil, errors.wrap(query_err, "read maintenance run") end
    if not rows or #rows == 0 then return nil, errors.new({ kind = errors.NOT_FOUND, message = "maintenance run not found: " .. run_id }) end

    return normalize((rows :: { any })[1]), nil
end

-- latest_by_type(component_id) -> ({ [run_type]: row }, err): the most recent
-- run of each type for one KB. An in-flight run is always the most recent of its
-- type -- a new one is only minted when none is in flight -- so this one read
-- answers both "what happened last" and "is one running now".
function M.latest_by_type(component_id: any): (any?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, invalid("component id is required")
    end

    local db, err = ops.get_db()
    if err then return nil, err end

    local latest: { [string]: any } = {}
    for _, run_type in ipairs({ M.RUN_TYPE.RESUMMARIZE, M.RUN_TYPE.REEMBED }) do
        local rows, query_err = db:query(
            "SELECT " .. COLUMNS .. " FROM kb10_maintenance_runs " ..
            "WHERE component_id = $1 AND run_type = $2 ORDER BY created_at DESC, id DESC LIMIT 1",
            { component_id, run_type }
        )
        if query_err then
            db:release()
            return nil, errors.wrap(query_err, "read maintenance runs")
        end
        if rows and #(rows :: { any }) > 0 then
            latest[run_type] = normalize((rows :: { any })[1])
        end
    end
    db:release()
    return latest, nil
end

return M
