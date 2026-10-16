-- Confluence REST client over the Atlassian transport. Uses the v1 REST API
-- (conn.confluence_base already points at /wiki/rest/api on Cloud or /rest/api on
-- Server), so paths are identical across deployments. Page bodies use Confluence
-- storage format (XHTML). This layer appends paths, shapes bodies, and returns
-- transport Results.

local transport = require("transport")
local atlassian_types = require("types")

local confluence = {}

local function enc(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end

-- Expansions that make a content row complete: space, current version (number,
-- when, by) and history (created date and creator).
local CONTENT_EXPAND = "space,version,history"

local function limit_param(max_results: integer?, start_at: integer?): (string?, string?)
    local n = max_results or 25
    if type(n) ~= "number" or n < 1 or n ~= math.floor(n) then
        return nil, "max_results must be a positive integer"
    end
    if start_at ~= nil and (type(start_at) ~= "number" or start_at < 0 or start_at ~= math.floor(start_at)) then
        return nil, "start_at must be a nonnegative integer"
    end
    local query = "limit=" .. tostring(math.min(n, 100))
    if start_at ~= nil then query = query .. "&start=" .. tostring(start_at) end
    return query, nil
end

-- ─── read ────────────────────────────────────────────────────────────────
function confluence.list_spaces(conn: atlassian_types.Conn, max_results: integer?, start_at: integer?): (atlassian_types.Result?, error?)
    local query, page_err = limit_param(max_results, start_at)
    if page_err then return { success = false, error = page_err } end
    return transport.get(conn, conn.confluence_base .. "/space?" .. query)
end

function confluence.get_space(conn: atlassian_types.Conn, space_key: string?): (atlassian_types.Result?, error?)
    if not space_key or space_key == "" then return { success = false, error = "space_key is required" } end
    return transport.get(conn, conn.confluence_base .. "/space/" .. enc(space_key) .. "?expand=description.plain,homepage")
end

function confluence.list_pages(conn: atlassian_types.Conn, space_key: string?, max_results: integer?, start_at: integer?): (atlassian_types.Result?, error?)
    if not space_key or space_key == "" then return { success = false, error = "space_key is required" } end
    local query, page_err = limit_param(max_results, start_at)
    if page_err then return { success = false, error = page_err } end
    local url = conn.confluence_base .. "/content?type=page&spaceKey=" .. enc(space_key) .. "&expand=" .. CONTENT_EXPAND .. "&" .. query
    return transport.get(conn, url)
end

function confluence.list_blogposts(conn: atlassian_types.Conn, space_key: string?, max_results: integer?, start_at: integer?): (atlassian_types.Result?, error?)
    if not space_key or space_key == "" then return { success = false, error = "space_key is required" } end
    local query, page_err = limit_param(max_results, start_at)
    if page_err then return { success = false, error = page_err } end
    local url = conn.confluence_base .. "/content?type=blogpost&spaceKey=" .. enc(space_key) .. "&expand=" .. CONTENT_EXPAND .. "&" .. query
    return transport.get(conn, url)
end

function confluence.get_page(conn: atlassian_types.Conn, page_id: string?): (atlassian_types.Result?, error?)
    if not page_id or page_id == "" then return { success = false, error = "page_id is required" } end
    return transport.get(conn, conn.confluence_base .. "/content/" .. enc(page_id) .. "?expand=body.storage,ancestors," .. CONTENT_EXPAND)
end

function confluence.search(conn: atlassian_types.Conn, cql: string?, max_results: integer?, start_at: integer?, next_page_token: string?): (atlassian_types.Result?, error?)
    if not cql or cql == "" then return { success = false, error = "cql query is required" } end
    local query, page_err = limit_param(max_results, start_at)
    if page_err then return { success = false, error = page_err } end
    if next_page_token ~= nil and (type(next_page_token) ~= "string" or next_page_token == "") then
        return {success = false, error = "next_page_token must be a nonempty string"}
    end
    if next_page_token ~= nil and start_at ~= nil then
        return {success = false, error = "use next_page_token or start_at, not both"}
    end
    local url = conn.confluence_base .. "/content/search?cql=" .. enc(cql) .. "&" .. query
    if next_page_token ~= nil then url = url .. "&cursor=" .. enc(next_page_token) end
    return transport.get(conn, url)
end

-- Site search: each result carries the matched content (expanded like a content
-- row), the provider's highlighted excerpt and its web url.
function confluence.site_search(conn: atlassian_types.Conn, cql: string?, max_results: integer?, start_at: integer?, next_page_token: string?): (atlassian_types.Result?, error?)
    if not cql or cql == "" then return { success = false, error = "cql query is required" } end
    local query, page_err = limit_param(max_results, start_at)
    if page_err then return { success = false, error = page_err } end
    if next_page_token ~= nil and (type(next_page_token) ~= "string" or next_page_token == "") then
        return {success = false, error = "next_page_token must be a nonempty string"}
    end
    if next_page_token ~= nil and start_at ~= nil then
        return {success = false, error = "use next_page_token or start_at, not both"}
    end
    local url = conn.confluence_base .. "/search?cql=" .. enc(cql) .. "&expand=content.space,content.version,content.history&" .. query
    if next_page_token ~= nil then url = url .. "&cursor=" .. enc(next_page_token) end
    return transport.get(conn, url)
end

function confluence.get_comments(conn: atlassian_types.Conn, page_id: string?, max_results: integer?, start_at: integer?): (atlassian_types.Result?, error?)
    if not page_id or page_id == "" then return { success = false, error = "page_id is required" } end
    local query, page_err = limit_param(max_results, start_at)
    if page_err then return { success = false, error = page_err } end
    local url = conn.confluence_base .. "/content/" .. enc(page_id) .. "/child/comment?expand=version,history"
    if max_results ~= nil or start_at ~= nil then url = url .. "&" .. query end
    return transport.get(conn, url)
end

-- ─── write ─────────────────────────────────────────────────────────────────
local function storage_body(html: string): any
    return { storage = { value = html, representation = "storage" } }
end

function confluence.create_content(conn: atlassian_types.Conn, space_key: string?, content_type: string?, title: string?, body: string?, parent_id: string?): (atlassian_types.Result?, error?)
    if not space_key or space_key == "" then return { success = false, error = "space_key is required" } end
    if not title or title == "" then return { success = false, error = "title is required" } end
    local typ = content_type or "page"
    local payload: { [string]: any } = {
        type = typ,
        title = title,
        space = { key = space_key },
        body = storage_body(body or ""),
    }
    if parent_id and parent_id ~= "" then payload.ancestors = { { id = parent_id } } end
    return transport.post(conn, conn.confluence_base .. "/content", payload)
end

function confluence.create_page(conn: atlassian_types.Conn, space_key: string?, title: string?, body: string?, parent_id: string?): (atlassian_types.Result?, error?)
    return confluence.create_content(conn, space_key, "page", title, body, parent_id)
end

function confluence.update_content(conn: atlassian_types.Conn, page_id: string?, content_type: string?, title: string?, body: string?, version: integer): (atlassian_types.Result?, error?)
    if not page_id or page_id == "" then return { success = false, error = "page_id is required" } end
    if not version or version < 1 then return { success = false, error = "current version number is required" } end
    return transport.put(conn, conn.confluence_base .. "/content/" .. enc(page_id), {
        type = content_type or "page",
        title = title,
        version = { number = version + 1 },
        body = storage_body(body or ""),
    })
end

function confluence.update_page(conn: atlassian_types.Conn, page_id: string?, title: string?, body: string?, version: integer): (atlassian_types.Result?, error?)
    return confluence.update_content(conn, page_id, "page", title, body, version)
end

function confluence.delete_content(conn: atlassian_types.Conn, page_id: string?): (atlassian_types.Result?, error?)
    if not page_id or page_id == "" then return { success = false, error = "page_id is required" } end
    return transport.delete(conn, conn.confluence_base .. "/content/" .. enc(page_id))
end

function confluence.delete_page(conn: atlassian_types.Conn, page_id: string?): (atlassian_types.Result?, error?)
    return confluence.delete_content(conn, page_id)
end

function confluence.add_comment(conn: atlassian_types.Conn, page_id: string?, body: string?): (atlassian_types.Result?, error?)
    if not page_id or page_id == "" then return { success = false, error = "page_id is required" } end
    return transport.post(conn, conn.confluence_base .. "/content", {
        type = "comment",
        container = { id = page_id, type = "page" },
        body = storage_body(body or ""),
    })
end

-- The web url of a content or space row: the site base (the response's
-- _links.base, the row's own, or the site derived from a non-gateway REST base)
-- joined with the row's webui path; nil when the row has no webui path.
function confluence.web_url(conn: any, row: any, base: string?): string?
    local links: any = type(row) == "table" and type(row._links) == "table" and row._links or {}
    local webui = type(links.webui) == "string" and links.webui or ""
    if webui == "" then return nil end
    local site = base
    if type(site) ~= "string" or site == "" then site = type(links.base) == "string" and links.base or nil end
    if not site or site == "" then
        local rest = type(conn) == "table" and type(conn.confluence_base) == "string" and conn.confluence_base or ""
        if rest == "" or rest:find("api%.atlassian%.com", 1, false) then return nil end
        site = (rest:gsub("/wiki/rest/api$", "/wiki"):gsub("/rest/api$", ""))
    end
    return site .. webui
end

-- Extract a page's storage-format body (XHTML) from a get_page result payload.
function confluence.page_body(data: any): string
    if type(data) ~= "table" then return "" end
    local body: any = data.body
    local storage: any = type(body) == "table" and body.storage or nil
    return (type(storage) == "table" and storage.value) or ""
end

return confluence
