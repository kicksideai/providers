-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Agent side of memory: capture of conversation spans into the agent's
-- memory, the pinned soul rendered into the prompt, recall through the
-- wippy.agent:memory provider, the working-summary checkpoint, and the
-- remember / search / forget tools.

local ctx = require("ctx")
local contract = require("contract")
local security = require("security")
local component = require("component")
local types = require("types")
local config = require("memory_config")
local stores = require("memory_stores")
local items = require("memory_items")
local runs = require("memory_runs")
local jobs = require("memory_jobs")
local models = require("memory_models")
local writer = require("memory_writer")
local ledger = require("memory_ledger")
local ops = require("memory_ops")
local recall = require("memory_recall")
local reconcile = require("memory_reconcile")

local M = {}

local RUN_CONTEXT = "wippy.agent:run_context"
local KB_REGISTRY = "kickside.knowledge:knowledge_bases"

-- Messages read on the first capture of a host without a cursor.
local FIRST_CAPTURE_WINDOW = 20
local CAPTURE_CONTEXT_WINDOW = 10
local CAPTURE_CONTEXT_MAX_CHARS = 6000
local CHECKPOINT_SOURCE_MAX_CHARS = 12000
local CHECKPOINT_MAX_TOKENS = 1000
local SEARCH_MAX = 50
local RECALL_KINDS = { types.KIND.FACT, types.KIND.SKILL, types.KIND.LESSON }
local AGENT_SOUL_KINDS = { types.KIND.IDENTITY, types.KIND.RULE, types.KIND.SKILL, types.KIND.LESSON }
local OWNER_SOUL_KINDS = { types.KIND.PROFILE_SLOT, types.KIND.PREFERENCE }

local KIND_ORDER: { [string]: integer } = {
    identity = 1, rule = 2, profile_slot = 3, preference = 4, skill = 5, lesson = 6, fact = 7,
}

-- Configuration ------------------------------------------------------------

local function setting(payload: any, name: string): any
    local value = ctx.get(name)
    if value ~= nil and value ~= "" then return value end
    if type(payload) == "table" and type(payload.context) == "table" then
        value = payload.context[name]
        if value ~= nil and value ~= "" then return value end
    end
    return nil
end

-- memory_id selects typed storage; kb_ids selects provider-backed documents.
function M.memory(payload: any, access: integer): (string?, any?, error?)
    local id = types.trim(setting(payload, "memory_id"))
    if id == "" then return nil, nil, types.invalid("the Memory capability has no memory selected") end
    local _, access_err = component.validate_access(id, access)
    if access_err then return nil, nil, access_err end
    local store, err = stores.get(id)
    if err then
        if errors.is(err, errors.NOT_FOUND) then
            return nil, nil, types.invalid("knowledge base " .. id .. " is not a memory; select a Memory knowledge base")
        end
        return nil, nil, err
    end
    local cfg, cfg_err = config.effective((store :: any).config)
    if cfg_err then return nil, nil, cfg_err end
    (store :: any).effective = cfg
    return id, store, nil
end

local function host_ref(host: any): (string, string)
    if type(host) ~= "table" then return "", "" end
    if host.kind == "session" then return "session", types.trim(host.session_id) end
    if host.kind == "dataflow" then
        return "dataflow", table.concat({ types.trim(host.dataflow_id), types.trim(host.node_id),
            types.trim(host.run_id), tostring(host.iteration or 0) }, ":")
    end
    return "", ""
end

-- Run context --------------------------------------------------------------

local function open_run_context(ref: any): (any?, error?)
    if type(ref) ~= "table" or types.trim(ref.binding) == "" then
        return nil, types.invalid("run_context binding is required")
    end
    local def, err = contract.get(types.trim(ref.contract) ~= "" and ref.contract or RUN_CONTEXT)
    if err or not def then return nil, types.failed("run_context contract unavailable", err) end
    local inst, open_err = (def :: any):open(tostring(ref.binding))
    if open_err or not inst then return nil, types.failed("run_context binding unavailable", open_err) end
    return inst, nil
end

local function history(payload: any, selector: any): (any?, error?)
    local inst, err = open_run_context(payload.run_context)
    if err then return nil, err end
    local result, history_err = (inst :: any):get_history({
        host = payload.run_context.host or payload.host,
        agent = payload.run_context.agent or payload.agent,
        selector = selector,
    })
    if history_err then return nil, types.failed("run_context history failed", history_err) end
    if type(result) ~= "table" or type(result.events) ~= "table" then
        return nil, types.unavailable("run_context history returned no events")
    end
    return result, nil
end

local function event_text(event: any): string
    local content = event.content
    if type(content) == "string" then return types.trim(content) end
    if type(event.raw_content) == "string" then return types.trim(event.raw_content) end
    if type(content) == "table" and type(content.text) == "string" then return types.trim(content.text) end
    return ""
end

-- The span entry of one history event: user and assistant text, and tool
-- outcomes when experience capture is on. Recalled-memory notes, developer and
-- system messages and raw tool output never enter a span.
local function span_entry(event: any, cfg: any): any?
    local metadata = type(event.metadata) == "table" and event.metadata or {}
    if metadata.memory_ids ~= nil then return nil end
    local role = event.role
    if (role == "user" or role == "assistant") and cfg.capture_conversation ~= false then
        local text = event_text(event)
        if text == "" then return nil end
        return { id = tostring(event.id), role = role, text = text, created_at = event.created_at }
    end
    if role == "function" and cfg.capture_experience == true then
        local name = types.trim(metadata.function_name or metadata.name)
        local status = types.trim(metadata.status)
        if name == "" or status == "" then return nil end
        return { id = tostring(event.id), role = "tool", text = "tool " .. name .. " " .. status, created_at = event.created_at }
    end
    return nil
end

local function gate(events: { any }, cfg: any): { any }
    local span: { any } = {}
    for _, event in ipairs(events) do
        local entry = span_entry(event, cfg)
        if entry then span[#span + 1] = entry end
    end
    return span
end

-- Captures the host's history since its cursor (through `to_event_id` when
-- given) into the memory. Both capture paths go through here; the cursor
-- moves under compare-and-set, so a span is captured once.
local function capture(payload: any, to_event_id: string?): (any?, error?)
    if setting(payload, "write_enabled") == false then return { captured = false, reason = "capture_disabled" }, nil end
    local memory_id, store, store_err = M.memory(payload, component.ACCESS.WRITE)
    if store_err then return nil, store_err end
    local function skipped(reason: string): any
        return { captured = false, reason = reason, memory_id = memory_id }
    end
    local cfg = (store :: any).effective
    if cfg.capture_conversation == false and cfg.capture_experience ~= true then return skipped("capture_disabled"), nil end
    local host_kind, host_id = host_ref(payload.host)
    if host_kind == "" or host_id == "" then return nil, types.invalid("lifecycle host is required for capture") end
    local cursor, cursor_err = runs.cursor(memory_id :: string, host_kind, host_id)
    if cursor_err then return nil, cursor_err end
    local from = cursor and types.trim((cursor :: any).last_event_id) or ""
    local selector: any
    if from ~= "" then
        selector = { mode = "since_id", from_id = from }
    else
        selector = { mode = "window", last = FIRST_CAPTURE_WINDOW }
    end
    local requested = type(payload.selector) == "table" and payload.selector or nil
    if payload.selector == nil and payload.phase == "deactivate" then
        local bounds = type(payload.refs) == "table" and payload.refs.deactivation_range or nil
        if type(bounds) == "table" and type(bounds.to_id) == "string" and types.trim(bounds.to_id) ~= ""
            and (bounds.from_id == nil or (type(bounds.from_id) == "string" and types.trim(bounds.from_id) ~= "")) then
            requested = { mode = "range", from_id = bounds.from_id, to_id = bounds.to_id }
        end
    end
    local result, history_err = history(payload, requested or selector)
    if history_err then return nil, history_err end
    local events = (result :: any).events
    if requested and from ~= "" then
        local remaining, remaining_err = history(payload, selector)
        if remaining_err then return nil, remaining_err end
        local eligible: { [string]: boolean } = {}
        for _, event in ipairs((remaining :: any).events) do eligible[tostring(event.id)] = true end
        local uncaptured: { any } = {}
        for _, event in ipairs(events) do
            if eligible[tostring(event.id)] then uncaptured[#uncaptured + 1] = event end
        end
        events = uncaptured
    end
    if to_event_id then
        -- A persisted record outside the history after the cursor was
        -- already captured by an earlier pass.
        local through: { any } = {}
        local reached = false
        for _, event in ipairs(events) do
            through[#through + 1] = event
            if tostring(event.id) == to_event_id then reached = true; break end
        end
        if not reached then return skipped("already_captured"), nil end
        events = through
    end
    if #events == 0 then return skipped("no_new_history"), nil end
    local span = gate(events, cfg)
    if #span == 0 then return skipped("nothing_to_capture"), nil end
    local preceding, preceding_err = history(payload, { mode = "range", to_id = tostring(events[1].id) })
    if preceding_err then return nil, preceding_err end
    local prior = (preceding :: any).events
    local context: { any } = {}
    local remaining = CAPTURE_CONTEXT_MAX_CHARS
    for i = #prior - 1, math.max(1, #prior - CAPTURE_CONTEXT_WINDOW), -1 do
        local entry = span_entry(prior[i], cfg)
        if entry and remaining > 0 then
            entry.text = entry.text:sub(-remaining)
            remaining = remaining - #entry.text
            table.insert(context, 1, entry)
        end
    end
    local scheduled, schedule_err = jobs.capture({
        component_id = memory_id :: string, host_kind = host_kind, host_id = host_id,
        agent_id = types.trim(payload.agent and payload.agent.id), from_event_id = from,
        to_event_id = tostring(events[#events].id), span = span, context = context,
    })
    if schedule_err then return nil, schedule_err end
    return { captured = (scheduled :: any).scheduled, run_id = (scheduled :: any).run_id, memory_id = memory_id }, nil
end

-- Soul ---------------------------------------------------------------------

local function sort_soul(rows: { any })
    table.sort(rows, function(a, b)
        local ak, bk = KIND_ORDER[a.kind], KIND_ORDER[b.kind]
        if ak ~= bk then return ak < bk end
        if a.priority ~= b.priority then return a.priority > b.priority end
        if a.key ~= b.key then return a.key < b.key end
        return a.id < b.id
    end)
end

-- Deterministic bounded rendering: kind, priority, key order; whole lines only.
-- Renders whole lines in kind, priority and key order within `max_chars`, and
-- returns the item snapshots it rendered.
local function render(rows: { any }, heading: string, max_chars: integer): (string, { any })
    sort_soul(rows)
    local lines: { string } = {}
    local selected: { any } = {}
    local used = #heading
    for _, row in ipairs(rows) do
        local text = row.content
        if (row.kind == types.KIND.PROFILE_SLOT or row.kind == types.KIND.PREFERENCE) and type(row.value) == "string" then
            local label = row.key:gsub("_", " ")
            text = label:sub(1, 1):upper() .. label:sub(2) .. ": " .. row.value
        end
        local line = "- " .. text
        if used + #line + 1 > max_chars then break end
        lines[#lines + 1] = line
        selected[#selected + 1] = { id = row.id, version = row.version, content_hash = row.content_hash }
        used = used + #line + 1
    end
    if #lines == 0 then return "", selected end
    return heading .. "\n" .. table.concat(lines, "\n"), selected
end

local function soul_rows(component_id: string, scope_key: string, kinds: { string }): (any?, error?)
    return items.list(component_id, { kinds = kinds, statuses = { types.STATUS.CURRENT }, scope_keys = { scope_key }, limit = 200 })
end

-- Agent-scoped soul for the compiled system prompt.
local function agent_soul(payload: any, agent_id: string): (string?, error?)
    local id, store, err = M.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local rows, rows_err = soul_rows(id :: string, types.scope_key(types.SCOPE.AGENT, agent_id), AGENT_SOUL_KINDS)
    if rows_err then return nil, rows_err end
    local text = render(rows :: any, "## Agent memory", (store :: any).effective.soul_agent_max_chars)
    return text, nil
end

-- Pins the owner slice for this host: the user's profile and preferences as
-- of activation, rendered once.
local function pin(payload: any): (any?, error?)
    local id, store, err = M.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local host_kind, host_id = host_ref(payload.host)
    local rows, rows_err = soul_rows(id :: string, types.scope_key(types.SCOPE.OWNER, types.actor_id()), OWNER_SOUL_KINDS)
    if rows_err then return nil, rows_err end
    local text, pinned = render(rows :: any, "## What you know about the user\nUse these facts as defaults. Propose using what you know instead of asking again; the user can correct you.", (store :: any).effective.soul_owner_max_chars)
    local head, head_err = ledger.head(id :: string)
    if head_err then return nil, head_err end
    return runs.pin(id :: string, host_kind, host_id, types.trim(payload.agent.id), head :: integer, text, pinned)
end

-- The owner slice pinned for the running host, byte-identical across steps
-- until one of its items is forgotten, which renders it again.
local function owner_prompt(payload: any): (string?, error?)
    local run = ctx.get("agent_run")
    local host_kind, host_id = host_ref(type(run) == "table" and run.host or nil)
    if host_kind == "" or host_id == "" then return "", nil end
    local id, _, err = M.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local cursor, cursor_err = runs.cursor(id :: string, host_kind, host_id)
    if cursor_err then return nil, cursor_err end
    if cursor and (cursor :: any).pinned_prompt == nil then
        local _, pin_err = pin({ context = payload.context, host = run.host, agent = run.agent or {} })
        if pin_err then return nil, pin_err end
        cursor, cursor_err = runs.cursor(id :: string, host_kind, host_id)
        if cursor_err then return nil, cursor_err end
    end
    return cursor and (cursor :: any).pinned_prompt or "", nil
end

-- Lifecycle ----------------------------------------------------------------

local function validate(payload: any): error?
    if type(payload) ~= "table" then return types.invalid("payload must be an object") end
    if type(payload.host) ~= "table" or types.trim(payload.host.kind) == "" then return types.invalid("host.kind is required") end
    if type(payload.agent) ~= "table" then payload.agent = {} end
    return nil
end

function M.apply(payload: any): (any?, error?)
    local invalid = validate(payload)
    if invalid then return nil, invalid end
    local phase = payload.phase
    if phase == "activate" then
        local _, err = pin(payload)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, pinned = true } }, nil
    elseif phase == "before_step" then
        local captured, err = capture(payload, nil)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, capture = captured } }, nil
    elseif phase == "after_persist" then
        local event_id = types.trim(payload.refs and payload.refs.event_id)
        if event_id == "" then return nil, types.invalid("after_persist requires refs.event_id") end
        local captured, err = capture(payload, event_id)
        if err then return nil, err end
        return { messages = {}, metadata = { phase = phase, capture = captured } }, nil
    elseif phase == "deactivate" then
        local captured, err = capture(payload, nil)
        if err then return nil, err end
        local metadata: { [string]: any } = { phase = phase, capture = captured }
        if (captured :: any).memory_id then
            local _, wake_err = jobs.wake_consolidation((captured :: any).memory_id)
            if wake_err then metadata.consolidation_error = tostring(wake_err) end
        end
        return { messages = {}, metadata = metadata }, nil
    end
    return { messages = {}, metadata = { phase = phase, ignored = true } }, nil
end

-- Checkpoint: the working summary the host compacts with, plus a capture of
-- the compacted range into memory.
function M.create(payload: any): (any?, error?)
    local invalid = validate(payload)
    if invalid then return nil, invalid end
    local inst, err = open_run_context(payload.run_context)
    if err then return nil, err end
    local selector = type(payload.selector) == "table" and payload.selector or { mode = "since_checkpoint" }
    selector.max_chars = selector.max_chars or CHECKPOINT_SOURCE_MAX_CHARS
    local prompt, prompt_err = (inst :: any):get_prompt({
        host = payload.run_context.host or payload.host,
        agent = payload.run_context.agent or payload.agent,
        selector = selector,
        format = "text",
    })
    if prompt_err then return nil, types.failed("checkpoint source failed", prompt_err) end
    local text = types.trim((prompt :: any).text)
    local summary, tokens = "No working conversation state.", nil
    if text ~= "" then
        local options = type(payload.options) == "table" and payload.options or {}
        local model = types.trim(payload.agent.model)
        if model == "" then model = types.trim(options.model) end
        if model == "" then return nil, types.invalid("checkpoint requires the agent model") end
        local max_tokens = tonumber(options.max_tokens) or CHECKPOINT_MAX_TOKENS
        local generated, used, summary_err = models.working_summary(model, text, math.floor(max_tokens))
        if summary_err then return nil, summary_err end
        summary, tokens = generated :: string, used
    end
    local range = (prompt :: any).range or {}
    local captured, capture_err = capture(payload, types.trim(range.to_id) ~= "" and range.to_id or nil)
    if capture_err then return nil, capture_err end
    return { summary = summary, tokens = tokens, metadata = { source = types.SOURCE, capture = captured } }, nil
end

-- Recall (wippy.agent:memory) ----------------------------------------------

local function recall_query(input: any): string
    local parts: { string } = {}
    if types.trim(input.working_on) ~= "" then parts[#parts + 1] = types.trim(input.working_on) end
    local actions = type(input.recent_actions) == "table" and input.recent_actions or {}
    for i = math.max(1, #actions - 2), #actions do
        local action = actions[i]
        local text = type(action) == "string" and action or (type(action) == "table" and action.content) or ""
        if types.trim(text) ~= "" then parts[#parts + 1] = types.trim(text) end
    end
    return table.concat(parts, "\n")
end

function M.recall(input: any): (any?, error?)
    local args = type(input) == "table" and input or {}
    local component_id, store, store_err = M.memory({ context = { memory_id = ctx.get("component_id") } }, component.ACCESS.READ)
    if store_err then return nil, store_err end
    local query = recall_query(args)
    if query == "" then return { memories = {} }, nil end
    local cfg = (store :: any).effective
    local constraints = type(args.constraints) == "table" and args.constraints or {}
    local max_items = math.floor(tonumber(constraints.max_items) or cfg.recall_max_items)
    local max_length = math.floor(tonumber(constraints.max_length) or cfg.recall_max_length)
    local exclude: { [string]: boolean } = {}
    for _, id in ipairs(type(args.previous_memories) == "table" and args.previous_memories or {}) do exclude[tostring(id)] = true end
    local agent_id = types.trim(ctx.get("agent_id"))
    local rows, err = recall.search({
        component_id = component_id :: string, query = query, limit = max_items, kinds = RECALL_KINDS,
        scopes = recall.visible_scopes(agent_id), exclude = exclude,
    })
    if err then return nil, err end
    local memories: { any } = {}
    local used = 0
    for _, row in ipairs(rows :: any) do
        if used + #row.content > max_length then break end
        used = used + #row.content
        memories[#memories + 1] = {
            id = row.id,
            content = row.content,
            metadata = { type = row.kind, source = types.SOURCE, created_at = row.recorded_at, valid_at = row.valid_at },
        }
    end
    return { memories = memories }, nil
end

-- Memory knowledge bases the caller can read, for the agent memory picker.
function M.list_targets(_input: any): any
    local def, def_err = contract.get(KB_REGISTRY)
    if def_err or not def then return { success = false, error = "knowledge_bases contract unavailable: " .. tostring(def_err) } end
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope then return { success = false, error = "security actor and scope are required" } end
    local registry_inst, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not registry_inst then return { success = false, error = "knowledge_bases open failed: " .. tostring(open_err) } end
    local rows, list_err = (registry_inst :: any):list({ kb_type = types.KB_TYPE })
    if list_err then return { success = false, error = tostring(list_err) } end
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local meta = type(row.meta) == "table" and row.meta or {}
        local id = row.component_id or row.id
        if types.trim(id) ~= "" then
            out[#out + 1] = { id = id, title = meta.title or row.name or id, name = meta.title or row.name or id,
                description = meta.comment or "", kb_type = types.KB_TYPE }
        end
    end
    return { success = true, items = out, count = #out }
end

-- Build and prompt functions -------------------------------------------------

-- build_func_id: contributes the agent-scoped soul to the compiled prompt.
function M.build(_prompt: any, context: any): (any?, error?)
    if types.trim(setting({ context = context }, "memory_id")) == "" then return {}, nil end
    local tools = {
        { id = "kickside.memory.agent:memory_remember_tool" },
        { id = "kickside.memory.agent:memory_forget_tool" },
    }
    local agent_id = types.trim(type(context) == "table" and context.agent_id or ctx.get("agent_id"))
    if agent_id == "" then return { tools = tools }, nil end
    local text, err = agent_soul({ context = context }, agent_id)
    if err then return nil, err end
    return { prompt = text ~= "" and text or nil, tools = tools }, nil
end

-- prompt_func_id: the pinned owner slice.
function M.prompt(): (string?, error?)
    if types.trim(setting({}, "memory_id")) == "" then return "", nil end
    return owner_prompt({})
end

-- Tools --------------------------------------------------------------------

-- A tool answer the model can act on: a refused or invalid call.
local function tool_error(err: any): any
    return { success = false, error = tostring(err) }
end

-- Remember and ForgetMemory write; a trait context with write_enabled off
-- keeps the memory read-only for this agent.
local function writable(): (string?, any?, any?)
    if setting({}, "write_enabled") == false then return nil, nil, tool_error("this agent's memory is read-only") end
    local memory_id, store, err = M.memory({}, component.ACCESS.WRITE)
    if err then return nil, nil, tool_error(err) end
    return memory_id, store, nil
end

function M.remember(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    local content = types.trim(input.content)
    if content == "" then return tool_error("content is required"), nil end
    local kind = types.trim(input.kind)
    if kind == "" then kind = types.KIND.FACT end
    if not types.KIND_SET[kind] or kind == types.KIND.IDENTITY or kind == types.KIND.RULE then
        return tool_error("kind must be one of fact, preference, profile_slot, skill, lesson"), nil
    end
    local cardinality = types.trim(input.cardinality)
    if cardinality ~= "" and not types.CARDINALITY_SET[cardinality] then return tool_error("cardinality must be single or multi"), nil end
    local memory_id, store, refusal = writable()
    if refusal then return refusal, nil end
    local owner = types.actor_id()
    if owner == "" then return tool_error("remember requires a signed-in user"), nil end
    local value = input.value
    if value == nil then value = content end
    local key, key_err = types.topic_key(input.key, content, value)
    if key_err then return tool_error(key_err), nil end
    local idempotency, hash_err = types.digest({ "tool.remember", owner, key, value, content })
    if hash_err then return nil, hash_err end
    local run = ctx.get("agent_run")
    local host_kind, host_id = host_ref(type(run) == "table" and run.host or nil)
    local written, write_err = writer.write(memory_id :: string, idempotency :: string, {
        source = types.ITEM_SOURCE.TOOL, actor = owner, keyed_by_head = true,
    }, function(d: any): (any?, error?)
        local err = reconcile.decide(d, {
            { kind = kind, key = key, cardinality = cardinality ~= "" and cardinality or nil, value = value, content = content,
                valid_at = input.valid_at, confidence = 1 },
        }, {
            embedding_model = (store :: any).embedding_model, judge_model = (store :: any).effective.judge_model,
            scope_family = types.SCOPE.OWNER, scope_id = owner, explicit = true,
            host_kind = host_kind ~= "" and host_kind or nil, host_id = host_id,
        })
        return nil, err
    end)
    if write_err then return nil, write_err end
    return { success = true, memory_id = memory_id, item_ids = (written :: any).item_ids, outcome = (written :: any).stats }, nil
end

-- ForgetMemory erases one of the caller's own memories. The agent's identity,
-- rules, skills and lessons are edited by people on the memory page only.
function M.forget(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    local item_id = types.trim(input.item_id)
    if item_id == "" then return tool_error("item_id is required"), nil end
    local memory_id, _, refusal = writable()
    if refusal then return refusal, nil end
    local item, item_err = items.get(memory_id :: string, item_id)
    if item_err then return nil, item_err end
    if not item then return tool_error("memory item not found"), nil end
    if (item :: any).scope_key ~= types.scope_key(types.SCOPE.OWNER, types.actor_id()) then
        return tool_error("only your own memories can be forgotten here"), nil
    end
    local forgotten, forget_err = ops.forget(memory_id :: string, item_id)
    if forget_err then return nil, forget_err end
    return { success = true, memory_id = memory_id, item_id = (forgotten :: any).item_id }, nil
end

-- SearchMemory: ranked current memories of the user and this agent.
function M.search(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    if setting({}, "read_enabled") == false then
        return tool_error("memory search is disabled for this agent"), nil
    end
    local query = types.trim(input.query)
    if query == "" then return tool_error("query is required"), nil end
    local limit = math.floor(tonumber(input.limit) or tonumber(setting({}, "recall_limit")) or 5)
    if limit < 1 or limit > SEARCH_MAX then return tool_error("limit must be between 1 and " .. SEARCH_MAX), nil end
    local offset = math.floor(tonumber(input.cursor) or 0)
    if offset < 0 then return tool_error("cursor is invalid"), nil end
    local memory_id, _, err = M.memory({}, component.ACCESS.READ)
    if err then return tool_error(err), nil end
    local scopes = recall.visible_scopes(ctx.get("agent_id"))
    local rows, search_err = recall.search({
        component_id = memory_id :: string, query = query, limit = offset + limit + 1,
        scopes = scopes,
    })
    if search_err then return nil, search_err end
    local fields = type(input.fields) == "table" and input.fields or {}
    local page: { any } = {}
    for i = offset + 1, math.min(offset + limit, #(rows :: any)) do
        local row = (rows :: any)[i]
        local out: { [string]: any } = {
            id = row.id, kb_id = memory_id, node_type = row.kind, score = row.similarity, source = row.source,
            created_at = row.recorded_at, content = row.content,
        }
        for _, name in ipairs(fields) do
            if name == "*" then
                for k, v in pairs(row) do out[k] = v end
            else
                out[name] = row[name]
            end
        end
        page[#page + 1] = out
    end
    local contested, contested_err = recall.search({
        component_id = memory_id :: string, query = query, limit = offset + limit + 1, group_by = "conflict_group",
        scopes = scopes, statuses = { types.STATUS.CONFLICT },
    })
    if contested_err then return nil, contested_err end
    local group_ids: { string } = {}
    for _, row in ipairs(contested :: any) do group_ids[#group_ids + 1] = row.id end
    local page_groups: { string } = {}
    for i = offset + 1, math.min(offset + limit, #group_ids) do page_groups[#page_groups + 1] = group_ids[i] end
    local members, members_err = items.group_members(memory_id :: string, page_groups, scopes)
    if members_err then return nil, members_err end
    local groups: { [string]: any } = {}
    local alternatives: { any } = {}
    for _, group_id in ipairs(page_groups) do
        local group = { group_id = group_id, status = "unresolved", options = {} }
        groups[group_id] = group
        alternatives[#alternatives + 1] = group
    end
    for _, row in ipairs(members :: any) do
        local group = groups[row.conflict_group]
        if group then
        group.options[#group.options + 1] = { id = row.id, content = row.content, valid_at = row.valid_at }
        end
    end
    local result: { [string]: any } = {
        success = true, query = query, count = #page, items = page, alternatives = alternatives,
        note = "Memory is derived from prior conversations and may be incomplete or out of date. Alternatives are " ..
            "unresolved: the person has said contradicting things; ask before relying on either.",
    }
    if #(rows :: any) > offset + limit or #group_ids > offset + limit then result.next_cursor = tostring(offset + limit) end
    return result, nil
end

return M
