local contract = require("contract")
local transport = require("transport")
local types = require("types")

local M = {}

local DM_CONTRACT = "kickside.dm:receive"
local CHANNEL_CONTRACT = "kickside.channel:receive"

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- The inbound event is the Slack Events API `event` object (the socket worker
-- unwraps the envelope's payload.event before handing it over). Accept either the
-- bare event or a wrapper carrying it under `event`.
local function event_data(args: any): any
    args = type(args) == "table" and args or {}
    local event = type(args.event) == "table" and args.event or args
    return event
end

local function component_id(args: any, conn: any): string
    local id = trim(args.component_id or args.reply_component_id)
    if id ~= "" then return id end
    return trim(conn and conn.component_id)
end

-- The DM receiver runs as the system socket process: it resolves the sender from
-- the link, replies via the connection token (system read), and forwards linked
-- turns to the hub -- none of which needs a request actor. Open the contract
-- without a security frame.
local function open_dm(): (any?, string?)
    local def, get_err = contract.get(DM_CONTRACT)
    if get_err or not def then return nil, "dm receive contract unavailable: " .. tostring(get_err or "not found") end
    local inst, open_err = def:open()
    if open_err or not inst then return nil, "dm receive open failed: " .. tostring(open_err or "not found") end
    return inst, nil
end

-- The channel receiver also runs as the system socket process: it routes the
-- channel to its responder automation and runs the agent as the frozen installer
-- -- no request actor. Open the contract without a security frame.
local function open_channel(): (any?, string?)
    local def, get_err = contract.get(CHANNEL_CONTRACT)
    if get_err or not def then return nil, "channel receive contract unavailable: " .. tostring(get_err or "not found") end
    local inst, open_err = def:open()
    if open_err or not inst then return nil, "channel receive open failed: " .. tostring(open_err or "not found") end
    return inst, nil
end

-- Build the neutral inbound envelope from a Slack message event. Returns
-- (inbound, is_dm, err). A bot-authored message or a non-conversational subtype
-- (edits, joins, deletes) yields inbound.ignored. is_dm is true when
-- channel_type is "im"; false for any channel/group. The envelope is identical
-- for both -- only the routing target differs.
local function normalize_core(args: any): (any?, boolean, error?)
    args = type(args) == "table" and args or {}
    local conn, conn_err = transport.connect(trim(args.component_id or args.reply_component_id))
    if conn_err or not conn then return nil, false, conn_err end
    local data = event_data(args)
    if type(data) ~= "table" then return nil, false, errors.new({ kind = errors.INVALID, message = "Slack event data is required" }) end

    if trim(data.type) ~= "" and trim(data.type) ~= "message" then
        return { ignored = true, reason = "non_message" }, false, nil
    end

    local subtype = trim(data.subtype)
    local bot_id = trim(data.bot_id)
    if bot_id ~= "" or subtype == "bot_message" then
        if conn.allow_bot_messages ~= true and args.allow_bot_messages ~= true then
            return { ignored = true, reason = "bot_author" }, false, nil
        end
    end
    -- Other subtypes (message_changed, message_deleted, channel_join, ...) are not
    -- fresh user turns; skip them so only plain messages reach the receivers.
    if subtype ~= "" and subtype ~= "bot_message" then
        return { ignored = true, reason = "subtype:" .. subtype }, false, nil
    end

    local channel_id = trim(data.channel)
    if channel_id == "" then return nil, false, errors.new({ kind = errors.INVALID, message = "Slack message channel is required" }) end
    local user_id = trim(data.user)
    if user_id == "" and bot_id == "" then return { ignored = true, reason = "no_user" }, false, nil end
    if user_id == "" then user_id = bot_id end
    local cid = component_id(args, conn)
    if cid == "" then return nil, false, errors.new({ kind = errors.INVALID, message = "component_id is required" }) end

    local channel_type = trim(data.channel_type)
    local is_dm = channel_type == "im"
    return {
        provider = types.PROVIDER,
        reply_component_id = cid,
        reply_resource_id = channel_id,
        channel_id = channel_id,
        external_user_id = user_id,
        external_username = user_id,
        external_display_name = user_id,
        external_message_id = trim(data.ts),
        thread_ts = trim(data.thread_ts),
        text = type(data.text) == "string" and data.text or "",
        attachments = {},
    }, is_dm, nil
end

-- normalize(args) -> the DM envelope. A channel message is rejected here so only
-- true DMs reach kickside.dm:receive.
function M.normalize(args: any): (any?, error?)
    local inbound, is_dm, err = normalize_core(args)
    if err then return nil, err end
    if inbound and (inbound :: any).ignored == true then return inbound, nil end
    if not is_dm then return nil, errors.new({ kind = errors.INVALID, message = "channel message is not a DM" }) end
    return inbound, nil
end

-- normalize_channel(args) -> the channel envelope. A DM is rejected here so only
-- channel messages reach kickside.channel:receive.
function M.normalize_channel(args: any): (any?, error?)
    local inbound, is_dm, err = normalize_core(args)
    if err then return nil, err end
    if inbound and (inbound :: any).ignored == true then return inbound, nil end
    if is_dm then return nil, errors.new({ kind = errors.INVALID, message = "DM is not a channel message" }) end
    return inbound, nil
end

local function deliver(inbound: any, instance: any): any
    local result, call_err = instance:receive(inbound)
    if call_err then return { success = false, accepted = false, status = "error", error = tostring(call_err) } end
    if type(result) == "table" then
        result.success = result.status ~= "error"
        return result
    end
    return { success = false, accepted = false, status = "error", error = "receive returned no result" }
end

-- receive_message(args) -> hand a normalized DM to kickside.dm:receive.
function M.receive_message(args: any): any
    local inbound, nerr = M.normalize(args)
    if nerr then return { success = false, accepted = false, status = "error", error = nerr } end
    if inbound and inbound.ignored == true then
        return { success = true, accepted = false, status = "ignored", reason = inbound.reason }
    end
    local dm, derr = open_dm()
    if derr or not dm then return { success = false, accepted = false, status = "error", error = derr } end
    return deliver(inbound, dm)
end

-- receive_channel_message(args) -> hand a normalized channel message to
-- kickside.channel:receive, which routes it to the responder and runs the agent
-- as the frozen installer. An unrouted channel is a soft no-op, not an error.
function M.receive_channel_message(args: any): any
    local inbound, nerr = M.normalize_channel(args)
    if nerr then return { success = false, accepted = false, status = "error", error = nerr } end
    if inbound and inbound.ignored == true then
        return { success = true, accepted = false, status = "ignored", reason = inbound.reason }
    end
    local ch, cerr = open_channel()
    if cerr or not ch then return { success = false, accepted = false, status = "error", error = cerr } end
    return deliver(inbound, ch)
end

return M
