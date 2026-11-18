-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local store = require("store")
local materializer = require("materializer")
local analysis_model = require("analysis_model")
local engines = require("engines")

return test.run_cases(function()
    test.describe("contextual model settings upgrade", function()
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
                    rows[#rows + 1] = { id = id, kind = kind, case = case }
                end
            end

            local db = assert(sql.get("app:db"))
            for _ = 1, 2 do
                local migration_id = "contextual-model-upgrade-" .. uuid.v7()
                local result, err = funcs.call("kickside.kb10.migrations:08_preserve_contextual_model_settings", {
                    database_id = "app:db", id = migration_id, direction = "up",
                })
                test.is_nil(err, tostring(err))
                test.eq(result.failed, 0, tostring(result.error))
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
                    test.eq(analysis_model.configured(saved.config), case.analysis)
                    local runs, runs_err = db:query("SELECT id FROM kb10_maintenance_runs WHERE component_id = $1", { row.id })
                    test.is_nil(runs_err)
                    test.eq(#runs, 0)
                end
                local _, ledger_err = db:execute("DELETE FROM _migrations WHERE id = $1", { migration_id })
                test.is_nil(ledger_err)
            end
            db:release()
            for _, row in ipairs(rows) do
                local _, err = store.delete_store(row.id)
                test.is_nil(err)
            end
        end)
    end)
end)
