local test = require("test")
local protocol = require("protocol")
local consts = require("consts")

-- The gateway protocol is the foundation of the live transport: every reconnect,
-- resume, heartbeat and message-routing decision flows through on_frame /
-- on_heartbeat_tick. These cases pin the wire protocol so the socket loop can
-- stay a thin executor of the actions returned here.
local function define_tests()
    test.describe("Discord gateway protocol", function()
        test.it("starts disconnected with a default heartbeat and no session", function()
            local s = protocol.new()
            test.eq(s.phase, "connecting")
            test.eq(s.heartbeat_interval, consts.DEFAULT_HEARTBEAT_INTERVAL_MS)
            test.is_nil(s.seq)
            test.is_nil(s.session_id)
            test.is_true(s.heartbeat_acked)
        end)

        test.it("HELLO without a session -> identify, and adopts the heartbeat interval", function()
            local s = protocol.new()
            local a = protocol.on_frame(s, { op = consts.OP.HELLO, d = { heartbeat_interval = 30000 } })
            test.eq(a.kind, "identify")
            test.eq(s.heartbeat_interval, 30000)
            test.eq(s.phase, "identifying")
        end)

        test.it("HELLO keeps the default interval when it is missing or invalid", function()
            local s = protocol.new()
            protocol.on_frame(s, { op = consts.OP.HELLO, d = { heartbeat_interval = 0 } })
            test.eq(s.heartbeat_interval, consts.DEFAULT_HEARTBEAT_INTERVAL_MS)
        end)

        test.it("HELLO with a live session (id + seq) -> resume", function()
            local s = protocol.new()
            s.session_id = "sess-1"
            s.seq = 42
            local a = protocol.on_frame(s, { op = consts.OP.HELLO, d = { heartbeat_interval = 30000 } })
            test.eq(a.kind, "resume")
            test.eq(s.phase, "resuming")
        end)

        test.it("HELLO with a session id but no seq is not resumable -> identify", function()
            local s = protocol.new()
            s.session_id = "sess-1"
            local a = protocol.on_frame(s, { op = consts.OP.HELLO, d = { heartbeat_interval = 30000 } })
            test.eq(a.kind, "identify")
        end)

        test.it("READY records the session id, resume url and sequence", function()
            local s = protocol.new()
            local a = protocol.on_frame(s, {
                op = consts.OP.DISPATCH, s = 1, t = "READY",
                d = { session_id = "sess-9", resume_gateway_url = "wss://resume.example/" },
            })
            test.eq(a.kind, "ready")
            test.eq(s.session_id, "sess-9")
            test.eq(s.resume_url, "wss://resume.example/")
            test.eq(s.seq, 1)
            test.eq(s.phase, "ready")
        end)

        test.it("RESUMED returns to ready", function()
            local s = protocol.new()
            local a = protocol.on_frame(s, { op = consts.OP.DISPATCH, s = 5, t = "RESUMED", d = {} })
            test.eq(a.kind, "resumed")
            test.eq(s.phase, "ready")
            test.eq(s.seq, 5)
        end)

        test.it("MESSAGE_CREATE dispatches the event and advances the sequence", function()
            local s = protocol.new()
            local a = protocol.on_frame(s, {
                op = consts.OP.DISPATCH, s = 7, t = "MESSAGE_CREATE",
                d = { channel_id = "c1", content = "hi" },
            })
            test.eq(a.kind, "dispatch")
            test.eq(a.t, "MESSAGE_CREATE")
            test.eq(a.d.channel_id, "c1")
            test.eq(s.seq, 7)
        end)

        test.it("other dispatch events pass through generically without losing the sequence", function()
            local s = protocol.new()
            local a = protocol.on_frame(s, { op = consts.OP.DISPATCH, s = 8, t = "TYPING_START", d = {} })
            test.eq(a.kind, "dispatch")
            test.eq(a.t, "TYPING_START")
            test.eq(s.seq, 8)
        end)

        test.it("HEARTBEAT_ACK clears the outstanding-heartbeat flag", function()
            local s = protocol.new()
            s.heartbeat_acked = false
            local a = protocol.on_frame(s, { op = consts.OP.HEARTBEAT_ACK })
            test.eq(a.kind, "ack")
            test.is_true(s.heartbeat_acked)
        end)

        test.it("a server HEARTBEAT request asks for an immediate heartbeat", function()
            local s = protocol.new()
            local a = protocol.on_frame(s, { op = consts.OP.HEARTBEAT })
            test.eq(a.kind, "heartbeat")
        end)

        test.it("RECONNECT asks to reconnect, resumable when a session is held", function()
            local s = protocol.new()
            test.is_false(protocol.on_frame(s, { op = consts.OP.RECONNECT }).resumable)
            s.session_id = "sess"; s.seq = 3
            local a = protocol.on_frame(s, { op = consts.OP.RECONNECT })
            test.eq(a.kind, "reconnect")
            test.is_true(a.resumable)
        end)

        test.it("INVALID_SESSION(true) with a live session reconnects resumably", function()
            local s = protocol.new()
            s.session_id = "sess"; s.seq = 3
            local a = protocol.on_frame(s, { op = consts.OP.INVALID_SESSION, d = true })
            test.eq(a.kind, "reconnect")
            test.is_true(a.resumable)
            test.eq(s.session_id, "sess")
        end)

        test.it("INVALID_SESSION(false) drops the session and re-identifies", function()
            local s = protocol.new()
            s.session_id = "sess"; s.seq = 3
            local a = protocol.on_frame(s, { op = consts.OP.INVALID_SESSION, d = false })
            test.eq(a.kind, "reconnect")
            test.is_false(a.resumable)
            test.is_nil(s.session_id)
            test.is_nil(s.seq)
        end)

        test.it("a non-table or unknown frame is a noop", function()
            local s = protocol.new()
            test.eq(protocol.on_frame(s, nil).kind, "noop")
            test.eq(protocol.on_frame(s, { op = 999 }).kind, "noop")
        end)

        test.describe("heartbeat tick", function()
            test.it("sends a heartbeat and arms the ack watchdog when previously acked", function()
                local s = protocol.new()
                local a = protocol.on_heartbeat_tick(s)
                test.eq(a.kind, "heartbeat")
                test.is_false(s.heartbeat_acked)
            end)

            test.it("reconnects when the previous heartbeat was never acked (zombie)", function()
                local s = protocol.new()
                s.session_id = "sess"; s.seq = 2; s.heartbeat_acked = false
                local a = protocol.on_heartbeat_tick(s)
                test.eq(a.kind, "reconnect")
                test.is_true(a.resumable)
            end)
        end)

        test.describe("message content intent", function()
            test.it("requests the privileged intent only when the application has it", function()
                test.eq(consts.intents(true), consts.DEFAULT_INTENTS)
                test.eq(math.floor(consts.intents(false) / consts.INTENTS.MESSAGE_CONTENT) % 2, 0)
                test.eq(consts.intents(false) + consts.INTENTS.MESSAGE_CONTENT, consts.DEFAULT_INTENTS)
            end)

            test.it("READY records the bot user id", function()
                local s = protocol.new()
                protocol.on_frame(s, { op = consts.OP.DISPATCH, t = "READY", s = 1,
                    d = { session_id = "sess", user = { id = "bot-1" } } })
                test.eq(s.user_id, "bot-1")
            end)

            test.it("admits every message while the intent is held", function()
                local s = protocol.new()
                test.is_true(protocol.admits_message(s, { guild_id = "g", content = "" }))
            end)

            test.it("admits mentions and direct messages without the intent", function()
                local s = protocol.new()
                s.message_content = false
                s.user_id = "bot-1"
                test.is_true(protocol.admits_message(s, { guild_id = "g", mentions = { { id = "bot-1" } } }))
                test.is_true(protocol.admits_message(s, { channel_id = "dm" }))
            end)

            test.it("drops guild messages that do not mention the bot without the intent", function()
                local s = protocol.new()
                s.message_content = false
                s.user_id = "bot-1"
                test.is_false(protocol.admits_message(s, { guild_id = "g", mentions = { { id = "other" } } }))
                test.is_false(protocol.admits_message(s, { guild_id = "g" }))
            end)
        end)

        test.describe("payloads", function()
            test.it("identify carries the token, default intents and op 2", function()
                local p = protocol.identify_payload("tok")
                test.eq(p.op, consts.OP.IDENTIFY)
                test.eq(p.d.token, "tok")
                test.eq(p.d.intents, consts.DEFAULT_INTENTS)
            end)

            test.it("identify honours an explicit intent mask", function()
                test.eq(protocol.identify_payload("tok", 513).d.intents, 513)
            end)

            test.it("resume carries token, session and seq under op 6", function()
                local p = protocol.resume_payload("tok", "sess", 11)
                test.eq(p.op, consts.OP.RESUME)
                test.eq(p.d.session_id, "sess")
                test.eq(p.d.seq, 11)
            end)

            test.it("heartbeat carries the last sequence (or null) under op 1", function()
                test.eq(protocol.heartbeat_payload(9).d, 9)
                test.eq(protocol.heartbeat_payload(9).op, consts.OP.HEARTBEAT)
                test.is_nil(protocol.heartbeat_payload(nil).d)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
