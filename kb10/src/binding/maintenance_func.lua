-- maintainable contract methods: the whole-knowledge-base maintenance the
-- knowledge control plane reaches kb10 through. The knowledge base is the
-- binding context, so each method takes an empty DTO and reads component_id from
-- ctx, then calls the same cross-module seam POST /kb10/{id}/{verb} and GET
-- /kb10/{id}/maintenance run -- one code path per verb, whether the caller has a
-- request behind it or a contract.
--
-- The component id in context names a knowledge base; it authorizes nothing.
-- This binding is open to any in-process caller that can name one, so each verb
-- takes the same access decision its endpoint takes, through the same
-- api:request seam, under the actor the binding runs as: WRITE to schedule a run
-- -- which mints a durable record and queues hours of model work over the whole
-- knowledge base -- and READ to report what maintenance has done to it.

local ctx = require("ctx")
local component = require("component")
local request = require("request")
local schedule_resummarize = require("schedule_resummarize")
local schedule_reembed = require("schedule_reembed")
local maintenance_status = require("maintenance_status")

local M = {}

-- authorized(access) -> (component_id, err): the knowledge base this call is
-- bound to, once the caller is allowed to take the action on it.
local function authorized(access: any): (string?, string?)
    local component_id, err = ctx.get("component_id")
    if err then return nil, "component context unavailable: " .. tostring(err) end
    if type(component_id) ~= "string" or component_id == "" then
        return nil, "no component context"
    end

    local _, refusal = request.validate_access(component_id :: string, access)
    if refusal then return nil, refusal end

    return component_id :: string, nil
end

function M.schedule_resummarize(_request: any): (any?, string?)
    local component_id, access_err = authorized(component.ACCESS.WRITE)
    if not component_id then return nil, access_err end
    return schedule_resummarize.run(component_id :: string)
end

function M.schedule_reembed(_request: any): (any?, string?)
    local component_id, access_err = authorized(component.ACCESS.WRITE)
    if not component_id then return nil, access_err end
    return schedule_reembed.run(component_id :: string)
end

function M.maintenance_status(_request: any): (any?, string?)
    local component_id, access_err = authorized(component.ACCESS.READ)
    if not component_id then return nil, access_err end
    return maintenance_status.run(component_id :: string)
end

return M
