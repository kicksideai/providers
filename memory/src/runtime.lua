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

local M = {}

local RUN_CONTEXT = "wippy.agent:run_context"
local KB_REGISTRY = "kickside.knowledge:knowledge_bases"

-- Messages read on the first capture of a host without a cursor.
local FIRST_CAPTURE_WINDOW = 20
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

-- The agent's memory: memory_id, or for contexts saved by earlier releases
-- write_kb_id or the first kb_ids entry. A trait without a memory, or naming a
-- knowledge base that is not a memory, is a configuration error.
function M.memory(payload: any, access: integer): (string?, any?, error?)
    local id = types.trim(setting(payload, "memory_id"))
    if id == "" then id = types.trim(setting(payload, "write_kb_id")) end
    if id == "" then
        local legacy = setting(payload, "kb_ids")
        if type(legacy) == "table" then id = types.trim(legacy[1]) end
    end
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
    return types.trim(host.kind), types.trim(host.id)
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
    local cfg = (store :: any).effective
    if cfg.capture_conversation == false and cfg.capture_experience ~= true then
        return { captured = false, reason = "capture_disabled" }, nil
    end
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
    local result, history_err = history(payload, selector)
    if history_err then return nil, history_err end
    local events = (result :: any).events
    if to_event_id then
        -- A persisted record outside the history after the cursor was
        -- already captured by an earlier pass.
        local through: { any } = {}
        local reached = false
        for _, event in ipairs(events) do
            through[#through + 1] = event
            if tostring(event.id) == to_event_id then reached = true; break end
        end
        if not reached then return { captured = false, reason = "already_captured" }, nil end
        events = through
    end
    if #events == 0 then return { captured = false, reason = "no_new_history" }, nil end
    local span = gate(events, cfg)
    if #span == 0 then return { captured = false, reason = "nothing_to_capture" }, nil end
    local scheduled, schedule_err = jobs.capture({
        component_id = memory_id :: string, host_kind = host_kind, host_id = host_id,
        agent_id = types.trim(payload.agent and payload.agent.id), from_event_id = from,
        to_event_id = tostring(events[#events].id), span = span,
    })
    if schedule_err then return nil, schedule_err end
    return { captured = (scheduled :: any).scheduled, run_id = (scheduled :: any).run_id, memory_id = memory_id }, nil
end

-- Soul ---------------------------------------------------------------------

local function sort_soul(rows: { any })
    table.sort(rows, function(a, b)
        local ak, bk = KIND_ORDER[a.kind] or 99, KIND_ORDER[b.kind] or 99
        if ak ~= bk then return ak < bk end
        if a.priority ~= b.priority then return a.priority > b.priority end
        if a.key ~= b.key then return a.key < b.key end
        return a.id < b.id
    end)
end

-- Deterministic bounded rendering: kind, priority, key order; whole lines only.
local function render(rows: { any }, heading: string, max_chars: integer): string
    sort_soul(rows)
    local lines: { string } = {}
    local used = #heading
    for _, row in ipairs(rows) do
        local line = "- [" .. row.kind .. "] " .. row.content
        if used + #line + 1 > max_chars then break end
        lines[#lines + 1] = line
        used = used + #line + 1
    end
    if #lines == 0 then return "" end
    return heading .. "\n" .. table.concat(lines, "\n")
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
    return render(rows :: any, "## Agent memory", (store :: any).effective.soul_agent_max_chars), nil
end

-- Pins the owner slice for this host: the user's profile and preferences as
-- of activation, rendered once.
local function pin(payload: any): (any?, error?)
    local id, store, err = M.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local host_kind, host_id = host_ref(payload.host)
    local rows, rows_err = soul_rows(id :: string, types.scope_key(types.SCOPE.OWNER, ops.actor_id()), OWNER_SOUL_KINDS)
    if rows_err then return nil, rows_err end
    local text = render(rows :: any, "## What you know about the user", (store :: any).effective.soul_owner_max_chars)
    local head, head_err = ledger.head(id :: string)
    if head_err then return nil, head_err end
    return runs.pin(id :: string, host_kind, host_id, types.trim(payload.agent.id), head :: integer, text)
end

-- The owner slice pinned for the running host, byte-identical across steps.
local function owner_prompt(payload: any): (string?, error?)
    local run = ctx.get("agent_run")
    local host_kind, host_id = host_ref(type(run) == "table" and run.host or nil)
    if host_kind == "" or host_id == "" then return "", nil end
    local id, _, err = M.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local cursor, cursor_err = runs.cursor(id :: string, host_kind, host_id)
    if cursor_err then return nil, cursor_err end
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
    local text = types.trim(prompt and prompt.text)
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
    local range = prompt and prompt.range or {}
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
    local agent_id = types.trim(type(context) == "table" and context.agent_id or ctx.get("agent_id"))
    if agent_id == "" then return {}, nil end
    local text, err = agent_soul({ context = context }, agent_id)
    if err then return nil, err end
    if text == "" then return {}, nil end
    return { prompt = text }, nil
end

-- prompt_func_id: the pinned owner slice.
function M.prompt(): (string?, error?)
    return owner_prompt({})
end

-- Tools --------------------------------------------------------------------

-- A tool answer the model can act on: a refused or invalid call.
local function tool_error(err: any): any
    return { success = false, error = tostring(err) }
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
    local memory_id, store, err = M.memory({}, component.ACCESS.WRITE)
    if err then return tool_error(err), nil end
    local owner = ops.actor_id()
    if owner == "" then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "remember requires an actor" }) end
    local key = types.trim(input.key)
    if key == "" then key = content end
    local value = input.value ~= nil and input.value or content
    local idempotency, hash_err = types.sha256(table.concat({ "tool", owner, kind, types.normalize_key(key), types.value_text(value) }, "|"))
    if hash_err then return nil, hash_err end
    local run = ctx.get("agent_run")
    local host_kind, host_id = host_ref(type(run) == "table" and run.host or nil)
    local result, write_err = writer.remember({
        { kind = kind, key = key, value = value, content = content, valid_at = input.valid_at, confidence = 1 },
    }, {
        component_id = memory_id :: string, embedding_model = (store :: any).embedding_model,
        judge_model = (store :: any).effective.judge_model, scope_family = types.SCOPE.OWNER, scope_id = owner,
        source = types.ITEM_SOURCE.TOOL, host_kind = host_kind ~= "" and host_kind or nil, host_id = host_id,
    }, "tool:" .. tostring(idempotency))
    if write_err then return nil, write_err end
    return { success = true, memory_id = memory_id, item_ids = (result :: any).item_ids, outcome = (result :: any).stats }, nil
end

function M.forget(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    local item_id = types.trim(input.item_id)
    if item_id == "" then return tool_error("item_id is required"), nil end
    local memory_id, _, err = M.memory({}, component.ACCESS.WRITE)
    if err then return tool_error(err), nil end
    local item, item_err = items.get(memory_id :: string, item_id)
    if item_err then return nil, item_err end
    if not item then return tool_error("memory item not found"), nil end
    local owned = ((item :: any).scope_family == types.SCOPE.OWNER and (item :: any).scope_id == ops.actor_id())
        or ((item :: any).scope_family == types.SCOPE.AGENT and (item :: any).scope_id == types.trim(ctx.get("agent_id")))
    if not owned then return tool_error("memory item is outside this conversation's scope"), nil end
    local forgotten, forget_err = ops.forget(memory_id :: string, item_id, input.reason)
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
    local rows, search_err = recall.search({
        component_id = memory_id :: string, query = query, limit = offset + limit + 1,
        scopes = recall.visible_scopes(ctx.get("agent_id")),
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
    local result: { [string]: any } = {
        success = true, query = query, count = #page, items = page,
        note = "Memory is derived from prior conversations and may be incomplete or out of date.",
    }
    if #(rows :: any) > offset + limit then result.next_cursor = tostring(offset + limit) end
    return result, nil
end

return M
