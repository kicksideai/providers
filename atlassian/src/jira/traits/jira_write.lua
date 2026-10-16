-- JiraWrite — mutating Jira access for agents. Connection is bound on the trait
-- (ctx.connection_id); an optional pinned project (ctx.project_key) defaults
-- create_issue's project. Renders a compact result for the LLM.

local ctx = require("ctx")
local transport = require("transport")
local jira = require("jira")
local tool_result = require("tool_result")

type WriteArgs = {
    action: string?,
    project_key: string?,
    summary: string?,
    issue_type: string?,
    description: string?,
    extra_fields: any?,
    issue_key: string?,
    fields: any?,
    comment: string?,
    transition_id: string?,
    account_id: string?,
    delete_subtasks: boolean?,
}

-- A failed Jira answer is the tool's domain error carrying the failed Result:
-- Jira's message, HTTP status and error body.
local function jira_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

local function handler(args: any): (any?, error?)
    local a = (args or {}) :: WriteArgs
    local conn, err = transport.connect(ctx.get("connection_id") :: string?)
    if not conn then return nil, err end

    local action = a.action

    if action == "create_issue" then
        local project = a.project_key or (ctx.get("project_key") :: string?)
        local r, rerr = jira.create_issue(conn, project, a.summary, a.issue_type, a.description, a.extra_fields)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, result = "created", issue_key = r.data.key, id = r.data.id, issue = r.data }

    elseif action == "update_issue" then
        local r, rerr = jira.update_issue(conn, a.issue_key, a.fields or {})
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, result = "updated", issue_key = tostring(a.issue_key or "") }

    elseif action == "add_comment" then
        local r, rerr = jira.add_comment(conn, a.issue_key, a.comment)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, result = "updated", issue_key = tostring(a.issue_key or ""), comment_id = r.data.id, comment = r.data }

    elseif action == "transition_issue" then
        local r, rerr = jira.transition_issue(conn, a.issue_key, a.transition_id)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, result = "updated", issue_key = tostring(a.issue_key or ""), transition_id = tostring(a.transition_id or "") }

    elseif action == "assign_issue" then
        local r, rerr = jira.assign_issue(conn, a.issue_key, a.account_id)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, result = "updated", issue_key = tostring(a.issue_key or ""), account_id = tostring(a.account_id or "") }

    elseif action == "delete_issue" then
        local r, rerr = jira.delete_issue(conn, a.issue_key, a.delete_subtasks)
        if not r then return nil, rerr end
        if not r.success then return jira_error(r) end
        return { success = true, action = action, result = "deleted", issue_key = tostring(a.issue_key or "") }
    end

    return tool_result.domain_error("unknown action '" .. tostring(action) .. "'")
end

return { handler = handler }
