-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("compiler", function()
        test.before_each(function() fixture.script.reset() end)

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
            fixture.relations({ "unrelated" })
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
