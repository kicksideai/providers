-- target_db must bind migrations and all runtime persistence traffic to one DB.
local test = require("test")
local registry = require("registry")
local ops = require("ops")

local function define_tests()
    test.describe("KB10 target_db routing", function()
        test.it("targets every KB10 migration and runtime db_config", function()
            local requirement, err = registry.get("kickside.kb10:target_db")
            test.is_nil(err)
            local targets = {}
            for _, target in ipairs(((((requirement :: any).data or requirement).targets or {}) :: { any })) do
                targets[target.entry] = target.path
            end
            for _, id in ipairs({
                "kickside.kb10.migrations:01_kb10_schema",
                "kickside.kb10.migrations:04_maintenance_runs",
            }) do test.eq(targets[id], ".meta.target_db") end
            test.eq(targets["kickside.kb10:db_config"], ".meta.db_id")
        end)

        test.it("routes runtime SQL through a non-default target_db value", function()
            local seen = nil
            ops._modules = {
                registry = { get = function() return { meta = { db_id = "app:kb10-isolated" } }, nil end },
                sql = { get = function(id: string) seen = id; return { release = function() end }, nil end },
            }
            local db, err = ops.get_db()
            ops._modules = {}
            test.is_nil(err)
            test.not_nil(db)
            test.eq(seen, "app:kb10-isolated")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
