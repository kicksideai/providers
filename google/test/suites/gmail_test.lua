local test = require("test")
local gmail = require("gmail")

local function define_tests()
    test.describe("Gmail service", function()
        test.it("encodes an RFC822 message with headers and body", function()
            local raw = gmail._encode_rfc822({
                to = "alice@example.com",
                subject = "Hi",
                body = "Hello there",
            })
            test.ok(raw:find("To: alice@example.com", 1, true) ~= nil)
            test.ok(raw:find("Subject: Hi", 1, true) ~= nil)
            test.ok(raw:find("Content-Type: text/plain", 1, true) ~= nil)
            test.ok(raw:find("Hello there", 1, true) ~= nil)
        end)

        test.it("encodes deterministic idempotency headers on drafts", function()
            local raw = gmail._encode_rfc822({
                to = "recipient@example.test",
                subject = "Review",
                body = "Approved",
                message_id = "<wippy-digest@draft.local>",
                idempotency_digest = "content-digest",
            })
            test.ok(raw:find("Message-ID: <wippy-digest@draft.local>", 1, true) ~= nil)
            test.ok(raw:find("X-Wippy-Idempotency-Digest: content-digest", 1, true) ~= nil)
        end)

        test.it("prefers an HTML body and marks the content type", function()
            local raw = gmail._encode_rfc822({ to = "a@b.c", html = "<p>x</p>", body = "ignored" })
            test.ok(raw:find("Content-Type: text/html", 1, true) ~= nil)
            test.ok(raw:find("<p>x</p>", 1, true) ~= nil)
            test.ok(raw:find("ignored", 1, true) == nil)
        end)

        test.it("base64url-encodes without padding or url-unsafe chars", function()
            local enc = gmail._encode_base64url("subjects?>>")
            test.ok(enc:find("=", 1, true) == nil)
            test.ok(enc:find("+", 1, true) == nil)
            test.ok(enc:find("/", 1, true) == nil)
        end)

        test.it("round-trips base64url decode of an encoded payload", function()
            local original = "Hello, Gmail! +/="
            local decoded = gmail.decode_base64url(gmail._encode_base64url(original))
            test.eq(decoded, original)
        end)

        test.it("reads a header case-insensitively", function()
            local headers = { { name = "Subject", value = "Weekly" }, { name = "From", value = "x@y.z" } }
            test.eq(gmail.get_header(headers, "subject"), "Weekly")
            test.eq(gmail.get_header(headers, "FROM"), "x@y.z")
            test.is_nil(gmail.get_header(headers, "Cc"))
        end)

        test.it("extracts a plain-text body from a multipart payload", function()
            local payload = {
                parts = {
                    { mimeType = "text/html", body = { data = gmail._encode_base64url("<b>hi</b>") } },
                    { mimeType = "text/plain", body = { data = gmail._encode_base64url("plain hi") } },
                },
            }
            test.eq(gmail.extract_text_body(payload), "plain hi")
        end)

        test.it("returns the complete message body in the message record", function()
            local body = string.rep("abcdefgh", 2000)
            local message = {
                id = "message-1",
                threadId = "thread-1",
                payload = { headers = { { name = "To", value = "bob@example.test" } }, body = { data = gmail._encode_base64url(body) } },
            }
            local record: any = gmail.message_record(message)
            test.eq(record.id, "message-1")
            test.eq(record.threadId, "thread-1")
            test.eq(record.to, "bob@example.test")
            test.eq(record.body, body)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
