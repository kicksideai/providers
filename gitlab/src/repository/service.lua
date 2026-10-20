local ctx = require("ctx")
local transport = require("transport")
local output = require("output")
local tool_result = require("tool_result")
-- The payload varies by named action; its closed schema is declared on each
-- tool. Runtime validation below also protects direct function callers.
type Identifier = string | number
type Request = {
    action: string,
    ref: string?, path: string?, number: Identifier?,
    page: number?, limit: number?, state: string?,
    payload: {[string]: any}?,
    project: Identifier?, search: string?,
}
local M = {_transport = transport}

local READ = {
    viewer = {"/user"}, list_projects = {"/projects"}, get_project = {""},
    list_issues = {"/issues"}, get_issue = {"/issues/{number}"}, list_issue_notes = {"/issues/{number}/notes"},
    list_merge_requests = {"/merge_requests"}, get_merge_request = {"/merge_requests/{number}"},
    list_merge_request_diffs = {"/merge_requests/{number}/diffs"}, list_merge_request_notes = {"/merge_requests/{number}/notes"},
    list_branches = {"/repository/branches"}, get_branch = {"/repository/branches/{ref}"},
    list_commits = {"/repository/commits"}, get_commit = {"/repository/commits/{ref}"},
    get_tree = {"/repository/tree"}, get_file = {"/repository/files/{path}"},
    list_pipelines = {"/pipelines"}, get_pipeline = {"/pipelines/{number}"}, list_pipeline_jobs = {"/pipelines/{number}/jobs"},
}
-- Each action owns a closed payload allowlist. No caller-supplied method, URL,
-- path, authorization header or arbitrary API passthrough is accepted.
local WRITE: {[string]: {string}} = {
    create_issue = {"POST", "/issues", "title", "title,description,labels,assignee_ids"},
    update_issue = {"PUT", "/issues/{number}", "", "title,description,labels,assignee_ids,state_event"},
    create_issue_note = {"POST", "/issues/{number}/notes", "body", "body"},
    create_branch = {"POST", "/repository/branches", "branch,ref", "branch,ref"},
    create_commit = {"POST", "/repository/commits", "branch,commit_message,actions", "branch,commit_message,actions,start_branch,start_sha"},
    create_merge_request = {"POST", "/merge_requests", "source_branch,target_branch,title", "source_branch,target_branch,title,description,draft,remove_source_branch,squash,reviewer_ids,assignee_ids"},
    update_merge_request = {"PUT", "/merge_requests/{number}", "", "title,description,target_branch,state_event,remove_source_branch,squash,reviewer_ids,assignee_ids"},
    create_merge_request_note = {"POST", "/merge_requests/{number}/notes", "body", "body"},
    approve_merge_request = {"POST", "/merge_requests/{number}/approve", "sha", "sha"},
    merge_merge_request = {"PUT", "/merge_requests/{number}/merge", "sha", "sha,merge_commit_message,squash,squash_commit_message,should_remove_source_branch"},
    create_pipeline = {"POST", "/pipeline", "ref", "ref"},
    retry_pipeline = {"POST", "/pipelines/{number}/retry", "", ""},
}
local function encode(value: any): string
    return (tostring(value):gsub("[^%w%-%._~]", function(c) return string.format("%%%02X", string.byte(c)) end))
end
local function valid_file(path: any): boolean
    if type(path) ~= "string" or path == "" or path:sub(1, 1) == "/" or path:find("[\r\n\\]") then return false end
    for part in path:gmatch("[^/]+") do if part == "." or part == ".." then return false end end
    return true
end

local function run(args: Request, write: boolean): any
    args = type(args) == "table" and args or {}
    local action = args.action
    local spec = write and WRITE[action] or (not write and READ[action])
    if not spec then return tool_result.domain_error("Unsupported GitLab " .. (write and "write" or "read") .. " action") end
    local method, path = write and spec[1] or "GET", write and spec[2] or spec[1]
    if action ~= "viewer" and action ~= "list_projects" then
        if (type(args.project) ~= "string" and type(args.project) ~= "number") or tostring(args.project) == "" then return tool_result.domain_error("project id or full project path is required") end
        path = "/projects/" .. encode(args.project) .. path
    end
    for key in path:gmatch("{(%w+)}") do
        local value = args[key]
        if (type(value) ~= "string" and type(value) ~= "number") or tostring(value) == "" then return tool_result.domain_error(key .. " is required") end
        if key == "number" and not tostring(value):match("^[1-9]%d*$") then return tool_result.domain_error("number must be a positive integer") end
        path = path:gsub("{" .. key .. "}", function() return encode(value) end)
    end
    local body, query
    if write then
        body = args.payload or {}
        if type(body) ~= "table" then return tool_result.domain_error("payload must be an object") end
        local allowed = {}
        for key in spec[4]:gmatch("[^,]+") do allowed[key] = true end
        for key in pairs(body) do if not allowed[key] then return tool_result.domain_error("Unexpected payload field: " .. tostring(key)) end end
        for key in spec[3]:gmatch("[^,]+") do if body[key] == nil or body[key] == "" then return tool_result.domain_error(key .. " is required") end end
        if action:match("^update_") and next(body) == nil then return tool_result.domain_error("At least one update field is required") end
        if action == "create_commit" then
            if type(body.actions) ~= "table" or #body.actions == 0 then return tool_result.domain_error("Commit actions must not be empty") end
            for _, item in ipairs(body.actions) do
                if type(item) ~= "table" or not valid_file(item.file_path) then return tool_result.domain_error("Commit actions require a relative file_path") end
                local valid = {create = true, update = true, delete = true, move = true, chmod = true}
                if not valid[item.action] then return tool_result.domain_error("Invalid commit action") end
                if (item.action == "create" or item.action == "update") and type(item.content) ~= "string" then return tool_result.domain_error("File content is required") end
                if item.action == "move" and not valid_file(item.previous_path) then return tool_result.domain_error("previous_path is required for a move") end
            end
        end
    else
        local page, limit = tonumber(args.page) or 1, tonumber(args.limit) or 25
        if page < 1 or page ~= math.floor(page) or limit < 1 or limit > 100 or limit ~= math.floor(limit) then return tool_result.domain_error("page must be positive and limit must be between 1 and 100") end
        query = {page = page, per_page = limit, state = args.state, search = args.search}
        if action == "list_projects" then query.membership = true end
        if action == "get_file" and (type(args.ref) ~= "string" or args.ref == "") then return tool_result.domain_error("ref is required for get_file") end
        if action == "get_file" or action == "get_tree" then query.ref, query.path = args.ref, action == "get_tree" and args.path or nil end
        if action == "list_commits" then query.ref_name = args.ref end
    end
    if write and next(body) == nil then body = table.create(0, 1) end
    local conn, connect_err = M._transport.connect(ctx.get("connection_id"))
    if not conn then return nil, connect_err end
    local result, request_err = M._transport.request(conn, method, path, query, body)
    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, output.sanitize(result)) end
    return tool_result.ok({success = true, data = output.sanitize(result.data), next_page = M._transport.next_page(result.headers)})
end
function M.read(args: Request): any return run(args, false) end
function M.write(args: Request): any return run(args, true) end
return M
