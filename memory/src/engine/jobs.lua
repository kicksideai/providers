-- Deferred memory work. Every run is a kickside_memory_runs row that holds the
-- requester's frozen identity, its input and its outcome; the job carries only
-- the run id. Workers re-admit the identity, claim the run, do the work and
-- close the run as succeeded or failed with the reason.

local types = require("types")
local config = require("memory_config")
local runs = require("memory_runs")
local stores = require("memory_stores")
local items = require("memory_items")
local models = require("memory_models")
local writer = require("memory_writer")
local component = require("component")
local jobs = require("jobs")
local execution_identity = require("execution_identity")

local M = {
    _runs = runs, _stores = stores, _items = items, _models = models, _writer = writer,
    _component = component, _jobs = jobs, _identity = execution_identity,
}

M.JOB = {
    derive = "kickside.memory.engine:derive_worker",
    consolidate = "kickside.memory.engine:consolidate_worker",
    reembed = "kickside.memory.engine:reembed_worker",
}
local AUTHORIZED = {
    derive = "kickside.memory.engine:derive_authorized",
    consolidate = "kickside.memory.engine:consolidate_authorized",
    reembed = "kickside.memory.engine:reembed_authorized",
}

M.DERIVE_ATTEMPTS = 3
M.REEMBED_PAGE = 64

local function frozen_identity(): (any?, any?, error?)
    local identity, err = M._identity.capture()
    if err or not identity then return nil, nil, types.internal("the requester's identity could not be frozen: " .. tostring(err)) end
    local row, row_err = M._identity.to_row(identity)
    if row_err or not row then return nil, nil, types.internal("the requester's identity is not storable: " .. tostring(row_err)) end
    return identity, row, nil
end

local function enqueue(run: any, identity: any, run_type: string, extra: any): (any?, error?)
    local params: { [string]: any } = {
        namespace = "kickside.memory." .. run_type,
        scope = run.component_id,
        key = run.id,
        owner_locator = { kind = identity.principal.kind, id = identity.principal.id },
        thread_id = run.component_id,
        job_type = M.JOB[run_type],
        concurrency_key = "kickside.memory:" .. run.component_id,
        immutable_payload = { component_id = run.component_id, run_id = run.id, run_type = run_type },
    }
    for k, v in pairs(extra or {}) do params[k] = v end
    local queued, err = M._jobs.enqueue(params)
    if err or type(queued) ~= "table" or type(queued.id) ~= "string" then
        local reason = "the memory run could not be scheduled: " .. tostring(err or "the queue accepted no job")
        local _, close_err = M._runs.finish(run.id, types.RUN_STATUS.FAILED, reason)
        if close_err then reason = reason .. " (the run record also failed to close: " .. tostring(close_err) .. ")" end
        return nil, types.unavailable(reason)
    end
    local _, attach_err = M._runs.attach_job(run.id, queued.id)
    if attach_err then return nil, attach_err end
    return queued, nil
end

local function run_id_for(parts: { string }): (string?, error?)
    return types.sha256(table.concat(parts, "|"))
end

type Capture = {
    component_id: string,
    host_kind: string,
    host_id: string,
    agent_id: string,
    from_event_id: string,
    to_event_id: string,
    span: { any },
}

-- Advances a host's capture cursor over a span and schedules its derive run.
-- Returns { scheduled, run_id } or { scheduled = false } when another capture of
-- the same span already advanced the cursor.
function M.capture(capture: Capture): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id, hash_err = run_id_for({ "derive", capture.component_id, capture.host_kind, capture.host_id,
        capture.from_event_id, capture.to_event_id })
    if hash_err then return nil, hash_err end
    local run = {
        id = run_id :: string, component_id = capture.component_id, run_type = types.RUN_TYPE.DERIVE,
        host_kind = capture.host_kind, host_id = capture.host_id, agent_id = capture.agent_id,
        from_event_id = capture.from_event_id, to_event_id = capture.to_event_id,
        input = { span = capture.span, owner_id = (identity :: any).principal.id, source = types.ITEM_SOURCE.CAPTURE },
        actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    }
    local advanced, err = M._runs.capture(run, capture.from_event_id)
    if err then return nil, err end
    if not (advanced :: any).advanced then return { scheduled = false }, nil end
    local _, enqueue_err = enqueue(run, identity, types.RUN_TYPE.DERIVE, { max_attempts = M.DERIVE_ATTEMPTS })
    if enqueue_err then return nil, enqueue_err end
    return { scheduled = true, run_id = run.id }, nil
end

-- Schedules a derive run over ingested content (no capture cursor).
function M.ingest(component_id: string, source_event_id: string, span: { any }): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id, hash_err = run_id_for({ "derive", component_id, "content", source_event_id })
    if hash_err then return nil, hash_err end
    local run = {
        id = run_id :: string, component_id = component_id, run_type = types.RUN_TYPE.DERIVE,
        host_kind = "content", host_id = component_id, from_event_id = source_event_id, to_event_id = source_event_id,
        input = { span = span, owner_id = (identity :: any).principal.id, source = types.ITEM_SOURCE.CAPTURE },
        actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    }
    local created_run, created, err = M._runs.create(run)
    if err then return nil, err end
    if not created then return { scheduled = false, run_id = (created_run :: any).id }, nil end
    local _, enqueue_err = enqueue(run, identity, types.RUN_TYPE.DERIVE, { max_attempts = M.DERIVE_ATTEMPTS })
    if enqueue_err then return nil, enqueue_err end
    return { scheduled = true, run_id = run.id }, nil
end

-- The consolidation slot of a memory: one stable run and job that re-arms on
-- the configured cadence. Scheduling again returns the standing slot.
function M.arm_consolidation(component_id: string, interval_hours: number): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id = "consolidate:" .. component_id
    local run, created, err = M._runs.create({
        id = run_id, component_id = component_id, run_type = types.RUN_TYPE.CONSOLIDATE,
        input = {}, actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    })
    if err then return nil, err end
    if not created and (run :: any).job_id and (run :: any).job_id ~= "" then
        return { job_id = (run :: any).job_id, run_id = run_id }, nil
    end
    local queued, enqueue_err = enqueue(run, identity, types.RUN_TYPE.CONSOLIDATE, {
        slot = true, scheduled_at = types.after_seconds(interval_hours * 3600), queue_tier = "maintenance",
    })
    if enqueue_err then return nil, enqueue_err end
    return { job_id = (queued :: any).id, run_id = run_id }, nil
end

-- Brings the consolidation slot forward to now.
function M.wake_consolidation(component_id: string): (any?, error?)
    local run, err = M._runs.get("consolidate:" .. component_id)
    if err then return nil, err end
    if not (run :: any).job_id or (run :: any).job_id == "" then
        return nil, types.not_found("memory consolidation is not scheduled for " .. component_id)
    end
    local _, wake_err = M._jobs.wake_job((run :: any).job_id, { control = true })
    if wake_err then return nil, types.unavailable("memory consolidation could not be woken: " .. tostring(wake_err)) end
    return { job_id = (run :: any).job_id, run_id = (run :: any).id, woken = true }, nil
end

function M.schedule_reembed(component_id: string): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id, hash_err = run_id_for({ "reembed", component_id, types.now() })
    if hash_err then return nil, hash_err end
    local run, _created, err = M._runs.create({
        id = run_id :: string, component_id = component_id, run_type = types.RUN_TYPE.REEMBED, input = {},
        actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    })
    if err then return nil, err end
    local queued, enqueue_err = enqueue(run, identity, types.RUN_TYPE.REEMBED, { max_attempts = 1, queue_tier = "maintenance" })
    if enqueue_err then return nil, enqueue_err end
    return { run_id = run_id, job_id = (queued :: any).id }, nil
end

-- Closes the run as failed and answers the job: a retryable error is raised so
-- the queue retries it; any other failure is a deterministic job error.
local function fail(run_id: string, err: any): any
    local message = tostring(err)
    local _, close_err = M._runs.finish(run_id, types.RUN_STATUS.FAILED, message)
    if close_err then message = message .. " (the run record also failed to close: " .. tostring(close_err) .. ")" end
    if type(err) == "userdata" and err:retryable() then
        error(errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = message }))
    end
    return { ok = false, job_error = message, failure_class = "deterministic" }
end

local function load_run(value: any, run_type: string): (any?, any?)
    local payload = type(value) == "table" and type(value.payload) == "table" and value.payload or {}
    local run_id = types.trim(payload.run_id)
    if run_id == "" then return nil, { ok = false, job_error = "memory job payload is missing run_id", failure_class = "deterministic" } end
    local run, err = M._runs.get(run_id)
    if err or not run then
        return nil, { ok = false, job_error = "the memory run could not be read: " .. tostring(err), failure_class = "deterministic" }
    end
    if (run :: any).component_id ~= types.trim(payload.component_id) or (run :: any).run_type ~= run_type then
        return nil, { ok = false, job_error = "the memory job does not match its run record", failure_class = "deterministic" }
    end
    return run, nil
end

-- The queue frame is a worker, not the requester: re-admit the run's identity
-- before doing its work.
local function admit(value: any, run_type: string): any
    local run, refusal = load_run(value, run_type)
    if refusal then return refusal end
    local identity, identity_err = M._identity.from_row((run :: any).actor_id, (run :: any).actor_context)
    if identity_err or not identity then
        return fail((run :: any).id, "the requester's stored identity is invalid: " .. tostring(identity_err))
    end
    local outcome, run_err = M._identity.run_as(identity, AUTHORIZED[run_type], value, { deferred_owner = M.JOB[run_type] })
    if run_err then
        if type(run_err) == "userdata" and run_err:retryable() then error(run_err) end
        return fail((run :: any).id, run_err)
    end
    return outcome
end

local function claim(run: any, repeatable: boolean): any?
    local claimed, err = M._runs.claim(run.id, repeatable)
    if err then return fail(run.id, err) end
    if not claimed then return { ok = true, outcome = "declined", record = { status = "completed" } } end
    local _, access_err = M._component.validate_access(run.component_id, M._component.ACCESS.WRITE)
    if access_err then return fail(run.id, "memory access denied: " .. tostring(access_err)) end
    return nil
end

local function settings(component_id: string): (any?, any?, error?)
    local store, err = M._stores.get(component_id)
    if err then return nil, nil, err end
    local cfg, cfg_err = config.effective((store :: any).config)
    if cfg_err then return nil, nil, cfg_err end
    return store, cfg, nil
end

function M.derive_run(value: any): any
    return admit(value, types.RUN_TYPE.DERIVE)
end

function M.derive_authorized(value: any): any
    local run, refusal = load_run(value, types.RUN_TYPE.DERIVE)
    if refusal then return refusal end
    local declined = claim(run, false)
    if declined then return declined end
    local store, cfg, settings_err = settings(run.component_id)
    if settings_err then return fail(run.id, settings_err) end
    local input = run.input or {}
    local span = type(input.span) == "table" and input.span or {}
    local event_times: { [string]: string } = {}
    for _, message in ipairs(span) do
        local at = types.utc(message.created_at)
        if at then event_times[message.id] = at end
    end
    local candidates: any = {}
    if #span > 0 then
        local extracted, extract_err = M._models.extract(cfg.extraction_model, span, cfg.extraction_instructions)
        if extract_err then return fail(run.id, extract_err) end
        candidates = extracted
    end
    local deadline = type(value) == "table" and type(value.job) == "table" and value.job.deadline or nil
    local result, write_err = M._writer.remember(candidates, {
        component_id = run.component_id,
        embedding_model = store.embedding_model,
        judge_model = cfg.judge_model,
        scope_family = types.SCOPE.OWNER,
        scope_id = types.trim(input.owner_id),
        source = input.source or types.ITEM_SOURCE.CAPTURE,
        host_kind = run.host_kind,
        host_id = run.host_id,
        event_times = event_times,
    }, "derive:" .. run.id, deadline, run.host_kind ~= "content" and {
        { type = types.EVENT.CAPTURE_ADVANCED, body = {
            host_kind = run.host_kind, host_id = run.host_id, agent_id = run.agent_id, last_event_id = run.to_event_id,
        } },
    } or nil)
    if write_err then return fail(run.id, write_err) end
    local stats = (result :: any).stats
    stats.candidates = #candidates
    local _, close_err = M._runs.finish(run.id, types.RUN_STATUS.SUCCEEDED, nil, stats)
    if close_err then return fail(run.id, close_err) end
    return { ok = true, record = { status = "completed" }, stats = stats }
end

function M.consolidate_run(value: any): any
    return admit(value, types.RUN_TYPE.CONSOLIDATE)
end

function M.consolidate_authorized(value: any): any
    local run, refusal = load_run(value, types.RUN_TYPE.CONSOLIDATE)
    if refusal then return refusal end
    local declined = claim(run, true)
    if declined then return declined end
    local store, cfg, settings_err = settings(run.component_id)
    if settings_err then return fail(run.id, settings_err) end
    local next_at = types.after_seconds((tonumber(cfg.consolidation_interval_hours) or 24) * 3600)
    local current, list_err = M._items.list(run.component_id, {
        scope_family = types.SCOPE.OWNER, statuses = { types.STATUS.CURRENT }, limit = 500,
    })
    if list_err then return fail(run.id, list_err) end
    local by_scope: { [string]: { any } } = {}
    local order: { string } = {}
    for _, item in ipairs(current :: any) do
        if not by_scope[item.scope_id] then
            by_scope[item.scope_id] = {}
            order[#order + 1] = item.scope_id
        end
        table.insert(by_scope[item.scope_id], item)
    end
    table.sort(order)
    local stats = { scopes = 0, added = 0, superseded = 0, merged = 0, conflicted = 0, noop = 0 }
    local deadline = type(value) == "table" and type(value.job) == "table" and value.job.deadline or nil
    for _, scope_id in ipairs(order) do
        local scope_items = by_scope[scope_id]
        local reflected, reflect_err = M._models.reflect(cfg.extraction_model, scope_items)
        if reflect_err then return fail(run.id, reflect_err) end
        local result, write_err = M._writer.remember(reflected :: any, {
            component_id = run.component_id, embedding_model = store.embedding_model, judge_model = cfg.judge_model,
            scope_family = types.SCOPE.OWNER, scope_id = scope_id, source = types.ITEM_SOURCE.REFLECTION,
        }, "consolidate:" .. run.id .. ":" .. scope_id .. ":" .. tostring(run.started_at), deadline, nil)
        if write_err then return fail(run.id, write_err) end
        stats.scopes = stats.scopes + 1
        for key, count in pairs((result :: any).stats) do
            if stats[key] ~= nil then stats[key] = stats[key] + count end
        end
    end
    local _, completed_err = M._writer.apply(run.component_id, {
        { type = types.EVENT.CONSOLIDATION_COMPLETED, body = { run_id = run.id, stats = stats } },
    }, "consolidated:" .. run.id .. ":" .. tostring(run.started_at), deadline)
    if completed_err then return fail(run.id, completed_err) end
    local _, close_err = M._runs.finish(run.id, types.RUN_STATUS.SUCCEEDED, nil, stats)
    if close_err then return fail(run.id, close_err) end
    return { ok = true, record = { status = "completed" }, rearm = next_at, stats = stats }
end

function M.reembed_run(value: any): any
    return admit(value, types.RUN_TYPE.REEMBED)
end

function M.reembed_authorized(value: any): any
    local run, refusal = load_run(value, types.RUN_TYPE.REEMBED)
    if refusal then return refusal end
    local declined = claim(run, false)
    if declined then return declined end
    local store, _cfg, settings_err = settings(run.component_id)
    if settings_err then return fail(run.id, settings_err) end
    local after, embedded = "", 0
    while true do
        local page, page_err = M._items.page_for_embedding(run.component_id, after, M.REEMBED_PAGE)
        if page_err then return fail(run.id, page_err) end
        if #(page :: any) == 0 then break end
        local texts: { string } = {}
        for i, row in ipairs(page :: any) do texts[i] = row.content end
        local vectors, embed_err = M._models.embed(store.embedding_model, texts)
        if embed_err then return fail(run.id, embed_err) end
        for i, row in ipairs(page :: any) do
            local _, vector_err = M._items.set_embedding(run.component_id, row.id, (vectors :: any)[i])
            if vector_err then return fail(run.id, vector_err) end
            embedded = embedded + 1
            after = row.id
        end
    end
    local _, close_err = M._runs.finish(run.id, types.RUN_STATUS.SUCCEEDED, nil, { embedded = embedded })
    if close_err then return fail(run.id, close_err) end
    return { ok = true, record = { status = "completed" }, stats = { embedded = embedded } }
end

return M
