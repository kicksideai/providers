-- Source document projection into a KB engine materializer.
--
-- source_worker owns event/extractor orchestration. This module owns the
-- storage-facing vertical slice: materialization config, summary/chunk planning,
-- engine replace_document writes, and canonical external-id deletes.

local json = require("json")
local text = require("text")
local logger = require("logger"):named("knowledge.injection.source_materializer")

local kb_types = require("kb_types")
local engines = require("engines")
local tabular_chunker = require("tabular_chunker")

local M = {}

local MIN_CHUNK_SIZE = 200
local MAX_CHUNK_SIZE = 20000
local MAX_SUMMARY_CHARS = 8000
-- Optional per-KB guard for a single converted document handed to KB
-- materialization. Default is disabled: source data is never trimmed or skipped
-- unless the KB config explicitly opts in with max_document_content_chars.
local MAX_DOCUMENT_CONTENT_GUARD_CHARS = 256 * 1024 * 1024
-- Upper bound on chunks materialized from a single document. A pathologically
-- large file (a multi-hundred-MB spreadsheet exported as one markdown table)
-- explodes into tens of thousands of chunks, and the per-chunk enrichment loop
-- would then run sequential LLM calls for hours, monopolizing the injection lane
-- and starving every other document. The default policy is fail-and-preserve:
-- the document row records the failure and keeps the full source content for a
-- later replay after the KB limit is raised.
local MAX_CHUNKS_PER_DOC = 1500
-- A wide sheet repeats headers and row identity in each cell fragment. The
-- default sheet allowance covers this expansion; explicit KB limits still win.
-- Embedding batches and model enrichment retain their independent hard bounds.
local MAX_TABULAR_CHUNKS_PER_DOC = 20000
local MAX_CHUNKS_GUARD = 100000
local DEFAULT_CHUNK_ENRICHMENT_BATCH_SIZE = 32
local MAX_CHUNK_ENRICHMENT_BATCH_SIZE = 64
local DEFAULT_MAX_CHUNK_ENRICHMENT_BATCHES = 8
local MAX_CHUNK_ENRICHMENT_BATCHES = 100
local DEFAULT_MAX_IMAGE_CAPTIONS_PER_DOC = 32
local MAX_IMAGE_CAPTIONS_PER_DOC = 1000

type MaterializationOptions = {
    chunk_size: integer,
    chunk_overlap: integer,
    summary_max_chars: integer,
    summary_prompt: string?,
    max_document_content_chars: integer?,
    max_chunks_per_doc: integer?,
    tabular_max_chunks_per_doc: integer?,
    summary_model: string?,
    chunk_enrichment_model: string?,
    chunk_enrichment_batch_size: integer?,
    max_chunk_enrichment_batches: integer?,
    max_chunk_enrichment_failures: integer?,
    embed_images: boolean?,
    image_caption_model: string?,
    max_image_caption_failures: integer?,
    max_image_captions_per_doc: integer?,
}

-- An image becomes a chunk-class node: its embeddable text is the host chunk's
-- context plus the model caption, and its node metadata references the upload
-- artifact the bytes live in. Images are deduplicated by content hash, so one
-- node (one caption, one embedding) covers every occurrence of the same bytes;
-- occurrences lists each place the image appears.
type ImagePlan = {
    image: any,
    occurrences: {any},
    embed_index: integer,
    embed_text: string,
    caption: string,
    chunk_index: integer,
}

-- The outcome of situating one document's chunks: one prefix per input chunk
-- (empty where none was produced), how many chunks the model was actually asked
-- about, and how many came back with usable context.
type ChunkEnrichment = {
    prefixes: {string},
    attempted: integer,
    enriched: integer,
}

type DocPlan = {
    doc: any,
    summary_text: string,
    summary_index: integer?,
    chunk_indices: {integer},
    chunk_texts: {string},
    chunk_metadata: {any},
    chunk_prefixes: {string},
    image_plans: {ImagePlan},
}

type DocIngestResult = {
    component_id: string,
    kind: string,
    inserted: number,
    replaced: number,
    summary_count: number,
    chunk_count: number,
    failed: number,
    system_failed: number?,
    materialization: any?,
    notifications: {any}?,
}

local function trim(s: any): string
    if type(s) ~= "string" then return "" end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function decode_object(value: any): { [string]: any }
    if type(value) == "table" then return value :: { [string]: any } end
    if type(value) ~= "string" or value == "" then return {} end
    local decoded, err = json.decode(value :: string)
    if not err and type(decoded) == "table" then return decoded :: { [string]: any } end
    return {}
end

local function int_between(value, name: string, min_value: integer, max_value: integer): (integer?, string?)
    if type(value) ~= "number" or value ~= math.floor(value) then
        return nil, name .. " must be an integer"
    end
    local n = value :: integer
    if n < min_value then return min_value end
    if n > max_value then return max_value end
    return n, nil
end

local function optional_int_between(value, name: string, min_value: integer, max_value: integer): (integer?, string?)
    if value == nil or value == "" then return nil, nil end
    return int_between(value, name, min_value, max_value)
end

local function store_config(store_row)
    local config = store_row and store_row.config
    if type(config) == "table" then return config end
    if type(config) == "string" and config ~= "" then
        local decoded = decode_object(config)
        if type(decoded) == "table" then return decoded end
    end
    return {}
end

function M.resolve_engine(store_row: any): (any, string?)
    local kb_type = trim(store_row and (store_row :: any).kb_type)
    local engine, engine_err = engines.resolve(kb_type)
    if not engine then return nil, tostring(engine_err or ("no knowledge engine for kb_type " .. kb_type)) end
    return engine, nil
end

function M.materialization_options(target, worker_config): (MaterializationOptions?, string?)
    local store_row = target and (target.store_row or target)
    local config = store_config(store_row)
    config = engines.apply_default_config(config, target and target.engine)
    local worker_materialization = {}
    if type(worker_config) == "table" and type(worker_config.materialization) == "table" then
        worker_materialization = worker_config.materialization
    end

    local chunk_size, chunk_err = int_between(
        worker_materialization.chunk_size or config.chunk_size,
        "chunk_size",
        MIN_CHUNK_SIZE,
        MAX_CHUNK_SIZE
    )
    if chunk_err then return nil, chunk_err end
    local overlap, overlap_err = int_between(
        worker_materialization.chunk_overlap or config.chunk_overlap,
        "chunk_overlap",
        0,
        math.floor(math.max(0, (chunk_size :: integer) - 1))
    )
    if overlap_err then return nil, overlap_err end
    local summary_prompt = worker_materialization.summary_prompt or config.summary_prompt
    if type(summary_prompt) ~= "string" then summary_prompt = "" end
    local summary_max_chars, summary_err = int_between(
        worker_materialization.summary_max_chars or config.summary_max_chars,
        "summary_max_chars",
        0,
        MAX_SUMMARY_CHARS
    )
    if summary_err then return nil, summary_err end

    local summary_model = worker_materialization.summary_model or config.summary_model
    if type(summary_model) ~= "string" then summary_model = nil end
    local chunk_enrichment_model = worker_materialization.chunk_enrichment_model or config.chunk_enrichment_model
    if type(chunk_enrichment_model) ~= "string" then chunk_enrichment_model = nil end
    local max_doc_chars, max_doc_err = optional_int_between(
        worker_materialization.max_document_content_chars or config.max_document_content_chars,
        "max_document_content_chars",
        0,
        MAX_DOCUMENT_CONTENT_GUARD_CHARS
    )
    if max_doc_err then return nil, max_doc_err end
    if max_doc_chars == 0 then max_doc_chars = nil end

    local max_chunks, max_chunks_err = int_between(
        worker_materialization.max_chunks_per_doc or config.max_chunks_per_doc or MAX_CHUNKS_PER_DOC,
        "max_chunks_per_doc",
        1,
        MAX_CHUNKS_GUARD
    )
    if max_chunks_err then return nil, max_chunks_err end
    local max_chunk_enrichment_failures, enrich_fail_err = int_between(
        worker_materialization.max_chunk_enrichment_failures or config.max_chunk_enrichment_failures or 1,
        "max_chunk_enrichment_failures",
        0,
        100
    )
    if enrich_fail_err then return nil, enrich_fail_err end
    local chunk_enrichment_batch_size, enrich_batch_err = int_between(
        worker_materialization.chunk_enrichment_batch_size or config.chunk_enrichment_batch_size or DEFAULT_CHUNK_ENRICHMENT_BATCH_SIZE,
        "chunk_enrichment_batch_size",
        1,
        MAX_CHUNK_ENRICHMENT_BATCH_SIZE
    )
    if enrich_batch_err then return nil, enrich_batch_err end
    local max_chunk_enrichment_batches, enrich_batch_count_err = int_between(
        worker_materialization.max_chunk_enrichment_batches or config.max_chunk_enrichment_batches or DEFAULT_MAX_CHUNK_ENRICHMENT_BATCHES,
        "max_chunk_enrichment_batches",
        0,
        MAX_CHUNK_ENRICHMENT_BATCHES
    )
    if enrich_batch_count_err then return nil, enrich_batch_count_err end

    local embed_images_raw = worker_materialization.embed_images
    if embed_images_raw == nil then embed_images_raw = config.embed_images end
    local embed_images = embed_images_raw == true or
        (type(embed_images_raw) == "string" and (embed_images_raw :: string):lower() == "true")
    local image_caption_model = worker_materialization.image_caption_model or config.image_caption_model
    if type(image_caption_model) ~= "string" then image_caption_model = nil end
    local max_image_caption_failures, caption_fail_err = int_between(
        worker_materialization.max_image_caption_failures or config.max_image_caption_failures or 1,
        "max_image_caption_failures",
        0,
        100
    )
    if caption_fail_err then return nil, caption_fail_err end
    local max_image_captions_per_doc, image_budget_err = int_between(
        worker_materialization.max_image_captions_per_doc or config.max_image_captions_per_doc or DEFAULT_MAX_IMAGE_CAPTIONS_PER_DOC,
        "max_image_captions_per_doc",
        0,
        MAX_IMAGE_CAPTIONS_PER_DOC
    )
    if image_budget_err then return nil, image_budget_err end

    return {
        chunk_size = chunk_size :: integer,
        chunk_overlap = overlap :: integer,
        summary_max_chars = summary_max_chars :: integer,
        summary_prompt = summary_prompt :: string,
        max_document_content_chars = max_doc_chars :: integer?,
        max_chunks_per_doc = max_chunks :: integer,
        tabular_max_chunks_per_doc = (worker_materialization.max_chunks_per_doc or config.max_chunks_per_doc)
            and max_chunks :: integer or MAX_TABULAR_CHUNKS_PER_DOC,
        summary_model = summary_model :: string?,
        chunk_enrichment_model = chunk_enrichment_model :: string?,
        chunk_enrichment_batch_size = chunk_enrichment_batch_size :: integer,
        max_chunk_enrichment_batches = max_chunk_enrichment_batches :: integer,
        max_chunk_enrichment_failures = max_chunk_enrichment_failures :: integer,
        embed_images = embed_images,
        image_caption_model = image_caption_model :: string?,
        max_image_caption_failures = max_image_caption_failures :: integer,
        max_image_captions_per_doc = max_image_captions_per_doc :: integer,
    }, nil
end

-- Markdown chunking runs in the native `text` splitter (Go-side, langchaingo):
-- it is markdown-aware, keeps fenced code blocks intact, joins table rows so a
-- table is never shredded into per-row fragments, and respects chunk_size /
-- chunk_overlap. Doing the split natively keeps an arbitrarily large document off
-- the Lua value-stack entirely: the document never has to be segmented,
-- recursively cut, or table.concat'd in-process, so a giant single block (a
-- spreadsheet exported as one markdown table, a long fenced log) can no longer
-- exhaust the runtime registry. The Lua side only post-processes the returned
-- chunk list, which is bounded by chunk_size.
function M.chunk_text(input: any, size: integer, overlap: integer): { string }
    input = input or ""
    if trim(input) == "" then return {} end
    if size < MIN_CHUNK_SIZE then size = MIN_CHUNK_SIZE end
    if overlap < 0 then overlap = 0 end
    if overlap >= size then overlap = math.floor(size / 4) end

    -- join_table_rows keeps a markdown table's rows together (up to chunk_size)
    -- rather than emitting one chunk per row; code_blocks keeps fences intact.
    local splitter, create_err = text.splitter.markdown({
        chunk_size = size,
        chunk_overlap = overlap,
        code_blocks = true,
        join_table_rows = true,
    })
    if create_err or not splitter then
        error("text splitter unavailable: " .. tostring(create_err))
    end

    local raw, split_err = splitter:split_text(input :: string)
    if split_err then
        error("split_text failed: " .. tostring(split_err))
    end
    if type(raw) ~= "table" then return {} end

    local chunks: {string} = {}
    for _, c in ipairs(raw) do
        if type(c) == "string" and trim(c) ~= "" then chunks[#chunks + 1] = c end
    end

    -- Merge runts: a piece the splitter emits below the minimum (a lone heading,
    -- a stray short line) must never stand alone, so fold each sub-minimum chunk
    -- forward into the next and the final one back into its predecessor.
    local merged: {string} = {}
    for _, c in ipairs(chunks) do
        if #merged > 0 and #(merged[#merged]) < MIN_CHUNK_SIZE then
            merged[#merged] = merged[#merged] .. "\n\n" .. c
        else
            merged[#merged + 1] = c
        end
    end
    if #merged >= 2 and #(merged[#merged]) < MIN_CHUNK_SIZE then
        merged[#merged - 1] = merged[#merged - 1] .. "\n\n" .. merged[#merged]
        table.remove(merged)
    end
    return merged
end

-- locate_chunks assigns each chunk the page or slide range its text covers,
-- using the hidden markers Doc2MD writes where pages and slides start, and
-- removes the markers from the chunk text. Text before a chunk's first marker
-- continues the page of the previous chunk. A chunk left empty is dropped.
function M.locate_chunks(chunks: {string}): ({string}, {{[string]: any}})
    local texts: {string} = {}
    local located: {{[string]: any}} = {}
    local current: any = nil
    for _, chunk in ipairs(chunks) do
        local found = doc2md.markers(chunk)
        local first, last = current, current
        if #found > 0 then
            if first == nil or trim(chunk:sub(1, found[1].start - 1)) == "" then first = found[1] end
            last = found[#found]
            current = last
        end
        local text = trim(doc2md.strip_markers(chunk))
        if text ~= "" then
            local meta: {[string]: any} = {}
            if first ~= nil then
                meta[first.kind .. "_start"] = first.number
                meta[first.kind .. "_end"] = last.number
                if first.kind == "slide" and first.name ~= nil then meta.slide_name = first.name end
            end
            texts[#texts + 1] = text
            located[#located + 1] = meta
        end
    end
    return texts, located
end

function M.build_summary_text(doc: any, opts: any?)
    opts = opts or {}
    local summary_max_chars = 0
    if type(opts.summary_max_chars) == "number" and opts.summary_max_chars == math.floor(opts.summary_max_chars) then
        summary_max_chars = opts.summary_max_chars :: integer
    end
    if summary_max_chars <= 0 then return "" end
    local title = trim(doc.title)
    local body = trim(doc2md.strip_markers(doc.content or ""))
    if title ~= "" and body:sub(1, #title) == title then
        body = body:sub(#title + 1):gsub("^%s+", "")
    end
    local headline = title ~= "" and title or trim(doc.external_id) or ""
    if #headline > summary_max_chars then
        return headline:sub(1, summary_max_chars)
    end
    local budget = summary_max_chars - #headline - 2
    if budget < 0 then budget = 0 end
    local snippet = trim(body:sub(1, budget))
    if snippet == "" then return headline end
    if headline == "" then return snippet end
    return headline .. "\n\n" .. snippet
end

-- The markdown reference doc2md emits for an extracted image is `![alt](name)`.
-- An image is associated with the chunk whose text contains that reference, so the
-- caption is generated and embedded in the same context the surrounding prose has.
local function image_host_chunk(chunk_texts: {string}, name: any): integer?
    if type(name) ~= "string" or name == "" then return nil end
    local needle = "](" .. name .. ")"
    for i, chunk in ipairs(chunk_texts) do
        if chunk:find(needle, 1, true) then return i end
    end
    for i, chunk in ipairs(chunk_texts) do
        if chunk:find(name, 1, true) then return i end
    end
    return nil
end

-- The image references carried on the document for embed_images: each is the
-- upload-artifact handle the image bytes live in.
local function document_images(doc: any): {any}
    local meta = type(doc) == "table" and type(doc.metadata) == "table" and doc.metadata or {}
    local images = meta.image_artifacts
    if type(images) ~= "table" then return {} end
    return images :: {any}
end

-- Dedup key for an image: its content/blob hash when present (the upload store
-- refcounts blobs by hash), else its artifact_id. The same bytes share one node.
local function image_dedup_key(image: any): string?
    if type(image) ~= "table" then return nil end
    if type(image.checksum) == "string" and image.checksum ~= "" then return "sha:" .. image.checksum end
    if type(image.artifact_id) == "string" and image.artifact_id ~= "" then return "art:" .. image.artifact_id end
    return nil
end

-- Build the occurrence record for an image reference: where in the document the
-- bytes appear, so the deduplicated node can list every place it was used.
local function image_occurrence(image: any, chunk_index: integer): { [string]: any }
    local img = type(image) == "table" and image or {}
    return {
        artifact_id = img.artifact_id,
        source_artifact_id = img.source_artifact_id,
        name = img.name,
        chunk_index = chunk_index,
    }
end

-- Contextual retrieval for one document's chunks, under the KB's enrichment
-- budget. The budget is the same for every caller that re-derives prefixes:
-- at most max_chunk_enrichment_batches * chunk_enrichment_batch_size chunks
-- reach the model, and enrichment stops for the document once
-- max_chunk_enrichment_failures calls report a cause. enrich_batch is preferred
-- over enrich -- one round-trip per batch instead of one per chunk. A chunk left
-- outside the budget, or whose enrichment yields nothing usable, carries an empty
-- prefix; the caller decides what an empty prefix means (ingestion embeds the
-- chunk unprefixed, resummarize leaves the stored chunk untouched).
--
-- enrich(doc, summary_text, chunk) -> (prefix?, err?)
-- enrich_batch(doc, summary_text, chunks) -> (prefixes?, err?)
-- Returns the enrichment record plus the last cause an enrichment call reported,
-- so the caller sees why prefixes are missing.
-- Producer-supplied context stays authoritative; only missing context calls the model.
function M.enrich_chunk_prefixes(doc: any, summary_text: any, chunks: {string}, opts: MaterializationOptions,
    enrich: any?, enrich_batch: any?, chunk_metadata: {any}?): (ChunkEnrichment, string?)
    local record: ChunkEnrichment = { prefixes = {}, attempted = 0, enriched = 0 }
    local prefixes = record.prefixes
    local pending: {integer} = {}
    for i = 1, #chunks do
        local supplied = chunk_metadata and chunk_metadata[i] and chunk_metadata[i].contextual_prefix
        if supplied ~= nil and type(supplied) ~= "string" then
            error("chunk " .. tostring(i) .. " contextual_prefix must be a string")
        end
        prefixes[i] = trim(supplied)
        if prefixes[i] == "" then pending[#pending + 1] = i end
    end
    if not enrich and not enrich_batch then
        return record, nil
    end

    local last_error: string? = nil
    local failures = 0
    local disabled = false
    local max_failures = tonumber(opts.max_chunk_enrichment_failures) or 1
    local batch_size = tonumber(opts.chunk_enrichment_batch_size) or DEFAULT_CHUNK_ENRICHMENT_BATCH_SIZE
    batch_size = math.max(1, math.min(MAX_CHUNK_ENRICHMENT_BATCH_SIZE, math.floor(batch_size)))
    local max_batches = tonumber(opts.max_chunk_enrichment_batches) or DEFAULT_MAX_CHUNK_ENRICHMENT_BATCHES
    max_batches = math.max(0, math.min(MAX_CHUNK_ENRICHMENT_BATCHES, math.floor(max_batches)))

    local function record_failure(message: string)
        last_error = message
        failures = failures + 1
        if failures >= max_failures then
            disabled = true
            logger:warn("chunk enrichment disabled for document", {
                error = message,
                failures = failures,
                max_failures = max_failures,
            })
        end
    end

    if enrich_batch then
        local batches = 0
        local i = 1
        while i <= #pending do
            if disabled then
                break
            end
            if batches >= max_batches then
                logger:warn("chunk enrichment budget exhausted for document", {
                    batches = batches,
                    max_batches = max_batches,
                    remaining_chunks = #pending - i + 1,
                })
                break
            end
            local batch: {string} = {}
            local indices: {integer} = {}
            while i <= #pending and #batch < batch_size do
                local index = pending[i]
                batch[#batch + 1] = chunks[index]
                indices[#indices + 1] = index
                i = i + 1
            end

            batches = batches + 1
            record.attempted = record.attempted + #batch
            -- The enricher is an LLM seam: it answers (prefixes, err), and a
            -- provider that cannot produce them says so in err. Every cause it
            -- reports counts against the document's failure budget, so an
            -- enricher failing on every call is asked once, not once per chunk of
            -- every document.
            local ok, batch_prefixes, batch_err = pcall(enrich_batch, doc, summary_text, batch)
            if ok and type(batch_prefixes) == "table" then
                for j = 1, #batch do
                    local prefix = trim((batch_prefixes :: any)[j])
                    prefixes[indices[j]] = prefix
                    if prefix ~= "" then record.enriched = record.enriched + 1 end
                end
            else
                local message
                if not ok then
                    message = "chunk enrichment batch raised: " .. tostring(batch_prefixes)
                else
                    message = trim(batch_err)
                end
                if message == "" then
                    message = "chunk enrichment batch returned invalid result"
                end
                record_failure(message)
            end
        end
    else
        local max_enriched_chunks = max_batches * batch_size
        for position, i in ipairs(pending) do
            local chunk = chunks[i]
            if disabled then
                prefixes[i] = ""
            elseif position > max_enriched_chunks then
                if position == max_enriched_chunks + 1 then
                    logger:warn("chunk enrichment budget exhausted for document", {
                        batches = max_batches,
                        max_batches = max_batches,
                        remaining_chunks = #pending - position + 1,
                    })
                end
                prefixes[i] = ""
            else
                record.attempted = record.attempted + 1
                local ok, p, perr = pcall(enrich, doc, summary_text, chunk)
                if ok and type(p) == "string" and trim(p) ~= "" then
                    prefixes[i] = p :: string
                    record.enriched = record.enriched + 1
                else
                    prefixes[i] = ""
                    local message
                    if not ok then
                        message = "chunk enrichment raised: " .. tostring(p)
                    else
                        message = trim(perr)
                    end
                    if message ~= "" then record_failure(message) end
                end
            end
        end
    end

    return record, last_error
end

-- summarize, when supplied, returns an LLM-compressed summary for a document;
-- a nil/empty result falls back to the deterministic head-truncation summary.
-- enrich/enrich_batch, when supplied, returns short context lines situating chunks
-- within their document (contextual retrieval): each prefix is prepended to the
-- embedded text and kept on the chunk node as `contextual_prefix`. The stored
-- chunk content is unchanged.
-- caption, when supplied and opts.embed_images is set, returns a contextual
-- description of an image given its host chunk: caption(doc, chunk_text, prefix, image).
function M.plan_document_writes(documents: any, opts: MaterializationOptions, summarize: any?, enrich: any?, caption: any?, enrich_batch: any?): ({DocPlan}?, {string}?, string?)
    opts = opts or {}
    local chunk_size = tonumber(opts.chunk_size)
    local chunk_overlap = tonumber(opts.chunk_overlap)
    if not chunk_size or not chunk_overlap then
        return nil, nil, "materialization chunk_size and chunk_overlap are required"
    end
    chunk_size = math.floor(chunk_size)
    chunk_overlap = math.floor(chunk_overlap)

    local plans: {DocPlan} = {}
    local embed_texts: {string} = {}
    for _, doc in ipairs(documents) do
        local content = doc.content or ""
        local title = trim(doc.title)
        local body = content
        if title ~= "" and body:sub(1, #title) == title then
            body = body:sub(#title + 1):gsub("^%s+", "")
        end
        local chunks, chunk_metadata, tabular_err = tabular_chunker.chunk_document(doc, chunk_size)
        if tabular_err then return nil, nil, tabular_err end
        local located_metadata = nil
        if not chunks then chunks, located_metadata = M.locate_chunks(M.chunk_text(body, chunk_size, chunk_overlap)) end
        local max_chunks = chunk_metadata and
            (tonumber(opts.tabular_max_chunks_per_doc) or tonumber(opts.max_chunks_per_doc) or MAX_TABULAR_CHUNKS_PER_DOC)
            or (tonumber(opts.max_chunks_per_doc) or MAX_CHUNKS_PER_DOC)
        if #chunks > max_chunks then
            return nil, nil, "document chunk count exceeds KB policy: produced " ..
                tostring(#chunks) .. " chunks (max " .. tostring(math.floor(max_chunks)) ..
                "); full content preserved for replay"
        end
        local summary_text = ""
        if summarize then
            local compressed, summary_err = summarize(doc)
            if type(compressed) == "string" and trim(compressed) ~= "" then
                summary_text = compressed
            elseif summary_err then
                -- The document still gets the deterministic head summary below;
                -- the model's own cause would otherwise be lost.
                logger:warn("document summarization failed", {
                    error = tostring(summary_err),
                    external_id = doc.external_id,
                })
            end
        end
        if summary_text == "" then
            summary_text = M.build_summary_text(doc, opts)
        end

        local plan: DocPlan = {
            doc = doc,
            summary_text = summary_text,
            summary_index = nil,
            chunk_indices = {},
            chunk_texts = chunks,
            chunk_metadata = chunk_metadata or located_metadata or {},
            chunk_prefixes = {},
            image_plans = {},
        }

        if summary_text ~= "" then
            embed_texts[#embed_texts + 1] = summary_text
            plan.summary_index = #embed_texts
        end

        local prefixes: {string} = {}
        if enrich or enrich_batch or chunk_metadata then
            local enrichment, enrich_err = M.enrich_chunk_prefixes(doc, summary_text, chunks, opts, enrich, enrich_batch, chunk_metadata)
            prefixes = enrichment.prefixes
            if enrich_err then
                logger:warn("document chunks partially situated", {
                    error = enrich_err,
                    enriched = enrichment.enriched,
                    attempted = enrichment.attempted,
                    chunk_count = #chunks,
                })
            end
        end

        for i, chunk in ipairs(chunks) do
            local prefix = (type(prefixes[i]) == "string" and prefixes[i]) or ""
            plan.chunk_prefixes[#plan.chunk_prefixes + 1] = prefix
            -- Embed the chunk with its context prepended; the stored node keeps the
            -- raw chunk and carries the prefix as metadata.
            local embed = chunk
            if prefix ~= "" then embed = prefix .. "\n\n" .. chunk end
            embed_texts[#embed_texts + 1] = embed
            plan.chunk_indices[#plan.chunk_indices + 1] = #embed_texts
        end

        -- Each unique source image becomes one chunk-class node. Dedup by content
        -- hash first: the same bytes (a repeated diagram/logo) are captioned and
        -- embedded once, with every occurrence recorded. Caption in the context of
        -- the representative (first) host chunk, then embed (host context + caption)
        -- into the same vector space as text so one search finds prose and diagrams.
        -- embed_images is an explicit KB setting: source images are only sent to the
        -- caption model and embedded when the component has opted into image nodes.
        if caption and opts.embed_images == true then
            local seen: { [string]: integer } = {}
            local caption_failures = 0
            local caption_disabled = false
            local max_caption_failures = tonumber(opts.max_image_caption_failures) or 1
            local max_captions = tonumber(opts.max_image_captions_per_doc) or DEFAULT_MAX_IMAGE_CAPTIONS_PER_DOC
            max_captions = math.max(0, math.min(MAX_IMAGE_CAPTIONS_PER_DOC, math.floor(max_captions)))
            local captions_planned = 0
            local budget_logged = false
            for _, image in ipairs(document_images(doc)) do
                if caption_disabled then
                    break
                end
                local name = type(image) == "table" and image.name or nil
                local host = image_host_chunk(chunks, name)
                local host_index = host or (#chunks > 0 and 1 or nil)
                local occurrence = image_occurrence(image, host_index or 0)

                local key = image_dedup_key(image) or tostring(#plan.image_plans + 1)
                local existing = seen[key]
                if existing then
                    local existing_plan = plan.image_plans[existing]
                    existing_plan.occurrences[#existing_plan.occurrences + 1] = occurrence
                else
                    if captions_planned >= max_captions then
                        if not budget_logged then
                            budget_logged = true
                            logger:warn("image captioning budget exhausted for document", {
                                max_captions = max_captions,
                                image_count = #document_images(doc),
                            })
                        end
                    else
                        local host_text = host_index and chunks[host_index] or summary_text
                        local host_prefix = host_index and (plan.chunk_prefixes[host_index] or "") or ""
                        local ok, caption_text, caption_err = pcall(caption, doc, host_text, host_prefix, image)
                        if ok and type(caption_text) == "string" and trim(caption_text) ~= "" then
                            local context = host_prefix ~= "" and host_prefix or summary_text
                            local embed = caption_text
                            if context ~= "" then embed = context .. "\n\n" .. caption_text end
                            embed_texts[#embed_texts + 1] = embed
                            plan.image_plans[#plan.image_plans + 1] = {
                                image = image,
                                occurrences = { occurrence },
                                embed_index = #embed_texts,
                                embed_text = embed,
                                caption = caption_text,
                                chunk_index = host_index or 0,
                            }
                            seen[key] = #plan.image_plans
                            captions_planned = captions_planned + 1
                        else
                            if not ok then
                                logger:warn("image captioning raised", { error = tostring(caption_text) })
                            else
                                local message = trim(caption_err)
                                if message ~= "" then
                                    caption_failures = caption_failures + 1
                                    if caption_failures >= max_caption_failures then
                                        caption_disabled = true
                                        logger:warn("image captioning disabled for document", {
                                            error = message,
                                            failures = caption_failures,
                                            max_failures = max_caption_failures,
                                        })
                                    end
                                end
                            end
                        end
                    end
                end
            end
        end

        plans[#plans + 1] = plan
    end

    return plans, embed_texts
end

function M.delete_documents_from_store(target, deletes): (any, string?)
    local store_row = target.store_row or target
    local store_id = store_row.id
    local result = {
        component_id = store_row.component_id,
        kind = "delete",
        removed = 0,
        missing = 0,
        notifications = {},
    }

    local store = target.store
    if not store then
        local message = "materializer store unavailable for delete"
        logger:warn(message, {
            component_id = store_row.component_id,
        })
        return result, message
    end

    for _, d in ipairs(deletes or {}) do
        if d.external_id and d.external_id ~= "" then
            local removed, delete_err = store:delete_documents_by_external_id({
                store_id = store_id,
                external_source = d.external_source or "",
                external_id = d.external_id,
                external_version = d.external_version,
                source_ref = d.source_ref,
                metadata = d.metadata,
                thread_event_id = d.thread_event_id,
                thread_event_seq = d.thread_event_seq,
            })
            if delete_err then
                local message = "delete_documents_by_external_id failed: " .. tostring(delete_err)
                logger:warn("delete_documents_by_external_id failed", { error = delete_err })
                return result, message
            end

            local removed_row = type(removed) == "table" and removed or nil
            local removed_count = tonumber(removed_row and removed_row.removed or removed) or 0
            if removed_count == 0 then
                result.missing = result.missing + 1
                result.notifications[#result.notifications + 1] = {
                    external_source = d.external_source,
                    external_id = d.external_id,
                    external_version = d.external_version,
                    user_id = d.user_id,
                    removed = 0,
                    missing = 1,
                }
            else
                result.removed = result.removed + removed_count
                result.notifications[#result.notifications + 1] = {
                    external_source = d.external_source,
                    external_id = d.external_id,
                    external_version = d.external_version,
                    user_id = d.user_id,
                    removed = removed_count,
                    removed_document_count = tonumber(removed_row and removed_row.removed_document_count) or removed_count,
                    removed_failed_document_count = tonumber(removed_row and removed_row.removed_failed_document_count) or 0,
                    removed_summary_count = tonumber(removed_row and removed_row.removed_summary_count) or 0,
                    removed_chunk_count = tonumber(removed_row and removed_row.removed_chunk_count) or 0,
                    missing = 0,
                }
            end
        end
    end
    return result, nil
end

-- A single embed request can't carry an arbitrarily large document: providers cap
-- both the number of inputs and the total tokens per call (e.g. text-embedding-3-*
-- on wippy.llm.openai rejects requests over 300_000 tokens). A long file's hundreds
-- of chunks must therefore be embedded across several requests, each safely under
-- the cap, and the vectors stitched back in the original order.
--
-- The budget sits below the provider cap to leave headroom for the provider's own
-- tokenizer disagreeing with our estimate. With no in-tree tokenizer, token count is
-- estimated from byte length at a conservative bytes-per-token ratio (real text runs
-- ~4 bytes/token; 3.5 over-counts slightly, which is the safe direction here).
local EMBED_BATCH_COUNT = 96
local EMBED_BATCH_MAX_TOKENS = 250000
local EMBED_BYTES_PER_TOKEN = 3.5

local function estimate_tokens(text: string): integer
    return math.ceil(#text / EMBED_BYTES_PER_TOKEN)
end

local function batch_embed(embedder: any, embed_texts: {string}, model: any, dims: any): (any, string?)
    local all: {any} = {}
    local i = 1
    local n = #embed_texts
    while i <= n do
        local batch: {string} = {}
        local tokens = 0
        while i <= n and #batch < EMBED_BATCH_COUNT do
            local chunk_tokens = estimate_tokens(embed_texts[i])
            -- A chunk whose estimate alone exceeds the budget can never share a
            -- request; send it on its own. If it still cannot fit, the provider
            -- would reject it, so surface a precise per-chunk error rather than
            -- failing the whole document on an opaque overflow.
            if #batch == 0 and chunk_tokens > EMBED_BATCH_MAX_TOKENS then
                tokens = chunk_tokens
                batch[1] = embed_texts[i]
                i = i + 1
                break
            end
            if #batch > 0 and tokens + chunk_tokens > EMBED_BATCH_MAX_TOKENS then
                break
            end
            batch[#batch + 1] = embed_texts[i]
            tokens = tokens + chunk_tokens
            i = i + 1
        end

        if #batch == 1 and tokens > EMBED_BATCH_MAX_TOKENS then
            return nil, "embed chunk " .. tostring(i - 1) .. " is ~" .. tostring(tokens) ..
                " tokens, over the " .. tostring(EMBED_BATCH_MAX_TOKENS) ..
                "-token per-request budget"
        end

        local vectors, emb_err = embedder(batch, model, dims)
        if emb_err or type(vectors) ~= "table" or type(vectors.result) ~= "table" then
            return nil, "embed failed: " .. tostring(emb_err)
        end
        if #vectors.result ~= #batch then
            return nil, "embed returned " .. tostring(#vectors.result) .. " vectors for " .. tostring(#batch) .. " texts"
        end
        for _, v in ipairs(vectors.result) do all[#all + 1] = v end
    end
    return { result = all }, nil
end

-- Exposed for unit tests.
M.batch_embed = batch_embed
M.estimate_tokens = estimate_tokens
M.EMBED_BATCH_MAX_TOKENS = EMBED_BATCH_MAX_TOKENS
M.MAX_DOCUMENT_CONTENT_GUARD_CHARS = MAX_DOCUMENT_CONTENT_GUARD_CHARS
M.MAX_CHUNKS_PER_DOC = MAX_CHUNKS_PER_DOC
M.DEFAULT_CHUNK_ENRICHMENT_BATCH_SIZE = DEFAULT_CHUNK_ENRICHMENT_BATCH_SIZE
M.MAX_CHUNK_ENRICHMENT_BATCH_SIZE = MAX_CHUNK_ENRICHMENT_BATCH_SIZE
M.DEFAULT_MAX_CHUNK_ENRICHMENT_BATCHES = DEFAULT_MAX_CHUNK_ENRICHMENT_BATCHES
M.MAX_CHUNK_ENRICHMENT_BATCHES = MAX_CHUNK_ENRICHMENT_BATCHES
M.DEFAULT_MAX_IMAGE_CAPTIONS_PER_DOC = DEFAULT_MAX_IMAGE_CAPTIONS_PER_DOC
M.MAX_IMAGE_CAPTIONS_PER_DOC = MAX_IMAGE_CAPTIONS_PER_DOC
M.MAX_SUMMARY_CHARS = MAX_SUMMARY_CHARS

-- Classify a per-document failure so the worker can flag genuinely system-level
-- causes (resource/registry exhaustion, provider outages, the store being
-- unavailable) distinctly from content errors (a malformed or unembeddable
-- document). A system failure points at the instance, not the document, and is
-- worth retrying; a content failure is the document's own and is not.
local CONTENT_FAILURE_PATTERNS: {string} = {
    "document chunk count exceeds kb policy",
    "document content too large",
    "invalid byte sequence for encoding",
    "no materialized summary or chunks",
}

local SYSTEM_FAILURE_PATTERNS: {string} = {
    "registry overflow",
    "stack overflow",
    "out of memory",
    "cannot allocate",
    "vector_dimensions unavailable",
    "store unavailable",
    "embed failed",
    "embed returned",
    "vector missing",
    "vector dimension",
    "vector contains non-number",
    "timeout",
    "connection refused",
    "unavailable",
}

local function is_system_failure(message: any): boolean
    if type(message) ~= "string" then return false end
    local lowered = (message :: string):lower()
    for _, pat in ipairs(CONTENT_FAILURE_PATTERNS) do
        if lowered:find(pat, 1, true) then return false end
    end
    for _, pat in ipairs(SYSTEM_FAILURE_PATTERNS) do
        if lowered:find(pat, 1, true) then return true end
    end
    return false
end

M.is_system_failure = is_system_failure

local function validate_vector(vec: any, dims: any, label: string): string?
    if type(vec) ~= "table" then
        return label .. " vector missing"
    end
    local expected = math.floor(tonumber(dims) or 0)
    if expected > 0 and #vec ~= expected then
        return label .. " vector dimension mismatch: got " .. tostring(#vec) ..
            ", expected " .. tostring(expected)
    end
    for i, value in ipairs(vec) do
        if type(value) ~= "number" then
            return label .. " vector contains non-number at " .. tostring(i)
        end
    end
    return nil
end

function M.ingest_documents_into_store(component_id: string, target, documents, embedder, summarizer, enricher, captioner, worker_config, batch_enricher): (DocIngestResult, string?)
    local store_row = target.store_row or target
    local store_id = store_row.id
    local store = target.store
    local materialization, materialization_err = M.materialization_options(target, worker_config)
    local result: DocIngestResult = {
        component_id = component_id,
        kind = "document",
        inserted = 0,
        replaced = 0,
        summary_count = 0,
        chunk_count = 0,
        failed = 0,
        materialization = materialization,
        notifications = {},
    }

    if materialization_err then return result, materialization_err end
    if not materialization then return result, "materialization options unavailable" end
    local materialization_opts: MaterializationOptions = materialization
    if not store then return result, "materializer store unavailable" end
    if #documents == 0 then return result, nil end

    -- LLM-compress each document into its summary with the KB's summary model;
    -- without a summarizer or model the plan falls back to head-truncation.
    local summarize: any? = nil
    if summarizer and materialization_opts.summary_model and materialization_opts.summary_model ~= "" then
        summarize = function(doc: any): (string?, string?)
            local summary, summary_err = summarizer(doc.content or "", materialization_opts.summary_model,
                materialization_opts.summary_max_chars, materialization_opts.summary_prompt)
            if type(summary) == "string" then return summary :: string end
            return nil, summary_err
        end
    end

    -- Contextual retrieval: situate each chunk within its document with the KB's
    -- chunk-enrichment model. Skipped without an enricher or model.
    local enrich: any? = nil
    if enricher and materialization_opts.chunk_enrichment_model and materialization_opts.chunk_enrichment_model ~= "" then
        enrich = function(doc: any, summary_text: any, chunk: any): (string?, string?)
            local prefix, err = enricher(doc.content or "", summary_text or "", chunk or "", materialization_opts.chunk_enrichment_model)
            if type(prefix) == "string" then return prefix :: string end
            return nil, err
        end
    end
    local enrich_batch: any? = nil
    if batch_enricher and materialization_opts.chunk_enrichment_model and materialization_opts.chunk_enrichment_model ~= "" then
        enrich = nil
        enrich_batch = function(doc: any, summary_text: any, chunks: any): (any?, string?)
            local prefixes, err = batch_enricher(doc.content or "", summary_text or "", chunks or {}, materialization_opts.chunk_enrichment_model)
            if type(prefixes) == "table" then return prefixes end
            return nil, err
        end
    end

    -- Image captioning: describe each source image in the context of its host
    -- chunk with the KB's caption model. Available whenever a captioner + model are
    -- present; plan_document_writes decides per image which ones embed (embed_images
    -- for extracted images, always for rendered pages). Failures drop the image.
    local caption: any? = nil
    if captioner
        and materialization_opts.image_caption_model and materialization_opts.image_caption_model ~= "" then
        caption = function(doc: any, chunk_text: any, prefix: any, image: any): (string?, string?)
            local context = (type(prefix) == "string" and prefix ~= "") and prefix or (chunk_text or "")
            local described, err = captioner(image, context or "", materialization_opts.image_caption_model)
            if type(described) == "string" then return described :: string end
            return nil, err
        end
    end

    local dims, dim_err = store:vector_dimensions({})
    if dim_err or type(dims) ~= "number" then
        return result, "vector_dimensions unavailable: " .. tostring(dim_err)
    end

    -- Per-document fault isolation. Plan, embed, and write each document on its
    -- own so one document that throws mid-materialization (a registry overflow on
    -- a pathological block, a provider rejection, a malformed chunk) fails in
    -- isolation and the rest of the batch still materializes. A single document's
    -- summary/chunks/images are still planned and embedded together, preserving
    -- their order and node associations; documents simply no longer share a fate.
    -- A thrown error and a returned error are both recorded as a per-document
    -- failure: the document is counted failed with its specific cause, never
    -- aborting the loop.
    local function materialize_one(doc: any): (boolean, string?)
        local content = type(doc.content) == "string" and doc.content or ""
        local max_doc_chars = tonumber(materialization_opts.max_document_content_chars)
        if max_doc_chars and max_doc_chars > 0 and #content > max_doc_chars then
            return false, "document content too large: " .. tostring(#content) ..
                " chars (max " .. tostring(math.floor(max_doc_chars)) .. ")"
        end
        local one_plans, one_embed_texts, plan_err = M.plan_document_writes({ doc }, materialization_opts, summarize, enrich, caption, enrich_batch)
        if plan_err then return false, plan_err end
        if not one_plans or #one_plans == 0 then return false, "no plan produced" end
        local plan = one_plans[1]
        local embed_texts = one_embed_texts or {}
        if #embed_texts == 0 then
            return false, "no materialized summary or chunks"
        end

        local vectors, emb_err = batch_embed(embedder, embed_texts, store_row.embedding_model, dims)
        if emb_err or type(vectors) ~= "table" or type(vectors.result) ~= "table" then
            return false, emb_err or "embed failed"
        end
        if #vectors.result ~= #embed_texts then
            return false, "embed returned " .. tostring(#vectors.result) ..
                " vectors for " .. tostring(#embed_texts) .. " texts"
        end

        local meta = {}
        for k, v in pairs(doc.metadata or {}) do meta[k] = v end
        meta.external_source = meta.external_source or doc.external_source
        meta.external_id = meta.external_id or doc.external_id
        meta.external_version = meta.external_version or doc.external_version
        if type(doc.source_ref) == "table" and type(meta.source_ref) ~= "table" then
            meta.source_ref = doc.source_ref
        end
        meta.materialization = meta.materialization or materialization_opts

        local doc_meta = {}
        for k, v in pairs(meta) do doc_meta[k] = v end
        doc_meta.role = "document"
        -- Source-document read-model status: the engine document node IS the
        -- KB-owned read-model row keyed by canonical (external_source, external_id).
        -- A materialized document records status=completed here; a poison document
        -- records status=failed on the same row (see the failure path below), so
        -- the doc's outcome is queryable on the KB and re-ingestion replaces it.
        doc_meta.status = "completed"
        doc_meta.error = nil

        local children = {}
        local invalid_vector = nil

        if plan.summary_index then
            local vec = vectors.result[plan.summary_index]
            local vec_err = validate_vector(vec, dims, "summary")
            if vec_err then
                invalid_vector = vec_err
            else
                local s_meta = {}
                for k, v in pairs(meta) do s_meta[k] = v end
                s_meta.role = "summary"
                children[#children + 1] = {
                    node = {
                        node_type = kb_types.NODE_TYPE.SUMMARY,
                        content = plan.summary_text,
                        content_type = "text/plain",
                        metadata = s_meta,
                    },
                    embedding = vec,
                }
            end
        end

        if not invalid_vector then
            for chunk_idx, embed_index in ipairs(plan.chunk_indices) do
                local vec = vectors.result[embed_index]
                local vec_err = validate_vector(vec, dims, "chunk " .. tostring(chunk_idx))
                if vec_err then
                    invalid_vector = vec_err
                    break
                end
                local c_meta = {}
                for k, v in pairs(meta) do c_meta[k] = v end
                c_meta.role = "chunk"
                c_meta.chunk_index = chunk_idx
                for key, value in pairs(plan.chunk_metadata[chunk_idx] or {}) do
                    c_meta[key] = value
                end
                local prefix = plan.chunk_prefixes and plan.chunk_prefixes[chunk_idx]
                if type(prefix) == "string" and prefix ~= "" then
                    c_meta.contextual_prefix = prefix
                end
                children[#children + 1] = {
                    node = {
                        node_type = kb_types.NODE_TYPE.CHUNK,
                        content = plan.chunk_texts[chunk_idx],
                        content_type = "text/plain",
                        metadata = c_meta,
                    },
                    embedding = vec,
                }
            end
        end

        if not invalid_vector then
            for _, image_plan in ipairs(plan.image_plans or {}) do
                local vec = vectors.result[image_plan.embed_index]
                local vec_err = validate_vector(vec, dims, "image")
                if vec_err then
                    invalid_vector = vec_err
                    break
                end
                local image = type(image_plan.image) == "table" and image_plan.image or {}
                local i_meta = {}
                for k, v in pairs(meta) do i_meta[k] = v end
                i_meta.role = "image"
                i_meta.chunk_index = image_plan.chunk_index
                i_meta.caption = image_plan.caption
                i_meta.upload_id = image.upload_id
                i_meta.artifact_id = image.artifact_id
                i_meta.source_artifact_id = image.source_artifact_id
                i_meta.image_name = image.name
                i_meta.image_content_type = image.content_type
                i_meta.image_checksum = image.checksum
                -- One node per unique image; occurrences lists every place the same
                -- bytes appear in the document so retrieval can map back to each.
                i_meta.occurrences = image_plan.occurrences
                local content_type = type(image.content_type) == "string" and image.content_type ~= ""
                    and image.content_type or "application/octet-stream"
                -- A chunk-class node: it flows through chunk retrieval and concept
                -- placement, while content_type + role mark it an image and the
                -- metadata references the upload artifact the bytes live in.
                children[#children + 1] = {
                    node = {
                        node_type = kb_types.NODE_TYPE.CHUNK,
                        content = image_plan.caption,
                        content_type = content_type,
                        metadata = i_meta,
                    },
                    embedding = vec,
                }
            end
        end

        if invalid_vector or #children == 0 then
            return false, invalid_vector or "no materialized summary or chunks"
        end

        local replacement, replace_err = store:replace_document({
            store_id = store_id,
            document = {
                node_type = kb_types.NODE_TYPE.DOCUMENT,
                content = doc.content or "",
                content_type = doc.content_type or "text/plain",
                metadata = doc_meta,
            },
            children = children,
        })
        if replace_err or not replacement then
            return false, "replace document failed: " .. tostring(replace_err or "no result")
        end

        result.inserted = result.inserted + 1
        result.replaced = result.replaced + (tonumber(replacement.removed) or 0)
        local summary_count = tonumber(replacement.summary_count) or 0
        local chunk_count = tonumber(replacement.chunk_count) or 0
        result.summary_count = result.summary_count + summary_count
        result.chunk_count = result.chunk_count + chunk_count
        result.notifications[#result.notifications + 1] = {
            document_node_id = replacement.document_node_id,
            external_source = meta.external_source,
            external_id = meta.external_id,
            external_version = meta.external_version,
            user_id = meta.actor_id,
            status = "completed",
            summary_count = summary_count,
            chunk_count = chunk_count,
            removed_document_count = tonumber(replacement.removed_document_count) or tonumber(replacement.removed) or 0,
            removed_failed_document_count = tonumber(replacement.removed_failed_document_count) or 0,
            removed_summary_count = tonumber(replacement.removed_summary_count) or 0,
            removed_chunk_count = tonumber(replacement.removed_chunk_count) or 0,
        }
        local n = result.notifications[#result.notifications]
        n.persisted = true
        n.document_delta = 1 - (tonumber(n.removed_document_count) or 0)
        n.failed_delta = -(tonumber(n.removed_failed_document_count) or 0)
        n.chunk_delta = (tonumber(n.chunk_count) or 0) - (tonumber(n.removed_chunk_count) or 0)
        n.summary_delta = summary_count - (tonumber(n.removed_summary_count) or 0)
        n.embedding_delta = (tonumber(n.chunk_delta) or 0) + (tonumber(n.summary_delta) or 0)
        return true, nil
    end

    -- Dead-letter a poison document onto the KB-owned source-document read-model:
    -- write the document node by canonical identity with status=failed and the
    -- captured error (no children, since it never materialized). This replaces any
    -- prior row for the same (external_source, external_id), so the failed doc is
    -- queryable on the KB and re-ingestion replaces it with a completed row. A
    -- failure to persist the dead-letter is logged but never re-raised: the
    -- isolation guarantee (siblings still materialize, cursor still advances) holds
    -- regardless. Returns the document node id when the row was written.
    local function dead_letter(doc: any, failure: string, system_level: boolean): any?
        if type(doc) ~= "table" then return nil end
        local meta = {}
        for k, v in pairs(doc.metadata or {}) do meta[k] = v end
        meta.external_source = meta.external_source or doc.external_source
        meta.external_id = meta.external_id or doc.external_id
        meta.external_version = meta.external_version or doc.external_version
        if type(doc.source_ref) == "table" and type(meta.source_ref) ~= "table" then
            meta.source_ref = doc.source_ref
        end
        meta.role = "document"
        meta.status = "failed"
        -- Failed roots remain readable for replay. Their display metadata must
        -- expose the rejection after the upload progress drawer has closed.
        meta.source_title = meta.title or doc.title or meta.original_filename
        meta.title = "Indexing failed: " .. failure
        if meta.label ~= nil then meta.label = meta.title end
        meta.error = failure
        meta.system_level = system_level

        local ok, replacement, replace_err = pcall(function()
            return store:replace_document({
                store_id = store_id,
                document = {
                    node_type = kb_types.NODE_TYPE.DOCUMENT,
                    content = doc.content or "",
                    content_type = doc.content_type or "text/plain",
                    metadata = meta,
                },
                children = {},
            })
        end)
        if not ok then
            logger:warn("dead-letter persist raised", { external_id = meta.external_id, error = tostring(replacement) })
            return nil
        end
        if replace_err or type(replacement) ~= "table" then
            logger:warn("dead-letter persist failed", { external_id = meta.external_id, error = tostring(replace_err) })
            return nil
        end
        return replacement
    end

    -- Drive each document through its own isolated materialization. Content-level
    -- failures stay isolated so poison documents cannot head-of-line-block their
    -- siblings. If every document fails for a system-level cause (provider down,
    -- store unavailable, malformed provider vectors), the batch returns an error
    -- without writing failed rows so the source worker can retry instead of
    -- advancing a cursor through an infrastructure outage.
    local system_failures = 0
    local first_system_failure = nil
    for _, doc in ipairs(documents) do
        -- pcall returns (call_ok, materialize_one's first return, second return).
        local call_ok, doc_ok, doc_err = pcall(materialize_one, doc)
        local succeeded = false
        local failure = nil
        if not call_ok then
            -- materialize_one raised (e.g. a registry overflow on a pathological
            -- block); doc_ok holds the raised error.
            failure = tostring(doc_ok)
        elseif doc_ok == true then
            succeeded = true
        else
            failure = tostring(doc_err or "document materialization failed")
        end

        if not succeeded then
            local failure_message = failure or "document materialization failed"
            result.failed = result.failed + 1
            local system_level = is_system_failure(failure_message)
            logger:warn("document materialization failed", {
                error = failure_message,
                external_id = doc.external_id,
                system_level = system_level,
            })
            local dead_letter_result = nil
            if not system_level then
                dead_letter_result = dead_letter(doc, failure_message, system_level)
            end
            local dead_letter_node_id = type(dead_letter_result) == "table" and dead_letter_result.document_node_id or nil
            if system_level then
                system_failures = system_failures + 1
                if not first_system_failure then first_system_failure = failure_message end
            end
            local removed_documents = tonumber(dead_letter_result and dead_letter_result.removed_document_count) or tonumber(dead_letter_result and dead_letter_result.removed) or 0
            local removed_failed_documents = tonumber(dead_letter_result and dead_letter_result.removed_failed_document_count) or 0
            local removed_summaries = tonumber(dead_letter_result and dead_letter_result.removed_summary_count) or 0
            local removed_chunks = tonumber(dead_letter_result and dead_letter_result.removed_chunk_count) or 0
            local persisted = dead_letter_result ~= nil
            result.notifications[#result.notifications + 1] = {
                external_source = type(doc) == "table" and doc.external_source or nil,
                external_id = type(doc) == "table" and doc.external_id or nil,
                external_version = type(doc) == "table" and doc.external_version or nil,
                user_id = type(doc) == "table" and type(doc.metadata) == "table"
                    and doc.metadata.actor_id or nil,
                status = "failed",
                error = failure_message,
                system_level = system_level,
                document_node_id = dead_letter_node_id,
                persisted = persisted,
                removed_document_count = removed_documents,
                removed_failed_document_count = removed_failed_documents,
                removed_summary_count = removed_summaries,
                removed_chunk_count = removed_chunks,
                document_delta = persisted and -removed_documents or 0,
                failed_delta = persisted and (1 - removed_failed_documents) or 0,
                chunk_delta = persisted and -removed_chunks or 0,
                summary_delta = persisted and -removed_summaries or 0,
                embedding_delta = persisted and -(removed_chunks + removed_summaries) or 0,
            }
        end
    end

    result.system_failed = system_failures
    if result.failed > 0 and result.inserted == 0 and system_failures == result.failed then
        return result, "system-level document materialization failed for all documents: " ..
            tostring(first_system_failure or "unknown")
    end

    return result, nil
end

return M
