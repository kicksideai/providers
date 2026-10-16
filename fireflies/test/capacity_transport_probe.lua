local guard = require("guard")
local client = require("client")
local fixture = require("fixture")
local M = {}
function M.status(): any return {success = true, status = "connected"} end
function M.run(): any
    guard.scope("kickside.fireflies.connection")
    return guard.run(function(conn) return client.graphql(conn, "query { user { name } }", nil) end, fixture)
end
function M.unreachable(): any
    return guard.unreachable(function(conn) return client.graphql(conn, "query { user { name } }", nil) end, fixture)
end
return M
