local component = require("component")
local time = require("time")
local M = {}
function M.report(connection_id: string, reason: string, message: any, state: string?): (boolean, any?)
    return component.set_runtime_meta(connection_id, {
        health_state = state or "error", health_reason = reason,
        health_message = tostring(message or ""), health_at = time.now():utc():format(time.RFC3339),
    })
end
return M
