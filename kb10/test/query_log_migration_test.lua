local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local store = require("store")
local query_log = require("query_log")
local json = require("json")

local ANSWER_SETTINGS_MIGRATION = "kickside.kb10.migrations:07_preserve_answer_settings"

local function stored_config(db, id)
    local rows, err = db:query("SELECT CAST(config AS TEXT) AS config FROM kb10_stores WHERE id = $1", { id })
    test.is_nil(err)
    test.eq(#rows, 1)
    return rows[1].config
end

local function define_tests()
    test.describe("retrieval observations schema preservation", function()
        test.it("preserves existing answer settings when creation defaults change", function()
            local db = assert(sql.get("app:db"))
            local rows = {}
            for _, fixture in ipairs({
                { config = '{}', analysis = "" },
                { config = '[  ]', analysis = "" },
                { config = '{"analysis_model":null,"extra_prompt":"Existing instructions","custom":{"keep":true}}',
                    analysis = "", extra_prompt = "Existing instructions" },
                { config = '{"custom":{"keep":true}}', analysis = "", custom = true },
                { config = '{"analysis_model":false}', analysis = false },
                { config = '{"analysis_model":""}', analysis = "" },
                { config = '{"analysis_model":"custom-model"}', analysis = "custom-model" },
                { config = '["preserve this data"]', unchanged = true },
                { config = '"preserve this value"', unchanged = true },
            }) do
                local id = uuid.v7()
                local _, seed_err = db:execute([[INSERT INTO kb10_stores (id, component_id, embedding_model, config)
                    VALUES ($1, $2, $3, $4)]], { id, id, "class:embed", fixture.config })
                test.is_nil(seed_err)
                rows[#rows + 1] = { id = id, fixture = fixture, before = stored_config(db, id) }
            end
            for _ = 1, 2 do
                local migration_id = "answer-settings-" .. uuid.v7()
                local result, err = funcs.call(ANSWER_SETTINGS_MIGRATION, {
                    database_id = "app:db", id = migration_id, direction = "up",
                })
                test.is_nil(err, tostring(err))
                test.eq(result.failed, 0, tostring(result.error))
                for _, row in ipairs(rows) do
                    local saved = stored_config(db, row.id)
                    if row.fixture.unchanged then
                        test.eq(saved, row.before)
                    else
                        local config = assert(json.decode(saved))
                        test.eq(config.analysis_model, row.fixture.analysis)
                        if row.fixture.custom or row.fixture.extra_prompt then test.is_true(config.custom.keep) end
                        test.eq(config.extra_prompt, row.fixture.extra_prompt)
                    end
                end
                local _, ledger_err = db:execute("DELETE FROM _migrations WHERE id = $1", { migration_id })
                test.is_nil(ledger_err)
            end
            db:release()
            for _, row in ipairs(rows) do
                local _, delete_err = store.delete_store(row.id)
                test.is_nil(delete_err)
            end
        end)

        test.it("stores an empty config object without adding an analysis setting on current writes", function()
            local id = uuid.v7()
            local db = assert(sql.get("app:db"))
            local _, create_err = store.create_store(id, "class:embed", {}, nil)
            test.is_nil(create_err)
            test.eq(stored_config(db, id), "{}")
            test.is_nil(assert(store.get_store(id)).config.analysis_model)

            local _, update_err = store.update_config(id, { analysis_model = false, custom = { keep = true } })
            test.is_nil(update_err)
            local configured = assert(store.get_store(id)).config
            test.eq(configured.analysis_model, false)
            test.is_true(configured.custom.keep)

            local _, clear_err = store.update_config(id, {})
            test.is_nil(clear_err)
            test.eq(stored_config(db, id), "{}")
            test.is_nil(assert(store.get_store(id)).config.analysis_model)

            local omitted = uuid.v7()
            local _, omitted_err = store.create_store(omitted, "class:embed", nil, nil)
            test.is_nil(omitted_err)
            test.eq(stored_config(db, omitted), "{}")

            local retry, retry_err = funcs.call(ANSWER_SETTINGS_MIGRATION, {
                database_id = "app:db", id = ANSWER_SETTINGS_MIGRATION, direction = "up",
            })
            test.is_nil(retry_err)
            test.eq(retry.migrations[1].status, "skipped")
            test.eq(stored_config(db, id), "{}")
            test.eq(stored_config(db, omitted), "{}")

            db:release()
            test.is_nil(select(2, store.delete_store(omitted)))
            test.is_nil(select(2, store.delete_store(id)))
        end)

        test.it("adds retrieval schema to an installed query log without replacing observations", function()
            local id = uuid.v7()
            local _, create_err = store.create_store(id, "class:embed", {}, nil)
            test.is_nil(create_err)
            local _, record_err = query_log.record(id, {
                query = "preserved observation", strategy = "plain", top_score = 0.1, results = 0,
            })
            test.is_nil(record_err)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local before, before_err = db:query("SELECT * FROM kb10_query_log WHERE store_id = $1", { id })
            test.is_nil(before_err)
            test.eq(#before, 1)
            local migration_id = "retrieval-preservation-" .. uuid.v7()
            local result, migration_err = funcs.call("kickside.kb10.migrations:05_retrieval_observations", {
                database_id = "app:db", id = migration_id, direction = "up",
            })
            test.is_nil(migration_err)
            test.eq(result.failed, 0, tostring(result.error))
            local after, after_err = db:query("SELECT * FROM kb10_query_log WHERE store_id = $1", { id })
            test.is_nil(after_err)
            test.eq(#after, 1)
            for key, value in pairs(before[1]) do test.eq(after[1][key], value, key) end
            local state, state_err = db:query("SELECT observed FROM kb10_tuning_state WHERE store_id = $1", { id })
            test.is_nil(state_err)
            test.eq(state[1].observed, 1)
            local _, ledger_err = db:execute("DELETE FROM _migrations WHERE id = $1", { migration_id })
            test.is_nil(ledger_err)
            db:release()
            local _, delete_err = store.delete_store(id)
            test.is_nil(delete_err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
