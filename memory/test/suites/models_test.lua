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
        if node.pattern == "^[a-z][a-z0-9_]{0,63}$" then return string.rep("a", node.maxLength) end
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

        test.it("offers relations only within compatible kind families in both directions", function()
            local user = fixture.user()
            local kinds = { "fact", "preference", "profile_slot", "skill", "plan", "lesson" }
            for _, kind in ipairs(kinds) do
                local neighbors, relations = {}, {}
                for i, other in ipairs(kinds) do
                    neighbors[i] = { id = tostring(i), key = "topic_" .. tostring(i), kind = other, cardinality = "single" }
                    relations[i] = "unrelated"
                end
                fixture.relations(user, relations)
                local _, err = fixture.op(user, "model_step", { step = "judge", candidate = { kind = kind },
                    items = neighbors, actions = { "ADD", "NOOP", "SUPERSEDE", "MERGE", "CONFLICT" } })
                test.is_nil(err, tostring(err))
                local schemas = fixture.script.requests(user, "structured_output")
                for i, other in ipairs(kinds) do
                    local compatible = kind == other or (kind ~= "plan" and kind ~= "lesson" and other ~= "plan" and other ~= "lesson")
                    test.eq(table.concat(schemas[#schemas].properties.relations.properties[tostring(i)].enum, ","),
                        compatible and "same,updates,rephrases,contradicts,unrelated" or "unrelated", kind .. "/" .. other)
                end
            end
        end)

        test.it("rejects each non-unrelated relation across kind boundaries", function()
            local user = fixture.user()
            for _, kind in ipairs({ "plan", "lesson" }) do
                for _, relation in ipairs({ "same", "updates", "rephrases", "contradicts" }) do
                    fixture.relations(user, { relation })
                    local result, err = fixture.op(user, "model_step", { step = "judge", candidate = { kind = "fact" },
                        items = { { kind = kind, id = "neighbor", key = "goal", cardinality = "single" } },
                        actions = { "ADD", "NOOP", "SUPERSEDE", "MERGE", "CONFLICT" } })
                    test.is_nil(result)
                    test.not_nil(err)
                    test.eq(err:details().code, "model_output_malformed")
                end
            end
        end)

        test.it("directs extraction to omit memory-management requests while retaining personal assertions", function()
            local user = fixture.user()
            fixture.extraction(user, {})
            local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "request", role = "user", text = "Forget my dietary preferences." },
            } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 0)
            local instruction = fixture.script.prompts(user, "structured_output")[1].system
            test.is_true(instruction:find("memory-management requests", 1, true) ~= nil)
            test.is_true(instruction:find("instructions about stored memory", 1, true) ~= nil)
        end)

        test.it("extracts canonical independent attributes in one call while reusing existing keys", function()
            local user = fixture.user()
            local city = candidate("residence", "Oslo")
            local job = candidate("occupation", "engineer")
            fixture.extraction(user, { city, job })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "event", role = "user", text = "I live in Oslo and work as an engineer." },
            }, keys = { { key = "residence", kind = "profile_slot", cardinality = "single", value = "Paris", content = "Lives in Paris." } } })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 2)
            test.eq(result.items[1].key, "residence")
            test.eq(result.items[1].value, "Oslo")
            test.eq(result.items[2].key, "occupation")
            test.eq(result.items[2].event_id, "event")
            test.eq(#fixture.script.requests(user, "structured_output"), 1)
            local request = fixture.script.requests(user, "structured_output")[1]
            test.eq(request.properties.items.items.properties.key.pattern, "^[a-z][a-z0-9_]{0,63}$")
            local prompt = fixture.script.prompts(user, "structured_output")[1]
            test.is_true(prompt.system:find("residence (single)", 1, true) ~= nil)
            test.is_true(prompt.system:find("independently", 1, true) ~= nil)
        end)

        test.it("rejects truncated output at every structured step even when JSON is complete", function()
            local user = fixture.user()
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                for _, data in ipairs({ { items = {}, plans = {}, lessons = {}, mappings = {}, relations = {} }, '{"items":[' }) do
                    fixture.script.respond(user, "structured_output", data, "length")
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
            for _, prompt in ipairs(fixture.script.prompts(user, "structured_output")) do
                test.is_true(prompt.system:find("one compact JSON object on one line", 1, true) ~= nil)
            end
            for _, options in ipairs(fixture.script.requests(user, "structured_options")) do
                test.is_true(type(options.max_tokens) == "number" and options.max_tokens > 0 and options.max_tokens <= 32768)
            end
        end)

        test.it("classifies incomplete JSON reported by a provider before response decoding", function()
            local user = fixture.user()
            fixture.script.fail(user, "structured_output", "Model failed to return valid JSON", errors.NOT_FOUND, false,
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
            test.eq(#fixture.script.requests(user, "structured_output"), 0)
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
            fixture.script.respond(user, "structured_output", { items = {}, plans = {}, lessons = {} })
            local _, err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "event", role = "user", text = "I live in Oslo and need to renew my passport." },
            }, keys = {
                { key = "residence", kind = "profile_slot", cardinality = "single", value = "Paris", content = "Lives in Paris." },
                { key = "passport_renewal", kind = "plan", cardinality = "single", content = "Renewing a passport." },
            } })
            test.is_nil(err, tostring(err))
            local schemas = fixture.script.requests(user, "structured_output")
            test.eq(#schemas, 1)
            check(schemas[1], "$")
        end)

        test.it("sizes output budgets by the bounded result schema and mapping count", function()
            local user = fixture.user()
            local one = candidate("home_city", "Oslo")
            fixture.normalization(user, { one })
            local first, first_err = fixture.op(user, "model_step", { candidates = { one } })
            test.is_nil(first_err, tostring(first_err))
            local two = candidate("pet_name", "Fennel")
            fixture.normalization(user, { one, two })
            local second, second_err = fixture.op(user, "model_step", { candidates = { one, two } })
            test.is_nil(second_err, tostring(second_err))
            local options = fixture.script.requests(user, "structured_options")
            test.is_true(options[2].max_tokens > options[1].max_tokens, json.encode(options))
            local schemas = fixture.script.requests(user, "structured_output")
            test.eq(schemas[1].properties.mappings.properties["1"].maxItems, 4)
            test.eq(schemas[1].properties.mappings.properties["1"].items.properties.value.maxLength, 160)
            test.eq(#first.items, 1)
            test.eq(#second.items, 2)
        end)

        test.it("budgets cap maximum compact results at the model limit for every structured call", function()
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
                fixture.script.respond(user, "structured_output", {}, "length")
                local _, err = fixture.op(user, "model_step", { step = step, span = span, candidates = candidates,
                    candidate = candidates[1], items = sources })
                test.not_nil(err)
                test.eq(err:details().code, "model_output_truncated")
                local schemas = fixture.script.requests(user, "structured_output")
                local options = fixture.script.requests(user, "structured_options")
                local schema = schemas[#schemas]
                local budget = options[#options].max_tokens
                for _, text in ipairs({ "𐍈", "界", '"', "\\" }) do
                    local encoded = json.encode(maximal(schema, text))
                    test.is_true(budget <= 32768)
                    test.is_true(budget >= math.min(32768, #encoded), step .. " budget does not cover bytes up to the model limit")
                end
                if step == "extract" then
                    test.eq(schema.properties.items.maxItems, capacity * 4)
                    test.eq(schema.properties.plans.maxItems, capacity)
                elseif step == "reflect" then
                    test.eq(schema.properties.items.maxItems, math.min(4, capacity))
                    test.eq(schema.properties.items.items.properties.based_on.maxItems, #sources)
                elseif step == "judge" then test.eq(#schema.properties.relations.required, #sources) end
            end
            span[#span + 1] = span[1]
            fixture.script.respond(user, "structured_output", {}, "length")
            local result, err = fixture.op(user, "model_step", { step = "extract", span = span })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:details().code, "model_output_truncated")
            local options = fixture.script.requests(user, "structured_options")
            test.eq(options[#options].max_tokens, 32768)
        end)

        test.it("covers complete worst-case escaped and Unicode results when the schema fits the card", function()
            local user = fixture.user()
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                fixture.script.respond(user, "structured_output", {}, "length")
                local _, err = fixture.op(user, "model_step", { step = step,
                    span = { { id = "event", role = "user", text = "An attribute." } },
                    candidates = { candidate("attribute", "An attribute") }, candidate = candidate("attribute", "An attribute"),
                    items = { { id = "a", kind = "fact", key = "attribute", content = "An attribute." },
                        { id = "b", kind = "fact", key = "other", content = "Another attribute." } } })
                test.not_nil(err)
                local schemas = fixture.script.requests(user, "structured_output")
                local options = fixture.script.requests(user, "structured_options")
                local budget = options[#options].max_tokens
                for _, text in ipairs({ "𐍈", "界", '"', "\\" }) do
                    local encoded = json.encode(maximal(schemas[#schemas], text))
                    test.is_true(#encoded < 32768, step .. " fixture exceeds the card")
                    test.is_true(budget >= #encoded, step .. " budget is smaller than its complete encoded result")
                end
            end
        end)

        test.it("fails visibly on strings and arrays exceeding the supplied schema bounds", function()
            local user = fixture.user()
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                for _, overflow in ipairs({ "string", "array" }) do
                    local city = candidate("home_city", "Oslo")
                    local data = { items = { city }, plans = {}, lessons = {} }
                    if step == "normalize" then
                        data = { mappings = { ["1"] = { { kind = city.kind, key = city.key, cardinality = city.cardinality, value = city.value, content = city.content } } } }
                    elseif step == "reflect" then
                        data = { items = { city } }
                        city.kind = "lesson"; city.cardinality = "multi"; city.event_id = ""; city.based_on = { 1, 2 }
                    elseif step == "judge" then data = { relations = { ["1"] = "unrelated", ["2"] = "unrelated" }, reason = "Distinct attribute." } end
                    if overflow == "string" then
                        if step == "judge" then data.reason = string.rep("x", 193)
                        elseif step == "normalize" then data.mappings["1"][1].content = string.rep("x", 241)
                        else city.content = string.rep("x", 241) end
                    else
                        if step == "judge" then data.relations["3"] = "unrelated"
                        elseif step == "normalize" then
                            for i = 2, 5 do data.mappings["1"][i] = data.mappings["1"][1] end
                        else
                            for i = 2, 5 do data.items[i] = city end
                        end
                    end
                    fixture.script.respond(user, "structured_output", data)
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

        test.it("excludes control characters from every structured string and rejects decoded controls", function()
            local user = fixture.user()
            local function check(node)
                if node.type == "string" then test.not_nil(node.pattern, "Structured strings require a control-free pattern") end
                for _, child in pairs(node.properties or {}) do check(child) end
                if node.items then check(node.items) end
            end
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                for control = 0, 31 do
                    local city = candidate("home_city", "Oslo")
                    local data = { items = { city }, plans = {}, lessons = {} }
                    if step == "normalize" then
                        data = { mappings = { ["1"] = { { kind = city.kind, key = city.key, cardinality = city.cardinality, value = city.value, content = "City" .. string.char(control) } } } }
                    elseif step == "reflect" then
                        city.kind = "lesson"; city.cardinality = "multi"; city.event_id = ""; city.based_on = { 1, 2 }
                        city.content = "Guidance" .. string.char(control)
                        data = { items = { city } }
                    elseif step == "judge" then data = { relations = { ["1"] = "unrelated", ["2"] = "unrelated" }, reason = "Distinct" .. string.char(control) }
                    else city.content = "City" .. string.char(control) end
                    fixture.script.respond(user, "structured_output", data)
                    local result, err = fixture.op(user, "model_step", { step = step,
                        span = { { id = "event", role = "user", text = "A statement." } },
                        candidates = { candidate("home_city", "Oslo") }, candidate = candidate("home_city", "Oslo"),
                        items = { { id = "a", kind = "fact", key = "home_city", content = "Lives in Oslo." },
                            { id = "b", kind = "fact", key = "mobility", content = "Uses trains." } },
                    })
                    test.is_nil(result, step .. " accepts U+" .. tostring(control))
                    test.not_nil(err)
                    test.eq(err:details().code, "model_output_malformed")
                    local schemas = fixture.script.requests(user, "structured_output")
                    check(schemas[#schemas])
                end
            end
        end)

        test.it("rejects extraction models unable to hold one statement on creation and update", function()
            local model = "test-small"
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
        end)

        test.it("admits an 8192-token extraction model on creation and update", function()
            local user = fixture.user()
            local id, create_err = fixture.try_memory(user, { extraction_model = "test-bounded" })
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(id)
            local other = fixture.memory(user)
            local updated, update_err = fixture.op(user, "update_config", { component_id = other,
                config = { extraction_model = "test-bounded" } })
            test.is_nil(update_err, tostring(update_err))
            test.not_nil(updated)
            local stored = fixture.op(user, "store", { component_id = other })
            test.eq(stored.config.extraction_model, "test-bounded")
        end)

        test.it("sizes the largest typical ASCII statement count within the output limit", function()
            local user = fixture.user()
            for _, spec in ipairs({ { model = "test-bounded", limit = 8192 }, { model = "test-fast", limit = 32768 } }) do
                local span = { { id = string.rep("e", 36), role = "user", text = "An attribute." } }
                local capacity, err = fixture.op(user, "extraction_capacity", { model = spec.model, span = span })
                test.is_nil(err, tostring(err))
                test.is_true(capacity >= 1)
                for i = 2, capacity + 1 do span[i] = span[1] end
                for _, count in ipairs({ capacity, capacity + 1 }) do
                    local batch = {}
                    for i = 1, count do batch[i] = span[i] end
                    fixture.script.respond(user, "structured_output", {}, "length")
                    local _, output_err = fixture.op(user, "model_step", { model = spec.model, step = "extract", span = batch })
                    test.not_nil(output_err)
                    test.eq(output_err:details().code, "model_output_truncated")
                    local schemas = fixture.script.requests(user, "structured_output")
                    local ascii_bytes = #json.encode(maximal(schemas[#schemas], "a"))
                    test.is_true(count == capacity and ascii_bytes <= spec.limit or count > capacity and ascii_bytes > spec.limit,
                        "Typical ASCII byte measurement disagrees with statement capacity")
                    local options = fixture.script.requests(user, "structured_options")
                    test.eq(options[#options].max_tokens, spec.limit)
                end
            end
        end)

        test.it("caps each structured call at its card limit and preserves smaller schema budgets", function()
            local user = fixture.user()
            for _, step in ipairs({ "extract", "normalize", "reflect", "judge" }) do
                local budgets = {}
                for _, spec in ipairs({ { model = "test-fast", limit = 32768 }, { model = "test-bounded", limit = 8192 } }) do
                    fixture.script.respond(user, "structured_output", {}, "length")
                    local _, err = fixture.op(user, "model_step", { model = spec.model, step = step,
                        span = { { id = string.rep("e", 36), role = "user", text = "An attribute." } },
                        candidates = { candidate("attribute", "An attribute") }, candidate = candidate("attribute", "An attribute"),
                        items = { { id = "source-a", kind = "fact", key = "attribute", content = "An attribute." },
                            { id = "source-b", kind = "fact", key = "attribute", content = "An attribute." } } })
                    test.not_nil(err)
                    test.eq(err:details().code, "model_output_truncated")
                    test.is_true(err:retryable())
                    local schemas = fixture.script.requests(user, "structured_output")
                    local options = fixture.script.requests(user, "structured_options")
                    local budget = options[#options].max_tokens
                    test.is_true(budget <= spec.limit)
                    for _, text in ipairs({ "𐍈", "界", '\"', "\\" }) do
                        local measured = #json.encode(maximal(schemas[#schemas], text))
                        test.is_true(budget >= math.min(spec.limit, measured))
                    end
                    budgets[#budgets + 1] = budget
                end
                test.eq(budgets[2], math.min(8192, budgets[1]))
            end
        end)

        test.it("fails invalid candidate values, kinds, evidence and times without partial results", function()
            local user = fixture.user()
            for _, example in ipairs({
                { field = "value", value = "", reason = "value" },
                { field = "value", value = "   ", reason = "value" },
                { field = "value", value = false, reason = "value" },
                { field = "kind", value = "unknown", reason = "shape" },
                { field = "event_id", value = "other", reason = "evidence" },
                { field = "valid_at", value = "yesterday", reason = "time" },
                { field = "confidence", value = 2, reason = "confidence" },
            }) do
                local invalid = candidate("work_role", "engineer")
                invalid[example.field] = example.value
                fixture.extraction(user, { candidate("home_city", "Oslo"), invalid })
                local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                    { id = "event", role = "user", text = "I live in Oslo and work as an engineer." },
                } })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:details().code, (example.field == "kind" or example.field == "event_id") and "model_output_malformed" or "model_output_invalid_extraction_" .. example.reason)
                test.is_true(err:retryable())
            end
            local schema = fixture.script.requests(user, "structured_output")[1]
            test.eq(schema.properties.items.items.properties.value.minLength, 1)
            test.eq(schema.properties.items.items.properties.content.minLength, 1)
        end)

        test.it("fails empty normalization mappings instead of dropping the candidate", function()
            local user = fixture.user()
            fixture.script.respond(user, "structured_output", { mappings = { ["1"] = {} } })
            local result, err = fixture.op(user, "model_step", { candidates = { candidate("home_city", "Oslo") } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:details().code, "model_output_invalid_normalization_mapping")
            test.is_true(err:retryable())
        end)

        test.it("derives every action from required neighbour relations with deterministic precedence", function()
            local user = fixture.user()
            local relations = { "same", "updates", "rephrases", "contradicts", "unrelated" }
            local actions = { "NOOP", "SUPERSEDE", "MERGE", "CONFLICT", "ADD" }
            for first, relation in ipairs(relations) do
                local values, neighbors = {}, {}
                for i = first, #relations do
                    local number = tostring(i - first + 1)
                    values[number] = relations[i]
                    neighbors[#neighbors + 1] = { id = "n" .. number, kind = "profile_slot", key = "home_city", cardinality = "single" }
                end
                fixture.script.respond(user, "structured_output", { relations = values, reason = "test" })
                local result, err = fixture.op(user, "model_step", { step = "judge", candidate = candidate("home_city", "Oslo"),
                    actions = { "ADD", "NOOP", "SUPERSEDE", "MERGE", "CONFLICT" }, items = neighbors })
                test.is_nil(err, tostring(err))
                test.eq(result.items.action, actions[first])
                test.eq(table.concat(result.items.target_ids, ","), relation == "unrelated" and "" or "n1")
            end
            local schema = fixture.script.requests(user, "structured_output")[1]
            test.eq(table.concat(schema.properties.relations.required, ","), "1,2,3,4,5")
            test.eq(table.concat(schema.properties.relations.properties["1"].enum, ","), table.concat(relations, ","))
            local prompt = fixture.script.prompts(user, "structured_output")[1]
            test.is_true(prompt.system:find("one relation for every numbered", 1, true) ~= nil)
            test.eq(json.decode(prompt.user).existing_memories["1"].id, "n1")
        end)

        test.it("applies relation precedence independently of neighbour order", function()
            local user = fixture.user()
            for _, example in ipairs({
                { values = { "updates", "same", "same" }, action = "NOOP", targets = "b,c" },
                { values = { "contradicts", "rephrases", "updates" }, action = "SUPERSEDE", targets = "c" },
                { values = { "unrelated", "contradicts", "rephrases" }, action = "MERGE", targets = "c" },
                { values = { "unrelated", "contradicts", "unrelated" }, action = "CONFLICT", targets = "b" },
            }) do
                fixture.relations(user, example.values)
                local result, err = fixture.op(user, "model_step", { step = "judge", candidate = candidate("home_city", "Oslo"),
                    actions = { "ADD", "NOOP", "SUPERSEDE", "MERGE", "CONFLICT" }, items = {
                        { id = "a", kind = "profile_slot", key = "home_city", cardinality = "single" },
                        { id = "b", kind = "profile_slot", key = "home_city", cardinality = "single" },
                        { id = "c", kind = "profile_slot", key = "home_city", cardinality = "single" },
                    } })
                test.is_nil(err, tostring(err))
                test.eq(result.items.action, example.action)
                test.eq(table.concat(result.items.target_ids, ","), example.targets)
            end
        end)

        test.it("selects every matching target while supersession keeps one single-valued key", function()
            local user = fixture.user()
            for _, relation in ipairs({ "same", "updates", "rephrases", "contradicts" }) do
                fixture.script.respond(user, "structured_output", { relations = { ["1"] = relation, ["2"] = relation, ["3"] = relation }, reason = "test" })
                local result, err = fixture.op(user, "model_step", { step = "judge", candidate = candidate("residence", "Oslo"),
                    actions = { "ADD", "NOOP", "SUPERSEDE", "MERGE", "CONFLICT" }, items = {
                        { id = "a", kind = "profile_slot", key = "home_city", cardinality = "single" },
                        { id = "b", kind = "profile_slot", key = "occupation", cardinality = "single" },
                        { id = "c", kind = "profile_slot", key = "home_city", cardinality = "single" },
                    } })
                test.is_nil(err, tostring(err))
                test.eq(table.concat(result.items.target_ids, ","), relation == "updates" and "a,c" or "a,b,c")
            end
        end)

        test.it("restricts relation enums to the held and reflection action sets", function()
            local user = fixture.user()
            for _, example in ipairs({
                { actions = { "SUPERSEDE", "MERGE", "NOOP", "CONFLICT" }, values = "same,updates,rephrases,contradicts" },
                { actions = { "ADD", "NOOP" }, values = "same,unrelated" },
            }) do
                fixture.script.respond(user, "structured_output", { relations = { ["1"] = "same" }, reason = "test" })
                local result, err = fixture.op(user, "model_step", { step = "judge", actions = example.actions,
                    candidate = candidate("home_city", "Oslo"), items = { { id = "a", kind = "profile_slot", key = "home_city", cardinality = "single" } } })
                test.is_nil(err, tostring(err))
                test.eq(result.items.action, "NOOP")
                local schemas = fixture.script.requests(user, "structured_output")
                test.eq(table.concat(schemas[#schemas].properties.relations.properties["1"].enum, ","), example.values)
            end
        end)

        test.it("rejects missing extra unknown and disallowed neighbour relations at the schema boundary", function()
            local user = fixture.user()
            for _, relations in ipairs({ true, { ["1"] = 1 }, {}, { ["1"] = "same", ["2"] = "same" }, { ["1"] = "unknown" }, { ["1"] = "updates" } }) do
                fixture.script.respond(user, "structured_output", { relations = relations, reason = "test" })
                local result, err = fixture.op(user, "model_step", { step = "judge", candidate = candidate("home_city", "Oslo"),
                    actions = { "ADD", "NOOP" }, items = { { id = "a", kind = "profile_slot", key = "home_city", cardinality = "single" } } })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:details().code, "model_output_malformed")
                test.is_true(err:retryable())
            end
        end)

        test.it("fails reflection with duplicate or absent grounding without normalizing partial lessons", function()
            local user = fixture.user()
            for _, sources in ipairs({ { 1, 1 }, { 1 }, { 1, 3 } }) do
                local lesson = fixture.candidate("lesson", "travel_guidance", "accessible routes", "Suggest accessible routes.")
                lesson.based_on = sources
                fixture.script.respond(user, "structured_output", { items = { lesson } })
                local result, err = fixture.op(user, "model_step", { step = "reflect", items = {
                    { id = "a", kind = "fact", key = "mobility", content = "Uses a wheelchair." },
                    { id = "b", kind = "plan", key = "trip", content = "Plans a journey." },
                } })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:details().code, sources[2] == 3 and "model_output_malformed" or "model_output_invalid_reflection_grounding")
                test.is_true(err:retryable())
            end
            test.eq(#fixture.script.requests(user, "structured_output"), 3)
        end)

        test.it("fails malformed whole responses instead of accepting an empty batch", function()
            local user = fixture.user()
            for _, data in ipairs({ '{"items":[', { items = "invalid", plans = {}, lessons = {} }, { items = { invalid = true }, plans = {}, lessons = {} } }) do
                fixture.script.respond(user, "structured_output", data)
                local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "event", role = "user", text = "I live in Oslo." } } })
                test.is_nil(result)
                test.not_nil(err)
            end
        end)

        test.it("fails the whole extraction when one candidate violates topic rules", function()
            local user = fixture.user()
            fixture.extraction(user, {
                candidate("home_city", "Oslo"), candidate("private_value", "private value"),
                candidate("work_role", "engineer"),
            })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "event", role = "user", text = "I live in Oslo." } } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.is_true(err:retryable())
            test.eq(err:details().code, "model_output_invalid_extraction_topic_key")
            test.is_nil((tostring(err):find("private", 1, true)))
        end)

        test.it("rejects non-string mapping keys before canonicalizing them", function()
            local user = fixture.user()
            for _, key in ipairs({ {}, true, 123 }) do
                fixture.script.respond(user, "structured_output", { mappings = { ["1"] = {
                    { kind = "profile_slot", cardinality = "single", key = key, value = "Oslo", content = "Lives in Oslo." },
                    { kind = "profile_slot", cardinality = "single", key = "home_city", value = "Oslo", content = "Lives in Oslo." },
                } } })
                local result, err = fixture.op(user, "model_step", { candidates = { candidate("home_city", "Oslo") } })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.UNAVAILABLE)
                test.is_true(err:retryable())
                test.eq(err:details().code, "model_output_invalid_normalization_shape")
            end
        end)

        test.it("fails the whole normalization when one mapping part violates topic rules", function()
            local user = fixture.user()
            fixture.script.respond(user, "structured_output", { mappings = {
                ["1"] = { { kind = "profile_slot", cardinality = "single", key = "private_value", value = "private value", content = "Private text" },
                    { kind = "profile_slot", cardinality = "single", key = "home_city", value = "Oslo", content = "The user lives in Oslo." } },
                ["2"] = { { kind = "profile_slot", cardinality = "single", key = "pet_name", value = "Fennel", content = "The cat is Fennel." } },
            } })
            local result, err = fixture.op(user, "model_step", { candidates = { candidate("home_city", "Oslo"), candidate("pet_name", "Fennel") } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.is_true(err:retryable())
            test.eq(err:details().code, "model_output_invalid_normalization_topic_key")
            test.is_nil((tostring(err):find("private", 1, true)))
        end)

        test.it("fails reflection when a lesson violates topic rules", function()
            local user = fixture.user()
            local good = fixture.candidate("lesson", "travel_guidance", "plan accessible routes", "Suggest accessible routes.")
            good.based_on = { 1, 2 }
            local bad = fixture.candidate("lesson", "private_value", "private value", "Private text")
            bad.based_on = { 1, 2 }
            local ungrounded = fixture.candidate("lesson", "route_guidance", "use step-free routes", "Suggest step-free routes.")
            ungrounded.based_on = { 1, 1 }
            fixture.script.respond(user, "structured_output", { items = { good, bad, ungrounded } })
            fixture.normalization(user, { good })
            local result, err = fixture.op(user, "model_step", { step = "reflect", items = {
                { id = "a", kind = "profile_slot", key = "mobility", content = "Uses a wheelchair." },
                { id = "b", kind = "plan", key = "trip", content = "Plans a train journey." },
                { id = "c", kind = "fact", key = "a", content = "A source." },
                { id = "d", kind = "fact", key = "b", content = "A source." },
                { id = "e", kind = "fact", key = "c", content = "A source." },
                { id = "f", kind = "fact", key = "d", content = "A source." },
            } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.is_true(err:retryable())
            test.eq(err:details().code, "model_output_invalid_reflection_topic_key")
            test.is_nil((tostring(err):find("private", 1, true)))
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
