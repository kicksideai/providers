local test = require("test")
local output = require("output")

local function define_tests()
    test.describe("PhantomBuster output redaction", function()
        test.it("redacts credential-shaped keys recursively", function()
            local decoded: any = output.sanitize({
                apiKey = "secret",
                nested = {
                    refresh_token = "token",
                    normal = "visible",
                },
            })
            test.eq(decoded.apiKey, "[redacted]")
            test.eq(decoded.nested.refresh_token, "[redacted]")
            test.eq(decoded.nested.normal, "visible")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
