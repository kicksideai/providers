local test = require("test")
local registry = require("registry")

local function define_tests()
    test.describe("Host requirements", function()
        test.it("declares process, router and server value kinds and default bindings", function()
            local requirements = {
                { id = "kickside.mcp_client:process_host", kind = "process.host", default = "app:processes" },
                { id = "kickside.mcp_client:api_router", kind = "http.router", default = "app:api" },
                { id = "kickside.mcp_client:ui_server", kind = "http.service", default = "app:gateway" },
            }
            for _, expected in ipairs(requirements) do
                local requirement, err = registry.get(expected.id)
                test.is_nil(err)
                test.eq(requirement.data.default, expected.default)
                test.eq(requirement.meta.value_kind, expected.kind)
            end
        end)
    end)
end

local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
