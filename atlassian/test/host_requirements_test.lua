local test = require("test")
local registry = require("registry")

local function define_tests()
    test.describe("Host requirements", function()
        test.it("leaves the UI server to the host and declares its resource kind", function()
            local requirement, err = registry.get("kickside.atlassian:ui_server")
            test.is_nil(err)
            test.is_nil(requirement.data.default)
            test.eq(requirement.meta.value_kind, "http.service")
        end)
    end)
end

local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
