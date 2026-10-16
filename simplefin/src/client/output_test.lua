local test = require("test")
local output = require("output")

local function define_tests()
    test.describe("SimpleFIN tool output", function()
        test.it("redacts credential-bearing keys, including the access URL", function()
            local decoded: any = output.sanitize({
                access_url = "https://u:p@bridge/simplefin",
                setup_token = "abc",
                authorization = "Basic x",
                nested = { api_key = "k", balance = "1.00" },
            })
            test.eq(decoded.access_url, "[redacted]")
            test.eq(decoded.setup_token, "[redacted]")
            test.eq(decoded.authorization, "[redacted]")
            test.eq(decoded.nested.api_key, "[redacted]")
            test.eq(decoded.nested.balance, "1.00")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
