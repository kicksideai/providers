local test = require("test")
local connection = require("connection")
local types = require("types")

local function define_tests()
    test.describe("Telegram connection flow", function()
        test.it("fails test_connection, get_status and discover_resources with the typed component error", function()
            for _, method in ipairs({ "test_connection", "get_status", "discover_resources" }) do
                local result, err = (connection :: any)[method]({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
            end
        end)

        test.describe("reply payload shaping", function()
            test.it("returns a plain string as text", function()
                local text, reply_to, thread_id, parse_mode, err = connection._reply_payload("hello")
                test.is_nil(err)
                test.eq(text, "hello")
                test.is_nil(reply_to)
                test.is_nil(thread_id)
                test.eq(parse_mode, "")
            end)

            test.it("takes text from a structured payload and carries Telegram reply options", function()
                local text, reply_to, thread_id, parse_mode, err = connection._reply_payload({
                    text = "from text",
                    reply_to_message_id = 42,
                    message_thread_id = 7,
                    parse_mode = "MarkdownV2",
                })
                test.is_nil(err)
                test.eq(text, "from text")
                test.eq(reply_to, 42)
                test.eq(thread_id, 7)
                test.eq(parse_mode, "MarkdownV2")
            end)

            test.it("falls back to content when text is absent", function()
                local text = connection._reply_payload({ content = "from content" })
                test.eq(text, "from content")
            end)

            test.it("rejects empty string content", function()
                local text, _reply_to, _thread_id, _parse_mode, err = connection._reply_payload("")
                test.eq(text, "")
                test.ok(err:find("content is required") ~= nil)
            end)

            test.it("rejects a structured payload with no text or content", function()
                local _text, _reply_to, _thread_id, _parse_mode, err = connection._reply_payload({ message_thread_id = "1" })
                test.ok(err:find("content.text is required") ~= nil)
            end)
        end)

        test.describe("send_reply validation (pre-transport)", function()
            test.it("requires sealed proof or explicit outbound authority before token use", function()
                local r = connection.send_reply({ resource_id = "C1", content = "hello" })
                test.is_false(r.success)
                test.is_true(errors.is(r.error, errors.PERMISSION_DENIED))
            end)
            test.it("requires a resource_id (chat)", function()
                local r = connection.send_reply({ content = "hi" })
                test.eq(r.success, false)
                test.ok(r.error:find("resource_id is required") ~= nil)
            end)

            test.it("requires content", function()
                local r = connection.send_reply({ resource_id = "C1", content = "" })
                test.eq(r.success, false)
                test.ok(r.error:find("content is required") ~= nil)
            end)

            test.it("rejects a message longer than the Telegram limit", function()
                local long = string.rep("x", types.MESSAGE_MAX_LENGTH + 1)
                local r = connection.send_reply({ resource_id = "C1", content = long })
                test.eq(r.success, false)
                test.ok(r.error:find("exceeds") ~= nil)
            end)
        end)

        test.describe("send_status", function()
            test.it("requires a resource_id (chat)", function()
                local r = connection.send_status({ phase = "thinking" })
                test.eq(r.success, false)
                test.ok(r.error:find("resource_id is required") ~= nil)
            end)
        end)

        test.it("does not edit or render status for an admitted reply without separate operations", function()
            local proof = { turn_id = "turn-1" }
            local edited = connection.update_reply({ resource_id = "C1", message_ref = "m1",
                content = "edit", reply_proof = proof })
            test.is_false(edited.success)
            test.is_true(errors.is(edited.error, errors.PERMISSION_DENIED))
            local status = connection.send_status({ resource_id = "C1", phase = "typing", reply_proof = proof })
            test.is_false(status.success)
            test.is_true(errors.is(status.error, errors.PERMISSION_DENIED))
        end)

        test.describe("resource discovery shaping", function()
            test.it("maps a chat to a selectable telegram_chat row", function()
                local row = connection._chat_resource({ id = "-1001", title = "General", type = "supergroup" })
                test.eq(row.type, "telegram_chat")
                test.eq(row.name, "General")
                test.eq(row.chat_type, "supergroup")
                test.is_true(row.selectable)
                test.eq(connection._chat_resource({ id = "42", first_name = "Ada", last_name = "Example" }).name, "Ada Example")
                test.eq(connection._chat_resource({ id = "43", username = "ada" }).name, "ada")
                test.is_nil(connection._chat_resource({ title = "no id" }))
            end)
        end)

        test.describe("status details", function()
            test.it("projects the getMe identity fields", function()
                local d = connection._bot_details({ id = 10, username = "kickbot", first_name = "Kick", is_bot = true })
                test.eq(d.id, 10)
                test.eq(d.username, "kickbot")
                test.eq(d.first_name, "Kick")
                test.eq(d.is_bot, true)
            end)
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
