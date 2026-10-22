-- Dispatches a named memory operation in the caller's frame, so suites can act
-- as a specific user.

local ops = require("memory_ops")
local writer = require("memory_writer")
local runtime = require("runtime")
local items = require("memory_items")
local runs = require("memory_runs")
local ledger = require("memory_ledger")
local jobs = require("memory_jobs")
local bindings = require("memory_bindings")
local component = require("component")

local OPS: { [string]: (any) -> (any, any) } = {
    create = function(a: any) return ops.create(a.component_id, a.fields) end,
    edit = function(a: any) return ops.edit(a.component_id, a.item_id, a.fields) end,
    forget = function(a: any) return ops.forget(a.component_id, a.item_id, a.reason) end,
    restore = function(a: any) return ops.restore(a.component_id, a.item_id) end,
    resolve = function(a: any) return ops.resolve_conflict(a.component_id, a.group_id, a.winner_id) end,
    remember = function(a: any) return writer.remember(a.candidates, a.opts, a.idempotency) end,
    settle = function(a: any) return ledger.settled_head(a.component_id) end,
    apply = function(a: any) return runtime.apply(a.payload) end,
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
    cursor = function(a: any) return runs.cursor(a.component_id, a.host_kind, a.host_id) end,
    runs = function(a: any) return runs.list(a.component_id, a.run_type, a.limit or 50) end,
    query = function(a: any) return bindings.query(a.request) end,
    derive = function(a: any) return jobs.derive_authorized(a.job), nil end,
    consolidate = function(a: any) return jobs.consolidate_authorized(a.job), nil end,
    wake = function(a: any) return jobs.wake_consolidation(a.component_id) end,
}

local function call(input: any): (any, any)
    local op = OPS[input.op]
    if not op then return nil, "unknown memory op " .. tostring(input.op) end
    return op(input.args or {})
end

return { call = call }
