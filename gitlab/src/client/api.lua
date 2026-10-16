local http_client = require("http_client")
local json = require("json")
local time = require("time")
local types = require("types")

local M = {}
M._http = http_client

local USER_AGENT = "kickside-gitlab-provider"

local function trim(value: string): string
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function encode_query(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end

-- normalize_base_url turns the user-entered instance URL into the canonical
-- web root: lowercase scheme and host, no trailing slash, no trailing /api/v4.
-- A sub-path is kept because self-managed instances can live under one.
function M.normalize_base_url(raw: any): (string?, error?)
    if raw == nil then return types.DEFAULT_BASE_URL, nil end
    if type(raw) ~= "string" then return nil, errors.new({ kind = errors.INVALID, message = "GitLab base_url must be a string" }) end
    local value = trim(raw :: string)
    if value == "" then return types.DEFAULT_BASE_URL, nil end

    local scheme, rest = value:match("^(%a[%w+.-]*)://(.*)$")
    if not scheme or not rest then
        return nil, errors.new({ kind = errors.INVALID, message = "GitLab base_url must be an absolute http or https URL, got " .. value })
    end
    scheme = (scheme :: string):lower()
    if scheme ~= "http" and scheme ~= "https" then
        return nil, errors.new({ kind = errors.INVALID, message = "GitLab base_url must use http or https, got " .. scheme })
    end
    if (rest :: string):find("[%s%?#@\\]") then
        return nil, errors.new({ kind = errors.INVALID, message = "GitLab base_url must not contain credentials, a query, a fragment, or whitespace" })
    end

    local authority, path = (rest :: string):match("^([^/]*)(.*)$")
    local host, port = (authority or ""):match("^([%w%.%-]+)(:?%d*)$")
    if not host or host:find("^[%.%-]") or host:find("[%.%-]$") or host:find("%.%.") then
        return nil, errors.new({ kind = errors.INVALID, message = "GitLab base_url has an invalid host: " .. tostring(authority) })
    end
    if port ~= "" then
        local number = tonumber((port :: string):sub(2))
        if not number or number < 1 or number > 65535 then
            return nil, errors.new({ kind = errors.INVALID, message = "GitLab base_url has an invalid port: " .. tostring(authority) })
        end
    end

    local base_path = ((path or ""):gsub("/+$", ""))
    if base_path:lower():sub(-#types.API_PATH) == types.API_PATH then
        base_path = (base_path:sub(1, #base_path - #types.API_PATH):gsub("/+$", ""))
    end
    if base_path:find("//", 1, true) then
        return nil, errors.new({ kind = errors.INVALID, message = "GitLab base_url has an invalid path: " .. base_path })
    end
    return scheme .. "://" .. (host :: string):lower() .. (port :: string) .. base_path, nil
end

function M.api_base(conn: types.Conn): string
    return conn.base_url .. types.API_PATH
end

function M.headers(conn: types.Conn): ({ [string]: string }?, error?)
    if conn.mode ~= types.MODE_CREDENTIAL then
        return nil, errors.new({ kind = errors.INVALID, message = "unsupported GitLab connection mode: " .. tostring(conn.mode) })
    end
    local token = conn.token
    if type(token) ~= "string" or token == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "GitLab connection is missing token" })
    end
    return {
        ["PRIVATE-TOKEN"] = token :: string,
        ["Accept"] = "application/json",
        ["User-Agent"] = USER_AGENT,
    }, nil
end

function M.build_url(conn: types.Conn, path: string, query: { [string]: any }?): string
    local url = M.api_base(conn) .. path
    if not query then return url end
    local keys: { string } = {}
    for key, value in pairs(query :: { [string]: any }) do
        if value ~= nil then keys[#keys + 1] = tostring(key) end
    end
    if #keys == 0 then return url end
    table.sort(keys)
    local params: { string } = {}
    for _, key in ipairs(keys) do
        params[#params + 1] = key .. "=" .. encode_query(tostring((query :: { [string]: any })[key]))
    end
    return url .. "?" .. table.concat(params, "&")
end

local function error_message(body: string): string?
    local parsed: any = json.decode(body)
    if type(parsed) ~= "table" then return nil end
    local message = parsed.message or parsed.error_description or parsed.error
    if type(message) == "string" and message ~= "" then return message end
    if type(message) == "table" then
        local encoded = json.encode(message)
        if type(encoded) == "string" then return encoded end
    end
    return nil
end

-- header_value reads one response header case-insensitively; a repeated
-- header is joined with ", ".
local function header_value(headers: any, name: string): string?
    if type(headers) ~= "table" then return nil end
    local wanted = name:lower()
    for key, value in pairs(headers) do
        if type(key) == "string" and key:lower() == wanted then
            if type(value) == "table" then return table.concat(value :: { string }, ", ") end
            if type(value) == "string" then return value :: string end
            return nil
        end
    end
    return nil
end

M.header_value = header_value

local function header_integer(headers: any, name: string): integer?
    local value = header_value(headers, name)
    if value == nil then return nil end
    local number = tonumber(trim(value :: string))
    if number == nil or number < 0 or number ~= math.floor(number) then return nil end
    return math.floor(number) :: integer
end

M._now = function(): integer
    return time.now():unix()
end

-- retry_after_ms reads how long GitLab asks the caller to wait: the
-- Retry-After seconds on a throttled request, otherwise the time until
-- RateLimit-Reset (Unix seconds) once RateLimit-Remaining is 0.
-- https://docs.gitlab.com/administration/settings/user_and_ip_rate_limits/#response-headers
function M.retry_after_ms(headers: any): integer?
    local retry_after = header_integer(headers, "Retry-After")
    if retry_after ~= nil then return (retry_after :: integer) * 1000 end
    if header_integer(headers, "RateLimit-Remaining") ~= 0 then return nil end
    local reset = header_integer(headers, "RateLimit-Reset")
    if reset == nil then return nil end
    local wait = (reset :: integer) - M._now()
    if wait < 0 then return 0 end
    return wait * 1000
end

-- extract_error maps a failed response onto (message, status_code, error_kind).
-- GitLab answers a throttled request with 429.
function M.extract_error(response: any): (string, integer, string)
    local status_code = (response and tonumber(response.status_code) or 0) :: integer
    if status_code == 401 then return "unauthorized (check the GitLab access token)", status_code, types.ERROR_UNAUTHORIZED end
    if status_code == 403 then
        return "forbidden (the token may lack the read_api scope or access to this resource)", status_code, types.ERROR_FORBIDDEN
    end
    if status_code == 404 then return "not found", status_code, types.ERROR_NOT_FOUND end
    if status_code == 429 then return "rate limited", status_code, types.ERROR_RATE_LIMITED end

    local kind = status_code >= 500 and types.ERROR_SERVER or types.ERROR_REQUEST_FAILED
    local body = response and response.body
    if type(body) == "string" and body ~= "" then
        local message = error_message(body :: string)
        if message then return message, status_code, kind end
        return "GitLab request failed (HTTP " .. tostring(status_code) .. "): " .. (body :: string), status_code, kind
    end
    return "GitLab request failed (HTTP " .. tostring(status_code) .. ")", status_code, kind
end

-- A GitLab answer is a Result (a failed answer carries GitLab's message, HTTP
-- status, error kind, error body and headers); a request that cannot be
-- authorized or sent is a typed error.
function M.request_json(conn: types.Conn, method: string, path: string, query: { [string]: any }?): (types.Result?, error?)
    local request_headers, header_err = M.headers(conn)
    if not request_headers then return nil, header_err end

    local response, err = M._http.request(method, M.build_url(conn, path, query), { headers = request_headers })
    if err then return nil, errors.wrap(err, "GitLab " .. method .. " " .. path .. " request failed") end
    if not response then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "GitLab request returned no response" })
    end
    local status_code = tonumber(response.status_code) or 0
    if status_code >= 200 and status_code < 300 then
        local data: any = nil
        if response.body and response.body ~= "" then
            local parsed, decode_err = json.decode(response.body :: string)
            if decode_err then
                return ({
                    success = false,
                    error = "GitLab returned invalid JSON: " .. tostring(decode_err),
                    status_code = status_code,
                    error_kind = types.ERROR_INVALID_RESPONSE,
                    headers = response.headers,
                } :: types.Result)
            end
            data = parsed
        end
        return ({ success = true, data = data, status_code = status_code, headers = response.headers } :: types.Result)
    end
    local message, code, kind = M.extract_error(response)
    local error_body: any = nil
    if type(response.body) == "string" and response.body ~= "" then
        local parsed = json.decode(response.body :: string)
        error_body = type(parsed) == "table" and parsed or response.body
    end
    return ({
        success = false,
        error = message,
        status_code = code,
        error_kind = kind,
        data = error_body,
        headers = response.headers,
        retry_after_ms = M.retry_after_ms(response.headers) or (kind == types.ERROR_RATE_LIMITED and types.RATE_LIMIT_BACKOFF_MS or nil),
    } :: types.Result)
end

function M.get(conn: types.Conn, path: string, query: { [string]: any }?): (types.Result?, error?)
    return M.request_json(conn, "GET", path, query)
end

local function link_next_page(link: string): string?
    for part in link:gmatch("[^,]+") do
        if part:find('rel="next"', 1, true) then
            local url = part:match("<([^>]*)>")
            local page = url and url:match("[?&]page=(%d+)")
            if page then return page end
        end
    end
    return nil
end

-- next_page reads the offset-pagination next page from the X-Next-Page
-- header, falling back to the Link header's rel="next" URL. An empty
-- X-Next-Page marks the last page.
function M.next_page(headers: any): string?
    local next_header = header_value(headers, "X-Next-Page")
    if next_header ~= nil then
        local page = trim(next_header :: string)
        if page == "" then return nil end
        return page
    end
    local link = header_value(headers, "Link")
    if link then return link_next_page(link :: string) end
    return nil
end

function M.current_user(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/user", nil)
end

-- list_projects lists the projects the token's user is a member of, ordered
-- by path, in the simple representation.
function M.list_projects(conn: types.Conn, query: { [string]: any }): (types.Result?, error?)
    local params: { [string]: any } = {
        membership = true,
        simple = true,
        order_by = "path",
        sort = "asc",
    }
    for key, value in pairs(query) do params[key] = value end
    return M.get(conn, "/projects", params)
end

return M
