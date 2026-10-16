-- ConfluenceRead — read-only Confluence access for agents. Connection is bound on
-- the trait (ctx.connection_id); an optional pinned space (ctx.space_key)
-- defaults space-level actions. Returns structured records.

local ctx = require("ctx")
local transport = require("transport")
local confluence = require("confluence")
local markdown = require("markdown")
local tool_result = require("tool_result")

local function base_of(data: any): string?
    local links: any = type(data) == "table" and type(data._links) == "table" and data._links or {}
    return type(links.base) == "string" and links.base or nil
end

-- A Confluence content or space record as Confluence returns it, with its web url.
local function record(conn: any, it: any, base: string?): any
    local out: any = {}
    for key, value in pairs(it) do out[key] = value end
    out.url = confluence.web_url(conn, it, base)
    return out
end

local function summary(conn: any, it: any, base: string?): any
    return { id = it.id, key = it.key, type = it.type, status = it.status, title = it.title, name = it.name,
        space = type(it.space) == "table" and {id = it.space.id, key = it.space.key, name = it.space.name} or nil,
        version = type(it.version) == "table" and {number = it.version.number, when = it.version.when,
            by = type(it.version.by) == "table" and {displayName = it.version.by.displayName, accountId = it.version.by.accountId} or nil} or nil,
        created = type(it.history) == "table" and it.history.createdDate or nil,
        author = type(it.history) == "table" and type(it.history.createdBy) == "table" and
            {displayName = it.history.createdBy.displayName, accountId = it.history.createdBy.accountId} or nil,
        url = confluence.web_url(conn, it, base) }
end

local function records(conn: any, data: any): { any }
    local rows: { any } = {}
    local base = base_of(data)
    for _, it in ipairs(type(data) == "table" and type(data.results) == "table" and data.results or {}) do
        rows[#rows + 1] = summary(conn, it, base)
    end
    return rows
end

-- A failed Confluence answer is the tool's domain error carrying the failed
-- Result: Confluence's message, HTTP status and error body.
local function confluence_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

local function page_info(data: any, count: number, start_at: integer?, max_results: integer?): (any?, string?)
    local start = data.start or start_at or 0
    local next_link = type(data._links) == "table" and data._links.next or nil
    local next_start, next_token = nil, nil
    if type(next_link) == "string" and next_link ~= "" and count > 0 then
        next_token = next_link:match("[?&]cursor=([^&]+)")
        if next_token then
            next_token = next_token:gsub("+", " "):gsub("%%(%x%x)", function(hex)
                return string.char(tonumber(hex, 16) :: number)
            end)
        else
            local value = next_link:match("[?&]start=(%d+)")
            next_start = tonumber(value)
        end
        if next_start == nil and next_token == nil then
            return nil, "provider returns an unsupported continuation"
        end
    end
    return {start_at = start, next_start_at = next_start, next_page_token = next_token,
        max_results = data.limit or math.min(max_results or 25, 100)}
end

type GetArgs = {
    action: string?,
    space_key: string?,
    page_id: string?,
    comment_id: string?,
    query: string?,
    max_results: integer?,
    start_at: integer?,
    next_page_token: string?,
}

local function handler(args: any): (any?, error?)
    local a = (args or {}) :: GetArgs
    local conn, err = transport.connect(ctx.get("connection_id") :: string?)
    if not conn then return nil, err end

    local space = a.space_key or (ctx.get("space_key") :: string?)
    local action = a.action

    if action == "list_spaces" then
        local r, rerr = confluence.list_spaces(conn, a.max_results, a.start_at)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        local data: any = r.data or {}
        local rows = records(conn, data)
        local page, page_err = page_info(data, #rows, a.start_at, a.max_results)
        if not page then return tool_result.domain_error(page_err) end
        page.success = true; page.action = action; page.count = #rows; page.spaces = rows
        return page

    elseif action == "get_space" then
        local r, rerr = confluence.get_space(conn, space)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        return { success = true, action = action, space = record(conn, r.data) }

    elseif action == "list_pages" then
        local r, rerr = confluence.list_pages(conn, space, a.max_results, a.start_at)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        local rows = records(conn, r.data)
        local page, page_err = page_info(r.data or {}, #rows, a.start_at, a.max_results)
        if not page then return tool_result.domain_error(page_err) end
        page.success = true; page.action = action; page.count = #rows; page.pages = rows
        return page

    elseif action == "list_blogposts" then
        local r, rerr = confluence.list_blogposts(conn, space, a.max_results, a.start_at)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        local rows = records(conn, r.data)
        local page, page_err = page_info(r.data or {}, #rows, a.start_at, a.max_results)
        if not page then return tool_result.domain_error(page_err) end
        page.success = true; page.action = action; page.count = #rows; page.blogposts = rows
        return page

    elseif action == "get_comment" then
        if not a.comment_id or a.comment_id == "" then return tool_result.domain_error("comment_id is required") end
        local r, rerr = confluence.get_page(conn, a.comment_id)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        return {success = true, action = action, comment = record(conn, r.data)}

    elseif action == "get_page" or action == "read_page" then
        local r, rerr = confluence.get_page(conn, a.page_id)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        local p: any = r.data or {}
        local page: any = record(conn, p)
        if action == "read_page" then
            page.content = markdown.from_storage(confluence.page_body(p))
            page.content_type = "text/markdown"
        end
        return { success = true, action = action, page = page }

    elseif action == "search" then
        local r, rerr = confluence.site_search(conn, a.query, a.max_results, a.start_at, a.next_page_token)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        local data: any = r.data or {}
        local base = base_of(data)
        local rows: { any } = {}
        for _, result in ipairs(type(data.results) == "table" and data.results or {}) do
            local row: any = {}
            row.title = result.title
            row.excerpt = result.excerpt
            row.lastModified = result.lastModified
            if type(result.content) == "table" then row.content = summary(conn, result.content, base) end
            row.excerpt_markdown = markdown.from_storage(result.excerpt)
            if type(result.url) == "string" and base then row.web_url = base .. result.url end
            rows[#rows + 1] = row
        end
        local page, page_err = page_info(r.data or {}, #rows, a.start_at, a.max_results)
        if not page then return tool_result.domain_error(page_err) end
        page.success = true; page.action = action; page.count = #rows; page.results = rows
        return page

    elseif action == "get_comments" then
        local r, rerr = confluence.get_comments(conn, a.page_id, a.max_results, a.start_at)
        if not r then return nil, rerr end
        if not r.success then return confluence_error(r) end
        local data: any = r.data or {}
        local base = base_of(data)
        local rows: { any } = {}
        for _, cm in ipairs(type(data.results) == "table" and data.results or {}) do
            local row: any = summary(conn, cm, base)
            rows[#rows + 1] = row
        end
        local page, page_err = page_info(r.data or {}, #rows, a.start_at, a.max_results)
        if not page then return tool_result.domain_error(page_err) end
        page.success = true; page.action = action; page.page_id = a.page_id
        page.count = #rows; page.comments = rows
        return page
    end

    return tool_result.domain_error("unknown action '" .. tostring(action) .. "'")
end

return { handler = handler }
