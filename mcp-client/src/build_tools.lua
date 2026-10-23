local ctx = require("ctx")
local component = require("component")
local surface = require("surface")
local catalog = require("catalog")

local CLIENT_CONTRACT = "kickside.mcp_client:client"

local function execute(base_prompt: any, context: any): any
    context = type(context) == "table" and context or {}
    local connection_id = (context :: any).connection_id or ctx.get("connection_id")
    if type(connection_id) ~= "string" or connection_id == "" then
        return { prompt = tostring(base_prompt or "") .. "\n\nRemote MCP capability is not configured: connection_id is required." }
    end

    local instance, open_err = component.open(connection_id, component.ACCESS.READ, CLIENT_CONTRACT)
    if open_err or not instance then
        return { prompt = tostring(base_prompt or "") .. "\n\nRemote MCP connection is unavailable: " .. tostring(open_err) }
    end
    local tools = {}
    local list_err = catalog.each_page(function(cursor: string?): (any?, error?)
        local page, err = instance:list_tools({cursor = cursor, fields = {"*"}})
        return page, err
    end, function(page)
        for _, tool in ipairs(page.tools) do tools[#tools + 1] = tool end
    end)
    if list_err then
        return { prompt = tostring(base_prompt or "") .. "\n\nRemote MCP tool discovery failed: " .. tostring(list_err) }
    end
    local generated, build_err = surface.build(connection_id, tools, {
        selected_tools = (context :: any).selected_tools,
        tool_prefix = (context :: any).tool_prefix,
    })
    if build_err then
        return { prompt = tostring(base_prompt or "") .. "\n\nRemote MCP tool surface failed: " .. tostring(build_err) }
    end
    return { prompt = base_prompt, tools = generated }
end

return { execute = execute }
