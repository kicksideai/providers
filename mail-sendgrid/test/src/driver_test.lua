-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local fs = require("fs")
local json = require("json")
local registry = require("registry")
local contract = require("contract")
local fixture = require("fixture")
local cases = require("cases")

return {run = test.run_cases(function()
    test.describe("SendGrid transport via real Settings and Uploads", function()
        test.it("lists the SendGrid transport with display data and delivery limits", function()
            local current = assert(fixture.probe(cases.delivery_admin(), "delivery_status"))
            local status = assert(cases.sendgrid_status(current))
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
            owner = cases.configured_sender()
        end)

        test.it("sends the exact request for a notice and reads the ID from the empty 202 response", function()
            local pdf = assert(fixture.probe(owner, "store", {bytes = "pdf\0bytes", filename = "source.pdf", content_type = "application/pdf"}))
            local png = assert(fixture.probe(owner, "store", {bytes = "\137PNG\0\255", filename = "logo.png", content_type = "image/png"}))
            local result, err = cases.send(owner, {
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
                    {filename = "logo.png", type = "image/png", content = cases.library_logo(), disposition = "inline", content_id = "mail-library-logo"},
                },
            }
            test.eq(assert(json.encode(expected)), assert(json.encode(captured.payload)))
        end)

        test.it("uses the configured From and omits empty optional fields", function()
            local input = cases.fixture_message("HTML only")
            input.cc, input.bcc = {}, {}
            input.text, input.html = "", "<p>Hello</p>"
            test.is_true(cases.configure({["kickside.mail"] = {from_name = "", reply_to = ""}}).success)
            local queued = assert(cases.send(owner, input))
            test.eq("queued", queued.status)
            fixture.terminal(owner, queued.message_id)
            local captured = cases.requests("POST", input.subject)[1].payload
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
            local admin = cases.delivery_admin()
            local available = assert(cases.sendgrid_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_true(available.ready)
            test.is_true(cases.configure({["kickside.mail.sendgrid"] = {api_key = ""}}).success)
            local unavailable = assert(cases.sendgrid_status(assert(fixture.probe(admin, "delivery_status"))))
            test.is_false(unavailable.ready)
            test.eq("invalid_config", unavailable.code)
            test.is_true(type(unavailable.reason) == "string" and #unavailable.reason > 0)
            local input = cases.fixture_message("Unconfigured driver")
            local result, err = cases.send(owner, input)
            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("invalid_config", err:details().code)
            test.is_false(err:retryable())
            test.eq(0, #cases.requests("POST", input.subject))
        end)

        test.it("reads the SendGrid key without exposing credentials or borrowing another namespace's key", function()
            local reader = fixture.scoped({"app:transport_status_access"})
            local foreign = {namespace = "app.unrelated"}
            local own = {namespace = "kickside.mail.sendgrid"}
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
            test.is_nil(cases.sendgrid_status(current))
            test.eq("driver_not_admitted", current.code)
            test.is_nil(sent)
            test.eq(errors.INVALID, send_err:kind())
            test.eq("driver_not_admitted", send_err:details().code)
            test.not_nil(cases.sendgrid_status(assert(fixture.probe(admin, "delivery_status"))))
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
            local input = cases.fixture_message("Insecure endpoint")
            input.deadline = "2000-01-01T00:00:00Z"
            local result, err = cases.transport(input)
            local restore = assert(registry.snapshot()):changes()
            assert(restore:update(original))
            local _, restore_err = restore:apply()
            assert(not restore_err, tostring(restore_err))

            test.is_nil(result)
            test.eq(errors.INVALID, err:kind())
            test.eq("provider_endpoint_invalid", err:details().code)
        end)

        test.it("refuses an expired delivery deadline before calling SendGrid", function()
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
                local result = cases.configure({["kickside.mail.sendgrid"] = {api_key = key}})
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
            test.is_nil(detail:find("sg_fixture", 1, true))
            test.is_nil(detail:find("%c"))
            test.is_true(#detail <= 512)
        end)

        test.it("marks an accepted 202 without a provider ID as sent", function()
            local input = cases.fixture_message("HTTP 202")
            local queued = assert(cases.send(owner, input))
            local delivered = fixture.terminal(fixture.admin(), queued.message_id)
            test.eq("sent", delivered.status)
            test.not_nil(delivered.sent_at)
            test.is_nil(delivered.provider_message_id)
            test.eq(1, #cases.requests("POST", input.subject))
        end)

    end)
end)}
