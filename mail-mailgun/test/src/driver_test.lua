-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local fs = require("fs")
local json = require("json")
local registry = require("registry")
local base64 = require("base64")
local sql = require("sql")
local time = require("time")
local settings_writer = require("settings_writer")
local fixture = require("fixture")
local contract = require("contract")

local BINDING = "kickside.mail.mailgun:transport"
local ADMISSION = "kickside.mail.mailgun.security:transport_open"

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

local function mailgun_status(delivery)
    for _, status in ipairs(delivery.transports) do
        if status.id == BINDING then return status end
    end
    return nil
end

local function await_live(seq)
    local deadline = time.now():add("8s"):unix_nano()
    repeat
        local marker = registry.get("kickside.mail.projection:marker")
        if marker and marker.data.seq >= seq then return end
        time.sleep("15ms")
    until time.now():unix_nano() >= deadline
    error("Mailgun fixture template did not publish at sequence " .. seq)
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

local function library_logo()
    local assets = assert(fs.get("kickside.mail.views:asset_files"))
    return assert(base64.encode(assert(assets:readfile("logo.png"))))
end

return {run = test.run_cases(function()
    test.describe("Mailgun transport via real Settings and Uploads", function()
        test.it("lists the Mailgun transport with display data and delivery limits", function()
            local current = assert(fixture.probe(delivery_admin(), "delivery_status"))
            local status = assert(mailgun_status(current))
            test.eq("Mailgun", status.title)
            test.eq("simple-icons:mailgun", status.icon)
            test.eq("Deliver mail through Mailgun.", status.description)
            test.eq("kickside.mail.mailgun", status.settings_ns)
            test.eq(1000, status.max_recipients)
            test.eq(25000000, status.max_message_bytes)
            test.eq(false, status.idempotent)
        end)

        test.it("exposes API key, domain and region through generic Settings", function()
            for _, key in ipairs({"api_key", "domain", "region"}) do
                local definition = assert(registry.get("kickside.mail.mailgun.settings:setting_" .. key))
                test.eq("kickside.settings:definition", definition.meta.type)
                test.eq("kickside.mail.mailgun", definition.data.namespace)
                test.eq(key, definition.data.key)
                test.is_true(definition.data.visible ~= false)
            end
            local domain = assert(registry.get("kickside.mail.mailgun.settings:setting_domain"))
            test.eq("mail.example.org", domain.data.default)
            local view = registry.get("kickside.mail.mailgun.ui:settings_view")
            test.is_nil(view)
        end)

        test.it("limits requests to the two configured API prefixes", function()
            local caller = fixture.scoped({"kickside.mail.mailgun.security:http_access"})
            local fixture_addr = assert(registry.get("app:mailgun_gateway")).data.addr
            local port = assert(fixture_addr:match(":(%d+)$"))
            local function allowed(url)
                local permitted, err = fixture.probe(caller, "may_request", {url = url})
                test.is_nil(err, tostring(err))
                return permitted
            end
            test.is_false(allowed("https://api.mailgun.net/v3/mail.example.org/messages"))
            test.is_false(allowed("https://api.eu.mailgun.net/v3/mail.example.org/messages"))
            test.is_false(allowed("http://127.0.0.1:" .. port .. "/v30/mail.example.org/messages"))
            test.is_false(allowed("http://localhost:" .. port .. "/v4/mail.example.org/messages"))
            test.is_true(allowed("http://127.0.0.1:" .. port .. "/v3/other.example.org/messages"))
            test.is_true(allowed("http://localhost:" .. port .. "/v3/other.example.org/messages"))
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
                ["kickside.mail"] = {driver = "kickside.mail.mailgun:transport", from_address = "sender@example.org",
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
            local attachments = {{upload_id = pdf.uuid, filename = 'report "weekly".pdf'}, {
                upload_id = png.uuid, disposition = "inline", content_id = data.inline_content_id,
            }}
            local mailer = assert(assert(contract.get("kickside.mail:mailer")):open())
            local expected = assert(mailer:preview({template = "notice", vars = data}))
            local result, err = send(owner, {
                to = {"to@example.org", "second@example.org"},
                cc = {"cc@example.org", "cc2@example.org"},
                bcc = {"bcc@example.org", "bcc2@example.org"},
                reply_to = "reply@example.org", template = "notice", vars = data,
                idempotency_key = uuid.v4(),
                attachments = attachments,
            })
            assert(result, tostring(err))
            test.eq("queued", result.status)
            local delivered = fixture.terminal(fixture.admin(), result.message_id)
            local captured = requests("POST", data.subject)
            test.eq(1, #captured)
            local request = captured[1]
            test.eq(request.id, delivered.provider_message_id)
            test.eq("/v3/mail.example.org/messages", request.path)
            test.eq(assert(registry.get("app:mailgun_gateway")).data.addr, request.host)
            test.is_true(request.authorized)
            test.not_nil(request.content_type:match("^multipart/form%-data; boundary=[%w%-]+$"))
            test.is_true(request.idempotency_key == nil or request.idempotency_key == "")
            local fields = {
                from = [["Support, \"North\"" <sender@example.org>]],
                to = {"to@example.org", "second@example.org"},
                cc = {"cc@example.org", "cc2@example.org"},
                bcc = {"bcc@example.org", "bcc2@example.org"},
                ["h:Reply-To"] = "reply@example.org",
                subject = data.subject,
                text = "Ready\n\nNotice image\n\nExample Workspace\n",
                html = expected.html,
            }
            test.eq(assert(json.encode(fields)), assert(json.encode(request.values)))
            test.not_nil(request.values.html:find(">Example Workspace</strong>", 1, true))
            test.not_nil(request.values.html:find('src="cid:mail-library-logo"', 1, true))
            local files = {
                attachment = {{
                    filename = 'report "weekly".pdf', content_type = "application/pdf", bytes = assert(base64.encode(pdf_bytes)),
                }},
                inline = {
                    {filename = data.inline_content_id, content_type = "image/png", bytes = assert(base64.encode(png_bytes))},
                    {filename = "mail-library-logo", content_type = "image/png", bytes = library_logo()},
                },
            }
            test.eq(assert(json.encode(files)), assert(json.encode(request.files)))
            for _, inline in ipairs(request.files.inline) do
                test.not_nil(request.values.html:find('src="cid:' .. inline.filename .. '"', 1, true))
            end
        end)

        test.it("sends a message based on Plain without attaching the library logo", function()
            local input = fixture_message("Plain message")
            local name = "plain-" .. uuid.v4()
            local editor = assert(assert(contract.get("kickside.mail:library")):open())
            local create = {
                kind = "message", name = name, title = "Plain message", description = "", base = "plain",
                html = "{{ block body() }}<p>Plain body</p>{{ end }}",
                text = "{{ block body() }}Plain body{{ end }}", subject = input.subject,
                schema = {type = "object", properties = {}}, samples = {},
            }
            local review = assert(editor:preview({message = name, create = create}))
            create.preview_id = assert(review.preview_id)
            local message = assert(editor:create(create))
            await_live(message.seq)
            local queued, err = send(owner, {to = input.to, template = name, vars = {}})
            assert(editor:delete({
                kind = "message", name = name, expected_revision = message.revision,
            }))
            assert(queued, tostring(err))
            fixture.terminal(fixture.admin(), queued.message_id)
            local request = requests("POST", input.subject)[1]
            test.not_nil(request)
            test.not_nil(request.values.html:find("Plain body", 1, true))
            test.is_nil(request.values.html:find("cid:mail-library-logo", 1, true))
            test.is_nil(request.files.inline)
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
            local fixture_addr = assert(registry.get("app:mailgun_gateway")).data.addr
            test.eq((fixture_addr:gsub("^127%.0%.0%.1", "localhost")), request.host)
            test.eq("KickSide <sender@example.org>", request.values.from)
            test.eq(input.to[1], request.values.to)
            test.is_nil(request.values.cc)
            test.is_nil(request.values.bcc)
            test.eq("default@example.org", request.values["h:Reply-To"])
            test.is_nil(request.values.text)
            test.not_nil(request.values.html:find("<p>Hello</p>", 1, true))
        end)

        test.it("reports credential availability and refuses unset credentials before egress", function()
            local admin = delivery_admin()
            local available = assert(mailgun_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_true(available.ready)
            test.is_true(configure({["kickside.mail.mailgun"] = {api_key = ""}}).success)
            local unavailable = assert(mailgun_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_false(unavailable.ready)
            test.eq("invalid_config", unavailable.code)
            test.eq("Add a Mailgun API key to send mail.", unavailable.reason)
            local input = fixture_message("Unconfigured driver")
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.is_false(err:retryable())
            local destination = assert(fixture.probe(owner, "write", {request = {
                config = {}, sink_op = "upsert", input = input, identity_key = "record",
                idempotency_key = uuid.v4(), origin = "automation",
            }}))
            test.is_false(destination.success)
            test.eq(err:details().code, destination.error.code)
            test.eq(err:message(), destination.error.message)
            test.is_false(destination.error.retriable)
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("reads the Mailgun key without exposing credentials or borrowing another namespace's key", function()
            local reader = fixture.scoped({"app:transport_status_access"})
            local foreign = {namespace = "app.unrelated"}
            local own = {namespace = "kickside.mail.mailgun"}
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
            test.is_nil(mailgun_status(current))
            test.eq("driver_not_admitted", current.code)
            test.is_nil(sent)
            test.eq(errors.INVALID, send_err:kind())
            test.eq("driver_not_admitted", send_err:details().code)
            test.not_nil(mailgun_status(assert(fixture.probe(admin, "delivery_status"))))
        end)

        test.it("refuses an expired delivery deadline before calling Mailgun", function()
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
                local result = configure({["kickside.mail.mailgun"] = {api_key = key}})
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
            test.is_nil(detail:find("mg_fixture", 1, true))
            test.is_nil(detail:find("YXBpOm1nX2ZpeHR1cmU=", 1, true))
            test.is_nil(detail:find("%c"))
            test.is_true(#detail <= 512)
        end)

        test.it("marks an accepted 200 without a provider ID as sent", function()
            local input = fixture_message("HTTP 200")
            local queued = assert(send(owner, input))
            local delivered = fixture.terminal(fixture.admin(), queued.message_id)
            test.eq("sent", delivered.status)
            test.not_nil(delivered.sent_at)
            test.is_nil(delivered.provider_message_id)
            test.eq(1, #requests("POST", input.subject))
        end)

        local cases = {
            {400, errors.INVALID, "message_rejected", false},
            {401, errors.PERMISSION_DENIED, "credentials_invalid", false},
            {403, errors.PERMISSION_DENIED, "authorization_refused", false},
            {413, errors.INVALID, "message_rejected", false},
            {429, errors.RATE_LIMITED, "rate_limited", true},
            {500, errors.UNAVAILABLE, "provider_unavailable", true},
            {503, errors.UNAVAILABLE, "provider_unavailable", true},
            {404, errors.INTERNAL, "provider_rejected", false},
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
                    test.eq("Please add the address to your authorized recipients.", err:details().provider_detail)
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

        test.it("requires a sending domain before egress", function()
            test.is_true(configure({["kickside.mail.mailgun"] = {domain = ""}}).success)
            local status = assert(mailgun_status(assert(fixture.probe(delivery_admin(), "delivery_status"))))
            test.is_false(status.ready)
            test.eq("invalid_config", status.code)
            test.eq("Enter your Mailgun sending domain.", status.reason)
            local input = fixture_message("Missing sending domain")
            local result, err = send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.eq(0, #requests("POST", input.subject))
        end)

        test.it("sends using a valid domain changed in Settings", function()
            test.is_true(configure({["kickside.mail.mailgun"] = {domain = "other.example.org"}}).success)
            local status = assert(mailgun_status(assert(fixture.probe(delivery_admin(), "delivery_status"))))
            test.is_true(status.ready, status.reason)
            local input = fixture_message("Changed sending domain")
            local result = assert(send(owner, input))
            fixture.terminal(owner, result.message_id)
            local captured = requests("POST", input.subject)
            test.eq(1, #captured)
            test.eq("/v3/other.example.org/messages", captured[1].path)
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
            local unavailable = assert(fixture.probe(fixture.admin(), "status"))
            test.eq("invalid_config", unavailable.code)
            test.eq("Enter a valid Mailgun sending domain.", unavailable.reason)
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
            test.eq("Hello", captured[1].values.text)
            test.not_nil(captured[1].values.html:find("Hello</pre>", 1, true))
        end)
    end)
end)}
