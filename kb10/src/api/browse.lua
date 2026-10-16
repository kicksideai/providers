local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local node_store = require("node_store")
local query_params = require("query_params")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component


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
    if not kb_id or kb_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "knowledge base id is required" })
        return
    end

    local _, access_err = component.validate_access(kb_id, component.ACCESS.READ)
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

    local parent_id = req:query("parent_id")
    local node_type = req:query("node_type")
    local include_content = req:query("include_content") == "true"
    local limit, limit_err = query_params.query_int(req, "limit", 50, 1, 500)
    if limit_err then
        query_params.bad_request(res, limit_err)
        return
    end
    local offset, offset_err = query_params.query_int(req, "offset", 0, 0, nil)
    if offset_err then
        query_params.bad_request(res, offset_err)
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
        res:write_json({ success = false, error = "knowledge base not found" })
        return
    end

    -- Targeted single-node read: the wiki reader fetches a DOCUMENT node's
    -- original ingested source by id (document nodes are top-level, so a
    -- parent_id browse cannot reach them). Returns the node with its content.
    local node_id = req:query("node_id")
    if node_id and node_id ~= "" then
        local node, node_err = kb_store:get_node({ store_id = store_row.id, node_id = node_id })
        if node_err or not node then
            res:set_status(http.STATUS.NOT_FOUND)
            res:write_json({ success = false, error = "node not found" })
            return
        end
        local metadata = node.metadata
        if type(metadata) ~= "table" then metadata = {} end
        res:set_status(http.STATUS.OK)
        res:write_json({
            success = true,
            node = {
                id = node.id,
                parent_id = node.parent_id,
                node_type = node.node_type,
                content_type = node.content_type,
                content = node.content,
                metadata = metadata,
                created_at = node.created_at,
                updated_at = node.updated_at,
            },
        })
        return
    end

    -- This endpoint lists the top-level (parent IS NULL) nodes when no parent_id is
    -- given. The store spans all parents for a bare node_type browse, so request
    -- top_level explicitly here to preserve the roots-only contract.
    local browse_parent = (parent_id and parent_id ~= "") and parent_id or nil

    local results, query_err = kb_store:browse_nodes({
        store_id = store_row.id,
        opts = {
            parent_id = browse_parent,
            top_level = browse_parent == nil,
            node_type = (node_type and node_type ~= "") and node_type or nil,
            limit = limit,
            offset = offset,
            include_content = include_content,
        },
    })

    if query_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "browse query failed: " .. tostring(query_err) })
        return
    end

    -- The full match count for this filter, independent of limit/offset, so the UI
    -- can page (A-B of TOTAL) rather than inferring the total from a capped page.
    local total, count_err = kb_store:count_nodes({
        store_id = store_row.id,
        opts = {
            parent_id = browse_parent,
            top_level = browse_parent == nil,
            node_type = (node_type and node_type ~= "") and node_type or nil,
        },
    })
    if count_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "browse count failed: " .. tostring(count_err) })
        return
    end

    local nodes = {}
    for _, row in ipairs(results or {}) do
        local metadata = row.metadata
        if type(metadata) ~= "table" then metadata = {} end

        local node = {
            id = row.id,
            parent_id = row.parent_id,
            node_type = row.node_type,
            content_type = row.content_type,
            metadata = metadata,
            created_at = row.created_at,
            updated_at = row.updated_at
        }

        if include_content then
            node.content = row.content
        end

        table.insert(nodes, node)
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        nodes = nodes,
        count = #nodes,
        total = total
    })
end

return { handler = handler }
end

local default = new()
default.new = new
return default
