-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function force_cycle_started_at(run_id: string): () -> ()
    local db = fixture.db()
    local sqlite = db:type() == "sqlite"
    local suffix = run_id:gsub("[^%w]", "_")
    local trigger = "memory_cycle_started_at_" .. suffix
    local fn = trigger .. "_fn"
    local quoted = run_id:gsub("'", "''")
    local statement = sqlite and
        ("CREATE TRIGGER " .. trigger .. " AFTER UPDATE OF status ON kickside_memory_runs WHEN NEW.id = '" .. quoted ..
            "' BEGIN UPDATE kickside_memory_runs SET started_at = '2026-01-01T00:00:00Z' WHERE id = NEW.id; END") or
        ("CREATE FUNCTION " .. fn .. "() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.started_at = '2026-01-01T00:00:00Z'; RETURN NEW; END $$")
    local _, setup_err = db:execute(statement)
    if not setup_err and not sqlite then
        _, setup_err = db:execute("CREATE TRIGGER " .. trigger .. " BEFORE UPDATE OF status ON kickside_memory_runs FOR EACH ROW " ..
            "WHEN (NEW.id = '" .. quoted .. "') EXECUTE FUNCTION " .. fn .. "()")
    end
    db:release()
    if setup_err then error(tostring(setup_err)) end
    return function()
        local cleanup = fixture.db()
        local _, trigger_err = cleanup:execute(sqlite and ("DROP TRIGGER " .. trigger) or
            ("DROP TRIGGER " .. trigger .. " ON kickside_memory_runs"))
        if not trigger_err and not sqlite then _, trigger_err = cleanup:execute("DROP FUNCTION " .. fn .. "()") end
        cleanup:release()
        if trigger_err then error(tostring(trigger_err)) end
    end
end

local function define_tests()
    test.describe("memory consolidation", function()

        test.it("applies memory policy to reflection", function()
            local user = fixture.user()
            local instructions = "Retain work and sleep facts, but do not retain contact-time guidance."
            local id = fixture.memory(user, { extraction_instructions = instructions })
            fixture.remember(user, id, {
                fixture.candidate("fact", "work_schedule", "night", "The user works at night.", "work-source"),
                fixture.candidate("fact", "rest_period", "day", "The user rests during the day.", "rest-source"),
            }, "reflection-policy-seed", { source = "owner" })
            fixture.settle(user, id)
            fixture.script.respond(id, "structured_output", { items = {} })
            local _, wake_err = fixture.op(user, "wake", { component_id = id })
            test.is_nil(wake_err, tostring(wake_err))
            local run = fixture.wait_runs(user, id, "consolidate", 1)[1]
            test.eq(run.status, "succeeded", tostring(run.last_error))
            local prompt = fixture.script.prompts(id, "structured_output")[1].system
            test.is_true(prompt:find("Memory policy:\n" .. instructions, 1, true) ~= nil, prompt)
        end)

        test.it("fails consolidation without persisting any lesson when reflection is invalid", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.relations(id, { "unrelated" })
            fixture.remember(user, id, {
                fixture.candidate("fact", "work_schedule", "night", "The user works at night.", "work-source"),
                fixture.candidate("fact", "rest_period", "day", "The user rests during the day.", "rest-source"),
                fixture.candidate("fact", "work_location", "remote", "The user works remotely.", "location-source"),
                fixture.candidate("fact", "contact_channel", "email", "The user reads email.", "channel-source"),
            }, "reflection-topics", { source = "owner" })
            fixture.settle(user, id)
            local lesson = fixture.candidate("lesson", "contact_evening", "evening", "Contact the user in the evening.", "")
            lesson.based_on = { 1, 2 }
            local valid = fixture.candidate("lesson", "contact_guidance", "evening", lesson.content, "")
            valid.based_on = { 1, 2 }
            fixture.script.respond(id, "structured_output", { items = { lesson, valid } })
            local _, err = fixture.op(user, "wake", { component_id = id })
            test.is_nil(err, tostring(err))
            local run = fixture.wait_runs(user, id, "consolidate", 1)[1]
            test.eq(run.status, "failed")
            test.is_true(run.last_error:find("model_output_invalid_reflection_topic_key", 1, true) ~= nil, run.last_error)
            test.is_nil(run.stats.rejected)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { kinds = { "lesson" } }), 0)
            fixture.script.respond(id, "structured_output", { items = {} })
            fixture.wait_runs(user, id, "consolidate", 1, "succeeded")
            fixture.wait_job(run.job_id, "pending")
        end)

        test.it("runs on demand through the slot, writes reflections, and re-arms on the configured cadence", function()
            local user = fixture.user()
            local id = fixture.memory(user, { consolidation_interval_hours = 6 })
            local _, seed_err = fixture.remember(user, id, {
                fixture.candidate("fact", "job", "nurse", "The user works night shifts as a nurse.", "m1"),
                fixture.candidate("fact", "sleep", "day", "The user sleeps during the day.", "m2"),
            }, "k1")
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            test.eq(fixture.script.pending(id, "structured_output"), 0)
            local lesson = fixture.candidate("lesson", "contact_time", "evening", "Reach the user in the evening; they sleep during the day.", "")
            lesson.based_on = { 1, 2 }
            fixture.script.respond(id, "structured_output", { items = { lesson } })
            fixture.normalization(id, { lesson })
            local woken, err = fixture.op(user, "wake", { component_id = id })
            test.is_nil(err, tostring(err))
            test.is_true(woken.woken)
            local runs = fixture.wait_runs(user, id, "consolidate", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(runs[1].stats.scopes, 1)
            test.eq(runs[1].stats.added, 1)
            local judged = fixture.script.requests(id, "structured_output")
            test.eq(#judged, 2)
            test.eq(runs[1].stats.judged, 0)
            fixture.settle(user, id)
            local lessons = fixture.items(user, id, { kinds = { "lesson" } })
            test.eq(#lessons, 1)
            test.eq(lessons[1].source, "reflection")
            test.eq(lessons[1].scope_key, "owner:" .. user)
            local job = fixture.wait_job(runs[1].job_id, "pending")
            local scheduled = tostring(job.scheduled_at)
            if scheduled:match("^%d+%-%d+%-%d+ %d+:%d+:%d+") then
                scheduled = scheduled:sub(1, 10) .. "T" .. scheduled:sub(12, 19) .. "Z"
            end
            local next_at = time.parse(time.RFC3339, scheduled)
            test.not_nil(next_at)
            test.is_true(next_at:after(time.now():add(5 * time.HOUR)), tostring(job.scheduled_at))
            test.is_true(next_at:before(time.now():add(7 * time.HOUR)), tostring(job.scheduled_at))
        end)

        test.it("completes consolidation when reflection duplicates one of its own source lessons", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("lesson", "contact_window", "evening", "Send requests outside the rest period.", "guidance"),
                fixture.candidate("fact", "rest_period", "day", "The user rests during the day.", "rest"),
            }, "duplicate-reflection-seed", { source = "owner" })
            fixture.settle(user, id)
            local current = fixture.items(user, id)
            local source_id
            for _, item in ipairs(current) do if item.kind == "lesson" then source_id = item.id end end
            local original = fixture.op(user, "provenance", { component_id = id, item_id = source_id })
            local duplicate = fixture.candidate("lesson", "contact_window", "evening", "Send requests outside the rest period.", "")
            duplicate.based_on = { 1, 2 }
            fixture.script.respond(id, "structured_output", { items = { duplicate } })
            fixture.normalization(id, { duplicate })
            local _, err = fixture.op(user, "wake", { component_id = id })
            test.is_nil(err, tostring(err))
            local run = fixture.wait_runs(user, id, "consolidate", 1)[1]
            test.eq(run.status, "succeeded", tostring(run.last_error))
            test.eq(run.stats.noop, 1)
            test.eq(run.stats.added, 0)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 2)
            test.eq(#fixture.op(user, "provenance", { component_id = id, item_id = source_id }), #original)
        end)

        test.it("erases a reflected lesson when one of its source attributes is forgotten", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("profile_slot", "work_schedule", "night", "The user works at night.", "work-source", nil, "single"),
                fixture.candidate("preference", "rest_period", "day", "The user rests during the day.", "rest-source", nil, "single"),
            }, "reflection-erasure-seed")
            fixture.settle(user, id)
            local lesson = fixture.candidate("lesson", "contact_window", "evening",
                "Send requests in the evening because the user rests during the day.", "")
            lesson.based_on = { 1, 2 }
            fixture.script.respond(id, "structured_output", { items = { lesson } })
            fixture.normalization(id, { lesson })
            local _, wake_err = fixture.op(user, "wake", { component_id = id })
            test.is_nil(wake_err, tostring(wake_err))
            local run = fixture.wait_runs(user, id, "consolidate", 1)[1]
            test.eq(run.status, "succeeded", tostring(run.last_error))
            fixture.settle(user, id)
            local lessons = fixture.items(user, id, { kinds = { "lesson" } })
            test.eq(#lessons, 1)
            test.eq(lessons[1].status, "current")
            local erased, err = fixture.op(user, "tool_forget", { input = { key = "rest_period" } },
                fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_true(erased.success, erased.error)
            fixture.settle(user, id)
            local source = fixture.items(user, id, { key = "rest_period" })[1]
            test.eq(source.status, "forgotten")
            test.is_nil(source.value)
            test.eq(fixture.items(user, id, { key = "work_schedule" })[1].status, "current")
            local derived = fixture.op(user, "get", { component_id = id, item_id = lessons[1].id })
            test.eq(derived.status, "forgotten")
            test.eq(derived.content, "")
            test.is_nil(derived.value)
        end)

        test.it("erases derived memories transitively across source versions while retaining independent lessons", function()
            local user = fixture.user()
            local id = fixture.memory(user, { judge_min_similarity = 0 })
            fixture.relations(id, { "unrelated" })
            fixture.relations(id, { "unrelated", "unrelated" })
            fixture.relations(id, { "unrelated", "unrelated", "unrelated" })
            fixture.remember(user, id, {
                fixture.candidate("profile_slot", "work_schedule", "night", "The user works at night.", "work-source"),
                fixture.candidate("preference", "rest_period", "day", "The user rests during the day.", "rest-source"),
                fixture.candidate("preference", "contact_channel", "email", "The user prefers email.", "channel-source"),
                fixture.candidate("fact", "work_location", "remote", "The user works remotely.", "location-source"),
            }, "transitive-seed", { source = "owner" })
            fixture.settle(user, id)
            local previous_cycle = nil
            local function reflect(lessons, source_keys)
                local current = fixture.items(user, id, { statuses = { "current" } })
                local numbers = {}
                for n, item in ipairs(current) do numbers[item.key] = n end
                for i, lesson in ipairs(lessons) do
                    lesson.based_on = {}
                    for _, key in ipairs(source_keys[i]) do
                        test.not_nil(numbers[key], key)
                        lesson.based_on[#lesson.based_on + 1] = numbers[key]
                    end
                end
                fixture.script.respond(id, "structured_output", { items = lessons })
                fixture.normalization(id, lessons)
                local neighbor_count = 0
                for _, item in ipairs(current) do if item.kind == "lesson" then neighbor_count = neighbor_count + 1 end end
                for _, lesson in ipairs(lessons) do
                    if not numbers[lesson.key] then
                        if neighbor_count > 0 then
                            local relations = {}
                            for _ = 1, neighbor_count do relations[#relations + 1] = "unrelated" end
                            fixture.relations(id, relations)
                        end
                        neighbor_count = neighbor_count + 1
                    end
                end
                local _, err = fixture.op(user, "wake", { component_id = id })
                test.is_nil(err, tostring(err))
                local run = fixture.wait_run(user, "consolidate:" .. id, function(candidate)
                    return candidate.cycle ~= previous_cycle and (candidate.status == "succeeded" or candidate.status == "failed")
                end)
                previous_cycle = run.cycle
                fixture.wait_job(run.job_id, "pending")
                test.eq(run.status, "succeeded", tostring(run.last_error))
                fixture.settle(user, id)
            end
            reflect({
                fixture.candidate("lesson", "contact_window", "evening", "Send requests in the evening, outside the rest period.", ""),
                fixture.candidate("lesson", "work_channel", "email", "Send work requests by email.", ""),
            }, { { "work_schedule", "rest_period" }, { "work_schedule", "contact_channel" } })
            reflect({ fixture.candidate("lesson", "request_delivery", "evening email", "Send requests by email in the evening.", "") },
                { { "contact_window", "contact_channel" } })
            reflect({ fixture.candidate("lesson", "contact_window", "evening", "Send requests in the evening, outside the rest period.", "") },
                { { "request_delivery", "contact_channel" } })
            local source = fixture.items(user, id, { key = "rest_period" })[1]
            local first = fixture.items(user, id, { key = "contact_window" })[1]
            local refs = fixture.op(user, "provenance", { component_id = id, item_id = first.id })
            test.eq(#refs, 4)
            for _, ref in ipairs(refs) do test.eq(ref.host_kind, "item"); test.eq(ref.event_id, "") end
            local last = fixture.items(user, id, { key = "request_delivery" })[1]
            local independent = fixture.items(user, id, { key = "work_channel" })[1]
            fixture.remember(user, id, {
                fixture.candidate("preference", "rest_period", "morning", "The user now rests in the morning.", "rest-change"),
            }, "transitive-update", { source = "owner" })
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = source.id }).status, "superseded")
            local erased, err = fixture.op(user, "tool_forget", { input = { key = "rest_period" } },
                fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_true(erased.success, erased.error)
            fixture.settle(user, id)
            for _, item in ipairs({ source, first, last }) do
                local row = fixture.op(user, "get", { component_id = id, item_id = item.id })
                test.eq(row.status, "forgotten", item.key)
                test.eq(row.content, "")
                test.is_nil(row.value)
                test.eq(#fixture.op(user, "provenance", { component_id = id, item_id = item.id }), 0)
            end
            for _, key in ipairs({ "work_schedule", "contact_channel", "work_channel" }) do
                local row = fixture.items(user, id, { key = key })[1]
                test.eq(row.status, "current", key)
            end
            local retained = fixture.op(user, "get", { component_id = id, item_id = independent.id })
            test.eq(retained.content, independent.content)
            test.eq(retained.value, independent.value)
        end)

        test.it("fails the whole consolidation when any lesson lacks two distinct sources", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("fact", "dog_car_rides", "hates long car rides", "The user's dog Pepper hates long car rides.", "r1"),
                fixture.candidate("preference", "transport", "train", "The user prefers trains over flights.", "r2"),
                fixture.candidate("fact", "travel_window", "summer", "The user travels in summer.", "r3"),
                fixture.candidate("fact", "trip_duration", "week", "The user takes week-long trips.", "r4"),
            }, "reflect-seed", { source = "owner" })
            fixture.settle(user, id)
            local one = fixture.candidate("lesson", "vegan_food", "plan vegan food", "Plan vegan food for the user.", "")
            one.based_on = { 1 }
            local two = fixture.candidate("lesson", "rail_with_dog", "rail routes that allow dogs",
                "Propose rail routes that allow dogs and avoid long car transfers.", "")
            two.based_on = { 1, 2 }
            fixture.script.respond(id, "structured_output", { items = { one, two } })
            fixture.op(user, "wake", { component_id = id })
            local runs = fixture.wait_runs(user, id, "consolidate", 1)
            test.eq(runs[1].status, "failed")
            test.is_true(runs[1].last_error:find("model_output_invalid_reflection_grounding", 1, true) ~= nil, runs[1].last_error)
            local schema = fixture.script.requests(id, "structured_output")[1]
            test.eq(table.concat(schema.properties.items.items.properties.kind.enum, ","), "lesson")
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { kinds = { "lesson" } }), 0)
            fixture.script.respond(id, "structured_output", { items = {} })
            fixture.wait_runs(user, id, "consolidate", 1, "succeeded")
            fixture.wait_job(runs[1].job_id, "pending")
        end)

        test.it("writes reflections for separate cycles sharing a started-at timestamp", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local run_id = "consolidate:" .. id
            fixture.remember(user, id, {
                fixture.candidate("fact", "work_schedule", "night", "The user works at night.", "work-source"),
                fixture.candidate("fact", "rest_period", "day", "The user rests during the day.", "rest-source"),
            }, "same-second-seed", { source = "owner" })
            fixture.settle(user, id)
            local cleanup = force_cycle_started_at(run_id)
            local ok, failure = pcall(function()
                local first_lesson = fixture.candidate("lesson", "contact_window", "evening", "Contact the user in the evening.", "")
                first_lesson.based_on = { 1, 2 }
                fixture.script.respond(id, "structured_output", { items = { first_lesson } })
                fixture.normalization(id, { first_lesson })
                local first_wake, first_err = fixture.op(user, "wake", { component_id = id })
                test.is_nil(first_err, tostring(first_err))
                test.is_true(first_wake.woken)
                local first = fixture.wait_runs(user, id, "consolidate", 1, "succeeded")[1]
                fixture.wait_job(first.job_id, "pending")

                local second_lesson = fixture.candidate("lesson", "delivery_channel", "email", "Send requests by email.", "")
                second_lesson.based_on = { 1, 2 }
                fixture.script.respond(id, "structured_output", { items = { second_lesson } })
                fixture.normalization(id, { second_lesson })
                local second_wake, second_err = fixture.op(user, "wake", { component_id = id })
                test.is_nil(second_err, tostring(second_err))
                test.is_true(second_wake.woken)
                local second = fixture.wait_run(user, run_id, function(candidate)
                    return candidate.cycle ~= first.cycle and candidate.status == "succeeded"
                end)
                test.eq(first.started_at, second.started_at)
                test.is_true(first.cycle ~= second.cycle, tostring(second.cycle))
                fixture.settle(user, id)
                test.eq(#fixture.items(user, id, { kinds = { "lesson" } }), 2)
            end)
            cleanup()
            if not ok then error(failure) end
        end)

        test.it("preserves a cycle across a failed retry and creates the next cycle after success", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local run_id = "consolidate:" .. id
            local first = fixture.op(user, "claim", { run_id = run_id, repeatable = true })
            test.is_true(first.claimed)
            local first_run = fixture.op(user, "run", { run_id = run_id })
            fixture.op(user, "finish", { run_id = run_id, status = "failed", error = "model unavailable" })
            local retry = fixture.op(user, "claim", { run_id = run_id, repeatable = true })
            test.is_true(retry.claimed)
            local retry_run = fixture.op(user, "run", { run_id = run_id })
            test.eq(retry.cycle, first.cycle)
            test.eq(retry_run.cycle, first.cycle)
            test.eq(retry_run.started_at, first_run.started_at)
            fixture.op(user, "finish", { run_id = run_id, status = "succeeded" })
            local next_cycle = fixture.op(user, "claim", { run_id = run_id, repeatable = true })
            test.is_true(next_cycle.claimed)
            local next_run = fixture.op(user, "run", { run_id = run_id })
            test.is_true(next_cycle.cycle ~= first.cycle, tostring(next_cycle.cycle))
            test.eq(next_run.cycle, next_cycle.cycle)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
