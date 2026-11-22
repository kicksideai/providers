-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local kb = require("kb_types")
local node_store = require("node_store")
local tools = require("placement_tools")
local uuid = require("uuid")

local Draft = {}
Draft.__index = Draft
local PARENT = kb.EDGE_TYPE.SUBTOPIC_OF
local CATEGORY = kb.EDGE_TYPE.CATEGORIZED_AS
local CONCEPT = kb.NODE_TYPE.CONCEPT
local DOCUMENT = kb.NODE_TYPE.DOCUMENT

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, message = message})
end

local function categorization(edges: {any}, document_id: string): {any}
    local selected = {}
    for _, edge in ipairs(edges) do
        if edge.from_node_id == document_id and edge.edge_type == CATEGORY then selected[#selected + 1] = edge end
    end
    return selected
end

-- Shared taxonomy rendering follows one parent per concept. Refuse malformed
-- branches before they can cause recursion or an exponential rendering walk.
local function check_taxonomy(draft: any): error?
    local parents = {}
    for _, edge in ipairs(draft.edges) do
        local child, parent = draft.nodes[edge.from_node_id], draft.nodes[edge.to_node_id]
        if edge.edge_type == PARENT and child and child.node_type == CONCEPT and parent and parent.node_type == CONCEPT then
            if parents[child.id] then return invalid("placement draft requires one parent per concept") end
            parents[child.id] = parent.id
        end
    end
    local checked = {}
    for _, node in ipairs(draft.concepts) do
        local chain, current = {}, node.id
        while current and not checked[current] do
            if chain[current] then return invalid("placement draft found a cycle in the taxonomy") end
            chain[current] = true
            current = parents[current]
        end
        for id in pairs(chain) do checked[id] = true end
    end
    return nil
end

function Draft.new(snapshot: any): (any?, error?)
    local draft = setmetatable({nodes = snapshot.nodes, concepts = snapshot.concepts, edges = snapshot.edges,
        operations = {}}, Draft)
    local err = check_taxonomy(draft)
    if err then return nil, err end
    local taxonomy, root_err = draft:concept_taxonomy({})
    if root_err then return nil, root_err end
    if not taxonomy.root_id then return nil, invalid("placement draft has no taxonomy root") end
    return draft, nil
end

function Draft:concept_taxonomy(_args: any): (any?, error?)
    return node_store.build_concept_taxonomy(self.concepts, self.edges)
end

function Draft:get_node(args: any): (any?, error?)
    return self.nodes[args.node_id], nil
end

function Draft:get_nodes(args: any): {any}
    local nodes = {}
    for _, id in ipairs(args.node_ids) do
        local node = self.nodes[id]
        if node then nodes[#nodes + 1] = node end
    end
    return nodes
end

local function select_edges(edges: {any}, ids: {[string]: boolean}, opts: any): {any}
    local rows = {}
    local direction = opts.direction
    for _, edge in ipairs(edges) do
        local touches = (direction ~= "out" and ids[edge.to_node_id]) or (direction ~= "in" and ids[edge.from_node_id])
        if touches and (not opts.edge_type or edge.edge_type == opts.edge_type) then rows[#rows + 1] = edge end
    end
    return rows
end

function Draft:get_all_edges_batch(args: any): {any}
    local ids = {}
    for _, id in ipairs(args.node_ids) do ids[id] = true end
    return select_edges(self.edges, ids, args.opts)
end

function Draft:get_all_edges(args: any): {any}
    return select_edges(self.edges, {[args.node_id] = true}, args.opts)
end

function Draft:get_edges(args: any): {any}
    local rows = self:get_all_edges(args)
    local page = {}
    local offset = args.opts.offset or 0
    for index = offset + 1, math.min(#rows, offset + args.opts.limit) do page[#page + 1] = rows[index] end
    return page
end

function Draft:categorized(document_id: string): boolean
    return #categorization(self.edges, document_id) > 0
end

function Draft:insert_graph_node(args: any): (string?, error?)
    local node = args.node
    node.id = uuid.v7()
    if self.nodes[node.id] then return nil, invalid("placement draft generated a duplicate concept ID") end
    self.nodes[node.id] = node
    self.concepts[#self.concepts + 1] = node
    local parent_id = args.parent_edge.to_node_id
    self.edges[#self.edges + 1] = {id = uuid.v7(), from_node_id = node.id, to_node_id = parent_id,
        edge_type = PARENT, metadata = {}}
    local operations = self.operations
    operations[#operations + 1] = {kind = "create_concept", id = node.id, parent_id = parent_id,
        label = node.metadata.label, description = node.content}
    return node.id, nil
end

function Draft:categorize_automatically(args: any): (string?, error?)
    local document_id, concept_id = args.document_node_id, args.concept_id
    local document, concept = self.nodes[document_id], self.nodes[concept_id]
    if not document or document.node_type ~= DOCUMENT or not concept or concept.node_type ~= CONCEPT then
        return nil, invalid("document and target concept must exist in this knowledge base")
    end
    local taxonomy, root_err = self:concept_taxonomy({})
    if root_err then return nil, root_err end
    if taxonomy.root_id == concept_id then
        return nil, invalid("documents cannot be attached to the root concept; create or choose a non-root concept")
    end
    if not args.replace then
        for _, edge in ipairs(categorization(self.edges, document_id)) do
            if edge.to_node_id == concept_id then return "unchanged", nil end
        end
    end
    local reason, lock_err = tools.categorization_lock(self, args.store_id, document_id)
    if lock_err then return nil, lock_err end
    if reason then return nil, invalid(reason) end
    if tools.locked_meta(concept.metadata) then return nil, invalid("target concept is locked") end

    if args.replace then
        local retained = {}
        for _, edge in ipairs(self.edges) do
            if edge.from_node_id ~= document_id or edge.edge_type ~= CATEGORY then retained[#retained + 1] = edge end
        end
        self.edges = retained
    end
    self.edges[#self.edges + 1] = {id = uuid.v7(), from_node_id = document_id, to_node_id = concept_id,
        edge_type = CATEGORY, metadata = {}}
    local operations = self.operations
    operations[#operations + 1] = {kind = args.replace and "move_document" or "attach_document",
        document_node_id = document_id, concept_id = concept_id}
    return args.replace and "moved" or "attached", nil
end

local function is_descendant(edges: {any}, from_id: string, into_id: string): boolean
    local parents = {}
    for _, edge in ipairs(edges) do
        if edge.edge_type == PARENT then
            local list = parents[edge.from_node_id] or {}
            list[#list + 1] = edge.to_node_id
            parents[edge.from_node_id] = list
        end
    end
    local seen, pending = {}, {into_id}
    while #pending > 0 do
        local id = table.remove(pending)
        if id == from_id then return true end
        if not seen[id] then
            seen[id] = true
            for _, parent in ipairs(parents[id] or {}) do pending[#pending + 1] = parent end
        end
    end
    return false
end

local function retarget_edges(draft: any, from_id: string, into_id: string, into_root: boolean): ({any}?, number?, error?)
    local collisions, moved, retained = {}, 0, {}
    for _, edge in ipairs(draft.edges) do
        local source = draft.nodes[edge.from_node_id]
        if edge.from_node_id == from_id or edge.to_node_id == from_id then
            if tools.locked_meta(edge.metadata) or (edge.to_node_id == from_id and source
                and (edge.edge_type == PARENT or edge.edge_type == CATEGORY) and tools.locked_meta(source.metadata)) then
                return nil, nil, invalid("cannot merge a concept with protected relationships or stored child nodes")
            end
        elseif edge.to_node_id == into_id then
            local types = collisions[edge.from_node_id] or {}
            types[edge.edge_type] = true
            collisions[edge.from_node_id] = types
        end
    end
    for _, edge in ipairs(draft.edges) do
        if edge.from_node_id ~= from_id and edge.to_node_id ~= from_id then
            retained[#retained + 1] = edge
        elseif edge.to_node_id == from_id and edge.from_node_id ~= from_id and edge.from_node_id ~= into_id then
            local source = draft.nodes[edge.from_node_id]
            if not source or source.node_type == kb.NODE_TYPE.SUMMARY or source.node_type == kb.NODE_TYPE.CHUNK
                or (source.node_type == DOCUMENT and (edge.edge_type ~= CATEGORY or into_root)) then
                return nil, nil, invalid("merge would produce an invalid graph relationship")
            end
            local types = collisions[edge.from_node_id]
            if not types or not types[edge.edge_type] then
                retained[#retained + 1] = {id = edge.id, from_node_id = edge.from_node_id, to_node_id = into_id,
                    edge_type = edge.edge_type, metadata = edge.metadata}
                moved = moved + 1
            end
        end
    end
    return retained, moved, nil
end

function Draft:merge_concepts(args: any): (any?, error?)
    local from_id, into_id = args.from_id, args.into_id
    local from, into = self.nodes[from_id], self.nodes[into_id]
    if from_id == into_id then return nil, invalid("cannot merge a concept into itself") end
    if not from or from.node_type ~= CONCEPT or not into or into.node_type ~= CONCEPT then
        return nil, invalid("both concepts must exist in this knowledge base")
    end
    local taxonomy, root_err = self:concept_taxonomy({})
    if root_err then return nil, root_err end
    if taxonomy.root_id == from_id then return nil, invalid("cannot merge a root concept") end
    if tools.locked_meta(from.metadata) or tools.locked_meta(into.metadata) then
        return nil, invalid("a concept is locked and cannot be merged")
    end
    if tonumber(from.has_children) == 1 then return nil, invalid("cannot merge a concept with stored child nodes") end
    if is_descendant(self.edges, from_id, into_id) then return nil, invalid("cannot merge a concept into its own descendant") end
    local edges, moved, err = retarget_edges(self, from_id, into_id, taxonomy.root_id == into_id)
    if err then return nil, err end
    self.edges = edges
    self.nodes[from_id] = nil
    for index, concept in ipairs(self.concepts) do
        if concept.id == from_id then table.remove(self.concepts, index); break end
    end
    local operations = self.operations
    operations[#operations + 1] = {kind = "merge_concepts", from_id = from_id, into_id = into_id}
    return {moved_edges = moved}, nil
end

return Draft
