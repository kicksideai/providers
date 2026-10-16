local http_client = require("http_client")
local json = require("json")
local time = require("time")
local types = require("types")

local M = {}

-- Slack Web API rate limits answer with 429 + a Retry-After header (seconds). We
-- honour it with a bounded retry so a burst (e.g. an agent posting several
-- messages) backs off rather than tripping the per-method tier repeatedly.
local MAX_RETRIES = 3

-- retry_after_ms(response): the 429 wait from the Retry-After header (seconds),
-- clamped to a sane ceiling. Slack carries no retry hint in the body, only the
-- header. Pure, so it is unit-tested.
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

-- Slack Web API methods take application/x-www-form-urlencoded bodies; build one
-- from a flat param table, skipping nils. Pure so it is unit-tested.
local function encode_form(params: { [string]: any }?): string
    if not params then return "" end
    local parts: { string } = {}
    for key, value in pairs(params) do
        if value ~= nil then
            parts[#parts + 1] = encode_component(tostring(key)) .. "=" .. encode_component(tostring(value))
        end
    end
    return table.concat(parts, "&")
end
M.encode_form = encode_form

function M.headers(bot_token: string): { [string]: string }
    return {
        ["Authorization"] = "Bearer " .. bot_token,
        ["Accept"] = "application/json",
        ["Content-Type"] = "application/x-www-form-urlencoded",
        ["User-Agent"] = "KickSide Slack Provider (https://wippy.ai, 0.1.0)",
    }
end

-- Slack always answers HTTP 200 with a JSON body carrying a boolean `ok`; a
-- logical failure is { ok = false, error = "<code>" }. extract_error turns a
-- decoded body (or a transport status) into a machine-readable message. Pure.
function M.extract_error(body: any, status_code: integer): string
    if type(body) == "table" and type((body :: any).error) == "string" and (body :: any).error ~= "" then
        return (body :: any).error :: string
    end
    if status_code == 429 then return "rate limited" end
    if status_code == 401 or status_code == 403 then return "unauthorized" end
    return "request failed"
end

-- request(conn, method_name, params): POST a form-encoded call to the Slack Web
-- API. Honours 429 + Retry-After with a bounded retry. Success requires both a
-- 2xx and body.ok == true; any other Slack answer is a failed Result carrying
-- body.error and the decoded body. A transport failure is a typed error.
function M.request(conn: types.Conn, method_name: string, params: { [string]: any }?): (types.Result?, error?)
    local url = types.api_base() .. "/" .. method_name
    local opts: { headers: { [string]: string }, body: string } = {
        headers = M.headers(conn.bot_token),
        body = encode_form(params),
    }

    for attempt = 0, MAX_RETRIES do
        local response, err = http_client.request("POST", url, opts)
        if err then return nil, errors.wrap(err, "Slack " .. method_name .. " request failed") end

        local status = (response and (response :: any).status_code or 0) :: integer
        if status == 429 and attempt < MAX_RETRIES then
            time.sleep(tostring(M.retry_after_ms(response)) .. "ms")
        else
            local raw = response and (response :: any).body or nil
            local body: any = nil
            if type(raw) == "string" and (raw :: string) ~= "" then
                local parsed, derr = json.decode(raw :: string)
                if not derr then body = parsed end
            end
            if status >= 200 and status < 300 and type(body) == "table" and (body :: any).ok == true then
                return { success = true, data = body, status_code = status }
            end
            return { success = false, error = M.extract_error(body, status), status_code = status, data = body }
        end
    end

    return { success = false, error = "rate limited after retries", status_code = 429 }
end

function M.test_connection(conn: types.Conn): (types.Result?, error?)
    return M.request(conn, "auth.test", nil)
end

-- List the workspace conversations the bot can see. Slack caps list at under
-- 1000; default to a generous page since the picker shows them flat.
function M.list_conversations(conn: types.Conn, opts: any): (types.Result?, error?)
    opts = type(opts) == "table" and opts or {}
    local n = tonumber((opts :: any).limit) or 200
    if n < 1 then n = 1 elseif n > 1000 then n = 1000 end
    local params: { [string]: any } = {
        types = "public_channel,private_channel,mpim,im",
        exclude_archived = "true",
        limit = tostring(math.floor(n)),
    }
    local t = (opts :: any).types
    if type(t) == "string" and (t :: string) ~= "" then params.types = t end
    local cursor = (opts :: any).cursor
    if type(cursor) == "string" and (cursor :: string) ~= "" then params.cursor = cursor end
    return M.request(conn, "conversations.list", params)
end

function M.conversation_info(conn: types.Conn, channel: string): (types.Result?, error?)
    return M.request(conn, "conversations.info", { channel = channel })
end

-- Recent messages, newest first. Slack caps conversations.history limit at 999.
function M.conversation_history(conn: types.Conn, channel: string, opts: any): (types.Result?, error?)
    local n = tonumber((opts :: any).limit) or 20
    if n < 1 then n = 1 elseif n > 999 then n = 999 end
    local params: { [string]: any } = { channel = channel, limit = tostring(math.floor(n)) }
    local cursor = (opts :: any).cursor
    if type(cursor) == "string" and (cursor :: string) ~= "" then params.cursor = cursor end
    return M.request(conn, "conversations.history", params)
end

function M.conversation_message(conn: types.Conn, channel: string, ts: string): (types.Result?, error?)
    return M.request(conn, "conversations.history", {channel = channel, oldest = ts, latest = ts, inclusive = "true", limit = "1"})
end

-- Post a message. `payload.text` is the body; optional `payload.thread_ts` replies
-- in a thread. Blocks/attachments are out of scope for this provider.
function M.post_message(conn: types.Conn, channel: string, payload: any): (types.Result?, error?)
    payload = type(payload) == "table" and payload or {}
    local params: { [string]: any } = { channel = channel }
    if type((payload :: any).text) == "string" then params.text = (payload :: any).text end
    local thread_ts = (payload :: any).thread_ts
    if type(thread_ts) == "string" and (thread_ts :: string) ~= "" then params.thread_ts = thread_ts end
    return M.request(conn, "chat.postMessage", params)
end

function M.update_message(conn: types.Conn, channel: string, ts: string, payload: any): (types.Result?, error?)
    payload = type(payload) == "table" and payload or {}
    local params: { [string]: any } = { channel = channel, ts = ts }
    if type((payload :: any).text) == "string" then params.text = (payload :: any).text end
    return M.request(conn, "chat.update", params)
end

-- Add the bot's reaction to a message. `name` is an emoji name without colons
-- (e.g. "thumbsup"); `ts` is the target message timestamp.
function M.add_reaction(conn: types.Conn, channel: string, ts: string, name: string): (types.Result?, error?)
    return M.request(conn, "reactions.add", { channel = channel, timestamp = ts, name = name })
end

function M.users_info(conn: types.Conn, user: string): (types.Result?, error?)
    return M.request(conn, "users.info", { user = user })
end

function M.users_list(conn: types.Conn, opts: any): (types.Result?, error?)
    local n = tonumber((opts :: any).limit) or 200
    if n < 1 then n = 1 elseif n > 200 then n = 200 end
    local params: { [string]: any } = { limit = tostring(math.floor(n)) }
    local cursor = (opts :: any).cursor
    if type(cursor) == "string" and (cursor :: string) ~= "" then params.cursor = cursor end
    return M.request(conn, "users.list", params)
end

return M
