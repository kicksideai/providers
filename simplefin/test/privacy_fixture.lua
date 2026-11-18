-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local secret = "https://account:simplefin-external-error-sentinel@bridge.example/simplefin"
local M = {
    STATUS = {BAD_REQUEST = 400, FORBIDDEN = 403, INTERNAL_ERROR = 500, OK = 200},
    CONTENT = {JSON = "application/json"},
    ACCESS = {WRITE = 2},
    secret = secret,
    connection = {access_url = secret, base_url = "https://bridge.example/simplefin",
        authorization = "Basic fixture"},
}
function M.request()
    return {param = function() return "fixture-connection" end,
        body = function() return assert(json.encode({setup_token = M.secret})), nil end}
end
function M.response()
    return {set_content_type = function() end, set_status = function(_, status) M.status = status end,
        write_json = function(_, value) M.body = assert(json.encode(value)) end}
end
function M.open() return {}, nil end
function M.get_private_runtime_context() return {access_url = M.secret}, nil end
return M
