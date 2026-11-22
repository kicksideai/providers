-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local agent_context = require("agent_context")
local agent_registry = require("agent_registry")
local component = require("component")
local draft_store = require("placement_draft")
local json = require("json")
local kb = require("kb_types")
local placement_tools = require("placement_tools")
local prompt = require("prompt")
local registry = require("registry")
local snapshot_store = require("placement_snapshot")
local trim = require("text_trim").trim

local MAX_STEPS = 10
local MAX_MODEL_OUTPUT_TOKENS = 2048
local MAX_CALLS = 20
local MAX_TOOL_RESULT_BYTES = 24000
local MAX_HISTORY_BYTES = 64000
local TOOL_IDS = {kb.TOOL_BROWSE_TREE, kb.TOOL_CREATE_CONCEPT, kb.TOOL_ATTACH_DOCUMENT,
    kb.TOOL_MOVE_DOCUMENT, kb.TOOL_GET_CONCEPT_DOCUMENTS, kb.TOOL_MERGE_CONCEPT}

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, message = message})
end

local function incomplete(message: string): error
    return errors.new({kind = errors.UNAVAILABLE, retryable = true, message = message,
        details = {code = "placement_plan_incomplete"}})
end

local function checked_text(value: any, max_bytes: number): boolean
    return type(value) == "string" and #value <= max_bytes and not value:find("%z")
end

local function identifier(value: any): boolean
    return checked_text(value, 256) and value ~= ""
end

local function check_arguments(schema: table, args: any): string?
    if type(args) ~= "table" then return "tool arguments must be an object" end
    local fields = schema.properties or {}
    for name, value in pairs(args) do
        local field = fields[name]
        if not field then return "unexpected tool argument" end
        if field.type == "string" then
            local limit = name == "description" and 1024 or 256
            if not checked_text(value, limit) then return "invalid string argument: " .. name end
            if name:sub(-3) == "_id" and value == "" then return "empty ID: " .. name end
            if name == "label" and trim(value) == "" then return "label is required" end
        elseif field.type == "integer" then
            if type(value) ~= "number" or value ~= math.floor(value) or value > 4096
                or (field.minimum and value < field.minimum) or (field.maximum and value > field.maximum) then
                return "invalid integer argument: " .. name
            end
        else
            return "unsupported tool argument type"
        end
    end
    for _, name in ipairs(schema.required or {}) do
        if args[name] == nil then return "missing tool argument: " .. name end
    end
    return nil
end

local function load_tools(store_id: string): (table?, table?, error?)
    local refs, tools = {}, {}
    for _, id in ipairs(TOOL_IDS) do
        local entry, err = registry.get(id)
        if err then return nil, nil, err end
        local meta = entry and entry.meta
        local schema = meta and meta.input_schema
        if type(schema) == "string" then
            schema, err = json.decode(schema)
            if err then return nil, nil, err end
        end
        if type(schema) ~= "table" or schema.type ~= "object" or type(meta.llm_alias) ~= "string" then
            return nil, nil, invalid("placement tool registration is incomplete: " .. id)
        end
        tools[meta.llm_alias] = {id = id, schema = schema}
        refs[#refs + 1] = {id = id, context = {graph_store_id = store_id}}
    end
    return refs, tools, nil
end

local function prompt_guidance(config: table): string
    local text = ""
    if type(config.concept_context) == "string" and config.concept_context ~= "" then
        text = text .. "\n\nKnowledge base context: " .. config.concept_context
    end
    if type(config.concept_prompt) == "string" and config.concept_prompt ~= "" then
        text = text .. "\n\nAdditional rules:\n" .. config.concept_prompt
    end
    return text
end

local function encode_result(result: any): (string?, error?)
    if type(result) == "string" then return result, nil end
    return json.encode(result)
end

local function make_plan(args: table, draft: any, action: string): table
    return {version = 1, component_id = args.component_id, store_id = args.store_id,
        document_node_id = args.document_node_id, action = action, operations = draft.operations}
end

local function run_agent(args: table, snapshot: table, draft: any): (table?, error?)
    local summary = snapshot.summary
    if type(summary) ~= "string" or summary == "" then summary = snapshot.document.content end
    if type(summary) ~= "string" or summary == "" then return nil, invalid("no summary content") end
    local title = snapshot.document.metadata.title
    local user_message = "Place the following document into the concept tree.\n\n"
    if type(title) == "string" and title ~= "" then user_message = user_message .. "Document title: " .. title .. "\n\n" end
    user_message = user_message .. "Document summary:\n" .. summary .. "\n\nDocument node ID: " .. args.document_node_id

    local refs, schemas, tools_err = load_tools(args.store_id)
    if tools_err then return nil, tools_err end
    local spec, spec_err = agent_registry.get_by_id(kb.AGENT_CONCEPT_PLACEMENT)
    if not spec then return nil, incomplete("default placement agent is unavailable: " .. tostring(spec_err)) end
    local configured = {}
    for key, value in pairs(spec) do configured[key] = value end
    if type(configured.prompt) ~= "string" then return nil, invalid("default placement agent has no prompt") end
    configured.prompt = configured.prompt .. "\n\nBrowseTree shows a bounded set of concepts. "
        .. "CreateConcept checks exact normalized labels across the knowledge base." .. prompt_guidance(snapshot.config)
    configured.max_tokens = MAX_MODEL_OUTPUT_TOKENS
    configured.delegates = {}
    local context = agent_context.new()
    context:set_active_traits({})
    context:set_active_tools(refs)
    local agent, agent_err = context:load_agent(configured, {model = args.extraction_model})
    if not agent then return nil, incomplete("default placement agent could not load: " .. tostring(agent_err)) end
    local handlers = placement_tools.draft_tools(draft, args.store_id, args.graph_link_depth)
    local conversation = prompt.new():add_user(user_message)
    local attached = false
    local ids = {}
    local calls, bytes = 0, #user_message + #configured.prompt
    for _ = 1, MAX_STEPS do
        local step, step_err = agent:step(conversation, {disable_memory_recall = true})
        if not step then return nil, incomplete("default placement step failed: " .. tostring(step_err)) end
        if step.truncated or step.delegate_calls then return nil, incomplete("default placement returned an incomplete step") end
        local tool_calls = step.tool_calls or {}
        if type(tool_calls) ~= "table" then return nil, invalid("default placement returned malformed tool calls") end
        if #tool_calls == 0 then
            if step.finish_reason == "stop" and attached then
                local categorized, category_err = draft:categorized(args.document_node_id)
                if category_err then return nil, category_err end
                if categorized then return make_plan(args, draft, "planned"), nil end
            end
            return nil, incomplete("default placement did not attach the document")
        end
        if calls + #tool_calls > MAX_CALLS then return nil, incomplete("default placement exceeded the tool call limit") end
        for _, call in ipairs(tool_calls) do
            if type(call) ~= "table" or type(call.name) ~= "string" or type(call.arguments) ~= "table" then
                return nil, invalid("default placement returned malformed tool arguments")
            end
            local selected, handler = schemas[call.name], handlers[call.name]
            if not selected or not handler or call.registry_id ~= selected.id or not identifier(call.id) or ids[call.id] then
                return nil, invalid("default placement returned an unrecognized tool call")
            end
            ids[call.id] = true
            local args_err = check_arguments(selected.schema, call.arguments)
            local result, tool_err
            if args_err then
                result = {success = false, error = args_err}
            elseif call.name == "AttachDocument" and attached and draft:address(call.arguments.document_node_id) == args.document_node_id then
                result = {success = false, error = "the target document was already attached in this plan"}
            else
                result, tool_err = handler(call.arguments)
                if tool_err then return nil, tool_err end
                if call.name == "AttachDocument" and result.success and draft:address(call.arguments.document_node_id) == args.document_node_id then
                    attached = true
                end
            end
            local content, content_err = encode_result(result)
            if content_err then return nil, content_err end
            if not content or #content > MAX_TOOL_RESULT_BYTES then
                return nil, incomplete("default placement exceeded the tool result size limit")
            end
            -- Empty Lua tables encode as arrays. Replay the schema's empty
            -- argument object, while preserving the provider's original call ID.
            local call_args, encode_err = json.encode(call.arguments)
            if encode_err then return nil, encode_err end
            if next(call.arguments) == nil then call_args = "{}" end
            bytes = bytes + #call_args + #content
            if bytes > MAX_HISTORY_BYTES then return nil, incomplete("default placement exceeded the transcript size limit") end
            conversation:add_function_call(call.name, call_args, call.id, {provider_metadata = call.provider_metadata})
            conversation:add_function_result(call.name, content, call.id)
        end
        calls = calls + #tool_calls
    end
    return nil, incomplete("default placement exceeded the model step limit")
end

local function plan(args: any): (table?, error?)
    if type(args) ~= "table" or not identifier(args.store_id) or not identifier(args.component_id)
        or not identifier(args.document_node_id) or not identifier(args.extraction_model) then
        return nil, invalid("store, component, document and extraction model are required")
    end
    local _, access_err = component.validate_access(args.component_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local snapshot, read_err = snapshot_store.input(args.store_id, args.component_id, args.document_node_id)
    if not snapshot then return nil, read_err end
    if snapshot.document.id ~= args.document_node_id then return nil, invalid("document ID did not match the stored ID") end
    local draft = draft_store.new(args.store_id, snapshot)
    local locked, lock_err = placement_tools.categorization_lock(draft, args.store_id, args.document_node_id)
    if lock_err then return nil, lock_err end
    if locked then return make_plan(args, draft, "locked_categorization_skipped"), nil end
    return run_agent(args, snapshot, draft)
end

return {plan = plan}
