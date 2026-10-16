local json = require("json")
local logger = require("logger")
local llm = require("llm")
local prompt = require("prompt")
local engines = require("engines")
local node_store = require("node_store")

-- KB digest: regenerate a knowledge base's auto_summary / auto_description from
-- its materialized document summaries. Permission-agnostic — it reaches the store
-- through the kb_store contract (no security actor), so it runs from a background
-- projection worker. The trigger + debounce live in the durable digest projection
-- (a coalescing cursor on the KB thread); this library computes and persists the
-- store descriptions. Component public meta is published by the KB meta projection
-- from the digest worker's durable graph.changed event.
local M = {}

local log = logger:named("kb.digest")

type DigestResult = {
    component_id: string,
    store_id: string,
    auto_summary: string,
    auto_description: string,
    summary_count: integer,
}

local DIGEST_SYSTEM_PROMPT = [[You are an expert at summarizing knowledge base contents.

Given a list of document summaries from a knowledge base, generate two descriptions:

1. A short summary (1-2 sentences) that serves as a tagline for the knowledge base.
2. A detailed description covering what topics, content types, and information can be found in this knowledge base (2-5 sentences).

Return a JSON object with exactly two fields:
- "summary": the short 1-2 sentence tagline
- "description": the detailed description

Return ONLY the JSON object, nothing else.]]

local function store_for_component(component_id: string): (any, any, any, string?)
    if component_id == "" then return nil, nil, nil, "component_id is required" end
    local row, err = node_store:get_store({ component_id = component_id })
    if err or not row then return nil, nil, nil, tostring(err or "knowledge base not found") end
    return node_store, row, engines.resolve(row.kb_type), nil
end

local function parse_llm_json(result_text)
    local parsed, parse_err = json.decode(result_text)
    if parse_err or not parsed then
        local json_str = result_text:match("```json%s*(.-)%s*```") or result_text:match("```%s*(.-)%s*```")
        if json_str then
            parsed = json.decode(json_str)
        end
    end
    return parsed
end

local function positive_int_config(config: any, key: string): number?
    local n = tonumber(config[key])
    if not n then return nil end
    n = math.floor(n)
    if n < 1 then return nil end
    return n
end

local function run_store_digest(kb_store_svc: any, store_row: any, engine: any, store_id: string, component_id: string): (DigestResult?, string?)
    local prev_description = store_row.auto_description
    local config = store_row.config
    if type(config) == "string" then
        config = json.decode(config) or {}
    end
    config = engines.apply_default_config(config, engine)

    local summary_model = config.summary_model
    if not summary_model then
        log:warn("no summary_model configured, skipping digest", { store_id = store_id })
        return
    end
    local digest_temperature = tonumber(config.digest_temperature)
    local digest_max_tokens = positive_int_config(config, "digest_max_tokens")
    local digest_context_tokens = positive_int_config(config, "digest_context_tokens")
    local digest_chars_per_token = positive_int_config(config, "digest_chars_per_token")
    if not digest_temperature or not digest_max_tokens or not digest_context_tokens or not digest_chars_per_token then
        log:warn("digest config incomplete, skipping digest", { store_id = store_id })
        return
    end
    local max_context_chars = digest_context_tokens * digest_chars_per_token

    local summary_rows, sum_err = kb_store_svc:list_document_summaries({ store_id = store_id })
    if sum_err or not summary_rows or #summary_rows == 0 then
        log:info("no summaries found", { store_id = store_id })
        return
    end

    local parts: { string } = {}
    local total_chars = 0
    for i, row in ipairs(summary_rows) do
        local meta = row.metadata
        if type(meta) == "string" then
            meta = json.decode(meta) or {}
        end
        meta = meta or {}
        local title = meta.title or ("Document " .. i)
        local part = string.format("## %s\n%s", title, row.content or "")
        total_chars = total_chars + #part
        table.insert(parts, part)
    end

    local p = prompt.new()
    p:add_system(DIGEST_SYSTEM_PROMPT)

    if total_chars > max_context_chars and prev_description and prev_description ~= "" then
        local recent_parts: { string } = {}
        local recent_chars = 0
        local budget = math.floor(max_context_chars * 0.7)
        for i = #parts, 1, -1 do
            if recent_chars + #parts[i] > budget then break end
            table.insert(recent_parts, 1, parts[i])
            recent_chars = recent_chars + #parts[i]
        end
        p:add_user(string.format(
            "This knowledge base previously had the following description:\n\n%s\n\n" ..
            "The following %d new/recent document summaries have been added (out of %d total documents):\n\n%s",
            prev_description, #recent_parts, #parts, table.concat(recent_parts, "\n\n")
        ))
        log:info("using incremental digest", { store_id = store_id, total_docs = #parts, included_docs = #recent_parts, total_chars = total_chars })
    else
        -- No prior description to build on, so the prompt carries the summaries
        -- themselves -- under the same context budget. A knowledge base holds an
        -- unbounded number of documents, so the concatenation is bounded here as
        -- well: the most recent summaries that fit, newest last.
        local included: { string } = {}
        local included_chars = 0
        for i = #parts, 1, -1 do
            if included_chars + #parts[i] > max_context_chars then break end
            table.insert(included, 1, parts[i])
            included_chars = included_chars + #parts[i]
        end
        -- A single summary larger than the whole budget still has to say
        -- something about the knowledge base.
        if #included == 0 and #parts > 0 then
            included = { parts[#parts]:sub(1, max_context_chars) }
        end
        p:add_user(table.concat(included, "\n\n"))
        log:info("using full digest", { store_id = store_id, total_docs = #parts, included_docs = #included, total_chars = total_chars })
    end

    local response, gen_err = llm.generate(p, {
        model = summary_model,
        temperature = digest_temperature,
        max_tokens = digest_max_tokens,
    })
    if gen_err or not response then
        log:error("LLM generation failed", { store_id = store_id, error = gen_err })
        return
    end

    local parsed = parse_llm_json(response.result or "")
    if not parsed then
        log:error("failed to parse LLM response", { store_id = store_id, response = response.result })
        return
    end

    local auto_summary = parsed.summary or ""
    local auto_description = parsed.description or ""

    local _, update_err = kb_store_svc:set_descriptions({
        store_id = store_id,
        auto_summary = auto_summary,
        auto_description = auto_description,
    })
    if update_err then
        log:error("update failed", { store_id = store_id, error = update_err })
        return
    end

    log:info("knowledge descriptions updated", {
        store_id = store_id, documents = #summary_rows,
        summary_len = #auto_summary, description_len = #auto_description,
    })
    return ({
        component_id = component_id,
        store_id = store_id,
        auto_summary = auto_summary,
        auto_description = auto_description,
        summary_count = #summary_rows,
    } :: DigestResult)
end

-- Regenerate the KB descriptions for one component.
function M.run_for_component(component_id: string): (DigestResult?, string?)
    if component_id == "" then
        log:warn("digest skipped: component_id required")
        return
    end
    local kb_store_svc, store_row, engine, ks_err = store_for_component(component_id)
    if not kb_store_svc then
        log:error("kb_store unavailable", { component_id = component_id, error = ks_err })
        return
    end
    return run_store_digest(kb_store_svc, store_row, engine, tostring(store_row.id or component_id), component_id)
end

return M
