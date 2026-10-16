local test = require("test")
local api = require("api")

local function define_tests()
    test.describe("Slack API client", function()
        test.it("builds bearer-token headers", function()
            local headers = api.headers("xoxb-token")
            test.eq(headers["Authorization"], "Bearer xoxb-token")
            test.eq(headers["Accept"], "application/json")
            test.eq(headers["Content-Type"], "application/x-www-form-urlencoded")
        end)

        test.it("form-encodes params, percent-escaping values and skipping nils", function()
            local body = api.encode_form({ channel = "C 1", text = "a&b" } :: { [string]: any })
            test.is_true(body:find("channel=C%201", 1, true) ~= nil, body)
            test.is_true(body:find("text=a%26b", 1, true) ~= nil, body)
        end)

        test.it("encodes a single component", function()
            test.eq(api.encode_component("a b&c"), "a%20b%26c")
        end)

        test.it("extracts the Slack error code from the body, else a status fallback", function()
            test.eq(api.extract_error({ ok = false, error = "channel_not_found" }, 200), "channel_not_found")
            test.eq(api.extract_error({ ok = false }, 429), "rate limited")
            test.eq(api.extract_error(nil, 401), "unauthorized")
            test.eq(api.extract_error(nil, 500), "request failed")
        end)

        test.it("reads the 429 retry window from the Retry-After header", function()
            test.eq(api.retry_after_ms({ headers = { ["Retry-After"] = "2" } }), 2000)
            test.eq(api.retry_after_ms({ headers = { ["retry-after"] = "3" } }), 3000)
        end)

        test.it("clamps a missing or absurd retry window to a sane range", function()
            test.eq(api.retry_after_ms({}), 1000)                                  -- default 1s
            test.eq(api.retry_after_ms({ headers = { ["Retry-After"] = "9999" } }), 60000) -- capped at 60s
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
