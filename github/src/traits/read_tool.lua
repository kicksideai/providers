local ctx = require("ctx")
local output = require("output")
local transport = require("transport")
local tool_result = require("tool_result")

local M = {}
M._transport = transport
M._output = output

local DEFAULT_LIMIT = 25
local MAX_LIMIT = 100

type Args = {
    action: string,
    owner: string?,
    repo: string?,
    number: string?,
    comment_id: string?,
    path: string?,
    ref: string?,
    state: string?,
    limit: number?,
    page: number?,
    since: string?,
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function clamp_limit(args: Args): number
    local n = tonumber(args.limit) or DEFAULT_LIMIT
    if n < 1 then n = 1 end
    if n > MAX_LIMIT then n = MAX_LIMIT end
    return math.floor(n)
end

local function require_repo(args: Args): (string?, string?, string?)
    local owner = trim(args.owner)
    local repo = trim(args.repo)
    if owner == "" then return nil, nil, "owner is required" end
    if repo == "" then return nil, nil, "repo is required" end
    return owner, repo, nil
end

local function require_number(args: Args): (string?, string?)
    local number = trim(args.number)
    if number == "" then return nil, "number is required" end
    return number, nil
end

local function known_action(action: string): boolean
    return action == "viewer"
        or action == "get_repo"
        or action == "list_issues"
        or action == "get_issue_comment"
        or action == "get_issue"
        or action == "list_issue_comments"
        or action == "get_pull"
        or action == "list_pull_files"
        or action == "get_file"
end

-- List actions return the GitHub rows under one key with GitHub's page cursor.
local LIST_KEYS: { [string]: string } = {
    list_issues = "issues",
    list_issue_comments = "comments",
    list_pull_files = "files",
}

local function handler(args: Args): any
    args = type(args) == "table" and args or ({ action = "" } :: Args)
    local action = trim(args.action)
    if action == "" then return tool_result.domain_error("action is required") end
    if not known_action(action) then return tool_result.domain_error("unknown action '" .. tostring(action) .. "'") end

    local owner, repo
    local query: { [string]: any }? = nil
    if action ~= "viewer" then
        local rerr
        owner, repo, rerr = require_repo(args)
        if rerr then return tool_result.domain_error(rerr) end
    end
    if action == "list_issues" then
        local state = trim(args.state)
        if state == "" then state = "open" end
        if state ~= "open" and state ~= "closed" and state ~= "all" then
            return tool_result.domain_error("state must be open, closed, or all")
        end
        query = {
            state = state,
            per_page = clamp_limit(args),
            page = tonumber(args.page) or 1,
            since = trim(args.since) ~= "" and trim(args.since) or nil,
        }
    elseif action == "list_issue_comments" or action == "list_pull_files" then
        query = {
            per_page = clamp_limit(args),
            page = tonumber(args.page) or 1,
        }
    end

    local number: string? = nil
    if action == "get_issue" or action == "list_issue_comments" or action == "get_pull" or action == "list_pull_files" then
        local nerr
        number, nerr = require_number(args)
        if nerr then return tool_result.domain_error(nerr) end
    end
    local file_path = ""
    if action == "get_file" then
        file_path = trim(args.path)
        if file_path == "" then return tool_result.domain_error("path is required") end
    end

    if action == "get_issue_comment" and trim(args.comment_id) == "" then return tool_result.domain_error("comment_id is required") end

    local tp = M._transport
    local conn, err = tp.connect(connection_id())
    if not conn then return nil, err end

    local result, request_err
    if action == "viewer" then
        result, request_err = tp.viewer(conn)
    elseif action == "get_repo" then
        result, request_err = tp.get_repo(conn, owner :: string, repo :: string)
    elseif action == "list_issues" then
        result, request_err = tp.list_issues(conn, owner :: string, repo :: string, query)
    elseif action == "get_issue_comment" then
        result, request_err = tp.get_issue_comment(conn, owner :: string, repo :: string, trim(args.comment_id))
    elseif action == "get_issue" then
        result, request_err = tp.get_issue(conn, owner :: string, repo :: string, number :: string)
    elseif action == "list_issue_comments" then
        result, request_err = tp.list_issue_comments(conn, owner :: string, repo :: string, number :: string, query)
    elseif action == "get_pull" then
        result, request_err = tp.get_pull(conn, owner :: string, repo :: string, number :: string)
    elseif action == "list_pull_files" then
        result, request_err = tp.list_pull_files(conn, owner :: string, repo :: string, number :: string, query)
    else
        result, request_err = tp.get_file(conn, owner :: string, repo :: string, file_path, trim(args.ref) ~= "" and trim(args.ref) or nil)
    end

    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, result) end
    local list_key = LIST_KEYS[action]
    if list_key then
        local page = (query :: { [string]: any }).page
        local out: any = { success = true, page = page,
            next_page = tp.has_next_page(result.headers) and page + 1 or nil }
        local rows: {any} = {}
        for _, record in ipairs(result.data or {}) do
            if action == "list_pull_files" then
                rows[#rows + 1] = {sha = record.sha, filename = record.filename, status = record.status,
                    additions = record.additions, deletions = record.deletions, changes = record.changes, blob_url = record.blob_url}
            else
                local user = type(record.user) == "table" and record.user or {}
                local assignee = type(record.assignee) == "table" and record.assignee or {}
                rows[#rows + 1] = {id = record.id, number = record.number, title = record.title, state = record.state,
                    created_at = record.created_at, updated_at = record.updated_at, html_url = record.html_url,
                    user = {login = user.login, id = user.id}, assignee = {login = assignee.login, id = assignee.id}}
            end
        end
        out[list_key] = M._output.sanitize(rows)
        return out
    end
    return tool_result.ok(M._output.sanitize(result.data))
end

M.handler = handler

return M
