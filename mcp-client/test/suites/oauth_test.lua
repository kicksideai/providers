local test = require("test")
local json = require("json")
local base64 = require("base64")
local oauth = require("oauth")
local function fixture(options, fn)
    local previous, calls = oauth._http, {}
    oauth._http = {request = function(method, url, request)
        calls[#calls + 1] = {method = method, url = url, request = request}
        local data, status
        if url == "https://mcp.example/mcp" then return {status_code = 401, headers = {['WWW-Authenticate'] = 'Bearer resource_metadata="https://mcp.example/resource", scope="tools:read"'}, body = "{}"} end
        if url == "https://mcp.example/resource" then data = {resource = options.mismatched and "https://different.example/mcp" or url:gsub("/resource$", "/mcp"), authorization_servers = {"https://issuer.example/tenant"}}
        elseif url:find("/.well-known/", 1, true) then
            if options.oidc and url:find("oauth-authorization-server", 1, true) then return {status_code = 404, body = "{}"} end
            data = {issuer = "https://issuer.example/tenant", authorization_endpoint = "https://issuer.example/authorize", token_endpoint = "https://issuer.example/token", registration_endpoint = "https://issuer.example/register", client_id_metadata_document_supported = options.cimd, code_challenge_methods_supported = options.no_pkce and {"plain"} or {"S256"}}
        elseif url == "https://issuer.example/register" then data = {client_id = "registered-client", token_endpoint_auth_method = "none"}
        elseif url == "https://issuer.example/token" then data, status = options.token or {access_token = "fixture-token", token_type = "Bearer", expires_in = 3600}, options.status
        else error("Unexpected OAuth URL: " .. url) end
        return {status_code = status or 200, headers = {}, body = json.encode(data)}
    end}
    local ok, err = pcall(fn, calls)
    oauth._http = previous
    if not ok then error(err) end
end
local function init(options)
    return oauth.init_oauth({redirect_uri = "https://kickside.example/api/public/oauth/callback", scopes = {}, provider_options = {endpoint_url = "https://mcp.example/mcp", client_id = options and options.client_id}})
end
local function define_tests()
    test.describe("Remote MCP OAuth interoperability", function()
        test.it("uses pre-registered client ids without registering a new client", function()
            fixture({}, function(calls)
                local value = init({client_id = "static-client"})
                test.is_true(value.success, value.error)
                test.contains(value.authorization_url, "client_id=static-client")
                test.contains(value.authorization_url, "scope=tools%3Aread")
                test.eq(#calls, 3)
            end)
        end)
        test.it("uses a public client metadata document when the server supports it", function()
            fixture({cimd = true}, function(calls)
                local value = init()
                test.is_true(value.success, value.error)
                test.eq(value.storage_payload.client_credentials.client_id, "https://kickside.example/api/public/mcp-client/client-metadata.json")
                test.eq(#calls, 3)
            end)
        end)
        test.it("falls back to path-aware OIDC discovery and dynamic client registration", function()
            fixture({oidc = true}, function(calls)
                local value = init()
                test.is_true(value.success, value.error)
                test.eq(calls[3].url, "https://issuer.example/.well-known/oauth-authorization-server/tenant")
                test.eq(calls[4].url, "https://issuer.example/.well-known/openid-configuration/tenant")
                test.eq(calls[5].url, "https://issuer.example/register")
                test.is_nil(json.decode(calls[5].request.body).client_id)
            end)
        end)
        test.it("refuses mismatched resource metadata and servers without S256 support", function()
            for _, options in ipairs({{mismatched = true}, {no_pkce = true}}) do
                fixture(options, function(calls)
                    test.is_false(init().success)
                    for _, call in ipairs(calls) do test.is_true(call.url ~= "https://issuer.example/register") end
                end)
            end
        end)
        test.it("binds refresh requests to the MCP resource and supports confidential clients", function()
            fixture({}, function(calls)
                local value = oauth.refresh_token({refresh_token = "refresh+&=", provider_specific = {endpoint_url = "https://mcp.example/mcp", token_endpoint = "https://issuer.example/token"}, client_credentials = {client_id = "client/id", client_secret = "secret+&", token_endpoint_auth_method = "client_secret_basic"}})
                test.is_true(value.success, value.error)
                local request = calls[1].request
                test.eq(base64.decode(request.headers.Authorization:sub(7)), "client%2Fid:secret%2B%26")
                test.contains(request.body, "resource=https%3A%2F%2Fmcp.example%2Fmcp")
                test.contains(request.body, "refresh_token=refresh%2B%26%3D")
            end)
        end)
        test.it("requires reauthorization for revoked grants while keeping outages retryable and errors private", function()
            for _, status in ipairs({400, 503}) do
                fixture({status = status, token = {error = status == 400 and "invalid_grant" or "temporarily_unavailable", error_description = "private upstream account detail"}}, function()
                    local value = oauth.refresh_token({refresh_token = "fixture", provider_specific = {endpoint_url = "https://mcp.example/mcp", token_endpoint = "https://issuer.example/token"}, client_credentials = {client_id = "client"}})
                    test.is_false(value.success)
                    test.eq(value.requires_reauth, status == 400)
                    test.is_nil(value.error:find("private upstream account detail", 1, true))
                end)
            end
        end)
        test.it("rejects malformed token responses instead of storing unusable credentials", function()
            for _, token in ipairs({
                {access_token = "token"},
                {access_token = "token\r\nInjected: value", token_type = "Bearer"},
                {access_token = "token", token_type = "Bearer", refresh_token = {}},
                {access_token = "token", token_type = "Bearer", scope = {}},
                {access_token = "token", token_type = "Bearer", expires_in = "3600"},
            }) do
                fixture({token = token}, function()
                    local result = oauth.refresh_token({refresh_token = "refresh", provider_specific = {
                        endpoint_url = "https://mcp.example/mcp", token_endpoint = "https://issuer.example/token"},
                        client_credentials = {client_id = "client"}})
                    test.is_false(result.success)
                    test.is_nil(result.access_token)
                end)
            end
        end)
        test.it("rejects malformed provider options and scopes without throwing", function()
            for _, options in ipairs({"invalid", {endpoint_url = {}}, {client_id = 1}}) do
                local result = oauth.init_oauth({provider_options = options})
                test.is_false(result.success)
            end
            test.is_false(oauth.init_oauth({scopes = "invalid"}).success)
            fixture({}, function()
                test.is_false(oauth.init_oauth({redirect_uri = "https://kickside.example/callback",
                    scopes = {permission = "write"}, provider_options = {endpoint_url = "https://mcp.example/mcp"}}).success)
            end)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
