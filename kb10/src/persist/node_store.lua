-- kb10 internal node/edge/embedding/graph access surface.
--
-- The taxonomy/graph store operations kb10's own control code (graph enrichment,
-- concept placement, digest, node reader, the /kb10 HTTP APIs) uses to reach its
-- node/edge/embedding store. A colon-callable DTO adapter over the kb10_store
-- facade: every method takes a single DTO and returns (result, error).
--
-- Source content (document/summary/chunk) is materialized only by kb10's own
-- injection pipeline (materializer_store); this surface therefore rejects
-- source-node mutations outright, while taxonomy/graph node/edge writes pass
-- through.

local store = require("store")
local kb10 = require("kb10")

local M = {}
local SOURCE_NODE_TYPES = { document = true, summary = true, chunk = true }
local PAGE_SIZE = 500

M.VECTOR_DIMENSIONS = store.VECTOR_DIMENSIONS

local function arg_table(args: any): kb10.Map
    if type(args) == "table" then return args :: kb10.Map end
    return {}
end

local function trim(value)
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function source_node_type(node_type)
    return type(node_type) == "string" and SOURCE_NODE_TYPES[node_type] == true
end

local function reject_source_mutation(op)
    return nil, op .. " for document/summary/chunk nodes is owned by kb10 source materialization (materializer_store)"
end

-- Node/edge ids are UUID-typed columns. Some SQL drivers return a UUID column as
-- a UUID value rather than a plain string; such a value compares equal with ==
-- but does not hash to the same slot as its string form, so it cannot serve as a
-- table key. This adapter is the canonical id boundary for kb10 control code, so
-- every id-bearing field is coerced to a string on read.
local function normalize_node(row: any)
    if type(row) ~= "table" then return end
    if row.id ~= nil then row.id = tostring(row.id) end
    if row.parent_id ~= nil then row.parent_id = tostring(row.parent_id) end
end

local function normalize_edge(row: any)
    if type(row) ~= "table" then return end
    if row.id ~= nil then row.id = tostring(row.id) end
    if row.from_node_id ~= nil then row.from_node_id = tostring(row.from_node_id) end
    if row.to_node_id ~= nil then row.to_node_id = tostring(row.to_node_id) end
end

local function normalize_nodes(rows: any): any
    if type(rows) == "table" then
        for _, row in ipairs(rows :: { any }) do normalize_node(row) end
    end
    return rows
end

local function normalize_edges(rows: any): any
    if type(rows) == "table" then
        for _, row in ipairs(rows :: { any }) do normalize_edge(row) end
    end
    return rows
end

local function existing_node(args: kb10.NodeLookupArgs): (any, string?)
    local node, err = store.get_node(args.store_id, args.node_id)
    if err then return nil, tostring(err) end
    return node, nil
end

function M:create_store(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.StoreCreateArgs
    return store.create_store(a.component_id, a.embedding_model, a.config, a.opts)
end

function M:get_store(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.ComponentStoreArgs
    return store.get_store(a.component_id)
end

function M:delete_store(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.ComponentStoreArgs
    return store.delete_store(a.component_id)
end

function M:update_config(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.ComponentStoreArgs
    return store.update_config(a.component_id, a.config)
end

function M:get_summaries(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.SummariesArgs
    return store.get_summaries(a.component_ids)
end

function M:list_document_summaries(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.StoreIdArgs
    return store.list_document_summaries(a.store_id)
end

function M:set_descriptions(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.DescriptionsArgs
    return store.set_descriptions(a.store_id, a.auto_summary, a.auto_description)
end

function M:insert_node(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.NodeMutationArgs
    local node = (type(a.node) == "table" and a.node or {}) :: kb10.NodeInput
    if source_node_type(node.node_type) then
        return reject_source_mutation("insert_node")
    end
    return store.insert_node(a.store_id, node)
end

function M:insert_graph_node(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.GraphNodeInsertArgs
    local node = (type(a.node) == "table" and a.node or {}) :: kb10.NodeInput
    if source_node_type(node.node_type) then
        return reject_source_mutation("insert_graph_node")
    end
    return store.insert_graph_node(a.store_id, node, a.parent_edge)
end

function M:update_node(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.NodeMutationArgs
    local node, get_err = existing_node(a)
    if get_err then return nil, get_err end
    if source_node_type(node and node.node_type) then
        return reject_source_mutation("update_node")
    end
    return store.update_node(a.store_id, a.node_id, ({
        metadata = a.metadata,
        content = a.content,
        content_type = a.content_type,
    }) :: kb10.NodePatch)
end

function M:get_node(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.NodeLookupArgs
    local node, err: any = store.get_node(a.store_id, a.node_id)
    normalize_node(node)
    return node, (err :: string?)
end

-- Nodes by id, queried PAGE_SIZE ids at a time so the IN list stays within the
-- engine's bind-parameter limit.
function M:get_nodes(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.NodeBatchArgs
    local node_ids = (a.node_ids or {}) :: { string }
    local rows: { any } = {}
    for first = 1, #node_ids, PAGE_SIZE do
        local ids: { string } = {}
        for index = first, math.min(first + PAGE_SIZE - 1, #node_ids) do ids[#ids + 1] = node_ids[index] end
        local batch, err: any = store.get_nodes(a.store_id, ids)
        if err then return nil, (err :: string?) end
        for _, row in ipairs(batch or {}) do rows[#rows + 1] = row end
    end
    return normalize_nodes(rows), nil
end

-- Whether node_id lies under ancestor_id in the concept taxonomy: walks up the
-- single subtopic_of parent edge of each concept, one lookup per level.
function M:is_descendant(args: any): (boolean, string?)
    local a = arg_table(args)
    local seen: { [string]: boolean } = {}
    local current: string? = trim(a.node_id) ~= "" and tostring(a.node_id) or nil
    local ancestor = tostring(a.ancestor_id)
    while current and not seen[current] do
        if current == ancestor then return true, nil end
        seen[current] = true
        local edges, err: any = store.get_edges(a.store_id, current, { direction = "out", edge_type = kb10.EDGE_TYPE.SUBTOPIC_OF, limit = 1 })
        if err then return false, (err :: string?) end
        local parent = edges and edges[1]
        current = parent and tostring(parent.to_node_id) or nil
    end
    return false, nil
end

function M:browse_nodes(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.BrowseNodesArgs
    local rows, err: any = store.browse_nodes(a.store_id, a.opts)
    return normalize_nodes(rows), (err :: string?)
end

-- Every node matching opts, read page by page.
function M:browse_all_nodes(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.BrowseNodesArgs
    local opts: kb10.Map = {}
    for k, v in pairs((a.opts or {}) :: kb10.Map) do opts[k] = v end
    local rows: { any } = {}
    opts.limit = PAGE_SIZE
    opts.offset = 0
    while true do
        local page, err: any = store.browse_nodes(a.store_id, opts)
        if err then return nil, (err :: string?) end
        for _, row in ipairs(page) do rows[#rows + 1] = row end
        if #page < PAGE_SIZE then return normalize_nodes(rows), nil end
        opts.offset = opts.offset + #page
    end
end

function M:count_nodes(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.BrowseNodesArgs
    return store.count_nodes(a.store_id, a.opts)
end

function M:delete_node(args: any): (any, any?)
    local a = (arg_table(args) :: any) :: kb10.NodeLookupArgs
    local node, get_err = existing_node(a)
    if get_err then return nil, get_err end
    if source_node_type(node and node.node_type) then
        return reject_source_mutation("delete_node")
    end
    -- The store returns (false, err) on a blocked delete (e.g. root concept); this
    -- adapter's convention is nil-on-error, so normalize the falsy result to nil.
    local ok, err = store.delete_node(a.store_id, a.node_id)
    if not ok then return nil, err end
    return ok, nil
end

function M:find_by_external_id(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.ExternalIdArgs
    local rows, err: any = store.find_by_external_id(a.store_id, a.external_source, a.external_id)
    return normalize_nodes(rows), (err :: string?)
end

function M:insert_embedding(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.EmbeddingArgs
    if source_node_type(a.node_type) then
        return reject_source_mutation("insert_embedding")
    end
    return store.insert_embedding(a.store_id, a.node_id, a.node_type, a.parent_id, a.embedding)
end

function M:vector_search(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.VectorSearchArgs
    local rows, err: any = store.vector_search(a.store_id, a.query_vector, a.opts)
    return normalize_nodes(rows), (err :: string?)
end

function M:vector_dimensions(_args: any): (number, string?)
    return store.VECTOR_DIMENSIONS, nil
end

function M:insert_edge(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.EdgeMutationArgs
    return store.insert_edge(a.store_id, a.edge)
end

function M:get_edges(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.EdgeQueryArgs
    local rows, err: any = store.get_edges(a.store_id, a.node_id, a.opts)
    return normalize_edges(rows), (err :: string?)
end

function M:get_edges_batch(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.EdgeBatchQueryArgs
    local rows, err: any = store.get_edges_batch(a.store_id, a.node_ids, a.opts)
    return normalize_edges(rows), (err :: string?)
end

-- The concept taxonomy of a store: every concept, each concept's parent along its
-- subtopic_of edge, and the root. The root is the concept flagged as root; with
-- none flagged it is the single concept without a parent. Several flagged roots,
-- or no flag and several parentless concepts, is an ambiguous taxonomy and an
-- error. A store without concepts has no root.
function M:concept_taxonomy(args: any): (any, any?)
    local a = arg_table(args)
    local concepts, browse_err = self:browse_all_nodes({ store_id = a.store_id, opts = {
        node_type = kb10.NODE_TYPE.CONCEPT, include_content = a.include_content == true,
    } })
    if browse_err then return nil, browse_err end
    local nodes_by_id: { [string]: any } = {}
    local concept_ids: { string } = {}
    for _, concept in ipairs(concepts) do
        nodes_by_id[concept.id] = concept
        concept_ids[#concept_ids + 1] = concept.id
    end
    local edges, edge_err = self:get_all_edges_batch({ store_id = a.store_id, node_ids = concept_ids,
        opts = { direction = "out", edge_type = kb10.EDGE_TYPE.SUBTOPIC_OF } })
    if edge_err then return nil, edge_err end
    local parent_by_child: { [string]: string } = {}
    for _, edge in ipairs(edges) do
        if nodes_by_id[edge.to_node_id] then parent_by_child[edge.from_node_id] = edge.to_node_id end
    end

    local flagged: { string } = {}
    local parentless: { string } = {}
    for _, id in ipairs(concept_ids) do
        if kb10.is_root_metadata(nodes_by_id[id].metadata) then flagged[#flagged + 1] = id end
        if not parent_by_child[id] then parentless[#parentless + 1] = id end
    end
    local root_id: string? = nil
    if #flagged == 1 then
        root_id = flagged[1]
    elseif #flagged > 1 then
        return nil, errors.new({ kind = errors.CONFLICT,
            message = "ambiguous root concept: " .. tostring(#flagged) .. " concepts are flagged as root" })
    elseif #parentless == 1 then
        root_id = parentless[1]
    elseif #concept_ids > 0 then
        return nil, errors.new({ kind = errors.CONFLICT,
            message = "ambiguous root concept: no concept is flagged as root and " .. tostring(#parentless) .. " concepts have no parent" })
    end
    return { concepts = concepts, nodes_by_id = nodes_by_id, parent_by_child = parent_by_child, root_id = root_id }, nil
end

-- Every edge of a node matching opts.direction/opts.edge_type, read page by page.
function M:get_all_edges(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.EdgeQueryArgs
    local base = (a.opts or {}) :: kb10.EdgeQueryOptions
    local rows: { any } = {}
    local offset = 0
    while true do
        local page, err: any = store.get_edges(a.store_id, a.node_id, {
            direction = base.direction, edge_type = base.edge_type, limit = PAGE_SIZE, offset = offset,
        })
        if err then return nil, (err :: string?) end
        for _, row in ipairs(page) do rows[#rows + 1] = row end
        if #page < PAGE_SIZE then return normalize_edges(rows), nil end
        offset = offset + #page
    end
end

-- Every edge touching any of node_ids, matching opts.direction/opts.edge_type.
-- node_ids are queried PAGE_SIZE at a time so the IN list stays within the
-- engine's bind-parameter limit; each id batch is read page by page.
function M:get_all_edges_batch(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.EdgeBatchQueryArgs
    local base = (a.opts or {}) :: kb10.EdgeQueryOptions
    local node_ids = (a.node_ids or {}) :: { string }
    local rows: { any } = {}
    for first = 1, #node_ids, PAGE_SIZE do
        local ids: { string } = {}
        for index = first, math.min(first + PAGE_SIZE - 1, #node_ids) do ids[#ids + 1] = node_ids[index] end
        local offset = 0
        while true do
            local page, err: any = store.get_edges_batch(a.store_id, ids, {
                direction = base.direction, edge_type = base.edge_type, limit = PAGE_SIZE, offset = offset,
            })
            if err then return nil, (err :: string?) end
            for _, row in ipairs(page) do rows[#rows + 1] = row end
            if #page < PAGE_SIZE then break end
            offset = offset + #page
        end
    end
    return normalize_edges(rows), nil
end

function M:delete_edge(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.EdgeMutationArgs
    return store.delete_edge(a.store_id, a.edge_id)
end

function M:apply_graph_patch(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.GraphPatchArgs
    if trim(a.delete_node_id) ~= "" then
        local node, get_err = existing_node({ store_id = a.store_id, node_id = a.delete_node_id })
        if get_err then return nil, get_err end
        if source_node_type(node and node.node_type) then
            return reject_source_mutation("apply_graph_patch")
        end
    end
    return store.apply_graph_patch(a.store_id, {
        delete_edge_ids = a.delete_edge_ids,
        insert_edges = a.insert_edges,
        delete_node_id = a.delete_node_id,
        replace_out_edges = (a :: any).replace_out_edges,
    })
end

function M:graph_traverse(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.GraphTraverseArgs
    local result, err: any = store.graph_traverse(a.store_id, a.start_node_id, a.opts)
    if type(result) == "table" then
        normalize_nodes((result :: any).nodes)
        normalize_edges((result :: any).edges)
    end
    return result, (err :: string?)
end

return M
