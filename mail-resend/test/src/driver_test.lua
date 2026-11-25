-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local fs = require("fs")
local base64 = require("base64")
local json = require("json")
local registry = require("registry")
local contract = require("contract")
local fixture = require("fixture")
local uploads_types = require("uploads_types")

local BINDING = "kickside.mail.resend:transport"
local ADMISSION = "kickside.mail.resend.security:transport_open"

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

local function resend_status(delivery)
    for _, status in ipairs(delivery.transports) do
        if status.id == BINDING then return status end
    end
    return nil
end

local function fixture_message(subject)
    return {to = {"recipient@example.org"}, subject = subject, text = "Hello", idempotency_key = uuid.v4()}
end

local function requests(key)
    local volume = assert(fs.get("app:resend_requests"))
    local matches = {}
    for file in assert(volume:readdir(".")) do
        local request = assert(json.decode(assert(volume:readfile(file.name))))
        if request.idempotency_key == key then matches[#matches + 1] = request end
    end
    return matches
end

local function library_logo()
    local assets = assert(fs.get("kickside.mail.views:asset_files"))
    return assert(base64.encode(assert(assets:readfile("logo.png"))))
end

return { run = test.run_cases(function()
    test.describe("Resend transport via real Settings and Uploads", function()
        test.it("lists the Resend transport with display data and delivery limits", function()
            local current = assert(fixture.probe(delivery_admin(), "delivery_status"))
            local status = assert(resend_status(current))
            test.eq("Resend", status.title)
            test.eq("simple-icons:resend", status.icon)
            test.eq("Deliver mail through Resend.", status.description)
            test.eq("kickside.mail.resend", status.settings_ns)
            test.eq(50, status.max_recipients)
            test.eq(40000000, status.max_message_bytes)
            test.eq(true, status.idempotent)
        end)

        local owner
        test.before_each(function()
            owner = fixture.user()
            local configured = configure({
                ["kickside.mail"] = {driver = BINDING, from_address = "sender@example.org",
                    from_name = 'Support, "North"', reply_to = "default@example.org"},
                ["kickside.mail.resend"] = {api_key = "re_fixture"},
            })
            test.is_true(configured.success, configured.error)
        end)

        test.it("sends the exact request for a notice with regular and inline uploads", function()
            local pdf = assert(fixture.probe(owner, "store", {bytes = "pdf\0bytes", filename = "source.pdf", content_type = "application/pdf"}))
            local png = assert(fixture.probe(owner, "store", {bytes = "\137PNG\0\255", filename = "logo.png", content_type = "image/png"}))
            local key = uuid.v4()
            local result = assert(send(owner, {
                to = {"to@example.org", "second@example.org"}, cc = {"cc@example.org"}, bcc = {"bcc@example.org"},
                reply_to = "reply@example.org", template = "notice",
                vars = {subject = "Status & progress", message = "Ready", inline_content_id = "logo"},
                idempotency_key = key,
                attachments = {{upload_id = pdf.uuid, filename = "report.pdf"}, {
                    upload_id = png.uuid, disposition = "inline", content_id = "logo",
                }},
            }))
            local volume = assert(fs.get("app:resend_requests"))
            test.eq("queued", result.status)
            local delivered = fixture.terminal(fixture.admin(), result.message_id)
            local captured = assert(json.decode(assert(volume:readfile(delivered.provider_message_id .. ".json"))))
            test.is_true(captured.authorized)
            test.eq("application/json", captured.content_type)
            test.eq(result.message_id, captured.idempotency_key)
            local body = captured.payload.html
            test.not_nil(body:find("<title>Status &amp; progress</title>", 1, true))
            test.not_nil(body:find("Ready</p>", 1, true))
            test.not_nil(body:find('src="cid:logo"', 1, true))
            test.not_nil(body:find(">Example Workspace</strong>", 1, true))
            test.not_nil(body:find('src="cid:mail-library-logo"', 1, true))
            test.eq(3, #captured.payload.attachments)
            local expected = {
                from = [["Support, \"North\"" <sender@example.org>]], to = {"to@example.org", "second@example.org"},
                cc = {"cc@example.org"}, bcc = {"bcc@example.org"}, reply_to = "reply@example.org",
                subject = "Status & progress", text = "Ready\n\nNotice image\n\nExample Workspace\n",
                html = body,
                attachments = {
                    {filename = "report.pdf", content_type = "application/pdf", content = "cGRmAGJ5dGVz"},
                    {filename = "logo.png", content_type = "image/png", content = "iVBORwD/", content_id = "logo"},
                    {filename = "logo.png", content_type = "image/png", content = library_logo(), content_id = "mail-library-logo"},
                },
            }
            test.eq(assert(json.encode(expected)), assert(json.encode(captured.payload)))
        end)

        test.it("reports credential availability and refuses unset credentials before egress", function()
            local admin = delivery_admin()
            local available = assert(resend_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_true(available.ready)
            test.is_true(configure({["kickside.mail.resend"] = {api_key = ""}}).success)
            local unavailable = assert(resend_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_false(unavailable.ready)
            test.eq("invalid_config", unavailable.code)
            test.eq("Add a Resend API key to send mail.", unavailable.reason)
            local input = fixture_message("Unconfigured driver")
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.is_false(err:retryable())
            test.eq(0, #requests(input.idempotency_key))
        end)

        test.it("reads the Resend key without exposing credentials or borrowing another namespace's key", function()
            local reader = fixture.scoped({"app:transport_status_access"})
            local foreign = {namespace = "app.unrelated"}
            local own = {namespace = "kickside.mail.resend"}
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
            test.is_nil(resend_status(current))
            test.eq("driver_not_admitted", current.code)
            test.is_nil(sent)
            test.eq(errors.INVALID, send_err:kind())
            test.eq("driver_not_admitted", send_err:details().code)
            test.not_nil(resend_status(assert(fixture.probe(admin, "delivery_status"))))
        end)

        test.it("refuses an expired delivery deadline before calling Resend", function()
            local input = fixture_message("Expired delivery")
            input.deadline = "2000-01-01T00:00:00Z"
            local result, err = transport(input)
            test.is_nil(result)
            test.eq(errors.UNAVAILABLE, err:kind())
            test.eq("delivery_deadline_exceeded", err:details().code)
            test.is_true(err:retryable())
            test.eq(0, #requests(input.idempotency_key))
        end)

        test.it("rejects whitespace and invalid text in saved API keys", function()
            for _, key in ipairs({" key", "key ", "key\t", "key\u{00a0}", "key" .. string.char(255), 42}) do
                local result = configure({["kickside.mail.resend"] = {api_key = key}})
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
            test.is_nil(detail:find("re_fixture", 1, true))
            test.is_nil(detail:find("YXBpOm1nX2ZpeHR1cmU=", 1, true))
            test.is_nil(detail:find("%c"))
            test.is_true(#detail <= 512)
        end)

        local cases = {
            {401, errors.PERMISSION_DENIED, "credentials_invalid", false},
            {400, errors.INVALID, "request_rejected", false, "validation_error"},
            {400, errors.INVALID, "message_rejected", false, "invalid_idempotency_key"},
            {401, errors.PERMISSION_DENIED, "credentials_invalid", false, "validation_error"},
            {403, errors.PERMISSION_DENIED, "credentials_invalid", false, "restricted_api_key"},
            {403, errors.PERMISSION_DENIED, "sender_or_recipient_not_allowed", false, "validation_error"},
            {403, errors.PERMISSION_DENIED, "authorization_refused", false},
            {422, errors.INVALID, "message_rejected", false},
            {409, errors.CONFLICT, "idempotency_conflict", false, "invalid_idempotent_request"},
            {409, errors.CONFLICT, "send_in_progress", true, "concurrent_idempotent_requests"},
            {429, errors.RATE_LIMITED, "rate_limited", true},
            {429, errors.RATE_LIMITED, "quota_exhausted", false, "daily_quota_exceeded"},
            {429, errors.RATE_LIMITED, "quota_exhausted", false, "monthly_quota_exceeded"},
            {500, errors.UNAVAILABLE, "provider_unavailable", true},
        }
        for _, case in ipairs(cases) do
            local subject = "HTTP " .. case[1]
            if case[5] then subject = subject .. " " .. case[5] end
            test.it("classifies " .. subject, function()
                local result, err = transport(fixture_message(subject))
                test.is_nil(result)
                test.not_nil(err)
                test.eq(case[1], err:details().status)
                test.eq(case[2], err:kind())
                test.eq(case[3], err:details().code)
                test.eq(case[4], err:retryable())
            end)
        end

        test.it("marks an accepted 200 without a provider ID as sent", function()
            local queued = assert(send(owner, fixture_message("Accepted without ID")))
            local delivered = fixture.terminal(fixture.admin(), queued.message_id)
            test.eq("sent", delivered.status)
            test.not_nil(delivered.sent_at)
            test.is_nil(delivered.provider_message_id)
            test.eq(1, #requests(queued.message_id))
        end)

        test.it("refuses callers without the send capability and makes no request", function()
            local message = fixture_message("Denied sender")
            local result, err = send(fixture.user(nil, false), message)
            test.is_nil(result)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq(0, #requests(message.idempotency_key))
        end)

        test.it("refuses callers without READ on the upload and makes no request", function()
            local upload = assert(fixture.probe(fixture.user(), "store", {bytes = "secret", filename = "private.txt", content_type = "text/plain"}))
            local message = fixture_message("Denied upload")
            message.attachments = {{upload_id = upload.uuid}}
            local result, err = send(owner, message)
            test.is_nil(result)
            test.eq(errors.PERMISSION_DENIED, err:kind())
            test.eq("access_denied", err:details().code)
            test.eq(0, #requests(message.idempotency_key))
        end)

        test.it("reads a shared upload as the sender and refuses it after the grant is revoked", function()
            local source_id, reader_id = uuid.v4(), uuid.v4()
            local source = fixture.user(source_id)
            local reader = fixture.user(reader_id)
            local acl = fixture.admin(source_id)
            local upload = assert(fixture.probe(source, "store", {
                bytes = "shared bytes", filename = "notes.txt", content_type = "text/plain",
            }))
            local target = {
                root_component_id = uploads_types.component_id_for_owner(source_id),
                subject = {subject_id = reader_id, subject_type = "user"},
            }
            local granted = assert(acl:call("kickside.component.binding:grant_subtree_func", {
                root_component_id = target.root_component_id, subject = target.subject, access_mask = 1,
            }))
            test.is_true(granted.success, granted.error)
            local input = fixture_message("HTTP 429")
            input.attachments = {{upload_id = upload.uuid}}
            local queued = assert(send(reader, input))
            test.eq("queued", queued.status)
            local retry = fixture.await_message(reader, queued.message_id, function(message) return message.last_error ~= nil end)
            test.eq("rate_limited", retry.last_error.code)
            local captured = requests(queued.message_id)
            test.eq(1, #captured)
            test.eq(2, #captured[1].payload.attachments)
            test.eq("mail-library-logo", captured[1].payload.attachments[2].content_id)
            test.eq("c2hhcmVkIGJ5dGVz", captured[1].payload.attachments[1].content)
            local revoked = assert(acl:call("kickside.component.binding:revoke_subtree_func", target))
            test.is_true(revoked.success, revoked.error)
            local failed = fixture.await_message(reader, queued.message_id, function(message) return message.status == "failed" end)
            test.eq(2, failed.attempts)
            test.eq(errors.PERMISSION_DENIED, failed.last_error.kind)
            test.eq("access_denied", failed.last_error.code)
            test.eq(1, #requests(queued.message_id))
        end)

        test.it("declares no picker and uses the committed message ID for provider idempotency", function()
            local port = assert(registry.get("kickside.mail.sink:send_email"))
            test.is_nil(port.data.config_schema and port.data.config_schema.connection_id)
            local request = {
                config = {}, sink_op = "upsert", input = fixture_message("Automation"),
                identity_key = "record-1", idempotency_key = uuid.v4(), origin = "automation-1",
            }
            local result = assert(fixture.probe(owner, "write", {request = request}))
            test.is_true(result.success, result.error and result.error.message)
            test.eq("created", result.result)
            fixture.terminal(owner, result.dest_ref.message_id)
            local replay = assert(fixture.probe(owner, "write", {request = request}))
            test.eq(result.dest_ref.message_id, replay.dest_ref.message_id)
            test.eq(1, #requests(result.dest_ref.message_id))
            test.eq(0, #requests(request.idempotency_key))
            test.eq(0, #requests(request.input.idempotency_key))
        end)

        test.it("rejects a writable origin that differs from its automation reference", function()
            local request = {
                config = {}, sink_op = "upsert", input = fixture_message("Invalid origin"),
                idempotency_key = uuid.v4(), origin = "automation-1",
                automation_ref = {kind = "automation", id = "automation-2", revision = 1},
            }
            local result = assert(fixture.probe(owner, "write", {request = request}))
            test.is_false(result.success)
            test.eq("invalid_request", result.error.code)
            test.eq(0, #requests(request.idempotency_key))
        end)
    end)
end) }
