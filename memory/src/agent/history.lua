-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local contract = require("contract")
local json = require("json")
local types = require("types")
local jobs = require("memory_jobs")
local ctx = require("ctx")

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
    for _, event in ipairs(result.events) do
        local metadata = type(event.metadata) == "table" and event.metadata or {}
        local role = event.role
        if role == "node.input" then role = "user"
        elseif role == "agent.action" then
            role = "assistant"
            if type(event.content) == "table" then event.content = event.content.result; event.raw_content = event.content end
        elseif role == "agent.observation" or role == "agent.delegation" then
            role = "function"
            metadata.function_name = metadata.tool_name
            metadata.status = metadata.is_error and "error" or "success"
            metadata.result = event.content
        end
        event.role, event.metadata = role, metadata
        local author = metadata.author
        if author == nil and type(event.author) == "table" and event.author.kind ~= "unknown" then author = event.author end
        if author == nil then
            if role == "function" then author = {kind = "system"}
            elseif role == "assistant" and types.trim(metadata.agent_id) ~= "" then
                author = {kind = "agent", id = metadata.agent_id}
            elseif role == "user" and payload.host.kind == "dataflow" then
                local parent = types.trim(ctx.get("from_agent_id"))
                author = parent ~= "" and {kind = "agent", id = parent} or {kind = "system"}
            elseif role == "user" and payload.host.kind == "session" then
                local session_owner, owner_err = types.human_id()
                if owner_err then return nil, owner_err end
                local parent = types.trim(ctx.get("from_agent_id"))
                author = parent ~= "" and {kind = "agent", id = parent}
                    or (session_owner and {kind = "user", id = session_owner} or {kind = "unknown"})
            end
        end
        event.author = type(author) == "table" and author or {kind = "unknown"}
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

local function outcome_text(metadata: any): (string?, error?)
    local outcome = metadata.result
    if outcome == nil then outcome = metadata.error end
    if outcome == nil then return "", nil end
    if type(outcome) == "string" then return types.trim(outcome), nil end
    local encoded, encode_err = json.encode(outcome)
    if encode_err then return nil, types.invalid("tool outcome must be serializable") end
    return types.trim(encoded), nil
end

function M.span_entry(event: any, cfg: any): (any?, error?)
    local metadata = type(event.metadata) == "table" and event.metadata or {}
    local role = event.role
    if (role == "user" or role == "assistant") and cfg.capture_conversation ~= false then
        local text = event_text(event)
        if text == "" then return nil, nil end
        return { id = tostring(event.id), role = role, author = event.author, text = text, created_at = event.created_at }, nil
    end
    if role == "function" and cfg.capture_experience == true then
        local name = types.trim(metadata.function_name)
        local status = types.trim(metadata.status)
        if name == "" or status == "" then return nil, nil end
        local prefix = "tool " .. name .. " " .. status
        local outcome, outcome_err = outcome_text(metadata)
        if outcome_err then return nil, outcome_err end
        if outcome ~= "" then outcome = outcome:sub(1, jobs.INPUT_BYTES - #prefix - 1) end
        return {
            id = tostring(event.id), role = "tool", author = event.author,
            text = outcome == "" and prefix or prefix .. "\n" .. outcome,
            created_at = event.created_at,
        }, nil
    end
    return nil, nil
end

function M.span(events: { any }, cfg: any): ({ any }?, error?)
    local span: { any } = {}
    for _, event in ipairs(events) do
        local entry, entry_err = M.span_entry(event, cfg)
        if entry_err then return nil, entry_err end
        if entry then span[#span + 1] = entry end
    end
    return span, nil
end

return M
