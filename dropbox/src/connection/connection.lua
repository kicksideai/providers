local base = require("base")
local service = require("service")
local ctx = require("ctx")
local types = require("types")
local M = {}
M.get_status = base.get_status
M.delete = base.delete
local function run(action: string, params: types.Object): (types.Result?, error?)
    local id, err = base.component_id()
    if not id then return nil, err end
    local deadline = ctx.get("deadline")
    return service.new().run(action, params, id, false, type(deadline) == "string" and deadline or nil)
end
function M.test_connection(_args: unknown): (types.Result?, error?)
    local result, err = run(service.config.health_action, {})
    if not result then return nil, err end
    if not result.success then return result end
    return {success = true}
end
function M.discover_resources(args: types.Object?): (types.Object?, error?)
    local params: types.Object = {}
    for key, value in pairs(service.config.discovery_params or {}) do params[key] = value end
    if args and args.cursor then
        local cursor_key = "cursor"
        params[cursor_key] = args.cursor
    end
    local action = service.config.discovery_action
    if args and args.cursor then action = "continue_list_folder"; params = {cursor = args.cursor} end
    local result, err = run(action, params)
    if not result then return nil, err end
    if not result.success then return result :: types.Object end
    local data = (result.data or {}) :: types.Object
    local rows = (data.entries or {}) :: {types.Object}
    local resources: {types.Object} = {}
    for _, row in ipairs(rows) do
        local label = row.name
        local title = row.title
        if type(label) ~= "string" and type(title) == "table" then
            local parts: {string} = {}
            for _, text in ipairs(title :: {types.Object}) do
                local content = text.plain_text
                if type(content) ~= "string" and type(text.text) == "table" then content = (text.text :: types.Object).content end
                if type(content) == "string" then parts[#parts + 1] = content end
            end
            label = table.concat(parts)
        end
        if type(label) ~= "string" or label == "" then label = tostring(row.id or "Resource") end
        resources[#resources + 1] = {type = "dropbox_" .. tostring(row[".tag"] or "file"), id = row.id, name = label}
    end
    return {success = true, resources = resources, next_cursor = result.next_cursor, has_more = result.has_more}
end
return M
