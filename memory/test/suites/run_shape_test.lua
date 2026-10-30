-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fixture = require("fixture")

local function define_tests()
    test.describe("memory run shape", function()
        local held: { any } = {}

        test.before_each(function() held = {} end)
        test.after_each(function()
            for _, barrier in ipairs(held) do fixture.script.release(barrier.scope, barrier.method) end
        end)

        local function hold(scope: string, method: string)
            held[#held + 1] = { scope = scope, method = method }
            fixture.script.hold(scope, method)
        end

        test.it("captures authors from the session run-context binding", function()
            local user = fixture.user()
            local session = "s-" .. user
            fixture.record_chat(user, session, {
                { id = "admitted", role = "user", author = { kind = "user", id = user }, content = "I prefer a quiet room." },
            })
            local history, history_err = fixture.op(user, "read_history", {
                payload = fixture.payload("before_step", session, "agent-a"), selector = {mode = "all"},
            })
            test.is_nil(history_err, tostring(history_err))
            test.eq(history.events[1].author.kind, "user")
            test.eq(history.events[1].author.id, user)
        end)

        test.it("requires an explicit author for each admitted message", function()
            local user = fixture.user()
            local ok, err = pcall(fixture.record_chat, user, "s-" .. user, {
                { id = "missing-author", role = "user", content = "I prefer a quiet room." },
            })
            test.is_false(ok)
            test.is_true(tostring(err):find("author are required", 1, true) ~= nil)
        end)

        test.it("uses native event identifiers for every recorded message", function()
            local user = fixture.user()
            local session = "s-" .. user
            local messages = {
                { id = "submitted-user", role = "user", author = { kind = "user", id = user }, content = "I prefer a quiet room." },
                { id = "submitted-agent", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "I will keep that in mind." },
            }
            local ids = fixture.record_chat(user, session, messages)
            test.neq(ids[1], "submitted-user")
            test.neq(ids[2], "submitted-agent")
            local history, history_err = fixture.op(user, "read_history", {
                payload = fixture.payload("before_step", session, "agent-a"), selector = {mode = "all"},
            })
            test.is_nil(history_err, tostring(history_err))
            test.eq(history.events[1].id, ids[1])
            test.eq(history.events[2].id, ids[2])
            test.eq(history.events[2].author.kind, "agent")
            test.eq(history.events[2].author.id, "agent-a")
        end)

        test.it("persists capture coordinates separately from its evidence", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local source = { id = "first", role = "user", author = { kind = "user", id = user }, content = "I prefer a quiet room." }
            local event_ids = fixture.record_chat(user, session, { source })
            local source_id = event_ids[1]
            hold(id, "structured_output")
            local applied, apply_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(apply_err, tostring(apply_err))
            test.is_true(applied.metadata.capture.captured)
            local run = fixture.op(user, "run", { run_id = applied.metadata.capture.run_id })
            test.eq(run.host_kind, "session")
            test.eq(run.host_id, session)
            test.eq(run.agent_id, "agent-a")
            test.is_nil(run.from_event_id)
            test.eq(run.to_event_id, source_id)
            test.is_nil(run.input.host)
            fixture.extraction(id, { fixture.candidate("preference", "room_noise", "quiet", "The user prefers a quiet room.", source_id) })
            fixture.script.release(id, "structured_output")
            local finished = fixture.wait_runs(user, id, "derive", 1)[1]
            test.eq(finished.status, "succeeded", tostring(finished.last_error))
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, source_id)
        end)

        test.it("persists document and maintenance runs without empty source fields", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            hold(id, "structured_output")
            local queued, queue_err = fixture.op(user, "embed", { request = { content = "Reference material.", external_id = "reference" } }, { component_id = id })
            test.is_nil(queue_err, tostring(queue_err))
            test.is_true(queued.success)
            local document = fixture.op(user, "run", { run_id = queued.run_id })
            test.eq(document.host_kind, "content")
            test.eq(document.host_id, id)
            test.is_nil(document.agent_id)
            test.is_nil(document.from_event_id)
            test.not_nil(document.to_event_id)
            test.is_nil(document.input.host)
            local maintenance = fixture.op(user, "run", { run_id = "consolidate:" .. id })
            for _, name in ipairs({ "host_kind", "host_id", "agent_id", "from_event_id", "to_event_id" }) do
                test.is_nil(maintenance[name])
            end
            local reembed, reembed_err = fixture.call_as(user,
                "kickside.memory.engine:schedule_reembed_func", {}, { component_id = id })
            test.is_nil(reembed_err, tostring(reembed_err))
            local reembed_run = fixture.op(user, "run", { run_id = reembed.run.id })
            for _, name in ipairs({ "host_kind", "host_id", "agent_id", "from_event_id", "to_event_id" }) do
                test.is_nil(reembed_run[name])
            end
            fixture.extraction(id, {})
            fixture.script.release(id, "structured_output")
        end)

        test.it("does not retain cancelled capture ownership", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local source = { id = "uncaptured", role = "user", author = { kind = "user", id = user }, content = "I prefer a quiet room." }
            fixture.record_chat(user, session, { source })
            hold(id, "structured_output")
            local first, first_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(first_err, tostring(first_err))
            local db = fixture.db()
            local _, cancel_err = db:execute("UPDATE kickside_memory_runs SET status = 'cancelled' WHERE id = $1", { first.metadata.capture.run_id })
            db:release()
            test.is_nil(cancel_err, tostring(cancel_err))
            local second, second_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(second_err, tostring(second_err))
            test.is_true(second.metadata.capture.captured)
            test.is_true(second.metadata.capture.run_id ~= first.metadata.capture.run_id)
            fixture.script.release(id, "structured_output")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
