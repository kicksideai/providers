-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local db = require("memory_db")
local types = require("types")
local search_index = require("search_index")
local jobs = require("jobs")
local jobs_wake = require("jobs_wake")

local M = {}

local SELECT = "SELECT id, component_id, run_type, status, job_id, host_kind, host_id, agent_id, from_event_id, " ..
    "to_event_id, input, stats, last_error, actor_id, actor_context, created_at, started_at, cycle, finished_at FROM kickside_memory_runs"

local function decode(row: any): (any?, error?)
    local input, input_err = types.decode_object(row.input, "input")
    if input_err then return nil, input_err end
    row.input = input
    local stats, stats_err = types.decode_object(row.stats, "stats")
    if stats_err then return nil, stats_err end
    row.stats = stats
    return row, nil
end

type RunInput = {
    id: string,
    component_id: string,
    run_type: string,
    status: string?,
    host_kind: string?,
    host_id: string?,
    agent_id: string?,
    from_event_id: string?,
    to_event_id: string?,
    input: any?,
    stats: any?,
    last_error: string?,
    actor_id: string?,
    actor_context: string?,
    finished_at: string?,
}

local function sources_tx(tx: any, run: any): error?
    local input = run.input or {}
    for _, messages in ipairs({ input.span or {}, input.context or {} }) do
        for _, message in ipairs(messages) do
            local id = types.trim(message.id)
            if id == "" then return types.invalid("memory source event id is required") end
            local _, err = tx:execute("INSERT INTO kickside_memory_run_sources (component_id, run_id, event_id) VALUES ($1, $2, $3) ON CONFLICT (component_id, run_id, event_id) DO NOTHING",
                { run.component_id, run.id, id })
            if err then return types.failed("memory run source enrollment failed", err) end
        end
    end
    return nil
end

function M.sources_tx(tx: any, run: any): error?
    return sources_tx(tx, run)
end

local function insert_tx(tx: any, run: RunInput): (any?, error?)
    local existing, read_err = tx:query("SELECT id, job_id FROM kickside_memory_runs WHERE id = $1", { run.id })
    if read_err then return nil, types.failed("memory run lookup failed", read_err) end
    if existing and #existing > 0 then
        local job_id = existing[1].job_id
        return { created = false, job_id = job_id }, nil
    end
    local input, input_err = types.encode_object(run.input or {}, "input")
    if input_err then return nil, input_err end
    local stats, stats_err = types.encode_object(run.stats or {}, "stats")
    if stats_err then return nil, stats_err end
    local _, err = tx:execute(
        "INSERT INTO kickside_memory_runs (id, component_id, run_type, status, host_kind, host_id, agent_id, from_event_id, " ..
        "to_event_id, input, stats, actor_id, actor_context, created_at, last_error, finished_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
        { run.id, run.component_id, run.run_type, run.status or types.RUN_STATUS.SCHEDULED, run.host_kind or "", run.host_id or "",
            run.agent_id or "", run.from_event_id or "", run.to_event_id or "", input,
            stats, run.actor_id or sql.NULL, run.actor_context or sql.NULL, types.now(), run.last_error or sql.NULL, run.finished_at or sql.NULL })
    if err then return nil, types.failed("memory run insert failed", err) end
    local sources_err = sources_tx(tx, run)
    if sources_err then return nil, sources_err end
    return { created = true }, nil
end

local function capture_state(conn: any, sqlite: boolean, run: {component_id: string, host_kind: string?, host_id: string?}, lock: boolean): (any?, error?)
    local rows, read_err = conn:query(
        "SELECT last_event_id FROM kickside_memory_cursors WHERE component_id = $1 AND host_kind = $2 AND host_id = $3" ..
        (lock and not sqlite and " FOR UPDATE" or ""), {run.component_id, run.host_kind, run.host_id})
    if read_err then return nil, types.failed("memory cursor read failed", read_err) end
    local current = rows and rows[1] and tostring(rows[1].last_event_id or "") or ""
    local active, active_err = conn:query([[SELECT r.id, r.from_event_id, r.to_event_id FROM kickside_memory_runs r
        JOIN kickside_job j ON j.id = r.job_id
        WHERE r.component_id = $1 AND r.host_kind = $2 AND r.host_id = $3
        AND r.run_type = $4 AND r.agent_id <> '' AND r.status <> $5 AND j.status NOT IN ('done', 'dead', 'cancelled')
        ORDER BY r.created_at, r.id]],
        {run.component_id, run.host_kind, run.host_id, types.RUN_TYPE.DERIVE, types.RUN_STATUS.SUCCEEDED})
    if active_err then return nil, types.failed("memory capture ownership read failed", active_err) end
    local position = current
    for _, pending in ipairs(active or {}) do
        if (pending.from_event_id or "") ~= position then
            return {committed = current, position = current, blocked = true, run_id = active[1].id}, nil
        end
        position = pending.to_event_id
    end
    return {committed = current, position = position, run_id = active and active[1] and active[1].id}, nil
end

function M.capture_position(component_id: string, host_kind: string, host_id: string): (string?, error?)
    return db.read(function(conn: any, sqlite: boolean): (string?, error?)
        local state, err = capture_state(conn, sqlite, {component_id = component_id, host_kind = host_kind, host_id = host_id}, false)
        if err then return nil, err end
        return state.position, nil
    end)
end

function M.capture_available_tx(tx: any, sqlite: boolean, run: RunInput, expected: string): (any?, error?)
    local state, err = capture_state(tx, sqlite, run, true)
    if err then return nil, err end
    return {available = state.committed == expected and state.run_id == nil, run_id = state.run_id}, nil
end

function M.insert_tx(tx: any, run: RunInput): (any?, error?)
    return insert_tx(tx, run)
end

function M.advance_cursor_tx(tx: any, component_id: string, body: any, updated_at: string): error?
    local _, err = tx:execute([[INSERT INTO kickside_memory_cursors
        (component_id, host_kind, host_id, agent_id, last_event_id, updated_at) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (component_id, host_kind, host_id) DO UPDATE SET agent_id = excluded.agent_id, last_event_id = excluded.last_event_id,
            updated_at = excluded.updated_at WHERE kickside_memory_cursors.last_event_id = $7]],
        { component_id, body.host_kind, body.host_id, body.agent_id, body.last_event_id, updated_at, body.from_event_id })
    if err then return types.failed("memory cursor advance failed", err) end
    return nil
end

function M.schedule(run: RunInput, params: any, expected: string?, following: { any }?): (any?, error?)
    local scheduled, err = db.write(run.component_id, function(tx: any, sqlite: boolean): (any, error?)
        if expected ~= nil then
            local state, state_err = capture_state(tx, sqlite, run, true)
            if state_err then return nil, state_err end
            if state.blocked or state.position ~= expected then return {scheduled = false, run_id = state.run_id}, nil end
        end
        local batch = { { run = run, params = params } }
        for _, entry in ipairs(following or {}) do batch[#batch + 1] = entry end
        local first = nil
        for _, entry in ipairs(batch) do
            local current = entry.run
            local proof, create_err = insert_tx(tx, current)
            if create_err then return nil, create_err end
            local job_id = proof.job_id
            if proof.created then
                local queued, queue_err = jobs.enqueue_tx(tx, sqlite and "sqlite" or "postgres", entry.params)
                if queue_err then return nil, queue_err end
                if not queued or type(queued.id) ~= "string" then return nil, types.internal("memory queue enrollment returns no job") end
                job_id = queued.id
                local _, attach_err = tx:execute("UPDATE kickside_memory_runs SET job_id = $1 WHERE id = $2", { job_id, current.id })
                if attach_err then return nil, types.failed("memory run enrollment failed", attach_err) end
            elseif type(job_id) ~= "string" or job_id == "" then
                return nil, types.internal("memory run has no queue enrollment")
            end
            if not first then first = { scheduled = proof.created, run_id = current.id, job_id = job_id } end
        end
        return first, nil
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
            "SELECT component_id, host_kind, host_id, agent_id, last_event_id, pinned_head, pinned_prompt, updated_at FROM kickside_memory_cursors " ..
            "WHERE component_id = $1 AND host_kind = $2 AND host_id = $3", { component_id, host_kind, host_id })
        if err then return nil, types.failed("memory cursor read failed", err) end
        local row = rows and rows[1]
        if row and row.pinned_head ~= nil then row.pinned_head = tonumber(row.pinned_head) end
        return row, nil
    end)
end

function M.pin(component_id: string, host_kind: string, host_id: string, agent_id: string, head: integer, prompt: string, selected: { any }, owner_scope_key: string?): (any?, error?)
    local scope_key = types.trim(owner_scope_key)
    if scope_key == "" then scope_key = types.scope_key(types.SCOPE.OWNER, types.actor_id()) end
    return db.write(component_id, function(tx: any, sqlite: boolean): (any, error?)
        local item_ids: { string } = {}
        for _, item in ipairs(selected) do
            local suffix = sqlite and "" or " FOR SHARE"
            local rows, read_err = tx:query(
                "SELECT version, content_hash FROM kickside_memory_items WHERE component_id = $1 AND id = $2 AND status = $3" .. suffix,
                { component_id, item.id, types.STATUS.CURRENT })
            if read_err then return nil, types.failed("memory pin source read failed", read_err) end
            local current = rows and rows[1]
            if not current or tonumber(current.version) ~= tonumber(item.version) or current.content_hash ~= item.content_hash then
                return nil, types.invalid("memory pin source is no longer current")
            end
            item_ids[#item_ids + 1] = item.id
        end
        local item_ids_json, encode_err = json.encode(item_ids)
        if encode_err then return nil, types.internal("memory pin ids encode failed", { cause = tostring(encode_err) }) end
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_cursors (component_id, host_kind, host_id, agent_id, owner_scope_key, last_event_id, pinned_head, pinned_prompt, pinned_ids, updated_at) " ..
            "VALUES ($1, $2, $3, $4, $5, '', $6, $7, $8, $9) ON CONFLICT (component_id, host_kind, host_id) DO UPDATE SET pinned_head = excluded.pinned_head, " ..
            "pinned_prompt = excluded.pinned_prompt, pinned_ids = excluded.pinned_ids, agent_id = excluded.agent_id, owner_scope_key = excluded.owner_scope_key, updated_at = excluded.updated_at",
            { component_id, host_kind, host_id, agent_id, scope_key, head, prompt, item_ids_json, types.now() })
        if err then return nil, types.failed("memory pin failed", err) end
        return true, nil
    end)
end

function M.get(run_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(SELECT .. " WHERE id = $1", { run_id })
        if err then return nil, types.failed("memory run read failed", err) end
        if not rows or #rows == 0 then return nil, nil end
        return decode(rows[1])
    end)
end

function M.view(run: any): any?
    if not run then return nil end
    return {
        id = run.id, run_type = run.run_type, status = run.status, job_id = run.job_id, last_error = run.last_error,
        stats = run.stats, created_at = run.created_at, started_at = run.started_at, finished_at = run.finished_at,
        in_flight = run.status == types.RUN_STATUS.RUNNING or run.status == types.RUN_STATUS.SCHEDULED,
    }
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
        for _, row in ipairs(rows or {}) do
            local decoded, decode_err = decode(row)
            if decode_err then return nil, decode_err end
            out[#out + 1] = decoded
        end
        return out, nil
    end)
end

function M.claim(run_id: string, repeatable: boolean): (any?, error?)
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local S = types.RUN_STATUS
        local claimable = { S.SCHEDULED, S.RUNNING, S.FAILED }
        if repeatable then claimable[#claimable + 1] = S.SUCCEEDED end
        local params: { any } = { S.RUNNING, S.SCHEDULED, S.SUCCEEDED, types.now(), uuid.v7(), run_id }
        for _, status in ipairs(claimable) do params[#params + 1] = status end
        local result, err = tx:execute("UPDATE kickside_memory_runs SET status = $1, " ..
            "started_at = CASE WHEN status IN ($2, $3) OR started_at IS NULL THEN $4 ELSE started_at END, " ..
            "cycle = CASE WHEN status IN ($2, $3) OR cycle IS NULL THEN $5 ELSE cycle END, " ..
            "finished_at = NULL, last_error = NULL WHERE id = $6 AND status IN (" ..
            search_index.placeholders(#claimable, 7) .. ")", params)
        if err then return nil, types.failed("memory run claim failed", err) end
        if (tonumber(result and (result :: any).rows_affected) or 0) < 1 then return { claimed = false }, nil end
        local rows, read_err = tx:query("SELECT started_at, cycle FROM kickside_memory_runs WHERE id = $1", { run_id })
        if read_err then return nil, types.failed("memory run claim failed", read_err) end
        if not rows or not rows[1] or types.trim(rows[1].cycle) == "" then return nil, types.internal("memory run claim has no cycle") end
        return { claimed = true, cycle = rows[1].cycle }, nil
    end)
end

function M.finish(run_id: string, status: string, last_error: string?, stats: any?): (any?, error?)
    local encoded, encode_err = types.encode_object(stats or {}, "stats")
    if encode_err then return nil, encode_err end
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local _, err = tx:execute(
            "UPDATE kickside_memory_runs SET status = $1, last_error = $2, stats = $3, finished_at = $4 WHERE id = $5",
            { status, last_error or sql.NULL, encoded, types.now(), run_id })
        if err then return nil, types.failed("memory run close failed", err) end
        return true, nil
    end)
end

return M
