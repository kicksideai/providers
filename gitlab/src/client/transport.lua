local component = require("component")
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

-- connect resolves a GitLab connection component into a Conn. The stored
-- credential carries the access token and the optional instance base_url.
function M.connect(component_id: string?): (types.Conn?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "GitLab connection component_id is required" })
    end
    local ctx, err = credential_context(component_id :: string)
    if err then return nil, errors.wrap(err, "read GitLab connection") end
    ctx = type(ctx) == "table" and ctx or {}

    local token = ctx.token
    if type(token) ~= "string" or token == "" then return nil, errors.new({ kind = errors.INVALID, message = "GitLab credential connection is missing token" }) end
    local base_url, base_err = api.normalize_base_url(ctx.base_url)
    if base_err or not base_url then return nil, base_err end

    return ({
        component_id = component_id :: string,
        mode = types.MODE_CREDENTIAL,
        base_url = base_url :: string,
        token = token :: string,
    } :: types.Conn), nil
end

M.request = api.request_json
M.current_user = api.current_user
M.list_projects = api.list_projects
M.next_page = api.next_page

return M
