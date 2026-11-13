-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local channel = require("channel")
return {event = {CANCEL = "cancel"}, events = function()
    local events = channel.new(1)
    events:send({kind = "cancel"})
    return events
end}
