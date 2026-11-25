-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local cases = require("cases")

return {run = test.run_cases(function()
    test.describe("Mailgun delivery policy", function()
        local owner
        test.before_each(function()
            owner = cases.configured_sender()
        end)

        test.it("refuses an upload whose encoding exceeds the driver's message limit", function()
            local bytes = string.rep("x", 19000000)
            local upload = assert(fixture.probe(owner, "store", {
                bytes = bytes, filename = "large.txt", content_type = "text/plain",
            }))
            local input = cases.fixture_message("Too large after encoding")
            input.attachments = {{upload_id = upload.uuid}}
            local result, err = cases.send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("message_too_large", err:details().code)
            test.eq("max_message_bytes", err:details().limit)
            test.eq(25000000, err:details().maximum)
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("requires a sending domain before egress", function()
            test.is_true(cases.configure({["kickside.mail.mailgun"] = {domain = ""}}).success)
            local status = assert(cases.mailgun_status(assert(fixture.probe(cases.delivery_admin(), "delivery_status"))))
            test.is_false(status.ready)
            test.eq("sending_domain_required", status.code)
            test.is_true(type(status.reason) == "string" and #status.reason > 0)
            local input = cases.fixture_message("Missing sending domain")
            local result, err = cases.send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("sends using a valid domain changed in Settings", function()
            test.is_true(cases.configure({["kickside.mail.mailgun"] = {domain = "other.example.org"}}).success)
            local status = assert(cases.mailgun_status(assert(fixture.probe(cases.delivery_admin(), "delivery_status"))))
            test.is_true(status.ready, status.reason)
            local input = cases.fixture_message("Changed sending domain")
            local result = assert(cases.send(owner, input))
            local delivered = fixture.terminal(fixture.delivery_admin(), result.message_id)
            local captured = cases.requests("POST", input.subject)
            test.eq(1, #captured)
            test.eq("/v3/other.example.org/messages", captured[1].path)
            test.eq(captured[1].id, delivered.provider_message_id)
            test.eq("Hello", captured[1].values.text)
            test.not_nil(captured[1].values.html:find("Hello</pre>", 1, true))
        end)

        test.it("rejects invalid Settings writes and keeps the last valid delivery destination", function()
            local input = cases.fixture_message("Invalid sender settings")
            local invalid_domain = cases.configure({["kickside.mail.mailgun"] = {domain = "mail.example.org/../test"}})
            test.is_false(invalid_domain.success)
            local invalid = cases.configure({["kickside.mail.mailgun"] = {region = "other"}})
            test.is_false(invalid.success)
            test.eq(0, #cases.requests("POST", input.subject))
            local available = assert(fixture.probe(fixture.admin(), "status"))
            test.is_true(available.ready)
            local queued = assert(cases.send(owner, input))
            fixture.terminal(owner, queued.message_id)
            local captured = cases.requests("POST", input.subject)
            test.eq(1, #captured)
            test.eq("/v3/mail.example.org/messages", captured[1].path)
        end)

        test.it("requires a To recipient before egress", function()
            local input = cases.fixture_message("Bcc only")
            input.bcc, input.to = input.to, nil
            local result, err = cases.send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("recipient_required", err:details().code)
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("rejects duplicate inline content IDs before egress", function()
            local file = assert(fixture.probe(owner, "store", {bytes = "image", filename = "chart.png", content_type = "image/png"}))
            local input = cases.fixture_message("Duplicate inline IDs")
            input.attachments = {
                {upload_id = file.uuid, disposition = "inline", content_id = "chart"},
                {upload_id = file.uuid, disposition = "inline", content_id = "CHART"},
            }
            local result, err = cases.send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_content_id", err:details().code)
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("refuses callers without the send capability before egress", function()
            local input = cases.fixture_message("Denied sender")
            local result, err = cases.send(fixture.user(nil, false), input)
            test.is_nil(result)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("refuses callers without READ on the upload before egress", function()
            local upload = assert(fixture.probe(fixture.user(), "store", {
                bytes = "secret", filename = "private.txt", content_type = "text/plain",
            }))
            local input = cases.fixture_message("Denied upload")
            input.attachments = {{upload_id = upload.uuid}}
            local result, err = cases.send(owner, input)
            test.is_nil(result)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq("access_denied", err:details().code)
            test.eq(0, #cases.requests("POST", input.subject))
        end)

    end)
end)}
