local component = require("component")
local api = require("api")
local types = require("types")
local base = require("base")
local reply_authorization = require("reply_authorization")

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED,
        retryable = false, details = { error_kind = "access" } }) :: error)
end

-- Reply token use is owned by the connection. A sealed turn reserves its one
-- provider send before reading the private bot token; outbound use needs WRITE.
local function reply_connection(component_id: string, outbound: boolean): (types.Conn?, any?)
    if outbound then
        local allowed, access_err = component.get_context(component_id, component.ACCESS.WRITE)
        if access_err or not allowed then return nil, access_err or "connection write denied" end
    end
    local ctx, err = component.get_private_context(component_id)
    if err or type(ctx) ~= "table" then return nil, err or "reply connection unavailable" end
    local token = trim(ctx.bot_token)
    if token == "" then return nil, "Slack connection is missing bot_token" end
    return { component_id = component_id, bot_token = token,
        app_token = trim(ctx.app_token), allow_bot_messages = ctx.allow_bot_messages == true }, nil
end

function M.send_reply(args: any): any
    args = type(args) == "table" and args or {}
    local channel_id = trim(args.channel_id)
    local payload = args.payload
    if channel_id == "" or type(payload) ~= "table" or type(payload.text) ~= "string" then
        return { success = false, error = "reply channel and content are required" }
    end
    local sealed = type(args.reply_proof) == "table" and args.outbound ~= true
    if not sealed and (args.outbound ~= true or args.reply_proof ~= nil) then
        return { success = false, error = denied("sealed reply proof is required") }
    end
    local id, id_err = base.component_id()
    if not id then return { success = false, error = id_err } end
    local reservation: any = nil
    if sealed then
        local reserve_err: any
        reservation, reserve_err = reply_authorization.reserve({ reply_proof = args.reply_proof,
            provider = types.PROVIDER, resource_id = channel_id,
            content = payload.text })
        if reserve_err or not reservation then return { success = false, error = reserve_err or "reply proof refused" } end
        if reservation.send ~= true then
            if type(reservation.message_ref) == "string" and reservation.message_ref ~= "" then
                return { success = true, message_ref = reservation.message_ref }
            end
            return { success = false, error = "reply outcome is uncertain", uncertain = true }
        end
    end
    local conn, conn_err = reply_connection(id, not sealed)
    if conn_err or not conn then return { success = false, error = conn_err, uncertain = sealed } end
    local result, request_err = api.post_message(conn, channel_id, payload)
    if request_err then return { success = false, error = request_err, uncertain = sealed } end
    if not result.success then return { success = false, error = result.error, status_code = result.status_code, uncertain = sealed } end
    local message_ref = type(result.data) == "table" and trim(result.data.ts) or ""
    if sealed then
        if message_ref == "" then return { success = false, error = "Slack reply returned no message id", uncertain = true } end
        local completed, complete_err = reply_authorization.complete({ reply_proof = args.reply_proof,
            provider = types.PROVIDER, resource_id = channel_id,
            content = payload.text, message_ref = message_ref })
        if not completed then return { success = false, error = complete_err or "reply receipt unavailable", uncertain = true } end
    end
    return { success = true, message_ref = message_ref }
end

function M.update_reply(args: any): any
    args = type(args) == "table" and args or {}
    local channel_id = trim(args.channel_id)
    local message_ref = trim(args.message_ref)
    local text = type(args.text) == "string" and args.text or ""
    if channel_id == "" or message_ref == "" or text == "" then
        return { success = false, error = "update channel, message_ref and text are required" }
    end
    local id, id_err = base.component_id()
    if not id then return { success = false, error = id_err } end
    local conn, conn_err = reply_connection(id, true)
    if conn_err or not conn then return { success = false, error = conn_err } end
    local result, request_err = api.update_message(conn, channel_id, message_ref, { text = text })
    if request_err then return { success = false, error = request_err } end
    if not result.success then return { success = false, error = result.error, status_code = result.status_code } end
    local updated_ref = type(result.data) == "table" and trim(result.data.ts) or message_ref
    return { success = true, message_ref = updated_ref }
end

-- The socket hub and inbound adapter use this shared transport resolver.
-- Reply operations above have their own sealed-proof or WRITE gate.
local function context(component_id: string?): (any?, error?)
    if component_id and component_id ~= "" then
        local ctx, err = component.get_private_context(component_id)
        if err then return nil, err end
        return ctx, nil
    end
    local rows, err = component.list_system({
        meta = { class = types.CONNECTION_CLASS, provider = types.PROVIDER },
        include = { private_context = true },
    })
    if err then return nil, err end
    if type(rows) ~= "table" or #rows ~= 1 then
        return nil, errors.new({ kind = errors.INVALID, message = "no Slack connection selected; configure the trait connection when there is no single default" })
    end
    local ctx = type(rows[1].private_context) == "table" and rows[1].private_context or {}
    ctx.component_id = rows[1].component_id
    return ctx, nil
end

function M.connect(component_id: string?): (types.Conn?, error?)
    local ctx, err = context(component_id)
    if err or not ctx then return nil, err end
    local bot_token = trim(ctx.bot_token)
    if bot_token == "" then return nil, errors.new({ kind = errors.INVALID, message = "Slack connection is missing bot_token" }) end
    local component_id = type(ctx.component_id) == "string" and (ctx.component_id :: string) or component_id
    return ({
        component_id = component_id,
        bot_token = bot_token,
        app_token = trim(ctx.app_token),
        allow_bot_messages = ctx.allow_bot_messages == true,
    } :: types.Conn), nil
end

M.test_connection = api.test_connection
M.list_conversations = api.list_conversations
M.conversation_info = api.conversation_info
M.conversation_history = api.conversation_history
M.post_message = api.post_message
M.update_message = api.update_message
M.add_reaction = api.add_reaction
M.users_info = api.users_info
M.users_list = api.users_list

return M
