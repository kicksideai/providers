local test = require("test")
local repository = require("repository")
local api = require("api")
local json = require("json")
local function fixture(fn)
    local previous_http, previous_transport = api._http, repository._transport
    local calls = {}
    local conn = {component_id = "demo", mode = "credential", token = "test-token"}
    api._http = {request = function(method, url, options)
        calls[#calls + 1] = {method = method, url = url, options = options}
        return {status_code = 200, headers = {}, body = '{"id":7,"access_token":"must-not-leak"}'}, nil
    end}
    repository._transport = {connect = function() return conn, nil end, request = api.request, has_next_page = api.has_next_page}
    local ok, err = pcall(fn, calls, conn)
    api._http, repository._transport = previous_http, previous_transport
    if not ok then error(err) end
end
local function define_tests()
    test.describe("github repository tool boundaries", function()

        test.it("commits empty or populated files to the selected branch and redacts provider secrets", function()
            fixture(function(calls)
                local result = repository.write({action = "upsert_file", owner = "acme", repo = "core", path = "docs/a b.md", payload = {branch = "feature/demo", message = "Verify", content = ""}})
                test.is_true(result.success); test.eq(result.data.access_token, "[redacted]")
                test.eq(calls[1].method, "PUT")
                test.eq(calls[1].url, "https://api.github.com/repos/acme/core/contents/docs/a%20b.md")
                test.eq(json.decode(calls[1].options.body).branch, "feature/demo")
                test.eq(json.decode(calls[1].options.body).content, "")
            end)
        end)
        test.it("creates pull requests and requires the expected head before merging", function()
            fixture(function(calls)
                test.is_true(repository.write({action = "create_pull_request", owner = "acme", repo = "core", payload = {title = "Demo", head = "feature/demo", base = "main"}}).success)
                test.is_true(repository.write({action = "merge_pull_request", owner = "acme", repo = "core", number = "3", payload = {sha = "expected-head", merge_method = "squash"}}).success)
                test.eq(calls[2].method, "PUT")
                test.eq(calls[2].url, "https://api.github.com/repos/acme/core/pulls/3/merge")
                test.eq(json.decode(calls[2].options.body).sha, "expected-head")
                test.is_false(repository.write({action = "merge_pull_request", owner = "acme", repo = "core", number = "3"}).success)
                test.eq(#calls, 2)
            end)
        end)
        test.it("rejects writes through the reader and path traversal before HTTP", function()
            fixture(function(calls)
                test.is_false(repository.read({action = "upsert_file", owner = "acme", repo = "core"}).success)
                test.is_false(repository.write({action = "upsert_file", owner = "acme", repo = "core", path = "../secret", payload = {branch = "x", message = "bad", content = ""}}).success)
                test.is_false(repository.write({action = "create_branch", owner = "acme", repo = "core", payload = {ref = "refs/tags/x", sha = "abc"}}).success)
                test.eq(#calls, 0)
            end)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
