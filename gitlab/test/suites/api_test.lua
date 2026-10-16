local test = require("test")
local api = require("api")

local CONN = { component_id = "c1", mode = "credential", base_url = "https://gitlab.example.com", token = "glpat-secret" }

local function with_http(responder: any, fn: any)
    local prev = api._http
    api._http = { request = responder }
    local ok, err = pcall(fn)
    api._http = prev
    if not ok then error(err) end
end

local function normalized(raw: any): string?
    local url, err = api.normalize_base_url(raw)
    test.is_nil(err)
    return url
end

local function rejected(raw: any): string
    local url, err = api.normalize_base_url(raw)
    test.is_nil(url)
    test.is_true(errors.is(err, errors.INVALID), "expected an INVALID rejection of " .. tostring(raw))
    return tostring(err)
end

local function define_tests()
    test.describe("gitlab api base url", function()
        test.it("defaults a blank base URL to gitlab.com", function()
            test.eq(normalized(nil), "https://gitlab.com")
            test.eq(normalized(""), "https://gitlab.com")
            test.eq(normalized("   "), "https://gitlab.com")
        end)

        test.it("lowercases scheme and host and strips trailing slashes", function()
            test.eq(normalized("HTTPS://GitLab.Example.COM/"), "https://gitlab.example.com")
            test.eq(normalized("  https://gitlab.example.com///  "), "https://gitlab.example.com")
            test.eq(normalized("http://10.0.0.5:8080"), "http://10.0.0.5:8080")
        end)

        test.it("strips a pasted /api/v4 suffix", function()
            test.eq(normalized("https://gitlab.com/api/v4"), "https://gitlab.com")
            test.eq(normalized("https://gitlab.com/api/v4/"), "https://gitlab.com")
            test.eq(normalized("https://git.example.com/gitlab/api/v4"), "https://git.example.com/gitlab")
        end)

        test.it("keeps the case of a self-managed sub-path", function()
            test.eq(normalized("https://Example.com/GitLab/"), "https://example.com/GitLab")
        end)

        test.it("rejects non-http schemes and relative URLs", function()
            test.contains(rejected("ftp://gitlab.com"), "http or https")
            test.contains(rejected("gitlab.com"), "absolute")
            test.contains(rejected("/gitlab"), "absolute")
            test.contains(rejected("javascript://x"), "http or https")
        end)

        test.it("rejects credentials, queries, fragments, and whitespace", function()
            test.contains(rejected("https://user:pass@gitlab.com"), "credentials")
            test.contains(rejected("https://gitlab.com/?x=1"), "query")
            test.contains(rejected("https://gitlab.com/#top"), "fragment")
            test.contains(rejected("https://git lab.com"), "whitespace")
        end)

        test.it("rejects invalid hosts, ports, and paths", function()
            test.contains(rejected("https://"), "invalid host")
            test.contains(rejected("https://-gitlab.com"), "invalid host")
            test.contains(rejected("https://gitlab..com"), "invalid host")
            test.contains(rejected("https://gitlab.com:"), "invalid port")
            test.contains(rejected("https://gitlab.com:70000"), "invalid port")
            test.contains(rejected("https://gitlab.com:0"), "invalid port")
            test.contains(rejected("https://gitlab.com//gitlab"), "invalid path")
            test.contains(rejected(42), "must be a string")
        end)
    end)

    test.describe("gitlab api requests", function()
        test.it("authenticates credential connections with PRIVATE-TOKEN", function()
            local headers, err = api.headers(CONN)
            test.is_nil(err)
            test.eq(headers["PRIVATE-TOKEN"], "glpat-secret")
            test.is_nil(headers.Authorization)
            test.eq(headers.Accept, "application/json")
        end)

        test.it("refuses connections without a token or with an unsupported mode", function()
            local headers, err = api.headers({ component_id = "c1", mode = "credential", base_url = "https://gitlab.com" })
            test.is_nil(headers)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(tostring(err), "missing token")

            headers, err = api.headers({ component_id = "c1", mode = "oauth", base_url = "https://gitlab.com", token = "t" })
            test.is_nil(headers)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(tostring(err), "unsupported GitLab connection mode: oauth")
        end)

        test.it("builds API v4 URLs with sorted, encoded query parameters", function()
            test.eq(api.build_url(CONN, "/user", nil), "https://gitlab.example.com/api/v4/user")
            test.eq(
                api.build_url(CONN, "/projects", { search = "a b/c", page = 2, simple = true }),
                "https://gitlab.example.com/api/v4/projects?page=2&search=a%20b%2Fc&simple=true"
            )
            local sub = { component_id = "c1", mode = "credential", base_url = "https://example.com/gitlab", token = "t" }
            test.eq(api.build_url(sub, "/user", {}), "https://example.com/gitlab/api/v4/user")
        end)

        test.it("requests the current user", function()
            local seen: any = {}
            with_http(function(method: string, url: string, opts: any): (any, any)
                seen.method, seen.url, seen.opts = method, url, opts
                return { status_code = 200, body = '{"id":7,"username":"jane"}', headers = {} }, nil
            end, function()
                local result = api.current_user(CONN)
                test.is_true(result.success)
                test.eq(result.data.username, "jane")
                test.eq(result.status_code, 200)
            end)
            test.eq(seen.method, "GET")
            test.eq(seen.url, "https://gitlab.example.com/api/v4/user")
            test.eq(seen.opts.headers["PRIVATE-TOKEN"], "glpat-secret")
        end)

        test.it("lists member projects ordered by path with response headers", function()
            local seen: any = {}
            with_http(function(method: string, url: string, _opts: any): (any, any)
                seen.method, seen.url = method, url
                return { status_code = 200, body = '[{"id":1}]', headers = { ["X-Next-Page"] = "3" } }, nil
            end, function()
                local result = api.list_projects(CONN, { page = 2, per_page = 50, search = "core" })
                test.is_true(result.success)
                test.eq(result.data[1].id, 1)
                test.eq(api.next_page(result.headers), "3")
            end)
            test.eq(seen.method, "GET")
            test.eq(seen.url, "https://gitlab.example.com/api/v4/projects?membership=true&order_by=path&page=2&per_page=50&search=core&simple=true&sort=asc")
        end)

        test.it("does not call the network without credentials", function()
            local called = false
            with_http(function(): (any, any)
                called = true
                return { status_code = 200, body = "{}" }, nil
            end, function()
                local result, err = api.current_user({ component_id = "c1", mode = "credential", base_url = "https://gitlab.com" })
                test.is_nil(result)
                test.contains(tostring(err), "missing token")
            end)
            test.is_true(called == false)
        end)

        test.it("maps authentication, permission, missing, and rate-limit statuses", function()
            for _, case in ipairs({
                { 401, "unauthorized" },
                { 403, "read_api" },
                { 404, "not found" },
                { 429, "rate limited" },
            }) do
                with_http(function(): (any, any)
                    return { status_code = case[1], body = '{"message":"' .. tostring(case[1]) .. ' raw"}' }, nil
                end, function()
                    local result = api.current_user(CONN)
                    test.is_true(result.success == false)
                    test.eq(result.status_code, case[1])
                    test.contains(result.error, case[2])
                end)
            end
        end)

        test.it("reports server errors with the GitLab message or body", function()
            with_http(function(): (any, any)
                return { status_code = 500, body = '{"message":"500 Internal Server Error"}' }, nil
            end, function()
                local result = api.current_user(CONN)
                test.is_true(result.success == false)
                test.eq(result.status_code, 500)
                test.eq(result.error, "500 Internal Server Error")
            end)

            with_http(function(): (any, any)
                return { status_code = 502, body = "<html>Bad Gateway</html>" }, nil
            end, function()
                local result = api.current_user(CONN)
                test.eq(result.status_code, 502)
                test.eq(result.error, "GitLab request failed (HTTP 502): <html>Bad Gateway</html>")
            end)

            with_http(function(): (any, any)
                return { status_code = 503, body = "" }, nil
            end, function()
                local result = api.current_user(CONN)
                test.eq(result.error, "GitLab request failed (HTTP 503)")
            end)
        end)

        test.it("encodes structured validation messages and OAuth-style errors", function()
            local msg, code = api.extract_error({ status_code = 400, body = '{"message":{"name":["is too short"]}}' })
            test.eq(code, 400)
            test.contains(msg, "is too short")

            msg = api.extract_error({ status_code = 400, body = '{"error":"invalid_request","error_description":"bad param"}' })
            test.eq(msg, "bad param")
        end)

        test.it("fails with the typed transport error and reports invalid JSON", function()
            with_http(function(): (any, any)
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "dial tcp: connection refused" })
            end, function()
                local result, err = api.current_user(CONN)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(tostring(err), "dial tcp: connection refused")
            end)

            with_http(function(): (any, any)
                return { status_code = 200, body = "<html>login</html>" }, nil
            end, function()
                local result = api.current_user(CONN)
                test.is_true(result.success == false)
                test.contains(result.error, "invalid JSON")
            end)
        end)
    end)

    test.describe("gitlab api failures", function()
        -- respond runs one current-user request against a scripted response,
        -- with the client clock fixed at now when given.
        local function respond(response: any, now: integer?): any
            local prev_now = api._now
            if now then api._now = function(): integer return now :: integer end end
            local result: any
            with_http(function(): (any, any) return response, nil end, function()
                result = api.current_user(CONN)
            end)
            api._now = prev_now
            return result
        end

        test.it("reads a response header by any case, joining a repeated one", function()
            local headers = { ["RateLimit-Remaining"] = "0", ["Link"] = { "<a>; rel=\"next\"", "<b>; rel=\"last\"" } }
            test.eq(api.header_value(headers, "ratelimit-remaining"), "0")
            test.eq(api.header_value(headers, "LINK"), "<a>; rel=\"next\", <b>; rel=\"last\"")
            test.is_nil(api.header_value(headers, "RateLimit-Reset"))
            test.is_nil(api.header_value(nil, "Date"))
        end)

        test.it("returns status and headers on a failed request", function()
            local result = respond({
                status_code = 404,
                body = '{"message":"404 Not found"}',
                headers = { ["X-Request-Id"] = "req-1", ["Ratelimit-Remaining"] = "599" },
            })
            test.is_true(result.success == false)
            test.eq(result.status_code, 404)
            test.eq(result.error_kind, "not_found")
            test.eq(result.headers["X-Request-Id"], "req-1")
            test.eq(result.headers["Ratelimit-Remaining"], "599")
            test.is_nil(result.retry_after_ms)
        end)

        test.it("reports a 403 as forbidden", function()
            local result = respond({ status_code = 403, body = '{"message":"403 Forbidden"}', headers = {} })
            test.eq(result.error_kind, "forbidden")
            test.is_nil(result.retry_after_ms)
        end)

        test.it("reports a 429 as rate_limited with the Retry-After wait", function()
            local result = respond({
                status_code = 429,
                body = "Retry later",
                headers = {
                    ["Retry-After"] = "42",
                    ["Ratelimit-Name"] = "throttle_authenticated_api",
                    ["Ratelimit-Remaining"] = "0",
                    ["Ratelimit-Reset"] = "1700000099",
                },
            }, 1700000000)
            test.eq(result.status_code, 429)
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 42000)
            test.eq(result.headers["Ratelimit-Name"], "throttle_authenticated_api")
        end)

        test.it("falls back to RateLimit-Reset once RateLimit-Remaining is 0", function()
            local result = respond({
                status_code = 429,
                body = "",
                headers = { ["ratelimit-remaining"] = "0", ["ratelimit-reset"] = "1700000030" },
            }, 1700000000)
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 30000)
        end)

        test.it("waits one minute on a 429 with no wait header", function()
            local result = respond({ status_code = 429, body = "", headers = {} })
            test.eq(result.error_kind, "rate_limited")
            test.eq(result.retry_after_ms, 60000)
        end)

        test.it("fails unsent and unauthorized requests with typed errors and reports an invalid response", function()
            local missing: any, missing_err: any
            with_http(function(): (any, any) return nil, nil end, function()
                missing, missing_err = api.current_user(CONN)
            end)
            test.is_nil(missing)
            test.is_true(errors.is(missing_err, errors.UNAVAILABLE))

            local refused: any, refused_err: any
            with_http(function(): (any, any) return nil, errors.new({ kind = errors.UNAVAILABLE, message = "dial tcp: connection refused" }) end, function()
                refused, refused_err = api.current_user(CONN)
            end)
            test.is_nil(refused)
            test.is_true(errors.is(refused_err, errors.UNAVAILABLE))

            local result = respond({ status_code = 200, body = "<html>login</html>", headers = { ["X-Request-Id"] = "req-2" } })
            test.eq(result.error_kind, "invalid_response")
            test.eq(result.status_code, 200)
            test.eq(result.headers["X-Request-Id"], "req-2")

            local unauthorized, auth_err = api.current_user({ component_id = "c1", mode = "credential", base_url = "https://gitlab.com" })
            test.is_nil(unauthorized)
            test.is_true(errors.is(auth_err, errors.INVALID))
        end)

        test.it("keeps a rejection's error body", function()
            local result = respond({ status_code = 422, body = '{"message":{"name":["has already been taken"]}}', headers = {} })
            test.is_false(result.success)
            test.eq(result.data.message.name[1], "has already been taken")
        end)
    end)

    test.describe("gitlab api pagination", function()
        test.it("reads X-Next-Page in any header case", function()
            test.eq(api.next_page({ ["X-Next-Page"] = "2" }), "2")
            test.eq(api.next_page({ ["x-next-page"] = "5" }), "5")
            test.eq(api.next_page({ ["x-next-page"] = { "4" } }), "4")
        end)

        test.it("treats an empty X-Next-Page as the last page", function()
            test.is_nil(api.next_page({ ["x-next-page"] = "" }))
            test.is_nil(api.next_page({
                ["x-next-page"] = "",
                link = '<https://gitlab.com/api/v4/projects?page=1>; rel="first"',
            }))
        end)

        test.it("falls back to the Link header next relation", function()
            test.eq(api.next_page({
                Link = '<https://gitlab.com/api/v4/projects?page=1&per_page=20>; rel="prev", <https://gitlab.com/api/v4/projects?id=1&page=3&per_page=20>; rel="next"',
            }), "3")
            test.eq(api.next_page({
                link = '<https://gitlab.com/api/v4/projects?page=2>; rel="next"',
            }), "2")
            test.is_nil(api.next_page({
                Link = '<https://gitlab.com/api/v4/projects?page=1>; rel="first", <https://gitlab.com/api/v4/projects?page=1>; rel="last"',
            }))
        end)

        test.it("reports no next page without pagination headers", function()
            test.is_nil(api.next_page({}))
            test.is_nil(api.next_page(nil))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
