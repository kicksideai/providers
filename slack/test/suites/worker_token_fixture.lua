-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}
function M.get_private_context() return {app_token = "\n xapp-valid-token \t"} end
function M.request(_method, _url, opts)
    M.authorization = opts.headers.Authorization
    return {status_code = 401, body = '{"ok":false,"error":"invalid_auth"}'}
end
return M
