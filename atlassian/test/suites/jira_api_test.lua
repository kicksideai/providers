-- Jira API client unit tests. The live HTTP is replaced by a recording stub on
-- the shared transport (transport.request_json is the single chokepoint every
-- verb routes through), so these assert the exact endpoint, verb, version and
-- request body each operation builds — per deployment — without a network call.
-- Success-path responses against a real site are integration-only.

local test = require("test")
local transport = require("transport")
local jira = require("jira")
local atlassian_types = require("types")

local last: any = nil
local function install_recorder(response: any)
    last = nil
    transport.request_json = function(conn: any, method: string, url: string, body: any): any
        last = { method = method, url = url, body = body }
        return response or { success = true, data = {} }
    end
end

local CLOUD: atlassian_types.Conn = {
    mode = "credential",
    deployment = "cloud",
    jira_base = "https://acme.atlassian.net/rest/api/3",
    confluence_base = "",
}
local SERVER: atlassian_types.Conn = {
    mode = "credential",
    deployment = "server",
    jira_base = "https://jira.acme.com/rest/api/2",
    confluence_base = "",
}

local function define_tests()
    test.describe("Jira API client", function()
        test.it("rejects Cloud offsets that cannot select a subsequent search page", function()
            install_recorder(nil)
            local result = jira.search_issues(CLOUD, "project=ABC", 10, 25)
            test.is_false(result.success)
            test.contains(result.error, "next_page_token")
            test.is_nil(last)
        end)
        test.it("bounds Cloud project pages and comment pages without changing Server project discovery", function()
            install_recorder(nil)
            jira.list_projects(CLOUD, 999, 20)
            test.contains(last.url, "maxResults=100")
            test.contains(last.url, "startAt=20")
            jira.list_projects(SERVER, 999, 20)
            test.eq(last.url, SERVER.jira_base .. "/project")
            jira.get_comments(CLOUD, "ABC-1", 999, 20)
            test.contains(last.url, "maxResults=100")
            test.contains(last.url, "startAt=20")
            for _, limit in ipairs({ 0, -1, 1.5 }) do
                last = nil
                test.is_false(jira.list_projects(CLOUD, limit, 0).success)
                test.is_nil(last)
                test.is_false(jira.get_comments(CLOUD, "ABC-1", limit, 0).success)
                test.is_nil(last)
            end
            test.is_false(jira.get_comments(CLOUD, "ABC-1", 25, -1).success)
            test.is_false(jira.list_projects(CLOUD, 25, 1.5).success)
        end)
        test.it("wraps text as ADF for Cloud, plain for Server", function()
            local adf: any = jira._adf_text("hello")
            test.eq(adf.type, "doc")
            test.eq(adf.content[1].content[1].text, "hello")
        end)

        test.it("normalizes project lists (Cloud .values vs Server array)", function()
            test.eq(#jira.project_list(CLOUD, { values = { {}, {} } }), 2)
            test.eq(#jira.project_list(SERVER, { {}, {}, {} }), 3)
        end)

        test.it("list_projects: Cloud project/search, Server project", function()
            install_recorder(nil)
            jira.list_projects(CLOUD, 50)
            test.eq(last.method, "GET")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/project/search?maxResults=50")
            jira.list_projects(SERVER)
            test.eq(last.url, "https://jira.acme.com/rest/api/2/project")
        end)

        test.it("get_project: encodes the key; requires it", function()
            install_recorder(nil)
            jira.get_project(CLOUD, "ABC")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/project/ABC")
            local r = jira.get_project(CLOUD, "")
            test.is_false(r.success)
        end)

        test.it("search_issues: Cloud POST /search/jql, Server GET /search", function()
            install_recorder(nil)
            jira.search_issues(CLOUD, "project = ABC", 0, 25)
            test.eq(last.method, "POST")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/search/jql")
            test.eq(last.body.jql, "project = ABC")
            test.is_nil(last.body.startAt)
            test.eq(last.body.maxResults, 25)
            test.eq(last.body.fields[1], "summary")
            jira.search_issues(SERVER, "project = ABC", 10, 5)
            test.eq(last.method, "GET")
            test.is_true(last.url:find("/rest/api/2/search%?jql=") ~= nil, last.url)
            test.is_true(last.url:find("startAt=10") ~= nil, last.url)
        end)

        test.it("sends enhanced Cloud search tokens without an offset", function()
            install_recorder(nil)
            jira.search_issues(CLOUD, "project = ABC", nil, 1, "opaque-page-2")
            test.eq(last.body.nextPageToken, "opaque-page-2")
            test.is_nil(last.body.startAt)
        end)

        test.it("bounds search pages and defaults to summary fields", function()
            install_recorder(nil)
            jira.search_issues(CLOUD, nil, nil, 10000)
            test.eq(last.body.maxResults, 100)
            test.eq(#last.body.fields, 8)
            test.eq(last.body.fields[1], "summary")
            jira.search_issues(SERVER, nil, 5, 10000)
            test.contains(last.url, "maxResults=100")
            test.contains(last.url, "fields=summary%2Cstatus")
            for _, limit in ipairs({0, -1, 1.5}) do
                last = nil
                local result = jira.search_issues(CLOUD, nil, nil, (limit :: any))
                test.is_false(result.success)
                test.is_nil(last)
            end
        end)

        test.it("get_issue / get_comments / get_transitions paths", function()
            install_recorder(nil)
            jira.get_issue(CLOUD, "ABC-1")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/issue/ABC-1")
            jira.get_comments(CLOUD, "ABC-1")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/issue/ABC-1/comment?maxResults=25&startAt=0")
            jira.get_transitions(CLOUD, "ABC-1")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/issue/ABC-1/transitions")
        end)

        test.it("create_issue: ADF description on Cloud, plain on Server; validates", function()
            install_recorder(nil)
            jira.create_issue(CLOUD, "ABC", "Summary", "Bug", "desc")
            test.eq(last.method, "POST")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/issue")
            test.eq(last.body.fields.project.key, "ABC")
            test.eq(last.body.fields.issuetype.name, "Bug")
            test.eq(last.body.fields.description.type, "doc")
            jira.create_issue(SERVER, "ABC", "Summary", nil, "desc")
            test.eq(last.body.fields.issuetype.name, "Task")
            test.eq(last.body.fields.description, "desc")
            test.is_false(jira.create_issue(CLOUD, "", "S").success)
            test.is_false(jira.create_issue(CLOUD, "ABC", "").success)
        end)

        test.it("add_comment: ADF on Cloud, plain on Server", function()
            install_recorder(nil)
            jira.add_comment(CLOUD, "ABC-1", "hi")
            test.eq(last.url, "https://acme.atlassian.net/rest/api/3/issue/ABC-1/comment")
            test.eq(last.body.body.type, "doc")
            jira.add_comment(SERVER, "ABC-1", "hi")
            test.eq(last.body.body, "hi")
        end)

        test.it("transition / assign / delete", function()
            install_recorder(nil)
            jira.transition_issue(CLOUD, "ABC-1", "31")
            test.eq(last.body.transition.id, "31")
            jira.assign_issue(CLOUD, "ABC-1", "acc-1")
            test.eq(last.body.accountId, "acc-1")
            jira.assign_issue(SERVER, "ABC-1", "jsmith")
            test.eq(last.body.name, "jsmith")
            jira.delete_issue(CLOUD, "ABC-1", true)
            test.eq(last.method, "DELETE")
            test.is_true(last.url:find("deleteSubtasks=true") ~= nil, tostring(last.url))
        end)

        test.it("update_issue: string description promoted to ADF on Cloud", function()
            install_recorder(nil)
            jira.update_issue(CLOUD, "ABC-1", { summary = "x", description = "body" })
            test.eq(last.method, "PUT")
            test.eq(last.body.fields.summary, "x")
            test.eq(last.body.fields.description.type, "doc")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
