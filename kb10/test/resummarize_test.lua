-- Proves resummarize regenerates a document's stored summary (and, when the KB
-- has a chunk_enrichment_model, its chunks' contextual prefixes) from stored
-- content under the KB's current materialization settings, without touching
-- the source. Summarizer/enricher/embedder are injected via run_with_deps so
-- the store/option-resolution wiring is proven deterministically, without a
-- live LLM round-trip -- the same split reembed_test uses for the store wiring
-- and source_worker_test uses for materialization.

local test = require("test")
local sql = require("sql")
local json = require("json")
local resummarize = require("resummarize")
local kb10_store = require("kb10_store")
local fixtures = require("source_worker_fixtures")

local function db(): any
    local d, err = sql.get("app:db")
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

local function zero_vector(): { number }
    local v: { number } = {}
    for i = 1, fixtures.DIMS do v[i] = 0.0 end
    return v
end

local function insert_document(store_id: string, content: string): string
    local id, err = kb10_store.insert_node(store_id, {
        node_type = "document",
        content = content,
        content_type = "text/plain",
        metadata = { external_source = "resummarize.test", external_id = "doc-1" },
    })
    if err then error("insert document failed: " .. tostring(err)) end
    if not id then error("node insert returns no id") end
    return id
end

local function insert_summary(store_id: string, doc_id: string, content: string): string
    local id, err = kb10_store.insert_node(store_id, {
        node_type = "summary",
        parent_id = doc_id,
        content = content,
        content_type = "text/plain",
        metadata = { role = "summary" },
    })
    if err then error("insert summary failed: " .. tostring(err)) end
    local _, ierr = kb10_store.insert_embedding(store_id, id, "summary", doc_id, zero_vector())
    if ierr then error("insert summary embedding failed: " .. tostring(ierr)) end
    if not id then error("node insert returns no id") end
    return id
end

local function insert_chunk(store_id: string, doc_id: string, chunk_index: number, content: string, prefix: string?): string
    local meta: { [string]: any } = { role = "chunk", chunk_index = chunk_index }
    if prefix then meta.contextual_prefix = prefix end
    local id, err = kb10_store.insert_node(store_id, {
        node_type = "chunk",
        parent_id = doc_id,
        content = content,
        content_type = "text/plain",
        metadata = meta,
    })
    if err then error("insert chunk failed: " .. tostring(err)) end
    local _, ierr = kb10_store.insert_embedding(store_id, id, "chunk", doc_id, zero_vector())
    if ierr then error("insert chunk embedding failed: " .. tostring(ierr)) end
    if not id then error("node insert returns no id") end
    return id
end

local function embedding_count(d: any, store_id: string, node_id: string): number
    local rows = d:query("SELECT COUNT(*) AS n FROM kb10_embeddings WHERE store_id = $1 AND node_id = $2",
        { store_id, node_id })
    return tonumber((rows :: any)[1].n) or 0
end

local function stub_summarizer(content: any, _model: any, _max_chars: any, _prompt: any): (string?, string?)
    return "NEW SUMMARY (" .. tostring(#(content :: string)) .. " chars)", nil
end

local function failing_summarizer(_content: any, _model: any, _max_chars: any, _prompt: any): (string?, string?)
    return nil, "summary model unavailable"
end

local function stub_enricher(_doc_content: any, summary: any, chunk: any, _model: any): (string?, string?)
    return "CTX[" .. tostring(#(chunk :: string)) .. "]: " .. tostring(summary):sub(1, 11)
end

local function failing_enricher(_doc_content: any, _summary: any, _chunk: any, _model: any): (string?, string?)
    return nil, "enrichment failed"
end

local function unreachable_enricher(_doc_content: any, _summary: any, _chunk: any, _model: any): (string?, string?)
    error("enricher must not run without a configured chunk_enrichment_model")
end

-- An embedder whose vectors are the wrong width for the store. The model
-- answered, so the run reaches the write; the write is what the store refuses --
-- the real shape of a vector that cannot be stored, rather than a stubbed seam.
local function narrow_embedder(texts: any, _model: any, _dims: any): (any, string?)
    local vectors: { any } = {}
    for i, _text in ipairs(texts :: { string }) do
        local vec: { number } = {}
        for j = 1, 8 do vec[j] = 0.0 end
        vectors[i] = vec
    end
    return { result = vectors }, nil
end

-- The same, but only for the re-situated chunk texts: the summary is written
-- normally so the run gets as far as the chunks whose write must fail.
local function narrow_chunk_embedder(texts: any, model: any, dims: any): (any, string?)
    local chunk_texts = false
    for _, text in ipairs(texts :: { string }) do
        if tostring(text):find("CTX[", 1, true) then chunk_texts = true end
    end
    if chunk_texts then return narrow_embedder(texts, model, dims) end
    return fixtures.fake_embedder(texts, model, dims)
end

local function bootstrap(config: any): (string, any)
    local component_id = fixtures.uuid()
    local d = db()
    local _, err = d:execute(
        "INSERT INTO kb10_stores (id, component_id, embedding_model, config, kb_type) VALUES ($1, $2, $3, $4, $5)",
        { component_id, component_id, "class:embed", json.encode(config or {}), "document" }
    )
    if err then error("insert kb10_store failed: " .. tostring(err)) end
    return component_id, d
end

local function define_tests()
    test.describe("kb10 resummarize", function()
        test.it("errors for a missing knowledge base", function()
            local result, err = resummarize.run(fixtures.uuid())
            test.is_nil(result)
            test.not_nil(err)
        end)

        test.it("errors when the kb has no summary_model configured", function()
            local component_id, d = bootstrap({ summary_model = "" })
            local result, err = resummarize.run(component_id)
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("summary_model", 1, true) ~= nil, "error names summary_model: " .. tostring(err))
            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("regenerates a stored summary node's content and its embedding under new settings", function()
            local component_id, d = bootstrap({ summary_max_chars = 40, chunk_enrichment_model = "" })
            local doc_id = insert_document(component_id, "This is the full source document body, unchanged by resummarize.")
            local summary_id = insert_summary(component_id, doc_id, "stale summary from an old summary_max_chars")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                embedder = fixtures.fake_embedder,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.not_nil(result)
            test.is_true((result :: any).success, "resummarize success")
            test.eq(1, (result :: any).scanned)
            test.eq(1, (result :: any).resummarized)
            test.eq(0, (result :: any).chunks_reenriched)
            test.eq(0, (result :: any).documents_skipped)

            local node, node_err = kb10_store.get_node(component_id, summary_id)
            test.is_nil(node_err, "get_node: " .. tostring(node_err))
            test.eq("NEW SUMMARY (64 chars)", (node :: any).content)
            test.eq(1, embedding_count(d, component_id, summary_id))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("a summarizer failure keeps the old summary and counts skipped", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "" })
            local doc_id = insert_document(component_id, "content the summarizer will fail to compress")
            local summary_id = insert_summary(component_id, doc_id, "the original summary, kept as-is")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = failing_summarizer,
                embedder = fixtures.fake_embedder,
            })
            test.not_nil(err, "failed work returns its error")
            test.is_false((result :: any).success, "failed work is not successful")
            test.eq(1, (result :: any).scanned)
            test.eq(0, (result :: any).resummarized)
            test.eq(0, (result :: any).chunks_reenriched)
            test.eq(1, (result :: any).documents_skipped)

            local node, node_err = kb10_store.get_node(component_id, summary_id)
            test.is_nil(node_err, "get_node: " .. tostring(node_err))
            test.eq("the original summary, kept as-is", (node :: any).content)
            test.eq(1, embedding_count(d, component_id, summary_id))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("re-enriches and re-embeds chunk nodes from the new summary when a chunk_enrichment_model is configured", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "class:fast" })
            local doc_id = insert_document(component_id, "document body driving both summary and chunk enrichment")
            local summary_id = insert_summary(component_id, doc_id, "stale summary")
            local chunk_a = insert_chunk(component_id, doc_id, 1, "first chunk of the document", "old prefix a")
            local chunk_b = insert_chunk(component_id, doc_id, 2, "second chunk of the document", "old prefix b")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                enricher = stub_enricher,
                embedder = fixtures.fake_embedder,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.eq(1, (result :: any).resummarized)
            test.eq(2, (result :: any).chunks_reenriched)
            test.eq(0, (result :: any).documents_skipped)

            local node_a, aerr = kb10_store.get_node(component_id, chunk_a)
            test.is_nil(aerr, "get_node a: " .. tostring(aerr))
            -- Ingestion never folds the prefix into the chunk's stored content;
            -- only the metadata prefix and the vector change.
            test.eq("first chunk of the document", (node_a :: any).content)
            test.eq("CTX[27]: NEW SUMMARY", (node_a :: any).metadata.contextual_prefix)
            test.eq(1, embedding_count(d, component_id, chunk_a))

            local node_b, berr = kb10_store.get_node(component_id, chunk_b)
            test.is_nil(berr, "get_node b: " .. tostring(berr))
            test.eq("second chunk of the document", (node_b :: any).content)
            test.eq("CTX[28]: NEW SUMMARY", (node_b :: any).metadata.contextual_prefix)
            test.eq(1, embedding_count(d, component_id, chunk_b))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("leaves chunks untouched without a configured chunk_enrichment_model", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "" })
            local doc_id = insert_document(component_id, "document body that only needs a fresh summary")
            insert_summary(component_id, doc_id, "stale summary")
            local chunk_id = insert_chunk(component_id, doc_id, 1, "chunk content never re-derived", "original prefix")

            local before, before_err = kb10_store.get_node(component_id, chunk_id)
            test.is_nil(before_err, "get_node before: " .. tostring(before_err))

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                enricher = unreachable_enricher,
                embedder = fixtures.fake_embedder,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.eq(1, (result :: any).resummarized)
            test.eq(0, (result :: any).chunks_reenriched)
            test.eq(0, (result :: any).documents_skipped)

            local after, after_err = kb10_store.get_node(component_id, chunk_id)
            test.is_nil(after_err, "get_node after: " .. tostring(after_err))
            test.eq((before :: any).content, (after :: any).content)
            test.eq((before :: any).metadata.contextual_prefix, (after :: any).metadata.contextual_prefix)
            test.eq(1, embedding_count(d, component_id, chunk_id))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("a failing chunk enrichment keeps the old chunk content and counts against chunks, not documents", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "class:fast" })
            local doc_id = insert_document(component_id, "document body whose chunk enrichment will fail")
            insert_summary(component_id, doc_id, "stale summary")
            local chunk_id = insert_chunk(component_id, doc_id, 1, "chunk content kept on enrichment failure", "original prefix")

            local before, before_err = kb10_store.get_node(component_id, chunk_id)
            test.is_nil(before_err, "get_node before: " .. tostring(before_err))

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                enricher = failing_enricher,
                embedder = fixtures.fake_embedder,
            })
            test.not_nil(err, "failed work returns its error")
            test.is_false((result :: any).success, "failed work is not successful")
            test.eq(1, (result :: any).resummarized)
            test.eq(0, (result :: any).chunks_reenriched)
            -- The document itself was resummarized, so it is not skipped; the
            -- chunk that kept its stale prefix is the only failure, and a
            -- document counter can never absorb it.
            test.eq(1, (result :: any).chunks_failed)
            test.eq(0, (result :: any).documents_skipped)
            test.is_true((result :: any).documents_skipped <= (result :: any).scanned,
                "documents_skipped stays within scanned")

            local after, after_err = kb10_store.get_node(component_id, chunk_id)
            test.is_nil(after_err, "get_node after: " .. tostring(after_err))
            test.eq((before :: any).content, (after :: any).content)
            test.eq("original prefix", (after :: any).metadata.contextual_prefix)
            test.eq(1, embedding_count(d, component_id, chunk_id))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        -- A node's content and the vector that indexes it are one fact. Written
        -- apart, a failed vector write leaves the new text scored on the words it
        -- replaced, and every search reads the node as something it no longer is.
        test.it("keeps a summary node's stored content when its embedding cannot be written", function()
            local component_id, d = bootstrap({ summary_max_chars = 40, chunk_enrichment_model = "" })
            local doc_id = insert_document(component_id, "This is the full source document body, unchanged by resummarize.")
            local summary_id = insert_summary(component_id, doc_id, "the stored summary, kept whole")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                embedder = narrow_embedder,
            })
            test.not_nil(err, "failed work returns its error")
            test.is_false((result :: any).success, "failed work is not successful")
            test.eq(1, (result :: any).scanned)
            test.eq(0, (result :: any).resummarized, "a summary that could not be indexed is not a rewrite")
            test.eq(1, (result :: any).documents_skipped)

            local node, node_err = kb10_store.get_node(component_id, summary_id)
            test.is_nil(node_err, "get_node: " .. tostring(node_err))
            test.eq("the stored summary, kept whole", (node :: any).content)
            test.eq(1, embedding_count(d, component_id, summary_id),
                "the summary keeps the vector that matches its content")

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("keeps a chunk's stored prefix when its embedding cannot be written", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "class:fast" })
            local doc_id = insert_document(component_id, "document body driving both summary and chunk enrichment")
            insert_summary(component_id, doc_id, "stale summary")
            local chunk_id = insert_chunk(component_id, doc_id, 1, "first chunk of the document", "old prefix a")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                enricher = stub_enricher,
                embedder = narrow_chunk_embedder,
            })
            test.not_nil(err, "failed work returns its error")
            test.is_false((result :: any).success, "failed work is not successful")
            test.eq(1, (result :: any).resummarized, "the summary itself was written")
            test.eq(0, (result :: any).chunks_reenriched)
            test.eq(1, (result :: any).chunks_failed)

            local node, node_err = kb10_store.get_node(component_id, chunk_id)
            test.is_nil(node_err, "get_node: " .. tostring(node_err))
            test.eq("first chunk of the document", (node :: any).content)
            test.eq("old prefix a", (node :: any).metadata.contextual_prefix,
                "a prefix whose vector was refused is not stored")
            test.eq(1, embedding_count(d, component_id, chunk_id),
                "the chunk keeps the vector that matches its stored prefix")

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("propagates a document browse failure instead of reporting a successful partial run", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "" })
            insert_document(component_id, "a document the browse will never return")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                embedder = fixtures.fake_embedder,
                browse_nodes = function(_store_id: any, _filter: any): (any, string?)
                    return nil, "database is unavailable"
                end,
            })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("database is unavailable", 1, true) ~= nil,
                "error carries the store cause: " .. tostring(err))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("propagates a chunk browse failure instead of ending the chunk page early", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "class:fast" })
            local doc_id = insert_document(component_id, "document whose chunk pages cannot be read")
            insert_summary(component_id, doc_id, "stale summary")
            insert_chunk(component_id, doc_id, 1, "a chunk the browse will refuse", "original prefix")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                enricher = stub_enricher,
                embedder = fixtures.fake_embedder,
                browse_nodes = function(store_id: any, filter: any): (any, string?)
                    if (filter :: any).node_type == "chunk" then
                        return nil, "chunk page read failed"
                    end
                    return kb10_store.browse_nodes(store_id, filter)
                end,
            })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("chunk page read failed", 1, true) ~= nil,
                "error carries the store cause: " .. tostring(err))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("creates the summary node and its embedding for a document that has none", function()
            local component_id, d = bootstrap({ summary_max_chars = 0, chunk_enrichment_model = "" })
            local doc_id = insert_document(component_id, "a document ingested with no summary child at all")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                embedder = fixtures.fake_embedder,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.eq(1, (result :: any).scanned)
            test.eq(1, (result :: any).resummarized)
            test.eq(0, (result :: any).documents_skipped)

            local children, berr = kb10_store.browse_nodes(component_id, {
                parent_id = doc_id,
                node_type = "summary",
                limit = 10,
                include_content = true,
            })
            test.is_nil(berr, "browse summary: " .. tostring(berr))
            test.eq(1, #(children :: { any }))
            local summary_node = (children :: { any })[1]
            test.eq("NEW SUMMARY (48 chars)", (summary_node :: any).content)
            test.eq("summary", (summary_node :: any).metadata.role)
            -- The regenerated node reports the settings its content came from,
            -- not the settings the document was originally ingested under.
            test.eq(0, (summary_node :: any).metadata.materialization.summary_max_chars)
            test.eq(1, embedding_count(d, component_id, (summary_node :: any).id))

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("stamps the regenerated summary node with the materialization it was produced under", function()
            local component_id, d = bootstrap({ summary_max_chars = 1234, chunk_enrichment_model = "" })
            local doc_id = insert_document(component_id, "a document whose summary settings changed after ingest")
            local summary_id = insert_summary(component_id, doc_id, "stale summary from an old summary_max_chars")

            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                embedder = fixtures.fake_embedder,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.eq(1, (result :: any).resummarized)

            local node, node_err = kb10_store.get_node(component_id, summary_id)
            test.is_nil(node_err, "get_node: " .. tostring(node_err))
            test.eq(1234, (node :: any).metadata.materialization.summary_max_chars)
            test.eq("summary", (node :: any).metadata.role)

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("enriches only as many chunks as the KB's enrichment budget allows", function()
            local component_id, d = bootstrap({
                chunk_enrichment_model = "class:fast",
                chunk_enrichment_batch_size = 1,
                max_chunk_enrichment_batches = 2,
            })
            local doc_id = insert_document(component_id, "document with more chunks than the enrichment budget covers")
            insert_summary(component_id, doc_id, "stale summary")
            local chunk_ids = {}
            for i = 1, 5 do
                chunk_ids[i] = insert_chunk(component_id, doc_id, i, "chunk number " .. tostring(i) .. " of five", "original prefix")
            end

            local calls = 0
            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                enricher = function(doc_content: any, summary: any, chunk: any, model: any): (string?, string?)
                    calls = calls + 1
                    return stub_enricher(doc_content, summary, chunk, model)
                end,
                embedder = fixtures.fake_embedder,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            -- max_chunk_enrichment_batches * chunk_enrichment_batch_size is the
            -- ceiling on model calls per document, the same ceiling ingestion
            -- applies; the remaining chunks keep their stored context.
            test.eq(2, calls)
            test.eq(2, (result :: any).chunks_reenriched)
            test.eq(0, (result :: any).chunks_failed)

            for i = 3, 5 do
                local node, node_err = kb10_store.get_node(component_id, chunk_ids[i])
                test.is_nil(node_err, "get_node: " .. tostring(node_err))
                test.eq("original prefix", (node :: any).metadata.contextual_prefix)
            end

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("stops enriching a document's chunks once the failure budget is spent", function()
            local component_id, d = bootstrap({
                chunk_enrichment_model = "class:fast",
                chunk_enrichment_batch_size = 1,
                max_chunk_enrichment_batches = 10,
                max_chunk_enrichment_failures = 1,
            })
            local doc_id = insert_document(component_id, "document whose enrichment model is failing outright")
            insert_summary(component_id, doc_id, "stale summary")
            for i = 1, 4 do
                insert_chunk(component_id, doc_id, i, "chunk number " .. tostring(i) .. " of four", "original prefix")
            end

            local calls = 0
            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                enricher = function(_doc_content: any, _summary: any, _chunk: any, _model: any): (string?, string?)
                    calls = calls + 1
                    return nil, "enrichment model refused"
                end,
                embedder = fixtures.fake_embedder,
            })
            test.not_nil(err, "failed work returns its error")
            test.is_false((result :: any).success)
            test.eq(1, calls)
            test.eq(0, (result :: any).chunks_reenriched)
            test.eq(1, (result :: any).chunks_failed)

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("uses the batch enricher when no per-chunk enricher is supplied", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "class:fast" })
            local doc_id = insert_document(component_id, "document situated through one batch enrichment call")
            insert_summary(component_id, doc_id, "stale summary")
            local chunk_a = insert_chunk(component_id, doc_id, 1, "first chunk of the document", "old prefix a")
            local chunk_b = insert_chunk(component_id, doc_id, 2, "second chunk of the document", "old prefix b")

            local batch_calls = 0
            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                batch_enricher = function(_doc_content: any, _summary: any, chunks: any, _model: any): (any?, string?)
                    batch_calls = batch_calls + 1
                    local prefixes: { string } = {}
                    for i in ipairs(chunks :: { any }) do
                        prefixes[i] = "BATCH CTX " .. tostring(i)
                    end
                    return prefixes, nil
                end,
                embedder = fixtures.fake_embedder,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.eq(1, batch_calls)
            test.eq(2, (result :: any).chunks_reenriched)

            local node_a, aerr = kb10_store.get_node(component_id, chunk_a)
            test.is_nil(aerr, "get_node a: " .. tostring(aerr))
            test.eq("BATCH CTX 1", (node_a :: any).metadata.contextual_prefix)
            local node_b, berr = kb10_store.get_node(component_id, chunk_b)
            test.is_nil(berr, "get_node b: " .. tostring(berr))
            test.eq("BATCH CTX 2", (node_b :: any).metadata.contextual_prefix)

            fixtures.teardown_kb10_store(d, component_id)
        end)

        -- The enricher is an LLM seam: it answers (prefixes, err). Every cause it
        -- reports spends the document's failure budget, so an enricher that
        -- cannot produce anything is asked once rather than once per batch of
        -- every document in the knowledge base.
        test.it("stops a batch enricher once the cause it reports spends the document's budget", function()
            local component_id, d = bootstrap({
                chunk_enrichment_model = "class:fast",
                chunk_enrichment_batch_size = 1,
                max_chunk_enrichment_batches = 10,
                max_chunk_enrichment_failures = 1,
            })
            local doc_id = insert_document(component_id, "document whose batch enricher reports a cause")
            local summary_id = insert_summary(component_id, doc_id, "stale summary")
            local chunk_id = insert_chunk(component_id, doc_id, 1, "chunk kept when the enricher reports", "original prefix")
            for i = 2, 4 do
                insert_chunk(component_id, doc_id, i, "chunk number " .. tostring(i) .. " of four", "original prefix")
            end

            local batch_calls = 0
            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                batch_enricher = function(_doc_content: any, _summary: any, _chunks: any, _model: any): (any?, string?)
                    batch_calls = batch_calls + 1
                    return nil, "enrichment model refused"
                end,
                embedder = fixtures.fake_embedder,
            })
            -- The summary write already landed, and the one chunk the model was
            -- asked about is accounted for as failed; the rest were never
            -- attempted and keep their stored context.
            test.not_nil(err, "failed work returns its error")
            test.is_false((result :: any).success)
            test.eq(1, batch_calls)
            test.eq(1, (result :: any).resummarized)
            test.eq(0, (result :: any).chunks_reenriched)
            test.eq(1, (result :: any).chunks_failed)

            local summary_node, serr = kb10_store.get_node(component_id, summary_id)
            test.is_nil(serr, "get_node summary: " .. tostring(serr))
            test.eq("NEW SUMMARY (45 chars)", (summary_node :: any).content)

            local chunk_node, cerr = kb10_store.get_node(component_id, chunk_id)
            test.is_nil(cerr, "get_node chunk: " .. tostring(cerr))
            test.eq("original prefix", (chunk_node :: any).metadata.contextual_prefix)

            fixtures.teardown_kb10_store(d, component_id)
        end)
    end)

    -- The progress sink is how a surface watches a regeneration that runs for
    -- hours: the counters it receives are the same ones the run finally returns,
    -- as they stand at that moment.
    test.describe("kb10 resummarize progress", function()
        type ProgressSnapshot = { total: number, scanned: number, resummarized: number }

        local function snapshot(counts: ProgressSnapshot): ProgressSnapshot
            return {
                total = counts.total,
                scanned = counts.scanned,
                resummarized = counts.resummarized,
            }
        end

        test.it("publishes the document total before any work and a report after every document", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "" })
            insert_document(component_id, "the first document of the regeneration")
            insert_document(component_id, "the second document of the regeneration")

            local reports: { ProgressSnapshot } = {}
            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                embedder = fixtures.fake_embedder,
                progress = function(counts: ProgressSnapshot): (any?, string?)
                    reports[#reports + 1] = snapshot(counts)
                    return true, nil
                end,
            })
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.eq(3, #reports, "one report before the walk and one per document")

            -- The total is known before the first model call, so a surface can
            -- say how far along a run is rather than only how much it has done.
            test.eq(2, reports[1].total)
            test.eq(0, reports[1].scanned)
            test.eq(1, reports[2].scanned)
            test.eq(2, reports[3].scanned)
            test.eq(2, reports[3].resummarized)
            test.eq((result :: any).resummarized, reports[3].resummarized)

            fixtures.teardown_kb10_store(d, component_id)
        end)

        test.it("finishes the regeneration when a progress report fails", function()
            local component_id, d = bootstrap({ chunk_enrichment_model = "" })
            local doc_id = insert_document(component_id, "the document a broken progress sink must not cost")
            local summary_id = insert_summary(component_id, doc_id, "stale summary")

            local reports = 0
            local result, err = resummarize.run_with_deps(component_id, {
                summarizer = stub_summarizer,
                embedder = fixtures.fake_embedder,
                progress = function(_counts: any): (any?, string?)
                    reports = reports + 1
                    return nil, "the run record is unavailable"
                end,
            })
            -- The counters are the run's report, not its work: a sink that
            -- cannot take them costs the knowledge base nothing.
            test.is_nil(err, "resummarize: " .. tostring(err))
            test.eq(2, reports, "the run keeps reporting after a failed report")
            test.eq(1, (result :: any).scanned)
            test.eq(1, (result :: any).resummarized)

            local node, node_err = kb10_store.get_node(component_id, summary_id)
            test.is_nil(node_err, "get_node: " .. tostring(node_err))
            test.eq("NEW SUMMARY (49 chars)", (node :: any).content)

            fixtures.teardown_kb10_store(d, component_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
