-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local function define_tests()
    test.describe("standalone Memory installation", function()
        test.it("declares its host resources and dependencies", function()
            local requirements = assert(registry.find({[".kind"] = "ns.requirement"}))
            local found = 0
            local resources = {["kickside.memory:ui_server"] = true, ["kickside.memory:api_router"] = true, ["kickside.memory:target_db"] = true}
            for _, entry in ipairs(requirements) do
                local id = tostring(entry.id)
                if id:sub(1, #"kickside.memory:") == "kickside.memory:" then
                    found = found + 1
                    test.is_true(resources[id] == true, id)
                end
            end
            test.eq(found, 3)
            local dependencies = assert(registry.find({[".kind"] = "ns.dependency"}))
            local expected = {["wippy/agent"] = true, ["wippy/llm"] = true,
                ["kickside/component"] = true, ["kickside/contract"] = true,
                ["wippy/migration"] = true, ["kickside/core"] = true, ["kickside/jobs"] = true,
                ["kickside/execution"] = true, ["kickside/knowledge"] = true, ["kickside/search-index"] = true}
            local total = 0
            for _, entry in ipairs(dependencies) do
                if tostring(entry.id):sub(1, #"kickside.memory:") == "kickside.memory:" then
                    test.is_true(expected[entry.data.component] == true, tostring(entry.data.component))
                    total = total + 1
                end
            end
            test.eq(total, 10)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
