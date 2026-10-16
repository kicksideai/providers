local test = require("test")
local registry = require("registry")
local transport = require("transport")
local function connection(failure: string?): (any, any)
    local state: any = { reads = 0, refreshes = 0 }
    local conn = {}
    function conn:get_access_token(request: any): (any?, any?)
        state.reads = state.reads + 1
        if request and request.rejected_access_token then
            state.refreshes = state.refreshes + 1
            test.eq(request.rejected_access_token, "old")
            if failure then return { success = false, error = failure }, nil end
            return { success = true, access_token = "fresh", token_type = "Bearer" }, nil
        end
        return { success = true, access_token = "old", token_type = "Bearer" }, nil
    end
    return conn, state
end
local function endpoint(mode: string): string
    local entry, err = registry.get("app:token_retry_server")
    test.is_nil(err)
    test.not_nil(entry)
    local port = tostring(entry.data.addr):match(":(%d+)$")
    test.not_nil(port)
    return "http://127.0.0.1:" .. port .. "/test/" .. mode
end
local function define_tests()
    test.describe("Google API 401 refresh", function()
        test.it("refreshes through the OAuth connection and retries a rejected GET once", function()
            local conn, state = connection()
            local result = transport.get(conn, endpoint("success"))
            test.is_true(result.success, tostring(result.error))
            test.is_true(result.data.authenticated)
            test.eq(state.refreshes, 1); test.eq(state.reads, 2)
        end)
        test.it("applies the same single refresh to raw responses and writes", function()
            local conn, state = connection()
            local result = transport.get_raw(conn, endpoint("raw"))
            test.is_true(result.success); test.eq(result.data.text, "exported")
            test.eq(state.refreshes, 1)
            conn, state = connection()
            result = transport.post(conn, endpoint("success"), { message = "hello" })
            test.is_true(result.success); test.eq(result.data.method, "POST")
            test.eq(state.refreshes, 1)
        end)
        test.it("returns a second 401 without another refresh or retry", function()
            local conn, state = connection()
            local result = transport.get(conn, endpoint("always-unauthorized"))
            test.is_false(result.success); test.eq(result.status_code, 401)
            test.eq(state.refreshes, 1); test.eq(state.reads, 2)
        end)
        test.it("keeps a refresh failure visible and does not replay the API request", function()
            local conn, state = connection("refresh temporarily unavailable")
            local result, err = transport.get(conn, endpoint("success"))
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(err:message(), "refresh temporarily unavailable")
            test.eq(state.refreshes, 1); test.eq(state.reads, 2)
        end)
        test.it("returns a visible transport error when the retried request fails on the network", function()
            local conn, state = connection()
            local result, err = transport.get(conn, endpoint("retry-network-error"))
            test.is_nil(result)
            test.not_nil(err:kind())
            test.contains(err:message(), "unexpected EOF")
            test.eq(state.refreshes, 1); test.eq(state.reads, 2)
        end)
        test.it("does not refresh a permission failure", function()
            local conn, state = connection()
            local result = transport.get(conn, endpoint("forbidden"))
            test.is_false(result.success); test.eq(result.status_code, 403)
            test.eq(state.refreshes, 0); test.eq(state.reads, 1)
        end)
    end)
end
return { run = test.run_cases(define_tests) }
