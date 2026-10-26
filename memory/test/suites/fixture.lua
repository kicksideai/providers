-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Shared fixture for the memory suites: seeded users, calls under a user's
-- actor, memory knowledge bases created through the knowledge control plane,
-- and the scripted model provider.

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

-- Lifecycle payload of a session host.
function M.payload(phase: string, session_id: string, agent_id: string, extra: any?): any
    local host = { kind = "session", session_id = session_id }
    local payload = {
        phase = phase, host = host, agent = { id = agent_id, model = "test-fast" },
        run_context = { contract = RUN_CONTEXT.contract, binding = RUN_CONTEXT.binding, host = host },
    }
    for k, v in pairs(extra or {}) do payload[k] = v end
    return payload
end

-- Context an agent step carries: trait context plus the agent_run pointer.
function M.agent_context(memory_id: string, session_id: string, agent_id: string, extra: any?): any
    local host = { kind = "session", session_id = session_id }
    local context = {
        memory_id = memory_id, agent_id = agent_id,
        agent_run = { host = host, agent = { id = agent_id }, run_context = { contract = RUN_CONTEXT.contract, binding = RUN_CONTEXT.binding, host = host } },
    }
    for k, v in pairs(extra or {}) do context[k] = v end
    return context
end

-- Waits for the memory's runs of a type to reach a terminal status; returns
-- them newest first.
function M.wait_runs(user_id: string, component_id: string, run_type: string, count: integer): { any }
    local deadline = time.now():add(60 * time.SECOND)
    while true do
        local rows = M.op(user_id, "runs", { component_id = component_id, run_type = run_type }) or {}
        local done = 0
        for _, run in ipairs(rows) do
            if run.status == "succeeded" or run.status == "failed" then done = done + 1 end
        end
        if done >= count then return rows end
        if time.now():after(deadline) then error("memory runs did not finish: " .. tostring(#rows) .. " runs") end
        time.sleep(100 * time.MILLISECOND)
    end
end

-- Waits for a job to reach a status.
function M.wait_job(job_id: string, status: string): any
    local deadline = time.now():add(60 * time.SECOND)
    while true do
        local db = M.db()
        local rows = db:query("SELECT status, attempts, scheduled_at FROM kickside_job WHERE id = $1", { job_id }) or {}
        db:release()
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
    if sqlite then
        db:execute([[INSERT OR IGNORE INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at)
            VALUES ($1, $2, 'Memory Test User', '!test:no-password', 'active', strftime('%s', 'now'), strftime('%s', 'now'))]], { user_id, email })
        db:execute([[INSERT OR IGNORE INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'app:user', strftime('%s', 'now'))]], { user_id })
    else
        db:execute([[INSERT INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at)
            VALUES ($1, $2, 'Memory Test User', '!test:no-password', 'active', now(), now()) ON CONFLICT (user_id) DO NOTHING]], { user_id, email })
        db:execute([[INSERT INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'app:user', now())
            ON CONFLICT (user_id, group_id) DO NOTHING]], { user_id })
    end
    db:release()
end

function M.user(prefix: string?): string
    local id = (prefix or "memuser") .. "_" .. uuid.v7():gsub("%-", ""):sub(-12)
    ensure_user(id)
    return id
end

local function scope(): any
    return security.named_scope("wippy.security:process")
end

-- Calls a function entry as the user, with an optional context.
function M.call_as(user_id: string, fn_id: string, args: any, context: any?): (any, any)
    local executor = funcs.new():with_actor(security.new_actor(user_id, {})):with_scope(scope())
    if context then executor = executor:with_context(context) end
    return executor:call(fn_id, args)
end

-- Runs a named memory operation (see app.suites:memory_call) as the user.
function M.op(user_id: string, op: string, args: any, context: any?): (any, any)
    return M.call_as(user_id, "app.suites:memory_call", { op = op, args = args }, context)
end

-- Starts a memory operation in a separate function frame. Concurrency tests
-- await the returned command so they exercise the real write transaction.
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

-- Creates a memory knowledge base owned by the user through the knowledge
-- control plane.
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

-- A knowledge-base component without a memory store, standing for a document
-- knowledge base an earlier release of the trait wrote digests into.
function M.plain_component(user_id: string): string
    local def = contract.get("kickside.component:component_service")
    local svc = def:with_actor(security.new_actor(user_id, {})):with_scope(scope()):open()
    local id = uuid.v4()
    local result, err = svc:register({ component_id = id, impl_id = "app.suites:legacy_document",
        meta = { title = "digests", class = "knowledge_base", kb_type = "document" } })
    if err or not result.success then error("register failed: " .. tostring(err or result.error)) end
    return id
end

-- Deletes the memory knowledge base through the knowledge control plane, which
-- tears the component down through the memory's deletable cleanup.
function M.delete_memory(user_id: string, component_id: string): (any, any)
    local def, err = contract.get("kickside.knowledge:knowledge_bases")
    if err then return nil, err end
    local inst, open_err = def:with_actor(security.new_actor(user_id, {})):with_scope(scope()):open()
    if open_err then return nil, open_err end
    return inst:delete({ component_id = component_id })
end

-- Reconcile options for owner-scoped writes of a user.
local function opts(component_id: string, user_id: string, extra: any?): any
    local opts = {
        component_id = component_id, embedding_model = "test-embed", judge_model = "test-fast",
        scope_family = "owner", scope_id = user_id, source = "capture", host_kind = "session", host_id = "s-test",
    }
    for k, v in pairs(extra or {}) do opts[k] = v end
    return opts
end

-- Writes candidates through the reconcile path; a failed write fails the test.
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
    script.respond("structured_output", { items = items })
    if #items > 0 then M.normalization(items) end
end

function M.normalization(items: { any })
    local mappings = {}
    for i, item in ipairs(items) do mappings[i] = { index = i, key = item.key, value = type(item.value) == "string" and item.value or "", kind = item.kind or "fact", cardinality = item.cardinality or "multi" } end
    script.respond("structured_output", { mappings = mappings })
end

function M.verdict(action: string, target_ids: { string })
    script.respond("structured_output", { action = action, target_ids = target_ids, reason = "test" })
end

-- A candidate as extraction returns it. Profile slots and preferences hold one
-- value unless `cardinality` says otherwise.
function M.candidate(kind: string, key: string, value: any, content: string, event_id: string?, valid_at: string?, cardinality: string?): any
    local default = (kind == "profile_slot" or kind == "preference" or kind == "plan") and "single" or "multi"
    return { kind = kind, key = key, cardinality = cardinality or default, value = value, content = content,
        event_id = event_id or "", valid_at = valid_at or "", confidence = 0.9 }
end

return M
