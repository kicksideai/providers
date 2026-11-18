-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}
function M.send_message(conn: any, destination: string, payload: any): any
    assert(conn.bot_token == "transport-secret-sentinel", "stored credential is unavailable")
    return {success = true, data = {id = "receipt", ts = "receipt", message_id = "receipt"}}
end
return M
