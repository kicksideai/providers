-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function define_tests()
    test.describe("memory model calls", function()
        test.it("keeps scripted responses and failures in their memory scope", function()
            local user = fixture.user()
            local first = fixture.memory(user)
            local second = fixture.memory(user)
            fixture.script.respond(first, "structured_output", { items = {}, lessons = {}, plans = {} })
            fixture.script.fail(second, "structured_output", "second memory refuses extraction", errors.INVALID)
            local span = { { id = "statement", role = "user", author = {kind = "user", id = user}, text = "I live in Oslo." } }
            local _, second_err = fixture.op(user, "model_step", { step = "extract", span = span }, { thread_id = second })
            test.not_nil(second_err)
            test.eq(second_err:details().cause.kind, errors.INVALID)
            test.eq(fixture.script.pending(first, "structured_output"), 1)
            local _, unscripted_err = fixture.op(user, "model_step", { step = "extract", span = span }, { thread_id = second })
            test.not_nil(unscripted_err)
            test.eq(fixture.script.pending(first, "structured_output"), 1)
            local result, first_err = fixture.op(user, "model_step", { step = "extract", span = span }, { thread_id = first })
            test.is_nil(first_err, tostring(first_err))
            test.eq(#result.items, 0)
            test.eq(fixture.script.pending(first, "structured_output"), 0)
            test.eq(#fixture.script.requests(first, "structured_output"), 1)
            test.eq(#fixture.script.requests(second, "structured_output"), 2)
        end)

        test.it("keeps scripted responses, barriers, and resets scoped to their memory", function()
            local user = fixture.user()
            local first = fixture.memory(user)
            local second = fixture.memory(user)
            fixture.script.hold(first, "structured_output")
            fixture.script.hold(second, "structured_output")
            fixture.script.release(second, "structured_output")
            test.eq(fixture.script.pending(first, "__barrier__:structured_output"), 1)
            test.is_nil(fixture.script.await_release(second, "structured_output"))
            fixture.script.respond(first, "generate", "Continue the first task.")
            fixture.script.respond(second, "generate", "Continue the second task.")
            fixture.script.reset(second)
            test.eq(fixture.script.pending(first, "generate"), 1)
            test.eq(fixture.script.pending(second, "generate"), 0)
            fixture.script.release(first, "structured_output")
            test.is_nil(fixture.script.await_release(first, "structured_output"))
            local session = "s-" .. user
            fixture.record_chat(user, session, { { id = "summary", role = "user", content = "A working task." } })
            local _, unscripted_err = fixture.op(user, "checkpoint", { payload = fixture.payload("checkpoint", session, "agent-a") },
                fixture.agent_context(second, session, "agent-a"))
            test.not_nil(unscripted_err)
            test.eq(fixture.script.pending(first, "generate"), 1)
            local result, err = fixture.op(user, "checkpoint", { payload = fixture.payload("checkpoint", session, "agent-a") },
                fixture.agent_context(first, session, "agent-a"))
            test.is_nil(err, tostring(err))
            test.eq(result.summary, "Continue the first task.")
            test.eq(#fixture.script.requests(first, "generate"), 1)
            test.eq(#fixture.script.requests(second, "generate"), 1)
        end)

        test.it("judges similar independent topics from one extraction without merging them", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.record_chat(user, session, { { id = "contact", role = "user", content = "I prefer weekly contact by email." } })
            fixture.extraction(id, {
                fixture.candidate("preference", "contact_channel", "email", "The user prefers email.", "contact"),
                fixture.candidate("preference", "contact_frequency", "weekly", "The user prefers weekly contact.", "contact"),
            })
            fixture.relations(id, { "unrelated" })
            local _, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local run = fixture.wait_runs(user, id, "derive", 1)[1]
            test.eq(run.status, "succeeded", tostring(run.last_error))
            test.eq(run.stats.candidates, 2)
            test.eq(run.stats.added, 2)
            test.eq(run.stats.judged, 1)
            test.eq(#fixture.script.requests(id, "structured_output"), 2)
            test.eq(#fixture.script.requests(user, "embed"), 1)
        end)

        test.it("spends judgement only on unresolved semantic identity", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local expected = { 1, 1, 1, 2, 0 }
            local statements = {
                fixture.candidate("profile_slot", "home_city", "Oslo", "Lives in Oslo.", "initial"),
                fixture.candidate("profile_slot", "home_city", "Bergen", "Lives in Bergen.", "update"),
                fixture.candidate("fact", "programming", "Rust", "Compiles Rust software.", "independent"),
                fixture.candidate("profile_slot", "residence_detail", "Bergen", "Lives in Bergen.", "ambiguous"),
            }
            for index, statement in ipairs(statements) do
                local before = #fixture.script.requests(id, "structured_output")
                local embeddings = #fixture.script.requests(user, "embed")
                fixture.record_chat(user, session, { { id = statement.event_id, role = "user", content = statement.content } })
                fixture.extraction(id, { statement })
                if index == 4 then fixture.relations(id, { "same" }) end
                local _, err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(err, tostring(err))
                local runs = fixture.wait_runs(user, id, "derive", index)
                for _, run in ipairs(runs) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
                fixture.settle(user, id)
                test.eq(#fixture.script.requests(id, "structured_output") - before, expected[index])
                test.eq(#fixture.script.requests(user, "embed") - embeddings, 1)
            end
            local before = #fixture.script.requests(id, "structured_output")
            local embeddings = #fixture.script.requests(user, "embed")
            local input = { kind = "profile_slot", key = "contact_method", cardinality = "single", value = "email", content = "Contacts by email." }
            
            input.scope_family = "owner"
            local result, err = fixture.op(user, "create", { component_id = id, fields = input })
            test.is_nil(err, tostring(err))
            test.not_nil(result.item_id)
            test.eq(#fixture.script.requests(id, "structured_output") - before, expected[5])
            test.eq(#fixture.script.requests(user, "embed") - embeddings, 1)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { statuses = { "current" } }), 3)
            test.eq(fixture.items(user, id, { key = "home_city", statuses = { "current" } })[1].value, "Bergen")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
