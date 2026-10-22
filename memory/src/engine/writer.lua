-- The one write path for typed memory. Every writer (capture, tools,
-- reflection, owner operations) settles the read model at the ledger head,
-- decides on that state through a decision (engine/decision), stages the new
-- payloads and vectors, and appends the decision's structure-only events at
-- that head. A refused append leaves nothing staged behind.

local items = require("memory_items")
local ledger = require("memory_ledger")
local decision = require("memory_decision")

local M = {}

type WriteOptions = {
    source: string,
    actor: string?,
    deadline: string?,
    -- Appended after the decision in the same atomic write.
    extra_events: { any }?,
    -- Part of the idempotency key, for writes whose meaning depends on the
    -- state they act on (an explicit Remember repeated after a forget).
    keyed_by_head: boolean?,
}

-- Runs `decide(d)` on the settled state and lands its changes. Returns
-- { result, stats, item_ids, inserted }.
function M.write(component_id: string, idempotency: string, opts: WriteOptions, decide: (any) -> (any?, error?)): (any?, error?)
    local head, head_err = ledger.settled_head(component_id, opts.deadline)
    if head_err then return nil, head_err end
    local key = idempotency
    if opts.keyed_by_head then key = idempotency .. "@" .. tostring(head) end
    local d = decision.new(component_id, key, opts.source, opts.actor)
    local result, decide_err = decide(d)
    if decide_err then return nil, decide_err end
    local check_err = d:check()
    if check_err then return nil, check_err end
    local events: { any } = {}
    for _, event in ipairs(d.events) do events[#events + 1] = event end
    for _, event in ipairs(opts.extra_events or {}) do events[#events + 1] = event end
    local inserted = 0
    if #events > 0 then
        local _, stage_err = items.stage(component_id, d.staged)
        if stage_err then return nil, stage_err end
        local appended, append_err = ledger.append(component_id, events, head :: integer, key)
        if append_err then
            local payload_ids: { string } = {}
            for _, staged in ipairs(d.staged) do payload_ids[#payload_ids + 1] = staged.payload_id end
            local _, unstage_err = items.unstage(component_id, payload_ids)
            if unstage_err then return nil, unstage_err end
            return nil, append_err
        end
        inserted = appended and (appended :: any).inserted or 0
    end
    return { result = result, stats = d.stats, item_ids = d.added, inserted = inserted }, nil
end

return M
