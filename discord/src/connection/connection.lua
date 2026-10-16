local base = require("base")
local transport = require("transport")
local types = require("types")

local preconditions = require("preconditions")

local M = {}

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: any?, reason: string?, status_code: integer?, rendered: boolean?, message_ref: string?, details: any?, uncertain: boolean?, warnings: { { reason: string, message: string } }? }
-- A discovered resource. parent_id nests it under a sibling in the SAME response
-- (a channel under its category), so the picker builds arbitrary-depth levels
-- generically. selectable marks a pickable target (a postable channel); containers
-- (guilds, categories) are selectable=false and are drilled/nested instead.
-- drillable marks a container whose children are loaded by a SEPARATE discover call
-- (a guild). A container without it (a category) has its children nested in the same
-- response via parent_id, so the picker never drills it -- an empty one just shows
-- empty instead of trying to discover.
type ResourceRow = { type: string, id: string, name: string, guild_id: string?, channel_type: any?, parent_id: string?, selectable: boolean?, drillable: boolean? }

-- Discord channel types: 0 text, 4 category, 5 announcement (postable). Voice/stage
-- aren't text targets; categories are containers.
local CATEGORY_TYPE = 4
local TEXT_TYPE = 0
local ANNOUNCEMENT_TYPE = 5
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: any?, reason: string?, status_code: integer?, details: any? }

local function trim(value: any): string
    local result = base.trim(value)
    if type(result) == "string" then return result end
    return tostring(result or "")
end
local component_id = base.component_id

local function open(): (types.Conn?, error?)
    local id, err = component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

local function shape_bot_identity(user: any): any
    user = type(user) == "table" and user or {}
    return {
        bot = {
            id = trim((user :: any).id),
            username = trim((user :: any).username),
            global_name = trim((user :: any).global_name),
            discriminator = trim((user :: any).discriminator),
            avatar = trim((user :: any).avatar),
            bot = (user :: any).bot == true,
        },
    }
end

-- A failed Discord answer: its message, HTTP status and error body.
local function discord_failure(result: any, reason: string?): SimpleResult
    return { success = false, error = result.error, reason = reason, status_code = result.status_code, details = result.data }
end

function M.test_connection(args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if request_err then return nil, request_err end
    if not result.success then return discord_failure(result) end
    local application, application_err = transport.get_application(conn)
    if application_err then return nil, application_err end
    local ready, reason, message = preconditions.application(application)
    if not ready then return { success = false, reason = reason, error = message, status_code = application.status_code, details = application.data } end
    local resource_id = type(args) == "table" and trim(args.resource_id) or ""
    if resource_id ~= "" then
        local channel_result, channel_err = transport.get_channel(conn, resource_id)
        if channel_err then return nil, channel_err end
        if not channel_result.success then return discord_failure(channel_result, preconditions.rest(channel_result)) end
        local history_result, history_err = transport.get_channel_messages(conn, resource_id, 1)
        if history_err then return nil, history_err end
        if not history_result.success then return discord_failure(history_result, preconditions.rest(history_result)) end
    end
    local warnings = preconditions.warnings(application)
    return { success = true, details = shape_bot_identity(result.data), warnings = #warnings > 0 and warnings or nil }
end

function M.get_status(args: any): (StatusResult?, error?)
    local result, status_err = base.get_status(args)
    if status_err then return nil, status_err end
    if result.success ~= true then return result end
    local id, id_err = component_id()
    if not id then return nil, id_err end
    local meta, read_err = base.public_meta(id)
    if read_err then return nil, read_err end
    result.details = result.details or {}
    result.details.health = { state = meta.health_state or "pending", reason = meta.health_reason or "gateway_pending",
        message = meta.health_message or "Waiting for Discord gateway readiness", at = meta.health_at }
    if meta.health_state ~= "ready" and meta.health_state ~= "warning" then
        result.status = meta.health_state == "error" and "error" or "pending"
        result.description = result.details.health.message
        result.error = meta.health_state == "error" and meta.health_message or nil
    end
    return result
end

local function guild_resource(guild: any): ResourceRow?
    if type(guild) ~= "table" then return nil end
    local id = trim(guild.id)
    if id == "" then return nil end
    return {
        type = "discord_guild",
        id = id,
        name = trim(guild.name) ~= "" and trim(guild.name) or id,
        selectable = false,
        drillable = true,
    }
end

-- One guild channel -> a resource row, or nil to skip (voice/stage). A category
-- becomes a non-selectable container; a postable channel becomes a selectable
-- target carrying parent_id (its category) so the picker nests it.
local function channel_resource(channel: any, guild_id: string): ResourceRow?
    if type(channel) ~= "table" then return nil end
    local id = trim(channel.id)
    if id == "" then return nil end
    local kind = tonumber(channel.type) or 0
    if kind == CATEGORY_TYPE then
        return {
            type = "discord_category",
            id = id,
            name = trim(channel.name) ~= "" and trim(channel.name) or id,
            guild_id = guild_id,
            selectable = false,
        }
    end
    -- A json-decoded number does not hash-match a literal integer table key in this
    -- runtime, so test postable types by value (as the category check above does).
    if kind ~= TEXT_TYPE and kind ~= ANNOUNCEMENT_TYPE then return nil end
    return {
        type = "discord_channel",
        id = id,
        name = trim(channel.name) ~= "" and trim(channel.name) or id,
        guild_id = guild_id,
        channel_type = kind,
        parent_id = trim(channel.parent_id),
        selectable = true,
    }
end

function M.discover_resources(args: any): (DiscoverResult?, error?)
    args = type(args) == "table" and args or {}
    local conn, err = open()
    if not conn then return nil, err end

    -- guild_id is the drill arg; accept generic parent_id too (the picker passes the
    -- expanded node's id under either key). Categories arrive nested in this same
    -- response via channel.parent_id, so only the guild level needs a drill.
    local guild_id = trim(args.guild_id) ~= "" and trim(args.guild_id) or trim(args.parent_id)
    if guild_id ~= "" then
        local result, request_err = transport.list_guild_channels(conn, guild_id)
        if request_err then return nil, request_err end
        if not result.success then return discord_failure(result) end
        local resources: { ResourceRow } = {}
        if type(result.data) == "table" then
            for _, channel in ipairs(result.data :: { any }) do
                local row = channel_resource(channel, guild_id)
                if row then resources[#resources + 1] = row end
            end
        end
        return { success = true, resources = resources }
    end

    local result, request_err = transport.list_current_user_guilds(conn)
    if request_err then return nil, request_err end
    if not result.success then return discord_failure(result) end
    local resources: { ResourceRow } = {}
    if type(result.data) == "table" then
        for _, guild in ipairs(result.data :: { any }) do
            local row = guild_resource(guild)
            if row then resources[#resources + 1] = row end
        end
    end
    return { success = true, resources = resources }
end

local function reply_payload(content: any, content_type: string): (any?, string?)
    if type(content) == "table" then
        local payload: { [string]: any } = {}
        for key, value in pairs(content) do payload[key] = value end
        if trim(payload.content) == "" and type(payload.text) == "string" then payload.content = payload.text end
        if trim(payload.content) == "" then return nil, "content.content is required" end
        return payload, nil
    end
    local text = tostring(content or "")
    if text == "" then return nil, "content is required" end
    return { content = text }, nil
end

function M.send_reply(args: any): SimpleResult
    args = type(args) == "table" and args or {}
    local channel_id = trim(args.resource_id)
    if channel_id == "" then return { success = false, error = "resource_id is required" } end

    local payload, perr = reply_payload(args.content, trim(args.content_type))
    if perr or not payload then return { success = false, error = perr } end
    local content = trim(payload.content)
    if #content > types.MESSAGE_MAX_LENGTH then
        return { success = false, error = "Discord message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters" }
    end

    if args.outbound == true and args.reply_proof == nil then
        return transport.send_outbound({ channel_id = channel_id, payload = payload }) :: SimpleResult
    end
    if args.outbound == true or args.reply_proof == nil then
        return { success = false, error = (errors.new({ message = "sealed reply proof is required",
            kind = errors.PERMISSION_DENIED, retryable = false,
            details = { error_kind = "access" } }) :: error) }
    end
    return transport.send_admitted_reply({ channel_id = channel_id,
        payload = payload, reply_proof = args.reply_proof }) :: SimpleResult
end

function M.update_reply(args: any): SimpleResult
    args = type(args) == "table" and args or {}
    local channel_id = trim(args.resource_id)
    if channel_id == "" then return { success = false, error = "resource_id is required" } end
    local message_ref = trim(args.message_ref)
    if message_ref == "" then return { success = false, error = "message_ref is required" } end

    local payload, perr = reply_payload(args.content, trim(args.content_type))
    if perr or not payload then return { success = false, error = perr } end
    local content = trim(payload.content)
    if #content > types.MESSAGE_MAX_LENGTH then
        return { success = false, error = "Discord message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters" }
    end

    return { success = false, error = (errors.new({ message = "Discord reply updates require a separately admitted operation",
        kind = errors.PERMISSION_DENIED, retryable = false }) :: error) }
end

function M.send_status(args: any): SimpleResult
    args = type(args) == "table" and args or {}
    local channel_id = trim(args.resource_id)
    if channel_id == "" then return { success = false, error = "resource_id is required" } end

    return { success = false, error = (errors.new({ message = "Discord status rendering requires a separately admitted operation",
        kind = errors.PERMISSION_DENIED, retryable = false }) :: error) }
end

function M.delete(args: any): (SimpleResult?, error?)
    return base.delete()
end

-- Test seams: the pure request/response shaping that the proper flow rests on,
-- exposed so it is unit-tested without a live component context or Discord API.
M._reply_payload = reply_payload
M._guild_resource = guild_resource
M._channel_resource = channel_resource
M._shape_bot_identity = shape_bot_identity

return M
