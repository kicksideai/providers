-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local fs = require("fs")
local base64 = require("base64")
local json = require("json")
local registry = require("registry")
local contract = require("contract")
local fixture = require("fixture")

local BINDING = "kickside.mail.sendgrid:transport"
local ADMISSION = "kickside.mail.sendgrid.security:transport_open"

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

local function delivery_admin()
    return fixture.scoped({"kickside.mail.security:module_runtime", "kickside.mail.security:log_admin"})
end

local function sendgrid_status(delivery)
    for _, status in ipairs(delivery.transports) do
        if status.id == BINDING then return status end
    end
    return nil
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
        test.it("lists the SendGrid transport with display data and delivery limits", function()
            local current = assert(fixture.probe(delivery_admin(), "delivery_status"))
            local status = assert(sendgrid_status(current))
            test.eq("SendGrid", status.title)
            test.eq("simple-icons:sendgrid", status.icon)
            test.eq("Deliver mail through SendGrid.", status.description)
            test.eq("kickside.mail.sendgrid", status.settings_ns)
            test.eq(1000, status.max_recipients)
            test.eq(29999999, status.max_message_bytes)
            test.eq(false, status.idempotent)
        end)

        test.it("grants only the overridden delivery URL to the driver", function()
            local caller = fixture.scoped({"kickside.mail.sendgrid.security:http_access"})
            local fixture_addr = assert(registry.get("app:sendgrid_gateway")).data.addr
            local fixture_url = "https://" .. fixture_addr .. "/v3/mail/send"
            test.is_true(assert(fixture.probe(caller, "may_request", {url = fixture_url})))
            test.is_false(fixture.probe(caller, "may_request", {url = fixture_url .. "/other"}))
        end)

        test.it("keeps database and upload internals away from an ordinary member", function()
            local member = fixture.user(nil, false)
            local permissions = assert(fixture.probe(member, "member_permissions"))
            test.is_false(permissions.database)
            test.is_false(permissions.storage)
            test.is_false(permissions.component_env)
        end)

        local owner
        test.before_each(function()
            owner = fixture.user()
            local configured = configure({
                ["kickside.mail"] = {driver = "kickside.mail.sendgrid:transport", from_address = "sender@example.org",
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
            test.is_true(captured.authorized)
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
            local admin = delivery_admin()
            local available = assert(sendgrid_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_true(available.ready)
            test.is_true(configure({["kickside.mail.sendgrid"] = {api_key = ""}}).success)
            local unavailable = assert(sendgrid_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_false(unavailable.ready)
            test.eq("invalid_config", unavailable.code)
            test.is_true(type(unavailable.reason) == "string" and #unavailable.reason > 0)
            local input = fixture_message("Unconfigured driver")
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.is_false(err:retryable())
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("reads the SendGrid key without exposing credentials or borrowing another namespace's key", function()
            local reader = fixture.scoped({"app:transport_status_access"})
            local foreign = {namespace = "app.unrelated"}
            local own = {namespace = "kickside.mail.sendgrid"}
            test.is_true(configure({[foreign.namespace] = {api_key = "other_fixture"}}).success)
            test.is_true(assert(fixture.probe(fixture.admin(), "read_settings", foreign)).has_api_key)
            test.is_false(assert(fixture.probe(reader, "read_settings", foreign)).has_api_key)
            test.is_false(assert(fixture.probe(reader, "read_settings", own)).has_api_key)
            test.is_true(assert(fixture.probe(reader, "status")).ready)
            test.is_true(configure({[own.namespace] = {api_key = ""}}).success)
            test.is_false(assert(fixture.probe(reader, "status")).ready)
        end)

        test.it("excludes the installed binding and refuses Mail sends when admission is removed", function()
            local admin = delivery_admin()
            local policy = assert(registry.get(ADMISSION))
            local removal = assert(registry.snapshot()):changes()
            removal:delete({ADMISSION})
            local _, remove_err = removal:apply()
            assert(not remove_err, tostring(remove_err))

            local implementations, discover_err = contract.find_implementations("kickside.mail:transport")
            local current, status_err = fixture.probe(admin, "delivery_status")
            local sent, send_err = send(owner, fixture_message("Revoked transport"))

            local restore = assert(registry.snapshot()):changes()
            restore:create({id = ADMISSION, kind = policy.kind, meta = policy.meta, data = policy.data})
            local _, restore_err = restore:apply()
            assert(not restore_err, tostring(restore_err))

            test.is_nil(discover_err)
            local installed = false
            for _, id in ipairs(implementations) do
                if id == BINDING then
                    installed = true
                    break
                end
            end
            test.is_true(installed)
            test.is_nil(status_err)
            test.is_nil(sendgrid_status(current))
            test.eq("driver_not_admitted", current.code)
            test.is_nil(sent)
            test.eq(errors.INVALID, send_err:kind())
            test.eq("driver_not_admitted", send_err:details().code)
            test.not_nil(sendgrid_status(assert(fixture.probe(admin, "delivery_status"))))
        end)

        test.it("refuses a plain HTTP delivery endpoint before attempting egress", function()
            local endpoint_id = "kickside.mail.sendgrid:endpoints"
            local original = assert(registry.get(endpoint_id))
            local insecure = assert(registry.get(endpoint_id))
            insecure.data.endpoints.api = insecure.data.endpoints.api:gsub("^https:", "http:")
            local change = assert(registry.snapshot()):changes()
            assert(change:update(insecure))
            local _, change_err = change:apply()
            assert(not change_err, tostring(change_err))
            local input = fixture_message("Insecure endpoint")
            input.deadline = "2000-01-01T00:00:00Z"
            local result, err = transport(input)
            local restore = assert(registry.snapshot()):changes()
            assert(restore:update(original))
            local _, restore_err = restore:apply()
            assert(not restore_err, tostring(restore_err))

            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("provider_endpoint_invalid", err:details().code)
        end)

        test.it("refuses an expired delivery deadline before calling SendGrid", function()
            local input = fixture_message("Expired delivery")
            input.deadline = "2000-01-01T00:00:00Z"
            local result, err = transport(input)
            test.is_nil(result)
            test.eq(errors.UNAVAILABLE, err:kind())
            test.eq("delivery_deadline_exceeded", err:details().code)
            test.is_true(err:retryable())
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("rejects whitespace and invalid text in saved API keys", function()
            for _, key in ipairs({" key", "key ", "key\t", "key\u{00a0}", "key" .. string.char(255), 42}) do
                local result = configure({["kickside.mail.sendgrid"] = {api_key = key}})
                test.is_false(result.success)
            end
            test.is_true(assert(fixture.probe(fixture.admin(), "status")).ready)
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
                config = {}, sink_op = "upsert", input = input,
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
