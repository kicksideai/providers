local test = require("test")
local core = require("pull_core")
local conformance = require("conformance")

local function issue(key: string, updated: string, summary: string, description: any): any
    return {
        id = key:gsub("%D", ""),
        key = key,
        fields = {
            summary = summary,
            description = description,
            updated = updated,
            created = "2026-06-01T09:00:00.000+0000",
            status = { name = "To Do" },
            issuetype = { name = "Task" },
            priority = { name = "Medium" },
            assignee = { displayName = "Ada" },
            reporter = { displayName = "Grace" },
        },
    }
end

local function adf(text: string): any
    return { type = "doc", version = 1, content = { { type = "paragraph", content = { { type = "text", text = text } } } } }
end

local function new_fake(): any
    local fake: any = { searches = {}, connect_ids = {} }
    function fake.connect(component_id: string?): (any, string?)
        if component_id == "bad" then return nil, "revoked" end
        fake.connect_ids[#fake.connect_ids + 1] = component_id
        return { component_id = component_id, deployment = "server", jira_base = "https://example.atlassian.net/rest/api/3" }, nil
    end
    function fake.search_issues(_conn: any, jql: string, start_at: integer?, max_results: integer?): any
        fake.searches[#fake.searches + 1] = { jql = jql, start_at = start_at, max_results = max_results }
        if start_at == 2 then
            return { success = true, data = { startAt = 2, maxResults = max_results, total = 3, issues = {
                issue("ABC-3", "2026-06-03T10:00:00.000+0000", "Third", "plain body"),
            } } }
        end
        return { success = true, data = { startAt = 0, maxResults = max_results, total = 3, issues = {
            issue("ABC-1", "2026-06-01T10:00:00.000+0000", "First", adf("ADF body")),
            issue("ABC-2", "2026-06-02T10:00:00.000+0000", "Second", "<b>HTML body</b>"),
        } } }
    end
    return fake
end

local function define_tests()
    test.describe("Jira pull_core", function()
        test.it("paginates issues, emits clean upserts, versions, and source urls", function()
            local fake = new_fake()
            local first = core.pull({ config = { connection_id = "conn1", project_key = "ABC" }, limit = 2 }, { transport = fake, jira = fake })
            test.eq(first.success, true)
            test.eq(first.has_more, true)
            test.eq(first.items[1].item_key, "jira:issue:ABC-1")
            test.eq(first.items[1].op, "upsert")
            test.eq(first.items[1].source_version, "2026-06-01T10:00:00.000+0000")
            test.eq(first.items[1].payload.content_type, "text/markdown")
            test.eq(first.items[1].payload.issue_priority, "Medium")
            test.eq(first.items[1].payload.properties.priority.name, "Medium")
            test.is_nil(first.items[1].payload.priority)

            test.is_true(first.items[2].payload.content:find("<b>", 1, true) == nil, "HTML tags must be stripped")
            test.eq(first.items[1].payload.source_url, "https://example.atlassian.net/browse/ABC-1")

            local second = core.pull({ cursor = first.next_cursor, config = { connection_id = "conn1", project_key = "ABC" }, limit = 2 }, { transport = fake, jira = fake })
            test.eq(second.success, true)
            test.eq(second.has_more, false)
            test.eq(second.next_cursor.phase, "live")
            test.eq(second.next_cursor.hw, "2026-06-03T10:00:00.000+0000")
        end)

        test.it("resumes Cloud tokens and replays a page with a fixed live query", function()
            local seen: any = {}
            local fake: any = {}
            function fake.connect(_: any): any return { deployment = "cloud", jira_base = "https://example.atlassian.net/rest/api/3" }, nil end
            function fake.search_issues(_: any, jql: string, start_at: integer?, limit: integer?, token: string?): any
                seen[#seen + 1] = { jql = jql, token = token, limit = limit }
                local n = token == "page-2" and 2 or token == "page-3" and 3 or 1
                return { success = true, data = { isLast = n == 3, nextPageToken = n < 3 and "page-" .. tostring(n + 1) or nil,
                    issues = { issue("ABC-" .. tostring(n), "2026-06-0" .. tostring(n) .. "T10:00:00.000+0000", "Issue", adf("Body")) } } }
            end
            for _, initial in ipairs({ { phase = "backfill" }, { phase = "live", hw = "2026-05-01T00:00:00.000+0000" } }) do
                local req: any = { config = { connection_id = "conn1", project_key = "ABC" }, cursor = initial, limit = 1 }
                local first = core.pull(req, { transport = fake, jira = fake })
                test.eq(first.has_more, true)
                test.eq(first.next_cursor.next_page_token, "page-2")
                local q = seen[#seen].jql
                req.cursor = first.next_cursor
                local second = core.pull(req, { transport = fake, jira = fake })
                test.eq(seen[#seen].token, "page-2")
                test.eq(seen[#seen].jql, q)
                test.eq(second.items[1].item_key, "jira:issue:ABC-2")
                local replay = core.pull(req, { transport = fake, jira = fake })
                test.eq(replay.items[1].dedup_key, second.items[1].dedup_key)
                test.eq(seen[#seen].jql, q)
                req.cursor = second.next_cursor
                local last = core.pull(req, { transport = fake, jira = fake })
                test.eq(last.items[1].item_key, "jira:issue:ABC-3")
                test.eq(last.has_more, false)
                test.eq(last.next_cursor.phase, "live")
                test.eq(last.next_cursor.hw, "2026-06-03T10:00:00.000+0000")
                test.is_nil(last.next_cursor.next_page_token)
            end
        end)

        test.it("does not complete a Cloud page with a missing or repeated continuation token", function()
            local fake: any = {}
            function fake.connect(_: any): any return { deployment = "cloud" }, nil end
            for _, token in ipairs({ "", "same" }) do
                function fake.search_issues(): any return { success = true, data = { isLast = false, nextPageToken = token, issues = {} } } end
                local out = core.pull({ cursor = { phase = "backfill", next_page_token = "same" } }, { transport = fake, jira = fake })
                test.eq(out.success, false)
                test.not_nil(out.error)
            end
        end)

        test.it("preserves ADF inline boundaries, hard breaks and literal text in source descriptions", function()
            local fake = new_fake()
            function fake.search_issues(): any return { success = true, data = { total = 1, issues = {
                issue("ABC-1", "2026-06-01T10:00:00.000+0000", "Title", { type = "doc", content = {
                    { type = "paragraph", content = { { type = "text", text = "North" }, { type = "text", text = "wind" },
                        { type = "hardBreak" }, { type = "text", text = "Order <42> & ready" } } } } }) } } } end
            local out = core.pull({ config = { connection_id = "conn1" } }, { transport = fake, jira = fake })
            test.eq(out.items[1].payload.content, "# Title\n\nNorthwind\nOrder <42> & ready")
        end)

        test.it("adds project/JQL and backfill filters to the JQL", function()
            local fake = new_fake()
            core.pull({ config = { connection_id = "conn1", project_key = "ABC", backfill_since = "2026-06-02T00:00:00.000+0000" }, limit = 2 }, { transport = fake, jira = fake })
            test.is_true(fake.searches[1].jql:find("project = ABC", 1, true) ~= nil, tostring(fake.searches[1].jql))
            test.is_true(fake.searches[1].jql:find("updated >=", 1, true) ~= nil, tostring(fake.searches[1].jql))
            test.is_true(fake.searches[1].jql:find("ORDER BY updated ASC", 1, true) ~= nil, tostring(fake.searches[1].jql))
        end)

        test.it("classifies connection failure as auth_expired", function()
            local res = core.pull({ config = { connection_id = "bad" } }, { transport = new_fake(), jira = new_fake() })
            test.eq(res.success, false)
            test.eq(res.error.code, "auth_expired")
            test.eq(res.error.scope, "connection")
        end)

        test.it("passes the pullable conformance kit offline", function()
            local fake = new_fake()
            local result = conformance.run({
                pull = function(req: any): any return core.pull(req, { transport = fake, jira = fake }) end,
                config = { connection_id = "conn1", project_key = "ABC" },
                failure_config = { connection_id = "bad", project_key = "ABC" },
                backfill_since = { mode = "honored", value = "2026-06-01T00:00:00.000+0000" },
                limit = 2,
                max_pages = 5,
            })
            test.eq(result.success, true, conformance.format_failures(result))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
