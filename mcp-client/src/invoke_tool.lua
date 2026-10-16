local ctx = require("ctx")
local component = require("component")
local tool_result = require("tool_result")

local CLIENT_CONTRACT = "kickside.mcp_client:client"
local M = {}

-- invoke returns the remote tool's result unchanged; a remote tool error is a
-- domain outcome { success = false, error, content, ... }. A failed call returns
-- its typed error.
function M.invoke(connection_id: any, remote_name: any, arguments: any, open: (string, integer, string?) -> (any?, error?)): (any?, error?)
    if type(connection_id) ~= "string" or connection_id == "" then
        return tool_result.fail(errors.INTERNAL, "MCP connection is not configured")
    end
    if type(remote_name) ~= "string" or remote_name == "" then
        return tool_result.fail(errors.INTERNAL, "MCP tool binding is invalid")
    end
    local instance, open_err = open(connection_id, component.ACCESS.WRITE, CLIENT_CONTRACT)
    if open_err then return nil, open_err end
    if not instance then return tool_result.fail(errors.UNAVAILABLE, "MCP connection is unavailable") end
    local result, call_err = instance:call_tool({ name = remote_name, arguments = type(arguments) == "table" and arguments or table.create(0, 1) })
    if call_err then return nil, call_err end
    if result == nil then return tool_result.fail(errors.INTERNAL, "MCP tool call returns no result") end
    return result, nil
end

function M.handler(arguments: any): (any?, error?)
    return M.invoke(ctx.get("connection_id"), ctx.get("remote_tool_name"), arguments, component.open)
end

return M
