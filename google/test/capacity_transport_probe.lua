local guard = require("guard")
local client = require("client")
local fixture = require("fixture")
local M = {}
function M.status(): any return {success = true, status = "connected"} end
function M.run(): any
    return guard.run(function(conn) conn.component_id = nil; return client.request_json(conn, "GET", "https://fixture.test", nil, nil) end, fixture)
end
return M
