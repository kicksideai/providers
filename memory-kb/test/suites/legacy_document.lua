-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local M = {}
function M.query(request: any): (any, error?)
    local id = ctx.get("component_id")
    if tonumber(request.offset or 0) > 0 then return {success = true, items = {}, count = 0}, nil end
    return {success = true, items = {{id = id .. ":document", content = "Saved document knowledge: " .. id,
        metadata = {source = "legacy-document"}}}, count = 1}, nil
end
return M
