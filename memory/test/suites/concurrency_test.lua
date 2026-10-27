-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local time = require("time")

local function duplicate_write(user: string, component_id: string): (any?, error?)
    return fixture.async_op(user, "remember", {
        idempotency = "concurrent-identical",
        candidates = {
            fixture.candidate("fact", "home_city", "Paris", "The user lives in Paris.", "concurrent-city"),
        },
        opts = {
            component_id = component_id, embedding_model = "test-embed", judge_model = "test-fast",
            scope_family = "owner", scope_id = user, source = "capture", host_kind = "session", host_id = "concurrent",
        },
    })
end

local function wait_for_reflections(count: integer, component_id: string)
    local deadline = time.now():add(60 * time.SECOND)
    while #fixture.script.requests("structured_output") < count do
        local db = fixture.db()
        local jobs, err = db:query("SELECT j.status, j.last_error FROM kickside_job j JOIN kickside_memory_runs r ON r.job_id = j.id WHERE r.component_id = $1 AND j.status = 'dead'", { component_id })
        db:release()
        if err then error(tostring(err)) end
        if jobs and jobs[1] then error("memory job failed before the model barrier: " .. tostring(jobs[1].last_error)) end
        if time.now():after(deadline) then error("reflection did not reach the scripted barrier") end
        time.sleep(10 * time.MILLISECOND)
    end
end

local function wait_for_success(user: string, run_id: string): any
    local deadline = time.now():add(60 * time.SECOND)
    while true do
        local run, err = fixture.op(user, "run", { run_id = run_id })
        if err then error(tostring(err)) end
        if run.status == "succeeded" then return run end
        if time.now():after(deadline) then error("memory run did not succeed: " .. tostring(run.last_error)) end
        time.sleep(100 * time.MILLISECOND)
    end
end

local function define_tests()
    test.describe("memory concurrency", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("checks single-value write invariants with bounded set queries and skips multi-value keys", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            for _, cardinality in ipairs({ "single", "multi" }) do
                for _, count in ipairs({ 1, 20, 201 }) do
                    local measured, err = fixture.persistence_op(user, "check_cost", {
                        component_id = id, user = user, count = count, cardinality = cardinality,
                    })
                    test.is_nil(err, tostring(err))
                    test.is_true(measured.queries <= (cardinality == "multi" and 0 or 2 * math.ceil(count / 100)), tostring(measured.queries))
                end
            end
        end)

        test.it("commits tool Remember while derive is deciding and reextracts against the accepted head", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local role = fixture.candidate("profile_slot", "occupation", "engineer", "The user is an engineer.", "role-source")
            fixture.script.hold("extraction")
            fixture.script.respond("structured_output", { items = { role }, plans = {} })
            fixture.history.record(session, { { id = "role-source", role = "user", content = "I am an engineer." } })
            local _, err = fixture.op(user, "apply", { payload = fixture.payload("before_step", session, "agent-a") },
                fixture.agent_context(id, session, "agent-a"))
            test.is_nil(err, tostring(err))
            wait_for_reflections(1, id)
            fixture.normalization({ fixture.candidate("profile_slot", "employer", "Northstar", "The user works at Northstar.") })
            local remembered, remember_err = fixture.op(user, "tool_remember", { input = {
                key = "employer", kind = "profile_slot", cardinality = "single", value = "Northstar", content = "The user works at Northstar.",
            } }, fixture.agent_context(id, session, "agent-a"))
            test.is_nil(remember_err, tostring(remember_err))
            test.is_true(remembered.success)
            fixture.settle(user, id)
            fixture.verdict("ADD", {})
            fixture.extraction({ role })
            fixture.verdict("ADD", {})
            fixture.script.release("extraction")
            local runs = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
            local run = wait_for_success(user, runs[1].id)
            test.is_nil(run.last_error)
            fixture.wait_job(run.job_id, "done")
            local db = fixture.db()
            local jobs = assert(db:query("SELECT attempt_no, status, error_text FROM kickside_job_run WHERE job_id = $1", { run.job_id }))
            db:release()
            test.eq(#jobs, 1)
            test.eq(tonumber(jobs[1].attempt_no), 1)
            test.eq(jobs[1].status, "completed")
            test.is_nil(jobs[1].error_text)
            fixture.settle(user, id)
            local current = fixture.items(user, id, { statuses = { "current" } })
            test.eq(#current, 2)
            test.eq(fixture.items(user, id, { key = "employer" })[1].value, "Northstar")
            test.eq(fixture.items(user, id, { key = "occupation" })[1].value, "engineer")
            test.eq(fixture.script.pending("structured_output"), 0)
        end)

        test.it("redecides a stale writer against the current head and keeps both independent writes", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local result, err = fixture.persistence_op(user, "append_race", { component_id = id, user = user })
            test.is_nil(err, tostring(err))
            test.eq(result.result.attempts, 2)
            test.eq(result.stats.added, 1)
            fixture.settle(user, id)
            test.eq(fixture.count_rows("kickside_memory_payloads", id), 1)
            test.eq(fixture.count_rows("kickside_memory_embeddings", id), 1)
            test.eq(#fixture.items(user, id), 1)
        end)

        test.it("keeps an accepted duplicate write's payload and vector when identical writes overlap", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local first, first_start_err = duplicate_write(user, component_id)
            local second, second_start_err = duplicate_write(user, component_id)
            test.is_nil(first_start_err, tostring(first_start_err))
            test.is_nil(second_start_err, tostring(second_start_err))

            local first_result, first_err = fixture.await(first)
            local second_result, second_err = fixture.await(second)
            test.is_nil(first_err, tostring(first_err))
            test.is_nil(second_err, tostring(second_err))
            test.not_nil(first_result)
            test.not_nil(second_result)
            fixture.settle(user, component_id)
            test.eq(fixture.count_rows("kickside_memory_payloads", component_id), 1)
            test.eq(fixture.count_rows("kickside_memory_embeddings", component_id), 1)
            test.eq(#fixture.items(user, component_id, { statuses = { "current" } }), 1)
        end)

        test.it("retries a held reflection after Forget moves its settled head", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            fixture.remember(user, component_id, {
                fixture.candidate("fact", "job", "nurse", "The user works night shifts as a nurse.", "concurrent-job"),
                fixture.candidate("fact", "sleep", "day", "The user sleeps during the day.", "concurrent-sleep"),
            }, "concurrent-reflection-seed")
            fixture.settle(user, component_id)
            local evidence = fixture.items(user, component_id, { statuses = { "current" } })

            local lesson = fixture.candidate("lesson", "contact_time", "evening", "Reach the user in the evening; they sleep during the day.", "")
            lesson.based_on = { 1, 2 }
            fixture.script.hold("structured_output")
            fixture.script.respond("structured_output", { items = { lesson } })
            fixture.normalization({ lesson })
            fixture.verdict("ADD", {})
            local woken, wake_err = fixture.op(user, "wake", { component_id = component_id })
            test.is_nil(wake_err, tostring(wake_err))
            test.is_true(woken.woken)
            wait_for_reflections(1, component_id)

            local _, forget_err = fixture.op(user, "forget", { component_id = component_id, item_id = evidence[1].id })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, component_id)
            fixture.script.release("structured_output")

            local run = wait_for_success(user, "consolidate:" .. component_id)
            test.eq(run.status, "succeeded", tostring(run.last_error))
            test.eq(#fixture.script.requests("structured_output"), 3)
            test.eq(fixture.script.pending("structured_output"), 0)
            test.eq(#fixture.items(user, component_id, { kinds = { "lesson" } }), 0)
        end)

        test.it("keeps a held model failure content free after Forget erases its input", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("fact", "access_code", "Kestrel-42", "The access code is Kestrel-42.") }, "failure-seed")
            fixture.settle(user, id)
            local item = fixture.items(user, id)[1]
            fixture.script.hold("structured_output")
            fixture.script.fail("structured_output", "Provider refused Kestrel-42", errors.INVALID, false)
            local queued, err = fixture.op(user, "embed_contract", { component_id = id, request = {
                content = "The access code is Kestrel-42.", external_id = "held-failure", external_version = "1",
            } })
            test.is_nil(err, tostring(err))
            test.is_true(queued.success, tostring(queued.error))
            wait_for_reflections(1, id)
            local captured = fixture.op(user, "run", { run_id = queued.run_id })
            fixture.remember(user, id, { fixture.candidate("fact", "access_code", "Kestrel-42", "The access code is Kestrel-42.", captured.input.span[1].id) },
                "failure-source", { host_kind = "content", host_id = id })
            fixture.settle(user, id)
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = item.id })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            fixture.script.release("structured_output")
            local run = fixture.wait_runs(user, id, "derive", 1)[1]
            test.is_nil(run.input.span)
            test.not_nil(run.last_error)
            test.is_true(tostring(run.last_error):find("Kestrel", 1, true) == nil)
            fixture.wait_job(run.job_id, "dead")
            local db = fixture.db()
            local rows, query_err = db:query("SELECT last_error FROM kickside_job WHERE id = $1", { run.job_id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.is_true(tostring(rows[1].last_error):find("Kestrel", 1, true) == nil)
        end)

        test.it("discards extraction from a captured input erased while the model is held", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local session_id = "capture-" .. user
            fixture.remember(user, component_id, { fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "held-message") }, "before-capture", { host_id = session_id })
            fixture.settle(user, component_id)
            local original = fixture.items(user, component_id)[1]
            fixture.history.record(session_id, { { id = "held-message", role = "user", content = "I live in Paris." } })
            fixture.script.hold("structured_output")
            fixture.extraction({ fixture.candidate("fact", "city_knowledge", "Paris", "The user resides in Paris.", "held-message") })
            local _, capture_err = fixture.op(user, "apply", { payload = fixture.payload("before_step", session_id, "agent-a") }, fixture.agent_context(component_id, session_id, "agent-a"))
            test.is_nil(capture_err, tostring(capture_err))
            wait_for_reflections(1, component_id)
            local _, forget_err = fixture.op(user, "forget", { component_id = component_id, item_id = original.id })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, component_id)
            fixture.script.release("structured_output")
            local pending = fixture.op(user, "runs", { component_id = component_id, run_type = "derive" })
            test.eq(#pending, 1)
            local run = wait_for_success(user, pending[1].id)
            test.eq(run.status, "succeeded", tostring(run.last_error))
            fixture.settle(user, component_id)
            test.eq(#fixture.items(user, component_id, { statuses = { "current" } }), 0)
            test.is_nil(run.input.span)
        end)
        test.it("rechecks single-value invariants after a concurrent replacement", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local original = fixture.create_claim(user, id, "Paris")
            local result, err = fixture.persistence_op(user, "invariant_race", {component_id=id, item_id=original.item_id, user=user})
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            fixture.settle(user, id)
            local rows = fixture.items(user, id, {statuses={"current"}})
            test.eq(#rows, 1)
            test.eq(rows[1].value, "Berlin")
        end)

        test.it("bounds repeated head contention and rolls back every unaccepted payload and vector", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local result, err = fixture.persistence_op(user, "append_race", { component_id = id, user = user, contended = true })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.UNAVAILABLE)
            test.is_true(err:retryable())
            test.eq(fixture.count_rows("kickside_memory_payloads", id), 0)
            test.eq(fixture.count_rows("kickside_memory_embeddings", id), 0)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
