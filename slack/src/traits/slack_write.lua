local ctx = require("ctx")
local transport = require("transport")
local api = require("api")
local types = require("types")
local tool_result = require("tool_result")

-- SlackWrite -- write access for agents: send_message, add_reaction. The
-- connection arrives in the trait context (ctx.connection_id), same as SlackRead.
local M = {}
M._transport = transport :: any
M._api = api :: any

local VALID = { send_message = true, add_reaction = true }

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function open(): (any?, error?)
    return M._transport.connect(ctx.get("connection_id") :: string?)
end

-- A failed Slack answer is the tool's domain error carrying the failed Result:
-- Slack's error code, HTTP status and response body.
local function slack_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

function M.handler(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local action = trim(args.action)
    if action == "" then return tool_result.domain_error("action is required (send_message, add_reaction)") end
    if not VALID[action] then return tool_result.domain_error("unknown action '" .. action .. "'") end

    local channel_id = trim(args.channel_id)
    if channel_id == "" then return tool_result.domain_error("channel_id is required") end

    local content = trim(args.content or args.text)
    if action == "send_message" then
        if content == "" then return tool_result.domain_error("content is required for send_message") end
        if #content > types.MESSAGE_MAX_LENGTH then
            return tool_result.domain_error("message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters")
        end
    elseif action == "add_reaction" then
        if trim(args.message_ts) == "" then return tool_result.domain_error("message_ts is required for add_reaction") end
        if trim(args.emoji) == "" then return tool_result.domain_error("emoji is required for add_reaction") end
    end

    local conn, conn_err = open()
    if conn_err then return nil, conn_err end

    if action == "send_message" then
        local payload: { [string]: any } = { text = content }
        local thread_ts = trim(args.thread_ts)
        if thread_ts ~= "" then payload.thread_ts = thread_ts end
        local r, err = M._api.post_message(conn, channel_id, payload)
        if err then return nil, err end
        if not r.success then return slack_error(r) end
        return { success = true, action = action, result = "created", channel_id = channel_id,
            message_ts = r.data.ts, message = r.data.message }
    end

    -- add_reaction
    local r, err = M._api.add_reaction(conn, channel_id, trim(args.message_ts), trim(args.emoji))
    if err then return nil, err end
    if not r.success then return slack_error(r) end
    return { success = true, action = action, result = "updated", channel_id = channel_id, message_ts = trim(args.message_ts), emoji = trim(args.emoji) }
end

return M
