-- A test-only OAuth authorization server and protected MCP resource. All grants
-- are fictional. The fixture verifies state, resource binding and PKCE over HTTP.
local http = require("http")
local json = require("json")
local sql = require("sql")
local uuid = require("uuid")
local hash = require("hash")
local base64 = require("base64")
local BASE = "http://127.0.0.1:19129"
local function query(statement, params)
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local rows, read_err = db:query(statement, params or {})
    db:release()
    if read_err then error(tostring(read_err)) end
    return rows
end
local function execute(statement, params)
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local result, write_err = db:execute(statement, params or {})
    db:release()
    if write_err then error(tostring(write_err)) end
    return result
end
local function decode(s) return (s:gsub("+", " "):gsub("%%(%x%x)", function(h) return string.char(tonumber(h,16) or 0) end)) end
local function form(body)
    local out = {}
    for key, value in body:gmatch("([^&=]+)=([^&]*)") do out[decode(key)] = decode(value) end
    return out
end
local function html(value) return tostring(value):gsub("&", "&amp;"):gsub('"', "&quot;"):gsub("<", "&lt;") end
local function encode(value) return (tostring(value):gsub("[^%w%-%._~]", function(c) return string.format("%%%02X", string.byte(c)) end)) end
local function handler()
    local req, res = http.request(), http.response()
    res:set_content_type(http.CONTENT.JSON)
    local action = req:param("action") or "metadata"
    if action == "resource" then return res:write_json({resource = BASE .. "/fixture/mcp", authorization_servers = {BASE}, scopes_supported = {"tools:read"}}) end
    if action == "metadata" then return res:write_json({issuer = BASE, authorization_endpoint = BASE .. "/fixture/authorize", token_endpoint = BASE .. "/fixture/token", registration_endpoint = BASE .. "/fixture/register", code_challenge_methods_supported = {"S256"}, authorization_response_iss_parameter_supported = true}) end
    if action == "register" then
        local body = req:body_json()
        if not body or body.token_endpoint_auth_method ~= "none" then res:set_status(400); return res:write_json({error = "invalid_client_metadata"}) end
        return res:write_json({client_id = "fixture-client", token_endpoint_auth_method = "none"})
    end
    execute("CREATE TABLE IF NOT EXISTS mcp_oauth_fixture (code TEXT PRIMARY KEY,state TEXT,challenge TEXT,redirect_uri TEXT,resource TEXT,access_token TEXT,refresh_token TEXT,revoked INTEGER DEFAULT 0)")
    if action == "authorize" then
        if req:query("resource") ~= BASE .. "/fixture/mcp" or req:query("code_challenge_method") ~= "S256" or req:query("client_id") ~= "fixture-client" then res:set_status(400); return res:write_json({error = "invalid_request"}) end
        local browser = (req:header("Accept") or ""):find("text/html", 1, true) ~= nil
        if browser and req:query("consent") ~= "approve" then
            local hidden = {}
            for _, key in ipairs({"resource", "code_challenge_method", "client_id", "state", "code_challenge", "redirect_uri", "scope", "response_type"}) do
                hidden[#hidden + 1] = '<input type="hidden" name="' .. key .. '" value="' .. html(req:query(key) or "") .. '">'
            end
            res:set_content_type("text/html")
            return res:write('<!doctype html><html><title>Demo OAuth consent</title><body><h1>Connect the demo service</h1><p>Allow KickSide to discover and call the demo echo tool.</p><form method="get" action="/fixture/authorize">' .. table.concat(hidden) .. '<button name="consent" value="approve">Authorize KickSide</button></form></body></html>')
        end
        local code = uuid.v4()
        execute("INSERT INTO mcp_oauth_fixture (code,state,challenge,redirect_uri,resource) VALUES ($1,$2,$3,$4,$5)", {code,req:query("state"),req:query("code_challenge"),req:query("redirect_uri"),req:query("resource")})
        if browser then
            res:set_status(302)
            res:set_header("Location", req:query("redirect_uri") .. "?code=" .. encode(code) .. "&state=" .. encode(req:query("state")) .. "&iss=" .. encode(BASE))
            return
        end
        return res:write_json({code = code, state = req:query("state"), iss = BASE})
    end
    if action == "token" then
        local body = form(req:body())
        local rows = query("SELECT * FROM mcp_oauth_fixture WHERE code=$1 OR refresh_token=$1", {body.code or body.refresh_token or ""})
        local grant = rows[1]
        if not grant or grant.revoked == 1 or body.resource ~= grant.resource or body.client_id ~= "fixture-client" then res:set_status(400); return res:write_json({error = "invalid_grant"}) end
        if body.grant_type == "authorization_code" then
            local challenge = base64.encode(hash.sha256(body.code_verifier or "", true)):gsub("+", "-"):gsub("/", "_"):gsub("=", "")
            if grant.access_token ~= nil or challenge ~= grant.challenge or body.redirect_uri ~= grant.redirect_uri then res:set_status(400); return res:write_json({error = "invalid_grant"}) end
        elseif body.grant_type ~= "refresh_token" then res:set_status(400); return res:write_json({error = "unsupported_grant_type"}) end
        local access, refresh = "fixture-access-" .. uuid.v4(), "fixture-refresh-" .. uuid.v4()
        execute("UPDATE mcp_oauth_fixture SET access_token=$1,refresh_token=$2 WHERE code=$3", {access,refresh,grant.code})
        return res:write_json({access_token = access, refresh_token = refresh, expires_in = 3600, token_type = "Bearer", scope = "tools:read"})
    end
    if action == "mcp" then
        local token = (req:header("Authorization") or ""):match("^Bearer (.+)$") or ""
        local grants = query("SELECT code FROM mcp_oauth_fixture WHERE access_token=$1 AND revoked=0", {token})
        if #grants == 0 then
            res:set_status(401); res:set_header("WWW-Authenticate", 'Bearer resource_metadata="' .. BASE .. '/fixture/resource", scope="tools:read"')
            return res:write_json({error = "unauthorized"})
        end
        if req:method() == "DELETE" then res:set_status(204); return end
        local body = req:body_json()
        local result
        if body.method == "initialize" then result = {protocolVersion = "2025-11-25", capabilities = {tools = {}}, serverInfo = {name = "OAuth fixture", version = "1"}}
        elseif body.method == "notifications/initialized" then res:set_status(202); return
        elseif body.method == "tools/list" then result = {tools = {{name = "echo", description = "Echo a test message", inputSchema = {type = "object", properties = {message = {type = "string"}}}}}}
        elseif body.method == "tools/call" then result = {content = {{type = "text", text = body.params.arguments.message or "ok"}}}
        else res:set_status(400); return end
        return res:write_json({jsonrpc = "2.0", id = body.id, result = result})
    end
    res:set_status(404)
end
return {handler = handler}
