-- Called by the broker in the admitted caller's identity before dispatching to
-- the resident worker. Keep credentials out of tool schemas and tool results.
local contract = require("contract")
local security = require("security")
local M = {}
function M.load(component_id: string, rejected: string?): (any?, error?)
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope then return nil, errors.new({kind=errors.PERMISSION_DENIED, message="MCP OAuth requires an authenticated actor and scope"}) end
    local runtime, runtime_err = contract.get("kickside.oauth.runtime:connection")
    if not runtime then return nil, runtime_err end
    local reader, reader_err = runtime:with_actor(actor):with_scope(scope):open()
    if not reader then return nil, reader_err end
    local connection, config_err = reader:get_config({component_id = component_id})
    if config_err then
        if errors.is(config_err, errors.NOT_FOUND) then
            return nil, errors.new({kind=errors.NOT_FOUND, message="Remote MCP OAuth connection is unavailable", details={code="MCP_OAUTH_UNAVAILABLE"}})
        end
        return nil, config_err
    end
    if not connection then return nil, errors.new({kind=errors.INTERNAL, message="OAuth runtime configuration is unavailable"}) end
    if connection.provider ~= "mcp_remote" or connection.connection_state ~= "connected" then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Remote MCP connection requires authorization"})
    end
    local definition, definition_err = contract.get("kickside.oauth:oauth_connection_contract")
    if not definition then return nil, definition_err end
    local instance, open_err = definition:with_actor(actor):with_scope(scope):with_context({component_id = component_id}):open("kickside.mcp_client.oauth:connection")
    if not instance then return nil, open_err end
    local token, token_err = instance:get_access_token({rejected_access_token = rejected})
    if token_err then return nil, token_err end
    if not token or not token.success then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Remote MCP token unavailable: " .. tostring(token and token.error or "reconnect the account")}) end
    local config = connection.config
    return {oauth = true, endpoint_url = config.endpoint_url, protocol_version = config.protocol_version,
        auth_type = "bearer", bearer_token = token.access_token}, nil
end
return M
