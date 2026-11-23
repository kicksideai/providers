-- Re-embed a kb10 knowledge base: regenerate every embeddable node's vector from
-- its stored content, using the KB's own embedding model. kb10-internal, so it
-- walks a bounded range of node IDs and writes through the kb10 store. The use
-- case is a KB imported without vectors (the portable export
-- excludes them as model-specific); this brings it back to searchable locally.
--
-- A node whose vector the store refuses keeps the one it had and the pass carries
-- on over the rest of the knowledge base, but the pass ends reporting that
-- failure alongside its counters: a run that wrote no vector at all settles as
-- failed rather than as a clean success with nothing to show. The nodes the pass
-- deliberately never embeds -- the raw document blobs, and nodes with no
-- content -- are skips, not failures.

local llm = require("llm")
local logger = require("logger"):named("kb10.engine.reembed")
local kb10_store = require("kb10_store")
local materializer = require("source_materializer")

local M = {}

local PAGE = 200
local EMBED_TIMEOUT = 120

-- Same shape as ingestion's default_embedder (source_worker): one llm.embed round-trip.
local function embedder(texts: any, model: any, dims: any): (any, string?)
    return llm.embed(texts, { model = model, dimensions = dims, timeout = EMBED_TIMEOUT })
end

-- run(kb_id) -> ({ success, total, embedded, scanned }, err?) | (nil, err)
-- An err beside the counters names how many node vectors the store refused; an
-- err alone is a pass that could not run at all.
--
-- Re-vectorizing a whole KB is minutes of embedding calls, so the HTTP surface
-- reaches it through a job worker rather than a request. The knowledge manager
-- trait drives this same entry point directly.
function M.run(kb_id: string): (any, string?)
    return M.run_with_deps(kb_id, {})
end

-- run_with_deps(kb_id, deps) drives the same re-embedding with the embedder and
-- the store reads overridable -- the seam the unit suite uses to prove the store
-- wiring without a live embedding round-trip, mirroring resummarize.
-- deps.embedder(texts, model, dims) -> ({ result = {vector, ...} }, err?)
-- deps.maintenance_window(store_id) -> ({total, through_id}?, err?)
-- deps.maintenance_page(store_id, range) -> (nodes?, err?)
-- deps.progress(counts) -> (any?, err?) receives the same shape the run returns,
--   as it stands so far: once with the node total before any work, then after
--   every page. A progress report that fails is logged and the re-embedding
--   continues -- the counters are the run's report, not its work.
function M.run_with_deps(kb_id: string, deps: any): (any, string?)
    deps = deps or {}
    local embed_texts = deps.embedder or embedder
    local window = deps.maintenance_window or kb10_store.maintenance_window
    local read_page = deps.maintenance_page or kb10_store.maintenance_page
    local report = deps.progress

    local store_row, serr = kb10_store.get_store(kb_id)
    if serr or type(store_row) ~= "table" then return nil, "open store: " .. tostring(serr or "not found") end
    local store_id = (store_row :: any).id
    local model = (store_row :: any).embedding_model
    if type(model) ~= "string" or model == "" then return nil, "kb has no embedding_model" end

    -- The store's fixed vector dimension -- ingestion resolves it the same way.
    local dims = kb10_store.VECTOR_DIMENSIONS
    if type(dims) ~= "number" then return nil, "vector_dimensions unavailable" end

    local range, range_err = window(store_id)
    if range_err then return nil, "read maintenance window: " .. tostring(range_err) end

    local counts = { success = true, total = tonumber(range.total) or 0, scanned = 0, embedded = 0 }
    local write_failures = 0

    local function publish()
        if not report then return end
        local _, progress_err = report(counts)
        if progress_err then
            logger:warn("progress report failed", { kb_id = kb_id, error = tostring(progress_err) })
        end
    end
    publish()

    local after_id: string? = nil
    while range.through_id do
        local nodes, berr = read_page(store_id, { limit = PAGE, after_id = after_id, through_id = range.through_id })
        if berr then return nil, "browse: " .. tostring(berr) end
        if type(nodes) ~= "table" or #(nodes :: { any }) == 0 then break end
        local count = #(nodes :: { any })
        counts.scanned = counts.scanned + count
        -- A concurrent insertion inside the remaining range can raise the total.
        if counts.scanned > counts.total then counts.total = counts.scanned end

        -- Embed every content-bearing node except the source document node (its content
        -- is the raw blob, not an embeddable unit -- ingestion never embeds it).
        local batch: { any } = {}
        local texts: { string } = {}
        for _, n in ipairs(nodes :: { any }) do
            local nt = tostring((n :: any).node_type or "")
            local content = (n :: any).content
            if nt ~= "document" and type(content) == "string" and content ~= "" then
                batch[#batch + 1] = n
                texts[#texts + 1] = content :: string
            end
        end

        if #texts > 0 then
            local vectors, eerr = materializer.batch_embed(embed_texts, texts, model, dims)
            if eerr or type(vectors) ~= "table" or type((vectors :: any).result) ~= "table" then
                return nil, "embed: " .. tostring(eerr)
            end
            local vres = (vectors :: any).result
            for i, n in ipairs(batch) do
                local _, ierr = kb10_store.insert_embedding(store_id, (n :: any).id, (n :: any).node_type, (n :: any).parent_id, vres[i])
                if ierr then
                    -- One node keeping its stored vector does not end the pass:
                    -- the rest of the knowledge base is still worth
                    -- re-vectorizing. It is a failure all the same, so it is
                    -- counted here and reported once the walk is over; the
                    -- store's own cause belongs in the log.
                    write_failures = write_failures + 1
                    logger:warn("node embedding write failed", { kb_id = kb_id, node_id = tostring((n :: any).id), error = tostring(ierr) })
                else
                    counts.embedded = counts.embedded + 1
                end
            end
        end
        publish()

        after_id = nodes[count].id
        if count < PAGE or after_id == range.through_id then break end
    end

    if write_failures > 0 then
        counts.success = false
        local subject = write_failures == 1 and " node embedding" or " node embeddings"
        return counts, tostring(write_failures) .. subject .. " could not be written"
    end

    return counts, nil
end

return M
