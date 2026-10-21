local ctx = require("ctx")
local service = require("service")
local types = require("types")
local tool_result = require("tool_result")
type Args = {action: string, params: types.Object}
local function handler(args: Args): (unknown, error?)
    if type(args) ~= "table" or type(args.action) ~= "string" then return tool_result.domain_error("action is required") end
    if type(args.params) ~= "table" then return tool_result.domain_error("params object is required") end
    for key in pairs(args) do
        if key ~= "action" and key ~= "params" then return tool_result.domain_error("Unexpected argument: " .. tostring(key)) end
    end
    local selected, deadline = ctx.get("connection_id"), ctx.get("deadline")
    local result, err = service.new().run(args.action, args.params,
        type(selected) == "string" and selected or nil, true, type(deadline) == "string" and deadline or nil)
    if not result then
        if errors.is(err, errors.INVALID) then return tool_result.domain_error(tostring(err)) end
        return nil, err
    end
    if not result.success then return tool_result.domain_error(result.error, result) end
    return tool_result.ok(result)
end
return {handler = handler}
