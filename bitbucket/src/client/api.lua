local http_client = require("http_client")
local json = require("json")
local types = require("types")

local M = {}
M._http = http_client

local function percent_encode(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end
M.percent_encode = percent_encode

-- workspace_slug validates a workspace slug (the `{workspace}` path segment);
-- Bitbucket slugs contain only letters, digits, dashes, and underscores.
local function workspace_slug(value: any): (string?, error?)
    if type(value) ~= "string" then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket workspace must be a workspace slug" }) end
    local slug = (value :: string):gsub("^%s*(.-)%s*$", "%1")
    if slug == "" then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket workspace must be a workspace slug" }) end
    if not slug:match("^[%w_%-]+$") then
        return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket workspace '" .. slug .. "' is not a workspace slug (letters, digits, '-' and '_' only)" })
    end
    return slug, nil
end

local function headers(authorization: string): { [string]: string }
    return {
        ["Authorization"] = authorization,
        ["Accept"] = "application/json",
        ["User-Agent"] = "kickside-bitbucket-provider",
    }
end

-- build_url appends the query sorted by key; a list value repeats its key once
-- per element in list order (Bitbucket filters such as `state` repeat).
local function build_url(path: string, query: { [string]: any }?): string
    local url = types.API_BASE .. path
    if not query then return url end
    local keys: { string } = {}
    for key, value in pairs(query :: { [string]: any }) do
        if value ~= nil then keys[#keys + 1] = tostring(key) end
    end
    table.sort(keys)
    local params: { string } = {}
    for _, key in ipairs(keys) do
        local value = (query :: { [string]: any })[key]
        if type(value) == "table" then
            for _, item in ipairs(value :: { any }) do
                params[#params + 1] = key .. "=" .. percent_encode(tostring(item))
            end
        else
            params[#params + 1] = key .. "=" .. percent_encode(tostring(value))
        end
    end
    if #params == 0 then return url end
    return url .. "?" .. table.concat(params, "&")
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

-- retry_after_ms reads the Retry-After delay in seconds (RFC 9110 section
-- 10.2.3). Bitbucket documents its limits and X-RateLimit-* headers at
-- https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/
-- but no reset time, so Retry-After is the only wait it can state.
local function retry_after_ms(headers: any): integer?
    local value = header_value(headers, "Retry-After")
    if value == nil then return nil end
    local seconds = tonumber(((value :: string):gsub("^%s*(.-)%s*$", "%1")))
    if seconds == nil or seconds < 0 or seconds ~= math.floor(seconds) then return nil end
    return (math.floor(seconds) :: integer) * 1000
end

local function body_message(body: any): string?
    if type(body) ~= "string" or body == "" then return nil end
    local parsed: any = json.decode(body :: string)
    if type(parsed) == "table" and type(parsed.error) == "table" and type(parsed.error.message) == "string" then
        local message = parsed.error.message :: string
        if type(parsed.error.detail) == "string" and parsed.error.detail ~= "" then
            message = message .. ": " .. (parsed.error.detail :: string)
        end
        return message
    end
    return body :: string
end

-- extract_error maps a failed response onto (message, status_code, error_kind).
local function extract_error(response: any): (string, integer, string)
    local status_code = (type(response) == "table" and response.status_code or 0) :: integer
    if status_code == 401 then return "unauthorized (check the Bitbucket credentials)", status_code, types.ERROR_UNAUTHORIZED end
    if status_code == 403 then
        return "forbidden (the credential lacks the required scope or access to this workspace)", status_code, types.ERROR_FORBIDDEN
    end
    if status_code == 404 then return "not found (check the Bitbucket workspace)", status_code, types.ERROR_NOT_FOUND end
    if status_code == 429 then return "rate limited by Bitbucket", status_code, types.ERROR_RATE_LIMITED end
    local message = body_message(type(response) == "table" and response.body or nil)
    if status_code >= 500 then
        return "Bitbucket service error (HTTP " .. tostring(status_code) .. ")" .. (message and (": " .. message) or ""), status_code, types.ERROR_SERVER
    end
    return message or ("request failed (HTTP " .. tostring(status_code) .. ")"), status_code, types.ERROR_REQUEST_FAILED
end

-- A Bitbucket answer is a Result (a failed answer carries Bitbucket's message,
-- HTTP status, error kind, error body and headers); a request that cannot be
-- sent is a typed error.
function M.get(conn: types.Conn, path: string, query: { [string]: any }?): (types.Result?, error?)
    local response, err = M._http.request("GET", build_url(path, query), { headers = headers(conn.authorization) })
    if err then return nil, errors.wrap(err, "Bitbucket GET " .. path .. " request failed") end
    if response and response.status_code >= 200 and response.status_code < 300 then
        local data: any = nil
        if response.body and response.body ~= "" then
            local parsed, decode_err = json.decode(response.body :: string)
            if decode_err then
                return ({
                    success = false,
                    error = "invalid Bitbucket response: " .. tostring(decode_err),
                    status_code = response.status_code :: integer,
                    error_kind = types.ERROR_INVALID_RESPONSE,
                    headers = response.headers,
                } :: types.Result)
            end
            data = parsed
        end
        return ({ success = true, data = data, status_code = response.status_code :: integer, headers = response.headers } :: types.Result)
    end
    local message, code, kind = extract_error(response)
    local response_headers = type(response) == "table" and response.headers or nil
    local error_body: any = nil
    if type(response) == "table" and type(response.body) == "string" and response.body ~= "" then
        local parsed = json.decode(response.body :: string)
        error_body = type(parsed) == "table" and parsed or response.body
    end
    return ({
        success = false,
        data = error_body,
        error = message,
        status_code = code,
        error_kind = kind,
        headers = response_headers,
        retry_after_ms = retry_after_ms(response_headers) or (kind == types.ERROR_RATE_LIMITED and types.RATE_LIMIT_BACKOFF_MS or nil),
    } :: types.Result)
end

-- name_filter builds a Bitbucket query-language substring match on one field;
-- string literals are double-quoted with backslash escapes.
local function name_filter(field: string, text: string): string
    local escaped = text:gsub("[\\\"]", "\\%0")
    return field .. ' ~ "' .. escaped .. '"'
end

local function page_params(query: types.PageQuery, field: string, sort: string): { [string]: any }
    local params: { [string]: any } = { page = query.page, pagelen = query.pagelen, sort = sort }
    if query.q then params.q = name_filter(field, query.q :: string) end
    return params
end

-- next_page returns the page number named by a paginated response's `next`
-- link, or nil on the last page.
function M.next_page(data: any): (string?, string?)
    local next_url = type(data) == "table" and data.next or nil
    if next_url == nil then return nil, nil end
    if type(next_url) ~= "string" then return nil, "invalid Bitbucket pagination link" end
    local page = (next_url :: string):match("[?&]page=(%d+)")
    if not page then return nil, "Bitbucket pagination link has no page number: " .. (next_url :: string) end
    return page, nil
end

local function current_user(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/user", nil)
end

local function list_workspaces(conn: types.Conn, query: types.PageQuery): (types.Result?, error?)
    return M.get(conn, "/user/workspaces", page_params(query, "slug", "slug"))
end

local function list_repositories(conn: types.Conn, workspace: string, query: types.PageQuery): (types.Result?, error?)
    return M.get(conn, "/repositories/" .. percent_encode(workspace), page_params(query, "name", "full_name"))
end

-- test_connection proves the credential against an endpoint its token kind may
-- call: /user for an Atlassian API token (plus the configured workspace, when
-- one narrows discovery), and the workspace repository listing for an access
-- token, which is not a user and cannot read /user.
function M.test_connection(conn: types.Conn): (types.Result?, error?)
    if conn.auth_type == types.AUTH_API_TOKEN then
        local user = current_user(conn)
        if not user.success or not conn.workspace then return user end
    end
    return list_repositories(conn, conn.workspace :: string, { page = 1, pagelen = 1 })
end

M.workspace_slug = workspace_slug
M.headers = headers
M.build_url = build_url
M.extract_error = extract_error
M.header_value = header_value
M.retry_after_ms = retry_after_ms
M.name_filter = name_filter
M.current_user = current_user
M.list_workspaces = list_workspaces
M.list_repositories = list_repositories

return M
