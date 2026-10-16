local test = require("test")
local backoff = require("backoff")

-- Reconnect pacing is safety-critical: too eager and Discord bans the token for
-- IDENTIFY abuse; zero delay hammers a flapping socket. These cases pin the
-- exponential growth, the cap, the no-zero-delay guarantee, and the heartbeat
-- jitter, using a fixed rng so the jitter is deterministic.
local function rng(v: number): any
    return function(): number return v end
end

local function define_tests()
    test.describe("gateway reconnect backoff", function()
        test.it("grows exponentially with equal jitter (rng=0 -> the lower half)", function()
            -- exp = BASE*2^(n-1); equal jitter floor = exp/2.
            test.eq(backoff.delay_ms(1, rng(0)), backoff.BASE_MS / 2)
            test.eq(backoff.delay_ms(2, rng(0)), backoff.BASE_MS)        -- exp 2000 -> half 1000
            test.eq(backoff.delay_ms(3, rng(0)), backoff.BASE_MS * 2)    -- exp 4000 -> half 2000
        end)

        test.it("rng=~1 reaches the top of the window (~exp)", function()
            -- half + ~1*half ~= exp; floor keeps it just under.
            test.is_true(backoff.delay_ms(1, rng(0.999999)) >= backoff.BASE_MS - 1)
        end)

        test.it("never returns a zero delay", function()
            for n = 1, 10 do
                test.is_true(backoff.delay_ms(n, rng(0)) > 0, "attempt " .. n .. " must wait")
            end
        end)

        test.it("caps the window at CAP_MS regardless of attempt", function()
            local d = backoff.delay_ms(50, rng(0.999999))
            test.is_true(d <= backoff.CAP_MS, "delay must not exceed the cap")
            -- deep attempts saturate to the capped window's lower half at rng=0.
            test.eq(backoff.delay_ms(50, rng(0)), backoff.CAP_MS / 2)
        end)

        test.it("treats a non-positive or garbage attempt as the first", function()
            test.eq(backoff.delay_ms(0, rng(0)), backoff.BASE_MS / 2)
            test.eq(backoff.delay_ms("x", rng(0)), backoff.BASE_MS / 2)
        end)
    end)

    test.describe("first-heartbeat jitter", function()
        test.it("is jitter * interval within [0, interval)", function()
            test.eq(backoff.first_heartbeat_ms(40000, rng(0)), 0)
            test.eq(backoff.first_heartbeat_ms(40000, rng(0.5)), 20000)
            test.is_true(backoff.first_heartbeat_ms(40000, rng(0.999999)) < 40000)
        end)

        test.it("handles a missing or negative interval as zero", function()
            test.eq(backoff.first_heartbeat_ms(nil, rng(0.5)), 0)
            test.eq(backoff.first_heartbeat_ms(-5, rng(0.5)), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
