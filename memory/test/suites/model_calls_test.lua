-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function define_tests()
    test.describe("memory model calls", function()
        test.it("keeps independent topics from one extraction within one structured call", function()
            fixture.script.reset()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "contact", role = "user", content = "I prefer weekly contact by email." } })
            fixture.extraction({
                fixture.candidate("preference", "contact_channel", "email", "The user prefers email.", "contact"),
                fixture.candidate("preference", "contact_frequency", "weekly", "The user prefers weekly contact.", "contact"),
            })
            local _, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local run = fixture.wait_runs(user, id, "derive", 1)[1]
            test.eq(run.status, "succeeded", tostring(run.last_error))
            test.eq(run.stats.candidates, 2)
            test.eq(run.stats.added, 2)
            test.eq(run.stats.judged, 0)
            test.eq(#fixture.script.requests("structured_output"), 1)
            test.eq(#fixture.script.requests("embed"), 1)
        end)

        test.it("spends judgement only on unresolved semantic identity", function()
            fixture.script.reset()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local expected = { 1, 1, 1, 2, 0 }
            local statements = {
                fixture.candidate("profile_slot", "home_city", "Oslo", "Lives in Oslo.", "initial"),
                fixture.candidate("profile_slot", "home_city", "Bergen", "Lives in Bergen.", "update"),
                fixture.candidate("fact", "programming", "Rust", "Compiles Rust software.", "independent"),
                fixture.candidate("skill", "residence_detail", "Bergen", "Lives in Bergen.", "ambiguous"),
            }
            for index, statement in ipairs(statements) do
                local before = #fixture.script.requests("structured_output")
                local embeddings = #fixture.script.requests("embed")
                fixture.history.record(session, { { id = statement.event_id, role = "user", content = statement.content } })
                fixture.extraction({ statement }, index == 2 and { "home_city" } or {})
                if index == 4 then fixture.relations({ "same" }) end
                local _, err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(err, tostring(err))
                local runs = fixture.wait_runs(user, id, "derive", index)
                for _, run in ipairs(runs) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
                fixture.settle(user, id)
                test.eq(#fixture.script.requests("structured_output") - before, expected[index])
                test.eq(#fixture.script.requests("embed") - embeddings, 1)
            end
            local before = #fixture.script.requests("structured_output")
            local embeddings = #fixture.script.requests("embed")
            local input = { kind = "profile_slot", key = "contact_method", cardinality = "single", value = "email", content = "Contacts by email." }
            
            local result, err = fixture.op(user, "tool_remember", { input = input }, fixture.agent_context(id, session, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_true(result.success, result.error)
            test.eq(#fixture.script.requests("structured_output") - before, expected[5])
            test.eq(#fixture.script.requests("embed") - embeddings, 1)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { statuses = { "current" } }), 3)
            test.eq(fixture.items(user, id, { key = "home_city", statuses = { "current" } })[1].value, "Bergen")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
