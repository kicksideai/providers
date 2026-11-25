-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local actor_probe = require("actor_probe")

local function run(input)
    if input.action == "grant_upload" or input.action == "revoke_upload" then
        local definition = assert(contract.get("kickside.component:component_service"))
        local component = assert(definition:open())
        if input.action == "grant_upload" then return component:grant_subtree(input.target) end
        return component:revoke_subtree(input.target)
    end
    return actor_probe.run("kickside.mail.resend:transport", input)
end

return {run = run}
