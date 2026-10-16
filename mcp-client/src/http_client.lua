local native_http = require("http_client")
local json = require("json")
local protocol = require("protocol")
local M = {}
local http: any = native_http

function M._set_http_client_for_test(value: any) http = value or native_http end
local function trim(v: any): string return type(v) == "string" and (v:match("^%s*(.-)%s*$") or "") or "" end

function M.validate_config(raw: any): (any?, error?)
    if type(raw) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "MCP configuration is missing" }) end
    local url = trim(raw.endpoint_url)
    if url == "" then return nil, errors.new({ kind = errors.INVALID, message = "endpoint_url is required" }) end
    if not url:match("^https?://") then return nil, errors.new({ kind = errors.INVALID, message = "endpoint_url must use http or https" }) end
    local auth_type = trim(raw.auth_type)
    if auth_type == "" then auth_type = trim(raw.bearer_token) ~= "" and "bearer" or "none" end
    if auth_type ~= "none" and auth_type ~= "bearer" and auth_type ~= "header" then return nil, errors.new({ kind = errors.INVALID, message = "auth_type must be none, bearer, or header" }) end
    local bearer = trim(raw.bearer_token)
    local header_name, header_value = trim(raw.header_name), trim(raw.header_value)
    if auth_type == "bearer" and bearer == "" then return nil, errors.new({ kind = errors.INVALID, message = "bearer_token is required for Bearer authentication" }) end
    if auth_type == "header" then
        if header_name == "" or header_value == "" then return nil, errors.new({ kind = errors.INVALID, message = "header_name and header_value are required for API key authentication" }) end
        if not header_name:match("^[%w%-]+$") then return nil, errors.new({ kind = errors.INVALID, message = "header_name contains invalid characters" }) end
        local blocked = { host = true, connection = true, ["content-length"] = true, ["transfer-encoding"] = true, authorization = true }
        local lower = header_name:lower()
        if blocked[lower] or lower:match("^mcp%-") then return nil, errors.new({ kind = errors.INVALID, message = "header_name is reserved and cannot be overridden" }) end
    end
    return {
        endpoint_url = url, auth_type = auth_type, bearer_token = auth_type == "bearer" and bearer or "",
        header_name = auth_type == "header" and header_name or "", header_value = auth_type == "header" and header_value or "",
        protocol_version = trim(raw.protocol_version) ~= "" and trim(raw.protocol_version) or protocol.DEFAULT_VERSION,
    }, nil
end

local function response_header(headers: any, wanted: string): string?
    if type(headers) ~= "table" then return nil end
    for k, v in pairs(headers) do if tostring(k):lower() == wanted:lower() and type(v) == "string" then return v end end
    return nil
end

local function request_headers(s: any): { [string]: string }
    local h: { [string]: string } = { ["Accept"] = "application/json, text/event-stream", ["Content-Type"] = "application/json", ["MCP-Protocol-Version"] = tostring(s.protocol_version) }
    if s.bearer_token ~= "" then h["Authorization"] = "Bearer " .. s.bearer_token end
    if s.auth_type == "header" and s.header_name ~= "" then h[s.header_name] = s.header_value end
    if s.session_id ~= "" then h["Mcp-Session-Id"] = s.session_id end
    return h
end

local function post(s: any, payload: any, allow_empty: boolean?): (any?, error?, integer)
    local body, enc_err = json.encode(payload)
    if enc_err then return nil, errors.wrap(enc_err, "MCP request is not serializable"), 0 end
    local resp, err = http.request("POST", tostring(s.endpoint_url), { headers = request_headers(s), body = body })
    if err then return nil, errors.wrap(err, "MCP request failed"), 0 end
    if not resp then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "MCP request returned no response" }), 0 end
    local status: integer = math.floor(tonumber(resp.status_code) or 0)
    if status < 200 or status >= 300 then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "MCP HTTP " .. tostring(status), details = { status_code = status } }), status
    end
    local assigned_session = response_header(resp.headers, "mcp-session-id")
    if assigned_session and assigned_session ~= "" then s.session_id = assigned_session end
    if allow_empty and (not resp.body or resp.body == "") then return {}, nil, status end
    local decoded, dec_err = protocol.decode_body(resp.body)
    return decoded, dec_err, status
end

local function initialize(s: any): error?
    local resp, err = post(s, protocol.request(1, "initialize", { protocolVersion = s.protocol_version, capabilities = {}, clientInfo = protocol.CLIENT_INFO }))
    if err then return err end
    local result, unwrap_err = protocol.unwrap(resp, 1)
    if unwrap_err then return errors.wrap(unwrap_err, "initialize") end
    s.protocol_version = tostring(result.protocolVersion or s.protocol_version)
    s.initialized = true
    local _, notify_err = post(s, protocol.notification("notifications/initialized", {}), true)
    return notify_err
end

function M.new(raw: any): (any?, error?)
    local config, err = M.validate_config(raw)
    if err or not config then return nil, err end
    config.session_id, config.initialized, config.next_id = "", false, 2
    local init_err = initialize(config)
    if init_err then return nil, init_err end
    return config, nil
end

local function operation(s: any, method: string, params: any): (any?, error?)
    local id: number = tonumber(s.next_id) or 2; s.next_id = id + 1
    local resp, err, status = post(s, protocol.request(id, method, params))
    if status == 404 and s.session_id ~= "" then
        s.session_id, s.initialized, s.next_id = "", false, 2
        local init_err = initialize(s)
        if init_err then return nil, init_err end
        id = tonumber(s.next_id) or 2; s.next_id = id + 1
        resp, err = post(s, protocol.request(id, method, params))
    end
    if err then return nil, err end
    return protocol.unwrap(resp, id)
end

function M.list_tools(s: any, cursor: string?): (any?, error?)
    local result, err = operation(s, "tools/list", cursor and {cursor = cursor} or {})
    if err then return nil, err end
    if type(result.tools) ~= "table" then return nil, errors.new({kind = errors.UNAVAILABLE, message = "tools/list returned no tools"}) end
    local next_cursor = type(result.nextCursor) == "string" and result.nextCursor ~= "" and result.nextCursor or nil
    if next_cursor and next_cursor == cursor then
        return nil, errors.new({kind = errors.UNAVAILABLE, message = "MCP tools/list returned a repeated cursor"})
    end
    return {tools = result.tools, next_cursor = next_cursor}, nil
end

function M.call_tool(s: any, name: any, args: any): (any?, error?)
    if type(name) ~= "string" or name == "" then return nil, errors.new({ kind = errors.INVALID, message = "tool name is required" }) end
    if type(args) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "tool arguments must be an object" }) end
    if next(args) == nil then args = table.create(0, 1) end
    local result, err = operation(s, "tools/call", { name = name, arguments = args })
    if err then return nil, err end
    if result.isError == true then
        local messages: { string } = {}
        for _, block in ipairs(type(result.content) == "table" and result.content or {}) do
            if type(block) == "table" and block.type == "text" and type(block.text) == "string" and block.text ~= "" then
                messages[#messages + 1] = block.text
            end
        end
        local outcome: { [string]: any } = {}
        for key, value in pairs(result) do outcome[key] = value end
        outcome.success = false
        outcome.error = #messages > 0 and table.concat(messages, "\n") or "remote MCP tool returned an error"
        return outcome, nil
    end
    return result, nil
end

function M.close(s: any)
    if not s or s.session_id == "" then return end
    http.request("DELETE", tostring(s.endpoint_url), { headers = request_headers(s) })
    s.session_id = ""
end
return M
