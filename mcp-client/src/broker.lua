local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local security = require("security")
local component = require("component")
local oauth_config = require("oauth_config")

local M = {}
local SUPERVISOR = "kickside.mcp_client:supervisor.service"

-- The worker answers with its error as an envelope { kind, message, retryable,
-- details }; request returns it as the same typed error and no result.
local function request_once(component_id: string, operation: string, args: any, config: any?): (any?, error?)
    local actor = security.actor()
    if not actor then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "MCP client requires an authenticated actor" })
    end
    local actor_id = actor:id()
    if type(actor_id) ~= "string" or actor_id == "" then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "MCP client actor has no id" })
    end
    local request_id, uuid_err = uuid.v4()
    if uuid_err then return nil, errors.wrap(uuid_err, "MCP request id") end
    local topic = "mcp.client.reply." .. request_id
    local replies = process.listen(topic)
    local ok, send_err = process.send(SUPERVISOR, "request", {
        component_id = component_id, isolation_key = actor_id,
        operation = operation, args = type(args) == "table" and args or {}, reply_topic = topic,
        connection_config = config,
    })
    if not ok then
        process.unlisten(replies)
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "MCP supervisor unavailable: " .. tostring(send_err) })
    end
    local timeout = time.after(operation == "call_tool" and "300s" or "30s")
    local selected = channel.select({ replies:case_receive(), timeout:case_receive() })
    process.unlisten(replies)
    if selected.channel == timeout then
        return nil, errors.new({ kind = errors.TIMEOUT, message = "MCP " .. operation .. " timed out" })
    end
    local payload = selected.value
    if type(payload) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "invalid MCP worker response" }) end
    local envelope = (payload :: any).error
    if type(envelope) == "table" then
        return nil, errors.new({ kind = envelope.kind, message = tostring(envelope.message),
            retryable = envelope.retryable, details = envelope.details })
    end
    return (payload :: any).result, nil
end

function M.request(component_id: string, operation: string, args: any): (any?, error?)
    -- Resolve/renew OAuth in the admitted caller's identity. Resident workers
    -- are service processes and must never impersonate users to mutate tokens.
    local private, context_err = component.get_private_context(component_id)
    if context_err then return nil, context_err end
    local config
    if not private or not private.endpoint_url then
        local config_err
        config, config_err = oauth_config.load(component_id)
        if not config then return nil, config_err end
    end
    local result, err = request_once(component_id, operation, args, config)
    if config and err then
        local details = err:details()
        if type(details) == "table" and details.status_code == 401 then
            local refreshed, refresh_err = oauth_config.load(component_id, config.bearer_token)
            if not refreshed then return nil, refresh_err end
            return request_once(component_id, operation, args, refreshed)
        end
    end
    return result, err
end

return M
