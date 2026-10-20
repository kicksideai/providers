-- Called by the broker in the admitted caller's identity before dispatching to
-- the resident worker. Keep credentials out of tool schemas and tool results.
local repo = require("oauth_read_repo")
local contract = require("contract")
local M = {}
function M.load(component_id: string, rejected: string?): (any?, error?)
    local connection = repo.get_connection(component_id)
    if not connection then return nil, errors.new({kind = errors.NOT_FOUND, message = "Remote MCP OAuth connection is unavailable", details = {code = "MCP_OAUTH_UNAVAILABLE"}}) end
    if connection.provider ~= "mcp_remote" or connection.connection_state ~= "connected" then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Remote MCP connection requires authorization"})
    end
    local definition, definition_err = contract.get("kickside.oauth:oauth_connection_contract")
    if not definition then return nil, definition_err end
    local instance, open_err = definition:with_context({component_id = component_id}):open("kickside.mcp_client.oauth:connection")
    if not instance then return nil, open_err end
    local token, token_err = instance:get_access_token({rejected_access_token = rejected})
    if token_err then return nil, token_err end
    if not token or not token.success then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Remote MCP token unavailable: " .. tostring(token and token.error or "reconnect the account")}) end
    local config = connection.provider_specific or {}
    return {oauth = true, endpoint_url = config.endpoint_url, protocol_version = config.protocol_version,
        auth_type = "bearer", bearer_token = token.access_token}, nil
end
return M
