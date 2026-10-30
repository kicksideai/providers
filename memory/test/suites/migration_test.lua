-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function define_tests()
    test.describe("memory schema", function()
        test.it("stores typed memories in the current schema", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local added = fixture.create_claim(user, id, "Oslo")
            test.eq(fixture.items(user, id)[1].id, added.item_id)
            test.eq(fixture.count_rows("kickside_memory_run_sources", id), 0)
            local _, err = fixture.op(user, "migration_query", { database_id = "app:db",
                statement = "SELECT owner_scope_key FROM kickside_memory_cursors UNION ALL SELECT cycle FROM kickside_memory_runs" })
            test.is_nil(err, tostring(err))
        end)

        test.it("creates storage without access to other modules' databases", function()
            local user = fixture.user()
            for _, name in ipairs({"01_memory_schema", "05_memory_upgrade"}) do
                local result, err = fixture.op(user, "migrate", { name = name, id = name })
                test.is_nil(err, tostring(err))
                test.eq(result.failed, 0, result.error)
            end
            local rows, err = fixture.op(user, "migration_query", {
                statement = "SELECT id FROM kickside_memory_keys UNION ALL SELECT cycle FROM kickside_memory_runs UNION ALL SELECT embedding FROM kickside_memory_payloads",
            })
            test.is_nil(err, tostring(err))
            test.eq(#rows, 0)
            local applied, apply_err = fixture.op(user, "migrate", { name = "05_memory_upgrade", id = "05_memory_upgrade" })
            test.is_nil(apply_err, tostring(apply_err))
            test.eq(applied.failed, 0, applied.error)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
