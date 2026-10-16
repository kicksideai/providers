local ctx = require("ctx")
local output = require("output")
local transport = require("transport")
local tool_result = require("tool_result")

local M = {}
M._transport = transport
M._output = output

type Args = {
    action: string,
    owner: string?,
    repo: string?,
    number: string?,
    title: string?,
    body: string?,
    state: string?,
    labels: { string }?,
    assignees: { string }?,
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

local function optional_list(value: any): any
    if type(value) == "table" then return value end
    return nil
end

local function known_action(action: string): boolean
    return action == "create_issue"
        or action == "update_issue"
        or action == "create_issue_comment"
end

local function create_body(args: Args): (any?, string?)
    local title = trim(args.title)
    if title == "" then return nil, "title is required for create_issue" end
    local body: { [string]: any } = { title = title }
    if trim(args.body) ~= "" then body.body = trim(args.body) end
    if optional_list(args.labels) then body.labels = args.labels end
    if optional_list(args.assignees) then body.assignees = args.assignees end
    return body, nil
end

local function update_body(args: Args): (any?, string?)
    local body: { [string]: any } = {}
    if trim(args.title) ~= "" then body.title = trim(args.title) end
    if trim(args.body) ~= "" then body.body = trim(args.body) end
    if trim(args.state) ~= "" then
        local state = trim(args.state)
        if state ~= "open" and state ~= "closed" then return nil, "state must be open or closed" end
        body.state = state
    end
    if optional_list(args.labels) then body.labels = args.labels end
    if optional_list(args.assignees) then body.assignees = args.assignees end
    if next(body) == nil then return nil, "at least one field is required for update_issue" end
    return body, nil
end

local function handler(args: Args): any
    args = type(args) == "table" and args or ({ action = "" } :: Args)
    local action = trim(args.action)
    if action == "" then return tool_result.domain_error("action is required") end
    if not known_action(action) then return tool_result.domain_error("unknown action '" .. tostring(action) .. "'") end

    local owner, repo, rerr = require_repo(args)
    if rerr then return tool_result.domain_error(rerr) end

    local number: string? = nil
    local request_body: any = nil
    if action == "create_issue" then
        local berr
        request_body, berr = create_body(args)
        if berr then return tool_result.domain_error(berr) end
    elseif action == "update_issue" then
        local nerr, berr
        number, nerr = require_number(args)
        if nerr then return tool_result.domain_error(nerr) end
        request_body, berr = update_body(args)
        if berr then return tool_result.domain_error(berr) end
    else
        local nerr
        number, nerr = require_number(args)
        if nerr then return tool_result.domain_error(nerr) end
        request_body = trim(args.body)
        if request_body == "" then return tool_result.domain_error("body is required for create_issue_comment") end
    end

    local tp = M._transport
    local conn, err = tp.connect(connection_id())
    if not conn then return nil, err end

    local result, request_err
    if action == "create_issue" then
        result, request_err = tp.create_issue(conn, owner :: string, repo :: string, request_body)
    elseif action == "update_issue" then
        result, request_err = tp.update_issue(conn, owner :: string, repo :: string, number :: string, request_body)
    else
        result, request_err = tp.create_issue_comment(conn, owner :: string, repo :: string, number :: string, request_body :: string)
    end

    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, result) end
    return tool_result.ok(M._output.sanitize(result.data))
end

M.handler = handler

return M
