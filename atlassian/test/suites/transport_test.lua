local test = require("test")
local base64 = require("base64")
local transport = require("transport")

local function define_tests()
    test.describe("Atlassian transport", function()
        test.it("extracts Jira errorMessages[]", function()
            local body = '{"errorMessages":["Issue does not exist"],"errors":{}}'
            local msg, code = transport.extract_error({ status_code = 404, body = body })
            test.eq(msg, "Issue does not exist")
            test.eq(code, 404)
        end)

        test.it("extracts a Jira field errors{} map", function()
            local body = '{"errorMessages":[],"errors":{"summary":"is required"}}'
            local msg = transport.extract_error({ status_code = 400, body = body })
            test.is_true(msg:find("summary: is required") ~= nil, "got: " .. msg)
        end)

        test.it("extracts a Confluence/gateway message", function()
            local msg, code = transport.extract_error({ status_code = 403, body = '{"message":"No access"}' })
            test.eq(msg, "No access")
            test.eq(code, 403)
        end)

        test.it("falls back to a truncated raw body on non-JSON", function()
            local msg, code = transport.extract_error({ status_code = 500, body = "boom" })
            test.eq(msg, "boom")
            test.eq(code, 500)
        end)

        test.it("builds a Cloud Basic header (email:api_token)", function()
            local header, deployment, err = transport.credential_header({
                site_url = "https://acme.atlassian.net", email = "e@x.com", api_token = "tok",
            })
            test.is_nil(err)
            test.eq(deployment, "cloud")
            test.eq(header, "Basic " .. base64.encode("e@x.com:tok"))
        end)

        test.it("builds a Server Bearer header (PAT)", function()
            local header, deployment, err = transport.credential_header({
                site_url = "https://jira.acme.com", personal_access_token = "pat-123",
            })
            test.is_nil(err)
            test.eq(deployment, "server")
            test.eq(header, "Bearer pat-123")
        end)

        test.it("honours an explicit deployment override", function()
            local _, deployment = transport.credential_header({
                site_url = "https://jira.acme.com", deployment = "cloud", email = "e@x.com", api_token = "t",
            })
            test.eq(deployment, "cloud")
        end)

        test.it("errors on missing credentials", function()
            local _, _, e1 = transport.credential_header({ site_url = "https://acme.atlassian.net" })
            test.not_nil(e1)
            local _, _, e2 = transport.credential_header({ site_url = "https://jira.acme.com", deployment = "server" })
            test.not_nil(e2)
            local _, _, e3 = transport.credential_header({})
            test.not_nil(e3)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
