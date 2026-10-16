local test = require("test")
local connection = require("connection")
local transport = require("transport")
local function define_tests()
    test.describe("Discord responder preconditions", function()
        test.it("propagates the shared status reader's access refusal", function()
            local result, err = connection.get_status({})
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(err:message(), "connection READ denied")
        end)
        test.it("fails test_connection with the typed transport error", function()
            transport.request_err = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            local result, err = connection.test_connection({})
            transport.request_err = nil
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
        end)
        test.it("returns a Discord rejection with its status and body", function()
            transport.flags = 524288
            transport.channel_result = { success = false, status_code = 403, error = "Missing Access", data = { code = 50001 } }
            local result = connection.test_connection({ resource_id = "channel-1" })
            transport.channel_result = { success = true }
            test.is_false(result.success)
            test.eq(result.status_code, 403)
            test.eq(result.details.code, 50001)
        end)
        test.it("rejects a bound channel the bot cannot view", function()
            transport.flags = 524288
            transport.channel_result = { success = false, status_code = 403, error = "Missing Access" }
            local result = connection.test_connection({ resource_id = "channel-1" })
            transport.channel_result = { success = true }
            test.is_false(result.success)
            test.eq(result.reason, "discord_permission_missing")
        end)
        test.it("rejects a bound channel whose recent messages the bot cannot read", function()
            transport.flags = 524288
            transport.history_result = { success = false, status_code = 403, error = "Missing Permissions" }
            local result = connection.test_connection({ resource_id = "channel-1" })
            transport.history_result = { success = true }
            test.is_false(result.success)
            test.eq(result.reason, "discord_permission_missing")
        end)
        test.it("accepts a bot without MESSAGE CONTENT intent and warns that non-mention messages are unavailable", function()
            transport.flags = 0
            local result = connection.test_connection({ resource_id = "channel-1" })
            test.is_true(result.success)
            test.eq(#result.warnings, 1)
            test.eq(result.warnings[1].reason, "message_content_intent_missing")
        end)
        test.it("reports no warning when the bot has the MESSAGE CONTENT intent", function()
            transport.flags = 262144
            local result = connection.test_connection({})
            test.is_true(result.success)
            test.is_nil(result.warnings)
        end)
        test.it("accepts the full MESSAGE CONTENT application flag", function()
            transport.flags = 262144
            test.is_true(connection.test_connection({}).success)
        end)
        test.it("accepts the limited MESSAGE CONTENT application flag", function()
            transport.flags = 524288
            test.is_true(connection.test_connection({}).success)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
