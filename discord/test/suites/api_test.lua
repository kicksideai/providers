local test = require("test")
local api = require("api")

local function define_tests()
    test.describe("Discord API client", function()
        test.it("builds bot-token headers", function()
            local headers = api.headers("discord-token")
            test.eq(headers["Authorization"], "Bot discord-token")
            test.eq(headers["Accept"], "application/json")
        end)

        test.it("encodes URL path and query segments", function()
            local url = api.build_url("/guilds/" .. api.encode_segment("guild id") .. "/channels", { around = "a b" } :: { [string]: any })
            test.is_true(url:find("/guilds/guild%20id/channels", 1, true) ~= nil, url)
            test.is_true(url:find("around=a%20b", 1, true) ~= nil, url)
        end)

        test.it("preserves Discord's permission error message", function()
            local message, status = api.extract_error({ status_code = 403, body = '{"message":"Missing Permissions","code":50013}' })
            test.eq(message, "Missing Permissions")
            test.eq(status, 403)
        end)
        test.it("extracts common provider errors", function()
            local msg, code = api.extract_error({ status_code = 429, body = "" })
            test.eq(msg, "rate limited")
            test.eq(code, 429)

            msg, code = api.extract_error({ status_code = 500, body = '{"message":"boom"}' })
            test.eq(msg, "boom")
            test.eq(code, 500)
        end)

        test.it("reads the 429 retry window from the body, then the header", function()
            test.eq(api.retry_after_ms({ body = '{"retry_after":1.5,"global":false}' }), 1500)
            test.eq(api.retry_after_ms({ body = "", headers = { ["Retry-After"] = "2" } }), 2000)
        end)

        test.it("clamps a missing or absurd retry window to a sane range", function()
            test.eq(api.retry_after_ms({ body = "" }), 1000)              -- default 1s
            test.eq(api.retry_after_ms({ body = '{"retry_after":9999}' }), 60000) -- capped at 60s
        end)

        test.it("uses Discord's native cursors with clamped page limits", function()
            local get = api.get
            local calls: { any } = {}
            api.get = function(_conn: any, path: string, query: any): any
                calls[#calls + 1] = { path = path, query = query }
                return { success = true }
            end
            local ok, err = pcall(function()
                api.list_current_user_guilds({ bot_token = "token" }, { limit = 500, after = "g0" })
                api.get_channel_messages({ bot_token = "token" }, "channel", 500, "m0")
            end)
            api.get = get
            if not ok then error(err) end
            test.eq(calls[1].path, "/users/@me/guilds")
            test.eq(calls[1].query.limit, "200")
            test.eq(calls[1].query.after, "g0")
            test.eq(calls[2].query.limit, "100")
            test.eq(calls[2].query.before, "m0")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
