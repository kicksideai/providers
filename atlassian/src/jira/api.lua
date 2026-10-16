-- Jira REST client over the Atlassian transport. Deployment-aware: Cloud uses
-- REST v3 (POST /search/jql, ADF bodies, project/search) and Server/Data Center
-- uses v2 (GET /search, plain-string bodies, /project). The base URL+version is
-- already baked into conn.jira_base by core.site; this layer only appends paths,
-- shapes request bodies, and returns transport Results.

local transport = require("transport")
local atlassian_types = require("types")

local jira = {}

-- Percent-encode a query value (JQL carries spaces, '=', quotes, etc.).
local function enc(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end

-- Cloud REST v3 takes rich-text fields as Atlassian Document Format; Server v2
-- takes a plain string. Wrap plain text into a minimal ADF doc for Cloud.
local function adf_text(text: string): any
    return {
        type = "doc",
        version = 1,
        content = { { type = "paragraph", content = { { type = "text", text = text } } } },
    }
end
jira._adf_text = adf_text

local function rich(conn: atlassian_types.Conn, text: string): any
    if conn.deployment == "server" then return text end
    return adf_text(text)
end

local function page_size(value: any, default: number, start_at: any): (number?, string?)
    local n = value or default
    if type(n) ~= "number" or n < 1 or n ~= math.floor(n) then
        return nil, "max_results must be a positive integer"
    end
    if start_at ~= nil and (type(start_at) ~= "number" or start_at < 0 or start_at ~= math.floor(start_at)) then
        return nil, "start_at must be a nonnegative integer"
    end
    return math.min(n, 100), nil
end

-- ─── read ────────────────────────────────────────────────────────────────
function jira.myself(conn: atlassian_types.Conn): (atlassian_types.Result?, error?)
    return transport.get(conn, conn.jira_base .. "/myself")
end

function jira.list_projects(conn: atlassian_types.Conn, max_results: integer?, start_at: integer?): (atlassian_types.Result?, error?)
    local n, page_err = page_size(max_results, 50, start_at)
    if page_err then return { success = false, error = page_err } end
    if conn.deployment == "server" then
        return transport.get(conn, conn.jira_base .. "/project")
    end
    local url = conn.jira_base .. "/project/search?maxResults=" .. tostring(n)
    if start_at ~= nil then url = url .. "&startAt=" .. tostring(start_at) end
    return transport.get(conn, url)
end

function jira.get_project(conn: atlassian_types.Conn, project_key: string?): (atlassian_types.Result?, error?)
    if not project_key or project_key == "" then return { success = false, error = "project_key is required" } end
    return transport.get(conn, conn.jira_base .. "/project/" .. enc(project_key))
end

function jira.search_issues(conn: atlassian_types.Conn, jql: string?, start_at: integer?, max_results: integer?, next_page_token: string?, fields: { string }?): (atlassian_types.Result?, error?)
    local n, page_err = page_size(max_results, 25, start_at)
    if page_err then return { success = false, error = page_err } end
    if conn.deployment ~= "server" and start_at ~= nil and start_at ~= 0 then
        return { success = false, error = "Cloud search uses next_page_token instead of start_at" }
    end
    local selected = fields or { "summary", "status", "priority", "issuetype", "assignee", "created", "updated", "duedate" }
    local q = jql or "order by updated DESC"
    if conn.deployment == "server" then
        local url = conn.jira_base .. "/search?jql=" .. enc(q)
            .. "&startAt=" .. tostring(start_at or 0) .. "&maxResults=" .. tostring(n) .. "&fields=" .. enc(table.concat(selected, ","))
        return transport.get(conn, url)
    end
    return transport.post(conn, conn.jira_base .. "/search/jql", {
        jql = q,
        nextPageToken = next_page_token,
        maxResults = n,
        fields = selected,
    })
end

function jira.get_issue(conn: atlassian_types.Conn, issue_key: string?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    return transport.get(conn, conn.jira_base .. "/issue/" .. enc(issue_key))
end

function jira.get_comments(conn: atlassian_types.Conn, issue_key: string?, max_results: integer?, start_at: integer?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    local n, page_err = page_size(max_results, 25, start_at)
    if page_err then return { success = false, error = page_err } end
    local url = conn.jira_base .. "/issue/" .. enc(issue_key) .. "/comment"
    url = url .. "?maxResults=" .. tostring(n) .. "&startAt=" .. tostring(start_at or 0)
    return transport.get(conn, url)
end

function jira.get_comment(conn: atlassian_types.Conn, issue_key: string?, comment_id: string?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return {success = false, error = "issue_key is required"} end
    if not comment_id or comment_id == "" then return {success = false, error = "comment_id is required"} end
    return transport.get(conn, conn.jira_base .. "/issue/" .. enc(issue_key) .. "/comment/" .. enc(comment_id))
end

function jira.get_transitions(conn: atlassian_types.Conn, issue_key: string?, fields: {string}?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    local url = conn.jira_base .. "/issue/" .. enc(issue_key) .. "/transitions"
    for _, field in ipairs(fields or {}) do
        if field == "fields" or field == "*" or field == "*all" then
            url = url .. "?expand=transitions.fields"
            break
        end
    end
    return transport.get(conn, url)
end

-- ─── write ─────────────────────────────────────────────────────────────────
function jira.create_issue(conn: atlassian_types.Conn, project_key: string?, summary: string?, issue_type: string?, description: string?, extra_fields: any?): (atlassian_types.Result?, error?)
    if not project_key or project_key == "" then return { success = false, error = "project_key is required" } end
    if not summary or summary == "" then return { success = false, error = "summary is required" } end
    local fields: { [string]: any } = {
        project = { key = project_key },
        summary = summary,
        issuetype = { name = issue_type or "Task" },
    }
    if description and description ~= "" then fields.description = rich(conn, description) end
    if type(extra_fields) == "table" then
        for k, v in pairs(extra_fields :: any) do fields[k] = v end
    end
    return transport.post(conn, conn.jira_base .. "/issue", { fields = fields })
end

function jira.update_issue(conn: atlassian_types.Conn, issue_key: string?, fields: any): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    local f: { [string]: any } = {}
    if type(fields) == "table" then for k, v in pairs(fields :: any) do f[k] = v end end
    if f.description and type(f.description) == "string" then f.description = rich(conn, f.description :: string) end
    return transport.put(conn, conn.jira_base .. "/issue/" .. enc(issue_key), { fields = f })
end

function jira.add_comment(conn: atlassian_types.Conn, issue_key: string?, body: string?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    if not body or body == "" then return { success = false, error = "comment body is required" } end
    return transport.post(conn, conn.jira_base .. "/issue/" .. enc(issue_key) .. "/comment", { body = rich(conn, body) })
end

function jira.add_worklog(conn: atlassian_types.Conn, issue_key: string?, body: string?, time_spent_seconds: integer?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    if not time_spent_seconds or time_spent_seconds < 1 then return { success = false, error = "time_spent_seconds is required" } end
    local payload: { [string]: any } = { timeSpentSeconds = time_spent_seconds }
    if body and body ~= "" then payload.comment = rich(conn, body) end
    return transport.post(conn, conn.jira_base .. "/issue/" .. enc(issue_key) .. "/worklog", payload)
end

function jira.transition_issue(conn: atlassian_types.Conn, issue_key: string?, transition_id: string?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    if not transition_id or transition_id == "" then return { success = false, error = "transition_id is required" } end
    return transport.post(conn, conn.jira_base .. "/issue/" .. enc(issue_key) .. "/transitions", { transition = { id = transition_id } })
end

function jira.assign_issue(conn: atlassian_types.Conn, issue_key: string?, account_id: string?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    local body: { [string]: any } = conn.deployment == "server" and { name = account_id } or { accountId = account_id }
    return transport.put(conn, conn.jira_base .. "/issue/" .. enc(issue_key) .. "/assignee", body)
end

function jira.delete_issue(conn: atlassian_types.Conn, issue_key: string?, delete_subtasks: boolean?): (atlassian_types.Result?, error?)
    if not issue_key or issue_key == "" then return { success = false, error = "issue_key is required" } end
    local flag = delete_subtasks and "true" or "false"
    return transport.delete(conn, conn.jira_base .. "/issue/" .. enc(issue_key) .. "?deleteSubtasks=" .. flag)
end

-- Normalize a project list (Cloud paginates under .values; Server returns a bare array).
function jira.project_list(conn: atlassian_types.Conn, data: any): { any }
    if conn.deployment == "server" then return (type(data) == "table" and data or {}) :: { any } end
    return (type(data) == "table" and data.values or {}) :: { any }
end

return jira
