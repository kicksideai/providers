-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local time = require("time")

local function define_tests()
    test.describe("memory consolidation", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("runs on demand through the slot, writes reflections, and re-arms on the configured cadence", function()
            local user = fixture.user()
            local id = fixture.memory(user, { consolidation_interval_hours = 6 })
            local _, seed_err = fixture.remember(user, id, {
                fixture.candidate("fact", "job", "nurse", "The user works night shifts as a nurse.", "m1"),
                fixture.candidate("fact", "sleep", "day", "The user sleeps during the day.", "m2"),
            }, "k1")
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            test.eq(fixture.script.pending("structured_output"), 0)
            local lesson = fixture.candidate("lesson", "contact_time", "evening", "Reach the user in the evening; they sleep during the day.", "")
            lesson.based_on = { 1, 2 }
            fixture.script.respond("structured_output", { items = { lesson } })
            fixture.verdict("ADD", {})
            local woken, err = fixture.op(user, "wake", { component_id = id })
            test.is_nil(err, tostring(err))
            test.is_true(woken.woken)
            local runs = fixture.wait_runs(user, id, "consolidate", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(runs[1].stats.scopes, 1)
            test.eq(runs[1].stats.added, 1)
            local judged = fixture.script.requests("structured_output")
            local judge_schema = judged[#judged]
            test.eq(table.concat(judge_schema.properties.action.enum, ","), "ADD,NOOP")
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

        test.it("keeps only reflected lessons that draw on at least two memories", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("fact", "dog_car_rides", "hates long car rides", "The user's dog Pepper hates long car rides.", "r1"),
                fixture.candidate("preference", "transport", "train", "The user prefers trains over flights.", "r2"),
            }, "reflect-seed")
            fixture.settle(user, id)
            local one = fixture.candidate("lesson", "vegan_food", "plan vegan food", "Plan vegan food for the user.", "")
            one.based_on = { 1 }
            local two = fixture.candidate("lesson", "rail_with_dog", "rail routes that allow dogs",
                "Propose rail routes that allow dogs and avoid long car transfers.", "")
            two.based_on = { 1, 2 }
            fixture.script.respond("structured_output", { items = { one, two } })
            fixture.verdict("ADD", {})
            fixture.op(user, "wake", { component_id = id })
            local runs = fixture.wait_runs(user, id, "consolidate", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(runs[1].stats.added, 1)
            local schema = fixture.script.requests("structured_output")[1]
            test.eq(table.concat(schema.properties.items.items.properties.kind.enum, ","), "lesson")
            fixture.settle(user, id)
            local lessons = fixture.items(user, id, { kinds = { "lesson" } })
            test.eq(#lessons, 1)
            test.eq(lessons[1].key, "rail_with_dog")
        end)

        test.it("keeps a consolidation cycle's start across retries and starts the next cycle after success", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local run_id = "consolidate:" .. id
            local first = fixture.op(user, "claim", { run_id = run_id, repeatable = true })
            test.is_true(first.claimed)
            fixture.op(user, "finish", { run_id = run_id, status = "failed", error = "model unavailable" })
            time.sleep(1100 * time.MILLISECOND)
            local retry = fixture.op(user, "claim", { run_id = run_id, repeatable = true })
            test.is_true(retry.claimed)
            test.eq(retry.cycle, first.cycle)
            fixture.op(user, "finish", { run_id = run_id, status = "succeeded" })
            time.sleep(1100 * time.MILLISECOND)
            local next_cycle = fixture.op(user, "claim", { run_id = run_id, repeatable = true })
            test.is_true(next_cycle.claimed)
            test.is_true(next_cycle.cycle ~= first.cycle, tostring(next_cycle.cycle))
            test.eq(fixture.op(user, "run", { run_id = run_id }).started_at, next_cycle.cycle)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
