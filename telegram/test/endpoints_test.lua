local test = require("test")
local registry = require("registry")
local function define_tests()
    test.describe("Instance endpoints", function()
        test.it("declares official defaults through namespace requirements", function()
            local r = registry.get("kickside.telegram:endpoint_api")
            test.not_nil(r)
            test.eq(r.data.default, "https://api.telegram.org")
            test.is_true(#r.data.targets > 0)
        end)
    end)
end
local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
