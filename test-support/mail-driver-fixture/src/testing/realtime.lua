-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local signal = require("signal")
local fs = require("fs")
local security = require("security")

local function broadcast(input)
    if input.topic == "mail.library" or input.topic == "mail.activity" then
        assert(security.can("realtime.broadcast", "kickside.realtime:" .. input.topic))
        if input.topic == "mail.library" then
            local signals = assert(fs.get("test.mail_driver_fixture.testing:signals"))
            assert(signals:writefile("library", input.topic))
        end
        signal.publish(input.topic)
    end
    return {success = true}
end

local function notify()
    return {success = true}
end

return {broadcast = broadcast, notify = notify}
