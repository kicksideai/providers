local test = require("test")
local core = require("pull_core")
local conformance = require("conformance")

local function content(id: string, title: string, when: string, status: string): any
    return {
        id = id,
        type = "page",
        title = title,
        status = status,
        space = { key = "DOC" },
        version = { number = tonumber(id) or 1, when = when },
        body = { storage = { value = "<p>Hello <strong>" .. title .. "</strong></p>" } },
        _links = { base = "https://example.atlassian.net/wiki", webui = "/spaces/DOC/pages/" .. id },
    }
end

local function new_fake(): any
    local fake: any = { searches = {}, gets = {}, connect_ids = {} }
    function fake.connect(component_id: string?): (any, string?)
        if component_id == "bad" then return nil, "revoked" end
        fake.connect_ids[#fake.connect_ids + 1] = component_id
        return { component_id = component_id, confluence_base = "https://example.atlassian.net/wiki/rest/api" }, nil
    end
    function fake.search(_conn: any, cql: string, limit: integer?, start: integer?): any
        fake.searches[#fake.searches + 1] = { cql = cql, limit = limit, start = start }
        if cql:find("status = trashed", 1, true) then
            return { success = true, data = { start = start or 0, limit = limit or 2, size = 1, results = {
                content("9", "Old page", "2026-06-01T08:00:00.000Z", "trashed"),
            } } }
        end
        return { success = true, data = { start = start or 0, limit = limit or 2, size = 2, results = {
            { id = "1", title = "First", version = { when = "2026-06-01T10:00:00.000Z" } },
            { id = "2", title = "Second", version = { when = "2026-06-02T10:00:00.000Z" } },
        } } }
    end
    function fake.get_page(_conn: any, id: string): any
        fake.gets[#fake.gets + 1] = id
        return { success = true, data = content(id, id == "1" and "First" or "Second", id == "1" and "2026-06-01T10:00:00.000Z" or "2026-06-02T10:00:00.000Z", "current") }
    end
    function fake.page_body(data: any): string
        return type(data.body) == "table" and data.body.storage.value or ""
    end
    return fake
end

local function define_tests()
    test.describe("Confluence pull_core", function()
        test.it("emits clean upserts from current content and delete ops from trashed content", function()
            local fake = new_fake()
            local first = core.pull({ config = { connection_id = "conn1", space_key = "DOC", content_type = "page" }, limit = 2 }, { transport = fake, confluence = fake })
            test.eq(first.success, true)
            test.eq(first.items[1].item_key, "confluence:content:1")
            test.eq(first.items[1].op, "upsert")
            test.eq(first.items[1].payload.content_type, "text/markdown")
            test.eq(first.items[1].payload.confluence_type, "page")
            test.is_true(first.items[1].payload.content:find("<strong>", 1, true) == nil, "storage HTML must be stripped")
            test.eq(first.next_cursor.phase, "backfill_trashed")

            local second = core.pull({ cursor = first.next_cursor, config = { connection_id = "conn1", space_key = "DOC", content_type = "page" }, limit = 2 }, { transport = fake, confluence = fake })
            test.eq(second.success, true)
            test.eq(second.items[1].op, "delete")
            test.eq(second.items[1].item_key, "confluence:content:9")
            test.eq(second.next_cursor.active_hw, "2026-06-02T10:00:00.000Z")
            test.eq(second.next_cursor.trashed_hw, "2026-06-01T08:00:00.000Z")
            test.eq(second.has_more, false)
        end)

        test.it("adds space, type, status, and backfill filters to CQL", function()
            local fake = new_fake()
            core.pull({ config = { connection_id = "conn1", space_key = "DOC", content_type = "blogpost", backfill_since = "2026-06-01T00:00:00.000Z" }, limit = 2 }, { transport = fake, confluence = fake })
            local cql = fake.searches[1].cql
            test.is_true(cql:find('space = "DOC"', 1, true) ~= nil, tostring(cql))
            test.is_true(cql:find("type = blogpost", 1, true) ~= nil, tostring(cql))
            test.is_true(cql:find("status = current", 1, true) ~= nil, tostring(cql))
            test.is_true(cql:find("lastmodified >=", 1, true) ~= nil, tostring(cql))
        end)

        test.it("classifies connection failure as auth_expired", function()
            local res = core.pull({ config = { connection_id = "bad", space_key = "DOC", content_type = "page" } }, { transport = new_fake(), confluence = new_fake() })
            test.eq(res.success, false)
            test.eq(res.error.code, "auth_expired")
        end)

        test.it("passes the pullable conformance kit offline", function()
            local fake = new_fake()
            local result = conformance.run({
                pull = function(req: any): any return core.pull(req, { transport = fake, confluence = fake }) end,
                config = { connection_id = "conn1", space_key = "DOC", content_type = "page" },
                failure_config = { connection_id = "bad", space_key = "DOC", content_type = "page" },
                backfill_since = { mode = "honored", value = "2026-06-01T00:00:00.000Z" },
                limit = 2,
                max_pages = 5,
            })
            test.eq(result.success, true, conformance.format_failures(result))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
