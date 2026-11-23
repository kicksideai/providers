-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local fs = require("fs")
local json = require("json")
local uuid = require("uuid")

local function handle()
    local req = http.request()
    local res = http.response()
    local auth = req:header("Authorization")

    local payload = assert(req:body_json())
    local id = uuid.v4()
    local volume = assert(fs.get("app:resend_requests"))
    assert(volume:writefile(id .. ".json", assert(json.encode({
        authorization = auth,
        content_type = req:header("Content-Type"),
        idempotency_key = req:header("Idempotency-Key"),
        payload = payload,
    }))))
    local status, error_name = payload.subject:match("^HTTP (%d+) ?([%w_]*)$")
    if status then
        res:set_status(tonumber(status))
        res:write_json({name = error_name})
        return
    end
    res:write_json({id = id})
end

return { handle = handle }
