-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")
local M = {}
function M.connect(url, opts)
    fixture.dialed_url = url
    fixture.dial_timeout = opts.dial_timeout
    return fixture.client, fixture.dial_error
end
function M:named()
    return {
        info = function() end,
        warn = function(_, message, fields)
            fixture.logged_message = message
            fixture.logged_error = fields.error
        end,
    }
end
return M
