-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {writes = 0}
function M.set_runtime_meta(id, fields)
    M.writes = M.writes + 1
    M.id, M.fields = id, fields
    if M.failure then return false, M.failure end
    return true, nil
end
return M
