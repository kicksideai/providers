local test = require("test")
local connection = require("connection")
local types = require("types")

-- The connection contract is the front door of the Discord integration: create
-- (bot token) -> test -> status -> discover (channel picker) -> send_reply. These
-- cases pin the request/response shaping and the send-side validation that the
-- flow relies on, independent of a live component context or the Discord API
-- (the REST calls themselves are covered by core:api_test).
local function define_tests()
    test.describe("Discord connection flow", function()
        test.describe("reply payload shaping", function()
            test.it("wraps a plain string as content", function()
                local p, err = connection._reply_payload("hello", "")
                test.is_nil(err)
                test.eq(p.content, "hello")
            end)

            test.it("preserves a structured payload and fills content from text", function()
                local p, err = connection._reply_payload({ text = "from text", tts = true }, "")
                test.is_nil(err)
                test.eq(p.content, "from text")
                test.eq(p.tts, true)
            end)

            test.it("keeps an explicit content over text", function()
                local p = connection._reply_payload({ content = "explicit", text = "ignored" }, "")
                test.eq(p.content, "explicit")
            end)

            test.it("rejects empty string content", function()
                local p, err = connection._reply_payload("", "")
                test.is_nil(p)
                test.ok(err:find("content is required") ~= nil)
            end)

            test.it("rejects a structured payload with no content or text", function()
                local p, err = connection._reply_payload({ tts = true }, "")
                test.is_nil(p)
                test.ok(err:find("content.content is required") ~= nil)
            end)
        end)

        test.describe("send_reply validation (pre-transport)", function()
            test.it("refuses token use without an admitted reply proof", function()
                local r = connection.send_reply({ resource_id = "chan-1", content = "hello" })
                test.eq(r.success, false)
                test.is_true(errors.is(r.error, errors.PERMISSION_DENIED))
            end)
            test.it("requires a resource_id (channel)", function()
                local r = connection.send_reply({ content = "hi" })
                test.eq(r.success, false)
                test.ok(r.error:find("resource_id is required"))
            end)

            test.it("requires content", function()
                local r = connection.send_reply({ resource_id = "chan-1", content = "" })
                test.eq(r.success, false)
                test.ok(r.error:find("content is required"))
            end)

            test.it("rejects a message longer than the Discord limit", function()
                local long = string.rep("x", types.MESSAGE_MAX_LENGTH + 1)
                local r = connection.send_reply({ resource_id = "chan-1", content = long })
                test.eq(r.success, false)
                test.ok(r.error:find("exceeds"))
            end)
        end)

        test.describe("bot identity from /users/@me", function()
            test.it("shapes the Discord current bot user as diagnostic details", function()
                local details = connection._shape_bot_identity({
                    id = "bot-1",
                    username = "Wippy",
                    global_name = "Wippy Bot",
                    discriminator = "0000",
                    avatar = "avatar-hash",
                    bot = true,
                })
                test.eq(details.bot.id, "bot-1")
                test.eq(details.bot.username, "Wippy")
                test.eq(details.bot.global_name, "Wippy Bot")
                test.eq(details.bot.avatar, "avatar-hash")
                test.eq(details.bot.bot, true)
            end)
        end)

        test.describe("send_status validation (pre-transport)", function()
            test.it("requires a resource_id (channel)", function()
                local r = connection.send_status({ phase = "tool_call" })
                test.eq(r.success, false)
                test.ok(r.error:find("resource_id is required"))
            end)
        end)

        test.describe("resource discovery shaping", function()
            test.it("maps a guild to a discord_guild row, falling back to id for a blank name", function()
                test.eq(connection._guild_resource({ id = "g1", name = "Ops" }).type, "discord_guild")
                test.eq(connection._guild_resource({ id = "g1", name = "Ops" }).name, "Ops")
                test.eq(connection._guild_resource({ id = "g2", name = "" }).name, "g2")
                test.is_nil(connection._guild_resource({ name = "no id" }))
            end)

            test.it("maps a channel under its guild with a numeric channel_type", function()
                local row = connection._channel_resource({ id = "c1", name = "general", type = 0 }, "g1")
                test.eq(row.type, "discord_channel")
                test.eq(row.guild_id, "g1")
                test.eq(row.channel_type, 0)
                test.eq(connection._channel_resource({ id = "c2" }, "g1").name, "c2")
                test.is_nil(connection._channel_resource({ name = "no id" }, "g1"))
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
