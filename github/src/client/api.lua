local capacity_http = require("capacity_http")
local http_client = require("http_client")
local json = require("json")
local time = require("time")
local types = require("types")

local M = {}
M._http = http_client

local function encode_segment(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end
M.encode_segment = encode_segment

local function encode_query(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end

local function headers(auth: string): { [string]: string }
    if auth:find("%s") == nil then auth = "Bearer " .. auth end
    return {
        ["Authorization"] = auth,
        ["Accept"] = "application/vnd.github+json",
        ["Content-Type"] = "application/json",
        ["User-Agent"] = "kickside-github-provider",
        ["X-GitHub-Api-Version"] = "2022-11-28",
    }
end
M.headers = headers

local function build_url(path: string, query: { [string]: any }?): string
    local url = types.api_base() .. path
    if query and next(query :: { [string]: any }) then
        local params: { string } = {}
        for key, value in pairs(query :: { [string]: any }) do
            if value ~= nil then params[#params + 1] = tostring(key) .. "=" .. encode_query(tostring(value)) end
        end
        if #params > 0 then url = url .. "?" .. table.concat(params, "&") end
    end
    return url
end
M.build_url = build_url

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
    local number = tonumber(((value :: string):gsub("^%s*(.-)%s*$", "%1")))
    if number == nil or number < 0 or number ~= math.floor(number) then return nil end
    return math.floor(number) :: integer
end

M._now = function(): integer
    return time.now():unix()
end

-- retry_after_ms reads how long GitHub asks the caller to wait: the
-- retry-after seconds when present, otherwise the time until
-- x-ratelimit-reset (UTC epoch seconds) once x-ratelimit-remaining is 0.
-- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api#exceeding-the-rate-limit
function M.retry_after_ms(headers: any): integer?
    local retry_after = header_integer(headers, "retry-after")
    if retry_after ~= nil then return (retry_after :: integer) * 1000 end
    if header_integer(headers, "x-ratelimit-remaining") ~= 0 then return nil end
    local reset = header_integer(headers, "x-ratelimit-reset")
    if reset == nil then return nil end
    local wait = (reset :: integer) - M._now()
    if wait < 0 then return 0 end
    return wait * 1000
end

local function body_message(response: any): string?
    local body = response and response.body
    if type(body) ~= "string" or body == "" then return nil end
    local parsed: any = json.decode(body :: string)
    if type(parsed) == "table" then
        local message = (parsed :: any).message or (parsed :: any).error
        if message == nil then return nil end
        return tostring(message)
    end
    return body :: string
end

-- is_rate_limited tells a rate-limit 403 from a permission 403: GitHub marks
-- primary limits with x-ratelimit-remaining 0, secondary limits with
-- retry-after or a message naming the secondary rate limit, and answers 429
-- for either.
-- https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api#rate-limit-errors
local function is_rate_limited(status_code: integer, headers: any, message: string?): boolean
    if status_code == 429 then return true end
    if status_code ~= 403 then return false end
    if header_value(headers, "retry-after") ~= nil then return true end
    if header_integer(headers, "x-ratelimit-remaining") == 0 then return true end
    return message ~= nil and (message :: string):lower():find("rate limit", 1, true) ~= nil
end

-- extract_error maps a failed response onto (message, status_code, error_kind).
local function extract_error(response: any): (string, integer, string)
    local status_code = (response and response.status_code or 0) :: integer
    local message = body_message(response)
    if is_rate_limited(status_code, response and response.headers, message) then
        return message and ("rate limited: " .. (message :: string)) or "rate limited", status_code, types.ERROR_RATE_LIMITED
    end
    if status_code == 401 then return "unauthorized (check the GitHub token)", status_code, types.ERROR_UNAUTHORIZED end
    if status_code == 403 then
        local hint = "(the token may be missing a repository scope)"
        return message and ("forbidden: " .. (message :: string) .. " " .. hint) or ("forbidden " .. hint), status_code, types.ERROR_FORBIDDEN
    end
    if status_code == 404 then return "not found", status_code, types.ERROR_NOT_FOUND end
    local kind = status_code >= 500 and types.ERROR_SERVER or types.ERROR_REQUEST_FAILED
    local body = response and response.body
    if message == nil and type(body) == "string" and body ~= "" then message = body :: string end
    return message or "request failed", status_code, kind
end
M.extract_error = extract_error

local function authorization(conn: types.Conn): (string?, error?)
    if conn.mode == "credential" then
        local auth = conn.header
        if type(auth) == "string" and auth ~= "" then return auth, nil end
        local token = conn.token
        if type(token) ~= "string" or token == "" then
            return nil, errors.new({ kind = errors.INVALID, message = "GitHub connection is missing token" })
        end
        return "Bearer " .. token, nil
    end

    local oauth_conn = conn.oauth_conn
    if not oauth_conn then return nil, errors.new({ kind = errors.INTERNAL, message = "GitHub OAuth connection is not open" }) end
    local raw, err = oauth_conn:get_access_token()
    if err then return nil, err end
    if type(raw) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "GitHub connection token retrieval returned no token data" })
    end
    local result = raw :: types.AccessToken
    if result.success == false then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(result.error or "token retrieval failed") })
    end
    if result.is_expired then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "GitHub connection token is expired; reconnect the GitHub account" })
    end
    local access_token = result.access_token
    if type(access_token) ~= "string" or access_token == "" then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "GitHub connection is missing an access token; reconnect the GitHub account" })
    end
    local token_type = result.token_type
    if type(token_type) ~= "string" or token_type == "" then token_type = types.DEFAULT_TOKEN_TYPE end
    return token_type .. " " .. access_token, nil
end
M.authorization = authorization

-- A GitHub answer is a Result (a failed answer carries GitHub's message, HTTP
-- status, error kind, error body and headers); a request that cannot be
-- authorized, encoded or sent is a typed error. request_json runs it under the
-- connection's provider capacity.
function M.request(conn: types.Conn, method: string, path: string, body: any?, query: { [string]: any }?): (types.Result?, error?)
    local auth, auth_err = authorization(conn)
    if not auth then return nil, auth_err end
    local opts: { headers: { [string]: string }, body: string? } = { headers = headers(auth) }
    if body ~= nil then
        local encoded, encode_err = json.encode(body)
        if encode_err then return nil, errors.wrap(encode_err, "GitHub request body is not serializable") end
        opts.body = encoded :: string
    end

    local response, err = M._http.request(method, build_url(path, query), opts)
    if err then return nil, errors.wrap(err, "GitHub " .. method .. " " .. path .. " request failed") end
    if response and response.status_code >= 200 and response.status_code < 300 then
        local data: any = nil
        if response.body and response.body ~= "" then
            local parsed, decode_err = json.decode(response.body :: string)
            data = (decode_err or parsed == nil) and response.body or parsed
        end
        return ({ success = true, data = data, status_code = response.status_code :: integer, headers = response.headers } :: types.Result)
    end
    local message, code, kind = extract_error(response)
    local response_headers = response and response.headers
    local error_body: any = nil
    if response and type(response.body) == "string" and response.body ~= "" then
        local parsed = json.decode(response.body :: string)
        error_body = type(parsed) == "table" and parsed or response.body
    end
    return ({
        success = false,
        error = message,
        status_code = code,
        error_kind = kind,
        data = error_body,
        headers = response_headers,
        retry_after_ms = M.retry_after_ms(response_headers) or (kind == types.ERROR_RATE_LIMITED and types.RATE_LIMIT_BACKOFF_MS or nil),
    } :: types.Result)
end
M.request_json = capacity_http.wrap(M.request)

function M.get(conn: types.Conn, path: string, query: { [string]: any }?): (types.Result?, error?)
    return M.request_json(conn, "GET", path, nil, query)
end
function M.post(conn: types.Conn, path: string, body: any?): (types.Result?, error?)
    return M.request_json(conn, "POST", path, body, nil)
end
function M.patch(conn: types.Conn, path: string, body: any?): (types.Result?, error?)
    return M.request_json(conn, "PATCH", path, body, nil)
end

local function repo_path(owner: string, repo: string, suffix: string): string
    return "/repos/" .. encode_segment(owner) .. "/" .. encode_segment(repo) .. suffix
end

local function encode_path(path: string): string
    local parts: { string } = {}
    for part in path:gmatch("[^/]+") do
        parts[#parts + 1] = encode_segment(part)
    end
    return table.concat(parts, "/")
end
M.encode_path = encode_path

-- has_next_page reports whether a GitHub Link response header names a next page.
function M.has_next_page(headers: any): boolean
    local link = header_value(headers, "Link")
    if link == nil then return false end
    for part in (link :: string):gmatch("[^,]+") do
        if part:find('rel="next"', 1, true) then return true end
    end
    return false
end

-- list_repositories lists the repositories the connection's user can access:
-- owned, collaborator, and organization-member repositories.
function M.list_repositories(conn: types.Conn, query: { [string]: any }): (types.Result?, error?)
    local params: { [string]: any } = {
        affiliation = "owner,collaborator,organization_member",
        sort = "full_name",
    }
    for key, value in pairs(query) do params[key] = value end
    return M.get(conn, "/user/repos", params)
end

function M.viewer(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/user", nil)
end

function M.test_connection(conn: types.Conn): (types.Result?, error?)
    return M.viewer(conn)
end

function M.get_repo(conn: types.Conn, owner: string, repo: string): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, ""), nil)
end

function M.list_issues(conn: types.Conn, owner: string, repo: string, query: { [string]: any }?): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, "/issues"), query)
end

function M.get_issue(conn: types.Conn, owner: string, repo: string, number: string): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, "/issues/" .. encode_segment(number)), nil)
end

function M.get_issue_comment(conn: types.Conn, owner: string, repo: string, comment_id: string): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, "/issues/comments/" .. encode_segment(comment_id)), nil)
end

function M.list_issue_comments(conn: types.Conn, owner: string, repo: string, number: string, query: { [string]: any }?): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, "/issues/" .. encode_segment(number) .. "/comments"), query)
end

function M.create_issue(conn: types.Conn, owner: string, repo: string, body: any): (types.Result?, error?)
    return M.post(conn, repo_path(owner, repo, "/issues"), body)
end

function M.update_issue(conn: types.Conn, owner: string, repo: string, number: string, body: any): (types.Result?, error?)
    return M.patch(conn, repo_path(owner, repo, "/issues/" .. encode_segment(number)), body)
end

function M.create_issue_comment(conn: types.Conn, owner: string, repo: string, number: string, body: string): (types.Result?, error?)
    return M.post(conn, repo_path(owner, repo, "/issues/" .. encode_segment(number) .. "/comments"), { body = body })
end

function M.get_pull(conn: types.Conn, owner: string, repo: string, number: string): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, "/pulls/" .. encode_segment(number)), nil)
end

function M.list_pull_files(conn: types.Conn, owner: string, repo: string, number: string, query: { [string]: any }?): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, "/pulls/" .. encode_segment(number) .. "/files"), query)
end

function M.get_file(conn: types.Conn, owner: string, repo: string, path: string, ref: string?): (types.Result?, error?)
    return M.get(conn, repo_path(owner, repo, "/contents/" .. encode_path(path)), { ref = ref })
end


return M
