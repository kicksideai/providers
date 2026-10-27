local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local node_store = require("node_store")
local kc = require("kc")
local uploads = require("uploads")


local function reply_json(res: any, status: any, payload: any)
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(status)
    res:write_json(payload)
end

local function upload_id_from_meta(meta: any): string
    if type(meta) ~= "table" then return "" end
    local upload_id = type(meta.upload_id) == "string" and meta.upload_id or ""
    if upload_id == "" and type(meta.source_ref) == "table" then
        upload_id = type(meta.source_ref.upload_id) == "string" and meta.source_ref.upload_id or ""
    end
    if upload_id:find("[^%w%-%._:]", 1) then return "" end
    return upload_id
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    if not security.actor() then
        reply_json(res, http.STATUS.UNAUTHORIZED, { success = false, error = "authentication required" })
        return
    end

    local kb_id = req:param("id")
    local node_id = req:param("node_id")
    if not kb_id or kb_id == "" or not node_id or node_id == "" then
        reply_json(res, http.STATUS.BAD_REQUEST, { success = false, error = "knowledge base id and node id are required" })
        return
    end

    local _, access_err = component.validate_access(kb_id, component.ACCESS.READ)
    if access_err then
        local status, classification = http_errors.classify(access_err)
        local msg = classification.kind ~= nil and access_err:message() or tostring(access_err or "access denied")
        reply_json(res, status, { success = false, error = msg })
        return
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        reply_json(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return
    end

    local comp, comp_err = service:get({ component_id = kb_id })
    if not comp or not comp.success then
        reply_json(res, http.STATUS.NOT_FOUND, { success = false, error = tostring(comp_err or "knowledge base not found") })
        return
    end

    local kb_store, ks_err = node_store, nil
    if not kb_store then
        reply_json(res, http.STATUS.INTERNAL_ERROR, { success = false, error = ks_err })
        return
    end

    local store_row, store_err = kb_store:get_store({ component_id = kb_id })
    if store_err or not store_row then
        reply_json(res, http.STATUS.NOT_FOUND, { success = false, error = "store not found" })
        return
    end

    local node, node_err = kb_store:get_node({ store_id = store_row.id, node_id = node_id })
    if node_err or not node then
        reply_json(res, http.STATUS.NOT_FOUND, { success = false, error = "node not found" })
        return
    end
    if node.node_type ~= kc.NODE_TYPE.DOCUMENT then
        reply_json(res, http.STATUS.BAD_REQUEST, { success = false, error = "node is not a document" })
        return
    end

    local meta = type(node.metadata) == "table" and node.metadata or {}
    local upload_id = upload_id_from_meta(meta)
    if upload_id == "" then
        reply_json(res, http.STATUS.NOT_FOUND, { success = false, error = "source file is not available" })
        return
    end

    local url, delivery_err = uploads.delivery_url(upload_id, {
        audience = "kb.source",
        expires_in = 300,
    })
    if not url then
        reply_json(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "failed to obtain upload delivery URL: " .. tostring(delivery_err) })
        return
    end

    local fname = meta.original_filename or meta.filename or node_id
    reply_json(res, http.STATUS.OK, {
        success = true,
        url = url,
        filename = type(fname) == "string" and fname or "",
        content_type = type(meta.original_mime_type) == "string" and meta.original_mime_type
            or (type(meta.source_mime) == "string" and meta.source_mime or ""),
    })
end

return { handler = handler }
