-- Deferred memory work: one row per derive, consolidation or re-embed run with
-- its frozen requester identity, input, outcome and failure reason. Capture
-- cursors advance in the same transaction that records the derive run.

local sql = require("sql")
local json = require("json")
local db = require("memory_db")
local types = require("types")

local M = {}

local SELECT = "SELECT id, component_id, run_type, status, job_id, host_kind, host_id, agent_id, from_event_id, " ..
    "to_event_id, input, stats, last_error, actor_id, actor_context, created_at, started_at, finished_at FROM kickside_memory_runs"

local function decode(row: any): any
    row.input = types.decode_json(row.input) or {}
    row.stats = types.decode_json(row.stats) or {}
    return row
end

local function fail(message: string, err: any): error
    return types.unavailable(message .. ": " .. tostring(err))
end

type RunInput = {
    id: string,
    component_id: string,
    run_type: string,
    host_kind: string?,
    host_id: string?,
    agent_id: string?,
    from_event_id: string?,
    to_event_id: string?,
    input: any?,
    actor_id: string?,
    actor_context: string?,
}

local function insert_tx(tx: any, run: RunInput): (boolean?, error?)
    local existing, read_err = tx:query("SELECT id FROM kickside_memory_runs WHERE id = $1", { run.id })
    if read_err then return nil, fail("memory run lookup failed", read_err) end
    if existing and #existing > 0 then return false, nil end
    local _, err = tx:execute(
        "INSERT INTO kickside_memory_runs (id, component_id, run_type, status, host_kind, host_id, agent_id, from_event_id, " ..
        "to_event_id, input, stats, actor_id, actor_context, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '{}', $11, $12, $13)",
        { run.id, run.component_id, run.run_type, types.RUN_STATUS.SCHEDULED, run.host_kind or "", run.host_id or "",
            run.agent_id or "", run.from_event_id or "", run.to_event_id or "", json.encode(run.input or {}),
            run.actor_id or sql.NULL, run.actor_context or sql.NULL, types.now() })
    if err then return nil, fail("memory run insert failed", err) end
    return true, nil
end

-- Records a run. Returns (run, created): created is false when a run with the
-- same id already exists, which makes replayed scheduling idempotent.
function M.create(run: RunInput): (any?, boolean, error?)
    local created, err = db.write(run.component_id, function(tx: any, _sqlite: boolean): (any, error?)
        return insert_tx(tx, run)
    end)
    if err then return nil, false, err end
    local row, read_err = M.get(run.id)
    if read_err then return nil, false, read_err end
    return row, created == true, nil
end

-- Moves the host's capture cursor from `expected` to `run.to_event_id` and
-- records the derive run in one transaction. A cursor that moved since the
-- caller read it means another capture of the same span won: nothing is
-- written and `advanced` is false.
function M.capture(run: RunInput, expected: string): (any?, error?)
    return db.write(run.component_id, function(tx: any, _sqlite: boolean): (any, error?)
        local rows, err = tx:query(
            "SELECT last_event_id FROM kickside_memory_cursors WHERE component_id = $1 AND host_kind = $2 AND host_id = $3",
            { run.component_id, run.host_kind, run.host_id })
        if err then return nil, fail("memory cursor read failed", err) end
        local current = rows and rows[1] and tostring(rows[1].last_event_id or "") or nil
        if (current or "") ~= expected then return { advanced = false }, nil end
        local now = types.now()
        if current == nil then
            local _, ins_err = tx:execute(
                "INSERT INTO kickside_memory_cursors (component_id, host_kind, host_id, agent_id, last_event_id, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
                { run.component_id, run.host_kind, run.host_id, run.agent_id or "", run.to_event_id, now })
            if ins_err then return nil, fail("memory cursor insert failed", ins_err) end
        else
            local _, upd_err = tx:execute(
                "UPDATE kickside_memory_cursors SET last_event_id = $1, agent_id = $2, updated_at = $3 WHERE component_id = $4 AND host_kind = $5 AND host_id = $6 AND last_event_id = $7",
                { run.to_event_id, run.agent_id or "", now, run.component_id, run.host_kind, run.host_id, expected })
            if upd_err then return nil, fail("memory cursor update failed", upd_err) end
        end
        local created, run_err = insert_tx(tx, run)
        if run_err then return nil, run_err end
        return { advanced = true, created = created }, nil
    end)
end

function M.cursor(component_id: string, host_kind: string, host_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT component_id, host_kind, host_id, agent_id, last_event_id, pinned_head, pinned_prompt, updated_at FROM kickside_memory_cursors " ..
            "WHERE component_id = $1 AND host_kind = $2 AND host_id = $3", { component_id, host_kind, host_id })
        if err then return nil, fail("memory cursor read failed", err) end
        local row = rows and rows[1]
        if row and row.pinned_head ~= nil then row.pinned_head = tonumber(row.pinned_head) end
        return row, nil
    end)
end

-- Pins the owner slice a host renders into every step's prompt, with the ledger
-- head it was rendered at. The slice stays byte-identical until the next pin.
function M.pin(component_id: string, host_kind: string, host_id: string, agent_id: string, head: integer, prompt: string): (any?, error?)
    return db.write(component_id, function(tx: any, _sqlite: boolean): (any, error?)
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_cursors (component_id, host_kind, host_id, agent_id, last_event_id, pinned_head, pinned_prompt, updated_at) " ..
            "VALUES ($1, $2, $3, $4, '', $5, $6, $7) ON CONFLICT (component_id, host_kind, host_id) DO UPDATE SET pinned_head = excluded.pinned_head, " ..
            "pinned_prompt = excluded.pinned_prompt, agent_id = excluded.agent_id, updated_at = excluded.updated_at",
            { component_id, host_kind, host_id, agent_id, head, prompt, types.now() })
        if err then return nil, fail("memory pin failed", err) end
        return true, nil
    end)
end

function M.get(run_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(SELECT .. " WHERE id = $1", { run_id })
        if err then return nil, fail("memory run read failed", err) end
        if not rows or #rows == 0 then return nil, types.not_found("memory run not found: " .. run_id) end
        return decode(rows[1]), nil
    end)
end

function M.list(component_id: string, run_type: string?, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err
        if run_type then
            rows, err = conn:query(SELECT .. " WHERE component_id = $1 AND run_type = $2 ORDER BY created_at DESC, id DESC LIMIT $3",
                { component_id, run_type, limit })
        else
            rows, err = conn:query(SELECT .. " WHERE component_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2", { component_id, limit })
        end
        if err then return nil, fail("memory run list failed", err) end
        local out: { any } = {}
        for _, row in ipairs(rows or {}) do out[#out + 1] = decode(row) end
        return out, nil
    end)
end

function M.attach_job(run_id: string, job_id: string): (any?, error?)
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local _, err = tx:execute("UPDATE kickside_memory_runs SET job_id = $1 WHERE id = $2", { job_id, run_id })
        if err then return nil, fail("memory run job attach failed", err) end
        return true, nil
    end)
end

-- Claims a run for the executing job. The job lease already makes one
-- execution exclusive, so a run left running or failed by an earlier attempt of
-- the same job is claimable again. A succeeded run is claimable only when
-- `repeatable` (a consolidation slot runs once per cadence).
function M.claim(run_id: string, repeatable: boolean): (boolean?, error?)
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local statuses = repeatable and "('scheduled', 'running', 'failed', 'succeeded')" or "('scheduled', 'running', 'failed')"
        local result, err = tx:execute("UPDATE kickside_memory_runs SET status = 'running', started_at = $1, finished_at = NULL, last_error = NULL WHERE id = $2 AND status IN " .. statuses,
            { types.now(), run_id })
        if err then return nil, fail("memory run claim failed", err) end
        return (tonumber(result and (result :: any).rows_affected) or 0) >= 1, nil
    end)
end

function M.finish(run_id: string, status: string, last_error: string?, stats: any?): (any?, error?)
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local _, err = tx:execute(
            "UPDATE kickside_memory_runs SET status = $1, last_error = $2, stats = $3, finished_at = $4 WHERE id = $5",
            { status, last_error or sql.NULL, json.encode(stats or {}), types.now(), run_id })
        if err then return nil, fail("memory run close failed", err) end
        return true, nil
    end)
end

return M
