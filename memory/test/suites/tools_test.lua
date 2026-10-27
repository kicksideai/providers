-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("tools", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("stores curated typed claims without normalization or semantic judgement", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local context = fixture.agent_context(id, "s-" .. user, "agent-a")
            for _, input in ipairs({
                { kind = "fact", key = "switch", value = false, content = "A disabled switch.", cardinality = "multi" },
                { kind = "profile_slot", key = "contact_time", value = "evening", content = "Contact in the evening.", cardinality = "single" },
                { kind = "profile_slot", key = "contact_time", value = "morning", content = "Contact in the morning.", cardinality = "single" },
                { kind = "profile_slot", key = "contact_time", value = "morning", content = "Contact in the morning.", cardinality = "single" },
            }) do
                local result, err = fixture.op(user, "tool_remember", { input = input }, context)
                test.is_nil(err, tostring(err))
                test.is_true(result.success, result.error)
                test.eq(result.outcome.judged, 0)
                fixture.settle(user, id)
            end
            local rows = fixture.items(user, id)
            test.eq(#rows, 3)
            test.eq(#fixture.script.requests("structured_output"), 0)
        end)

        test.it("validates curated cardinality and kind even when a claim already exists", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local created = fixture.create_claim(user, id, "Oslo")
            for _, entry in ipairs({
                { kind = "fact", cardinality = "multi" },
                { kind = "lesson", cardinality = "single" },
            }) do
                local result, err = fixture.op(user, "create", { component_id = id, fields = {
                    kind = entry.kind, cardinality = entry.cardinality, scope_family = "owner", key = "home_city", value = "Oslo", content = "Lives in Oslo.",
                } })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
            test.eq(#fixture.items(user, id), 1)
        end)

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

        test.it("dates remembered plans by the source statement instead of the scheduled event", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local context = fixture.agent_context(id, session, "agent-a")
            local input = { kind = "plan", key = "prepare_review", cardinality = "single",
                value = { status = "open", next_step = "Prepare slides", details = "Prepare the review" },
                content = "The user needs to prepare the review." }
            fixture.history.record(session, { { id = "initial", role = "user", content = "Prepare the review.", created_at = "2026-10-10T10:00:00Z" } })
            local initial, initial_err = fixture.op(user, "tool_remember", { input = input }, context)
            test.is_nil(initial_err, tostring(initial_err))
            test.is_true(initial.success, initial.error)
            fixture.settle(user, id)
            local current = fixture.items(user, id, { key = input.key, statuses = { "current" } })
            test.eq(current[1].valid_at, "2026-10-10T10:00:00Z")
            fixture.history.record(session, { { id = "dated", role = "user", content = "It's on March 14.", created_at = "2026-10-20T10:00:00Z" } })
            input.value.details = "Prepare the review scheduled for March 14"
            input.content = "The user's review is on March 14."
            input.valid_at = "2026-03-14T00:00:00Z"
            local updated, updated_err = fixture.op(user, "tool_remember", { input = input }, context)
            test.is_nil(updated_err, tostring(updated_err))
            test.is_true(updated.success, updated.error)
            fixture.settle(user, id)
            current = fixture.items(user, id, { key = input.key, statuses = { "current" } })
            test.eq(#current, 1)
            test.eq(current[1].id, updated.item_ids[1])
            test.eq(current[1].valid_at, "2026-10-20T10:00:00Z")
            test.eq(current[1].value.details, input.value.details)
        end)

        test.it("rejects invalid curated keys values times and established cardinalities without models", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.create_claim(user, id, "Oslo")
            for _, input in ipairs({
                { kind = "fact", key = "Home City", value = "Bergen", content = "Lives in Bergen." },
                { kind = "plan", key = "work_goal", value = "work", content = "Finish work." },
                { kind = "fact", key = "home_city", value = "Oslo", content = "Lives in Oslo.", cardinality = "multi" },
                { kind = "lesson", key = "home_city", value = "Oslo", content = "Lives in Oslo.", cardinality = "single" },
                { kind = "fact", key = "contact_time", value = "evening", content = "Contact in the evening.", valid_at = "yesterday" },
            }) do
                local result, err = fixture.op(user, "tool_remember", { input = input }, fixture.agent_context(id, "s-" .. user, "agent-a"))
                test.is_true(err ~= nil or result.success == false)
                fixture.settle(user, id)
                test.eq(#fixture.items(user, id), 1)
            end
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

        test.it("reconciles compound tool and extracted attributes independently after one attribute changes", function()
            local user = fixture.user()
            for _, example in ipairs({
                { tool = true, value = "Engineer at Northstar", content = "The user is an engineer at Northstar.", parts = {
                    fixture.candidate("profile_slot", "employer", "Northstar", "Employer: Northstar.", "compound-source"),
                    fixture.candidate("profile_slot", "occupation", "engineer", "Occupation: engineer.", "compound-source"),
                }, changed = "Harbor" },
                { value = "Cedar College studying chemistry", content = "The user studies chemistry at Cedar College.", parts = {
                    fixture.candidate("profile_slot", "school", "Cedar College", "School: Cedar College.", "compound-source"),
                    fixture.candidate("profile_slot", "field_of_study", "chemistry", "Field of study: chemistry.", "compound-source"),
                }, changed = "Pine Institute" },
            }) do
                local id = fixture.memory(user)
                local session = "s-" .. id
                local parts = example.parts
                local compound = fixture.candidate("fact", "background", example.value, example.content, "compound-source")
                fixture.history.record(session, { { id = "compound-source", role = "user", content = example.content } })
                if not example.tool then fixture.extraction(parts) end
                if example.tool then
                    for _, part in ipairs(parts) do
                        local result, err = fixture.op(user, "tool_remember", { input = part }, fixture.agent_context(id, session, "agent-a"))
                        test.is_nil(err, tostring(err))
                        test.is_true(result.success)
                        test.eq(#result.item_ids, 1)
                    end
                else
                    local _, err = fixture.apply(user, "before_step", id, session, "agent-a")
                    test.is_nil(err, tostring(err))
                    test.eq(fixture.wait_runs(user, id, "derive", 1)[1].status, "succeeded")
                end
                fixture.settle(user, id)
                local first = fixture.items(user, id, { key = parts[1].key })[1]
                local second = fixture.items(user, id, { key = parts[2].key })[1]
                test.eq(fixture.op(user, "provenance", { component_id = id, item_id = first.id })[1].event_id, "compound-source")
                test.eq(fixture.op(user, "provenance", { component_id = id, item_id = second.id })[1].event_id, "compound-source")
                local changed = fixture.candidate("profile_slot", parts[1].key, example.changed, "The user changes this attribute.", "change-source")
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

        test.it("writes tool memories into the caller's own scope of an attached memory only", function()
            local user, other = fixture.user(), fixture.user("other")
            local id = fixture.memory(user)
            local foreign = fixture.memory(user)
            local session = "s-" .. user
            local context = fixture.agent_context(id, session, "agent-a")
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

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
