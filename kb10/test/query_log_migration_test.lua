local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local store = require("store")
local query_log = require("query_log")

local function define_tests()
    test.describe("retrieval observations schema preservation", function()
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
