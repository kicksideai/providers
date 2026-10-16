local guard = require("guard")
local client = require("client")
local fixture = require("fixture")
local M = {}
function M.status(): any return {success = true, status = "connected"} end
function M.run(): any
    guard.scope("kickside.atlassian.connection")
    return guard.run(function(conn) return client.request_json(conn, "GET", "https://fixture.test", nil) end, fixture)
end
return M
