local test = require("test")
local api = require("api")

local function define_tests()
    test.describe("PhantomBuster API client", function()
        test.it("builds authenticated headers without leaking alternate keys", function()
            local headers = api.headers("pb-key")
            test.eq(headers["X-Phantombuster-Key"], "pb-key")
            test.eq(headers["Accept"], "application/json")
        end)

        test.it("encodes query parameters", function()
            local url = api.build_url("/api/v2/agents/fetch", { id = "agent 1" })
            test.is_true(url:find("id=agent%%201") ~= nil, url)
        end)

        test.it("extracts common provider errors", function()
            local msg, code = api.extract_error({ status_code = 401, body = "" })
            test.eq(msg, "unauthorized")
            test.eq(code, 401)

            msg, code = api.extract_error({ status_code = 500, body = '{"message":"boom"}' })
            test.eq(msg, "boom")
            test.eq(code, 500)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
