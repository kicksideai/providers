-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local contract = require("contract")
local types = require("types")

local M = {}

local RUN_CONTEXT = "wippy.agent:run_context"
M.FIRST_CAPTURE_WINDOW = 20

function M.open(ref: any): (any?, error?)
    if type(ref) ~= "table" or types.trim(ref.binding) == "" then
        return nil, types.invalid("run_context binding is required")
    end
    local def, err = contract.get(types.trim(ref.contract) ~= "" and ref.contract or RUN_CONTEXT)
    if err or not def then return nil, types.failed("run_context contract unavailable", err) end
    local inst, open_err = (def :: any):open(tostring(ref.binding))
    if open_err or not inst then return nil, types.failed("run_context binding unavailable", open_err) end
    return inst, nil
end

function M.read(payload: any, selector: any): (any?, error?)
    local inst, err = M.open(payload.run_context)
    if err then return nil, err end
    local result, history_err = (inst :: any):get_history({
        host = payload.run_context.host or payload.host,
        agent = payload.run_context.agent or payload.agent,
        selector = selector,
    })
    if history_err then return nil, types.failed("run_context history failed", history_err) end
    if type(result) ~= "table" or type(result.events) ~= "table" then
        return nil, types.unavailable("run_context history returned no events")
    end
    return result, nil
end

local function event_text(event: any): string
    local content = event.content
    if type(content) == "string" then return types.trim(content) end
    if type(event.raw_content) == "string" then return types.trim(event.raw_content) end
    if type(content) == "table" and type(content.text) == "string" then return types.trim(content.text) end
    return ""
end

function M.span_entry(event: any, cfg: any): any?
    local metadata = type(event.metadata) == "table" and event.metadata or {}
    local role = event.role
    if (role == "user" or role == "assistant") and cfg.capture_conversation ~= false then
        local text = event_text(event)
        if text == "" then return nil end
        return { id = tostring(event.id), role = role, author = event.author, text = text, created_at = event.created_at }
    end
    if role == "function" and cfg.capture_experience == true then
        local name = types.trim(metadata.function_name)
        local status = types.trim(metadata.status)
        if name == "" or status == "" then return nil end
        return { id = tostring(event.id), role = "tool", author = event.author, text = "tool " .. name .. " " .. status, created_at = event.created_at }
    end
    return nil
end

function M.span(events: { any }, cfg: any): { any }
    local span: { any } = {}
    for _, event in ipairs(events) do
        local entry = M.span_entry(event, cfg)
        if entry then span[#span + 1] = entry end
    end
    return span
end

return M
