local logger = require("logger")
local flow = require("flow")
local json = require("json")
local kb_types = require("kb_types")
local node_store = require("node_store")
local engines = require("engines")

-- KB graph treatment: a maintenance pass that folds duplicate / near-duplicate
-- concept nodes so the taxonomy stays clean. Permission-agnostic — reaches the
-- store through the kb_store contract. The trigger is the durable digest
-- projection (which forwards the treatment.requested marker to the enrichment
-- service, the process that holds a system actor for running graph dataflow
-- agents); this library is the agent run. Mirrors digest.lua/concept_placement.lua.
local M = {}

local log = logger:named("kb.treatment")

type TreatmentOptions = {
    force: boolean?,
}

local TREATMENT_SYSTEM_PROMPT = [[You are a knowledge-graph maintenance agent. Your job is to remove duplication from a concept taxonomy so the graph stays clean and useful.

Steps:
1. Call BrowseTree to see the full concept structure (each line shows the label, its id, and how many documents it holds).
2. Identify concepts that mean the SAME topic: exact duplicates and near-duplicates (same idea, different wording, casing or punctuation).
3. For each duplicate group pick ONE canonical concept — prefer the clearest label and the one holding the most documents — and call MergeConcept with from_id = the duplicate and into_id = the canonical. Repeat until the group has one concept.
4. Use GetConceptDocuments to compare what two concepts hold if you are unsure they are the same.
5. Do NOT merge concepts that are genuinely different topics. When in doubt, leave them.

Never merge, move or delete anything marked metadata.manual=true or metadata.locked=true.
Finish when no duplicates remain.]]

local MAX_ITERATIONS = 30

local function store_for_component(component_id: string): (any, any, any)
    if component_id == "" then return nil, nil, nil end
    local row, err = node_store:get_store({ component_id = component_id })
    if err or not row then return nil, nil, nil end
    local engine = engines.resolve(row.kb_type)
    return node_store, row, engine
end

-- run_for_component(component_id, opts?) runs one treatment pass.
-- Only graph-shaped KBs are treated. Auto runs require config.treatment_enabled;
-- opts.force bypasses the toggle (the manual "Run treatment" handle).
function M.run_for_component(component_id: string, opts: TreatmentOptions?)
    opts = opts or {}
    if component_id == "" then log:warn("treatment skipped: component_id required"); return end

    local _, store_row, engine = store_for_component(component_id)
    if not store_row or not engine then
        log:warn("treatment skipped: store/engine unavailable", { kb_id = component_id }); return
    end
    if not engine.is_graph then return end -- only graph-shaped engines have a concept taxonomy

    local config = store_row.config
    if type(config) == "string" then config = json.decode(config) or {} end
    config = engines.apply_default_config(type(config) == "table" and config or {}, engine)

    if not opts.force and config.treatment_enabled ~= true then
        log:debug("treatment skipped: not enabled", { kb_id = component_id }); return
    end

    local store_id = store_row.id or component_id
    local treatment_model = (type(config.treatment_model) == "string" and config.treatment_model ~= "") and config.treatment_model or "class:fast"
    local treatment_prompt = type(config.treatment_prompt) == "string" and config.treatment_prompt or ""

    local tool_context = {
        graph_store_id = store_id,
        graph_embedding_model = store_row.embedding_model,
    }
    local tools = {
        { id = kb_types.TOOL_BROWSE_TREE, context = tool_context },
        { id = kb_types.TOOL_GET_CONCEPT_DOCUMENTS, context = tool_context },
        { id = kb_types.TOOL_MERGE_CONCEPT, context = tool_context },
    }

    log:info("treatment run starting", { kb_id = component_id, model = treatment_model, forced = opts.force == true })
    local _, err = flow.create()
        :with_title("Graph Treatment")
        :with_input({ message = "Review this knowledge graph and merge any duplicate or near-duplicate concepts. Start by calling BrowseTree." })
        :agent(kb_types.AGENT_TREATMENT, {
            model = treatment_model,
            arena = {
                prompt = treatment_prompt ~= "" and (TREATMENT_SYSTEM_PROMPT .. "\n\nAdditional rules:\n" .. treatment_prompt) or nil,
                max_iterations = MAX_ITERATIONS,
                tool_calling = "auto",
                tools = tools,
            },
        })
        :run()
    if err then
        log:error("treatment flow failed", { kb_id = component_id, error = tostring(err) })
        return
    end
    log:info("treatment run complete", { kb_id = component_id })
end

return M
