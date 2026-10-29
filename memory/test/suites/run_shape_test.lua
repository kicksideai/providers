-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fixture = require("fixture")

local function define_tests()
    test.describe("memory run shape", function()

        test.it("persists capture coordinates separately from its evidence", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.record_chat(user, session, {
                { id = "first", role = "user", content = "I prefer a quiet room." },
            })
            fixture.script.hold(id, "structured_output")
            local applied, apply_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(apply_err, tostring(apply_err))
            test.is_true(applied.metadata.capture.captured)
            local run = fixture.op(user, "run", { run_id = applied.metadata.capture.run_id })
            test.eq(run.host_kind, "session")
            test.eq(run.host_id, session)
            test.eq(run.agent_id, "agent-a")
            test.is_nil(run.from_event_id)
            test.eq(run.to_event_id, "first")
            test.is_nil(run.input.host)
            fixture.extraction(id, { fixture.candidate("preference", "room_noise", "quiet", "The user prefers a quiet room.", "first") })
            fixture.script.release(id, "structured_output")
            local finished = fixture.wait_runs(user, id, "derive", 1)[1]
            test.eq(finished.status, "succeeded", tostring(finished.last_error))
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, "first")
        end)

        test.it("persists document and maintenance runs without empty source fields", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.script.hold(id, "structured_output")
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
    end)
end

return { run = define_tests }
