-- Regenerate a kb10 knowledge base's stored document summaries under its
-- current materialization settings, from already-materialized document
-- content, without re-delivering the source. kb10-internal, mirrors
-- reembed.lua: it resolves the store and the KB's materialization options
-- exactly the way the live source pipeline resolves them (source_materializer's
-- resolve_engine + materialization_options), runs the same summarizer ingestion
-- uses (source_worker's default_summarizer), and writes the regenerated summary
-- content plus its embedding straight through the kb10 store (no contract). The
-- use case: summary_max_chars or summary_prompt changed after documents were
-- already ingested, so their stored summaries are stale and content-hash
-- delivery dedup will never re-trigger materialization to refresh them.
--
-- A document's chunk contextual prefixes are derived FROM its summary at ingest,
-- so once a document's summary changes its chunks' stored prefixes and vectors
-- are stale too. When the KB has a chunk_enrichment_model configured, each
-- successfully re-summarized document's chunk nodes are re-situated through
-- source_materializer.enrich_chunk_prefixes -- the same budgeted seam ingestion
-- plans with -- so a regeneration costs the same bounded number of model calls
-- per document an ingest does, preferring the batch enricher for one round-trip
-- per batch. Ingestion never folds the prefix into the chunk node's stored
-- content -- it keeps content as the raw chunk text and carries the prefix
-- separately as metadata.contextual_prefix, embedding prefix+chunk instead -- so
-- this mirrors that: only metadata.contextual_prefix and the vector are
-- rewritten, the chunk's stored content is untouched.
--
-- A node's text and the vector that indexes it are written as one fact, through
-- the store's transactional write_node_with_embedding: a node either carries new
-- content or a new prefix together with the vector that matches it, or keeps
-- exactly what it had. Nothing here can leave regenerated text scored on the
-- words it replaced.

local llm = require("llm")
local logger = require("logger"):named("kb10.engine.resummarize")
local kb10_store = require("kb10_store")
local kb_types = require("kb_types")
local materializer = require("source_materializer")
local source_worker = require("source_worker")

local M = {}

local PAGE = 200
local EMBED_TIMEOUT = 120

-- The settings and store seams one run holds for every document it walks. The
-- materialization options are the KB's own, resolved once, so each document is
-- regenerated under the same settings the source pipeline would have used.
type RunCtx = {
    browse: any,
    store_id: string,
    embed_model: any,
    dims: any,
    embed_one: any,
    materialization: MaterializationOptions,
    enrich: any?,
    enrich_batch: any?,
    summarize: (string) -> (string?, string?),
}

local function trim(s: any): string
    if type(s) ~= "string" then return "" end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- Same shape as ingestion's default_embedder (source_worker): one llm.embed round-trip.
local function embedder(texts: any, model: any, dims: any): (any, string?)
    return llm.embed(texts, { model = model, dimensions = dims, timeout = EMBED_TIMEOUT })
end

-- Every chunk node of one document, oldest first, with content. Paged through the
-- store so a document with thousands of chunks is read in bounded requests; a
-- browse failure is the caller's error, never an early end of the list.
local function load_chunk_nodes(browse: any, store_id: string, doc_id: string): ({ any }?, string?)
    local nodes: { any } = {}
    local offset = 0
    while true do
        local chunks, berr = browse(store_id, {
            parent_id = doc_id,
            node_type = kb_types.NODE_TYPE.CHUNK,
            limit = PAGE,
            offset = offset,
            include_content = true,
        })
        if berr then return nil, tostring(berr) end
        if type(chunks) ~= "table" then return nil, "browse returned no chunk list" end
        local count = #(chunks :: { any })
        if count == 0 then break end
        for _, chunk_node in ipairs(chunks :: { any }) do
            nodes[#nodes + 1] = chunk_node
        end
        offset = offset + count
        if count < PAGE then break end
    end
    return nodes, nil
end

-- Re-situate one document's chunk nodes against its freshly regenerated summary
-- and re-embed each one that gains context. A chunk whose enrichment yields
-- nothing usable, or whose re-embed or write fails, keeps its stored content,
-- prefix, and vector untouched and counts as failed -- never store an empty or
-- partial prefix over a good one. Chunks the enrichment budget never reached are
-- left as they are and are not failures: the budget is a deliberate ceiling.
-- Returns (reenriched, failed, err); err means the document's chunks could not
-- be read at all.
local function reenrich_chunks(browse: any, store_id: string, doc: any, summary: string, opts: MaterializationOptions,
    enrich: any?, enrich_batch: any?, embed_model: any, dims: any, embed_one: any): (integer, integer, string?)
    local doc_id = (doc :: any).id
    if type(doc_id) ~= "string" or doc_id == "" then return 0, 0, "document node has no id" end
    local nodes, load_err = load_chunk_nodes(browse, store_id, doc_id :: string)
    if load_err then return 0, 0, load_err end

    local targets: { any } = {}
    local texts: { string } = {}
    local failed = 0
    for _, chunk_node in ipairs(nodes :: { any }) do
        local chunk_content = (chunk_node :: any).content
        if type(chunk_content) ~= "string" or chunk_content == "" then
            failed = failed + 1
        else
            targets[#targets + 1] = chunk_node
            texts[#texts + 1] = chunk_content :: string
        end
    end
    if #texts == 0 then return 0, failed, nil end

    local enrichment, enrich_err = materializer.enrich_chunk_prefixes(doc, summary, texts, opts, enrich, enrich_batch)
    if enrich_err then
        logger:warn("chunk re-situating incomplete for document", {
            document_id = doc_id,
            error = enrich_err,
            enriched = enrichment.enriched,
            attempted = enrichment.attempted,
            chunk_count = #texts,
        })
    end
    if enrichment.attempted < #texts then
        logger:warn("chunk enrichment budget left chunks un-situated", {
            document_id = doc_id,
            attempted = enrichment.attempted,
            chunk_count = #texts,
        })
    end

    local reenriched = 0
    for i, chunk_node in ipairs(targets) do
        local prefix = enrichment.prefixes[i]
        if type(prefix) ~= "string" or trim(prefix) == "" then
            -- Only a chunk the model was actually asked about is a failure; the
            -- rest were held back by the budget and keep their stored context.
            if i <= enrichment.attempted then failed = failed + 1 end
        else
            local vector, eerr = embed_one(prefix .. "\n\n" .. texts[i], embed_model, dims)
            if eerr or not vector then
                logger:warn("chunk re-embed failed", { document_id = doc_id, error = tostring(eerr or "no vector") })
                failed = failed + 1
            else
                local _, werr = kb10_store.write_node_with_embedding(store_id, {
                    id = (chunk_node :: any).id,
                    node_type = kb_types.NODE_TYPE.CHUNK,
                    parent_id = doc_id,
                    metadata = { contextual_prefix = prefix },
                }, vector)
                if werr then
                    logger:warn("chunk prefix and embedding write failed",
                        { document_id = doc_id, error = tostring(werr) })
                    failed = failed + 1
                else
                    reenriched = reenriched + 1
                end
            end
        end
    end
    return reenriched, failed, nil
end

-- The summary child's metadata for a document being regenerated: the document's
-- own canonical identity fields, role=summary, and the materialization options
-- the summary was produced under -- the same stamp ingestion writes, so a node
-- always reports the settings its content actually came from. The document row's
-- read-model status/error belong to the document node alone.
local function summary_metadata(doc: any, materialization: any): { [string]: any }
    local meta: { [string]: any } = {}
    local doc_meta = type((doc :: any).metadata) == "table" and (doc :: any).metadata or {}
    for k, v in pairs(doc_meta) do
        if k ~= "role" and k ~= "status" and k ~= "error" then meta[k] = v end
    end
    meta.role = "summary"
    meta.materialization = materialization
    return meta
end

-- Write a document's regenerated summary and its vector onto the document's
-- summary child, creating that child when the document has none: a KB configured
-- with summary_max_chars 0 or no summary_model was ingested without one, which is
-- exactly the state this regeneration exists to change. Content and vector are
-- one transactional write, so a summary is never left indexed by the vector of
-- the text it replaced. Returns (node_id, err).
local function write_summary_node(ctx: RunCtx, doc: any, summary_node: any, summary: string,
    vector: any): (string?, string?)
    if summary_node then
        local node_id = (summary_node :: any).id
        if type(node_id) ~= "string" or node_id == "" then return nil, "summary node has no id" end
        return kb10_store.write_node_with_embedding(ctx.store_id, {
            id = node_id,
            node_type = kb_types.NODE_TYPE.SUMMARY,
            parent_id = (doc :: any).id,
            content = summary,
            metadata = { materialization = ctx.materialization },
        }, vector)
    end
    return kb10_store.write_node_with_embedding(ctx.store_id, {
        node_type = kb_types.NODE_TYPE.SUMMARY,
        parent_id = (doc :: any).id,
        content = summary,
        content_type = "text/plain",
        metadata = summary_metadata(doc, ctx.materialization),
    }, vector)
end

type DocOutcome = {
    resummarized: boolean,
    chunks_reenriched: integer,
    chunks_failed: integer,
}

-- Regenerate one document's summary and re-situate its chunks. Returns
-- (outcome, err): err is a store read that failed, which fails the whole run
-- rather than one document, while a document the model or a write could not
-- produce a summary for comes back with resummarized=false and is skipped. A
-- document is never left with an empty summary over a good one, and a summary
-- whose vector the store refused keeps its stored content.
local function resummarize_document(ctx: RunCtx, doc: any): (DocOutcome, string?)
    local outcome: DocOutcome = { resummarized = false, chunks_reenriched = 0, chunks_failed = 0 }
    local doc_id = (doc :: any).id
    local content = (doc :: any).content
    if type(content) ~= "string" or content == "" then
        -- A dead-lettered document (materialization failed) carries no content
        -- to regenerate a summary from.
        return outcome, nil
    end

    local summary, summary_err = ctx.summarize(content)
    if type(summary) ~= "string" or summary == "" then
        logger:warn("document summarization produced no summary", {
            document_id = doc_id,
            error = tostring(summary_err or "summarizer returned no text"),
        })
        return outcome, nil
    end

    local children, cerr = ctx.browse(ctx.store_id, {
        parent_id = doc_id,
        node_type = kb_types.NODE_TYPE.SUMMARY,
        limit = 1,
    })
    if cerr then return outcome, "browse summary: " .. tostring(cerr) end
    local summary_node = type(children) == "table" and (children :: { any })[1] or nil

    local vector, eerr = ctx.embed_one(summary, ctx.embed_model, ctx.dims)
    if eerr or not vector then
        logger:warn("summary embed failed", { document_id = doc_id, error = tostring(eerr or "no vector") })
        return outcome, nil
    end

    local _, write_err = write_summary_node(ctx, doc, summary_node, summary :: string, vector)
    if write_err then
        logger:warn("summary write failed", { document_id = doc_id, error = write_err })
        return outcome, nil
    end
    outcome.resummarized = true

    if ctx.enrich or ctx.enrich_batch then
        local reenriched, failed, chunk_err = reenrich_chunks(
            ctx.browse, ctx.store_id, doc, summary :: string, ctx.materialization,
            ctx.enrich, ctx.enrich_batch, ctx.embed_model, ctx.dims, ctx.embed_one
        )
        if chunk_err then return outcome, "browse chunks: " .. tostring(chunk_err) end
        outcome.chunks_reenriched = reenriched
        outcome.chunks_failed = failed
    end
    return outcome, nil
end

-- run(kb_id) -> ({ success, total, resummarized, chunks_reenriched,
--                  chunks_failed, documents_skipped, scanned }, nil) | (nil, err)
--
-- A whole-KB regeneration is minutes to hours of model work, so the HTTP surface
-- reaches it through a job worker rather than a request. The knowledge manager
-- trait drives this same entry point directly.
function M.run(kb_id: string): (any, string?)
    return M.run_with_deps(kb_id, {})
end

-- run_with_deps(kb_id, deps) drives the same regeneration with the summarizer,
-- enricher, and embedder overridable -- the seam unit tests use to prove the
-- store/option-resolution wiring deterministically, without a live LLM
-- round-trip, the same way source_worker.run vs run_with_deps splits.
-- deps.summarizer(content, model, max_chars, prompt) -> summary?, err?
-- deps.enricher(doc_content, summary, chunk, model) -> prefix?, err?
-- deps.batch_enricher(doc_content, summary, chunks, model) -> prefixes?, err?
-- deps.embedder(texts, model, dims) -> ({ result = {vector, ...} }, err?)
-- deps.browse_nodes(store_id, filter) -> (nodes?, err?)
-- deps.count_nodes(store_id, filter) -> (count?, err?)
-- deps.progress(counts) -> (any?, err?) receives the same shape the run returns,
--   as it stands so far: once with the document total before any work, then
--   after every document. A progress report that fails is logged and the
--   regeneration continues -- the counters are the run's report, not its work.
function M.run_with_deps(kb_id: string, deps: any): (any, string?)
    deps = deps or {}
    local summarize = deps.summarizer or source_worker.default_summarizer
    local embed_texts = deps.embedder or embedder
    local browse = deps.browse_nodes or kb10_store.browse_nodes
    local count_nodes = deps.count_nodes or kb10_store.count_nodes
    local report = deps.progress
    -- Enricher selection mirrors the source worker's: the batch enricher is the
    -- default (one model round-trip per batch of chunks), and an explicitly
    -- supplied per-chunk enricher replaces it rather than stacking with it.
    local enricher = deps.enricher or source_worker.default_enricher
    local batch_enricher = deps.batch_enricher
    if not deps.enricher then
        batch_enricher = batch_enricher or source_worker.default_batch_enricher
    end

    local function embed_one(text: string, model: any, dims: any): (any, string?)
        local vectors, err = materializer.batch_embed(embed_texts, { text }, model, dims)
        if err or type(vectors) ~= "table" or type((vectors :: any).result) ~= "table" then
            return nil, err or "embed failed"
        end
        local vector = (vectors :: any).result[1]
        if type(vector) ~= "table" then return nil, "embed returned no vector" end
        return vector, nil
    end

    local store_row, serr = kb10_store.get_store(kb_id)
    if serr or type(store_row) ~= "table" then return nil, "open store: " .. tostring(serr or "not found") end
    local store_id = (store_row :: any).id
    if type(store_id) ~= "string" or store_id == "" then return nil, "store row has no id" end
    local model = (store_row :: any).embedding_model
    if type(model) ~= "string" or model == "" then return nil, "kb has no embedding_model" end

    -- The store's fixed vector dimension -- ingestion resolves it the same way.
    local dims = kb10_store.VECTOR_DIMENSIONS
    if type(dims) ~= "number" then return nil, "vector_dimensions unavailable" end

    local engine, engine_err = materializer.resolve_engine(store_row)
    if engine_err then return nil, "resolve engine: " .. tostring(engine_err) end

    local materialization, opts_err = materializer.materialization_options({ store_row = store_row, engine = engine }, nil)
    if opts_err then return nil, "materialization options: " .. tostring(opts_err) end
    if type(materialization) ~= "table" then return nil, "materialization options unavailable" end

    local summary_model = (materialization :: any).summary_model
    if type(summary_model) ~= "string" or summary_model == "" then
        return nil, "kb has no summary_model configured -- nothing to regenerate with"
    end
    local summary_max_chars = (materialization :: any).summary_max_chars
    local summary_prompt = (materialization :: any).summary_prompt
    local chunk_enrichment_model = (materialization :: any).chunk_enrichment_model

    -- The enrichment seam takes (doc, summary_text, chunk[s]) so ingestion and
    -- regeneration share one budgeted loop; these closures bind the KB's model,
    -- exactly as ingest_documents_into_store binds it.
    local enrich: any? = nil
    local enrich_batch: any? = nil
    if type(chunk_enrichment_model) == "string" and chunk_enrichment_model ~= "" then
        if batch_enricher then
            enrich_batch = function(doc: any, summary_text: any, chunks: any): (any?, string?)
                local prefixes, err = batch_enricher((doc :: any).content or "", summary_text or "",
                    chunks or {}, chunk_enrichment_model)
                if type(prefixes) == "table" then return prefixes end
                return nil, err
            end
        elseif enricher then
            enrich = function(doc: any, summary_text: any, chunk: any): (string?, string?)
                local prefix, err = enricher((doc :: any).content or "", summary_text or "",
                    chunk or "", chunk_enrichment_model)
                if type(prefix) == "string" then return prefix :: string end
                return nil, err
            end
        end
    end

    local ctx: RunCtx = {
        browse = browse,
        store_id = store_id,
        embed_model = model,
        dims = dims,
        embed_one = embed_one,
        materialization = materialization,
        enrich = enrich,
        enrich_batch = enrich_batch,
        summarize = function(content: string): (string?, string?)
            return summarize(content, summary_model, summary_max_chars, summary_prompt)
        end,
    }

    -- The document total is read once, before any model call, so a surface
    -- polling this run can say how far along it is rather than only how much it
    -- has done.
    local total, count_err = count_nodes(store_id, { node_type = kb_types.NODE_TYPE.DOCUMENT })
    if count_err then return nil, "count documents: " .. tostring(count_err) end

    local counts = {
        success = true,
        total = tonumber(total) or 0,
        scanned = 0,
        resummarized = 0,
        chunks_reenriched = 0,
        chunks_failed = 0,
        documents_skipped = 0,
    }

    local function publish()
        if not report then return end
        local _, progress_err = report(counts)
        if progress_err then
            logger:warn("progress report failed", { kb_id = kb_id, error = tostring(progress_err) })
        end
    end
    publish()

    local offset = 0
    while true do
        local docs, berr = browse(store_id, {
            node_type = kb_types.NODE_TYPE.DOCUMENT,
            limit = PAGE,
            offset = offset,
            include_content = true,
        })
        if berr then return nil, "browse: " .. tostring(berr) end
        if type(docs) ~= "table" or #(docs :: { any }) == 0 then break end
        local count = #(docs :: { any })

        for _, doc in ipairs(docs :: { any }) do
            local outcome, doc_err = resummarize_document(ctx, doc)
            if doc_err then return nil, doc_err end
            counts.scanned = counts.scanned + 1
            -- The total is a single count taken before the walk; a document
            -- ingested while the run is in flight is still walked, so the total
            -- rises to what has been seen rather than reporting fewer documents
            -- than the run has already done.
            if counts.scanned > counts.total then counts.total = counts.scanned end
            if outcome.resummarized then
                counts.resummarized = counts.resummarized + 1
            else
                counts.documents_skipped = counts.documents_skipped + 1
            end
            counts.chunks_reenriched = counts.chunks_reenriched + outcome.chunks_reenriched
            counts.chunks_failed = counts.chunks_failed + outcome.chunks_failed
            publish()
        end

        offset = offset + count
        if count < PAGE then break end
    end

    return counts, nil
end

return M
