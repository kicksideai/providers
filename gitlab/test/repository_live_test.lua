local test = require("test")
local env = require("env")
local funcs = require("funcs")
local uuid = require("uuid")
local time = require("time")
local base64 = require("base64")
local component = require("component")
local function define_tests()
    test.describe("GitLab live repository tools", function()
        test.it("creates and merges a multi-file change through a real GitLab instance", function()
            local token, base_url, project = env.get("KICKSIDE_GITLAB_DEMO_TOKEN"), env.get("KICKSIDE_GITLAB_DEMO_URL"), env.get("KICKSIDE_GITLAB_DEMO_PROJECT")
            test.is_true(type(token) == "string" and token ~= "", "Set the demo token")
            test.is_true(base_url == "http://127.0.0.1:19130", "Live tests target the isolated localhost demo only")
            local service, service_err = component.get_service()
            test.is_nil(service_err)
            local id = uuid.v4()
            local registered, register_err = service:register({component_id = id, impl_id = "kickside.gitlab.connection:gitlab_connection",
                meta = {class = "connection", provider = "gitlab", title = "Disposable repository verification"}, private_context = {token = token, base_url = base_url}})
            test.is_nil(register_err, tostring(register_err)); test.is_true(registered.success, registered.error)
            local exec = funcs.new():with_context({connection_id = id})
            local function call(write, args)
                args.project = project
                local value, err = exec:call("kickside.gitlab.traits:" .. (write and "write" or "read") .. "_tool", args)
                test.is_nil(err, tostring(err)); test.is_true(value.success, value.error)
                return value.data
            end
            local metadata = call(false, {action = "get_project"})
            test.eq(metadata.path, "kickside-connector-demo")
            local suffix = uuid.v4()
            local branch = "kickside-demo/" .. suffix
            local path = "connector-verification/" .. suffix .. ".txt"
            local empty_path = "connector-verification/" .. suffix .. "-empty.txt"
            call(true, {action = "create_branch", payload = {branch = branch, ref = metadata.default_branch}})
            local content = "Verified by KickSide's GitLab tools.\n"
            local committed = call(true, {action = "create_commit", payload = {branch = branch, commit_message = "test: verify repository connector", actions = {
                {action = "create", file_path = path, content = content},
                {action = "create", file_path = empty_path, content = ""},
            }}})
            local merge = call(true, {action = "create_merge_request", payload = {title = "test: verify Kickside connector", source_branch = branch, target_branch = metadata.default_branch, remove_source_branch = true}})
            local diffs = {}
            for _ = 1, 60 do
                diffs = call(false, {action = "list_merge_request_diffs", number = tostring(merge.iid)})
                local status = call(false, {action = "get_merge_request", number = tostring(merge.iid)})
                if #diffs == 2 and status.detailed_merge_status == "mergeable" then break end
                time.sleep("500ms")
            end
            test.eq(#diffs, 2)
            call(true, {action = "create_merge_request_note", number = tostring(merge.iid), payload = {body = "Verified through the actual KickSide agent tool."}})
            local merged = call(true, {action = "merge_merge_request", number = tostring(merge.iid), payload = {sha = committed.id, should_remove_source_branch = true}})
            test.eq(merged.state, "merged")
            local final = call(false, {action = "get_file", path = path, ref = metadata.default_branch})
            test.eq(final.file_path, path)
            test.eq(base64.decode(final.content:gsub("%s", "")), content)
            local issue = call(true, {action = "create_issue", payload = {title = "Connector verification"}})
            local closed = call(true, {action = "update_issue", number = tostring(issue.iid), payload = {state_event = "close"}})
            test.eq(closed.state, "closed")
        end)
    end)
end
return {run = test.run_cases(define_tests)}
