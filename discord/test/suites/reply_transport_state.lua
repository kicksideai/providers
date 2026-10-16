local M = {}

function M.reset()
    M.calls = {}
    M.access_allowed = true
    M.reserve_result = { send = true }
    M.reserve_error = nil
    M.send_result = { success = true, data = { id = "sent-1" } }
end

M.reset()
return M
