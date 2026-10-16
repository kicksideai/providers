local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}
M._base = base
M._transport = transport

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: string?, status_code: integer?, details: any? }
type RepositoryMetadata = {
    owner: string?,
    visibility: string?,
    default_branch: string?,
    archived: boolean?,
    updated_at: string?,
}
type ResourceRow = {
    type: string,
    id: string,
    key: string,
    name: string,
    description: string?,
    url: string?,
    selectable: boolean,
    metadata: RepositoryMetadata,
}
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, next_cursor: string?, error: string?, status_code: integer?, details: any? }

local REPOSITORY_TYPE = "github_repo"
local DEFAULT_LIMIT = 100
local MAX_LIMIT = 100

local function open(): (types.Conn?, error?)
    local id, err = M._base.component_id()
    if not id then return nil, err end
    return M._transport.connect(tostring(id))
end

function M.test_connection(_args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = M._transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return { success = false, error = result.error, status_code = result.status_code, details = result.data } end
    return { success = true, details = result.data }
end

function M.get_status(args: any): (StatusResult?, error?)
    return M._base.get_status(args)
end

local function optional_string(value: any): string?
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

local function repository_row(repo: any): ResourceRow?
    if type(repo) ~= "table" then return nil end
    local full_name = optional_string(repo.full_name)
    if not full_name then return nil end
    local archived: boolean? = nil
    if type(repo.archived) == "boolean" then archived = repo.archived end
    local visibility = optional_string(repo.visibility)
    if not visibility and type(repo.private) == "boolean" then
        visibility = repo.private and "private" or "public"
    end
    return {
        type = REPOSITORY_TYPE,
        id = full_name :: string,
        key = full_name :: string,
        name = full_name :: string,
        url = optional_string(repo.html_url),
        selectable = true,
        metadata = {
            owner = type(repo.owner) == "table" and optional_string(repo.owner.login) or nil,
            visibility = visibility,
            default_branch = optional_string(repo.default_branch),
            archived = archived,
            updated_at = optional_string(repo.updated_at),
        },
    }
end

local function page_from_cursor(cursor: any): (integer?, string?)
    if cursor == nil or cursor == "" then return 1, nil end
    local page = tonumber(cursor)
    if not page or page < 1 or page ~= math.floor(page) then
        return nil, "invalid discovery cursor: " .. tostring(cursor)
    end
    return math.floor(page), nil
end

local function clamp_limit(limit: any): integer
    local value = tonumber(limit)
    if not value then return DEFAULT_LIMIT end
    value = math.floor(value)
    if value < 1 then return 1 end
    if value > MAX_LIMIT then return MAX_LIMIT end
    return value
end

-- discover_resources lists the repositories the connection can access, one
-- page per call; next_cursor names the following page. Repositories form a
-- flat list, so a parent_id names no container and yields no rows.
function M.discover_resources(args: any): (DiscoverResult?, error?)
    args = type(args) == "table" and args or {}
    if optional_string(args.q) then
        return { success = false, error = "GitHub repository discovery does not support search; page with the cursor instead" }
    end
    local kind = optional_string(args.type)
    if kind and kind ~= REPOSITORY_TYPE then return { success = true, resources = {} } end
    if optional_string(args.parent_id) then return { success = true, resources = {} } end
    local page, cursor_err = page_from_cursor(args.cursor)
    if cursor_err or not page then return { success = false, error = cursor_err } end

    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = M._transport.list_repositories(conn, { page = page, per_page = clamp_limit(args.limit) })
    if not result then return nil, request_err end
    if not result.success then return { success = false, error = result.error, status_code = result.status_code, details = result.data } end

    local resources: { ResourceRow } = {}
    for _, repo in ipairs(type(result.data) == "table" and result.data or {}) do
        local row = repository_row(repo)
        if row then resources[#resources + 1] = row end
    end
    local next_cursor: string? = nil
    if M._transport.has_next_page(result.headers) then next_cursor = tostring(page + 1) end
    return { success = true, resources = resources, next_cursor = next_cursor }
end

function M.delete(_args: any): (SimpleResult?, error?)
    return M._base.delete()
end

return M
