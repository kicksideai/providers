-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")
return {ACCESS = {WRITE = 2}, open = function() return {}, nil end,
    get_private_context = function() return {access_url = fixture.secret}, nil end}
