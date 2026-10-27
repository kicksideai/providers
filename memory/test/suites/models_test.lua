-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function candidate(key: string, value: string): any
    return fixture.candidate("profile_slot", key, value, "The user states an attribute.", "event", nil, "single")
end

local function define_tests()
    test.describe("bounded untrusted memory model output", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("rejects truncated output at every structured step even when JSON is complete", function()
            local user = fixture.user()
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                for _, data in ipairs({ { items = {}, plans = {}, mappings = {}, action = "ADD", target_ids = {} }, '{"items":[' }) do
                    fixture.script.respond("structured_output", data, "length")
                    local result, err = fixture.op(user, "model_step", { step = step,
                        span = { { id = "event", role = "user", text = "I live in Oslo." } },
                        candidates = { candidate("home_city", "Oslo") }, candidate = candidate("home_city", "Oslo"),
                        items = { { id = "a", kind = "fact", key = "a", content = "First source." },
                            { id = "b", kind = "fact", key = "b", content = "Second source." } },
                    })
                    test.is_nil(result)
                    test.not_nil(err)
                    test.is_true(tostring(err):find("truncated", 1, true) ~= nil, tostring(err))
                end
            end
            for _, prompt in ipairs(fixture.script.prompts("structured_output")) do
                test.is_true(prompt.system:find("one compact JSON object on one line", 1, true) ~= nil)
            end
            for _, options in ipairs(fixture.script.requests("structured_options")) do
                test.is_true(type(options.max_tokens) == "number" and options.max_tokens > 0 and options.max_tokens < 10000)
            end
        end)

        test.it("classifies incomplete JSON reported by a provider before response decoding", function()
            local user = fixture.user()
            fixture.script.fail("structured_output", "Model failed to return valid JSON", errors.NOT_FOUND, false,
                { error_type = "model_error", raw_content = '{"items":[' })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "event", role = "user", text = "I live in Oslo." },
            } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:details().code, "model_output_malformed")
            test.eq(err:kind(), errors.INVALID)
            test.is_false(err:retryable())
        end)

        test.it("returns no reflection when fewer than two source memories exist", function()
            local user = fixture.user()
            for _, items in ipairs({ {}, { { id = "one", kind = "fact", key = "home_city", content = "Lives in Oslo." } } }) do
                local result, err = fixture.op(user, "model_step", { step = "reflect", items = items })
                test.is_nil(err, tostring(err))
                test.eq(#result.items, 0)
            end
            test.eq(#fixture.script.requests("structured_output"), 0)
        end)

        test.it("sizes output budgets by the bounded result schema and mapping count", function()
            local user = fixture.user()
            local one = candidate("home_city", "Oslo")
            fixture.normalization({ one })
            local first, first_err = fixture.op(user, "model_step", { candidates = { one } })
            test.is_nil(first_err, tostring(first_err))
            local two = candidate("pet_name", "Fennel")
            fixture.normalization({ one, two })
            local second, second_err = fixture.op(user, "model_step", { candidates = { one, two } })
            test.is_nil(second_err, tostring(second_err))
            local options = fixture.script.requests("structured_options")
            test.is_true(options[2].max_tokens > options[1].max_tokens)
            local schemas = fixture.script.requests("structured_output")
            test.is_true(schemas[1].properties.mappings.properties["1"].maxItems > 0)
            test.eq(#first.items, 1)
            test.eq(#second.items, 2)
        end)

        test.it("fails malformed whole responses instead of accepting an empty batch", function()
            local user = fixture.user()
            for _, data in ipairs({ '{"items":[', { items = "invalid", plans = {} }, { items = { invalid = true }, plans = {} } }) do
                fixture.script.respond("structured_output", data)
                local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "event", role = "user", text = "I live in Oslo." } } })
                test.is_nil(result)
                test.not_nil(err)
            end
        end)

        test.it("rejects invalid extraction candidates independently with content-free counts", function()
            local user = fixture.user()
            fixture.script.respond("structured_output", { items = {
                candidate("home_city", "Oslo"), candidate("private_value", "private value"),
                { kind = "unknown", key = "bad", content = "Private text" },
            }, plans = {} })
            fixture.normalization({ candidate("home_city", "Oslo") })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "event", role = "user", text = "I live in Oslo." } } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 1)
            test.eq(result.stats.rejected, 2)
            test.eq(result.stats.rejected_extraction_topic_key, 1)
            test.eq(result.stats.rejected_extraction_shape, 1)
        end)

        test.it("keeps valid mapping parts and candidates when others violate topic rules", function()
            local user = fixture.user()
            fixture.script.respond("structured_output", { mappings = {
                ["1"] = { { kind = "profile_slot", cardinality = "single", key = "private_value", value = "private value", content = "Private text" },
                    { kind = "profile_slot", cardinality = "single", key = "home_city", value = "Oslo", content = "The user lives in Oslo." } },
                ["2"] = { { kind = "profile_slot", cardinality = "single", key = "pet_name", value = "Fennel", content = "The cat is Fennel." } },
            } })
            local result, err = fixture.op(user, "model_step", { candidates = { candidate("home_city", "Oslo"), candidate("pet_name", "Fennel") } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 2)
            test.eq(result.stats.rejected, 1)
            test.eq(result.stats.rejected_normalization_topic_key, 1)
        end)

        test.it("rejects ungrounded and invalid reflection lessons without losing valid guidance", function()
            local user = fixture.user()
            local good = fixture.candidate("lesson", "travel_guidance", "plan accessible routes", "Suggest accessible routes.")
            good.based_on = { 1, 2 }
            local bad = fixture.candidate("lesson", "private_value", "private value", "Private text")
            bad.based_on = { 1, 2 }
            local ungrounded = fixture.candidate("lesson", "route_guidance", "use step-free routes", "Suggest step-free routes.")
            ungrounded.based_on = { 1, 1 }
            fixture.script.respond("structured_output", { items = { good, bad, ungrounded } })
            fixture.normalization({ good })
            local result, err = fixture.op(user, "model_step", { step = "reflect", items = {
                { id = "a", kind = "profile_slot", key = "mobility", content = "Uses a wheelchair." },
                { id = "b", kind = "plan", key = "trip", content = "Plans a train journey." },
            } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 1)
            test.eq(result.stats.rejected, 2)
            test.eq(result.stats.rejected_reflection_topic_key, 1)
            test.eq(result.stats.rejected_reflection_grounding, 1)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
