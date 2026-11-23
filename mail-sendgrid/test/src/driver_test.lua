-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local fs = require("fs")
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

return {run = test.run_cases(function()
    test.describe("SendGrid transport via real Settings and Uploads", function()
        test.it("publishes the sendgrid settings-backed driver descriptor", function()
            local entry = assert(registry.get("kickside.mail.sendgrid:driver"))
            test.eq("kickside.mail:driver", entry.meta.type)
            test.eq("sendgrid", entry.data.id)
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
            local delivered = fixture.terminal(owner, result.message_id)
            local captured = assert(json.decode(assert(volume:readfile(delivered.provider_message_id .. ".json"))))
            test.eq("POST", captured.method)
            test.eq("Bearer sg_fixture", captured.authorization)
            test.eq("application/json", captured.content_type)
            test.is_true(captured.idempotency_key == nil or captured.idempotency_key == "")
            local body = captured.payload.content[#captured.payload.content].value
            test.not_nil(body:find("<title>Status &amp; progress</title>", 1, true))
            test.not_nil(body:find("Ready</p>", 1, true))
            test.not_nil(body:find('src="cid:logo"', 1, true))
            test.not_nil(body:find('src="cid:kickside-layout-logo"', 1, true))
            test.eq(3, #captured.payload.attachments)
            local logo = captured.payload.attachments[1].content
            test.eq("iVBORw0KGgo", logo:sub(1, 11))
            local expected = {
                from = {email = "sender@example.org", name = 'Support, "North"'},
                personalizations = {{
                    to = {{email = "to@example.org"}, {email = "second@example.org"}},
                    cc = {{email = "cc@example.org"}}, bcc = {{email = "bcc@example.org"}},
                }},
                reply_to = {email = "reply@example.org"},
                subject = "Status & progress",
                content = {
                    {type = "text/plain", value = "Ready\n\nNotice image\n\nKickSide\n"},
                    {type = "text/html", value = body},
                },
                attachments = {
                    {filename = "kickside-logo.png", type = "image/png", content = logo,
                        disposition = "inline", content_id = "kickside-layout-logo"},
                    {filename = "report.pdf", type = "application/pdf", content = "cGRmAGJ5dGVz", disposition = "attachment"},
                    {filename = "logo.png", type = "image/png", content = "iVBORwD/", disposition = "inline", content_id = "logo"},
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
            test.eq("kickside-layout-logo", captured.attachments[1].content_id)
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
            test.is_false(assert(fixture.probe(admin, "available")).available)
            local input = fixture_message("Unconfigured driver")
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.is_false(err:retryable())
            test.eq(0, #requests("POST", input.subject))
        end)

        local cases = {
            {400, errors.INVALID, "message_rejected", false},
            {401, errors.PERMISSION_DENIED, "credentials_invalid", false},
            {403, errors.PERMISSION_DENIED, "credentials_invalid", false},
            {413, errors.INVALID, "message_rejected", false},
            {429, errors.RATE_LIMITED, "rate_limited", true},
            {500, errors.UNAVAILABLE, "provider_unavailable", true},
            {503, errors.UNAVAILABLE, "provider_unavailable", true},
            {200, errors.INTERNAL, "provider_rejected", false},
            {202, errors.INTERNAL, "provider_response_invalid", false},
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

        test.it("classifies a 401 by status when the provider returns only prose", function()
            local input = fixture_message("Credits exhausted")
            local result, err = transport(input)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq("credentials_invalid", err:details().code)
            test.eq(401, err:details().status)
            test.eq("The mail service refused authorization", err:message())
            test.is_false(err:retryable())
            test.eq(1, #requests("POST", input.subject))
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
            local delivered = fixture.terminal(owner, result.dest_ref.message_id)
            local replay = assert(fixture.probe(owner, "write", {request = request}))
            test.eq(result.dest_ref.message_id, replay.dest_ref.message_id)
            local captured = requests("POST", input.subject)
            test.eq(1, #captured)
            test.eq(captured[1].id, delivered.provider_message_id)
            test.is_true(captured[1].idempotency_key == nil or captured[1].idempotency_key == "")
        end)
    end)
end)}
