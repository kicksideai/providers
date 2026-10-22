-- The one write path for typed memory: settle the read model at the ledger
-- head, reconcile the candidates against it, store vectors for new items, and
-- append the decision at that head. Capture, tools and reflection write
-- through `remember`; owner operations and consolidation markers use `apply`,
-- which appends decided events without reconciling.

local types = require("types")
local items = require("memory_items")
local ledger = require("memory_ledger")
local reconcile = require("memory_reconcile")

local M = {}

-- Returns { stats, inserted, item_ids }. `extra_events` are appended after the
-- decision in the same atomic write (a capture records how far it reached).
function M.remember(candidates: { any }, opts: any, idempotency: string, deadline: string?, extra_events: { any }?): (any?, error?)
    local head, head_err = ledger.settled_head(opts.component_id, deadline)
    if head_err then return nil, head_err end
    local decision, decide_err = reconcile.decide(candidates, opts)
    if decide_err then return nil, decide_err end
    for item_id, vector in pairs((decision :: any).vectors) do
        local _, vector_err = items.set_embedding(opts.component_id, item_id, vector)
        if vector_err then return nil, vector_err end
    end
    local events: { any } = {}
    for _, event in ipairs((decision :: any).events) do events[#events + 1] = event end
    for _, event in ipairs(extra_events or {}) do events[#events + 1] = event end
    local appended, append_err = ledger.append(opts.component_id, events, head :: integer, idempotency)
    if append_err then return nil, append_err end
    local ids: { string } = {}
    for _, event in ipairs(events) do
        local body = event.body
        if event.type == types.EVENT.ITEM_ADDED or event.type == types.EVENT.ITEM_RESTORED then ids[#ids + 1] = body.item_id end
    end
    return { stats = (decision :: any).stats, inserted = appended and (appended :: any).inserted or 0, item_ids = ids }, nil
end

-- Appends explicit typed events (owner edits, forget, restore, conflict
-- resolution) at the settled head.
function M.apply(component_id: string, events: { any }, idempotency: string, deadline: string?): (any?, error?)
    local head, head_err = ledger.settled_head(component_id, deadline)
    if head_err then return nil, head_err end
    return ledger.append(component_id, events, head :: integer, idempotency)
end

return M
