local ctx = require("ctx")
local contract = require("contract")
local component = require("component")
local llm = require("llm")
local prompt = require("prompt")

local M = {}

local QUERYABLE_CONTRACT = "kickside.contract:queryable"
local EMBEDDABLE_CONTRACT = "kickside.contract:embeddable"
local SOURCE = "kickside.memory"
local NO_DURABLE_MEMORY = "NO_DURABLE_MEMORY"

local DEFAULT_RECALL_PROMPT = "Long-term memory from prior conversations. It may be incomplete or inaccurate; use it as advisory context and decide what is relevant."
local DEFAULT_CHECKPOINT_PROMPT = "Store relevant details for future conversations. Preserve stable user preferences, decisions, project facts, open tasks, constraints, and the next useful action. Exclude filler, transient chatter, assistant narration, tool progress text, and literal answers. Return a compact memory digest, not a response to the user."

local DEFAULTS = {
    read_enabled = true,
    write_enabled = true,
    recall_limit = 5,
    recall_max_chars = 4000,
    recall_prompt = DEFAULT_RECALL_PROMPT,
    checkpoint_model = "class:fast",
    checkpoint_prompt = DEFAULT_CHECKPOINT_PROMPT,
    checkpoint_temperature = 0.2,
    checkpoint_max_tokens = 1000,
    checkpoint_source_max_chars = 12000,
}


local deps = {
    ctx = ctx,
    contract = contract,
    component = component,
    llm = llm,
    prompt = prompt,
}

local function shallow_copy(input)
    local out = {}
    if type(input) == "table" then
        for k, v in pairs(input) do out[k] = v end
    end
    return out
end

function M._set_deps(test_deps)
    deps = {
        ctx = test_deps.ctx or ctx,
        contract = test_deps.contract or contract,
        component = test_deps.component or component,
        llm = test_deps.llm or llm,
        prompt = test_deps.prompt or prompt,
    }
end

function M._reset_deps()
    deps = {
        ctx = ctx,
        contract = contract,
        component = component,
        llm = llm,
        prompt = prompt,
    }
end

local function trim(value)
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function truncate(value, max_chars)
    if type(value) ~= "string" then return "" end
    local limit = math.floor(tonumber(max_chars) or 0) :: integer
    if limit <= 0 then return "", #value > 0 end
    if #value <= limit then return value, false end
    local index = 1
    local last = 0
    while index <= #value do
        local first = value:byte(index) or 0
        local width = first < 0x80 and 1
            or (first < 0xE0 and 2 or (first < 0xF0 and 3 or 4))
        if index + width - 1 > #value then width = 1 end
        if index + width - 1 > limit then break end
        last = index + width - 1
        index = last + 1
    end
    return value:sub(1, last), true
end

local function is_no_durable_memory(value)
    local text = trim(value)
    if text == "" then return true end
    local folded = text:lower():gsub("%s+", " ")
    return text == NO_DURABLE_MEMORY
        or folded == "no new durable memory."
        or folded == "no new durable memory"
        or folded == "no durable memory."
        or folded == "no durable memory"
end

local function looks_like_assistant_answer(value)
    local text = trim(value)
    if text == "" then return false end
    local folded = text:lower()
    local starts = {
        "^yes[,%.%s]",
        "^no[,%.%s]",
        "^i%s",
        "^i['’]ve%s",
        "^i%s+found%s",
        "^i%s+apologize%s",
        "^here%s+is%s",
        "^here['’]s%s",
    }
    for _, pattern in ipairs(starts) do
        if folded:find(pattern) then return true end
    end
    return folded:find("would you like me", 1, true) ~= nil
        or folded:find("do you want me", 1, true) ~= nil
        or folded:find("one quick question", 1, true) ~= nil
end

local function normalize_memory_digest(value: any): (string?, string?)
    local text = trim(tostring(value or ""))
    if is_no_durable_memory(text) then
        return nil, "no_durable_memory"
    end
    if looks_like_assistant_answer(text) then
        return nil, "assistant_answer"
    end
    if text:find("^##%s+Memory Digest") then
        return text, nil
    end
    return table.concat({ "## Memory Digest", "", text }, "\n"), nil
end

local function safe_id(value)
    local text = tostring(value or "")
    text = text:gsub("[^%w._:-]", "_")
    if text == "" then return "unknown" end
    return text
end

local function context_get(name)
    local value = deps.ctx.get(name)
    if value ~= nil then return value end
    return nil
end

local function config_raw(payload, name)
    local value = context_get(name)
    if value ~= nil and value ~= "" then return value end
    if type(payload) == "table" then
        value = payload[name]
        if value ~= nil and value ~= "" then return value end
    end
    if type(payload) == "table" and type(payload.context) == "table" then
        value = payload.context[name]
        if value ~= nil and value ~= "" then return value end
    end
    if type(payload) == "table" and type(payload.options) == "table" then
        value = payload.options[name]
        if value ~= nil and value ~= "" then return value end
    end
    return nil
end

local function config_value(payload, name, fallback)
    local value = config_raw(payload, name)
    if value ~= nil and value ~= "" then return value end
    return fallback
end

local function bool_config(payload, name, fallback)
    local value = config_raw(payload, name)
    if type(value) == "boolean" then return value end
    if type(value) == "string" then
        if value == "true" then return true end
        if value == "false" then return false end
    end
    return fallback
end

local function number_config(payload, name, fallback)
    local value = tonumber(config_raw(payload, name))
    if value and value > 0 then return value end
    return fallback
end

local function kb_ids(payload): { string }
    local raw = config_raw(payload, "kb_ids")
    if type(raw) == "table" then
        local out: { string } = {}
        for _, id in ipairs(raw) do
            id = trim(id)
            if id ~= "" then out[#out + 1] = id end
        end
        return out
    end
    local single = trim(config_value(payload, "kb_id", ""))
    if single ~= "" then return { single } end
    return {}
end

local function write_kb_id(payload)
    local explicit = trim(config_value(payload, "write_kb_id", ""))
    if explicit ~= "" then return explicit end
    local ids = kb_ids(payload)
    return ids[1]
end

local function host_key(host)
    if type(host) ~= "table" then return "host:unknown" end
    if host.kind == "session" then
        return "session:" .. safe_id(host.session_id)
    end
    if host.kind == "dataflow" then
        return table.concat({
            "dataflow",
            safe_id(host.dataflow_id),
            safe_id(host.node_id),
            safe_id(host.run_id),
            safe_id(host.iteration or 0),
        }, ":")
    end
    return safe_id(host.kind) .. ":" .. safe_id(host.id)
end

local function validate_common(payload)
    if type(payload) ~= "table" then
        return nil, "payload must be an object"
    end
    if type(payload.host) ~= "table" or trim(payload.host.kind) == "" then
        return nil, "host.kind is required"
    end
    if type(payload.agent) ~= "table" then
        payload.agent = {}
    end
    if type(payload.run_context) ~= "table" then
        return nil, "run_context is required"
    end
    if trim(payload.run_context.contract) == "" or trim(payload.run_context.binding) == "" then
        return nil, "run_context contract and binding are required"
    end
    return payload, nil
end

local function open_run_context(ref)
    local contract_def, get_err = deps.contract.get(tostring(ref.contract))
    if get_err then return nil, get_err end
    if not contract_def then return nil, "run_context contract not found" end
    local instance, open_err = contract_def:open(tostring(ref.binding))
    if open_err then return nil, open_err end
    if not instance then return nil, "run_context binding not found" end
    return instance, nil
end

local function read_prompt(payload, selector)
    local inst, inst_err = open_run_context(payload.run_context)
    if not inst then return nil, inst_err end
    return inst:get_prompt({
        host = payload.run_context.host or payload.host,
        agent = payload.run_context.agent or payload.agent,
        selector = selector,
        format = "text",
        include_files = true,
        include_contexts = true,
    })
end

local function open_component(kb_id, access, contract_id)
    if trim(kb_id) == "" then
        return nil, "knowledge base is not configured"
    end
    local instance, open_err = deps.component.open(kb_id, access, contract_id)
    if open_err then return nil, open_err end
    if not instance then return nil, "component open returned no instance" end
    return instance, nil
end

local function item_text(item)
    if type(item) == "table" and type(item.content) == "string" then return item.content end
    return ""
end

local function recall_query(payload)
    local explicit = trim(config_value(payload, "recall_query", ""))
    if explicit ~= "" then return explicit end

    local prompt_result, prompt_err = read_prompt(payload, {
        mode = "window",
        last = 8,
        max_chars = 3000,
    })
    if prompt_err then return nil, prompt_err end
    if type(prompt_result) == "table" and trim(prompt_result.text) ~= "" then
        return prompt_result.text, nil
    end
    return nil, nil
end

local function recall_from_kbs(payload)
    if bool_config(payload, "read_enabled", DEFAULTS.read_enabled) == false then
        return {}, nil
    end

    local query, query_err = recall_query(payload)
    if query_err then return nil, query_err end
    if trim(query) == "" then return {}, nil end

    local ids = kb_ids(payload)
    if #ids == 0 then return {}, nil end

    local limit = number_config(payload, "recall_limit", DEFAULTS.recall_limit)
    local items = {}
    for _, kb_id in ipairs(ids) do
        local reader, open_err = open_component(kb_id, deps.component.ACCESS.READ, QUERYABLE_CONTRACT)
        if not reader then return nil, open_err end
        local result, read_err = reader:query({ query = query, limit = limit })
        if read_err then return nil, read_err end
        for _, item in ipairs((result and result.items) or {}) do
            local next_item = shallow_copy(item)
            next_item.kb_id = kb_id
            items[#items + 1] = next_item
            if #items >= limit then return items, nil end
        end
    end
    return items, nil
end

-- The recall digest: the guidance line, then each item's text numbered in order.
-- max_chars is the lifecycle's injection budget for the activate message; the
-- SearchMemory exposes summary rows separately.
local function recall_message(payload, items, max_chars)
    if type(items) ~= "table" or #items == 0 then return nil end
    local guidance = trim(config_value(payload, "recall_prompt", DEFAULTS.recall_prompt))
    if guidance == "" then guidance = DEFAULT_RECALL_PROMPT end
    local lines = { guidance }
    local remaining = max_chars
    for index, item in ipairs(items) do
        if remaining and remaining <= 0 then break end
        local text = item_text(item)
        if remaining then
            text = truncate(text, remaining)
            remaining = remaining - #text
        end
        if text ~= "" then
            lines[#lines + 1] = tostring(index) .. ". " .. text
        end
    end
    if #lines == 1 then return nil end
    return table.concat(lines, "\n")
end

local function valid_history_id(value)
    return type(value) == "string" and trim(value) ~= ""
end

-- Deactivation ranges are supplied by the session lifecycle after it has
-- persisted the outgoing history.  They bound this durable-memory digest to
-- the just-deactivated agent span; an absent or malformed range must retain
-- the historical since-checkpoint behavior rather than widening the read.
local function checkpoint_selector(payload)
    -- `selector = {}` is an explicit host choice. Do not replace it with the
    -- deactivation range merely because it has no fields.
    if payload.selector ~= nil then
        return shallow_copy(payload.selector or {mode = "since_checkpoint"})
    end

    if payload.phase == "deactivate" then
        local refs = type(payload.refs) == "table" and payload.refs or nil
        local range = refs and refs.deactivation_range
        if type(range) == "table" then
            local from_id, to_id = range.from_id, range.to_id
            -- from_id is exclusive and is intentionally absent for the first
            -- known history row.  If it is present, do not silently omit an
            -- invalid value and accidentally broaden the selected range.
            if valid_history_id(to_id) and (from_id == nil or valid_history_id(from_id)) then
                local selector = {mode = "range", to_id = to_id}
                if from_id ~= nil then selector.from_id = from_id end
                return selector
            end
        end
    end

    return {mode = "since_checkpoint"}
end

local function checkpoint_prompt_text(payload)
    local selector = checkpoint_selector(payload)
    selector.max_chars = selector.max_chars or number_config(payload, "checkpoint_source_max_chars", DEFAULTS.checkpoint_source_max_chars)
    local prompt_result, prompt_err = read_prompt(payload, selector)
    local text = type(prompt_result) == "table" and prompt_result.text or ""
    return text, prompt_result, prompt_err
end

local function generate_text(payload, model, text, system)
    local builder = deps.prompt.new()
    builder:add_system(system)
    builder:add_user(text)
    local response, err = deps.llm.generate(builder, {
        model = model,
        temperature = number_config(payload, "checkpoint_temperature", DEFAULTS.checkpoint_temperature),
        max_tokens = number_config(payload, "checkpoint_max_tokens", DEFAULTS.checkpoint_max_tokens),
    })
    if err then return nil, err end
    if not response or trim(response.result) == "" then return nil, "checkpoint generation returned no text" end
    if response.finish_reason and response.finish_reason ~= "stop" then
        return nil, "checkpoint generation does not complete: " .. tostring(response.finish_reason)
    end
    return response, nil
end

local function generate_checkpoint(payload, text)
    if trim(text) == "" then
        return NO_DURABLE_MEMORY, { strategy = "empty", skipped = true }, nil
    end

    local model = trim(config_value(payload, "checkpoint_model", DEFAULTS.checkpoint_model))
    if model == "" or model == "none" then
        return NO_DURABLE_MEMORY, { strategy = "no_model", model = model, skipped = true }, nil
    end

    local system = table.concat({
        "You write durable long-term memory for an agent.",
        "Return exactly " .. NO_DURABLE_MEMORY .. " when there are no stable facts, preferences, decisions, project state, open tasks, constraints, or next actions worth remembering.",
        "Otherwise return markdown only, with heading exactly: ## Memory Digest",
        "Use terse bullets. Do not answer the user. Do not ask follow-up questions. Do not preserve assistant replies, tool narration, progress updates, acknowledgements, or raw transcript.",
    }, "\n")
    local custom = trim(config_value(payload, "checkpoint_prompt", ""))
    if custom ~= "" then system = system .. "\nMemory write policy:\n" .. custom end
    local response, llm_err = generate_text(payload, model, text, system)
    if llm_err then return nil, {strategy = "llm", model = model}, llm_err end

    local normalized, normalize_reason = normalize_memory_digest(response.result)
    if not normalized then
        return NO_DURABLE_MEMORY, {
            strategy = "llm",
            model = model,
            tokens = response.tokens,
            skipped = true,
            skip_reason = normalize_reason,
        }, nil
    end

    return normalized, {
        strategy = "llm",
        model = model,
        tokens = response.tokens,
    }, nil
end

-- A SearchMemory cursor is "<kb index>:<offset>,<offset>,..." with one offset per
-- configured knowledge base; no cursor starts every KB at 0 from the first KB.
local function parse_cursor(cursor, kb_count): (integer?, { integer })
    local offsets: { integer } = {}
    if cursor == nil or cursor == "" then
        for index = 1, kb_count do offsets[index] = 0 end
        return 1, offsets
    end
    if type(cursor) ~= "string" then return nil, offsets end
    local start_text, offset_text = cursor:match("^(%d+):([%d,]+)$")
    local start = tonumber(start_text)
    if not start or start < 1 or start > kb_count then return nil, offsets end
    for value in (offset_text .. ","):gmatch("(%d+),") do offsets[#offsets + 1] = math.floor(tonumber(value) :: number) end
    if #offsets ~= kb_count then return nil, offsets end
    return math.floor(start), offsets
end

local function query_memory(args)
    args = type(args) == "table" and args or {}
    if bool_config(args, "read_enabled", DEFAULTS.read_enabled) == false then
        return {
            success = false,
            error = "Memory recall is disabled for this trait instance.",
            count = 0,
            items = {},
            message = "Memory recall is disabled for this trait instance.",
        }, nil
    end

    local query = trim(tostring(args.query or ""))
    if query == "" then
        return { success = false, error = "query is required" }
    end

    local ids: { string } = {}
    local explicit_kb_id = trim(tostring(args.kb_id or ""))
    if explicit_kb_id ~= "" then
        ids = { explicit_kb_id }
    else
        ids = kb_ids(args)
    end
    if #ids == 0 then
        return { success = false, error = "memory knowledge base is not configured" }
    end

    local limit = math.floor(number_config(args, "limit", number_config(args, "recall_limit", DEFAULTS.recall_limit)))
    local start, offsets = parse_cursor(args.cursor, #ids)
    if not start then
        return { success = false, error = "cursor must be a next_cursor value from a previous SearchMemory result" }
    end

    -- Each knowledge base answers its own ranked page from its offset; the merged
    -- order interleaves them rank by rank in configured KB order. The cursor keeps
    -- each KB's offset and the KB the next rank resumes from, so consecutive pages
    -- walk every match of every KB exactly once.
    local pages: { any } = {}
    for index, kb_id in ipairs(ids) do
        local reader, open_err = open_component(kb_id, deps.component.ACCESS.READ, QUERYABLE_CONTRACT)
        if not reader then return nil, open_err end
        local result, read_err = reader:query({ query = query, offset = offsets[index], limit = limit })
        if read_err then return nil, read_err end
        if result.success == false then
            local failure = shallow_copy(result)
            failure.kb_id = kb_id
            return failure
        end
        local kb_items: { any } = {}
        for _, item in ipairs(result.items or {}) do
            local next_item = shallow_copy(item)
            next_item.kb_id = kb_id
            kb_items[#kb_items + 1] = next_item
        end
        pages[index] = { items = kb_items, more = result.next_offset ~= nil, taken = 0 }
    end

    local items: { any } = {}
    local last = start - 1
    local rank = 1
    while #items < limit do
        local found = false
        for step = 0, #ids - 1 do
            local index = (start - 1 + step) % #ids + 1
            local item = pages[index].items[rank]
            if item and #items < limit then
                items[#items + 1] = item
                pages[index].taken = pages[index].taken + 1
                last = index
                found = true
            end
        end
        if not found then break end
        rank = rank + 1
    end

    local next_offsets: { string } = {}
    local remaining = false
    for index, page in ipairs(pages) do
        next_offsets[index] = tostring(offsets[index] + page.taken)
        if page.more or page.taken < #page.items then remaining = true end
    end
    local next_cursor = remaining and (tostring(last % #ids + 1) .. ":" .. table.concat(next_offsets, ",")) or nil

    local summaries = {}
    for _, item in ipairs(items) do
        local metadata = type(item.metadata) == "table" and item.metadata or {}
        local row = {id = item.id, kb_id = item.kb_id, title = item.title or metadata.title, score = item.score,
            node_type = item.node_type, snippet = item.snippet, source = item.source or metadata.source,
            created_at = item.created_at, updated_at = item.updated_at}
        for _, field in ipairs(args.fields or {}) do
            if field == "*" then
                for key, value in pairs(item) do row[key] = value end
            else row[field] = item[field] end
        end
        summaries[#summaries + 1] = row
    end
    return {
        success = true,
        query = query,
        count = #items,
        items = summaries,
        next_cursor = next_cursor,
        note = "Memory is derived from prior conversations and may be incomplete or inaccurate; use judgment before relying on it.",
    }, nil
end

local function external_id(payload, prompt_result, phase)
    local range = type(prompt_result) == "table" and type(prompt_result.range) == "table" and prompt_result.range or {}
    return table.concat({
        "agent-memory",
        safe_id(payload.agent.id or "agent"),
        safe_id(host_key(payload.host)),
        safe_id(phase or payload.reason or "checkpoint"),
        safe_id(range.from_id or "start"),
        safe_id(range.to_id or "end"),
        safe_id(range.checkpoint_id or "latest"),
    }, ":")
end

local function commit_checkpoint(payload, memory, prompt_result, checkpoint_meta, phase)
    if bool_config(payload, "write_enabled", DEFAULTS.write_enabled) == false then
        return nil, nil
    end

    local normalized, normalize_reason = normalize_memory_digest(memory)
    if not normalized then
        return {
            success = true,
            skipped = true,
            reason = checkpoint_meta and checkpoint_meta.skip_reason or normalize_reason or "no_durable_memory",
        }, nil
    end

    local kb_id = write_kb_id(payload)
    if trim(kb_id) == "" then
        return nil, nil
    end

    local writer, open_err = open_component(kb_id, deps.component.ACCESS.WRITE, EMBEDDABLE_CONTRACT)
    if not writer then return nil, open_err end

    local title = trim(config_value(payload, "memory_title", "Memory Digest"))
    local result, write_err = writer:embed_content({
        content = normalized,
        content_type = "text/markdown",
        title = title,
        external_id = external_id(payload, prompt_result, phase),
        metadata = {
            source = SOURCE,
            node_kind = "agent_memory_checkpoint",
            title = title,
            agent = payload.agent,
            host = payload.host,
            reason = payload.reason,
            phase = phase,
            range = type(prompt_result) == "table" and prompt_result.range or nil,
            checkpoint = checkpoint_meta,
            digest_format = "memory_digest.v1",
        },
        source_ref = {
            kind = "agent_memory",
            origin = SOURCE,
            title = title,
            agent_id = payload.agent.id,
            host = payload.host,
            phase = phase,
            range = type(prompt_result) == "table" and prompt_result.range or nil,
        },
    })
    if write_err then return nil, write_err end
    if type(result) ~= "table" then return nil, "embed_content returned no result" end
    if result.success == false then
        if result.error ~= nil then return nil, result.error end
        return nil, "embed_content reported failure without an error"
    end
    return result, nil
end

function M.apply(payload)
    local valid, err = validate_common(payload)
    if not valid then return nil, err end
    if payload.phase ~= "activate" and payload.phase ~= "deactivate" then
        return { messages = {}, observations = {}, metadata = { ignored = true, phase = payload.phase } }, nil
    end

    if payload.phase == "activate" then
        local items, recall_err = recall_from_kbs(payload)
        if recall_err then return nil, recall_err end
        local content = recall_message(payload, items, number_config(payload, "recall_max_chars", DEFAULTS.recall_max_chars))
        local messages = {}
        if content then
            messages[#messages + 1] = {
                role = "developer",
                content = content,
                metadata = {
                    source = SOURCE,
                    lifecycle_phase = "activate",
                    memory_count = #items,
                },
            }
        end
        return {
            messages = messages,
            observations = {},
            metadata = {
                phase = "activate",
                memory_count = #items,
                kb_count = #kb_ids(payload),
            },
        }, nil
    end

    local text, prompt_result, prompt_err = checkpoint_prompt_text(payload)
    if prompt_err then return nil, prompt_err end
    local memory, checkpoint_meta, checkpoint_err = generate_checkpoint(payload, text)
    if checkpoint_err then return nil, checkpoint_err end
    local commit_result, commit_err = commit_checkpoint(payload, memory, prompt_result, checkpoint_meta, "deactivate")
    if commit_err then return nil, commit_err end
    return {
        observations = {},
        metadata = {
            phase = "deactivate",
            committed = commit_result ~= nil and commit_result.skipped ~= true,
            skipped = commit_result ~= nil and commit_result.skipped == true,
            skip_reason = commit_result and commit_result.reason or nil,
            strategy = checkpoint_meta and checkpoint_meta.strategy,
        },
    }, nil
end

function M.create(payload)
    local valid, err = validate_common(payload)
    if not valid then return nil, err end

    local text, prompt_result, prompt_err = checkpoint_prompt_text(payload)
    if prompt_err then return nil, prompt_err end
    local memory, checkpoint_meta, checkpoint_err = generate_checkpoint(payload, text)
    if checkpoint_err then return nil, checkpoint_err end
    local summary, summary_tokens = "No working conversation state.", {}
    if trim(text) ~= "" then
        local model = trim(payload.agent.model)
        if model == "" then model = trim(config_value(payload, "checkpoint_model", DEFAULTS.checkpoint_model)) end
        local response, summary_err = generate_text(payload, model, text, table.concat({
            "You create a working session checkpoint, separate from durable long-term memory.",
            "Use terse bullets only. Put decisions, open tasks, the current request and constraints first, then essential facts and tool conclusions.",
            "Preserve identifiers, quoted values and numbers exactly. Exclude repetitive background text, raw tool output, narration, headings and duplicate facts.",
            "Include temporary session-only information needed to continue the work, even when it does not belong in durable memory.",
            "Preserve the previous working summary included in the context together with new facts and unfinished work.",
            "Return the complete working summary only; never return NO_DURABLE_MEMORY.",
        }, "\n"))
        if summary_err then return nil, summary_err end
        summary, summary_tokens = response.result, response.tokens or {}
        if is_no_durable_memory(summary) then return nil, "working checkpoint contains no session context" end
    end
    local combined_tokens = shallow_copy(checkpoint_meta and checkpoint_meta.tokens)
    for key, value in pairs(summary_tokens or {}) do
        if type(value) == "number" then combined_tokens[key] = key == "context_tokens" and value or (combined_tokens[key] or 0) + value end
    end
    local commit_result, commit_err = commit_checkpoint(payload, memory, prompt_result, checkpoint_meta, "checkpoint")
    if commit_err then return nil, commit_err end
    local metadata = {
        source = SOURCE,
        strategy = checkpoint_meta and checkpoint_meta.strategy,
        committed = commit_result ~= nil and commit_result.skipped ~= true,
        skipped = commit_result ~= nil and commit_result.skipped == true,
        skip_reason = commit_result and commit_result.reason or checkpoint_meta and checkpoint_meta.skip_reason or nil,
    }
    return {
        memory = memory,
        summary = summary,
        tokens = combined_tokens,
        metadata = metadata,
    }, nil
end

function M.recall(args)
    return query_memory(args)
end

M._private = {
    truncate = truncate,
    kb_ids = kb_ids,
    external_id = external_id,
    normalize_memory_digest = normalize_memory_digest,
    is_no_durable_memory = is_no_durable_memory,
}

return M
