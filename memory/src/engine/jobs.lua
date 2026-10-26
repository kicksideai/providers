-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Deferred memory work. Every run is a kickside_memory_kb_runs row that holds the
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
local reconcile = require("memory_reconcile")
local component = require("component")
local jobs = require("jobs")
local execution_identity = require("execution_identity")

local M = {}

local JOB = {
    derive = "kickside.memory.engine:derive_worker",
    consolidate = "kickside.memory.engine:consolidate_worker",
    reembed = "kickside.memory.engine:reembed_worker",
}
local AUTHORIZED = {
    derive = "kickside.memory.engine:derive_authorized",
    consolidate = "kickside.memory.engine:consolidate_authorized",
    reembed = "kickside.memory.engine:reembed_authorized",
}

local DERIVE_ATTEMPTS = 3
local REEMBED_PAGE = 64
-- Most keys an extraction is offered for reuse.
local KEY_LIMIT = 200

local function frozen_identity(): (any?, any?, error?)
    local identity, err = execution_identity.capture()
    if err or not identity then return nil, nil, types.internal("the requester's identity could not be frozen: " .. tostring(err)) end
    local row, row_err = execution_identity.to_row(identity)
    if row_err or not row then return nil, nil, types.internal("the requester's identity is not storable: " .. tostring(row_err)) end
    return identity, row, nil
end

local function enrollment(run: any, identity: any, run_type: string, extra: any): any
    local params: { [string]: any } = {
        namespace = "kickside.memory." .. run_type,
        scope = run.component_id,
        key = run.id,
        owner_locator = { kind = identity.principal.kind, id = identity.principal.id },
        thread_id = run.component_id,
        job_type = JOB[run_type],
        concurrency_key = "kickside.memory:" .. run.component_id,
        immutable_payload = { component_id = run.component_id, run_id = run.id, run_type = run_type },
    }
    for k, v in pairs(extra) do params[k] = v end
    return params
end

-- A derive run over a span, under the caller's frozen identity; its id is
-- derived from the memory, host and event range so a span schedules once.
local function new_derive_run(component_id: string, host_kind: string, host_id: string, agent_id: string?,
    from_event_id: string, to_event_id: string, span: { any }): (any?, any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, nil, id_err end
    local run_id, hash_err = types.digest({ "derive", component_id, host_kind, host_id, from_event_id, to_event_id })
    if hash_err then return nil, nil, hash_err end
    return {
        id = run_id :: string, component_id = component_id, run_type = types.RUN_TYPE.DERIVE,
        host_kind = host_kind, host_id = host_id, agent_id = agent_id,
        from_event_id = from_event_id, to_event_id = to_event_id,
        input = { span = types.bounded_span(span), owner_id = (identity :: any).principal.id },
        actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    }, identity, nil
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
    local run, identity, err = new_derive_run(capture.component_id, capture.host_kind, capture.host_id, capture.agent_id,
        capture.from_event_id, capture.to_event_id, capture.span)
    if err then return nil, err end
    return runs.schedule(run, enrollment(run, identity, types.RUN_TYPE.DERIVE, { max_attempts = DERIVE_ATTEMPTS }), capture.from_event_id)
end

-- Schedules a derive run over ingested content (no capture cursor).
function M.ingest(component_id: string, source_event_id: string, span: { any }): (any?, error?)
    local run, identity, err = new_derive_run(component_id, "content", component_id, nil, source_event_id, source_event_id, span)
    if err then return nil, err end
    return runs.schedule(run, enrollment(run, identity, types.RUN_TYPE.DERIVE, { max_attempts = DERIVE_ATTEMPTS }))
end

-- The consolidation slot of a memory: one stable run and job that re-arms on
-- the configured cadence. Scheduling again returns the standing slot.
function M.arm_consolidation(component_id: string, interval_hours: number): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id = "consolidate:" .. component_id
    local run = {
        id = run_id, component_id = component_id, run_type = types.RUN_TYPE.CONSOLIDATE,
        input = {}, actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    }
    return runs.schedule(run, enrollment(run, identity, types.RUN_TYPE.CONSOLIDATE, {
        slot = true, scheduled_at = types.after_seconds(interval_hours * 3600), queue_tier = "maintenance",
    }))
end

-- Brings the consolidation slot forward to now.
function M.wake_consolidation(component_id: string): (any?, error?)
    local run, err = runs.get("consolidate:" .. component_id)
    if err then return nil, err end
    if not (run :: any).job_id or (run :: any).job_id == "" then
        return nil, types.not_found("memory consolidation is not scheduled for " .. component_id)
    end
    local _, wake_err = jobs.wake_job((run :: any).job_id, { control = true })
    if wake_err then return nil, types.failed("memory consolidation could not be woken", wake_err) end
    return { job_id = (run :: any).job_id, run_id = (run :: any).id, woken = true }, nil
end

function M.schedule_reembed(component_id: string): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id, hash_err = types.digest({ "reembed", component_id, types.now() })
    if hash_err then return nil, hash_err end
    local run = {
        id = run_id :: string, component_id = component_id, run_type = types.RUN_TYPE.REEMBED, input = {},
        actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    }
    return runs.schedule(run, enrollment(run, identity, types.RUN_TYPE.REEMBED, { max_attempts = 1, queue_tier = "maintenance" }))
end

local function retryable(err: any): boolean
    return type(err) == "userdata" and err:retryable()
end

-- Closes the run as failed and answers the job: a retryable error is raised so
-- the queue retries it; any other failure is a deterministic job error.
local function fail(run_id: string, err: any): any
    local message = tostring(err)
    local _, close_err = runs.finish(run_id, types.RUN_STATUS.FAILED, message)
    if close_err then error(close_err) end
    -- Queue diagnostics outlive erasable input, so they carry classification only.
    local diagnostic = "memory operation failed"
    if type(err) == "userdata" then diagnostic = diagnostic .. " (" .. tostring(err:kind()) .. ")" end
    if retryable(err) then
        error(errors.new({ kind = err:kind(), retryable = true, message = diagnostic }))
    end
    return { ok = false, job_error = diagnostic, failure_class = "deterministic" }
end

local function load_run(value: any, run_type: string): (any?, any?)
    local payload = type(value) == "table" and type(value.payload) == "table" and value.payload or {}
    local run_id = types.trim(payload.run_id)
    if run_id == "" then return nil, { ok = false, job_error = "memory job payload is missing run_id", failure_class = "deterministic" } end
    local run, err = runs.get(run_id)
    if err then
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
    local identity, identity_err = execution_identity.from_row((run :: any).actor_id, (run :: any).actor_context)
    if identity_err or not identity then
        return fail((run :: any).id, "the requester's stored identity is invalid: " .. tostring(identity_err))
    end
    local outcome, run_err = execution_identity.run_as(identity, AUTHORIZED[run_type], value, { deferred_owner = JOB[run_type] })
    if run_err then
        if retryable(run_err) then error(run_err) end
        return fail((run :: any).id, run_err)
    end
    return outcome
end

-- Claims the run for this attempt and records the cycle it belongs to on
-- `run.cycle`; answers the job outcome when the attempt does not proceed.
local function claim(run: any, repeatable: boolean): any?
    local claimed, err = runs.claim(run.id, repeatable)
    if err then return fail(run.id, err) end
    if not (claimed :: any).claimed then return { ok = true, outcome = "declined", record = { status = "completed" } } end
    run.cycle = (claimed :: any).cycle
    local _, access_err = component.validate_access(run.component_id, component.ACCESS.WRITE)
    if access_err then return fail(run.id, "memory access denied: " .. tostring(access_err)) end
    return nil
end

local function settings(component_id: string): (any?, any?, error?)
    local store, err = stores.get(component_id)
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
    local deadline = value.job.deadline
    local result, write_err = writer.write(run.component_id, "derive:" .. run.id, {
        source = types.ITEM_SOURCE.CAPTURE, deadline = deadline,
        extra_events = run.host_kind ~= "content" and {
            { type = types.EVENT.CAPTURE_ADVANCED, body = {
                host_kind = run.host_kind, host_id = run.host_id, agent_id = run.agent_id, last_event_id = run.to_event_id,
            } },
        } or nil,
    }, function(d: any): (any?, error?)
        local fresh, read_err = runs.get(run.id)
        if read_err then return nil, read_err end
        if not fresh then return nil, types.not_found("memory run not found") end
        local input = fresh.input
        local span = input.span or {}
        local events: { [string]: any } = {}
        for _, message in ipairs(span) do
            events[message.id] = { at = types.utc(message.created_at), text = message.text }
        end
        local candidates: any = {}
        if #span > 0 then
            local keys, keys_err = items.keys(run.component_id, types.scope_key(types.SCOPE.OWNER, types.trim(input.owner_id)), KEY_LIMIT)
            if keys_err then return nil, keys_err end
            local extracted, extract_err = models.extract(cfg.extraction_model, span, keys :: any, cfg.extraction_instructions)
            if extract_err then return nil, extract_err end
            candidates = extracted
        end
        d.stats.candidates = #candidates
        return nil, reconcile.decide(d, candidates, {
            embedding_model = store.embedding_model, judge_model = cfg.judge_model,
            scope_family = types.SCOPE.OWNER, scope_id = types.trim(input.owner_id),
            host_kind = run.host_kind, host_id = run.host_id, events = events, run_id = run.id,
        })
    end)
    if write_err then return fail(run.id, write_err) end
    local stats = (result :: any).stats
    local _, close_err = runs.finish(run.id, types.RUN_STATUS.SUCCEEDED, nil, stats)
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
    local next_at = types.after_seconds(cfg.consolidation_interval_hours * 3600)
    local result, write_err = writer.write(run.component_id, "consolidate:" .. run.id .. ":" .. run.cycle, {
        source = types.ITEM_SOURCE.REFLECTION, deadline = value.job.deadline,
    }, function(d: any): (any?, error?)
        local current, list_err = items.list(run.component_id, {
            scope_family = types.SCOPE.OWNER, statuses = { types.STATUS.CURRENT }, limit = 500,
        })
        if list_err then return nil, list_err end
        local by_scope: { [string]: { any } } = {}
        local order: { string } = {}
        for _, item in ipairs(current :: any) do
            if not by_scope[item.scope_id] then by_scope[item.scope_id] = {}; order[#order + 1] = item.scope_id end
            table.insert(by_scope[item.scope_id], item)
        end
        table.sort(order)
        d.stats.scopes = 0
        for _, scope_id in ipairs(order) do
            local reflected, reflect_err = models.reflect(cfg.extraction_model, by_scope[scope_id] :: { any })
            if reflect_err then return nil, reflect_err end
            local reconcile_err = reconcile.decide(d, reflected :: any, {
                embedding_model = store.embedding_model, judge_model = cfg.judge_model,
                scope_family = types.SCOPE.OWNER, scope_id = scope_id, run_id = run.id,
            })
            if reconcile_err then return nil, reconcile_err end
            d.stats.scopes = d.stats.scopes + 1
        end
        d:emit(types.EVENT.CONSOLIDATION_COMPLETED, { run_id = run.id, stats = d.stats })
        return nil, nil
    end)
    if write_err then return fail(run.id, write_err) end
    local stats = result.stats
    local _, close_err = runs.finish(run.id, types.RUN_STATUS.SUCCEEDED, nil, stats)
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
        local page, page_err = items.page_for_embedding(run.component_id, after, REEMBED_PAGE)
        if page_err then return fail(run.id, page_err) end
        if #(page :: any) == 0 then break end
        local texts: { string } = {}
        for i, row in ipairs(page :: any) do texts[i] = row.content end
        local vectors, embed_err = models.embed(store.embedding_model, texts)
        if embed_err then return fail(run.id, embed_err) end
        for i, row in ipairs(page :: any) do
            local _, vector_err = items.set_embedding(run.component_id, row.id, (vectors :: any)[i], row.content_hash)
            if vector_err then return fail(run.id, vector_err) end
            embedded = embedded + 1
            after = row.id
        end
    end
    local _, close_err = runs.finish(run.id, types.RUN_STATUS.SUCCEEDED, nil, { embedded = embedded })
    if close_err then return fail(run.id, close_err) end
    return { ok = true, record = { status = "completed" }, stats = { embedded = embedded } }
end

return M
