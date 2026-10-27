-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function candidate(key: string, value: string): any
    return fixture.candidate("profile_slot", key, value, "The user states an attribute.", "event", nil, "single")
end

local function codepoints(text: string): integer
    local _, count = text:gsub("[^\128-\191]", "")
    return count
end

local function maximal(node: any): any
    if node.enum then
        local value = node.enum[1]
        for _, option in ipairs(node.enum) do
            if #json.encode(option) > #json.encode(value) then value = option end
        end
        return value
    elseif node.type == "object" then
        test.eq(node.additionalProperties, false)
        local value = {}
        for key, child in pairs(node.properties) do value[key] = maximal(child) end
        return value
    elseif node.type == "array" then
        test.is_true(type(node.maxItems) == "number", "Array has no finite bound")
        local value = {}
        for i = 1, node.maxItems do value[i] = maximal(node.items) end
        return value
    elseif node.type == "string" then
        test.is_true(type(node.maxLength) == "number", "String has no finite bound")
        if node.pattern then return string.rep("a", node.maxLength) end
        return string.rep("界", node.maxLength)
    elseif node.type == "number" then
        test.eq(node.minimum, 0)
        test.eq(node.maximum, 1)
        return 0.12345678901234567
    end
    error("Unexpected result schema type: " .. tostring(node.type))
end

local function define_tests()
    test.describe("bounded untrusted memory model output", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("extracts canonical independent attributes in one call while reusing existing keys", function()
            local user = fixture.user()
            local city = candidate("residence", "Oslo")
            local job = candidate("occupation", "engineer")
            fixture.script.respond("structured_output", { items = { city, job }, plans = {} })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "event", role = "user", text = "I live in Oslo and work as an engineer." },
            }, keys = { { key = "residence", kind = "profile_slot", cardinality = "single", value = "Paris", content = "Lives in Paris." } } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 2)
            test.eq(result.items[1].key, "residence")
            test.eq(result.items[1].value, "Oslo")
            test.eq(result.items[2].key, "occupation")
            test.eq(result.items[2].event_id, "event")
            test.eq(#fixture.script.requests("structured_output"), 1)
            local request = fixture.script.requests("structured_output")[1]
            test.eq(request.properties.items.items.properties.key.pattern, "^[a-z][a-z0-9_]{0,63}$")
            local prompt = fixture.script.prompts("structured_output")[1]
            test.is_true(prompt.system:find("residence (single)", 1, true) ~= nil)
            test.is_true(prompt.system:find("independently", 1, true) ~= nil)
        end)

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
            test.is_true(options[2].max_tokens > options[1].max_tokens, json.encode(options))
            local schemas = fixture.script.requests("structured_output")
            test.eq(schemas[1].properties.mappings.properties["1"].maxItems, 4)
            test.eq(schemas[1].properties.mappings.properties["1"].items.properties.value.maxLength, 160)
            test.eq(#first.items, 1)
            test.eq(#second.items, 2)
        end)

        test.it("budgets cover maximum compact results for every structured call at extraction capacity", function()
            local user = fixture.user()
            local span, candidates, sources = {}, {}, {}
            local event_id = string.rep("e", 36)
            local capacity, capacity_err = fixture.op(user, "extraction_capacity", { span = { { id = event_id, role = "user" } } })
            test.is_nil(capacity_err, tostring(capacity_err))
            for i = 1, capacity do
                span[i] = { id = event_id, role = "user", text = "An attribute." }
                candidates[i] = candidate("attribute_" .. tostring(i), "An attribute")
            end
            for i = 1, 2 * capacity do sources[i] = { id = "source-" .. tostring(i), kind = "fact", key = "attribute", content = "An attribute." } end
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                fixture.script.respond("structured_output", {}, "length")
                local _, err = fixture.op(user, "model_step", { step = step, span = span, candidates = candidates,
                    candidate = candidates[1], items = sources })
                test.not_nil(err)
                test.eq(err:details().code, "model_output_truncated")
                local schemas = fixture.script.requests("structured_output")
                local options = fixture.script.requests("structured_options")
                local schema = schemas[#schemas]
                local answer = maximal(schema)
                local budget = options[#options].max_tokens
                test.is_true(budget >= codepoints(json.encode(answer)), step .. " budget cannot cover maximum compact result")
                if step == "extract" then
                    test.eq(schema.properties.items.maxItems, capacity * 4)
                    test.eq(schema.properties.plans.maxItems, capacity)
                elseif step == "reflect" then
                    test.eq(schema.properties.items.maxItems, math.min(4, capacity))
                    test.eq(schema.properties.items.items.properties.based_on.maxItems, #sources)
                elseif step == "judge" then test.eq(schema.properties.target_ids.maxItems, #sources) end
            end
            span[#span + 1] = span[1]
            local before = #fixture.script.requests("structured_output")
            local result, err = fixture.op(user, "model_step", { step = "extract", span = span })
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("output limit", 1, true) ~= nil)
            test.eq(#fixture.script.requests("structured_output"), before)
        end)

        test.it("fails visibly on strings and arrays exceeding the supplied schema bounds", function()
            local user = fixture.user()
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                for _, overflow in ipairs({ "string", "array" }) do
                    local city = candidate("home_city", "Oslo")
                    local data = { items = { city }, plans = {} }
                    if step == "normalize" then
                        data = { mappings = { ["1"] = { { kind = city.kind, key = city.key, cardinality = city.cardinality, value = city.value, content = city.content } } } }
                    elseif step == "reflect" then
                        data = { items = { city } }
                        city.kind = "lesson"; city.cardinality = "multi"; city.event_id = ""; city.based_on = { 1, 2 }
                    elseif step == "judge" then data = { action = "ADD", reason = "Distinct attribute.", target_ids = {} } end
                    if overflow == "string" then
                        if step == "judge" then data.reason = string.rep("x", 193)
                        elseif step == "normalize" then data.mappings["1"][1].content = string.rep("x", 241)
                        else city.content = string.rep("x", 241) end
                    else
                        if step == "judge" then data.target_ids = { "a", "a", "a" }
                        elseif step == "normalize" then
                            for i = 2, 5 do data.mappings["1"][i] = data.mappings["1"][1] end
                        else
                            for i = 2, 5 do data.items[i] = city end
                        end
                    end
                    fixture.script.respond("structured_output", data)
                    local result, err = fixture.op(user, "model_step", { step = step,
                        span = { { id = "event", role = "user", text = "I live in Oslo." } },
                        candidates = { candidate("home_city", "Oslo") }, candidate = candidate("home_city", "Oslo"),
                        neighbors = { { id = "a", kind = "fact", key = "home_city", content = "Lives in Oslo." } },
                        items = { { id = "a", kind = "fact", key = "home_city", content = "Lives in Oslo." },
                            { id = "b", kind = "fact", key = "mobility", content = "Uses trains." } },
                    })
                    test.is_nil(result, step .. " accepts " .. overflow .. " overflow")
                    test.not_nil(err)
                    test.eq(err:details().code, "model_output_malformed")
                end
            end
        end)

        test.it("rejects extraction models unable to hold one statement on creation and update", function()
            local user = fixture.user()
            local id, create_err = fixture.try_memory(user, { extraction_model = "test-small" })
            test.is_nil(id)
            test.not_nil(create_err)
            test.is_true(tostring(create_err):find("one statement", 1, true) ~= nil, tostring(create_err))
            id = fixture.memory(user)
            local updated, update_err = fixture.op(user, "update_config", { component_id = id, config = { extraction_model = "test-small" } })
            test.is_nil(updated)
            test.not_nil(update_err)
            test.is_true(tostring(update_err):find("one statement", 1, true) ~= nil, tostring(update_err))
            local stored = fixture.op(user, "store", { component_id = id })
            test.is_true(stored.config.extraction_model ~= "test-small")
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
            local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "event", role = "user", text = "I live in Oslo." } } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 1)
            test.eq(result.stats.rejected, 2)
            test.eq(result.stats.rejected_extraction_topic_key, 1)
            test.eq(result.stats.rejected_extraction_shape, 1)
        end)

        test.it("rejects non-string mapping keys before canonicalizing them", function()
            local user = fixture.user()
            fixture.script.respond("structured_output", { mappings = { ["1"] = {
                { kind = "profile_slot", cardinality = "single", key = {}, value = "Oslo", content = "Lives in Oslo." },
                { kind = "profile_slot", cardinality = "single", key = true, value = "Oslo", content = "Lives in Oslo." },
                { kind = "profile_slot", cardinality = "single", key = 123, value = "Oslo", content = "Lives in Oslo." },
                { kind = "profile_slot", cardinality = "single", key = "home_city", value = "Oslo", content = "Lives in Oslo." },
            } } })
            local result, err = fixture.op(user, "model_step", { candidates = { candidate("home_city", "Oslo") } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 1)
            test.eq(result.items[1].key, "home_city")
            test.eq(result.stats.rejected, 3)
            test.eq(result.stats.rejected_normalization_shape, 3)
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
                { id = "c", kind = "fact", key = "a", content = "A source." },
                { id = "d", kind = "fact", key = "b", content = "A source." },
                { id = "e", kind = "fact", key = "c", content = "A source." },
                { id = "f", kind = "fact", key = "d", content = "A source." },
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
