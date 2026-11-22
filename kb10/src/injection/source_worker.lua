-- Generic, source-agnostic projection worker for Wippy KBs.
--
-- The worker has zero knowledge of any particular source. It discovers
-- extractors at runtime by querying the registry for `function.lua` entries
-- whose `meta.type == "projection.extractor"` and dispatches each event to
-- the extractor that declares its `event.type` in `meta.event_types`.
-- Plugins own their own extractors.
--
-- Extractor contract (function.lua):
--   input  = { event = { id, seq, type, body, ... } [, options = {...}] }
--   output = { documents = [{ external_source, external_id,
--                              external_version, content, content_type,
--                              title?, embed_text, metadata, node_type? }, ...] }
--          | { documents = [], error = "...", retryable? = true }
-- Verified immutable artifact failures return {rejection = {document, code}}.
-- Retryable extractor failures return to the projection job;
-- ordinary extractor validation errors keep their existing skip behavior.
--
-- The worker:
--   1. Builds an event_type → extractor_id map from the registry.
--   2. Calls each extractor, collecting `documents`.
--   3. For each target KB whose engine declares source materialization,
--      atomically replaces each
--      materialized source-document tree through the KB engine's declared
--      internal materializer_store surface by canonical (external_source, external_id), so
--      re-ingestion is an in-place replace, not an append.
--   4. One bulk `llm.embed` round-trip per target KB. No tool loops.

local json = require("json")
local time = require("time")
local base64 = require("base64")
local logger = require("logger"):named("knowledge.injection.source_worker")
local job_types = require("job_types")
local registry = require("registry")
local funcs = require("funcs")
local component = require("component")
local uuid = require("uuid")
local trim = require("text_trim").trim

local llm = require("llm")
local prompt = require("prompt")
local artifact_content_repo = require("artifact_content_repo")
local source_materializer = require("source_materializer")
local source_deadline = require("source_deadline")
local materializer_store = require("materializer_store")
local execution_identity = require("execution_identity")
local enrichment_consts = require("enrichment_consts")

local CONTENT_DELETED = "kickside.knowledge.events:content.deleted"
local EXTRACTOR_META_TYPE = "projection.extractor"

-- Hard caps to keep a single batch from fanning a malformed projection or a
-- runaway extractor into thousands of writes per tick. The worker is reactive
-- to events that already passed validation, so these are belt-and-suspenders.
local MAX_TARGET_KBS = 10
local DEFAULT_MAX_PENDING_DOCUMENTS = 1000
local DEFAULT_MAX_PENDING_DELETES = 1000
local MAX_PENDING_ITEMS_GUARD = 10000
local MAX_DEAD_LETTERED_BATCHES = 50
local DIGEST_REQUEST_EVENT_TYPE = "kickside.knowledge.events:digest.requested"
local DIGEST_REQUEST_EXTERNAL_SOURCE = "knowledge.source.finalizer"
local GRAPH_CHANGED_EVENT_TYPE = "kickside.knowledge.events:graph.changed"
local GRAPH_CHANGED_EXTERNAL_SOURCE = "knowledge.graph.meta"
-- Companion finalizer marker for graph treatment (concept dedup). Same shape and
-- source as digest.requested; emitted on the same post-materialization batch so the
-- digest projection that already consumes the thread can drive treatment too.
local TREATMENT_REQUEST_EVENT_TYPE = "kickside.knowledge.events:treatment.requested"

local function configured_pending_cap(worker_config: any, key: string, default_value: integer): integer
    local cfg = type(worker_config) == "table" and worker_config or {}
    local limits = type(cfg.limits) == "table" and cfg.limits or {}
    local raw = cfg[key]
    if raw == nil then raw = limits[key] end
    local n = tonumber(raw)
    if not n or n ~= math.floor(n) then return default_value end
    if n < 1 then return 1 end
    if n > MAX_PENDING_ITEMS_GUARD then return MAX_PENDING_ITEMS_GUARD end
    return n :: integer
end

local function lineage_string_conflict(field: string, value: any, expected: string): string?
    local current = trim(value)
    if expected ~= "" and current ~= "" and current ~= expected then
        return field .. " mismatch: expected " .. expected .. ", got " .. current
    end
    return nil
end

local function lineage_seq_conflict(field: string, value: any, expected: number?): string?
    if expected == nil or value == nil then return nil end
    if type(value) == "string" and trim(value) == "" then return nil end
    local current = tonumber(value)
    if current == nil then return field .. " must be numeric" end
    if current ~= expected then
        return field .. " mismatch: expected " .. tostring(expected) .. ", got " .. tostring(current)
    end
    return nil
end

local function decode_object(value: any): { [string]: any }
    if type(value) == "table" then return value :: { [string]: any } end
    if type(value) ~= "string" or value == "" then return {} end
    local decoded, err = json.decode(value :: string)
    if not err and type(decoded) == "table" then return decoded :: { [string]: any } end
    return {}
end

local function selected_document_id(event: table, thread_id: string): (string?, error?)
    local body = event.body
    local meta = type(body) == "table" and body.metadata or nil
    if event.type ~= CONTENT_DELETED or type(meta) ~= "table" or meta.node_id == nil then return nil, nil end
    if event.role ~= "system" or body.kb_id ~= thread_id
        or type(meta.node_id) ~= "string" or not uuid.validate(meta.node_id) then
        return nil, errors.new({kind = errors.INVALID, message = "invalid selected document delete"})
    end
    return meta.node_id, nil
end

local function ensure_source_lineage(item: any, event: any, thread_id: string): (boolean?, string?)
    if type(item) ~= "table" then return nil, "source item must be an object" end
    local metadata = type(item.metadata) == "table" and item.metadata or {}
    item.metadata = metadata
    local event_seq = tonumber(event and event.seq)
    local event_id = trim(event and event.id)
    local source_ref = type(item.source_ref) == "table" and item.source_ref
        or type(metadata.source_ref) == "table" and metadata.source_ref
        or nil

    local err = lineage_string_conflict("item.thread_id", item.thread_id, thread_id)
    if err then return nil, err end
    err = lineage_string_conflict("metadata.thread_id", metadata.thread_id, thread_id)
    if err then return nil, err end
    if type(source_ref) == "table" then
        err = lineage_string_conflict("source_ref.thread_id", source_ref.thread_id, thread_id)
        if err then return nil, err end
    end
    if thread_id ~= "" then
        metadata.thread_id = thread_id
        item.thread_id = thread_id
    end

    err = lineage_string_conflict("item.thread_event_id", item.thread_event_id, event_id)
    if err then return nil, err end
    err = lineage_string_conflict("metadata.thread_event_id", metadata.thread_event_id, event_id)
    if err then return nil, err end
    if type(source_ref) == "table" then
        err = lineage_string_conflict("source_ref.thread_event_id", source_ref.thread_event_id, event_id)
        if err then return nil, err end
    end
    if event_id ~= "" then
        metadata.thread_event_id = event_id
        item.thread_event_id = event_id
    end

    err = lineage_seq_conflict("item.thread_event_seq", item.thread_event_seq, event_seq)
    if err then return nil, err end
    err = lineage_seq_conflict("metadata.thread_event_seq", metadata.thread_event_seq, event_seq)
    if err then return nil, err end
    if type(source_ref) == "table" then
        err = lineage_seq_conflict("source_ref.thread_event_seq", source_ref.thread_event_seq, event_seq)
        if err then return nil, err end
    end
    if event_seq ~= nil then
        metadata.thread_event_seq = event_seq
        item.thread_event_seq = event_seq
    end

    local event_external = type(event and event.external) == "table" and event.external or {}
    local external_id = trim(item.external_id)
    if external_id == "" then external_id = trim(metadata.external_id) end
    if external_id == "" and type(source_ref) == "table" then external_id = trim(source_ref.external_id) end
    if external_id == "" then external_id = trim(event_external.external_id) end
    local external_source = trim(item.external_source)
    if external_source == "" then external_source = trim(metadata.external_source) end
    if external_source == "" and type(source_ref) == "table" then external_source = trim(source_ref.external_source) end
    if external_source == "" then external_source = trim(event_external.external_source) end
    local external_version = trim(item.external_version)
    if external_version == "" then external_version = trim(metadata.external_version) end
    if external_version == "" and type(source_ref) == "table" then external_version = trim(source_ref.external_version) end
    if external_version == "" then external_version = trim(event_external.external_version) end
    if external_version == "" and event_id ~= "" then external_version = "event:" .. event_id end

    err = lineage_string_conflict("metadata.external_source", metadata.external_source, external_source)
    if err then return nil, err end
    err = lineage_string_conflict("metadata.external_id", metadata.external_id, external_id)
    if err then return nil, err end
    err = lineage_string_conflict("metadata.external_version", metadata.external_version, external_version)
    if err then return nil, err end
    if type(source_ref) == "table" then
        err = lineage_string_conflict("source_ref.external_source", source_ref.external_source, external_source)
        if err then return nil, err end
        err = lineage_string_conflict("source_ref.external_id", source_ref.external_id, external_id)
        if err then return nil, err end
        err = lineage_string_conflict("source_ref.external_version", source_ref.external_version, external_version)
        if err then return nil, err end
    end

    if external_source ~= "" then
        metadata.external_source = external_source
        if trim(item.external_source) == "" then item.external_source = external_source end
    end
    if external_id ~= "" then
        metadata.external_id = external_id
        if trim(item.external_id) == "" then item.external_id = external_id end
    end
    if external_version ~= "" then
        metadata.external_version = external_version
        if trim(item.external_version) == "" then item.external_version = external_version end
    end

    if type(source_ref) ~= "table" and external_id ~= "" then
        source_ref = {
            kind = "source",
            origin = "projection.extractor",
            external_source = external_source ~= "" and external_source or nil,
            external_id = external_id,
            external_version = external_version ~= "" and external_version or nil,
            thread_event_id = metadata.thread_event_id,
            thread_event_seq = metadata.thread_event_seq,
        }
    end
    if type(source_ref) == "table" then
        if trim(source_ref.external_id) == "" and external_id ~= "" then source_ref.external_id = external_id end
        if trim(source_ref.external_source) == "" and external_source ~= "" then source_ref.external_source = external_source end
        if trim(source_ref.external_version) == "" and external_version ~= "" then source_ref.external_version = external_version end
        if thread_id ~= "" then source_ref.thread_id = thread_id end
        if event_id ~= "" then source_ref.thread_event_id = event_id end
        if event_seq ~= nil then source_ref.thread_event_seq = event_seq end
        item.source_ref = source_ref
        metadata.source_ref = source_ref
    end
    return true, nil
end

local function resolve_worker_config(input_worker_config: any, projection: any): { [string]: any }
    if type(input_worker_config) == "table" then return input_worker_config :: { [string]: any } end
    local proj = type(projection) == "table" and projection or {}
    if type(proj.worker_config) == "table" then return proj.worker_config :: { [string]: any } end
    local body = decode_object(proj.body)
    if type(body.worker_config) == "table" then return body.worker_config :: { [string]: any } end
    return {}
end

local function dead_lettered_batches(projection: any, entry: table): {table}
    local proj = type(projection) == "table" and projection or {}
    local body = decode_object(proj.body)
    local prior = type(body.dead_lettered_batches) == "table" and body.dead_lettered_batches or {}
    local out: {table} = {}
    local start = 1
    if #prior >= MAX_DEAD_LETTERED_BATCHES then
        start = #prior - MAX_DEAD_LETTERED_BATCHES + 2
    end
    for i = start, #prior do
        if type(prior[i]) == "table" then
            out[#out + 1] = prior[i]
        end
    end
    out[#out + 1] = entry
    return out
end

-- Build a fresh event_type → extractor_id map from the registry. Called once
-- per worker invocation so newly-registered plugin extractors are picked up
-- without restarts.
-- Build two dispatch tables in one pass:
--   * by_source_type["<source>:<event_type>"]  → exact match (preferred)
--   * by_type["<event_type>"]                  → fallback when only one
--                                                  extractor claims that type
--
-- Many plugins emit overlapping event types (`issue.created` is both Jira
-- and GitHub; `message.created` is Discord and Telegram). Dispatching by
-- event.type alone causes silent cross-routing — events go to the wrong
-- extractor and fail with confusing field errors. Keying on
-- (external_source, event_type) avoids it. The fallback by type-only stays
-- so plugins that don't declare meta.source still work.
local function discover_extractors()
    local entries, err = registry.find({ [".kind"] = "function.lua" })
    if err then return nil, err end

    local by_source_type = {}
    local by_type = {}
    local type_owners = {}    -- event_type → set of extractor ids claiming it
    local conflicts = {}

    for _, entry in ipairs(entries or {}) do
        local meta = type(entry.meta) == "table" and entry.meta or {}
        if meta.type == EXTRACTOR_META_TYPE and type(meta.event_types) == "table" then
            local source = type(meta.source) == "string" and meta.source ~= "" and meta.source or nil
            for _, etype in ipairs(meta.event_types) do
                if type(etype) == "string" and etype ~= "" then
                    if source then
                        local key = source .. ":" .. etype
                        if by_source_type[key] and by_source_type[key] ~= entry.id then
                            conflicts[#conflicts + 1] = {
                                source = source, event_type = etype,
                                kept = by_source_type[key], dropped = entry.id,
                            }
                        else
                            by_source_type[key] = entry.id
                        end
                    end
                    type_owners[etype] = type_owners[etype] or {}
                    type_owners[etype][entry.id] = true
                end
            end
        end
    end

    -- Type-only fallback works only when exactly one extractor claims it.
    -- Otherwise we'd silently pick a wrong source again.
    for etype, owners in pairs(type_owners) do
        local count = 0
        local sole_id = nil
        for id in pairs(owners) do
            count = count + 1
            sole_id = id
        end
        if count == 1 then by_type[etype] = sole_id end
    end

    for _, c in ipairs(conflicts) do
        logger:warn("multiple extractors claim (source, event_type)", c)
    end
    return { by_source_type = by_source_type, by_type = by_type }, nil
end

local function default_dispatcher(event, deps)
    deps = deps or {}
    local extractor_map = deps._extractor_map
    if not extractor_map then
        local discovered, err = discover_extractors()
        if err then return nil, err, true end
        extractor_map = discovered
        deps._extractor_map = extractor_map
    end

    -- Prefer (event.external.external_source, event.type) match — that's the
    -- only way to disambiguate when multiple plugins claim the same event
    -- type (e.g. issue.created on both Jira and GitHub).
    local extractor_id = nil
    local source = event.external and event.external.external_source
    if source == "knowledge.kb.versioned_delete" and event.type == "kickside.knowledge.events:content.deleted" then
        source = "knowledge.kb"
    end
    if type(source) == "string" and source ~= "" then
        extractor_id = extractor_map.by_source_type[source .. ":" .. event.type]
    end
    if not extractor_id then
        extractor_id = extractor_map.by_type[event.type]
    end
    if not extractor_id then
        return nil, nil  -- nil items, nil err: caller treats as "no extractor"
    end

    local result, call_err = funcs.call(extractor_id, { event = event })
    if call_err then return nil, call_err, true end

    if type(result) ~= "table" then
        return nil, "extractor returned invalid result"
    end

    if result.error and result.error ~= "" then
        return nil, "extractor error: " .. tostring(result.error), result.retryable == true
    end

    if type(result.rejection) == "table" and type(result.rejection.document) == "table" then
        return {documents = {result.rejection.document}, rejection = result.rejection}, nil
    end
    return {
        documents = type(result.documents) == "table" and result.documents or {},
        deletes = type(result.deletes) == "table" and result.deletes or {},
    }, nil
end

------------------------------------------------------------------------ materializer
-- kb10 is the concrete engine this worker materializes into: it writes source
-- document/summary/chunk/image nodes into the kb10 store directly through the
-- in-module materializer_store adapter (plain kb10_store calls, no contract, no
-- cross-engine enumeration). A KB not owned by the kb10 store yields no target.

-- Resolve the kb10 materializer target for a KB component: load the component's
-- store row and shape the engine from the row's kb_type for the graph/is_graph
-- branches. Returns (nil, nil) when the kb10 store does not own the component so
-- the batch reports "no source materializer".
local function resolve_materialized_store(component_id: string, deps: any, fanout_snapshot: boolean?): (any?, any?)
    if type(deps.resolve_materialized_store) == "function" then
        return deps.resolve_materialized_store(component_id, fanout_snapshot)
    end

    local store = materializer_store
    local row, row_err = store.get_store(store, {component_id = component_id, fanout_snapshot = fanout_snapshot})
    if row_err then return nil, row_err end
    if not row then return nil, nil end

    local engine, engine_err = source_materializer.resolve_engine(row)
    if engine_err then return nil, engine_err end
    return {
        store = store,
        store_row = row,
        engine = engine,
    }, nil
end

-- Per-call timeouts on every materialization LLM/embed round-trip. Without them a
-- single tower request that never returns (a throttled free model, a pathological
-- input) blocks the worker forever -- and because the proc lease heartbeat keeps
-- renewing, the cursor never fails over and the runner slot is wedged. With a
-- timeout the call returns an error, the document fails in isolation
-- (materialize_one), and the batch proceeds.
local EMBED_TIMEOUT_SECONDS = 90
local SUMMARY_TIMEOUT_SECONDS = 60
local ENRICH_TIMEOUT_SECONDS = 45

local function default_embedder(texts, model, dims, timeout, invoke)
    return (invoke or llm.embed)(texts, {
        model = model,
        dimensions = dims,
        timeout = timeout or EMBED_TIMEOUT_SECONDS,
    })
end

-- Bound the document handed to the summary model to one context window; the LLM
-- still produces a faithful compression of the document's substance from it.
local SUMMARY_INPUT_CHARS = 48000
local SUMMARY_SYSTEM = "You compress a document into a dense, faithful summary. " ..
    "Capture its purpose, key topics, entities, and structure using only information present in the document. " ..
    "Output the summary prose only, no preamble or headings."

-- Sentence-terminal punctuation, optionally followed by a closing quote/paren,
-- at the end of the string.
local SENTENCE_END = "[%.!?][\"'%)%]]*%s*$"

-- If the model's response was cut mid-sentence by the max_tokens ceiling, trim
-- it back to the last sentence it actually finished rather than store a
-- mid-word fragment. A response that already ends cleanly is returned as-is;
-- one with no sentence boundary at all (a single unterminated clause) is
-- returned untouched too -- there is nothing complete to trim back to, and
-- that is still a better failure than truncating on a token/character count.
local function trimmed_to_last_sentence(text: string): string
    if text:match(SENTENCE_END) then return text end
    local last_end = nil
    local search_from = 1
    while true do
        local s, e = text:find("[%.!?][\"'%)%]]*", search_from)
        if not s or not e then break end
        last_end = e
        search_from = e + 1
    end
    if not last_end then return text end
    return trim(text:sub(1, last_end))
end

-- LLM-compress a document into a summary of at most target_chars using the KB's
-- summary model (the same model the digest uses; llm.generate resolves a class
-- spec like "class:fast"). Returns (nil, cause) when the model call fails, so a
-- caller can report why; an input the summarizer does not apply to (no content,
-- no model, no length budget) is (nil, nil), not a failure. The materializer
-- falls back to the deterministic head summary in either case.
local function default_summarizer(content: any, model: any, target_chars: any, summary_prompt: any,
        budget: number?, invoke: any?): (string?, any?)
    if type(content) ~= "string" or content == "" then return nil, nil end
    if type(model) ~= "string" or model == "" then return nil, nil end
    local target_raw = tonumber(target_chars)
    if not target_raw or target_raw <= 0 then return nil, nil end
    local target = math.floor(target_raw :: number)

    local body = content :: string
    if #body > SUMMARY_INPUT_CHARS then body = body:sub(1, SUMMARY_INPUT_CHARS) end

    local p = prompt.new()
    p:add_system(SUMMARY_SYSTEM)
    -- The KB owner's summary instructions are a standing policy for every
    -- document in this KB -- what to capture, in what voice, in what shape.
    -- They ride the system turn so the document text cannot talk over them.
    local extra = trim(summary_prompt)
    if extra ~= "" then
        p:add_system("Additional instructions from the knowledge base owner:\n" .. extra)
    end
    p:add_user(string.format("Summarize the following document in about %d characters.\n\n%s", target, body))

    local response, gen_err = (invoke or llm.generate)(p, {
        model = model,
        temperature = 0.2,
        -- The token ceiling carries headroom over the character target so the
        -- model closes its last sentence rather than being cut mid-word. English
        -- prose runs well under 2 characters per token, so a budget of roughly
        -- one token per target character -- the safe end of the range -- leaves
        -- real room to wind down after reaching the target.
        max_tokens = math.max(400, target),
        timeout = budget or SUMMARY_TIMEOUT_SECONDS,
    })
    if gen_err or not response then return nil, budget and gen_err or tostring(gen_err or "no response") end
    local out = (response :: any).result
    if type(out) ~= "string" or trim(out) == "" then return nil, "summary model returned no text" end
    -- target is guidance for the model, never a chop: a hard sub() to target
    -- chars would end a summary mid-word, which is worse than a slightly longer
    -- summary. A response that does hit the token ceiling is trimmed back to the
    -- last sentence the model finished -- a stored summary never ends mid-word.
    return trimmed_to_last_sentence(out :: string)
end

-- Bound the document context (the summary, else the document head) handed to the
-- enrichment model.
local ENRICH_CONTEXT_CHARS = 6000
local ENRICH_SYSTEM = "You situate a text chunk within its source document for retrieval. " ..
    "Given the document context and a chunk, write ONE short sentence describing which part of the " ..
    "document the chunk is from and its topic. Output only that sentence, no preamble."

local ENRICH_BATCH_SYSTEM = "You situate text chunks within their source document for retrieval. " ..
    "Given the document context and an ordered JSON array of chunks, return a strict JSON array with " ..
    "exactly one short context sentence per input chunk, in the same order. Return only JSON."

-- Contextual retrieval: produce a one-line context that situates a chunk within
-- its document, using the KB's chunk-enrichment model. Returns nil on any failure
-- so the chunk embeds without a prefix.
local function default_enricher(content: any, summary: any, chunk: any, model: any): (string?, string?)
    if type(chunk) ~= "string" or chunk == "" then return nil, nil end
    if type(model) ~= "string" or model == "" then return nil, nil end
    local doc_context = (type(summary) == "string" and summary ~= "") and summary or ""
    if doc_context == "" and type(content) == "string" and content ~= "" then
        doc_context = (content :: string):sub(1, ENRICH_CONTEXT_CHARS)
    end
    if doc_context == "" then return nil, nil end

    local p = prompt.new()
    p:add_system(ENRICH_SYSTEM)
    p:add_user(string.format("Document context:\n%s\n\nChunk:\n%s\n\nContext sentence:", doc_context, chunk))

    local response, gen_err = llm.generate(p, { model = model, temperature = 0.2, max_tokens = 120, timeout = ENRICH_TIMEOUT_SECONDS })
    if gen_err or not response then return nil, tostring(gen_err or "no response") end
    local out = (response :: any).result
    if type(out) ~= "string" or trim(out) == "" then return nil, nil end
    return trim(out), nil
end

local function strip_json_fence(s: string): string
    local out = trim(s)
    if out:sub(1, 3) == "```" then
        out = out:gsub("^```[%w_-]*%s*", ""):gsub("%s*```$", "")
    end
    return trim(out)
end

local function default_batch_enricher(content: any, summary: any, chunks: any, model: any, budget: number?, invoke: any?): (any?, any?)
    if type(chunks) ~= "table" or #chunks == 0 then return {}, nil end
    if type(model) ~= "string" or model == "" then return nil, nil end
    local doc_context = (type(summary) == "string" and summary ~= "") and summary or ""
    if doc_context == "" and type(content) == "string" and content ~= "" then
        doc_context = (content :: string):sub(1, ENRICH_CONTEXT_CHARS)
    end
    if doc_context == "" then return nil, nil end

    local items: {any} = {}
    for i, chunk in ipairs(chunks) do
        items[#items + 1] = {
            index = i,
            text = type(chunk) == "string" and chunk or "",
        }
    end
    local chunks_json, enc_err = json.encode(items)
    if enc_err or type(chunks_json) ~= "string" then
        return nil, "encode enrichment batch failed: " .. tostring(enc_err)
    end

    local p = prompt.new()
    p:add_system(ENRICH_BATCH_SYSTEM)
    p:add_user(string.format("Document context:\n%s\n\nChunks JSON:\n%s", doc_context, chunks_json))

    local response, gen_err = (invoke or llm.generate)(p, {
        model = model,
        temperature = 0.2,
        max_tokens = math.max(256, math.min(1600, #chunks * 48)),
        timeout = budget or ENRICH_TIMEOUT_SECONDS,
    })
    if gen_err or not response then return nil, budget and gen_err or tostring(gen_err or "no response") end
    local out = (response :: any).result
    if type(out) ~= "string" or trim(out) == "" then return nil, "empty enrichment batch response" end

    local decoded, dec_err = json.decode(strip_json_fence(out :: string))
    if dec_err or type(decoded) ~= "table" then
        return nil, "enrichment batch returned non-json: " .. tostring(dec_err)
    end
    local prefixes: {string} = {}
    for i = 1, #chunks do
        local value = (decoded :: any)[i]
        if type(value) == "table" then
            value = value.context or value.prefix or value.text
        end
        prefixes[i] = trim(value)
    end
    return prefixes, nil
end

-- Read an extracted image's bytes from its upload artifact. The image reference
-- carries the upload_id + artifact_id the materializer enumerated at ingest.
local function default_image_loader(image: any): (string?, string?)
    if type(image) ~= "table" then return nil, "image reference missing" end
    local upload_id = trim(image.upload_id)
    local artifact_id = trim(image.artifact_id)
    if upload_id == "" or artifact_id == "" then return nil, "image reference missing upload_id/artifact_id" end
    local content, read_err = artifact_content_repo.read_artifact_content(upload_id, artifact_id)
    if read_err or type(content) ~= "string" or content == "" then
        return nil, "read image artifact failed: " .. tostring(read_err or "empty")
    end
    return content, nil
end

local CAPTION_CONTEXT_CHARS = 4000
local CAPTION_SYSTEM = "You describe a diagram or figure from a document for retrieval. " ..
    "Given the surrounding document context and the image, write a concise factual description " ..
    "of what the image shows and how it relates to the context. Output the description only, no preamble."

-- Caption an image in the context of its host chunk with the KB's caption model.
-- Loads the bytes via image_loader, then sends a multimodal user message (context
-- text + image) to a vision-capable model. Returns nil on any failure so the
-- image yields no node.
local function default_captioner(image: any, context: any, model: any, image_loader: any?): (string?, string?)
    if type(image) ~= "table" then return nil, nil end
    if type(model) ~= "string" or model == "" then return nil, nil end
    local mime = type(image.content_type) == "string" and image.content_type ~= "" and image.content_type or "image/png"

    local loader = image_loader or default_image_loader
    local bytes, load_err = loader(image)
    if load_err or type(bytes) ~= "string" or bytes == "" then return nil, nil end

    local encoded, enc_err = base64.encode(bytes)
    if enc_err or type(encoded) ~= "string" or encoded == "" then return nil, nil end

    local doc_context = type(context) == "string" and context or ""
    if #doc_context > CAPTION_CONTEXT_CHARS then doc_context = doc_context:sub(1, CAPTION_CONTEXT_CHARS) end

    local p = prompt.new()
    p:add_system(CAPTION_SYSTEM)
    p:add_message(prompt.ROLE.USER, {
        prompt.text(string.format("Document context:\n%s\n\nDescribe the image:", doc_context)),
        prompt.image_base64(mime, encoded),
    })

    local response, gen_err = llm.generate(p, { model = model, temperature = 0.2, max_tokens = 300, timeout = SUMMARY_TIMEOUT_SECONDS })
    if gen_err or not response then return nil, tostring(gen_err or "no response") end
    local out = (response :: any).result
    if type(out) ~= "string" or trim(out) == "" then return nil, nil end
    return trim(out), nil
end

local function checked_result(result: any, default_component_id: string, kind: string): (any?, string?)
    if type(result) ~= "table" then
        return nil, "source materializer returned no " .. kind .. " result"
    end
    result.component_id = trim(result.component_id) ~= "" and result.component_id or default_component_id
    result.kind = trim(result.kind) ~= "" and result.kind or kind
    return result, nil
end

local function projection_source_key(external_source: any, external_id: any): (string?, string, string)
    local source, id = trim(external_source), trim(external_id)
    if source == "" then source = "knowledge.kb" end
    return id ~= "" and source .. ":" .. id or nil, source, id
end

local function projection_body(projection: any): table
    local body = decode_object(type(projection) == "table" and projection.body or nil)
    body.kbs = type(body.kbs) == "table" and body.kbs or {}
    return body
end

local function kb_state(body: table, kb_id: string): table
    local kbs = body.kbs :: table
    local state = type(kbs[kb_id]) == "table" and kbs[kb_id] or {}
    state.sources = type(state.sources) == "table" and state.sources or {}
    kbs[kb_id] = state
    return state
end

local function apply_document_result(state: table, result: any): ()
    local sources = state.sources :: table
    for _, n in ipairs(type(result.notifications) == "table" and result.notifications or {}) do
        local key, source, id = projection_source_key(n.external_source, n.external_id)
        local status = trim(n.status)
        local previous = key and sources[key]
        if key and (type(previous) ~= "table" or (previous.external_source == source and previous.external_id == id)) and
            (status == "completed" or (status == "failed" and n.persisted ~= false and n.retained ~= true)) then
            sources[key] = {
                external_source = source,
                external_id = id,
                external_version = trim(n.external_version) ~= "" and trim(n.external_version) or nil,
                document_node_id = n.document_node_id,
                status = status,
                error = status == "failed" and tostring(n.error or "document materialization failed") or nil,
                summary_count = tonumber(n.summary_count) or 0,
                chunk_count = tonumber(n.chunk_count) or 0,
                updated_at = time.now():utc():format(time.RFC3339),
            }
        end
    end
end

local function request_graph_placement(deps: any, kb_id: string, target: any, result: any): (boolean?, string?)
    local engine = type(target) == "table" and target.engine or nil
    if not (type(engine) == "table" and engine.is_graph == true) then
        return true, nil
    end

    local store_row = type(target.store_row) == "table" and target.store_row or {}
    local store_id = trim(store_row.id)
    if store_id == "" then store_id = kb_id end

    local identity_row = type(deps.execution_identity_row) == "table" and deps.execution_identity_row or nil
    if not identity_row then
        local frozen, capture_err = execution_identity.capture()
        if capture_err or not frozen then
            return nil, "graph placement identity capture failed: " .. tostring(capture_err)
        end
        local row, row_err = execution_identity.to_row(frozen)
        if row_err or not row then
            return nil, "graph placement identity encode failed: " .. tostring(row_err)
        end
        identity_row = row
    end

    local send = (type(deps) == "table" and deps.send) or process.send
    local requested = 0
    for _, n in ipairs(type(result.notifications) == "table" and result.notifications or {}) do
        if trim(n.status) == "completed" then
            local document_node_id = trim(n.document_node_id)
            if document_node_id ~= "" then
                local user_id = trim(n.user_id)
                local sent, send_err = send(enrichment_consts.PROCESS, enrichment_consts.TOPIC, {
                    store_id = store_id,
                    component_id = kb_id,
                    document_node_id = document_node_id,
                    user_id = user_id ~= "" and user_id or nil,
                    execution_identity = identity_row,
                })
                if send_err or sent == false then
                    return nil, "graph placement request failed: " .. tostring(send_err or "process.send failed")
                end
                requested = requested + 1
            end
        end
    end

    if requested > 0 then
        logger:info("graph placement requested", {
            kb_id = kb_id,
            store_id = store_id,
            documents = requested,
        })
    end
    return true, nil
end

local function apply_delete_result(state: table, result: any): ()
    local sources = state.sources :: table
    for _, n in ipairs(type(result.notifications) == "table" and result.notifications or {}) do
        local key = projection_source_key(n.external_source, n.external_id)
        local entry = key and sources[key]
        if type(entry) == "table" and n.document_node_id and entry.document_node_id == n.document_node_id then
            sources[key] = nil
        end
    end
end

type IngestMetrics = {
    events_seen: number, events_extracted: number, events_unsupported: number,
    documents_emitted: number, deletes_emitted: number,
    documents_inserted: number, documents_replaced: number,
    documents_removed: number, items_failed: number,
}

local function digest_request_writes(thread_id: string, projection_id: string, target_kb_ids: { string },
        target_seq: number, from_seq: number?, to_seq: number?): { table }?
    local events = {}
    for _, kb_id in ipairs(target_kb_ids) do
        local body = {
            kb_id = kb_id,
            reason = "source_complete",
            source_thread_id = thread_id,
            source_projection_id = projection_id,
            source_from_seq = from_seq,
            source_to_seq = to_seq,
            source_target_seq = target_seq,
        }
        events[#events + 1] = {
            type = DIGEST_REQUEST_EVENT_TYPE,
            role = "system",
            body = body,
            external = {
                external_source = DIGEST_REQUEST_EXTERNAL_SOURCE,
                external_id = "digest-request:" .. kb_id .. ":" .. projection_id .. ":" .. tostring(math.floor(target_seq)),
                external_version = "v1",
            },
        }
        events[#events + 1] = {
            type = TREATMENT_REQUEST_EVENT_TYPE,
            role = "system",
            body = body,
            external = {
                external_source = DIGEST_REQUEST_EXTERNAL_SOURCE,
                external_id = "treatment-request:" .. kb_id .. ":" .. projection_id .. ":" .. tostring(math.floor(target_seq)),
                external_version = "v1",
            },
        }
    end

    if #events == 0 then return nil end
    return { { thread_id = thread_id, events = events } }
end

local function build_digest_request_writes(range: table, thread_id: string, projection_id: string,
        target_kb_ids: { string }, from_seq: number?, to_seq: number?): { table }?
    local target_seq = tonumber(range.target_seq)
    local range_to_seq = tonumber(range.to_seq) or tonumber(to_seq)
    if not target_seq or not range_to_seq or range_to_seq < target_seq then
        return nil
    end
    return digest_request_writes(thread_id, projection_id, target_kb_ids, target_seq, from_seq, to_seq)
end

local function result_deltas(kb_id: string, results: { any }): table
    local delta = {
        document_delta = 0,
        chunk_delta = 0,
        summary_delta = 0,
        embedding_delta = 0,
        failed_delta = 0,
    }
    for _, result in ipairs(results or {}) do
        if type(result) == "table" and trim(result.component_id) == kb_id then
            for _, n in ipairs(type(result.notifications) == "table" and result.notifications or {}) do
                local explicit_document = tonumber(n.document_delta)
                local explicit_chunk = tonumber(n.chunk_delta)
                local explicit_summary = tonumber(n.summary_delta)
                local explicit_embedding = tonumber(n.embedding_delta)
                local explicit_failed = tonumber(n.failed_delta)
                if explicit_document or explicit_chunk or explicit_summary or explicit_embedding or explicit_failed then
                    delta.document_delta = delta.document_delta + (explicit_document or 0)
                    delta.chunk_delta = delta.chunk_delta + (explicit_chunk or 0)
                    delta.summary_delta = delta.summary_delta + (explicit_summary or 0)
                    delta.embedding_delta = delta.embedding_delta + (explicit_embedding or 0)
                    delta.failed_delta = delta.failed_delta + (explicit_failed or 0)
                else
                    local removed_documents = tonumber(n.removed_document_count) or tonumber(n.removed) or 0
                    local removed_failed = tonumber(n.removed_failed_document_count) or 0
                    local removed_chunks = tonumber(n.removed_chunk_count) or 0
                    local removed_summaries = tonumber(n.removed_summary_count) or 0
                    local status = trim(n.status)
                    if status == "completed" then
                        local chunks = tonumber(n.chunk_count) or 0
                        local summaries = tonumber(n.summary_count) or 0
                        delta.document_delta = delta.document_delta + 1 - removed_documents
                        delta.failed_delta = delta.failed_delta - removed_failed
                        delta.chunk_delta = delta.chunk_delta + chunks - removed_chunks
                        delta.summary_delta = delta.summary_delta + summaries - removed_summaries
                        delta.embedding_delta = delta.embedding_delta + chunks + summaries - removed_chunks - removed_summaries
                    elseif status == "failed" then
                        delta.document_delta = delta.document_delta - removed_documents
                        delta.failed_delta = delta.failed_delta + 1 - removed_failed
                        delta.chunk_delta = delta.chunk_delta - removed_chunks
                        delta.summary_delta = delta.summary_delta - removed_summaries
                        delta.embedding_delta = delta.embedding_delta - removed_chunks - removed_summaries
                    elseif (tonumber(n.removed) or 0) > 0 then
                        delta.document_delta = delta.document_delta - removed_documents
                        delta.failed_delta = delta.failed_delta - removed_failed
                        delta.chunk_delta = delta.chunk_delta - removed_chunks
                        delta.summary_delta = delta.summary_delta - removed_summaries
                        delta.embedding_delta = delta.embedding_delta - removed_chunks - removed_summaries
                    end
                end
            end
        end
    end
    return delta
end

local function has_committed_source_write(result: any): boolean
    if (tonumber(result.removed) or 0) > 0 then return true end
    for _, notice in ipairs(result.notifications or {}) do
        if notice.persisted == true then return true end
    end
    return false
end

local function build_source_meta_writes(thread_id: string, projection_id: string, target_kb_ids: { string }, results: { any }, status: string, last_error: string?, from_seq: number?, to_seq: number?): { table }?
    local events = {}
    local seq_key = tostring(math.floor(tonumber(to_seq) or 0))
    local processed_delta = 0
    local from_n = tonumber(from_seq)
    local to_n = tonumber(to_seq)
    if from_n and to_n and to_n >= from_n then
        processed_delta = math.floor(to_n - from_n + 1)
    end
    for _, kb_id in ipairs(target_kb_ids) do
        local delta = result_deltas(kb_id, results)
        local body = {
            kb_id = kb_id,
            reason = "source.materialized",
            source_projection_id = projection_id,
            source_from_seq = from_seq,
            source_to_seq = to_seq,
            source_processed_delta = processed_delta,
            status = status,
            last_error = last_error or "",
            document_delta = delta.document_delta,
            chunk_delta = delta.chunk_delta,
            summary_delta = delta.summary_delta,
            embedding_delta = delta.embedding_delta,
            failed_delta = delta.failed_delta,
        }
        events[#events + 1] = {
            type = GRAPH_CHANGED_EVENT_TYPE,
            role = "system",
            body = body,
            external = {
                external_source = GRAPH_CHANGED_EXTERNAL_SOURCE,
                external_id = "source-materialized:" .. kb_id .. ":" .. projection_id .. ":" .. seq_key,
                external_version = "v1",
            },
        }
    end
    if #events == 0 then return nil end
    return { { thread_id = thread_id, events = events } }
end

local function build_dead_letter_meta_writes(thread_id: string, projection_id: string, target_kb_ids: { string }, error_message: string, from_seq: number?, to_seq: number?): { table }?
    local events = {}
    local seq_key = tostring(math.floor(tonumber(to_seq) or 0))
    local processed_delta = 0
    local from_n = tonumber(from_seq)
    local to_n = tonumber(to_seq)
    if from_n and to_n and to_n >= from_n then
        processed_delta = math.floor(to_n - from_n + 1)
    end
    for _, kb_id in ipairs(target_kb_ids) do
        events[#events + 1] = {
            type = GRAPH_CHANGED_EVENT_TYPE,
            role = "system",
            body = {
                kb_id = kb_id,
                reason = "source.dead_lettered",
                source_projection_id = projection_id,
                source_from_seq = from_seq,
                source_to_seq = to_seq,
                source_processed_delta = processed_delta,
                status = "error",
                last_error = error_message,
            },
            external = {
                external_source = GRAPH_CHANGED_EXTERNAL_SOURCE,
                external_id = "source-dead-lettered:" .. kb_id .. ":" .. projection_id .. ":" .. seq_key,
                external_version = "v1",
            },
        }
    end
    if #events == 0 then return nil end
    return { { thread_id = thread_id, events = events } }
end

local function merge_append_writes(...): { table }?
    local merged: {table} = {}
    local by_thread: { [string]: any } = {}
    for i = 1, select("#", ...) do
        local writes = select(i, ...)
        for _, write in ipairs(type(writes) == "table" and writes or {}) do
            local thread_id = trim(write.thread_id)
            local target = by_thread[thread_id]
            if not target then
                target = { thread_id = thread_id, events = {} }
                by_thread[thread_id] = target
                merged[#merged + 1] = target
            end
            for _, event in ipairs(type(write.events) == "table" and write.events or {}) do
                target.events[#target.events + 1] = event
            end
        end
    end
    if #merged == 0 then return nil end
    return merged
end

local function checkpoint_writes(cursor: table, sequence: number, outcome: table,
        finalize: boolean): {table}?
    local thread_id, projection_id = cursor.thread_id, cursor.projection_id
    local targets = {thread_id}
    local notification = {{component_id = thread_id, notifications = {outcome}}}
    local graph = build_source_meta_writes(thread_id, projection_id, targets, notification,
        outcome.status, outcome.last_error, sequence, sequence)
    if not finalize then return graph end
    local domain = digest_request_writes(thread_id, projection_id, targets, sequence, sequence, sequence)
    return merge_append_writes(graph, domain)
end

local function source_targets(worker_config, thread_id: string): { string }
    local target_kb_ids = type(worker_config.target_kb_ids) == "table" and worker_config.target_kb_ids or {}
    local targets: { string } = {}
    for _, id in ipairs(target_kb_ids) do
        local s = trim(tostring(id))
        if s ~= "" then targets[#targets + 1] = s end
    end
    -- An unconfigured source projection targets its KB primary thread.
    if #targets == 0 and thread_id ~= "" then targets[1] = thread_id end
    return targets
end

local function unique_targets(targets)
    if #targets < 2 then return targets end
    local unique, seen = {}, {}
    for _, id in ipairs(targets) do
        if not seen[id] then
            unique[#unique + 1] = id
            seen[id] = true
        end
    end
    return unique
end

local function write_fanout(target_ids, deps, thread_id, deletes, source_deletes, prepare_documents)
    local stores, recipients = {}, {}
    for _, id in ipairs(target_ids) do
        local _, access_err = component.validate_access(id, component.ACCESS.WRITE)
        if access_err then return nil, access_err end
        local target, target_err = resolve_materialized_store(id, deps, true)
        if target_err or not target then return nil, target_err or "no source materializer for KB engine" end
        target.source_thread_id = thread_id
        stores[target.store_row.id] = target.store_row
        recipients[#recipients + 1] = {
            id = id, target = target, deletes = id == thread_id and deletes or source_deletes,
        }
    end
    if prepare_documents then
        for _, recipient in ipairs(recipients) do
            local apply, err = prepare_documents(recipient.id, recipient.target)
            if not apply then return nil, err or "source document preparation returned no result" end
            recipient.apply_documents = apply
        end
        -- Model preparation can outlast a permission grant. Recheck access before
        -- taking the KB connection because the Component API owns its own handle.
        for _, recipient in ipairs(recipients) do
            local _, access_err = component.validate_access(recipient.id, component.ACCESS.WRITE)
            if access_err then return nil, access_err end
        end
    end
    local publish = deps.stage_fanout or materializer_store.write_fanout
    return publish(stores, function(transaction_store)
        for _, recipient in ipairs(recipients) do
            if #recipient.deletes > 0 then
                local del, err = source_materializer.delete_documents_from_store({
                    store = transaction_store, store_row = recipient.target.store_row, source_thread_id = thread_id,
                }, recipient.deletes)
                if err then return nil, err end
                recipient.delete = del
            end
            if recipient.apply_documents then
                local docs, err = recipient.apply_documents(transaction_store)
                if err or not docs then return nil, err or "source document mutation returned no result" end
                recipient.document = docs
            end
        end
        return recipients, nil
    end)
end

local function run_with_deps(input_raw, deps, defer_finalizers)
    deps = deps or {}
    local input = decode_object(input_raw)

    local thread_id = trim(input.thread_id)
    if thread_id == "" then
        return nil, (errors.new({message = "thread_id is required", kind = errors.INVALID}) :: error)
    end

    local projection = type(input.projection) == "table" and input.projection or {}
    local projection_id = trim(projection.id)
    if projection_id == "" then
        return nil, (errors.new({message = "projection.id is required", kind = errors.INVALID}) :: error)
    end
    local body = projection_body(projection)

    local worker_config = resolve_worker_config(input.worker_config, projection)
    local max_pending_documents = configured_pending_cap(
        worker_config,
        "max_pending_documents",
        DEFAULT_MAX_PENDING_DOCUMENTS
    )
    local max_pending_deletes = configured_pending_cap(
        worker_config,
        "max_pending_deletes",
        DEFAULT_MAX_PENDING_DELETES
    )

    local clean_targets = source_targets(worker_config, thread_id)
    if #clean_targets == 0 then
        return nil, (errors.new({message = "worker_config.target_kb_ids is required", kind = errors.INVALID}) :: error)
    end
    if #clean_targets > MAX_TARGET_KBS then
        return nil, (errors.new({message = "worker_config.target_kb_ids exceeds cap of " .. tostring(MAX_TARGET_KBS), kind = errors.INVALID}) :: error)
    end
    clean_targets = unique_targets(clean_targets)

    local raw_events = type(input.events) == "table" and input.events or {}

    local metrics: IngestMetrics = {
        events_seen = #raw_events,
        events_extracted = 0,
        events_unsupported = 0,
        documents_emitted = 0,
        deletes_emitted = 0,
        documents_inserted = 0,
        documents_replaced = 0,
        documents_removed = 0,
        items_failed = 0,
    }

    if #raw_events == 0 then
        return {
            patch = {
                last_run_at = time.now():utc():format(time.RFC3339),
                last_status = "skipped_no_events",
            },
            metrics = metrics,
        }, nil
    end

    local dispatcher = deps.dispatcher or function(event)
        return default_dispatcher(event, deps)
    end

    local pending_documents = {}
    local pending_deletes = {}
    local kb_results = {}
    local post_materialization_errors = {}
    local from_seq, to_seq

    -- Extraction caps and contradictory lineage are deterministic input errors.
    -- Record the rejected batch before advancing to subsequent source events.
    local function reject_batch(error_message: string)
        local dead_letter_entry = {
            dead_lettered_at = time.now():utc():format(time.RFC3339),
            from_seq = from_seq,
            to_seq = to_seq,
            attempts = 1,
            error = error_message,
            kb_results = kb_results,
        }
        local append_events = build_dead_letter_meta_writes(thread_id, projection_id, clean_targets, error_message, from_seq, to_seq)
        return {
            patch = {
                last_run_at = time.now():utc():format(time.RFC3339),
                last_status = "dead_lettered",
                last_from_seq = from_seq,
                last_to_seq = to_seq,
                last_error = error_message,
                last_failed_batch = nil,
                dead_lettered_batches = dead_lettered_batches(projection, dead_letter_entry),
                kb_results = kb_results,
            },
            metrics = metrics,
            append_events = append_events,
        }, nil
    end

    local batch_error = nil

    for _, raw_event in ipairs(raw_events) do
        if batch_error then break end
        if type(raw_event) == "table" then
            local external = {
                external_source = raw_event.external_source,
                external_id = raw_event.external_id,
                external_version = raw_event.external_version,
            }

            local event = {
                id = tostring(raw_event.id or ""),
                seq = tonumber(raw_event.seq) or 0,
                type = trim(raw_event.type),
                role = raw_event.role,
                body = decode_object(raw_event.body),
                created_at = raw_event.created_at,
                external = external,
            }

            if not from_seq or event.seq < from_seq then from_seq = event.seq end
            if not to_seq or event.seq > to_seq then to_seq = event.seq end

            local selected_node_id, select_err = selected_document_id(event, thread_id)
            if select_err then return nil, select_err end
            local items, dispatch_err, retryable = dispatcher(event)
            if dispatch_err then
                logger:warn("dispatcher error", {
                    event_id = event.id, type = event.type, error = dispatch_err,
                })
                if retryable == true then
                    return nil, job_types.native_error(dispatch_err) or errors.new({kind = errors.UNAVAILABLE,
                        retryable = true, message = tostring(dispatch_err)})
                end
            elseif items == nil then
                metrics.events_unsupported = metrics.events_unsupported + 1
            else
                local docs = type(items.documents) == "table" and items.documents or {}
                local deletes = type(items.deletes) == "table" and items.deletes or {}
                if deps.single_source and #docs + #deletes > 1 then
                    return nil, errors.new({kind = errors.INVALID,
                        message = "multi-item extractors require their own source projection"})
                end
                if #docs == 0 and #deletes == 0 then
                    -- Extractor handled the event but emitted nothing.
                else
                    metrics.events_extracted = metrics.events_extracted + 1
                    for _, doc in ipairs(docs) do
                        if #pending_documents >= max_pending_documents then
                            batch_error = "source worker document cap exceeded: " ..
                                tostring(max_pending_documents) ..
                                " documents pending"
                            logger:warn("documents cap hit", {
                                cap = max_pending_documents, event_id = event.id,
                            })
                            break
                        end
                        local ok, lineage_err = ensure_source_lineage(doc, event, thread_id)
                        if not ok then
                            batch_error = lineage_err
                            logger:warn("document lineage conflict", {
                                event_id = event.id, error = lineage_err,
                            })
                            break
                        end
                        doc.rejection_code = items.rejection and items.rejection.document == doc and items.rejection.code or nil
                        pending_documents[#pending_documents + 1] = {
                            doc = doc, event_id = event.id,
                        }
                    end
                    if batch_error then break end
                    for _, d in ipairs(deletes) do
                        if #pending_deletes >= max_pending_deletes then
                            batch_error = "source worker delete cap exceeded: " ..
                                tostring(max_pending_deletes) ..
                                " deletes pending"
                            logger:warn("deletes cap hit", {
                                cap = max_pending_deletes, event_id = event.id,
                            })
                            break
                        end
                        local ok, lineage_err = ensure_source_lineage(d, event, thread_id)
                        if not ok then
                            batch_error = lineage_err
                            logger:warn("delete lineage conflict", {
                                event_id = event.id, error = lineage_err,
                            })
                            break
                        end
                        d.selected_node_id = selected_node_id
                        pending_deletes[#pending_deletes + 1] = {
                            delete = d, event_id = event.id,
                        }
                    end
                end
            end
        end
    end

    metrics.documents_emitted = #pending_documents
    metrics.deletes_emitted = #pending_deletes

    if batch_error then
        kb_results[#kb_results + 1] = {
            component_id = "source_extraction",
            error = tostring(batch_error),
        }
        return reject_batch(tostring(batch_error))
    end

    if metrics.documents_emitted == 0 and metrics.deletes_emitted == 0 then
        return {
            patch = {
                last_run_at = time.now():utc():format(time.RFC3339),
                last_status = "skipped_no_items",
                last_from_seq = from_seq,
                last_to_seq = to_seq,
            },
            metrics = metrics,
        }, nil
    end

    local embedder = deps.embedder or default_embedder
    local summarizer = deps.summarizer or default_summarizer
    local enricher = deps.enricher or default_enricher
    local batch_enricher = deps.batch_enricher
    if not deps.enricher then
        batch_enricher = batch_enricher or default_batch_enricher
    end
    -- Captioner closes over the image loader (the upload artifact byte reader) so
    -- the materializer's caption callback stays a pure (image, context, model) seam.
    local image_loader = deps.image_loader or default_image_loader
    local captioner = deps.captioner or function(image: any, context: any, model: any): string?
        return default_captioner(image, context, model, image_loader)
    end

    if deps.model_checkpoint then
        local checkpoint = deps.model_checkpoint
        embedder = function(texts, model, dims)
            return default_embedder(texts, model, dims, nil, checkpoint.embed)
        end
        summarizer = function(content, model, chars, instructions)
            return default_summarizer(content, model, chars, instructions, nil, checkpoint.generate)
        end
        batch_enricher = function(content, summary, chunks, model)
            return default_batch_enricher(content, summary, chunks, model, nil, checkpoint.generate)
        end
    end

    local deletes, source_deletes = {}, {}
    for _, pending in ipairs(pending_deletes) do
        local delete = pending.delete
        deletes[#deletes + 1] = delete
        if delete.selected_node_id == nil then source_deletes[#source_deletes + 1] = delete end
    end
    if metrics.documents_emitted == 0 and #deletes > 0 and #source_deletes == 0 then
        local own_target = {}
        for _, kb_id in ipairs(clean_targets) do
            if kb_id == thread_id then own_target[1] = kb_id end
        end
        clean_targets = own_target
    end

    local docs = {}
    for _, pending in ipairs(pending_documents) do docs[#docs + 1] = pending.doc end
    local fanout
    if #clean_targets > 1 or (deps.stage_fanout and #clean_targets > 0) then
        local prepare_documents = #docs > 0 and function(kb_id, target)
            return source_materializer.prepare_documents(kb_id, target, docs, embedder, summarizer, enricher,
                captioner, worker_config, batch_enricher, materializer_store.encode_fanout_embeddings)
        end or nil
        local err
        fanout, err = write_fanout(clean_targets, deps, thread_id, deletes, source_deletes, prepare_documents)
        if not fanout then
            return nil, job_types.native_error(err) or errors.new({kind = errors.UNAVAILABLE,
                retryable = true, message = tostring(err or "source fan-out failed")})
        end
    end

    -- A whole-batch system error (store down, embedder unreachable, no
    -- materializer for the KB). Per-document content failures are isolated inside
    -- the materializer and do NOT surface here; only an error that fails the
    -- batch as a unit does. Collected rather than returned immediately so the
    -- worker can report the outcome after every target KB is tried.
    for index, kb_id in ipairs(clean_targets) do
        local target_error = nil
        local recipient = fanout and fanout[index]
        local target, target_err
        if recipient then target = recipient.target else target, target_err = resolve_materialized_store(kb_id, deps) end
        if target_err then
            logger:warn("target KB materializer resolution failed", { kb = kb_id, error = target_err })
            kb_results[#kb_results + 1] = { component_id = kb_id, error = tostring(target_err) }
            target_error = target_err
        elseif not target then
            local missing = "no source materializer for KB engine"
            logger:warn("target KB has no source materializer", { kb = kb_id })
            kb_results[#kb_results + 1] = { component_id = kb_id, error = missing }
            target_error = missing
        else
            target.source_thread_id = thread_id
            local target_deletes = kb_id == thread_id and deletes or source_deletes
            if #target_deletes > 0 then
                local del, del_err
                if recipient then del = recipient.delete
                else del, del_err = source_materializer.delete_documents_from_store(target, target_deletes) end
                if del_err and errors.is(del_err, errors.CONFLICT) then return nil, del_err end
                local delete_result, shape_err = checked_result(del, kb_id, "delete")
                if shape_err then
                    logger:error("source materialization delete returned invalid result", { kb = kb_id, error = shape_err })
                    kb_results[#kb_results + 1] = { component_id = kb_id, kind = "delete", error = shape_err }
                    target_error = shape_err
                elseif del_err then
                    delete_result.error = tostring(del_err)
                    metrics.documents_removed = metrics.documents_removed + (tonumber(delete_result.removed) or 0)
                    kb_results[#kb_results + 1] = delete_result
                    logger:error("source materialization delete failed", { kb = kb_id, error = del_err })
                    target_error = del_err
                else
                    metrics.documents_removed = metrics.documents_removed + (tonumber(delete_result.removed) or 0)
                    kb_results[#kb_results + 1] = delete_result
                    apply_delete_result(kb_state(body, kb_id), delete_result)
                end
            end

            if not target_error then
                if metrics.documents_emitted == 0 then
                    if #target_deletes == 0 then
                        kb_results[#kb_results + 1] = {
                            component_id = kb_id, kind = "document",
                            inserted = 0, replaced = 0, failed = 0,
                            note = "no documents emitted by extractors",
                        }
                    end
                else
                    local r, kb_err
                    if recipient then r = recipient.document
                    else
                        r, kb_err = source_materializer.ingest_documents_into_store(kb_id, target, docs, embedder,
                            summarizer, enricher, captioner, worker_config, batch_enricher)
                    end
                    if kb_err and errors.is(kb_err, errors.CONFLICT) then return nil, kb_err end
                    local ingest_result, shape_err = checked_result(r, kb_id, "document")
                    if shape_err then
                        logger:error("source materialization returned invalid result", { kb = kb_id, error = shape_err })
                        kb_results[#kb_results + 1] = { component_id = kb_id, kind = "document", error = shape_err }
                        target_error = shape_err
                    elseif kb_err then
                        local r = ingest_result
                        logger:error("source materialization failed", { kb = kb_id, error = kb_err })
                        metrics.documents_inserted = metrics.documents_inserted + (tonumber(r.inserted) or 0)
                        metrics.documents_replaced = metrics.documents_replaced + (tonumber(r.replaced) or 0)
                        metrics.items_failed = metrics.items_failed + (tonumber(r.failed) or 0)
                        r.error = tostring(kb_err)
                        kb_results[#kb_results + 1] = r
                        if has_committed_source_write(r) then
                            -- Once the materializer has committed per-document
                            -- read-model facts, the cursor must advance with a
                            -- matching graph.changed delta. Retrying would replay
                            -- committed side effects and strand public meta.
                            apply_document_result(kb_state(body, kb_id), r)
                            local placement_ok, placement_err = request_graph_placement(deps, kb_id, target, r)
                            if not placement_ok then
                                logger:warn("graph placement request failed", { kb = kb_id, error = placement_err })
                            end
                            post_materialization_errors[#post_materialization_errors + 1] = {
                                component_id = kb_id,
                                stage = "source_materialization",
                                error = tostring(kb_err),
                            }
                        else
                            target_error = kb_err
                        end
                    else
                        local r = ingest_result
                        metrics.documents_inserted = metrics.documents_inserted + (tonumber(r.inserted) or 0)
                        metrics.documents_replaced = metrics.documents_replaced + (tonumber(r.replaced) or 0)
                        metrics.items_failed = metrics.items_failed + (tonumber(r.failed) or 0)
                        kb_results[#kb_results + 1] = r
                        apply_document_result(kb_state(body, kb_id), r)
                        local placement_ok, placement_err
                        if recipient then
                            local called, sent, err = pcall(request_graph_placement, deps, kb_id, target, r)
                            if called then placement_ok, placement_err = sent, err
                            else placement_err = tostring(sent) end
                        else
                            placement_ok, placement_err = request_graph_placement(deps, kb_id, target, r)
                        end
                        if not placement_ok then
                            logger:warn("graph placement request failed", { kb = kb_id, error = placement_err })
                            post_materialization_errors[#post_materialization_errors + 1] = {
                                component_id = kb_id,
                                stage = "graph_placement",
                                error = tostring(placement_err),
                            }
                        end
                    end
                end
            end
        end
        if target_error then
            batch_error = batch_error or target_error
            post_materialization_errors[#post_materialization_errors + 1] = {
                component_id = kb_id, stage = "source_materialization", error = tostring(target_error),
            }
        end
    end

    if batch_error then
        -- A failed ordinary worker leaves Core's cursor at its committed
        -- position. Jobs owns the scheduled retry and its backoff.
        -- The single-store path may have committed some document results.
        local committed = false
        for _, result in ipairs(kb_results) do
            if has_committed_source_write(result) then committed = true break end
        end
        if not committed then
            return nil, job_types.native_error(batch_error) or errors.new({kind = errors.UNAVAILABLE,
                retryable = true, message = tostring(batch_error)})
        end
    end

    logger:info("source worker completed", {
        thread_id = thread_id,
        projection_id = projection_id,
        events = #raw_events,
        documents_inserted = metrics.documents_inserted,
        documents_replaced = metrics.documents_replaced,
        documents_removed = metrics.documents_removed,
        failed = metrics.items_failed,
    })

    local last_error = ""
    if metrics.items_failed > 0 then
        last_error = "Some documents failed to materialize"
        for _, result in ipairs(kb_results) do
            for _, n in ipairs(type(result.notifications) == "table" and result.notifications or {}) do
                if trim(n.status) == "failed" and trim(n.error) ~= "" then
                    last_error = tostring(n.error)
                    break
                end
            end
            if last_error ~= "Some documents failed to materialize" then break end
        end
    elseif #post_materialization_errors > 0 then
        last_error = tostring(post_materialization_errors[1].error or "post-materialization step failed")
    end
    local source_status = (metrics.items_failed > 0 or #post_materialization_errors > 0) and "degraded" or "ready"
    if metrics.items_failed > 0 and metrics.documents_inserted == 0 and metrics.documents_replaced == 0 then
        -- The upload UI already displays canonical component errors. A batch
        -- with no successful documents must not look like a degraded success.
        source_status = "error"
        for _, result in ipairs(kb_results) do
            for _, notice in ipairs(result.notifications or {}) do
                if notice.retained then source_status = "degraded" end
            end
        end
    end
    body.last_run_at = time.now():utc():format(time.RFC3339)
    if metrics.items_failed > 0 then
        body.last_status = "completed_with_failures"
    elseif #post_materialization_errors > 0 then
        body.last_status = "completed_with_warnings"
    else
        body.last_status = "completed"
    end
    body.last_from_seq = from_seq
    body.last_to_seq = to_seq
    body.last_error = last_error
    body.last_failed_batch = nil
    body.kb_results = kb_results
    body.post_materialization_errors = #post_materialization_errors > 0 and post_materialization_errors or nil

    local result = {
        body = body,
        metrics = metrics,
        append_events = build_source_meta_writes(thread_id, projection_id, clean_targets, kb_results,
            source_status, last_error, from_seq, to_seq),
    }
    if defer_finalizers then return result, nil, clean_targets end
    local range = type(input.range) == "table" and input.range or {}
    result.append_events = merge_append_writes(result.append_events,
        build_digest_request_writes(range, thread_id, projection_id, clean_targets, from_seq, to_seq))
    return result, nil
end

-- Keep a healthy run's graph output proportional to its page count. A
-- rejection has its own event so its source range and reason remain visible.
local function append_source_outputs(events, ready_by_kb, writes)
    for _, write in ipairs(writes or {}) do
        for _, event in ipairs(write.events) do
            local body = event.body
            local kb = body.kb_id
            local ready = event.type == GRAPH_CHANGED_EVENT_TYPE and body.status == "ready"
            local previous = ready and ready_by_kb[kb]
            if previous then
                previous.body.source_to_seq = body.source_to_seq
                previous.external = event.external
                for _, key in ipairs({"document_delta", "failed_delta", "chunk_delta", "summary_delta",
                        "embedding_delta", "source_processed_delta"}) do
                    previous.body[key] = previous.body[key] + body[key]
                end
            else
                events[#events + 1] = event
            end
            if event.type == GRAPH_CHANGED_EVENT_TYPE then
                ready_by_kb[kb] = ready and (previous or event) or nil
            end
        end
    end
end

local function run_page(input_raw, deps)
    local input = decode_object(input_raw)
    deps = deps or {}
    local page = input.events
    if type(page) ~= "table" or #page == 0 or type(input.projection) ~= "table" then return run_with_deps(input, deps) end
    local body = projection_body(input.projection)
    input.projection.body = body
    local cursor = type(input.cursor) == "table" and input.cursor or {}
    local pending = body.source_finalizer_pending
    local same_cursor = type(pending) == "table" and type(cursor.id) == "string" and pending.cursor_id == cursor.id
    local resume = same_cursor and pending.last_seq == cursor.last_seq
        and type(pending.targets) == "table" and #pending.targets <= MAX_TARGET_KBS
    if #page == 1 and not same_cursor then return run_with_deps(input, deps) end
    local targets = {}
    local resolver = {resolve_materialized_store = deps.resolve_materialized_store}
    local page_deps = {}
    for key, value in pairs(deps) do page_deps[key] = value end
    page_deps.resolve_materialized_store = function(id, fanout_snapshot)
        if fanout_snapshot then return resolve_materialized_store(id, resolver, true) end
        if targets[id] then return targets[id] end
        local target, err = resolve_materialized_store(id, resolver)
        targets[id] = target
        return target, err
    end
    local range = type(input.range) == "table" and input.range or {}
    local events, ready_by_kb, metrics = {}, {}, {}
    local finalizer_targets, seen_targets = {}, {}
    local function remember(kb_id)
        if type(kb_id) ~= "string" or kb_id == "" or seen_targets[kb_id] then return end
        finalizer_targets[#finalizer_targets + 1] = kb_id
        seen_targets[kb_id] = true
    end
    if resume then
        local configured = {}
        local worker_config = resolve_worker_config(input.worker_config, input.projection)
        for _, kb_id in ipairs(source_targets(worker_config, trim(input.thread_id))) do configured[kb_id] = true end
        for _, kb_id in ipairs(pending.targets) do
            if configured[kb_id] then remember(kb_id) end
        end
    end
    local last_seq, finalized
    for index, event in ipairs(page) do
        if index > 1 and deps.close_before and deps.close_before(event) then
            last_seq = event.seq - 1
            break
        end
        input.events = {event}
        local result, err, slice_targets = run_with_deps(input, page_deps, true)
        if err then
            if not last_seq then return nil, err end
            break
        end
        for key, value in pairs(result.patch or {}) do body[key] = value end
        for key, value in pairs(result.metrics) do metrics[key] = (metrics[key] or 0) + value end
        append_source_outputs(events, ready_by_kb, result.append_events)
        if deps.after_source then deps.after_source(result, event) end
        for _, kb_id in ipairs(slice_targets or {}) do remember(kb_id) end
        last_seq = tonumber(event.seq)
        if index == #page then
            -- The complete page owns finalization, even if its last eligible
            -- event emitted nothing or Core scanned beyond it.
            local writes = build_digest_request_writes(range,
                trim(input.thread_id), trim(input.projection.id), finalizer_targets, last_seq, last_seq)
            append_source_outputs(events, ready_by_kb, writes)
            finalized = writes ~= nil
            last_seq = tonumber(range.to_seq) or last_seq
        end
    end
    -- Core commits this body with the cursor and events. Follow the committed
    -- position across pause/resume; an explicit reset replaces the body.
    if (pending == nil or same_cursor) and type(cursor.id) == "string" and type(cursor.last_seq) == "number" then
        body.source_finalizer_pending = nil
        if not finalized and #finalizer_targets > 0 then
            body.source_finalizer_pending = {
                cursor_id = cursor.id, last_seq = last_seq, targets = finalizer_targets,
            }
        end
    end
    body.last_from_seq = page[1].seq
    return {last_seq = last_seq, body = body, metrics = metrics,
        append_events = #events > 0 and {{thread_id = input.thread_id, events = events}} or nil}, nil
end

local function run_proc(input_raw)
    local input = decode_object(input_raw)
    local deps = {}
    if type(input.execution_deadline_ns) == "number" and type(input.events) == "table" and #input.events > 1 then
        -- A later input may have exceeded the previous estimate. Isolate
        -- the first source on timeout and preserve ordinary outage retries.
        local single = input.previous_execution_timed_out == true
        local full = source_deadline.new(time.now():unix_nano())
        deps.close_before = function()
            return full(time.now():unix_nano(), input.execution_deadline_ns, single)
        end
    end
    local result, err = run_page(input, deps)
    if err then return {ok = false, error_native = job_types.error_to_data(err)} end
    return result
end

local function prepare_checkpoint_document(target, doc, config, deadline)
    local function bounded(call, ceiling)
        return function(...)
            local seconds = math.floor((deadline - time.now():unix_nano()) / 1000000000)
            if seconds < 1 then
                return nil, errors.new({kind = errors.TIMEOUT, retryable = true,
                    message = "projection deadline reached before model request"})
            end
            local count = select("#", ...) + 1
            local args = {...}
            args[count] = math.min(seconds, ceiling)
            return call(unpack(args, 1, count))
        end
    end
    return source_materializer.prepare_document(target, doc, {
        embed = bounded(default_embedder, EMBED_TIMEOUT_SECONDS),
        summarize = bounded(default_summarizer, SUMMARY_TIMEOUT_SECONDS),
        enrich_batch = bounded(default_batch_enricher, ENRICH_TIMEOUT_SECONDS),
    }, config)
end

return {
    run = run_page,
    run_proc = run_proc,
    run_with_deps = run_with_deps,
    ensure_source_lineage = ensure_source_lineage,
    selected_document_id = selected_document_id,
    prepare_checkpoint_document = prepare_checkpoint_document,
    checkpoint_writes = checkpoint_writes,
    -- Production seams reused outside the worker: resummarize (kb10 engine)
    -- regenerates a document's summary/chunk-enrichment from stored content
    -- with the same model calls ingestion makes, without duplicating them.
    default_summarizer = default_summarizer,
    default_enricher = default_enricher,
    default_batch_enricher = default_batch_enricher,
    -- Library exports for unit tests:
    _chunk_text = source_materializer.chunk_text,
    _build_summary_text = source_materializer.build_summary_text,
    _trimmed_to_last_sentence = trimmed_to_last_sentence,
    _discover_extractors = discover_extractors,
    _plan_document_writes = source_materializer.plan_document_writes,
    _materialization_options = source_materializer.materialization_options,
}
