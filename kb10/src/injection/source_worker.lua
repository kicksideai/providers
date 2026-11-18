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
-- Explicitly retryable extractor failures use the projection runner's retry policy;
-- validation failures on knowledge content events dead-letter that event.
--
-- The worker:
--   1. Builds an event_type → extractor_id map from the registry.
--   2. Dispatches events in order, bounding documents and deletes per run.
--   3. For each target KB whose engine declares source materialization,
--      atomically replaces each
--      materialized source-document tree through the KB engine's declared
--      internal materializer_store surface by canonical (external_source, external_id), so
--      re-ingestion is an in-place replace, not an append.
--   4. Advances through events consumed by every target KB.

local json = require("json")
local time = require("time")
local base64 = require("base64")
local logger = require("logger"):named("knowledge.injection.source_worker")
local job_types = require("job_types")
local registry = require("registry")
local funcs = require("funcs")

local component = require("component")
local llm = require("llm")
local prompt = require("prompt")
local artifact_content_repo = require("artifact_content_repo")
local source_materializer = require("source_materializer")
local materializer_store = require("materializer_store")
local execution_identity = require("execution_identity")
local enrichment_consts = require("enrichment_consts")

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
local CONTENT_UPSERTED_EVENT_TYPE = "kickside.knowledge.events:content.upserted"
local CONTENT_DELETED_EVENT_TYPE = "kickside.knowledge.events:content.deleted"
local GRAPH_CHANGED_EVENT_TYPE = "kickside.knowledge.events:graph.changed"
local GRAPH_CHANGED_EXTERNAL_SOURCE = "knowledge.graph.meta"
-- Companion finalizer marker for graph treatment (concept dedup). Same shape and
-- source as digest.requested; emitted on the same post-materialization batch so the
-- digest projection that already consumes the thread can drive treatment too.
local TREATMENT_REQUEST_EVENT_TYPE = "kickside.knowledge.events:treatment.requested"

local function is_knowledge_content_event(event_type: string): boolean
    return event_type == CONTENT_UPSERTED_EVENT_TYPE or event_type == CONTENT_DELETED_EVENT_TYPE
end

local function trim(s: any): string
    if type(s) ~= "string" then return "" end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

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

local function dead_lettered_batches(body: table, entry: table): {table}
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
    if err then return nil, "registry.find failed: " .. tostring(err) end

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
    if call_err then
        return nil, "extractor call failed: " .. tostring(call_err), source_materializer.is_system_failure(call_err)
    end

    if type(result) ~= "table" then
        return nil, "extractor returned invalid result"
    end

    if result.error and result.error ~= "" then
        return nil, "extractor error: " .. tostring(result.error), result.retryable == true
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
-- the event reports "no source materializer".
local function resolve_materialized_store(component_id: string, deps: any): (any?, any, boolean?)
    if type(deps.resolve_materialized_store) == "function" then
        return deps.resolve_materialized_store(component_id)
    end

    local store = materializer_store
    local row, row_err = store.get_store(store, { component_id = component_id })
    if row_err then
        if errors.is(row_err, errors.NOT_FOUND) then return nil, nil end
        return nil, row_err
    end
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
-- timeout the call returns an error and the source cursor can resume at the
-- failed event.
local EMBED_TIMEOUT_SECONDS = 90
local SUMMARY_TIMEOUT_SECONDS = 60
local ENRICH_TIMEOUT_SECONDS = 45

local function default_embedder(texts, model, dims)
    return llm.embed(texts, {
        model = model,
        dimensions = dims,
        timeout = EMBED_TIMEOUT_SECONDS,
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
local function default_summarizer(content: any, model: any, target_chars: any, summary_prompt: any): (string?, string?)
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

    local response, gen_err = llm.generate(p, {
        model = model,
        temperature = 0.2,
        -- The token ceiling carries headroom over the character target so the
        -- model closes its last sentence rather than being cut mid-word. English
        -- prose runs well under 2 characters per token, so a budget of roughly
        -- one token per target character -- the safe end of the range -- leaves
        -- real room to wind down after reaching the target.
        max_tokens = math.max(400, target),
        timeout = SUMMARY_TIMEOUT_SECONDS,
    })
    if gen_err or not response then return nil, tostring(gen_err or "no response") end
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

local function default_batch_enricher(content: any, summary: any, chunks: any, model: any): (any?, string?)
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

    local response, gen_err = llm.generate(p, {
        model = model,
        temperature = 0.2,
        max_tokens = math.max(256, math.min(1600, #chunks * 48)),
        timeout = ENRICH_TIMEOUT_SECONDS,
    })
    if gen_err or not response then return nil, tostring(gen_err or "no response") end
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

local function source_key(external_source: any, external_id: any): string?
    local source = trim(external_source)
    local id = trim(external_id)
    if id == "" then return nil end
    if source == "" then source = "knowledge.kb" end
    return source .. ":" .. id
end

local function kb_state(body: table, kb_id: string): table
    local kbs = type(body.kbs) == "table" and body.kbs or {}
    body.kbs = kbs
    local state = type(kbs[kb_id]) == "table" and kbs[kb_id] or {}
    state.sources = type(state.sources) == "table" and state.sources or {}
    kbs[kb_id] = state
    return state
end

-- The source body and its graph notice commit with the cursor. When a store
-- mutation writes ahead, only the committed body describes the published baseline.
local function set_source_delta(n: table, prior: any, status: string)
    n.document_delta = (status == "completed" and 1 or 0) - (prior.status == "completed" and 1 or 0)
    n.failed_delta = (status == "failed" and 1 or 0) - (prior.status == "failed" and 1 or 0)
    n.summary_delta = (tonumber(n.summary_count) or 0) - (tonumber(prior.summary_count) or 0)
    n.chunk_delta = (tonumber(n.chunk_count) or 0) - (tonumber(prior.chunk_count) or 0)
    n.embedding_delta = n.summary_delta + n.chunk_delta
end

local function apply_document_result(state: table, result: any, last_seq: number): ()
    local sources = state.sources :: table
    for _, n in ipairs(type(result.notifications) == "table" and result.notifications or {}) do
        local key = source_key(n.external_source, n.external_id)
        local prior_seq = tonumber(n.prior_source_seq)
        n.prior_source_seq = nil
        if key then
            local prior = sources[key]
            if n.persisted ~= false and (prior or (prior_seq and prior_seq > last_seq)) then
                set_source_delta(n, prior or {}, trim(n.status))
            end
            if trim(n.status) == "completed" then
                sources[key] = {
                    external_source = trim(n.external_source) ~= "" and trim(n.external_source) or "knowledge.kb",
                    external_id = trim(n.external_id),
                    external_version = trim(n.external_version) ~= "" and trim(n.external_version) or nil,
                    document_node_id = n.document_node_id,
                    status = "completed",
                    summary_count = tonumber(n.summary_count) or 0,
                    chunk_count = tonumber(n.chunk_count) or 0,
                    updated_at = time.now():utc():format(time.RFC3339),
                }
            elseif trim(n.status) == "failed" and n.persisted ~= false then
                sources[key] = {
                    external_source = trim(n.external_source) ~= "" and trim(n.external_source) or "knowledge.kb",
                    external_id = trim(n.external_id),
                    external_version = trim(n.external_version) ~= "" and trim(n.external_version) or nil,
                    document_node_id = n.document_node_id,
                    status = "failed",
                    error = tostring(n.error or "document materialization failed"),
                    summary_count = 0,
                    chunk_count = 0,
                    updated_at = time.now():utc():format(time.RFC3339),
                }
            end
        end
    end
end

local function request_graph_placement(deps: any, kb_id: string, target: any, result: any, sources: table): (boolean?, string?)
    local engine = type(target) == "table" and target.engine or nil
    if not (type(engine) == "table" and engine.is_graph == true) then
        return true, nil
    end

    local remaining, selected = {}, {}
    for i = #result.notifications, 1, -1 do
        local notification = result.notifications[i]
        local key = source_key(notification.external_source, notification.external_id)
        local current = key and sources[key]
        local node_id = trim(notification.document_node_id)
        if trim(notification.status) == "completed" and current and current.status == "completed"
            and current.document_node_id == notification.document_node_id and node_id ~= "" and not selected[node_id] then
            selected[node_id] = true
            remaining[#remaining + 1] = notification
        end
    end
    if #remaining == 0 then return true, nil end

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
    for i = #remaining, 1, -1 do
        local notification = remaining[i]
        local user_id = trim(notification.user_id)
        local sent, send_err = send(enrichment_consts.PROCESS, enrichment_consts.TOPIC, {
            store_id = store_id,
            component_id = kb_id,
            document_node_id = notification.document_node_id,
            user_id = user_id ~= "" and user_id or nil,
            execution_identity = identity_row,
        })
        if send_err or sent == false then
            return nil, "graph placement request failed: " .. tostring(send_err or "process.send failed")
        end
    end

    logger:info("graph placement requested", {
        kb_id = kb_id,
        store_id = store_id,
        documents = #remaining,
    })
    return true, nil
end

local function apply_delete_result(state: table, result: any): ()
    local sources = state.sources :: table
    for _, n in ipairs(type(result.notifications) == "table" and result.notifications or {}) do
        local key = source_key(n.external_source, n.external_id)
        if key and sources[key] then
            set_source_delta(n, sources[key], "")
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

local function build_digest_request_writes(input: any, thread_id: string, projection_id: string, target_kb_ids: { string }, from_seq: number?, to_seq: number?): { table }?
    local range = type(input.range) == "table" and input.range or {}
    local target_seq = tonumber(range.target_seq)
    local range_to_seq = tonumber(to_seq)
    if not target_seq or not range_to_seq or range_to_seq < target_seq then
        return nil
    end

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

local function build_source_meta_writes(thread_id: string, projection_id: string, target_kb_ids: { string }, results: { any }, status: string, last_error: string?, from_seq: number?, to_seq: number?, processed_delta: number): { table }?
    local events = {}
    local seq_key = tostring(math.floor(tonumber(to_seq) or 0))
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

local function build_dead_letter_meta_writes(thread_id: string, projection_id: string, target_kb_ids: { string }, error_message: string, from_seq: number?, to_seq: number?, processed_delta: number): { table }?
    local events = {}
    local seq_key = tostring(math.floor(tonumber(to_seq) or 0))
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

local function run_with_deps(input_raw, deps)
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
    local body = decode_object(projection.body)

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

    local target_kb_ids = type(worker_config.target_kb_ids) == "table" and worker_config.target_kb_ids or {}
    local clean_targets: { string } = {}
    for _, id in ipairs(target_kb_ids) do
        local s = trim(tostring(id))
        if s ~= "" then clean_targets[#clean_targets + 1] = s end
    end
    -- The declared source projection carries no worker_config: the KB primary
    -- thread IS the target (thread_id == component_id == kb_id), so an empty
    -- target set defaults to this thread's own KB.
    if #clean_targets == 0 and thread_id ~= "" then
        clean_targets[#clean_targets + 1] = thread_id
    end
    if #clean_targets == 0 then
        return nil, (errors.new({message = "worker_config.target_kb_ids is required", kind = errors.INVALID}) :: error)
    end
    if #clean_targets > MAX_TARGET_KBS then
        return nil, (errors.new({message = "worker_config.target_kb_ids exceeds cap of " .. tostring(MAX_TARGET_KBS), kind = errors.INVALID}) :: error)
    end

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

    local kb_results, post_materialization_errors = {}, {}
    local range = type(input.range) == "table" and input.range or {}
    local from_seq
    local function finalize_writes(last_seq: number?, changed: boolean)
        if not changed and body.digest_pending ~= true then return nil end
        -- The finalizers read the entire store. An outstanding request also
        -- covers changes from earlier pages whose start is no longer in range.
        local request_from = body.digest_pending == true and 1 or from_seq
        return build_digest_request_writes(input, thread_id, projection_id, clean_targets, request_from, last_seq)
    end

    if #raw_events == 0 then
        local last_seq = tonumber(range.to_seq)
        local append_events = finalize_writes(last_seq, false)
        local patch = {
            last_run_at = time.now():utc():format(time.RFC3339),
            last_status = "skipped_no_events",
        }
        if append_events then patch.digest_pending = false end
        return {
            patch = patch,
            metrics = metrics,
            append_events = append_events,
            last_seq = last_seq,
        }, nil
    end

    local dispatcher = deps.dispatcher or function(event)
        return default_dispatcher(event, deps)
    end

    local function dead_letter_event(seq: number, event_error: any, processed: number, final_seq: number?)
        local message = tostring(event_error)
        logger:error("source event dead-lettered", {
            projection_id = projection_id, seq = seq, error = message,
        })
        local entry = {
            dead_lettered_at = time.now():utc():format(time.RFC3339),
            from_seq = seq,
            to_seq = seq,
            error = message,
            kb_results = kb_results,
        }
        body.last_run_at = entry.dead_lettered_at
        body.last_status = "dead_lettered"
        body.last_from_seq = seq
        body.last_to_seq = seq
        body.last_error = message
        body.dead_lettered_batches = dead_lettered_batches(body, entry)
        body.kb_results = kb_results
        body.last_failed_batch = nil
        local requests = finalize_writes(final_seq, false)
        if requests then body.digest_pending = nil end
        return {
            body = body,
            metrics = metrics,
            append_events = merge_append_writes(
                build_dead_letter_meta_writes(thread_id, projection_id, clean_targets, message, seq, seq, processed),
                requests
            ),
            last_seq = seq,
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

    local targets, prepared = {}, {}
    local function materialize_event(event, docs, deletes)
        for _, items in ipairs({ docs, deletes }) do
            for _, item in ipairs(items) do
                local _, err = ensure_source_lineage(item, event, thread_id)
                if err then return nil, err end
            end
        end

        for _, kb_id in ipairs(clean_targets) do
            local target = targets[kb_id]
            if not target then
                local target_err, store_unavailable
                target, target_err, store_unavailable = resolve_materialized_store(kb_id, deps)
                if not target then
                    return nil, target_err or "no source materializer for KB engine",
                        store_unavailable or source_materializer.is_system_failure(target_err)
                end
                targets[kb_id] = target
            end
            if #docs > 0 and not prepared[kb_id] then
                local setup, err, retryable = source_materializer.prepare_document_ingest(target, worker_config)
                if not setup then return nil, err, retryable end
                prepared[kb_id] = setup
            end
        end

        local results = {}
        for _, kb_id in ipairs(clean_targets) do
            local target = targets[kb_id]
            if #deletes > 0 then
                local removed, err, retryable = source_materializer.delete_documents_from_store(target, deletes)
                if err then return nil, err, retryable end
                local result, shape_err = checked_result(removed, kb_id, "delete")
                if shape_err then return nil, shape_err end
                results[#results + 1] = result
            end
            if #docs > 0 then
                local ingested, err, retryable = source_materializer.ingest_documents_into_store(
                    kb_id, target, docs, embedder, summarizer, enricher, captioner, prepared[kb_id], batch_enricher
                )
                if err then return nil, err, retryable end
                local result, shape_err = checked_result(ingested, kb_id, "document")
                if shape_err then return nil, shape_err end
                if result.consumed ~= #docs then
                    return nil, "source materializer returned an invalid consumed document count"
                end
                results[#results + 1] = result
            end
        end
        return results, nil
    end

    local cursor = type(input.cursor) == "table" and input.cursor or {}
    local prior_seq = tonumber(cursor.last_seq) or 0
    local deadline = tonumber(input.execution_deadline_ns)
    local longest_event_ns = 0
    local consumed_seq, stopped_seq, failure, retryable
    local processed, failed_processed = 0, 0
    local failed_final_seq
    local target_results: { [string]: any } = {}
    local function apply_results(results: any)
        for _, result in ipairs(results) do
            local kb_id = result.component_id
            local state = kb_state(body, kb_id)
            if result.kind == "delete" then
                metrics.documents_removed = metrics.documents_removed + (tonumber(result.removed) or 0)
                apply_delete_result(state, result)
            else
                metrics.documents_inserted = metrics.documents_inserted + (tonumber(result.inserted) or 0)
                metrics.documents_replaced = metrics.documents_replaced + (tonumber(result.replaced) or 0)
                metrics.items_failed = metrics.items_failed + (tonumber(result.failed) or 0)
                apply_document_result(state, result, prior_seq)
                result.consumed = nil
            end
            local by_kind = target_results[kb_id] or {}
            local aggregate = by_kind[result.kind]
            if aggregate then
                for _, field in ipairs({ "removed", "missing", "inserted", "replaced", "summary_count", "chunk_count", "failed", "system_failed" }) do
                    if result[field] ~= nil then aggregate[field] = aggregate[field] + result[field] end
                end
                for _, notification in ipairs(result.notifications) do
                    aggregate.notifications[#aggregate.notifications + 1] = notification
                end
            else
                by_kind[result.kind] = result
                target_results[kb_id] = by_kind
            end
        end
    end

    for index, raw in ipairs(raw_events) do
        if type(raw) == "table" then
            local started_ns = deadline and time.now():unix_nano() or 0
            -- Keep time to finalize the prefix and return the proc result.
            if consumed_seq and deadline and deadline - started_ns <= longest_event_ns + time.SECOND then
                stopped_seq = tonumber(raw.seq)
                break
            end
            local event = {
                id = tostring(raw.id or ""),
                seq = tonumber(raw.seq) or 0,
                type = trim(raw.type),
                role = raw.role,
                body = decode_object(raw.body),
                created_at = raw.created_at,
                external = {
                    external_source = raw.external_source,
                    external_id = raw.external_id,
                    external_version = raw.external_version,
                },
            }
            from_seq = from_seq or event.seq
            failed_processed = is_knowledge_content_event(event.type) and 1 or 0
            -- Core can advance over a filtered tail without another worker call.
            failed_final_seq = index == #raw_events and (tonumber(range.to_seq) or event.seq) or nil
            local items, dispatch_err, dispatch_retryable = dispatcher(event)
            if dispatch_err then
                logger:warn("dispatcher error", { event_id = event.id, type = event.type, error = dispatch_err })
                if dispatch_retryable == true or failed_processed == 1 then
                    stopped_seq, failure, retryable = event.seq, dispatch_err, dispatch_retryable
                    break
                end
                items = nil
            elseif items == nil then
                metrics.events_unsupported = metrics.events_unsupported + 1
            end

            local docs = type(items) == "table" and type(items.documents) == "table" and items.documents or {}
            local deletes = type(items) == "table" and type(items.deletes) == "table" and items.deletes or {}
            -- Individual source events are the indivisible unit of cursor progress.
            if metrics.events_extracted > 0 and (
                metrics.documents_emitted + #docs > max_pending_documents
                or metrics.deletes_emitted + #deletes > max_pending_deletes
            ) then
                stopped_seq = event.seq
                break
            end

            if #docs + #deletes > 0 then
                local results, err, unavailable = materialize_event(event, docs, deletes)
                if err then
                    stopped_seq, failure, retryable = event.seq, err, unavailable
                    break
                end
                -- Publish an event only after every target consumes it.
                apply_results(results)
                metrics.events_extracted = metrics.events_extracted + 1
                metrics.documents_emitted = metrics.documents_emitted + #docs
                metrics.deletes_emitted = metrics.deletes_emitted + #deletes
            end
            consumed_seq = event.seq
            processed = processed + failed_processed
            if deadline then longest_event_ns = math.max(longest_event_ns, time.now():unix_nano() - started_ns) end
        end
    end

    if failure and (not consumed_seq or consumed_seq <= prior_seq) then
        if retryable then
            local message = tostring(failure)
            local unavailable = errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = message })
            if message ~= cursor.last_error then
                local updated, metadata_err = component.set_meta(thread_id, { status = "error", last_error = message })
                if not updated then
                    logger:warn("source status update failed", { thread_id = thread_id, error = tostring(metadata_err) })
                end
            end
            return nil, unavailable
        end
        return dead_letter_event(stopped_seq :: number, failure, failed_processed, failed_final_seq)
    end
    local last_seq = consumed_seq
    if not stopped_seq then last_seq = tonumber(range.to_seq) or consumed_seq end
    local to_seq = consumed_seq
    for _, kb_id in ipairs(clean_targets) do
        local results = target_results[kb_id]
        if results then
            if results.delete then kb_results[#kb_results + 1] = results.delete end
            if results.document then
                kb_results[#kb_results + 1] = results.document
                local placed, placement_err = request_graph_placement(deps, kb_id, targets[kb_id], results.document, body.kbs[kb_id].sources)
                if not placed then
                    logger:warn("graph placement request failed", { kb = kb_id, error = placement_err })
                    post_materialization_errors[#post_materialization_errors + 1] = {
                        component_id = kb_id, stage = "graph_placement", error = tostring(placement_err),
                    }
                end
            end
        end
    end
    local changed = metrics.documents_emitted > 0 or metrics.deletes_emitted > 0
    local requests = finalize_writes(last_seq, changed)
    if not changed then
        local patch = {
            last_run_at = time.now():utc():format(time.RFC3339),
            last_status = "skipped_no_items",
            last_from_seq = from_seq,
            last_to_seq = to_seq,
        }
        if requests then patch.digest_pending = false end
        local meta_writes
        if processed > 0 then
            meta_writes = build_source_meta_writes(
                thread_id, projection_id, clean_targets, kb_results, "ready", "", from_seq, to_seq, processed
            )
        end
        return {
            patch = patch,
            metrics = metrics,
            append_events = merge_append_writes(meta_writes, requests),
            last_seq = last_seq,
        }, nil
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
    end
    local append_events = merge_append_writes(
        build_source_meta_writes(
            thread_id, projection_id, clean_targets, kb_results, source_status, last_error, from_seq, to_seq, processed
        ),
        requests
    )

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
    body.kb_results = kb_results
    body.digest_pending = requests == nil or nil
    body.last_failed_batch = nil
    body.post_materialization_errors = #post_materialization_errors > 0 and post_materialization_errors or nil

    return {
        body = body,
        metrics = metrics,
        append_events = append_events,
        last_seq = last_seq,
    }, nil
end

local function run_proc(input_raw)
    local result, err = run_with_deps(input_raw, {})
    if err then return {ok = false, error_native = job_types.error_to_data(err)} end
    return result
end

return {
    run = run_with_deps,
    run_proc = run_proc,
    run_with_deps = run_with_deps,
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
