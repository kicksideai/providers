local logger = require("logger")
local llm = require("llm")
local models = require("models")
local kb_types = require("kb_types")
local node_store = require("node_store")

local log = logger:named("kb.graph")

-- Store seam: production uses the required node_store; a test injects a fake to
-- exercise the store-read failure paths without a live graph store.
local store_impl: any = node_store

-- vector_dimensions is constant; fetched once for the life of the pooled function.
local kb_vector_dimensions: number? = nil
local function vector_dimensions(): (number?, error?)
    if kb_vector_dimensions then return kb_vector_dimensions, nil end
    local store = store_impl
    local dims, err = store:vector_dimensions({})
    if err or not dims then return nil, (errors.new({ message = "vector_dimensions failed: " .. tostring(err), kind = errors.UNAVAILABLE }) :: error) end
    kb_vector_dimensions = dims :: number
    return dims :: number, nil
end

type ModelEntry = {
    name: string,
    class: {string} | string,
    priority: number?,
}

type KbNode = {
    id: string,
    node_type: string,
    content: string?,
    parent_id: string?,
    metadata: {[string]: any}?,
    similarity: number?,
}

type KbEdge = {
    id: string,
    from_node_id: string,
    to_node_id: string,
    edge_type: string,
    weight: number?,
}

type DocInfo = {
    count: number,
    titles: {string},
}

type ConceptTree = {
    tree_text: string,
    root_id: string?,
    node_map: {[string]: KbNode},
    edges: {KbEdge},
    concept_count: number,
}

type ConceptMatch = {
    id: string,
    label: string,
    description: string,
    similarity: number,
    node_type: string,
}

type SummaryMatch = {
    id: string,
    parent_id: string?,
    title: string,
    content: string,
    similarity: number,
    node_type: string,
}

type ChunkResult = {
    id: string,
    content: string,
    parent_id: string?,
    similarity: number?,
    metadata: {[string]: any}?,
    node_type: string?,
}

type RetrievalContext = {
    concepts: {ConceptMatch},
    summaries: {SummaryMatch},
    collected_chunks: {ChunkResult},
    iteration: number,
}

type RetrievalStepResult = {
    done: boolean,
    context: RetrievalContext,
}

type RetrievalStepInput = {
    store_id: string,
    query: string,
    query_embedding: {number},
    model: string?,
    context: RetrievalContext,
    embedding_model: string?,
}

type RetrievalDecision = {
    action: "fetch_subtree" | "fetch_documents" | "get_chunks" | "done",
    concept_id: string?,
    document_id: string?,
    search_query: string?,
}

local RETRIEVAL_STEP_PROMPT = [[User query: "%s"

Current context:
%s

Available actions:
- "fetch_subtree": expand a concept node to see its children
- "fetch_documents": list documents under a concept
- "get_chunks": retrieve relevant chunks from a specific document
- "done": return final results

Choose your next action. If you have enough relevant chunks, choose "done".]]

local RETRIEVAL_STEP_SCHEMA = {
    type = "object",
    properties = {
        action = { type = "string", enum = { "fetch_subtree", "fetch_documents", "get_chunks", "done" } },
        -- Nullable + all-required: strict-schema providers (Claude) reject a
        -- property that is neither required nor nullable. These are conditionally
        -- used per action, so the model returns null when not applicable.
        concept_id = { type = { "string", "null" } },
        document_id = { type = { "string", "null" } },
        search_query = { type = { "string", "null" } },
    },
    required = { "action", "concept_id", "document_id", "search_query" },
    additionalProperties = false,
}

local function resolve_model(name: string?): string?
    if not name or name == "" then return name end
    local class_name = name:match("^class:(.+)")
    if not class_name then return name end
    local all = models.get_all() :: {ModelEntry}
    local best: ModelEntry? = nil
    for _, m in ipairs(all) do
        local classes = m.class or {}
        if type(classes) ~= "table" then classes = { classes } end
        for _, cls in ipairs(classes) do
            if cls == class_name then
                if not best or (m.priority or 0) > (best.priority or 0) then
                    best = m
                end
            end
        end
    end
    return best and best.name or name
end

local function embed_text(text: string, model: string?): ({number}?, error?)
    local dims, dim_err = vector_dimensions()
    if dim_err then return nil, dim_err end
    local response, err = llm.embed({ text }, {
        model = model,
        dimensions = dims,
    })
    if err then return nil, (err :: error) end
    if not response.result or #response.result == 0 then return nil, (errors.new({ message = "empty embedding result", kind = errors.INTERNAL }) :: error) end
    return response.result[1] :: {number}, nil
end

local function build_tree_text(
    nodes: {[string]: KbNode},
    children_by_parent: {[string]: {string}},
    indent: string,
    parent_id: string,
    doc_info: {[string]: DocInfo}
): string
    local parts: {string} = {}
    for _, child_id in ipairs(children_by_parent[parent_id] or {}) do
        local node = nodes[child_id]
        if node then
            local meta = node.metadata or {}
            local label: string = meta.label or "Untitled"
            local desc: string = node.content or ""
            local info = doc_info[child_id]
            local line = indent .. "[" .. label .. "] (id=" .. child_id
            if info and info.count > 0 then
                line = line .. ", docs=" .. info.count
            end
            line = line .. ")"
            if desc ~= "" then
                line = line .. " - " .. desc
            end
            table.insert(parts, line)
            if info and info.titles and #info.titles > 0 then
                for _, t in ipairs(info.titles) do
                    table.insert(parts, indent .. "  * " .. t)
                end
            end
            local subtree = build_tree_text(nodes, children_by_parent, indent .. "  ", child_id, doc_info)
            if subtree ~= "" then
                table.insert(parts, subtree)
            end
        end
    end

    return table.concat(parts, "\n")
end

local function fetch_concept_tree(input: {store_id: string}): (ConceptTree?, error?)
    local store_id = input.store_id
    if not store_id then return nil, (errors.new({ message = "store_id required", kind = errors.INVALID }) :: error) end

    local store = store_impl

    local taxonomy, taxonomy_err = store:concept_taxonomy({ store_id = store_id })
    if taxonomy_err then return nil, (taxonomy_err :: error) end
    local concepts = taxonomy.concepts :: {KbNode}
    local node_map: {[string]: KbNode} = taxonomy.nodes_by_id
    local root_id: string? = taxonomy.root_id

    local concept_ids: {string} = {}
    for _, c in ipairs(concepts) do
        table.insert(concept_ids, c.id)
    end

    local all_edges: {[string]: KbEdge} = {}
    local doc_info: {[string]: DocInfo} = {}

    -- One batched query for all in-edges across the concept set. For an "in" edge
    -- the concept is the to_node_id, so doc_info keys
    -- off e.to_node_id rather than the loop variable.
    local in_edges, in_err = store:get_all_edges_batch({ store_id = store_id, node_ids = concept_ids, opts = { direction = "in" } })
    -- A store read failure must surface as an error, never render as an empty graph.
    if in_err then return nil, (errors.new({ message = "get in-edges failed: " .. tostring(in_err), kind = errors.INTERNAL }) :: error) end
    in_edges = in_edges or {}

    -- Batch-resolve the document nodes referenced by categorized_as edges so a
    -- title lookup is one query, not a get_node per edge. Titles are indexed by
    -- node id for a direct O(1) lookup per edge.
    local doc_id_list: {string} = {}
    for _, e in ipairs(in_edges) do
        if e.edge_type == kb_types.EDGE_TYPE.CATEGORIZED_AS then table.insert(doc_id_list, e.from_node_id :: string) end
    end
    local title_by_id: {[string]: string} = {}
    if #doc_id_list > 0 then
        local fetched, fetch_err = store:get_nodes({ store_id = store_id, node_ids = doc_id_list })
        if fetch_err then return nil, (errors.new({ message = "get document nodes failed: " .. tostring(fetch_err), kind = errors.INTERNAL }) :: error) end
        for _, dn in ipairs((fetched or {}) :: {any}) do
            title_by_id[dn.id :: string] = tostring((dn.metadata or {}).title or "")
        end
    end
    local function title_for(from_id: string): string
        return title_by_id[from_id] or ""
    end

    local children_by_parent: {[string]: {string}} = {}
    for _, e in ipairs(in_edges) do
        if e.edge_type == kb_types.EDGE_TYPE.SUBTOPIC_OF then
            all_edges[e.id] = e
            local parent_id: string = e.to_node_id :: string
            local children = children_by_parent[parent_id]
            if not children then
                children = {}
                children_by_parent[parent_id] = children
            end
            children[#children + 1] = e.from_node_id :: string
        elseif e.edge_type == kb_types.EDGE_TYPE.CATEGORIZED_AS then
            local cid: string = e.to_node_id :: string
            local info = doc_info[cid]
            if not info then
                info = { count = 0, titles = {} }
                doc_info[cid] = info
            end
            info.count = info.count + 1
            local title: string = title_for(e.from_node_id :: string)
            if title ~= "" then
                table.insert(info.titles, title)
            end
        end
    end

    local out_edges, out_err = store:get_all_edges_batch({ store_id = store_id, node_ids = concept_ids, opts = { direction = "out" } })
    if out_err then return nil, (errors.new({ message = "get out-edges failed: " .. tostring(out_err), kind = errors.INTERNAL }) :: error) end
    for _, e in ipairs(out_edges or {}) do
        if e.edge_type == kb_types.EDGE_TYPE.SUBTOPIC_OF then
            all_edges[e.id] = e
        end
    end

    local edge_list: {KbEdge} = {}
    for _, e in pairs(all_edges) do
        table.insert(edge_list, e)
    end

    local tree_text = ""
    if root_id then
        local root_node = node_map[root_id]
        local root_label = "Root"
        if root_node and root_node.metadata then
            root_label = root_node.metadata.label or "Root"
        end
        local root_info = doc_info[root_id]
        tree_text = "[" .. root_label .. "] (id=" .. root_id
        if root_info and root_info.count > 0 then
            tree_text = tree_text .. ", docs=" .. root_info.count
        end
        tree_text = tree_text .. ")\n"
        if root_info and root_info.titles and #root_info.titles > 0 then
            for _, t in ipairs(root_info.titles) do
                tree_text = tree_text .. "  * " .. t .. "\n"
            end
        end
        tree_text = tree_text .. build_tree_text(node_map, children_by_parent, "  ", root_id, doc_info)
    end

    return {
        tree_text = tree_text,
        root_id = root_id,
        node_map = node_map,
        edges = edge_list,
        concept_count = #concepts,
    }, nil
end

local function initial_search(input: {store_id: string, query_embedding: {number}, query: string?}): (RetrievalContext?, error?)
    local store_id = input.store_id
    local query_embedding = input.query_embedding

    if not store_id or not query_embedding then
        return nil, (errors.new({ message = "store_id and query_embedding required", kind = errors.INVALID }) :: error)
    end

    local store = store_impl

    local concept_results_raw, concept_err = store:vector_search({ store_id = store_id, query_vector = query_embedding, opts = {
        limit = 10,
        node_types = { kb_types.NODE_TYPE.CONCEPT },
    } })
    if concept_err then return nil, (errors.new({ message = "concept search failed: " .. tostring(concept_err), kind = errors.INTERNAL }) :: error) end
    local concept_results: {KbNode}? = (concept_results_raw or {}) :: {KbNode}?

    local summary_results_raw, summary_err = store:vector_search({ store_id = store_id, query_vector = query_embedding, opts = {
        limit = 10,
        node_types = { kb_types.NODE_TYPE.SUMMARY },
    } })
    if summary_err then return nil, (errors.new({ message = "summary search failed: " .. tostring(summary_err), kind = errors.INTERNAL }) :: error) end
    local summary_results: {KbNode}? = (summary_results_raw or {}) :: {KbNode}?

    local concept_context: {ConceptMatch} = {}
    for _, c in ipairs(concept_results or {}) do
        local meta = c.metadata or {}
        table.insert(concept_context, {
            id = c.id,
            label = meta.label or "",
            description = c.content or "",
            similarity = c.similarity,
            node_type = kb_types.NODE_TYPE.CONCEPT,
        })
    end

    local summary_context: {SummaryMatch} = {}
    for _, s in ipairs(summary_results or {}) do
        local meta = s.metadata or {}
        table.insert(summary_context, {
            id = s.id,
            parent_id = s.parent_id,
            title = meta.title or "",
            content = (s.content or ""):sub(1, 400),
            similarity = s.similarity,
            node_type = kb_types.NODE_TYPE.SUMMARY,
        })
    end

    return ({
        concepts = concept_context,
        summaries = summary_context,
        collected_chunks = {},
        iteration = 0,
    } :: RetrievalContext), nil
end

local function retrieval_step(input: RetrievalStepInput): (RetrievalStepResult?, error?)
    local store_id = input.store_id
    local query = input.query
    local query_embedding = input.query_embedding
    local model = input.model
    local context = input.context
    local embedding_model = input.embedding_model

    local store = store_impl

    if not model or model == "" then
        return ({ done = true, context = context } :: RetrievalStepResult), nil
    end
    model = resolve_model(model)

    local context_text_parts: {string} = {}

    if context.concepts and #context.concepts > 0 then
        table.insert(context_text_parts, "Matching concepts:")
        for _, c in ipairs(context.concepts) do
            table.insert(context_text_parts, string.format(
                "  [%s] (id=%s, sim=%.3f) - %s",
                c.label, c.id, c.similarity or 0, c.description or ""
            ))
        end
    end

    if context.summaries and #context.summaries > 0 then
        table.insert(context_text_parts, "\nMatching document summaries:")
        for _, s in ipairs(context.summaries) do
            table.insert(context_text_parts, string.format(
                "  [%s] (doc_id=%s, sim=%.3f) - %s",
                s.title, s.parent_id or s.id, s.similarity or 0, s.content or ""
            ))
        end
    end

    if context.collected_chunks and #context.collected_chunks > 0 then
        table.insert(context_text_parts, "\nCollected chunks so far: " .. #context.collected_chunks)
    end

    local context_text = table.concat(context_text_parts, "\n")
    local prompt = string.format(RETRIEVAL_STEP_PROMPT, query, context_text)

    local response, err = llm.structured_output(RETRIEVAL_STEP_SCHEMA, prompt, {
        model = model,
        temperature = 0,
    })

    if err then
        log:error("retrieval step model call failed", { error = err })
        return ({ done = true, context = context } :: RetrievalStepResult), nil
    end

    local decision = response.result :: RetrievalDecision?
    if not decision then
        return ({ done = true, context = context } :: RetrievalStepResult), nil
    end

    if decision.action == "done" then
        return ({ done = true, context = context } :: RetrievalStepResult), nil
    end

    local valid_actions: {[string]: boolean} = {
        fetch_subtree = true,
        fetch_documents = true,
        get_chunks = true,
    }
    if not valid_actions[decision.action] then
        log:warn("unknown retrieval action, terminating", { action = decision.action })
        return ({ done = true, context = context } :: RetrievalStepResult), nil
    end

    if decision.action == "fetch_subtree" and not decision.concept_id then
        log:warn("fetch_subtree without concept_id, skipping")
    elseif decision.action == "fetch_subtree" and decision.concept_id then
        local child_edges, child_edges_err = store:get_edges({ store_id = store_id, node_id = decision.concept_id, opts = { direction = "in", limit = 50 } })
        if child_edges_err then return nil, (errors.new({ message = "get subtree edges failed: " .. tostring(child_edges_err), kind = errors.INTERNAL }) :: error) end
        local child_ids: {string} = {}
        for _, edge in ipairs(child_edges or {}) do
            if edge.edge_type == kb_types.EDGE_TYPE.SUBTOPIC_OF then table.insert(child_ids, edge.from_node_id) end
        end
        if #child_ids > 0 then
            local child_nodes, child_nodes_err = store:get_nodes({ store_id = store_id, node_ids = child_ids })
            if child_nodes_err then return nil, (errors.new({ message = "get subtree nodes failed: " .. tostring(child_nodes_err), kind = errors.INTERNAL }) :: error) end
            for _, child_node in ipairs(child_nodes or {}) do
                if child_node.node_type == kb_types.NODE_TYPE.CONCEPT then
                    local meta = child_node.metadata or {}
                    table.insert(context.concepts, {
                        id = child_node.id,
                        label = meta.label or "",
                        description = child_node.content or "",
                        similarity = 0,
                        node_type = kb_types.NODE_TYPE.CONCEPT,
                    })
                end
            end
        end
    end

    if decision.action == "fetch_documents" and not decision.concept_id then
        log:warn("fetch_documents without concept_id, skipping")
    elseif decision.action == "fetch_documents" and decision.concept_id then
        local doc_edges, doc_edges_err = store:get_edges({ store_id = store_id, node_id = decision.concept_id, opts = { direction = "in", limit = 50 } })
        if doc_edges_err then return nil, (errors.new({ message = "get document edges failed: " .. tostring(doc_edges_err), kind = errors.INTERNAL }) :: error) end
        local doc_node_ids: {string} = {}
        for _, edge in ipairs(doc_edges or {}) do
            if edge.edge_type == kb_types.EDGE_TYPE.CATEGORIZED_AS then table.insert(doc_node_ids, edge.from_node_id) end
        end
        if #doc_node_ids > 0 then
            local doc_nodes, doc_nodes_err = store:get_nodes({ store_id = store_id, node_ids = doc_node_ids })
            if doc_nodes_err then return nil, (errors.new({ message = "get document nodes failed: " .. tostring(doc_nodes_err), kind = errors.INTERNAL }) :: error) end
            for _, doc_node in ipairs(doc_nodes or {}) do
                local meta = doc_node.metadata or {}
                table.insert(context.summaries, {
                    id = doc_node.id,
                    parent_id = doc_node.id,
                    title = meta.title or "",
                    content = (doc_node.content or ""):sub(1, 400),
                    similarity = 0,
                    node_type = kb_types.NODE_TYPE.DOCUMENT,
                })
            end
        end
    end

    if decision.action == "get_chunks" and not decision.document_id then
        log:warn("get_chunks without document_id, skipping")
    elseif decision.action == "get_chunks" and decision.document_id then
        local search_query = decision.search_query or query
        local search_vec = query_embedding

        if search_query ~= query and embedding_model then
            local vec, vec_err = embed_text(search_query, embedding_model)
            if vec_err then
                log:warn("refined query embedding failed, using original", { error = vec_err })
            else
                search_vec = vec
            end
        end

        local chunks_raw, chunks_err = store:vector_search({ store_id = store_id, query_vector = search_vec, opts = {
            limit = 5,
            node_types = { kb_types.NODE_TYPE.CHUNK },
            parent_id = decision.document_id,
        } })
        if chunks_err then return nil, (errors.new({ message = "chunk search failed: " .. tostring(chunks_err), kind = errors.INTERNAL }) :: error) end
        local chunks: {KbNode}? = chunks_raw :: {KbNode}?

        if chunks then
            for _, chunk in ipairs(chunks) do
                table.insert(context.collected_chunks, {
                    id = chunk.id,
                    content = chunk.content or "",
                    parent_id = chunk.parent_id,
                    similarity = chunk.similarity,
                    metadata = chunk.metadata,
                })
            end
        end
    end

    context.iteration = (context.iteration or 0) + 1

    return ({ done = false, context = context } :: RetrievalStepResult), nil
end

return {
    resolve_model = resolve_model,
    embed_text = embed_text,
    fetch_concept_tree = fetch_concept_tree,
    initial_search = initial_search,
    retrieval_step = retrieval_step,
    RETRIEVAL_STEP_SCHEMA = RETRIEVAL_STEP_SCHEMA,
    _set_store = function(s: any) store_impl = s end,
    _reset_store = function() store_impl = node_store end,
}
