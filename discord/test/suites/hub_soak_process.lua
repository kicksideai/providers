local process = require("process")
local M = {}
for key, value in pairs(process) do M[key] = value end
function M.spawn_monitored(_, host, args)
    return process.spawn_monitored("app.suites:hub_soak_worker", host, args)
end
return M
