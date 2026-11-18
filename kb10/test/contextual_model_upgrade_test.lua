-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local store = require("store")
local materializer = require("materializer")
local query_policy = require("query_policy")
local query_service = require("query_service")
local engines = require("engines")
local models = require("models")

local vector = {}
for i = 1, 512 do vector[i] = i == 1 and 1 or 0 end

local function migrate()
    local migration_id = "contextual-model-upgrade-" .. uuid.v7()
    local result, err = funcs.call("kickside.kb10.migrations:08_preserve_contextual_model_settings", {
        database_id = "app:db", id = migration_id, direction = "up",
    })
    test.is_nil(err, tostring(err))
    test.eq(result.failed, 0, tostring(result.error))
    local db = assert(sql.get("app:db"))
    local _, ledger_err = db:execute("DELETE FROM _migrations WHERE id = $1", { migration_id })
    db:release()
    test.is_nil(ledger_err)
end

local function seed_passages(id: string): string
    local doc = assert(store.insert_node(id, { node_type = "document", content = "Reference" }))
    for _, kind in ipairs({ "summary", "chunk" }) do
        local node = assert(store.insert_node(id, { node_type = kind, parent_id = doc, content = "Reference passage" }))
        assert(store.insert_embedding(id, node, kind, doc, vector))
    end
    return doc
end

local function search(id: string, doc: string): (any, any, any)
    local previous_ctx, previous_llm = query_service._ctx, query_service._llm
    local calls = { analysis = 0, reranking = 0 }
    query_service._ctx = { get = function(): string return id end }
    query_service._llm = {
        embed = function(input: any): any
            local vectors = {}
            for _ in ipairs(input) do vectors[#vectors + 1] = vector end
            return { result = vectors }
        end,
        structured_output = function(schema: any): any
            if schema.properties.rankings then
                calls.reranking = calls.reranking + 1
                return { result = { rankings = {} } }
            end
            calls.analysis = calls.analysis + 1
            return { result = { documents = { { document_id = doc, relevant = true, search_query = "reference" } } } }
        end,
    }
    local ok, result, err = pcall(query_service.handle, { query = "reference" })
    query_service._ctx, query_service._llm = previous_ctx, previous_llm
    if not ok then error(result) end
    return result, calls, err
end

return test.run_cases(function()
    test.describe("contextual model settings upgrade", function()
        local stores = {}
        local card_name = "upgrade-fast-fixture"
        test.after_each(function()
            for _, id in ipairs(stores) do test.is_nil(select(2, store.delete_store(id))) end
            stores = {}
            test.is_nil(select(2, models.delete_card(card_name)))
        end)

        test.it("preserves generation settings without scheduling work", function()
            local rows = {}
            for _, kind in ipairs({ "document", "wiki" }) do
                for _, case in ipairs({
                    { value = "", saved = false },
                    { value = false, saved = false },
                    { summary = "class:fast", chunk = "class:fast" },
                    { value = "custom-model", saved = "custom-model", summary = "custom-model", chunk = "custom-model", analysis = "custom-model" },
                    { value = "", saved = false, named_summary = "custom-summary", summary = "custom-summary" },
                }) do
                    local id = uuid.v7()
                    local _, err = store.create_store(id, "class:embed", {
                        summary_model = case.named_summary or case.value,
                        chunk_enrichment_model = case.value,
                        analysis_model = case.value,
                        custom = { keep = true },
                    }, { kb_type = kind })
                    test.is_nil(err)
                    stores[#stores + 1] = id
                    rows[#rows + 1] = { id = id, kind = kind, case = case }
                end
            end

            for _ = 1, 2 do
                migrate()
                for _, row in ipairs(rows) do
                    local saved, read_err = store.get_store(row.id)
                    test.is_nil(read_err)
                    local case = row.case
                    test.eq(saved.config.summary_model, case.named_summary or case.saved)
                    test.eq(saved.config.chunk_enrichment_model, case.saved)
                    test.eq(saved.config.analysis_model, case.value)
                    test.is_true(saved.config.custom.keep)
                    local options, config_err = materializer.materialization_options({
                        store_row = saved, engine = assert(engines.resolve(row.kind)),
                    })
                    test.is_nil(config_err)
                    test.eq(options.summary_model, case.summary)
                    test.eq(options.chunk_enrichment_model, case.chunk)
                    test.eq(query_policy.resolve_analysis_model(saved.config), case.analysis)
                    local db = assert(sql.get("app:db"))
                    local runs, runs_err = db:query("SELECT id FROM kb10_maintenance_runs WHERE component_id = $1", { row.id })
                    db:release()
                    test.is_nil(runs_err)
                    test.eq(#runs, 0)
                end
            end
        end)

        for _, kind in ipairs({ "document", "wiki" }) do
            test.it("keeps Search plain after upgrading " .. kind .. " bases with analysis off", function()
                local _, card_err = models.upsert_card({ name = card_name, class = { "fast" },
                    capabilities = { "generate", "structured_output" }, max_tokens = 4096, output_tokens = 1024 })
                test.is_nil(card_err)
                local rows = {}
                for _, value in ipairs({ "", false }) do
                    local id = uuid.v7()
                    assert(store.create_store(id, "class:embed", {
                        summary_model = "", chunk_enrichment_model = "", analysis_model = value,
                    }, { kb_type = kind }))
                    stores[#stores + 1] = id
                    rows[#rows + 1] = { id = id, doc = seed_passages(id), value = value }
                end

                migrate()

                for _, row in ipairs(rows) do
                    local result, calls, search_err = search(row.id, row.doc)
                    test.is_nil(search_err, tostring(search_err))
                    test.eq(result.items[1].content, "Reference passage")
                    test.eq(calls.analysis, 0)
                    test.eq(calls.reranking, 0)
                    test.is_nil(result.retrieval)
                    test.eq(assert(store.get_store(row.id)).config.analysis_model, row.value)
                end
            end)

            test.it("keeps the saved reranker inactive in Agentic mode for " .. kind, function()
                local id = uuid.v7()
                local config = { analysis_model = "query-model", enable_reranking = true, query_driver = "built-in" }
                assert(store.create_store(id, "class:embed", config, { kb_type = kind }))
                stores[#stores + 1] = id
                local doc = seed_passages(id)
                local _, single_shot, single_err = search(id, doc)
                test.is_nil(single_err, tostring(single_err))
                test.eq(single_shot.analysis, 1)
                test.eq(single_shot.reranking, 1)

                config.query_driver = "agentic"
                test.is_nil(select(2, store.update_config(id, config)))
                local _, agentic, agentic_err = search(id, doc)
                test.is_nil(agentic_err, tostring(agentic_err))
                test.eq(agentic.analysis, 1)
                test.eq(agentic.reranking, 0)
                test.is_true(assert(store.get_store(id)).config.enable_reranking)
            end)
        end
    end)
end)
