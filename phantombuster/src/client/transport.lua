local component = require("component")
local api = require("api")
local types = require("types")

local M = {}

local function context(component_id: string?): (any?, error?)
    local selected = type(component_id) == "string" and component_id or ""
    if selected == "" then return nil, errors.new({ kind = errors.INVALID, message = "PhantomBuster connection component_id is required" }) end
    local ctx, err = component.get_context(selected, component.ACCESS.READ)
    if err then return nil, err end
    return ctx, nil
end

function M.connect(component_id: string?): (types.Conn?, error?)
    local ctx, err = context(component_id)
    if err or not ctx then return nil, err end
    local api_key = ctx.api_key
    if type(api_key) ~= "string" or api_key == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "PhantomBuster connection is missing api_key" })
    end
    local component_id = type(ctx.component_id) == "string" and (ctx.component_id :: string) or nil
    return ({ component_id = component_id, api_key = api_key } :: types.Conn), nil
end

M.get = api.get
M.post = api.post
M.test_connection = api.test_connection
M.get_org = api.get_org
M.get_org_resources = api.get_org_resources
M.list_running_containers = api.list_running_containers
M.list_agents = api.list_agents
M.list_deleted_agents = api.list_deleted_agents
M.get_agent = api.get_agent
M.get_agent_output = api.get_agent_output
M.list_containers = api.list_containers
M.get_container = api.get_container
M.get_container_output = api.get_container_output
M.get_result_object = api.get_result_object
M.launch_agent = api.launch_agent
M.launch_agent_soon = api.launch_agent_soon
M.stop_agent = api.stop_agent

return M
