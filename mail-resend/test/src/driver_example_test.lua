-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local uuid = require("uuid")
local fs = require("fs")
local json = require("json")

local SETTINGS = "kickside.mail.example"
local BINDING = SETTINGS .. ":transport"

return {run = test.run_cases(function()
    test.describe("Mail driver authoring example", function()
        test.it("becomes ready through Settings and delivers through Mail's public contract", function()
            local admin = fixture.admin()
            local function status()
                local delivery = assert(fixture.probe(admin, "delivery_status"))
                for _, transport in ipairs(delivery.transports) do
                    if transport.id == BINDING then return transport end
                end
            end
            local unconfigured = assert(status(), "Example driver was not discovered")
            test.is_false(unconfigured.ready)
            test.eq("api_key_required", unconfigured.code)

            local configured = assert(fixture.probe(admin, "configure", {settings = {
                [SETTINGS] = {api_key = "re_fixture"},
                ["kickside.mail"] = {driver = BINDING, from_address = "sender@example.org"},
            }}))
            test.is_true(configured.success, configured.error)
            local ready = assert(status())
            test.is_true(ready.ready)
            test.eq(SETTINGS, ready.settings_ns)
            test.is_false(ready.idempotent)

            local sender = fixture.user()
            local subject = "Driver example " .. uuid.v4()
            local result = assert(fixture.probe(sender, "send", {message = {
                to = {"recipient@example.org"}, subject = subject, text = "Hello",
            }}))
            test.eq("queued", result.status)
            local delivered = fixture.terminal(admin, result.message_id)
            test.not_nil(delivered.provider_message_id)
            local volume = assert(fs.get("app:resend_requests"))
            local request = assert(json.decode(assert(volume:readfile(delivered.provider_message_id .. ".json"))))
            test.is_true(request.authorized)
            test.eq(subject, request.payload.subject)
        end)
    end)
end)}
