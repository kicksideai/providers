-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
local socket_api = require("socket_api")
return {run = test.run_cases(function()
    test.describe("Slack stored worker credentials", function()
        test.it("normalizes the stored token before constructing the authentication header", function()
            worker.main({component_id = "fixture-connection"})
            test.eq(fixture.authorization, "Bearer xapp-valid-token")
        end)
        test.it("keeps credential-bearing dial errors out of returned errors", function()
            local ticket = "socket-ticket-sentinel"
            local url = "wss://socket.example.invalid/link?ticket=" .. ticket
            fixture.url = url
            for _, detail in ipairs({
                'Get "' .. url .. '": context deadline exceeded',
                'dial "' .. url .. '": ' .. string.rep("untrusted-detail", 1000),
            }) do
                fixture.dial_error = detail
                local client, err = socket_api.connect(url)
                test.is_nil(client)
                test.eq(err, "socket connect failed: transport")
                test.is_nil((err:find(ticket, 1, true)))
                test.is_nil((err:find(url, 1, true)))
                test.eq(fixture.dialed_url, url)
                test.eq(fixture.dial_timeout, 10)
            end
            fixture.url, fixture.dial_error = nil, nil
        end)
        test.it("keeps the websocket ticket out of worker logs", function()
            fixture.url = "wss://socket.example.invalid/link?ticket=worker-ticket-sentinel"
            fixture.dial_error = 'Get "' .. fixture.url .. '": context deadline exceeded'
            worker.main({component_id = "fixture-connection"})
            test.eq(fixture.logged_error, "socket connect failed: transport")
            test.is_nil(fixture.logged_error:find("worker-ticket-sentinel", 1, true))
            test.is_nil(fixture.logged_message:find("worker-ticket-sentinel", 1, true))
            fixture.url, fixture.dial_error = nil, nil
        end)
        test.it("reports an absent websocket client without exposing the URL", function()
            fixture.dial_error = nil
            local client, err = socket_api.connect("wss://socket.example.invalid/?ticket=absent-client-sentinel")
            test.is_nil(client)
            test.eq(err, "socket connect failed: transport")
        end)
        test.it("preserves a successful websocket client", function()
            fixture.dial_error = nil
            fixture.client = {}
            local client, err = socket_api.connect("wss://socket.example.invalid/?ticket=success-sentinel")
            test.eq(client, fixture.client)
            test.is_nil(err)
            fixture.client = nil
        end)
    end)
end)}
