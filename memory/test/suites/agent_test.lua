-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function values(items: { any }): { [string]: any }
    local out = {}
    for _, item in ipairs(items) do out[tostring(item.value)] = item end
    return out
end

local function apply(user: string, phase: string, memory: string, session: string, agent: string, extra: any?): (any, any)
    return fixture.op(user, "apply", { payload = fixture.payload(phase, session, agent, extra) },
        fixture.agent_context(memory, session, agent))
end

local function define_tests()
    test.describe("memory agent runtime", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("requires an explicit typed value when remembering", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local result, err = fixture.op(user, "tool_remember", { input = {
                key = "color", content = "The user likes blue.",
            } }, fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_false(result.success)
            test.eq(result.error, "value is required")
            test.eq(#fixture.script.requests("structured_output"), 0)
        end)

        test.it("searches with a fixed typed shape and never exposes raw row fields", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.op(user, "create", { component_id = id, fields = {
                kind = "preference", scope_family = "owner", key = "color", value = "blue", content = "The user likes blue.",
            } })
            fixture.settle(user, id)
            local result, err = fixture.op(user, "tool_search", { input = { query = "color blue", fields = { "*", "scope_id" } } },
                fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_nil(err, tostring(err))
            test.eq(result.count, 1)
            local expected = { id = true, kind = true, key = true, value = true, content = true,
                valid_at = true, recorded_at = true, score = true, source = true }
            for key in pairs(expected) do test.not_nil(result.items[1][key], key) end
            for key in pairs(result.items[1]) do test.is_true(expected[key] == true, key) end
            test.eq(result.items[1].key, "color")
            test.eq(result.items[1].value, "blue")
        end)

        test.it("forgets every version of a single key in only the caller's scope", function()
            local user, other = fixture.user(), fixture.user()
            local id = fixture.memory(user)
            local first = fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "color", cardinality = "single", value = "blue", content = "The user likes blue.",
            } })
            fixture.settle(user, id)
            fixture.op(user, "archive", { component_id = id, item_id = first.item_id })
            fixture.settle(user, id)
            fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "color", cardinality = "single", value = "green", content = "The user likes green.",
            } })
            fixture.remember(user, id, { fixture.candidate("profile_slot", "color", "red", "Another user likes red.", "other-color", nil, "single") }, "other-color", { scope_id = other })
            fixture.settle(user, id)
            local result, err = fixture.op(user, "tool_forget", { input = { key = "color" } },
                fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_true(result.success, result.error)
            test.eq(result.key, "color")
            fixture.settle(user, id)
            local own = 0
            for _, item in ipairs(fixture.items(user, id, { key = "color" })) do
                if item.scope_id == user then
                    own = own + 1
                    test.eq(item.status, "forgotten")
                    test.eq(item.content, "")
                    test.is_nil(item.value)
                else
                    test.eq(item.status, "current")
                    test.eq(item.value, "red")
                end
            end
            test.eq(own, 2)
            test.not_nil(first.item_id)
        end)

        test.it("requires a value for a multi key and erases only that value's versions", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local blue = fixture.op(user, "create", { component_id = id, fields = {
                kind = "preference", scope_family = "owner", key = "colors", cardinality = "multi", value = "blue", content = "The user likes blue.",
            } })
            fixture.settle(user, id)
            fixture.op(user, "edit", { component_id = id, item_id = blue.item_id, fields = { value = "cobalt", content = "The user likes cobalt." } })
            fixture.op(user, "create", { component_id = id, fields = {
                kind = "preference", scope_family = "owner", key = "colors", cardinality = "multi", value = false, content = "The setting is false.",
            } })
            fixture.settle(user, id)
            local context = fixture.agent_context(id, "s-" .. user, "agent-a")
            local missing, missing_err = fixture.op(user, "tool_forget", { input = { key = "colors" } }, context)
            test.is_nil(missing_err, tostring(missing_err))
            test.is_false(missing.success)
            test.is_true(missing.error:find("value is required", 1, true) ~= nil, missing.error)
            local result, err = fixture.op(user, "tool_forget", { input = { key = "colors", value = "cobalt" } }, context)
            test.is_nil(err, tostring(err))
            test.is_true(result.success, result.error)
            fixture.settle(user, id)
            local erased, kept = 0, 0
            for _, item in ipairs(fixture.items(user, id, { key = "colors" })) do
                if item.status == "forgotten" then erased = erased + 1
                else kept = kept + 1; test.eq(item.value, false) end
            end
            test.eq(erased, 2)
            test.eq(kept, 1)
            local boolean, boolean_err = fixture.op(user, "tool_forget", { input = { key = "colors", value = false } }, context)
            test.is_nil(boolean_err, tostring(boolean_err))
            test.is_true(boolean.success, boolean.error)
            fixture.settle(user, id)
            for _, item in ipairs(fixture.items(user, id, { key = "colors" })) do test.eq(item.status, "forgotten") end
        end)

        test.it("reports existing keys closest to an unknown key without exposing another scope", function()
            local user, other = fixture.user(), fixture.user()
            local id = fixture.memory(user)
            for _, key in ipairs({ "color", "timezone" }) do
                fixture.op(user, "create", { component_id = id, fields = {
                    kind = "profile_slot", scope_family = "owner", key = key, value = "configured", content = "A configured attribute.",
                } })
            end
            fixture.remember(user, id, { fixture.candidate("fact", "private_key", "secret", "A private attribute.") }, "private", { scope_id = other })
            fixture.settle(user, id)
            local result, err = fixture.op(user, "tool_forget", { input = { key = "colour" } },
                fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_false(result.success)
            test.is_true(result.error:find("color, timezone", 1, true) ~= nil, result.error)
            test.is_nil((result.error:find("private_key", 1, true)))
        end)

        test.it("uses checkpoint options independently of the agent model", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "summary", role = "user", content = "A working task." } })
            fixture.script.respond("generate", "Continue the working task.")
            local payload = fixture.payload("checkpoint", session, "agent-a", {
                agent = { id = "agent-a", model = "missing-agent-model" }, options = { model = "class:fast", max_tokens = 73 },
            })
            local result, err = fixture.op(user, "checkpoint", { payload = payload }, fixture.agent_context(id, session, "agent-a", { write_enabled = false }))
            test.is_nil(err, tostring(err))
            test.eq(result.summary, "Continue the working task.")
            test.eq(fixture.script.requests("generate")[1].options.max_tokens, 73)
        end)

        test.it("rejects missing checkpoint model and invalid token options before reading history", function()
            local user = fixture.user()
            for _, options in ipairs({ {}, { model = "class:fast", max_tokens = 0 }, { model = "class:fast", max_tokens = 1.5 } }) do
                local payload = fixture.payload("checkpoint", "absent-history", "agent-a", { options = options })
                local result, err = fixture.op(user, "checkpoint", { payload = payload })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
                test.is_true(err:message():find("checkpoint options require", 1, true) ~= nil, tostring(err))
            end
            test.eq(#fixture.script.requests("generate"), 0)
        end)

        test.it("returns consolidation wake failures from deactivation", function()
            local user = fixture.user()
            for _, missing in ipairs({ "job", "run" }) do
                local id = fixture.memory(user)
                local db = fixture.db()
                local statement = missing == "job" and "UPDATE kickside_memory_runs SET job_id = NULL WHERE id = $1"
                    or "DELETE FROM kickside_memory_runs WHERE id = $1"
                local _, update_err = db:execute(statement, { "consolidate:" .. id })
                db:release()
                test.is_nil(update_err, tostring(update_err))
                local result, err = apply(user, "deactivate", id, "s-" .. user, "agent-a")
                test.not_nil(err)
                test.eq(err:kind(), errors.NOT_FOUND)
                test.is_nil(result)
            end
        end)

        test.it("records one content-free failure message without changing supplied details", function()
            local result, err = fixture.op(fixture.user(), "diagnostics", {})
            test.is_nil(err, tostring(err))
            for _, details in ipairs({ result.details, result.cause_details, result.invalid_details,
                result.unavailable_details, result.failed_details }) do
                test.is_nil(details.memory_explanation)
                test.eq(details.marker, "unchanged")
            end
            test.eq(result.failed_message, "dependency failed")
            test.eq(result.failure.explanation, "dependency failed")
            test.eq(result.failure.kind, errors.TIMEOUT)
            test.is_true(result.failure.retryable)
            test.is_nil((json.encode(result.failure):find("Private span text", 1, true)))
        end)

        test.it("keeps failed capture spans unconsumed for the next capture", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "failed-span", role = "user", content = "I prefer aisle seats." } })
            fixture.script.fail("structured_output", "provider rejects aisle seats", errors.INVALID)
            local first = apply(user, "before_step", id, session, "agent-a")
            local failed = fixture.wait_runs(user, id, "derive", 1)[1]
            fixture.wait_job(failed.job_id, "dead")
            test.eq(failed.status, "failed")
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.is_true(cursor == nil or cursor.last_event_id == "")
            fixture.extraction({ fixture.candidate("preference", "seat_position", "aisle", "The user prefers aisle seats.", "failed-span") })
            local second = apply(user, "before_step", id, session, "agent-a")
            test.is_true(second.metadata.capture.captured)
            test.is_true(first.metadata.capture.run_id ~= second.metadata.capture.run_id)
            fixture.wait_runs(user, id, "derive", 2)
            fixture.settle(user, id)
            test.eq(fixture.items(user, id)[1].value, "aisle")
            local retained = fixture.op(user, "run", { run_id = failed.id })
            test.eq(retained.status, "failed")
            test.eq(json.decode(retained.last_error).explanation, "memory extraction failed")
            cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, "failed-span")
        end)

        test.it("retains an exhausted transient failure and captures its source after recovery", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "seat-request", role = "user", content = "I prefer aisle seats." } })
            for i = 1, 3 do fixture.script.fail("structured_output", "Rejected private span text", errors.TIMEOUT) end
            local applied, err = apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local failed = fixture.wait_runs(user, id, "derive", 1)[1]
            local job = fixture.wait_job(failed.job_id, "dead")
            test.eq(job.attempts, 3)
            failed = fixture.op(user, "run", { run_id = failed.id })
            local diagnostic = json.decode(failed.last_error)
            test.eq(diagnostic.kind, errors.TIMEOUT)
            test.eq(diagnostic.explanation, "memory extraction failed")
            test.is_nil((failed.last_error:find("private span text", 1, true)))
            fixture.history.record(session, { { id = "continue", role = "user", content = "Let us continue." } })
            fixture.extraction({ fixture.candidate("preference", "seat_position", "aisle", "The user prefers aisle seats.", "seat-request") })
            local recovered, recovery_err = apply(user, "before_step", id, session, "agent-a")
            test.is_nil(recovery_err, tostring(recovery_err))
            test.is_true(recovered.metadata.capture.captured)
            fixture.wait_runs(user, id, "derive", 2)
            fixture.settle(user, id)
            test.eq(fixture.items(user, id)[1].value, "aisle")
            local retained = fixture.op(user, "run", { run_id = applied.metadata.capture.run_id })
            test.eq(retained.status, "failed")
            test.eq(retained.last_error, failed.last_error)
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
            apply(user, "before_step", id, session, "agent-a")
            fixture.wait_runs(user, id, "derive", 1)
            fixture.history.record(session, { { id = "answer", role = "user", content = "London" } })
            fixture.extraction({ fixture.candidate("plan", "trip_tickets", { status = "open", next_step = "Compare routes", details = "London tickets" }, "The user needs London tickets.", "answer") })
            fixture.verdict("SUPERSEDE", { seeded.item_ids[1] })
            apply(user, "before_step", id, session, "agent-a")
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

        test.it("reconciles compound tool and extracted attributes independently after one attribute changes", function()
            local user = fixture.user()
            for _, example in ipairs({
                { tool = true, value = "Engineer at Northstar", content = "The user is an engineer at Northstar.", parts = {
                    fixture.candidate("profile_slot", "employer", "Northstar", "The user works at Northstar.", "compound-source"),
                    fixture.candidate("profile_slot", "occupation", "engineer", "The user is an engineer.", "compound-source"),
                }, changed = "Harbor" },
                { value = "Cedar College studying chemistry", content = "The user studies chemistry at Cedar College.", parts = {
                    fixture.candidate("profile_slot", "school", "Cedar College", "The user attends Cedar College.", "compound-source"),
                    fixture.candidate("profile_slot", "field_of_study", "chemistry", "The user studies chemistry.", "compound-source"),
                }, changed = "Pine Institute" },
            }) do
                local id = fixture.memory(user)
                local session = "s-" .. id
                local parts = example.parts
                local compound = fixture.candidate("fact", "background", example.value, example.content, "compound-source")
                fixture.history.record(session, { { id = "compound-source", role = "user", content = example.content } })
                if example.tool then
                    local mappings = {}
                    for _, part in ipairs(parts) do
                        mappings[#mappings + 1] = { key = part.key, kind = part.kind, cardinality = part.cardinality, value = part.value, content = part.content }
                    end
                    fixture.script.respond("structured_output", { mappings = { ["1"] = mappings } })
                else fixture.extraction(parts) end
                if example.tool then
                    local result, err = fixture.op(user, "tool_remember", { input = compound }, fixture.agent_context(id, session, "agent-a"))
                    test.is_nil(err, tostring(err))
                    test.is_true(result.success)
                    test.eq(#result.item_ids, 2)
                else
                    local _, err = apply(user, "before_step", id, session, "agent-a")
                    test.is_nil(err, tostring(err))
                    test.eq(fixture.wait_runs(user, id, "derive", 1)[1].status, "succeeded")
                end
                fixture.settle(user, id)
                local first = fixture.items(user, id, { key = parts[1].key })[1]
                local second = fixture.items(user, id, { key = parts[2].key })[1]
                test.eq(fixture.op(user, "provenance", { component_id = id, item_id = first.id })[1].event_id, "compound-source")
                test.eq(fixture.op(user, "provenance", { component_id = id, item_id = second.id })[1].event_id, "compound-source")
                local changed = fixture.candidate("profile_slot", parts[1].key, example.changed, "The user changes this attribute.", "change-source")
                fixture.normalization({ changed })
                local result, err = fixture.op(user, "tool_remember", { input = changed }, fixture.agent_context(id, session, "agent-a"))
                test.is_nil(err, tostring(err))
                test.is_true(result.success)
                fixture.settle(user, id)
                test.eq(fixture.op(user, "get", { component_id = id, item_id = first.id }).status, "superseded")
                local retained = fixture.op(user, "get", { component_id = id, item_id = second.id })
                test.eq(retained.status, "current")
                test.eq(retained.value, parts[2].value)
                test.eq(#fixture.items(user, id, { statuses = { "current" } }), 2)
                test.eq(fixture.script.pending("structured_output"), 0)
            end
        end)

        test.it("allows new attribute topics while excluding existing goal topics from normalization", function()
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
                local schema = fixture.script.requests("structured_output")[1].properties.mappings.properties["1"].items.properties.key
                test.not_nil(schema["not"], "The model must not select an existing goal as an attribute topic")
                test.eq(table.concat(schema["not"].enum, ","), "travel_help")
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

        test.it("pins open goals across conversations and retains completed and expired goals for search", function()
            local user = fixture.user()
            local id = fixture.memory(user, { plan_expiry_days = 7 })
            local function plan(key: string, status: string, details: string): any
                local result, err = fixture.op(user, "create", { component_id = id, fields = {
                    kind = "plan", scope_family = "owner", key = key,
                    value = { status = status, next_step = "Compare tickets", details = details },
                    content = "The user plans " .. details .. ".",
                } })
                test.is_nil(err, tostring(err))
                return result
            end
            local trip = plan("trip_tickets", "open", "London from Berlin")
            plan("garden_design", "open", "a vegetable garden")
            plan("finished_goal", "done", "a completed course")
            local expired = plan("old_goal", "open", "an old project")
            fixture.settle(user, id)
            local db = fixture.db()
            local _, update_err = db:execute("UPDATE kickside_memory_items SET recorded_at = $1 WHERE id = $2", { "2020-01-01T00:00:00Z", expired.item_id })
            db:release()
            test.is_nil(update_err, tostring(update_err))
            local session = "s-" .. user
            apply(user, "activate", id, session, "agent-a")
            local prompt = fixture.op(user, "prompt", {}, fixture.agent_context(id, session, "agent-a"))
            test.is_true(prompt:find("London from Berlin", 1, true) ~= nil, prompt)
            test.is_true(prompt:find("vegetable garden", 1, true) ~= nil, prompt)
            test.is_true(prompt:find("Compare tickets", 1, true) ~= nil, prompt)
            test.is_nil(prompt:find("completed course", 1, true), prompt)
            test.is_nil(prompt:find("old project", 1, true), prompt)
            local finished, finish_err = fixture.op(user, "edit", { component_id = id, item_id = trip.item_id, fields = {
                value = { status = "done", next_step = "", details = "London tickets booked" }, content = "The user booked London tickets.",
            } })
            test.is_nil(finish_err, tostring(finish_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = trip.item_id }).status, "superseded")
            test.eq(fixture.op(user, "get", { component_id = id, item_id = finished.item_id }).cardinality, "single")
            local found = fixture.op(user, "tool_search", { input = { query = "old project" } }, fixture.agent_context(id, session, "agent-a"))
            test.is_true(found.success)
            local seen = false
            for _, item in ipairs(found.items) do if item.id == expired.item_id then seen = true end end
            test.is_true(seen)
        end)

        test.it("rejects a plan without a typed goal state", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local result, err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "plan", scope_family = "owner", key = "trip_tickets", value = "London", content = "The user plans a London trip.",
            } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(#fixture.items(user, id), 0)
        end)

        test.it("extracts canonical keys and scalar values before claim identity", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seed = fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "seed", "2026-09-01T10:00:00Z") }, "normalize-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "move", role = "user", content = "I moved to Berlin." } })
            fixture.extraction({ fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "move") })
            fixture.verdict("SUPERSEDE", { seed.item_ids[1] })
            local applied, err = apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            fixture.settle(user, id)
            local rows = values(fixture.items(user, id))
            test.eq(rows.Berlin.key, "home_city")
            test.eq(rows.Berlin.version, 2)
            test.eq(rows.Paris.status, "superseded")
        end)

        test.it("carries preceding questions as uncitable context into extraction and reconciliation", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "seed") }, "context-seed")
            fixture.settle(user, id)
            fixture.history.record(session, {
                { id = "question", role = "assistant", content = "Where are you planning to travel?" },
            })
            apply(user, "before_step", id, session, "agent-a")
            fixture.wait_runs(user, id, "derive", 1)
            fixture.history.record(session, { { id = "answer", role = "user", content = "London" } })
            fixture.extraction({ fixture.candidate("profile_slot", "home_city", "London", "The user lives in London.", "answer") })
            fixture.verdict("NOOP", { fixture.items(user, id)[1].id })
            apply(user, "before_step", id, session, "agent-a")
            local runs = fixture.wait_runs(user, id, "derive", 2)
            for _, run in ipairs(runs) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
            local prompts = fixture.script.prompts("structured_output")
            test.is_true(prompts[1].user:find("Where are you planning to travel?", 1, true) ~= nil, prompts[1].user)
            test.eq(table.concat(fixture.script.requests("structured_output")[1].properties.items.items.properties.event_id.enum, ","), "answer")
            test.is_true(prompts[2].user:find("Where are you planning to travel?", 1, true) ~= nil, prompts[2].user)
            test.eq(fixture.items(user, id)[1].value, "Berlin")
        end)

        test.it("captures the conversation since the cursor before a step, keeping user and assistant text only", function()
            local user = fixture.user()
            local id = fixture.memory(user, { capture_experience = true })
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "h1", role = "user", content = "Hi! I live in Paris and I am vegetarian." },
                { id = "h2", role = "developer", content = "- The user likes jazz.", metadata = { memory_ids = { "x" } } },
                { id = "h3", role = "function", content = "{\"rows\": 42}", metadata = { function_name = "lookup", status = "success" } },
                { id = "h4", role = "assistant", content = "Nice to meet you." },
            })
            fixture.extraction({
                fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "h1"),
                fixture.candidate("preference", "diet", "vegetarian", "The user is vegetarian.", "h1"),
            })
            local applied, err = apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            local span = runs[1].input.span
            test.eq(#span, 3)
            test.eq(span[1].id, "h1")
            test.eq(span[2].text, "tool lookup success")
            test.eq(span[3].id, "h4")
            test.eq(runs[1].input.owner_id, user)
            fixture.settle(user, id)
            local items = values(fixture.items(user, id))
            test.eq(items.Paris.scope_key, "owner:" .. user)
            test.eq(items.vegetarian.kind, "preference")
            local provenance = fixture.op(user, "get", { component_id = id, item_id = items.Paris.id })
            test.not_nil(provenance)
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, "h4")
        end)

        for _, phase in ipairs({ "before_step", "deactivate", "checkpoint" }) do
            test.it("enrolls statement-sized consecutive runs for " .. phase .. " with independent erasure ownership", function()
                local user = fixture.user()
                local id = fixture.memory(user)
                local session = "s-" .. user
                local capacity, capacity_err = fixture.op(user, "extraction_capacity", {})
                test.is_nil(capacity_err, tostring(capacity_err))
                test.is_true(capacity >= 1)
                local events = {}
                for i = 1, 2 * capacity + 1 do
                    events[#events + 1] = { id = "batch-" .. tostring(i), role = "user", content = "Statement " .. tostring(i) .. "." }
                    events[#events + 1] = { id = "reply-" .. tostring(i), role = "assistant", content = "Acknowledged." }
                end
                fixture.history.record(session, events)
                if phase == "checkpoint" then fixture.script.respond("generate", "Working state.") end
                -- Hold execution until every slice and its sources are enrolled.
                fixture.script.hold("structured_output")
                for i = 1, 3 do fixture.extraction({}) end
                local extra = phase == "deactivate" and { refs = { deactivation_range = { to_id = events[#events].id } } } or nil
                local applied, err
                if phase == "checkpoint" then
                    applied, err = fixture.op(user, "checkpoint", { payload = fixture.payload(phase, session, "agent-a") }, fixture.agent_context(id, session, "agent-a"))
                else applied, err = apply(user, phase, id, session, "agent-a", extra) end
                test.is_nil(err, tostring(err))
                test.is_true(applied.metadata.capture.captured)
                local enrolled = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
                test.eq(#enrolled, 3)
                table.sort(enrolled, function(a, b) return a.id < b.id end)
                local previous = ""
                for i, run in ipairs(enrolled) do
                    test.eq(run.from_event_id, previous)
                    test.eq(#run.input.span, i < 3 and 2 * capacity or 2)
                    local db = fixture.db()
                    local sources = db:query("SELECT event_id FROM kickside_memory_run_sources WHERE component_id = $1 AND run_id = $2", { id, run.id })
                    db:release()
                    test.eq(#sources, #run.input.span + #(run.input.context or {}))
                    previous = run.to_event_id
                end
                fixture.script.release("structured_output")
                local finished = fixture.wait_runs(user, id, "derive", 3)
                for _, run in ipairs(finished) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
                local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
                test.eq(cursor.last_event_id, events[#events].id)
                local ledger = fixture.op(user, "ledger", { component_id = id })
                local advanced = {}
                for _, event in ipairs(ledger) do
                    if event.type == "kickside.memory.events:capture.advanced" then advanced[#advanced + 1] = json.decode(event.body) end
                end
                test.eq(#advanced, 3)
                for i, event in ipairs(advanced) do
                    test.eq(event.from_event_id, enrolled[i].from_event_id)
                    test.eq(event.last_event_id, enrolled[i].to_event_id)
                end
                test.eq(#fixture.script.requests("structured_output"), 3)
                local seeded = fixture.remember(user, id, { fixture.candidate("fact", "setting", "retained", "A retained setting.", "batch-1") }, "batch-erasure")
                fixture.settle(user, id)
                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                for _, run in ipairs(enrolled) do
                    local erased = fixture.op(user, "run", { run_id = run.id })
                    test.is_nil(erased.input.span)
                end
            end)
        end

        test.it("does not advance consecutive captures past a failed predecessor", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local capacity = fixture.op(user, "extraction_capacity", {})
            local events = {}
            for i = 1, capacity + 1 do
                events[i] = { id = "failed-batch-" .. tostring(i), role = "user", content = "A statement." }
            end
            fixture.history.record(session, events)
            fixture.script.fail("structured_output", "Invalid model input", errors.INVALID, false)
            local applied, err = apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 2)
            for _, run in ipairs(runs) do test.eq(run.status, "failed", tostring(run.last_error)) end
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.is_true(cursor == nil or cursor.last_event_id == "")
            test.eq(#fixture.script.requests("structured_output"), 1)
        end)

        test.it("bounds deactivation capture to the outgoing agent history", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "earlier", role = "user", content = "An earlier conversation." },
                { id = "outgoing", role = "user", content = "I live in Paris." },
                { id = "incoming", role = "user", content = "A different agent handles this." },
            })
            fixture.extraction({})
            local applied, err = apply(user, "deactivate", id, session, "agent-a", {
                refs = { deactivation_range = { from_id = "earlier", to_id = "outgoing" } },
            })
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(#runs[1].input.span, 1)
            test.eq(runs[1].input.span[1].id, "outgoing")
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, "outgoing")
        end)

        for _, case in ipairs({
            { name = "first outgoing history", refs = { deactivation_range = { to_id = "b" } }, expected = "a,b" },
            { name = "explicit selector", refs = { deactivation_range = { to_id = "b" } }, selector = { mode = "range", from_id = "b", to_id = "c" }, expected = "c" },
            { name = "false selector", refs = { deactivation_range = { to_id = "b" } }, selector = false, expected = "a,b,c" },
            { name = "invalid outgoing bound", refs = { deactivation_range = { from_id = false, to_id = "b" } }, expected = "a,b,c" },
            { name = "cursor intersection", refs = { deactivation_range = { to_id = "b" } }, cursor = "a", expected = "b" },
            { name = "captured outgoing range", refs = { deactivation_range = { to_id = "b" } }, cursor = "c", expected = "" },
        }) do
            test.it("captures " .. case.name .. " without widening history", function()
                local user = fixture.user()
                local id = fixture.memory(user)
                local session = "s-" .. user
                fixture.history.record(session, {
                    { id = "a", role = "user", content = "The first message." },
                    { id = "b", role = "user", content = "The outgoing message." },
                    { id = "c", role = "user", content = "The incoming message." },
                })
                if case.cursor then
                    fixture.extraction({})
                    apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = case.cursor } })
                    local count = case.cursor == "c" and 2 or 1
                    if count == 2 then fixture.extraction({}) end
                    fixture.wait_runs(user, id, "derive", count)
                end
                local capacity = fixture.op(user, "extraction_capacity", {})
                local selected_count = case.expected == "" and 0 or #case.expected:gsub(",", "")
                local count = math.ceil(selected_count / capacity)
                for _ = 1, count do fixture.extraction({}) end
                local applied, err = apply(user, "deactivate", id, session, "agent-a", { refs = case.refs, selector = case.selector })
                test.is_nil(err, tostring(err))
                if case.expected == "" then
                    test.is_false(applied.metadata.capture.captured)
                else
                    local runs = fixture.wait_runs(user, id, "derive", count + (case.cursor and 1 or 0))
                    table.sort(runs, function(a, b) return a.id < b.id end)
                    local ids, capturing = {}, false
                    for _, run in ipairs(runs) do
                        if run.id == applied.metadata.capture.run_id then capturing = true end
                        if capturing then
                            test.eq(run.status, "succeeded", tostring(run.last_error))
                            for _, event in ipairs(run.input.span) do ids[#ids + 1] = event.id end
                        end
                    end
                    test.is_true(capturing)
                    test.eq(table.concat(ids, ","), case.expected)
                end
            end)
        end

        test.it("derives memories only from what the user states, never from assistant narration", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "n1", role = "assistant", content = "You told me you live in Rome and love opera." },
            })
            local applied = apply(user, "before_step", id, session, "agent-a")
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(runs[1].stats.candidates, 0)
            test.eq(#fixture.script.requests("structured_output"), 0)

            fixture.history.record(session, {
                { id = "n2", role = "user", content = "Book me an opera night next week." },
                { id = "n3", role = "assistant", content = "Sure, Rome has great opera." },
            })
            fixture.extraction({ fixture.candidate("preference", "evening", "opera", "The user wants an opera night.", "n2") })
            apply(user, "before_step", id, session, "agent-a")
            fixture.wait_runs(user, id, "derive", 2)
            local schema = fixture.script.requests("structured_output")[1]
            test.eq(table.concat(schema.properties.items.items.properties.event_id.enum, ","), "n2")
            local span = fixture.script.prompts("structured_output")[1].user
            test.is_true(span:find("[n2]", 1, true) ~= nil, span)
            test.is_true(span:find("[n3]", 1, true) == nil, span)
            test.is_true(span:find("(assistant, context only) Sure, Rome has great opera.", 1, true) ~= nil, span)
        end)

        test.it("offers extraction the keys already in use for the person, so a restated attribute keeps its key", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("profile_slot", "name", "Sam", "The user's name is Sam.", "k0"),
                fixture.candidate("preference", "diet", "vegetarian", "The user is vegetarian.", "k0"),
            }, "keys-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "k1", role = "user", content = "You can call me Sam, that's my preferred name." } })
            fixture.extraction({})
            apply(user, "before_step", id, session, "agent-a")
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            local prompt = fixture.script.prompts("structured_output")[1].system
            test.is_true(prompt:find("- preference: diet", 1, true) ~= nil, prompt)
            test.is_true(prompt:find("- profile_slot: name", 1, true) ~= nil, prompt)
        end)

        test.it("shows the reconcile judge what the person said, so an update is told from a contradiction", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "c0", "2026-09-01T10:00:00Z"),
            }, "city-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "c1", role = "user", content = "I moved to Berlin last month.", created_at = "2026-10-08T10:00:00Z" } })
            fixture.extraction({ fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "c1") })
            local paris = fixture.items(user, id)[1]
            fixture.verdict("SUPERSEDE", { paris.id })
            apply(user, "before_step", id, session, "agent-a")
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            local judge = fixture.script.prompts("structured_output")[2].user
            test.is_true(judge:find("I moved to Berlin last month.", 1, true) ~= nil, judge)
        end)

        test.it("brings consolidation forward when the agent deactivates, even with nothing new to capture", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local result, err = apply(user, "deactivate", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.eq(result.metadata.capture.reason, "no_new_history")
            local runs = fixture.wait_runs(user, id, "consolidate", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
        end)

        test.it("captures each persisted record once across after_persist and before_step", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "p1", role = "user", content = "My manager is Dana." },
                { id = "p2", role = "assistant", content = "Noted." },
            })
            fixture.extraction({ fixture.candidate("fact", "manager", "Dana", "The user's manager is Dana.", "p1") })
            local persisted, err = apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = "p2" } })
            test.is_nil(err, tostring(err))
            test.is_true(persisted.metadata.capture.captured)
            local again = apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = "p2" } })
            test.eq(again.metadata.capture.captured, false)
            fixture.wait_runs(user, id, "derive", 1)
            fixture.settle(user, id)
            local step = apply(user, "before_step", id, session, "agent-a")
            test.eq(step.metadata.capture.captured, false)
            test.eq(step.metadata.capture.reason, "no_new_history")
            fixture.history.record(session, { { id = "p3", role = "user", content = "Dana moved to the Berlin office." } })
            fixture.extraction({ fixture.candidate("fact", "manager_office", "Berlin", "The user's manager Dana works in the Berlin office.", "p3") })
            fixture.verdict("ADD", {})
            local next_step = apply(user, "before_step", id, session, "agent-a")
            test.is_true(next_step.metadata.capture.captured)
            fixture.wait_runs(user, id, "derive", 2)
            fixture.settle(user, id)
            local stale = apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = "p3" } })
            test.eq(stale.metadata.capture.reason, "already_captured")
            local runs = fixture.wait_runs(user, id, "derive", 2)
            test.eq(#runs, 2)
            for _, run in ipairs(runs) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 2)
        end)

        test.it("recalls current memories of the caller and agent scopes only, skipping injected ids", function()
            local alice, bob = fixture.user("alice"), fixture.user("bob")
            local id = fixture.memory(alice)
            fixture.remember(alice, id, { fixture.candidate("fact", "trip", "Lisbon", "The user is planning a trip to Lisbon in May.", "m1") }, "a1")
            fixture.verdict("ADD", {})
            fixture.remember(alice, id, { fixture.candidate("fact", "trip_budget", "2000", "The user's trip budget is 2000 euros.", "m2") }, "a2")
            fixture.remember(alice, id, { fixture.candidate("fact", "trip", "Tokyo", "The user is planning a trip to Tokyo.", "m3") }, "b1",
                { scope_id = bob })
            fixture.op(alice, "create", { component_id = id, fields = {
                kind = "lesson", scope_family = "agent", scope_id = "agent-a", key = "trip_lesson", value = "Trips: always ask for travel dates first.", content = "Trips: always ask for travel dates first.",
            } })
            fixture.op(alice, "create", { component_id = id, fields = {
                kind = "lesson", scope_family = "agent", scope_id = "agent-b", key = "trip_lesson", value = "Trips: prefer trains over flights.", content = "Trips: prefer trains over flights.",
            } })
            fixture.settle(alice, id)
            local input = { recent_actions = { "user: help me plan my trip" }, constraints = { max_items = 10 } }
            local recalled, err = fixture.op(alice, "recall", { input = input }, { memory_id = id, agent_id = "agent-a" })
            test.is_nil(err, tostring(err))
            local seen = {}
            for _, memory in ipairs(recalled.memories) do seen[memory.content] = memory end
            test.not_nil(seen["The user is planning a trip to Lisbon in May."])
            test.not_nil(seen["Trips: always ask for travel dates first."])
            test.is_nil(seen["The user is planning a trip to Tokyo."])
            test.is_nil(seen["Trips: prefer trains over flights."])
            local lisbon = seen["The user is planning a trip to Lisbon in May."]
            test.eq(lisbon.metadata.type, "fact")

            local skipped = fixture.op(alice, "recall", { input = {
                recent_actions = input.recent_actions, constraints = input.constraints, previous_memories = { lisbon.id },
            } }, { memory_id = id, agent_id = "agent-a" })
            for _, memory in ipairs(skipped.memories) do test.neq(memory.id, lisbon.id) end
            test.eq(#skipped.memories, #recalled.memories - 1)

            local bobs = fixture.op(bob, "recall", { input = input }, { memory_id = id, agent_id = "agent-b" })
            test.is_nil(bobs, "bob has no access to alice's memory")
        end)

        test.it("renders the pinned owner slice byte-identically until the next activation", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.remember(user, id, { fixture.candidate("preference", "tone", "concise", "The user prefers concise answers.", "m1") }, "p1")
            fixture.verdict("ADD", {})
            local _, name_err = fixture.remember(user, id, { fixture.candidate("profile_slot", "name", "Sam", "The user's name is Sam.", "m2") }, "p2")
            test.is_nil(name_err, tostring(name_err))
            fixture.settle(user, id)
            local _, err = apply(user, "activate", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local context = fixture.agent_context(id, session, "agent-a")
            local first = fixture.op(user, "prompt", {}, context)
            test.eq(first, "## What you know about the user\nUse these facts as defaults. Do not ask the user to repeat or confirm an attribute shown here. Apply it when relevant, state the assumption and let the user correct it. Ask only for missing details.\n- Name [name]: Sam\n- Tone [tone]: concise")
            fixture.verdict("ADD", {})
            local _, add_err = fixture.remember(user, id, { fixture.candidate("preference", "format", "bullets", "The user likes bullet lists.", "m3") }, "p3")
            test.is_nil(add_err, tostring(add_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "prompt", {}, context), first)
            apply(user, "activate", id, session, "agent-a")
            local second = fixture.op(user, "prompt", {}, context)
            test.neq(second, first)
            test.is_true(second:find("Format [format]: bullets", 1, true) ~= nil)
        end)

        test.it("contributes the agent's identity and rules in a deterministic order", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            for _, fields in ipairs({
                { kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "units", value = "Use metric units.", content = "Use metric units.", priority = 1 },
                { kind = "identity", scope_family = "agent", scope_id = "agent-a", key = "name", value = "You are Ada.", content = "You are Ada." },
                { kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "currency", value = "Quote prices in euros.", content = "Quote prices in euros.", priority = 5 },
                { kind = "rule", scope_family = "agent", scope_id = "agent-b", key = "other", value = "Not for agent a.", content = "Not for agent a." },
            }) do
                local _, err = fixture.op(user, "create", { component_id = id, fields = fields })
                test.is_nil(err, tostring(err))
            end
            fixture.settle(user, id)
            local built, err = fixture.op(user, "build", { context = { memory_id = id, agent_id = "agent-a" } })
            test.is_nil(err, tostring(err))
            test.eq(built.prompt, "## Agent memory\n- You are Ada.\n- Quote prices in euros.\n- Use metric units.")
            local again = fixture.op(user, "build", { context = { memory_id = id, agent_id = "agent-a" } })
            test.eq(again.prompt, built.prompt)
        end)

        test.it("writes tool memories into the caller's own scope of an attached memory only", function()
            local user, other = fixture.user(), fixture.user("other")
            local id = fixture.memory(user)
            local foreign = fixture.memory(user)
            local session = "s-" .. user
            local context = fixture.agent_context(id, session, "agent-a")
            fixture.normalization({ { key = "dog_name", value = "Rex" } })
            local stored, err = fixture.op(user, "tool_remember", { input = { content = "The user's dog is called Rex.", kind = "fact", key = "dog_name", value = "Rex" } }, context)
            test.is_nil(err, tostring(err))
            test.is_true(stored.success)
            fixture.settle(user, id)
            local item = fixture.op(user, "get", { component_id = id, item_id = stored.item_ids[1] })
            test.eq(item.scope_key, "owner:" .. user)
            test.eq(item.source, "tool")
            local identity = fixture.op(user, "tool_remember", { input = { content = "I am root.", kind = "identity" } }, context)
            test.eq(identity.success, false)
            local found = fixture.op(user, "tool_search", { input = { query = "dog called" } }, context)
            test.is_true(found.success)
            test.eq(found.items[1].id, stored.item_ids[1])
            local elsewhere = fixture.op(user, "tool_search", { input = { query = "dog called" } }, fixture.agent_context(foreign, session, "agent-a"))
            test.eq(elsewhere.count, 0)

            fixture.remember(user, id, { fixture.candidate("fact", "secret", "x", "Another user's fact.", "m1") }, "o1", { scope_id = other })
            fixture.settle(user, id)
            local denied = fixture.op(user, "tool_forget", { input = { key = "secret", value = "x" } }, context)
            test.eq(denied.success, false)
            fixture.history.record(session, { { id = "forget-dog", role = "user", content = "Forget my dog's name." } })
            local forgotten = fixture.op(user, "tool_forget", { input = { key = "dog_name", value = "Rex" } }, context)
            test.is_true(forgotten.success)
        end)

        test.it("checkpoints with a working summary and captures the compacted range", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "c1", role = "user", content = "Book the Lisbon hotel for May 3 to May 7." },
                { id = "c2", role = "assistant", content = "Booked." },
            })
            fixture.script.respond("generate", "Goal: Lisbon trip. Hotel booked May 3-7.")
            fixture.extraction({ fixture.candidate("fact", "hotel", "Lisbon May 3-7", "The user booked a Lisbon hotel for May 3 to 7.", "c1") })
            local result, err = fixture.op(user, "checkpoint", { payload = fixture.payload("checkpoint", session, "agent-a") },
                fixture.agent_context(id, session, "agent-a"))
            test.is_nil(err, tostring(err))
            test.eq(result.summary, "Goal: Lisbon trip. Hotel booked May 3-7.")
            test.is_true(result.metadata.capture.captured)
            fixture.wait_runs(user, id, "derive", 1)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 1)
        end)

        test.it("resolves an agent explicitly selecting the Memory trait", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local trait = "kickside.memory:memory"
            local created, create_err = fixture.call_as(user, "kickside.agents.registry:a_create", {
                name = "memory agent", model = "test-fast", traits = { trait },
                trait_contexts = { [trait] = {
                    memory_id = memory, read_enabled = true, write_enabled = true, recall_limit = 5,
                } },
            })
            test.is_nil(create_err, tostring(create_err))
            local agent, resolve_err = fixture.call_as(user, "kickside.agents:agent_resolver_func",
                { agent_id = "user_agent:" .. created.component_id })
            test.is_nil(resolve_err, tostring(resolve_err))
            test.not_nil(agent, "the resolver found no agent")
            local context
            for _, spec in ipairs(agent.traits or {}) do
                if spec.id == trait then context = spec.context end
            end
            test.not_nil(context)
            local id, err = fixture.op(user, "resolve_memory", { context = context })
            test.is_nil(err, tostring(err))
            test.eq(id, memory)
        end)

        test.it("classifies deterministic and transient model failures through checkpoint and derive surfaces", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "model-1", role = "user", content = "I live in Oslo." } })

            fixture.script.fail("generate", "model rejected the summary request", errors.INVALID, true)
            local _, invalid_err = fixture.op(user, "checkpoint", { payload = fixture.payload("checkpoint", session, "agent-a") },
                fixture.agent_context(id, session, "agent-a"))
            test.not_nil(invalid_err)
            test.eq(invalid_err:kind(), errors.INTERNAL)
            test.eq(invalid_err:retryable(), false)
            test.eq(invalid_err:details().cause.kind, errors.INVALID)

            fixture.script.fail("generate", "model denied the summary request", errors.PERMISSION_DENIED)
            local _, denied_err = fixture.op(user, "checkpoint", { payload = fixture.payload("checkpoint", session, "agent-a") },
                fixture.agent_context(id, session, "agent-a"))
            test.not_nil(denied_err)
            test.eq(denied_err:kind(), errors.INTERNAL)
            test.eq(denied_err:retryable(), false)
            test.eq(denied_err:details().cause.kind, errors.PERMISSION_DENIED)

            fixture.script.fail("generate", "model timed out", errors.TIMEOUT)
            local _, transient_err = fixture.op(user, "checkpoint", { payload = fixture.payload("checkpoint", session, "agent-a") },
                fixture.agent_context(id, session, "agent-a"))
            test.not_nil(transient_err)
            test.eq(transient_err:kind(), errors.TIMEOUT)
            test.eq(transient_err:retryable(), true)
            test.eq(transient_err:details().cause.kind, errors.TIMEOUT)

            fixture.script.fail("structured_output", "model rejected extraction", errors.INVALID)
            local applied, apply_err = apply(user, "before_step", id, session, "agent-a")
            test.is_nil(apply_err, tostring(apply_err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "failed")
            local job = fixture.wait_job(runs[1].job_id, "dead")
            test.eq(job.attempts, 1)
            local failure = json.decode(runs[1].last_error)
            test.eq(failure.kind, errors.INTERNAL)
            test.eq(failure.code, errors.INVALID)
            test.eq(failure.explanation, "memory extraction failed")
            test.is_nil(runs[1].last_error:find("model rejected extraction", 1, true))
        end)

        test.it("compiles an agent mounting the trait with its lifecycle, after_persist and checkpoint behavior", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local compiled, err = fixture.op(user, "compile", { spec = {
                id = "agent-compiled", name = "compiled", prompt = "You plan trips.", model = "test-fast",
                traits = { { id = "kickside.memory:memory", context = { memory_id = memory } } },
            } })
            test.is_nil(err, tostring(err))
            test.eq(#compiled.bindings.memory, 1)
            test.eq(compiled.bindings.memory[1].binding, "kickside.memory.agent:memory_binding")
            test.eq(compiled.bindings.memory[1].context.memory_id, memory)
            local text = json.encode(compiled)
            test.is_true(text:find("kickside.memory.agent:lifecycle_binding", 1, true) ~= nil, text)
            test.is_true(text:find("after_persist", 1, true) ~= nil, text)
            test.is_true(text:find("kickside.memory.agent:checkpoint_binding", 1, true) ~= nil, text)
        end)

        test.it("recalls, captures, pins and supplies tools from only a trait and its context", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local session, agent_id = "s-" .. user, "trait-agent"
            local spec = { id = agent_id, name = "Planner", prompt = "Plan trips.", model = "test-fast",
                traits = { { id = "kickside.memory:memory", context = { memory_id = memory } } } }
            local profile, profile_err = fixture.op(user, "create", { component_id = memory, fields = {
                kind = "profile_slot", scope_family = "owner", scope_id = user,
                key = "home_city", value = "Berlin", content = "The user lives in Berlin.",
            } })
            test.is_nil(profile_err, tostring(profile_err))
            local fact, fact_err = fixture.op(user, "create", { component_id = memory, fields = {
                kind = "fact", scope_family = "owner", scope_id = user,
                key = "train_seat", value = "window", content = "The user prefers window seats on trains.",
            } })
            test.is_nil(fact_err, tostring(fact_err))
            fixture.settle(user, memory)
            local run_context = fixture.agent_context(memory, session, agent_id)
            run_context.memory_id = nil
            local activated, activate_err = fixture.op(user, "trait_agent", {
                spec = spec, payload = fixture.payload("activate", session, agent_id),
            }, run_context)
            test.is_nil(activate_err, tostring(activate_err))
            test.eq(#activated.errors, 0)
            local pinned = fixture.op(user, "cursor", { component_id = memory, host_kind = "session", host_id = session })
            test.is_true(pinned.pinned_prompt:find("Home city [home_city]: Berlin", 1, true) ~= nil)
            fixture.script.respond("generate", "Choose a window seat.")
            local stepped, step_err = fixture.op(user, "trait_agent", {
                spec = spec, messages = { { role = "user", text = "Plan a train trip" },
                    { role = "assistant", text = "Which seat would you like?" },
                    { role = "user", text = "Which train seat do I prefer?" } },
            }, run_context)
            test.is_nil(step_err, tostring(step_err))
            test.is_nil(stepped.response.memory_recall_error)
            test.not_nil(stepped.response.memory_recall, json.encode(stepped.response))
            test.eq(stepped.response.memory_recall.memory_ids[1], fact.item_id)
            test.not_nil(stepped.compiled.tools.SearchMemory, json.encode(stepped.compiled.tools))
            test.not_nil(stepped.compiled.tools.Remember, "Remember tool")
            test.not_nil(stepped.compiled.tools.ForgetMemory, "ForgetMemory tool")
            fixture.history.record(session, { { id = "trait-capture", role = "user", content = "I prefer aisle seats." } })
            fixture.extraction({ fixture.candidate("preference", "seat_position", "aisle", "The user prefers aisle seats.", "trait-capture") })
            fixture.verdict("ADD", {})
            local captured, capture_err = fixture.op(user, "trait_agent", {
                spec = spec, payload = fixture.payload("before_step", session, agent_id),
            }, run_context)
            test.is_nil(capture_err, tostring(capture_err))
            test.eq(#captured.errors, 0)
            test.is_true(captured.metadata[1].metadata.capture.captured)
            local runs = fixture.wait_runs(user, memory, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            fixture.settle(user, memory)
            test.not_nil(values(fixture.items(user, memory)).aisle)
        end)

        test.it("requires a selected memory for compilation, prompt and tools", function()
            local user = fixture.user()
            local _, compile_err = fixture.op(user, "build", { context = {} })
            test.not_nil(compile_err)
            test.is_true(tostring(compile_err):find("no memory selected", 1, true) ~= nil)
            local _, prompt_err = fixture.op(user, "prompt", {})
            test.not_nil(prompt_err)
            local unset = fixture.op(user, "tool_search", { input = { query = "cat" } }, {})
            test.is_false(unset.success)
            test.is_true(unset.error:find("no memory selected", 1, true) ~= nil)
            local _, capture_err = fixture.op(user, "apply", { payload = fixture.payload("before_step", "session", "agent-a") }, {})
            test.not_nil(capture_err)
        end)

        test.it("fails the lifecycle with the error when the history cannot be read", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local payload = fixture.payload("before_step", "s-missing", "agent-a")
            payload.run_context.binding = "app.suites:no_such_binding"
            local _, err = fixture.op(user, "apply", { payload = payload }, fixture.agent_context(id, "s-missing", "agent-a"))
            test.not_nil(err)
            local _, host_err = fixture.op(user, "apply", { payload = { phase = "before_step" } }, fixture.agent_context(id, "s", "a"))
            test.not_nil(host_err)
            local ignored = fixture.op(user, "apply", { payload = fixture.payload("after_step", "s", "agent-a") }, fixture.agent_context(id, "s", "a"))
            test.is_true(ignored.metadata.ignored)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
