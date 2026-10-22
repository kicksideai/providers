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
            local step = apply(user, "before_step", id, session, "agent-a")
            test.eq(step.metadata.capture.captured, false)
            test.eq(step.metadata.capture.reason, "no_new_history")
            fixture.history.record(session, { { id = "p3", role = "user", content = "Dana moved to the Berlin office." } })
            fixture.extraction({ fixture.candidate("fact", "manager_office", "Berlin", "The user's manager Dana works in the Berlin office.", "p3") })
            fixture.verdict("ADD", {})
            local next_step = apply(user, "before_step", id, session, "agent-a")
            test.is_true(next_step.metadata.capture.captured)
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
                kind = "lesson", scope_family = "agent", scope_id = "agent-a", key = "trip_lesson", content = "Trips: always ask for travel dates first.",
            } })
            fixture.op(alice, "create", { component_id = id, fields = {
                kind = "lesson", scope_family = "agent", scope_id = "agent-b", key = "trip_lesson", content = "Trips: prefer trains over flights.",
            } })
            fixture.settle(alice, id)
            local input = { recent_actions = { "user: help me plan my trip" }, constraints = { max_items = 10 } }
            local recalled, err = fixture.op(alice, "recall", { input = input }, { component_id = id, agent_id = "agent-a" })
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
            } }, { component_id = id, agent_id = "agent-a" })
            for _, memory in ipairs(skipped.memories) do test.neq(memory.id, lisbon.id) end
            test.eq(#skipped.memories, #recalled.memories - 1)

            local bobs = fixture.op(bob, "recall", { input = input }, { component_id = id, agent_id = "agent-b" })
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
            test.eq(first, "## What you know about the user\n- [profile_slot] The user's name is Sam.\n- [preference] The user prefers concise answers.")
            fixture.verdict("ADD", {})
            local _, add_err = fixture.remember(user, id, { fixture.candidate("preference", "format", "bullets", "The user likes bullet lists.", "m3") }, "p3")
            test.is_nil(add_err, tostring(add_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "prompt", {}, context), first)
            apply(user, "activate", id, session, "agent-a")
            local second = fixture.op(user, "prompt", {}, context)
            test.neq(second, first)
            test.is_true(second:find("bullet lists", 1, true) ~= nil)
        end)

        test.it("contributes the agent's identity and rules in a deterministic order", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            for _, fields in ipairs({
                { kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "units", content = "Use metric units.", priority = 1 },
                { kind = "identity", scope_family = "agent", scope_id = "agent-a", key = "name", content = "You are Ada." },
                { kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "currency", content = "Quote prices in euros.", priority = 5 },
                { kind = "rule", scope_family = "agent", scope_id = "agent-b", key = "other", content = "Not for agent a." },
            }) do
                local _, err = fixture.op(user, "create", { component_id = id, fields = fields })
                test.is_nil(err, tostring(err))
            end
            fixture.settle(user, id)
            local built, err = fixture.op(user, "build", { context = { memory_id = id, agent_id = "agent-a" } })
            test.is_nil(err, tostring(err))
            test.eq(built.prompt, "## Agent memory\n- [identity] You are Ada.\n- [rule] Quote prices in euros.\n- [rule] Use metric units.")
            local again = fixture.op(user, "build", { context = { memory_id = id, agent_id = "agent-a" } })
            test.eq(again.prompt, built.prompt)
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
            local others = fixture.items(user, id, { scope_family = "owner" })
            local other_id
            for _, row in ipairs(others) do if row.scope_id == other then other_id = row.id end end
            local denied = fixture.op(user, "tool_forget", { input = { item_id = other_id } }, context)
            test.eq(denied.success, false)
            local forgotten = fixture.op(user, "tool_forget", { input = { item_id = stored.item_ids[1] } }, context)
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

        test.it("resolves a saved agent whose Memory trait context has the shape of the published release", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local trait = "kickside.memory:knowledge_based_memory"
            local created, create_err = fixture.call_as(user, "kickside.agents.registry:a_create", {
                name = "published shape", model = "test-fast", traits = { trait },
                trait_contexts = { [trait] = {
                    kb_ids = { memory }, write_kb_id = memory, read_enabled = true, write_enabled = true,
                    recall_limit = 5, recall_max_chars = 4000, recall_prompt = "Relevant memory:",
                    checkpoint_model = "test-fast", checkpoint_prompt = "Summarize.", checkpoint_temperature = 0.2,
                    checkpoint_max_tokens = 800, checkpoint_source_max_chars = 20000,
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
            test.is_true(tostring(runs[1].last_error):find("model rejected extraction", 1, true) ~= nil, tostring(runs[1].last_error))
        end)

        test.it("compiles an agent mounting the trait with its lifecycle, after_persist and checkpoint behavior", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local compiled, err = fixture.op(user, "compile", { spec = {
                id = "agent-compiled", name = "compiled", prompt = "You plan trips.", model = "test-fast",
                traits = { { id = "kickside.memory:knowledge_based_memory", context = { memory_id = memory } } },
            } })
            test.is_nil(err, tostring(err))
            local text = json.encode(compiled)
            test.is_true(text:find("kickside.memory:lifecycle_binding", 1, true) ~= nil, text)
            test.is_true(text:find("after_persist", 1, true) ~= nil, text)
            test.is_true(text:find("kickside.memory:checkpoint_binding", 1, true) ~= nil, text)
        end)

        test.it("resolves the memory from trait contexts of earlier releases and refuses anything else", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local document = fixture.plain_component(user)
            fixture.remember(user, id, { fixture.candidate("fact", "pet", "cat", "The user has a cat.", "m1") }, "l1")
            fixture.settle(user, id)
            local function search(context: any): any
                return fixture.op(user, "tool_search", { input = { query = "cat" } }, context)
            end
            test.eq(search({ write_kb_id = id }).count, 1)
            test.eq(search({ kb_ids = { id, document } }).count, 1)
            test.eq(search({ memory_id = id, kb_ids = { document } }).count, 1)
            local legacy_document = search({ kb_ids = { document, id } })
            test.eq(legacy_document.success, false)
            test.is_true(legacy_document.error:find("is not a memory", 1, true) ~= nil, legacy_document.error)
            local unset = search({})
            test.eq(unset.success, false)
            test.is_true(unset.error:find("no memory selected", 1, true) ~= nil, unset.error)
            local _, capture_err = fixture.op(user, "apply", { payload = fixture.payload("before_step", "s-legacy", "agent-a") },
                { kb_ids = { document } })
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
