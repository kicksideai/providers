local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}
M._base = base
M._transport = transport

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: string?, status_code: integer?, details: any? }
type ProjectMetadata = {
    owner: string?,
    visibility: string?,
    default_branch: string?,
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
    metadata: ProjectMetadata,
}
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, next_cursor: string?, error: string?, status_code: integer?, details: any? }

local PROJECT_TYPE = "gitlab_project"
local DEFAULT_LIMIT = 100
local MAX_LIMIT = 100

local function open(): (types.Conn?, error?)
    local id, err = M._base.component_id()
    if not id then return nil, err end
    return M._transport.connect(tostring(id))
end

-- A failed GitLab answer: its message, HTTP status and error body.
local function gitlab_failure(result: any): any
    return { success = false, error = result.error, status_code = result.status_code, details = result.data }
end

function M.test_connection(_args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = M._transport.current_user(conn)
    if not result then return nil, request_err end
    if not result.success then return gitlab_failure(result) end
    return { success = true }
end

function M.get_status(args: any): (StatusResult?, error?)
    return M._base.get_status(args)
end

local function optional_string(value: any): string?
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

local function project_id(value: any): string?
    if type(value) == "number" and value == math.floor(value) then return string.format("%d", value) end
    return optional_string(value)
end

local function project_row(project: any): ResourceRow?
    if type(project) ~= "table" then return nil end
    local id = project_id(project.id)
    local full_path = optional_string(project.path_with_namespace)
    if not id or not full_path then return nil end
    return {
        type = PROJECT_TYPE,
        id = id :: string,
        key = full_path :: string,
        name = full_path :: string,
        url = optional_string(project.web_url),
        selectable = true,
        metadata = {
            owner = type(project.namespace) == "table" and optional_string(project.namespace.full_path) or nil,
            visibility = optional_string(project.visibility),
            default_branch = optional_string(project.default_branch),
            updated_at = optional_string(project.last_activity_at),
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

-- discover_resources lists the projects the token's user is a member of, one
-- page per call. GitLab projects form a flat list here, so a parent_id names
-- no container and yields no rows.
function M.discover_resources(args: any): (DiscoverResult?, error?)
    args = type(args) == "table" and args or {}
    local kind = optional_string(args.type)
    if kind and kind ~= PROJECT_TYPE then return { success = true, resources = {} } end
    if optional_string(args.parent_id) then return { success = true, resources = {} } end
    local page, cursor_err = page_from_cursor(args.cursor)
    if cursor_err or not page then return { success = false, error = cursor_err } end

    local conn, err = open()
    if not conn then return nil, err end

    local query: { [string]: any } = { page = page, per_page = clamp_limit(args.limit) }
    local search = type(args.q) == "string" and M._base.trim(args.q) or ""
    if search ~= "" then query.search = search end
    local result, request_err = M._transport.list_projects(conn, query)
    if not result then return nil, request_err end
    if not result.success then return gitlab_failure(result) end

    local resources: { ResourceRow } = {}
    for _, project in ipairs(type(result.data) == "table" and result.data or {}) do
        local row = project_row(project)
        if row then resources[#resources + 1] = row end
    end
    return { success = true, resources = resources, next_cursor = M._transport.next_page(result.headers) }
end

function M.delete(_args: any): ({ success: boolean }?, error?)
    return M._base.delete()
end

return M
