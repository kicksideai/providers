local M = {}
function M.trim(v) return type(v) == "string" and v or "" end
function M.component_id() return "conn-1", nil end
function M.get_status() return { success = true, status = "connected" } end
function M.public_meta() return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "connection READ denied"}) end
return M
