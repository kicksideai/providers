local test = require("test")
local batching = require("batching")

-- Regression: embedding must be sent to the provider in bounded batches so a
-- large document does not stall on a single oversized llm.embed call.

local function flatten(batches)
    local flat = {}
    for _, b in ipairs(batches) do
        for _, v in ipairs(b) do
            flat[#flat + 1] = v
        end
    end
    return flat
end

local function define_tests()
    test.describe("kb10 batching.split", function()
        test.it("splits into bounded batches with a partial tail", function()
            local items = {}
            for i = 1, 250 do items[i] = i end

            local batches = batching.split(items, 96)

            test.eq(#batches, 3)
            test.eq(#batches[1], 96)
            test.eq(#batches[2], 96)
            test.eq(#batches[3], 58)
        end)

        test.it("preserves order and loses no items", function()
            local items = {}
            for i = 1, 200 do items[i] = i end

            local flat = flatten(batching.split(items, 96))

            test.eq(#flat, 200)
            for i = 1, 200 do
                test.eq(flat[i], i)
            end
        end)

        test.it("returns a single batch when items fit", function()
            local batches = batching.split({ "a", "b", "c" }, 96)
            test.eq(#batches, 1)
            test.eq(#batches[1], 3)
        end)

        test.it("returns no batches for empty input", function()
            test.eq(#batching.split({}, 96), 0)
        end)

        test.it("clamps a non-positive size to one item per batch", function()
            local batches = batching.split({ "a", "b" }, 0)
            test.eq(#batches, 2)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
