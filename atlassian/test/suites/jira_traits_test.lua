-- Jira tool (toolkit) tests. Success paths fire live HTTP and need a real token,
-- so they're integration-only; here we cover what a malformed or unconfigured
-- agent invocation hits — the connection gate, unknown actions — and that a valid
-- action routes to the right api call (transport stubbed).

local test = require("test")
local json = require("json")
local transport = require("transport")
local jira_get = require("jira_get")
local jira_write = require("jira_write")

local function with_conn(recorder: any)
    transport.connect = function(_: any): any return { deployment = "cloud", jira_base = "https://x/rest/api/3" }, nil end
    transport.request_json = recorder or function(): any return { success = true, data = {} } end
end

local function define_tests()
    test.describe("Jira tools", function()
        test.it("returns native project and comment page offsets on Cloud", function()
            local seen = nil
            local data = { startAt = 20, maxResults = 1, total = 22, isLast = false,
                values = { { id = "123", key = "ABC", name = "Project" } },
                comments = { { id = "c1", body = "comment", author = { displayName = "Reader" } } } }
            with_conn(function(_, _, url)
                seen = url
                return { success = true, data = data }
            end)
            for _, action in ipairs({"list_projects", "get_comments"}) do
                local page, err = jira_get.handler({ action = action, issue_key = "ABC-1", max_results = 1, start_at = 20 })
                test.is_nil(err)
                test.contains(seen, "maxResults=1")
                test.contains(seen, "startAt=20")
                test.eq(page.start_at, 20)
                test.eq(page.next_start_at, 21)
            end
            data.total = 21; data.isLast = true
            local final = jira_get.handler({ action = "list_projects", start_at = 20 })
            test.contains(seen, "maxResults=25")
            test.is_nil(final.next_start_at)
        end)
        test.it("pages Server project records natively when its API returns a complete list", function()
            transport.connect = function() return { deployment = "server", jira_base = "https://x/rest/api/2" }, nil end
            transport.request_json = function() return {success = true, data = {
                {id="1",key="A"}, {id="2",key="B"}, {id="3",key="D"},
            }} end
            local first = jira_get.handler({ action = "list_projects", max_results = 2 })
            test.eq(first.count, 2); test.eq(first.next_start_at, 2)
            local last = jira_get.handler({ action = "list_projects", max_results = 2, start_at = first.next_start_at })
            test.eq(last.count, 1); test.eq(last.projects[1].id, "3"); test.is_nil(last.next_start_at)
        end)
        test.it("fail with the typed connection error", function()
            local failure = errors.new({ kind = errors.INVALID, message = "no Atlassian connection selected — configure the trait's connection" })
            transport.connect = function(_: any): any return nil, failure end
            local read, read_err = jira_get.handler({ action = "list_projects" })
            test.is_nil(read)
            test.eq(read_err, failure)
            local written, write_err = jira_write.handler({ action = "create_issue" })
            test.is_nil(written)
            test.eq(write_err, failure)
        end)

        test.it("fail with the typed transport error", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            transport.connect = function(_: any): any return { deployment = "cloud", jira_base = "https://x/rest/api/3" }, nil end
            transport.request_json = function(): (any?, error?) return nil, failure end
            local read, read_err = jira_get.handler({ action = "get_issue", issue_key = "ABC-1" })
            test.is_nil(read)
            test.eq(read_err, failure)
            local written, write_err = jira_write.handler({ action = "add_comment", issue_key = "ABC-1", comment = "x" })
            test.is_nil(written)
            test.eq(write_err, failure)
        end)

        test.it("return a Jira rejection as a domain error with its status and body", function()
            with_conn(function(): any return { success = false, error = "Issue does not exist", status_code = 404,
                data = { errorMessages = { "Issue does not exist" } } } end)
            local out: any = jira_get.handler({ action = "get_issue", issue_key = "ABC-9" })
            test.is_false(out.success)
            test.eq(out.error, "Issue does not exist")
            test.eq(out.status_code, 404)
            test.eq(out.data.errorMessages[1], "Issue does not exist")
        end)

        test.it("reject an unknown action", function()
            with_conn(nil)
            test.is_true((jira_get.handler({ action = "drop_table" }) :: any).error:find("unknown action") ~= nil)
            test.is_true((jira_write.handler({ action = "drop_table" }) :: any).error:find("unknown action") ~= nil)
        end)

        test.it("renders ADF descriptions and comments with inline text and line breaks", function()
            local body = { type = "doc", content = {
                { type = "paragraph", content = { { type = "text", text = "North" }, { type = "text", text = "wind" },
                    { type = "hardBreak" }, { type = "text", text = "Order <42> & ready" } } },
                { type = "paragraph", content = { { type = "mention", attrs = { text = "@Ada" } },
                    { type = "text", text = " approves " }, { type = "emoji", attrs = { shortName = ":thumbsup:" } } } },
            } }
            with_conn(function(): any return { success = true, data = { fields = { description = body }, comments = {
                { id = "1", body = body }, { id = "2", body = "Server plain text" }, { id = "3" } } } } end)
            local issue: any = jira_get.handler({ action = "get_issue", issue_key = "ABC-1" })
            local out: any = jira_get.handler({ action = "get_comments", issue_key = "ABC-1" })
            test.is_nil(out.comments[1].body_text)
            test.is_nil(out.comments[1].body)
            test.is_nil(out.comments[2].body_text)
            test.is_nil(out.comments[3].body_text)
            test.eq(issue.issue.description_text, "Northwind\nOrder <42> & ready\n\n@Ada approves :thumbsup:")
            test.eq(issue.issue.fields.description, body)
        end)

        test.it("returns complete issue descriptions and comment bodies", function()
            local large = string.rep("é large text ", 4000)
            local seen: any = nil
            with_conn(function(_, _, url)
                seen = url
                if url:find("/comment/c1", 1, true) then return {success = true, data = {id = "c1", body = large}} end
                if url:find("/comment", 1, true) then
                    return {success = true, data = {startAt = 0, maxResults = 2, total = 3,
                        comments = {{id = "c1", body = large, author = {displayName = "Ada"}}, {id = "c2", body = "short"}}}}
                end
                return {success = true, data = {id = "1", key = "ABC-1", fields = {summary = "S", description = large}}}
            end)
            local issue: any = jira_get.handler({action = "get_issue", issue_key = "ABC-1"})
            test.eq(issue.issue.description_text, large)
            test.eq(issue.issue.fields.description, large)
            local comments: any = jira_get.handler({action = "get_comments", issue_key = "ABC-1", max_results = 2})
            test.contains(seen, "maxResults=2")
            test.eq(comments.count, 2)
            test.is_nil(comments.comments[1].body_text)
            test.eq(comments.comments[1].author.displayName, "Ada")
            test.is_nil(comments.comments[2].body_text)
            test.eq(comments.next_start_at, 2)
            jira_get.handler({action = "get_comments", issue_key = "ABC-1"})
            test.contains(seen, "maxResults=25")
            local removed: any = jira_get.handler({action = "get_comment", issue_key = "ABC-1", comment_id = "c1"})
            test.is_true(removed.success)
            test.eq(removed.comment.body_text, large)
        end)

        test.it("returns compact Cloud search rows and preserves its token", function()
            local seen: any = nil
            with_conn(function(c: any, m: string, u: string, b: any): any
                seen = b
                return {success = true, data = {issues = {{id = "1", key = "ABC-1", fields = {
                    summary = "Assigned ticket", status = {name = "Open", description = "Full status description"}, issuetype = {name = "Story", description = "Full type description"}, description = string.rep("large ", 10000)}}},
                    nextPageToken = "next-page", isLast = false}}
            end)
            local out: any = jira_get.handler({action = "search_issues", next_page_token = "previous-page", max_results = 5000})
            test.eq(seen.nextPageToken, "previous-page")
            test.eq(seen.maxResults, 100)
            test.eq(seen.fields[1], "summary")
            test.eq(out.issues[1].key, "ABC-1")
            test.is_nil(out.issues[1].description_text)
            test.is_nil(out.issues[1].fields.description)
            test.is_nil(out.issues[1].fields.status.description)
            test.is_nil(out.issues[1].fields.issuetype.description)
            test.eq(out.next_page_token, "next-page")
            test.is_false(out.is_last)
            test.is_nil(out.truncated)
        end)

        test.it("returns every issue field the tool reads", function()
            local seen: any = nil
            local issue = { id = "10001", key = "ABC-7", fields = {
                summary = "Ship the importer", status = { name = "In Progress" }, priority = { name = "High" },
                issuetype = { name = "Story" }, resolution = { name = "Done" }, labels = { "import", "q4" },
                components = { { name = "Backend" } }, project = { id = "1", key = "ABC", name = "Alpha" },
                assignee = { displayName = "Ada", accountId = "acc-1", emailAddress = "ada@example.test" },
                reporter = { displayName = "Bob", name = "bob" },
                parent = { id = "10000", key = "ABC-1", fields = { summary = "Importer epic" } },
                created = "2026-10-01T09:00:00.000+0000", updated = "2026-10-14T09:00:00.000+0000", duedate = "2026-10-30",
                description = "Plain description",
            } }
            with_conn(function(_, _, _, body: any): any
                seen = body
                return { success = true, data = body and { issues = { issue }, isLast = true } or issue }
            end)
            local got: any = jira_get.handler({ action = "get_issue", issue_key = "ABC-7" })
            local row = got.issue
            test.eq(row.id, "10001")
            test.eq(row.key, "ABC-7")
            test.eq(row.fields.project.name, "Alpha")
            test.eq(row.fields.issuetype.name, "Story")
            test.eq(row.fields.assignee.emailAddress, "ada@example.test")
            test.eq(row.fields.reporter.name, "bob")
            test.eq(row.fields.labels[2], "q4")
            test.eq(row.fields.components[1].name, "Backend")
            test.eq(row.fields.parent.fields.summary, "Importer epic")
            test.eq(row.fields.duedate, "2026-10-30")
            test.eq(row.description_text, "Plain description")
            local page: any = jira_get.handler({ action = "search_issues", jql = "project = ABC" })
            test.eq(page.issues[1].fields.assignee.displayName, "Ada")
            test.eq(seen.fields[1], "summary")
        end)

        test.it("requests explicit search fields on Cloud and Server", function()
            local seen: any = nil
            with_conn(function(_, _, url, body)
                seen = body or url
                return {success = true, data = {issues = {{id = "1", key = "ABC-1", fields = {description = "Full", customfield_10010 = "Gold"}}}}}
            end)
            local page: any = jira_get.handler({action = "search_issues", fields = {"description", "customfield_10010"}})
            test.eq(seen.fields[1], "description")
            test.eq(page.issues[1].fields.customfield_10010, "Gold")
            test.eq(page.issues[1].description_text, "Full")
            transport.connect = function() return {deployment = "server", jira_base = "https://x/rest/api/2"} end
            jira_get.handler({action = "search_issues", fields = {"description", "customfield_10010"}})
            test.contains(seen, "fields=description%2Ccustomfield_10010")
        end)

        test.it("returns custom fields and every other field Jira answers", function()
            local issue = { id = "10002", key = "ABC-8", self = "https://x/rest/api/3/issue/10002",
                fields = { summary = "Custom", customfield_10010 = { value = "Gold" }, timetracking = { originalEstimate = "2h" } },
                renderedFields = { summary = "Custom" }, changelog = { total = 3 } }
            with_conn(function(): any return { success = true, data = issue } end)
            local row = (jira_get.handler({ action = "get_issue", issue_key = "ABC-8" }) :: any).issue
            test.eq(row.self, "https://x/rest/api/3/issue/10002")
            test.eq(row.fields.customfield_10010.value, "Gold")
            test.eq(row.fields.timetracking.originalEstimate, "2h")
            test.eq(row.changelog.total, 3)
        end)

        test.it("returns full project and transition records", function()
            with_conn(function(_, _, url: string): any
                if url:find("/transitions", 1, true) then
                    return { success = true, data = { transitions = { { id = "31", name = "Done", hasScreen = false,
                        to = { name = "Done", description = "Full status detail", statusCategory = { key = "done" } } } } } }
                end
                return { success = true, data = { id = "1", key = "ABC", name = "Alpha", projectTypeKey = "software",
                    lead = { displayName = "Ada", accountId = "acc-1" }, issueTypes = { { name = "Story" } } } }
            end)
            local project = (jira_get.handler({ action = "get_project", project_key = "ABC" }) :: any).project
            test.eq(project.lead.accountId, "acc-1")
            test.eq(project.issueTypes[1].name, "Story")
            local transitions = (jira_get.handler({ action = "get_transitions", issue_key = "ABC-1" }) :: any).transitions
            test.eq(transitions[1].to.statusCategory.key, "done")
            test.is_false(transitions[1].hasScreen)
            test.is_nil(transitions[1].to.description)
        end)

        test.it("returns the created issue and comment records", function()
            with_conn(function(_, _, url: string): any
                if url:find("/comment", 1, true) then
                    return { success = true, data = { id = "c9", created = "2026-10-15", author = { displayName = "Bot" } } }
                end
                return { success = true, data = { id = "10003", key = "ABC-9", self = "https://x/rest/api/3/issue/10003" } }
            end)
            local created: any = jira_write.handler({ action = "create_issue", project_key = "ABC", summary = "x" })
            test.eq(created.issue_key, "ABC-9")
            test.eq(created.issue.self, "https://x/rest/api/3/issue/10003")
            local commented: any = jira_write.handler({ action = "add_comment", issue_key = "ABC-9", comment = "hi" })
            test.eq(commented.comment_id, "c9")
            test.eq(commented.comment.author.displayName, "Bot")
        end)

        test.it("returns Server offsets and total without losing issue keys", function()
            transport.connect = function(_: any): any return {deployment = "server", jira_base = "https://x/rest/api/2"}, nil end
            transport.request_json = function(): any
                return {success = true, data = {issues = {{id = "1", key = "ABC-1", fields = {summary = "Ticket"}}},
                    startAt = 10, maxResults = 1, total = 12}}
            end
            local out: any = jira_get.handler({action = "search_issues", start_at = 10, max_results = 1})
            test.eq(out.start_at, 10)
            test.eq(out.total, 12)
            test.eq(out.next_start_at, 11)
        end)

        test.it("route read/write actions to the api", function()
            local seen: any = {}
            with_conn(function(c: any, m: string, u: string, b: any): any seen = { method = m, url = u, body = b }; return { success = true, data = {} } end)
            jira_get.handler({ action = "search_issues", jql = "project = ABC" })
            test.is_true(seen.url:find("/search/jql") ~= nil, tostring(seen.url))
            jira_write.handler({ action = "create_issue", project_key = "ABC", summary = "x" })
            test.eq(seen.method, "POST")
            test.eq(seen.body.fields.project.key, "ABC")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
