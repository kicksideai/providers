local test = require("test")

local sink = require("sink")

local CHANNEL = "chan1"

-- A fake transport recording each write against the single-attempt client
-- surface the sink uses.
local function new_fake(): any
    local fake: any = { sent = {}, edited = {}, deleted = {}, connect_ids = {} }
    function fake.connect(component_id: string?): (any, string?)
        fake.connect_ids[#fake.connect_ids + 1] = component_id
        return { component_id = component_id, bot_token = "t" }, nil
    end
    function fake.send_channel_message_once(_conn: any, channel_id: string, payload: any): any
        fake.sent[#fake.sent + 1] = { channel_id = channel_id, payload = payload }
        return { success = true, data = { id = "900", timestamp = "2026-06-05T10:00:00+00:00" } }
    end
    function fake.edit_channel_message_once(_conn: any, channel_id: string, message_id: string, payload: any): any
        fake.edited[#fake.edited + 1] = { channel_id = channel_id, message_id = message_id, payload = payload }
        return { success = true, data = { id = message_id, timestamp = "2026-06-05T10:00:00+00:00", edited_timestamp = "2026-06-06T09:00:00+00:00" } }
    end
    function fake.delete_channel_message(_conn: any, channel_id: string, message_id: string): any
        fake.deleted[#fake.deleted + 1] = { channel_id = channel_id, message_id = message_id }
        return { success = true }
    end
    return fake
end

local function write(fake: any, req: any): any
    local res = sink.write(req, { transport = fake })
    test.not_nil(res, "write returned nil")
    return res
end

local function base_req(over: any): any
    local req: any = {
        config = { connection_id = "conn1", channel_id = CHANNEL },
        sink_op = "upsert",
        input = { content = "hello" },
        identity_key = "discord:message:src",
        idempotency_key = "discord:message:src:1",
    }
    for k, v in pairs(type(over) == "table" and over or {}) do req[k] = v end
    return req
end

local function define_tests()
    test.describe("Discord message sink upsert", function()
        test.it("requires delivery keys before connecting", function()
            local fake = new_fake()
            local res = write(fake, base_req({ identity_key = false }))
            test.eq(res.error.code, "invalid_request")
            test.eq(#fake.connect_ids, 0)
        end)
        test.it("posts a new message when no dest_ref exists and returns it as the dest_ref", function()
            local fake = new_fake()
            local res = write(fake, base_req({}))
            test.eq(res.success, true)
            test.eq(res.result, "created")
            test.eq(res.dest_ref.channel_id, CHANNEL)
            test.eq(res.dest_ref.message_id, "900")
            test.eq(res.dest_version, "2026-06-05T10:00:00+00:00")
            test.eq(#fake.sent, 1)
            test.eq(fake.sent[1].channel_id, CHANNEL)
            test.eq(fake.sent[1].payload.content, "hello")
            test.eq(fake.connect_ids[1], "conn1", "the write connects through the configured connection")
        end)

        test.it("edits the dest_ref message in place on redelivery", function()
            local fake = new_fake()
            local res = write(fake, base_req({
                input = { content = "hello (edited)" },
                dest_ref = { channel_id = CHANNEL, message_id = "900" },
            }))
            test.eq(res.success, true)
            test.eq(res.result, "updated")
            test.eq(res.dest_ref.message_id, "900")
            test.eq(res.dest_version, "2026-06-06T09:00:00+00:00")
            test.eq(#fake.sent, 0, "an edit never posts a second message")
            test.eq(fake.edited[1].message_id, "900")
            test.eq(fake.edited[1].payload.content, "hello (edited)")
        end)

        test.it("reads the dest_refs.default alias when dest_ref is absent", function()
            local fake = new_fake()
            local res = write(fake, base_req({
                dest_refs = { default = { dest_ref = { channel_id = CHANNEL, message_id = "901" } } },
            }))
            test.eq(res.result, "updated")
            test.eq(fake.edited[1].message_id, "901")
        end)

        test.it("surfaces an edit refusal instead of falling back to a new post", function()
            local fake: any = new_fake()
            function fake.edit_channel_message_once(_conn: any, _channel_id: string, _message_id: string, _payload: any): any
                return { success = false, error = "forbidden", status_code = 403 }
            end
            local res = write(fake, base_req({ dest_ref = { message_id = "900" } }))
            test.eq(res.success, false)
            test.eq(res.error.code, "permission_denied")
            test.is_nil(res.result, "a failed write carries no effect")
            test.eq(#fake.sent, 0, "a refused edit must not post a duplicate")
        end)

        test.it("requires content and refuses content past the message cap", function()
            local fake = new_fake()
            local missing = write(fake, base_req({ input = {} }))
            test.eq(missing.error.code, "invalid_request")

            local long = write(fake, base_req({ input = { content = string.rep("x", 2001) } }))
            test.eq(long.error.code, "invalid_request")
            test.eq(#fake.sent, 0)
        end)
    end)

    test.describe("Discord message sink delete", function()
        test.it("deletes the dest_ref message, honoring the dest_ref channel", function()
            local fake = new_fake()
            local res = write(fake, base_req({
                sink_op = "delete",
                input = { item_key = "discord:message:src:1", dedup_key = "discord:message:src:1" },
                dest_ref = { channel_id = "other-channel", message_id = "900" },
            }))
            test.eq(res.success, true)
            test.eq(res.result, "deleted")
            test.eq(fake.deleted[1].channel_id, "other-channel")
            test.eq(fake.deleted[1].message_id, "900")
        end)

        test.it("treats an already-removed message as deleted (idempotent)", function()
            local fake: any = new_fake()
            function fake.delete_channel_message(_conn: any, _channel_id: string, _message_id: string): any
                return { success = false, error = "not found", status_code = 404 }
            end
            local res = write(fake, base_req({ sink_op = "delete", dest_ref = { message_id = "900" } }))
            test.eq(res.success, true)
            test.eq(res.result, "deleted")
        end)

        test.it("refuses a delete without a dest_ref", function()
            local fake = new_fake()
            local res = write(fake, base_req({ sink_op = "delete" }))
            test.eq(res.success, false)
            test.eq(res.error.code, "invalid_request")
            test.eq(#fake.deleted, 0)
        end)
    end)

    test.describe("Discord message sink envelope", function()
        test.it("surfaces a 429 as rate_limited with retry_after_ms for the engine pacing", function()
            local fake: any = new_fake()
            function fake.send_channel_message_once(_conn: any, _channel_id: string, _payload: any): any
                return { success = false, error = "rate limited", status_code = 429, retry_after_ms = 3000 }
            end
            local res = write(fake, base_req({}))
            test.eq(res.success, false)
            test.eq(res.error.code, "rate_limited")
            test.eq(res.error.retriable, true)
            test.eq(res.retry_after_ms, 3000)
        end)

        test.it("requires channel_id in the sink config", function()
            local res = write(new_fake(), base_req({ config = { connection_id = "conn1" } }))
            test.eq(res.error.code, "invalid_config")
        end)

        test.it("defaults the operation to upsert and refuses unknown operations", function()
            local fake = new_fake()
            local res = write(fake, base_req({ sink_op = nil }))
            test.eq(res.result, "created")

            local unknown = write(fake, base_req({ sink_op = "archive" }))
            test.eq(unknown.error.code, "invalid_request")
        end)

        test.it("preserves a refused connection as a typed error", function()
            local fake = new_fake()
            local failure = errors.new({kind = errors.PERMISSION_DENIED, message = "connection revoked"})
            function fake.connect(_component_id: string?): (any?, error?) return nil, failure end
            local result, err = sink.write(base_req({}), {transport = fake})
            test.is_nil(result)
            test.eq(err, failure)
        end)

        test.it("preserves typed send, edit, and delete failures", function()
            local failure = errors.new({kind = errors.UNAVAILABLE, message = "Discord transport failed"})
            for _, operation in ipairs({"send", "edit", "delete"}) do
                local fake = new_fake()
                local req = base_req({})
                local method = "send_channel_message_once"
                if operation ~= "send" then req.dest_ref = {channel_id = CHANNEL, message_id = "900"} end
                if operation == "edit" then method = "edit_channel_message_once" end
                if operation == "delete" then method = "delete_channel_message"; req.sink_op = "delete" end
                fake[method] = function(): (any?, error?) return nil, failure end
                local result, err = sink.write(req, {transport = fake})
                test.is_nil(result)
                test.eq(err, failure)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
