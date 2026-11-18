-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local client = require("client")
local fixture = require("fixture")
local rotation = require("rotation")
return {run = test.run_cases(function()
    test.describe("SimpleFIN external credential errors", function()
        test.it("keeps an echoed access URL out of connection results and rotation HTTP responses", function()
            for _, result in ipairs({assert(client.claim("https://bridge.example/claim")),
                assert(client.accounts({base_url = "https://bridge.example/simplefin", authorization = "Basic fixture"}))}) do
                test.is_false(result.success)
                test.eq(result.status_code, 500)
                test.eq(result.code, "provider_error")
                test.eq(result.error, "SimpleFIN request failed with status 500")
                test.is_nil(assert(json.encode(result)):find(fixture.secret, 1, true))
            end
            rotation.handler()
            test.eq(fixture.status, 400)
            test.is_nil(fixture.body:find(fixture.secret, 1, true))
            test.is_nil(fixture.body:find("simplefin-external-error-sentinel", 1, true))
            test.not_nil(fixture.body:find("status 500", 1, true))
        end)
    end)
end)}
