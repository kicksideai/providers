-- Explicit opt-in only. The caller must provision a disposable repository and
-- supply its name and a token through OS environment storage. Never runs in CI.
local test = require("test")
local env = require("env")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local base64 = require("base64")
local component = require("component")
local function define_tests()
    test.describe("GitHub live repository tools", function()
        test.it("creates a branch, commits a file, opens and merges a pull request, and reads the merged content", function()
            local token = env.get("KICKSIDE_GITHUB_DEMO_TOKEN")
            local owner = env.get("KICKSIDE_GITHUB_DEMO_OWNER")
            local repo = env.get("KICKSIDE_GITHUB_DEMO_REPO")
            test.is_true(type(token) == "string" and token ~= "", "Set the demo token")
            test.is_true(type(repo) == "string" and repo:match("^kickside%-connector%-demo") ~= nil, "Live tests require a disposable kickside-connector-demo repository")
            local service, service_err = component.get_service()
            test.is_nil(service_err)
            local id = uuid.v4()
            local registered, register_err = service:register({component_id = id, impl_id = "kickside.github.connection:github_connection",
                meta = {class = "connection", provider = "github", title = "Disposable repository verification"}, private_context = {token = token}})
            test.is_nil(register_err, tostring(register_err)); test.is_true(registered.success, registered.error or "Register demo connection")
            local exec = funcs.new():with_context({connection_id = id})
            local function call(write, args)
                args.owner, args.repo = owner, repo
                local value, err = exec:call("kickside.github.traits:repo_" .. (write and "write" or "read") .. "_tool", args)
                test.is_nil(err, tostring(err)); test.is_true(value.success, value.error)
                return value.data
            end
            local metadata = call(false, {action = "get_repo"})
            local ref = call(false, {action = "get_ref", ref = "heads/" .. metadata.default_branch})
            local suffix = uuid.v4()
            local branch = "kickside-demo/" .. suffix
            call(true, {action = "create_branch", payload = {ref = "refs/heads/" .. branch, sha = ref.object.sha}})
            local path = "connector-verification/" .. suffix .. ".txt"
            local content = "Verified by the KickSide GitHub repository tool.\n"
            local committed = call(true, {action = "upsert_file", path = path, payload = {branch = branch, message = "test: verify Kickside repository connector", content = base64.encode(content)}})
            local pull = call(true, {action = "create_pull_request", payload = {title = "test: verify Kickside connector", head = branch, base = metadata.default_branch, body = "Disposable live connector verification."}})
            local files = call(false, {action = "list_pull_files", number = tostring(pull.number)})
            test.eq(files[1].filename, path)
            local merged = call(true, {action = "merge_pull_request", number = tostring(pull.number), payload = {sha = committed.commit.sha, merge_method = "squash"}})
            test.is_true(merged.merged)
            local final = call(false, {action = "get_file", path = path, ref = metadata.default_branch})
            local decoded = base64.decode(final.content:gsub("%s", ""))
            test.eq(decoded, content)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
