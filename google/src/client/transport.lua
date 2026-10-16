local capacity_http = require("capacity_http")
local endpoints = require("endpoints")
-- Google API transport: the driven adapter the service layer depends on. It
-- owns the two outbound ports — the token source (a kickside.oauth connection)
-- and HTTP (the http_client module) — behind a small functional surface. A
-- service resolves a connection with transport.connect, then issues calls with
-- transport.get/post/put/delete/get_raw; it never touches http_client or the
-- component/oauth contracts itself.

local http_client = require("http_client")
local json = require("json")
local component = require("component")
local google_types = require("types")

local transport = {}

-- Percent-encode for query values and path segments. http_client sends the URL
-- as given, so anything outside the unreserved set must be encoded (Drive query
-- values carry spaces and quotes: q=mimeType='...' and trashed=false).
local function encode_segment(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end
transport.encode_segment = encode_segment

-- Append an encoded query string to an endpoint. Keys are assumed safe.
local function build_url(endpoint: string, query: { [string]: any }?): string
    if query and next(query) then
        local params: { string } = {}
        for k, v in pairs(query) do
            params[#params + 1] = k .. "=" .. encode_segment(tostring(v))
        end
        endpoint = endpoint .. "?" .. table.concat(params, "&")
    end
    return endpoint
end
transport.build_url = build_url

-- Pull a clean message (JSON error.message, else the raw body), the HTTP status
-- and the decoded error body (the raw body when it is not JSON) from a Google
-- error response.
local function extract_error(response: any): (string, number, any)
    local status_code: number = (response and response.status_code or 0) :: number
    local error_text = "request failed"
    local data: any = nil
    if response and response.body and response.body ~= "" then
        local body: string = response.body :: string
        local parsed: any = json.decode(body)
        data = type(parsed) == "table" and parsed or body
        if type(parsed) == "table" and parsed.error and parsed.error.message then
            error_text = tostring(parsed.error.message)
        else
            error_text = body
        end
    end
    return error_text, status_code, data
end
transport.extract_error = extract_error

-- Resolve the OAuth connection (token source). With a component_id, open that
-- specific connection; without one, auto-discover the actor's Google connection.
function transport.connect(component_id: string?): (google_types.Connection?, error?)
    local conn, err
    if component_id and component_id ~= "" then
        conn, err = component.open(component_id :: string, component.ACCESS.READ, google_types.OAUTH_CONTRACT)
    else
        conn, err = component.open_by_meta({
            class = google_types.CONNECTION_CLASS,
            provider = google_types.PROVIDER,
        }, component.ACCESS.READ, google_types.OAUTH_CONTRACT)
    end
    if err then return nil, err end
    return conn :: google_types.Connection, nil
end

local function connection_id(conn: google_types.Connection): (string?, error?)
    if conn.component_id then return conn.component_id, nil end
    if not conn.get_info then return nil, nil end
    local info, info_err = (conn :: any):get_info({})
    if info_err then return nil, info_err end
    if type(info) ~= "table" or type(info.component_id) ~= "string" or info.component_id == "" then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "Google connection metadata requires a component identity",
            details = {code = "google_connection_identity_required"}})
    end
    return info.component_id, nil
end

-- Build the Bearer header from the connection, surfacing token errors.
local function authorization(conn: google_types.Connection, request: google_types.TokenRequest?): (string?, error?, string?)
    local raw, err = conn:get_access_token(request)
    if err then return nil, err end
    if type(raw) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "Google connection token retrieval returned no token data" })
    end
    local result = raw :: google_types.AccessToken
    if result.success == false then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(result.error or "token retrieval failed") })
    end
    if result.is_expired then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "Google connection token is expired; reconnect the Google account" })
    end
    local access_token = result.access_token
    if type(access_token) ~= "string" or access_token == "" then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "Google connection is missing an access token; reconnect the Google account" })
    end
    local token_type = result.token_type
    if type(token_type) ~= "string" or token_type == "" then
        token_type = google_types.DEFAULT_TOKEN_TYPE
    end
    return token_type .. " " .. access_token, nil, access_token
end

local function send(conn: google_types.Connection, method: string, endpoint: string, body: any?): (any, error?)
    local auth, err, access_token = authorization(conn)
    if err then return nil, err end
    local options: any = { headers = {
        ["Authorization"] = auth :: string,
        ["Content-Type"] = "application/json",
    } }
    if body ~= nil then
        local encoded, encode_err = json.encode(body)
        if encode_err then return nil, errors.wrap(encode_err, "Google request body is not serializable") end
        options.body = encoded
    end
    local response, request_err = http_client.request(method, endpoint, options)
    if request_err then return nil, errors.wrap(request_err, "Google " .. method .. " request failed") end
    if response and response.status_code == 401 then
        auth, err = authorization(conn, { rejected_access_token = access_token :: string })
        if err then return nil, err end
        options.headers.Authorization = auth
        response, request_err = http_client.request(method, endpoint, options)
        if request_err then return nil, errors.wrap(request_err, "Google " .. method .. " request failed") end
    end
    return response, nil
end

-- A Google answer is a Result (a failed answer carries Google's message, HTTP
-- status and error body); a request that cannot be authorized or sent is a typed
-- error. request_json decodes the body into `data`.
transport.request_json = capacity_http.wrap(function(conn: google_types.Connection, method: string, endpoint: string, body: any?, query: { [string]: any }?): (google_types.Result?, error?)
    local response, err = send(conn, method, build_url(endpoint, query), body)
    if err then return nil, err end

    if response and response.status_code >= 200 and response.status_code < 300 then
        local data: any = nil
        if response.body and response.body ~= "" then data = json.decode(response.body :: string) end
        return { success = true, data = data, status_code = response.status_code }
    end

    local message, code, error_body = extract_error(response)
    return { success = false, error = message, status_code = code, data = error_body,
        retry_after_ms = code == 429 and capacity_http.retry_after(response, 60000) or nil }
end, connection_id)

-- Raw-text request for endpoints returning non-JSON bodies (Drive export to
-- text/plain or CSV). Returns a Result whose data is { text }.
transport.request_raw = capacity_http.wrap(function(conn: google_types.Connection, method: string, endpoint: string, query: { [string]: any }?): (google_types.Result?, error?)
    local response, err = send(conn, method, build_url(endpoint, query), nil)
    if err then return nil, err end

    if response and response.status_code >= 200 and response.status_code < 300 then
        return { success = true, data = { text = response.body or "" } }
    end

    local message, code, error_body = extract_error(response)
    return { success = false, error = message, status_code = code, data = error_body,
        retry_after_ms = code == 429 and capacity_http.retry_after(response, 60000) or nil }
end, connection_id)

function transport.get(conn: google_types.Connection, endpoint: string, query: { [string]: any }?): (google_types.Result?, error?)
    return transport.request_json(conn, "GET", endpoint, nil, query)
end

function transport.post(conn: google_types.Connection, endpoint: string, body: any?, query: { [string]: any }?): (google_types.Result?, error?)
    return transport.request_json(conn, "POST", endpoint, body, query)
end

function transport.put(conn: google_types.Connection, endpoint: string, body: any?, query: { [string]: any }?): (google_types.Result?, error?)
    return transport.request_json(conn, "PUT", endpoint, body, query)
end

function transport.delete(conn: google_types.Connection, endpoint: string, query: { [string]: any }?): (google_types.Result?, error?)
    return transport.request_json(conn, "DELETE", endpoint, nil, query)
end

function transport.get_raw(conn: google_types.Connection, endpoint: string, query: { [string]: any }?): (google_types.Result?, error?)
    return transport.request_raw(conn, "GET", endpoint, query)
end

function transport.user_info(conn: google_types.Connection): (google_types.Result?, error?)
    return transport.get(conn, endpoints.get("kickside.google:endpoints", "userinfo"))
end

return transport
