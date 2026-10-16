local capacity_http = require("capacity_http")
local http_client = require("http_client")
local json = require("json")
local types = require("types")

local M = {}

local function encode_segment(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end
M.encode_segment = encode_segment

local function build_url(path: string, query: { [string]: any }?): string
    local url = types.api_base() .. path
    if query and next(query) then
        local params: { string } = {}
        for key, value in pairs(query) do
            if value ~= nil then
                params[#params + 1] = tostring(key) .. "=" .. encode_segment(tostring(value))
            end
        end
        if #params > 0 then url = url .. "?" .. table.concat(params, "&") end
    end
    return url
end
M.build_url = build_url

local function headers(api_key: string): { [string]: string }
    return {
        ["X-Phantombuster-Key"] = api_key,
        ["Accept"] = "application/json",
        ["Content-Type"] = "application/json",
    }
end
M.headers = headers

-- extract_error(response) -> (message, status_code, body): PhantomBuster's error
-- message, the HTTP status and the decoded error body (the raw body when it is
-- not JSON).
function M.extract_error(response: any): (string, integer, any)
    local status_code = (response and response.status_code or 0) :: integer
    local message = "request failed"
    local data: any = nil
    if response and response.body and response.body ~= "" then
        local body = response.body :: string
        local parsed: any = json.decode(body)
        data = type(parsed) == "table" and parsed or body
        if type(parsed) == "table" then
            message = tostring(parsed.error or parsed.message or parsed.errorMessage or body)
        else
            message = body
        end
    end
    if status_code == 401 then return "unauthorized", status_code, data end
    if status_code == 403 then return "forbidden", status_code, data end
    if status_code == 404 then return "not found", status_code, data end
    if status_code == 429 then return "rate limited", status_code, data end
    return message, status_code, data
end

-- A PhantomBuster answer is a Result (a failed answer carries the message, HTTP
-- status and error body); a request that cannot be encoded or sent is a typed
-- error.
M.request_json = capacity_http.wrap(function(conn: types.Conn, method: string, path: string, body: any?, query: { [string]: any }?): (types.Result?, error?)
    local opts: { headers: { [string]: string }, body: string? } = { headers = headers(conn.api_key) }
    if body ~= nil then
        local encoded, encode_err = json.encode(body)
        if encode_err then return nil, errors.wrap(encode_err, "PhantomBuster request body is not serializable") end
        opts.body = encoded :: string
    end

    local response, err = http_client.request(method, build_url(path, query), opts)
    if err then return nil, errors.wrap(err, "PhantomBuster " .. method .. " " .. path .. " request failed") end

    if response and response.status_code >= 200 and response.status_code < 300 then
        local data: any = nil
        if response.body and response.body ~= "" then
            local parsed, decode_err = json.decode(response.body :: string)
            if decode_err or parsed == nil then
                data = response.body
            else
                data = parsed
            end
        end
        return { success = true, data = data, status_code = response.status_code :: integer }
    end

    local message, code, error_body = M.extract_error(response)
    return { success = false, error = message, status_code = code, data = error_body,
        retry_after_ms = code == 429 and capacity_http.retry_after(response, 60000) or nil }
end)

function M.get(conn: types.Conn, path: string, query: { [string]: any }?): (types.Result?, error?)
    return M.request_json(conn, "GET", path, nil, query)
end

function M.post(conn: types.Conn, path: string, body: any?): (types.Result?, error?)
    return M.request_json(conn, "POST", path, body, nil)
end

function M.test_connection(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/api/v2/orgs/fetch", nil)
end

function M.get_org(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/api/v2/orgs/fetch", nil)
end

function M.get_org_resources(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/api/v2/orgs/fetch-resources", nil)
end

function M.list_running_containers(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/api/v2/orgs/fetch-running-containers", nil)
end

function M.list_agents(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/api/v2/agents/fetch-all", nil)
end

function M.list_deleted_agents(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/api/v2/agents/fetch-deleted", nil)
end

function M.get_agent(conn: types.Conn, agent_id: string): (types.Result?, error?)
    return M.get(conn, "/api/v2/agents/fetch", { id = agent_id })
end

function M.get_agent_output(conn: types.Conn, agent_id: string, query: { [string]: any }?): (types.Result?, error?)
    query = query or {}
    query.id = agent_id
    return M.get(conn, "/api/v2/agents/fetch-output", query)
end

function M.list_containers(conn: types.Conn, agent_id: string): (types.Result?, error?)
    return M.get(conn, "/api/v2/containers/fetch-all", { agentId = agent_id })
end

function M.get_container(conn: types.Conn, container_id: string, query: { [string]: any }?): (types.Result?, error?)
    query = query or {}
    query.id = container_id
    return M.get(conn, "/api/v2/containers/fetch", query)
end

function M.get_container_output(conn: types.Conn, container_id: string, mode: string?): (types.Result?, error?)
    local query: { [string]: any } = { id = container_id }
    if mode and mode ~= "" then query.mode = mode end
    return M.get(conn, "/api/v2/containers/fetch-output", query)
end

function M.get_result_object(conn: types.Conn, container_id: string): (types.Result?, error?)
    return M.get(conn, "/api/v2/containers/fetch-result-object", { id = container_id })
end

function M.launch_agent(conn: types.Conn, agent_id: string, argument_json: string?): (types.Result?, error?)
    local body: any = { id = agent_id }
    if type(argument_json) == "string" and argument_json ~= "" then body.argument = argument_json end
    return M.post(conn, "/api/v2/agents/launch", body)
end

function M.launch_agent_soon(conn: types.Conn, agent_id: string, minutes: number, argument_json: string?): (types.Result?, error?)
    local body: any = { id = agent_id, minutes = minutes }
    if type(argument_json) == "string" and argument_json ~= "" then body.argument = argument_json end
    return M.post(conn, "/api/v2/agents/launch-soon", body)
end

function M.stop_agent(conn: types.Conn, agent_id: string, opts: { [string]: any }?): (types.Result?, error?)
    local body: any = { id = agent_id }
    if opts then
        for _, key in ipairs({ "softAbort", "cascadeToAllSlaves", "dontLaunchSoon", "switchToManualLaunch" }) do
            local value = opts[key]
            if value ~= nil then body[key] = value end
        end
    end
    return M.post(conn, "/api/v2/agents/stop", body)
end


return M
