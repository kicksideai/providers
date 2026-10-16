local contract = require("contract")
local transport = require("transport")
local types = require("types")

local M = {}

local DM_CONTRACT = "kickside.dm:receive"
local CHANNEL_CONTRACT = "kickside.channel:receive"

local function trim(value: any): string
    if type(value) ~= "string" then value = tostring(value or "") end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function update_data(args: any): any
    args = type(args) == "table" and args or {}
    return type(args.update) == "table" and args.update or args
end

local function component_id(args: any, conn: any): string
    local id = trim(args.component_id or args.reply_component_id)
    if id ~= "" then return id end
    return trim(conn and conn.component_id)
end

local function open_dm(): (any?, string?)
    local def, get_err = contract.get(DM_CONTRACT)
    if get_err or not def then return nil, "dm receive contract unavailable: " .. tostring(get_err or "not found") end
    local inst, open_err = def:open()
    if open_err or not inst then return nil, "dm receive open failed: " .. tostring(open_err or "not found") end
    return inst, nil
end

local function open_channel(): (any?, string?)
    local def, get_err = contract.get(CHANNEL_CONTRACT)
    if get_err or not def then return nil, "channel receive contract unavailable: " .. tostring(get_err or "not found") end
    local inst, open_err = def:open()
    if open_err or not inst then return nil, "channel receive open failed: " .. tostring(open_err or "not found") end
    return inst, nil
end

local function message_from_update(update: any): (any?, string?)
    if type(update) ~= "table" then return nil, "Telegram update data is required" end
    if type((update :: any).message) == "table" then return (update :: any).message, "message" end
    if type((update :: any).channel_post) == "table" then return (update :: any).channel_post, "channel_post" end
    if type((update :: any).edited_message) == "table" then return nil, "edited_message" end
    if type((update :: any).edited_channel_post) == "table" then return nil, "edited_channel_post" end
    return nil, "unsupported_update"
end

local function display_name(user: any, fallback: string): string
    if type(user) ~= "table" then return fallback end
    local first = trim((user :: any).first_name)
    local last = trim((user :: any).last_name)
    local joined = trim(first .. " " .. last)
    if joined ~= "" then return joined end
    local username = trim((user :: any).username)
    if username ~= "" then return username end
    local title = trim((user :: any).title)
    if title ~= "" then return title end
    return fallback
end

local MEDIA = {
    { field = "voice", filename = "voice.oga", mime = "audio/ogg" },
    { field = "audio", filename = "audio.mp3", mime = "audio/mpeg" },
    { field = "video_note", filename = "video_note.mp4", mime = "video/mp4" },
    { field = "video", filename = "video.mp4", mime = "video/mp4" },
    { field = "animation", filename = "animation.mp4", mime = "video/mp4" },
    { field = "document", filename = "document", mime = "application/octet-stream" },
}

local PHOTO = { filename = "photo.jpg", mime = "image/jpeg" }
local MAX_FILENAME_BYTES = 255
local MAX_PHOTO_SIZES = 32

local function safe_filename(value: any, fallback: string): string
    local name = type(value) == "string" and trim(value) or ""
    if name == "" then name = fallback end
    name = name:gsub("[%z\1-\31\127/\\]", "_")
    if #name > MAX_FILENAME_BYTES then return fallback end
    if name == "" or name == "." or name == ".." then return fallback end
    return name
end

local function normalized_size(value: any): number
    local size = tonumber(value)
    if size == nil or size < 0 or size ~= size then return 0 end
    return math.floor(size)
end

local function file_attachment(media: any, defaults: any): any?
    if type(media) ~= "table" then return nil end
    if type((media :: any).file_id) ~= "string" then return nil end
    local file_id = trim((media :: any).file_id)
    if file_id == "" or #file_id > 4096 or file_id:find("[%z\1-\31\127]") then return nil end

    local mime = type((media :: any).mime_type) == "string" and trim((media :: any).mime_type) or ""
    if mime == "" then mime = tostring(defaults.mime) end
    if #mime > 255 or mime:find("[%z\1-\31\127]") then mime = tostring(defaults.mime) end

    return {
        ref = file_id,
        filename = safe_filename((media :: any).file_name, tostring(defaults.filename)),
        size = normalized_size((media :: any).file_size),
        mime = mime,
    }
end


local function largest_photo(sizes: any): any?
    if type(sizes) ~= "table" then return nil end
    local largest: any = nil
    local largest_area = -1
    local seen = 0
    for _, size in ipairs(sizes :: { any }) do
        seen = seen + 1
        if seen > MAX_PHOTO_SIZES then break end
        if type(size) == "table" and trim((size :: any).file_id) ~= "" then
            local width = math.max(0, tonumber((size :: any).width) or 0)
            local height = math.max(0, tonumber((size :: any).height) or 0)
            local area = width * height
            if area >= largest_area then
                largest_area = area
                largest = size
            end
        end
    end
    return largest
end

local function sticker_defaults(sticker: any): any
    if (sticker :: any).is_animated == true then
        return { filename = "sticker.tgs", mime = "application/x-tgsticker" }
    end
    if (sticker :: any).is_video == true then
        return { filename = "sticker.webm", mime = "video/webm" }
    end
    return { filename = "sticker.webp", mime = "image/webp" }
end

local function message_attachments(message: any): { any }
    local out: { any } = {}
    if type(message) ~= "table" then return out end
    local animated = type((message :: any).animation) == "table"

    for _, media in ipairs(MEDIA) do
        if not (animated and media.field == "document") then
            local one = file_attachment((message :: any)[media.field], media)
            if one ~= nil then out[#out + 1] = one end
        end
    end
    local sticker = (message :: any).sticker
    if type(sticker) == "table" then
        local one = file_attachment(sticker, sticker_defaults(sticker))
        if one ~= nil then out[#out + 1] = one end
    end
    local photo = file_attachment(largest_photo((message :: any).photo), PHOTO)
    if photo ~= nil then out[#out + 1] = photo end
    return out
end

local function message_text(message: any): string
    if type(message) ~= "table" then return "" end
    local text = type((message :: any).text) == "string" and (message :: any).text or ""
    if text ~= "" then return text end
    return type((message :: any).caption) == "string" and (message :: any).caption or ""
end

local function normalize_core(args: any): (any?, boolean, error?)
    args = type(args) == "table" and args or {}
    local conn, conn_err = transport.connect(trim(args.component_id or args.reply_component_id))
    if conn_err or not conn then return nil, false, conn_err end

    local update = update_data(args)
    local message, kind = message_from_update(update)
    if not message then return { ignored = true, reason = kind or "unsupported_update" }, false, nil end

    local chat = type((message :: any).chat) == "table" and (message :: any).chat or nil
    if type(chat) ~= "table" then return nil, false, errors.new({ kind = errors.INVALID, message = "Telegram message chat is required" }) end

    local from = type((message :: any).from) == "table" and (message :: any).from or nil
    local sender_chat = type((message :: any).sender_chat) == "table" and (message :: any).sender_chat or nil
    if from and (from :: any).is_bot == true then
        if conn.allow_bot_messages ~= true and args.allow_bot_messages ~= true then
            return { ignored = true, reason = "bot_author" }, false, nil
        end
    end

    local chat_id = trim((chat :: any).id)
    if chat_id == "" then return nil, false, errors.new({ kind = errors.INVALID, message = "Telegram chat id is required" }) end
    local user_id = trim(from and (from :: any).id or nil)
    if user_id == "" then user_id = trim(sender_chat and (sender_chat :: any).id or nil) end
    if user_id == "" then user_id = chat_id end
    local cid = component_id(args, conn)
    if cid == "" then return nil, false, errors.new({ kind = errors.INVALID, message = "component_id is required" }) end

    local chat_type = trim((chat :: any).type)
    local is_dm = chat_type == "private"
    local author = from or sender_chat or chat
    return {
        provider = types.PROVIDER,
        reply_component_id = cid,
        reply_resource_id = chat_id,
        channel_id = chat_id,
        external_user_id = user_id,
        external_username = trim(author and (author :: any).username or nil),
        external_display_name = display_name(author, user_id),
        external_message_id = trim((message :: any).message_id),
        thread_ts = trim((message :: any).message_thread_id),
        text = message_text(message),
        attachments = message_attachments(message),
    }, is_dm, nil
end

function M.normalize(args: any): (any?, error?)
    local inbound, is_dm, err = normalize_core(args)
    if err then return nil, err end
    if inbound and (inbound :: any).ignored == true then return inbound, nil end
    if not is_dm then return nil, errors.new({ kind = errors.INVALID, message = "channel message is not a DM" }) end
    return inbound, nil
end

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

M._message_attachments = message_attachments
M._message_from_update = message_from_update
M._message_text = message_text
M._normalize_core = normalize_core

return M
