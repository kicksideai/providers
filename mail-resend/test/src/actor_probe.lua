-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local actor_probe = require("actor_probe")

local function run(input)
    return actor_probe.run("kickside.mail.resend:transport", input)
end

return {run = run}
