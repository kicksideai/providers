local logger = require("logger")
local ctx = require("ctx")
local json = require("json")
local graph_fn = require("graph_fn")
local llm = require("llm")
local kb_types = require("kb_types")
local node_store = require("node_store")
local thread_ingest = require("thread_ingest")
local tool_result = require("tool_result")

local log = logger:named("kb.placement_tools")

local function graph_component_id(): string?
    local component_id = ctx.get("graph_component_id") :: string?
    if type(component_id) == "string" and component_id ~= "" then return component_id end
    return nil
end

local function emit_graph_change(fields: any): error?
    local component_id = graph_component_id()
    if not component_id then return nil end
    local ok, err = thread_ingest.append_graph_change(component_id, fields)
    if not ok then return errors.wrap(err, "graph change event append failed") end
    return nil
end

local kb_vector_dimensions: number? = nil
local function vector_dimensions(): (number?, error?)
    if kb_vector_dimensions then return kb_vector_dimensions, nil end
    local store = node_store
    local dims, err = store:vector_dimensions({})
    if err or not dims then return nil, (errors.new({ message = "vector_dimensions failed: " .. tostring(err), kind = errors.UNAVAILABLE }) :: error) end
    kb_vector_dimensions = dims :: number
    return dims :: number, nil
end

local function metadata_of(value: any): table
    local meta = type(value) == "table" and (value :: any).metadata or value
    if type(meta) == "table" then
        return meta
    end
    if type(meta) == "string" and meta ~= "" then
        local decoded, err = json.decode(meta)
        if not err and type(decoded) == "table" then
            return decoded
        end
    end
    return {}
end

local function locked_meta(meta: any): boolean
    local m = metadata_of(meta)
    return m.locked == true or m.manual == true
end

local function locked_node(node: any): boolean
    return type(node) == "table" and locked_meta(node.metadata) == true
end

-- The reason the document's categorization is locked, or nil when it is free.
local function categorization_lock(store: any, store_id: string, document_node_id: string): (string?, any?)
    local edges, edges_err = store:get_all_edges({ store_id = store_id, node_id = document_node_id,
        opts = { direction = "out", edge_type = kb_types.EDGE_TYPE.CATEGORIZED_AS } })
    if edges_err then return nil, edges_err end
    for _, e in ipairs(edges) do
        if locked_meta(e.metadata) then
            return "document categorization edge is locked", nil
        end
        local target, target_err = store:get_node({ store_id = store_id, node_id = e.to_node_id })
        if target_err then return nil, target_err end
        if locked_node(target) then
            return "document target concept is locked", nil
        end
    end
    return nil, nil
end

local function concept_locked(store: any, store_id: string, concept_id: string): (boolean, any?)
    local concept, err = store:get_node({ store_id = store_id, node_id = concept_id })
    if err then return false, err end
    return locked_node(concept), nil
end

-- Concept identity is the normalized label (lowercased, trimmed, collapsed
-- whitespace). The placement agent re-mints topics across documents because the
-- LLM does not reliably match an existing concept in a large tree; this gives a
-- deterministic key so create_concept can get-or-create instead of duplicating.
local function normalize_label(s: any): string
    local t = type(s) == "string" and (s :: string):lower() or ""
    t = t:gsub("^%s+", ""):gsub("%s+$", ""):gsub("%s+", " ")
    return t
end

type ConceptTreeState = {
    root_id: string?,
    concept_ids: { string },
    nodes_by_id: { [string]: any },
    depth_by_id: { [string]: number },
    non_root_count: number,
}

local function placement_link_depth(): number
    local value = ctx.get("graph_link_depth")
    local n: number? = nil
    if type(value) == "number" then
        n = value
    elseif type(value) == "string" then
        n = tonumber(value)
    end
    if not n or n < 1 then return 3 end
    if n > 8 then return 8 end
    return math.floor(n)
end

local function concept_tree_state(store: any, store_id: string): (ConceptTreeState?, any?)
    local taxonomy, taxonomy_err = store:concept_taxonomy({ store_id = store_id })
    if taxonomy_err then return nil, taxonomy_err end
    local nodes_by_id: { [string]: any } = taxonomy.nodes_by_id
    local parent_by_child: { [string]: string } = taxonomy.parent_by_child
    local root_id: string? = taxonomy.root_id
    local concept_ids: { string } = {}
    for _, concept in ipairs(taxonomy.concepts) do concept_ids[#concept_ids + 1] = concept.id end

    local non_root_count = 0
    for _, id in ipairs(concept_ids) do
        if id ~= root_id then
            non_root_count = non_root_count + 1
        end
    end

    local depth_by_id: { [string]: number } = {}
    if root_id then depth_by_id[root_id] = 0 end
    local function depth_for(id: string, seen: { [string]: boolean }?): number
        local current_depth = depth_by_id[id]
        if current_depth ~= nil then return current_depth end
        local node = nodes_by_id[id]
        if not node then return 0 end
        if id == root_id then
            depth_by_id[id] = 0
            return 0
        end
        local next_seen = seen or {}
        if next_seen[id] then
            depth_by_id[id] = 1
            return 1
        end
        next_seen[id] = true
        local parent_id = parent_by_child[id]
        if not parent_id or parent_id == "" or not nodes_by_id[parent_id] then
            depth_by_id[id] = 1
            return 1
        end
        local depth = depth_for(parent_id, next_seen) + 1
        depth_by_id[id] = depth
        return depth
    end
    for _, id in ipairs(concept_ids) do
        depth_for(id, {})
    end

    return {
        root_id = root_id,
        concept_ids = concept_ids,
        nodes_by_id = nodes_by_id,
        depth_by_id = depth_by_id,
        non_root_count = non_root_count,
    }, nil
end

local function root_document_target_error(state: ConceptTreeState, concept_id: string): string?
    local node = state.nodes_by_id[concept_id]
    if not node then return "target concept not found: " .. tostring(concept_id) end
    if concept_id == state.root_id then
        return "documents cannot be attached to the root concept; create or choose a non-root concept"
    end
    return nil
end

-- Find an existing concept in the store whose normalized label matches. Returns
-- the node (or nil). The root concept is never matched/merged.
local function find_concept_by_label(state: ConceptTreeState, label: string): any?
    local norm = normalize_label(label)
    if norm == "" then return nil end
    for _, id in ipairs(state.concept_ids) do
        local c = state.nodes_by_id[id]
        local cm = metadata_of(c)
        if id ~= state.root_id and normalize_label(cm.label) == norm then return c end
    end
    return nil
end

type CreateConceptArgs = {
    label: string?,
    description: string?,
    parent_id: string?,
}

type AttachDocumentArgs = {
    document_node_id: string?,
    concept_id: string?,
}

type MoveDocumentArgs = {
    document_node_id: string?,
    concept_id: string?,
}

type GetConceptDocumentsArgs = {
    concept_id: string?,
    limit: number?,
    offset: number?,
}

local DEFAULT_PAGE_SIZE = 50
local MAX_PAGE_SIZE = 100
local function page_args(args: table): (number, number)
    local requested_limit = tonumber(args.limit)
    local limit = requested_limit and math.floor(requested_limit) or DEFAULT_PAGE_SIZE
    limit = math.max(1, math.min(limit, MAX_PAGE_SIZE))

    local requested_offset = tonumber(args.offset)
    local offset = requested_offset and math.floor(requested_offset) or 0
    offset = math.max(0, offset)
    return limit, offset
end

local function browse_tree(args: table): (any?, error?)
    local store_id: string? = ctx.get("graph_store_id") :: string?
    if not store_id then return tool_result.domain_error("no store_id in context") end

    local tree, err = graph_fn.fetch_concept_tree({ store_id = store_id })
    if not tree then return nil, err end

    local text: string = tree.tree_text or ""
    if text == "" then
        return "The concept tree is empty (only root exists)."
    end

    return text
end

local function create_concept(args: CreateConceptArgs): any
    local store_id: string? = ctx.get("graph_store_id") :: string?
    local embedding_model: string? = ctx.get("graph_embedding_model") :: string?

    if not store_id then return tool_result.domain_error("no store_id in context") end

    local store = node_store

    local label = args.label
    if not label or label == "" then return tool_result.domain_error("label is required") end
    local description: string = args.description or ""

    -- Get-or-create: if a concept with this (normalized) label already exists,
    -- reuse it and tell the agent to attach the document there instead of minting
    -- a duplicate. This is the deterministic dedup the LLM tree-scan cannot do.
    local state, state_err = concept_tree_state(store, store_id)
    if not state then return nil, state_err end
    local existing = find_concept_by_label(state :: ConceptTreeState, label)
    if existing then
        log:info("concept get-or-create reused existing", { label = label, id = existing.id })
        return { success = true, result = "reused", concept_id = existing.id, label = metadata_of(existing).label or label,
            message = "A topic with this name already exists; do not create a duplicate. Use AttachDocument to attach the document to this concept." }
    end

    local parent_id = args.parent_id
    if not parent_id or parent_id == "" then
        if state.non_root_count > 0 then
            return tool_result.domain_error("parent_id is required once the tree has concepts; choose an existing parent concept or explicitly use root for a top-level topic")
        end
        parent_id = state.root_id
        if not parent_id then
            return tool_result.domain_error("no root concept found, cannot determine parent")
        end
    end
    if not state.nodes_by_id[parent_id] then
        return nil, errors.wrap(parent_id, "parent concept not found")
    end
    local parent_depth = state.depth_by_id[parent_id] or 0
    local child_depth = parent_depth + 1
    local max_depth = placement_link_depth()
    if child_depth > max_depth then
        return tool_result.domain_error(string.format("link depth limit is %d; choose a shallower parent concept", max_depth))
    end

    local node_id, node_err = store:insert_graph_node({ store_id = store_id, node = {
        node_type = kb_types.NODE_TYPE.CONCEPT,
        content = description,
        content_type = "text/plain",
        metadata = {
            label = label,
            concept_type = kb_types.CONCEPT_TYPE.TOPIC,
            external_source = "concept",
            external_id = "concept:" .. normalize_label(label),
        },
    }, parent_edge = {
        to_node_id = parent_id,
        edge_type = kb_types.EDGE_TYPE.SUBTOPIC_OF,
        weight = 1.0,
    } })
    if node_err then return nil, errors.wrap(node_err, "creating concept failed") end

    if embedding_model then
        local embed_str = label
        if description ~= "" then
            embed_str = label .. ": " .. description
        end
        local model_name = graph_fn.resolve_model(embedding_model)
        local dims, dim_err = vector_dimensions()
        if dim_err then
            log:warn("concept embedding skipped, dimensions unavailable", { label = label, error = dim_err })
        else
            local response, embed_err = llm.embed({ embed_str }, {
                model = model_name,
                dimensions = dims,
            })
            if embed_err then
                log:warn("concept embedding failed", { label = label, error = embed_err })
            elseif response.result and #response.result > 0 then
                store:insert_embedding({ store_id = store_id, node_id = node_id, node_type = kb_types.NODE_TYPE.CONCEPT, parent_id = nil, embedding = response.result[1] })
            end
        end
    end

    log:info("concept created via placement tool", { label = label, id = node_id, parent = parent_id })
    local emit_err = emit_graph_change({
        reason = "concept.created",
        node_id = node_id,
        parent_id = parent_id,
        concept_delta = 1,
    })
    if emit_err then return nil, emit_err end

    return { success = true, result = "created", concept_id = node_id, label = label, parent_id = parent_id }
end

local function attach_document(args: AttachDocumentArgs): any
    local store_id: string? = ctx.get("graph_store_id") :: string?
    if not store_id then return tool_result.domain_error("no store_id in context") end

    local store = node_store

    local document_node_id = args.document_node_id
    local concept_id = args.concept_id
    if not document_node_id or not concept_id then
        return tool_result.domain_error("document_node_id and concept_id are required")
    end

    local state, state_err = concept_tree_state(store, store_id)
    if not state then return nil, state_err end
    local root_err = root_document_target_error(state, concept_id)
    if root_err then return tool_result.domain_error(root_err) end

    local existing, existing_err = store:get_all_edges({ store_id = store_id, node_id = document_node_id,
        opts = { direction = "out", edge_type = kb_types.EDGE_TYPE.CATEGORIZED_AS } })
    if existing_err then return nil, errors.wrap(existing_err, "reading document categorization failed") end
    for _, e in ipairs(existing) do
        if e.to_node_id == concept_id then
            return { success = true, result = "unchanged", document_node_id = document_node_id, concept_id = concept_id }
        end
    end

    local _, edge_err = store:insert_edge({ store_id = store_id, edge = {
        from_node_id = document_node_id,
        to_node_id = concept_id,
        edge_type = kb_types.EDGE_TYPE.CATEGORIZED_AS,
        weight = 1.0,
    } })
    if edge_err then return nil, errors.wrap(edge_err, "attaching document failed") end

    log:info("document attached via placement tool", { doc = document_node_id, concept = concept_id })
    local emit_err = emit_graph_change({
        reason = "document.attached",
        document_node_id = document_node_id,
        concept_id = concept_id,
    })
    if emit_err then return nil, emit_err end

    return { success = true, result = "attached", document_node_id = document_node_id, concept_id = concept_id }
end

local function move_document(args: MoveDocumentArgs): any
    local store_id: string? = ctx.get("graph_store_id") :: string?
    if not store_id then return tool_result.domain_error("no store_id in context") end

    local store = node_store

    local document_node_id = args.document_node_id
    local concept_id = args.concept_id
    if not document_node_id or not concept_id then
        return tool_result.domain_error("document_node_id and concept_id are required")
    end

    local state, state_err = concept_tree_state(store, store_id)
    if not state then return nil, state_err end
    local root_err = root_document_target_error(state, concept_id)
    if root_err then return tool_result.domain_error(root_err) end

    local locked_reason, lock_err = categorization_lock(store, store_id, document_node_id)
    if lock_err then return nil, errors.wrap(lock_err, "reading document categorization failed") end
    if locked_reason then return tool_result.domain_error(locked_reason) end
    local target_locked, target_err = concept_locked(store, store_id, concept_id)
    if target_err then return nil, errors.wrap(target_err, "reading target concept failed") end
    if target_locked then
        return tool_result.domain_error("target concept is locked")
    end

    local _, patch_err = store:apply_graph_patch({
        store_id = store_id,
        replace_out_edges = {{
            from_node_id = document_node_id,
            edge_type = kb_types.EDGE_TYPE.CATEGORIZED_AS,
        }},
        insert_edges = {{
            from_node_id = document_node_id,
            to_node_id = concept_id,
            edge_type = kb_types.EDGE_TYPE.CATEGORIZED_AS,
            weight = 1.0,
        }},
    })
    if patch_err then return nil, errors.wrap(patch_err, "moving document failed") end

    log:info("document moved via placement tool", { doc = document_node_id, concept = concept_id })
    local emit_err = emit_graph_change({
        reason = "document.moved",
        document_node_id = document_node_id,
        concept_id = concept_id,
    })
    if emit_err then return nil, emit_err end

    return { success = true, result = "moved", document_node_id = document_node_id, concept_id = concept_id }
end

local function get_concept_documents(args: GetConceptDocumentsArgs): any
    local store_id: string? = ctx.get("graph_store_id") :: string?
    if not store_id then return tool_result.domain_error("no store_id in context") end

    local concept_id = args.concept_id
    if not concept_id then return tool_result.domain_error("concept_id is required") end

    local store = node_store

    local limit, offset = page_args(args)
    local edges, edge_err = store:get_edges({
        store_id = store_id,
        node_id = concept_id,
        opts = {
            direction = "in",
            edge_type = kb_types.EDGE_TYPE.CATEGORIZED_AS,
            limit = limit + 1,
            offset = offset,
        },
    })
    if edge_err then return nil, errors.wrap(edge_err, "fetching documents failed") end
    local documents: { any } = {}
    local scanned = math.min(#(edges or {}), limit)
    for index = 1, scanned do
        local edge = edges[index]
        local doc_node, doc_err = store:get_node({ store_id = store_id, node_id = edge.from_node_id })
        if doc_err then return nil, errors.wrap(doc_err, "fetching document failed") end
        if doc_node then table.insert(documents, doc_node) end
    end

    local has_more = #(edges or {}) > limit
    return { success = true, concept_id = concept_id, documents = documents, offset = offset,
        next_offset = has_more and offset + scanned or nil }
end

type MergeConceptArgs = {
    from_id: string?,
    into_id: string?,
    from_label: string?,
    into_label: string?,
}


-- Merge a duplicate concept (from) into a canonical one (into): re-point every
-- inbound edge (documents categorized into `from`, and child concepts whose
-- subtopic_of points at `from`) onto `into`, then delete `from` (its edges +
-- embedding cascade away). Outbound parent edges are dropped — `into` keeps its
-- own placement. Colliding edges are skipped so the kb10_edges UNIQUE constraint
-- holds. This is the tool the placement/treatment agent uses to fold duplicates.
local function merge_concept(args: MergeConceptArgs): any
    local store_id: string? = ctx.get("graph_store_id") :: string?
    if not store_id then return tool_result.domain_error("no store_id in context") end
    local store = node_store

    local state, state_err = concept_tree_state(store, store_id)
    if not state then return nil, state_err end
    local from_id = args.from_id
    local into_id = args.into_id
    if (not from_id or from_id == "") and args.from_label then
        local from = find_concept_by_label(state :: ConceptTreeState, args.from_label :: string)
        from_id = from and from.id or nil
    end
    if (not into_id or into_id == "") and args.into_label then
        local into = find_concept_by_label(state :: ConceptTreeState, args.into_label :: string)
        into_id = into and into.id or nil
    end
    if not from_id or from_id == "" or not into_id or into_id == "" then
        return tool_result.domain_error("from (from_id/from_label) and into (into_id/into_label) concepts are required")
    end
    if from_id == into_id then return tool_result.domain_error("cannot merge a concept into itself") end

    local from_node, from_err = store:get_node({ store_id = store_id, node_id = from_id })
    if from_err then return nil, errors.wrap(from_err, "reading source concept failed") end
    if not from_node then return nil, errors.wrap(from_id, "source concept not found") end
    if from_id == state.root_id then return tool_result.domain_error("cannot merge a root concept") end
    local into_node, into_err = store:get_node({ store_id = store_id, node_id = into_id })
    if into_err then return nil, errors.wrap(into_err, "reading target concept failed") end
    if not into_node then return nil, errors.wrap(into_id, "target concept not found") end
    if locked_node(from_node) or locked_node(into_node) then
        return tool_result.domain_error("a concept is locked and cannot be merged")
    end
    local descends, descent_err = store:is_descendant({ store_id = store_id, ancestor_id = from_id, node_id = into_id })
    if descent_err then return nil, errors.wrap(descent_err, "reading concept ancestry failed") end
    if descends then return tool_result.domain_error("cannot merge a concept into its own descendant") end

    local function key(f: any, t: any, ty: any): string return tostring(f) .. "|" .. tostring(t) .. "|" .. tostring(ty) end
    local seen: { [string]: boolean } = {}
    local into_in, into_in_err = store:get_all_edges({ store_id = store_id, node_id = into_id, opts = { direction = "in" } })
    if into_in_err then return nil, errors.wrap(into_in_err, "reading target concept edges failed") end
    for _, e in ipairs(into_in) do seen[key(e.from_node_id, e.to_node_id, e.edge_type)] = true end

    local from_in, from_in_err = store:get_all_edges({ store_id = store_id, node_id = from_id, opts = { direction = "in" } })
    if from_in_err then return nil, errors.wrap(from_in_err, "reading source concept edges failed") end
    local insert_edges: { any } = {}
    local moved = 0
    for _, e in ipairs(from_in) do
        if e.from_node_id ~= into_id then
            local k = key(e.from_node_id, into_id, e.edge_type)
            if not seen[k] then
                seen[k] = true
                insert_edges[#insert_edges + 1] = {
                    from_node_id = e.from_node_id,
                    to_node_id = into_id,
                    edge_type = e.edge_type,
                    weight = e.weight or 1.0,
                }
                moved = moved + 1
            end
        end
    end

    local _, patch_err = store:apply_graph_patch({
        store_id = store_id,
        insert_edges = insert_edges,
        delete_node_id = from_id,
    })
    if patch_err then return nil, errors.wrap(patch_err, "merging concepts failed") end

    log:info("concepts merged via tool", { from = from_id, into = into_id, moved = moved })
    local emit_err = emit_graph_change({
        reason = "concept.merged",
        from_id = from_id,
        into_id = into_id,
        concept_delta = -1,
    })
    if emit_err then return nil, emit_err end
    return { success = true, result = "merged", from_id = from_id, into_id = into_id, moved_edges = moved }
end

return {
    browse_tree = browse_tree,
    create_concept = create_concept,
    attach_document = attach_document,
    move_document = move_document,
    get_concept_documents = get_concept_documents,
    merge_concept = merge_concept,
    categorization_lock = categorization_lock,
    _concept_tree_state_for_test = concept_tree_state,
    _metadata_of_for_test = metadata_of,
}
