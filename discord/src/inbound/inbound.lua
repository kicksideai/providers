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

local function event_data(args: any): any
    args = type(args) == "table" and args or {}
    local event = type(args.event) == "table" and args.event or args
    if type(event.d) == "table" then return event.d end
    return event
end

local function component_id(args: any, conn: any): string
    local id = trim(args.component_id or args.reply_component_id)
    if id ~= "" then return id end
    return trim(conn and conn.component_id)
end

-- The DM receiver runs as the system gateway process: it resolves the sender
-- from the link, replies via the connection token (system read), and forwards
-- linked turns to the hub -- none of which needs a request actor. Open the
-- contract without a security frame.
local function open_dm(): (any?, string?)
    local def, get_err = contract.get(DM_CONTRACT)
    if get_err or not def then return nil, "dm receive contract unavailable: " .. tostring(get_err or "not found") end
    local inst, open_err = def:open()
    if open_err or not inst then return nil, "dm receive open failed: " .. tostring(open_err or "not found") end
    return inst, nil
end

-- The channel receiver also runs as the system gateway process: it routes the
-- channel to its responder automation and runs the agent as the frozen installer
-- -- no request actor. Open the contract without a security frame.
local function open_channel(): (any?, string?)
    local def, get_err = contract.get(CHANNEL_CONTRACT)
    if get_err or not def then return nil, "channel receive contract unavailable: " .. tostring(get_err or "not found") end
    local inst, open_err = def:open()
    if open_err or not inst then return nil, "channel receive open failed: " .. tostring(open_err or "not found") end
    return inst, nil
end

-- Normalize Discord attachments into the neutral envelope shape {ref,filename,
-- size,mime}: the CDN url (or proxy_url) becomes the opaque ref, content_type
-- becomes mime. No Discord field names cross the seam.
local function normalized_attachments(list: any): { any }
    local out: { any } = {}
    if type(list) ~= "table" then return out end
    for _, item in ipairs(list) do
        if type(item) == "table" then
            local ref = trim(item.url)
            if ref == "" then ref = trim(item.proxy_url) end
            out[#out + 1] = {
                ref = ref,
                filename = trim(item.filename),
                size = tonumber(item.size) or 0,
                mime = trim(item.content_type),
            }
        end
    end
    return out
end

-- Build the neutral inbound envelope from a Discord message event. Returns
-- (inbound, is_dm, err). A bot-authored message yields inbound.ignored. is_dm is
-- true when there is no guild_id (a true DM); false for a guild channel message.
-- The envelope is identical for both -- only the routing target differs.
local function normalize_core(args: any): (any?, boolean, string?)
    args = type(args) == "table" and args or {}
    local conn, conn_err = transport.inbound_context(trim(args.component_id or args.reply_component_id))
    if conn_err or not conn then return nil, false, conn_err end
    local data = event_data(args)
    if type(data) ~= "table" then return nil, false, "Discord event data is required" end

    local author = type(data.author) == "table" and data.author or {}
    if author.bot == true and conn.allow_bot_messages ~= true and args.allow_bot_messages ~= true then
        return { ignored = true, reason = "bot_author" }, false, nil
    end

    local channel_id = trim(data.channel_id)
    if channel_id == "" then return nil, false, "Discord message channel_id is required" end
    local author_id = trim(author.id)
    if author_id == "" then return nil, false, "Discord message author.id is required" end
    local cid = component_id(args, conn)
    if cid == "" then return nil, false, "component_id is required" end

    local is_dm = trim(data.guild_id) == ""
    return {
        provider = types.PROVIDER,
        reply_component_id = cid,
        reply_resource_id = channel_id,
        channel_id = channel_id,
        external_user_id = author_id,
        external_username = trim(author.username),
        external_display_name = trim(author.global_name or author.username),
        external_message_id = trim(data.id),
        text = type(data.content) == "string" and data.content or "",
        attachments = normalized_attachments(data.attachments),
    }, is_dm, nil
end

-- normalize(args) -> the DM envelope. A guild channel message is rejected here so
-- only true DMs reach kickside.dm:receive.
function M.normalize(args: any): (any?, string?)
    local inbound, is_dm, err = normalize_core(args)
    if err then return nil, err end
    if inbound and (inbound :: any).ignored == true then return inbound, nil end
    if not is_dm then return nil, "guild channel message is not a DM" end
    return inbound, nil
end

-- normalize_channel(args) -> the channel envelope. A DM is rejected here so only
-- guild channel messages reach kickside.channel:receive.
function M.normalize_channel(args: any): (any?, string?)
    local inbound, is_dm, err = normalize_core(args)
    if err then return nil, err end
    if inbound and (inbound :: any).ignored == true then return inbound, nil end
    if is_dm then return nil, "DM is not a channel message" end
    return inbound, nil
end

local function deliver(inbound: any, instance: any): any
    local result, call_err = instance:receive(inbound)
    if call_err then return { success = false, accepted = false, status = "error", error = call_err } end
    if type(result) == "table" then
        result.success = result.accepted == true or result.status == "ignored"
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

-- receive_channel_message(args) -> hand a normalized guild message to
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
