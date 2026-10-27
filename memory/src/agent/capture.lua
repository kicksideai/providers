-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local component = require("component")
local types = require("types")
local context = require("agent_context")
local history = require("agent_history")
local prompt = require("agent_prompt")
local runs = require("memory_runs")
local jobs = require("memory_jobs")
local models = require("memory_models")

local M = {}

local CAPTURE_CONTEXT_WINDOW = 10
local CAPTURE_CONTEXT_MAX_CHARS = 6000
local CHECKPOINT_SOURCE_MAX_CHARS = 12000
local CHECKPOINT_MAX_TOKENS = 1000

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
function M.apply(payload: any): (any?, error?)
    local invalid = context.validate(payload)
    if invalid then return nil, invalid end
    local phase = payload.phase
    if phase == "activate" then
        local _, err = prompt.pin(payload)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, pinned = true } }, nil
    elseif phase == "before_step" then
        local captured, err = M.capture(payload, nil)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, capture = captured } }, nil
    elseif phase == "after_persist" then
        local event_id = types.trim(payload.refs and payload.refs.event_id)
        if event_id == "" then return nil, types.invalid("after_persist requires refs.event_id") end
        local captured, err = M.capture(payload, event_id)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, capture = captured } }, nil
    elseif phase == "deactivate" then
        local captured, err = M.capture(payload, nil)
        if err then return nil, err end
        local metadata: { [string]: any } = { phase = phase, capture = captured }
        if (captured :: any).memory_id then
            local _, wake_err = jobs.wake_consolidation((captured :: any).memory_id)
            if wake_err then metadata.consolidation_error = tostring(wake_err) end
        end
        return { messages = {}, metadata = metadata }, nil
    end
    return { messages = {}, metadata = { phase = phase, ignored = true } }, nil
end

function M.create(payload: any): (any?, error?)
    local invalid = context.validate(payload)
    if invalid then return nil, invalid end
    local inst, err = history.open(payload.run_context)
    if err then return nil, err end
    local selector = type(payload.selector) == "table" and payload.selector or { mode = "since_checkpoint" }
    selector.max_chars = selector.max_chars or CHECKPOINT_SOURCE_MAX_CHARS
    local prompt, prompt_err = (inst :: any):get_prompt({
        host = payload.run_context.host or payload.host,
        agent = payload.run_context.agent or payload.agent,
        selector = selector,
        format = "text",
    })
    if prompt_err then return nil, types.failed("checkpoint source failed", prompt_err) end
    local text = types.trim((prompt :: any).text)
    local summary, tokens = "No working conversation state.", nil
    if text ~= "" then
        local options = type(payload.options) == "table" and payload.options or {}
        local model = types.trim(payload.agent.model)
        if model == "" then model = types.trim(options.model) end
        if model == "" then return nil, types.invalid("checkpoint requires the agent model") end
        local max_tokens = tonumber(options.max_tokens) or CHECKPOINT_MAX_TOKENS
        local generated, used, summary_err = models.working_summary(model, text, math.floor(max_tokens))
        if summary_err then return nil, summary_err end
        summary, tokens = generated :: string, used
    end
    local range = (prompt :: any).range or {}
    local captured, capture_err = M.capture(payload, types.trim(range.to_id) ~= "" and range.to_id or nil)
    if capture_err then return nil, capture_err end
    return { summary = summary, tokens = tokens, metadata = { source = types.SOURCE, capture = captured } }, nil
end

return M
