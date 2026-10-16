local test = require("test")
local protocol = require("protocol")
local consts = require("consts")

-- The socket protocol is the foundation of the live transport: every ack,
-- reconnect and message-routing decision flows through on_frame / route_event.
-- These cases pin the wire protocol so the socket loop stays a thin executor of
-- the actions returned here.
local function define_tests()
    test.describe("Slack socket protocol", function()
        test.describe("on_frame", function()
            test.it("classifies hello (no ack)", function()
                test.eq(protocol.on_frame({ type = consts.HELLO }).kind, "hello")
            end)

            test.it("classifies disconnect and carries the reason", function()
                local a = protocol.on_frame({ type = consts.DISCONNECT, reason = "refresh_requested" })
                test.eq(a.kind, "reconnect")
                test.eq(a.reason, "refresh_requested")
            end)

            test.it("unwraps an events_api envelope to its event and envelope_id", function()
                local a = protocol.on_frame({
                    type = consts.EVENTS_API,
                    envelope_id = "env-1",
                    payload = { event = { type = "message", channel = "C1", text = "hi" } },
                })
                test.eq(a.kind, "event")
                test.eq(a.envelope_id, "env-1")
                test.eq(a.event.channel, "C1")
            end)

            test.it("acks slash_commands and interactive envelopes without dispatching", function()
                test.eq(protocol.on_frame({ type = consts.SLASH_COMMANDS, envelope_id = "e2" }).kind, "ack")
                local a = protocol.on_frame({ type = consts.INTERACTIVE, envelope_id = "e3" })
                test.eq(a.kind, "ack")
                test.eq(a.envelope_id, "e3")
            end)

            test.it("treats a non-table or unknown frame as a noop", function()
                test.eq(protocol.on_frame(nil).kind, "noop")
                test.eq(protocol.on_frame({ type = "mystery" }).kind, "noop")
            end)
        end)

        test.describe("ack_payload", function()
            test.it("echoes the envelope_id", function()
                test.eq(protocol.ack_payload("env-9").envelope_id, "env-9")
            end)
        end)

        test.describe("route_event", function()
            test.it("routes a plain channel message to channel", function()
                test.eq(protocol.route_event({ type = "message", channel_type = "channel", user = "U1", text = "hi" }), "channel")
            end)

            test.it("routes a 1:1 DM (channel_type im) to dm", function()
                test.eq(protocol.route_event({ type = "message", channel_type = "im", user = "U1" }), "dm")
            end)

            test.it("treats a private channel / group / mpim as a channel", function()
                test.eq(protocol.route_event({ type = "message", channel_type = "group", user = "U1" }), "channel")
                test.eq(protocol.route_event({ type = "message", channel_type = "mpim", user = "U1" }), "channel")
            end)

            test.it("drops non-message events", function()
                test.is_nil(protocol.route_event({ type = "reaction_added", user = "U1" }))
            end)

            test.it("drops a subtyped message (edits, joins, deletes)", function()
                test.is_nil(protocol.route_event({ type = "message", subtype = "message_changed", user = "U1" }))
            end)

            test.it("drops a message with no user (lets bot/system filtering happen downstream)", function()
                test.is_nil(protocol.route_event({ type = "message", channel_type = "channel" }))
            end)

            test.it("keeps a bot_id message flowing (allow_bot_messages is decided downstream)", function()
                test.eq(protocol.route_event({ type = "message", channel_type = "channel", user = "U1", bot_id = "B1" }), "channel")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
