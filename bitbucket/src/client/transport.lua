local component = require("component")
local base64 = require("base64")
local api = require("api")
local types = require("types")

local M = {}
M._component = component

local function credential_context(component_id: string): (any?, error?)
    local cmp = M._component
    if cmp.get_private_context then
        local ctx, err = cmp.get_private_context(component_id)
        if not err and type(ctx) == "table" and next(ctx) ~= nil then return ctx, nil end
    end
    local ctx, err = cmp.get_context(component_id, cmp.ACCESS.READ)
    if err then return nil, err end
    return ctx, nil
end

local function field(ctx: any, key: string): string?
    local value = ctx[key]
    if type(value) ~= "string" then return nil end
    local trimmed = (value :: string):gsub("^%s*(.-)%s*$", "%1")
    if trimmed == "" then return nil end
    return trimmed
end

local function optional_workspace(ctx: any): (string?, error?)
    if field(ctx, "workspace") == nil then return nil, nil end
    return api.workspace_slug(ctx.workspace)
end

-- credential_conn derives the authenticated handle from a connection's stored
-- context: an Atlassian API token authenticates with HTTP Basic
-- (account email + token); a workspace, project, or repository access token
-- authenticates as a Bearer token bound to its workspace.
function M.credential_conn(component_id: string, ctx: any): (types.Conn?, error?)
    if type(ctx) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket connection has no stored credentials" }) end
    local auth_type = field(ctx, "auth_type")

    if auth_type == types.AUTH_API_TOKEN then
        local email = field(ctx, "email")
        local token = field(ctx, "api_token")
        if not email then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket API token connection is missing email" }) end
        if not token then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket API token connection is missing api_token" }) end
        local workspace, workspace_err = optional_workspace(ctx)
        if workspace_err then return nil, workspace_err end
        return {
            component_id = component_id,
            auth_type = types.AUTH_API_TOKEN,
            authorization = "Basic " .. (base64.encode((email :: string) .. ":" .. (token :: string)) :: string),
            workspace = workspace,
        }, nil
    end

    if auth_type == types.AUTH_ACCESS_TOKEN then
        local token = field(ctx, "access_token")
        if not token then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket access token connection is missing access_token" }) end
        if field(ctx, "workspace") == nil then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket access token connection is missing workspace" }) end
        local workspace, workspace_err = api.workspace_slug(ctx.workspace)
        if workspace_err or not workspace then return nil, workspace_err end
        return {
            component_id = component_id,
            auth_type = types.AUTH_ACCESS_TOKEN,
            authorization = "Bearer " .. (token :: string),
            workspace = workspace,
        }, nil
    end

    if auth_type == nil then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket connection is missing auth_type" }) end
    return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket connection has unsupported auth_type '" .. (auth_type :: string) .. "'" })
end

function M.connect(component_id: string): (types.Conn?, error?)
    if component_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "Bitbucket connection component_id is required" }) end
    local ctx, err = credential_context(component_id)
    if err then return nil, errors.wrap(err, "read Bitbucket connection credentials") end
    return M.credential_conn(component_id, ctx)
end

M.request = api.request
M.current_user = api.current_user
M.test_connection = api.test_connection
M.list_workspaces = api.list_workspaces
M.list_repositories = api.list_repositories
M.next_page = api.next_page
M.workspace_slug = api.workspace_slug

return M
