-- The memory ledger: typed events on the memory knowledge base's own thread
-- (thread_id == component_id). Writers read the head, let the read-model
-- projection catch up to it, decide, and append with an expected head, so a
-- decision made on a stale read model never lands.

local contract = require("contract")
local security = require("security")
local types = require("types")

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

-- Current ledger head (event count) of a memory.
function M.head(component_id: string): (integer?, error?)
    local inst, err = threads()
    if err then return nil, err end
    local thread, find_err = (inst :: any):find({ thread_id = component_id })
    if find_err then return nil, find_err end
    if not thread then return nil, types.not_found("memory ledger not found: " .. component_id) end
    return math.floor(tonumber((thread :: any).event_count) or 0) :: integer, nil
end

-- Waits until the read model has folded every event up to the head.
local function catch_up(component_id: string, deadline: string?): error?
    local inst, err = threads()
    if err then return err end
    local _, wait_err = (inst :: any):catch_up_projection({
        thread_id = component_id,
        kind = types.THREAD_KIND,
        deadline = deadline or types.after_seconds(CATCH_UP_SECONDS),
    })
    return wait_err
end

-- Head after the read model caught up with it: the state a decision is made on.
function M.settled_head(component_id: string, deadline: string?): (integer?, error?)
    local head, err = M.head(component_id)
    if err then return nil, err end
    local wait_err = catch_up(component_id, deadline)
    if wait_err then return nil, wait_err end
    return head, nil
end

type LedgerEvent = { type: string, body: any }

-- Appends typed events atomically at the expected head. `idempotency` names
-- the decision; an exact replay returns the stored events. A moved head is a
-- retryable conflict: the caller decides again on the newer state.
function M.append(component_id: string, events: { LedgerEvent }, expected_head: integer, idempotency: string): (any?, error?)
    if #events == 0 then return { inserted = 0 }, nil end
    local inst, err = threads()
    if err then return nil, err end
    local writes: { any } = {}
    for index, event in ipairs(events) do
        writes[index] = {
            type = event.type,
            body = event.body,
            external = { external_source = types.SOURCE, external_id = idempotency .. ":" .. tostring(index) },
        }
    end
    local result, append_err = (inst :: any):append_events({
        thread_id = component_id,
        expect = { head = expected_head },
        events = writes,
    })
    if append_err then
        if errors.is(append_err, errors.CONFLICT) then
            return nil, types.unavailable("memory ledger moved while deciding; decide again", { expected_head = expected_head })
        end
        return nil, append_err
    end
    return result, nil
end

return M
