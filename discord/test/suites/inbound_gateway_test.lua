local test = require("test")
local inbound = require("inbound")
local dispatch = require("dispatch")
local denied_transport = require("denied_transport")
local function define_tests()
    test.describe("Discord gateway channel ingress", function()
        test.it("refuses untrusted ingress before reading a connection", function()
            local context, err = denied_transport.inbound_context("not-a-connection")
            test.is_nil(context)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(err:details().reason, "ingress_denied")
        end)
        test.it("normalizes a mention without a connection owner request actor", function()
            local result = inbound.receive_channel_message({ component_id = "conn-1", event = {
                id = "message-1", guild_id = "guild-1", channel_id = "channel-1",
                author = { id = "user-1", username = "User" },
                content = "<@bot-1> question", mentions = { { id = "bot-1" } },
            } })
            test.is_true(result.accepted, tostring(result.error))
            test.eq(result.text, "<@bot-1> question")
        end)
        test.it("ignores a message on an unrouted channel without writing connection health", function()
            dispatch._funcs = { new = function() return { call = function()
                return { accepted = false, status = "unrouted", reason = "channel_unrouted",
                    error = "no responder covers this channel" }, nil
            end } end }
            local result = dispatch.run("not-a-connection", {})
            test.is_true(result.ok)
            local _, err = dispatch.main({ component_id = "not-a-connection", event = {} })
            test.is_nil(err, "an unrouted message writes nothing to the connection")
        end)
        test.it("leaves connection health to the gateway when a receiver fails", function()
            dispatch._funcs = { new = function() return { call = function()
                return { accepted = false, status = "error", reason = "routing_lookup_failed",
                    error = "component database unavailable" }, nil
            end } end }
            local _, err = dispatch.main({ component_id = "not-a-connection", event = {} })
            test.is_nil(err, "per-message failures do not write connection health")
        end)
        test.it("propagates a receiver failure through per-message dispatch", function()
            dispatch._funcs = { new = function() return { call = function()
                return { success = false, accepted = false, status = "error", reason = "responder_disabled",
                    error = "responder paused" }, nil
            end } end }
            local result = dispatch.run("conn-1", {})
            test.eq(result.ok, false)
            test.eq(result.reason, "responder_disabled")
            test.eq(result.error, "responder paused")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
