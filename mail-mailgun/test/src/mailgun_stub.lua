-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local time = require("time")
local fs = require("fs")
local json = require("json")
local uuid = require("uuid")
local base64 = require("base64")

local function multipart(request)
    local form = assert(request:parse_multipart())
    local files = {}
    for field, parts in pairs(form.files) do
        files[field] = {}
        for i, part in ipairs(parts) do
            local stream = assert(part:stream())
            local bytes = assert(stream:read())
            assert(stream:close())
            files[field][i] = {
                filename = assert(part:name()),
                content_type = part:header("Content-Type"),
                bytes = assert(base64.encode(bytes)),
            }
        end
    end
    return form.values, files
end

local function handle()
    local req = http.request()
    local res = http.response()
    local method = req:method()
    local values, files
    if method == "POST" then values, files = multipart(req) end
    local id = uuid.v4() .. "@mail.example.org"
    local authorization = req:header("Authorization")
    local volume = assert(fs.get("app:mailgun_requests"))
    assert(volume:writefile(id .. ".json", assert(json.encode({
        id = "<" .. id .. ">",
        method = method,
        path = req:path(),
        host = req:host(),
        authorization = authorization,
        content_type = req:header("Content-Type"),
        idempotency_key = req:header("Idempotency-Key"),
        values = values,
        files = files,
    }))))

    if authorization ~= "Basic YXBpOm1nX2ZpeHR1cmU=" then
        res:set_status(401)
        res:write_json({message = "Forbidden"})
        return
    end

    if values.subject:match("^Retry hint") then
        res:set_status(420)
        res:set_header("X-RateLimit-Reset", tostring(time.now():unix_nano() // 1000000 + 120000))
        res:write_json({message = "Retry later"})
        return
    end

    local requested_status = values.subject:match("^HTTP (%d+) ")
    if requested_status then
        local status = tonumber(requested_status)
        res:set_status(status)
        local message = status == 403 and "Please add the address to your authorized recipients." or "Fixture rejection"
        res:write_json({message = message})
        return
    end

    res:write_json({id = "<" .. id .. ">", message = "Queued. Thank you."})
end

return {handle = handle}
