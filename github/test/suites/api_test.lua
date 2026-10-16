local test = require("test")
local api = require("api")
local data_error = require("data_error")

-- respond runs one viewer request against a scripted response, with the
-- client clock fixed at now when given.
local function respond(response: any, now: integer?): any
    local old_http, old_now = api._http, api._now
    api._http = { request = function(): (any, any) return response, nil end }
    if now then api._now = function(): integer return now :: integer end end
    local ok, result = pcall(api.viewer, { mode = "credential", token = "pat" })
    api._http, api._now = old_http, old_now
    if not ok then error(result) end
    return result
end

local function define_tests()
    test.describe("github api", function()
        test.it("encodes path segments and query parameters", function()
            test.eq(api.encode_segment("a b/c"), "a%20b%2Fc")
            test.eq(api.encode_path("dir/a b.lua"), "dir/a%20b.lua")
            local url = api.build_url("/repos/o/r/issues", { since = "2026-01-01T00:00:00Z", state = "all" })
            test.contains(url, "since=2026-01-01T00%3A00%3A00Z")
            test.contains(url, "state=all")
        end)

        test.it("declares GitHub REST headers", function()
            local h = api.headers("tok")
            test.eq(h.Authorization, "Bearer tok")
            test.eq(h.Accept, "application/vnd.github+json")
            test.eq(h["X-GitHub-Api-Version"], "2022-11-28")
        end)

        test.it("builds authorization for credential and OAuth connections", function()
            local auth, err = api.authorization({ mode = "credential", token = "pat" })
            test.is_nil(err)
            test.eq(auth, "Bearer pat")

            auth, err = api.authorization({ mode = "credential", header = "token app-installation" })
            test.is_nil(err)
            test.eq(auth, "token app-installation")

            auth, err = api.authorization({
                mode = "oauth",
                oauth_conn = {
                    get_access_token = function(_self: any): any
                        return { success = true, access_token = "oauth-token" }, nil
                    end,
                },
            })
            test.is_nil(err)
            test.eq(auth, "Bearer oauth-token")
        end)

        test.it("surfaces OAuth token failures loudly", function()
            local auth, err = api.authorization({
                mode = "oauth",
                oauth_conn = {
                    get_access_token = function(_self: any): any
                        return { success = false, error = "denied" }, nil
                    end,
                },
            })
            test.is_nil(auth)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.eq(err:message(), "denied")

            auth, err = api.authorization({
                mode = "oauth",
                oauth_conn = {
                    get_access_token = function(_self: any): any
                        return { success = true, access_token = "tok", is_expired = true }, nil
                    end,
                },
            })
            test.is_nil(auth)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.ok(tostring(err):find("expired") ~= nil)
        end)

        test.it("reads the next page from the Link header", function()
            test.is_true(api.has_next_page({
                Link = '<https://api.github.com/user/repos?page=3>; rel="next", <https://api.github.com/user/repos?page=9>; rel="last"',
            }))
            test.is_true(api.has_next_page({
                link = '<https://api.github.com/user/repos?page=2>; rel="next"',
            }))
            test.is_true(api.has_next_page({
                Link = { '<https://api.github.com/user/repos?page=2>; rel="next"' },
            }))
            test.is_true(api.has_next_page({
                Link = '<https://api.github.com/user/repos?page=1>; rel="prev", <https://api.github.com/user/repos?page=1>; rel="first"',
            }) == false)
            test.is_true(api.has_next_page({}) == false)
            test.is_true(api.has_next_page(nil) == false)
        end)

        test.it("lists the repositories the connection can access with response headers", function()
            local old_http = api._http
            local seen: any = {}
            api._http = {
                request = function(method: string, url: string, opts: any): (any, any)
                    seen.method, seen.url, seen.opts = method, url, opts
                    return {
                        status_code = 200,
                        body = '[{"full_name":"octo/one"}]',
                        headers = { Link = '<https://api.github.com/user/repos?page=2>; rel="next"' },
                    }, nil
                end,
            }
            local result = api.list_repositories({ mode = "credential", token = "pat" }, { per_page = 50, page = 1 })
            api._http = old_http

            test.is_true(result.success)
            test.eq(result.data[1].full_name, "octo/one")
            test.is_true(api.has_next_page(result.headers))
            test.eq(seen.method, "GET")
            test.contains(seen.url, "https://api.github.com/user/repos?")
            test.contains(seen.url, "per_page=50")
            test.contains(seen.url, "page=1")
            test.contains(seen.url, "affiliation=owner%2Ccollaborator%2Corganization_member")
            test.contains(seen.url, "sort=full_name")
            test.eq(seen.opts.headers.Authorization, "Bearer pat")
        end)

        test.it("extracts GitHub API error messages", function()
            local msg, code, kind = api.extract_error({ status_code = 422, body = "{\"message\":\"Validation Failed\"}" })
            test.eq(msg, "Validation Failed")
            test.eq(code, 422)
            test.eq(kind, "request_failed")

            msg, code, kind = api.extract_error({ status_code = 403, body = "{}" })
            test.ok(msg:find("forbidden") ~= nil)
            test.is_nil((msg:find("rate limit")))
            test.eq(code, 403)
            test.eq(kind, "forbidden")
        end)

        test.it("returns status and headers on a failed request", function()
            local result = respond({
                status_code = 404,
                body = '{"message":"Not Found"}',
                headers = { ["X-Ratelimit-Remaining"] = "4999", ["X-Github-Request-Id"] = "abc" },
            })
            test.is_false(result.success)
            test.eq(result.status_code, 404)
            test.eq(result.error_kind, "not_found")
            test.eq(result.headers["X-Github-Request-Id"], "abc")
            test.eq(result.headers["X-Ratelimit-Remaining"], "4999")
            test.eq(result.data.message, "Not Found")
            test.is_nil(result.retry_after_ms)
        end)

        test.it("reports a 403 permission error as forbidden", function()
            local result = respond({
                status_code = 403,
                body = '{"message":"Resource not accessible by personal access token"}',
                headers = { ["X-Ratelimit-Remaining"] = "4998", ["X-Ratelimit-Reset"] = "1900000000" },
            })
            test.is_false(result.success)
            test.eq(result.status_code, 403)
            test.eq(result.error_kind, "forbidden")
            test.contains(result.error, "Resource not accessible by personal access token")
            test.is_nil(result.retry_after_ms)
            test.eq(result.headers["X-Ratelimit-Remaining"], "4998")
        end)

        test.it("reports an exhausted primary rate limit as rate_limited until the reset", function()
            local result = respond({
                status_code = 403,
                body = '{"message":"API rate limit exceeded for user ID 1."}',
                headers = {
                    ["X-Ratelimit-Remaining"] = "0",
                    ["X-Ratelimit-Reset"] = "1700000090",
                    ["X-Ratelimit-Resource"] = "core",
                },
            }, 1700000000)
            test.eq(result.status_code, 403)
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 90000)
            test.contains(result.error, "API rate limit exceeded")
            test.eq(result.headers["X-Ratelimit-Resource"], "core")
        end)

        test.it("clamps a primary rate limit reset in the past to zero", function()
            local result = respond({
                status_code = 429,
                body = "",
                headers = { ["x-ratelimit-remaining"] = "0", ["x-ratelimit-reset"] = "1699999990" },
            }, 1700000000)
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 0)
        end)

        test.it("reports a secondary rate limit with retry-after as rate_limited", function()
            local result = respond({
                status_code = 403,
                body = '{"message":"You have exceeded a secondary rate limit. Please wait a few minutes before you try again."}',
                headers = { ["Retry-After"] = "60", ["X-Ratelimit-Remaining"] = "4000" },
            }, 1700000000)
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 60000)
            test.contains(result.error, "secondary rate limit")
        end)

        test.it("waits the documented minute on a secondary rate limit named only by the body", function()
            local result = respond({
                status_code = 403,
                body = '{"message":"You have exceeded a secondary rate limit. Please wait a few minutes before you try again."}',
                headers = {},
            })
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 60000)

            local failure = data_error.from_result(result, "list GitHub issues")
            test.eq(failure.error.code, "rate_limited")
            test.eq(failure.retry_after_ms, 60000)
        end)

        test.it("waits the documented minute on a 429 with no wait header", function()
            local result = respond({ status_code = 429, body = "", headers = { ["X-Ratelimit-Remaining"] = "12" } })
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 60000)
        end)

        test.it("reports a 429 as rate_limited", function()
            local result = respond({ status_code = 429, body = "", headers = { ["retry-after"] = "5" } })
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 5000)
        end)

        test.it("fails a request that cannot be sent or authorized with a typed error", function()
            local old_http = api._http
            api._http = { request = function(): (any, any)
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "dial tcp: refused" })
            end }
            local result, err = api.request({ mode = "credential", token = "pat" }, "GET", "/user")
            api._http = old_http
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(tostring(err), "dial tcp: refused")

            result, err = api.request({ mode = "credential" }, "GET", "/user")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
        end)

        test.it("maps a rate-limited 403 onto a retriable rate_limited data error", function()
            local failure = data_error.from_result({
                success = false,
                error = "rate limited",
                status_code = 403,
                error_kind = "rate_limited",
                retry_after_ms = 60000,
            }, "list GitHub issues")
            test.eq(failure.error.code, "rate_limited")
            test.is_true(failure.error.retriable)
            test.eq(failure.retry_after_ms, 60000)

            failure = data_error.from_result({
                success = false, error = "forbidden", status_code = 403, error_kind = "forbidden",
            }, "list GitHub issues")
            test.eq(failure.error.code, "permission_denied")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
