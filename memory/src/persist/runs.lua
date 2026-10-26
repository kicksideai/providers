-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Deferred memory work: one row per derive, consolidation or re-embed run with
-- its frozen requester identity, input, outcome and failure reason. Capture
-- cursors advance in the same transaction that records the derive run.

local sql = require("sql")
local json = require("json")
local db = require("memory_db")
local types = require("types")
local search_index = require("search_index")
local jobs = require("jobs")
local jobs_wake = require("jobs_wake")

local M = {}

local SELECT = "SELECT id, component_id, run_type, status, job_id, host_kind, host_id, agent_id, from_event_id, " ..
    "to_event_id, input, stats, last_error, actor_id, actor_context, created_at, started_at, finished_at FROM kickside_memory_kb_runs"

local function decode(row: any): any
    row.input = types.decode_json(row.input) or {}
    row.stats = types.decode_json(row.stats) or {}
    return row
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

local function insert_tx(tx: any, run: RunInput): (any?, error?)
    local existing, read_err = tx:query("SELECT id, job_id FROM kickside_memory_kb_runs WHERE id = $1", { run.id })
    if read_err then return nil, types.failed("memory run lookup failed", read_err) end
    if existing and #existing > 0 then
        local job_id = existing[1].job_id
        if type(job_id) ~= "string" or job_id == "" then return nil, types.internal("memory run has no queue enrollment") end
        return { created = false, job_id = job_id }, nil
    end
    local _, err = tx:execute(
        "INSERT INTO kickside_memory_kb_runs (id, component_id, run_type, status, host_kind, host_id, agent_id, from_event_id, " ..
        "to_event_id, input, stats, actor_id, actor_context, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '{}', $11, $12, $13)",
        { run.id, run.component_id, run.run_type, types.RUN_STATUS.SCHEDULED, run.host_kind or "", run.host_id or "",
            run.agent_id or "", run.from_event_id or "", run.to_event_id or "", json.encode(run.input or {}),
            run.actor_id or sql.NULL, run.actor_context or sql.NULL, types.now() })
    if err then return nil, types.failed("memory run insert failed", err) end
    return { created = true }, nil
end

-- Run creation, capture reservation and queue enrollment are one write.
function M.schedule(run: RunInput, params: any, expected: string?): (any?, error?)
    local scheduled, err = db.write(run.component_id, function(tx: any, sqlite: boolean): (any, error?)
        if expected ~= nil then
            local rows, read_err = tx:query(
                "SELECT last_event_id FROM kickside_memory_kb_cursors WHERE component_id = $1 AND host_kind = $2 AND host_id = $3" ..
                (sqlite and "" or " FOR UPDATE"), { run.component_id, run.host_kind, run.host_id })
            if read_err then return nil, types.failed("memory cursor read failed", read_err) end
            local current = rows and rows[1] and tostring(rows[1].last_event_id or "") or nil
            if (current or "") ~= expected then return { scheduled = false }, nil end
            local _, cursor_err = tx:execute(
                "INSERT INTO kickside_memory_kb_cursors (component_id, host_kind, host_id, agent_id, last_event_id, updated_at) " ..
                "VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (component_id, host_kind, host_id) DO UPDATE " ..
                "SET agent_id = excluded.agent_id, last_event_id = excluded.last_event_id, updated_at = excluded.updated_at",
                { run.component_id, run.host_kind, run.host_id, run.agent_id or "", run.to_event_id, types.now() })
            if cursor_err then return nil, types.failed("memory cursor reservation failed", cursor_err) end
        end
        local proof, create_err = insert_tx(tx, run)
        if create_err then return nil, create_err end
        if not proof.created then return { scheduled = false, run_id = run.id, job_id = proof.job_id }, nil end
        local queued, queue_err = jobs.enqueue_tx(tx, sqlite and "sqlite" or "postgres", params)
        if queue_err then return nil, queue_err end
        if not queued or type(queued.id) ~= "string" then return nil, types.internal("memory queue enrollment returns no job") end
        local _, attach_err = tx:execute("UPDATE kickside_memory_kb_runs SET job_id = $1 WHERE id = $2", { queued.id, run.id })
        if attach_err then return nil, types.failed("memory run enrollment failed", attach_err) end
        return { scheduled = true, run_id = run.id, job_id = queued.id }, nil
    end)
    if err then return nil, err end
    if scheduled.scheduled then
        local _, wake_err = jobs_wake.nudge_workers(nil, nil)
        if wake_err then return nil, wake_err end
    end
    return scheduled, nil
end

function M.cursor(component_id: string, host_kind: string, host_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT component_id, host_kind, host_id, agent_id, last_event_id, pinned_head, pinned_prompt, updated_at FROM kickside_memory_kb_cursors " ..
            "WHERE component_id = $1 AND host_kind = $2 AND host_id = $3", { component_id, host_kind, host_id })
        if err then return nil, types.failed("memory cursor read failed", err) end
        local row = rows and rows[1]
        if row and row.pinned_head ~= nil then row.pinned_head = tonumber(row.pinned_head) end
        return row, nil
    end)
end

-- Pins the rendered owner slice only while every source item remains current
-- with the version and text that was rendered.
function M.pin(component_id: string, host_kind: string, host_id: string, agent_id: string, head: integer, prompt: string, selected: { any }): (any?, error?)
    return db.write(component_id, function(tx: any, sqlite: boolean): (any, error?)
        local item_ids: { string } = {}
        for _, item in ipairs(selected) do
            local suffix = sqlite and "" or " FOR SHARE"
            local rows, read_err = tx:query(
                "SELECT version, content_hash FROM kickside_memory_kb_items WHERE component_id = $1 AND id = $2 AND status = $3" .. suffix,
                { component_id, item.id, types.STATUS.CURRENT })
            if read_err then return nil, types.failed("memory pin source read failed", read_err) end
            local current = rows and rows[1]
            if not current or tonumber(current.version) ~= tonumber(item.version) or current.content_hash ~= item.content_hash then
                return nil, types.invalid("memory pin source is no longer current")
            end
            item_ids[#item_ids + 1] = item.id
        end
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_kb_cursors (component_id, host_kind, host_id, agent_id, last_event_id, pinned_head, pinned_prompt, pinned_ids, updated_at) " ..
            "VALUES ($1, $2, $3, $4, '', $5, $6, $7, $8) ON CONFLICT (component_id, host_kind, host_id) DO UPDATE SET pinned_head = excluded.pinned_head, " ..
            "pinned_prompt = excluded.pinned_prompt, pinned_ids = excluded.pinned_ids, agent_id = excluded.agent_id, updated_at = excluded.updated_at",
            { component_id, host_kind, host_id, agent_id, head, prompt, json.encode(item_ids), types.now() })
        if err then return nil, types.failed("memory pin failed", err) end
        return true, nil
    end)
end

function M.get(run_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(SELECT .. " WHERE id = $1", { run_id })
        if err then return nil, types.failed("memory run read failed", err) end
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
        if err then return nil, types.failed("memory run list failed", err) end
        local out: { any } = {}
        for _, row in ipairs(rows or {}) do out[#out + 1] = decode(row) end
        return out, nil
    end)
end

-- Claims a run for the executing job. The job lease already makes one
-- execution exclusive, so a run left running or failed by an earlier attempt of
-- the same job is claimable again. A succeeded run is claimable only when
-- `repeatable` (a consolidation slot runs once per cadence).
-- Claims a run for an attempt: { claimed, cycle }. `cycle` is the start of the
-- run's current cycle, kept by a retry of a failed or interrupted attempt and
-- renewed when a scheduled run or a finished repeatable run starts again, so
-- an attempt's writes are keyed by the cycle they belong to.
function M.claim(run_id: string, repeatable: boolean): (any?, error?)
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local S = types.RUN_STATUS
        local claimable = { S.SCHEDULED, S.RUNNING, S.FAILED }
        if repeatable then claimable[#claimable + 1] = S.SUCCEEDED end
        local params: { any } = { S.RUNNING, S.SCHEDULED, S.SUCCEEDED, types.now(), run_id }
        for _, status in ipairs(claimable) do params[#params + 1] = status end
        local result, err = tx:execute("UPDATE kickside_memory_kb_runs SET status = $1, " ..
            "started_at = CASE WHEN status IN ($2, $3) OR started_at IS NULL THEN $4 ELSE started_at END, " ..
            "finished_at = NULL, last_error = NULL WHERE id = $5 AND status IN (" .. search_index.placeholders(#claimable, 6) .. ")", params)
        if err then return nil, types.failed("memory run claim failed", err) end
        if (tonumber(result and (result :: any).rows_affected) or 0) < 1 then return { claimed = false }, nil end
        local rows, read_err = tx:query("SELECT started_at FROM kickside_memory_kb_runs WHERE id = $1", { run_id })
        if read_err then return nil, types.failed("memory run claim failed", read_err) end
        return { claimed = true, cycle = tostring(rows[1].started_at) }, nil
    end)
end

function M.finish(run_id: string, status: string, last_error: string?, stats: any?): (any?, error?)
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local _, err = tx:execute(
            "UPDATE kickside_memory_kb_runs SET status = $1, last_error = $2, stats = $3, finished_at = $4 WHERE id = $5",
            { status, last_error or sql.NULL, json.encode(stats or {}), types.now(), run_id })
        if err then return nil, types.failed("memory run close failed", err) end
        return true, nil
    end)
end

return M
