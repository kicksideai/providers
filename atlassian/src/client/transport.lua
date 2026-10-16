local capacity_http = require("capacity_http")
-- Atlassian API transport: the driven adapter the service layer depends on. It
-- owns the two outbound ports — the auth source and HTTP — behind a small
-- functional surface, and is the ONLY place that knows whether a connection is
-- OAuth or stored-credential. A service resolves a connection with
-- transport.connect, then issues calls with transport.get/post/put/delete; it
-- never touches http_client, the component/oauth contracts, or auth headers.

local http_client = require("http_client")
local json = require("json")
local base64 = require("base64")
local component = require("component")
local site = require("site")
local atlassian_types = require("types")

local transport = {}

-- ─── error shaping ───────────────────────────────────────────────────────
-- Pull a clean message, the HTTP status and the decoded error body (the raw body
-- when it is not JSON) from an Atlassian error response. Jira returns
-- errorMessages[]/errors{}; Confluence and the gateway return message/error.
local function extract_error(response: any): (string, integer, any)
    local status_code: integer = (response and response.status_code or 0) :: integer
    local error_text = "request failed"
    local data: any = nil
    if response and response.body and response.body ~= "" then
        local body: string = response.body :: string
        local parsed: any = json.decode(body)
        data = type(parsed) == "table" and parsed or body
        if type(parsed) == "table" then
            local p: any = parsed
            if type(p.errorMessages) == "table" and #p.errorMessages > 0 then
                error_text = tostring(p.errorMessages[1])
            elseif p.message then
                error_text = tostring(p.message)
            elseif p.error then
                error_text = tostring(p.error)
            elseif type(p.errors) == "table" and next(p.errors) then
                local parts: { string } = {}
                for k, v in pairs(p.errors) do parts[#parts + 1] = tostring(k) .. ": " .. tostring(v) end
                error_text = table.concat(parts, "; ")
            else
                error_text = body
            end
        else
            error_text = body
        end
    end
    return error_text, status_code, data
end
transport.extract_error = extract_error

-- ─── auth ──────────────────────────────────────────────────────────────
-- Resolve the Authorization header for a connection. Credential connections
-- carry a static header; OAuth connections fetch a fresh token per request so
-- the background refresh is always picked up.
local function authorization(conn: atlassian_types.Conn): (string?, error?)
    if conn.mode == "credential" then
        return conn.header, nil
    end
    local raw, err = (conn.oauth_conn :: any):get_access_token()
    if err then return nil, err end
    if type(raw) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "Atlassian connection token retrieval returned no token data" })
    end
    local result = raw :: atlassian_types.AccessToken
    if result.success == false then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(result.error or "token retrieval failed") })
    end
    if result.is_expired then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "Atlassian connection token is expired; reconnect the account" })
    end
    local access_token = result.access_token
    if type(access_token) ~= "string" or access_token == "" then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "Atlassian connection is missing an access token; reconnect the account" })
    end
    local token_type = result.token_type
    if type(token_type) ~= "string" or token_type == "" then
        token_type = atlassian_types.DEFAULT_TOKEN_TYPE
    end
    return token_type .. " " .. access_token, nil
end

-- Execute one authenticated request, returning the raw http_client response.
local function send(conn: atlassian_types.Conn, method: string, url: string, body: any?): (any, error?)
    local auth, err = authorization(conn)
    if err then return nil, err end

    local headers = {
        ["Authorization"] = auth :: string,
        ["Content-Type"] = "application/json",
        ["Accept"] = "application/json",
    }
    local options: { headers: { [string]: string }, body: string? } = { headers = headers }
    if body ~= nil then
        local encoded, encode_err = json.encode(body)
        if encode_err then return nil, errors.wrap(encode_err, "Atlassian request body is not serializable") end
        options.body = encoded
    end
    local response, request_err = http_client.request(method, url, options)
    if request_err then return nil, errors.wrap(request_err, "Atlassian " .. method .. " request failed") end
    return response, nil
end

-- ─── public request surface ──────────────────────────────────────────────
-- An Atlassian answer is a Result (a failed answer carries the message, HTTP
-- status and error body); a request that cannot be authorized or sent is a typed
-- error.
transport.request_json = capacity_http.wrap(function(conn: atlassian_types.Conn, method: string, url: string, body: any?): (atlassian_types.Result?, error?)
    local response, err = send(conn, method, url, body)
    if err then return nil, err end

    if response and response.status_code >= 200 and response.status_code < 300 then
        local data: any = nil
        if response.body and response.body ~= "" then data = json.decode(response.body :: string) end
        return { success = true, data = data, status_code = (response.status_code :: integer) }
    end

    local message, code, error_body = extract_error(response)
    return { success = false, error = message, status_code = code, data = error_body,
        retry_after_ms = code == 429 and capacity_http.retry_after(response, 60000) or nil }
end)

function transport.get(conn: atlassian_types.Conn, url: string): (atlassian_types.Result?, error?)
    return transport.request_json(conn, "GET", url, nil)
end

function transport.post(conn: atlassian_types.Conn, url: string, body: any?): (atlassian_types.Result?, error?)
    return transport.request_json(conn, "POST", url, body)
end

function transport.put(conn: atlassian_types.Conn, url: string, body: any?): (atlassian_types.Result?, error?)
    return transport.request_json(conn, "PUT", url, body)
end

function transport.delete(conn: atlassian_types.Conn, url: string): (atlassian_types.Result?, error?)
    return transport.request_json(conn, "DELETE", url, nil)
end

-- ─── connection resolution ─────────────────────────────────────────────
-- Pure: derive (auth header, deployment) from a connection's private_context.
-- Cloud → Basic email:api_token; Server/Data Center → Bearer PAT.
local function credential_header(pc: { [string]: any }): (string?, string?, error?)
    local site_url = site.normalize_url(pc.site_url :: string?)
    if site_url == "" then return nil, nil, errors.new({ kind = errors.INVALID, message = "connection is missing site_url" }) end
    local deployment = (type(pc.deployment) == "string" and pc.deployment ~= "" and pc.deployment)
        or site.detect_deployment(site_url)

    if deployment == "server" then
        local pat = pc.personal_access_token
        if not pat or pat == "" then return nil, nil, errors.new({ kind = errors.INVALID, message = "Server connection is missing personal_access_token" }) end
        return "Bearer " .. tostring(pat), deployment, nil
    end
    local email = pc.email
    local api_token = pc.api_token
    if not email or email == "" or not api_token or api_token == "" then
        return nil, nil, errors.new({ kind = errors.INVALID, message = "Cloud connection requires email and api_token" })
    end
    return "Basic " .. (base64.encode(tostring(email) .. ":" .. tostring(api_token)) :: string), deployment, nil
end
transport.credential_header = credential_header

-- Build a credential connection handle from a connection's private_context.
local function credential_conn(pc: { [string]: any }): (atlassian_types.Conn?, error?)
    local header, deployment, err = credential_header(pc)
    if err then return nil, err end
    local site_url = site.normalize_url(pc.site_url :: string?)
    return {
        mode = "credential",
        deployment = deployment :: string,
        header = header,
        jira_base = site.jira_base(deployment :: string, site_url, nil),
        confluence_base = site.confluence_base(deployment :: string, site_url, nil),
    }, nil
end

-- Resolve the Atlassian cloudId for an OAuth connection from the accessible
-- resources, then build the gateway-rooted handle.
local function oauth_conn(oconn: any, component_id: string): (atlassian_types.Conn?, error?)
    local probe: atlassian_types.Conn = { component_id = component_id, mode = "oauth", deployment = "cloud", jira_base = "", confluence_base = "", oauth_conn = oconn }
    local res, res_err = transport.get(probe, atlassian_types.accessible_resources())
    if not res then return nil, res_err end
    if not res.success then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "accessible-resources: " .. tostring(res.error),
            details = { status_code = res.status_code, data = res.data } })
    end
    local list: any = res.data
    if type(list) ~= "table" or #list == 0 then
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "no accessible Atlassian sites for this connection" })
    end
    local cloud_id = tostring((list[1] :: any).id)
    return {
        component_id = component_id,
        mode = "oauth",
        deployment = "cloud",
        oauth_conn = oconn,
        cloud_id = cloud_id,
        jira_base = site.jira_base("cloud", nil, cloud_id),
        confluence_base = site.confluence_base("cloud", nil, cloud_id),
    }, nil
end

-- Resolve a connection by component_id. The caller (a tool, from its bound trait
-- context, or a connection binding, from ctx) always supplies WHICH connection —
-- there is no auto-discovery, so multiple Atlassian connections never resolve
-- ambiguously. Reads the connection's private_context: credential connections
-- carry site_url/deployment; OAuth connections are opened through the oauth
-- contract (token fetched per request) and access is enforced by component.open.
function transport.connect(component_id: string?): (atlassian_types.Conn?, error?)
    if not component_id or component_id == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "no Atlassian connection selected — configure the trait's connection" })
    end
    local allowed, access_err = component.get_context(component_id :: string, component.ACCESS.READ)
    if access_err then return nil, access_err end
    if not allowed then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "connection access denied" }) end
    local pc, perr = component.get_private_context(component_id :: string)
    if perr then return nil, perr end
    pc = pc or {}
    if pc.site_url or pc.deployment then
        local conn, err = credential_conn(pc)
        if not conn then return nil, err end
        (conn :: atlassian_types.Conn).component_id = component_id
        return (conn :: atlassian_types.Conn), err
    end
    local oconn, oerr = component.open(component_id :: string, component.ACCESS.READ, atlassian_types.OAUTH_CONTRACT)
    if oerr then return nil, errors.wrap(oerr, "open oauth connection") end
    if not oconn then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "open oauth connection returned no connection" }) end
    return oauth_conn(oconn, component_id)
end


return transport
