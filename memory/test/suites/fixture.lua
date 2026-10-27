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

local M = { script = script, history = history }

local RUN_CONTEXT = { contract = "wippy.agent:run_context", binding = "app.suites:history_binding" }

function M.payload(phase: string, session_id: string, agent_id: string, extra: any?): any
    local host = { kind = "session", session_id = session_id }
    local payload = {
        phase = phase, host = host, agent = { id = agent_id, model = "test-fast" },
        run_context = { contract = RUN_CONTEXT.contract, binding = RUN_CONTEXT.binding, host = host },
    }
    if phase == "checkpoint" then payload.options = { model = "class:fast", max_tokens = 1000 } end
    for k, v in pairs(extra or {}) do payload[k] = v end
    return payload
end

function M.agent_context(memory_id: string, session_id: string, agent_id: string, extra: any?): any
    local host = { kind = "session", session_id = session_id }
    local context = {
        memory_id = memory_id, agent_id = agent_id,
        agent_run = { host = host, agent = { id = agent_id }, run_context = { contract = RUN_CONTEXT.contract, binding = RUN_CONTEXT.binding, host = host } },
    }
    for k, v in pairs(extra or {}) do context[k] = v end
    return context
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

local function ensure_user(user_id: string)
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

function M.op(user_id: string, op: string, args: any, context: any?): (any, any)
    return M.call_as(user_id, "app.suites:memory_call", { op = op, args = args }, context)
end

function M.async_op(user_id: string, op: string, args: any, context: any?): (any?, error?)
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

function M.extraction(items: { any })
    local attributes, plans = {}, {}
    for _, item in ipairs(items) do
        local collection = item.kind == "plan" and plans or attributes
        collection[#collection + 1] = item
    end
    script.respond("structured_output", { items = attributes, plans = plans })
end

function M.normalization(items: { any })
    local mappings = {}
    for i, item in ipairs(items) do
        local mapping = { key = item.key, kind = item.kind or "fact", cardinality = item.cardinality or "multi" }
        if type(item.value) == "string" then
            mapping.value = item.value
            mapping.content = item.content or ("The user's " .. item.key .. " is " .. item.value .. ".")
        end
        mappings[tostring(i)] = { mapping }
    end
    script.respond("structured_output", { mappings = mappings })
end

function M.verdict(action: string, target_ids: { string })
    script.respond("structured_output", { action = action, target_ids = target_ids, reason = "test" })
end

function M.candidate(kind: string, key: string, value: any, content: string, event_id: string?, valid_at: string?, cardinality: string?): any
    local default = (kind == "profile_slot" or kind == "preference" or kind == "plan") and "single" or "multi"
    return { kind = kind, key = key, cardinality = cardinality or default, value = value, content = content,
        event_id = event_id or "", valid_at = valid_at or "", confidence = 0.9 }
end

function M.persistence_op(user: string, name: string, args: any): (any, any)
    args.op = name
    return M.call_as(user, "app.suites:persistence_call", args)
end

function M.count_rows(table_name: string, id: string): number
    local db = M.db()
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE component_id = $1", { id })
    db:release()
    if err then error(tostring(err)) end
    return tonumber(rows[1].n) or 0
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
    return M.op(user, "apply", { payload = M.payload(phase, session, agent, extra) },
        M.agent_context(memory, session, agent))
end

return M
