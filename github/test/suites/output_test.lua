local test = require("test")
local output = require("output")

local function define_tests()
    test.describe("GitHub output", function()
        test.it("redacts sensitive keys recursively", function()
            local decoded: any = output.sanitize({
                token = "secret",
                nested = {
                    Authorization = "Bearer secret",
                    ok = "visible",
                },
            })
            test.eq(decoded.token, "[redacted]")
            test.eq(decoded.nested.Authorization, "[redacted]")
            test.eq(decoded.nested.ok, "visible")
        end)

        test.it("replaces circular references", function()
            local t: any = { name = "loop" }
            t.self = t
            local decoded: any = output.sanitize(t)
            test.eq(decoded.self, "[circular]")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
