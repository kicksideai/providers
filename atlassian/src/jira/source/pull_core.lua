local ctx = require("ctx")
local data_error = require("data_error")
local jira = require("jira")
local transport = require("transport")
local text = require("text")

local M = {}

type Deps = { transport: any?, jira: any?, component_id: string? }

local MAX_LIMIT = 100
local DEFAULT_LIMIT = 50

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function escape_jql(value: string): string
    return '"' .. value:gsub("\\", "\\\\"):gsub('"', '\\"') .. '"'
end

local function without_order(jql: string): string
    local low = jql:lower()
    local s, _ = low:find("%sorder%s+by%s")
    if s then return trim(jql:sub(1, s - 1)) end
    return trim(jql)
end

local function scoped_jql(config: any): string
    local base = without_order(trim(config.jql))
    local project = trim(config.project_key)
    if base == "" and project ~= "" then base = "project = " .. project end
    if base == "" then base = "issuekey is not EMPTY" end
    return base
end

local function build_jql(config: any, cursor: any, since: string?): string
    local clauses: { string } = { "(" .. scoped_jql(config) .. ")" }
    local start = since
    local live = cursor.phase == "live"
    if live and type(cursor.hw) == "string" and cursor.hw ~= "" then start = cursor.hw end
    if type(start) == "string" and start ~= "" then
        clauses[#clauses + 1] = "updated " .. (live and ">" or ">=") .. " " .. escape_jql(start)
    end
    return table.concat(clauses, " AND ") .. " ORDER BY updated ASC"
end

local function decode_entities(s: string): string
    return s:gsub("&nbsp;", " ")
        :gsub("&amp;", "&")
        :gsub("&lt;", "<")
        :gsub("&gt;", ">")
        :gsub("&quot;", '"')
        :gsub("&#39;", "'")
end

function M.clean_text(value: any): string
    if type(value) ~= "string" then return "" end
    local s: string = value:gsub("\r\n", "\n")
    s = s:gsub("<[bB][rR]%s*/?>", "\n")
        :gsub("</[pP]>", "\n")
        :gsub("</[dD][iI][vV]>", "\n")
        :gsub("<[^>]+>", "")
    s = decode_entities(s)
    s = s:gsub("[ \t]+\n", "\n"):gsub("\n[ \t]+", "\n"):gsub("\n\n\n+", "\n\n")
    return trim(s)
end

local function body_text(value: any): string
    if type(value) == "string" then return M.clean_text(value) end
    return text.render(value)
end

local function field_name(value: any): string?
    if type(value) == "table" then
        local name = trim((value :: any).displayName or (value :: any).name or (value :: any).emailAddress)
        if name ~= "" then return name end
    end
    return nil
end

local function issue_url(conn: any, key: string): string
    local base = trim(conn and conn.jira_base)
    base = base:gsub("/rest/api/%d+$", "")
    if base ~= "" and not base:find("api%.atlassian%.com", 1, false) then return base .. "/browse/" .. key end
    return "jira://issue/" .. key
end

local function version_of(row: any): string
    local f = type(row.fields) == "table" and row.fields or {}
    return tostring((f :: any).updated or row.updated or row.id or row.key or "")
end

local function item_from(conn: any, row: any): any
    local fields = type(row.fields) == "table" and row.fields or {}
    local key = tostring(row.key or row.id or "")
    local version = version_of(row)
    local title = M.clean_text((fields :: any).summary)
    if title == "" then title = key end
    local content = body_text((fields :: any).description)
    if content == "" then content = "# " .. title else content = "# " .. title .. "\n\n" .. content end
    local item_key = "jira:issue:" .. key
    return {
        item_key = item_key,
        dedup_key = item_key .. ":upsert:" .. version,
        op = "upsert",
        source_version = version ~= "" and version or nil,
        occurred_at = version ~= "" and version or nil,
        payload = {
            id = tostring(row.id or ""),
            key = key,
            entity = "issue",
            title = title,
            content = content,
            content_type = "text/markdown",
            source_url = issue_url(conn, key),
            properties = fields,
            created_at = type((fields :: any).created) == "string" and (fields :: any).created or nil,
            updated_at = version,
            status = type((fields :: any).status) == "table" and (fields :: any).status.name or nil,
            issue_type = type((fields :: any).issuetype) == "table" and (fields :: any).issuetype.name or nil,
            issue_priority = type((fields :: any).priority) == "table" and (fields :: any).priority.name or nil,
            assignee = field_name((fields :: any).assignee),
            reporter = field_name((fields :: any).reporter),
        },
    }
end

local function max_version(hw: any, items: { any }): string
    local max = type(hw) == "string" and hw or ""
    for _, item in ipairs(items) do
        local v = type(item.source_version) == "string" and item.source_version or ""
        if v > max then max = v end
    end
    return max
end

local function connect(tp: any, component_id: string?): (any?, any?)
    local conn, cerr = tp.connect(component_id)
    if cerr or not conn then return nil, data_error.connection(tostring(cerr or "no connection")) end
    return conn, nil
end

function M.pull(req: any, deps: Deps?): (any?, error?)
    req = type(req) == "table" and req or {}
    deps = type(deps) == "table" and deps or {}
    local tp = deps.transport or transport
    local api: any = deps.jira or jira
    local config = type(req.config) == "table" and req.config or {}
    local cursor: any = type(req.cursor) == "table" and req.cursor or { phase = "backfill", start_at = 0 }
    local component_id = trim(deps.component_id)
    if component_id == "" then component_id = trim(config.connection_id) end
    if component_id == "" then component_id = trim(ctx.get("component_id")) end

    local limit: integer = (tonumber(req.limit) or DEFAULT_LIMIT) :: integer
    if limit < 1 then limit = 1 end
    if limit > MAX_LIMIT then limit = MAX_LIMIT end

    local conn, e = connect(tp, component_id)
    if e then return e end

    local start_at: integer = (tonumber(cursor.start_at) or 0) :: integer
    local since: string? = nil
    if type(config.backfill_since) == "string" then since = config.backfill_since end
    local query = type(cursor.query_jql) == "string" and cursor.query_jql or build_jql(config, cursor, since)
    local token = type(cursor.next_page_token) == "string" and cursor.next_page_token or nil
    local res, res_err = api.search_issues(conn, query, start_at, limit, token)
    if res_err then return nil, res_err end
    if type(res) ~= "table" or not res.success then return data_error.from_result(res, "search Jira issues") end

    local data = type(res.data) == "table" and res.data or {}
    local rows = type((data :: any).issues) == "table" and (data :: any).issues or {}
    local items: { any } = {}
    for _, row in ipairs(rows :: { any }) do items[#items + 1] = item_from(conn, row) end

    local hw = max_version(cursor.hw, items)
    if conn.deployment == "server" then
        local total = tonumber((data :: any).total) or (start_at + #rows)
        local next_start = start_at + #rows
        if #rows > 0 and next_start < total then
            return { success = true, items = items, next_cursor = { phase = cursor.phase or "backfill",
                start_at = next_start, hw = hw, query_jql = query }, has_more = true, coverage = { mode = "delta" } }
        end
    else
        if type((data :: any).isLast) ~= "boolean" then
            return data_error.failure("provider_error", "Jira Cloud search response needs isLast", true, "provider")
        end
        if (data :: any).isLast == false then
            local next_token = (data :: any).nextPageToken
            if type(next_token) ~= "string" or next_token == "" or next_token == token then
                return data_error.failure("provider_error", "Jira Cloud search response needs an advancing nextPageToken", true, "provider")
            end
            return { success = true, items = items, next_cursor = { phase = cursor.phase or "backfill",
                next_page_token = next_token, hw = hw, query_jql = query }, has_more = true, coverage = { mode = "delta" } }
        end
    end
    return { success = true, items = items, next_cursor = { phase = "live", start_at = 0, hw = hw }, has_more = false, coverage = { mode = "delta" } }
end

function M.pull_keys(req: any, deps: Deps?): (any?, error?)
    local page, pull_err = M.pull(req, deps)
    if pull_err then return nil, pull_err end
    if page.success ~= true then return page end
    local keys: { any } = {}
    for _, item in ipairs(type(page.items) == "table" and page.items or {}) do
        keys[#keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key }
    end
    page.items = nil
    page.keys = keys
    return page
end

return M
