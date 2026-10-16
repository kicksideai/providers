local http = require("http")
local json = require("json")
local component = require("component")
local client = require("client")
local CLIENT_CONTRACT = "kickside.mcp_client:client"

local function write(res: any, status: any, payload: any)
    res:set_status(status); res:write_json(payload)
end

local function update_context(service: any, component_id: string, value: any): (boolean, any?)
    local result, err = service:update({
        component_id = component_id,
        commands = { { type = "SET_CONTEXT", payload = { private_context = value } } },
    })
    if err or not result or result.success == false then
        return false, err or (result and result.error) or "update failed"
    end
    return true, nil
end

-- Rotate the private connection context as one externally observable operation.
-- A failed probe or metadata update restores the previous context before the
-- caller receives an error. If restoration itself fails, report that explicitly
-- instead of claiming that the old connection is usable.
local function reconnect_connection(
    component_api: any,
    instance: any,
    service: any,
    component_id: string,
    old_context: any,
    normalized: any,
    name: any
): (any?, string?, any?)
    local updated, update_err = update_context(service, component_id, normalized)
    if not updated then
        return nil, tostring(update_err), http.STATUS.INTERNAL_ERROR
    end

    local probe, probe_err = instance:test_connection({})
    if probe_err then
        local restored, restore_err = update_context(service, component_id, old_context or {})
        if not restored then
            return nil,
                "New credentials failed and the previous connection could not be restored: "
                    .. tostring(restore_err) .. ". New credentials error: " .. tostring(probe_err),
                http.STATUS.INTERNAL_ERROR
        end
        return nil,
            "New credentials failed; the previous connection was restored. " .. tostring(probe_err),
            http.STATUS.BAD_REQUEST
    end

    if type(name) == "string" and name ~= "" then
        local meta_ok, meta_err = component_api.set_meta(component_id, { title = name })
        if not meta_ok then
            local restored, restore_err = update_context(service, component_id, old_context or {})
            if not restored then
                return nil,
                    "Connection name update failed and the previous connection could not be restored: "
                        .. tostring(restore_err) .. ". Metadata error: " .. tostring(meta_err),
                    http.STATUS.INTERNAL_ERROR
            end
            return nil,
                "Connection name update failed; the previous connection was restored. " .. tostring(meta_err),
                http.STATUS.INTERNAL_ERROR
        end
    end

    return probe, nil, nil
end

local function handler()
    local req, res = http.request(), http.response()
    if not req or not res then return nil, "no HTTP context" end
    res:set_content_type(http.CONTENT.JSON)
    local component_id = req:param("id")
    if type(component_id) ~= "string" or component_id == "" then write(res, http.STATUS.BAD_REQUEST, { success = false, error = "component id is required" }); return end
    component_id = component_id :: string
    local raw_body, body_err = req:body()
    if body_err then write(res, http.STATUS.BAD_REQUEST, { success = false, error = "invalid JSON" }); return end
    local body, decode_err = json.decode(raw_body)
    if decode_err or type(body) ~= "table" then write(res, http.STATUS.BAD_REQUEST, { success = false, error = "invalid JSON" }); return end
    local normalized, config_err = client.validate_config(body.private_context)
    if config_err or not normalized then write(res, http.STATUS.BAD_REQUEST, { success = false, error = tostring(config_err) }); return end
    local instance, open_err = component.open(component_id, component.ACCESS.WRITE, CLIENT_CONTRACT)
    if open_err or not instance then write(res, http.STATUS.FORBIDDEN, { success = false, error = "connection unavailable: " .. tostring(open_err) }); return end
    local old_context, old_err = component.get_private_context(component_id)
    if old_err then write(res, http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(old_err) }); return end
    local service, service_err = component.get_service()
    if service_err or not service then write(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "component service unavailable" }); return end
    local probe, reconnect_err, reconnect_status = reconnect_connection(
        component, instance, service, component_id, old_context, normalized, body.name
    )
    if reconnect_err then
        write(res, reconnect_status or http.STATUS.INTERNAL_ERROR, { success = false, error = reconnect_err }); return
    end
    write(res, http.STATUS.OK, { success = true, component_id = component_id, tool_count = probe.details.tool_count })
end

return { handler = handler, reconnect_connection = reconnect_connection }
