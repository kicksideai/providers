local http = require("http")
local M = {}
function M.handle(): (any?, any?)
    local req, res = http.request(), http.response()
    local mode = req:param("mode")
    local auth = req:header("Authorization")
    if mode == "forbidden" then
        res:set_status(403)
        return res:write_json({ error = { message = "Forbidden" } })
    end
    if mode == "always-unauthorized" or auth ~= "Bearer fresh" then
        res:set_status(401)
        return res:write_json({ error = { message = "Invalid Credentials" } })
    end
    if mode == "retry-network-error" then
        res:set_status(200)
        res:set_header("Content-Length", "4096")
        return res:write("incomplete")
    end
    if mode == "raw" then return res:write("exported") end
    return res:write_json({ authenticated = true, method = req:method() })
end
return M
