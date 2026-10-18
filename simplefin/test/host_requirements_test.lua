local test = require("test")
local registry = require("registry")

local function define_tests()
    test.describe("Host requirements", function()
        test.it("declares router and server value kinds and default bindings", function()
            local router, router_err = registry.get("kickside.simplefin:api_router")
            test.is_nil(router_err)
            test.eq(router.data.default, "app:api")
            test.eq(router.meta.value_kind, "http.router")

            local server, server_err = registry.get("kickside.simplefin:ui_server")
            test.is_nil(server_err)
            test.eq(server.data.default, "app:gateway")
            test.eq(server.meta.value_kind, "http.service")
        end)
    end)
end

local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
