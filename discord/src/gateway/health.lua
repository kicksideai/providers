local component = require("component")
local time = require("time")
local M = {}
function M.report(connection_id: string, reason: string, message: any, state: string?, current: any?): (boolean, any?)
    local health_state = state or "error"
    local health_message = tostring(message or "")
    if type(current) == "table" and current.health_state == health_state
        and current.health_reason == reason and current.health_message == health_message then
        return true, nil
    end
    return component.set_runtime_meta(connection_id, {
        health_state = health_state, health_reason = reason,
        health_message = health_message, health_at = time.now():utc():format(time.RFC3339),
    })
end
return M
