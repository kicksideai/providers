local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local node_store = require("node_store")


local function raw_delete_error(kb_id, node)
    local node_type = node and node.node_type or ""
    if node_type == "concept" then
        return "raw node delete is disabled; delete concepts through /api/v1/kb10/" ..
            kb_id .. "/concepts/" .. node.id
    end
    return "raw node delete is disabled; delete source content through /api/v1/knowledge/" ..
        kb_id .. "/content using external_id, upload_id, source_url, or source_ref"
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local kb_id = req:param("id")
    local node_id = req:param("node_id")

    if not kb_id or kb_id == "" or not node_id or node_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "knowledge base id and node id are required" })
        return
    end

    local _, access_err = component.validate_access(kb_id, component.ACCESS.WRITE)
    if access_err then
        local status, classification = http_errors.classify(access_err)
        local msg = classification.kind ~= nil and access_err:message() or tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return
    end

    local comp, comp_err = service:get({ component_id = kb_id })
    if not comp or not comp.success then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = tostring(comp_err or "knowledge base not found") })
        return
    end

    local kb_store, ks_err = node_store, nil
    if not kb_store then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = ks_err })
        return
    end

    local store_row, store_err = kb_store:get_store({ component_id = kb_id })
    if store_err or not store_row then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "store not found" })
        return
    end

    local node, node_err = kb_store:get_node({ store_id = store_row.id :: string, node_id = node_id })
    if node_err or not node then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "node not found" })
        return
    end

    res:set_status(http.STATUS.CONFLICT)
    res:write_json({
        success = false,
        error = raw_delete_error(kb_id, node),
        canonical = node.node_type == "concept" and "kb10.concepts.delete" or "knowledge.content.delete",
    })
end

return { handler = handler }
