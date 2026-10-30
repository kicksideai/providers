-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("capture", function()

        test.it("returns consolidation wake failures from deactivation", function()
            local user = fixture.user()
            for _, missing in ipairs({ "job", "run" }) do
                local id = fixture.memory(user)
                local session = "s-" .. user
                fixture.record_chat(user, session, {
                    { id = "instruction", role = "developer", author = { kind = "system" }, content = "Use the available context." },
                })
                local db = fixture.db()
                local statement = missing == "job" and "UPDATE kickside_memory_runs SET job_id = NULL WHERE id = $1"
                    or "DELETE FROM kickside_memory_runs WHERE id = $1"
                local _, update_err = db:execute(statement, { "consolidate:" .. id })
                db:release()
                test.is_nil(update_err, tostring(update_err))
                local result, err = fixture.apply(user, "deactivate", id, session, "agent-a")
                test.not_nil(err)
                test.eq(err:kind(), errors.NOT_FOUND)
                test.is_nil(result)
            end
        end)

        test.it("records one content-free failure message without changing supplied details", function()
            local result, err = fixture.op(fixture.user(), "diagnostics", {})
            test.is_nil(err, tostring(err))
            for _, details in ipairs({ result.details, result.cause_details, result.invalid_details,
                result.unavailable_details, result.failed_details }) do
                test.is_nil(details.memory_explanation)
                test.eq(details.marker, "unchanged")
            end
            test.eq(result.failed_message, "dependency failed")
            test.eq(result.failure.explanation, "dependency failed")
            test.eq(result.failure.kind, errors.TIMEOUT)
            test.is_true(result.failure.retryable)
            test.is_nil((json.encode(result.failure):find("Private span text", 1, true)))
        end)

        test.it("keeps failed capture spans unconsumed for the next capture", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local failed_span = { id = "failed-span", role = "user", author = { kind = "user", id = user }, content = "I prefer aisle seats." }
            fixture.record_chat(user, session, { failed_span })
            fixture.script.fail(id, "structured_output", "provider rejects aisle seats", errors.INVALID)
            local first, first_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(first_err, tostring(first_err))
            local failed = fixture.wait_runs(user, id, "derive", 1)[1]
            fixture.wait_job(failed.job_id, "dead")
            test.eq(failed.status, "failed")
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.is_true(cursor == nil or cursor.last_event_id == nil)
            fixture.extraction(id, { fixture.candidate("preference", "seat_position", "aisle", "The user prefers aisle seats.", failed_span.id) })
            local second, second_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(second_err, tostring(second_err))
            test.is_true(second.metadata.capture.captured)
            test.is_true(first.metadata.capture.run_id ~= second.metadata.capture.run_id)
            fixture.wait_runs(user, id, "derive", 2)
            fixture.settle(user, id)
            test.eq(fixture.items(user, id)[1].value, "aisle")
            local retained = fixture.op(user, "run", { run_id = failed.id })
            test.eq(retained.status, "failed")
            test.eq(json.decode(retained.last_error).explanation, "memory extraction failed")
            cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, failed_span.id)
        end)

        test.it("retries malformed output through the enrolled job and retains each failed attempt", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local retry_source = { id = "retry-source", role = "user", author = { kind = "user", id = user }, content = "I live in Oslo." }
            fixture.record_chat(user, session, { retry_source })
            fixture.script.fail(id, "structured_output", "invalid JSON", errors.NOT_FOUND, false,
                { error_type = "model_error", raw_content = '{"items":[' })
            fixture.extraction(id, { fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", retry_source.id) })
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local run = fixture.wait_runs(user, id, "derive", 1)[1]
            local job = fixture.wait_job(run.job_id, "done")
            test.eq(job.attempts, 0)
            run = fixture.op(user, "run", { run_id = run.id })
            test.eq(run.status, "succeeded")
            test.is_nil(run.last_error)
            local db = fixture.db()
            local attempts, query_err = db:query("SELECT * FROM kickside_job_run WHERE job_id = $1 ORDER BY attempt_no", { run.job_id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#attempts, 2)
            test.eq(attempts[1].status, "failed")
            test.eq(tonumber(attempts[1].attempt_no), 1)
            test.eq(tonumber(attempts[2].attempt_no), 2)
            test.is_true(attempts[1].error_text:find("memory extraction returned malformed output", 1, true) ~= nil, attempts[1].error_text)
            fixture.settle(user, id)
            test.eq(fixture.items(user, id)[1].value, "Oslo")
            test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, retry_source.id)
        end)

        test.it("retries invalid extraction through the existing job before advancing capture", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local validation_source = { id = "validation-source", role = "user", author = { kind = "user", id = user }, content = "I live in Oslo." }
            fixture.record_chat(user, session, { validation_source })
            fixture.extraction(id, { fixture.candidate("profile_slot", "home_city", "", "The user lives in Oslo.", validation_source.id) })
            fixture.extraction(id, { fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", validation_source.id) })
            local _, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local run = fixture.wait_runs(user, id, "derive", 1)[1]
            fixture.wait_job(run.job_id, "done")
            run = fixture.op(user, "run", { run_id = run.id })
            test.eq(run.status, "succeeded")
            test.is_nil(run.stats.rejected)
            local db = fixture.db()
            local attempts, query_err = db:query("SELECT status, error_text FROM kickside_job_run WHERE job_id = $1 ORDER BY attempt_no", { run.job_id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#attempts, 2)
            test.eq(attempts[1].status, "failed")
            test.eq(attempts[1].error_text, "memory extraction returned malformed output")
            test.eq(attempts[2].status, "completed")
            fixture.settle(user, id)
            test.eq(fixture.items(user, id)[1].value, "Oslo")
            test.eq(fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session }).last_event_id, validation_source.id)
        end)

        test.it("advances past exhausted invalid output and processes the next capture range", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local first = { id = "bad", role = "user", author = {kind = "user", id = user}, content = "I prefer tea." }
            fixture.record_chat(user, session, {first})
            local bad = fixture.candidate("preference", "drink", "tea", "The user prefers tea.", first.id)
            bad.valid_at = "confidence_0.99"
            fixture.script.hold(id, "extraction")
            for i = 1, 3 do fixture.extraction(id, {bad}) end
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local second = { id = "next", role = "user", author = {kind = "user", id = user}, content = "I live in Oslo." }
            fixture.record_chat(user, session, {second})
            fixture.extraction(id, {fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", second.id)})
            local next_applied, next_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(next_err, tostring(next_err))
            local pending_cursor = fixture.op(user, "cursor", {component_id = id, host_kind = "session", host_id = session})
            test.is_true(pending_cursor == nil or pending_cursor.last_event_id == nil)
            fixture.script.release(id, "extraction")
            local failed = fixture.wait_run(user, applied.metadata.capture.run_id, function(run) return run.status == "failed" end)
            test.eq(fixture.wait_job(failed.job_id, "dead").attempts, 3)
            failed = fixture.op(user, "run", {run_id = failed.id})
            test.eq(failed.status, "failed")
            test.eq(failed.input.model_output.items[1].valid_at, "confidence_0.99")
            test.is_false(json.decode(failed.last_error).retryable)
            fixture.settle(user, id)
            fixture.wait_run(user, next_applied.metadata.capture.run_id, function(run) return run.status == "succeeded" end)
            fixture.settle(user, id)
            local all = fixture.items(user, id)
            test.eq(#all, 1)
            test.eq(all[1].value, "Oslo")
            test.eq(fixture.op(user, "cursor", {component_id = id, host_kind = "session", host_id = session}).last_event_id, second.id)
        end)

        test.it("terminates a conflicting new-topic batch without blocking the next range", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "batch-" .. user
            local context = fixture.agent_context(id, session, "agent-a", {learn_in_isolation = true})
            local first = {id = "first", role = "assistant", author = {kind = "agent", id = "agent-a"},
                content = "Inspect the declared representation before parsing."}
            fixture.record_chat(user, session, {first})
            for i = 1, 3 do fixture.extraction(id, {
                fixture.candidate("fact", "representation", "HTML", "The returned representation is HTML.", first.id),
                fixture.candidate("lesson", "representation", "Inspect the declared representation.", "Inspect the declared representation.", first.id),
            }) end
            local result, err = fixture.op(user, "apply", {payload = fixture.payload("before_step", session, "agent-a")}, context)
            test.is_nil(err, tostring(err))
            local failed = fixture.wait_run(user, result.metadata.capture.run_id, function(run) return run.status == "failed" end)
            test.eq(fixture.wait_job(failed.job_id, "dead").attempts, 3)
            failed = fixture.op(user, "run", {run_id = failed.id})
            test.eq(json.decode(failed.last_error).code, "model_output_invalid_extraction_kind")
            test.not_nil(failed.input.model_output)
            test.eq(#fixture.items(user, id), 0)
            fixture.settle(user, id)
            test.eq(fixture.op(user, "cursor", {component_id = id, host_kind = "session", host_id = session}).last_event_id, first.id)
            local second = {id = "second", role = "assistant", author = {kind = "agent", id = "agent-a"}, content = "Verify source claims."}
            fixture.record_chat(user, session, {second})
            fixture.extraction(id, {fixture.candidate("lesson", "verification", "Verify source claims.", "Verify source claims.", second.id)})
            local next_run, next_err = fixture.op(user, "apply", {payload = fixture.payload("before_step", session, "agent-a")}, context)
            test.is_nil(next_err, tostring(next_err))
            test.eq(fixture.wait_run(user, next_run.metadata.capture.run_id, function(run) return run.status == "succeeded" end).status, "succeeded")
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 1)
            test.eq(fixture.items(user, id)[1].key, "verification")
        end)

        test.it("retains an exhausted transient failure and captures its source after recovery", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local seat_request = { id = "seat-request", role = "user", author = { kind = "user", id = user }, content = "I prefer aisle seats." }
            fixture.record_chat(user, session, { seat_request })
            for i = 1, 3 do fixture.script.fail(id, "structured_output", "Rejected private span text", errors.TIMEOUT) end
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            local failed = fixture.wait_runs(user, id, "derive", 1)[1]
            local job = fixture.wait_job(failed.job_id, "dead")
            test.eq(job.attempts, 3)
            failed = fixture.op(user, "run", { run_id = failed.id })
            local diagnostic = json.decode(failed.last_error)
            test.eq(diagnostic.kind, errors.TIMEOUT)
            test.eq(diagnostic.explanation, "memory extraction failed")
            test.is_nil((failed.last_error:find("private span text", 1, true)))
            local continued = { id = "continue", role = "user", author = { kind = "user", id = user }, content = "Let us continue." }
            fixture.record_chat(user, session, { continued })
            fixture.extraction(id, { fixture.candidate("preference", "seat_position", "aisle", "The user prefers aisle seats.", seat_request.id) })
            local recovered, recovery_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(recovery_err, tostring(recovery_err))
            test.is_true(recovered.metadata.capture.captured)
            fixture.wait_runs(user, id, "derive", 2)
            fixture.settle(user, id)
            test.eq(fixture.items(user, id)[1].value, "aisle")
            local retained = fixture.op(user, "run", { run_id = applied.metadata.capture.run_id })
            test.eq(retained.status, "failed")
            test.eq(retained.last_error, failed.last_error)
        end)

        test.it("extracts canonical keys and scalar values before claim identity", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seed = fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "seed", "2026-09-01T10:00:00Z") }, "normalize-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            local moved = { id = "move", role = "user", author = { kind = "user", id = user }, content = "I moved to Berlin." }
            fixture.record_chat(user, session, { moved })
            fixture.extraction(id, { fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", moved.id) })
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            fixture.settle(user, id)
            local rows = fixture.values(fixture.items(user, id))
            test.eq(rows.Berlin.key, "home_city")
            test.eq(rows.Berlin.version, 2)
            test.eq(rows.Paris.status, "superseded")
        end)

        test.it("carries preceding questions as uncitable context into extraction", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "seed") }, "context-seed")
            fixture.settle(user, id)
            local initial_events = {
                { id = "greeting", role = "user", author = { kind = "user", id = user }, content = "Help me plan a trip." },
                { id = "question", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "Where are you planning to travel?" },
            }
            fixture.record_chat(user, session, initial_events)
            fixture.extraction(id, {})
            local initial, initial_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(initial_err, tostring(initial_err))
            test.is_true(initial.metadata.capture.captured)
            fixture.wait_runs(user, id, "derive", 1)
            local answer = { id = "answer", role = "user", author = { kind = "user", id = user }, content = "London" }
            fixture.record_chat(user, session, { answer })
            fixture.extraction(id, { fixture.candidate("plan", "trip_tickets", { status = "open", next_step = "", details = "Travel to London" }, "The user wants to travel to London.", answer.id) })
            local answered, answer_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(answer_err, tostring(answer_err))
            test.is_true(answered.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 2)
            for _, run in ipairs(runs) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
            local prompts = fixture.script.prompts(id, "structured_output")
            test.is_true(prompts[2].user:find("Where are you planning to travel?", 1, true) ~= nil, prompts[2].user)
            test.eq(table.concat(fixture.script.requests(id, "structured_output")[2].properties.items.items.properties.event_id.enum, ","), answer.id)
            test.eq(#prompts, 2)
            test.eq(fixture.items(user, id, { key = "home_city" })[1].value, "Berlin")
            test.eq(fixture.items(user, id, { key = "trip_tickets" })[1].value.details, "Travel to London")
        end)

        test.it("captures conversation while dropping developer messages and retaining the attributable tool outcome", function()
            local user = fixture.user()
            local id = fixture.memory(user, { capture_experience = true })
            local session = "s-" .. user
            local events = {
                { id = "h1", role = "user", author = { kind = "user", id = user }, content = "Hi! I live in Paris and I am vegetarian." },
                { id = "h2", role = "developer", author = { kind = "system" }, content = "- The user likes jazz.", metadata = { memory_ids = { "x" } } },
                { id = "h3", role = "function", author = { kind = "system" }, content = "{\"query\":\"vegetarian\"}", metadata = {
                    function_name = "lookup", status = "error", result = "pagination requires page_size",
                } },
                { id = "h4", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "Nice to meet you." },
            }
            fixture.record_chat(user, session, events)
            fixture.extraction(id, {
                fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", events[1].id),
                fixture.candidate("preference", "diet", "vegetarian", "The user is vegetarian.", events[1].id),
            })
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            local span = runs[1].input.span
            test.eq(#span, 3)
            test.eq(span[1].id, events[1].id)
            test.eq(span[2].role, "tool")
            test.eq(span[2].text, "tool lookup error\npagination requires page_size")
            test.eq(span[3].id, events[4].id)
            test.eq(runs[1].input.owner_id, user)
            fixture.settle(user, id)
            local items = fixture.values(fixture.items(user, id))
            test.eq(items.Paris.scope_key, "owner:" .. user)
            test.eq(items.vegetarian.kind, "preference")
            local provenance = fixture.op(user, "provenance", { component_id = id, item_id = items.Paris.id })
            test.eq(#provenance, 1)
            test.eq(provenance[1].event_id, events[1].id)
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, events[4].id)
        end)

        test.it("bounds a retained tool outcome to the derive source limit", function()
            local user = fixture.user()
            local id = fixture.memory(user, { capture_experience = true })
            local session = "s-" .. user
            local events = {
                { id = "user", role = "user", author = { kind = "user", id = user }, content = "Please inspect the result." },
                { id = "tool", role = "function", author = { kind = "system" }, content = "{}", metadata = {
                    function_name = "inspect", status = "error", result = string.rep("x", 30000),
                } },
            }
            fixture.record_chat(user, session, events)
            fixture.extraction(id, {})
            fixture.extraction(id, {})
            local applied, err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local captured = fixture.wait_runs(user, id, "derive", 2)
            local tool_entry
            for _, run in ipairs(captured) do
                for _, entry in ipairs(run.input.span) do
                    if entry.id == events[2].id then tool_entry = entry end
                end
            end
            test.not_nil(tool_entry)
            test.eq(#tool_entry.text, 24000)
            test.is_true(tool_entry.text:find("tool inspect error\n", 1, true) == 1)
        end)

        test.it("derives memories only from what the user states, never from assistant narration", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local initial_events = {
                { id = "n0", role = "user", author = { kind = "user", id = user }, content = "Hello." },
                { id = "n1", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "You told me you live in Rome and love opera." },
            }
            fixture.record_chat(user, session, initial_events)
            fixture.extraction(id, {})
            local applied, apply_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(apply_err, tostring(apply_err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(runs[1].stats.candidates, 0)
            test.eq(#fixture.items(user, id), 0)

            local follow_up_events = {
                { id = "n2", role = "user", author = { kind = "user", id = user }, content = "Book me an opera night next week." },
                { id = "n3", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "Sure, Rome has great opera." },
            }
            fixture.record_chat(user, session, follow_up_events)
            fixture.extraction(id, { fixture.candidate("preference", "evening", "opera", "The user wants an opera night.", follow_up_events[1].id) })
            local next_applied, next_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(next_err, tostring(next_err))
            test.is_true(next_applied.metadata.capture.captured)
            fixture.wait_runs(user, id, "derive", 2)
            local schema = fixture.script.requests(id, "structured_output")[2]
            test.eq(table.concat(schema.properties.items.items.properties.event_id.enum, ","), table.concat({ follow_up_events[1].id, follow_up_events[2].id }, ","))
            local span = fixture.script.prompts(id, "structured_output")[2].user
            test.is_true(span:find("[" .. follow_up_events[1].id .. "]", 1, true) ~= nil, span)
            test.is_true(span:find("[" .. follow_up_events[2].id .. "]", 1, true) ~= nil, span)
            test.is_true(span:find("author=agent:agent-a", 1, true) ~= nil, span)
        end)

        test.it("offers extraction the keys already in use for the person, so a restated attribute keeps its key", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("profile_slot", "name", "Sam", "Name: Sam.", "k0"),
                fixture.candidate("preference", "diet", "vegetarian", "Diet: vegetarian.", "k0"),
            }, "keys-seed")
            fixture.settle(user, id)
            local session = "s-" .. user
            local name_message = { id = "k1", role = "user", author = { kind = "user", id = user }, content = "You can call me Sam, that's my preferred name." }
            fixture.record_chat(user, session, { name_message })
            fixture.extraction(id, {})
            local applied, apply_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(apply_err, tostring(apply_err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            local prompt = fixture.script.prompts(id, "structured_output")[1].system
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
            local city_update = { id = "c1", role = "user", author = { kind = "user", id = user }, content = "I moved to Berlin last month.", created_at = "2026-10-08T10:00:00Z" }
            fixture.record_chat(user, session, { city_update })
            fixture.extraction(id, { fixture.candidate("profile_slot", "residence", "Berlin", "The user lives in Berlin.", city_update.id) })
            fixture.relations(id, { "updates" })
            local applied, apply_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(apply_err, tostring(apply_err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            local judge = fixture.script.prompts(id, "structured_output")[2].user
            test.is_true(judge:find("I moved to Berlin last month.", 1, true) ~= nil, judge)
        end)

        test.it("brings consolidation forward when the agent deactivates, even with nothing new to capture", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.record_chat(user, session, {
                { id = "instruction", role = "developer", author = { kind = "system" }, content = "Use the available context." },
            })
            local result, err = fixture.apply(user, "deactivate", id, session, "agent-a")
            test.is_nil(err, tostring(err))
            test.eq(result.metadata.capture.reason, "nothing_to_capture")
            local runs = fixture.wait_runs(user, id, "consolidate", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
        end)

        test.it("captures each persisted record once across after_persist and before_step", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local initial_events = {
                { id = "p1", role = "user", author = { kind = "user", id = user }, content = "My manager is Dana." },
                { id = "p2", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "Noted." },
            }
            fixture.record_chat(user, session, initial_events)
            fixture.extraction(id, { fixture.candidate("fact", "manager", "Dana", "The user's manager is Dana.", initial_events[1].id) })
            local persisted, err = fixture.apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = initial_events[2].id } })
            test.is_nil(err, tostring(err))
            test.is_true(persisted.metadata.capture.captured)
            local again, again_err = fixture.apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = initial_events[2].id } })
            test.is_nil(again_err, tostring(again_err))
            test.eq(again.metadata.capture.captured, false)
            fixture.wait_runs(user, id, "derive", 1)
            fixture.settle(user, id)
            local step, step_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(step_err, tostring(step_err))
            test.eq(step.metadata.capture.captured, false)
            test.eq(step.metadata.capture.reason, "no_new_history")
            local office_update = { id = "p3", role = "user", author = { kind = "user", id = user }, content = "Dana moved to the Berlin office." }
            fixture.record_chat(user, session, { office_update })
            fixture.extraction(id, { fixture.candidate("fact", "manager_office", "Berlin", "The user's manager Dana works in the Berlin office.", office_update.id) })
            fixture.relations(id, { "unrelated" })
            local next_step, next_err = fixture.apply(user, "before_step", id, session, "agent-a")
            test.is_nil(next_err, tostring(next_err))
            test.is_true(next_step.metadata.capture.captured)
            fixture.wait_runs(user, id, "derive", 2)
            fixture.settle(user, id)
            local stale, stale_err = fixture.apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = office_update.id } })
            test.is_nil(stale_err, tostring(stale_err))
            test.eq(stale.metadata.capture.reason, "already_captured")
            local runs = fixture.wait_runs(user, id, "derive", 2)
            test.eq(#runs, 2)
            for _, run in ipairs(runs) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 2)
        end)

        test.it("fails the lifecycle when its history binding is unavailable", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local payload = fixture.payload("before_step", "s-missing", "agent-a")
            payload.run_context.binding = "app.suites:no_such_binding"
            local _, err = fixture.op(user, "apply", { payload = payload }, fixture.agent_context(id, "s-missing", "agent-a"))
            test.not_nil(err)
            test.eq(err:kind(), errors.NOT_FOUND)
        end)

        test.it("rejects lifecycle payloads without a host", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local _, host_err = fixture.op(user, "apply", { payload = { phase = "before_step" } }, fixture.agent_context(id, "s", "a"))
            test.not_nil(host_err)
            test.eq(host_err:kind(), errors.INVALID)
        end)

        test.it("ignores lifecycle phases it does not implement", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local ignored = fixture.op(user, "apply", { payload = fixture.payload("after_step", "s", "agent-a") }, fixture.agent_context(id, "s", "a"))
            test.is_true(ignored.metadata.ignored)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
