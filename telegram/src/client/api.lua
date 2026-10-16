local capacity_http = require("capacity_http")
local http_client = require("http_client")
local json = require("json")
local time = require("time")
local types = require("types")

local M = {
    _http_client = http_client,
    _sleep = time.sleep,
}

local MAX_RETRIES = 3

function M.retry_after_ms(response: any): number
    local secs: number? = nil
    if response and type((response :: any).headers) == "table" then
        local h = (response :: any).headers["Retry-After"] or (response :: any).headers["retry-after"]
        secs = tonumber(h)
    end
    local ms = math.floor((secs or 1) * 1000)
    if ms < 0 then ms = 0 end
    if ms > 60000 then ms = 60000 end
    return ms
end

local function encode_component(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end
M.encode_component = encode_component

local function encode_query(params: { [string]: any }?): string
    if not params then return "" end
    local parts: { string } = {}
    for key, value in pairs(params) do
        if value ~= nil then
            parts[#parts + 1] = encode_component(tostring(key)) .. "=" .. encode_component(tostring(value))
        end
    end
    return table.concat(parts, "&")
end
M.encode_query = encode_query

function M.headers(): { [string]: string }
    return {
        ["Accept"] = "application/json",
        ["Content-Type"] = "application/json",
        ["User-Agent"] = "KickSide Telegram Provider (https://wippy.ai, 0.1.0)",
    }
end

function M.extract_error(body: any, status_code: integer): string
    if type(body) == "table" and type((body :: any).description) == "string" and (body :: any).description ~= "" then
        return (body :: any).description :: string
    end
    if status_code == 429 then return "rate limited" end
    if status_code == 401 or status_code == 403 then return "unauthorized" end
    return "request failed"
end

local function method_url(conn: types.Conn, method_name: string): string
    return types.api_base() .. "/bot" .. encode_component(conn.bot_token) .. "/" .. method_name
end
M.method_url = method_url

-- Encode each path segment independently and reject ambiguous structures. Dot
-- segments must fail closed: dropping them could turn an unsafe path into a
-- different, valid Bot API endpoint.
local function encode_path(file_path: string): (string?, string?)
    if file_path == "" or #file_path > 2048 then return nil, "invalid file_path" end
    if file_path:sub(1, 1) == "/" or file_path:sub(-1) == "/" or file_path:find("//", 1, true) then
        return nil, "invalid file_path"
    end

    local segments: { string } = {}
    for segment in file_path:gmatch("[^/]+") do
        if segment == "." or segment == ".." then return nil, "invalid file_path" end
        segments[#segments + 1] = encode_component(segment)
    end
    if #segments == 0 then return nil, "invalid file_path" end
    return table.concat(segments, "/"), nil
end
M.encode_path = encode_path

local function replace_plain(value: string, needle: string, replacement: string): string
    if needle == "" then return value end
    local parts: { string } = {}
    local offset: integer = 1
    while true do
        local first, last = value:find(needle, offset, true)
        if not first then
            parts[#parts + 1] = value:sub(offset)
            break
        end
        parts[#parts + 1] = value:sub(offset, (first :: integer) - 1)
        parts[#parts + 1] = replacement
        offset = (last :: integer) + 1
    end
    return table.concat(parts)
end

-- Transport errors commonly include the credential-bearing URL. Redact both
-- representations defensively because an HTTP implementation may report the
-- URL before or after percent-decoding it.
local function without_token(conn: types.Conn, err: any): string
    local token = conn.bot_token
    local encoded = encode_component(token)
    local clean = tostring(err)
    if token == "" then return clean end
    clean = replace_plain(clean, token, "<token>")
    if encoded ~= token then clean = replace_plain(clean, encoded, "<token>") end
    return clean
end
M.without_token = without_token

local function decode_body(response: any): any
    local raw = response and (response :: any).body or nil
    if type(raw) ~= "string" or (raw :: string) == "" then return nil end
    local parsed, derr = json.decode(raw :: string)
    if derr then return nil end
    return parsed
end

local function status_of(response: any): integer
    return (response and (response :: any).status_code or 0) :: integer
end

local function send(method: string, url: string, opts: { headers: { [string]: string }, body: string }, retries: integer): (any?, any?)
    for attempt = 0, retries do
        local response, err = M._http_client.request(method, url, opts)
        if err then return nil, err end
        if status_of(response) ~= 429 or attempt >= retries then return response, nil end
        M._sleep(tostring(M.retry_after_ms(response)) .. "ms")
    end
    return nil, errors.new({ kind = errors.RATE_LIMITED, retryable = true, message = "rate limited" })
end

-- A request failure as a typed error whose message never carries the bot token
-- (transport errors commonly quote the credential-bearing URL).
local function redacted(conn: types.Conn, kind: string, err: any): error
    return errors.new({ kind = kind, retryable = kind == errors.UNAVAILABLE, message = without_token(conn, err) })
end

-- A Telegram answer is a Result (a failed answer carries Telegram's description,
-- HTTP status and response body); a request that cannot be encoded or sent is a
-- typed error. request runs it under the connection's provider capacity.
function M.call(conn: types.Conn, method_name: string, params: { [string]: any }?, method: string?, retries: integer): (types.Result?, error?)
    if conn.component_id then retries = 0 end
    method = method or "POST"
    local url = method_url(conn, method_name)
    local body_json, encode_err = json.encode(params or {})
    if encode_err then return nil, redacted(conn, errors.INVALID, encode_err) end
    local opts: { headers: { [string]: string }, body: string } = {
        headers = M.headers(),
        body = body_json,
    }
    if method == "GET" then
        local query = encode_query(params)
        if query ~= "" then url = url .. "?" .. query end
        opts.body = ""
    end

    local response, err = send(method, url, opts, retries)
    if err ~= nil then return nil, redacted(conn, errors.UNAVAILABLE, err) end

    local status = status_of(response)
    local body: any = decode_body(response)
    if status >= 200 and status < 300 and type(body) == "table" and (body :: any).ok == true then
        return { success = true, data = (body :: any).result, status_code = status }
    end
    local result: types.Result = { success = false, error = without_token(conn, M.extract_error(body, status)), status_code = status, data = body }
    if status == 429 then
        local params = type(body) == "table" and type(body.parameters) == "table" and body.parameters or {}
        local seconds = tonumber(params.retry_after)
        result.retry_after_ms = seconds ~= nil and math.max(0, math.floor(seconds * 1000)) or M.retry_after_ms(response)
    end
    return result
end
local request = capacity_http.wrap(M.call)

function M.request(conn: types.Conn, method_name: string, params: { [string]: any }?, method: string?): (types.Result?, error?)
    return request(conn, method_name, params, method, MAX_RETRIES)
end

function M.request_once(conn: types.Conn, method_name: string, params: { [string]: any }?): (types.Result?, error?)
    return request(conn, method_name, params, "POST", 0)
end

function M.test_connection(conn: types.Conn): (types.Result?, error?)
    return M.request(conn, "getMe", nil, "GET")
end

function M.get_chat(conn: types.Conn, chat_id: string): (types.Result?, error?)
    return M.request(conn, "getChat", { chat_id = chat_id }, "GET")
end

function M.get_file(conn: types.Conn, file_id: string): (types.Result?, error?)
    return M.request(conn, "getFile", { file_id = file_id }, "GET")
end

-- The credential-bearing URL stays private to this module; callers receive
-- only the response bytes or a sanitized error from the shared send path.
function M.download_file(conn: types.Conn, file_path: string): types.Result
    local path, path_err = encode_path(file_path)
    if not path then return { success = false, error = path_err or "invalid file_path" } end

    local url = types.file_base() .. "/file/bot" .. encode_component(conn.bot_token) .. "/" .. path
    local response, err = send("GET", url, { headers = { ["Accept"] = "*/*" }, body = "" }, MAX_RETRIES)
    if err ~= nil then return { success = false, error = without_token(conn, err) } end

    local status = status_of(response)
    if status < 200 or status >= 300 then
        return { success = false, error = without_token(conn, M.extract_error(decode_body(response), status)), status_code = status }
    end

    local bytes = response and (response :: any).body or nil
    if type(bytes) ~= "string" or (bytes :: string) == "" then
        return { success = false, error = "download returned no bytes", status_code = status }
    end
    return { success = true, data = bytes, status_code = status }
end

function M.get_updates(conn: types.Conn, opts: any): (types.Result?, error?)
    opts = type(opts) == "table" and opts or {}
    local params: { [string]: any } = {
        allowed_updates = json.encode({ "message", "channel_post" }),
    }
    if opts.offset ~= nil then params.offset = tostring(opts.offset) end
    if opts.timeout ~= nil then params.timeout = tostring(opts.timeout) end
    return M.request(conn, "getUpdates", params, "GET")
end

function M.delete_webhook(conn: types.Conn): (types.Result?, error?)
    return M.request(conn, "deleteWebhook", { drop_pending_updates = false })
end

function M.send_message(conn: types.Conn, chat_id: string, payload: any): (types.Result?, error?)
    payload = type(payload) == "table" and payload or {}
    local params: { [string]: any } = { chat_id = chat_id }
    if type((payload :: any).text) == "string" then params.text = (payload :: any).text end
    if type((payload :: any).parse_mode) == "string" and (payload :: any).parse_mode ~= "" then params.parse_mode = (payload :: any).parse_mode end
    if (payload :: any).reply_to_message_id ~= nil then params.reply_to_message_id = (payload :: any).reply_to_message_id end
    if (payload :: any).message_thread_id ~= nil then params.message_thread_id = (payload :: any).message_thread_id end
    return M.request(conn, "sendMessage", params)
end

function M.update_message(conn: types.Conn, chat_id: string, message_id: string, payload: any): (types.Result?, error?)
    payload = type(payload) == "table" and payload or {}
    local params: { [string]: any } = { chat_id = chat_id, message_id = message_id }
    if type((payload :: any).text) == "string" then params.text = (payload :: any).text end
    if type((payload :: any).parse_mode) == "string" and (payload :: any).parse_mode ~= "" then params.parse_mode = (payload :: any).parse_mode end
    return M.request(conn, "editMessageText", params)
end

function M.delete_message(conn: types.Conn, chat_id: string, message_id: string): (types.Result?, error?)
    return M.request(conn, "deleteMessage", { chat_id = chat_id, message_id = message_id })
end

function M.send_reaction(conn: types.Conn, chat_id: string, message_id: string, emoji: string): (types.Result?, error?)
    return M.request(conn, "setMessageReaction", {
        chat_id = chat_id,
        message_id = message_id,
        reaction = { { type = "emoji", emoji = emoji } },
    })
end

function M.pin_message(conn: types.Conn, chat_id: string, message_id: string): (types.Result?, error?)
    return M.request(conn, "pinChatMessage", { chat_id = chat_id, message_id = message_id })
end

function M.send_chat_action(conn: types.Conn, chat_id: string, action: string): (types.Result?, error?)
    return M.request(conn, "sendChatAction", { chat_id = chat_id, action = action })
end


return M
