local ctx = require("ctx")
local component = require("component")
local surface = require("surface")

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
    local tools, cursor = {}, nil
    repeat
        local page, list_err = instance:list_tools({cursor = cursor, fields = {"*"}})
        if list_err then
            return { prompt = tostring(base_prompt or "") .. "\n\nRemote MCP tool discovery failed: " .. tostring(list_err) }
        end
        for _, tool in ipairs(page.tools) do tools[#tools + 1] = tool end
        cursor = page.next_cursor
    until not cursor
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
