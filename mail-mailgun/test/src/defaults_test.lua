-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local registry = require("registry")

local SETTINGS = "kickside.mail.mailgun"
local POLICY = "kickside.mail.mailgun.security:http_access"

return {run = test.run_cases(function()
    test.describe("Mailgun installation defaults", function()
        test.it("is ready with only an API key and a sending domain", function()
            local domain = assert(registry.get(SETTINGS .. ".settings:setting_domain"))
            test.eq("", domain.data.default)
            local admin = fixture.admin()
            local saved = assert(fixture.probe(admin, "configure", {
                settings = {[SETTINGS] = {api_key = "mg_fixture", domain = "fresh.example.org"}},
            }))
            test.is_true(saved.success, saved.error)
            local status = assert(fixture.probe(admin, "status"))
            test.is_true(status.ready, status.reason)
        end)

        test.it("admits both Mailgun API bases and refuses other origins and paths", function()
            local caller = fixture.scoped({POLICY})
            local function allowed(url)
                local permitted, err = fixture.probe(caller, "may_request", {url = url})
                test.is_nil(err, tostring(err))
                return permitted
            end
            test.is_true(allowed("https://api.mailgun.net/v3/fresh.example.org/messages"))
            test.is_true(allowed("https://api.eu.mailgun.net/v3/fresh.example.org/messages"))
            test.is_false(allowed("https://api.mailgun.net/v30/fresh.example.org/messages"))
            test.is_false(allowed("https://api.eu.mailgun.net/v4/fresh.example.org/messages"))
            test.is_false(allowed("https://api.mailgun.net.example.org/v3/fresh.example.org/messages"))
            test.is_false(allowed("https://mailgun.example.org/v3/fresh.example.org/messages"))
        end)
    end)
end)}
