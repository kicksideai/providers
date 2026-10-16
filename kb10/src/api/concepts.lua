local http = require("http")
local json = require("json")
local security = require("security")
local logger = require("logger"):named("kb10.concepts")
local component = require("component")
local thread_ingest = require("thread_ingest")
local http_errors = require("http_errors")
local node_store = require("node_store")
local kc = require("kc")


type Map = { [string]: any }

type ApiContext = {
    res: any,
    req: any,
    kb_id: string,
    store: any,
    store_id: string,
    actor_id: string?,
}

type ConceptNode = {
    id: string,
    node_type: string?,
    metadata: Map?,
}

type EdgeRow = {
    id: string,
    from_node_id: string,
    to_node_id: string,
    edge_type: string,
    weight: number?,
}

type ConceptPatch = {
    metadata: Map,
    content: string?,
    content_type: string?,
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function current_actor_id(): string?
    local actor = security.actor()
    if not actor then return nil end
    local id = trim(actor:id())
    if id == "" then return nil end
    return id
end

local function reply(res: any, status: any, payload: any)
    res:set_status(status)
    res:write_json(payload)
end

local function emit_graph_change(ctx: ApiContext, fields: Map): string?
    local ok, err = thread_ingest.append_graph_change(ctx.kb_id, fields)
    if not ok then
        return "graph change event append failed: " .. tostring(err)
    end
    return nil
end

local function parse_body(req: any, required: boolean): (Map?, string?)
    local raw = req:body()
    if type(raw) ~= "string" or raw == "" then
        if required then return nil, "invalid json" end
        return {}
    end
    local body, body_err = json.decode(raw)
    if body_err or type(body) ~= "table" then
        return nil, "invalid json"
    end
    return body :: Map
end

local function api_context(): (ApiContext?, string?)
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end
    res:set_content_type(http.CONTENT.JSON)

    local actor_id = current_actor_id()
    if not actor_id then
        reply(res, http.STATUS.UNAUTHORIZED, { success = false, error = "authentication required" })
        return nil
    end

    local kb_id = trim(req:param("id"))
    if kb_id == "" then
        reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "knowledge base id is required" })
        return nil
    end

    local _, access_err = component.validate_access(kb_id, component.ACCESS.WRITE)
    if access_err then
        local status, classification = http_errors.classify(access_err)
        local msg = classification.kind ~= nil and access_err:message() or tostring(access_err or "access denied")
        reply(res, status, { success = false, error = msg })
        return nil
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return nil
    end

    local comp, comp_err = service:get({ component_id = kb_id })
    if not comp or not comp.success then
        reply(res, http.STATUS.NOT_FOUND, { success = false, error = tostring(comp_err or "knowledge base not found") })
        return nil
    end

    local kb_store, ks_err = node_store, nil
    if not kb_store then
        reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = ks_err })
        return nil
    end

    local store_row, store_err = kb_store:get_store({ component_id = kb_id })
    if store_err or not store_row then
        reply(res, http.STATUS.NOT_FOUND, { success = false, error = "store not found" })
        return nil
    end
    local store_id = trim(store_row.id)
    if store_id == "" then
        reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "store id missing" })
        return nil
    end

    return ({
        res = res,
        req = req,
        kb_id = kb_id,
        store = kb_store,
        store_id = store_id,
        actor_id = actor_id,
    }) :: ApiContext
end

local function get_concept(store: any, store_id: string, node_id: string): (ConceptNode?, any, string?)
    local node, node_err = store:get_node({ store_id = store_id, node_id = node_id })
    if node_err or not node then
        return nil, http.STATUS.NOT_FOUND, "concept not found"
    end
    if node.node_type ~= kc.NODE_TYPE.CONCEPT then
        return nil, http.STATUS.BAD_REQUEST, "node is not a concept"
    end
    return node :: ConceptNode
end

-- The taxonomy root (node_store:concept_taxonomy owns the rule) with the HTTP
-- status for a failure: an ambiguous taxonomy is a conflict.
local function taxonomy_root(store: any, store_id: string): (string?, number?, string?)
    local taxonomy, err = store:concept_taxonomy({ store_id = store_id })
    if err then
        local conflict = type(err) == "userdata" and (err :: any):kind() == errors.CONFLICT
        return nil, conflict and http.STATUS.CONFLICT or http.STATUS.INTERNAL_ERROR, tostring(err)
    end
    return taxonomy.root_id, nil, nil
end

local function incoming_taxonomy_edges(store: any, store_id: string, node_id: string): ({ EdgeRow }?, { EdgeRow }?, string?)
    local edges, edge_err = store:get_all_edges({ store_id = store_id, node_id = node_id, opts = { direction = "in" } })
    if edge_err then return nil, nil, edge_err end
    local child_edges: { EdgeRow } = {}
    local doc_edges: { EdgeRow } = {}
    for _, e in ipairs((type(edges) == "table" and edges or {}) :: { EdgeRow }) do
        if e.edge_type == kc.EDGE_TYPE.SUBTOPIC_OF then
            table.insert(child_edges, e)
        elseif e.edge_type == kc.EDGE_TYPE.CATEGORIZED_AS then
            table.insert(doc_edges, e)
        end
    end
    return child_edges, doc_edges
end

local function user_metadata(ctx: ApiContext): Map
    local meta: Map = { origin = "user", manual = true, locked = true }
    if ctx.actor_id then meta.actor_id = ctx.actor_id end
    return meta
end

local function create_concept()
    local ctx = api_context()
    if not ctx then return end
    local res = ctx.res
    local body, body_err = parse_body(ctx.req, true)
    if body_err then return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = body_err }) end

    local label = trim(body.label)
    if label == "" then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "label is required" })
    end
    local description = trim(body.description)

    local parent_id = trim(body.parent_id)
    if parent_id == "" then
        local root_id, root_status, root_err = taxonomy_root(ctx.store, ctx.store_id)
        if root_err then return reply(res, root_status, { success = false, error = root_err }) end
        if not root_id then return reply(res, http.STATUS.CONFLICT, { success = false, error = "root concept not found" }) end
        parent_id = root_id
    end

    local parent, p_status, p_err = get_concept(ctx.store, ctx.store_id, parent_id)
    if not parent then return reply(res, p_status, { success = false, error = p_err }) end

    local metadata = user_metadata(ctx)
    metadata.label = label
    metadata.concept_type = kc.CONCEPT_TYPE.TOPIC

    local node_id, node_err = ctx.store:insert_graph_node({ store_id = ctx.store_id, node = {
        node_type = kc.NODE_TYPE.CONCEPT,
        content = description,
        content_type = "text/plain",
        metadata = metadata,
    }, parent_edge = {
        to_node_id = parent.id,
        edge_type = kc.EDGE_TYPE.SUBTOPIC_OF,
        weight = 1.0,
        metadata = user_metadata(ctx),
    } })
    if node_err or not node_id then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "create concept failed: " .. tostring(node_err) })
    end

    local emit_err = emit_graph_change(ctx, {
        reason = "concept.created",
        node_id = node_id,
        parent_id = parent_id,
        concept_delta = 1,
    })
    if emit_err then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = emit_err })
    end
    reply(res, http.STATUS.OK, { success = true, node_id = node_id, parent_id = parent_id })
end

local function update_concept()
    local ctx = api_context()
    if not ctx then return end
    local res = ctx.res
    local node_id = trim(ctx.req:param("node_id"))
    if node_id == "" then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "node id is required" })
    end

    local body, body_err = parse_body(ctx.req, true)
    if body_err then return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = body_err }) end

    local node, status, err = get_concept(ctx.store, ctx.store_id, node_id)
    if not node then return reply(res, status, { success = false, error = err }) end

    local patch: ConceptPatch = { metadata = user_metadata(ctx) }
    local changed = false
    if body.label ~= nil then
        local label = trim(body.label)
        if label == "" then
            return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "label cannot be empty" })
        end
        patch.metadata.label = label
        changed = true
    end
    if body.description ~= nil then
        patch.content = trim(body.description)
        patch.content_type = "text/plain"
        changed = true
    end

    if not changed then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "no fields to update" })
    end

    local ok, upd_err = ctx.store:update_node({ store_id = ctx.store_id, node_id = node.id, metadata = patch.metadata, content = patch.content, content_type = patch.content_type })
    if not ok then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "update failed: " .. tostring(upd_err) })
    end

    local emit_err = emit_graph_change(ctx, {
        reason = "concept.updated",
        node_id = node.id,
    })
    if emit_err then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = emit_err })
    end
    reply(res, http.STATUS.OK, { success = true })
end

local function move_concept()
    local ctx = api_context()
    if not ctx then return end
    local res = ctx.res
    local node_id = trim(ctx.req:param("node_id"))
    if node_id == "" then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "node id is required" })
    end

    local body, body_err = parse_body(ctx.req, true)
    if body_err then return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = body_err }) end

    local node, status, err = get_concept(ctx.store, ctx.store_id, node_id)
    if not node then return reply(res, status, { success = false, error = err }) end
    local root_id, root_status, root_err = taxonomy_root(ctx.store, ctx.store_id)
    if root_err then return reply(res, root_status, { success = false, error = root_err }) end
    if node.id == root_id then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "root concept cannot move" })
    end

    local parent_id = trim(body.parent_id)
    if parent_id == "" then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "parent_id is required" })
    end
    if parent_id == node.id then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "concept cannot be its own parent" })
    end

    local parent, p_status, p_err = get_concept(ctx.store, ctx.store_id, parent_id)
    if not parent then return reply(res, p_status, { success = false, error = p_err }) end

    local cycle, cycle_err = ctx.store:is_descendant({ store_id = ctx.store_id, ancestor_id = node.id, node_id = parent.id })
    if cycle_err then return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "cycle check failed: " .. tostring(cycle_err) }) end
    if cycle then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "parent cannot be a descendant of the concept" })
    end

    -- Atomically drop ALL existing parent edges and add the new one in one
    -- transaction (replace_out_edges), instead of deleting a pre-fetched id list
    -- — that race could leave a concept with two parents.
    local _, patch_err = ctx.store:apply_graph_patch({
        store_id = ctx.store_id,
        replace_out_edges = {{
            from_node_id = node.id,
            edge_type = kc.EDGE_TYPE.SUBTOPIC_OF,
        }},
        insert_edges = {{
            from_node_id = node.id,
            to_node_id = parent.id,
            edge_type = kc.EDGE_TYPE.SUBTOPIC_OF,
            weight = 1.0,
            metadata = user_metadata(ctx),
        }},
    })
    if patch_err then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "parent edge update failed: " .. tostring(patch_err) })
    end

    local emit_err = emit_graph_change(ctx, {
        reason = "concept.moved",
        node_id = node.id,
        parent_id = parent.id,
    })
    if emit_err then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = emit_err })
    end
    reply(res, http.STATUS.OK, { success = true })
end

local function delete_concept()
    local ctx = api_context()
    if not ctx then return end
    local res = ctx.res
    local node_id = trim(ctx.req:param("node_id"))
    if node_id == "" then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "node id is required" })
    end

    local body, body_err = parse_body(ctx.req, false)
    if body_err then return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = body_err }) end

    local node, status, err = get_concept(ctx.store, ctx.store_id, node_id)
    if not node then return reply(res, status, { success = false, error = err }) end
    local root_id, root_status, root_err = taxonomy_root(ctx.store, ctx.store_id)
    if root_err then return reply(res, root_status, { success = false, error = root_err }) end
    if node.id == root_id then
        return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "root concept cannot be deleted" })
    end

    local raw_child_edges, raw_doc_edges, edge_err = incoming_taxonomy_edges(ctx.store, ctx.store_id, node.id)
    if edge_err then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "edge scan failed: " .. tostring(edge_err) })
    end
    local child_edges: { EdgeRow } = raw_child_edges or {}
    local doc_edges: { EdgeRow } = raw_doc_edges or {}

    local reassign_to = trim(body.reassign_to_concept_id)
    if reassign_to == "" and ((#child_edges > 0) or (#doc_edges > 0)) then
        return reply(res, http.STATUS.CONFLICT, {
            success = false,
            error = "concept is not empty",
            child_count = #child_edges,
            document_count = #doc_edges,
        })
    end

    local reassign_target = nil
    if reassign_to ~= "" then
        if reassign_to == node.id then
            return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "reassign target cannot be the deleted concept" })
        end
        local target, t_status, t_err = get_concept(ctx.store, ctx.store_id, reassign_to)
        if not target then return reply(res, t_status, { success = false, error = t_err }) end
        local cycle, cycle_err = ctx.store:is_descendant({ store_id = ctx.store_id, ancestor_id = node.id, node_id = target.id })
        if cycle_err then return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "cycle check failed: " .. tostring(cycle_err) }) end
        if cycle then
            return reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "reassign target cannot be a descendant" })
        end
        reassign_target = target
    end

    local delete_edge_ids: { string } = {}
    local insert_edges: { Map } = {}
    if reassign_target then
        for _, e in ipairs(child_edges) do
            table.insert(delete_edge_ids, e.id)
            table.insert(insert_edges, {
                from_node_id = e.from_node_id,
                to_node_id = reassign_target.id,
                edge_type = kc.EDGE_TYPE.SUBTOPIC_OF,
                weight = e.weight or 1.0,
                metadata = user_metadata(ctx),
            })
        end
        for _, e in ipairs(doc_edges) do
            table.insert(delete_edge_ids, e.id)
            table.insert(insert_edges, {
                from_node_id = e.from_node_id,
                to_node_id = reassign_target.id,
                edge_type = kc.EDGE_TYPE.CATEGORIZED_AS,
                weight = e.weight or 1.0,
                metadata = user_metadata(ctx),
            })
        end
    end

    local _, patch_err = ctx.store:apply_graph_patch({
        store_id = ctx.store_id,
        delete_edge_ids = delete_edge_ids,
        insert_edges = insert_edges,
        delete_node_id = node.id,
    })
    if patch_err then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = "delete failed: " .. tostring(patch_err) })
    end

    local emit_err = emit_graph_change(ctx, {
        reason = "concept.deleted",
        node_id = node.id,
        reassign_to_concept_id = reassign_to ~= "" and reassign_to or nil,
        concept_delta = -1,
    })
    if emit_err then
        return reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = emit_err })
    end
    reply(res, http.STATUS.OK, { success = true })
end

return {
    create_concept = create_concept,
    update_concept = update_concept,
    move_concept = move_concept,
    delete_concept = delete_concept,
}
