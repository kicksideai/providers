local ctx = require("ctx")
local transport = require("transport")
local output = require("output")
local operation_policy = require("operation_policy")
local tool_result = require("tool_result")

type Args = {
    action: string,
    agent_id: string?,
    argument_json: string?,
    minutes: number?,
    soft_abort: boolean?,
    cascade_to_all_slaves: boolean?,
    dont_launch_soon: boolean?,
    switch_to_manual_launch: boolean?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function control_bounds(): (any?, string?)
    local value = ctx.get("control_bounds")
    local control, err = operation_policy.validate_bounds(value)
    if not control then return nil, tostring(err) end
    return control, nil
end

local function stop_options(args: Args): { [string]: any }
    local opts: { [string]: any } = {}
    if args.soft_abort ~= nil then opts.softAbort = args.soft_abort end
    if args.cascade_to_all_slaves ~= nil then opts.cascadeToAllSlaves = args.cascade_to_all_slaves end
    if args.dont_launch_soon ~= nil then opts.dontLaunchSoon = args.dont_launch_soon end
    if args.switch_to_manual_launch ~= nil then opts.switchToManualLaunch = args.switch_to_manual_launch end
    return opts
end

local function handler(args: Args): (any?, error?)
    local control, control_err = control_bounds()
    if not control then return tool_result.domain_error(control_err) end
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local action = args.action
    local result, request_err

    if action == "launch_agent" then
        if not args.agent_id or args.agent_id == "" then return tool_result.domain_error("agent_id required") end
        result, request_err = transport.launch_agent(conn, args.agent_id, args.argument_json)
    elseif action == "launch_agent_soon" then
        if not args.agent_id or args.agent_id == "" then return tool_result.domain_error("agent_id required") end
        local minutes = tonumber(args.minutes)
        if not minutes or minutes < 0 then return tool_result.domain_error("minutes must be a non-negative number") end
        result, request_err = transport.launch_agent_soon(conn, args.agent_id, math.floor(minutes), args.argument_json)
    elseif action == "stop_agent" then
        if not args.agent_id or args.agent_id == "" then return tool_result.domain_error("agent_id required") end
        result, request_err = transport.stop_agent(conn, args.agent_id, stop_options(args))
    else
        return tool_result.domain_error("unknown action '" .. tostring(action) .. "'. Use: launch_agent, launch_agent_soon, stop_agent")
    end

    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, result) end
    return output.sanitize(result.data)
end

return { handler = handler }
