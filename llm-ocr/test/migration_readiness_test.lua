local test = require("test")
local sql = require("sql")
local migration_registry = require("migration_registry")

local function run(options: any): any
    return test.run_cases(function()
        test.describe("application migration readiness", function()
            test.it("records every registered app database migration before tests run", function()
                local registered, registry_err = migration_registry.find({ target_db = "app:db" })
                test.is_nil(registry_err)
                test.is_true(registered ~= nil and #registered > 0)

                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                local rows, query_err = db:query("SELECT id FROM _migrations")
                db:release()
                test.is_nil(query_err)

                local applied: { [string]: boolean } = {}
                for _, row in ipairs(rows or {}) do
                    applied[tostring((row :: any).id)] = true
                end

                local missing = 0
                for _, entry in ipairs(registered or {}) do
                    if not applied[tostring((entry :: any).id)] then
                        missing = missing + 1
                    end
                end

                test.eq(missing, 0)
            end)
        end)
    end)(options)
end

return { run = run }
