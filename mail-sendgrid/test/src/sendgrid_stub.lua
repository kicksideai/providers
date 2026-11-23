-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local fs = require("fs")
local json = require("json")
local uuid = require("uuid")

local function handle()
    local req = http.request()
    local res = http.response()
    local method = req:method()
    local payload = method == "POST" and assert(req:body_json()) or nil
    local id = uuid.v4()
    local volume = assert(fs.get("app:sendgrid_requests"))
    assert(volume:writefile(id .. ".json", assert(json.encode({
        id = id,
        method = method,
        authorization = req:header("Authorization"),
        content_type = req:header("Content-Type"),
        idempotency_key = req:header("Idempotency-Key"),
        payload = payload,
    }))))

    if req:header("Authorization") ~= "Bearer sg_fixture" then
        res:set_status(401)
        res:write_json({errors = {{message = "Invalid API key"}}})
        return
    end

    if payload.subject:match("^Credits exhausted ") then
        res:set_status(401)
        res:write_json({errors = {{message = "Maximum credits exceeded"}}})
        return
    end

    local status = payload.subject and payload.subject:match("^HTTP (%d+) ")
    if status then
        res:set_status(tonumber(status))
        if status ~= "202" then
            res:write_json({errors = {{message = "Fixture rejection"}}})
        end
        return
    end

    res:set_header("X-Message-Id", id)
    res:set_status(202)
end

return {handle = handle}
