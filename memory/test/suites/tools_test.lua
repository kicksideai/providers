-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("tools", function()

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

        test.it("uses the memory search limit and rejects malformed cursors", function()
            local user = fixture.user()
            local id = fixture.memory(user, { recall_max_items = 1 })
            for _, entry in ipairs({
                { key = "coffee", value = "tea", content = "The user prefers tea to coffee." },
                { key = "tea", value = "green", content = "The user prefers green tea." },
            }) do
                local _, create_err = fixture.op(user, "create", { component_id = id, fields = {
                    kind = "preference", scope_family = "owner", key = entry.key, value = entry.value, content = entry.content,
                } })
                test.is_nil(create_err, tostring(create_err))
            end
            fixture.settle(user, id)
            local context = fixture.agent_context(id, "s-" .. user, "agent-a")
            local result, search_err = fixture.op(user, "tool_search", { input = { query = "tea" } }, context)
            test.is_nil(search_err, tostring(search_err))
            test.eq(result.count, 1)
            local invalid, invalid_err = fixture.op(user, "registered_tool_search", { input = { query = "tea", cursor = "again" } }, context)
            test.is_nil(invalid_err, tostring(invalid_err))
            test.is_false(invalid.success)
            test.eq(invalid.code, "invalid_input")
            test.eq(invalid.error, "cursor is invalid")
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

        test.it("erases only the named value of a single key and keeps the value that replaced it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "pet_name", cardinality = "single", value = "Biscuit", content = "The user's pet is Biscuit.",
            } })
            fixture.settle(user, id)
            fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "pet_name", cardinality = "single", value = "Pepper", content = "The user's pet is Pepper.",
            } })
            fixture.settle(user, id)
            local context = fixture.agent_context(id, "s-" .. user, "agent-a")
            local missing, missing_err = fixture.op(user, "tool_forget", { input = { key = "pet_name", value = "Rex" } }, context)
            test.is_nil(missing_err, tostring(missing_err))
            test.is_false(missing.success)
            test.is_true(missing.error:find("memory value not found", 1, true) ~= nil, missing.error)
            local result, err = fixture.op(user, "tool_forget", { input = { key = "pet_name", value = "Biscuit" } }, context)
            test.is_nil(err, tostring(err))
            test.is_true(result.success, result.error)
            test.eq(result.forgotten, 1)
            fixture.settle(user, id)
            local statuses = {}
            for _, item in ipairs(fixture.items(user, id, { key = "pet_name" })) do
                statuses[#statuses + 1] = item.status .. ":" .. tostring(item.value)
            end
            table.sort(statuses)
            test.eq(table.concat(statuses, ","), "current:Pepper,forgotten:nil")
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
            local valued = fixture.op(user, "tool_forget", { input = { key = "colour", value = "configured" } },
                fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_false(valued.success)
            test.is_true(valued.error:find("color, timezone", 1, true) ~= nil, valued.error)
        end)

        test.it("reconciles extracted attributes independently after one attribute changes", function()
            local user = fixture.user()
            for _, example in ipairs({
                { content = "The user is an engineer at Northstar.", parts = {
                    fixture.candidate("profile_slot", "employer", "Northstar", "Employer: Northstar.", "compound-source"),
                    fixture.candidate("profile_slot", "occupation", "engineer", "Occupation: engineer.", "compound-source"),
                }, changed = "Harbor" },
                { content = "The user studies chemistry at Cedar College.", parts = {
                    fixture.candidate("profile_slot", "school", "Cedar College", "School: Cedar College.", "compound-source"),
                    fixture.candidate("profile_slot", "field_of_study", "chemistry", "Field of study: chemistry.", "compound-source"),
                }, changed = "Pine Institute" },
            }) do
                local id = fixture.memory(user)
                local session = "s-" .. id
                local parts = example.parts
                fixture.history.record(session, { { id = "compound-source", role = "user", content = example.content } })
                fixture.extraction(id, parts)
                local _, err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(err, tostring(err))
                test.eq(fixture.wait_runs(user, id, "derive", 1)[1].status, "succeeded")
                fixture.settle(user, id)
                local first = fixture.items(user, id, { key = parts[1].key })[1]
                local second = fixture.items(user, id, { key = parts[2].key })[1]
                test.eq(fixture.op(user, "provenance", { component_id = id, item_id = first.id })[1].event_id, "compound-source")
                test.eq(fixture.op(user, "provenance", { component_id = id, item_id = second.id })[1].event_id, "compound-source")
                local changed = fixture.candidate("profile_slot", parts[1].key, example.changed, "The user changes this attribute.", "change-source")
                fixture.history.record(session, { { id = "change-source", role = "user", content = changed.content } })
                fixture.extraction(id, { changed })
                local _, change_err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(change_err, tostring(change_err))
                test.eq(fixture.wait_runs(user, id, "derive", 2)[1].status, "succeeded")
                fixture.settle(user, id)
                test.eq(fixture.op(user, "get", { component_id = id, item_id = first.id }).status, "superseded")
                local retained = fixture.op(user, "get", { component_id = id, item_id = second.id })
                test.eq(retained.status, "current")
                test.eq(retained.value, parts[2].value)
                test.eq(#fixture.items(user, id, { statuses = { "current" } }), 2)
                test.eq(fixture.script.pending(id, "structured_output"), 0)
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

        test.it("searches and forgets only the caller's scope of the attached memory", function()
            local user, other = fixture.user(), fixture.user("other")
            local id = fixture.memory(user)
            local foreign = fixture.memory(user)
            local session = "s-" .. user
            local context = fixture.agent_context(id, session, "agent-a")
            local stored, err = fixture.op(user, "create", { component_id = id, fields = { scope_family = "owner", content = "The user's dog is called Rex.", kind = "fact", key = "dog_name", value = "Rex" } }, context)
            test.is_nil(err, tostring(err))
            test.not_nil(stored.item_id)
            fixture.settle(user, id)
            local item = fixture.op(user, "get", { component_id = id, item_id = stored.item_id })
            test.eq(item.scope_key, "owner:" .. user)
            test.eq(item.source, "owner")
            local found = fixture.op(user, "tool_search", { input = { query = "dog called" } }, context)
            test.is_true(found.success)
            test.eq(found.items[1].id, stored.item_id)
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
