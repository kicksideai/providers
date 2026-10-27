-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local component = require("component")
local types = require("types")
local context = require("agent_context")
local history = require("agent_history")
local runs = require("memory_runs")
local jobs = require("memory_jobs")

local M = {}

local CAPTURE_CONTEXT_WINDOW = 10
local CAPTURE_CONTEXT_MAX_CHARS = 6000

-- The derive commit advances the cursor; capture reads the unconsumed host history.
function M.capture(payload: any, to_event_id: string?): (any?, error?)
    if context.setting(payload, "write_enabled") == false then return { captured = false, reason = "capture_disabled" }, nil end
    local memory_id, store, store_err = context.memory(payload, component.ACCESS.WRITE)
    if store_err then return nil, store_err end
    local function skipped(reason: string): any
        return { captured = false, reason = reason, memory_id = memory_id }
    end
    local cfg = (store :: any).effective
    if cfg.capture_conversation == false and cfg.capture_experience ~= true then return skipped("capture_disabled"), nil end
    local host_kind, host_id = context.host_ref(payload.host)
    if host_kind == "" or host_id == "" then return nil, types.invalid("lifecycle host is required for capture") end
    local cursor, cursor_err = runs.cursor(memory_id :: string, host_kind, host_id)
    if cursor_err then return nil, cursor_err end
    local from = cursor and types.trim((cursor :: any).last_event_id) or ""
    local selector: any
    if from ~= "" then
        selector = { mode = "since_id", from_id = from }
    else
        selector = { mode = "window", last = history.FIRST_CAPTURE_WINDOW }
    end
    local requested = type(payload.selector) == "table" and payload.selector or nil
    if payload.selector == nil and payload.phase == "deactivate" then
        local bounds = type(payload.refs) == "table" and payload.refs.deactivation_range or nil
        if type(bounds) == "table" and type(bounds.to_id) == "string" and types.trim(bounds.to_id) ~= ""
            and (bounds.from_id == nil or (type(bounds.from_id) == "string" and types.trim(bounds.from_id) ~= "")) then
            requested = { mode = "range", from_id = bounds.from_id, to_id = bounds.to_id }
        end
    end
    local result, history_err = history.read(payload, requested or selector)
    if history_err then return nil, history_err end
    local events = (result :: any).events
    if requested and from ~= "" then
        local remaining, remaining_err = history.read(payload, selector)
        if remaining_err then return nil, remaining_err end
        local eligible: { [string]: boolean } = {}
        for _, event in ipairs((remaining :: any).events) do eligible[tostring(event.id)] = true end
        local uncaptured: { any } = {}
        for _, event in ipairs(events) do
            if eligible[tostring(event.id)] then uncaptured[#uncaptured + 1] = event end
        end
        events = uncaptured
    end
    if to_event_id then
        local through: { any } = {}
        local reached = false
        for _, event in ipairs(events) do
            through[#through + 1] = event
            if tostring(event.id) == to_event_id then reached = true; break end
        end
        if not reached then return skipped("already_captured"), nil end
        events = through
    end
    if #events == 0 then return skipped("no_new_history"), nil end
    local span = history.span(events, cfg)
    if #span == 0 then return skipped("nothing_to_capture"), nil end
    local preceding, preceding_err = history.read(payload, { mode = "range", to_id = tostring(events[1].id) })
    if preceding_err then return nil, preceding_err end
    local prior = (preceding :: any).events
    local prior_context: { any } = {}
    local remaining = CAPTURE_CONTEXT_MAX_CHARS
    for i = #prior - 1, math.max(1, #prior - CAPTURE_CONTEXT_WINDOW), -1 do
        local entry = history.span_entry(prior[i], cfg)
        if entry and remaining > 0 then
            entry.text = entry.text:sub(-remaining)
            remaining = remaining - #entry.text
            table.insert(prior_context, 1, entry)
        end
    end
    local scheduled, schedule_err = jobs.capture({
        component_id = memory_id :: string, host_kind = host_kind, host_id = host_id,
        agent_id = types.trim(payload.agent and payload.agent.id), from_event_id = from,
        to_event_id = tostring(events[#events].id), span = span, context = prior_context,
    })
    if schedule_err then return nil, schedule_err end
    return { captured = (scheduled :: any).scheduled, run_id = (scheduled :: any).run_id, memory_id = memory_id }, nil
end

return M
