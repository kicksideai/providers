-- The one write path for typed memory. Every writer (capture, tools,
-- reflection, owner operations) settles the read model at the ledger head,
-- decides on that state through a decision (engine/decision), stages the new
-- payloads and vectors, and appends the decision's structure-only events at
-- that head. A refused append leaves nothing staged behind.

local items = require("memory_items")
local ledger = require("memory_ledger")
local decision = require("memory_decision")
local db = require("memory_db")
local types = require("types")

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
        local appended, append_err = db.write(component_id, function(tx: any, _sqlite: boolean): (any, error?)
            local accepted, accept_err = ledger.append_tx(tx, component_id, events, head :: integer, key)
            if accept_err then return nil, accept_err end
            if accepted.inserted > 0 then
                local references: { [string]: boolean } = {}
                for i, proof in ipairs(accepted.events) do
                    if not proof.duplicate then
                        local event = events[i]
                        if event.type == types.EVENT.ITEM_ADDED then references[event.body.item_id] = true end
                        if event.type == types.EVENT.ITEM_REVISED then references[event.body.payload_id] = true end
                    end
                end
                local staged: { any } = {}
                for _, entry in ipairs(d.staged) do
                    if references[entry.payload_id] then staged[#staged + 1] = entry end
                end
                local stage_err = items.stage_tx(tx, component_id, staged)
                if stage_err then return nil, stage_err end
            end
            return accepted, nil
        end)
        if append_err then return nil, append_err end
        inserted = appended and (appended :: any).inserted or 0
        local notify_err = ledger.appended(component_id)
        if notify_err then return nil, notify_err end
    end
    return { result = result, stats = d.stats, item_ids = d.added, inserted = inserted }, nil
end

return M
