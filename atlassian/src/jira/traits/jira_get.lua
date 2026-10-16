-- JiraRead — read-only Jira access for agents. The connection is bound on the
-- trait (the user selects it in the picker), so the connection id comes from the
-- trait context (ctx.connection_id); an optional pinned project (ctx.project_key)
-- scopes/defaults project-level actions. Returns structured records.

local ctx = require("ctx")
local transport = require("transport")
local jira = require("jira")
local text = require("text")
local tool_result = require("tool_result")

-- A Jira issue as Jira returns it, with its rich-text description also rendered
-- as plain text (description_text).
local function issue_record(it: any): any
    local out: any = {}
    for key, value in pairs(it) do out[key] = value end
    local f: any = type(it.fields) == "table" and it.fields or {}
    out.description_text = text.render(f.description)
    return out
end

-- A Jira comment as Jira returns it, with its rich-text body also rendered as
-- plain text (body_text).
local function comment_record(cm: any): any
    local out: any = {}
    for key, value in pairs(cm) do out[key] = value end
    out.body_text = text.render(cm.body)
    return out
end

local function page_info(data: any, rows: any, start_at: integer?, max_results: integer?): any
    local start = data.startAt or start_at or 0
    local next_start = nil
    if #rows > 0 and (data.isLast == false or (data.total and start + #rows < data.total)) then
        next_start = start + #rows
    end
    return { start_at = start, next_start_at = next_start, total = data.total,
        max_results = data.maxResults or math.min(max_results or 25, 100) }
end

type GetArgs = {
    action: string?,
    project_key: string?,
    issue_key: string?,
    comment_id: string?,
    jql: string?,
    start_at: integer?,
    max_results: integer?,
    next_page_token: string?,
    fields: { string }?,
}

-- A failed Jira answer is the tool's domain error carrying the failed Result:
-- Jira's message, HTTP status and error body.
local function jira_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

local function handler(args: any): (any?, error?)
    local a = (args or {}) :: GetArgs
    local conn, err = transport.connect(ctx.get("connection_id") :: string?)
    if not conn then return nil, err end

    local pinned = ctx.get("project_key") :: string?
    local project = a.project_key or pinned
    local action = a.action

    if action == "list_projects" then
        local r, rerr = jira.list_projects(conn, a.max_results or 25, a.start_at or 0)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        local projects = jira.project_list(conn, r.data)
        local rows: { any } = {}
        local data: any = r.data or {}
        local first, last = 1, #projects
        if conn.deployment == "server" then
            first = (a.start_at or 0) + 1
            last = math.min(#projects, first + math.min(a.max_results or 25, 100) - 1)
            data = {startAt = a.start_at or 0, total = #projects}
        end
        for index = first, last do
            local project = projects[index]
            rows[#rows + 1] = {id = project.id, key = project.key, name = project.name, projectTypeKey = project.projectTypeKey}
        end
        local page = page_info(data, rows, a.start_at, a.max_results)
        page.success = true; page.action = action; page.count = #rows; page.projects = rows
        return page

    elseif action == "get_project" then
        local r, rerr = jira.get_project(conn, project)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, project = r.data }

    elseif action == "search_issues" then
        local jql = a.jql
        if (not jql or jql == "") and pinned and pinned ~= "" then
            if not pinned:match("^[A-Za-z][A-Za-z0-9_-]*$") then
                return tool_result.domain_error("configured project_key is invalid")
            end
            jql = "project = " .. pinned .. " order by updated DESC"
        end
        local r, rerr = jira.search_issues(conn, jql, a.start_at, a.max_results, a.next_page_token, a.fields)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        local issues = ((r.data and (r.data :: any).issues) or {}) :: { any }
        local rows: { any } = {}
        for _, it in ipairs(issues) do
            if a.fields then
                rows[#rows + 1] = issue_record(it)
            else
                local f = it.fields or {}
                rows[#rows + 1] = { id = it.id, key = it.key, self = it.self, fields = {
                    summary = f.summary,
                    status = type(f.status) == "table" and {id = f.status.id, name = f.status.name} or nil,
                    priority = type(f.priority) == "table" and {id = f.priority.id, name = f.priority.name} or nil,
                    issuetype = type(f.issuetype) == "table" and {id = f.issuetype.id, name = f.issuetype.name} or nil,
                    assignee = type(f.assignee) == "table" and {accountId = f.assignee.accountId,
                        name = f.assignee.name, displayName = f.assignee.displayName} or nil,
                    created = f.created, updated = f.updated, duedate = f.duedate,
                } }
            end
        end
        local data: any = r.data or {}
        local page: any = {success = true, action = action, count = #rows, issues = rows}
        if conn.deployment == "server" then
            local info = page_info(data, rows, a.start_at, a.max_results)
            for key, value in pairs(info) do page[key] = value end
        else
            page.next_page_token = data.nextPageToken
            page.is_last = data.isLast
        end
        return page

    elseif action == "get_issue" then
        local r, rerr = jira.get_issue(conn, a.issue_key)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, issue = issue_record(r.data) }

    elseif action == "get_comments" then
        local r, rerr = jira.get_comments(conn, a.issue_key, a.max_results, a.start_at)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        local comments = ((r.data and (r.data :: any).comments) or {}) :: { any }
        local rows: { any } = {}
        for _, c in ipairs(comments) do
            local author = type(c.author) == "table" and c.author or {}
            rows[#rows + 1] = {id = c.id, created = c.created, updated = c.updated,
                author = {displayName = author.displayName, accountId = author.accountId, name = author.name}}
        end
        local page = page_info(r.data or {}, rows, a.start_at, a.max_results)
        page.success = true; page.action = action; page.issue_key = a.issue_key
        page.count = #rows; page.comments = rows
        return page

    elseif action == "get_comment" then
        local r, rerr = jira.get_comment(conn, a.issue_key, a.comment_id)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return {success = true, action = action, comment = comment_record(r.data)}

    elseif action == "get_transitions" then
        local r, rerr = jira.get_transitions(conn, a.issue_key, a.fields)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        local transitions = ((r.data and (r.data :: any).transitions) or {}) :: { any }
        local rows: {any} = {}
        for _, transition in ipairs(transitions) do
            local target = type(transition.to) == "table" and transition.to or {}
            local category = type(target.statusCategory) == "table" and target.statusCategory or {}
            local row: any = {id = transition.id, name = transition.name, hasScreen = transition.hasScreen,
                to = {id = target.id, name = target.name, statusCategory = {id = category.id, key = category.key, name = category.name}}}
            for _, field in ipairs(a.fields or {}) do
                if field == "*" or field == "*all" then
                    for key, value in pairs(transition) do row[key] = value end
                else row[field] = transition[field] end
            end
            rows[#rows + 1] = row
        end
        return { success = true, action = action, issue_key = a.issue_key, count = #rows, transitions = rows }
    end

    return tool_result.domain_error("unknown action '" .. tostring(action) .. "'")
end

return { handler = handler }
