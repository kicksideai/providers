-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local component = require("component")
local uuid = require("uuid")
local types = require("types")
local context = require("agent_context")
local history = require("agent_history")
local jobs = require("memory_jobs")
local runs = require("memory_runs")
local models = require("memory_models")

local M = {}

local CAPTURE_CONTEXT_WINDOW = 10
local CAPTURE_CONTEXT_MAX_CHARS = 6000

local function valid_event_id(value: any): boolean
    return type(value) == "string" and types.trim(value) ~= ""
end

local function selector_error(message: string): (any?, error?)
    return nil, types.invalid("capture selector " .. message)
end

local function validate_selector(selector: any): (any?, error?)
    if type(selector) ~= "table" then return selector_error("must be an object") end
    local mode = types.trim(selector.mode)
    if mode == "" then return selector_error("mode is required") end
    if mode == "window" then
        if selector.last ~= nil and (type(selector.last) ~= "number" or selector.last <= 0) then
            return selector_error("last must be positive for window")
        end
    elseif mode == "since_id" then
        if not valid_event_id(selector.from_id) then return selector_error("from_id is required for since_id") end
    elseif mode == "range" then
        if selector.from_id ~= nil and not valid_event_id(selector.from_id) then return selector_error("from_id must be a message id") end
        if selector.to_id ~= nil and not valid_event_id(selector.to_id) then return selector_error("to_id must be a message id") end
        if selector.from_id == nil and selector.to_id == nil then return selector_error("range requires a bound") end
    elseif mode == "checkpoint" then
        if not valid_event_id(selector.checkpoint_id) then return selector_error("checkpoint_id is required for checkpoint") end
    elseif mode ~= "since_checkpoint" and mode ~= "all" then
        return selector_error("mode is unsupported")
    end
    if selector.max_chars ~= nil and (type(selector.max_chars) ~= "number" or selector.max_chars <= 0) then
        return selector_error("max_chars must be positive")
    end
    return selector, nil
end

local function requested_selector(payload: any): (any?, error?)
    if payload.selector ~= nil then return validate_selector(payload.selector) end
    if payload.phase ~= "deactivate" then return nil, nil end
    local refs = type(payload.refs) == "table" and payload.refs or nil
    if not refs or refs.deactivation_range == nil then return nil, nil end
    local bounds = refs.deactivation_range
    if type(bounds) ~= "table" then return selector_error("deactivation range must be an object") end
    if not valid_event_id(bounds.to_id) then return selector_error("deactivation range requires to_id") end
    if bounds.from_id ~= nil and not valid_event_id(bounds.from_id) then
        return selector_error("deactivation range from_id must be a message id")
    end
    return { mode = "range", from_id = bounds.from_id, to_id = bounds.to_id }, nil
end

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
    if not context.write_enabled(payload) then return { captured = false, reason = "capture_disabled" }, nil end
    local memory_id, store, store_err = context.memory(payload, component.ACCESS.WRITE)
    if store_err then return nil, store_err end
    local function skipped(reason: string): any
        return { captured = false, reason = reason, memory_id = memory_id }
    end
    local cfg = (store :: any).effective
    if cfg.capture_conversation == false and cfg.capture_experience ~= true then return skipped("capture_disabled"), nil end
    local host_kind, host_id = context.host_ref(payload.host)
    if host_kind == nil or host_id == nil then return nil, types.invalid("lifecycle host is required for capture") end
    local from, position_err = runs.capture_position(memory_id :: string, host_kind, host_id)
    if position_err then return nil, position_err end
    local selector: any
    if from ~= nil then
        selector = { mode = "since_id", from_id = from }
    else
        selector = { mode = "window", last = history.FIRST_CAPTURE_WINDOW }
    end
    local requested, selector_err = requested_selector(payload)
    if selector_err then return nil, selector_err end
    local result, history_err = history.read(payload, requested or selector)
    if history_err then return nil, history_err end
    local events = (result :: any).events
    if requested and from ~= nil then
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
    local span, span_err = history.span(events, cfg)
    if span_err then return nil, span_err end
    if #span == 0 then return skipped("nothing_to_capture"), nil end
    local preceding, preceding_err = history.read(payload, { mode = "range", to_id = tostring(events[1].id) })
    if preceding_err then return nil, preceding_err end
    local prior = (preceding :: any).events
    local conversational = false
    for _, list in ipairs({prior, events}) do
        for _, event in ipairs(list) do
            if type(event.author) == "table" and event.author.kind == "user" then conversational = true end
        end
    end
    if not conversational and context.setting(payload, "learn_in_isolation") ~= true then
        return skipped("isolated_learning_disabled"), nil
    end
    local entries = {}
    for i = math.max(1, #prior - CAPTURE_CONTEXT_WINDOW), #prior - 1 do
        local entry, entry_err = history.span_entry(prior[i], cfg)
        if entry_err then return nil, entry_err end
        if entry then entries[#entries + 1] = entry end
    end
    local first_entry, rejected_run = 1, nil
    while first_entry <= #span and #span[first_entry].text > jobs.INPUT_BYTES do
        local entry = span[first_entry]
        local to_id = first_entry == #span and tostring(events[#events].id) or entry.id
        local rejected, reject_err = jobs.reject_capture({
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
    local maximum, capacity_err = models.extraction_capacity(cfg.extraction_model, span, payload.agent and payload.agent.id)
    if capacity_err then return nil, capacity_err end
    local captures: { any } = {}
    local part: { any } = {}
    local count, size, prior_context = 0, 0, context_window(entries)
    local function append(to_id: string)
        captures[#captures + 1] = {
            component_id = memory_id :: string, host_kind = host_kind, host_id = host_id,
            agent_id = types.trim(payload.agent and payload.agent.id), from_event_id = from,
            to_event_id = to_id, span = part, context = prior_context, isolated = not conversational,
        }
        from = to_id
        part, count, size, prior_context = {}, 0, 0, context_window(entries)
    end
    local stopped = false
    for i = first_entry, #span do
        local entry = span[i]
        if #entry.text > jobs.INPUT_BYTES then stopped = true; break end
        if #part > 0 and (size + #entry.text > jobs.INPUT_BYTES or (models.is_statement(entry, payload.agent and payload.agent.id) and count == maximum)) then
            append(part[#part].id)
        end
        part[#part + 1] = entry
        size = size + #entry.text
        entries[#entries + 1] = entry
        if models.is_statement(entry, payload.agent and payload.agent.id) then count = count + 1 end
    end
    append(stopped and part[#part].id or tostring(events[#events].id))
    local first: any = table.remove(captures, 1)
    local scheduled, schedule_err = jobs.capture(first, captures)
    if schedule_err then return nil, schedule_err end
    return { captured = (scheduled :: any).scheduled, run_id = (scheduled :: any).run_id, memory_id = memory_id }, nil
end

return M
