-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local contract = require("contract")
local security = require("security")
local types = require("types")
local threads_append = require("threads_append")
local retention_notifier = require("retention_notifier")
local jobs_wake = require("jobs_wake")
local json = require("json_encoder")

local M = {}

local THREADS_CONTRACT = "kickside.core:threads"

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

function M.head(component_id: string): (integer?, error?)
    local inst, err = threads()
    if err then return nil, err end
    return head_of(inst, component_id)
end

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

function M.append_tx(tx: any, component_id: string, events: { LedgerEvent }, expected_head: integer?, idempotency: string): (any?, error?)
    local writes: { any } = {}
    for index, event in ipairs(events) do
        local body_json, encode_err = json.encode(event.body)
        if encode_err then return nil, types.internal("memory ledger event encode failed", { cause = tostring(encode_err) }) end
        writes[index] = {
            type = event.type,
            role = "system",
            body_json = body_json,
            external = { external_source = types.SOURCE, external_id = idempotency .. ":" .. tostring(index) },
        }
    end
    local result, append_err = threads_append.append_events_tx(tx, component_id, writes, { expect = expected_head ~= nil and { head = expected_head } or nil })
    if append_err then return nil, append_err end
    return result, nil
end

function M.appended(component_id: string): error?
    local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = component_id })
    if notify_err then return notify_err end
    local _, wake_err = jobs_wake.nudge_workers(nil, nil)
    return wake_err
end

return M
