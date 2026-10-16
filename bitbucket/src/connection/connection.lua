local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}
M._base = base
M._transport = transport

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: string?, status_code: integer?, details: any? }
type ResourceMetadata = {
    owner: string?,
    uuid: string?,
    visibility: string?,
    default_branch: string?,
    updated_at: string?,
    administrator: boolean?,
}
type ResourceRow = {
    type: string,
    id: string,
    key: string,
    name: string,
    description: string?,
    url: string?,
    selectable: boolean,
    drillable: boolean?,
    parent_id: string?,
    metadata: ResourceMetadata,
}
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, next_cursor: string?, error: string?, status_code: integer?, details: any? }

M.WORKSPACE_TYPE = "bitbucket_workspace"
M.REPOSITORY_TYPE = "bitbucket_repository"
local DEFAULT_LIMIT = 100
local MAX_LIMIT = 100

local function open(): (types.Conn?, error?)
    local id, err = M._base.component_id()
    if not id then return nil, err end
    return M._transport.connect(tostring(id))
end

-- A failed Bitbucket answer: its message, HTTP status and error body.
local function bitbucket_failure(result: any): any
    return { success = false, error = result.error, status_code = result.status_code, details = result.data }
end

function M.test_connection(_args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = M._transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return bitbucket_failure(result) end
    return { success = true }
end

function M.get_status(args: any): (StatusResult?, error?)
    return M._base.get_status(args)
end

local function optional_string(value: any): string?
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

local function html_url(item: any): string?
    local links = item.links
    if type(links) ~= "table" or type(links.html) ~= "table" then return nil end
    return optional_string(links.html.href)
end

local function workspace_row(access: any): ResourceRow?
    if type(access) ~= "table" or type(access.workspace) ~= "table" then return nil end
    local workspace = access.workspace
    local slug = optional_string(workspace.slug)
    if not slug then return nil end
    local administrator: boolean? = nil
    if type(access.administrator) == "boolean" then administrator = access.administrator end
    return {
        type = M.WORKSPACE_TYPE,
        id = slug :: string,
        key = slug :: string,
        name = optional_string(workspace.name) or slug :: string,
        url = html_url(workspace),
        selectable = false,
        drillable = true,
        metadata = {
            uuid = optional_string(workspace.uuid),
            administrator = administrator,
        },
    }
end

local function repository_row(repo: any, parent_id: string?): ResourceRow?
    if type(repo) ~= "table" then return nil end
    local full_name = optional_string(repo.full_name)
    if not full_name then return nil end
    local visibility: string? = nil
    if type(repo.is_private) == "boolean" then visibility = repo.is_private and "private" or "public" end
    return {
        type = M.REPOSITORY_TYPE,
        id = full_name :: string,
        key = full_name :: string,
        name = full_name :: string,
        url = html_url(repo),
        selectable = true,
        parent_id = parent_id,
        metadata = {
            owner = type(repo.workspace) == "table" and optional_string(repo.workspace.slug) or nil,
            uuid = optional_string(repo.uuid),
            visibility = visibility,
            default_branch = type(repo.mainbranch) == "table" and optional_string(repo.mainbranch.name) or nil,
            updated_at = optional_string(repo.updated_on),
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

type Target = { kind: string, workspace: string? }

-- target decides what one discovery call lists: the caller's workspaces at the
-- root of an unscoped API token connection, otherwise one workspace's
-- repositories (the connection's own workspace, or the drilled-into parent).
local function target(conn: types.Conn, parent_id: string?): (Target?, error?)
    if conn.workspace then
        if parent_id and parent_id ~= conn.workspace then
            return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "Bitbucket connection is limited to workspace '" .. (conn.workspace :: string) .. "'" })
        end
        return { kind = M.REPOSITORY_TYPE, workspace = conn.workspace }, nil
    end
    if not parent_id then return { kind = M.WORKSPACE_TYPE }, nil end
    local slug, err = M._transport.workspace_slug(parent_id)
    if err or not slug then return nil, err end
    return { kind = M.REPOSITORY_TYPE, workspace = slug }, nil
end

-- discover_resources lists one page of workspaces or repositories; next_cursor
-- names the following Bitbucket page.
function M.discover_resources(args: any): (DiscoverResult?, error?)
    args = type(args) == "table" and args or {}
    local kind = optional_string(args.type)
    if kind and kind ~= M.WORKSPACE_TYPE and kind ~= M.REPOSITORY_TYPE then return { success = true, resources = {} } end
    local page, cursor_err = page_from_cursor(args.cursor)
    if cursor_err or not page then return { success = false, error = cursor_err } end

    local conn, err = open()
    if not conn then return nil, err end
    local plan, plan_err = target(conn, optional_string(args.parent_id))
    if not plan then return nil, plan_err end
    if kind and kind ~= plan.kind then return { success = true, resources = {} } end

    local query: types.PageQuery = { page = page, pagelen = clamp_limit(args.limit), q = optional_string(args.q) }
    local result: types.Result?
    local request_err: error?
    local shape: (any) -> ResourceRow?
    if plan.kind == M.WORKSPACE_TYPE then
        result, request_err = M._transport.list_workspaces(conn, query)
        shape = workspace_row
    else
        local parent_id = optional_string(args.parent_id)
        result, request_err = M._transport.list_repositories(conn, plan.workspace :: string, query)
        shape = function(item: any): ResourceRow? return repository_row(item, parent_id) end
    end
    if not result then return nil, request_err end
    if not result.success then return bitbucket_failure(result) end
    if type(result.data) ~= "table" or type(result.data.values) ~= "table" then
        return { success = false, error = "Bitbucket returned an unexpected discovery response" }
    end

    local resources: { ResourceRow } = {}
    for _, item in ipairs(result.data.values) do
        local row = shape(item)
        if row then resources[#resources + 1] = row end
    end
    local next_cursor, page_err = M._transport.next_page(result.data)
    if page_err then return { success = false, error = page_err } end
    return { success = true, resources = resources, next_cursor = next_cursor }
end

function M.delete(_args: any): ({ success: boolean }?, error?)
    return M._base.delete()
end

return M
