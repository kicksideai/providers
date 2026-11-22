-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local kb = require("kb_types")
local ops = require("ops")
local reader = require("placement_reader")
local tools = require("placement_tools")
local text_limits = require("text_limits")
local uuid = require("uuid")

local Draft = {}
Draft.__index = Draft
local PARENT = kb.EDGE_TYPE.SUBTOPIC_OF
local CATEGORY = kb.EDGE_TYPE.CATEGORIZED_AS
local CONCEPT = kb.NODE_TYPE.CONCEPT
local DOCUMENT = kb.NODE_TYPE.DOCUMENT
local MAX_INCIDENT = 128
local MAX_ANCESTORS = 64

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, message = message})
end

local function refused(message: string): (table, nil)
    return {success = false, error = message}, nil
end

function Draft.new(store_id: string, input: table): any
    return setmetatable({store_id = store_id, root_id = input.root_id, postgres = input.postgres,
        nodes = {[input.document.id] = input.document}, removed = {}, added = {}, edge_changes = {},
        hidden_documents = {}, operations = {}, pages = {}}, Draft)
end

function Draft:address(id: string): string?
    if self.postgres then return uuid.format(id) end
    return id
end

function Draft:node(raw_id: string): (any?, error?)
    local id = self:address(raw_id)
    if not id or self.removed[id] then return nil, nil end
    if self.nodes[id] ~= nil then return self.nodes[id] or nil, nil end
    local node, err = reader.node(self.store_id, id, self.postgres)
    if err then return nil, err end
    self.nodes[id] = node or false
    return node, nil
end

function Draft:get_node(args: any): (any?, error?)
    return self:node(args.node_id)
end

function Draft:prime_nodes(edges: {any}): error?
    local ids, seen = {}, {}
    for _, edge in ipairs(edges) do
        local id = edge.from_node_id
        if self.nodes[id] == nil and not self.removed[id] and not seen[id] then
            seen[id] = true
            ids[#ids + 1] = id
        end
    end
    local found, err = reader.nodes(self.store_id, ids, self.postgres)
    if err then return err end
    for _, id in ipairs(ids) do self.nodes[id] = found[id] or false end
    return nil
end

local function edge_in_scope(edge: any, node_id: string, direction: string, edge_type: string?): boolean
    return (direction == "in" and edge.to_node_id == node_id or direction == "out" and edge.from_node_id == node_id)
        and (not edge_type or edge_type == edge.edge_type)
end

function Draft:edges(node_id: string, direction: string, edge_type: string?): ({any}?, error?)
    local stored = {}
    if not self.added[node_id] then
        local err
        stored, err = reader.edges(self.store_id, node_id, self.postgres, direction, edge_type, MAX_INCIDENT + 1)
        if err then return nil, err end
        if #stored > MAX_INCIDENT then return nil, invalid("too many incident relationships for this placement operation") end
    end
    local edges = {}
    for _, edge in ipairs(stored) do
        if self.edge_changes[edge.id] == nil then edges[#edges + 1] = edge end
    end
    for _, edge in pairs(self.edge_changes) do
        if edge and edge_in_scope(edge, node_id, direction, edge_type) then edges[#edges + 1] = edge end
    end
    if #edges > MAX_INCIDENT then return nil, invalid("too many incident relationships for this placement operation") end
    return edges, nil
end

function Draft:get_all_edges(args: any): ({any}?, error?)
    return self:edges(args.node_id, args.opts.direction, args.opts.edge_type)
end

function Draft:categorized(document_id: string): (boolean?, error?)
    local edges, err = self:edges(document_id, "out", CATEGORY)
    if err then return nil, err end
    return #edges > 0, nil
end

function Draft:change_edge(id: string, edge: any, original: any?): ()
    if self.edge_changes[id] == nil and original and original.edge_type == CATEGORY then
        local target = original.to_node_id
        self.hidden_documents[target] = (self.hidden_documents[target] or 0) + 1
    end
    self.edge_changes[id] = edge
    self.pages = {}
end

function Draft:append_edge(from_id: string, into_id: string, edge_type: string): ()
    local id = uuid.v7()
    self:change_edge(id, {id = id, from_node_id = from_id, to_node_id = into_id, edge_type = edge_type, metadata = {}})
end

function Draft:discovery(): ({any}?, boolean?, error?)
    local excluded = {[self.root_id] = true}
    for id in pairs(self.removed) do excluded[id] = true end
    return reader.discovery(self.store_id, excluded, self.postgres)
end

local function safe_label(node: table): string
    local label = node.metadata.label
    if type(label) ~= "string" or label == "" then label = "Untitled" end
    return text_limits.prefix(label, 256)
end

function Draft:browse(): (string?, error?)
    local root, root_err = self:node(self.root_id)
    if root_err then return nil, root_err end
    if not root then return nil, invalid("placement taxonomy root changed") end
    local rows, more, err = self:discovery()
    if err then return nil, err end
    local lines = {"[" .. safe_label(root) .. "] (id=" .. root.id .. ")"}
    local draft_parents = {}
    for _, edge in pairs(self.edge_changes) do
        if edge and edge.edge_type == PARENT then
            local selected = draft_parents[edge.from_node_id]
            if not selected or edge.id < selected.id then draft_parents[edge.from_node_id] = edge end
        end
    end
    local function line(node: table): string
        local lock = tools.locked_meta(node.metadata) and ", locked" or ""
        local draft_parent = draft_parents[node.id]
        local parent_id = draft_parent and draft_parent.to_node_id
            or (node.parent_edge_id and self.edge_changes[node.parent_edge_id] == nil and node.parent_id)
        local parent = parent_id and ", parent=" .. parent_id or ""
        return "  [" .. safe_label(node) .. "] (id=" .. node.id .. parent .. lock .. ")"
    end
    for _, node in ipairs(rows) do lines[#lines + 1] = line(node) end
    for _, op in ipairs(self.operations) do
        if op.kind == "create_concept" and not self.removed[op.id] then lines[#lines + 1] = line(self.nodes[op.id]) end
    end
    if more then lines[#lines + 1] = "More concepts are omitted. CreateConcept checks exact labels across the knowledge base." end
    return table.concat(lines, "\n"), nil
end

function Draft:label(label: string): (table?, error?)
    local key = ops.placement_label_key(label)
    if not key then return nil, nil end
    local excluded = {[self.root_id] = true}
    for id in pairs(self.removed) do excluded[id] = true end
    local stored, err = reader.label(self.store_id, key, excluded, self.postgres)
    if err or stored then return stored, err end
    for _, op in ipairs(self.operations) do
        if op.kind == "create_concept" and not self.removed[op.id]
            and ops.placement_label_key(op.label) == key then return self.nodes[op.id], nil end
    end
    return nil, nil
end

function Draft:parent_depth(id: string): (number?, error?)
    local visited = {}
    local depth = 0
    local current = id
    while current ~= self.root_id do
        if visited[current] or depth >= MAX_ANCESTORS then return nil, invalid("placement ancestry exceeds the read limit") end
        visited[current] = true
        local parents, err = self:edges(current, "out", PARENT)
        if err then return nil, err end
        if #parents == 0 then return depth + 1, nil end
        if #parents > 1 then return nil, invalid("placement draft requires one parent per concept") end
        current = parents[1].to_node_id
        depth = depth + 1
    end
    return depth, nil
end

local function tool_error(err: error): (any?, any?)
    if errors.is(err, errors.INVALID) then return refused(tostring(err)) end
    return nil, err
end

function Draft:create(args: table, max_depth: number): (any?, error?)
    local existing, read_err = self:label(args.label)
    if read_err then return nil, read_err end
    if existing then
        return {success = true, result = "reused", concept_id = existing.id, label = existing.metadata.label,
            message = "A topic with this name already exists. Use AttachDocument to attach the document to this concept."}, nil
    end
    local parent_id = args.parent_id
    if not parent_id then
        local rows, _, err = self:discovery()
        if err then return nil, err end
        local has_concepts = #rows > 0
        for id in pairs(self.added) do
            if not self.removed[id] then has_concepts = true; break end
        end
        if has_concepts then return refused("parent_id is required once the tree has concepts") end
        parent_id = self.root_id
    end
    local parent, parent_err = self:node(parent_id)
    if parent_err then return nil, parent_err end
    if not parent or parent.node_type ~= CONCEPT then return refused("parent concept not found") end
    local depth, depth_err = self:parent_depth(parent.id)
    if depth_err then return tool_error(depth_err) end
    if depth + 1 > max_depth then return refused("link depth limit is " .. tostring(max_depth)) end

    local node = tools.concept_node(args.label, args.description or "")
    node.id = uuid.v7()
    if self.nodes[node.id] then return nil, invalid("placement draft generated a duplicate concept ID") end
    self.nodes[node.id], self.added[node.id] = node, true
    self:append_edge(node.id, parent.id, PARENT)
    local operations = self.operations
    operations[#operations + 1] = {kind = "create_concept", id = node.id, parent_id = parent.id,
        label = node.metadata.label, description = node.content}
    return {success = true, result = "created", concept_id = node.id, parent_id = parent.id, label = args.label}, nil
end

function Draft:categorize_automatically(args: any): (string?, error?)
    local document, doc_err = self:node(args.document_node_id)
    if doc_err then return nil, doc_err end
    local concept, concept_err = self:node(args.concept_id)
    if concept_err then return nil, concept_err end
    if not document or document.node_type ~= DOCUMENT or not concept or concept.node_type ~= CONCEPT then
        return nil, invalid("document and target concept must exist in this knowledge base")
    end
    if self.root_id == concept.id then return nil, invalid("documents cannot be attached to the root concept") end
    local edges, err = self:edges(document.id, "out", CATEGORY)
    if err then return nil, err end
    if not args.replace then
        for _, edge in ipairs(edges) do if edge.to_node_id == concept.id then return "unchanged", nil end end
    end
    local reason, lock_err = tools.categorization_lock(self, self.store_id, document.id)
    if lock_err then return nil, lock_err end
    if reason then return nil, invalid(reason) end
    if tools.locked_meta(concept.metadata) then return nil, invalid("target concept is locked") end
    if args.replace then
        for _, edge in ipairs(edges) do self:change_edge(edge.id, false, edge) end
    end
    self:append_edge(document.id, concept.id, CATEGORY)
    local operations = self.operations
    operations[#operations + 1] = {kind = args.replace and "move_document" or "attach_document",
        document_node_id = document.id, concept_id = concept.id}
    return args.replace and "moved" or "attached", nil
end

function Draft:concept_documents(id: string, limit: number, offset: number): (any?, error?)
    local concept, err = self:node(id)
    if err then return nil, err end
    if not concept or concept.node_type ~= CONCEPT then return refused("concept not found") end
    local pages = self.pages[concept.id] or {}
    local after = pages[offset]
    if offset > 0 and not after then return refused("use next_offset from the previous document page") end
    local rows = {}
    if not self.added[concept.id] then
        rows, err = reader.edges(self.store_id, concept.id, self.postgres, "in", CATEGORY, limit + (self.hidden_documents[concept.id] or 0) + 1, after, true)
        if err then return nil, err end
    end
    local selected = {}
    for _, edge in ipairs(rows) do
        if self.edge_changes[edge.id] == nil then selected[#selected + 1] = edge end
    end
    for _, edge in pairs(self.edge_changes) do
        if edge and edge_in_scope(edge, concept.id, "in", CATEGORY) and (not after or edge.id > after) then
            selected[#selected + 1] = edge
        end
    end
    table.sort(selected, function(left, right) return left.id < right.id end)
    local count = math.min(#selected, limit)
    local ids = {}
    for i = 1, count do ids[i] = selected[i].from_node_id end
    local documents, doc_err = reader.documents(self.store_id, ids, self.postgres)
    if doc_err then return nil, doc_err end
    local result = {}
    for _, document_id in ipairs(ids) do
        if documents[document_id] then result[#result + 1] = documents[document_id] end
    end
    local next_offset
    if #selected > count then
        next_offset = offset + count
        pages[next_offset] = selected[count].id
        self.pages[concept.id] = pages
    end
    return {success = true, concept_id = concept.id, documents = result, offset = offset, next_offset = next_offset}, nil
end

function Draft:is_descendant(from_id: string, into_id: string): (boolean?, error?)
    local seen, pending = {}, {into_id}
    local read = 0
    while #pending > 0 do
        local id = table.remove(pending)
        if id == from_id then return true, nil end
        if not seen[id] then
            seen[id] = true
            read = read + 1
            if read > MAX_ANCESTORS then return nil, invalid("placement ancestry exceeds the read limit") end
            local edges, err = self:edges(id, "out", PARENT)
            if err then return nil, err end
            for _, edge in ipairs(edges) do pending[#pending + 1] = edge.to_node_id end
        end
    end
    return false, nil
end

local function collision_key(edge: any): string
    return edge.from_node_id .. "\0" .. edge.edge_type
end

function Draft:merge(from: table, into: table): (any?, error?)
    if from.id == into.id then return refused("cannot merge a concept into itself") end
    if self.root_id == from.id then return refused("cannot merge a root concept") end
    if tools.locked_meta(from.metadata) or tools.locked_meta(into.metadata) or tonumber(from.has_children) == 1 then
        return refused("cannot merge a concept with protected relationships or stored child nodes")
    end
    local cycle, cycle_err = self:is_descendant(from.id, into.id)
    if cycle_err then return tool_error(cycle_err) end
    if cycle then return refused("cannot merge a concept into its own descendant") end
    local incoming, in_err = self:edges(from.id, "in")
    if in_err then return tool_error(in_err) end
    local outgoing, out_err = self:edges(from.id, "out")
    if out_err then return tool_error(out_err) end
    local node_err = self:prime_nodes(incoming)
    if node_err then return nil, node_err end
    for _, edge in ipairs(outgoing) do
        if tools.locked_meta(edge.metadata) then return refused("cannot merge a concept with protected relationships") end
    end
    local members = {}
    for _, edge in ipairs(incoming) do
        local source = self.nodes[edge.from_node_id]
        if tools.locked_meta(edge.metadata) or (source and (edge.edge_type == PARENT or edge.edge_type == CATEGORY)
            and tools.locked_meta(source.metadata)) then return refused("cannot merge a concept with protected relationships") end
        if edge.from_node_id ~= from.id and edge.from_node_id ~= into.id then
            if not source or source.node_type == kb.NODE_TYPE.SUMMARY or source.node_type == kb.NODE_TYPE.CHUNK
                or (source.node_type == DOCUMENT and (edge.edge_type ~= CATEGORY or into.id == self.root_id)) then
                return refused("merge would produce an invalid graph relationship")
            end
            members[#members + 1] = edge
        end
    end
    local matches = {}
    if not self.added[into.id] then
        local err
        matches, err = reader.edge_matches(self.store_id, into.id, members, self.postgres)
        if err then return nil, err end
    end
    local present = {}
    for key, id in pairs(matches) do if self.edge_changes[id] == nil then present[key] = true end end
    for _, edge in pairs(self.edge_changes) do
        if edge and edge.to_node_id == into.id then present[collision_key(edge)] = true end
    end
    for _, edge in ipairs(outgoing) do self:change_edge(edge.id, false, edge) end
    for _, edge in ipairs(incoming) do self:change_edge(edge.id, false, edge) end
    local moved = 0
    for _, edge in ipairs(members) do
        if not present[collision_key(edge)] then
            self:change_edge(edge.id, {id = edge.id, from_node_id = edge.from_node_id, to_node_id = into.id,
                edge_type = edge.edge_type, metadata = edge.metadata})
            moved = moved + 1
        end
    end
    self.removed[from.id] = true
    local operations = self.operations
    operations[#operations + 1] = {kind = "merge_concepts", from_id = from.id, into_id = into.id}
    return {success = true, result = "merged", from_id = from.id, into_id = into.id, moved_edges = moved}, nil
end

function Draft:resolve_merge(args: any): (any?, error?)
    local from, from_err
    if args.from_id then from, from_err = self:node(args.from_id) else from, from_err = self:label(args.from_label) end
    if from_err then return nil, from_err end
    local into, into_err
    if args.into_id then into, into_err = self:node(args.into_id) else into, into_err = self:label(args.into_label) end
    if into_err then return nil, into_err end
    if not from or from.node_type ~= CONCEPT or not into or into.node_type ~= CONCEPT then
        return refused("both concepts must exist in this knowledge base")
    end
    return self:merge(from, into)
end

return Draft
