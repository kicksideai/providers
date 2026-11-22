-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local time = require("time")
local logger = require("logger"):named("kb10.placement")
local M = {}

function M.is_default_wiki(kb_type: string?, agent_id: string?): boolean
    return kb_type == "wiki" and (agent_id == nil or agent_id == "")
end

local function retryable(err: any): boolean
    if type(err) ~= "userdata" then return false end
    return err:retryable() == true or errors.is(err, errors.CONFLICT) or errors.is(err, errors.UNAVAILABLE)
        or tostring(err):find("database is locked", 1, true) ~= nil
end

-- A store still serves through legacy placement while enrollment is pending.
function M.after_create(component_id: string): string?
    local target = "kickside.kb10.graph:enroll_placement"
    local args = {component_id = component_id}
    local result, err = funcs.call(target, args)
    for _, delay in ipairs({"20ms", "80ms"}) do
        if result or not retryable(err) then break end
        time.sleep(delay)
        result, err = funcs.call(target, args)
    end
    if result and result.status == "enrolled" then return nil end
    local reason = tostring(err or (result and result.reason) or "placement enrollment returned no result")
    logger:warn("Wiki placement enrollment deferred", {component_id = component_id, reason = reason})
    return "Wiki placement enrollment deferred: " .. reason
end

return M
