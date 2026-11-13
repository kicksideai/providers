local M = {}
M.failure = errors.new({kind = errors.UNAVAILABLE, message = "application transport failed", details = {code = "provider_transport"}})
function M.get_application(conn: any): (any?, error?)
    M.token = conn.bot_token
    return nil, M.failure
end
return M
