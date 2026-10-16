local test = require("test")
local sink = require("sink")
local writer = require("writer")

local function request(overrides: any?): any
    local req: any = { origin = "automation-1", identity_key = "item-1", idempotency_key = "delivery-1",
        sink_op = "upsert", config = { connection_id = "connection-1", chat_id = "chat-1" }, input = { content = "Hello" } }
    for key, value in pairs(overrides or {}) do req[key] = value end
    return req
end

local function deps(result: any?, request_err: error?): (any, { any })
    local calls: { any } = {}
    return { transport = { connect_write = function(id: string)
        test.eq(id, "connection-1")
        return { bot_token = "private" }, nil
    end }, api = { request_once = function(_conn: any, method: string, params: any)
        calls[#calls + 1] = { method = method, params = params }
        if result == nil and request_err == nil then
            return { success = true, data = { message_id = 42 } }
        end
        return result, request_err
    end } }, calls
end

local function define_tests()
    test.describe("Telegram writable message sink", function()
        test.it("posts source content and returns the created reference in both contract slots", function()
            local d, calls = deps()
            local result = sink.write(request(), d)
            test.is_true(result.success)
            test.eq(result.result, "created")
            test.eq(result.dest_ref.chat_id, "chat-1")
            test.eq(result.dest_ref.message_id, "42")
            test.eq(result.dest_refs.default.dest_ref.message_id, "42")
            test.eq(#calls, 1)
            test.eq(calls[1].method, "sendMessage")
            test.eq(calls[1].params.text, "Hello")
        end)
        test.it("edits the selected map slot without creating another message", function()
            local d, calls = deps()
            local result = sink.write(request({ map_slot = "second", dest_refs = {
                default = { dest_ref = { chat_id = "wrong", message_id = "1" } },
                second = { dest_ref = { chat_id = "chat-2", message_id = "2" } },
            } }), d)
            test.eq(result.result, "updated")
            test.eq(calls[1].method, "editMessageText")
            test.eq(calls[1].params.chat_id, "chat-2")
            test.eq(calls[1].params.message_id, "2")
            test.eq(result.dest_refs.second.dest_ref.message_id, "2")
        end)
        test.it("deletes the referenced message", function()
            local d, calls = deps()
            local result = sink.write(request({ sink_op = "delete", dest_ref = { message_id = "3" } }), d)
            test.eq(result.result, "deleted")
            test.eq(calls[1].method, "deleteMessage")
            test.eq(calls[1].params.message_id, "3")
        end)
        test.it("requires a destination reference for deletion", function()
            local d, calls = deps()
            local result = sink.write(request({ sink_op = "delete" }), d)
            test.eq(result.error.code, "invalid_request")
            test.eq(#calls, 0)
        end)
        test.it("refuses oversized messages without splitting them", function()
            local d, calls = deps()
            local result = sink.write(request({ input = { content = string.rep("x", 4097) } }), d)
            test.eq(result.error.code, "invalid_request")
            test.eq(#calls, 0)
        end)
        test.it("requires origin, delivery identity and valid configuration", function()
            for _, over in ipairs({ { origin = "" }, { idempotency_key = "" }, { identity_key = "" },
                { config = {} }, { input = {} }, { sink_op = "unknown" },
                { origin = "automation-1", automation_ref = { id = "automation-2" } } }) do
                local d, calls = deps()
                local result = sink.write(request(over), d)
                test.is_false(result.success)
                test.is_false(result.error.retriable)
                test.eq(#calls, 0)
            end
        end)
        test.it("surfaces connection WRITE refusal before a Bot API request", function()
            local d, calls = deps()
            d.transport.connect_write = function() return nil, "connection write denied" end
            local result = sink.write(request(), d)
            test.is_false(result.success)
            test.eq(result.error.code, "permission_denied")
            test.eq(#calls, 0)
        end)
        test.it("returns provider rate limits for engine scheduling", function()
            local d, calls = deps({ success = false, status_code = 429, error = "slow down", retry_after_ms = 7000 })
            local result = sink.write(request(), d)
            test.eq(result.error.code, "rate_limited")
            test.eq(result.retry_after_ms, 7000)
            test.is_true(result.error.retriable)
            test.eq(#calls, 1)
        end)
        test.it("classifies authorization and provider failures", function()
            for _, expected in ipairs({ { status = 401, code = "auth_expired", retry = false },
                { status = 403, code = "permission_denied", retry = false },
                { status = 500, code = "provider_unavailable", retry = true } }) do
                local d = deps({ success = false, status_code = expected.status, error = "upstream failure" })
                local result = sink.write(request(), d)
                test.eq(result.error.code, expected.code)
                test.eq(result.error.retriable, expected.retry)
            end
        end)
        test.it("returns typed transport errors through the published sink", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "Telegram transport reset" })
            local d = deps(nil, failure)
            local value, err = sink.write(request(), d)
            test.is_nil(value)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(tostring(err), "transport reset")

            local forwarded, forwarded_err = writer.write(request(), d)
            test.is_nil(forwarded)
            test.is_true(errors.is(forwarded_err, errors.UNAVAILABLE))
            test.contains(tostring(forwarded_err), "transport reset")
        end)
        test.it("refuses creation results without a message identity", function()
            local d = deps({ success = true, data = {} })
            local result = sink.write(request(), d)
            test.is_false(result.success)
            test.eq(result.error.code, "provider_error")
        end)
    end)
end
return { run = test.run_cases(define_tests) }
