-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local transport = require("transport")
return {run = function(args: any): any
    if args.read then
        local conn, err = transport.connect(args.component_id)
        return {success = conn ~= nil, error = err, credential_matches = conn and conn.bot_token == "transport-secret-sentinel"}
    end
    return transport.send_outbound({channel_id = "room", payload = {content = "hello"}})
end}
