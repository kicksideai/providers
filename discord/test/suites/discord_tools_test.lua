local test = require("test")
local discord_get = require("discord_get")
local discord_write = require("discord_write")

-- The Discord agent tools front the REST client for an LLM: argument validation
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

local function define_tests()
    test.describe("DiscordRead tool", function()
        local function err_of(args: any): string
            local out: any = discord_get.handler(args)
            test.is_false(out.success)
            return out.error
        end

        test.it("requires an action", function()
            test.contains(err_of({}), "action is required")
        end)
        test.it("rejects an unknown action", function()
            test.contains(err_of({ action = "nope" }), "unknown action")
        end)
        test.it("requires guild_id for guild-scoped reads", function()
            test.contains(err_of({ action = "list_channels" }), "guild_id is required")
        end)
        test.it("requires channel_id for channel-scoped reads", function()
            test.contains(err_of({ action = "get_messages" }), "channel_id is required")
        end)

        test.it("lists guilds as records", function()
            with(discord_get, {
                list_current_user_guilds = function(): any return { success = true, data = { { id = "g1", name = "Ops" }, { id = "g2", name = "Dev" } } } end,
            }, function()
                local out: any = discord_get.handler({ action = "list_guilds" })
                test.is_true(out.success)
                test.eq(out.guilds[1].name, "Ops")
                test.eq(out.guilds[2].id, "g2")
                test.is_nil(out.next_cursor)
            end)
        end)

        test.it("pages guilds with Discord's limit and after cursor", function()
            with(discord_get, {
                list_current_user_guilds = function(_conn: any, page: any): any
                    test.eq(page.limit, 200)
                    test.eq(page.after, "g0")
                    local guilds = {}
                    for i = 1, 200 do guilds[#guilds + 1] = { id = "g" .. tostring(i), name = "Guild" .. tostring(i) } end
                    return { success = true, data = guilds }
                end,
            }, function()
                local out: any = discord_get.handler({ action = "list_guilds", limit = 500, cursor = "g0" })
                test.eq(#out.guilds, 200)
                test.eq(out.next_cursor, "g200")
            end)
        end)

        test.it("pages compact guild channels", function()
            local channels = {}
            for i = 1, 120 do channels[#channels + 1] = { id = "c" .. tostring(i), name = "ch" .. tostring(i), type = 0 } end
            with(discord_get, {
                list_guild_channels = function(): any return { success = true, data = channels } end,
            }, function()
                local out: any = discord_get.handler({ action = "list_channels", guild_id = "g1", limit = 100 })
                test.eq(#out.channels, 100)
                test.eq(out.next_cursor, "100")
                local last: any = discord_get.handler({action = "list_channels", guild_id = "g1", limit = 100, cursor = out.next_cursor})
                test.eq(#last.channels, 20)
                test.eq(last.channels[20].id, "c120")
                test.is_nil(last.next_cursor)
            end)
        end)

        test.it("returns compact messages and a before cursor", function()
            local long = string.rep("x", 2000)
            with(discord_get, {
                get_channel_messages = function(_conn: any, _channel: any, limit: any, before: any): any
                    test.eq(limit, 100)
                    test.eq(before, "m0")
                    local data = {}
                    for i = 1, 100 do data[#data + 1] = { id = "m" .. tostring(i), timestamp = "t1", author = { id = "u1", username = "ann" }, content = long } end
                    return { success = true, data = data }
                end,
            }, function()
                local out: any = discord_get.handler({ action = "get_messages", channel_id = "c1", limit = 100, cursor = "m0" })
                test.eq(out.messages[1].author.username, "ann")
                test.is_nil(out.messages[1].content)
                test.eq(out.next_cursor, "m100")
            end)
        end)

        test.it("lists messages without attachments or embeds", function()
            with(discord_get, {
                get_channel_messages = function(): any
                    return { success = true, data = { {
                        id = "m1", content = "see", edited_timestamp = "t2",
                        author = { id = "u1", username = "ann", global_name = "Ann", bot = false },
                        attachments = { { id = "a1", filename = "plan.pdf", url = "https://cdn.example.test/plan.pdf", size = 2048 } },
                        embeds = { { title = "Release", description = "notes" } },
                        message_reference = { message_id = "m0" },
                        reactions = { { count = 2, emoji = { name = "eyes" } } },
                    } } }
                end,
            }, function()
                local message = (discord_get.handler({ action = "get_messages", channel_id = "c1" }) :: any).messages[1]
                test.eq(message.author.id, "u1")
                test.eq(message.author.global_name, "Ann")
                test.is_nil(message.attachments)
                test.is_nil(message.content)
                test.is_nil(message.embeds)
                test.is_nil(message.message_reference)
                test.is_nil(message.reactions)
                test.eq(message.edited_timestamp, "t2")
            end)
        end)

        test.it("gets the full message selected from a list", function()
            with(discord_get, {
                get_channel_message = function(_, channel, id)
                    test.eq(channel, "c1"); test.eq(id, "m1")
                    return {success = true, data = {id = "m1", content = "Full body", attachments = {{filename = "plan.pdf"}}}}
                end,
            }, function()
                local got: any = discord_get.handler({action = "get_message", channel_id = "c1", message_id = "m1"})
                test.eq(got.message.content, "Full body")
                test.eq(got.message.attachments[1].filename, "plan.pdf")
            end)
        end)

        test.it("returns the full guild record", function()
            with(discord_get, {
                get_guild = function(): any return { success = true, data = { id = "g1", name = "Ops", owner_id = "u1",
                    approximate_member_count = 12, features = { "COMMUNITY" }, description = "ops guild" } } end,
            }, function()
                local guild = (discord_get.handler({ action = "get_guild", guild_id = "g1" }) :: any).guild
                test.eq(guild.approximate_member_count, 12)
                test.eq(guild.features[1], "COMMUNITY")
                test.eq(guild.description, "ops guild")
            end)
        end)

        test.it("returns the channel topic as is", function()
            local topic = string.rep("x", 2000)
            with(discord_get, {
                get_channel = function(): any return { success = true, data = { id = "c1", name = "ops", type = 0, topic = topic } } end,
            }, function()
                local out: any = discord_get.handler({ action = "get_channel", channel_id = "c1" })
                test.eq(out.channel.topic, topic)
                test.eq(out.channel.type, 0)
            end)
        end)

        test.it("returns a Discord rejection as a domain error with its status and body", function()
            with(discord_get, {
                get_channel = function(): any return { success = false, error = "Unknown Channel", status_code = 404,
                    data = { message = "Unknown Channel", code = 10003 } } end,
            }, function()
                local out: any = discord_get.handler({ action = "get_channel", channel_id = "c1" })
                test.is_false(out.success)
                test.eq(out.error, "Unknown Channel")
                test.eq(out.status_code, 404)
                test.eq(out.data.code, 10003)
            end)
        end)

        test.it("fails with the typed transport error", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            with(discord_get, {
                get_channel_messages = function(): (any?, error?) return nil, failure end,
            }, function()
                local out, err = discord_get.handler({ action = "get_messages", channel_id = "c1" })
                test.is_nil(out)
                test.eq(err, failure)
            end)
        end)

        test.it("fails with the typed connection error", function()
            local failure = errors.new({ kind = errors.PERMISSION_DENIED, message = "connection access denied" })
            local previous = discord_get._transport
            discord_get._transport = { connect = function(): (any?, error?) return nil, failure end }
            local out, err = discord_get.handler({ action = "list_guilds" })
            discord_get._transport = previous
            test.is_nil(out)
            test.eq(err, failure)
        end)
    end)

    test.describe("DiscordWrite tool", function()
        test.it("requires an action and a channel_id", function()
            test.contains((discord_write.handler({}) :: any).error, "action is required")
            test.contains((discord_write.handler({ action = "send_message" }) :: any).error, "channel_id is required")
        end)
        test.it("rejects an unknown action", function()
            test.contains((discord_write.handler({ action = "nuke", channel_id = "c1" }) :: any).error, "unknown action")
        end)
        test.it("requires content for send_message", function()
            test.contains((discord_write.handler({ action = "send_message", channel_id = "c1" }) :: any).error, "content is required")
        end)
        test.it("rejects an over-length message", function()
            local long = string.rep("x", 2001)
            test.contains((discord_write.handler({ action = "send_message", channel_id = "c1", content = long }) :: any).error, "exceeds")
        end)
        test.it("requires message_id and emoji for add_reaction", function()
            test.contains((discord_write.handler({ action = "add_reaction", channel_id = "c1" }) :: any).error, "message_id is required")
            test.contains((discord_write.handler({ action = "add_reaction", channel_id = "c1", message_id = "m1" }) :: any).error, "emoji is required")
        end)

        test.it("sends a message", function()
            with(discord_write, {
                send_channel_message = function(_c: any, channel: any, payload: any): any
                    test.eq(channel, "c1"); test.eq(payload.content, "hello")
                    return { success = true, data = { id = "m9", channel_id = "c1", content = "hello", timestamp = "t9",
                        author = { id = "b1", username = "kickside", bot = true } } }
                end,
            }, function()
                local out: any = discord_write.handler({ action = "send_message", channel_id = "c1", content = "hello" })
                test.eq(out.result, "created")
                test.eq(out.message_id, "m9")
                test.eq(out.message.timestamp, "t9")
                test.eq(out.message.author.username, "kickside")
                test.eq(out.message.content, "hello")
            end)
        end)

        test.it("fails with the typed transport error", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            with(discord_write, {
                send_channel_message = function(): (any?, error?) return nil, failure end,
            }, function()
                local out, err = discord_write.handler({ action = "send_message", channel_id = "c1", content = "hello" })
                test.is_nil(out)
                test.eq(err, failure)
            end)
        end)

        test.it("adds a reaction", function()
            with(discord_write, {
                add_reaction = function(): any return { success = true } end,
            }, function()
                local out: any = discord_write.handler({ action = "add_reaction", channel_id = "c1", message_id = "m1", emoji = "👍" })
                test.eq(out.result, "updated")
                test.eq(out.emoji, "👍")
            end)
        end)

        test.it("triggers typing", function()
            with(discord_write, {
                trigger_typing = function(): any return { success = true } end,
            }, function()
                test.eq((discord_write.handler({ action = "trigger_typing", channel_id = "c1" }) :: any).result, "rendered")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
