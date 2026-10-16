local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local security = require("security")

local M = {}
local SUPERVISOR = "kickside.mcp_client:supervisor.service"

-- The worker answers with its error as an envelope { kind, message, retryable,
-- details }; request returns it as the same typed error and no result.
function M.request(component_id: string, operation: string, args: any): (any?, error?)
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

return M
