local test = require("test")
local data_error = require("data_error")

local function define_tests()
    test.describe("Discord DataError mapping", function()
        test.it("preserves native shared-capacity metadata alongside published DataError fields", function()
            local result = {success = false, error = "paced", status_code = 429, retry_after_ms = 2500,
                kind = errors.RATE_LIMITED, retryable = true,
                details = {code = "provider_capacity", scope = "capacity", retry_at_ms = 1893456000123}}
            local env = data_error.from_result(result, "list messages")
            test.eq(env.error.code, "rate_limited")
            test.eq(env.error.scope, "provider")
            test.eq(env.retry_after_ms, 2500)
            test.eq(env.error.kind, errors.RATE_LIMITED)
            test.eq(env.error.retryable, true)
            test.eq(env.error.details.code, "provider_capacity")
            test.eq(env.error.details.retry_at_ms, 1893456000123)
        end)

        test.it("maps a 429 to rate_limited with the provider wait on the top level", function()
            local env = data_error.from_result({ success = false, error = "rate limited", status_code = 429, retry_after_ms = 2500 }, "list messages")
            test.eq(env.success, false)
            test.eq(env.error.code, "rate_limited")
            test.eq(env.error.retriable, true)
            test.eq(env.error.scope, "provider")
            test.eq(env.retry_after_ms, 2500)
        end)

        test.it("defaults the 429 wait when the client attached none", function()
            local env = data_error.from_result({ success = false, error = "rate limited", status_code = 429 }, "list messages")
            test.eq(env.error.code, "rate_limited")
            test.eq(env.retry_after_ms, 1000)
        end)

        test.it("maps 401 to auth_expired on the connection scope", function()
            local env = data_error.from_result({ success = false, error = "unauthorized", status_code = 401 }, "list messages")
            test.eq(env.error.code, "auth_expired")
            test.eq(env.error.scope, "connection")
            test.eq(env.error.auth_expired, true)
            test.is_nil(env.retry_after_ms, "a non-429 failure must not carry retry_after_ms")
        end)

        test.it("maps 403/404 to non-retriable flow-scoped errors", function()
            local forbidden = data_error.from_result({ success = false, error = "forbidden", status_code = 403 }, "send message")
            test.eq(forbidden.error.code, "permission_denied")
            test.eq(forbidden.error.retriable, false)
            test.eq(forbidden.error.scope, "flow")

            local missing = data_error.from_result({ success = false, error = "not found", status_code = 404 }, "send message")
            test.eq(missing.error.code, "not_found")
            test.eq(missing.error.retriable, false)
        end)

        test.it("maps 5xx and transport failures to retriable provider faults", function()
            local down = data_error.from_result({ success = false, error = "bad gateway", status_code = 502 }, "list messages")
            test.eq(down.error.code, "provider_unavailable")
            test.eq(down.error.retriable, true)

            local net = data_error.from_result({ success = false, error = "connection refused" }, "list messages")
            test.eq(net.error.code, "provider_error")
            test.eq(net.error.retriable, true)
            test.eq(net.error.scope, "provider")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
