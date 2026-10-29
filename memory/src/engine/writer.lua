-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local payloads = require("memory_payloads")
local ledger = require("memory_ledger")
local decision = require("memory_decision")
local db = require("memory_db")
local types = require("types")

local M = {}

local MAX_DECISIONS = 8

type WriteOptions = {
    source: string,
    actor: string?,
    deadline: string?,
    extra_events: { any }?,
    keyed_by_head: boolean?,
}

-- The accepted ledger head and decision invariants share the payload transaction.
function M.write(component_id: string, idempotency: string, opts: WriteOptions, decide: (any) -> (any?, error?)): (any?, error?)
    for _attempt = 1, MAX_DECISIONS do
        local head, head_err = ledger.settled_head(component_id, opts.deadline)
        if head_err then return nil, head_err end
        local key = idempotency
        if opts.keyed_by_head then key = idempotency .. "@" .. tostring(head) end
        local d = decision.new(component_id, key, opts.source, opts.actor)
        local result, decide_err = decide(d)
        if decide_err then return nil, decide_err end
        local events: { any } = {}
        for _, event in ipairs(d.events) do events[#events + 1] = event end
        for _, event in ipairs(opts.extra_events or {}) do events[#events + 1] = event end
        local inserted = 0
        if #events > 0 then
            local head_moved = false
            local appended, append_err = db.write(component_id, function(tx: any, _sqlite: boolean): (any, error?)
                local accepted, accept_err = ledger.append_tx(tx, component_id, events, head :: integer, key)
                if accept_err then
                    head_moved = errors.is(accept_err, errors.CONFLICT)
                    return nil, accept_err
                end
                if accepted.inserted > 0 then
                    local check_err = d:check(tx)
                    if check_err then return nil, check_err end
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
                    local stage_err = payloads.stage_tx(tx, component_id, staged)
                    if stage_err then return nil, stage_err end
                end
                return accepted, nil
            end)
            if append_err then
                if not head_moved then return nil, append_err end
            else
                inserted = appended and (appended :: any).inserted or 0
                local notify_err = ledger.appended(component_id)
                if notify_err then return nil, notify_err end
                return { result = result, stats = d.stats, item_ids = d.added, inserted = inserted }, nil
            end
        else
            return { result = result, stats = d.stats, item_ids = d.added, inserted = inserted }, nil
        end
    end
    return nil, types.unavailable("memory ledger contention exceeds the decision limit")
end

return M
