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
    workspace: string?, repo: string?, pipeline_id: string?, q: string?,
}
local M = {_transport = transport}
local READ: {[string]: any} = {
    viewer = {"/user"}, get_repo = {""}, list_repositories = {""},
    list_issues = {"/issues"}, get_issue = {"/issues/{number}"},
    list_pull_requests = {"/pullrequests"}, get_pull_request = {"/pullrequests/{number}"},
    list_pull_request_comments = {"/pullrequests/{number}/comments"},
    get_pull_request_diff = {"/pullrequests/{number}/diff", true}, list_pull_request_diffstat = {"/pullrequests/{number}/diffstat"},
    list_branches = {"/refs/branches"}, get_branch = {"/refs/branches/{ref}"},
    list_commits = {"/commits/{ref}"}, get_commit = {"/commit/{ref}"},
    get_file = {"/src/{ref}/{path}", true}, list_directory = {"/src/{ref}/{path}"},
    list_pipelines = {"/pipelines"}, get_pipeline = {"/pipelines/{pipeline_id}"},
    list_commit_statuses = {"/commit/{ref}/statuses"},
}
local WRITE: {[string]: {string}} = {
    create_commit = {"POST", "/src", "branch,message,files", "branch,message,files,parents"},
    create_issue = {"POST", "/issues", "title", "title,content,kind,priority,assignee"},
    update_issue = {"PUT", "/issues/{number}", "", "title,content,kind,priority,assignee,state"},
    create_branch = {"POST", "/refs/branches", "name,target", "name,target"},
    create_pull_request = {"POST", "/pullrequests", "title,source,destination", "title,description,source,destination,reviewers,close_source_branch,draft"},
    update_pull_request = {"PUT", "/pullrequests/{number}", "", "title,description,destination,reviewers,close_source_branch,draft"},
    create_pull_request_comment = {"POST", "/pullrequests/{number}/comments", "content", "content,inline"},
    approve_pull_request = {"POST", "/pullrequests/{number}/approve", "", ""},
    merge_pull_request = {"POST", "/pullrequests/{number}/merge", "", "message,close_source_branch,merge_strategy"},
    decline_pull_request = {"POST", "/pullrequests/{number}/decline", "", ""},
    create_pipeline = {"POST", "/pipelines", "target", "target"},
}
local function encode(v: any): string return (tostring(v):gsub("[^%w%-%._~]", function(c) return string.format("%%%02X", string.byte(c)) end)) end
local function segment(v: any): boolean return type(v) == "string" and v:match("^[%w_%.%-]+$") ~= nil and v ~= "." and v ~= ".." end
local function run(args: Request, write: boolean): any
    args = type(args) == "table" and args or {}
    local action = args.action
    local spec: any = write and WRITE[action] or (not write and READ[action])
    if not spec then return tool_result.domain_error("Unsupported Bitbucket " .. (write and "write" or "read") .. " action") end
    local method, path = write and spec[1] or "GET", write and spec[2] or spec[1]
    if action ~= "viewer" then
        if not segment(args.workspace) then return tool_result.domain_error("workspace slug is required") end
        if action == "list_repositories" then path = "/repositories/" .. encode(args.workspace)
        else
            if not segment(args.repo) then return tool_result.domain_error("repo slug is required") end
            path = "/repositories/" .. encode(args.workspace) .. "/" .. encode(args.repo) .. path
        end
    end
    for key in path:gmatch("{([%w_]+)}") do
        local value = args[key]
        if action == "list_directory" and key == "path" and value == nil then value = "" end
        local root_directory = action == "list_directory" and key == "path" and value == ""
        if (type(value) ~= "string" and type(value) ~= "number") or (tostring(value) == "" and not root_directory) then return tool_result.domain_error(key .. " is required") end
        if key == "number" and not tostring(value):match("^[1-9]%d*$") then return tool_result.domain_error("number must be a positive integer") end
        -- Refs are one encoded segment; source paths preserve directory separators.
        local encoded = encode(value)
        if key == "path" then
            if tostring(value):sub(1,1) == "/" then return tool_result.domain_error("path must be relative") end
            for part in tostring(value):gmatch("[^/]+") do if part == "." or part == ".." then return tool_result.domain_error("path must not traverse directories") end end
            encoded = encoded:gsub("%%2F", "/")
        end
        path = path:gsub("{" .. key .. "}", function() return encoded end)
    end
    local body, query, form_body
    if write then
        body = args.payload or {}
        if type(body) ~= "table" then return tool_result.domain_error("payload must be an object") end
        local allowed = {}
        for key in spec[4]:gmatch("[^,]+") do allowed[key] = true end
        for key in pairs(body) do if not allowed[key] then return tool_result.domain_error("Unexpected payload field: " .. tostring(key)) end end
        for key in spec[3]:gmatch("[^,]+") do if body[key] == nil or body[key] == "" then return tool_result.domain_error(key .. " is required") end end
        if action:match("^update_") and next(body) == nil then return tool_result.domain_error("At least one update field is required") end
        if action == "create_branch" and (type(body.target) ~= "table" or type(body.target.hash) ~= "string" or body.target.hash == "") then return tool_result.domain_error("target.hash is required") end
        if action == "create_pull_request" then
            for _, key in ipairs({"source", "destination"}) do
                local value = body[key]
                if type(value) ~= "table" or type(value.branch) ~= "table" or type(value.branch.name) ~= "string" or value.branch.name == "" then return tool_result.domain_error(key .. ".branch.name is required") end
            end
        end
        if action == "create_commit" then
            if type(body.files) ~= "table" or #body.files == 0 then return tool_result.domain_error("files must contain at least one change") end
            local fields: any = {branch = body.branch, message = body.message, parents = body.parents}
            local deleted = {}
            local seen = {}
            for _, file in ipairs(body.files) do
                if type(file) ~= "table" or type(file.path) ~= "string" or file.path == "" or file.path:sub(1,1) == "/" or file.path:find("[\r\n\\]") then return tool_result.domain_error("files require relative repository paths") end
                for part in file.path:gmatch("[^/]+") do if part == "." or part == ".." then return tool_result.domain_error("File path must not traverse directories") end end
                if seen[file.path] then return tool_result.domain_error("Duplicate file path") end
                seen[file.path] = true
                if file.delete == true then deleted[#deleted + 1] = "/" .. file.path
                elseif type(file.content) == "string" then fields["/" .. file.path] = file.content
                else return tool_result.domain_error("Each file requires content or delete: true") end
            end
            if #deleted > 0 then fields.files = deleted end
            body, form_body = fields, true
        end
    else
        local page, limit = tonumber(args.page) or 1, tonumber(args.limit) or 25
        if page < 1 or page ~= math.floor(page) or limit < 1 or limit > 100 or limit ~= math.floor(limit) then return tool_result.domain_error("page must be positive and limit must be between 1 and 100") end
        query = {page = page, pagelen = limit, state = args.state, q = args.q}
    end
    if write and next(body) == nil then body = table.create(0, 1) end
    local conn, connect_err = M._transport.connect(ctx.get("connection_id"))
    if not conn then return nil, connect_err end
    if conn.workspace and args.workspace ~= conn.workspace then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Connection is limited to its configured workspace"}) end
    local result, request_err = M._transport.request(conn, method, path, body, query, not write and spec[2] == true, form_body)
    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, output.sanitize(result)) end
    -- Preserve the provider's paging URL without following arbitrary URLs from a caller.
    return tool_result.ok({success = true, data = output.sanitize(result.data), next_page = type(result.data) == "table" and M._transport.next_page(result.data) or nil})
end
function M.read(args: Request): any return run(args, false) end
function M.write(args: Request): any return run(args, true) end
return M
