-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local logger = require("logger"):named("kb10.placement")
local M = {}

function M.is_default_wiki(kb_type: string?, agent_id: string?): boolean
    return kb_type == "wiki" and (agent_id == nil or agent_id == "")
end

-- A store still serves through legacy placement while its upgrade is pending.
function M.after_create(component_id: string): string?
    local result, err = funcs.call("kickside.kb10.graph:enroll_placement", {component_id = component_id})
    if result and result.status == "enrolled" then return nil end
    local reason = tostring(err or (result and result.reason) or "placement enrollment returned no result")
    logger:warn("Wiki placement enrollment deferred", {component_id = component_id, reason = reason})
    return "Wiki placement enrollment deferred: " .. reason
end

return M
