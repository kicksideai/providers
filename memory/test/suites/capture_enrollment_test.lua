-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("capture enrollment", function()
        test.before_each(function() fixture.script.reset() end)

        for _, phase in ipairs({ "before_step", "deactivate", "checkpoint" }) do
            test.it("enrolls statement-sized consecutive runs for " .. phase .. " with independent erasure ownership", function()
                local user = fixture.user()
                local id = fixture.memory(user)
                local session = "s-" .. user
                local capacity, capacity_err = fixture.op(user, "extraction_capacity", {})
                test.is_nil(capacity_err, tostring(capacity_err))
                test.is_true(capacity >= 1)
                local events = {}
                for i = 1, 2 * capacity + 1 do
                    events[#events + 1] = { id = "batch-" .. tostring(i), role = "user", content = "Statement " .. tostring(i) .. "." }
                    events[#events + 1] = { id = "reply-" .. tostring(i), role = "assistant", content = "Acknowledged." }
                end
                fixture.history.record(session, events)
                if phase == "checkpoint" then fixture.script.respond("generate", "Working state.") end
                -- Hold execution until every slice and its sources are enrolled.
                fixture.script.hold("structured_output")
                for i = 1, 3 do fixture.extraction({}) end
                local extra = phase == "deactivate" and { refs = { deactivation_range = { to_id = events[#events].id } } } or nil
                local applied, err
                if phase == "checkpoint" then
                    applied, err = fixture.op(user, "checkpoint", { payload = fixture.payload(phase, session, "agent-a") }, fixture.agent_context(id, session, "agent-a"))
                else applied, err = fixture.apply(user, phase, id, session, "agent-a", extra) end
                test.is_nil(err, tostring(err))
                test.is_true(applied.metadata.capture.captured)
                local enrolled = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
                test.eq(#enrolled, 3)
                table.sort(enrolled, function(a, b) return a.id < b.id end)
                local previous = ""
                for i, run in ipairs(enrolled) do
                    test.eq(run.from_event_id, previous)
                    test.eq(#run.input.span, i < 3 and 2 * capacity or 2)
                    local db = fixture.db()
                    local sources = db:query("SELECT event_id FROM kickside_memory_run_sources WHERE component_id = $1 AND run_id = $2", { id, run.id })
                    db:release()
                    test.eq(#sources, #run.input.span + #(run.input.context or {}))
                    previous = run.to_event_id
                end
                fixture.script.release("structured_output")
                local finished = fixture.wait_runs(user, id, "derive", 3)
                for _, run in ipairs(finished) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
                local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
                test.eq(cursor.last_event_id, events[#events].id)
                local ledger = fixture.op(user, "ledger", { component_id = id })
                local advanced = {}
                for _, event in ipairs(ledger) do
                    if event.type == "kickside.memory.events:capture.advanced" then advanced[#advanced + 1] = json.decode(event.body) end
                end
                test.eq(#advanced, 3)
                for i, event in ipairs(advanced) do
                    test.eq(event.from_event_id, enrolled[i].from_event_id)
                    test.eq(event.last_event_id, enrolled[i].to_event_id)
                end
                test.eq(#fixture.script.requests("structured_output"), 3)
                local seeded = fixture.remember(user, id, { fixture.candidate("fact", "setting", "retained", "A retained setting.", "batch-1") }, "batch-erasure")
                fixture.settle(user, id)
                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                for _, run in ipairs(enrolled) do
                    local erased = fixture.op(user, "run", { run_id = run.id })
                    test.is_nil(erased.input.span)
                end
            end)
        end

        test.it("does not advance consecutive captures past a failed predecessor", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local capacity = fixture.op(user, "extraction_capacity", {})
            local events = {}
            for i = 1, capacity + 1 do
                events[i] = { id = "failed-batch-" .. tostring(i), role = "user", content = "A statement." }
            end
            fixture.history.record(session, events)
            fixture.script.fail("structured_output", "Invalid model input", errors.INVALID, false)
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 2)
            for _, run in ipairs(runs) do test.eq(run.status, "failed", tostring(run.last_error)) end
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.is_true(cursor == nil or cursor.last_event_id == "")
            test.eq(#fixture.script.requests("structured_output"), 1)
        end)

        test.it("partitions complete source events by input bytes and retains trailing evidence", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local first, second = string.rep("a", 14000), string.rep("b", 14000)
            fixture.history.record(session, {
                { id = "large-first", role = "user", content = first },
                { id = "large-second", role = "user", content = second },
                { id = "trailing-evidence", role = "user", content = "I live in Oslo." },
            })
            fixture.script.hold("structured_output")
            fixture.extraction({})
            fixture.extraction({ fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", "trailing-evidence") })
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local enrolled = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
            fixture.script.release("structured_output")
            test.eq(#enrolled, 2)
            table.sort(enrolled, function(a, b) return a.id < b.id end)
            test.eq(enrolled[1].input.span[1].text, first)
            test.eq(enrolled[1].to_event_id, "large-first")
            test.eq(enrolled[2].from_event_id, "large-first")
            test.eq(enrolled[2].input.span[1].text, second)
            test.eq(enrolled[2].input.span[2].id, "trailing-evidence")
            for _, run in ipairs(fixture.wait_runs(user, id, "derive", 2)) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
            fixture.settle(user, id)
            test.eq(fixture.items(user, id)[1].value, "Oslo")
            test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, "trailing-evidence")
        end)

        test.it("rejects an oversized source event before enrolling any capture", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "within-bound", role = "user", content = "A complete statement." },
                { id = "oversized", role = "user", content = string.rep("x", 24001) },
            })
            local result, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(tostring(err):find("24000", 1, true) ~= nil)
            test.eq(#fixture.op(user, "runs", { component_id = id, run_type = "derive" }), 0)
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.is_true(cursor == nil or cursor.last_event_id == "")
        end)

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
