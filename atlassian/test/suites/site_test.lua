local test = require("test")
local site = require("site")

local function define_tests()
    test.describe("Atlassian site resolution", function()
        test.it("detects cloud vs server from the site URL", function()
            test.is_true(site.is_cloud("https://acme.atlassian.net"))
            test.is_false(site.is_cloud("https://jira.acme.com"))
            test.is_false(site.is_cloud(nil))
            test.eq(site.detect_deployment("https://acme.atlassian.net"), "cloud")
            test.eq(site.detect_deployment("https://jira.acme.com"), "server")
        end)

        test.it("normalizes URLs (scheme default, trailing slash)", function()
            test.eq(site.normalize_url("https://acme.atlassian.net/"), "https://acme.atlassian.net")
            test.eq(site.normalize_url("acme.atlassian.net"), "https://acme.atlassian.net")
            test.eq(site.normalize_url(""), "")
        end)

        test.it("builds the Jira base per deployment and OAuth gateway", function()
            test.eq(site.jira_base("cloud", "https://acme.atlassian.net", nil), "https://acme.atlassian.net/rest/api/3")
            test.eq(site.jira_base("server", "https://jira.acme.com", nil), "https://jira.acme.com/rest/api/2")
            test.eq(site.jira_base("cloud", nil, "cid-123"), "https://api.atlassian.com/ex/jira/cid-123/rest/api/3")
        end)

        test.it("builds the Confluence v1 REST base per deployment and OAuth gateway", function()
            test.eq(site.confluence_base("cloud", "https://acme.atlassian.net", nil), "https://acme.atlassian.net/wiki/rest/api")
            test.eq(site.confluence_base("server", "https://wiki.acme.com", nil), "https://wiki.acme.com/rest/api")
            test.eq(site.confluence_base("cloud", nil, "cid-123"), "https://api.atlassian.com/ex/confluence/cid-123/wiki/rest/api")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
