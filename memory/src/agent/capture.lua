-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local component = require("component")
local uuid = require("uuid")
local types = require("types")
local context = require("agent_context")
local history = require("agent_history")
local runs = require("memory_runs")
local jobs = require("memory_jobs")
local models = require("memory_models")

local M = {}

local CAPTURE_CONTEXT_WINDOW = 10
local CAPTURE_CONTEXT_MAX_CHARS = 6000

local function context_window(entries: { any }): { any }
    local out = {}
    local remaining = CAPTURE_CONTEXT_MAX_CHARS
    for i = #entries, math.max(1, #entries - CAPTURE_CONTEXT_WINDOW + 1), -1 do
        if remaining > 0 and #entries[i].text <= jobs.INPUT_BYTES then
            local entry = {}
            for key, value in pairs(entries[i]) do entry[key] = value end
            entry.text = entry.text:sub(-remaining)
            remaining = remaining - #entry.text
            table.insert(out, 1, entry)
        end
    end
    return out
end

-- Capture reads history after the last committed derive or rejected source.
function M.capture(payload: any, to_event_id: string?): (any?, error?)
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
    local entries = {}
    for i = math.max(1, #prior - CAPTURE_CONTEXT_WINDOW), #prior - 1 do
        local entry = history.span_entry(prior[i], cfg)
        if entry then entries[#entries + 1] = entry end
    end
    local first_entry, rejected_run = 1, nil
    while first_entry <= #span and #span[first_entry].text > jobs.INPUT_BYTES do
        local entry = span[first_entry]
        local to_id = first_entry == #span and tostring(events[#events].id) or entry.id
        local rejected, reject_err = runs.reject_capture({
            id = uuid.v7(), component_id = memory_id :: string, run_type = types.RUN_TYPE.DERIVE,
            status = types.RUN_STATUS.REJECTED, finished_at = types.now(), actor_id = types.actor_id(),
            host_kind = host_kind, host_id = host_id, agent_id = types.trim(payload.agent and payload.agent.id),
            from_event_id = from, to_event_id = to_id,
            stats = { rejected = 1, rejected_source_too_large = 1, source_bytes = #entry.text, input_limit_bytes = jobs.INPUT_BYTES },
            last_error = "source_too_large: memory source event exceeds " .. tostring(jobs.INPUT_BYTES) .. " bytes (" .. tostring(#entry.text) .. " bytes)",
        })
        if reject_err then return nil, reject_err end
        if not rejected.recorded then return { captured = rejected_run ~= nil, run_id = rejected_run or rejected.run_id, memory_id = memory_id }, nil end
        rejected_run = rejected.run_id
        from = to_id
        first_entry = first_entry + 1
    end
    if first_entry > #span then return { captured = true, run_id = rejected_run, memory_id = memory_id }, nil end
    local maximum, capacity_err = models.extraction_capacity(cfg.extraction_model, span)
    if capacity_err then return nil, capacity_err end
    local captures: { any } = {}
    local part: { any } = {}
    local count, size, prior_context = 0, 0, context_window(entries)
    local function append(to_id: string)
        captures[#captures + 1] = {
            component_id = memory_id :: string, host_kind = host_kind, host_id = host_id,
            agent_id = types.trim(payload.agent and payload.agent.id), from_event_id = from,
            to_event_id = to_id, span = part, context = prior_context,
        }
        from = to_id
        part, count, size, prior_context = {}, 0, 0, context_window(entries)
    end
    local stopped = false
    for i = first_entry, #span do
        local entry = span[i]
        if #entry.text > jobs.INPUT_BYTES then stopped = true; break end
        if #part > 0 and (size + #entry.text > jobs.INPUT_BYTES or (models.is_statement(entry) and count == maximum)) then
            append(part[#part].id)
        end
        part[#part + 1] = entry
        size = size + #entry.text
        entries[#entries + 1] = entry
        if models.is_statement(entry) then count = count + 1 end
    end
    append(stopped and part[#part].id or tostring(events[#events].id))
    local first: any = table.remove(captures, 1)
    local scheduled, schedule_err = jobs.capture(first, captures)
    if schedule_err then return nil, schedule_err end
    return { captured = (scheduled :: any).scheduled, run_id = (scheduled :: any).run_id, memory_id = memory_id }, nil
end

return M
