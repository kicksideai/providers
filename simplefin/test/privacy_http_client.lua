-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")

local function request()
    return {status_code = 500, body = "echo " .. fixture.secret}, nil
end

return {request = request}
