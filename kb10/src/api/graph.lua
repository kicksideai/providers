local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local node_store = require("node_store")
local kc = require("kc")
local query_params = require("query_params")


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

    -- Enrichment attention flags maintained by the enrichment service on public
    -- meta; the KB surface renders them as a needs-attention state with the reason.
    -- Cleared flags are written as empty values, so empty normalizes to absent.
    local comp_meta = type(comp.meta) == "table" and comp.meta or {}
    local function present(value: any): string?
        if type(value) == "string" and value ~= "" then return value :: string end
        return nil
    end
    local enrichment = {
        error = present(comp_meta.enrichment_error),
        agent_missing = comp_meta.enrichment_agent_missing == true,
        agent_error = present(comp_meta.enrichment_agent_error),
    }

    local kb_store, ks_err = node_store, nil
    if not kb_store then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = ks_err })
        return
    end

    local store_row, store_err = kb_store:get_store({ component_id = kb_id })
    if store_err or not store_row then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "failed to get store: " .. tostring(store_err) })
        return
    end

    local node_id = req:query("node_id")
    local depth, depth_err = query_params.query_int(req, "depth", 2, 1, 10)
    if depth_err then
        query_params.bad_request(res, depth_err)
        return
    end

    -- The full graph carries each concept's summary (stored as the node's content) for the inspector description.
    local taxonomy, taxonomy_err = kb_store:concept_taxonomy({ store_id = store_row.id :: string, include_content = not (node_id and node_id ~= "") })
    if taxonomy_err then
        local conflict = type(taxonomy_err) == "userdata" and (taxonomy_err :: any):kind() == errors.CONFLICT
        res:set_status(conflict and http.STATUS.CONFLICT or http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "load concept taxonomy failed: " .. tostring(taxonomy_err) })
        return
    end
    local root_id = taxonomy.root_id

    if node_id and node_id ~= "" then
        local graph, graph_err = kb_store:graph_traverse({ store_id = store_row.id :: string, start_node_id = node_id, opts = { depth = depth, limit = 100 } })
        if graph_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = "traversal failed: " .. tostring(graph_err) })
            return
        end

        local node_label_map = {}
        for _, n in ipairs(graph.nodes or {}) do
            local meta = n.metadata or {}
            node_label_map[n.id] = meta.label or "Concept"
        end

        local parent_map = {}
        local doc_count_map = {}
        local enriched_edges = {}
        for _, e in ipairs(graph.edges or {}) do
            if e.edge_type == kc.EDGE_TYPE.SUBTOPIC_OF then
                parent_map[e.from_node_id] = e.to_node_id
            end
            if e.edge_type == kc.EDGE_TYPE.CATEGORIZED_AS then
                if not parent_map[e.from_node_id] then
                    parent_map[e.from_node_id] = e.to_node_id
                end
                doc_count_map[e.to_node_id] = (doc_count_map[e.to_node_id] or 0) + 1
            end
            table.insert(enriched_edges, {
                id = e.id,
                from_node_id = e.from_node_id,
                to_node_id = e.to_node_id,
                from_label = node_label_map[e.from_node_id] or e.from_node_id:sub(1, 8),
                to_label = node_label_map[e.to_node_id] or e.to_node_id:sub(1, 8),
                edge_type = e.edge_type,
                weight = e.weight,
            })
        end

        local enriched_nodes = {}
        for _, n in ipairs(graph.nodes or {}) do
            local meta = n.metadata or {}
            table.insert(enriched_nodes, {
                id = n.id,
                label = meta.label or "Concept",
                concept_type = meta.concept_type or "",
                description = n.content or "",
                is_root = n.id == root_id,
                parent_id = parent_map[n.id],
                document_count = doc_count_map[n.id] or 0,
            })
        end

        res:set_status(http.STATUS.OK)
        res:write_json({
            success = true,
            nodes = enriched_nodes,
            edges = enriched_edges,
            enrichment = enrichment,
        })
    else
        local concepts = taxonomy.concepts

        local node_label_map = {}
        for _, c in ipairs(concepts) do
            local meta = c.metadata or {}
            node_label_map[c.id] = meta.label or "Concept"
        end

        local concept_ids = {}
        for _, c in ipairs(concepts) do
            table.insert(concept_ids, c.id)
        end

        local edges = {}
        local doc_count_map = {}
        local parent_map = {}
        local doc_ids = {}

        -- Fetch all in/out edges for the whole concept set in two batched
        -- queries. edges is deduped by id. A store read failure is surfaced as an
        -- error, never rendered as a partial/empty graph.
        local in_edges, in_edges_err = kb_store:get_all_edges_batch({ store_id = store_row.id :: string, node_ids = concept_ids, opts = { direction = "in" } })
        if in_edges_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = "load in-edges failed: " .. tostring(in_edges_err) })
            return
        end
        for _, e in ipairs(in_edges or {}) do
            if not edges[e.id] then
                if e.edge_type == kc.EDGE_TYPE.CATEGORIZED_AS then
                    doc_count_map[e.to_node_id] = (doc_count_map[e.to_node_id] or 0) + 1
                    if not parent_map[e.from_node_id] then
                        parent_map[e.from_node_id] = e.to_node_id
                    end
                    doc_ids[e.from_node_id] = true
                end
                if e.edge_type == kc.EDGE_TYPE.SUBTOPIC_OF then
                    parent_map[e.from_node_id] = e.to_node_id
                end
                edges[e.id] = {
                    id = e.id,
                    from_node_id = e.from_node_id,
                    to_node_id = e.to_node_id,
                    edge_type = e.edge_type,
                    weight = e.weight,
                }
            end
        end

        local out_edges, out_edges_err = kb_store:get_all_edges_batch({ store_id = store_row.id :: string, node_ids = concept_ids, opts = { direction = "out" } })
        if out_edges_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = "load out-edges failed: " .. tostring(out_edges_err) })
            return
        end
        for _, e in ipairs(out_edges or {}) do
            if not edges[e.id] then
                if e.edge_type == kc.EDGE_TYPE.SUBTOPIC_OF then
                    parent_map[e.from_node_id] = e.to_node_id
                end
                edges[e.id] = {
                    id = e.id,
                    from_node_id = e.from_node_id,
                    to_node_id = e.to_node_id,
                    edge_type = e.edge_type,
                    weight = e.weight,
                }
            end
        end

        -- Resolve every linked document node in ONE batch and index it by id, an
        -- O(docs) lookup.
        local doc_id_list: { string } = {}
        for doc_id in pairs(doc_ids) do doc_id_list[#doc_id_list + 1] = doc_id end
        local doc_nodes, doc_nodes_err = kb_store:get_nodes({ store_id = store_row.id :: string, node_ids = doc_id_list })
        if doc_nodes_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = "load document nodes failed: " .. tostring(doc_nodes_err) })
            return
        end
        local doc_by_id: { [string]: any } = {}
        for _, doc_node in ipairs(doc_nodes or {}) do
            doc_by_id[doc_node.id] = doc_node
        end
        for _, did in ipairs(doc_id_list) do
            local doc_node = doc_by_id[did]
            if doc_node then
                local meta = doc_node.metadata or {}
                node_label_map[did] = meta.title or meta.filename or meta.original_filename or meta.source_url or (did :: string):sub(1, 8)
            end
        end

        -- Enrich edges with labels
        local edge_list = {}
        for _, e in pairs(edges) do
            e.from_label = node_label_map[e.from_node_id] or e.from_node_id:sub(1, 8)
            e.to_label = node_label_map[e.to_node_id] or e.to_node_id:sub(1, 8)
            table.insert(edge_list, e)
        end

        local enriched_nodes = {}
        for _, c in ipairs(concepts) do
            local meta = c.metadata or {}
            table.insert(enriched_nodes, {
                id = c.id,
                node_type = kc.NODE_TYPE.CONCEPT,
                label = meta.label or "Concept",
                concept_type = meta.concept_type or "",
                description = c.content or "",
                is_root = c.id == root_id,
                parent_id = parent_map[c.id],
                document_count = doc_count_map[c.id] or 0,
                edge_count = doc_count_map[c.id] or 0,
            })
        end

        for doc_id, _ in pairs(doc_ids) do
            local doc_node = doc_by_id[tostring(doc_id)]
            if doc_node then
                local meta = doc_node.metadata or {}
                table.insert(enriched_nodes, {
                    id = doc_id,
                    node_type = kc.NODE_TYPE.DOCUMENT,
                    label = meta.title or meta.filename or meta.original_filename or meta.source_url or doc_id:sub(1, 8),
                    concept_type = kc.CONCEPT_TYPE.DOCUMENT,
                    description = "",
                    is_root = false,
                    parent_id = parent_map[doc_id],
                    document_count = 0,
                    edge_count = 1,
                })
            end
        end

        res:set_status(http.STATUS.OK)
        res:write_json({
            success = true,
            root_id = root_id,
            nodes = enriched_nodes,
            edges = edge_list,
            enrichment = enrichment,
        })
    end
end

return { handler = handler }
