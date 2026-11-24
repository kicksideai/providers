-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local fs = require("fs")
local base64 = require("base64")
local json = require("json")
local registry = require("registry")
local fixture = require("fixture")

local function configure(settings)
    return assert(fixture.probe(fixture.admin(), "configure", {settings = settings}))
end

local function send(actor, message)
    return fixture.probe(actor, "send", {message = message})
end

local function transport(input)
    input.from = {address = "sender@example.org"}
    return fixture.probe(fixture.admin(), "transport", {message = input})
end

local function fixture_message(subject)
    return {to = {"recipient@example.org"}, subject = subject .. " " .. uuid.v4(), text = "Hello"}
end

local function requests(method, subject)
    local volume = assert(fs.get("app:sendgrid_requests"))
    local matches = {}
    for file in assert(volume:readdir(".")) do
        local request = assert(json.decode(assert(volume:readfile(file.name))))
        if request.method == method and (not subject or (request.payload and request.payload.subject == subject)) then
            matches[#matches + 1] = request
        end
    end
    return matches
end

local function library_logo()
    local assets = assert(fs.get("kickside.mail.views:asset_files"))
    return assert(base64.encode(assert(assets:readfile("logo.png"))))
end

return {run = test.run_cases(function()
    test.describe("SendGrid transport via real Settings and Uploads", function()
        test.it("publishes the sendgrid settings-backed driver descriptor", function()
            local entry = assert(registry.get("kickside.mail.sendgrid:driver"))
            test.eq("kickside.mail:driver", entry.meta.type)
            test.eq("sendgrid", entry.data.id)
            test.eq(1000, entry.data.max_recipients)
            test.eq(29999999, entry.data.max_message_bytes)
            test.eq("kickside.mail.sendgrid:transport", entry.data.binding)
            test.eq("kickside.mail.sendgrid", entry.data.settings_ns)
        end)

        local owner
        test.before_each(function()
            owner = fixture.user()
            local configured = configure({
                ["kickside.mail"] = {driver = "sendgrid", from_address = "sender@example.org",
                    from_name = 'Support, "North"', reply_to = "default@example.org"},
                ["kickside.mail.sendgrid"] = {api_key = "sg_fixture"},
            })
            test.is_true(configured.success, configured.error)
        end)

        test.it("sends the exact request for a notice and reads the ID from the empty 202 response", function()
            local pdf = assert(fixture.probe(owner, "store", {bytes = "pdf\0bytes", filename = "source.pdf", content_type = "application/pdf"}))
            local png = assert(fixture.probe(owner, "store", {bytes = "\137PNG\0\255", filename = "logo.png", content_type = "image/png"}))
            local result, err = send(owner, {
                to = {"to@example.org", "second@example.org"}, cc = {"cc@example.org"}, bcc = {"bcc@example.org"},
                reply_to = "reply@example.org", template = "notice",
                vars = {subject = "Status & progress", message = "Ready", inline_content_id = "logo"},
                idempotency_key = uuid.v4(),
                attachments = {{upload_id = pdf.uuid, filename = "report.pdf"}, {
                    upload_id = png.uuid, disposition = "inline", content_id = "logo",
                }},
            })
            assert(result, tostring(err))
            local volume = assert(fs.get("app:sendgrid_requests"))
            test.eq("queued", result.status)
            local delivered = fixture.terminal(fixture.admin(), result.message_id)
            local captured = assert(json.decode(assert(volume:readfile(delivered.provider_message_id .. ".json"))))
            test.eq("POST", captured.method)
            test.eq("Bearer sg_fixture", captured.authorization)
            test.eq("application/json", captured.content_type)
            test.is_true(captured.idempotency_key == nil or captured.idempotency_key == "")
            local body = captured.payload.content[#captured.payload.content].value
            test.not_nil(body:find("<title>Status &amp; progress</title>", 1, true))
            test.not_nil(body:find("Ready</p>", 1, true))
            test.not_nil(body:find('src="cid:logo"', 1, true))
            test.not_nil(body:find(">Example Workspace</strong>", 1, true))
            test.not_nil(body:find('src="cid:mail-library-logo"', 1, true))
            test.eq(3, #captured.payload.attachments)
            local expected = {
                from = {email = "sender@example.org", name = 'Support, "North"'},
                personalizations = {{
                    to = {{email = "to@example.org"}, {email = "second@example.org"}},
                    cc = {{email = "cc@example.org"}}, bcc = {{email = "bcc@example.org"}},
                }},
                reply_to = {email = "reply@example.org"},
                subject = "Status & progress",
                content = {
                    {type = "text/plain", value = "Ready\n\nNotice image\n\nExample Workspace\n"},
                    {type = "text/html", value = body},
                },
                attachments = {
                    {filename = "report.pdf", type = "application/pdf", content = "cGRmAGJ5dGVz", disposition = "attachment"},
                    {filename = "logo.png", type = "image/png", content = "iVBORwD/", disposition = "inline", content_id = "logo"},
                    {filename = "logo.png", type = "image/png", content = library_logo(), disposition = "inline", content_id = "mail-library-logo"},
                },
            }
            test.eq(assert(json.encode(expected)), assert(json.encode(captured.payload)))
        end)

        test.it("uses the configured From and omits empty optional fields", function()
            local input = fixture_message("HTML only")
            input.cc, input.bcc = {}, {}
            input.text, input.html = "", "<p>Hello</p>"
            test.is_true(configure({["kickside.mail"] = {from_name = "", reply_to = ""}}).success)
            local queued = assert(send(owner, input))
            test.eq("queued", queued.status)
            fixture.terminal(owner, queued.message_id)
            local captured = requests("POST", input.subject)[1].payload
            test.eq("sender@example.org", captured.from.email)
            test.is_nil(captured.from.name)
            test.is_nil(captured.personalizations[1].cc)
            test.is_nil(captured.personalizations[1].bcc)
            test.is_nil(captured.reply_to)
            test.eq(1, #captured.attachments)
            test.eq("mail-library-logo", captured.attachments[1].content_id)
            test.eq(1, #captured.content)
            test.eq("text/html", captured.content[1].type)
        end)

        test.it("reports credential availability and refuses unset credentials before egress", function()
            local admin = fixture.admin()
            local available = assert(fixture.probe(admin, "available"))
            test.is_true(available.available)
            local values = assert(fixture.probe(owner, "read_settings"))
            test.is_nil(values.api_key)
            test.is_true(configure({["kickside.mail.sendgrid"] = {api_key = ""}}).success)
            local unavailable = assert(fixture.probe(admin, "available"))
            test.is_false(unavailable.available)
            test.eq("api_key_required", unavailable.code)
            test.eq("Add a SendGrid API key to send mail.", unavailable.reason)
            local input = fixture_message("Unconfigured driver")
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.is_false(err:retryable())
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("carries the provider retry hint on rate limiting", function()
            local _, err = transport(fixture_message("Retry hint"))
            test.eq(errors.RATE_LIMITED, err:kind())
            test.is_true(err:retryable())
            local delay = err:details().retry_after_ms
            test.not_nil(delay)
            test.is_true(delay >= 115000 and delay <= 120000)
        end)

        test.it("carries bounded provider text without credentials or controls", function()
            local result, err = transport(fixture_message("Unsafe provider detail"))
            test.is_nil(result)
            test.eq("message_rejected", err:details().code)
            local detail = err:details().provider_detail
            test.not_nil(detail)
            test.not_nil(detail:find("Fixture refusal", 1, true))
            test.is_nil(detail:find("sg_fixture", 1, true))
            test.is_nil(detail:find("YXBpOm1nX2ZpeHR1cmU=", 1, true))
            test.is_nil(detail:find("%c"))
            test.is_true(#detail <= 512)
        end)

        test.it("marks an accepted 202 without a provider ID as sent", function()
            local input = fixture_message("HTTP 202")
            local queued = assert(send(owner, input))
            local delivered = fixture.terminal(fixture.admin(), queued.message_id)
            test.eq("sent", delivered.status)
            test.not_nil(delivered.sent_at)
            test.is_nil(delivered.provider_message_id)
            test.eq(1, #requests("POST", input.subject))
        end)

        local cases = {
            {400, errors.INVALID, "message_rejected", false},
            {401, errors.PERMISSION_DENIED, "authorization_refused", false},
            {403, errors.PERMISSION_DENIED, "authorization_refused", false},
            {413, errors.INVALID, "message_rejected", false},
            {429, errors.RATE_LIMITED, "rate_limited", true},
            {500, errors.UNAVAILABLE, "provider_unavailable", true},
            {503, errors.UNAVAILABLE, "provider_unavailable", true},
            {200, errors.INTERNAL, "provider_rejected", false},
        }
        for _, case in ipairs(cases) do
            local subject = "HTTP " .. case[1]
            test.it("classifies " .. subject, function()
                local input = fixture_message(subject)
                local result, err = transport(input)
                test.is_nil(result)
                test.not_nil(err)
                test.eq(case[2], err:kind())
                test.eq(case[3], err:details().code)
                test.eq(case[1], err:details().status)
                test.eq(case[4], err:retryable())
                test.eq(1, #requests("POST", input.subject))
            end)
        end

        test.it("preserves ambiguous authorization failures and restricts the provider reason to log administrators", function()
            local input = fixture_message("Plan allowance")
            local result, err = transport({to = input.to, subject = input.subject, text = input.text})
            test.is_nil(result)
            test.not_nil(err)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq("authorization_refused", err:details().code)
            test.eq(401, err:details().status)
            test.eq("The mail service refused authorization", err:message())
            test.eq("Maximum credits exceeded", err:details().provider_detail)
            test.is_false(err:retryable())
            local queued = assert(send(owner, input))
            local deadline = time.now():add(25 * time.SECOND):unix_nano()
            local sender_log
            repeat
                sender_log = assert(fixture.probe(owner, "get_message", {message_id = queued.message_id}))
                if sender_log.status == "failed" then break end
                time.sleep("25ms")
            until time.now():unix_nano() >= deadline
            test.eq("failed", sender_log.status)
            test.eq("provider_rejected", sender_log.last_error.code)
            test.is_nil(sender_log.last_error.provider_detail)
            local admin_log = assert(fixture.probe(fixture.admin(), "get_message", {message_id = queued.message_id}))
            test.eq("authorization_refused", admin_log.last_error.code)
            test.eq("Maximum credits exceeded", admin_log.last_error.provider_detail)
            test.eq(2, #requests("POST", input.subject))
        end)

        test.it("preserves an unverified sender diagnostic in an ambiguous 403", function()
            local input = fixture_message("Unverified sender")
            local result, err = transport({to = input.to, subject = input.subject, text = input.text})
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
                local input = fixture_message("Invalid filename")
                input.attachments = {ref}
                local result, err = send(owner, input)
                test.is_nil(result)
                test.eq(errors.INVALID, err:kind())
                test.eq("invalid_attachment_filename", err:details().code)
                test.eq(0, #requests("POST", input.subject))
            end
            local input = fixture_message("Normalized filenames")
            input.attachments = {{upload_id = stored}, {upload_id = stored, filename = "C:\\dir\\notes.txt"},
                {upload_id = stored, filename = ""}}
            local queued = assert(send(owner, input))
            local logged = fixture.terminal(owner, queued.message_id)
            local definition = assert(registry.get("kickside.mail:mailer"))
            for _, method in ipairs(definition.data.methods) do
                if method.name == "get_message" then
                    local schema = assert(json.decode(method.output_schemas[1].definition))
                    local valid, validation_err = json.validate(schema, logged)
                    test.is_true(valid, tostring(validation_err))
                end
            end
            local files = requests("POST", input.subject)[1].payload.attachments
            test.eq(4, #files)
            test.eq("mail-library-logo", files[4].content_id)
            test.eq("résumé.txt", files[1].filename)
            test.eq("notes.txt", files[2].filename)
            test.eq("attachment", files[3].filename)
        end)

        test.it("requires a To recipient before egress", function()
            local input = fixture_message("Bcc only")
            input.bcc, input.to = input.to, nil
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("recipient_required", err:details().code)
            test.is_false(err:retryable())
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("refuses callers without the send capability before egress", function()
            local input = fixture_message("Denied sender")
            local result, err = send(fixture.user(nil, false), input)
            test.is_nil(result)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("refuses callers without READ on the upload before egress", function()
            local upload = assert(fixture.probe(fixture.user(), "store", {
                bytes = "secret", filename = "private.txt", content_type = "text/plain",
            }))
            local input = fixture_message("Denied upload")
            input.attachments = {{upload_id = upload.uuid}}
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq("access_denied", err:details().code)
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("writes once to SendGrid through the at-least-once destination", function()
            local binding = assert(registry.get("kickside.mail.sink:writable"))
            test.eq("at_least_once", binding.meta.delivery)
            local input = fixture_message("Automation")
            local request = {
                config = {}, sink_op = "create", input = input,
                identity_key = "record-1", idempotency_key = uuid.v4(), origin = "automation-1",
            }
            local result = assert(fixture.probe(owner, "write", {request = request}))
            test.is_true(result.success, result.error and result.error.message)
            test.eq("created", result.result)
            local delivered = fixture.terminal(fixture.admin(), result.dest_ref.message_id)
            local replay = assert(fixture.probe(owner, "write", {request = request}))
            test.eq(result.dest_ref.message_id, replay.dest_ref.message_id)
            local captured = requests("POST", input.subject)
            test.eq(1, #captured)
            test.eq(captured[1].id, delivered.provider_message_id)
            test.is_true(captured[1].idempotency_key == nil or captured[1].idempotency_key == "")
        end)
    end)
end)}
