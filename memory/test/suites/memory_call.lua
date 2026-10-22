-- Dispatches a named memory operation in the caller's frame, so suites can act
-- as a specific user.

local ops = require("memory_ops")
local writer = require("memory_writer")
local reconcile = require("memory_reconcile")
local runtime = require("runtime")
local items = require("memory_items")
local runs = require("memory_runs")
local ledger = require("memory_ledger")
local jobs = require("memory_jobs")
local bindings = require("memory_bindings")
local component = require("component")
local contract = require("contract")
local security = require("security")
local sql = require("sql")
local types = require("types")
local agent_compiler = require("agent_compiler")

local OPS: { [string]: (any) -> (any, any) } = {
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
    seed_history = function(a: any)
        local written, write_err = writer.write(a.component_id, "history:" .. a.component_id, { source = "owner" }, function(d: any): (any?, error?)
            local ids: { string } = {}
            for i = 1, a.count do
                local item, add_err = d:add({ scope_family = "owner", scope_id = a.user_id }, {
                    kind = i == a.count and "profile_slot" or "fact", key = "history_topic", cardinality = "multi",
                    value = "value-" .. tostring(i), content = "History entry " .. tostring(i) .. ".", valid_at = d.now,
                })
                if add_err then return nil, add_err end
                ids[#ids + 1] = item.id
            end
            return ids, nil
        end)
        if write_err then return nil, write_err end
        return (written :: any).result, nil
    end,
    settle = function(a: any) return ledger.settled_head(a.component_id) end,
    apply = function(a: any) return runtime.apply(a.payload) end,
    store = function(a: any): (any, any)
        local def, def_err = contract.get("kickside.knowledge:kb_store_lifecycle")
        if def_err then return nil, def_err end
        local store, open_err = def:with_actor(security.actor()):with_scope(security.scope()):open("kickside.memory:store_lifecycle")
        if open_err then return nil, open_err end
        return store:get_store({ component_id = a.component_id })
    end,
    compile = function(a: any) return agent_compiler.compile(a.spec) end,
    resolve_memory = function(a: any)
        local id, _, err = runtime.memory({ context = a.context }, component.ACCESS.READ)
        return id, err
    end,
    checkpoint = function(a: any) return runtime.create(a.payload) end,
    recall = function(a: any) return runtime.recall(a.input) end,
    build = function(a: any) return runtime.build(nil, a.context) end,
    prompt = function(_a: any) return runtime.prompt() end,
    tool_remember = function(a: any) return runtime.remember(a.input) end,
    tool_search = function(a: any) return runtime.search(a.input) end,
    tool_forget = function(a: any) return runtime.forget(a.input) end,
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
    classify = function(a: any): (any, any)
        local cause: any = "plain failure"
        if a.typed then cause = errors.new({ kind = errors.INVALID, message = "bad input" }) end
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
        return runs.pin(a.component_id, a.host_kind, a.host_id, a.agent_id, a.head, a.prompt, a.selected)
    end,
    claim = function(a: any) return runs.claim(a.run_id, a.repeatable) end,
    finish = function(a: any) return runs.finish(a.run_id, a.status, a.error) end,
    run = function(a: any) return runs.get(a.run_id) end,
    runs = function(a: any) return runs.list(a.component_id, a.run_type, a.limit or 50) end,
    query = function(a: any) return bindings.query(a.request) end,
    embed = function(a: any) return bindings.embed_content(a.request) end,
    wake = function(a: any) return jobs.wake_consolidation(a.component_id) end,
}

local function call(input: any): (any, any)
    local op = OPS[input.op]
    if not op then return nil, "unknown memory op " .. tostring(input.op) end
    return op(input.args or {})
end

return { call = call }
