local logger = require("logger")
local time = require("time")
local channel = require("channel")
local process = require("process")
local errors = require("errors")
local agent_context = require("agent_context")
local treatment = require("treatment")
local kb_types = require("kb_types")
local engines = require("engines")
local node_store = require("node_store")
local execution_identity = require("execution_identity")
local enrichment_consts = require("enrichment_consts")

local log = logger:named("kb.enrichment")
local CONCEPT_PLACEMENT_FUNC = "kickside.kb10.graph:concept_placement"
-- Runs under the KB owner identity to write the enrichment attention flags onto
-- the KB's public component meta; the enrichment process actor has no write grant
-- on the KB.
local ENRICHMENT_STATE_FUNC = "kickside.kb10.graph:enrichment_state"

local function store_for_component(component_id: string): (any, any, any, string?)
    local row, err = node_store:get_store({ component_id = component_id })
    if err or not row then return nil, nil, nil, tostring(err or "knowledge base not found") end
    return node_store, row, engines.resolve(row.kb_type), nil
end

local DEBOUNCE_DELAY = "5s"
-- Treatment (graph dedup) is heavier and per-KB, not per-document, so it coalesces
-- a whole ingest session behind a much larger window than per-document enrichment.
local TREATMENT_DEBOUNCE = "120s"
local MAX_CONTENT_CHARS = 32000

local function frozen_identity(identity_row: any): (any?, string?)
    if type(identity_row) ~= "table" then
        return nil, "execution_identity is required"
    end
    local row = identity_row :: { actor_id: any, actor_context: any }
    local frozen, row_err = execution_identity.from_row(row.actor_id, row.actor_context)
    if row_err or not frozen then
        return nil, "execution identity: " .. tostring(row_err)
    end
    return frozen, nil
end

local function run_concept_placement(store_id: string, component_id: string, document_node_id: string, store_data: any, engine: any, user_id: string?, identity_row: any): (boolean, string?)
    local config = engines.apply_default_config(store_data.config, engine)
    local extraction_model = config.extraction_model :: string?
    local embedding_model = store_data.embedding_model :: string

    local args: { [string]: any } = {
        store_id = store_id,
        component_id = component_id,
        document_node_id = document_node_id,
        embedding_model = embedding_model,
        extraction_model = extraction_model,
        user_id = user_id,
        graph_link_depth = tonumber(config.depth),
    }

    local result, err
    local frozen, frozen_err = frozen_identity(identity_row)
    if not frozen then
        log:error("graph placement missing execution identity", { component_id = component_id, error = tostring(frozen_err) })
        return false, tostring(frozen_err or "execution_identity is required")
    end
    result, err = execution_identity.run_as(frozen, CONCEPT_PLACEMENT_FUNC, args, { deferred_owner = "kickside.kb10.graph:enrichment_service" })

    if err then
        log:error("concept placement failed", { store_id = store_id, error = err })
        return false, tostring(err)
    else
        log:info("concept placement completed", {
            store_id = store_id,
            document_node_id = document_node_id,
            action = result and result.action,
        })
    end

    return true, nil
end

local function run_agent_enrichment(store, store_id, component_id, document_node_id, store_data, user_id, ctx): (boolean, any?)
    local enrichment_agent_id = store_data.enrichment_agent_id
    local embedding_model = store_data.embedding_model

    local doc_node, doc_err = store:get_node({ store_id = store_id, node_id = document_node_id })
    if doc_err then
        log:error("document node not found", { store_id = store_id, node_id = document_node_id, error = doc_err })
        return false, tostring(doc_err)
    end

    local chunks = store:browse_nodes({ store_id = store_id, opts = { parent_id = document_node_id, node_type = kb_types.NODE_TYPE.CHUNK, limit = 200 } })
    local content_parts = {}
    if doc_node.content and doc_node.content ~= "" then
        table.insert(content_parts, doc_node.content)
    else
        for _, chunk in ipairs(chunks) do
            if chunk.content then
                table.insert(content_parts, chunk.content)
            end
        end
    end

    local content = table.concat(content_parts, "\n\n")
    if #content > MAX_CONTENT_CHARS then
        content = content:sub(1, MAX_CONTENT_CHARS)
    end

    if content == "" then
        log:warn("no content to enrich", { store_id = store_id, node_id = document_node_id })
        return false, "no content to enrich"
    end

    local title = ""
    if doc_node.metadata and doc_node.metadata.title then
        title = doc_node.metadata.title
    end

    local agent_ctx = ctx or agent_context.new()

    agent_ctx:add_tools({
        {
            id = kb_types.TOOL_GRAPH_TOOLS,
            context = {
                graph_store_id = store_id,
                graph_embedding_model = embedding_model
            }
        }
    })

    local agent, agent_err = agent_ctx:load_agent("user_agent:" .. enrichment_agent_id)
    if not agent then
        log:error("failed to load enrichment agent", {
            store_id = store_id,
            agent_id = enrichment_agent_id,
            error = agent_err
        })
        -- A NOT_FOUND load failure means the configured enrichment_agent_id no longer
        -- resolves (deleted/unresolvable). The caller detects this kind to fall back to
        -- default placement instead of losing graph enrichment for the KB.
        return false, (errors.new({
            message = "enrichment agent unresolved: " .. tostring(agent_err or enrichment_agent_id),
            kind = errors.NOT_FOUND,
        }) :: any)
    end

    local user_message = "Analyze the following document and extract concepts, entities, and relationships into the knowledge graph.\n\n"
    if title ~= "" then
        user_message = user_message .. "Document: " .. title .. "\n\n"
    end
    user_message = user_message .. content

    agent:add_message({ role = "user", content = user_message })

    local max_iterations = 25
    local iterations = 0

    while iterations < max_iterations do
        iterations = iterations + 1
        local step_result, step_err = agent:step()
        if step_err then
            log:error("agent step failed", { store_id = store_id, iteration = iterations, error = step_err })
            return false, tostring(step_err)
        end
        if not step_result or step_result.done then
            break
        end
    end

    log:info("agent enrichment completed", {
        store_id = store_id,
        document_node_id = document_node_id,
        iterations = iterations
    })

    return true, nil
end

-- set_enrichment_state surfaces the enrichment attention flags on the KB's public
-- component meta (or clears them after a successful pass), so a failed graph pass
-- is visible on the KB surface rather than silently swallowed. The write runs
-- under the KB owner identity (the enrichment process actor holds no grant on the
-- KB). state carries the enrichment_state function's args minus component_id:
-- { error = reason } | { enrichment_agent_id = id } | { clear = "error" | "all" }.
local function set_enrichment_state(component_id: string, state: any, identity_row: any): (boolean?, string?)
    local frozen, frozen_err = frozen_identity(identity_row)
    if not frozen then
        return nil, frozen_err
    end
    local payload: { [string]: any } = { component_id = component_id }
    if type(state) == "table" then
        for key, value in pairs(state :: { [string]: any }) do
            payload[key] = value
        end
    end
    local _, err = execution_identity.run_as(frozen, ENRICHMENT_STATE_FUNC, payload, { deferred_owner = "kickside.kb10.graph:enrichment_service" })
    if err then
        return nil, tostring(err)
    end
    return true, nil
end

local function run_enrichment(store_id: string, component_id: string, document_node_id: string, user_id: string?, identity_row: any, deps: any?): (boolean?, string?)
    deps = type(deps) == "table" and deps or {}
    local load_store = deps.store_for_component or store_for_component
    local run_agent = deps.run_agent_enrichment or run_agent_enrichment
    local run_default = deps.run_concept_placement or run_concept_placement
    local mark_state = deps.set_enrichment_state or set_enrichment_state

    local store, store_data, engine, store_err = load_store(component_id)
    if store_err then
        return nil, store_err
    end

    -- Whether this store gets a concept-graph pass is declared by its engine
    -- (is_graph), resolved from kb_type — not a hardcoded type check, so wiki and
    -- any future graph-shaped engine enrich without editing this guard.
    if not (engine and engine.is_graph) then
        return true, nil
    end

    local enrichment_agent_id = store_data.enrichment_agent_id
    local ok = true
    local err = nil
    local agent_dangling = false
    if enrichment_agent_id and enrichment_agent_id ~= "" then
        ok, err = run_agent(store, store_id, component_id, document_node_id, store_data, user_id)
        -- A deleted/unresolvable custom enrichment agent must not permanently stop
        -- graph enrichment: surface the stale reference on the KB and continue with
        -- the default concept placement instead of the custom agent.
        if not ok and errors.is(err, errors.NOT_FOUND) then
            log:warn("custom enrichment agent unresolved; falling back to default placement", {
                component_id = component_id,
                enrichment_agent_id = enrichment_agent_id,
            })
            agent_dangling = true
            local _, state_err = mark_state(component_id, { enrichment_agent_id = enrichment_agent_id }, identity_row)
            if state_err then return nil, state_err end
            ok, err = run_default(store_id, component_id, document_node_id, store_data, engine, user_id, identity_row)
        end
    else
        ok, err = run_default(store_id, component_id, document_node_id, store_data, engine, user_id, identity_row)
    end
    if not ok then
        log:warn("graph enrichment step failed", { component_id = component_id, error = tostring(err) })
        local _, state_err = mark_state(component_id, { error = tostring(err) }, identity_row)
        if state_err then return nil, tostring(err) .. "; enrichment state: " .. state_err end
        return nil, tostring(err)
    else
        -- A successful pass retires the standing failure flag. The agent-missing
        -- flags persist while the dangling agent reference remains configured; a
        -- pass that ran the configured agent clears them too.
        local _, state_err = mark_state(component_id, { clear = agent_dangling and "error" or "all" }, identity_row)
        if state_err then return nil, state_err end
        return true, nil
    end
end

local function main()
    local registered, reg_err = process.registry.register(enrichment_consts.PROCESS, nil, process.registry.CONSISTENT)
    if not registered then error(reg_err) end

    local events_ch = process.events()
    local msg_ch = process.listen(enrichment_consts.TOPIC, { message = true })

    local pending = {}

    log:info("enrichment service started")

    while true do
        local cases = {
            events_ch:case_receive(),
            msg_ch:case_receive(),
        }

        for _, entry in pairs(pending) do
            cases[#cases + 1] = entry.timer:case_receive()
        end

        local result = channel.select(cases)

        if result.channel == events_ch then
            local event = result.value
            if event.kind == process.event.CANCEL then
                process.unlisten(msg_ch)
                log:info("enrichment service stopping")
                return
            end
        elseif result.channel == msg_ch then
            local data = result.value:payload():data()
            local store_id = type(data.store_id) == "string" and data.store_id or nil
            local component_id = type(data.component_id) == "string" and data.component_id or nil
            local document_node_id = type(data.document_node_id) == "string" and data.document_node_id or nil
            local user_id = type(data.user_id) == "string" and data.user_id or nil

            if data.kind == "treat" then
                -- Graph treatment (dedup): debounce per-KB with a large window so it
                -- runs once per ingest session, not per document.
                local kb = type(component_id) == "string" and component_id or nil
                if kb and kb ~= "" then
                    local key = kb .. ":treat"
                    local entry = pending[key]
                    if entry then
                        entry.timer = time.after(TREATMENT_DEBOUNCE)
                        if data.execution_identity then entry.execution_identity = data.execution_identity end
                    else
                        pending[key] = {
                            timer = time.after(TREATMENT_DEBOUNCE),
                            kind = "treat",
                            store_id = store_id,
                            component_id = kb,
                            user_id = user_id,
                            forced = data.forced == true,
                            execution_identity = data.execution_identity,
                        }
                        log:debug("treatment debounce started", { kb_id = kb })
                    end
                end
            elseif store_id and store_id ~= "" and component_id and component_id ~= "" and document_node_id and document_node_id ~= "" then
                local key = store_id .. ":" .. document_node_id
                local entry = pending[key]
                if entry then
                    entry.timer = time.after(DEBOUNCE_DELAY)
                    if data.execution_identity then entry.execution_identity = data.execution_identity end
                    log:debug("enrichment debounce reset", { store_id = store_id })
                else
                    pending[key] = {
                        timer = time.after(DEBOUNCE_DELAY),
                        kind = "enrich",
                        store_id = store_id,
                        component_id = component_id,
                        document_node_id = document_node_id,
                        user_id = user_id,
                        execution_identity = data.execution_identity,
                    }
                    log:debug("enrichment debounce started", { store_id = store_id })
                end
            end
        else
            for key, entry in pairs(pending) do
                if result.channel == entry.timer then
                    pending[key] = nil
                    if entry.kind == "treat" then
                        log:info("treatment debounce fired", { kb_id = entry.component_id })
                        local kb_id = type(entry.component_id) == "string" and entry.component_id or ""
                        local ok, err = pcall(treatment.run_for_component, kb_id, { force = entry.forced == true })
                        if not ok then
                            log:error("treatment failed", { kb_id = entry.component_id, error = tostring(err) })
                        end
                    else
                        log:info("enrichment debounce fired", { store_id = entry.store_id, document_node_id = entry.document_node_id })
                        local ok, err = run_enrichment( entry.store_id, entry.component_id, entry.document_node_id, entry.user_id, entry.execution_identity)
                        if not ok then
                            log:error("enrichment failed", { store_id = entry.store_id, error = tostring(err) })
                        end
                    end
                    break
                end
            end
        end
    end
end

return {
    main = main,
    _run_concept_placement = run_concept_placement,
    _run_agent_enrichment = run_agent_enrichment,
    _run_enrichment = run_enrichment,
}
