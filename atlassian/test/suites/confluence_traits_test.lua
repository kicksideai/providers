-- Confluence tool (toolkit) tests. Success paths are integration-only (live
-- HTTP + token); here we cover the connection gate, unknown actions, and that a
-- valid action routes to the right api call (transport stubbed).

local test = require("test")
local json = require("json")
local transport = require("transport")
local confluence_get = require("confluence_get")
local confluence_write = require("confluence_write")
local markdown = require("markdown")

local function with_conn(recorder: any)
    transport.connect = function(_: any): any return { deployment = "cloud", confluence_base = "https://x/wiki/rest/api" }, nil end
    transport.request_json = recorder or function(): any return { success = true, data = {} } end
end

local function define_tests()
    test.describe("Confluence tools", function()
        test.it("reports an unsupported provider continuation rather than omitting it", function()
            with_conn(function() return {success = true, data = {results = {{id = "123"}}, _links = {next = "/wiki/rest/api/content?unexpected=token"}}} end)
            local page: any = confluence_get.handler({action = "list_pages", space_key = "DOCS"})
            test.is_false(page.success)
            test.contains(page.error, "continuation")
        end)
        test.it("preserves Cloud search cursor tokens without inventing offsets", function()
            local seen = nil
            local data = {results = {{id = "123", title = "Page"}}, _links = {next = "/wiki/rest/api/content/search?cursor=next%2Bpage%2F%3D&limit=1"}}
            with_conn(function(_, _, url) seen = url; return {success = true, data = data} end)
            local page = confluence_get.handler({action = "search", query = "type=page", max_results = 1})
            test.eq(page.next_page_token, "next+page/=")
            test.is_nil(page.next_start_at)
            confluence_get.handler({action = "search", query = "type=page", max_results = 1, next_page_token = page.next_page_token})
            test.contains(seen, "cursor=next%2Bpage%2F%3D")
        end)
        test.it("returns collection page offsets and follows final-page metadata", function()
            local seen = nil
            local data = { start = 20, limit = 1, size = 1, results = { { id = "123", title = "Page", body = {storage = {value = "comment"}} } }, _links = { next = "/wiki/rest/api/content?start=21&limit=1" } }
            with_conn(function(_, _, url)
                seen = url
                return { success = true, data = data }
            end)
            for _, action in ipairs({"list_spaces", "list_pages", "list_blogposts", "search", "get_comments"}) do
                local page, err = confluence_get.handler({ action = action, space_key = "DOCS", page_id = "123", query = "type=page", max_results = 1, start_at = 20 })
                test.is_nil(err)
                test.contains(seen, "limit=1")
                test.contains(seen, "start=20")
                test.eq(page.start_at, 20)
                test.eq(page.next_start_at, 21)
                test.eq(page.count, 1)
            end
            data._links = {}
            local final = confluence_get.handler({ action = "list_spaces" })
            test.contains(seen, "limit=25")
            test.is_nil(final.next_start_at)
        end)
        test.it("returns complete page content and comment bodies as structured records", function()
            local large = string.rep("é body text ", 4000)
            local seen = nil
            with_conn(function(_, _, url)
                seen = url
                if url:find("/child/comment", 1, true) then
                    return {success = true, data = {start = 0, limit = 2, results = {
                        {id = "c1", history = {createdDate = "2026-10-01", createdBy = {displayName = "Ada"}}, body = {storage = {value = "<p>" .. large .. "</p>"}}},
                        {id = "c2", body = {storage = {value = "<p>short</p>"}}}}, _links = {next = "/wiki/rest/api/content/p1/child/comment?start=2&limit=2"}}}
                end
                return {success = true, data = {id = "p1", title = "Page", type = "page", space = {key = "DOCS"}, body = {storage = {value = "<p>" .. large .. "</p>"}}}}
            end)
            local page: any, err = confluence_get.handler({action = "read_page", page_id = "p1"})
            test.is_nil(err)
            test.eq(page.page.space.key, "DOCS")
            test.eq(page.page.content, (large:gsub("%s+$", "")))
            test.eq(page.page.body.storage.value, "<p>" .. large .. "</p>")
            local comments: any = confluence_get.handler({action = "get_comments", page_id = "p1", max_results = 2})
            test.contains(seen, "limit=2")
            test.eq(comments.count, 2)
            test.is_nil(comments.comments[1].body_markdown)
            test.is_nil(comments.comments[1].body)
            test.eq(comments.comments[1].created, "2026-10-01")
            test.eq(comments.comments[1].author.displayName, "Ada")
            test.is_nil(comments.comments[2].body_markdown)
            test.eq(comments.next_start_at, 2)
            local removed: any = confluence_get.handler({action = "get_comment", comment_id = "c1"})
            test.is_true(removed.success)
            test.eq(removed.comment.body.storage.value, "<p>" .. large .. "</p>")
        end)
        test.it("converts storage format to Markdown keeping its structure", function()
            local storage = table.concat({
                "<h2>Release &amp; rollout</h2>",
                "<p>Ship <strong>Friday</strong>, see <a href=\"https://example.test/plan\">the plan</a> &mdash; owner <ac:link><ri:page ri:content-title=\"Team Page\" /></ac:link>.</p>",
                "<ul><li><p>First</p><ul><li>Nested</li></ul></li><li>Second</li></ul>",
                "<ol><li>One</li><li>Two</li></ol>",
                "<ac:task-list><ac:task><ac:task-status>complete</ac:task-status><ac:task-body>Done task</ac:task-body></ac:task></ac:task-list>",
                "<table><tbody><tr><th>Name</th><th>Owner</th></tr><tr><td>Importer</td><td>Ada | Bob</td></tr></tbody></table>",
                "<ac:structured-macro ac:name=\"code\"><ac:parameter ac:name=\"language\">lua</ac:parameter>",
                "<ac:plain-text-body><![CDATA[local x = 1\n  return x]]></ac:plain-text-body></ac:structured-macro>",
                "<ac:structured-macro ac:name=\"info\"><ac:parameter ac:name=\"title\">Hidden</ac:parameter><ac:rich-text-body><p>Read this</p></ac:rich-text-body></ac:structured-macro>",
                "<blockquote><p>Quoted line</p></blockquote>",
                "<p><ac:image><ri:attachment ri:filename=\"diagram.png\" /></ac:image></p>",
            })
            test.eq(markdown.from_storage(storage), table.concat({
                "## Release & rollout",
                "",
                "Ship **Friday**, see [the plan](https://example.test/plan) — owner Team Page.",
                "",
                "- First",
                "  - Nested",
                "- Second",
                "",
                "1. One",
                "2. Two",
                "",
                "- [x] Done task",
                "",
                "| Name | Owner |",
                "| --- | --- |",
                "| Importer | Ada \\| Bob |",
                "",
                "```lua",
                "local x = 1",
                "  return x",
                "```",
                "",
                "Read this",
                "",
                "> Quoted line",
                "",
                "![](diagram.png)",
            }, "\n"))
        end)

        test.it("returns compact content rows and full detail with native search excerpts", function()
            local seen: any = nil
            local item = { id = "p1", type = "page", status = "current", title = "Runbook", space = { key = "OPS" },
                version = { number = 7, when = "2026-10-14T09:00:00.000Z", by = { displayName = "Ada", accountId = "acc-1" } },
                history = { createdDate = "2026-01-02T09:00:00.000Z", createdBy = { displayName = "Bob", accountId = "acc-2" } },
                _links = { webui = "/spaces/OPS/pages/p1/Runbook" },
                ancestors = { { id = "p0", title = "Operations" } },
                body = { storage = { value = "<h1>Runbook</h1><ul><li>Check <em>alerts</em></li></ul>" } } }
            with_conn(function(_, _, url: string): any
                seen = url
                if url:find("/search?", 1, true) then
                    return { success = true, data = { _links = { base = "https://acme.atlassian.net/wiki" },
                        results = { { content = item, title = "Runbook", excerpt = "Check @@@hl@@@alerts@@@endhl@@@ &amp; pages", lastModified = "2026-10-14T09:00:00.000Z" } } } }
                end
                if url:find("/content?", 1, true) then
                    return { success = true, data = { _links = { base = "https://acme.atlassian.net/wiki" }, results = { item } } }
                end
                return { success = true, data = item }
            end)
            local pages: any = confluence_get.handler({ action = "list_pages", space_key = "OPS" })
            test.contains(seen, "expand=space,version,history")
            local row = pages.pages[1]
            test.eq(row.id, "p1")
            test.eq(row.title, "Runbook")
            test.eq(row.status, "current")
            test.eq(row.space.key, "OPS")
            test.eq(row.version.number, 7)
            test.eq(row.version.when, "2026-10-14T09:00:00.000Z")
            test.eq(row.version.by.displayName, "Ada")
            test.is_nil(row.history)
            test.is_nil(row.body)
            test.is_nil(row.ancestors)
            test.eq(row.url, "https://acme.atlassian.net/wiki/spaces/OPS/pages/p1/Runbook")
            local found: any = confluence_get.handler({ action = "search", query = "text ~ alerts" })
            test.contains(seen, "/search?cql=")
            test.eq(found.results[1].content.id, "p1")
            test.eq(found.results[1].content.version.number, 7)
            test.eq(found.results[1].content.url, "https://acme.atlassian.net/wiki/spaces/OPS/pages/p1/Runbook")
            test.eq(found.results[1].excerpt, "Check @@@hl@@@alerts@@@endhl@@@ &amp; pages")
            test.eq(found.results[1].excerpt_markdown, "Check @@@hl@@@alerts@@@endhl@@@ & pages")
            test.eq(found.results[1].lastModified, "2026-10-14T09:00:00.000Z")
            local read: any = confluence_get.handler({ action = "read_page", page_id = "p1" })
            test.eq(read.page.content, "# Runbook\n\n- Check _alerts_")
            test.eq(read.page.content_type, "text/markdown")
            test.eq(read.page.ancestors[1].title, "Operations")
            test.eq(read.page.body.storage.value, item.body.storage.value)
        end)

        test.it("fail with the typed connection error", function()
            local failure = errors.new({ kind = errors.INVALID, message = "no Atlassian connection selected — configure the trait's connection" })
            transport.connect = function(_: any): any return nil, failure end
            local read, read_err = confluence_get.handler({ action = "list_spaces" })
            test.is_nil(read)
            test.eq(read_err, failure)
            local written, write_err = confluence_write.handler({ action = "create_page" })
            test.is_nil(written)
            test.eq(write_err, failure)
        end)

        test.it("fail with the typed transport error and return Confluence rejections as domain errors", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            with_conn(function(): (any?, error?) return nil, failure end)
            local read, read_err = confluence_get.handler({ action = "get_page", page_id = "p1" })
            test.is_nil(read)
            test.eq(read_err, failure)
            with_conn(function(): any return { success = false, error = "No space with key : NOPE", status_code = 404,
                data = { statusCode = 404, message = "No space with key : NOPE" } } end)
            local missing: any = confluence_get.handler({ action = "get_space", space_key = "NOPE" })
            test.is_false(missing.success)
            test.eq(missing.status_code, 404)
            test.eq(missing.data.statusCode, 404)
        end)

        test.it("returns the created and updated page records", function()
            with_conn(function(_, method: string): any
                if method == "GET" then return { success = true, data = { id = "p1", title = "Old", version = { number = 4 } } } end
                return { success = true, data = { id = "p1", title = "New", version = { number = 5 }, _links = { webui = "/x" } } }
            end)
            local created: any = confluence_write.handler({ action = "create_page", space_key = "DOCS", title = "New", body = "<p/>" })
            test.eq(created.page_id, "p1")
            test.eq(created.page.version.number, 5)
            local updated: any = confluence_write.handler({ action = "update_page", page_id = "p1", body = "<p/>" })
            test.eq(updated.version, 5)
            test.eq(updated.page._links.webui, "/x")
        end)

        test.it("reject an unknown action", function()
            with_conn(nil)
            test.is_true((confluence_get.handler({ action = "drop" }) :: any).error:find("unknown action") ~= nil)
            test.is_true((confluence_write.handler({ action = "drop" }) :: any).error:find("unknown action") ~= nil)
        end)

        test.it("route read/write actions to the api", function()
            local seen: any = {}
            with_conn(function(c: any, m: string, u: string, b: any): any seen = { method = m, url = u, body = b }; return { success = true, data = {} } end)
            confluence_get.handler({ action = "list_spaces" })
            test.is_true(seen.url:find("/space%?limit=") ~= nil, tostring(seen.url))
            confluence_write.handler({ action = "create_page", space_key = "DOCS", title = "T", body = "<p/>" })
            test.eq(seen.method, "POST")
            test.eq(seen.body.space.key, "DOCS")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
