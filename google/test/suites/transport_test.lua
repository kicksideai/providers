local test = require("test")
local transport = require("transport")

local function define_tests()
    test.describe("Google transport", function()
        test.it("percent-encodes reserved characters in a segment", function()
            test.eq(transport.encode_segment("a b"), "a%20b")
            test.eq(transport.encode_segment("mimeType='x'"), "mimeType%3D%27x%27")
            test.eq(transport.encode_segment("Sheet1!A1:C10"), "Sheet1%21A1%3AC10")
        end)

        test.it("leaves unreserved characters untouched", function()
            test.eq(transport.encode_segment("aZ0-_.~"), "aZ0-_.~")
        end)

        test.it("builds a query string with encoded values", function()
            test.eq(transport.build_url("https://x/y"), "https://x/y")
            test.eq(transport.build_url("https://x/y", { q = "a b" }), "https://x/y?q=a%20b")
        end)

        test.it("extracts a Google JSON error message", function()
            local body = '{"error":{"code":403,"message":"Insufficient Permission"}}'
            local msg, code = transport.extract_error({ status_code = 403, body = body })
            test.eq(msg, "Insufficient Permission")
            test.eq(code, 403)
        end)

        test.it("returns the whole raw body and the error body of a non-JSON error", function()
            local raw = string.rep("upstream proxy failure ", 40)
            local message, status, data = transport.extract_error({ status_code = 502, body = raw })
            test.eq(message, raw)
            test.eq(status, 502)
            test.eq(data, raw)
            local json_message, _, json_data = transport.extract_error({ status_code = 404, body = '{"error":{"code":404,"message":"File not found"}}' })
            test.eq(json_message, "File not found")
            test.eq(json_data.error.code, 404)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
