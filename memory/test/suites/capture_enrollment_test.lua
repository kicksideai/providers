-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("capture enrollment", function()

        for _, phase in ipairs({ "before_step", "deactivate", "checkpoint" }) do
            test.it("enrolls statement-sized consecutive runs for " .. phase .. " with independent erasure ownership", function()
                local user = fixture.user()
                local id = fixture.memory(user, { extraction_model = "test-bounded" })
                local session = "s-" .. user
                local capacity, capacity_err = fixture.op(user, "extraction_capacity", { model = "test-bounded" })
                test.is_nil(capacity_err, tostring(capacity_err))
                test.is_true(capacity >= 1)
                local events = {}
                for i = 1, 2 * capacity + 1 do
                    events[#events + 1] = { id = "batch-" .. tostring(i), role = "user", content = "Statement " .. tostring(i) .. "." }
                    events[#events + 1] = { id = "reply-" .. tostring(i), role = "assistant", content = "Acknowledged." }
                end
                fixture.history.record(session, events)
                if phase == "checkpoint" then fixture.script.respond(id, "generate", "Working state.") end
                -- Hold execution until every slice and its sources are enrolled.
                fixture.script.hold(id, "structured_output")
                for i = 1, 3 do fixture.extraction(id, {}) end
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
                fixture.script.release(id, "structured_output")
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
                test.eq(#fixture.script.requests(id, "structured_output"), 3)
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
            local id = fixture.memory(user, { extraction_model = "test-bounded" })
            local session = "s-" .. user
            local capacity = fixture.op(user, "extraction_capacity", { model = "test-bounded" })
            local events = {}
            for i = 1, capacity + 1 do
                events[i] = { id = "failed-batch-" .. tostring(i), role = "user", content = "A statement." }
            end
            fixture.history.record(session, events)
            fixture.script.fail(id, "structured_output", "Invalid model input", errors.INVALID, false)
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 2)
            for _, run in ipairs(runs) do test.eq(run.status, "failed", tostring(run.last_error)) end
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.is_true(cursor == nil or cursor.last_event_id == "")
            test.eq(#fixture.script.requests(id, "structured_output"), 1)
        end)

        test.it("partitions complete source events by input bytes and retains trailing evidence", function()
            local user = fixture.user()
            local id = fixture.memory(user, { extraction_model = "test-fast" })
            local session = "s-" .. user
            local first, second = string.rep("a", 14000), string.rep("b", 14000)
            fixture.history.record(session, {
                { id = "large-first", role = "user", content = first },
                { id = "large-second", role = "user", content = second },
                { id = "trailing-evidence", role = "user", content = "I live in Oslo." },
            })
            fixture.script.hold(id, "structured_output")
            fixture.extraction(id, {})
            fixture.extraction(id, { fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", "trailing-evidence") })
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local enrolled = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
            fixture.script.release(id, "structured_output")
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

        for _, phase in ipairs({ "before_step", "after_persist", "deactivate", "checkpoint" }) do
            test.it("records an oversized source rejection and captures surrounding statements for " .. phase, function()
                local user = fixture.user()
                local id = fixture.memory(user, { extraction_model = "test-bounded" })
                local session = "s-" .. user
                local oversized = string.rep("private-source-", 2000)
                fixture.history.record(session, {
                    { id = "first", role = "user", content = "I live in Oslo." },
                    { id = "oversized", role = "user", content = oversized },
                    { id = "last", role = "user", content = "I enjoy cycling." },
                })
                fixture.script.hold(id, "structured_output")
                fixture.extraction(id, { fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", "first") })
                fixture.extraction(id, { fixture.candidate("fact", "hobby", "cycling", "The user enjoys cycling.", "last") })
                if phase == "deactivate" then fixture.script.respond(id, "structured_output", { items = {} }) end
                local extra = phase == "after_persist" and { refs = { event_id = "last" } } or nil
                local applied, err
                if phase == "checkpoint" then
                    fixture.script.respond(id, "generate", "Working state.")
                    applied, err = fixture.op(user, "checkpoint", { payload = fixture.payload(phase, session, "agent-a") }, fixture.agent_context(id, session, "agent-a"))
                else applied, err = fixture.apply(user, phase, id, session, "agent-a", extra) end
                test.is_nil(err, tostring(err))
                test.is_true(applied.metadata.capture.captured)
                local prefix = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
                test.eq(#prefix, 1)
                local pending, pending_err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(pending_err, tostring(pending_err))
                test.is_false(pending.metadata.capture.captured)
                test.eq(#fixture.op(user, "runs", { component_id = id, run_type = "derive" }), 1)
                fixture.script.release(id, "structured_output")
                test.eq(fixture.wait_runs(user, id, "derive", 1)[1].status, "succeeded")
                test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, "first")
                local resumed, resume_err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(resume_err, tostring(resume_err))
                test.is_true(resumed.metadata.capture.captured)
                local enrolled = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
                test.eq(#enrolled, 3)
                table.sort(enrolled, function(a, b) return a.id < b.id end)
                test.eq(enrolled[2].from_event_id, "first")
                test.eq(enrolled[2].to_event_id, "oversized")
                test.eq(enrolled[2].status, "rejected")
                test.not_nil(enrolled[2].finished_at)
                test.is_nil(enrolled[2].job_id)
                test.is_nil(enrolled[2].input.rejection)
                test.eq(enrolled[2].stats.rejected_source_too_large, 1)
                test.eq(enrolled[2].stats.source_bytes, #oversized)
                test.is_true(enrolled[2].last_error:find("source_too_large", 1, true) ~= nil)
                for _, run in ipairs(enrolled) do test.is_nil((json.encode(run):find("private-source-", 1, true))) end
                local finished = fixture.wait_runs(user, id, "derive", 3)
                table.sort(finished, function(a, b) return a.id < b.id end)
                test.eq(finished[1].status, "succeeded", tostring(finished[1].last_error))
                test.eq(finished[2].status, "rejected", tostring(finished[2].last_error))
                test.eq(finished[3].status, "succeeded", tostring(finished[3].last_error))
                test.eq(finished[2].stats.rejected, 1)
                test.eq(finished[2].stats.source_bytes, #oversized)
                test.is_true(finished[2].last_error:find(tostring(finished[2].stats.input_limit_bytes), 1, true) ~= nil)
                local db = fixture.db()
                local attempts, attempts_err = db:query("SELECT j.id FROM kickside_job j JOIN kickside_memory_runs r ON r.job_id = j.id WHERE r.id = $1", { finished[2].id })
                db:release()
                test.is_nil(attempts_err, tostring(attempts_err))
                test.eq(#attempts, 0)
                test.is_false(fixture.op(user, "claim", { run_id = finished[2].id, repeatable = false }).claimed)
                if phase == "deactivate" then
                    local consolidation = fixture.wait_runs(user, id, "consolidate", 1)[1]
                    test.eq(consolidation.status, "succeeded", tostring(consolidation.last_error))
                end
                local requests = fixture.script.requests(id, "structured_output")
                local extractions, judgments, reflections = 0, 0, 0
                for _, schema in ipairs(requests) do
                    if schema.properties.relations then judgments = judgments + 1
                    elseif schema.properties.items.items.properties.based_on then reflections = reflections + 1
                    else extractions = extractions + 1 end
                end
                test.eq(extractions, 2)
                test.eq(judgments, 0)
                test.eq(#requests, 2 + reflections)
                test.is_true(reflections <= (phase == "deactivate" and 1 or 0))
                test.is_nil((json.encode(fixture.script.prompts(id, "structured_output")):find("private-source-", 1, true)))
                fixture.settle(user, id)
                local values = fixture.values(fixture.items(user, id))
                test.not_nil(values.Oslo)
                test.not_nil(values.cycling)
                test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, "last")
                local again, again_err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(again_err, tostring(again_err))
                test.is_false(again.metadata.capture.captured)
                test.eq(#fixture.op(user, "runs", { component_id = id, run_type = "derive" }), 3)
                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = values.Oslo.id })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                test.is_nil(fixture.op(user, "run", { run_id = finished[1].id }).input.span)
                test.is_nil(fixture.op(user, "run", { run_id = finished[3].id }).input.span)
                test.eq(fixture.op(user, "run", { run_id = finished[2].id }).stats.rejected_source_too_large, 1)
            end)
        end

        test.it("releases capture ownership when derive succeeds before its queue acknowledgement", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "first", role = "user", content = "A first statement." },
                { id = "oversized", role = "user", content = string.rep("x", 24001) },
                { id = "last", role = "user", content = "A later statement." },
            })
            fixture.extraction(id, {})
            local _, first_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(first_err, tostring(first_err))
            local prefix = fixture.wait_runs(user, id, "derive", 1)[1]
            fixture.wait_job(prefix.job_id, "done")
            test.eq(prefix.status, "succeeded", tostring(prefix.last_error))
            local db = fixture.db()
            local _, setup_err = db:execute("UPDATE kickside_job SET status = 'running' WHERE id = $1", { prefix.job_id })
            db:release()
            test.is_nil(setup_err, tostring(setup_err))
            fixture.extraction(id, {})
            local resumed, resume_err = fixture.apply(user, "before_step", id, session, "agent-a")
            db = fixture.db()
            local _, cleanup_err = db:execute("UPDATE kickside_job SET status = 'done' WHERE id = $1", { prefix.job_id })
            db:release()
            test.is_nil(cleanup_err, tostring(cleanup_err))
            test.is_nil(resume_err, tostring(resume_err))
            test.is_true(resumed.metadata.capture.captured, "Completed derive retains capture ownership")
            local completed = fixture.wait_runs(user, id, "derive", 3)
            test.eq(#completed, 3)
            test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, "last")
        end)

        test.it("commits a rejected source record and its cursor atomically", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local event_id = "oversized-" .. user
            fixture.history.record(session, { { id = event_id, role = "user", content = string.rep("x", 24001) } })
            local db = fixture.db()
            local sqlite = db:type() == "sqlite"
            local _, setup_err = db:execute(sqlite and [[CREATE TRIGGER refuse_rejected_cursor BEFORE INSERT ON kickside_memory_cursors
                WHEN NEW.last_event_id = ']] .. event_id .. [[' BEGIN SELECT RAISE(ABORT, 'Cursor write refused'); END]] or
                "ALTER TABLE kickside_memory_cursors ADD CONSTRAINT refuse_rejected_cursor CHECK (last_event_id <> '" .. event_id .. "')")
            db:release()
            test.is_nil(setup_err, tostring(setup_err))
            local result, err = fixture.apply(user, "before_step", id, session, "agent-a")
            db = fixture.db()
            local _, cleanup_err = db:execute(sqlite and "DROP TRIGGER refuse_rejected_cursor" or
                "ALTER TABLE kickside_memory_cursors DROP CONSTRAINT refuse_rejected_cursor")
            db:release()
            test.is_nil(cleanup_err, tostring(cleanup_err))
            test.is_nil(result)
            test.not_nil(err)
            test.eq(#fixture.op(user, "runs", { component_id = id, run_type = "derive" }), 0)
            test.is_nil(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }))
            local recorded, record_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(record_err, tostring(record_err))
            test.is_true(recorded.metadata.capture.captured)
            local rejected = fixture.op(user, "run", { run_id = recorded.metadata.capture.run_id })
            test.eq(rejected.status, "rejected")
            test.is_nil(rejected.job_id)
            test.not_nil(rejected.finished_at)
            test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, event_id)
        end)

        for _, layout in ipairs({ "only", "leading", "trailing", "consecutive" }) do
            test.it("advances past " .. layout .. " oversized events without retaining their context", function()
                local user = fixture.user()
                local id = fixture.memory(user, { extraction_model = "test-bounded" })
                local session = "s-" .. user
                local oversized = string.rep("é", 14000)
                local events = {}
                if layout == "trailing" then events[#events + 1] = { id = "normal", role = "user", content = "A normal statement." } end
                events[#events + 1] = { id = "oversized", role = "assistant", content = oversized }
                if layout == "consecutive" then events[#events + 1] = { id = "oversized-again", role = "user", content = oversized } end
                if layout == "leading" then events[#events + 1] = { id = "normal", role = "user", content = "A normal statement." } end
                local expected = #events
                events[#events + 1] = { id = "ignored", role = "system", content = "Host state." }
                fixture.history.record(session, events)
                if layout == "leading" or layout == "trailing" then fixture.extraction(id, {}) end
                local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(err, tostring(err))
                test.is_true(applied.metadata.capture.captured)
                if layout == "trailing" then
                    fixture.wait_runs(user, id, "derive", 1)
                    local resumed, resume_err = fixture.apply(user, "before_step", id, session, "agent-a")
                    test.is_nil(resume_err, tostring(resume_err))
                    test.is_true(resumed.metadata.capture.captured)
                end
                local finished = fixture.wait_runs(user, id, "derive", expected)
                test.eq(#finished, expected)
                local rejected = 0
                for _, run in ipairs(finished) do
                    if run.status == "rejected" then
                        rejected = rejected + 1
                        test.eq(run.stats.source_bytes, #oversized)
                        test.is_nil(run.job_id)
                        test.not_nil(run.finished_at)
                        test.is_nil(run.input.rejection)
                        test.is_nil(run.input.span)
                        test.is_nil(run.input.context)
                    else test.eq(run.status, "succeeded", tostring(run.last_error)) end
                end
                test.eq(rejected, layout == "consecutive" and 2 or 1)
                test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, "ignored")
                fixture.history.record(session, { { id = "next", role = "user", content = "A later statement." } })
                fixture.extraction(id, {})
                local next_capture, next_err = fixture.apply(user, "before_step", id, session, "agent-a")
                test.is_nil(next_err, tostring(next_err))
                fixture.wait_runs(user, id, "derive", expected + 1)
                local next_run = fixture.op(user, "run", { run_id = next_capture.metadata.capture.run_id })
                test.eq(next_run.status, "succeeded", tostring(next_run.last_error))
                test.is_nil((json.encode(next_run):find("é", 1, true)))
                test.is_nil((json.encode(fixture.script.prompts(id, "structured_output")):find("é", 1, true)))
                test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, "next")
            end)
        end

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
