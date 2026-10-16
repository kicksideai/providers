local test = require("test")
local connection = require("connection")
local types = require("types")

-- The connection contract is the front door of the Slack integration: create
-- (bot + app token) -> test -> status -> discover (channel picker) -> send_reply.
-- These cases pin the request/response shaping and the send-side validation that
-- the flow relies on, independent of a live component context or the Slack API
-- (the Web API calls themselves are covered by core:api_test).
local function define_tests()
    test.describe("Slack connection flow", function()
        test.describe("reply payload shaping", function()
            test.it("returns a plain string as text with no thread", function()
                local text, thread, err = connection._reply_payload("hello")
                test.is_nil(err)
                test.eq(text, "hello")
                test.eq(thread, "")
            end)

            test.it("takes text from a structured payload and carries thread_ts", function()
                local text, thread, err = connection._reply_payload({ text = "from text", thread_ts = "123.45" })
                test.is_nil(err)
                test.eq(text, "from text")
                test.eq(thread, "123.45")
            end)

            test.it("falls back to content when text is absent", function()
                local text = connection._reply_payload({ content = "from content" })
                test.eq(text, "from content")
            end)

            test.it("rejects empty string content", function()
                local text, _thread, err = connection._reply_payload("")
                test.eq(text, "")
                test.ok(err:find("content is required") ~= nil)
            end)

            test.it("rejects a structured payload with no text or content", function()
                local _text, _thread, err = connection._reply_payload({ thread_ts = "1" })
                test.ok(err:find("content.text is required") ~= nil)
            end)
        end)

        test.describe("send_reply validation (pre-transport)", function()
            test.it("requires sealed proof or explicit outbound authority before token use", function()
                local r = connection.send_reply({ resource_id = "C1", content = "hello" })
                test.is_false(r.success)
                test.is_true(errors.is(r.error, errors.PERMISSION_DENIED))
            end)
            test.it("requires a resource_id (channel)", function()
                local r = connection.send_reply({ content = "hi" })
                test.eq(r.success, false)
                test.ok(r.error:find("resource_id is required") ~= nil)
            end)

            test.it("requires content", function()
                local r = connection.send_reply({ resource_id = "C1", content = "" })
                test.eq(r.success, false)
                test.ok(r.error:find("content is required") ~= nil)
            end)

            test.it("rejects a message longer than the Slack limit", function()
                local long = string.rep("x", types.MESSAGE_MAX_LENGTH + 1)
                local r = connection.send_reply({ resource_id = "C1", content = long })
                test.eq(r.success, false)
                test.ok(r.error:find("exceeds") ~= nil)
            end)
        end)

        test.describe("send_status", function()
            test.it("refuses a sealed status without separate admission", function()
                local r = connection.send_status({ resource_id = "C1", phase = "thinking",
                    reply_proof = { turn_id = "turn-1" } })
                test.is_false(r.success)
                test.is_true(errors.is(r.error, errors.PERMISSION_DENIED))
            end)

            test.it("requires a resource_id (channel)", function()
                local r = connection.send_status({ phase = "thinking" })
                test.eq(r.success, false)
                test.ok(r.error:find("resource_id is required") ~= nil)
            end)

            test.it("succeeds without rendering: Slack exposes no bot-visible native status indicator", function()
                local r = connection.send_status({ resource_id = "C1", phase = "thinking" })
                test.is_true(r.success)
                test.eq(r.rendered, false)
                test.is_nil(r.error)
            end)
        end)

        test.it("does not edit an admitted reply without a separate operation", function()
            local r = connection.update_reply({ resource_id = "C1", message_ref = "m1",
                content = "edit", reply_proof = { turn_id = "turn-1" } })
            test.is_false(r.success)
            test.is_true(errors.is(r.error, errors.PERMISSION_DENIED))
        end)

        test.describe("connection resolution failures", function()
            test.it("fail test_connection, get_status and discover_resources with the typed component error", function()
                for _, method in ipairs({ "test_connection", "get_status", "discover_resources" }) do
                    local result, err = (connection :: any)[method]({})
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL))
                end
            end)

            test.it("forwards the typed component error from delete", function()
                local result, err = connection.delete({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
            end)
        end)

        test.describe("resource discovery shaping", function()
            test.it("maps a channel to a selectable slack_channel row, falling back to id for a blank name", function()
                local row = connection._channel_resource({ id = "C1", name = "general" })
                test.eq(row.type, "slack_channel")
                test.eq(row.name, "general")
                test.is_true(row.selectable)
                test.eq(connection._channel_resource({ id = "C2", name = "" }).name, "C2")
                test.is_nil(connection._channel_resource({ name = "no id" }))
            end)

            test.it("skips an archived channel and flags private / im", function()
                test.is_nil(connection._channel_resource({ id = "C3", name = "old", is_archived = true }))
                test.is_true(connection._channel_resource({ id = "C4", name = "p", is_private = true }).is_private)
                test.is_true(connection._channel_resource({ id = "D1", is_im = true }).is_im)
            end)
        end)

        test.describe("status details", function()
            test.it("projects the auth.test identity fields", function()
                local d = connection._bot_details({ team = "Acme", team_id = "T1", user = "bot", user_id = "U1", bot_id = "B1" })
                test.eq(d.team_id, "T1")
                test.eq(d.user_id, "U1")
                test.eq(d.bot_id, "B1")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
