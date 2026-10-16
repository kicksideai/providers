local process = require("process")
local M = {}
for key, value in pairs(process) do M[key] = value end
local count = 0
function M.spawn_monitored(_, host, args)
    count = count + 1
    return process.spawn_monitored("app.suites:hub_worker_fixture", host, { parent = args.token, fail = count == 1 })
end
return M
