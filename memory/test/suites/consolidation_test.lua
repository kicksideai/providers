local test = require("test")
local fixture = require("fixture")
local time = require("time")

local function define_tests()
    test.describe("memory consolidation", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("runs on demand through the slot, writes reflections, and re-arms on the configured cadence", function()
            local user = fixture.user()
            local id = fixture.memory(user, { consolidation_interval_hours = 6 })
            fixture.remember(user, id, {
                fixture.candidate("fact", "job", "nurse", "The user works night shifts as a nurse.", "m1"),
                fixture.candidate("fact", "sleep", "day", "The user sleeps during the day.", "m2"),
            }, "k1")
            fixture.settle(user, id)
            fixture.script.respond("structured_output", { items = {
                fixture.candidate("lesson", "contact_time", "evening", "Reach the user in the evening; they sleep during the day.", ""),
            } })
            local woken, err = fixture.op(user, "wake", { component_id = id })
            test.is_nil(err, tostring(err))
            test.is_true(woken.woken)
            local runs = fixture.wait_runs(user, id, "consolidate", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(runs[1].stats.scopes, 1)
            test.eq(runs[1].stats.added, 1)
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
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
