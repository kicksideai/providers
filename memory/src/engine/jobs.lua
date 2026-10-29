-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local uuid = require("uuid")
local canonical_json = require("canonical_json")
local json = require("json")
local types = require("types")
local config = require("memory_config")
local runs = require("memory_runs")
local stores = require("memory_stores")
local items = require("memory_items")
local payloads = require("memory_payloads")
local models = require("memory_models")
local writer = require("memory_writer")
local ledger = require("memory_ledger")
local reconcile = require("memory_reconcile")
local component = require("component")
local jobs = require("jobs")
local execution_identity = require("execution_identity")
local db = require("memory_db")

local M = { INPUT_BYTES = 24000 }

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
local KEY_LIMIT = 200
local CONSOLIDATION_ITEMS = 500
local SECONDS_PER_HOUR = 3600

function M.consolidation_run_id(component_id: string): string
    return "consolidate:" .. component_id
end

function M.document_text(title: any, content: string): string
    local heading = types.trim(title)
    return heading == "" and content or heading .. "\n\n" .. content
end

type Capture = {
    component_id: string,
    host_kind: string,
    host_id: string,
    agent_id: string?,
    from_event_id: string?,
    to_event_id: string,
    span: { any },
    context: { any }?,
    isolated: boolean?,
}

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

local function source_size(span: { any }): integer
    local size = 0
    for _, message in ipairs(span) do size = size + #(message.text or "") end
    return size
end

local function new_derive_run(run_id: string, capture: Capture): (any?, any?, error?)
    local size = source_size(capture.span)
    if size > M.INPUT_BYTES then
        return nil, nil, types.invalid("memory derive input exceeds " .. tostring(M.INPUT_BYTES) .. " bytes", {
            code = "source_too_large", source_bytes = size, input_limit_bytes = M.INPUT_BYTES,
        })
    end
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, nil, id_err end
    local principal = (identity :: any).principal
    local input: any = { span = capture.span, context = capture.context, isolated = capture.isolated,
        owner_id = principal.kind == "user" and not capture.isolated and principal.id or nil }
    return {
        id = run_id :: string, component_id = capture.component_id, run_type = types.RUN_TYPE.DERIVE,
        status = types.RUN_STATUS.SCHEDULED,
        host_kind = capture.host_kind, host_id = capture.host_id, agent_id = capture.agent_id,
        from_event_id = capture.from_event_id, to_event_id = capture.to_event_id,
        input = input,
        actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    }, identity, nil
end

function M.capture(capture: Capture, following: { Capture }?): (any?, error?)
    local run, identity, err = new_derive_run(uuid.v7(), capture)
    if err then return nil, err end
    local rest = {}
    for _, part in ipairs(following or {}) do
        local next_run, next_identity, next_err = new_derive_run(uuid.v7(), part)
        if next_err then return nil, next_err end
        rest[#rest + 1] = { run = next_run, params = enrollment(next_run, next_identity, types.RUN_TYPE.DERIVE,
            { max_attempts = DERIVE_ATTEMPTS }) }
    end
    return runs.schedule(run, enrollment(run, identity, types.RUN_TYPE.DERIVE,
        { max_attempts = DERIVE_ATTEMPTS }), capture.from_event_id, rest)
end

function M.reject_capture(run: any): (any?, error?)
    local _, settle_err = ledger.settled_head(run.component_id)
    if settle_err then return nil, settle_err end
    local result, err = db.write(run.component_id, function(tx: any, sqlite: boolean): (any?, error?)
        local state, state_err = runs.capture_available_tx(tx, sqlite, run, run.from_event_id)
        if state_err then return nil, state_err end
        if not state.available then return { recorded = false, run_id = state.run_id }, nil end
        local _, insert_err = runs.insert_tx(tx, run)
        if insert_err then return nil, insert_err end
        local body = {
            host_kind = run.host_kind, host_id = run.host_id, agent_id = run.agent_id,
            from_event_id = run.from_event_id, last_event_id = run.to_event_id,
        }
        local _, append_err = ledger.append_tx(tx, run.component_id, { { type = types.EVENT.CAPTURE_ADVANCED, body = body } }, nil, "capture:" .. run.id)
        if append_err then return nil, append_err end
        local cursor_err = runs.advance_cursor_tx(tx, run.component_id, body, types.now())
        if cursor_err then return nil, cursor_err end
        return { recorded = true, run_id = run.id }, nil
    end)
    if err then return nil, err end
    if result.recorded then
        local notify_err = ledger.appended(run.component_id)
        if notify_err then return nil, notify_err end
    end
    return result, nil
end

local function reject_content(run: any): (any?, error?)
    return db.write(run.component_id, function(tx: any, _sqlite: boolean): (any?, error?)
        local result, err = runs.insert_tx(tx, run)
        if err then return nil, err end
        return { recorded = result.created, run_id = run.id }, nil
    end)
end

function M.ingest(component_id: string, source_event_id: string, span: { any }): (any?, error?)
    local run_id, hash_err = canonical_json.hash({ "derive", component_id, "content", source_event_id })
    if hash_err then return nil, hash_err end
    local capture: Capture = { component_id = component_id, host_kind = "content", host_id = component_id,
        to_event_id = source_event_id, span = span }
    local run, identity, err = new_derive_run(run_id :: string, capture)
    if err then
        local details = type(err) == "userdata" and err:details() or nil
        if type(details) == "table" and details.code == "source_too_large" then
            return reject_content({
                id = run_id :: string, component_id = component_id, run_type = types.RUN_TYPE.DERIVE,
                status = types.RUN_STATUS.REJECTED, finished_at = types.now(), actor_id = types.actor_id(),
                host_kind = "content", host_id = component_id, to_event_id = source_event_id,
                stats = { rejected = 1, rejected_source_too_large = 1, source_bytes = details.source_bytes, input_limit_bytes = details.input_limit_bytes },
                last_error = "source_too_large: memory source event exceeds " .. tostring(details.input_limit_bytes) .. " bytes (" .. tostring(details.source_bytes) .. " bytes)",
            })
        end
        return nil, err
    end
    return runs.schedule(run, enrollment(run, identity, types.RUN_TYPE.DERIVE, { max_attempts = DERIVE_ATTEMPTS }))
end

function M.arm_consolidation(component_id: string, interval_hours: number): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id = M.consolidation_run_id(component_id)
    local run = {
        id = run_id, component_id = component_id, run_type = types.RUN_TYPE.CONSOLIDATE,
        input = {}, actor_id = (row :: any).actor_id, actor_context = (row :: any).actor_context,
    }
    return runs.schedule(run, enrollment(run, identity, types.RUN_TYPE.CONSOLIDATE, {
        slot = true, scheduled_at = types.after_seconds(interval_hours * SECONDS_PER_HOUR), queue_tier = "maintenance",
    }))
end

function M.wake_consolidation(component_id: string): (any?, error?)
    local run, err = runs.get(M.consolidation_run_id(component_id))
    if err then return nil, err end
    if not run or not (run :: any).job_id or (run :: any).job_id == "" then
        return nil, types.not_found("memory consolidation is not scheduled for " .. component_id)
    end
    local _, wake_err = jobs.wake_job((run :: any).job_id, { control = true })
    if wake_err then return nil, types.failed("memory consolidation could not be woken", wake_err) end
    return { job_id = (run :: any).job_id, run_id = (run :: any).id, woken = true }, nil
end

function M.schedule_reembed(component_id: string): (any?, error?)
    local identity, row, id_err = frozen_identity()
    if id_err then return nil, id_err end
    local run_id, hash_err = canonical_json.hash({ "reembed", component_id, types.now() })
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

-- Queue diagnostics retain classification independently of erasable input.
local function fail(run_id: string, err: any, stats: any?): any
    local failure, failure_err = types.failure(err)
    if failure_err then error(failure_err) end
    local message, encode_err = json.encode(failure)
    if encode_err then error(encode_err) end
    local _, close_err = runs.finish(run_id, types.RUN_STATUS.FAILED, message, stats)
    if close_err then error(close_err) end
    if retryable(err) then
        error(errors.new({ kind = err:kind(), retryable = true, message = err:message(),
            details = { cause_kind = (failure :: any).code } }))
    end
    return { ok = false, job_error = message, failure_class = "deterministic" }
end

local function load_run(value: any, run_type: string): (any?, any?)
    local payload = type(value) == "table" and type(value.payload) == "table" and value.payload or {}
    local run_id = types.trim(payload.run_id)
    if run_id == "" then return nil, { ok = false, job_error = "memory job payload is missing run_id", failure_class = "deterministic" } end
    local run, err = runs.get(run_id)
    if err then
        return nil, { ok = false, job_error = "the memory run could not be read: " .. tostring(err), failure_class = "deterministic" }
    end
    if not run then
        return nil, { ok = false, job_error = "the memory run no longer exists", failure_class = "deterministic" }
    end
    if (run :: any).component_id ~= types.trim(payload.component_id) or (run :: any).run_type ~= run_type then
        return nil, { ok = false, job_error = "the memory job does not match its run record", failure_class = "deterministic" }
    end
    return run, nil
end

local function admit(value: any, run_type: string): any
    local run, refusal = load_run(value, run_type)
    if refusal then return refusal end
    local identity, identity_err = execution_identity.from_row((run :: any).actor_id, (run :: any).actor_context)
    if identity_err or not identity then
        return fail((run :: any).id, types.internal("the requester's stored identity is invalid: " .. tostring(identity_err)))
    end
    local outcome, run_err = execution_identity.run_as(identity, AUTHORIZED[run_type], value, { deferred_owner = JOB[run_type] })
    if run_err then
        return fail((run :: any).id, run_err)
    end
    return outcome
end

local function claim(run: any, repeatable: boolean): any?
    local claimed, err = runs.claim(run.id, repeatable)
    if err then return fail(run.id, err) end
    if not (claimed :: any).claimed then return { ok = true, outcome = "declined", record = { status = "completed" } } end
    run.cycle = (claimed :: any).cycle
    local _, access_err = component.validate_access(run.component_id, component.ACCESS.WRITE)
    if access_err then return fail(run.id, types.failed("memory access denied", access_err)) end
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
    local failed_stats = nil
    local captures_history = run.agent_id ~= nil
    local result, write_err = writer.write(run.component_id, "derive:" .. run.id, {
        source = types.ITEM_SOURCE.CAPTURE, deadline = deadline,
        extra_events = captures_history and {
            { type = types.EVENT.CAPTURE_ADVANCED, body = {
                host_kind = run.host_kind, host_id = run.host_id, agent_id = run.agent_id, from_event_id = run.from_event_id, last_event_id = run.to_event_id,
            } },
        } or nil,
    }, function(d: any): (any?, error?)
        failed_stats = d.stats
        local fresh, read_err = runs.get(run.id)
        if read_err then return nil, read_err end
        if not fresh then return nil, types.not_found("memory run not found") end
        if captures_history then
            local cursor, cursor_err = runs.cursor(run.component_id, run.host_kind, run.host_id)
            if cursor_err then return nil, cursor_err end
            if (cursor and cursor.last_event_id or nil) ~= run.from_event_id then
                return nil, types.invalid("memory capture predecessor has not advanced the cursor")
            end
        end
        local input = fresh.input
        local span = input.span or {}
        local events: { [string]: any } = {}
        for _, message in ipairs(span) do
            events[message.id] = { at = types.utc(message.created_at), text = message.text }
        end
        local families = {}
        for _, message in ipairs(span) do
            if models.is_statement(message, run.agent_id) then
                local author = message.author
                if type(author) == "table" and author.kind == "user" and author.id == input.owner_id then
                    families[types.SCOPE.OWNER] = true
                else
                    families[types.SCOPE.AGENT] = true
                end
            end
        end
        if run.host_kind == "content" then families[types.SCOPE.OWNER] = true end
        local keys = {}
        for _, scope in ipairs({{types.SCOPE.OWNER, input.owner_id}, {types.SCOPE.AGENT, run.agent_id}}) do
            if scope[2] ~= nil and families[scope[1]] then
                local rows, keys_err = items.keys(run.component_id, types.scope_key(scope[1], scope[2]), KEY_LIMIT)
                if keys_err then return nil, keys_err end
                for _, row in ipairs(rows) do row.scope_family = scope[1]; keys[#keys + 1] = row end
            end
        end
        local learning = input.isolated or not families[types.SCOPE.OWNER]
        local candidates, extract_err, rejected_candidates = models.extract({
            model = cfg.extraction_model, span = span, keys = keys, instructions = cfg.extraction_instructions,
            context = input.context, isolated = learning, owner_id = input.owner_id, agent_id = run.agent_id,
        })
        if extract_err then return nil, extract_err end
        local owner, learned = {}, {}
        local authors = {}
        for _, message in ipairs(span) do authors[message.id] = message.author end
        for _, candidate in ipairs(candidates) do
            local author = authors[candidate.event_id]
            if models.scope_family(candidate, author, input.owner_id) == types.SCOPE.OWNER then
                owner[#owner + 1] = candidate
            elseif run.agent_id ~= nil then
                learned[#learned + 1] = candidate
            else
                return nil, types.invalid("memory evidence has no authorized scope")
            end
        end
        d.stats.candidates = #candidates
        if rejected_candidates and next(rejected_candidates) then d.stats.rejected_candidates = rejected_candidates end
        for _, group in ipairs({{family = types.SCOPE.OWNER, id = input.owner_id, candidates = owner},
            {family = types.SCOPE.AGENT, id = run.agent_id, candidates = learned}}) do
            local decide_err = reconcile.decide(d, group.candidates, {
                embedding_model = store.embedding_model, judge_model = cfg.judge_model,
                scope_family = group.family, scope_id = types.trim(group.id),
                host_kind = run.host_kind, host_id = run.host_id, events = events, run_id = run.id,
                conversation = models.conversation(span, input.context, run.agent_id),
            })
            if decide_err then return nil, decide_err end
        end
        return nil, nil
    end)
    if write_err then return fail(run.id, write_err, failed_stats) end
    local _, settle_err = ledger.settled_head(run.component_id, deadline)
    if settle_err then return fail(run.id, settle_err) end
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
    local next_at = types.after_seconds(cfg.consolidation_interval_hours * SECONDS_PER_HOUR)
    local failed_stats = nil
    local result, write_err = writer.write(run.component_id, "consolidate:" .. run.id .. ":" .. run.cycle, {
        source = types.ITEM_SOURCE.REFLECTION, deadline = value.job.deadline,
    }, function(d: any): (any?, error?)
        failed_stats = d.stats
        local current, list_err = items.list(run.component_id, {
            scope_family = types.SCOPE.OWNER, statuses = { types.STATUS.CURRENT }, limit = CONSOLIDATION_ITEMS,
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
            local reflected, reflect_err = models.reflect({
                model = cfg.extraction_model, items = by_scope[scope_id] :: { any }, instructions = cfg.extraction_instructions,
            })
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
    if write_err then return fail(run.id, write_err, failed_stats) end
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
            local _, vector_err = payloads.set_embedding(run.component_id, row.id, (vectors :: any)[i], row.content_hash)
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
