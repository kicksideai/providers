-- process is a runtime global (not a declarable module on the http function
-- host); delete_scope's projection signal is the same dispatch pattern.
local http = require("http")
local logger = require("logger")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local node_store = require("node_store")
local kc = require("kc")
local engines = require("engines")
local execution_identity = require("execution_identity")
local enrichment_consts = require("enrichment_consts")

local log = logger:named("kb.api.enrichment")

local MAX_DOCUMENTS = 500

-- POST /kb10/{id}/enrichment — re-run concept-graph enrichment for every document
-- that has no concept categorization yet: the manual recovery handle after a
-- failed placement pass (e.g. an unresolvable model class). Re-dispatches each
-- unplaced document to the enrichment service under the requesting actor's
-- identity and clears the KB's enrichment_error attention flag; a pass that fails
-- again re-raises the flag with the fresh reason.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "failed to get http context" end
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

    local _, access_err = component.validate_access(kb_id, component.ACCESS.WRITE)
    if access_err then
        local status, classification = http_errors.classify(access_err)
        local msg = classification.kind ~= nil and access_err:message() or tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local store_row, store_err = node_store:get_store({ component_id = kb_id })
    if store_err or not store_row then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "knowledge base not found: " .. tostring(store_err) })
        return
    end

    local engine = engines.resolve(store_row.kb_type)
    if not (engine and engine.is_graph) then
        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, requested = 0, documents = 0, reason = "knowledge base has no concept graph" })
        return
    end

    local store_id = store_row.id :: string

    local docs, browse_err = node_store:browse_nodes({
        store_id = store_id,
        opts = { node_type = kc.NODE_TYPE.DOCUMENT, limit = MAX_DOCUMENTS },
    })
    if browse_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "browse documents failed: " .. tostring(browse_err) })
        return
    end
    docs = docs or {}

    -- One batched edge query decides placement: a document with an outgoing
    -- categorized_as edge already sits in the concept tree.
    local placed: { [string]: boolean } = {}
    if #docs > 0 then
        local doc_ids: { string } = {}
        for _, doc in ipairs(docs) do
            table.insert(doc_ids, doc.id)
        end
        local out_edges, edges_err = node_store:get_edges_batch({
            store_id = store_id,
            node_ids = doc_ids,
            opts = { direction = "out" },
        })
        if edges_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = "edge lookup failed: " .. tostring(edges_err) })
            return
        end
        for _, edge in ipairs(out_edges or {}) do
            if edge.edge_type == kc.EDGE_TYPE.CATEGORIZED_AS then
                placed[edge.from_node_id] = true
            end
        end
    end

    -- Placement runs deferred in the enrichment service, so it needs the frozen
    -- identity of the requesting actor (same capture tag as ingest-time requests).
    local frozen, capture_err = execution_identity.capture()
    if capture_err or not frozen then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "identity capture failed: " .. tostring(capture_err) })
        return
    end
    local identity_row, row_err = execution_identity.to_row(frozen)
    if row_err or not identity_row then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "identity encode failed: " .. tostring(row_err) })
        return
    end

    local requested = 0
    for _, doc in ipairs(docs) do
        if not placed[doc.id] then
            local sent, send_err = process.send(enrichment_consts.PROCESS, enrichment_consts.TOPIC, {
                store_id = store_id,
                component_id = kb_id,
                document_node_id = doc.id,
                user_id = actor:id(),
                execution_identity = identity_row,
            })
            if send_err or sent == false then
                res:set_status(http.STATUS.INTERNAL_ERROR)
                res:write_json({ success = false, error = "enrichment request failed: " .. tostring(send_err or "process.send failed") })
                return
            end
            requested = requested + 1
        end
    end

    log:info("enrichment retry dispatched", { kb_id = kb_id, requested = requested, documents = #docs })

    -- The retry is in flight: reset the standing attention flag so the surface
    -- reflects the re-run (readers treat the empty value as absent). A pass that
    -- fails again re-raises it.
    local cleared, clear_err = component.set_meta(kb_id :: string, { enrichment_error = "" })
    if not cleared then
        log:warn("failed to reset enrichment attention flag", { kb_id = kb_id, error = tostring(clear_err) })
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, requested = requested, documents = #docs })
end

return { handler = handler }
