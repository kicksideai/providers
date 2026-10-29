-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local sql = require("sql")
local contract = require("contract")
local security = require("security")
local funcs = require("funcs")
local channel = require("channel")
local uuid = require("uuid")
local time = require("time")
local script = require("script")
local history = require("history")
local json = require("json")

local M = { script = script, history = history }
local ensure_user

local RUN_CONTEXT = { contract = "wippy.agent:run_context", binding = "wippy.session.run_context:binding" }

function M.record_chat(user_id: string, host_id: string, messages: { any }): { string }
    ensure_user(user_id)
    local event_ids, err = M.call_as(user_id, "app.suites:session_history", {
        user_id = user_id, session_id = host_id, messages = messages,
    })
    if err then error(tostring(err)) end
    for index, event_id in ipairs(event_ids) do messages[index].id = event_id end
    return event_ids
end

function M.read_chat(user_id: string, args: any): (any?, any?)
    return M.call_as(user_id, "app.suites:session_history_read", args)
end

function M.payload(phase: string, session_id: string, agent_id: string, extra: any?): any
    local host = { kind = "session", id = session_id, session_id = session_id }
    local payload = {
        phase = phase, host = host, agent = { id = agent_id, model = "test-fast" },
        run_context = { contract = RUN_CONTEXT.contract, binding = RUN_CONTEXT.binding, host = host },
    }
    if phase == "checkpoint" then payload.options = { model = "class:fast", max_tokens = 1000 } end
    for k, v in pairs(extra or {}) do payload[k] = v end
    return payload
end

function M.agent_context(memory_id: string, session_id: string, agent_id: string, extra: any?): any
    local host = { kind = "session", id = session_id, session_id = session_id }
    local context = {
        memory_id = memory_id, thread_id = memory_id, agent_id = agent_id,
        agent_run = { host = host, agent = { id = agent_id }, run_context = { contract = RUN_CONTEXT.contract, binding = RUN_CONTEXT.binding, host = host } },
    }
    for k, v in pairs(extra or {}) do context[k] = v end
    return context
end

function M.rows(statement: string, params: { any }?): { any }
    local db = M.db()
    local rows, err = db:query(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
    return rows or {}
end

function M.count(statement: string, params: { any }?): integer
    local rows = M.rows(statement, params)
    return math.floor(tonumber(rows[1] and rows[1].n) or 0)
end

function M.wait_run(user_id: string, run_id: string, predicate: (any) -> boolean): any
    local deadline = time.now():add(60 * time.SECOND)
    while true do
        local run, err = M.op(user_id, "run", { run_id = run_id })
        if err then error(tostring(err)) end
        if predicate(run) then return run end
        if time.now():after(deadline) then error("memory run did not reach its expected state: " .. tostring(run.last_error)) end
        time.sleep(100 * time.MILLISECOND)
    end
end

function M.wait_runs(user_id: string, component_id: string, run_type: string, count: integer, status: string?): { any }
    local deadline = time.now():add(60 * time.SECOND)
    while true do
        local rows, read_err = M.op(user_id, "runs", { component_id = component_id, run_type = run_type })
        if read_err then error(tostring(read_err)) end
        local done = 0
        for _, run in ipairs(rows) do
            local finished = run.status == "succeeded" or run.status == "failed" or (run.status == "rejected" and run.finished_at ~= nil)
            if (status and run.status == status) or (not status and finished) then done = done + 1 end
        end
        if done >= count then return rows end
        if time.now():after(deadline) then error("memory runs did not finish: " .. tostring(#rows) .. " runs") end
        time.sleep(100 * time.MILLISECOND)
    end
end

function M.wait_job(job_id: string, status: string): any
    local deadline = time.now():add(60 * time.SECOND)
    while true do
        local db = M.db()
        local rows, read_err = db:query("SELECT status, attempts, scheduled_at FROM kickside_job WHERE id = $1", { job_id })
        db:release()
        if read_err then error(tostring(read_err)) end
        if rows[1] and rows[1].status == status then
            rows[1].attempts = tonumber(rows[1].attempts)
            return rows[1]
        end
        if time.now():after(deadline) then error("job " .. job_id .. " did not reach " .. status .. ": " .. tostring(rows[1] and rows[1].status)) end
        time.sleep(100 * time.MILLISECOND)
    end
end

function M.db(): any
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    return db
end

ensure_user = function(user_id: string)
    local db = M.db()
    local sqlite = db:type() == sql.type.SQLITE
    local email = user_id:gsub("[^%w_%-]", "_") .. "@memory.test"
    local _, user_err
    local _, group_err
    if sqlite then
        _, user_err = db:execute([[INSERT OR IGNORE INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at)
            VALUES ($1, $2, 'Memory Test User', '!test:no-password', 'active', strftime('%s', 'now'), strftime('%s', 'now'))]], { user_id, email })
        if user_err then db:release(); error(tostring(user_err)) end
        _, group_err = db:execute([[INSERT OR IGNORE INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'app:user', strftime('%s', 'now'))]], { user_id })
    else
        _, user_err = db:execute([[INSERT INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at)
            VALUES ($1, $2, 'Memory Test User', '!test:no-password', 'active', now(), now()) ON CONFLICT (user_id) DO NOTHING]], { user_id, email })
        if user_err then db:release(); error(tostring(user_err)) end
        _, group_err = db:execute([[INSERT INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'app:user', now())
            ON CONFLICT (user_id, group_id) DO NOTHING]], { user_id })
    end
    db:release()
    if group_err then error(tostring(group_err)) end
end

function M.user(prefix: string?): string
    local id = (prefix or "memuser") .. "_" .. uuid.v7():gsub("%-", ""):sub(-12)
    ensure_user(id)
    return id
end

local function scope(): any
    return security.named_scope("wippy.security:process")
end

function M.call_as(user_id: string, fn_id: string, args: any, context: any?): (any, any)
    local executor = funcs.new():with_actor(security.new_actor(user_id, {})):with_scope(scope())
    if context then executor = executor:with_context(context) end
    return executor:call(fn_id, args)
end

local function model_context(user_id: string, args: any, context: any?): any
    local out = {}
    for k, v in pairs(context or {}) do out[k] = v end
    out.thread_id = out.thread_id or out.memory_id or args.component_id or (args.opts and args.opts.component_id) or user_id
    return out
end

function M.op(user_id: string, op: string, args: any, context: any?): (any, any)
    context = model_context(user_id, args, context)
    return M.call_as(user_id, "app.suites:memory_call", { op = op, args = args }, context)
end

function M.async_op(user_id: string, op: string, args: any, context: any?): (any?, error?)
    context = model_context(user_id, args, context)
    local executor = funcs.new():with_actor(security.new_actor(user_id, {})):with_scope(scope())
    if context then executor = executor:with_context(context) end
    return executor:async("app.suites:memory_call", { op = op, args = args })
end

function M.await(command: any): (any?, error?)
    local selected = channel.select({ command:response():case_receive(), time.after("60s"):case_receive() })
    if selected.channel ~= command:response() then
        return nil, errors.new({ kind = errors.TIMEOUT, retryable = false, message = "concurrent memory operation did not answer" })
    end
    local payload, err = command:result()
    if err then return nil, err end
    return payload:data(), nil
end

function M.try_memory(user_id: string, config: any?, embedding_model: string?): (string?, any)
    local def, err = contract.get("kickside.knowledge:knowledge_bases")
    if err then return nil, err end
    local inst, open_err = def:with_actor(security.new_actor(user_id, {})):with_scope(scope()):open()
    if open_err then return nil, open_err end
    local created, create_err = inst:create({
        name = "memory " .. uuid.v7(), kb_type = "memory", embedding_model = embedding_model or "test-embed", config = config,
    })
    if create_err then return nil, create_err end
    return created.component_id, nil
end

function M.memory(user_id: string, config: any?, embedding_model: string?): string
    local id, err = M.try_memory(user_id, config, embedding_model)
    if err or not id then error("memory create failed: " .. tostring(err)) end
    return id
end

function M.delete_memory(user_id: string, component_id: string): (any, any)
    local def, err = contract.get("kickside.knowledge:knowledge_bases")
    if err then return nil, err end
    local inst, open_err = def:with_actor(security.new_actor(user_id, {})):with_scope(scope()):open()
    if open_err then return nil, open_err end
    return inst:delete({ component_id = component_id })
end

local function opts(component_id: string, user_id: string, extra: any?): any
    local opts = {
        component_id = component_id, embedding_model = "test-embed", judge_model = "test-fast",
        scope_family = "owner", scope_id = user_id, source = "capture", host_kind = "session", host_id = "s-test",
    }
    for k, v in pairs(extra or {}) do opts[k] = v end
    return opts
end

function M.remember(user_id: string, component_id: string, candidates: { any }, idempotency: string, extra: any?): (any, any)
    local result, err = M.op(user_id, "remember", { candidates = candidates, opts = opts(component_id, user_id, extra), idempotency = idempotency })
    if err then error("remember failed: " .. tostring(err)) end
    return result, nil
end

function M.items(user_id: string, component_id: string, filter: any?): { any }
    local rows, err = M.op(user_id, "list", { component_id = component_id, filter = filter or {} })
    if err then error(tostring(err)) end
    return rows
end

function M.settle(user_id: string, component_id: string)
    local _, err = M.op(user_id, "settle", { component_id = component_id })
    if err then error(tostring(err)) end
end

function M.extraction(scope: string, items: { any })
    local attributes, lessons, plans = {}, {}, {}
    for _, item in ipairs(items) do
        local collection = item.kind == "plan" and plans or (item.kind == "lesson" and lessons or attributes)
        collection[#collection + 1] = item
    end
    script.respond(scope, "structured_output", { items = attributes, lessons = lessons, plans = plans })
end

function M.normalization(scope: string, items: { any })
    local mappings = {}
    for i, item in ipairs(items) do
        local mapping = { key = item.key, kind = item.kind or "fact", cardinality = item.cardinality or "multi" }
        if type(item.value) == "string" then
            mapping.value = item.value
            mapping.content = item.content or ("The user's " .. item.key .. " is " .. item.value .. ".")
        end
        mappings[tostring(i)] = { mapping }
    end
    script.respond(scope, "structured_output", { mappings = mappings })
end

function M.relations(scope: string, values: { string })
    local relations = {}
    for index, relation in ipairs(values) do relations[tostring(index)] = relation end
    script.respond(scope, "structured_output", { relations = relations, reason = "test" })
end

function M.candidate(kind: string, key: string, value: any, content: string, event_id: string?, valid_at: string?, cardinality: string?): any
    local default = (kind == "profile_slot" or kind == "preference" or kind == "plan") and "single" or "multi"
    return { kind = kind, key = key, cardinality = cardinality or default, value = value, content = content,
        event_id = event_id or "", valid_at = valid_at or "", confidence = 0.9 }
end

function M.persistence_op(user: string, name: string, args: any): (any, any)
    args.op = name
    return M.call_as(user, "app.suites:persistence_call", args, model_context(user, args, nil))
end

function M.count_rows(table_name: string, id: string): number
    return M.count("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE component_id = $1", { id })
end

function M.insert_cost_versions(id: string, count: integer)
    local db = M.db()
    local _, err = db:execute([[WITH RECURSIVE sequence(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM sequence WHERE n < $1)
        INSERT INTO kickside_memory_items (id, component_id, claim_id, kind, scope_family, scope_id, scope_key, key, cardinality,
            content, value, content_hash, status, version, valid_at, recorded_at, source, last_seq)
        SELECT i.id || ':' || n, i.component_id, i.claim_id, i.kind, i.scope_family, i.scope_id, i.scope_key, i.key, i.cardinality,
            i.content, i.value, i.content_hash, CASE WHEN n % 2 = 0 THEN 'forgotten' ELSE 'superseded' END,
            i.version + n, i.valid_at, i.recorded_at, i.source, i.last_seq
        FROM kickside_memory_items i CROSS JOIN sequence WHERE i.component_id = $2]], { count, id })
    db:release()
    if err then error(tostring(err)) end
end

function M.insert_run(id: string, run_id: string, status: string, input: any, last_error: string?): error?
    local db = M.db()
    local span = type(input) == "table" and input.span or nil
    local source = type(span) == "table" and span[1] or nil
    local event_id = type(source) == "table" and source.id or nil
    if type(event_id) ~= "string" or event_id == "" then event_id = run_id end
    local _, err
    if last_error then
        _, err = db:execute([[INSERT INTO kickside_memory_runs
            (id, component_id, run_type, status, host_kind, host_id, agent_id, to_event_id, input, last_error, created_at)
            VALUES ($1, $2, 'derive', $3, 'session', $4, 'test-derive', $5, $6, $7, '2026-01-01T00:00:00Z')]],
            { run_id, id, status, "s-test", event_id, json.encode(input), last_error })
    else
        _, err = db:execute([[INSERT INTO kickside_memory_runs
            (id, component_id, run_type, status, host_kind, host_id, agent_id, to_event_id, input, created_at)
            VALUES ($1, $2, 'derive', $3, 'session', $4, 'test-derive', $5, $6, '2026-01-01T00:00:00Z')]],
            { run_id, id, status, "s-test", event_id, json.encode(input) })
    end
    db:release()
    return err
end

function M.create_claim(user: string, id: string, value: any, cardinality: string?): any
    local result, err = M.op(user, "create", { component_id = id, fields = {
        kind = "fact", scope_family = "owner", key = "home_city", value = value, content = "The current city is " .. tostring(value) .. ".",
        cardinality = cardinality or "single",
    } })
    if err then error(tostring(err)) end
    M.settle(user, id)
    return result
end

function M.values(items: { any }): { [string]: any }
    local out = {}
    for _, item in ipairs(items) do out[tostring(item.value)] = item end
    return out
end

function M.apply(user: string, phase: string, memory: string, session: string, agent: string, extra: any?): (any, any)
    M.record_chat(user, session, {})
    return M.op(user, "apply", { payload = M.payload(phase, session, agent, extra) },
        M.agent_context(memory, session, agent))
end

return M
