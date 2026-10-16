local test = require("test")
local telegram_get = require("telegram_get")
local telegram_write = require("telegram_write")

local function err_of(tool: any, args: any): string
    local out: any = tool.handler(args)
    test.is_false(out.success)
    return out.error
end

local function with(tool: any, api: any, fn: any)
    local transport, previous_api = tool._transport, tool._api
    tool._transport = { connect = function(): (any, any) return { bot_token = "tok" }, nil end }
    tool._api = api
    local ok, err = pcall(fn)
    tool._transport, tool._api = transport, previous_api
    if not ok then error(err) end
end

local function define_tests()
    test.describe("Telegram tools", function()
        test.it("rejects missing and unknown read actions before opening a connection", function()
            test.contains(err_of(telegram_get, {}), "action is required")
            test.contains(err_of(telegram_get, { action = "list_channels" }), "unknown action")
        end)

        test.it("requires chat_id for get_chat", function()
            test.contains(err_of(telegram_get, { action = "get_chat" }), "chat_id is required")
        end)

        test.it("returns the chat record with its complete description", function()
            local description = string.rep("x", 5000)
            with(telegram_get, {
                get_chat = function(): any return { success = true, data = {
                    id = 42, title = "Ops", description = description, type = "group",
                    permissions = { can_send_messages = true }, pinned_message = { message_id = 5 },
                } } end,
            }, function()
                local r: any, err = telegram_get.handler({ action = "get_chat", chat_id = "42" })
                test.is_nil(err)
                test.eq(r.chat.id, 42)
                test.eq(r.chat.type, "group")
                test.eq(r.chat.description, description)
                test.is_true(r.chat.permissions.can_send_messages)
                test.eq(r.chat.pinned_message.message_id, 5)
            end)
        end)

        test.it("returns the full bot user", function()
            with(telegram_get, {
                test_connection = function(): any return { success = true, data = {
                    id = 7, is_bot = true, first_name = "Ops", username = "ops_bot", can_join_groups = true, has_main_web_app = false,
                } } end,
            }, function()
                local r: any = telegram_get.handler({ action = "get_me" })
                test.eq(r.bot.id, 7)
                test.is_true(r.bot.can_join_groups)
                test.is_false(r.bot.has_main_web_app)
            end)
        end)

        test.it("fails with typed connection and transport errors and returns Telegram's rejection", function()
            local denied = errors.new({ kind = errors.PERMISSION_DENIED, message = "connection access denied" })
            local previous = telegram_get._transport
            telegram_get._transport = { connect = function(): (any?, error?) return nil, denied end }
            local none, none_err = telegram_get.handler({ action = "get_me" })
            telegram_get._transport = previous
            test.is_nil(none)
            test.eq(none_err, denied)
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            with(telegram_write, {
                send_message = function(): (any?, error?) return nil, failure end,
            }, function()
                local r, err = telegram_write.handler({ action = "send_message", chat_id = "42", text = "hi" })
                test.is_nil(r)
                test.eq(err, failure)
            end)
            with(telegram_get, {
                get_chat = function(): any return { success = false, error = "Bad Request: chat not found", status_code = 400,
                    data = { ok = false, error_code = 400 } } end,
            }, function()
                local r: any = telegram_get.handler({ action = "get_chat", chat_id = "1" })
                test.is_false(r.success)
                test.eq(r.status_code, 400)
                test.eq(r.data.error_code, 400)
            end)
        end)

        test.it("validates write action inputs before opening a connection", function()
            test.contains(err_of(telegram_write, { action = "send_message" }), "chat_id is required")
            test.contains(err_of(telegram_write, { action = "send_message", chat_id = "42" }), "text is required")
            test.contains(err_of(telegram_write, { action = "send_reaction", chat_id = "42", message_id = "9" }), "emoji is required")
        end)

        test.it("returns the sent message identity as a record", function()
            with(telegram_write, {
                send_message = function(): any return { success = true, data = { message_id = 77, date = 1760518800,
                    chat = { id = 42, type = "group" }, text = "hi" } } end,
            }, function()
                local r: any, err = telegram_write.handler({ action = "send_message", chat_id = "42", text = "hi" })
                test.is_nil(err)
                test.eq(r.result, "created")
                test.eq(r.message_id, "77")
                test.eq(r.message.date, 1760518800)
                test.eq(r.message.chat.type, "group")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
