-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("prompt", function()

        test.it("renders complete plan state in pinned prompts and recall within their budgets", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local content = "The user needs tickets."
            local expected = content .. " Details: Travel to a coastal city. Next step: Compare routes. Status: open."
            fixture.op(user, "create", { component_id = id, fields = {
                kind = "plan", scope_family = "owner", key = "travel_goal", content = content,
                value = { details = "Travel to a coastal city.", next_step = "Compare routes.", status = "open" },
            } })
            fixture.settle(user, id)
            local session = "s-" .. user
            fixture.apply(user, "activate", id, session, "agent-a")
            local prompt, err = fixture.op(user, "prompt", {}, fixture.agent_context(id, session, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_true(prompt:find(expected, 1, true) ~= nil, prompt)
            local recalled, recall_err = fixture.op(user, "recall", { input = { working_on = "tickets", constraints = { max_length = #expected } } }, { memory_id = id })
            test.is_nil(recall_err, tostring(recall_err))
            test.eq(#recalled.memories, 1)
            test.eq(recalled.memories[1].content, expected)
            local limited = fixture.op(user, "recall", { input = { working_on = "tickets", constraints = { max_length = #expected - 1 } } }, { memory_id = id })
            test.eq(#limited.memories, 0)
            local heading = "## What you know about the user\nUse these facts as defaults. Do not ask the user to repeat or confirm an attribute shown here. Apply it when relevant, state the assumption and let the user correct it. Ask only for missing details."
            local _, config_err = fixture.op(user, "update_config", { component_id = id, config = { soul_owner_max_chars = #heading + #expected + 3 } })
            test.is_nil(config_err, tostring(config_err))
            fixture.apply(user, "activate", id, session, "agent-a")
            test.eq(fixture.op(user, "prompt", {}, fixture.agent_context(id, session, "agent-a")), heading .. "\n- " .. expected)
            fixture.op(user, "update_config", { component_id = id, config = { soul_owner_max_chars = #heading + #expected + 2 } })
            fixture.apply(user, "activate", id, session, "agent-a")
            test.eq(fixture.op(user, "prompt", {}, fixture.agent_context(id, session, "agent-a")), "")
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
            fixture.apply(user, "activate", id, session, "agent-a")
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

        test.it("recalls current memories of the caller and agent scopes only, skipping injected ids", function()
            local alice, bob = fixture.user("alice"), fixture.user("bob")
            local id = fixture.memory(alice)
            fixture.remember(alice, id, { fixture.candidate("fact", "trip", "Lisbon", "The user is planning a trip to Lisbon in May.", "m1") }, "a1")
            fixture.relations(id, { "unrelated" })
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
            fixture.relations(id, { "unrelated" })
            local _, name_err = fixture.remember(user, id, { fixture.candidate("profile_slot", "name", "Sam", "The user's name is Sam.", "m2") }, "p2")
            test.is_nil(name_err, tostring(name_err))
            fixture.settle(user, id)
            local _, err = fixture.apply(user, "activate", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local context = fixture.agent_context(id, session, "agent-a")
            local first = fixture.op(user, "prompt", {}, context)
            test.eq(first, "## What you know about the user\nUse these facts as defaults. Do not ask the user to repeat or confirm an attribute shown here. Apply it when relevant, state the assumption and let the user correct it. Ask only for missing details.\n- Name [name]: Sam\n- Tone [tone]: concise")
            fixture.relations(id, { "unrelated", "unrelated" })
            local _, add_err = fixture.remember(user, id, { fixture.candidate("preference", "format", "bullets", "The user likes bullet lists.", "m3") }, "p3")
            test.is_nil(add_err, tostring(add_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "prompt", {}, context), first)
            fixture.apply(user, "activate", id, session, "agent-a")
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

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
