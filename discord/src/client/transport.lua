local component = require("component")
local api = require("api")
local types = require("types")
local base = require("base")
local reply_authorization = require("reply_authorization")

local security = require("security")
local preconditions = require("preconditions")

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- Resolve the selected component under the caller's current access before the
-- trusted private-context read exposes the bot token to this transport.
local function context(component_api: any, component_id: string?): (any?, error?)
    if component_id and component_id ~= "" then
        local allowed, access_err = component_api.get_context(component_id, component_api.ACCESS.READ)
        if access_err then return nil, access_err end
        if not allowed then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "connection access denied" }) end
        local ctx, err = component_api.get_private_context(component_id)
        if err then return nil, err end
        return ctx, nil
    end
    return nil, errors.new({ kind = errors.INVALID, message = "a Discord connection_id is required" })
end

local function connect_with(component_api: any, component_id: string?): (types.Conn?, error?)
    local ctx, err = context(component_api, component_id)
    if err or not ctx then return nil, err end
    local bot_token = trim(ctx.bot_token)
    if bot_token == "" then return nil, errors.new({ kind = errors.INVALID, message = "Discord connection is missing bot_token" }) end
    local component_id = type(ctx.component_id) == "string" and (ctx.component_id :: string) or component_id
    return ({
        component_id = component_id,
        bot_token = bot_token,
        allow_bot_messages = ctx.allow_bot_messages == true,
    } :: types.Conn), nil
end

function M.connect(component_id: string?): (types.Conn?, error?)
    return connect_with(component, component_id)
end

function M.inbound_context(connection_id: string): (any?, any?)
    if security.can("discord.gateway.receive", "kickside.discord.inbound:receive") ~= true then
        return nil, errors.new({ message = "trusted Discord ingress is required", kind = errors.PERMISSION_DENIED,
            details = { reason = "ingress_denied" } })
    end
    local rows, read_err = component.list_system({ component_ids = { connection_id }, include = { private_context = true } })
    if read_err then return nil, read_err end
    local row = type(rows) == "table" and rows[1] or nil
    if not row or row.impl_id ~= "kickside.discord.connection:discord_connection" then
        return nil, errors.new({ message = "Discord connection is unavailable", kind = errors.NOT_FOUND,
            details = { reason = "connection_missing" } })
    end
    local context = type(row.private_context) == "table" and row.private_context or {}
    return { component_id = connection_id, allow_bot_messages = context.allow_bot_messages == true }, nil
end


-- This is the only bot-token read that bypasses ordinary connection READ. The
-- connection owner reserves the admitted reply before the private read, and the
-- Discord destination remains the proof's single conversation.
local function send_admitted_reply_with(component_api: any, authorization: any, client_api: any, args: any): any
    local reservation, authorization_err = authorization.reserve({
        reply_proof = args.reply_proof,
        provider = types.PROVIDER,
        resource_id = args.channel_id,
        content = args.payload.content,
    })
    if authorization_err or not reservation then
        return { success = false, error = authorization_err or "reply proof refused" }
    end
    if reservation.send ~= true then
        if type(reservation.message_ref) == "string" and reservation.message_ref ~= "" then
            return { success = true, message_ref = reservation.message_ref }
        end
        return { success = false, error = "reply outcome is uncertain", uncertain = true }
    end
    local context, context_err = component_api.get_private_context(args.component_id)
    if context_err or type(context) ~= "table" then
        return { success = false, error = tostring(context_err or "reply connection unavailable"), uncertain = true }
    end
    local token = trim(context.bot_token)
    if token == "" then
        return { success = false, error = "Discord connection is missing bot_token", uncertain = true }
    end
    local conn = { component_id = args.component_id, bot_token = token,
        allow_bot_messages = context.allow_bot_messages == true }
    local result, request_err = client_api.send_channel_message(conn, args.channel_id, args.payload)
    if request_err then return { success = false, error = request_err, uncertain = true } end
    if result.success ~= true then
        local reason = preconditions.rest(result)
        return { success = false, error = errors.new({ message = tostring(result and result.error or "Discord reply failed"),
            kind = reason == "discord_permission_missing" and errors.PERMISSION_DENIED or errors.UNAVAILABLE,
            details = { reason = reason, status_code = result and result.status_code } }), uncertain = true }
    end
    local message_ref = type(result.data) == "table" and trim(result.data.id) or ""
    if message_ref == "" then
        return { success = false, error = "Discord reply returned no message id", uncertain = true }
    end
    local completed, complete_err = authorization.complete({ reply_proof = args.reply_proof,
        provider = types.PROVIDER,
        resource_id = args.channel_id, content = args.payload.content, message_ref = message_ref })
    if completed ~= true then
        local receipt_err = complete_err
        if not receipt_err and completed ~= false and completed ~= nil then receipt_err = completed end
        if receipt_err and errors.is(receipt_err, errors.UNAVAILABLE) then
            return { success = false, error = receipt_err, uncertain = true }
        end
        return { success = false, error = errors.new({
            message = "Discord reply was sent but its receipt could not be confirmed: "
                .. tostring(receipt_err or "receipt completion failed"),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" },
        }), uncertain = true }
    end
    -- A contract call can surface a typed service error as its first result.
    -- Confirm that the authorization service retained this message reference
    -- before reporting delivery as complete.
    local receipt, receipt_err = authorization.reserve({ reply_proof = args.reply_proof,
        provider = types.PROVIDER,
        resource_id = args.channel_id, content = args.payload.content })
    if receipt_err or type(receipt) ~= "table" or receipt.send ~= false
        or receipt.message_ref ~= message_ref then
        local unavailable = receipt_err and errors.is(receipt_err, errors.UNAVAILABLE) and receipt_err or nil
        if not unavailable and receipt ~= nil and errors.is(receipt, errors.UNAVAILABLE) then unavailable = receipt end
        return { success = false, error = unavailable or errors.new({
            message = "Discord reply was sent but its receipt could not be confirmed",
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" },
        }), uncertain = true }
    end
    return { success = true, message_ref = message_ref }
end


function M.send_admitted_reply(args: any): any
    args = type(args) == "table" and args or {}
    if type(args.reply_proof) ~= "table" then
        return { success = false, error = (errors.new({ message = "sealed reply proof is required",
            kind = errors.PERMISSION_DENIED, retryable = false,
            details = { error_kind = "access" } }) :: error) }
    end
    if type(args.payload) ~= "table" or type(args.payload.content) ~= "string"
        or trim(args.channel_id) == "" then
        return { success = false, error = "reply channel and content are required" }
    end
    local component_id, id_err = base.component_id()
    if not component_id then return { success = false, error = id_err } end
    return send_admitted_reply_with(component, reply_authorization, api, {
        component_id = component_id, channel_id = args.channel_id,
        payload = args.payload, reply_proof = args.reply_proof,
    })
end

-- A channel writable is an ordinary outbound operation. It uses the caller's
-- connection WRITE grant; only an admitted inbound reply may bypass that grant.
function M.send_outbound(args: any): any
    args = type(args) == "table" and args or {}
    local channel_id = trim(args.channel_id)
    if type(args.payload) ~= "table" or type(args.payload.content) ~= "string"
        or channel_id == "" then
        return { success = false, error = "outbound channel and content are required" }
    end
    local component_id, id_err = base.component_id()
    if not component_id then return { success = false, error = id_err } end
    local allowed, access_err = component.get_context(component_id, component.ACCESS.WRITE)
    if access_err or not allowed then
        return { success = false, error = access_err or "connection write denied" }
    end
    local private, private_err = component.get_private_context(component_id)
    if private_err or type(private) ~= "table" then
        return { success = false, error = private_err or "connection unavailable" }
    end
    local token = trim(private.bot_token)
    if token == "" then return { success = false, error = "Discord connection is missing bot_token" } end
    local result, request_err = api.send_channel_message({ component_id = component_id, bot_token = token,
        allow_bot_messages = private.allow_bot_messages == true }, channel_id, args.payload)
    if request_err then return { success = false, error = request_err } end
    if result.success ~= true then
        return { success = false, error = result.error, status_code = result.status_code, data = result.data }
    end
    local message_ref = type(result.data) == "table" and trim(result.data.id) or ""
    return { success = true, message_ref = message_ref }
end

M.get = api.get
M.post = api.post
M.test_connection = api.test_connection
M.get_application = api.get_application
M.list_current_user_guilds = api.list_current_user_guilds
M.list_guild_channels = api.list_guild_channels
M.get_channel = api.get_channel
M.get_channel_messages = api.get_channel_messages
M.send_channel_message = api.send_channel_message
M.edit_channel_message = api.edit_channel_message
M.trigger_typing = api.trigger_typing
M.list_channel_messages = api.list_channel_messages
M.send_channel_message_once = api.send_channel_message_once
M.edit_channel_message_once = api.edit_channel_message_once
M.delete_channel_message = api.delete_channel_message

return M
