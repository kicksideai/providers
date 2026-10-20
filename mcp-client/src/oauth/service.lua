-- Remote MCP is an OAuth resource, not a fixed identity provider. Discover its
-- authorization server and bind every grant to the exact resource and issuer.
local http = require("http_client")
local json = require("json")
local crypto = require("crypto")
local hash = require("hash")
local base64 = require("base64")
local form = require("form")
local M = { _http = http }

local function text(v: any): string return type(v) == "string" and v or "" end
local function fail(message: string): any return {success = false, error = message} end
local function contains(list: any, wanted: string): boolean
    for _, v in ipairs(type(list) == "table" and list or {}) do if v == wanted then return true end end
    return false
end
local function valid_scopes(scopes: any): boolean
    if type(scopes) ~= "table" then return false end
    for key, scope in pairs(scopes) do
        if type(key) ~= "number" or key < 1 or key > #scopes or key ~= math.floor(key)
            or type(scope) ~= "string" or scope == "" or scope:find('[%s%c"\\]') then return false end
    end
    return true
end

-- Plain HTTP is reserved for loopback development. Reject userinfo and URL
-- fragments so credentials cannot be redirected to an unintended authority.
function M.url(value: any): (string?, string?, string?)
    if type(value) ~= "string" or value:find("[%s@#?\\]") then return nil, nil, nil end
    local scheme, authority, path = value:match("^(https?)://([^/]+)(.*)$")
    if not scheme then return nil, nil, nil end
    local host = (authority or ""):match("^([%w%.%-]+):?%d*$")
    if not host then return nil, nil, nil end
    host = host:lower()
    if scheme == "http" and host ~= "localhost" and host ~= "127.0.0.1" then return nil, nil, nil end
    local origin = scheme .. "://" .. authority:lower()
    return origin .. path, origin, path
end

local function request(method: string, url: string, options: any): (any?, any?, string?)
    if not M.url(url) then return nil, nil, "OAuth endpoints must use HTTPS (loopback HTTP is allowed for development)" end
    options.timeout, options.max_response_body = "15s", 1048576
    local response, err = M._http.request(method, url, options)
    if err or not response then return nil, response, "OAuth server request failed" end
    if response.status_code < 200 or response.status_code >= 300 then
        return nil, response, "OAuth server returned HTTP " .. tostring(response.status_code)
    end
    local data, decode_err = json.decode(response.body or "")
    if decode_err or type(data) ~= "table" then return nil, response, "OAuth server returned invalid JSON" end
    return data, response, nil
end

local function header(headers: any, key: string): string
    for k, v in pairs(type(headers) == "table" and headers or {}) do
        if tostring(k):lower() == key then return type(v) == "table" and table.concat(v, ", ") or text(v) end
    end
    return ""
end

function M.discover(endpoint: any): (any?, string?)
    local resource, origin, path = M.url(endpoint)
    if not resource then return nil, "Enter a valid HTTPS MCP endpoint" end
    local probe = M._http.request("POST", resource, {timeout = "15s", max_response_body = 1048576, headers = { ["Content-Type"] = "application/json", Accept = "application/json, text/event-stream" },
        body = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"KickSide","version":"1"}}}'})
    local challenge = probe and header(probe.headers, "www-authenticate") or ""
    local metadata_url = challenge:match('resource_metadata="([^"]+)"')
    local metadata, last_err
    local candidates = metadata_url and {metadata_url} or {origin .. "/.well-known/oauth-protected-resource" .. path, origin .. "/.well-known/oauth-protected-resource"}
    for _, url in ipairs(candidates) do
        metadata, _, last_err = request("GET", url, {headers = {Accept = "application/json"}})
        if metadata then break end
    end
    if not metadata then return nil, last_err or "MCP resource metadata was not found" end
    if metadata.resource ~= resource then return nil, "MCP resource metadata does not match the requested endpoint" end
    local issuer = type(metadata.authorization_servers) == "table" and metadata.authorization_servers[1]
    local normalized, auth_origin, auth_path = M.url(issuer)
    if not normalized then return nil, "MCP resource has no valid authorization server" end
    local auth, auth_err
    for _, url in ipairs({auth_origin .. "/.well-known/oauth-authorization-server" .. auth_path,
        auth_origin .. "/.well-known/openid-configuration" .. auth_path, normalized .. "/.well-known/openid-configuration"}) do
        auth, _, auth_err = request("GET", url, {headers = {Accept = "application/json"}})
        if auth then break end
    end
    if not auth then return nil, auth_err end
    if auth.issuer ~= issuer then return nil, "OAuth metadata issuer mismatch" end
    if not M.url(auth.authorization_endpoint) or not M.url(auth.token_endpoint) then return nil, "OAuth metadata has invalid authorization or token endpoints" end
    if not contains(auth.code_challenge_methods_supported, "S256") then return nil, "OAuth server must advertise PKCE S256 support" end
    return {resource = resource, metadata = auth, scopes = challenge:match('scope="([^"]*)"'), resource_scopes = metadata.scopes_supported}, nil
end

local function client_metadata(client_id: string, redirect_uri: string): any
    local result: any = {client_name = "KickSide", redirect_uris = {redirect_uri},
        grant_types = {"authorization_code", "refresh_token"}, response_types = {"code"}, token_endpoint_auth_method = "none"}
    if client_id ~= "" then result.client_id = client_id end
    return result
end
M.client_metadata = client_metadata

function M.init_oauth(args: any): any
    args = type(args) == "table" and args or {}
    if args.provider_options ~= nil and type(args.provider_options) ~= "table" then return fail("OAuth provider options must be an object") end
    local opts = type(args.provider_options) == "table" and args.provider_options or {}
    local allowed = {endpoint_url = true, client_id = true, client_secret = true, token_endpoint_auth_method = true, protocol_version = true}
    for key, value in pairs(opts) do
        if not allowed[key] then return fail("Unknown Remote MCP OAuth option: " .. tostring(key)) end
        if type(value) ~= "string" then return fail("OAuth option " .. tostring(key) .. " must be a string") end
    end
    if args.scopes ~= nil and not valid_scopes(args.scopes) then return fail("OAuth scopes must be an array of valid scope strings") end
    local redirect, app_origin = M.url(args.redirect_uri)
    if not redirect then return fail("OAuth callback must use HTTPS or loopback HTTP") end
    local discovery, err = M.discover(opts.endpoint_url)
    if not discovery then return fail(err or "OAuth discovery failed") end
    local auth = discovery.metadata
    local credentials: any = {client_id = text(opts.client_id), client_secret = text(opts.client_secret)}
    local method = text(opts.token_endpoint_auth_method)
    if method == "" then method = credentials.client_secret ~= "" and "client_secret_post" or "none" end
    if method ~= "none" and method ~= "client_secret_post" and method ~= "client_secret_basic" then return fail("Unsupported token endpoint authentication method") end
    if method ~= "none" and credentials.client_secret == "" then return fail("A client secret is required for this authentication method") end
    if credentials.client_id == "" then
        if auth.client_id_metadata_document_supported == true and app_origin:sub(1, 8) == "https://" then
            credentials.client_id = app_origin .. "/api/public/mcp-client/client-metadata.json"
            method = "none"
        elseif auth.registration_endpoint then
            local registered, _, registration_err = request("POST", auth.registration_endpoint, {
                headers = {["Content-Type"] = "application/json", Accept = "application/json"},
                body = json.encode(client_metadata("", redirect))})
            if not registered or text(registered.client_id) == "" then return fail(registration_err or "OAuth registration returned no client id") end
            credentials.client_id, credentials.client_secret = registered.client_id, registered.client_secret or ""
            method = registered.token_endpoint_auth_method or (credentials.client_secret ~= "" and "client_secret_basic" or "none")
        else return fail("This server requires a registered OAuth client. Enter its client id in Advanced settings.") end
    end
    if method ~= "none" and method ~= "client_secret_post" and method ~= "client_secret_basic" then return fail("OAuth registration selected an unsupported authentication method") end
    if method ~= "none" and text(credentials.client_secret) == "" then return fail("OAuth registration returned no client secret") end
    if auth.token_endpoint_auth_methods_supported ~= nil and not contains(auth.token_endpoint_auth_methods_supported, method) then
        return fail("OAuth server does not support the selected client authentication method")
    end
    credentials.token_endpoint_auth_method = method
    local state, state_err = crypto.random.string(32)
    local verifier, verifier_err = crypto.random.string(64, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~")
    if state_err or verifier_err then return fail("Unable to generate OAuth state and PKCE verifier") end
    local digest, digest_err = hash.sha256(verifier, true)
    if digest_err then return fail("Unable to generate PKCE challenge") end
    local challenge = base64.encode(digest):gsub("+", "-"):gsub("/", "_"):gsub("=", "")
    local scopes = args.scopes or {}
    if #scopes == 0 then
        scopes = {}
        if discovery.scopes then for scope in discovery.scopes:gmatch("%S+") do scopes[#scopes + 1] = scope end
        else scopes = discovery.resource_scopes or {} end
    end
    if not valid_scopes(scopes) then return fail("Invalid OAuth scope") end
    local params = {client_id = credentials.client_id, redirect_uri = redirect, response_type = "code", state = state,
        code_challenge = challenge, code_challenge_method = "S256", resource = discovery.resource}
    if #scopes > 0 then params.scope = table.concat(scopes, " ") end
    return {success = true, authorization_url = auth.authorization_endpoint .. "?" .. form.encode(params), state_token = state, expires_in = 300,
        storage_payload = {state = state, code_verifier = verifier, redirect_uri = redirect, scopes = scopes,
            client_credentials = credentials, provider_specific = {endpoint_url = discovery.resource,
                issuer = auth.issuer, token_endpoint = auth.token_endpoint, issuer_parameter_required = auth.authorization_response_iss_parameter_supported == true,
                protocol_version = text(opts.protocol_version) ~= "" and opts.protocol_version or "2025-11-25"}}}
end

local function exchange(config: any, credentials: any, body: any): any
    body.client_id, body.resource = credentials.client_id, config.endpoint_url
    local headers = {["Content-Type"] = "application/x-www-form-urlencoded", Accept = "application/json"}
    local method = credentials.token_endpoint_auth_method or "none"
    if method == "client_secret_basic" then
        headers.Authorization = "Basic " .. base64.encode(form.url_encode(credentials.client_id) .. ":" .. form.url_encode(credentials.client_secret))
    elseif method == "client_secret_post" then body.client_secret = credentials.client_secret end
    local data, response, err = request("POST", config.token_endpoint, {headers = headers, body = form.encode(body)})
    if not data then
        local failure = response and json.decode(response.body or "")
        return {success = false, error = err or "OAuth token exchange failed", response_received = response ~= nil,
            requires_reauth = type(failure) == "table" and (failure.error == "invalid_grant" or failure.error == "invalid_client")}
    end
    if text(data.access_token) == "" or data.access_token:find("[%s%c]")
        or text(data.token_type):lower() ~= "bearer" then return fail("OAuth server returned no usable bearer token") end
    if data.refresh_token ~= nil and (text(data.refresh_token) == "" or data.refresh_token:find("[%c]")) then return fail("OAuth server returned an invalid refresh token") end
    if data.scope ~= nil and type(data.scope) ~= "string" then return fail("OAuth server returned an invalid scope") end
    if data.expires_in ~= nil and (type(data.expires_in) ~= "number" or data.expires_in <= 0) then return fail("OAuth server returned invalid token expiry") end
    return {success = true, access_token = data.access_token, refresh_token = data.refresh_token,
        token_type = "Bearer", expires_in = data.expires_in, scope = data.scope}
end

function M.handle_callback(args: any): any
    local stored = type(args) == "table" and args.stored_data
    if type(stored) ~= "table" or text(args.state) == "" or args.state ~= stored.state then return fail("OAuth state mismatch") end
    if text(args.code) == "" then return fail("Authorization code is required") end
    local config = stored.provider_specific
    if type(config) ~= "table" or type(stored.client_credentials) ~= "table" or type(stored.scopes) ~= "table"
        or text(stored.code_verifier) == "" or not M.url(stored.redirect_uri) then return fail("OAuth callback configuration is missing") end
    if args.iss ~= nil and args.iss ~= config.issuer then return fail("OAuth callback issuer mismatch") end
    if config.issuer_parameter_required and args.iss ~= config.issuer then return fail("OAuth callback issuer is required") end
    local token = exchange(config, stored.client_credentials, {grant_type = "authorization_code", code = args.code,
        redirect_uri = stored.redirect_uri, code_verifier = stored.code_verifier})
    if not token.success then return token end
    return {success = true, user_context = {}, oauth_connection = {
        access_token = token.access_token, refresh_token = token.refresh_token, token_type = "Bearer",
        expires_at = token.expires_in and os.time() + token.expires_in or nil,
        scopes_granted = token.scope or table.concat(stored.scopes, " "), scope = token.scope,
        client_credentials = stored.client_credentials, provider_specific = config, connection_state = "connected"}}
end

function M.refresh_token(args: any): any
    if type(args) ~= "table" or text(args.refresh_token) == "" or type(args.provider_specific) ~= "table"
        or type(args.client_credentials) ~= "table" then return fail("Remote MCP refresh configuration is missing") end
    return exchange(args.provider_specific, args.client_credentials, {grant_type = "refresh_token", refresh_token = args.refresh_token})
end

return M
