local ctx = require("ctx")
local transport = require("transport")
local api = require("api")
local types = require("types")
local tool_result = require("tool_result")

local M = {}
M._transport = transport :: any
M._api = api :: any

local VALID = {
    send_message = true,
    edit_message = true,
    delete_message = true,
    send_reaction = true,
    pin_message = true,
    send_typing = true,
}

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function open(): (any?, error?)
    return M._transport.connect(ctx.get("connection_id") :: string?)
end

-- A failed Telegram answer is the tool's domain error carrying the failed
-- Result: Telegram's description, HTTP status and response body.
local function telegram_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

function M.handler(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local action = trim(args.action)
    if action == "" then return tool_result.domain_error("action is required (send_message, edit_message, delete_message, send_reaction, pin_message, send_typing)") end
    if not VALID[action] then return tool_result.domain_error("unknown action '" .. action .. "'") end

    local chat_id = trim(args.chat_id)
    if chat_id == "" then return tool_result.domain_error("chat_id is required") end
    local message_id = trim(args.message_id)
    local text = trim(args.text or args.content)

    if action == "send_message" then
        if text == "" then return tool_result.domain_error("text is required for send_message") end
        if #text > types.MESSAGE_MAX_LENGTH then return tool_result.domain_error("message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters") end
    elseif action == "edit_message" then
        if message_id == "" then return tool_result.domain_error("message_id is required for edit_message") end
        if text == "" then return tool_result.domain_error("text is required for edit_message") end
        if #text > types.MESSAGE_MAX_LENGTH then return tool_result.domain_error("message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters") end
    elseif action == "delete_message" or action == "pin_message" then
        if message_id == "" then return tool_result.domain_error("message_id is required for " .. action) end
    elseif action == "send_reaction" then
        if message_id == "" then return tool_result.domain_error("message_id is required for send_reaction") end
        if trim(args.emoji) == "" then return tool_result.domain_error("emoji is required for send_reaction") end
    end

    local conn, conn_err = open()
    if not conn then return nil, conn_err end

    if action == "send_message" then
        local payload: { [string]: any } = { text = text }
        if trim(args.parse_mode) ~= "" then payload.parse_mode = trim(args.parse_mode) end
        if args.reply_to_message_id ~= nil then payload.reply_to_message_id = args.reply_to_message_id end
        if args.message_thread_id ~= nil then payload.message_thread_id = args.message_thread_id end
        local r, err = M._api.send_message(conn, chat_id, payload)
        if err then return nil, err end
        if not r.success then return telegram_error(r) end
        return { success = true, action = action, result = "created", chat_id = chat_id,
            message_id = tostring(r.data.message_id), message = r.data }
    elseif action == "edit_message" then
        local payload: { [string]: any } = { text = text }
        if trim(args.parse_mode) ~= "" then payload.parse_mode = trim(args.parse_mode) end
        local r, err = M._api.update_message(conn, chat_id, message_id, payload)
        if err then return nil, err end
        if not r.success then return telegram_error(r) end
        return { success = true, action = action, result = "updated", chat_id = chat_id, message_id = message_id, message = r.data }
    elseif action == "delete_message" then
        local r, err = M._api.delete_message(conn, chat_id, message_id)
        if err then return nil, err end
        if not r.success then return telegram_error(r) end
        return { success = true, action = action, result = "deleted", chat_id = chat_id, message_id = message_id }
    elseif action == "send_reaction" then
        local r, err = M._api.send_reaction(conn, chat_id, message_id, trim(args.emoji))
        if err then return nil, err end
        if not r.success then return telegram_error(r) end
        return { success = true, action = action, result = "updated", chat_id = chat_id, message_id = message_id, emoji = trim(args.emoji) }
    elseif action == "pin_message" then
        local r, err = M._api.pin_message(conn, chat_id, message_id)
        if err then return nil, err end
        if not r.success then return telegram_error(r) end
        return { success = true, action = action, result = "updated", chat_id = chat_id, message_id = message_id }
    end

    local r, err = M._api.send_chat_action(conn, chat_id, "typing")
    if err then return nil, err end
    if not r.success then return telegram_error(r) end
    return { success = true, action = action, result = "rendered", chat_id = chat_id }
end

return M
