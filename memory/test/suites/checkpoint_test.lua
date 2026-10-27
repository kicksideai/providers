-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("checkpoint", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("uses checkpoint options independently of the agent model", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "summary", role = "user", content = "A working task." } })
            fixture.script.respond("generate", "Continue the working task.")
            local payload = fixture.payload("checkpoint", session, "agent-a", {
                agent = { id = "agent-a", model = "missing-agent-model" }, options = { model = "class:fast", max_tokens = 73 },
            })
            local result, err = fixture.op(user, "checkpoint", { payload = payload }, fixture.agent_context(id, session, "agent-a", { write_enabled = false }))
            test.is_nil(err, tostring(err))
            test.eq(result.summary, "Continue the working task.")
            test.eq(fixture.script.requests("generate")[1].options.max_tokens, 73)
        end)

        test.it("rejects missing checkpoint model and invalid token options before reading history", function()
            local user = fixture.user()
            for _, options in ipairs({ {}, { model = "class:fast", max_tokens = 0 }, { model = "class:fast", max_tokens = 1.5 } }) do
                local payload = fixture.payload("checkpoint", "absent-history", "agent-a", { options = options })
                local result, err = fixture.op(user, "checkpoint", { payload = payload })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
                test.is_true(err:message():find("checkpoint options require", 1, true) ~= nil, tostring(err))
            end
            test.eq(#fixture.script.requests("generate"), 0)
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
            local applied, apply_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(apply_err, tostring(apply_err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "failed")
            local job = fixture.wait_job(runs[1].job_id, "dead")
            test.eq(job.attempts, 1)
            local failure = json.decode(runs[1].last_error)
            test.eq(failure.kind, errors.INTERNAL)
            test.eq(failure.code, errors.INVALID)
            test.eq(failure.explanation, "memory extraction failed")
            test.is_nil(runs[1].last_error:find("model rejected extraction", 1, true))
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
