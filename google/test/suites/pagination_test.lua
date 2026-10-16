local test = require("test")
local pagination = require("pagination")

local function define_tests()
    test.describe("Google service pagination", function()
        test.it("uses defaults when max_results is omitted", function()
            local value, err = pagination.page_size(nil, 20, 100, "max_results")
            test.is_nil(err)
            test.eq(value, "20")
        end)

        test.it("accepts bounded integer page sizes", function()
            local value, err = pagination.page_size(30, 20, 100, "max_results")
            test.is_nil(err)
            test.eq(value, "30")
        end)

        test.it("rejects malformed and out-of-range values", function()
            local _, string_err = pagination.page_size("30", 20, 100, "max_results")
            test.contains(string_err, "max_results must be an integer")

            local _, fraction_err = pagination.page_size(1.5, 20, 100, "max_results")
            test.contains(fraction_err, "max_results must be an integer")

            local _, high_err = pagination.page_size(101, 20, 100, "max_results")
            test.contains(high_err, "max_results must be between 1 and 100")
        end)

        test.it("validates integer body parameters", function()
            local defaulted, default_err = pagination.integer(nil, 50, 1, 1000, "limit")
            test.is_nil(default_err)
            test.eq(defaulted, 50)

            local explicit, explicit_err = pagination.integer(25, 50, 1, 1000, "limit")
            test.is_nil(explicit_err)
            test.eq(explicit, 25)

            local _, string_err = pagination.integer("25", 50, 1, 1000, "limit")
            test.contains(string_err, "limit must be an integer")

            local _, high_err = pagination.integer(1001, 50, 1, 1000, "limit")
            test.contains(high_err, "limit must be between 1 and 1000")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
