local capacity_http = require("capacity_http")
local http_client = require("http_client")
local json = require("json")
local time = require("time")
local types = require("types")

local M = {}

-- Discord REST rate limits answer with 429 + a retry window. We honour it with a
-- bounded retry so a burst (e.g. an agent sending several messages) backs off
-- rather than hammering and risking a global limit / Cloudflare ban.
local MAX_RETRIES = 3

-- retry_after_ms(response): the 429 wait from the JSON body's retry_after
-- (seconds, possibly fractional) or the Retry-After header, clamped to a sane
-- ceiling. Pure, so it is unit-tested.
function M.retry_after_ms(response: any): number
    local secs: number? = nil
    if response and type((response :: any).body) == "string" and (response :: any).body ~= "" then
        local parsed = json.decode((response :: any).body :: string)
        if type(parsed) == "table" and type((parsed :: any).retry_after) == "number" then
            secs = ((parsed :: any).retry_after :: number)
        end
    end
    if secs == nil and response and type((response :: any).headers) == "table" then
        local h = (response :: any).headers["Retry-After"] or (response :: any).headers["retry-after"]
        secs = tonumber(h)
    end
    local ms = math.floor((secs or 1) * 1000)
    if ms < 0 then ms = 0 end
    if ms > 60000 then ms = 60000 end
    return ms
end

local function encode_segment(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end
M.encode_segment = encode_segment

local function build_url(path: string, query: { [string]: any }?): string
    local url = types.api_base() .. path
    if query and next(query) then
        local params: { string } = {}
        for key, value in pairs(query) do
            if value ~= nil then
                params[#params + 1] = tostring(key) .. "=" .. encode_segment(tostring(value))
            end
        end
        if #params > 0 then url = url .. "?" .. table.concat(params, "&") end
    end
    return url
end
M.build_url = build_url

function M.headers(bot_token: string): { [string]: string }
    return {
        ["Authorization"] = "Bot " .. bot_token,
        ["Accept"] = "application/json",
        ["Content-Type"] = "application/json",
        ["User-Agent"] = "KickSide Discord Provider (https://wippy.ai, 0.1.0)",
    }
end

-- extract_error(response) -> (message, status_code, body): Discord's error
-- message, the HTTP status and the decoded error body (the raw body when it is
-- not JSON).
function M.extract_error(response: any): (string, integer, any)
    local status_code = (response and response.status_code or 0) :: integer

    local message = "request failed"
    local data: any = nil
    if response and response.body and response.body ~= "" then
        local body = response.body :: string
        local parsed: any = json.decode(body)
        if type(parsed) == "table" then
            data = parsed
            message = tostring(parsed.message or parsed.error or body)
        else
            data = body
            message = body
        end
    end
    if message == "request failed" then
        if status_code == 401 then return "unauthorized", status_code, data end
        if status_code == 403 then return "forbidden", status_code, data end
        if status_code == 404 then return "not found", status_code, data end
        if status_code == 429 then return "rate limited", status_code, data end
    end
    return message, status_code, data
end

-- A Discord answer is a Result (failed answers carry Discord's message, status and
-- error body); a request that cannot be encoded or sent is a typed error.
local do_request = capacity_http.wrap(function(conn: types.Conn, method: string, path: string, body: any?, query: { [string]: any }?, max_retries: number): (types.Result?, error?)
    if conn.component_id then max_retries = 0 end
    local opts: { headers: { [string]: string }, body: string? } = { headers = M.headers(conn.bot_token) }
    if body ~= nil then
        local encoded, encode_err = json.encode(body)
        if encode_err then return nil, errors.wrap(encode_err, "Discord request body is not serializable") end
        opts.body = encoded :: string
    end

    local url = build_url(path, query)
    for attempt = 0, max_retries do
        local response, err = http_client.request(method, url, opts)
        if err then return nil, errors.wrap(err, "Discord " .. method .. " " .. path .. " request failed") end

        if response and response.status_code >= 200 and response.status_code < 300 then
            local data: any = nil
            if response.body and response.body ~= "" then
                local parsed, decode_err = json.decode(response.body :: string)
                if decode_err or parsed == nil then
                    data = response.body
                else
                    data = parsed
                end
            end
            return { success = true, data = data, status_code = response.status_code :: integer }
        end

        -- 429: honour the rate-limit window and retry a bounded number of times.
        if response and response.status_code == 429 and attempt < max_retries then
            time.sleep(tostring(M.retry_after_ms(response)) .. "ms")
        else
            local message, code, error_body = M.extract_error(response)
            local result: types.Result = { success = false, error = message, status_code = code, data = error_body }
            -- A final 429 carries the provider wait so no-retry callers can hand
            -- it to a durable scheduler (the data-sync poller's retry_after_ms).
            if code == 429 then result.retry_after_ms = M.retry_after_ms(response) end
            return result
        end
    end

    return { success = false, error = "rate limited after retries", status_code = 429 }
end)

function M.request_json(conn: types.Conn, method: string, path: string, body: any?, query: { [string]: any }?): (types.Result?, error?)
    return do_request(conn, method, path, body, query, MAX_RETRIES)
end

-- Single-attempt request for durable callers (data-sync source/sink): a 429 is
-- returned immediately with retry_after_ms instead of sleeping in-process, so the
-- engine reschedules past the wait.
function M.request_json_once(conn: types.Conn, method: string, path: string, body: any?, query: { [string]: any }?): (types.Result?, error?)
    return do_request(conn, method, path, body, query, 0)
end

function M.get(conn: types.Conn, path: string, query: { [string]: any }?): (types.Result?, error?)
    return M.request_json(conn, "GET", path, nil, query)
end

function M.post(conn: types.Conn, path: string, body: any?): (types.Result?, error?)
    return M.request_json(conn, "POST", path, body, nil)
end

function M.patch(conn: types.Conn, path: string, body: any?): (types.Result?, error?)
    return M.request_json(conn, "PATCH", path, body, nil)
end

function M.test_connection(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/users/@me", nil)
end

function M.get_application(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/oauth2/applications/@me", nil)
end

-- Discord pages guilds with limit (1-200, default 200) and an after id cursor.
function M.list_current_user_guilds(conn: types.Conn, opts: { limit: number?, after: string? }?): (types.Result?, error?)
    local o = opts or {}
    local query: { [string]: any } = {}
    if o.limit ~= nil then
        local n = math.floor(tonumber(o.limit) or 200)
        if n < 1 then n = 1 elseif n > 200 then n = 200 end
        query.limit = tostring(n)
    end
    if type(o.after) == "string" and o.after ~= "" then query.after = o.after end
    return M.get(conn, "/users/@me/guilds", query)
end

function M.list_guild_channels(conn: types.Conn, guild_id: string): (types.Result?, error?)
    return M.get(conn, "/guilds/" .. encode_segment(guild_id) .. "/channels", nil)
end

function M.send_channel_message(conn: types.Conn, channel_id: string, payload: any): (types.Result?, error?)
    return M.post(conn, "/channels/" .. encode_segment(channel_id) .. "/messages", payload)
end

function M.edit_channel_message(conn: types.Conn, channel_id: string, message_id: string, payload: any): (types.Result?, error?)
    return M.patch(conn, "/channels/" .. encode_segment(channel_id) .. "/messages/" .. encode_segment(message_id), payload)
end

function M.get_guild(conn: types.Conn, guild_id: string): (types.Result?, error?)
    return M.get(conn, "/guilds/" .. encode_segment(guild_id), { with_counts = "true" } :: { [string]: any })
end

function M.get_channel(conn: types.Conn, channel_id: string): (types.Result?, error?)
    return M.get(conn, "/channels/" .. encode_segment(channel_id), nil)
end

function M.get_channel_message(conn: types.Conn, channel_id: string, message_id: string): (types.Result?, error?)
    return M.get(conn, "/channels/" .. encode_segment(channel_id) .. "/messages/" .. encode_segment(message_id), nil)
end

-- Recent messages, newest first. Discord caps limit at 100; before is the
-- message id cursor for older pages.
function M.get_channel_messages(conn: types.Conn, channel_id: string, limit: any, before: string?): (types.Result?, error?)
    local n = tonumber(limit) or 20
    if n < 1 then n = 1 elseif n > 100 then n = 100 end
    local query: { [string]: any } = { limit = tostring(math.floor(n)) }
    if type(before) == "string" and before ~= "" then query.before = before end
    return M.get(conn, "/channels/" .. encode_segment(channel_id) .. "/messages", query)
end

-- Message listing for the data-sync source: single attempt (no in-process 429
-- sleep) with optional `after` anchor for forward snowflake pagination. Discord
-- caps limit at 100 and answers newest-first.
function M.list_channel_messages(conn: types.Conn, channel_id: string, opts: { limit: number?, after: string? }?): (types.Result?, error?)
    local o = opts or {}
    local n = tonumber(o.limit) or 50
    if n < 1 then n = 1 elseif n > 100 then n = 100 end
    local query = { limit = tostring(math.floor(n)), after = nil :: string? }
    if type(o.after) == "string" and o.after ~= "" then query.after = o.after end
    return M.request_json_once(conn, "GET", "/channels/" .. encode_segment(channel_id) .. "/messages", nil, query :: { [string]: any })
end

-- Single-attempt write variants for the data-sync sink; a 429 surfaces
-- retry_after_ms instead of sleeping.
function M.send_channel_message_once(conn: types.Conn, channel_id: string, payload: any): (types.Result?, error?)
    return M.request_json_once(conn, "POST", "/channels/" .. encode_segment(channel_id) .. "/messages", payload, nil)
end

function M.edit_channel_message_once(conn: types.Conn, channel_id: string, message_id: string, payload: any): (types.Result?, error?)
    return M.request_json_once(conn, "PATCH", "/channels/" .. encode_segment(channel_id) .. "/messages/" .. encode_segment(message_id), payload, nil)
end

function M.delete_channel_message(conn: types.Conn, channel_id: string, message_id: string): (types.Result?, error?)
    return M.request_json_once(conn, "DELETE", "/channels/" .. encode_segment(channel_id) .. "/messages/" .. encode_segment(message_id), nil, nil)
end

-- Add the bot's reaction to a message. `emoji` is a unicode char or a custom
-- "name:id"; it is path-encoded for the reactions route.
function M.add_reaction(conn: types.Conn, channel_id: string, message_id: string, emoji: string): (types.Result?, error?)
    return M.request_json(conn, "PUT",
        "/channels/" .. encode_segment(channel_id)
        .. "/messages/" .. encode_segment(message_id)
        .. "/reactions/" .. encode_segment(emoji) .. "/@me", nil, nil)
end

-- Show the bot's typing indicator (~10s) while composing a reply.
function M.trigger_typing(conn: types.Conn, channel_id: string): (types.Result?, error?)
    return M.request_json(conn, "POST", "/channels/" .. encode_segment(channel_id) .. "/typing", nil, nil)
end


return M
