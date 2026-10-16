local test = require("test")
local slack_get = require("slack_get")
local slack_write = require("slack_write")

-- The Slack agent tools front the Web API client for an LLM: argument validation
-- and action dispatch are the contract the agent depends on. These cases pin both
-- by injecting a fake transport (a stub connection) and a fake api (canned
-- results), so the dispatch is exercised without a live connection or network.
local function fake_conn()
    return { connect = function(): (any, any) return { bot_token = "tok" }, nil end }
end

local function with(tool: any, api: any, fn: any)
    local pt, pa = tool._transport, tool._api
    tool._transport = fake_conn()
    tool._api = api
    local ok, err = pcall(fn)
    tool._transport, tool._api = pt, pa
    if not ok then error(err) end
end

local function err_of(tool: any, args: any): string
    local out: any = tool.handler(args)
    test.is_false(out.success)
    return out.error
end

local function define_tests()
    test.describe("SlackRead tool", function()
        test.it("requires an action", function()
            test.contains(err_of(slack_get, {}), "action is required")
        end)
        test.it("rejects an unknown action", function()
            test.contains(err_of(slack_get, { action = "nope" }), "unknown action")
            test.contains(err_of(slack_get, { action = "get_message", channel_id = "C1" }), "message_ts is required")
        end)
        test.it("requires channel_id for channel-scoped reads", function()
            test.contains(err_of(slack_get, { action = "get_messages" }), "channel_id is required")
            test.contains(err_of(slack_get, { action = "get_channel" }), "channel_id is required")
        end)

        test.it("lists compact Slack channels", function()
            with(slack_get, {
                list_conversations = function(): any return { success = true, data = { channels = {
                    { id = "C1", name = "ops", topic = { value = "on call" }, num_members = 4 },
                    { id = "C2", name = "dev", is_private = true, purpose = { value = "builds" } } } } } end,
            }, function()
                local out: any = slack_get.handler({ action = "list_channels" })
                test.eq(out.channels[1].name, "ops")
                test.is_nil(out.channels[1].topic)
                test.eq(out.channels[1].num_members, 4)
                test.is_true(out.channels[2].is_private)
                test.is_nil(out.channels[2].purpose)
            end)
        end)

        test.it("returns the full Slack channel record", function()
            with(slack_get, {
                conversation_info = function(): any return { success = true, data = { channel = {
                    id = "C1", name = "ops", topic = { value = "on call", creator = "U1" }, created = 1700000000, is_archived = false } } } end,
            }, function()
                local out: any = slack_get.handler({ action = "get_channel", channel_id = "C1" })
                test.eq(out.channel.topic.value, "on call")
                test.eq(out.channel.topic.creator, "U1")
                test.eq(out.channel.created, 1700000000)
            end)
        end)

        test.it("uses Slack cursors with the requested page size for channels and users", function()
            with(slack_get, {
                list_conversations = function(_c: any, options: any): any
                    test.eq(options.limit, 500); test.eq(options.cursor, "next-channels")
                    return { success = true, data = { channels = { { id = "C1", name = "ops" } }, response_metadata = { next_cursor = "next-page" } } }
                end,
                users_list = function(_c: any, options: any): any
                    test.is_nil(options.limit); test.eq(options.cursor, "next-users")
                    return { success = true, data = { members = { { id = "U1", name = "ann" } }, response_metadata = { next_cursor = "next-page" } } }
                end,
            }, function()
                local channels: any = slack_get.handler({ action = "list_channels", limit = 500, cursor = "next-channels" })
                test.eq(channels.next_cursor, "next-page")
                local users: any = slack_get.handler({ action = "list_users", cursor = "next-users" })
                test.eq(users.next_cursor, "next-page")
            end)
        end)

        test.it("returns complete message text with the history cursor", function()
            local long = string.rep("é message ", 2000)
            with(slack_get, {
                conversation_history = function(_c: any, _channel: any, options: any): any
                    test.eq(options.limit, 300); test.eq(options.cursor, "next-messages")
                    return { success = true, data = { messages = { { ts = "t1", user = "U1", text = long }, { ts = "t2", bot_id = "B1", text = "ok" } },
                        response_metadata = { next_cursor = "next-page" } } }
                end,
            }, function()
                local result: any = slack_get.handler({ action = "get_messages", channel_id = "C1", limit = 300, cursor = "next-messages" })
                test.eq(result.count, 2)
                test.is_nil(result.messages[1].text)
                test.eq(result.messages[2].bot_id, "B1")
                test.eq(result.next_cursor, "next-page")
            end)
        end)

        test.it("lists message identifiers and thread fields without full content", function()
            with(slack_get, {
                conversation_history = function(): any
                    return { success = true, data = { messages = { {
                        ts = "t1", user = "U1", text = "see file", thread_ts = "t0", reply_count = 3,
                        files = { { id = "F1", name = "plan.pdf" } },
                        blocks = { { type = "rich_text", block_id = "b1" } },
                        reactions = { { name = "eyes", count = 2, users = { "U2", "U3" } } },
                    } } } }
                end,
            }, function()
                local result: any = slack_get.handler({ action = "get_messages", channel_id = "C1" })
                local message = result.messages[1]
                test.is_nil(message.files)
                test.is_nil(message.text)
                test.is_nil(message.blocks)
                test.is_nil(message.reactions)
                test.eq(message.thread_ts, "t0")
                test.eq(message.reply_count, 3)
            end)
        end)

        test.it("lists compact Slack users", function()
            with(slack_get, {
                users_list = function(): any return { success = true, data = { members = {
                    { id = "U1", name = "ann", real_name = "Ann", tz = "Europe/Berlin", profile = { email = "ann@example.test" } } } } } end,
            }, function()
                local out: any = slack_get.handler({ action = "list_users" })
                test.eq(out.users[1].real_name, "Ann")
                test.eq(out.users[1].tz, "Europe/Berlin")
                test.is_nil(out.users[1].profile)
            end)
        end)

        test.it("gets the complete message and user selected from a list", function()
            local message = {ts = "123", text = "Full body", blocks = {{type = "rich_text"}}}
            with(slack_get, {
                conversation_message = function(_, channel, ts)
                    test.eq(channel, "C1"); test.eq(ts, "123")
                    return {success = true, data = {messages = {message}}}
                end,
                users_info = function() return {success = true, data = {user = {id = "U1", profile = {email = "ada@example.test"}}}} end,
            }, function()
                local got: any = slack_get.handler({action = "get_message", channel_id = "C1", message_ts = "123"})
                test.eq(got.message.text, "Full body")
                test.eq(got.message.blocks[1].type, "rich_text")
                local user: any = slack_get.handler({action = "get_user", user_id = "U1"})
                test.eq(user.user.profile.email, "ada@example.test")
            end)
        end)

        test.it("returns a Slack rejection as a domain error with its code and body", function()
            with(slack_get, {
                conversation_info = function(): any return { success = false, error = "channel_not_found", status_code = 200,
                    data = { ok = false, error = "channel_not_found" } } end,
            }, function()
                local out: any = slack_get.handler({ action = "get_channel", channel_id = "C1" })
                test.is_false(out.success)
                test.eq(out.error, "channel_not_found")
                test.eq(out.status_code, 200)
                test.eq(out.data.error, "channel_not_found")
            end)
        end)

        test.it("fails with the typed transport error", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            with(slack_get, {
                conversation_history = function(): (any?, error?) return nil, failure end,
            }, function()
                local out, err = slack_get.handler({ action = "get_messages", channel_id = "C1" })
                test.is_nil(out)
                test.eq(err, failure)
            end)
        end)

        test.it("fails with the typed connection error", function()
            local failure = errors.new({ kind = errors.PERMISSION_DENIED, message = "connection access denied" })
            local previous = slack_get._transport
            slack_get._transport = { connect = function(): (any?, error?) return nil, failure end }
            local out, err = slack_get.handler({ action = "list_channels" })
            slack_get._transport = previous
            test.is_nil(out)
            test.eq(err, failure)
        end)
    end)

    test.describe("SlackWrite tool", function()
        test.it("requires an action and a channel_id", function()
            test.contains(err_of(slack_write, {}), "action is required")
            test.contains(err_of(slack_write, { action = "send_message" }), "channel_id is required")
        end)
        test.it("rejects an unknown action", function()
            test.contains(err_of(slack_write, { action = "nuke", channel_id = "C1" }), "unknown action")
        end)
        test.it("requires content for send_message", function()
            test.contains(err_of(slack_write, { action = "send_message", channel_id = "C1" }), "content is required")
        end)
        test.it("rejects an over-length message", function()
            local long = string.rep("x", 40001)
            test.contains(err_of(slack_write, { action = "send_message", channel_id = "C1", content = long }), "exceeds")
        end)
        test.it("requires message_ts and emoji for add_reaction", function()
            test.contains(err_of(slack_write, { action = "add_reaction", channel_id = "C1" }), "message_ts is required")
            test.contains(err_of(slack_write, { action = "add_reaction", channel_id = "C1", message_ts = "t1" }), "emoji is required")
        end)

        test.it("sends a message, threading when thread_ts is given", function()
            with(slack_write, {
                post_message = function(_c: any, channel: any, payload: any): any
                    test.eq(channel, "C1"); test.eq(payload.text, "hello"); test.eq(payload.thread_ts, "123.45")
                    return { success = true, data = { ts = "999.1", channel = "C1",
                        message = { ts = "999.1", text = "hello", thread_ts = "123.45", bot_id = "B1" } } }
                end,
            }, function()
                local out: any = slack_write.handler({ action = "send_message", channel_id = "C1", content = "hello", thread_ts = "123.45" })
                test.eq(out.result, "created")
                test.eq(out.channel_id, "C1")
                test.eq(out.message_ts, "999.1")
                test.eq(out.message.text, "hello")
                test.eq(out.message.bot_id, "B1")
            end)
        end)

        test.it("adds a reaction", function()
            with(slack_write, {
                add_reaction = function(_c: any, channel: any, ts: any, name: any): any
                    test.eq(channel, "C1"); test.eq(ts, "t1"); test.eq(name, "thumbsup")
                    return { success = true }
                end,
            }, function()
                local out: any = slack_write.handler({ action = "add_reaction", channel_id = "C1", message_ts = "t1", emoji = "thumbsup" })
                test.eq(out.result, "updated")
                test.eq(out.emoji, "thumbsup")
            end)
        end)

        test.it("fails with the typed transport error", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            with(slack_write, {
                post_message = function(): (any?, error?) return nil, failure end,
            }, function()
                local out, err = slack_write.handler({ action = "send_message", channel_id = "C1", content = "hello" })
                test.is_nil(out)
                test.eq(err, failure)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
