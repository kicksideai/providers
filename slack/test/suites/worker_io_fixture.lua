-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")
local M = {}
function M.connect(url, opts)
    fixture.dialed_url = url
    fixture.dial_timeout = opts.dial_timeout
    return fixture.client, fixture.dial_error
end
function M:named(name: string)
    return M
end
function M:info(message: string, fields: any?) end
function M:error(message: string, fields: any?)
    fixture.logged_message = message
    fixture.logged_error = fields and fields.error
end
function M:warn(message: string, fields: any?)
    fixture.logged_message = message
    fixture.logged_error = fields and fields.error
end
return M
