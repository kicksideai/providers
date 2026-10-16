local ctx = require("ctx")
local data_error = require("data_error")
local transport = require("transport")

local M = {}

local DEFAULT_LIMIT = 50
local MAX_LIMIT = 100

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function labels_of(row: any): { string }
    local out: { string } = {}
    if type(row.labels) ~= "table" then return out end
    for _, label in ipairs(row.labels :: { any }) do
        if type(label) == "table" and type((label :: any).name) == "string" then
            out[#out + 1] = (label :: any).name
        elseif type(label) == "string" then
            out[#out + 1] = label
        end
    end
    return out
end

local function item_kind(row: any): string
    return type(row.pull_request) == "table" and "pull_request" or "issue"
end

local function wanted(row: any, item_type: string): boolean
    local kind = item_kind(row)
    return item_type == "all" or (item_type == "issues" and kind == "issue") or (item_type == "pull_requests" and kind == "pull_request")
end

local function content_of(row: any, owner: string, repo: string): string
    local lines: { string } = {
        "# " .. tostring(row.title or ("#" .. tostring(row.number or ""))),
        "",
        "Repository: " .. owner .. "/" .. repo,
        "Number: " .. tostring(row.number or ""),
        "State: " .. tostring(row.state or ""),
    }
    local body = trim(row.body)
    if body ~= "" then
        lines[#lines + 1] = ""
        lines[#lines + 1] = body
    end
    return table.concat(lines, "\n")
end

function M.item_from(row: any, owner: string, repo: string): any
    local id = tostring(row.id or row.node_id or row.number or "")
    local number = tonumber(row.number) or 0
    local kind = item_kind(row)
    local version = tostring(row.updated_at or row.created_at or id)
    local key = "github:" .. owner .. "/" .. repo .. ":" .. kind .. ":" .. tostring(number)
    return {
        item_key = key,
        dedup_key = key .. ":" .. version,
        op = "upsert",
        source_version = version,
        occurred_at = version,
        payload = {
            id = id,
            number = number,
            item_type = kind,
            state = tostring(row.state or ""),
            title = tostring(row.title or ""),
            content = content_of(row, owner, repo),
            content_type = "text/markdown",
            source_url = tostring(row.html_url or ""),
            author = type(row.user) == "table" and tostring((row.user :: any).login or "") or "",
            labels = labels_of(row),
            created_at = row.created_at,
            updated_at = row.updated_at,
            closed_at = row.closed_at,
        },
    }
end

local function config_value(config: any, key: string): string
    return trim(type(config) == "table" and (config :: any)[key] or nil)
end

function M.pull(req: any, _opts: any?, deps: any?): (any?, error?)
    req = type(req) == "table" and req or {}
    deps = type(deps) == "table" and deps or {}
    local tp = deps.transport or transport
    local config = type(req.config) == "table" and req.config or {}
    local owner = config_value(config, "owner")
    local repo = config_value(config, "repo")
    if owner == "" then return data_error.invalid_config("config.owner is required") end
    if repo == "" then return data_error.invalid_config("config.repo is required") end
    local item_type = config_value(config, "item_type")
    if item_type == "" then item_type = "all" end
    if item_type ~= "all" and item_type ~= "issues" and item_type ~= "pull_requests" then
        return data_error.invalid_config("config.item_type must be all, issues, or pull_requests")
    end

    local component_id = trim(deps.component_id)
    if component_id == "" then component_id = trim(ctx.get("component_id")) end
    if component_id == "" then component_id = config_value(config, "connection_id") end
    local conn, cerr = tp.connect(component_id)
    if cerr or not conn then return data_error.connection(tostring(cerr or "no connection")) end

    local limit = tonumber(req.limit) or DEFAULT_LIMIT
    if limit < 1 then limit = 1 end
    if limit > MAX_LIMIT then limit = MAX_LIMIT end
    local cursor = type(req.cursor) == "table" and req.cursor or {}
    local page = tonumber(cursor.page) or 1
    local since = type(cursor.since) == "string" and cursor.since or config_value(config, "backfill_since")
    local result, request_err = tp.list_issues(conn, owner, repo, {
        state = "all",
        sort = "updated",
        direction = "asc",
        per_page = limit,
        page = page,
        since = since ~= "" and since or nil,
    })
    if request_err then return nil, request_err end
    if type(result) ~= "table" or not result.success then return data_error.from_result(result, "list GitHub issues") end
    local rows = type(result.data) == "table" and (result.data :: { any }) or {}
    local items: { any } = {}
    local max_seen = since
    for _, row in ipairs(rows) do
        if wanted(row, item_type) then
            local item = M.item_from(row, owner, repo)
            items[#items + 1] = item
            if type(item.source_version) == "string" and item.source_version > max_seen then max_seen = item.source_version end
        end
    end
    local has_more = #rows >= limit
    return {
        success = true,
        items = items,
        next_cursor = has_more and { page = page + 1, since = since } or { page = 1, since = max_seen },
        has_more = has_more,
        coverage = { mode = "delta" },
    }
end

function M.pull_keys(req: any, opts: any?, deps: any?): (any?, error?)
    local page, pull_err = M.pull(req, opts, deps)
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
