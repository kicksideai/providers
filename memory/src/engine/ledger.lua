-- The memory ledger: typed events on the memory knowledge base's own thread
-- (thread_id == component_id). Writers read the head, let the read-model
-- projection catch up to it, decide, and append with an expected head, so a
-- decision made on a stale read model never lands.

local contract = require("contract")
local security = require("security")
local types = require("types")
local threads_append = require("threads_append")
local retention_notifier = require("retention_notifier")
local jobs_wake = require("jobs_wake")
local json = require("json")

local M = {}

local THREADS_CONTRACT = "kickside.core:threads"

-- Seconds a writer waits for the read model to reach the ledger head.
local CATCH_UP_SECONDS = 60

local function threads(): (any?, error?)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "memory ledger requires a security actor and scope" })
    end
    local def, err = contract.get(THREADS_CONTRACT)
    if err or not def then return nil, types.failed("threads contract unavailable", err) end
    local inst, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not inst then return nil, types.failed("threads open failed", open_err) end
    return inst, nil
end

local function head_of(inst: any, component_id: string): (integer?, error?)
    local thread, find_err = inst:find({ thread_id = component_id })
    if find_err then return nil, find_err end
    if not thread then return nil, types.not_found("memory ledger not found: " .. component_id) end
    return math.floor(tonumber((thread :: any).event_count) or 0) :: integer, nil
end

-- Current ledger head (event count) of a memory.
function M.head(component_id: string): (integer?, error?)
    local inst, err = threads()
    if err then return nil, err end
    return head_of(inst, component_id)
end

-- Head after the read model caught up with it: the state a decision is made on.
function M.settled_head(component_id: string, deadline: string?): (integer?, error?)
    local inst, err = threads()
    if err then return nil, err end
    local head, head_err = head_of(inst, component_id)
    if head_err then return nil, head_err end
    local _, wait_err = (inst :: any):catch_up_projection({
        thread_id = component_id,
        kind = types.THREAD_KIND,
        deadline = deadline or types.after_seconds(CATCH_UP_SECONDS),
    })
    if wait_err then return nil, wait_err end
    return head, nil
end

type LedgerEvent = { type: string, body: any }

-- Appends typed events at the expected head inside the caller's transaction,
-- so the payloads the events reference commit with them or not at all.
-- `idempotency` names the decision; an exact replay matches the stored events.
-- A moved head is a retryable conflict: the caller decides again on the newer
-- state.
function M.append_tx(tx: any, component_id: string, events: { LedgerEvent }, expected_head: integer, idempotency: string): (any?, error?)
    local writes: { any } = {}
    for index, event in ipairs(events) do
        writes[index] = {
            type = event.type,
            role = "system",
            body_json = json.encode(event.body),
            external = { external_source = types.SOURCE, external_id = idempotency .. ":" .. tostring(index) },
        }
    end
    local result, append_err = threads_append.append_events_tx(tx, component_id, writes, { expect = { head = expected_head } })
    if append_err then
        if errors.is(append_err, errors.CONFLICT) then
            return nil, types.unavailable("memory ledger moved while deciding; decide again", { expected_head = expected_head })
        end
        return nil, append_err
    end
    return result, nil
end

-- Tells the scheduler and retention about events a committed transaction
-- appended.
function M.appended(component_id: string): error?
    local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = component_id })
    if notify_err then return notify_err end
    local _, wake_err = jobs_wake.nudge_workers(nil, nil)
    return wake_err
end

return M
