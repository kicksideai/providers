local test = require("test")
local api = require("api")

local function define_tests()
    test.describe("Fireflies API client", function()
        test.it("builds authenticated headers", function()
            local headers = api.headers("ff-key")
            test.eq(headers["Authorization"], "Bearer ff-key")
            test.eq(headers["Content-Type"], "application/json")
        end)

        test.it("builds a graphql request body with query + variables", function()
            local body = api.build_body("{ user { name } }", { id = "x" })
            test.is_true(body:find("query", 1, true) ~= nil, body)
            test.is_true(body:find("variables", 1, true) ~= nil, body)
        end)

        test.it("extracts a graphql errors message", function()
            test.eq(api.graphql_error({ errors = { { message = "Invalid API key" } } }), "Invalid API key")
        end)

        test.it("returns nil when there are no graphql errors", function()
            test.eq(api.graphql_error({ data = { user = {} } }), nil)
        end)

        test.it("maps http 401 to unauthorized", function()
            local msg, code = api.extract_http_error({ status_code = 401, body = "" })
            test.is_true(msg:find("unauthorized", 1, true) ~= nil, msg)
            test.eq(code, 401)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
