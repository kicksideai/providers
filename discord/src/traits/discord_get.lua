local ctx = require("ctx")
local transport = require("transport")
local api = require("api")
local tool_result = require("tool_result")

-- DiscordRead -- read-only Discord access for agents. The connection is bound on
-- the trait (the user selects it in the connection picker, or it auto-resolves
-- the single default), so the connection id arrives in the trait context
-- (ctx.connection_id). Actions: list_guilds, get_guild, list_channels,
-- get_channel, get_messages.
local M = {}
-- Injectable seams so the dispatch/validation is unit-testable without a live
-- connection or the Discord API.
M._transport = transport :: any
M._api = api :: any

local VALID = {
    list_guilds = true,
    get_guild = true,
    list_channels = true,
    get_channel = true,
    get_message = true,
    get_messages = true,
}

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local DEFAULT_LIMIT = 20

local function next_cursor(items: any, limit: number): string?
    if type(items) ~= "table" or #items < limit then return nil end
    local last = items[#items]
    if type(last) ~= "table" then return nil end
    local id = trim(last.id)
    return id ~= "" and id or nil
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
    if action == "" then return tool_result.domain_error("action is required (list_guilds, get_guild, list_channels, get_channel, get_messages)") end
    if not VALID[action] then return tool_result.domain_error("unknown action '" .. action .. "'") end

    local guild_id = trim(args.guild_id)
    local channel_id = trim(args.channel_id)
    if (action == "get_guild" or action == "list_channels") and guild_id == "" then
        return tool_result.domain_error("guild_id is required for " .. action)
    end
    if (action == "get_channel" or action == "get_messages" or action == "get_message") and channel_id == "" then
        return tool_result.domain_error("channel_id is required for " .. action)
    end

    if action == "get_message" and trim(args.message_id) == "" then return tool_result.domain_error("message_id is required for get_message") end
    local conn, conn_err = open()
    if conn_err then return nil, conn_err end

    local limit = math.floor(tonumber(args.limit) or DEFAULT_LIMIT)
    local cursor = trim(args.cursor)

    if action == "list_guilds" then
        limit = math.max(1, math.min(limit, 200))
        local r, err = M._api.list_current_user_guilds(conn, { limit = limit, after = cursor })
        if err then return nil, err end
        if not r.success then return discord_error(r) end
        local rows: {any} = {}
        for _, guild in ipairs(r.data or {}) do
            rows[#rows + 1] = {id = guild.id, name = guild.name, owner = guild.owner}
        end
        return { success = true, action = action, guilds = rows, next_cursor = next_cursor(r.data, limit) }

    elseif action == "get_guild" then
        local r, err = M._api.get_guild(conn, guild_id)
        if err then return nil, err end
        if not r.success then return discord_error(r) end
        return { success = true, action = action, guild = r.data }

    elseif action == "list_channels" then
        limit = math.max(1, math.min(limit, 100))
        local offset = cursor == "" and 0 or tonumber(cursor)
        if not offset or offset < 0 or offset ~= math.floor(offset) then return tool_result.domain_error("cursor must be a nonnegative channel offset") end
        local r, err = M._api.list_guild_channels(conn, guild_id)
        if err then return nil, err end
        if not r.success then return discord_error(r) end
        local rows: {any} = {}
        for index = offset + 1, math.min(#r.data, offset + limit) do
            local channel = r.data[index]
            rows[#rows + 1] = {id = channel.id, name = channel.name, type = channel.type, parent_id = channel.parent_id, position = channel.position}
        end
        return { success = true, action = action, guild_id = guild_id, channels = rows,
            next_cursor = offset + #rows < #r.data and tostring(offset + #rows) or nil }

    elseif action == "get_message" then
        local r, err = M._api.get_channel_message(conn, channel_id, trim(args.message_id))
        if err then return nil, err end
        if not r.success then return discord_error(r) end
        return {success = true, action = action, message = r.data}

    elseif action == "get_channel" then
        local r, err = M._api.get_channel(conn, channel_id)
        if err then return nil, err end
        if not r.success then return discord_error(r) end
        return { success = true, action = action, channel = r.data }
    end

    -- get_messages
    limit = math.max(1, math.min(limit, 100))
    local r, err = M._api.get_channel_messages(conn, channel_id, limit, cursor)
    if err then return nil, err end
    if not r.success then return discord_error(r) end
    local rows: {any} = {}
    for _, message in ipairs(r.data or {}) do
        local author = type(message.author) == "table" and message.author or {}
        rows[#rows + 1] = {id = message.id, timestamp = message.timestamp, edited_timestamp = message.edited_timestamp,
            author = {id = author.id, username = author.username, global_name = author.global_name, bot = author.bot},
            type = message.type, pinned = message.pinned}
    end
    return { success = true, action = action, channel_id = channel_id, messages = rows, next_cursor = next_cursor(r.data, limit) }
end

return M
