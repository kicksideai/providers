local test = require("test")
local registry = require("registry")

local function define_tests()
    test.describe("Host requirements", function()
        test.it("leaves process, router, and server choices to the host", function()
            local requirements = {
                { id = "kickside.mcp_client:process_host", kind = "process.host" },
                { id = "kickside.mcp_client:api_router", kind = "http.router" },
                { id = "kickside.mcp_client:ui_server", kind = "http.service" },
            }
            for _, expected in ipairs(requirements) do
                local requirement, err = registry.get(expected.id)
                test.is_nil(err)
                test.is_nil(requirement.data.default)
                test.eq(requirement.meta.value_kind, expected.kind)
            end
        end)
    end)
end

local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
