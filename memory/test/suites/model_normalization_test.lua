-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("memory model normalization", function()
        test.before_each(function() fixture.script.reset() end)

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

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
