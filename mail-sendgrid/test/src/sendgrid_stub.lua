-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local time = require("time")
local fs = require("fs")
local json = require("json")
local uuid = require("uuid")

local function handle()
    local req = http.request()
    local res = http.response()
    local method = req:method()
    local payload = method == "POST" and assert(req:body_json()) or nil
    local id = uuid.v4()
    local authorized = req:header("Authorization") == "Bearer sg_fixture"
    local volume = assert(fs.get("app:sendgrid_requests"))
    assert(volume:writefile(id .. ".json", assert(json.encode({
        id = id,
        method = method,
        authorized = authorized,
        content_type = req:header("Content-Type"),
        idempotency_key = req:header("Idempotency-Key"),
        payload = payload,
    }))))

    if not authorized then
        res:set_status(401)
        res:write_json({errors = {{message = "Invalid API key"}}})
        return
    end

    if payload.subject:match("^Plan allowance ") then
        res:set_status(401)
        res:write_json({errors = {{message = "Maximum credits exceeded"}}})
        return
    end

    if payload.subject:match("^Unverified sender ") then
        res:set_status(403)
        res:write_json({errors = {{message = "The from address does not match a verified Sender Identity."}}})
        return
    end

    if payload.subject:match("^Retry hint") then
        res:set_status(429)
        res:set_header("X-RateLimit-Reset", tostring(time.now():unix() + 120))
        res:write_json({message = "Retry later"})
        return
    end

    if payload.subject:match("^Unsafe provider detail") then
        res:set_status(400)
        local detail = "Fixture refusal\nsg_fixture " .. string.rep("é", 512)
        res:write_json({errors = {{message = detail}}})
        return
    end

    local status = payload.subject and payload.subject:match("^HTTP (%d+) ")
    if status then
        local http_status = assert(tonumber(status), "Invalid fixture HTTP status")
        res:set_status(http_status)
        if status ~= "202" then
            res:write_json({errors = {{message = "Fixture rejection"}}})
        end
        return
    end

    res:set_header("X-Message-Id", id)
    res:set_status(202)
end

return {handle = handle}
