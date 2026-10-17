local test = require("test")
local registry = require("registry")
local function define_tests()
    test.describe("Instance endpoints", function()
        test.it("declares the external endpoint default through a namespace requirement", function()
            local r = registry.get("kickside.webscout:endpoint_api")
            test.not_nil(r)
            test.eq(r.data.default, "https://www.googleapis.com/customsearch/v1")
            test.is_true(#r.data.targets > 0)
        end)

        test.it("leaves routers and servers to the host with typed requirements", function()
            local router = registry.get("kickside.webscout:api_router")
            test.is_nil(router.data.default)
            test.eq(router.meta.value_kind, "http.router")

            local server = registry.get("kickside.webscout:ui_server")
            test.is_nil(server.data.default)
            test.eq(server.meta.value_kind, "http.service")
        end)
    end)
end
local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
