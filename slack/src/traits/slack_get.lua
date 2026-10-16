local ctx = require("ctx")
local transport = require("transport")
local api = require("api")
local tool_result = require("tool_result")

-- SlackRead -- read-only Slack access for agents. The connection is bound on the
-- trait (the user selects it in the connection picker, or it auto-resolves the
-- single default), so the connection id arrives in the trait context
-- (ctx.connection_id). Actions: list_channels, get_channel, get_messages,
-- list_users.
local M = {}
-- Injectable seams so the dispatch/validation is unit-testable without a live
-- connection or the Slack API.
M._transport = transport :: any
M._api = api :: any

local VALID = {
    list_channels = true,
    get_channel = true,
    get_message = true,
    get_user = true,
    get_messages = true,
    list_users = true,
}

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

local function cursor(value: any): (string?, string?)
    if value == nil then return nil, nil end
    if type(value) ~= "string" or value == "" then return nil, "cursor must be a nonempty string" end
    return value, nil
end

local function next_cursor(data: any): string?
    local metadata: any = type(data) == "table" and data.response_metadata or nil
    local value = type(metadata) == "table" and metadata.next_cursor or nil
    return type(value) == "string" and value ~= "" and value or nil
end

function M.handler(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local action = trim(args.action)
    if action == "" then return tool_result.domain_error("action is required (list_channels, get_channel, get_messages, list_users)") end
    if not VALID[action] then return tool_result.domain_error("unknown action '" .. action .. "'") end

    local channel_id = trim(args.channel_id)
    if (action == "get_channel" or action == "get_messages" or action == "get_message") and channel_id == "" then
        return tool_result.domain_error("channel_id is required for " .. action)
    end

    if action == "get_message" and trim(args.message_ts) == "" then return tool_result.domain_error("message_ts is required for get_message") end
    if action == "get_user" and trim(args.user_id) == "" then return tool_result.domain_error("user_id is required for get_user") end

    local page_cursor, cursor_err = cursor(args.cursor)
    if cursor_err then return tool_result.domain_error(cursor_err) end

    local conn, conn_err = open()
    if conn_err then return nil, conn_err end

    local limit = args.limit
    if action == "list_channels" then
        local r, err = M._api.list_conversations(conn, { limit = limit, cursor = page_cursor })
        if err then return nil, err end
        if not r.success then return slack_error(r) end
        local channels: {any} = {}
        for _, channel in ipairs(r.data.channels or {}) do
            channels[#channels + 1] = {id = channel.id, name = channel.name, is_private = channel.is_private,
                is_archived = channel.is_archived, num_members = channel.num_members, created = channel.created}
        end
        return { success = true, action = action, count = #channels, next_cursor = next_cursor(r.data), channels = channels }

    elseif action == "get_channel" then
        local r, err = M._api.conversation_info(conn, channel_id)
        if err then return nil, err end
        if not r.success then return slack_error(r) end
        return { success = true, action = action, channel = r.data.channel }

    elseif action == "get_message" then
        local r, err = M._api.conversation_message(conn, channel_id, trim(args.message_ts))
        if err then return nil, err end
        if not r.success then return slack_error(r) end
        if not r.data.messages or #r.data.messages == 0 then return tool_result.domain_error("message not found") end
        return {success = true, action = action, message = r.data.messages[1]}

    elseif action == "get_user" then
        local r, err = M._api.users_info(conn, trim(args.user_id))
        if err then return nil, err end
        if not r.success then return slack_error(r) end
        return {success = true, action = action, user = r.data.user}

    elseif action == "list_users" then
        local r, err = M._api.users_list(conn, { limit = limit, cursor = page_cursor })
        if err then return nil, err end
        if not r.success then return slack_error(r) end
        local members: {any} = {}
        for _, user in ipairs(r.data.members or {}) do
            members[#members + 1] = {id = user.id, name = user.name, real_name = user.real_name,
                deleted = user.deleted, is_bot = user.is_bot, tz = user.tz}
        end
        return { success = true, action = action, count = #members, next_cursor = next_cursor(r.data), users = members }
    end

    -- get_messages
    local r, err = M._api.conversation_history(conn, channel_id, { limit = limit, cursor = page_cursor })
    if err then return nil, err end
    if not r.success then return slack_error(r) end
    local messages: {any} = {}
    for _, message in ipairs(r.data.messages or {}) do
        messages[#messages + 1] = {ts = message.ts, user = message.user, bot_id = message.bot_id,
            type = message.type, subtype = message.subtype, thread_ts = message.thread_ts, reply_count = message.reply_count}
    end
    return { success = true, action = action, channel_id = channel_id, count = #messages,
        next_cursor = next_cursor(r.data), messages = messages }
end

return M
