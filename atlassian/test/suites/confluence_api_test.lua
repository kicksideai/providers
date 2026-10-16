-- Confluence API client unit tests. Live HTTP is replaced by a recording stub on
-- the shared transport, so these assert the exact endpoint, verb and body each
-- operation builds (v1 REST, storage-format bodies) without a network call.

local test = require("test")
local transport = require("transport")
local confluence = require("confluence")
local atlassian_types = require("types")

local last: any = nil
local function install_recorder(response: any)
    last = nil
    transport.request_json = function(conn: any, method: string, url: string, body: any): any
        last = { method = method, url = url, body = body }
        return response or { success = true, data = {} }
    end
end

local CONN: atlassian_types.Conn = {
    mode = "credential",
    deployment = "cloud",
    jira_base = "",
    confluence_base = "https://acme.atlassian.net/wiki/rest/api",
}

local function define_tests()
    test.describe("Confluence API client", function()
        test.it("uses an opaque Cloud search cursor instead of an offset", function()
            install_recorder(nil)
            confluence.search(CONN, "type=page", 10, nil, "next+page/=")
            test.contains(last.url, "cursor=next%2Bpage%2F%3D")
            test.is_nil((last.url:find("start=", 1, true)))
        end)
        test.it("bounds every native collection request and forwards its page offset", function()
            local calls = {
                function(limit, start) return confluence.list_spaces(CONN, limit, start) end,
                function(limit, start) return confluence.list_pages(CONN, "DOCS", limit, start) end,
                function(limit, start) return confluence.list_blogposts(CONN, "DOCS", limit, start) end,
                function(limit, start) return confluence.search(CONN, "type=page", limit, start) end,
                function(limit, start) return confluence.get_comments(CONN, "123", limit, start) end,
                function(limit, start) return confluence.site_search(CONN, "type=page", limit, start) end,
            }
            local defaults = {
                "/space?limit=25", "/content?type=page&spaceKey=DOCS&expand=space,version,history&limit=25",
                "/content?type=blogpost&spaceKey=DOCS&expand=space,version,history&limit=25", "/content/search?cql=type%3Dpage&limit=25",
                "/content/123/child/comment?expand=version,history",
                "/search?cql=type%3Dpage&expand=content.space,content.version,content.history&limit=25",
            }
            for index, call in ipairs(calls) do
                install_recorder(nil)
                call(999, 30)
                test.contains(last.url, "limit=100")
                test.contains(last.url, "start=30")
                call(nil, nil)
                test.eq(last.url, CONN.confluence_base .. defaults[index], "existing client defaults remain unchanged")
                for _, limit in ipairs({ 0, -1, 1.5 }) do
                    last = nil
                    test.is_false(call(limit, 0).success)
                    test.is_nil(last)
                end
                for _, start in ipairs({ -1, 1.5 }) do
                    last = nil
                    test.is_false(call(25, start).success)
                    test.is_nil(last)
                end
            end
        end)
        test.it("extracts the storage body from a page payload", function()
            test.eq(confluence.page_body({ body = { storage = { value = "<p>hi</p>" } } }), "<p>hi</p>")
            test.eq(confluence.page_body(nil), "")
        end)

        test.it("list_spaces / get_space", function()
            install_recorder(nil)
            confluence.list_spaces(CONN, 25)
            test.eq(last.method, "GET")
            test.eq(last.url, "https://acme.atlassian.net/wiki/rest/api/space?limit=25")
            confluence.get_space(CONN, "DOCS")
            test.eq(last.url, "https://acme.atlassian.net/wiki/rest/api/space/DOCS?expand=description.plain,homepage")
        end)

        test.it("list_pages / list_blogposts (type + spaceKey)", function()
            install_recorder(nil)
            confluence.list_pages(CONN, "DOCS", 10)
            test.is_true(last.url:find("/content%?type=page&spaceKey=DOCS&expand=space,version,history&limit=10") ~= nil, tostring(last.url))
            confluence.list_blogposts(CONN, "DOCS")
            test.is_true(last.url:find("type=blogpost&spaceKey=DOCS") ~= nil, tostring(last.url))
        end)

        test.it("get_page expands body.storage; search uses cql", function()
            install_recorder(nil)
            confluence.get_page(CONN, "123")
            test.eq(last.url, "https://acme.atlassian.net/wiki/rest/api/content/123?expand=body.storage,ancestors,space,version,history")
            confluence.search(CONN, "type=page", 5)
            test.is_true(last.url:find("/content/search%?cql=") ~= nil, last.url)
            confluence.search(CONN, "type=page", 5, 25)
            test.is_true(last.url:find("start=25") ~= nil, last.url)
        end)

        test.it("get_comments path", function()
            install_recorder(nil)
            confluence.get_comments(CONN, "123")
            test.eq(last.url, "https://acme.atlassian.net/wiki/rest/api/content/123/child/comment?expand=version,history")
        end)

        test.it("create_page: storage body, space.key, ancestors", function()
            install_recorder(nil)
            confluence.create_page(CONN, "DOCS", "Title", "<p>x</p>", "999")
            test.eq(last.method, "POST")
            test.eq(last.url, "https://acme.atlassian.net/wiki/rest/api/content")
            test.eq(last.body.type, "page")
            test.eq(last.body.space.key, "DOCS")
            test.eq(last.body.body.storage.representation, "storage")
            test.eq(last.body.ancestors[1].id, "999")
            test.is_false(confluence.create_page(CONN, "", "T", "b").success)
        end)

        test.it("update_page: bumps version; delete_page", function()
            install_recorder(nil)
            confluence.update_page(CONN, "123", "T", "<p>y</p>", 3)
            test.eq(last.method, "PUT")
            test.eq(last.url, "https://acme.atlassian.net/wiki/rest/api/content/123")
            test.eq(last.body.version.number, 4)
            confluence.delete_page(CONN, "123")
            test.eq(last.method, "DELETE")
            test.eq(last.url, "https://acme.atlassian.net/wiki/rest/api/content/123")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
