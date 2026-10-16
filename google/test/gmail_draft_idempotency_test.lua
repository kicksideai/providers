local sink = require("sink")
local test = require("test")

local function fake()
    local state: any = { calls = {} }
    local transport = {}
    function transport.connect(id)
        state.calls[#state.calls + 1] = { op = "connect", id = id }
        return {}, nil
    end
    local gmail = {}
    function gmail.get_header(headers, name)
        for _, header in ipairs(headers or {}) do
            if tostring(header.name):lower() == name:lower() then return header.value end
        end
    end
    function gmail.find_draft_by_message_id(_, message_id)
        state.calls[#state.calls + 1] = { op = "find", message_id = message_id }
        return { success = true, data = state.recovered }
    end
    function gmail.create_draft(_, message)
        state.calls[#state.calls + 1] = { op = "create", message = message }
        return { success = true, data = { id = "draft-created", message = { threadId = "thread-created" } } }
    end
    return state, { transport = transport, gmail = gmail }
end

local function request(body)
    return {
        config = { connection_id = "google-test" },
        sink_op = "create",
        identity_key = "approval",
        idempotency_key = "approval-test",
        input = { to = "recipient@example.test", subject = "Review", body = body },
    }
end

local function define()
    test.describe("Gmail draft create idempotency", function()
        test.it("stamps a deterministic identity and creates once", function()
            local state, deps = fake()
            local result = sink.write(request("Approved"), deps)
            test.eq(result.success, true)
            test.eq(result.dest_ref.draft_id, "draft-created")
            test.eq(state.calls[2].op, "find")
            test.eq(state.calls[3].op, "create")
            test.ok(state.calls[3].message.message_id:find("@draft.local>", 1, true) ~= nil)
            test.ok(state.calls[3].message.idempotency_digest ~= "")
        end)

        test.it("recovers the provider draft after an interrupted acknowledgement", function()
            local state, deps = fake()
            sink.write(request("Approved"), deps)
            local created = state.calls[3].message
            state.recovered = {
                id = "draft-recovered",
                message = {
                    threadId = "thread-recovered",
                    payload = {
                        headers = {
                            { name = "X-Wippy-Idempotency-Digest", value = created.idempotency_digest },
                        },
                    },
                },
            }
            local replay = sink.write(request("Approved"), deps)
            test.eq(replay.success, true)
            test.eq(replay.replayed, true)
            test.eq(replay.result, "replayed")
            test.eq(replay.dest_ref.draft_id, "draft-recovered")
            test.eq(#state.calls, 5)
        end)

        test.it("rejects the same key with a different payload", function()
            local state, deps = fake()
            state.recovered = {
                id = "draft-existing",
                message = {
                    payload = {
                        headers = {
                            { name = "X-Wippy-Idempotency-Digest", value = "different" },
                        },
                    },
                },
            }
            local result = sink.write(request("Approved"), deps)
            test.eq(result.success, false)
            test.eq(result.error.retriable, false)
        end)
    end)
end

local cases = test.run_cases(define)
return { run = function(options) return cases(options) end }
