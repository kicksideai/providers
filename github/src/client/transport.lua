local component = require("component")
local api = require("api")
local types = require("types")

local M = {}
M._component = component

local function credential_context_with(cmp: any, component_id: string): (any?, error?)
    local allowed, access_err = cmp.get_context(component_id, cmp.ACCESS.READ)
    if access_err then return nil, access_err end
    if not allowed then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "connection access denied" }) end
    if cmp.get_private_context then
        local ctx, err = cmp.get_private_context(component_id)
        if err then return nil, err end
        if type(ctx) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "GitHub credential context is invalid" }) end
        return ctx, nil
    end
    return allowed, nil
end
M._credential_context_with = credential_context_with

local function credential_conn(component_id: string, ctx: any): (types.Conn?, error?)
    ctx = type(ctx) == "table" and ctx or {}
    local token = ctx.token
    if type(token) ~= "string" or token == "" then return nil, errors.new({ kind = errors.INVALID, message = "GitHub credential connection is missing token" }) end
    return ({ component_id = component_id, mode = "credential", token = token } :: types.Conn), nil
end

local function connect_with(cmp: any, component_id: string?): (types.Conn?, error?)
    if component_id and component_id ~= "" then
        local oconn, oerr = cmp.open(component_id :: string, cmp.ACCESS.READ, types.OAUTH_CONTRACT)
        if not oerr and oconn then
            return ({ component_id = component_id, mode = "oauth", oauth_conn = oconn } :: types.Conn), nil
        end
        local ctx, cerr = credential_context_with(cmp, component_id :: string)
        if cerr then return nil, cerr end
        return credential_conn(component_id :: string, ctx)
    end

    local oconn, oerr = cmp.open_by_meta({
        class = types.CONNECTION_CLASS,
        provider = types.PROVIDER,
    }, cmp.ACCESS.READ, types.OAUTH_CONTRACT)
    if not oerr and oconn then
        return ({ mode = "oauth", oauth_conn = oconn } :: types.Conn), nil
    end
    local ctx, cerr = cmp.get_context_by_meta({
        class = types.CONNECTION_CLASS,
        provider = types.PROVIDER,
    }, cmp.ACCESS.READ)
    if cerr then
        return nil, errors.new({ kind = errors.INVALID, message = "no GitHub connection selected; configure the trait connection when there is no single default" })
    end
    local cid = type(ctx) == "table" and type(ctx.component_id) == "string" and (ctx.component_id :: string) or ""
    return credential_conn(cid, ctx)
end
M._connect_with = connect_with

function M.connect(component_id: string?): (types.Conn?, error?)
    return connect_with(M._component, component_id)
end

M.request = api.request_json
M.viewer = api.viewer
M.test_connection = api.test_connection
M.get_repo = api.get_repo
M.list_issues = api.list_issues
M.get_issue = api.get_issue
M.list_issue_comments = api.list_issue_comments
M.get_issue_comment = api.get_issue_comment
M.create_issue = api.create_issue
M.update_issue = api.update_issue
M.create_issue_comment = api.create_issue_comment
M.get_pull = api.get_pull
M.list_pull_files = api.list_pull_files
M.get_file = api.get_file
M.list_repositories = api.list_repositories
M.has_next_page = api.has_next_page

return M
