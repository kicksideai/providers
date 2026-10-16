local test = require("test")
local api = require("api")
local types = require("types")

local API_CONN = { component_id = "c1", auth_type = "api_token", authorization = "Basic abc" }
local ACCESS_CONN = { component_id = "c2", auth_type = "access_token", authorization = "Bearer tok", workspace = "acme" }

type Call = { method: string, url: string, opts: any }

-- with_http replaces the http_client seam with a scripted responder and returns
-- the requests it received.
local function with_http(responses: { any }, fn: () -> ()): { Call }
    local calls: { Call } = {}
    local old = api._http
    api._http = {
        request = function(method: string, url: string, opts: any): (any, any)
            calls[#calls + 1] = { method = method, url = url, opts = opts }
            local response = responses[#calls]
            if type(response) == "string" then return nil, response end
            return response, nil
        end,
    }
    local ok, err = pcall(fn)
    api._http = old
    if not ok then error(err) end
    return calls
end

local function define_tests()
    test.describe("bitbucket api", function()
        test.it("targets the fixed Bitbucket Cloud REST 2.0 base", function()
            test.eq(types.API_BASE, "https://api.bitbucket.org/2.0")
            test.eq(api.build_url("/user", nil), "https://api.bitbucket.org/2.0/user")
            test.eq(api.build_url("/user", {}), "https://api.bitbucket.org/2.0/user")
        end)

        test.it("builds sorted, percent-encoded query strings", function()
            local url = api.build_url("/repositories/acme", { pagelen = 10, page = 2, q = 'name ~ "a b"' })
            test.eq(url, "https://api.bitbucket.org/2.0/repositories/acme?page=2&pagelen=10&q=name%20~%20%22a%20b%22")
        end)

        test.it("repeats a query key for each value of a list", function()
            local url = api.build_url("/repositories/acme/web/pullrequests", { state = { "OPEN", "MERGED" }, pagelen = 50 })
            test.eq(url, "https://api.bitbucket.org/2.0/repositories/acme/web/pullrequests?pagelen=50&state=OPEN&state=MERGED")
            url = api.build_url("/x", { q = { 'a b' }, page = 1 })
            test.eq(url, "https://api.bitbucket.org/2.0/x?page=1&q=a%20b")
            test.eq(api.build_url("/x", { state = {} }), "https://api.bitbucket.org/2.0/x")
        end)

        test.it("returns status and headers on success and failure", function()
            local result: any
            with_http({ { status_code = 200, body = '{"values":[]}', headers = { ["X-Request-Id"] = "ok-1" } } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.is_true(result.success)
            test.eq(result.headers["X-Request-Id"], "ok-1")

            with_http({ { status_code = 404, body = "{}", headers = { ["X-Request-Id"] = "miss-1" } } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.is_false(result.success)
            test.eq(result.status_code, 404)
            test.eq(result.error_kind, "not_found")
            test.eq(result.headers["X-Request-Id"], "miss-1")
            test.is_nil(result.retry_after_ms)

            with_http({ { status_code = 200, body = "<html>", headers = { ["X-Request-Id"] = "bad-1" } } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.eq(result.error_kind, "invalid_response")
            test.eq(result.status_code, 200)
            test.eq(result.headers["X-Request-Id"], "bad-1")
        end)

        test.it("reports a 403 as forbidden and a 429 as rate_limited with the Retry-After wait", function()
            local result: any
            with_http({ { status_code = 403, body = "{}", headers = {} } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.eq(result.error_kind, "forbidden")
            test.is_nil(result.retry_after_ms)

            with_http({ { status_code = 429, body = "", headers = { ["Retry-After"] = "17", ["X-RateLimit-Resource"] = "api" } } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.eq(result.status_code, 429)
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 17000)
            test.eq(result.headers["X-RateLimit-Resource"], "api")

            with_http({ { status_code = 429, body = "", headers = {} } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 60000)

            local failure: any
            with_http({ "dial tcp: connection refused" }, function()
                result, failure = api.get(API_CONN, "/user", nil)
            end)
            test.is_nil(result)
            test.contains(tostring(failure), "dial tcp: connection refused")
        end)

        test.it("sends the connection authorization with JSON headers", function()
            local h = api.headers("Basic abc")
            test.eq(h.Authorization, "Basic abc")
            test.eq(h.Accept, "application/json")
            test.eq(h["User-Agent"], "kickside-bitbucket-provider")
        end)

        test.it("normalizes and validates workspace slugs", function()
            local slug, err = api.workspace_slug("  acme-team_1 ")
            test.is_nil(err)
            test.eq(slug, "acme-team_1")
            for _, bad in ipairs({ "", "   ", "acme/repo", "https://bitbucket.org/acme", "ac me", "acme?x=1" }) do
                local value, bad_err = api.workspace_slug(bad)
                test.is_nil(value, bad)
                test.is_true(errors.is(bad_err, errors.INVALID), bad)
            end
            local value, type_err = api.workspace_slug(42)
            test.is_nil(value)
            test.is_true(errors.is(type_err, errors.INVALID))
        end)

        test.it("escapes query-language string literals", function()
            test.eq(api.name_filter("name", "web"), 'name ~ "web"')
            test.eq(api.name_filter("name", 'say "hi"'), 'name ~ "say \\"hi\\""')
            test.eq(api.name_filter("slug", "a\\b"), 'slug ~ "a\\\\b"')
        end)

        test.it("maps HTTP failures to user-facing errors", function()
            local msg, code = api.extract_error({ status_code = 401, body = "" })
            test.contains(msg, "unauthorized")
            test.eq(code, 401)
            msg, code = api.extract_error({ status_code = 403, body = "{}" })
            test.contains(msg, "forbidden")
            test.eq(code, 403)
            msg, code = api.extract_error({ status_code = 404, body = "{}" })
            test.contains(msg, "not found")
            test.eq(code, 404)
            msg, code = api.extract_error({ status_code = 429, body = "" })
            test.contains(msg, "rate limited")
            test.eq(code, 429)
            msg, code = api.extract_error({ status_code = 503, body = "upstream down" })
            test.eq(msg, "Bitbucket service error (HTTP 503): upstream down")
            test.eq(code, 503)
            msg, code = api.extract_error({ status_code = 500, body = "" })
            test.eq(msg, "Bitbucket service error (HTTP 500)")
            test.eq(code, 500)
        end)

        test.it("extracts Bitbucket error envelopes", function()
            local msg, code = api.extract_error({
                status_code = 400,
                body = '{"type":"error","error":{"message":"Invalid pagelen"}}',
            })
            test.eq(msg, "Invalid pagelen")
            test.eq(code, 400)
            msg = api.extract_error({
                status_code = 400,
                body = '{"type":"error","error":{"message":"Invalid query","detail":"unexpected token"}}',
            })
            test.eq(msg, "Invalid query: unexpected token")
            msg = api.extract_error({ status_code = 400, body = "" })
            test.eq(msg, "request failed (HTTP 400)")
        end)

        test.it("returns decoded data on success and reports transport and decode errors", function()
            local result: any
            with_http({ { status_code = 200, body = '{"username":"dev"}' } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.is_true(result.success)
            test.eq(result.data.username, "dev")
            test.eq(result.status_code, 200)

            local failure: any
            with_http({ "dial tcp: connection refused" }, function()
                result, failure = api.get(API_CONN, "/user", nil)
            end)
            test.is_nil(result)
            test.contains(tostring(failure), "dial tcp: connection refused")

            with_http({ { status_code = 200, body = "<html>" } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.is_false(result.success)
            test.contains(result.error, "invalid Bitbucket response")

            with_http({ { status_code = 401, body = "" } }, function()
                result = api.get(API_CONN, "/user", nil)
            end)
            test.is_false(result.success)
            test.eq(result.status_code, 401)
            test.contains(result.error, "unauthorized")
        end)

        test.it("lists workspaces for the caller with page, pagelen, slug filter, and slug order", function()
            local calls = with_http({ { status_code = 200, body = '{"values":[]}' } }, function()
                api.list_workspaces(API_CONN, { page = 3, pagelen = 25, q = "ac" })
            end)
            test.len(calls, 1)
            test.eq(calls[1].method, "GET")
            test.eq(calls[1].url, "https://api.bitbucket.org/2.0/user/workspaces?page=3&pagelen=25&q=slug%20~%20%22ac%22&sort=slug")
            test.eq(calls[1].opts.headers.Authorization, "Basic abc")
        end)

        test.it("lists one workspace's repositories sorted by full name", function()
            local calls = with_http({ { status_code = 200, body = '{"values":[]}' } }, function()
                api.list_repositories(ACCESS_CONN, "acme", { page = 1, pagelen = 100 })
            end)
            test.eq(calls[1].url, "https://api.bitbucket.org/2.0/repositories/acme?page=1&pagelen=100&sort=full_name")
            test.eq(calls[1].opts.headers.Authorization, "Bearer tok")

            calls = with_http({ { status_code = 200, body = '{"values":[]}' } }, function()
                api.list_repositories(ACCESS_CONN, "acme", { page = 2, pagelen = 5, q = "web" })
            end)
            test.eq(calls[1].url, "https://api.bitbucket.org/2.0/repositories/acme?page=2&pagelen=5&q=name%20~%20%22web%22&sort=full_name")
        end)

        test.it("reads the next page number from the pagination link", function()
            local page, err = api.next_page({ page = 1, next = "https://api.bitbucket.org/2.0/repositories/acme?pagelen=1&page=2" })
            test.is_nil(err)
            test.eq(page, "2")
            page, err = api.next_page({ next = "https://api.bitbucket.org/2.0/user/workspaces?page=11" })
            test.is_nil(err)
            test.eq(page, "11")
            page, err = api.next_page({ page = 4, values = {} })
            test.is_nil(page)
            test.is_nil(err)
            page, err = api.next_page({ next = "https://api.bitbucket.org/2.0/repositories/acme?cursor=abc" })
            test.is_nil(page)
            test.contains(err, "no page number")
        end)

        test.it("tests an API token with /user", function()
            local calls = with_http({ { status_code = 200, body = '{"username":"dev"}' } }, function()
                local result = api.test_connection(API_CONN)
                test.is_true(result.success)
            end)
            test.len(calls, 1)
            test.eq(calls[1].url, "https://api.bitbucket.org/2.0/user")
        end)

        test.it("tests an API token narrowed to a workspace against that workspace too", function()
            local conn = { component_id = "c3", auth_type = "api_token", authorization = "Basic abc", workspace = "acme" }
            local calls = with_http({
                { status_code = 200, body = '{"username":"dev"}' },
                { status_code = 404, body = '{"type":"error","error":{"message":"No workspace"}}' },
            }, function()
                local result = api.test_connection(conn)
                test.is_false(result.success)
                test.eq(result.status_code, 404)
            end)
            test.len(calls, 2)
            test.eq(calls[2].url, "https://api.bitbucket.org/2.0/repositories/acme?page=1&pagelen=1&sort=full_name")

            calls = with_http({ { status_code = 401, body = "" } }, function()
                local result = api.test_connection(conn)
                test.is_false(result.success)
                test.eq(result.status_code, 401)
            end)
            test.len(calls, 1)
        end)

        test.it("tests an access token against its workspace instead of /user", function()
            local calls = with_http({ { status_code = 200, body = '{"values":[]}' } }, function()
                local result = api.test_connection(ACCESS_CONN)
                test.is_true(result.success)
            end)
            test.len(calls, 1)
            test.eq(calls[1].url, "https://api.bitbucket.org/2.0/repositories/acme?page=1&pagelen=1&sort=full_name")
            test.eq(calls[1].opts.headers.Authorization, "Bearer tok")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
