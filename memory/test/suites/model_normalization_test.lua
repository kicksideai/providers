-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("memory model normalization", function()

        test.it("resolves one normalized key to an existing topic or a new topic", function()
            local user = fixture.user()
            for _, key in ipairs({ "home_city", " Home City ", "residence" }) do
                local item = fixture.candidate("profile_slot", key, "Bergen", "Lives in Bergen.", "source", nil, "multi")
                fixture.script.respond(user, "structured_output", { items = { item }, plans = {}, lessons = {} })
                local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                    { id = "source", role = "user", author = {kind = "user", id = user}, text = "I moved to Bergen." },
                }, keys = { { kind = "profile_slot", key = "home_city", cardinality = "single", scope_family = "owner" } }, owner_id = user })
                test.is_nil(err, tostring(err))
                local existing = key ~= "residence"
                test.eq(result.items[1].key, existing and "home_city" or "residence")
                test.eq(result.items[1].cardinality, existing and "single" or "multi")
            end
            local schema = fixture.script.requests(user, "structured_output")[1]
            for _, collection in ipairs({ "items", "plans", "lessons" }) do
                local shape = schema.properties[collection].items
                for _, key in ipairs({"new_topic", "home_city_details"}) do
                    test.is_true(json.validate_string(shape.properties.key, assert(json.encode(key))) == true)
                end
                test.eq(json.validate_string(shape.properties.key, assert(json.encode("home_city"))) == true, collection == "items")
                test.eq(shape.properties.key.maxLength, 64)
                test.eq(#shape.required, 8)
                test.eq(shape.required[2], "key")
            end
        end)

        test.it("rejects malformed topic keys at the schema boundary and incompatible kinds at generation", function()
            local user = fixture.user()
            for _, case in ipairs({
                { key = "", code = "model_output_malformed" },
                { key = "123", code = "model_output_malformed" },
                { key = "!!!", code = "model_output_malformed" },
                { key = "contact_guidance", code = "model_output_malformed" },
            }) do
                local item = fixture.candidate("profile_slot", case.key, "Bergen", "Lives in Bergen.", "source")
                fixture.script.respond(user, "structured_output", { items = { item }, plans = {}, lessons = {} })
                local result, err = fixture.op(user, "model_step", { step = "extract", span = {
                    { id = "source", role = "user", author = {kind = "user", id = user}, text = "I moved to Bergen." },
                }, keys = { { kind = "plan", key = "contact_guidance", cardinality = "single", scope_family = "owner" } }, owner_id = user })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.UNAVAILABLE)
                test.eq(err:details().code, case.code)
            end
        end)

        test.it("reports malformed output collections before canonicalization", function()
            local user = fixture.user()
            fixture.script.respond(user, "structured_output", { items = true, lessons = {}, plans = {} })
            local extracted, extraction_err = fixture.op(user, "model_step", { step = "extract", span = {
                { id = "source", role = "user", author = { kind = "user", id = user }, text = "I moved to Bergen." },
            } })
            test.is_nil(extracted)
            test.eq(extraction_err:details().code, "model_output_malformed")

            local candidate = fixture.candidate("profile_slot", "home_city", "Bergen", "Lives in Bergen.")
            fixture.script.respond(user, "structured_output", { mappings = true })
            local normalized, normalization_err = fixture.op(user, "model_step", { candidates = { candidate } })
            test.is_nil(normalized)
            test.eq(normalization_err:details().code, "model_output_malformed")
        end)

        test.it("rejects lesson mappings onto attribute keys and attribute mappings onto lesson keys", function()
            local user = fixture.user()
            for _, kinds in ipairs({ { "lesson", "profile_slot" }, { "fact", "lesson" } }) do
                local candidate = fixture.candidate(kinds[1], "guidance", "evening", "Contact in the evening.")
                fixture.normalization(user, { candidate })
                local result, err = fixture.op(user, "model_step", { step = "normalize", candidates = { candidate }, keys = {
                    { key = "guidance", kind = kinds[2], cardinality = "multi" },
                } })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.UNAVAILABLE)
                test.eq(err:details().code, "model_output_malformed")
            end
        end)

        test.it("extracts scalar attributes and goals through independently typed collections", function()
            local user = fixture.user()
            local attribute = fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "statement")
            local goal = fixture.candidate("plan", "ticket_booking", { status = "open", next_step = "Compare routes", details = "Travel tickets" }, "The user needs travel tickets.", "statement")
            fixture.extraction(user, { attribute, goal })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "statement", role = "user", author = {kind = "user", id = user}, text = "I live in Paris and need travel tickets." } }, owner_id = user })
            test.is_nil(err, tostring(err))
            test.eq(#result.items, 2)
            test.eq(result.items[1].kind, "profile_slot")
            test.eq(result.items[1].value, "Paris")
            test.eq(result.items[2].kind, "plan")
            test.eq(result.items[2].value.details, "Travel tickets")
            local schema = fixture.script.requests(user, "structured_output")[1]
            test.eq(schema.properties.items.items.properties.value.type, "string")
            test.eq(schema.properties.plans.items.properties.value.type, "object")
        end)

        test.it("retains open task requests with no agreed next action or supporting details", function()
            local user = fixture.user()
            for _, request in ipairs({ "I need to arrange a repair.", "Can you help me organize a workshop?" }) do
                local goal = fixture.candidate("plan", "requested_task", {
                    status = "open", next_step = "", details = request,
                }, "The user requests help with a task.", "task-source")
                fixture.extraction(user, { goal })
                local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "task-source", role = "user", author = {kind = "user", id = user}, text = request } }, owner_id = user })
                test.is_nil(err, tostring(err))
                test.eq(#result.items, 1)
                test.eq(result.items[1].value.status, "open")
                test.eq(result.items[1].value.next_step, "")
                test.eq(result.items[1].value.details, request)
                test.eq(result.items[1].event_id, "task-source")
            end
        end)

        test.it("rejects goal-shaped output for an extracted scalar attribute", function()
            local user = fixture.user()
            fixture.script.respond(user, "structured_output", { plans = {}, lessons = {}, items = { fixture.candidate("profile_slot", "pet_name", {
                status = "open", next_step = "", details = "A cat named Biscuit",
            }, "The user's cat is named Biscuit.", "statement") } })
            local result, err = fixture.op(user, "model_step", { step = "extract", span = { { id = "statement", role = "user", author = {kind = "user", id = user}, text = "My cat is Biscuit." } }, owner_id = user })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.is_true(err:retryable())
            test.eq(err:details().code, "model_output_malformed")
            test.is_nil((tostring(err):find("private", 1, true)))
            test.eq(#fixture.script.requests(user, "structured_output"), 1)
        end)

        test.it("offers existing goal state when interpreting a contextual answer", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded = fixture.remember(user, id, { fixture.candidate("plan", "trip_tickets", {
                status = "open", next_step = "Choose a destination", details = "The user needs tickets.",
            }, "The user needs tickets.", "seed", "2026-09-01T00:00:00Z") }, "goal-state-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            local prompt_events = {
                { id = "request", role = "user", author = { kind = "user", id = user }, content = "Help me plan a trip." },
                { id = "question", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "Where are you heading?" },
            }
            fixture.record_chat(user, session, prompt_events)
            fixture.extraction(id, {})
            fixture.apply(user, "before_step", id, session, "agent-a")
            fixture.wait_runs(user, id, "derive", 1)
            local answer = { id = "answer", role = "user", author = { kind = "user", id = user }, content = "London" }
            fixture.record_chat(user, session, { answer })
            fixture.extraction(id, { fixture.candidate("plan", "trip_tickets", { status = "open", next_step = "Compare routes", details = "London tickets" }, "The user needs London tickets.", answer.id) })
            fixture.apply(user, "before_step", id, session, "agent-a")
            fixture.wait_runs(user, id, "derive", 2)
            local prompt = fixture.script.prompts(id, "structured_output")[2].system
            test.is_true(prompt:find("Choose a destination", 1, true) ~= nil, prompt)
            local schema = fixture.script.requests(id, "structured_output")[2]
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
                fixture.script.respond(user, "structured_output", { mappings = { ["1"] = parts } })
                local input = fixture.candidate("fact", "background", example.value, example.content, "evidence")
                input.source_ids = { "source-a", "source-b" }
                local normalized, err = fixture.op(user, "model_step", { step = "normalize", candidates = { input } })
                test.is_nil(err, tostring(err))
                test.eq(#normalized.items, 2)
                for i, item in ipairs(normalized.items) do
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
                fixture.normalization(user, { lesson })
                local result, err = fixture.op(user, "model_step", { step = "normalize", candidates = { lesson }, keys = {
                    { key = "travel_help", kind = "plan", cardinality = "single" },
                    { key = "mobility", kind = "profile_slot", cardinality = "single" },
                } })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.UNAVAILABLE)
                test.is_true(err:retryable())
                test.eq(err:details().code, "model_output_malformed")
                test.is_nil((tostring(err):find("private", 1, true)))
            end
        end)

        test.it("keeps a lesson as one multi-valued guidance item", function()
            local user = fixture.user()
            local lesson = fixture.candidate("lesson", "meal_planning", "vegan meals", "Choose vegan meals when booking.")
            fixture.script.respond(user, "structured_output", { mappings = { ["1"] = {
                { key = "meal_planning", kind = "lesson", cardinality = "multi", value = "vegan meals", content = "Choose vegan meals when booking." },
                { key = "booking_meals", kind = "lesson", cardinality = "multi", value = "vegan options", content = "Choose vegan meals when booking." },
            } } })
            local result, err = fixture.op(user, "model_step", { step = "normalize", candidates = { lesson } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:details().code, "model_output_malformed")
            local schema = fixture.script.requests(user, "structured_output")[1].properties.mappings.properties["1"]
            test.eq(schema.maxItems, 1)
            test.eq(json.encode(schema.items.properties.cardinality.enum), '["multi"]')
            fixture.script.respond(user, "structured_output", { mappings = { ["1"] = {
                { key = "meal_planning", kind = "lesson", cardinality = "single", value = "vegan meals", content = "Choose vegan meals when booking." },
            } } })
            local single, single_err = fixture.op(user, "model_step", { step = "normalize", candidates = { lesson } })
            test.is_nil(single)
            test.eq(single_err:details().code, "model_output_malformed")
        end)

        test.it("normalizes typed values without asking for a discarded string substitute", function()
            local user = fixture.user()
            fixture.script.respond(user, "structured_output", { mappings = {
                ["1"] = { { key = "switch", kind = "fact", cardinality = "multi" } },
                ["2"] = { { key = "goal", kind = "plan", cardinality = "single" } },
            } })
            local state = { status = "open", next_step = "", details = "A durable goal" }
            local result, err = fixture.op(user, "model_step", { step = "normalize", candidates = {
                fixture.candidate("fact", "switch", false, "The switch is false."),
                fixture.candidate("plan", "goal", state, "An ongoing goal."),
            } })
            test.is_nil(err, tostring(err))
            test.eq(result.items[1].value, false)
            test.eq(json.encode(result.items[2].value), (json.encode(state)))
            local schema = fixture.script.requests(user, "structured_output")[1].properties.mappings.properties
            test.is_nil(schema["1"].items.properties.value)
            test.is_nil(schema["2"].items.properties.value)
        end)

        test.it("normalizes every candidate once using required numbered result properties", function()
            local user = fixture.user()
            fixture.script.respond(user, "structured_output", { mappings = {
                ["1"] = { { key = "name", value = "Sam", kind = "profile_slot", cardinality = "single", content = "The user states this attribute." } },
                ["2"] = { { key = "home_city", value = "Paris", kind = "profile_slot", cardinality = "single", content = "The user states this attribute." } },
                ["3"] = { { key = "diet", value = "vegetarian", kind = "profile_slot", cardinality = "single", content = "The user states this attribute." } },
            } })
            local normalized, err = fixture.op(user, "model_step", { step = "normalize", candidates = {
                fixture.candidate("profile_slot", "name", "Sam", "The user's name is Sam."),
                fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris."),
                fixture.candidate("profile_slot", "diet", "vegetarian", "The user is vegetarian."),
            } })
            test.is_nil(err, tostring(err))
            test.eq(#normalized.items, 3)
            test.eq(normalized.items[1].value, "Sam")
            test.eq(normalized.items[2].value, "Paris")
            test.eq(normalized.items[3].value, "vegetarian")
            test.eq(#fixture.script.requests(user, "structured_output")[1].properties.mappings.required, 3)
        end)

        test.it("rejects normalization that maps a goal onto a profile attribute", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "seed") }, "normalization-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            local goal = { id = "goal", role = "user", author = { kind = "user", id = user }, content = "I need tickets to London." }
            fixture.record_chat(user, session, { goal })
            fixture.script.respond(user, "structured_output", { mappings = { ["1"] = { { key = "home_city", kind = "profile_slot", cardinality = "single" } } } })
            local normalized, err = fixture.op(user, "model_step", { step = "normalize", candidates = {
                fixture.candidate("plan", "trip_tickets", { status = "open", next_step = "Compare tickets", details = "London" }, "The user plans a London trip.", goal.id),
            }, keys = { { key = "home_city", kind = "profile_slot", cardinality = "single" } } })
            test.is_nil(normalized)
            test.not_nil(err)
            test.eq(err:details().code, "model_output_malformed")
            fixture.settle(user, id)
            local rows = fixture.items(user, id)
            test.eq(#rows, 1)
            test.eq(rows[1].value, "Berlin")
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
