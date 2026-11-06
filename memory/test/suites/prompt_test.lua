-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local HISTORY_CONTEXT = { contract = "wippy.agent:run_context", binding = "app.suites:history_binding" }

local function define_tests()
    test.describe("prompt", function()

        test.it("binds saved prompts to the acting principal and producing agent", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local host = "identity-" .. user
            local function context(agent_id)
                local context = fixture.agent_context(id, host, agent_id)
                context.agent_run.run_context = { contract = HISTORY_CONTEXT.contract, binding = HISTORY_CONTEXT.binding,
                    host = { kind = "session", id = host, session_id = host } }
                return context
            end
            local function activate(principal, agent_id)
                local payload = fixture.payload("activate", host, agent_id)
                payload.run_context = { contract = HISTORY_CONTEXT.contract, binding = HISTORY_CONTEXT.binding,
                    host = { kind = "session", id = host, session_id = host } }
                return fixture.op(principal, "apply", { payload = payload }, context(agent_id))
            end
            fixture.remember(user, id, {fixture.candidate("preference", "format", "numbered steps", "The user prefers numbered steps.", "seed")}, "identity-seed")
            local _, rule_err = fixture.op(user, "create", {component_id = id, fields = {
                kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "procedure",
                value = "Follow the declared procedure.", content = "Follow the declared procedure.",
            }})
            test.is_nil(rule_err, tostring(rule_err))
            fixture.settle(user, id)
            local _, activate_err = activate(user, "agent-a")
            test.is_nil(activate_err, tostring(activate_err))
            local original = fixture.op(user, "prompt", {}, context("agent-a"))
            test.contains(original, "numbered steps")
            for _, principal in ipairs({"principal:group:research", "principal:service:research"}) do
                local grant, grant_err = fixture.call_as(user, "kickside.component.binding:grant_subtree_func", {
                    root_component_id = id, subject = {subject_id = "research", subject_type = principal:match("^principal:([^:]+):")}, access_mask = 1,
                })
                test.is_nil(grant_err, tostring(grant_err))
                test.is_true(grant.success, json.encode(grant))
                local prompt, prompt_err = fixture.op(principal, "prompt", {}, context("agent-a"))
                test.is_nil(prompt_err, tostring(prompt_err))
                test.eq(prompt, "")
                local _, principal_activate_err = activate(principal, "agent-a")
                test.is_nil(principal_activate_err, tostring(principal_activate_err))
                local principal_prompt = fixture.op(principal, "prompt", {}, context("agent-a"))
                test.contains(principal_prompt, "Follow the declared procedure.")
                test.is_nil(principal_prompt:find("numbered steps", 1, true), principal_prompt)
            end
            local different_agent, agent_err = fixture.op(user, "prompt", {}, context("agent-b"))
            test.is_nil(agent_err, tostring(agent_err))
            test.eq(different_agent, "")
            local _, restore_err = activate(user, "agent-a")
            test.is_nil(restore_err, tostring(restore_err))
            test.eq(fixture.op(user, "prompt", {}, context("agent-a")), original)
        end)

        test.it("replaces the host snapshot for each agent activation", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local host = "activation-" .. user
            for _, fields in ipairs({
                {kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "a_rule", value = "Apply the first procedure.", content = "Apply the first procedure."},
                {kind = "rule", scope_family = "agent", scope_id = "agent-b", key = "b_rule", value = "Apply the second procedure.", content = "Apply the second procedure."},
            }) do
                local _, create_err = fixture.op(user, "create", {component_id = id, fields = fields})
                test.is_nil(create_err, tostring(create_err))
            end
            fixture.settle(user, id)

            local _, first_err = fixture.apply(user, "activate", id, host, "agent-a")
            test.is_nil(first_err, tostring(first_err))
            local first = fixture.op(user, "prompt", {}, fixture.agent_context(id, host, "agent-a"))
            test.contains(first, "Apply the first procedure.")

            local _, second_err = fixture.apply(user, "activate", id, host, "agent-b")
            test.is_nil(second_err, tostring(second_err))
            local second = fixture.op(user, "prompt", {}, fixture.agent_context(id, host, "agent-b"))
            test.contains(second, "Apply the second procedure.")
            test.is_nil(second:find("Apply the first procedure.", 1, true), second)

            local _, third_err = fixture.apply(user, "activate", id, host, "agent-a")
            test.is_nil(third_err, tostring(third_err))
            local third = fixture.op(user, "prompt", {}, fixture.agent_context(id, host, "agent-a"))
            test.contains(third, "Apply the first procedure.")
            test.is_nil(third:find("Apply the second procedure.", 1, true), third)
        end)


        test.it("keeps the pinned agent binding when another agent advances capture", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local host = "capture-binding-" .. user
            fixture.apply(user, "activate", id, host, "agent-a")
            local later = {id = "later", role = "user", author = { kind = "user", id = user }, content = "Continue the task."}
            fixture.record_chat(user, host, { later })
            fixture.extraction(id, {})
            local _, capture_err = fixture.apply(user, "before_step", id, host, "agent-b")
            test.is_nil(capture_err, tostring(capture_err))
            test.eq(fixture.wait_runs(user, id, "derive", 1)[1].status, "succeeded")
            local cursor = fixture.op(user, "cursor", {component_id = id, host_kind = "session", host_id = host})
            test.eq(cursor.agent_id, "agent-a")
            test.eq(cursor.last_event_id, later.id)
        end)

        test.it("renders agent memory once within one budget in the model request", function()
            local user = fixture.user()
            local rule = "Verify source claims."
            local expected = "## Agent memory\n- " .. rule
            local id = fixture.memory(user, {soul_agent_max_chars = #expected})
            for _, fields in ipairs({
                {kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "verification", value = rule, content = rule, priority = 5},
                {kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "format", value = "List evidence links.", content = "List evidence links."},
            }) do
                local _, create_err = fixture.op(user, "create", {component_id = id, fields = fields})
                test.is_nil(create_err, tostring(create_err))
            end
            fixture.settle(user, id)
            local host = "request-" .. user
            fixture.record_chat(user, host, {})
            local run_context = fixture.agent_context(id, host, "agent-a")
            local spec = {id = "agent-a", prompt = "Research carefully.", model = "test-fast", traits = {
                {id = "kickside.memory:memory", context = {memory_id = id}},
            }}
            local activated, activate_err = fixture.op(user, "trait_agent", {
                spec = spec, payload = fixture.payload("activate", host, "agent-a"),
            }, run_context)
            test.is_nil(activate_err, tostring(activate_err))
            test.eq(#activated.errors, 0)
            fixture.script.respond(id, "generate", "Ready.")
            local _, step_err = fixture.op(user, "trait_agent", {
                spec = spec, messages = {{role = "user", text = "Begin."}},
            }, run_context)
            test.is_nil(step_err, tostring(step_err))
            local system = fixture.script.prompts(id, "generate")[1].system
            local _, occurrences = system:gsub("Verify source claims%.", "")
            test.eq(occurrences, 1, system)
            test.is_nil(system:find("List evidence links.", 1, true), system)
            test.contains(system, expected)
        end)

        test.it("does not recall agent learning already present in the activation snapshot", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local lesson = "Resolve relative links against the document base URL."
            local _, create_err = fixture.op(user, "create", {component_id = id, fields = {
                kind = "lesson", scope_family = "agent", scope_id = "agent-a", key = "relative_links", value = lesson, content = lesson,
            }})
            test.is_nil(create_err, tostring(create_err))
            fixture.settle(user, id)
            local host = "learning-request-" .. user
            local task = {id = "task", role = "user", author = { kind = "user", id = user }, content = "Resolve relative links."}
            fixture.record_chat(user, host, { task })
            local run_context = fixture.agent_context(id, host, "agent-a")
            local spec = {id = "agent-a", prompt = "Research carefully.", model = "test-fast", traits = {
                {id = "kickside.memory:memory", context = {memory_id = id}},
            }}
            local activated, activate_err = fixture.op(user, "trait_agent", {
                spec = spec, payload = fixture.payload("activate", host, "agent-a"),
            }, run_context)
            test.is_nil(activate_err, tostring(activate_err))
            test.eq(#activated.errors, 0)
            fixture.script.respond(id, "generate", "Ready.")
            local _, step_err = fixture.op(user, "trait_agent", {
                spec = spec, messages = {
                    {role = "user", text = "Resolve relative links."},
                    {role = "assistant", text = "Which links?"},
                    {role = "user", text = "Resolve the relative links in the documentation."},
                },
            }, run_context)
            test.is_nil(step_err, tostring(step_err))
            local rows = fixture.rows("SELECT messages FROM app_llm_requests WHERE scope = $1 AND method = 'generate'", {id})
            local request = assert(json.decode(rows[1].messages))
            local count = 0
            for _, message in ipairs(request) do
                for _, part in ipairs(message.content or {}) do
                    if part.type == "text" then
                        local _, occurrences = part.text:gsub("Resolve relative links against the document base URL%.", "")
                        count = count + occurrences
                    end
                end
            end
            test.eq(count, 1, rows[1].messages)
        end)

        test.it("clears agent memory snapshots on archive, restore and forget", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local created, create_err = fixture.op(user, "create", {component_id = id, fields = {
                kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "verification", value = "Check source claims.", content = "Check source claims.",
            }})
            test.is_nil(create_err, tostring(create_err))
            fixture.settle(user, id)
            local host = "agent-invalidation-" .. user
            local context = fixture.agent_context(id, host, "agent-a")
            fixture.apply(user, "activate", id, host, "agent-a")
            test.contains(fixture.op(user, "prompt", {}, context), "Check source claims.")
            local _, archive_err = fixture.op(user, "archive", {component_id = id, item_id = created.item_id})
            test.is_nil(archive_err, tostring(archive_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "prompt", {}, context), "")
            local _, restore_err = fixture.op(user, "restore", {component_id = id, item_id = created.item_id})
            test.is_nil(restore_err, tostring(restore_err))
            fixture.settle(user, id)
            test.contains(fixture.op(user, "prompt", {}, context), "Check source claims.")
            local _, forget_err = fixture.op(user, "forget", {component_id = id, item_id = created.item_id})
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "prompt", {}, context), "")
        end)

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
            fixture.apply(user, "activate", id, session .. "-exact", "agent-a")
            test.eq(fixture.op(user, "prompt", {}, fixture.agent_context(id, session .. "-exact", "agent-a")), heading .. "\n- " .. expected)
            fixture.op(user, "update_config", { component_id = id, config = { soul_owner_max_chars = #heading + #expected + 2 } })
            fixture.apply(user, "activate", id, session .. "-limited", "agent-a")
            test.eq(fixture.op(user, "prompt", {}, fixture.agent_context(id, session .. "-limited", "agent-a")), "")
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
            context.agent_run.run_context = { contract = HISTORY_CONTEXT.contract, binding = HISTORY_CONTEXT.binding, host = host }
            local payload = fixture.payload("activate", "unused", "agent-a", {host = host})
            payload.run_context = { contract = HISTORY_CONTEXT.contract, binding = HISTORY_CONTEXT.binding, host = host }
            local _, err = fixture.op(user, "apply", {payload = payload}, context)
            test.is_nil(err, tostring(err))
            local first = fixture.op(user, "prompt", {}, context)
            test.contains(first, "numbered steps")
            host.iteration = 2
            test.eq(fixture.op(user, "prompt", {}, context), first)
            host.iteration = 9
            test.eq(fixture.op(user, "prompt", {}, context), first)
        end)

        test.it("retains the activation snapshot when the same host reactivates", function()
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
            test.eq(second, first)
            local next_host = "next-" .. user
            fixture.apply(user, "activate", id, next_host, "agent-a")
            local next_prompt = fixture.op(user, "prompt", {}, fixture.agent_context(id, next_host, "agent-a"))
            test.contains(next_prompt, "Format [format]: bullets")
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

        test.it("requires an explicit owner scope before writing a pin", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            for _, input in ipairs({{}, {owner_scope_key = ""}, {owner_scope_key = " "}}) do
                input.component_id, input.host_kind, input.host_id, input.agent_id = id, "session", "unscoped", "agent-a"
                input.head, input.prompt, input.selected = 0, "prompt", {}
                local pinned, pin_err = fixture.op(user, "pin", input)
                test.is_nil(pinned)
                test.not_nil(pin_err)
                test.eq(pin_err:kind(), errors.INVALID)
                test.eq(pin_err:message(), "memory pin owner scope is required")
                test.is_nil(fixture.op(user, "cursor", {component_id = id, host_kind = "session", host_id = "unscoped"}))
            end
        end)

        test.it("invalidates an explicitly scoped owner pin when its item is forgotten", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local item, create_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "preference", scope_family = "owner", key = "timezone", value = "UTC", content = "The user uses UTC.",
            } })
            test.is_nil(create_err, tostring(create_err))
            fixture.settle(user, id)
            local current = fixture.op(user, "get", { component_id = id, item_id = item.item_id })
            local pinned, pin_err = fixture.op(user, "pin", {
                component_id = id, host_kind = "session", host_id = "owner-pin", agent_id = "agent-a", owner_scope_key = "owner:" .. user, head = 1,
                prompt = "owner prompt", selected = { { id = current.id, version = current.version, content_hash = current.content_hash } },
            })
            test.is_true(pinned, tostring(pin_err))
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = item.item_id })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = "owner-pin" })
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
            test.is_nil(built.prompt)
            local session = "agent-pin-" .. user
            fixture.apply(user, "activate", id, session, "agent-a")
            local pinned = fixture.op(user, "prompt", {}, fixture.agent_context(id, session, "agent-a"))
            test.eq(pinned, "## Agent memory\n- You are Ada.\n- Quote prices in euros.\n- Use metric units.")
            local again = fixture.op(user, "build", { context = { memory_id = id, agent_id = "agent-a" } })
            test.is_nil(again.prompt)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
