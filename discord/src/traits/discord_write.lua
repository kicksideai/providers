local ctx = require("ctx")
local transport = require("transport")
local api = require("api")
local types = require("types")
local tool_result = require("tool_result")

-- DiscordWrite -- write access for agents: send_message, add_reaction,
-- trigger_typing. The connection arrives in the trait context (ctx.connection_id),
-- same as DiscordRead.
local M = {}
M._transport = transport :: any
M._api = api :: any

local VALID = { send_message = true, add_reaction = true, trigger_typing = true }

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function open(): (any?, error?)
    return M._transport.connect(ctx.get("connection_id") :: string?)
end

-- A failed Discord answer is the tool's domain error carrying the failed Result:
-- Discord's message, HTTP status and error body.
local function discord_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

function M.handler(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local action = trim(args.action)
    if action == "" then return tool_result.domain_error("action is required (send_message, add_reaction, trigger_typing)") end
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
        if trim(args.message_id) == "" then return tool_result.domain_error("message_id is required for add_reaction") end
        if trim(args.emoji) == "" then return tool_result.domain_error("emoji is required for add_reaction") end
    end

    local conn, conn_err = open()
    if conn_err then return nil, conn_err end

    if action == "send_message" then
        local r, err = M._api.send_channel_message(conn, channel_id, { content = content })
        if err then return nil, err end
        if not r.success then return discord_error(r) end
        return { success = true, action = action, result = "created", channel_id = channel_id,
            message_id = r.data.id, message = r.data }

    elseif action == "add_reaction" then
        local r, err = M._api.add_reaction(conn, channel_id, trim(args.message_id), trim(args.emoji))
        if err then return nil, err end
        if not r.success then return discord_error(r) end
        return { success = true, action = action, result = "updated", channel_id = channel_id, message_id = trim(args.message_id), emoji = trim(args.emoji) }
    end

    -- trigger_typing
    local r, err = M._api.trigger_typing(conn, channel_id)
    if err then return nil, err end
    if not r.success then return discord_error(r) end
    return { success = true, action = action, result = "rendered", channel_id = channel_id }
end

return M
