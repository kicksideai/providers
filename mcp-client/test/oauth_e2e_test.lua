local test = require("test")
local http = require("http_client")
local json = require("json")
local sql = require("sql")
local funcs = require("funcs")
local security = require("security")
local time = require("time")
local oauth = require("oauth")
local repo = require("oauth_read_repo")
local token_repo = require("oauth_token_repo")
local process = require("process")
local BASE = "http://127.0.0.1:19129"
local CONNECTION_NAME = "MCP OAuth integration " .. tostring(time.now():unix_nano())

local function query(statement, params)
    local db, err = sql.get("app:db")
    test.is_nil(err)
    local rows, read_err = db:query(statement, params or {})
    db:release()
    test.is_nil(read_err)
    return rows
end
local function execute(statement, params)
    local db, err = sql.get("app:db")
    test.is_nil(err)
    local _, write_err = db:execute(statement, params or {})
    db:release()
    test.is_nil(write_err)
end
local function request(method, url, body)
    local response, err = http.request(method, url, {headers = {["Content-Type"] = "application/json"}, body = body and json.encode(body) or nil})
    test.is_nil(err, tostring(err)); test.not_nil(response)
    local value = json.decode(response.body or "")
    test.eq(response.status_code, 200, response.body)
    return value
end
local function authorize(existing)
    local started = request("POST", BASE .. "/test-oauth/mcp_remote/init", {
        name = CONNECTION_NAME, scopes = {}, component_id = existing,
        provider_options = {endpoint_url = BASE .. "/fixture/mcp"},
    })
    test.is_true(started.success, started.error)
    local pending, pending_err = process.registry.lookup("kickside.oauth.service:connection_negotiator:" .. started.state_token, process.registry.CONSISTENT)
    test.is_nil(pending_err,tostring(pending_err)); test.not_nil(pending,"successful init must have a ready callback session")
    test.contains(started.authorization_url, "code_challenge_method=S256")
    test.contains(started.authorization_url, "resource=http%3A%2F%2F127.0.0.1%3A19129%2Ffixture%2Fmcp")
    local consent = request("GET", started.authorization_url)
    local result = request("POST", BASE .. "/api/public/oauth/callback", consent)
    test.is_true(result.success, result.error)
    test.is_nil(result.access_token)
    local rows = query("SELECT component_id FROM kickside_oauth_connections WHERE connection_name=$1", {CONNECTION_NAME})
    test.eq(#rows, 1)
    return rows[1].component_id
end
local function executor(context)
    local scope = security.new_scope({security.policy("app:oauth_fixture_all")})
    return funcs.new():with_actor(security.new_actor("8fcff8a1-01ad-423c-8e20-a34860574b23", {})):with_scope(scope):with_context(context or {})
end

local function define_tests()
    test.describe("Remote MCP OAuth over HTTP", function()
        test.it("authorizes, discovers tools, calls a tool, refreshes, reconnects, and rejects a revoked grant", function()
            local probe = http.request("POST", BASE .. "/fixture/mcp", {headers = {["Content-Type"] = "application/json"}, body = "{}"})
            test.eq(probe.status_code, 401, probe.body)
            test.not_nil(probe.headers, "MCP challenge headers are required")
            local id = authorize()
            local connection, read_err = repo.get_connection(id)
            test.is_nil(read_err)
            test.eq(connection.provider, "mcp_remote")
            test.eq(connection.client_credentials.client_id, "fixture-client")
            local stored = query("SELECT oauth_data_encrypted FROM kickside_oauth_connections WHERE component_id=$1", {id})[1].oauth_data_encrypted
            test.is_nil(stored:find(connection.tokens.access_token, 1, true))
            test.is_nil(stored:find(connection.tokens.refresh_token, 1, true))
            local token, token_err = executor({component_id = id}):call("kickside.oauth.binding:get_access_token_func", {})
            test.is_nil(token_err, tostring(token_err)); test.is_true(token.success, token.error)
            local probe, probe_err = executor({component_id = id}):call("kickside.mcp_client:test_connection", {})
            test.is_nil(probe_err, tostring(probe_err)); test.is_true(probe.success); test.eq(probe.details.tool_count, 1)
            local function echo()
                local result, err = executor({connection_id = id, remote_tool_name = "echo"}):call("kickside.mcp_client:invoke_tool", {message = "OAuth works"})
                test.is_nil(err, tostring(err)); test.eq(result.content[1].text, "OAuth works")
            end
            echo()
            -- Expiry after downtime must recover on demand and rotate the refresh token.
            local _, expired_err = token_repo.update_tokens(id, connection.tokens, time.now():unix() - 1)
            test.is_nil(expired_err)
            echo()
            local refreshed = repo.get_connection(id)
            test.is_true(refreshed.tokens.access_token ~= connection.tokens.access_token)
            test.is_true(refreshed.tokens.refresh_token ~= connection.tokens.refresh_token)
            -- A server-side invalidation before local expiry triggers one 401 refresh.
            execute("UPDATE mcp_oauth_fixture SET access_token=$1 WHERE refresh_token=$2", {"server-invalidated", refreshed.tokens.refresh_token})
            echo()
            local recovered = repo.get_connection(id)
            test.is_true(recovered.tokens.access_token ~= refreshed.tokens.access_token)
            test.eq(authorize(id), id)
            echo()
            -- A revoked refresh grant requires consent; it must never loop or retry a write indefinitely.
            local reauthorized = repo.get_connection(id)
            execute("UPDATE mcp_oauth_fixture SET revoked=1 WHERE refresh_token=$1", {reauthorized.tokens.refresh_token})
            local failed, fail_err = executor({connection_id = id, remote_tool_name = "echo"}):call("kickside.mcp_client:invoke_tool", {})
            test.is_nil(failed); test.not_nil(fail_err)
            test.eq(repo.get_connection(id).connection_state, "needs_reauth")
            local _, delete_err = executor({component_id = id}):call("kickside.oauth.binding:delete_connection_func", {})
            test.is_nil(delete_err, tostring(delete_err))
        end)
        test.it("rejects forged state and issuer without exchanging the code", function()
            local started = oauth.init_oauth({redirect_uri = BASE .. "/api/public/oauth/callback", scopes = {}, provider_options = {endpoint_url = BASE .. "/fixture/mcp"}})
            test.is_true(started.success, started.error)
            local called = false
            local original = oauth._http
            oauth._http = {request = function() called = true end}
            local state = oauth.handle_callback({state = "forged", code = "not-issued", stored_data = started.storage_payload})
            local issuer = oauth.handle_callback({state = started.state_token, iss = "https://attacker.example", code = "not-issued", stored_data = started.storage_payload})
            local missing = oauth.handle_callback({state = started.state_token, code = "not-issued", stored_data = started.storage_payload})
            oauth._http = original
            test.is_false(state.success); test.is_false(issuer.success); test.is_false(missing.success); test.is_false(called)
        end)
        test.it("rejects insecure endpoints and provider context overrides", function()
            for _, endpoint in ipairs({"http://external.example/mcp", "https://user:password@example.com/mcp", "https://example.com/mcp#fragment"}) do
                test.is_nil(oauth.url(endpoint))
            end
            local result = oauth.init_oauth({redirect_uri = BASE .. "/api/public/oauth/callback", provider_options = {oauth_token_endpoint = "https://attacker.example/token"}})
            test.is_false(result.success); test.contains(result.error, "Unknown")
        end)
    end)
end
return {run = test.run_cases(define_tests)}
