-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function candidate(key: string, value: string): any
    return fixture.candidate("profile_slot", key, value, "The user states an attribute.", "event", nil, "single")
end

local function maximal(node: any, text: string): any
    if node.enum then
        local value = node.enum[1]
        for _, option in ipairs(node.enum) do
            if #json.encode(option) > #json.encode(value) then value = option end
        end
        return value
    elseif node.type == "object" then
        test.eq(node.additionalProperties, false)
        local value = {}
        for key, child in pairs(node.properties) do value[key] = maximal(child, text) end
        return value
    elseif node.type == "array" then
        test.is_true(type(node.maxItems) == "number", "Array has no finite bound")
        local value = {}
        for i = 1, node.maxItems do value[i] = maximal(node.items, text) end
        return value
    elseif node.type == "string" then
        test.is_true(type(node.maxLength) == "number", "String has no finite bound")
        if node.pattern then return string.rep("a", node.maxLength) end
        return string.rep(text, node.maxLength)
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

        test.it("directs extraction to omit memory-management requests while retaining personal assertions", function()
            local user = fixture.user()
            fixture.extraction({})
            local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "request", role = "user", text = "Forget my dietary preferences." },
            } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 0)
            local instruction = fixture.script.prompts("structured_output")[1].system
            test.is_true(instruction:find("memory-management requests", 1, true) ~= nil)
            test.is_true(instruction:find("instructions about stored memory", 1, true) ~= nil)
        end)

        test.it("extracts scalar attributes and goals through independently typed collections", function()
            local user = fixture.user()
            local attribute = fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "statement")
            local goal = fixture.candidate("plan", "ticket_booking", { status = "open", next_step = "Compare routes", details = "Travel tickets" }, "The user needs travel tickets.", "statement")
            fixture.script.respond("structured_output", { items = { attribute }, plans = { goal } })
            local result, err = fixture.op(user, "extract", { span = { { id = "statement", role = "user", text = "I live in Paris and need travel tickets." } } })
            test.is_nil(err, tostring(err))
            test.eq(#result, 2)
            test.eq(result[1].kind, "profile_slot")
            test.eq(result[1].value, "Paris")
            test.eq(result[2].kind, "plan")
            test.eq(result[2].value.details, "Travel tickets")
            local schema = fixture.script.requests("structured_output")[1]
            test.eq(schema.properties.items.items.properties.value.type, "string")
            test.eq(schema.properties.plans.items.properties.value.type, "object")
        end)

        test.it("retains open task requests with no agreed next action or supporting details", function()
            local user = fixture.user()
            for _, request in ipairs({ "I need to arrange a repair.", "Can you help me organize a workshop?" }) do
                local goal = fixture.candidate("plan", "requested_task", {
                    status = "open", next_step = "", details = request,
                }, "The user requests help with a task.", "task-source")
                fixture.extraction({ goal })
                local result, err = fixture.op(user, "extract", { span = { { id = "task-source", role = "user", text = request } } })
                test.is_nil(err, tostring(err))
                test.eq(#result, 1)
                test.eq(result[1].value.status, "open")
                test.eq(result[1].value.next_step, "")
                test.eq(result[1].value.details, request)
                test.eq(result[1].event_id, "task-source")
            end
        end)

        test.it("rejects goal-shaped output for an extracted scalar attribute", function()
            local user = fixture.user()
            fixture.script.respond("structured_output", { plans = {}, items = { fixture.candidate("profile_slot", "pet_name", {
                status = "open", next_step = "", details = "A cat named Biscuit",
            }, "The user's cat is named Biscuit.", "statement") } })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "statement", role = "user", text = "My cat is Biscuit." } } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 0)
            test.eq(result.stats.rejected, 1)
            test.eq(result.stats.rejected_extraction_value, 1)
            test.eq(#fixture.script.requests("structured_output"), 1)
        end)

        test.it("offers existing goal state when interpreting a contextual answer", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded = fixture.remember(user, id, { fixture.candidate("plan", "trip_tickets", {
                status = "open", next_step = "Choose a destination", details = "The user needs tickets.",
            }, "The user needs tickets.", "seed", "2026-09-01T00:00:00Z") }, "goal-state-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "question", role = "assistant", content = "Where are you heading?" } })
            fixture.apply(user, "before_step", id, session, "agent-a")
            fixture.wait_runs(user, id, "derive", 1)
            fixture.history.record(session, { { id = "answer", role = "user", content = "London" } })
            fixture.extraction({ fixture.candidate("plan", "trip_tickets", { status = "open", next_step = "Compare routes", details = "London tickets" }, "The user needs London tickets.", "answer") })
            fixture.verdict("SUPERSEDE", { seeded.item_ids[1] })
            fixture.apply(user, "before_step", id, session, "agent-a")
            fixture.wait_runs(user, id, "derive", 2)
            local prompt = fixture.script.prompts("structured_output")[1].system
            test.is_true(prompt:find("Choose a destination", 1, true) ~= nil, prompt)
            local schema = fixture.script.requests("structured_output")[1]
            test.eq(schema.properties.plans.items.properties.value.properties.details.minLength, 1)
        end)

        test.it("splits compound attributes into independent topics with the same evidence in different domains", function()
            local user = fixture.user()
            for _, example in ipairs({
                { value = "Engineer at Northstar", content = "The user is an engineer at Northstar.", parts = {
                    { key = "employer", value = "Northstar", content = "The user works at Northstar." },
                    { key = "occupation", value = "engineer", content = "The user is an engineer." },
                } },
                { value = "Cedar College studying chemistry", content = "The user studies chemistry at Cedar College.", parts = {
                    { key = "school", value = "Cedar College", content = "The user attends Cedar College." },
                    { key = "field_of_study", value = "chemistry", content = "The user studies chemistry." },
                } },
            }) do
                local parts = example.parts
                for _, part in ipairs(parts) do part.kind = "profile_slot"; part.cardinality = "single" end
                fixture.script.respond("structured_output", { mappings = { ["1"] = parts } })
                local input = fixture.candidate("fact", "background", example.value, example.content, "evidence")
                input.source_ids = { "source-a", "source-b" }
                local normalized, err = fixture.op(user, "normalize", { candidates = { input } })
                test.is_nil(err, tostring(err))
                test.eq(#normalized, 2)
                for i, item in ipairs(normalized) do
                    test.eq(item.key, parts[i].key)
                    test.eq(item.value, parts[i].value)
                    test.eq(item.content, parts[i].content)
                    test.eq(item.event_id, "evidence")
                    test.eq(table.concat(item.source_ids, ","), "source-a,source-b")
                    test.eq(item.cardinality, "single")
                end
            end
        end)

        test.it("rejects an attribute candidate that maps onto an existing goal topic", function()
            local user = fixture.user()
            for _, key in ipairs({ "travel_help", "Travel Help" }) do
                local lesson = fixture.candidate("lesson", key, "accessible routes", "Suggest accessible routes.")
                fixture.normalization({ lesson })
                local result, err = fixture.op(user, "model_step", { candidates = { lesson }, keys = {
                    { key = "travel_help", kind = "plan", cardinality = "single" },
                    { key = "mobility", kind = "profile_slot", cardinality = "single" },
                } })
                test.is_nil(err, tostring(err))
                test.eq(#result.items, 0)
                test.eq(result.stats.rejected, 1)
                test.eq(result.stats.rejected_normalization_kind, 1)
            end
        end)

        test.it("normalizes typed values without asking for a discarded string substitute", function()
            local user = fixture.user()
            fixture.script.respond("structured_output", { mappings = {
                ["1"] = { { key = "switch", kind = "fact", cardinality = "multi" } },
                ["2"] = { { key = "goal", kind = "plan", cardinality = "single" } },
            } })
            local state = { status = "open", next_step = "", details = "A durable goal" }
            local result, err = fixture.op(user, "normalize", { candidates = {
                fixture.candidate("fact", "switch", false, "The switch is false."),
                fixture.candidate("plan", "goal", state, "An ongoing goal."),
            } })
            test.is_nil(err, tostring(err))
            test.eq(result[1].value, false)
            test.eq(json.encode(result[2].value), (json.encode(state)))
            local schema = fixture.script.requests("structured_output")[1].properties.mappings.properties
            test.is_nil(schema["1"].items.properties.value)
            test.is_nil(schema["2"].items.properties.value)
        end)

        test.it("normalizes every candidate once using required numbered result properties", function()
            local user = fixture.user()
            fixture.script.respond("structured_output", { mappings = {
                ["1"] = { { key = "name", value = "Sam", kind = "profile_slot", cardinality = "single", content = "The user states this attribute." } },
                ["2"] = { { key = "home_city", value = "Paris", kind = "profile_slot", cardinality = "single", content = "The user states this attribute." } },
                ["3"] = { { key = "diet", value = "vegetarian", kind = "profile_slot", cardinality = "single", content = "The user states this attribute." } },
            } })
            local normalized, err = fixture.op(user, "normalize", { candidates = {
                fixture.candidate("profile_slot", "name", "Sam", "The user's name is Sam."),
                fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris."),
                fixture.candidate("profile_slot", "diet", "vegetarian", "The user is vegetarian."),
            } })
            test.is_nil(err, tostring(err))
            test.eq(#normalized, 3)
            test.eq(normalized[1].value, "Sam")
            test.eq(normalized[2].value, "Paris")
            test.eq(normalized[3].value, "vegetarian")
            test.eq(#fixture.script.requests("structured_output")[1].properties.mappings.required, 3)
        end)

        test.it("rejects normalization that maps a goal onto a profile attribute", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "seed") }, "normalization-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "goal", role = "user", content = "I need tickets to London." } })
            fixture.script.respond("structured_output", { mappings = { ["1"] = { { key = "home_city", kind = "profile_slot", cardinality = "single" } } } })
            local normalized, err = fixture.op(user, "model_step", { candidates = {
                fixture.candidate("plan", "trip_tickets", { status = "open", next_step = "Compare tickets", details = "London" }, "The user plans a London trip.", "goal"),
            }, keys = { { key = "home_city", kind = "profile_slot", cardinality = "single" } } })
            test.is_nil(normalized)
            test.not_nil(err)
            test.eq(err:details().code, "model_output_malformed")
            fixture.settle(user, id)
            local rows = fixture.items(user, id)
            test.eq(#rows, 1)
            test.eq(rows[1].value, "Berlin")
        end)

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
                    test.is_true(err:retryable())
                end
            end
            for _, prompt in ipairs(fixture.script.prompts("structured_output")) do
                test.is_true(prompt.system:find("one compact JSON object on one line", 1, true) ~= nil)
            end
            for _, options in ipairs(fixture.script.requests("structured_options")) do
                test.is_true(type(options.max_tokens) == "number" and options.max_tokens > 0 and options.max_tokens <= 32768)
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
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.is_true(err:retryable())
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

        test.it("sends result schemas built only from keywords constrained decoding supports", function()
            local supported = { type = true, properties = true, required = true, additionalProperties = true, items = true,
                maxItems = true, minItems = true, enum = true, maxLength = true, minLength = true, pattern = true, minimum = true, maximum = true }
            local function check(node: any, path: string)
                for keyword, child in pairs(node) do
                    test.is_true(supported[keyword] == true, "unsupported schema keyword " .. keyword .. " at " .. path)
                    if keyword == "properties" then
                        for name, property in pairs(child) do check(property, path .. "." .. name) end
                    elseif keyword == "items" then
                        check(child, path .. "[]")
                    end
                end
            end
            local user = fixture.user()
            fixture.script.respond("structured_output", { items = {}, plans = {} })
            local _, err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "event", role = "user", text = "I live in Oslo and need to renew my passport." },
            }, keys = {
                { key = "residence", kind = "profile_slot", cardinality = "single", value = "Paris", content = "Lives in Paris." },
                { key = "passport_renewal", kind = "plan", cardinality = "single", content = "Renewing a passport." },
            } })
            test.is_nil(err, tostring(err))
            local schemas = fixture.script.requests("structured_output")
            test.eq(#schemas, 1)
            check(schemas[1], "$")
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
                local budget = options[#options].max_tokens
                for _, text in ipairs({ "𐍈", "界", '"', "\\", "\n" }) do
                    local encoded = json.encode(maximal(schema, text))
                    test.is_true(budget >= #encoded, step .. " budget cannot cover " .. tostring(#encoded) .. " compact UTF-8 bytes")
                end
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
            for _, model in ipairs({ "test-small", "test-bounded" }) do
            local user = fixture.user()
            local id, create_err = fixture.try_memory(user, { extraction_model = model })
            test.is_nil(id)
            test.not_nil(create_err)
            test.is_true(tostring(create_err):find("one statement", 1, true) ~= nil, tostring(create_err))
            id = fixture.memory(user)
            local updated, update_err = fixture.op(user, "update_config", { component_id = id, config = { extraction_model = model } })
            test.is_nil(updated)
            test.not_nil(update_err)
            test.is_true(tostring(update_err):find("one statement", 1, true) ~= nil, tostring(update_err))
            local stored = fixture.op(user, "store", { component_id = id })
            test.is_true(stored.config.extraction_model ~= model)
            end
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
