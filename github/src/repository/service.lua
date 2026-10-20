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
    owner: string?, repo: string?, workflow_id: string?, recursive: boolean?,
}
local M = {_transport = transport}
local READ: {[string]: string} = {
    list_repositories = "/user/repos", get_repo = "", list_pull_requests = "/pulls", get_pull_request = "/pulls/{number}",
    list_pull_files = "/pulls/{number}/files", list_pull_reviews = "/pulls/{number}/reviews",
    list_pull_comments = "/pulls/{number}/comments", list_branches = "/branches", get_branch = "/branches/{ref}",
    list_commits = "/commits", get_commit = "/commits/{ref}", get_ref = "/git/ref/{ref}",
    get_file = "/contents/{path}", get_tree = "/git/trees/{ref}",
    list_check_runs = "/commits/{ref}/check-runs", get_commit_status = "/commits/{ref}/status",
    list_workflow_runs = "/actions/runs", get_workflow_run = "/actions/runs/{number}",
}
local WRITE: {[string]: {string}} = {
    create_branch = {"POST", "/git/refs", "ref,sha", "ref,sha"},
    upsert_file = {"PUT", "/contents/{path}", "message,content,branch", "message,content,sha,branch"},
    delete_file = {"DELETE", "/contents/{path}", "message,sha,branch", "message,sha,branch"},
    create_pull_request = {"POST", "/pulls", "title,head,base", "title,head,base,body,draft,maintainer_can_modify"},
    update_pull_request = {"PATCH", "/pulls/{number}", "", "title,body,state,base,maintainer_can_modify"},
    create_pull_review = {"POST", "/pulls/{number}/reviews", "event", "commit_id,body,event,comments"},
    request_pull_reviewers = {"POST", "/pulls/{number}/requested_reviewers", "", "reviewers,team_reviewers"},
    merge_pull_request = {"PUT", "/pulls/{number}/merge", "sha", "sha,commit_title,commit_message,merge_method"},
    dispatch_workflow = {"POST", "/actions/workflows/{workflow_id}/dispatches", "ref", "ref,inputs"},
}
local function encode(v: any): string return (tostring(v):gsub("[^%w%-%._~]", function(c) return string.format("%%%02X", string.byte(c)) end)) end
local function segment(v: any): boolean return type(v) == "string" and v:match("^[%w_%.%-]+$") ~= nil and v ~= "." and v ~= ".." end
local function run(args: Request, write: boolean): any
    args = type(args) == "table" and args or {}
    local action = args.action
    local spec: any = write and WRITE[action] or (not write and READ[action])
    if not spec then return tool_result.domain_error("Unsupported GitHub repository " .. (write and "write" or "read") .. " action") end
    local method, path = write and spec[1] or "GET", write and spec[2] or spec
    if action ~= "list_repositories" then
        if not segment(args.owner) or not segment(args.repo) then return tool_result.domain_error("owner and repo are required") end
        path = "/repos/" .. encode(args.owner) .. "/" .. encode(args.repo) .. path
    end
    for key in path:gmatch("{([%w_]+)}") do
        local value = args[key]
        if (type(value) ~= "string" and type(value) ~= "number") or tostring(value) == "" then return tool_result.domain_error(key .. " is required") end
        if key == "number" and not tostring(value):match("^[1-9]%d*$") then return tool_result.domain_error("number must be a positive integer") end
        local encoded = encode(value)
        if key == "path" or (action == "get_ref" and key == "ref") then
            if tostring(value):sub(1,1) == "/" then return tool_result.domain_error(key .. " must be relative") end
            for part in tostring(value):gmatch("[^/]+") do if part == "." or part == ".." then return tool_result.domain_error(key .. " must not traverse directories") end end
            encoded = encoded:gsub("%%2F", "/")
        end
        path = path:gsub("{" .. key .. "}", function() return encoded end)
    end
    local body, query
    if write then
        body = args.payload or {}
        if type(body) ~= "table" then return tool_result.domain_error("payload must be an object") end
        local allowed = {}
        for key in spec[4]:gmatch("[^,]+") do allowed[key] = true end
        for key in pairs(body) do if not allowed[key] then return tool_result.domain_error("Unexpected payload field: " .. tostring(key)) end end
        for key in spec[3]:gmatch("[^,]+") do if body[key] == nil or (body[key] == "" and key ~= "content") then return tool_result.domain_error(key .. " is required") end end
        if action == "create_branch" and (type(body.ref) ~= "string" or not body.ref:match("^refs/heads/.+")) then return tool_result.domain_error("ref must start with refs/heads/") end
        if action == "upsert_file" and type(body.content) ~= "string" then return tool_result.domain_error("content must be base64-encoded file content") end
        if action == "update_pull_request" and next(body) == nil then return tool_result.domain_error("At least one update field is required") end
        if action == "request_pull_reviewers" and not body.reviewers and not body.team_reviewers then return tool_result.domain_error("reviewers or team_reviewers is required") end
    else
        local page, limit = tonumber(args.page) or 1, tonumber(args.limit) or 25
        if page < 1 or page ~= math.floor(page) or limit < 1 or limit > 100 or limit ~= math.floor(limit) then return tool_result.domain_error("page must be positive and limit must be between 1 and 100") end
        query = {page = page, per_page = limit, state = args.state}
        if action == "get_file" then query.ref = args.ref end
        if action == "list_commits" then query.sha = args.ref end
        if action == "get_tree" then query.recursive = args.recursive and "1" or nil end
    end
    local conn, connect_err = M._transport.connect(ctx.get("connection_id"))
    if not conn then return nil, connect_err end
    local result, request_err = M._transport.request(conn, method, path, body, query)
    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, output.sanitize(result)) end
    return tool_result.ok({success = true, data = output.sanitize(result.data), next_page = not write and M._transport.has_next_page(result.headers) and (query.page + 1) or nil})
end
function M.read(args: Request): any return run(args, false) end
function M.write(args: Request): any return run(args, true) end
return M
