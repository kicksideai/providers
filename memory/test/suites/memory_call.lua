-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local config = require("memory_config")
local ops = require("memory_ops")
local writer = require("memory_writer")
local reconcile = require("memory_reconcile")
local models = require("memory_models")
local context = require("agent_context")
local funcs = require("funcs")
local prompt = require("agent_prompt")
local items = require("memory_items")
local runs = require("memory_runs")
local ledger = require("memory_ledger")
local db = require("memory_db")
local jobs = require("memory_jobs")
local bindings = require("memory_bindings")
local component = require("component")
local contract = require("contract")
local security = require("security")
local sql = require("sql")
local types = require("types")
local agent_compiler = require("agent_compiler")
local agent = require("agent")
local agent_prompt = require("llm_prompt")
local lifecycle = require("agent_lifecycle")
local recall = require("memory_recall")

local OPS: { [string]: (any) -> (any, any) } = {
    recall_scopes = function(a: any) return recall.visible_scopes(a.agent_id) end,
    recall_scope_failure = function(a: any)
        local returned, scopes, err = pcall(function() return recall.visible_scopes(a.agent_id) end)
        if not returned then
            return { raised = true, kind = scopes:kind(), message = scopes:message() }, nil
        end
        return { raised = false, count = scopes and #scopes or 0,
            kind = err and err:kind() or nil, message = err and err:message() or nil }, nil
    end,
    descriptor = function(a: any)
        local err = config.validate_descriptor(a.meta)
        if err then return nil, err end
        return true, nil
    end,
    model_step = function(a: any)
        local model = a.model or "test-fast"
        local result, err
        if a.step == "extract" then result, err = models.extract({ model = model, span = a.span, keys = a.keys or {},
            instructions = a.instructions, context = a.context, isolated = a.isolated, owner_id = a.owner_id, agent_id = a.agent_id })
        elseif a.step == "reflect" then result, err = models.reflect({ model = model, items = a.items, instructions = a.instructions })
        elseif a.step == "judge" then result, err = models.judge(model, a.candidate, a.items, a.actions or { "ADD", "NOOP" })
        else result, err = models.normalize(model, a.candidates, a.keys or {}, nil) end
        if err then return nil, err end
        return { items = result }, nil
    end,
    extraction_capacity = function(a: any) return models.extraction_capacity(a.model or "test-fast", a.span or {}) end,
    update_config = function(a: any) return bindings.update_config(a) end,
    create = function(a: any) return ops.create(a.component_id, a.fields) end,
    edit = function(a: any) return ops.edit(a.component_id, a.item_id, a.fields) end,
    forget = function(a: any) return ops.forget(a.component_id, a.item_id) end,
    archive = function(a: any) return ops.archive(a.component_id, a.item_id) end,
    restore = function(a: any) return ops.restore(a.component_id, a.item_id) end,
    resolve = function(a: any) return ops.resolve_conflict(a.component_id, a.group_id, a.winner_id) end,
    remember = function(a: any)
        return writer.write(a.opts.component_id, a.idempotency, { source = a.opts.source }, function(d: any): (any?, error?)
            return nil, reconcile.decide(d, a.candidates, a.opts)
        end)
    end,
    settle = function(a: any) return ledger.settled_head(a.component_id) end,
    apply = function(a: any) return funcs.call("kickside.memory.agent:lifecycle", a.payload) end,
    store = function(a: any): (any, any)
        local def, def_err = contract.get("kickside.knowledge:kb_store_lifecycle")
        if def_err then return nil, def_err end
        local store, open_err = def:with_actor(security.actor()):with_scope(security.scope()):open("kickside.memory:store_lifecycle")
        if open_err then return nil, open_err end
        return store:get_store({ component_id = a.component_id })
    end,
    compile = function(a: any) return agent_compiler.compile(a.spec) end,
    trait_agent = function(a: any)
        local compiled, compile_err = agent_compiler.compile(a.spec)
        if compile_err then return nil, compile_err end
        if a.payload then
            return lifecycle.apply(compiled.bindings, a.payload)
        end
        local builder = agent_prompt.new()
        for _, message in ipairs(a.messages) do
            builder:add_message(message.role, { agent_prompt.text(message.text) })
        end
        local result, step_err = agent.new(compiled):step(builder)
        if step_err then return nil, step_err end
        return { compiled = compiled, response = result }, nil
    end,
    resolve_memory = function(a: any)
        local id, _, err = context.memory({ context = a.context }, component.ACCESS.READ)
        return id, err
    end,
    checkpoint = function(a: any) return funcs.call("kickside.memory.agent:checkpoint", a.payload) end,
    recall = function(a: any) return funcs.call("kickside.memory.agent:memory_provider_recall", a.input) end,
    build = function(a: any) return prompt.build(nil, a.context) end,
    prompt = function(_a: any) return prompt.prompt() end,
    tool_search = function(a: any) return funcs.call("kickside.memory.agent:search_tool", a.input) end,
    migrate = function(a: any) return funcs.call((a.entry or ("kickside.memory.migrations:" .. a.name)),
        { database_id = a.database_id or "app:migration_db", id = a.id, direction = "up" }) end,
    migration_exec = function(a: any): (any?, any?)
        local db, db_err = sql.get(a.database_id or "app:migration_db")
        if db_err then return nil, db_err end
        local result, err = db:execute(a.statement, a.params or {})
        db:release()
        return result, err
    end,
    migration_query = function(a: any): (any?, any?)
        local db, db_err = sql.get(a.database_id or "app:migration_db")
        if db_err then return nil, db_err end
        local result, err = db:query(a.statement, a.params or {})
        db:release()
        return result, err
    end,
    tool_forget = function(a: any) return funcs.call("kickside.memory.agent:forget_tool", a.input) end,
    list = function(a: any) return items.list(a.component_id, a.filter or {}) end,
    get = function(a: any) return items.get(a.component_id, a.item_id) end,
    provenance = function(a: any) return items.provenance(a.component_id, a.item_id) end,
    ledger = function(a: any): (any, any)
        local def, def_err = contract.get("kickside.core:threads")
        if def_err then return nil, def_err end
        local threads, open_err = def:with_actor(security.actor()):with_scope(security.scope()):open()
        if open_err then return nil, open_err end
        local page, err = threads:list_events({ thread_id = a.component_id, limit = 1000, ascending = true })
        if err then return nil, err end
        local bodies = {}
        for _, event in ipairs(page.events or {}) do bodies[#bodies + 1] = { type = event.type, body = event.body } end
        return bodies, nil
    end,
    ledger_encode_failure = function(a: any): (any?, any?)
        local body: any = { force_encode_error = true }
        return db.write(a.component_id, function(tx: any, _sqlite: boolean): (any?, error?)
            return ledger.append_tx(tx, a.component_id, { { type = types.EVENT.CONSOLIDATION_COMPLETED, body = body } }, nil, "encode-failure")
        end)
    end,
    stored_text = function(a: any): (any, any)
        local db, db_err = sql.get("app:db")
        if db_err then return nil, db_err end
        local out = {}
        for _, statement in ipairs({
            "SELECT content, value AS extra FROM kickside_memory_items WHERE component_id = $1",
            "SELECT key AS content, cardinality AS extra FROM kickside_memory_keys WHERE component_id = $1",
            "SELECT content, value AS extra FROM kickside_memory_payloads WHERE component_id = $1",
            "SELECT input AS content, last_error AS extra FROM kickside_memory_runs WHERE component_id = $1",
            "SELECT pinned_prompt AS content, pinned_ids AS extra FROM kickside_memory_cursors WHERE component_id = $1",
        }) do
            local rows, err = db:query(statement, { a.component_id })
            if err then db:release(); return nil, err end
            for _, row in ipairs(rows or {}) do out[#out + 1] = tostring(row.content) .. " " .. tostring(row.extra) end
        end
        db:release()
        return out, nil
    end,
    diagnostics = function(_a: any): (any, any)
        local details = { marker = "unchanged" }
        local cause = errors.new({ kind = errors.TIMEOUT, retryable = true, message = "Private span text", details = details })
        local invalid = types.invalid("invalid request", details)
        local unavailable = types.unavailable("service unavailable", details)
        local failed = types.failed("dependency failed", cause)
        return { details = details, cause_details = cause:details(),
            invalid_details = invalid:details(), unavailable_details = unavailable:details(), failed_details = failed:details(),
            failure = types.failure(failed), failed_message = failed:message() }, nil
    end,
    classify = function(a: any): (any, any)
        local cause: any = "plain failure"
        if a.classified then cause = errors.new({ kind = errors.INVALID, message = "bad input" }) end
        local err = types.failed("dependency failed", cause)
        return { kind = err:kind(), retryable = err:retryable(), invalid = errors.INVALID, internal = errors.INTERNAL }, nil
    end,
    cursor = function(a: any) return runs.cursor(a.component_id, a.host_kind, a.host_id) end,
    pinned_ids = function(a: any): (any?, any?)
        local db, db_err = sql.get("app:db")
        if db_err then return nil, db_err end
        local rows, query_err = db:query(
            "SELECT pinned_ids FROM kickside_memory_cursors WHERE component_id = $1 AND host_kind = $2 AND host_id = $3",
            { a.component_id, a.host_kind, a.host_id })
        db:release()
        if query_err then return nil, query_err end
        return rows and rows[1] and rows[1].pinned_ids, nil
    end,
    pin = function(a: any)
        return runs.pin(a.component_id, a.host_kind, a.host_id, a.agent_id,
            a.head, a.prompt, a.selected, a.owner_scope_key)
    end,
    derive_worker = function(a: any) return jobs.derive_run({ payload = a, job = {} }), nil end,
    claim = function(a: any) return runs.claim(a.run_id, a.repeatable) end,
    finish = function(a: any) return runs.finish(a.run_id, a.status, a.error) end,
    run = function(a: any) return runs.get(a.run_id) end,
    runs = function(a: any) return runs.list(a.component_id, a.run_type, a.limit or 50) end,
    query = function(a: any) return bindings.query(a.request) end,
    embed_contract = function(a: any)
        local inst, err = component.open(a.component_id, component.ACCESS.READ, "kickside.contract:embeddable")
        if err then return nil, err end
        return (inst :: any):embed_content(a.request)
    end,
    embed = function(a: any) return bindings.embed_content(a.request) end,
    wake = function(a: any) return jobs.wake_consolidation(a.component_id) end,
}

local function call(input: any): (any, any)
    local op = OPS[input.op]
    if not op then return nil, "unknown memory op " .. tostring(input.op) end
    return op(input.args or {})
end

return { call = call }
