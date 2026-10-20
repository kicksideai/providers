local test = require("test")
local repository = require("repository")
local api = require("api")
local json = require("json")
local function fixture(fn)
    local previous_http, previous_transport = api._http, repository._transport
    local calls = {}
    local conn = {component_id = "demo", auth_type = "api_token", authorization = "Bearer test-token"}
    api._http = {request = function(method, url, options)
        calls[#calls + 1] = {method = method, url = url, options = options}
        return {status_code = 200, headers = {}, body = '{"id":7,"access_token":"must-not-leak"}'}, nil
    end}
    repository._transport = {connect = function() return conn, nil end, request = api.request, next_page = api.next_page}
    local ok, err = pcall(fn, calls, conn)
    api._http, repository._transport = previous_http, previous_transport
    if not ok then error(err) end
end
local function define_tests()
    test.describe("bitbucket repository tool boundaries", function()

        test.it("commits file changes with form encoding and prevents metadata filename collisions", function()
            fixture(function(calls)
                local result = repository.write({action = "create_commit", workspace = "acme", repo = "core", payload = {branch = "feature/demo", message = "Real message", files = {{path = "message", content = "file + body&="}, {path = "old.txt", delete = true}}}})
                test.is_true(result.success)
                test.eq(result.data.access_token, "[redacted]")
                test.eq(calls[1].method, "POST")
                test.eq(calls[1].url, "https://api.bitbucket.org/2.0/repositories/acme/core/src")
                test.eq(calls[1].options.headers["Content-Type"], "application/x-www-form-urlencoded")
                test.contains(calls[1].options.body, "%2Fmessage=file%20%2B%20body%26%3D")
                test.contains(calls[1].options.body, "message=Real%20message")
                test.contains(calls[1].options.body, "files=%2Fold.txt")
            end)
        end)
        test.it("creates pull requests with explicit branch targets", function()
            fixture(function(calls)
                test.is_true(repository.write({action = "create_pull_request", workspace = "acme", repo = "core", payload = {title = "Demo", source = {branch = {name = "feature/demo"}}, destination = {branch = {name = "main"}}}}).success)
                test.eq(calls[1].url, "https://api.bitbucket.org/2.0/repositories/acme/core/pullrequests")
                test.eq(json.decode(calls[1].options.body).source.branch.name, "feature/demo")
            end)
        end)
        test.it("returns raw source contents and honors workspace-scoped credentials", function()
            fixture(function(calls, conn)
                api._http = {request = function(method, url, opts)
                    calls[#calls + 1] = {method = method, url = url, options = opts}
                    return {status_code = 200, body = "source file", headers = {}}, nil
                end}
                local result = repository.read({action = "get_file", workspace = "acme", repo = "core", ref = "feature/demo", path = "docs/file.txt"})
                test.is_true(result.success); test.eq(result.data.content, "source file")
                test.contains(calls[1].url, "/src/feature%2Fdemo/docs/file.txt")
                conn.workspace = "different"
                local denied, err = repository.read({action = "get_repo", workspace = "acme", repo = "core"})
                test.is_nil(denied); test.is_true(errors.is(err, errors.PERMISSION_DENIED)); test.eq(#calls, 1)
            end)
        end)
        test.it("rejects writes through the reader and invalid file and payload inputs before HTTP", function()
            fixture(function(calls)
                test.is_false(repository.read({action = "create_branch", workspace = "acme", repo = "core"}).success)
                test.is_false(repository.write({action = "create_commit", workspace = "acme", repo = "core", payload = {branch = "x", message = "x", files = {{path = "../secret", content = "x"}}}}).success)
                test.is_false(repository.write({action = "create_branch", workspace = "acme", repo = "core", payload = {name = "x", target = {hash = "abc"}, url = "https://attacker.example"}}).success)
                test.eq(#calls, 0)
            end)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
