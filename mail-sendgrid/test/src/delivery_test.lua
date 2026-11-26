-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local registry = require("registry")
local fixture = require("fixture")
local cases = require("cases")

return {run = test.run_cases(function()
    test.describe("Sendgrid delivery policy", function()
        local owner
        test.before_each(function()
            owner = cases.configured_sender()
        end)

        local status_cases = {
            {400, errors.INVALID, "message_rejected", false},
            {401, errors.PERMISSION_DENIED, "authorization_refused", false},
            {403, errors.PERMISSION_DENIED, "authorization_refused", false},
            {413, errors.INVALID, "message_rejected", false},
            {429, errors.RATE_LIMITED, "rate_limited", true},
            {500, errors.UNAVAILABLE, "provider_unavailable", true},
            {503, errors.UNAVAILABLE, "provider_unavailable", true},
            {200, errors.INTERNAL, "provider_rejected", false},
        }
        for _, case in ipairs(status_cases) do
            local subject = "HTTP " .. case[1]
            test.it("classifies " .. subject, function()
                local input = cases.fixture_message(subject)
                local result, err = cases.transport(input)
                test.is_nil(result)
                test.not_nil(err)
                test.eq(case[2], err:kind())
                test.eq(case[3], err:details().code)
                test.eq(case[1], err:details().status)
                test.eq(case[4], err:retryable())
                test.eq(1, #cases.requests("POST", input.subject))
            end)
        end

        test.it("preserves ambiguous authorization failures and restricts the provider reason to log administrators", function()
            local input = cases.fixture_message("Plan allowance")
            local result, err = cases.transport({to = input.to, subject = input.subject, text = input.text})
            test.is_nil(result)
            test.not_nil(err)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq("authorization_refused", err:details().code)
            test.eq(401, err:details().status)
            test.eq("Maximum credits exceeded", err:details().provider_detail)
            test.is_false(err:retryable())
            local queued = assert(cases.send(owner, input))
            local sender_log = fixture.await_message(owner, queued.message_id, function(message)
                return message.status == "failed"
            end)
            test.eq("failed", sender_log.status)
            test.eq("provider_rejected", sender_log.last_error.code)
            test.is_nil(sender_log.last_error.provider_detail)
            local admin_log = assert(fixture.probe(fixture.delivery_admin(), "get_message", {message_id = queued.message_id}))
            test.eq("authorization_refused", admin_log.last_error.code)
            test.eq("Maximum credits exceeded", admin_log.last_error.provider_detail)
            test.eq(2, #cases.requests("POST", input.subject))
        end)

        test.it("preserves an unverified sender diagnostic in an ambiguous 403", function()
            local input = cases.fixture_message("Unverified sender")
            local result, err = cases.transport({to = input.to, subject = input.subject, text = input.text})
            test.is_nil(result)
            test.eq(errors.PERMISSION_DENIED, assert(err):kind())
            test.eq("authorization_refused", err:details().code)
            test.eq("The from address does not match a verified Sender Identity.", err:details().provider_detail)
            test.is_false(err:retryable())
        end)

        test.it("validates and normalizes attachment names from both input and Uploads", function()
            local function upload(name)
                return assert(fixture.probe(owner, "store", {
                    bytes = "data", filename = name, content_type = "text/plain",
                })).uuid
            end
            local stored = upload("folder/résumé.txt")
            local bad = upload("invalid\nname.txt")
            for _, ref in ipairs({{upload_id = bad}, {upload_id = stored, filename = "bad\rname.txt"},
                {upload_id = stored, filename = string.rep("é", 128)}}) do
                local input = cases.fixture_message("Invalid filename")
                input.attachments = {ref}
                local result, err = cases.send(owner, input)
                test.is_nil(result)
                test.eq(errors.INVALID, err:kind())
                test.eq("invalid_attachment_filename", err:details().code)
                test.eq(0, #cases.requests("POST", input.subject))
            end
            local input = cases.fixture_message("Normalized filenames")
            input.attachments = {{upload_id = stored}, {upload_id = stored, filename = "C:\\dir\\notes.txt"},
                {upload_id = stored, filename = ""}}
            local queued = assert(cases.send(owner, input))
            local logged = fixture.terminal(owner, queued.message_id)
            local definition = assert(registry.get("kickside.mail:mailer"))
            for _, method in ipairs(definition.data.methods) do
                if method.name == "get_message" then
                    local schema = assert(json.decode(method.output_schemas[1].definition))
                    local valid, validation_err = json.validate(schema, logged)
                    test.is_true(valid, tostring(validation_err))
                end
            end
            local files = cases.requests("POST", input.subject)[1].payload.attachments
            test.eq(4, #files)
            test.eq("mail-library-logo", files[4].content_id)
            test.eq("résumé.txt", files[1].filename)
            test.eq("notes.txt", files[2].filename)
            test.eq("attachment", files[3].filename)
        end)

        test.it("requires a To recipient before egress", function()
            local input = cases.fixture_message("Bcc only")
            input.bcc, input.to = input.to, nil
            local result, err = cases.send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("recipient_required", err:details().code)
            test.is_false(err:retryable())
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
