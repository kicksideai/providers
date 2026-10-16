local component = require("component")
local node_store = require("node_store")
local engines = require("engines")

-- Deterministic node/graph access over kb10's internal persist:node_store.
-- Resolves a KB id (a component id) to the store id + engine descriptor, so
-- node reads, browsing, and graph traversal share one resolution path. Node
-- and graph operations are kb10-internal and never cross the
-- kickside.knowledge:kb_store_lifecycle contract seam. Access control is the
-- caller's boundary concern (validate_access); this module is pure resolution.
local M = {}

local function trim(s: any): string
    if type(s) ~= "string" then return "" end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- resolve(kb_id) -> (store_inst, store_id, engine, err). Store-row kb_type is
-- authoritative; access checks live at API/tool boundaries, not inside this
-- graph/read facade.
function M.resolve(kb_id: any): (any, string?, any, any?)
    local id = trim(kb_id)
    if id == "" then
        return nil, nil, nil, errors.new({ message = "knowledge base id is required", kind = errors.INVALID })
    end
    local row, err = node_store:get_store({ component_id = id })
    if err or not row then return nil, nil, nil, err or errors.new({ message = "knowledge base not found", kind = errors.NOT_FOUND }) end
    local store_id = trim(row.id)
    if store_id == "" then return nil, nil, nil, errors.new({ message = "store not found for knowledge base", kind = errors.INTERNAL }) end
    local engine = engines.resolve(row.kb_type)
    return node_store, store_id, engine, nil
end

function M.public_meta(kb_id: any): (any, any?)
    if type(kb_id) ~= "string" or kb_id == "" then
        return nil, errors.new({ message = "knowledge base id is required", kind = errors.INVALID })
    end
    local svc, svc_err = component.get_service()
    if svc_err or not svc then
        return nil, errors.wrap(svc_err or errors.new({ message = "unavailable", kind = errors.UNAVAILABLE }), "component service unavailable")
    end
    local comp, comp_err = svc:get({ component_id = kb_id })
    if not comp or not comp.success then
        return nil, comp_err or errors.new({ message = "knowledge base not found", kind = errors.NOT_FOUND })
    end
    return type(comp.meta) == "table" and comp.meta or {}, nil
end

function M.is_graph(kb_id: any): (boolean, any?)
    local _, _, engine, err = M.resolve(kb_id)
    if err then return false, err end
    return type(engine) == "table" and (engine :: { is_graph: any }).is_graph == true, nil
end

-- Shape a raw store row into a stable node view (the same fields the kb10 browse
-- endpoint exposes), keeping content optional so callers control payload size.
local function shape_node(row: any, with_content: boolean): any
    if type(row) ~= "table" then return nil end
    local r = row :: { [string]: any }
    local metadata = r.metadata
    if type(metadata) ~= "table" then metadata = {} end
    local node: { [string]: any } = {
        id = r.id,
        parent_id = r.parent_id,
        node_type = r.node_type,
        content_type = r.content_type,
        metadata = metadata,
        created_at = r.created_at,
        updated_at = r.updated_at,
    }
    if with_content then node.content = r.content end
    return node
end

M.shape_node = shape_node

-- get_node(kb_id, node_id) -> (node, err). Includes the full content.
function M.get_node(kb_id: any, node_id: any): (any, any?)
    if type(node_id) ~= "string" or node_id == "" then
        return nil, errors.new({ message = "node_id is required", kind = errors.INVALID })
    end
    local store_inst, store_id, _, err = M.resolve(kb_id)
    if err then return nil, err end
    local node, node_err = store_inst:get_node({ store_id = store_id, node_id = node_id })
    if node_err or not node then return nil, node_err or errors.new({ message = "node not found", kind = errors.NOT_FOUND }) end
    return shape_node(node, true), nil
end

-- browse(kb_id, opts) -> (nodes, err). opts: { parent_id?, node_type?, limit?,
-- offset?, include_content? }. nil parent_id lists top-level nodes.
function M.browse(kb_id: any, opts: any): (any, any?)
    local o = (type(opts) == "table") and (opts :: { [string]: any }) or {}
    local store_inst, store_id, _, err = M.resolve(kb_id)
    if err then return nil, err end
    local with_content = o.include_content == true
    -- An omitted parent_id with only a node_type filter spans all parents (so a
    -- node-type browse reaches child summaries/chunks/concepts); top_level is opt-in
    -- for callers that want roots only.
    local results, q_err = store_inst:browse_nodes({
        store_id = store_id,
        opts = {
            parent_id = (type(o.parent_id) == "string" and o.parent_id ~= "") and o.parent_id or nil,
            top_level = o.top_level == true,
            node_type = (type(o.node_type) == "string" and o.node_type ~= "") and o.node_type or nil,
            limit = o.limit,
            offset = o.offset,
            include_content = with_content,
        },
    })
    if q_err then return nil, q_err end
    local nodes: { any } = {}
    for _, row in ipairs((results :: { any }?) or {}) do
        nodes[#nodes + 1] = shape_node(row, with_content)
    end
    return nodes, nil
end

-- concept_doc_counts(kb_id, concept_ids) -> ({[concept_id]=count}, err). How many
-- documents categorize under each concept: counts every categorized_as edge
-- pointing at each concept (no content, no node payload).
function M.concept_doc_counts(kb_id: any, concept_ids: any): (any, any?)
    local ids = (type(concept_ids) == "table") and (concept_ids :: {any}) or {}
    if #ids == 0 then return {}, nil end
    local store_inst, store_id, _, err = M.resolve(kb_id)
    if err then return nil, err end
    local edges, e_err = store_inst:get_all_edges_batch({
        store_id = store_id,
        node_ids = ids,
        opts = { direction = "in", edge_type = "categorized_as" },
    })
    if e_err then return nil, e_err end
    local counts: { [string]: integer } = {}
    for _, raw in ipairs((edges :: {any}?) or {}) do
        local edge = (type(raw) == "table") and (raw :: { to_node_id: any }) or {}
        if type(edge.to_node_id) == "string" then
            local k = edge.to_node_id :: string
            counts[k] = (counts[k] or 0) + 1
        end
    end
    return counts, nil
end

-- graph(kb_id, node_id, opts) -> ({ nodes, edges, truncated }, err). opts: { depth?, limit? }.
-- A start node is required; agents obtain node ids from search or browse first.
function M.graph(kb_id: any, node_id: any, opts: any): (any, any?)
    if type(node_id) ~= "string" or node_id == "" then
        return nil, errors.new({ message = "node_id is required for graph traversal", kind = errors.INVALID })
    end
    local o = (type(opts) == "table") and (opts :: { [string]: any }) or {}
    local store_inst, store_id, _, err = M.resolve(kb_id)
    if err then return nil, err end
    local result, g_err = store_inst:graph_traverse({
        store_id = store_id,
        start_node_id = node_id,
        opts = { depth = o.depth, limit = o.limit },
    })
    if g_err or not result then return nil, g_err or errors.new({ message = "graph traversal failed", kind = errors.INTERNAL }) end
    local nodes: {any} = {}
    for _, node in ipairs(result.nodes or {}) do nodes[#nodes + 1] = shape_node(node, false) end
    result.nodes = nodes
    return result, nil
end

return M
