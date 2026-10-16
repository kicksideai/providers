local guard = require("guard")
local client = require("client")
local fixture = require("fixture")
local M = {}
function M.status(): any return {success = true, status = "connected"} end
function M.run(): any
    guard.scope("kickside.simplefin.connection")
    return guard.run(function(conn) return client.info(conn) end, fixture)
end
return M
