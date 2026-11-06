-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local json = require("json")

local M = {}

function M.encode(value: any): (string?, error?)
    if type(value) == "table" and value.force_encode_error == true then
        return nil, errors.new({ kind = errors.INTERNAL, message = "forced JSON encode error" })
    end
    return json.encode(value)
end

return M
