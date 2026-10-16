local test = require("test")
local source_materializer = require("source_materializer")

local chunk_text = source_materializer.chunk_text

local function count(haystack: string, needle: string)
    local _, n = haystack:gsub(needle:gsub("(%W)", "%%%1"), "")
    return n
end

local function define_tests()
    test.describe("markdown-aware chunk_text", function()
        test.it("keeps a fenced code block intact", function()
            local code = "```lua\n" .. string.rep("local x = 1\n", 40) .. "```"
            local text = "Intro paragraph about the code below.\n\n" .. code .. "\n\nClosing remarks."
            local chunks = chunk_text(text, 300, 50)

            local hit = nil
            for _, c in ipairs(chunks) do
                if c:find("```lua", 1, true) then hit = c end
            end
            test.not_nil(hit)
            -- the whole fence (open, body, close) lives in one chunk
            test.is_true(hit:find("local x = 1", 1, true) ~= nil)
            test.is_true(count(hit, "```") >= 2)
        end)

        -- join_table_rows keeps a table's data rows grouped instead of shredding it
        -- into one chunk per row. A table that fits chunk_size stays whole; a larger
        -- one splits across chunks but each chunk still holds several rows.
        local function max_rows_per_chunk(chunks, pattern)
            local mx = 0
            for _, c in ipairs(chunks) do
                local n = 0
                for _ in c:gmatch(pattern) do n = n + 1 end
                if n > mx then mx = n end
            end
            return mx
        end

        test.it("keeps a small markdown table whole in one chunk", function()
            local rows = {}
            for i = 1, 8 do rows[#rows + 1] = "| row" .. i .. " a | row" .. i .. " b |" end
            local table_md = "| A | B |\n| --- | --- |\n" .. table.concat(rows, "\n")
            local text = "Lead in text.\n\n" .. table_md .. "\n\nTail text."
            local chunks = chunk_text(text, 4000, 0)
            -- the whole 8-row table lands in a single chunk, not one row per chunk
            test.eq(max_rows_per_chunk(chunks, "row%d+ a"), 8)
        end)

        test.it("groups rows of an oversized table instead of shredding per row", function()
            local rows = {}
            for i = 1, 20 do rows[#rows + 1] = "| col a " .. i .. " | col b " .. i .. " |" end
            local table_md = "| A | B |\n| --- | --- |\n" .. table.concat(rows, "\n")
            local text = "Lead in text.\n\n" .. table_md .. "\n\nTail text."
            -- chunk_size below the table's length forces a split, but rows stay grouped
            local chunks = chunk_text(text, 250, 40)
            test.is_true(max_rows_per_chunk(chunks, "col a %d+") >= 2)
            -- every row survives across the chunks (none dropped)
            local seen = 0
            for _, c in ipairs(chunks) do
                for _ in c:gmatch("col a %d+") do seen = seen + 1 end
            end
            test.is_true(seen >= 20)
        end)

        test.it("separates content across heading boundaries", function()
            local s1 = "# Alpha\n" .. string.rep("alpha body sentence. ", 30)
            local s2 = "# Beta\n" .. string.rep("beta body sentence. ", 30)
            local chunks = chunk_text(s1 .. "\n" .. s2, 400, 0)

            test.is_true(#chunks >= 2)
            for _, c in ipairs(chunks) do
                local has_a = c:find("# Alpha", 1, true) ~= nil
                local has_b = c:find("# Beta", 1, true) ~= nil
                test.is_false(has_a and has_b)
            end
        end)

        test.it("does not trim chunks before the materializer policy can record a durable failure", function()
            -- A giant document (a spreadsheet exported as one huge markdown table)
            -- is split completely here; the KB materializer owns the policy that
            -- decides whether to ingest or fail the document. That keeps raw data
            -- available for replay instead of silently indexing only the head.
            local parts = {}
            for i = 1, 4000 do
                parts[i] = "Section " .. tostring(i) .. ". " .. string.rep("token" .. tostring(i) .. " ", 30)
            end
            local chunks = chunk_text(table.concat(parts, "\n\n"), 200, 0)
            test.is_true(#chunks > source_materializer.MAX_CHUNKS_PER_DOC)
        end)

        test.it("carries a word-aligned overlap between chunks", function()
            local text = string.rep("Sentence about kickside knowledge bases. ", 60)
            local chunks = chunk_text(text, 400, 80)
            test.is_true(#chunks >= 2)
            -- consecutive chunks share an overlapping tail/head: the last word of one
            -- chunk reappears at the head of the next so context carries across the cut
            local carried = false
            for i = 1, #chunks - 1 do
                local tail = chunks[i]:sub(-30)
                local word = tail:match("(%S+)%s*$")
                if word and chunks[i + 1]:sub(1, 60):find(word, 1, true) then
                    carried = true
                    break
                end
            end
            test.is_true(carried)
        end)

        test.it("returns a single chunk for short input and no empty chunks", function()
            test.eq(#chunk_text("Short.", 300, 20), 1)
            test.eq(chunk_text("Short.", 300, 20)[1], "Short.")

            local many = chunk_text(string.rep("One. Two. Three. ", 80), 300, 40)
            test.is_true(#many > 1)
            for _, c in ipairs(many) do
                test.is_true(#c > 0)
            end
        end)

        test.it("never emits a runt chunk below the minimum", function()
            -- a lone heading ahead of an oversized paragraph must not split off alone
            local heading = "# Goal\n"
            local para = string.rep("body sentence number one here. ", 40)
            local chunks = chunk_text(heading .. "\n" .. para .. "\n\n" .. string.rep("more body text here. ", 40), 300, 30)
            test.is_true(#chunks >= 2)
            for i, c in ipairs(chunks) do
                -- the final chunk may legitimately be short only if it is the sole chunk
                if not (i == #chunks and #chunks == 1) then
                    test.is_true(#c >= 200)
                end
            end
            -- the heading stays attached to its body, never on its own
            for _, c in ipairs(chunks) do
                if c:find("# Goal", 1, true) then
                    test.is_true(#c > 30)
                end
            end
        end)

        test.it("returns nothing for blank input", function()
            test.eq(#chunk_text("", 300, 20), 0)
            test.eq(#chunk_text("   \n\n  ", 300, 20), 0)
        end)

        -- A large document made of one giant atomic block (a spreadsheet exported
        -- as a markdown table, a long fenced log) must chunk without exhausting the
        -- Lua value-stack registry. Splitting runs natively in the `text` module
        -- (Go-side), so the document is never segmented or concatenated in-process
        -- and an arbitrarily large block can no longer overrun the runtime registry.
        test.it("chunks a giant markdown table without a registry overflow", function()
            -- 50k pipe rows: an in-Lua splitter would overflow the value stack.
            local table_md = "| A | B |\n| --- | --- |\n" .. string.rep("| col a | col b |\n", 50000)
            local chunks = chunk_text("Lead in.\n\n" .. table_md .. "\nTail.", 2000, 100)
            test.is_true(#chunks >= 1)
            -- the table rows survive (not silently dropped)
            local saw_row = false
            for _, c in ipairs(chunks) do
                if c:find("| col a | col b |", 1, true) then saw_row = true; break end
            end
            test.is_true(saw_row)
        end)

        test.it("chunks a giant fenced code block without a registry overflow", function()
            local code = "```lua\n" .. string.rep("local x = 1\n", 50000) .. "```"
            local chunks = chunk_text("Intro.\n\n" .. code .. "\nOutro.", 2000, 100)
            test.is_true(#chunks >= 1)
            local saw_line = false
            for _, c in ipairs(chunks) do
                if c:find("local x = 1", 1, true) then saw_line = true; break end
            end
            test.is_true(saw_line)
        end)
    end)

    test.describe("chunk context", function()
        test.it("enriches only chunks without declared context and retains original positions", function()
            local seen = {}
            local function enrich_batch(_doc, _summary, chunks)
                seen = chunks
                return { "generated second", "generated fourth" }, nil
            end
            local enriched, err = source_materializer.enrich_chunk_prefixes({}, "summary",
                { "one", "two", "three", "four" },
                { chunk_size = 300, chunk_overlap = 0, summary_max_chars = 0 }, nil, enrich_batch,
                { { contextual_prefix = "declared first" }, {}, { contextual_prefix = "declared third" }, {} })
            test.is_nil(err)
            test.eq(#seen, 2)
            test.eq(seen[1], "two")
            test.eq(seen[2], "four")
            test.eq(enriched.prefixes[1], "declared first")
            test.eq(enriched.prefixes[2], "generated second")
            test.eq(enriched.prefixes[3], "declared third")
            test.eq(enriched.prefixes[4], "generated fourth")
            test.eq(enriched.attempted, 2)
        end)
    end)

    test.describe("batch_embed", function()
        -- A large document's chunks must be embedded in bounded batches (a single
        -- request can't carry hundreds of inputs) and stitched back in order.
        test.it("splits a large input set into bounded batches and preserves order", function()
            local texts: {string} = {}
            for i = 1, 250 do texts[#texts + 1] = "chunk-" .. i end

            local batch_sizes: {integer} = {}
            local embedder = function(batch, _model, _dims)
                batch_sizes[#batch_sizes + 1] = #batch
                local out = {}
                for _, t in ipairs(batch) do out[#out + 1] = { tag = t } end
                return { result = out }
            end

            local vectors, err = source_materializer.batch_embed(embedder, texts, "m", 8)
            test.is_nil(err)
            test.eq(#vectors.result, 250)
            -- every batch within the count cap, and more than one batch was needed
            test.is_true(#batch_sizes >= 3)
            for _, n in ipairs(batch_sizes) do test.is_true(n <= 96) end
            -- order is preserved across batches
            test.eq(vectors.result[1].tag, "chunk-1")
            test.eq(vectors.result[250].tag, "chunk-250")
        end)

        test.it("splits a chunk set over the token cap into sub-cap batches, embedding every chunk", function()
            local budget = source_materializer.EMBED_BATCH_MAX_TOKENS
            -- ~71k tokens each: a few of these blow past the 300k provider cap if
            -- sent in one request, so the budget must split them across batches.
            local big = string.rep("x", 250000)
            local texts: {string} = {}
            for _ = 1, 12 do texts[#texts + 1] = big end

            local call_tokens: {integer} = {}
            local embedder = function(batch, _m, _d)
                local total = 0
                for _, t in ipairs(batch) do total = total + source_materializer.estimate_tokens(t) end
                call_tokens[#call_tokens + 1] = total
                local out = {}
                for _, t in ipairs(batch) do out[#out + 1] = { tag = t } end
                return { result = out }
            end

            local vectors, err = source_materializer.batch_embed(embedder, texts, "m", 8)
            test.is_nil(err)
            -- every chunk embedded, none dropped
            test.eq(#vectors.result, 12)
            -- more than one request was needed, and each stayed under the budget
            test.is_true(#call_tokens >= 2)
            for _, total in ipairs(call_tokens) do test.is_true(total <= budget) end
        end)

        test.it("embeds each chunk on its own request when no two can share the budget", function()
            -- ~243k estimated tokens each: under the 250k budget alone, but any two
            -- together overflow it, so each must land in a request by itself.
            local big = string.rep("y", 850000)
            local texts: {string} = { big, big }
            local budget = source_materializer.EMBED_BATCH_MAX_TOKENS
            local batch_sizes: {integer} = {}
            local call_tokens: {integer} = {}
            local embedder = function(batch, _m, _d)
                batch_sizes[#batch_sizes + 1] = #batch
                local total = 0
                for _, t in ipairs(batch) do total = total + source_materializer.estimate_tokens(t) end
                call_tokens[#call_tokens + 1] = total
                local out = {}
                for _ in ipairs(batch) do out[#out + 1] = {} end
                return { result = out }
            end
            local vectors, err = source_materializer.batch_embed(embedder, texts, "m", 8)
            test.is_nil(err)
            test.eq(#vectors.result, 2)
            test.eq(#batch_sizes, 2)
            for _, n in ipairs(batch_sizes) do test.eq(n, 1) end
            for _, total in ipairs(call_tokens) do test.is_true(total <= budget) end
        end)

        test.it("surfaces a precise per-chunk error when one chunk alone exceeds the budget", function()
            -- ~286k estimated tokens (over the 250k budget): cannot fit any request.
            local huge = string.rep("z", 1000000)
            local embedder = function(_b, _m, _d)
                error("embedder must not be called for an unfittable chunk")
            end
            local _, err = source_materializer.batch_embed(embedder, { huge }, "m", 8)
            test.not_nil(err)
            -- the error names the chunk, not an opaque whole-document failure
            test.is_true(string.find(tostring(err), "chunk", 1, true) ~= nil)
            test.is_true(string.find(tostring(err), "token", 1, true) ~= nil)
        end)

        test.it("surfaces an embedder error", function()
            local embedder = function(_b, _m, _d) return nil, "provider down" end
            local _, err = source_materializer.batch_embed(embedder, { "a", "b" }, "m", 8)
            test.not_nil(err)
        end)
    end)

    test.describe("document summary", function()
        local opts = {
            chunk_size = 1000,
            chunk_overlap = 100,
            summary_max_chars = 400,
            max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
        }

        test.it("uses the LLM-compressed summary when the summarizer returns one", function()
            local docs = { { title = "Doc", content = string.rep("body sentence here. ", 200) } }
            local summarize = function(_d) return "A dense LLM summary of the document." end
            local plans = source_materializer.plan_document_writes(docs, opts, summarize)
            test.not_nil(plans)
            test.eq(plans[1].summary_text, "A dense LLM summary of the document.")
        end)

        test.it("falls back to the deterministic summary when the summarizer yields nothing", function()
            local docs = { { title = "Doc", content = "Alpha beta gamma delta epsilon." } }
            local plans_nil = source_materializer.plan_document_writes(docs, opts, function(_d) return nil end)
            local plans_none = source_materializer.plan_document_writes(docs, opts)
            test.not_nil(plans_nil)
            test.eq(plans_nil[1].summary_text, plans_none[1].summary_text)
            test.is_true(#plans_nil[1].summary_text > 0)
        end)
    end)

    test.describe("chunk enrichment (contextual retrieval)", function()
        local opts = {
            chunk_size = 300,
            chunk_overlap = 0,
            summary_max_chars = 0,
            max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
        }

        test.it("prepends the context to the embedded text and stores it on the chunk", function()
            local docs = { { title = "Doc", content = string.rep("alpha beta gamma. ", 60) } }
            local enrich = function(_doc, _summary, _chunk) return "CTX: section one" end
            local plans, embed_texts_opt = source_materializer.plan_document_writes(docs, opts, nil, enrich)
            test.not_nil(plans)
            test.not_nil(embed_texts_opt)
            local embed_texts = embed_texts_opt :: {string}
            local plan = plans[1]
            test.is_true(#plan.chunk_indices >= 1)
            test.eq(plan.chunk_prefixes[1], "CTX: section one")
            -- the embedded text carries the prefix; the stored chunk stays raw
            local embedded = embed_texts[plan.chunk_indices[1] :: integer]
            test.eq(embedded:sub(1, 16), "CTX: section one")
            test.is_true(plan.chunk_texts[1]:sub(1, 3) ~= "CTX")
        end)

        test.it("embeds the raw chunk when no enricher is supplied", function()
            local docs = { { title = "Doc", content = string.rep("alpha beta gamma. ", 60) } }
            local plans, embed_texts_opt = source_materializer.plan_document_writes(docs, opts)
            test.not_nil(plans)
            test.not_nil(embed_texts_opt)
            local embed_texts = embed_texts_opt :: {string}
            local plan = (plans :: {any})[1]
            test.eq(plan.chunk_prefixes[1], "")
            test.eq(embed_texts[plan.chunk_indices[1] :: integer], plan.chunk_texts[1])
        end)

        -- Each chunk's enrichment prefix must stay attached to that exact chunk.
        -- Deriving the prefix from the chunk's own marker catches any ordering bug:
        -- a scrambled result would attach a mismatched section number.
        test.it("preserves chunk/prefix order across enrichment", function()
            local parts = {}
            for i = 1, 40 do parts[i] = "SECTION" .. tostring(i) .. ". " .. string.rep("filler words here ", 30) end
            local docs = { { title = "Doc", content = table.concat(parts, "\n\n") } }
            local enrich = function(_doc, _summary, chunk)
                return "PFX" .. tostring(chunk:match("SECTION(%d+)") or "?")
            end
            local plans = source_materializer.plan_document_writes(docs, opts, nil, enrich)
            local plan = (plans :: {any})[1]
            test.is_true(#plan.chunk_texts > 5)
            for i, chunk in ipairs(plan.chunk_texts) do
                local marker = chunk:match("SECTION(%d+)")
                if marker then
                    test.eq(plan.chunk_prefixes[i], "PFX" .. marker)
                end
            end
        end)

        test.it("batches optional enrichment without falling back to per-chunk calls", function()
            local batch_opts = {
                chunk_size = 300,
                chunk_overlap = 0,
                summary_max_chars = 0,
                max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
                chunk_enrichment_batch_size = 4,
                max_chunk_enrichment_batches = 20,
                max_chunk_enrichment_failures = 1,
            }
            local parts = {}
            for i = 1, 40 do parts[i] = "SECTION" .. tostring(i) .. ". " .. string.rep("filler words here ", 30) end
            local docs = { { title = "Doc", content = table.concat(parts, "\n\n") } }
            local single_calls = 0
            local enrich = function()
                single_calls = single_calls + 1
                return "single path must not run"
            end
            local batch_calls = 0
            local batch_sizes: {integer} = {}
            local enrich_batch = function(_doc, _summary, chunks)
                batch_calls = batch_calls + 1
                batch_sizes[#batch_sizes + 1] = #chunks
                local out = {}
                for i, chunk in ipairs(chunks) do
                    out[i] = "BPFX" .. tostring(chunk:match("SECTION(%d+)") or "?")
                end
                return out
            end

            local plans = source_materializer.plan_document_writes(docs, batch_opts, nil, enrich, nil, enrich_batch)
            local plan = (plans :: {any})[1]
            test.is_true(#plan.chunk_texts > 4)
            test.eq(single_calls, 0)
            test.is_true(batch_calls < #plan.chunk_texts)
            for _, n in ipairs(batch_sizes) do test.is_true(n <= 4) end
            for i, chunk in ipairs(plan.chunk_texts) do
                local marker = chunk:match("SECTION(%d+)")
                if marker then
                    test.eq(plan.chunk_prefixes[i], "BPFX" .. marker)
                end
            end
        end)

        test.it("stops optional batched enrichment at the configured budget and embeds the rest raw", function()
            local batch_opts = {
                chunk_size = 300,
                chunk_overlap = 0,
                summary_max_chars = 0,
                max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
                chunk_enrichment_batch_size = 2,
                max_chunk_enrichment_batches = 2,
                max_chunk_enrichment_failures = 1,
            }
            local parts = {}
            for i = 1, 20 do parts[i] = "SECTION" .. tostring(i) .. ". " .. string.rep("filler words here ", 30) end
            local docs = { { title = "Doc", content = table.concat(parts, "\n\n") } }
            local batch_calls = 0
            local enrich_batch = function(_doc, _summary, chunks)
                batch_calls = batch_calls + 1
                local out = {}
                for i, chunk in ipairs(chunks) do
                    out[i] = "BPFX" .. tostring(chunk:match("SECTION(%d+)") or "?")
                end
                return out
            end

            local plans, embed_texts_opt = source_materializer.plan_document_writes(docs, batch_opts, nil, nil, nil, enrich_batch)
            test.not_nil(plans)
            test.not_nil(embed_texts_opt)
            test.eq(batch_calls, 2)

            local plan = (plans :: {any})[1]
            test.is_true(#plan.chunk_texts > 4)
            for i, chunk in ipairs(plan.chunk_texts) do
                if i <= 4 then
                    local marker = chunk:match("SECTION(%d+)")
                    if marker then test.eq(plan.chunk_prefixes[i], "BPFX" .. marker) end
                else
                    test.eq(plan.chunk_prefixes[i], "")
                    test.eq((embed_texts_opt :: {string})[plan.chunk_indices[i] :: integer], chunk)
                end
            end
        end)

        -- One chunk the enricher cannot situate must not shift every following
        -- prefix: it falls back to an empty prefix while its siblings keep their
        -- own, in order. The failure budget is wide enough here that the run is
        -- about alignment rather than the budget.
        test.it("isolates a failing enrich call without misaligning the rest", function()
            local tolerant_opts = {
                chunk_size = 300,
                chunk_overlap = 0,
                summary_max_chars = 0,
                max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
                max_chunk_enrichment_failures = 20,
            }
            local parts = {}
            for i = 1, 20 do parts[i] = "SECTION" .. tostring(i) .. ". " .. string.rep("filler words here ", 30) end
            local docs = { { title = "Doc", content = table.concat(parts, "\n\n") } }
            local enrich = function(_doc, _summary, chunk)
                local n = chunk:match("SECTION(%d+)")
                if n == "3" then return nil, "the enricher could not situate this chunk" end
                return "PFX" .. tostring(n or "?")
            end
            local plans = source_materializer.plan_document_writes(docs, tolerant_opts, nil, enrich)
            local plan = (plans :: {any})[1]
            for i, chunk in ipairs(plan.chunk_texts) do
                local marker = chunk:match("SECTION(%d+)")
                if marker == "3" then
                    test.eq(plan.chunk_prefixes[i], "")
                elseif marker then
                    test.eq(plan.chunk_prefixes[i], "PFX" .. marker)
                end
            end
        end)

        test.it("disables optional batched enrichment for the document after a provider error", function()
            local batch_opts = {
                chunk_size = 300,
                chunk_overlap = 0,
                summary_max_chars = 0,
                max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
                chunk_enrichment_batch_size = 4,
                max_chunk_enrichment_failures = 1,
            }
            local parts = {}
            for i = 1, 20 do parts[i] = "SECTION" .. tostring(i) .. ". " .. string.rep("filler words here ", 30) end
            local docs = { { title = "Doc", content = table.concat(parts, "\n\n") } }
            local calls = 0
            local enrich_batch = function(_doc, _summary, _chunks)
                calls = calls + 1
                return nil, "provider unavailable"
            end

            local plans, embed_texts_opt = source_materializer.plan_document_writes(docs, batch_opts, nil, nil, nil, enrich_batch)
            test.not_nil(plans)
            test.not_nil(embed_texts_opt)
            test.eq(calls, 1)

            local plan = (plans :: {any})[1]
            test.is_true(#plan.chunk_texts > 4)
            for i, chunk in ipairs(plan.chunk_texts) do
                test.eq(plan.chunk_prefixes[i], "")
                test.eq((embed_texts_opt :: {string})[plan.chunk_indices[i] :: integer], chunk)
            end
        end)

        test.it("contains a raised batched enrichment provider", function()
            local batch_opts = {
                chunk_size = 300,
                chunk_overlap = 0,
                summary_max_chars = 0,
                max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
                chunk_enrichment_batch_size = 4,
                max_chunk_enrichment_failures = 1,
            }
            local parts = {}
            for i = 1, 20 do parts[i] = "SECTION" .. tostring(i) .. ". " .. string.rep("filler words here ", 30) end
            local docs = { { title = "Doc", content = table.concat(parts, "\n\n") } }
            local calls = 0
            local enrich_batch = function(_doc, _summary, _chunks)
                calls = calls + 1
                error("batch enrich boom")
            end

            local plans, embed_texts_opt = source_materializer.plan_document_writes(
                docs, batch_opts, nil, nil, nil, enrich_batch
            )
            test.not_nil(plans)
            test.not_nil(embed_texts_opt)
            test.eq(calls, 1)

            local plan = (plans :: {any})[1]
            test.is_true(#plan.chunk_texts > 4)
            for i, chunk in ipairs(plan.chunk_texts) do
                test.eq(plan.chunk_prefixes[i], "")
                test.eq((embed_texts_opt :: {string})[plan.chunk_indices[i] :: integer], chunk)
            end
        end)

        test.it("disables optional enrichment for the document after a provider error", function()
            local parts = {}
            for i = 1, 20 do parts[i] = "SECTION" .. tostring(i) .. ". " .. string.rep("filler words here ", 30) end
            local docs = { { title = "Doc", content = table.concat(parts, "\n\n") } }
            local calls = 0
            local enrich = function(_doc, _summary, _chunk)
                calls = calls + 1
                return nil, "provider unavailable"
            end

            local plans, embed_texts_opt = source_materializer.plan_document_writes(docs, opts, nil, enrich)
            test.not_nil(plans)
            test.not_nil(embed_texts_opt)
            test.eq(calls, 1)

            local plan = (plans :: {any})[1]
            test.is_true(#plan.chunk_texts > 1)
            for i, chunk in ipairs(plan.chunk_texts) do
                test.eq(plan.chunk_prefixes[i], "")
                test.eq((embed_texts_opt :: {string})[plan.chunk_indices[i] :: integer], chunk)
            end
        end)
    end)

    -- Per-document fault isolation. One document that fails to materialize (its
    -- store write throws, or its planning/embedding errors) must not abort the
    -- batch: it is recorded failed with its specific error while every sibling
    -- document — before and after it — still materializes in order.
    test.describe("document materialization fault isolation", function()
        local function make_target(throw_on: any)
            local replaced: {string} = {}
            local rows: { [string]: any } = {}
            local store = {
                vector_dimensions = function(_self, _input) return 3, nil end,
                replace_document = function(_self, input)
                    local meta = input.document.metadata
                    local ext = meta.external_id
                    -- The materialized (completed, with children) write blows up for
                    -- the poison doc; the dead-letter write (status=failed, no
                    -- children) for that same doc still lands the read-model row.
                    if ext == throw_on and meta.status ~= "failed" then
                        error("replace blew up for " .. tostring(ext))
                    end
                    if meta.status ~= "failed" then
                        replaced[#replaced + 1] = ext
                    end
                    -- The KB-owned source-document read-model row, keyed by canonical
                    -- external_id: a later write replaces it (completed replaces failed).
                    rows[tostring(ext)] = {
                        external_id = ext,
                        status = meta.status,
                        error = meta.error,
                        system_level = meta.system_level,
                    }
                    return {
                        document_node_id = "node:" .. tostring(ext),
                        removed = 0, summary_count = 0, chunk_count = #input.children,
                    }, nil
                end,
            }
            local target = {
                store = store,
                store_row = {
                    id = "store-1",
                    component_id = "kb-1",
                    embedding_model = "model:test",
                    config = { chunk_size = 400, chunk_overlap = 0, summary_max_chars = 0 },
                },
            }
            return target, replaced, rows
        end

        local function embedder(batch, _model, _dims)
            local out = {}
            for _, _t in ipairs(batch) do out[#out + 1] = { 0.1, 0.2, 0.3 } end
            return { result = out }
        end

        local function docs()
            return {
                { external_id = "a", title = "A", content = string.rep("alpha sentence here. ", 40) },
                { external_id = "poison", title = "P", content = string.rep("poison sentence here. ", 40) },
                { external_id = "b", title = "B", content = string.rep("beta sentence here. ", 40) },
            }
        end

        test.it("isolates a document whose store write throws, materializing the rest in order", function()
            local target, replaced, rows = make_target("poison")
            local result, err = source_materializer.ingest_documents_into_store(
                "kb-1", target, docs(), embedder, nil, nil, nil, {}, nil
            )
            -- the batch as a whole succeeds (no hard error); the poison doc is counted failed
            test.is_nil(err)
            test.eq(result.inserted, 2)
            test.eq(result.failed, 1)
            -- siblings materialized, in order, and the poison one did not
            test.eq(#replaced, 2)
            test.eq(replaced[1], "a")
            test.eq(replaced[2], "b")
            -- the failure is recorded on a notification with the captured error
            local found_failed = nil
            for _, n in ipairs(result.notifications) do
                if n.status == "failed" then found_failed = n end
            end
            test.not_nil(found_failed)
            test.eq(found_failed.external_id, "poison")
            test.is_true(tostring(found_failed.error):find("blew up", 1, true) ~= nil)
            test.eq(found_failed.persisted, true)
            test.eq(found_failed.failed_delta, 1)
            test.eq(found_failed.document_delta, 0)
            -- the poison doc is queryable as FAILED on the KB read-model, with its
            -- error, while the siblings landed as completed rows
            local poison_row = rows["poison"] :: any
            local row_a = rows["a"] :: any
            local row_b = rows["b"] :: any
            test.not_nil(poison_row)
            test.not_nil(row_a)
            test.not_nil(row_b)
            test.eq(poison_row.status, "failed")
            test.is_true(tostring(poison_row.error):find("blew up", 1, true) ~= nil)
            test.eq(row_a.status, "completed")
            test.eq(row_b.status, "completed")
            -- the dead-letter row carries the document node id the notification reports
            test.eq(found_failed.document_node_id, "node:poison")
        end)

        test.it("classifies a registry/resource exhaustion as a system-level failure", function()
            test.is_true(source_materializer.is_system_failure("kickside...:203: registry overflow"))
            test.is_true(source_materializer.is_system_failure("embed failed: provider down"))
            test.is_true(source_materializer.is_system_failure("chunk 1 vector dimension mismatch"))
            test.is_false(source_materializer.is_system_failure("replace document failed: insert child failed: pq: invalid byte sequence for encoding \"UTF8\": 0xe2"))
            test.is_false(source_materializer.is_system_failure("document chunk count exceeds KB policy: produced 5294 chunks (max 1500); full content preserved for replay"))
            test.is_false(source_materializer.is_system_failure("no materialized summary or chunks"))
        end)

        test.it("returns a batch error without writing failed rows when every document hits a system embedding failure", function()
            local target, replaced, rows = make_target(nil)
            local function down_embedder(_batch, _model, _dims)
                return nil, "provider down"
            end
            local result, err = source_materializer.ingest_documents_into_store(
                "kb-1", target, docs(), down_embedder, nil, nil, nil, {}, nil
            )

            test.not_nil(err)
            test.is_true(tostring(err):find("system-level document materialization failed", 1, true) ~= nil)
            test.eq(result.inserted, 0)
            test.eq(result.failed, 3)
            test.eq(result.system_failed, 3)
            test.eq(#replaced, 0)
            test.is_nil(rows.a)
            test.is_nil(rows.poison)
            test.is_nil(rows.b)
            for _, n in ipairs(result.notifications) do
                test.eq(n.status, "failed")
                test.eq(n.system_level, true)
                test.eq(n.persisted, false)
                test.eq(n.failed_delta, 0)
            end
        end)

        test.it("does not write failed rows for malformed provider vectors before retry", function()
            local target, replaced, rows = make_target(nil)
            local function malformed_embedder(batch, _model, _dims)
                local out = {}
                for _, _t in ipairs(batch) do out[#out + 1] = { 0.1 } end
                return { result = out }, nil
            end
            local result, err = source_materializer.ingest_documents_into_store(
                "kb-1",
                target,
                { { external_id = "bad-vector", title = "Bad", content = string.rep("vector sentence here. ", 40) } },
                malformed_embedder,
                nil,
                nil,
                nil,
                {},
                nil
            )

            test.not_nil(err)
            test.eq(result.inserted, 0)
            test.eq(result.failed, 1)
            test.eq(result.system_failed, 1)
            test.eq(#replaced, 0)
            test.is_nil(rows["bad-vector"])
            local failed = result.notifications[1]
            test.eq(failed.status, "failed")
            test.eq(failed.system_level, true)
            test.eq(failed.persisted, false)
            test.eq(failed.failed_delta, 0)
            test.is_true(tostring(failed.error):find("vector dimension mismatch", 1, true) ~= nil)
        end)

        test.it("optionally dead-letters oversized documents without truncating stored content", function()
            local replaced: {string} = {}
            local rows: { [string]: any } = {}
            local store = {
                vector_dimensions = function(_self, _input) return 3, nil end,
                replace_document = function(_self, input)
                    local meta = input.document.metadata
                    local ext = tostring(meta.external_id)
                    rows[ext] = {
                        external_id = ext,
                        status = meta.status,
                        error = meta.error,
                        content = input.document.content,
                    }
                    if meta.status ~= "failed" then
                        replaced[#replaced + 1] = ext
                    end
                    return {
                        document_node_id = "node:" .. ext,
                        removed = 0,
                        summary_count = 0,
                        chunk_count = #input.children,
                    }, nil
                end,
            }
            local target = {
                store = store,
                store_row = {
                    id = "store-1",
                    component_id = "kb-1",
                    embedding_model = "model:test",
                    config = {
                        chunk_size = 400,
                        chunk_overlap = 0,
                        summary_max_chars = 0,
                        max_document_content_chars = 1000,
                    },
                },
            }
            local function embedder(batch, _model, _dims)
                local out = {}
                for _, _t in ipairs(batch) do out[#out + 1] = { 0.1, 0.2, 0.3 } end
                return { result = out }
            end

            local huge = string.rep("huge doc sentence. ", 100)
            local result, err = source_materializer.ingest_documents_into_store(
                "kb-1",
                target,
                {
                    { external_id = "small", title = "Small", content = string.rep("small sentence here. ", 40) },
                    { external_id = "huge", title = "Huge", content = huge },
                },
                embedder,
                nil,
                nil,
                nil,
                {},
                nil
            )

            test.is_nil(err)
            test.eq(result.inserted, 1)
            test.eq(result.failed, 1)
            test.eq(#replaced, 1)
            test.eq(replaced[1], "small")
            local huge_row = (rows.huge :: any)
            test.eq(huge_row.status, "failed")
            test.is_true(tostring(huge_row.error):find("document content too large", 1, true) ~= nil)
            test.eq(huge_row.content, huge)
        end)

        test.it("dead-letters over-chunk documents without indexing a trimmed prefix", function()
            local replaced: {string} = {}
            local rows: { [string]: any } = {}
            local store = {
                vector_dimensions = function(_self, _input) return 3, nil end,
                replace_document = function(_self, input)
                    local meta = input.document.metadata
                    local ext = tostring(meta.external_id)
                    rows[ext] = {
                        external_id = ext,
                        status = meta.status,
                        error = meta.error,
                        content = input.document.content,
                        child_count = #input.children,
                    }
                    if meta.status ~= "failed" then
                        replaced[#replaced + 1] = ext
                    end
                    return {
                        document_node_id = "node:" .. ext,
                        removed = 0,
                        summary_count = 0,
                        chunk_count = #input.children,
                    }, nil
                end,
            }
            local target = {
                store = store,
                store_row = {
                    id = "store-1",
                    component_id = "kb-1",
                    embedding_model = "model:test",
                    config = {
                        chunk_size = 200,
                        chunk_overlap = 0,
                        summary_max_chars = 0,
                        max_chunks_per_doc = 1,
                    },
                },
            }
            local function embedder(batch, _model, _dims)
                local out = {}
                for _, _t in ipairs(batch) do out[#out + 1] = { 0.1, 0.2, 0.3 } end
                return { result = out }
            end

            local large = table.concat({
                string.rep("alpha sentence here. ", 80),
                string.rep("beta sentence here. ", 80),
                string.rep("gamma sentence here. ", 80),
            }, "\n\n")
            local result, err = source_materializer.ingest_documents_into_store(
                "kb-1",
                target,
                {
                    { external_id = "large", title = "Large", content = large },
                },
                embedder,
                nil,
                nil,
                nil,
                {},
                nil
            )

            test.is_nil(err)
            test.eq(result.inserted, 0)
            test.eq(result.failed, 1)
            test.eq(#replaced, 0)
            local large_row = (rows.large :: any)
            test.eq(large_row.status, "failed")
            test.eq(large_row.content, large)
            test.eq(large_row.child_count, 0)
            test.is_true(tostring(large_row.error):find("document chunk count exceeds KB policy", 1, true) ~= nil)
        end)
    end)

    test.describe("image embedding gate", function()
        local function img(name: string, role: string, checksum: string): any
            return { name = name, role = role, checksum = checksum, artifact_id = checksum }
        end

        local function plan_for(content: string, images: any, embed_images: boolean, with_caption: boolean, max_images: integer?): any
            local doc = { content = content, title = "", metadata = { image_artifacts = images } }
            local opts = {
                chunk_size = 1000,
                chunk_overlap = 100,
                summary_max_chars = 0,
                max_chunks_per_doc = source_materializer.MAX_CHUNKS_PER_DOC,
                embed_images = embed_images,
                max_image_captions_per_doc = max_images,
            }
            local caption = with_caption and function(_d: any, _h: any, _p: any, image: any): string
                return "caption:" .. tostring(image.name)
            end or nil
            local plans = source_materializer.plan_document_writes({ doc }, opts, nil, nil, caption)
            return plans[1]
        end

        test.it("does not embed a rendered-page image when embed_images is off", function()
            local plan = plan_for("", { img("page_1.png", "rendered-page", "h1") }, false, true)
            test.eq(#plan.image_plans, 0)
        end)

        test.it("does not embed a rendered-page image once the document has text (OCR supersedes)", function()
            local plan = plan_for("Transcribed page text from OCR.", { img("page_1.png", "rendered-page", "h1") }, false, true)
            test.eq(#plan.image_plans, 0)
        end)

        test.it("does not embed an extracted page image when embed_images is off", function()
            local plan = plan_for("", { img("page1.jpg", "extracted-image", "h3") }, false, true)
            test.eq(#plan.image_plans, 0)
        end)

        test.it("does not embed an extracted image when embed_images is off", function()
            local plan = plan_for("Some real text here.", { img("fig.png", "extracted-image", "h2") }, false, true)
            test.eq(#plan.image_plans, 0)
        end)

        test.it("embeds both rendered-page and extracted images when embed_images is on", function()
            local plan = plan_for("Some real text here.", {
                img("page_1.png", "rendered-page", "h1"),
                img("fig.png", "extracted-image", "h2"),
            }, true, true)
            test.eq(#plan.image_plans, 2)
        end)

        test.it("bounds per-document image captioning", function()
            local plan = plan_for("Some real text here.", {
                img("one.png", "extracted-image", "h1"),
                img("two.png", "extracted-image", "h2"),
                img("three.png", "extracted-image", "h3"),
            }, true, true, 2)
            test.eq(#plan.image_plans, 2)
            test.eq(plan.image_plans[1].caption, "caption:one.png")
            test.eq(plan.image_plans[2].caption, "caption:two.png")
        end)

        test.it("embeds no images without a captioner", function()
            local plan = plan_for("", { img("page_1.png", "rendered-page", "h1") }, true, false)
            test.eq(#plan.image_plans, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
