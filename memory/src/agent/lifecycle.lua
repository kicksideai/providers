-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local types = require("types")
local context = require("agent_context")
local prompt = require("agent_prompt")
local capture = require("agent_capture")
local jobs = require("memory_jobs")

local M = {}

function M.apply(payload: any): (any?, error?)
    local invalid = context.validate(payload)
    if invalid then return nil, invalid end
    local phase = payload.phase
    if phase == "activate" then
        local _, err = prompt.pin(payload)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, pinned = true } }, nil
    elseif phase == "before_step" then
        local captured, err = capture.capture(payload, nil)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, capture = captured } }, nil
    elseif phase == "after_persist" then
        local event_id = types.trim(payload.refs and payload.refs.event_id)
        if event_id == "" then return nil, types.invalid("after_persist requires refs.event_id") end
        local captured, err = capture.capture(payload, event_id)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, capture = captured } }, nil
    elseif phase == "deactivate" then
        local captured, err = capture.capture(payload, nil)
        if err then return nil, err end
        local metadata: { [string]: any } = { phase = phase, capture = captured }
        if (captured :: any).memory_id then
            local _, wake_err = jobs.wake_consolidation((captured :: any).memory_id)
            if wake_err then return nil, wake_err end
        end
        return { messages = {}, metadata = metadata }, nil
    end
    return { messages = {}, metadata = { phase = phase, ignored = true } }, nil
end

return M
