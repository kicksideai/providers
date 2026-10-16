local test = require("test")
local api = require("api")

local function response(status: number, body: string?, headers: any?): any
    return { status_code = status, body = body or "", headers = headers or {} }
end

local function with_transport(sequence: { any }, body: (any, any) -> ()): ()
    local saved_http = api._http_client
    local saved_sleep = api._sleep
    local calls: { any } = {}
    local sleeps: { string } = {}
    local index = 0

    api._http_client = {
        request = function(method: string, url: string, opts: any): (any?, string?)
            calls[#calls + 1] = { method = method, url = url, opts = opts }
            index = index + 1
            local item = sequence[index] or {}
            return item.response, item.error
        end,
    }
    api._sleep = function(delay: string) sleeps[#sleeps + 1] = delay end

    local ok, err = pcall(body, calls, sleeps)
    api._http_client = saved_http
    api._sleep = saved_sleep
    if not ok then error(err) end
end

local function define_tests()
    test.describe("Telegram API client", function()
        test.it("returns a durable write rate limit without retrying or sleeping", function()
            with_transport({ { response = response(429, '{"ok":false,"description":"slow down","parameters":{"retry_after":7}}') } }, function(calls, sleeps)
                local result = api.request_once({ bot_token = "t" }, "sendMessage", { chat_id = "1", text = "Hello" })
                test.is_false(result.success)
                test.eq(result.status_code, 429)
                test.eq(result.retry_after_ms, 7000)
                test.eq(#calls, 1)
                test.eq(#sleeps, 0)
            end)
        end)

        test.it("redacts repeated raw and encoded credentials without hiding the failure", function()
            local token = "123:abc-_.Z"
            local encoded = api.encode_component(token)
            local message = "request " .. token .. " failed at /bot" .. encoded .. "/getFile: " .. token
            test.eq(api.without_token({ bot_token = token }, message),
                "request <token> failed at /bot<token>/getFile: <token>")
        end)

        test.it("builds JSON headers", function()
            local headers = api.headers()
            test.eq(headers["Accept"], "application/json")
            test.eq(headers["Content-Type"], "application/json")
        end)

        test.it("query-encodes params, percent-escaping values and skipping nils", function()
            local body = api.encode_query({ chat_id = "C 1", text = "a&b" })
            test.is_true(body:find("chat_id=C%201", 1, true) ~= nil, body)
            test.is_true(body:find("text=a%26b", 1, true) ~= nil, body)
        end)

        test.it("encodes a single component", function()
            test.eq(api.encode_component("a b&c"), "a%20b%26c")
        end)

        test.it("extracts the Telegram description from the body, else a status fallback", function()
            test.eq(api.extract_error({ ok = false, description = "chat not found" }, 200), "chat not found")
            test.eq(api.extract_error({ ok = false }, 429), "rate limited")
            test.eq(api.extract_error(nil, 401), "unauthorized")
            test.eq(api.extract_error(nil, 500), "request failed")
        end)

        test.it("builds Bot API method URLs without leaking unescaped token chars", function()
            local url = api.method_url({ bot_token = "123:a/b" }, "getMe")
            test.eq(url, "https://api.telegram.org/bot123%3Aa%2Fb/getMe")
        end)

        test.it("encodes safe file paths and rejects ambiguous path structures", function()
            test.eq(api.encode_path("voice/file_5.oga"), "voice/file_5.oga")
            test.eq(api.encode_path("photos/file 1.jpg"), "photos/file%201.jpg")
            for _, path in ipairs({ "", ".", "..", "../../bot123/logOut", "/root/file", "dir/", "dir//file" }) do
                local encoded, err = api.encode_path(path)
                test.is_nil(encoded)
                test.eq(err, "invalid file_path")
            end
        end)

        test.it("removes raw and encoded bot tokens from errors literally", function()
            local conn = { bot_token = "123:AAH-x/%" }
            test.eq(api.encode_component(conn.bot_token), "123%3AAAH-x%2F%25")
            local raw = 'raw 123:AAH-x/% and URL bot123%3AAAH-x%2F%25 and raw 123:AAH-x/% again'
            test.eq(api.without_token(conn, raw), "raw <token> and URL bot<token> and raw <token> again")
            test.eq(api.without_token({ bot_token = "" }, "ordinary error"), "ordinary error")
        end)

        test.it("gets Telegram file metadata with an encoded query", function()
            with_transport({ { response = response(200, '{"ok":true,"result":{"file_path":"voice/file.oga"}}') } }, function(calls, _sleeps)
                local result = api.get_file({ bot_token = "token" }, "file id/1")
                test.eq(result.success, true)
                test.eq(result.data.file_path, "voice/file.oga")
                test.eq(calls[1].method, "GET")
                test.is_true(calls[1].url:find("file_id=file%20id%2F1", 1, true) ~= nil)
            end)
        end)

        test.it("downloads bytes through the shared retry path without exposing the token", function()
            with_transport({
                { response = response(429, "", { ["Retry-After"] = "1" }) },
                { response = response(200, "binary-data") },
            }, function(calls, sleeps)
                local result = api.download_file({ bot_token = "123:a/b" }, "voice/file 1.oga")
                test.eq(result.success, true)
                test.eq(result.data, "binary-data")
                test.eq(result.status_code, 200)
                test.eq(#calls, 2)
                test.eq(#sleeps, 1)
                test.eq(calls[1].method, "GET")
                test.eq(calls[1].opts.body, "")
                test.eq(calls[1].opts.headers.Accept, "*/*")
                test.eq(calls[1].url, "https://api.telegram.org/file/bot123%3Aa%2Fb/voice/file%201.oga")
                test.eq(calls[1].url, calls[2].url)
            end)
        end)

        test.it("shares retry handling across file metadata and the binary download", function()
            local bytes = "\0PNG\n"
            with_transport({
                { response = response(429, "", { ["Retry-After"] = "2" }) },
                { response = response(200, '{"ok":true,"result":{"file_path":"photos/file 2.png"}}') },
                { response = response(429, "", { ["Retry-After"] = "3" }) },
                { response = response(200, bytes) },
            }, function(calls, sleeps)
                local conn = { bot_token = "123:a/b" }
                local metadata = api.get_file(conn, "file ref/2")
                test.is_true(metadata.success)
                local download = api.download_file(conn, metadata.data.file_path)
                test.is_true(download.success)
                test.eq(download.data, bytes)
                test.eq(#calls, 4)
                test.eq(sleeps[1], "2000ms")
                test.eq(sleeps[2], "3000ms")
                test.eq(#sleeps, 2)
                test.is_true(calls[1].url:find("getFile?file_id=file%20ref%2F2", 1, true) ~= nil)
                test.eq(calls[1].url, calls[2].url)
                test.eq(calls[3].url, "https://api.telegram.org/file/bot123%3Aa%2Fb/photos/file%202.png")
                test.eq(calls[3].url, calls[4].url)
                test.eq(calls[3].opts.headers.Accept, "*/*")
            end)
        end)

        test.it("rejects unsafe, empty, and failed downloads", function()
            with_transport({}, function(calls, _sleeps)
                local result = api.download_file({ bot_token = "token" }, "../getMe")
                test.eq(result.success, false)
                test.eq(result.error, "invalid file_path")
                test.eq(#calls, 0)
            end)
            with_transport({ { response = response(404, '{"description":"file gone"}') } }, function(_calls, _sleeps)
                local result = api.download_file({ bot_token = "token" }, "voice/missing.oga")
                test.eq(result.error, "file gone")
                test.eq(result.status_code, 404)
            end)
            with_transport({ { response = response(200, "") } }, function(_calls, _sleeps)
                local result = api.download_file({ bot_token = "token" }, "voice/empty.oga")
                test.eq(result.error, "download returned no bytes")
                test.eq(result.status_code, 200)
            end)
            with_transport({ { error = "GET /file/botsecret/file.oga failed for secret" } }, function(_calls, sleeps)
                local result = api.download_file({ bot_token = "secret" }, "voice/file.oga")
                test.eq(result.error, "GET /file/bot<token>/file.oga failed for <token>")
                test.eq(#sleeps, 0)
            end)
        end)

        test.it("fails an unsent request with a typed error that never carries the token", function()
            with_transport({ { error = "POST https://api.telegram.org/botsecret/getMe failed for secret" } }, function(_calls, _sleeps)
                local result, err = api.call({ bot_token = "secret" }, "getMe", nil, "POST", 0)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(err:message(), "POST https://api.telegram.org/bot<token>/getMe failed for <token>")
            end)
        end)

        test.it("keeps a rejection's response body", function()
            with_transport({ { response = response(400, '{"ok":false,"error_code":400,"description":"Bad Request: chat not found"}') } }, function(_calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "getChat", { chat_id = "1" }, "GET")
                test.is_false(result.success)
                test.eq(result.data.error_code, 400)
            end)
        end)

        test.it("redacts a token echoed by Telegram in an error description", function()
            with_transport({ { response = response(400, '{"description":"bad token 123:abc"}') } }, function(_calls, _sleeps)
                local result = api.request({ bot_token = "123:abc" }, "getMe")
                test.eq(result.error, "bad token <token>")
                test.eq(result.status_code, 400)
            end)
        end)

        test.it("reads and clamps the 429 retry window", function()
            test.eq(api.retry_after_ms({ headers = { ["Retry-After"] = "2" } }), 2000)
            test.eq(api.retry_after_ms({ headers = { ["retry-after"] = "3" } }), 3000)
            test.eq(api.retry_after_ms({}), 1000)
            test.eq(api.retry_after_ms({ headers = { ["Retry-After"] = "9999" } }), 60000)
        end)

        test.it("retries 429 responses and returns the eventual success", function()
            with_transport({
                { response = response(429, "", { ["Retry-After"] = "2" }) },
                { response = response(429, "", { ["Retry-After"] = "3" }) },
                { response = response(200, '{"ok":true,"result":{"id":7}}') },
            }, function(calls, sleeps)
                local result = api.request({ bot_token = "token" }, "getMe", nil, "GET")
                test.eq(result.success, true)
                test.eq(result.status_code, 200)
                test.eq(result.data.id, 7)
                test.eq(#calls, 3)
                test.eq(#sleeps, 2)
                test.eq(sleeps[1], "2000ms")
                test.eq(sleeps[2], "3000ms")
                test.eq(calls[1].url, calls[2].url)
                test.eq(calls[2].url, calls[3].url)
            end)
        end)

        test.it("returns the final Telegram 429 description after exactly four attempts", function()
            with_transport({
                { response = response(429) },
                { response = response(429) },
                { response = response(429) },
                { response = response(429, '{"ok":false,"description":"retry later"}') },
            }, function(calls, sleeps)
                local result = api.request({ bot_token = "token" }, "getMe")
                test.eq(result.success, false)
                test.eq(result.error, "retry later")
                test.eq(result.status_code, 429)
                test.eq(#calls, 4)
                test.eq(#sleeps, 3)
            end)

            with_transport({
                { response = response(429) }, { response = response(429) },
                { response = response(429) }, { response = response(429) },
            }, function(_calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "getMe")
                test.eq(result.error, "rate limited")
                test.eq(result.status_code, 429)
            end)
        end)

        test.it("preserves non-429 status fallbacks and never retries transport errors", function()
            with_transport({ { response = response(403, '{"description":"bot blocked"}') } }, function(calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "sendMessage", { text = "hello" })
                test.eq(result.error, "bot blocked")
                test.eq(result.status_code, 403)
                test.eq(#calls, 1)
            end)

            with_transport({ { response = response(500, "not-json") } }, function(_calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "getMe")
                test.eq(result.error, "request failed")
                test.eq(result.status_code, 500)
            end)

            with_transport({ { error = "network down" } }, function(calls, sleeps)
                local result, err = api.request({ bot_token = "token" }, "getMe")
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.contains(err:message(), "network down")
                test.eq(#calls, 1)
                test.eq(#sleeps, 0)
            end)
        end)

        test.it("rejects malformed or negative 2xx bodies", function()
            with_transport({ { response = response(200, "not-json") } }, function(_calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "getMe")
                test.eq(result.success, false)
                test.eq(result.error, "request failed")
                test.eq(result.status_code, 200)
            end)
            with_transport({ { response = response(200, '{"ok":false,"description":"bad request"}') } }, function(_calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "getMe")
                test.eq(result.error, "bad request")
            end)
        end)

        test.it("keeps GET query and POST JSON shapes unchanged across retries", function()
            with_transport({ { response = response(429) }, { response = response(200, '{"ok":true,"result":true}') } }, function(calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "getChat", { chat_id = "C 1" }, "GET")
                test.eq(result.success, true)
                test.eq(calls[1].method, "GET")
                test.is_true(calls[1].url:find("chat_id=C%201", 1, true) ~= nil)
                test.eq(calls[1].opts.body, "")
                test.eq(calls[1].opts.body, calls[2].opts.body)
            end)

            with_transport({ { response = response(429) }, { response = response(200, '{"ok":true,"result":true}') } }, function(calls, _sleeps)
                local result = api.request({ bot_token = "token" }, "sendMessage", { text = "hello" })
                test.eq(result.success, true)
                test.eq(calls[1].method, "POST")
                test.eq(calls[1].opts.body, '{"text":"hello"}')
                test.eq(calls[1].opts.body, calls[2].opts.body)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
