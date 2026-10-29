-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("compiler", function()

        test.it("resolves an agent explicitly selecting the Memory trait", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local trait = "kickside.memory:memory"
            local created, create_err = fixture.call_as(user, "kickside.agents.registry:a_create", {
                name = "memory agent", model = "test-fast", traits = { trait },
                trait_contexts = { [trait] = {
                    memory_id = memory,
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
            test.is_nil(context.read_enabled)
            test.is_nil(context.write_enabled)
            test.is_nil(context.recall_limit)
            local id, err = fixture.op(user, "resolve_memory", { context = context })
            test.is_nil(err, tostring(err))
            test.eq(id, memory)
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
            fixture.script.respond(memory, "generate", "Choose a window seat.")
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
            local tool_count = 0
            for _ in pairs(stepped.compiled.tools) do tool_count = tool_count + 1 end
            test.eq(tool_count, 2, json.encode(stepped.compiled.tools))
            test.not_nil(stepped.compiled.tools.ForgetMemory, "ForgetMemory tool")
            fixture.record_chat(user, session, { { id = "trait-capture", role = "user", content = "Remember that I prefer aisle seats." } })
            fixture.extraction(memory, { fixture.candidate("preference", "seat_position", "aisle", "The user prefers aisle seats.", "trait-capture") })
            fixture.relations(memory, { "unrelated" })
            local captured, capture_err = fixture.op(user, "trait_agent", {
                spec = spec, payload = fixture.payload("before_step", session, agent_id),
            }, run_context)
            test.is_nil(capture_err, tostring(capture_err))
            test.eq(#captured.errors, 0)
            test.is_true(captured.metadata[1].metadata.capture.captured)
            local runs = fixture.wait_runs(user, memory, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            fixture.settle(user, memory)
            test.not_nil(fixture.values(fixture.items(user, memory)).aisle)
        end)

        test.it("applies optional memory capability settings throughout the trait", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local session, agent_id = "settings-" .. user, "settings-agent"
            local spec = { id = agent_id, name = "Settings", prompt = "Use configured capabilities.", model = "test-fast",
                traits = { { id = "kickside.memory:memory", context = {
                    memory_id = memory, read_enabled = false, write_enabled = false, recall_limit = 1,
                } } } }

            local compiled, compile_err = fixture.op(user, "compile", { spec = spec })
            test.is_nil(compile_err, tostring(compile_err))
            test.not_nil(compiled.tools.SearchMemory, json.encode(compiled.tools))
            test.not_nil(compiled.tools.ForgetMemory, json.encode(compiled.tools))

            local run_context = fixture.agent_context(memory, session, agent_id)
            local activated, activate_err = fixture.op(user, "trait_agent", {
                spec = spec, payload = fixture.payload("activate", session, agent_id),
            }, run_context)
            test.is_nil(activate_err, tostring(activate_err))
            test.is_false(activated.metadata[1].metadata.pinned)

            fixture.record_chat(user, session, {{ id = "settings-source", role = "user", content = "I prefer trains." }})
            local captured, capture_err = fixture.op(user, "trait_agent", {
                spec = spec, payload = fixture.payload("before_step", session, agent_id),
            }, run_context)
            test.is_nil(capture_err, tostring(capture_err))
            test.eq(captured.metadata[1].metadata.capture.reason, "capture_disabled")
            test.eq(fixture.count("SELECT COUNT(*) AS n FROM kickside_memory_runs WHERE component_id = $1", {memory}), 0)

            run_context.read_enabled = false
            local searched, search_err = fixture.op(user, "tool_search", { input = { query = "trains" } }, run_context)
            test.is_nil(search_err, tostring(search_err))
            test.is_false(searched.success)
            test.contains(searched.error, "disabled")
            local recalled, recall_err = fixture.op(user, "recall", { input = { working_on = "trains" } }, run_context)
            test.is_nil(recall_err, tostring(recall_err))
            test.eq(#recalled.memories, 0)

            run_context.write_enabled = false
            local forgotten, forget_err = fixture.op(user, "tool_forget", { input = { key = "travel" } }, run_context)
            test.is_nil(forget_err, tostring(forget_err))
            test.is_false(forgotten.success)
            test.contains(forgotten.error, "read-only")

            for _, fields in ipairs({
                { key = "tea", value = "green", content = "The user prefers green tea." },
                { key = "morning_drink", value = "tea", content = "The user drinks tea with breakfast." },
            }) do
                local _, create_err = fixture.op(user, "create", { component_id = memory, fields = {
                    kind = "preference", scope_family = "owner", key = fields.key, value = fields.value, content = fields.content,
                } })
                test.is_nil(create_err, tostring(create_err))
            end
            fixture.settle(user, memory)
            local limit_context = fixture.agent_context(memory, session, agent_id, { recall_limit = 1 })
            local limited, limited_err = fixture.op(user, "tool_search", { input = { query = "tea" } }, limit_context)
            test.is_nil(limited_err, tostring(limited_err))
            test.eq(limited.count, 1)
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

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
