local test = require("test")
local repository = require("repository")
local api = require("api")
local json = require("json")
local function fixture(fn)
    local previous_http, previous_transport = api._http, repository._transport
    local calls = {}
    local conn = {component_id = "demo", mode = "credential", base_url = "https://gitlab.example", token = "test-token"}
    api._http = {request = function(method, url, options)
        calls[#calls + 1] = {method = method, url = url, options = options}
        return {status_code = 200, headers = {}, body = '{"id":7,"access_token":"must-not-leak"}'}, nil
    end}
    repository._transport = {connect = function() return conn, nil end, request = api.request_json, next_page = api.next_page}
    local ok, err = pcall(fn, calls, conn)
    api._http, repository._transport = previous_http, previous_transport
    if not ok then error(err) end
end
local function define_tests()
    test.describe("gitlab repository tool boundaries", function()

        test.it("creates branches and commits with encoded project paths and credential authentication", function()
            fixture(function(calls)
                local result = repository.write({action = "create_branch", project = "acme/core", payload = {branch = "feature/demo", ref = "main"}})
                test.is_true(result.success)
                test.eq(result.data.access_token, "[redacted]")
                test.eq(calls[1].method, "POST")
                test.eq(calls[1].url, "https://gitlab.example/api/v4/projects/acme%2Fcore/repository/branches")
                test.eq(calls[1].options.headers["PRIVATE-TOKEN"], "test-token")
                test.eq(json.decode(calls[1].options.body).branch, "feature/demo")
                local commit = repository.write({action = "create_commit", project = "acme/core", payload = {branch = "feature/demo", commit_message = "Verify", actions = {{action = "create", file_path = "docs/demo.txt", content = ""}}}})
                test.is_true(commit.success)
                test.eq(calls[2].url, "https://gitlab.example/api/v4/projects/acme%2Fcore/repository/commits")
                test.eq(json.decode(calls[2].options.body).actions[1].content, "")
            end)
        end)
        test.it("supports merge request lifecycle and verifies the expected merge SHA", function()
            fixture(function(calls)
                test.is_true(repository.write({action = "create_merge_request", project = "7", payload = {source_branch = "feature/demo", target_branch = "main", title = "Demo"}}).success)
                test.is_true(repository.write({action = "merge_merge_request", project = "7", number = "3", payload = {sha = "expected-head"}}).success)
                test.eq(calls[2].method, "PUT")
                test.eq(calls[2].url, "https://gitlab.example/api/v4/projects/7/merge_requests/3/merge")
                test.eq(json.decode(calls[2].options.body).sha, "expected-head")
                test.is_false(repository.write({action = "merge_merge_request", project = "7", number = "3"}).success)
                test.eq(#calls, 2)
            end)
        end)
        test.it("reads a versioned file without treating its path or ref as a URL", function()
            fixture(function(calls)
                test.is_true(repository.read({action = "get_file", project = "acme/core", path = "docs/a b.md", ref = "feature/demo"}).success)
                test.contains(calls[1].url, "/repository/files/docs%2Fa%20b.md?")
                test.contains(calls[1].url, "ref=feature%2Fdemo")
            end)
        end)
        test.it("rejects writes through the reader, arbitrary payloads and unsafe commit paths before HTTP", function()
            fixture(function(calls)
                test.is_false(repository.read({action = "create_branch", project = "7"}).success)
                test.is_false(repository.write({action = "create_branch", project = "7", payload = {branch = "x", ref = "main", url = "https://attacker.example"}}).success)
                test.is_false(repository.write({action = "create_commit", project = "7", payload = {branch = "x", commit_message = "bad", actions = {{action = "create", file_path = "../secret", content = "x"}}}}).success)
                test.eq(#calls, 0)
            end)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
