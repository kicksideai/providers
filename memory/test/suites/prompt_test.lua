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

            local bobs, bob_err = fixture.op(bob, "recall", { input = input }, { memory_id = id, agent_id = "agent-b" })
            test.is_nil(bobs, "bob has no access to alice's memory")
            test.not_nil(bob_err)
            test.eq(bob_err:kind(), errors.PERMISSION_DENIED)
            test.eq(bob_err:message(), "Component not found or access denied")
        end)

        test.it("keeps one dataflow activation pin across iteration changes", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("preference", "format", "numbered steps", "The user prefers numbered steps.", "m1") }, "dataflow-pin")
            fixture.settle(user, id)
            local host = { kind = "dataflow", id = "run-" .. user, dataflow_id = "flow-" .. user, node_id = "node-a", iteration = 1 }
            local context = fixture.agent_context(id, "unused", "agent-a")
            context.agent_run.host = host
            local payload = fixture.payload("activate", "unused", "agent-a", {host = host})
            local _, err = fixture.op(user, "apply", {payload = payload}, context)
            test.is_nil(err, tostring(err))
            local first = fixture.op(user, "prompt", {}, context)
            test.contains(first, "numbered steps")
            host.iteration = 2
            test.eq(fixture.op(user, "prompt", {}, context), first)
            host.iteration = 9
            test.eq(fixture.op(user, "prompt", {}, context), first)
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

        test.it("invalidates only the affected owner's pins when items archive, restore or forget", function()
            local owner, other = fixture.user(), fixture.user()
            local id = fixture.memory(owner)
            local owner_scope, other_scope = "owner:" .. owner, "owner:" .. other
            local function add(scope_id: string, key: string, value: string)
                if scope_id ~= owner then
                    fixture.remember(owner, id, { fixture.candidate("preference", key, value, key .. ": " .. value, key) }, key,
                        { scope_id = scope_id })
                    return
                end
                local _, err = fixture.op(owner, "create", { component_id = id, fields = {
                    kind = "preference", scope_family = "owner", scope_id = scope_id,
                    key = key, value = value, content = key .. ": " .. value,
                } })
                test.is_nil(err, tostring(err))
            end
            add(owner, "target", "one")
            add(owner, "owner_anchor", "two")
            add(other, "other_anchor", "three")
            fixture.settle(owner, id)

            local function item(key: string, scope_key: string): any
                local rows = fixture.items(owner, id, { key = key, scope_keys = { scope_key } })
                test.eq(#rows, 1)
                return rows[1]
            end

            local function pin(host_id: string, scope_key: string, item_id: string, prompt: string)
                local item = fixture.op(owner, "get", { component_id = id, item_id = item_id })
                local pinned, pin_err = fixture.op(owner, "pin", {
                    component_id = id, host_kind = "session", host_id = host_id, agent_id = "agent-a", owner_scope_key = scope_key,
                    head = 1, prompt = prompt, selected = { { id = item.id, version = item.version, content_hash = item.content_hash } },
                })
                test.is_true(pinned, tostring(pin_err))
            end
            local function assert_action(action: string)
                local owner_host, other_host = action .. "-owner", action .. "-other"
                local target = item("target", owner_scope)
                if action == "restore" then
                    local _, archive_err = fixture.op(owner, "archive", { component_id = id, item_id = target.id })
                    test.is_nil(archive_err, tostring(archive_err))
                    fixture.settle(owner, id)
                end
                local owner_anchor = item("owner_anchor", owner_scope)
                local other_anchor = item("other_anchor", other_scope)
                pin(owner_host, owner_scope, owner_anchor.id, "owner " .. action)
                pin(other_host, other_scope, other_anchor.id, "other " .. action)
                local result, action_err
                if action == "archive" then
                    result, action_err = fixture.op(owner, "archive", { component_id = id, item_id = target.id })
                elseif action == "restore" then
                    result, action_err = fixture.op(owner, "restore", { component_id = id, item_id = target.id })
                else
                    result, action_err = fixture.op(owner, "forget", { component_id = id, item_id = target.id })
                end
                test.is_nil(action_err, tostring(action_err))
                test.not_nil(result)
                fixture.settle(owner, id)
                local owner_cursor = fixture.op(owner, "cursor", { component_id = id, host_kind = "session", host_id = owner_host })
                local other_cursor = fixture.op(owner, "cursor", { component_id = id, host_kind = "session", host_id = other_host })
                test.is_nil(owner_cursor.pinned_prompt)
                test.eq(other_cursor.pinned_prompt, "other " .. action)
                local expected_ids, encode_err = json.encode({ other_anchor.id })
                test.is_nil(encode_err, tostring(encode_err))
                test.eq(fixture.op(owner, "pinned_ids", { component_id = id, host_kind = "session", host_id = other_host }), expected_ids)
            end
            assert_action("archive")
            local target = item("target", owner_scope)
            local _, restore_err = fixture.op(owner, "restore", { component_id = id, item_id = target.id })
            test.is_nil(restore_err, tostring(restore_err))
            fixture.settle(owner, id)
            assert_action("restore")
            assert_action("forget")
        end)

        test.it("invalidates a pin made through the previous pin signature", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local item, create_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "preference", scope_family = "owner", key = "timezone", value = "UTC", content = "The user uses UTC.",
            } })
            test.is_nil(create_err, tostring(create_err))
            fixture.settle(user, id)
            local current = fixture.op(user, "get", { component_id = id, item_id = item.item_id })
            local pinned, pin_err = fixture.op(user, "pin", {
                component_id = id, host_kind = "session", host_id = "legacy-pin", agent_id = "agent-a", head = 1,
                prompt = "legacy prompt", selected = { { id = current.id, version = current.version, content_hash = current.content_hash } },
            })
            test.is_true(pinned, tostring(pin_err))
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = item.item_id })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = "legacy-pin" })
            test.is_nil(cursor.pinned_prompt)
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
