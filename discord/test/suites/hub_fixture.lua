local process = require("process")
local M = {}
M.PARENT_NAME = "app.suites.discord.supervisor.parent"
M.HUB_NAME = "app.suites.discord.supervisor.hub"
local function parent()
    return process.registry.lookup(M.PARENT_NAME, process.registry.CONSISTENT)
end
function M.list_system(_)
    local pid, err = parent()
    if err then return nil, err end
    return { { component_id = "supervised-connection", private_context = { bot_token = pid } } }, nil
end
function M.report(id, reason, message)
    local pid, err = parent()
    if err then return nil, err end
    local _, send_err = process.send(pid, "health", { id = id, reason = reason, message = tostring(message) })
    if send_err then return nil, send_err end
    return true, nil
end
function M.register()
    return process.registry.register(M.HUB_NAME, nil, process.registry.CONSISTENT)
end
return M
