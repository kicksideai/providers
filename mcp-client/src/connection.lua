local base = require("base")
local broker = require("broker")
local M = {}

function M.get_status(args: any): (any?, error?) return base.get_status(args) end

function M.test_connection(_args: any): (any?, error?)
    local component_id, err = base.component_id()
    if not component_id then return nil, err end
    local count, cursor = 0, nil
    repeat
        local page, list_err = broker.request(component_id, "list_tools", {cursor = cursor})
        if list_err then return nil, list_err end
        count = count + #page.tools
        cursor = page.next_cursor
    until not cursor
    return {success = true, details = {tool_count = count}}
end

function M.discover_resources(args: any): (any?, error?)
    local page, err = M.list_tools(args)
    if err then return nil, err end
    local resources = {}
    for _, tool in ipairs(page.tools) do
        resources[#resources + 1] = {type = "mcp_tool", id = tool.name, name = tool.name,
            selectable = true, drillable = false}
    end
    return {success = true, resources = resources, next_cursor = page.next_cursor}
end

function M.list_tools(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if args.cursor ~= nil and (type(args.cursor) ~= "string" or args.cursor == "") then
        return nil, errors.new({kind = errors.INVALID, message = "cursor must be a nonempty provider token"})
    end
    local component_id, err = base.component_id()
    if not component_id then return nil, err end
    local page, list_err = broker.request(component_id, "list_tools", {cursor = args.cursor})
    if list_err then return nil, list_err end
    local rows = {}
    for _, tool in ipairs(page.tools) do
        local row: any = {name = tool.name, title = tool.title}
        for _, field in ipairs(args.fields or {}) do
            if field == "*" then
                for key, value in pairs(tool) do row[key] = value end
            else row[field] = tool[field] end
        end
        rows[#rows + 1] = row
    end
    return {tools = rows, next_cursor = page.next_cursor}
end

function M.call_tool(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local component_id, err = base.component_id()
    if not component_id then return nil, err end
    return broker.request(component_id, "call_tool", { name = args.name, arguments = args.arguments or {} })
end

function M.delete(_args: any): (any?, error?) return base.delete() end
return M
