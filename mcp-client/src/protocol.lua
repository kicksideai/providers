local json = require("json")

local M = {}

M.DEFAULT_VERSION = "2025-11-25"
M.CLIENT_INFO = { name = "kickside-mcp-client", version = "0.1.0" }

function M.request(id: number, method: string, params: any?): any
    local out: any = { jsonrpc = "2.0", id = id, method = method }
    if params ~= nil then out.params = params end
    return out
end

function M.notification(method: string, params: any?): any
    local out: any = { jsonrpc = "2.0", method = method }
    if params ~= nil then out.params = params end
    return out
end

-- Streamable HTTP may answer with application/json or an SSE stream. Return the
-- first JSON-RPC message carrying a result/error; notification/event lines are
-- ignored. This keeps transport framing out of the agent/tool layer.
function M.decode_body(body: any): (any?, error?)
    if type(body) ~= "string" or body == "" then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "empty MCP response" }) end
    local direct, derr = json.decode(body)
    if type(direct) == "table" then return direct, nil end

    for line in (body .. "\n"):gmatch("([^\r\n]*)\r?\n") do
        if line:sub(1, 5) == "data:" then
            local payload = line:sub(6)
            if payload:sub(1, 1) == " " then payload = payload:sub(2) end
            if payload ~= "" then
                local value = json.decode(payload)
                if type(value) == "table" and ((value :: any).result ~= nil or (value :: any).error ~= nil) then
                    return value, nil
                end
            end
        end
    end
    return nil, errors.new({ kind = errors.UNAVAILABLE, message = "invalid MCP JSON/SSE response: " .. tostring(derr) })
end

function M.unwrap(response: any, expected_id: number): (any?, error?)
    if type(response) ~= "table" then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "invalid MCP response" }) end
    if (response :: any).id ~= expected_id then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "MCP response id mismatch" })
    end
    local rpc_error = (response :: any).error
    if type(rpc_error) == "table" then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring((rpc_error :: any).message or "MCP request failed"),
            details = { rpc_code = (rpc_error :: any).code } })
    end
    if (response :: any).result == nil then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "MCP response has no result" }) end
    return (response :: any).result, nil
end

return M
