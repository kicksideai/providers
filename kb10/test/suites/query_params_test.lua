local test = require("test")
local params = require("query_params")

local function req(query: { [string]: any }): any
    return {
        query = function(_self: any, key: string): any
            return query[key]
        end,
    }
end

local function define_tests()
    test.describe("kb10 API query params", function()
        test.it("parses optional bounded integer query params", function()
            local value, err = params.query_int(req({ limit = "25" }), "limit", 50, 1, 100)
            test.is_nil(err)
            test.eq(value, 25)

            local defaulted, derr = params.query_int(req({}), "limit", 50, 1, 100)
            test.is_nil(derr)
            test.eq(defaulted, 50)

            local blank_default, blank_err = params.query_int(req({ limit = "" }), "limit", 50, 1, 100)
            test.is_nil(blank_err)
            test.eq(blank_default, 50)

            local min_value, min_err = params.query_int(req({ limit = "1" }), "limit", 50, 1, 100)
            test.is_nil(min_err)
            test.eq(min_value, 1)

            local max_value, max_err = params.query_int(req({ limit = "100" }), "limit", 50, 1, 100)
            test.is_nil(max_err)
            test.eq(max_value, 100)
        end)

        test.it("rejects malformed and out-of-range integers", function()
            local _, malformed = params.query_int(req({ limit = "25.5" }), "limit", 50, 1, 100)
            test.contains(malformed, "limit must be an integer")

            local _, alpha = params.query_int(req({ limit = "abc" }), "limit", 50, 1, 100)
            test.contains(alpha, "limit must be an integer")

            local _, scientific = params.query_int(req({ limit = "1e2" }), "limit", 50, 1, 100)
            test.contains(scientific, "limit must be an integer")

            local _, hex = params.query_int(req({ limit = "0x10" }), "limit", 50, 1, 100)
            test.contains(hex, "limit must be an integer")

            local _, spaced = params.query_int(req({ limit = " 42 " }), "limit", 50, 1, 100)
            test.contains(spaced, "limit must be an integer")

            local _, high = params.query_int(req({ limit = "101" }), "limit", 50, 1, 100)
            test.contains(high, "limit must be between 1 and 100")

            local _, low = params.query_int(req({ limit = "0" }), "limit", 50, 1, 100)
            test.contains(low, "limit must be between 1 and 100")

            local _, min_only = params.query_int(req({ offset = "-1" }), "offset", 0, 0, nil)
            test.contains(min_only, "offset must be >= 0")

            local _, max_only = params.query_int(req({ depth = "11" }), "depth", 2, nil, 10)
            test.contains(max_only, "depth must be <= 10")
        end)

        test.it("writes canonical bad request response shape", function()
            local status
            local payload
            local res = {
                set_status = function(_self: any, value: any)
                    status = value
                end,
                write_json = function(_self: any, value: any)
                    payload = value
                end,
            }

            params.bad_request(res, "limit must be an integer")

            test.eq(status, 400)
            test.eq(payload.success, false)
            test.eq(payload.error, "limit must be an integer")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
