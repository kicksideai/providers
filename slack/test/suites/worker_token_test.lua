-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local worker = require("worker")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("Slack stored worker credentials", function()
        test.it("normalizes the stored token before constructing the authentication header", function()
            worker.main({component_id = "fixture-connection"})
            test.eq(fixture.authorization, "Bearer xapp-valid-token")
        end)
    end)
end)}
