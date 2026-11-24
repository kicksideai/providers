-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local fs = require("fs")
local json = require("json")
local registry = require("registry")
local base64 = require("base64")
local sql = require("sql")
local funcs = require("funcs")
local security = require("security")
local settings_writer = require("settings_writer")
local fixture = require("fixture")
local render = require("render")

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
    local volume = assert(fs.get("app:mailgun_requests"))
    local matches = {}
    for file in assert(volume:readdir(".")) do
        local request = assert(json.decode(assert(volume:readfile(file.name))))
        if request.method == method and (not subject or (request.values and request.values.subject == subject)) then
            matches[#matches + 1] = request
        end
    end
    return matches
end

return {run = test.run_cases(function()
    test.describe("Mailgun transport via real Settings and Uploads", function()
        test.it("publishes the mailgun settings-backed driver descriptor", function()
            local entry = assert(registry.get("kickside.mail.mailgun:driver"))
            test.eq("kickside.mail:driver", entry.meta.type)
            test.eq("mailgun", entry.data.id)
            test.eq(1000, entry.data.max_recipients)
            test.eq(25000000, entry.data.max_message_bytes)
            test.eq("kickside.mail.mailgun:transport", entry.data.binding)
            test.eq("kickside.mail.mailgun", entry.data.settings_ns)
        end)

        test.it("permits delivery to configured domains on the US and EU API origins", function()
            local scope = assert(security.new_scope({
                assert(security.policy("app:test_scope")),
                assert(security.policy("kickside.mail.mailgun.security:http_access")),
            }))
            local actor = assert(security.new_actor(uuid.v4(), {}))
            local caller = assert(funcs.new():with_actor(actor):with_scope(scope))
            local function allowed(url)
                local permitted, err = fixture.probe(caller, "may_request", {url = url})
                test.is_nil(err, tostring(err))
                return permitted
            end
            test.is_true(allowed("https://api.mailgun.net/v3/mail.example.org/messages"))
            test.is_true(allowed("https://api.eu.mailgun.net/v3/mail.example.org/messages"))
            test.is_false(allowed("https://api.mailgun.net/v4/mail.example.org/messages"))
            test.is_false(allowed("https://mx.example.org/v3/mail.example.org/messages"))
        end)

        local owner
        test.before_each(function()
            owner = fixture.user()
            local configured = configure({
                ["kickside.mail"] = {driver = "mailgun", from_address = "sender@example.org",
                    from_name = 'Support, "North"', reply_to = "default@example.org"},
                ["kickside.mail.mailgun"] = {api_key = "mg_fixture", domain = "mail.example.org", region = "us"},
            })
            test.is_true(configured.success, configured.error)
        end)

        test.it("sends the exact multipart notice and returns the JSON message ID", function()
            local pdf_bytes, png_bytes = "pdf\0bytes", "\137PNG\0\255"
            local pdf = assert(fixture.probe(owner, "store", {bytes = pdf_bytes, filename = "source.pdf", content_type = "application/pdf"}))
            local png = assert(fixture.probe(owner, "store", {bytes = png_bytes, filename = "chart.png", content_type = "image/png"}))
            local data = {subject = "Status & progress " .. uuid.v4(), message = "Ready", inline_content_id = "chart@reports.example.org"}
            local expected = assert(render.render("notice", data))
            local result, err = send(owner, {
                to = {"to@example.org", "second@example.org"},
                cc = {"cc@example.org", "cc2@example.org"},
                bcc = {"bcc@example.org", "bcc2@example.org"},
                reply_to = "reply@example.org", template = "notice", vars = data,
                idempotency_key = uuid.v4(),
                attachments = {{upload_id = pdf.uuid, filename = 'report "weekly".pdf'}, {
                    upload_id = png.uuid, disposition = "inline", content_id = data.inline_content_id,
                }},
            })
            assert(result, tostring(err))
            test.eq("queued", result.status)
            local delivered = fixture.terminal(owner, result.message_id)
            local captured = requests("POST", data.subject)
            test.eq(1, #captured)
            local request = captured[1]
            test.eq(request.id, delivered.provider_message_id)
            test.eq("/v3/mail.example.org/messages", request.path)
            test.eq("127.0.0.1:24637", request.host)
            test.eq("Basic YXBpOm1nX2ZpeHR1cmU=", request.authorization)
            test.not_nil(request.content_type:match("^multipart/form%-data; boundary=[%w%-]+$"))
            test.is_true(request.idempotency_key == nil or request.idempotency_key == "")
            local fields = {
                from = [["Support, \"North\"" <sender@example.org>]],
                to = {"to@example.org", "second@example.org"},
                cc = {"cc@example.org", "cc2@example.org"},
                bcc = {"bcc@example.org", "bcc2@example.org"},
                ["h:Reply-To"] = "reply@example.org",
                subject = data.subject,
                text = "Ready\n\nNotice image\n\nKickSide\n",
                html = expected.html,
            }
            test.eq(assert(json.encode(fields)), assert(json.encode(request.values)))
            local files = {
                attachment = {{
                    filename = 'report "weekly".pdf', content_type = "application/pdf", bytes = assert(base64.encode(pdf_bytes)),
                }},
                inline = {
                    {filename = "kickside-layout-logo", content_type = "image/png",
                        bytes = assert(base64.encode(expected.attachments[1].content))},
                    {filename = data.inline_content_id, content_type = "image/png", bytes = assert(base64.encode(png_bytes))},
                },
            }
            test.eq(assert(json.encode(files)), assert(json.encode(request.files)))
            for _, inline in ipairs(request.files.inline) do
                test.not_nil(request.values.html:find('src="cid:' .. inline.filename .. '"', 1, true))
            end
        end)

        test.it("sends HTML only through the EU endpoint using the configured From", function()
            local input = fixture_message("EU HTML only")
            input.cc, input.bcc = {}, {}
            input.text, input.html = "", "<p>Hello</p>"
            test.is_true(configure({
                ["kickside.mail.mailgun"] = {region = "eu"},
                ["kickside.mail"] = {from_name = "KickSide"},
            }).success)
            local queued = assert(send(owner, input))
            test.eq("queued", queued.status)
            fixture.terminal(owner, queued.message_id)
            local request = requests("POST", input.subject)[1]
            test.eq("localhost:24637", request.host)
            test.eq("KickSide <sender@example.org>", request.values.from)
            test.eq(input.to[1], request.values.to)
            test.is_nil(request.values.cc)
            test.is_nil(request.values.bcc)
            test.eq("default@example.org", request.values["h:Reply-To"])
            test.is_nil(request.values.text)
            test.not_nil(request.values.html:find("<p>Hello</p>", 1, true))
        end)

        test.it("reports credential availability and refuses unset credentials before egress", function()
            local admin = fixture.admin()
            local available = assert(fixture.probe(admin, "available"))
            test.is_true(available.available)
            local values = assert(fixture.probe(owner, "read_settings"))
            test.is_nil(values.api_key)
            test.is_true(configure({["kickside.mail.mailgun"] = {api_key = ""}}).success)
            test.is_false(assert(fixture.probe(admin, "available")).available)
            local input = fixture_message("Unconfigured driver")
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.is_false(err:retryable())
            local destination = assert(fixture.probe(owner, "write", {request = {
                config = {}, sink_op = "create", input = input, identity_key = "record",
                idempotency_key = uuid.v4(), origin = "automation",
            }}))
            test.is_false(destination.success)
            test.eq(err:details().code, destination.error.code)
            test.eq(err:message(), destination.error.message)
            test.is_false(destination.error.retriable)
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

        local cases = {
            {400, errors.INVALID, "message_rejected", false},
            {401, errors.PERMISSION_DENIED, "credentials_invalid", false},
            {403, errors.PERMISSION_DENIED, "sender_or_recipient_not_allowed", false},
            {413, errors.INVALID, "message_rejected", false},
            {429, errors.RATE_LIMITED, "rate_limited", true},
            {500, errors.UNAVAILABLE, "provider_unavailable", true},
            {503, errors.UNAVAILABLE, "provider_unavailable", true},
            {404, errors.INTERNAL, "provider_rejected", false},
            {200, errors.INTERNAL, "provider_response_invalid", false},
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
                if case[1] == 403 then
                    test.eq("The mail service did not allow the sender or recipient", err:message())
                end
            end)
        end

        test.it("refuses an upload whose encoding exceeds the driver's message limit", function()
            local bytes = string.rep("x", 19000000)
            local upload = assert(fixture.probe(owner, "store", {
                bytes = bytes, filename = "large.txt", content_type = "text/plain",
            }))
            local input = fixture_message("Too large after encoding")
            input.attachments = {{upload_id = upload.uuid}}
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("message_too_large", err:details().code)
            test.eq("max_message_bytes", err:details().limit)
            test.eq(25000000, err:details().maximum)
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("validates the sending domain and region before egress", function()
            local input = fixture_message("Invalid sender settings")
            local invalid_domain = configure({["kickside.mail.mailgun"] = {domain = "mail.example.org/../test"}})
            test.is_false(invalid_domain.success)
            test.eq("Enter a valid sending domain", invalid_domain.error)
            local db = assert(sql.get("app:db"))
            assert(db:execute([[UPDATE kickside_settings SET value = $1 WHERE namespace = $2 AND key = $3]],
                {assert(json.encode("mail.example.org/../test")), "kickside.mail.mailgun", "domain"}))
            assert(db:release())
            assert(settings_writer.reload())
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq("invalid_config", err:details().code)
            test.eq("The mail sending domain is invalid", err:message())
            local invalid = configure({["kickside.mail.mailgun"] = {region = "other"}})
            test.is_false(invalid.success)
            test.eq("value is not in the declared enum", invalid.error)
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("requires a To recipient before egress", function()
            local input = fixture_message("Bcc only")
            input.bcc, input.to = input.to, nil
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("recipient_required", err:details().code)
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("rejects duplicate inline content IDs before egress", function()
            local file = assert(fixture.probe(owner, "store", {bytes = "image", filename = "chart.png", content_type = "image/png"}))
            local input = fixture_message("Duplicate inline IDs")
            input.attachments = {
                {upload_id = file.uuid, disposition = "inline", content_id = "chart"},
                {upload_id = file.uuid, disposition = "inline", content_id = "CHART"},
            }
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_content_id", err:details().code)
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

        test.it("writes once through the at-least-once destination", function()
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
            local delivered = fixture.terminal(owner, result.dest_ref.message_id)
            local replay = assert(fixture.probe(owner, "write", {request = request}))
            test.eq(result.dest_ref.message_id, replay.dest_ref.message_id)
            local captured = requests("POST", input.subject)
            test.eq(1, #captured)
            test.eq(captured[1].id, delivered.provider_message_id)
            test.is_true(captured[1].idempotency_key == nil or captured[1].idempotency_key == "")
            test.eq("Hello", captured[1].values.text)
            test.not_nil(captured[1].values.html:find("Hello</pre>", 1, true))
        end)
    end)
end)}
