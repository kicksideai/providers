-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fixture = require("fixture")

local function define_tests()
    test.describe("memory contract bindings", function()
        test.it("reports idle maintenance before a consolidation run exists", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local db = fixture.db()
            local _, delete_err = db:execute("DELETE FROM kickside_memory_runs WHERE component_id = $1", { id })
            db:release()
            test.is_nil(delete_err, tostring(delete_err))
            local status, status_err = fixture.call_as(user,
                "kickside.memory.engine:maintenance_status_func", {}, { component_id = id })
            test.is_nil(status_err, tostring(status_err))
            test.is_nil(status.resummarize)
            test.is_nil(status.reembed)
        end)

        test.it("rejects malformed query pagination at the registered binding", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            for _, request in ipairs({
                { query = "tea", limit = "again" },
                { query = "tea", limit = 1.5 },
                { query = "tea", offset = "again" },
                { query = "tea", offset = 1.5 },
            }) do
                local result, err = fixture.call_as(user,
                    "kickside.memory.engine:query_func", request, { component_id = id })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
