-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}
function M.get_private_context() return {app_token = "\n xapp-valid-token \t"} end
function M.request(_method, _url, opts)
    M.authorization = opts.headers.Authorization
    if M.url then
        return {status_code = 200, body = '{"ok":true,"url":"' .. M.url .. '"}'}
    end
    return {status_code = 401, body = '{"ok":false,"error":"invalid_auth"}'}
end
return M
