local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: any?, status_code: integer?, details: any? }
type StatusRenderResult = { success: boolean, rendered: boolean?, error: any? }
type ResourceRow = { type: string, id: string, name: string, selectable: boolean?, chat_type: string?, username: string? }
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: string?, status_code: integer?, details: any? }

local trim = base.trim
local component_id = base.component_id

local function trim_text(value: any): string
    local text = trim(tostring(value or ""))
    if type(text) ~= "string" then return "" end
    return text
end

local function open(): (types.Conn?, error?)
    local id, err = component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

local function bot_details(data: any): any
    data = type(data) == "table" and data or {}
    return {
        id = data.id,
        is_bot = data.is_bot,
        first_name = data.first_name,
        username = data.username,
        can_join_groups = data.can_join_groups,
        can_read_all_group_messages = data.can_read_all_group_messages,
        supports_inline_queries = data.supports_inline_queries,
    }
end

-- A failed Telegram answer: its description, HTTP status and response body.
local function telegram_failure(result: any, extra: any?): any
    local out: any = { success = false, error = result.error, status_code = result.status_code, details = result.data }
    for key, value in pairs(extra or {}) do out[key] = value end
    return out
end

function M.test_connection(args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return telegram_failure(result) end
    return { success = true, details = result.data }
end

function M.get_status(args: any): (StatusResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return telegram_failure(result, { status = "error" }) end
    return { success = true, status = "ok", details = bot_details(result.data) }
end

local function chat_resource(chat: any): ResourceRow?
    if type(chat) ~= "table" then return nil end
    local id = trim_text(chat.id)
    if id == "" then return nil end
    local name = trim_text(chat.title)
    if name == "" then name = trim_text(table.concat({ trim_text(chat.first_name), trim_text(chat.last_name) }, " ")) end
    if name == "" then name = trim_text(chat.username) end
    if name == "" then name = id end
    return {
        type = "telegram_chat",
        id = id,
        name = name,
        selectable = true,
        chat_type = trim_text(chat.type),
        username = trim_text(chat.username),
    }
end

function M.discover_resources(args: any): (DiscoverResult?, error?)
    args = type(args) == "table" and args or {}
    local conn, err = open()
    if not conn then return nil, err end

    local resources: { ResourceRow } = {}
    local default_chat_id = trim_text(conn.default_chat_id)
    if default_chat_id == "" then
        return { success = true, resources = resources }
    end

    local result, request_err = transport.get_chat(conn, default_chat_id)
    if not result then return nil, request_err end
    if not result.success then return telegram_failure(result) end
    local row = chat_resource(result.data)
    if row then resources[#resources + 1] = row end
    return { success = true, resources = resources }
end

local function reply_payload(content: any): (string, any, any, string, string?)
    if type(content) == "table" then
        local text = trim_text((content :: any).text)
        if text == "" then text = trim_text((content :: any).content) end
        if text == "" then return "", nil, nil, "", "content.text is required" end
        local parse_mode = trim_text((content :: any).parse_mode)
        return text, (content :: any).reply_to_message_id, (content :: any).message_thread_id, parse_mode, nil
    end
    local text = tostring(content or "")
    if text == "" then return "", nil, nil, "", "content is required" end
    return text, nil, nil, "", nil
end

function M.send_reply(args: any): SimpleResult
    args = type(args) == "table" and args or {}
    local chat_id = trim_text(args.resource_id)
    if chat_id == "" then return { success = false, error = "resource_id is required" } end

    local text, reply_to_message_id, message_thread_id, parse_mode, perr = reply_payload(args.content)
    if perr then return { success = false, error = perr } end
    if #text > types.MESSAGE_MAX_LENGTH then
        return { success = false, error = "Telegram message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters" }
    end

    local payload: { [string]: any } = { text = text }
    if reply_to_message_id ~= nil and trim_text(reply_to_message_id) ~= "" then payload.reply_to_message_id = reply_to_message_id end
    if message_thread_id ~= nil and trim_text(message_thread_id) ~= "" then payload.message_thread_id = message_thread_id end
    if parse_mode ~= "" then payload.parse_mode = parse_mode end
    return transport.send_reply({ chat_id = chat_id, payload = payload,
        reply_proof = args.reply_proof, outbound = args.outbound }) :: SimpleResult
end

function M.update_reply(args: any): SimpleResult
    args = type(args) == "table" and args or {}
    local chat_id = trim_text(args.resource_id)
    if chat_id == "" then return { success = false, error = "resource_id is required" } end
    local message_ref = trim_text(args.message_ref)
    if message_ref == "" then return { success = false, error = "message_ref is required" } end

    local text, _reply_to, _thread_id, parse_mode, perr = reply_payload(args.content)
    if perr then return { success = false, error = perr } end
    if #text > types.MESSAGE_MAX_LENGTH then
        return { success = false, error = "Telegram message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters" }
    end

    if args.reply_proof ~= nil then
        return { success = false, error = (errors.new({ message = "Telegram reply updates require a separately admitted operation",
            kind = errors.PERMISSION_DENIED, retryable = false }) :: error) }
    end
    local payload: { [string]: any } = { text = text }
    if parse_mode ~= "" then payload.parse_mode = parse_mode end
    return transport.update_reply({ chat_id = chat_id, message_ref = message_ref, payload = payload }) :: SimpleResult
end

function M.send_status(args: any): StatusRenderResult
    args = type(args) == "table" and args or {}
    local chat_id = trim_text(args.resource_id)
    if chat_id == "" then return { success = false, error = "resource_id is required" } end
    if args.reply_proof ~= nil then
        return { success = false, error = (errors.new({ message = "Telegram status rendering requires a separately admitted operation",
            kind = errors.PERMISSION_DENIED, retryable = false }) :: error) }
    end
    return transport.send_status({ chat_id = chat_id }) :: StatusRenderResult
end

function M.delete(args: any): (SimpleResult?, error?)
    return base.delete()
end

-- Test seams: pure request/response shaping that can be unit-tested without a
-- live component context or Telegram API.
M._reply_payload = reply_payload
M._chat_resource = chat_resource
M._bot_details = bot_details

return M
