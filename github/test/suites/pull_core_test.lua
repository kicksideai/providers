local test = require("test")
local errors = require("errors")
local pull_core = require("pull_core")

local function fake_transport(rows: any, opts: any?): any
    opts = opts or {}
    return {
        connect = function(_id: any): (any?, any?)
            if opts.connect_error then return nil, opts.connect_error end
            return { token = "t" }, nil
        end,
        list_issues = function(_conn: any, owner: string, repo: string, query: any): any
            if opts.seen then opts.seen.owner, opts.seen.repo, opts.seen.query = owner, repo, query end
            if opts.list_typed_error then return nil, opts.list_typed_error end
            if opts.list_error then return { success = false, error = opts.list_error, status_code = 403 } end
            return { success = true, data = rows, owner = owner, repo = repo, query = query }
        end,
    }
end

local ROWS = {
    { id = 1, number = 7, title = "Bug", body = "Fix it", state = "open", html_url = "https://github.com/o/r/issues/7", updated_at = "2026-01-02T00:00:00Z", created_at = "2026-01-01T00:00:00Z", user = { login = "ada" }, labels = { { name = "bug" } } },
    { id = 2, number = 8, title = "PR", body = "Merge it", state = "open", html_url = "https://github.com/o/r/pull/8", updated_at = "2026-01-03T00:00:00Z", pull_request = { url = "x" }, user = { login = "grace" } },
}

local function define_tests()
    test.describe("github source", function()
        test.it("shapes issues and pull requests into pullable items", function()
            local page = pull_core.pull({
                config = { owner = "o", repo = "r", connection_id = "conn", item_type = "all" },
                limit = 50,
            }, nil, { transport = fake_transport(ROWS) })
            test.is_true(page.success)
            test.eq(#page.items, 2)
            test.eq(page.items[1].item_key, "github:o/r:issue:7")
            test.eq(page.items[1].payload.author, "ada")
            test.eq(page.items[1].payload.labels[1], "bug")
            test.eq(page.items[2].payload.item_type, "pull_request")
        end)

        test.it("filters to pull requests when configured", function()
            local page = pull_core.pull({ config = { owner = "o", repo = "r", item_type = "pull_requests" } }, nil, { transport = fake_transport(ROWS), component_id = "conn" })
            test.is_true(page.success)
            test.eq(#page.items, 1)
            test.eq(page.items[1].payload.number, 8)
        end)

        test.it("reports invalid config loudly", function()
            local page = pull_core.pull({ config = { repo = "r" } }, nil, { transport = fake_transport(ROWS) })
            test.is_false(page.success)
            test.eq(page.error.code, "invalid_config")
        end)

        test.it("passes backfill, cursor, and clamped limit to GitHub", function()
            local seen: any = {}
            local page = pull_core.pull({
                config = { owner = "o", repo = "r", backfill_since = "2026-01-01T00:00:00Z" },
                cursor = { page = 2 },
                limit = 999,
            }, nil, { transport = fake_transport(ROWS, { seen = seen }), component_id = "conn" })
            test.is_true(page.success)
            test.eq(seen.owner, "o")
            test.eq(seen.repo, "r")
            test.eq(seen.query.per_page, 100)
            test.eq(seen.query.page, 2)
            test.eq(seen.query.since, "2026-01-01T00:00:00Z")
            test.eq(seen.query.state, "all")
        end)

        test.it("emits keys-only pages for reconcile", function()
            local page = pull_core.pull_keys({ config = { owner = "o", repo = "r" } }, nil, { transport = fake_transport(ROWS), component_id = "conn" })
            test.is_true(page.success)
            test.is_nil(page.items)
            test.eq(#page.keys, 2)
            test.eq(page.keys[1].item_key, "github:o/r:issue:7")
        end)

        test.it("passes typed list failures through pull and reconcile keys", function()
            for _, read in ipairs({ pull_core.pull, pull_core.pull_keys }) do
                local expected = errors.new({ kind = errors.UNAVAILABLE, message = "GitHub request unavailable" })
                local page, err = read({ config = { owner = "o", repo = "r" } }, nil,
                    { transport = fake_transport(ROWS, { list_typed_error = expected }), component_id = "conn" })
                test.is_nil(page)
                test.eq(err:kind(), errors.UNAVAILABLE)
                test.eq(err:message(), "GitHub request unavailable")
            end
        end)

        test.it("classifies connection failures and GitHub rejections as source errors", function()
            local page = pull_core.pull({ config = { owner = "o", repo = "r" } }, nil, { transport = fake_transport(ROWS, { connect_error = "expired" }) })
            test.is_false(page.success)
            test.eq(page.error.code, "auth_expired")

            page = pull_core.pull({ config = { owner = "o", repo = "r" } }, nil, { transport = fake_transport(ROWS, { list_error = "forbidden" }), component_id = "conn" })
            test.is_false(page.success)
            test.eq(page.error.code, "permission_denied")
            test.eq(page.error.message, "list GitHub issues: forbidden")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
