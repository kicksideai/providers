-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local eval = require("eval")

local function define_tests()
    test.describe("memory capture and reconcile eval", function()
        test.it("takes the expected action on every case", function()
            local target = eval.target()
            local rows, scores = eval.run(target)
            local misses = 0
            for _, row in ipairs(rows) do if row.actual ~= row.expected then misses = misses + 1 end end
            test.eq(misses, 0, eval.report(target, rows, scores))
        end)

        test.it("classifies a derive run by the strongest change it made", function()
            test.eq(eval.classify({ added = 1, conflicted = 1 }), "CONFLICT")
            test.eq(eval.classify({ added = 1, superseded = 1 }), "SUPERSEDE")
            test.eq(eval.classify({ added = 1, merged = 1 }), "DEDUPE")
            test.eq(eval.classify({ added = 1, noop = 1 }), "ADD")
            test.eq(eval.classify({ noop = 2 }), "DEDUPE")
            test.eq(eval.classify({ candidates = 0 }), "IGNORE")
        end)

        test.it("scores precision and recall per action", function()
            local scores = eval.score({
                { expected = "ADD", actual = "ADD" }, { expected = "DEDUPE", actual = "ADD" },
                { expected = "DEDUPE", actual = "DEDUPE" }, { expected = "IGNORE", actual = "IGNORE" },
            })
            test.eq(scores.ADD.precision, 0.5)
            test.eq(scores.ADD.recall, 1)
            test.eq(scores.DEDUPE.precision, 1)
            test.eq(scores.DEDUPE.recall, 0.5)
            test.is_nil(scores.CONFLICT.precision)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
