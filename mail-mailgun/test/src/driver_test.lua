-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local json = require("json")
local registry = require("registry")
local base64 = require("base64")
local fixture = require("fixture")
local contract = require("contract")
local cases = require("cases")

return {run = test.run_cases(function()
    test.describe("Mailgun transport via real Settings and Uploads", function()
        test.it("lists the Mailgun transport with display data and delivery limits", function()
            local current = assert(fixture.probe(cases.delivery_admin(), "delivery_status"))
            local status = assert(cases.mailgun_status(current))
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
            test.is_false(allowed("https://127.0.0.1:" .. port .. "/v30/mail.example.org/messages"))
            test.is_false(allowed("https://localhost:" .. port .. "/v4/mail.example.org/messages"))
            test.is_true(allowed("https://127.0.0.1:" .. port .. "/v3/other.example.org/messages"))
            test.is_true(allowed("https://localhost:" .. port .. "/v3/other.example.org/messages"))
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
            owner = cases.configured_sender()
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
            local result, err = cases.send(owner, {
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
            local captured = cases.requests("POST", data.subject)
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
                    {filename = "mail-library-logo", content_type = "image/png", bytes = cases.library_logo()},
                },
            }
            test.eq(assert(json.encode(files)), assert(json.encode(request.files)))
            for _, inline in ipairs(request.files.inline) do
                test.not_nil(request.values.html:find('src="cid:' .. inline.filename .. '"', 1, true))
            end
        end)

        test.it("sends a message based on Plain without attaching the library logo", function()
            local input = cases.fixture_message("Plain message")
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
            cases.await_live(message.seq)
            local queued, err = cases.send(owner, {to = input.to, template = name, vars = {}})
            assert(editor:delete({
                kind = "message", name = name, expected_revision = message.revision,
            }))
            assert(queued, tostring(err))
            fixture.terminal(fixture.admin(), queued.message_id)
            local request = cases.requests("POST", input.subject)[1]
            test.not_nil(request)
            test.not_nil(request.values.html:find("Plain body", 1, true))
            test.is_nil(request.values.html:find("cid:mail-library-logo", 1, true))
            test.is_nil(request.files.inline)
        end)

        test.it("sends HTML only through the EU endpoint using the configured From", function()
            local input = cases.fixture_message("EU HTML only")
            input.cc, input.bcc = {}, {}
            input.text, input.html = "", "<p>Hello</p>"
            test.is_true(cases.configure({
                ["kickside.mail.mailgun"] = {region = "eu"},
                ["kickside.mail"] = {from_name = "KickSide"},
            }).success)
            local queued = assert(cases.send(owner, input))
            test.eq("queued", queued.status)
            fixture.terminal(owner, queued.message_id)
            local request = cases.requests("POST", input.subject)[1]
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
            local admin = cases.delivery_admin()
            local available = assert(cases.mailgun_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_true(available.ready)
            test.is_true(cases.configure({["kickside.mail.mailgun"] = {api_key = ""}}).success)
            local unavailable = assert(cases.mailgun_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_false(unavailable.ready)
            test.eq("api_key_required", unavailable.code)
            test.is_true(type(unavailable.reason) == "string" and #unavailable.reason > 0)
            local input = cases.fixture_message("Unconfigured driver")
            local result, err = cases.send(owner, input)
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
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("reads the Mailgun key without exposing credentials or borrowing another namespace's key", function()
            local reader = fixture.scoped({"app:transport_status_access"})
            local foreign = {namespace = "app.unrelated"}
            local own = {namespace = "kickside.mail.mailgun"}
            test.is_true(cases.configure({[foreign.namespace] = {api_key = "other_fixture"}}).success)
            test.is_true(assert(fixture.probe(fixture.admin(), "read_settings", foreign)).has_api_key)
            test.is_false(assert(fixture.probe(reader, "read_settings", foreign)).has_api_key)
            test.is_false(assert(fixture.probe(reader, "read_settings", own)).has_api_key)
            test.is_true(assert(fixture.probe(reader, "status")).ready)
            test.is_true(cases.configure({[own.namespace] = {api_key = ""}}).success)
            test.is_false(assert(fixture.probe(reader, "status")).ready)
        end)

        test.it("excludes the installed binding and refuses Mail sends when admission is removed", function()
            local admin = cases.delivery_admin()
            local policy = assert(registry.get(cases.ADMISSION))
            local removal = assert(registry.snapshot()):changes()
            removal:delete({cases.ADMISSION})
            local _, remove_err = removal:apply()
            assert(not remove_err, tostring(remove_err))

            local implementations, discover_err = contract.find_implementations("kickside.mail:transport")
            local current, status_err = fixture.probe(admin, "delivery_status")
            local sent, send_err = cases.send(owner, cases.fixture_message("Revoked transport"))

            local restore = assert(registry.snapshot()):changes()
            restore:create({id = cases.ADMISSION, kind = policy.kind, meta = policy.meta, data = policy.data})
            local _, restore_err = restore:apply()
            assert(not restore_err, tostring(restore_err))

            test.is_nil(discover_err)
            local installed = false
            for _, id in ipairs(implementations) do
                if id == cases.BINDING then
                    installed = true
                    break
                end
            end
            test.is_true(installed)
            test.is_nil(status_err)
            test.is_nil(cases.mailgun_status(current))
            test.eq("driver_not_admitted", current.code)
            test.is_nil(sent)
            test.eq(errors.INVALID, send_err:kind())
            test.eq("driver_not_admitted", send_err:details().code)
            test.not_nil(cases.mailgun_status(assert(fixture.probe(admin, "delivery_status"))))
        end)

        for _, invalid in ipairs({
            {name = "HTTP", apply = function(url) return url:gsub("^https:", "http:") end},
            {name = "invalid port", apply = function(url) return url:gsub("^(https://[^:]+):%d+", "%1:65536") end},
        }) do
            test.it("refuses an invalid delivery endpoint before attempting egress (" .. invalid.name .. ")", function()
                local endpoint_id = "kickside.mail.mailgun:endpoints"
                local original = assert(registry.get(endpoint_id))
                local insecure = assert(registry.get(endpoint_id))
                insecure.data.endpoints.us = invalid.apply(insecure.data.endpoints.us)
                local change = assert(registry.snapshot()):changes()
                assert(change:update(insecure))
                local _, change_err = change:apply()
                assert(not change_err, tostring(change_err))
                local input = cases.fixture_message("Invalid endpoint")
                input.deadline = "2000-01-01T00:00:00Z"
                local result, err = cases.transport(input)
                local status, status_err = fixture.probe(fixture.admin(), "status")
                local restore = assert(registry.snapshot()):changes()
                assert(restore:update(original))
                local _, restore_err = restore:apply()
                assert(not restore_err, tostring(restore_err))

                test.is_nil(result)
                test.eq(errors.INVALID, err:kind())
                test.eq("provider_endpoint_invalid", err:details().code)
                assert(status, tostring(status_err))
                test.is_false(status.ready)
                test.eq("provider_endpoint_invalid", status.code)
            end)
        end

        test.it("refuses an expired delivery deadline before calling Mailgun", function()
            local input = cases.fixture_message("Expired delivery")
            input.deadline = "2000-01-01T00:00:00Z"
            local result, err = cases.transport(input)
            test.is_nil(result)
            test.eq(errors.UNAVAILABLE, err:kind())
            test.eq("delivery_deadline_exceeded", err:details().code)
            test.is_true(err:retryable())
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("rejects whitespace and invalid text in saved API keys", function()
            for _, key in ipairs({" key", "key ", "key\t", "key\u{00a0}", "key" .. string.char(255), 42}) do
                local result = cases.configure({["kickside.mail.mailgun"] = {api_key = key}})
                test.is_false(result.success)
            end
            test.is_true(assert(fixture.probe(fixture.admin(), "status")).ready)
        end)

        test.it("carries the provider retry hint on rate limiting", function()
            local _, err = cases.transport(cases.fixture_message("Retry hint"))
            test.eq(errors.RATE_LIMITED, err:kind())
            test.is_true(err:retryable())
            local delay = err:details().retry_after_ms
            test.not_nil(delay)
            test.is_true(delay >= 115000 and delay <= 120000)
        end)

        test.it("carries bounded provider text without credentials or controls", function()
            local result, err = cases.transport(cases.fixture_message("Unsafe provider detail"))
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
            local input = cases.fixture_message("HTTP 200")
            local queued = assert(cases.send(owner, input))
            local delivered = fixture.terminal(fixture.admin(), queued.message_id)
            test.eq("sent", delivered.status)
            test.not_nil(delivered.sent_at)
            test.is_nil(delivered.provider_message_id)
            test.eq(1, #cases.requests("POST", input.subject))
        end)

        local status_cases = {
            {400, errors.INVALID, "message_rejected", false},
            {401, errors.PERMISSION_DENIED, "credentials_invalid", false},
            {403, errors.PERMISSION_DENIED, "authorization_refused", false},
            {413, errors.INVALID, "message_rejected", false},
            {429, errors.RATE_LIMITED, "rate_limited", true},
            {500, errors.UNAVAILABLE, "provider_unavailable", true},
            {503, errors.UNAVAILABLE, "provider_unavailable", true},
            {404, errors.INTERNAL, "provider_rejected", false},
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
                if case[1] == 403 then
                    test.eq("Please add the address to your authorized recipients.", err:details().provider_detail)
                end
            end)
        end

    end)
end)}
