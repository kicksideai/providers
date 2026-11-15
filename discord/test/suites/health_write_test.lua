-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local health = require("health")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("Discord gateway health transitions", function()
        test.it("preserves unchanged health without another metadata write", function()
            fixture.writes = 0
            local ok, err = health.report("connection", "unavailable", "connection unavailable", nil, {})
            test.is_true(ok)
            test.is_nil(err)
            local current = fixture.fields
            local timestamp = current.health_at
            test.eq(fixture.writes, 1)
            test.not_nil(timestamp)
            ok, err = health.report("connection", "unavailable", "connection unavailable", nil, current)
            test.is_true(ok)
            test.is_nil(err)
            test.eq(fixture.writes, 1)
            test.eq(current.health_at, timestamp)
        end)
        test.it("writes changed health and retains metadata failures", function()
            fixture.writes = 0
            local current = {health_state = "error", health_reason = "unavailable", health_message = "previous"}
            local cause = errors.new({kind = errors.UNAVAILABLE, message = "metadata unavailable"})
            fixture.failure = cause
            local ok, err = health.report("connection", "unavailable", "changed", nil, current)
            fixture.failure = nil
            test.is_false(ok)
            test.eq(err, cause)
            test.eq(fixture.writes, 1)
            test.eq(current.health_message, "previous")
            ok, err = health.report("connection", "unavailable", "previous", "ready", current)
            test.is_true(ok)
            test.is_nil(err)
            test.eq(fixture.writes, 2)
        end)
        test.it("preserves reports without an existing metadata snapshot", function()
            fixture.writes = 0
            local ok, err = health.report("connection", "unavailable", "connection unavailable")
            test.is_true(ok)
            test.is_nil(err)
            test.eq(fixture.writes, 1)
        end)
    end)
end)}
