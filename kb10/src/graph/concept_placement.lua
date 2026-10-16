local logger = require("logger")
local errors = require("errors")
local flow = require("flow")
local kb_types = require("kb_types")
local node_store = require("node_store")
local placement_tools = require("placement_tools")

local log = logger:named("kb.concept_placement")

type PlacementResult = {
    action: string,
}

type ToolRef = {
    id: string,
    context: {[string]: any},
}

local PLACEMENT_SYSTEM_PROMPT = [[You are a concept taxonomy agent. Your job is to place a document into the right position in a knowledge graph.

Steps:
1. Use BrowseTree to see the current concept structure
2. Analyze where the document best fits based on its title and summary
3. If a matching concept exists, use AttachDocument
4. If no good match exists, use CreateConcept to create one, then AttachDocument
5. You may create nested concepts (subtopics) for finer organization
6. If existing documents are miscategorized after your changes, use MoveDocument to fix them
7. Use GetConceptDocuments to inspect what documents a concept already has

Manual or locked concepts and categorization edges are user-owned. Never rename, move, merge, delete, or recategorize anything marked metadata.manual=true or metadata.locked=true.
You must call AttachDocument exactly once for the target document before finishing.
Do not attach documents to the root concept unless no other option exists.]]

local MAX_ITERATIONS = 10

local function as_string(value: any): string?
    if type(value) == "string" then return value :: string end
    return nil
end

local function run(
    store_id_or_args: any,
    component_id_arg: string?,
    document_node_id_arg: string?,
    embedding_model_arg: string?,
    extraction_model_arg: string?,
    user_id_arg: string?,
    graph_link_depth_arg: number?
): (PlacementResult?, error?)
    local store_id: string? = as_string(store_id_or_args)
    local component_id: string? = component_id_arg
    local document_node_id: string? = document_node_id_arg
    local embedding_model: string? = embedding_model_arg
    local extraction_model: string? = extraction_model_arg
    local user_id: string? = user_id_arg
    local graph_link_depth: number? = graph_link_depth_arg

    if type(store_id_or_args) == "table" then
        local args = store_id_or_args :: { [string]: any }
        store_id = as_string(args.store_id)
        component_id = as_string(args.component_id)
        document_node_id = as_string(args.document_node_id)
        embedding_model = as_string(args.embedding_model)
        extraction_model = as_string(args.extraction_model)
        user_id = as_string(args.user_id)
        graph_link_depth = tonumber(args.graph_link_depth)
    end
    if not store_id or not document_node_id then
        return nil, (errors.new({ message = "store_id and document_node_id required", kind = errors.INVALID }) :: error)
    end

    if not extraction_model or extraction_model == "" then
        return nil, (errors.new({ message = "extraction_model required", kind = errors.INVALID }) :: error)
    end

    local store = node_store

    local doc_node, doc_err = store:get_node({ store_id = store_id, node_id = document_node_id })
    if doc_err then
        return nil, (errors.new({ message = "document node not found: " .. tostring(doc_err), kind = errors.NOT_FOUND }) :: error)
    end

    local locked_reason, lock_err = placement_tools.categorization_lock(store, store_id, document_node_id)
    if lock_err then
        return nil, (errors.new({ message = "reading document categorization failed: " .. tostring(lock_err), kind = errors.INTERNAL }) :: error)
    end
    if locked_reason then
        log:info("concept placement skipped for locked categorization", { store_id = store_id, document_node_id = document_node_id })
        return { action = "locked_categorization_skipped" }, nil
    end

    local meta = (doc_node and doc_node.metadata or {}) :: table
    local title: string = (meta.title or "") :: string

    local summary_text = ""
    local summaries = store:browse_nodes({ store_id = store_id, opts = {
        parent_id = document_node_id,
        node_type = kb_types.NODE_TYPE.SUMMARY,
        limit = 1,
    } })
    if summaries and #summaries > 0 then
        summary_text = summaries[1].content or ""
    end

    if summary_text == "" then
        summary_text = (doc_node.content or ""):sub(1, 2000)
    end

    if summary_text == "" then
        log:warn("no summary available for concept placement", { doc = document_node_id })
        return nil, (errors.new({ message = "no summary content", kind = errors.INVALID }) :: error)
    end

    local concept_context = ""
    local concept_prompt = ""
    if component_id then
        -- A store read failure must surface (as an enrichment error) rather than
        -- silently drop the KB's concept context/prompt, which would place the
        -- document under a degraded, incomplete taxonomy.
        local store_data, store_err = store:get_store({ component_id = component_id })
        if store_err then
            return nil, (errors.new({ message = "load kb store config failed: " .. tostring(store_err), kind = errors.INTERNAL }) :: error)
        end
        if store_data then
            local config = store_data.config or {}
            concept_context = config.concept_context or ""
            concept_prompt = config.concept_prompt or ""
        end
    end

    local additional_prompt = ""
    if concept_context ~= "" then
        additional_prompt = additional_prompt .. "\n\nKnowledge base context: " .. concept_context
    end
    if concept_prompt ~= "" then
        additional_prompt = additional_prompt .. "\n\nAdditional rules:\n" .. concept_prompt
    end

    local user_message = "Place the following document into the concept tree.\n\n"
    if title ~= "" then
        user_message = user_message .. "Document title: " .. title .. "\n\n"
    end
    user_message = user_message .. "Document summary:\n" .. summary_text .. "\n\n"
    user_message = user_message .. "Document node ID: " .. document_node_id
    if additional_prompt ~= "" then
        user_message = user_message .. additional_prompt
    end

    local tool_context: {[string]: any} = {
        graph_store_id = store_id,
        graph_component_id = component_id,
        graph_embedding_model = embedding_model,
        graph_link_depth = graph_link_depth,
    }

    local tools = ({
        { id = kb_types.TOOL_BROWSE_TREE, context = tool_context },
        { id = kb_types.TOOL_CREATE_CONCEPT, context = tool_context },
        { id = kb_types.TOOL_ATTACH_DOCUMENT, context = tool_context },
        { id = kb_types.TOOL_MOVE_DOCUMENT, context = tool_context },
        { id = kb_types.TOOL_GET_CONCEPT_DOCUMENTS, context = tool_context },
        { id = kb_types.TOOL_MERGE_CONCEPT, context = tool_context },
    } :: {ToolRef})

    local result, err = flow.create()
        :with_title("Concept Placement")
        :with_input({ message = user_message })
        :agent(kb_types.AGENT_CONCEPT_PLACEMENT, {
            model = extraction_model,
            arena = {
                prompt = additional_prompt ~= "" and (PLACEMENT_SYSTEM_PROMPT .. additional_prompt) or nil,
                max_iterations = MAX_ITERATIONS,
                tool_calling = "auto",
                tools = tools,
            },
        })
        :run()

    if err then
        log:error("concept placement flow failed", { store_id = store_id, error = err })
        return nil, (errors.new({ message = "placement failed: " .. tostring(err), kind = errors.INTERNAL }) :: error)
    end

    log:info("concept placement complete", {
        store_id = store_id,
        document_node_id = document_node_id,
    })

    return { action = "agent_placement" }, nil
end

return { run = run }
