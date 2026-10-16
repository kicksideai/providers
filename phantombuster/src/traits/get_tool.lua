local ctx = require("ctx")
local transport = require("transport")
local output = require("output")
local operation_policy = require("operation_policy")
local tool_result = require("tool_result")

type Args = {
    action: string,
    agent_id: string?,
    container_id: string?,
    mode: string?,
    limit: number?,
    from_output_pos: number?,
    prev_container_id: string?,
    prev_status: string?,
    prev_runtime_event_index: number?,
    offset: number?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then
        return configured
    end
    return nil
end

local function control_bounds(): (any?, string?)
    local value = ctx.get("control_bounds")
    local control, err = operation_policy.validate_bounds(value)
    if not control then return nil, tostring(err) end
    return control, nil
end

local function list_limit(args: Args, control: any): (number?, string?)
    if args.limit == nil then return nil, "limit is required for list actions" end
    local n = tonumber(args.limit)
    if not n or n ~= math.floor(n) then return nil, "limit must be an integer" end
    local bounds = control.tool.list_limit :: any
    if n < bounds.minimum or n > bounds.maximum then
        return nil, "limit must be an integer between " .. tostring(bounds.minimum) .. " and " .. tostring(bounds.maximum)
    end
    return math.floor(n), nil
end

local function is_list_action(action: string): boolean
    return action == "list_agents"
        or action == "list_deleted_agents"
        or action == "list_containers"
        or action == "list_running_containers"
end

local function array_of(data: any, field: string?): any
    if type(data) ~= "table" then
        return data
    end
    if field and type(data[field]) == "table" then
        return data[field]
    end
    return data
end

-- PhantomBuster answers a whole list at once; the tool pages it by offset so each
-- page holds summary records.
local function list_page(data: any, field: string?, output_key: string, limit: number, requested_offset: number?): any
    local list = array_of(data, field)
    local out: { any } = {}
    local count = 0
    local offset = math.max(0, math.floor(tonumber(requested_offset) or 0))
    if type(list) == "table" then
        for _, item in ipairs(list) do
            count = count + 1
            if count > offset and #out < limit then
                out[#out + 1] = {id = item.id, name = item.name, agentId = item.agentId, script = item.script,
                    status = item.status, launchType = item.launchType, createdAt = item.createdAt,
                    updatedAt = item.updatedAt, startedAt = item.startedAt, endedAt = item.endedAt, exitCode = item.exitCode}
            end
        end
    end
    local result: any = {
        count = count,
        limit = limit,
        offset = offset,
        next_offset = offset + #out < count and offset + #out or nil,
    }
    result[output_key] = out
    return result
end

local function agent_output_query(args: Args): { [string]: any }
    local query: { [string]: any } = {}
    if args.from_output_pos ~= nil then
        query.fromOutputPos = args.from_output_pos
    end
    if args.prev_container_id and args.prev_container_id ~= "" then
        query.prevContainerId = args.prev_container_id
    end
    if args.prev_status and args.prev_status ~= "" then
        query.prevStatus = args.prev_status
    end
    if args.prev_runtime_event_index ~= nil then
        query.prevRuntimeEventIndex = args.prev_runtime_event_index
    end
    return query
end

-- A container read asks PhantomBuster for every part of the container: its
-- result object, output, runtime events and neighbouring container ids.
local CONTAINER_QUERY = {
    withResultObject = "true",
    withOutput = "true",
    withRuntimeEvents = "true",
    withNewerAndOlderContainerId = "true",
}

local function handler(args: Args): (any?, error?)
    local control, control_err = control_bounds()
    if not control then return tool_result.domain_error(control_err) end
    local action = args.action
    local requested_limit
    if is_list_action(action) then
        local limit_err
        requested_limit, limit_err = list_limit(args, control)
        if not requested_limit then return tool_result.domain_error(limit_err) end
    end
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local result, request_err

    if action == "get_org" then
        result, request_err = transport.get_org(conn)
    elseif action == "get_org_resources" then
        result, request_err = transport.get_org_resources(conn)
    elseif action == "list_running_containers" then
        result, request_err = transport.list_running_containers(conn)
    elseif action == "list_agents" then
        result, request_err = transport.list_agents(conn)
    elseif action == "get_agent" then
        if not args.agent_id or args.agent_id == "" then
            return tool_result.domain_error("agent_id required")
        end
        result, request_err = transport.get_agent(conn, args.agent_id)
    elseif action == "list_deleted_agents" then
        result, request_err = transport.list_deleted_agents(conn)
    elseif action == "get_agent_output" then
        if not args.agent_id or args.agent_id == "" then
            return tool_result.domain_error("agent_id required")
        end
        result, request_err = transport.get_agent_output(conn, args.agent_id, agent_output_query(args))
    elseif action == "list_containers" then
        if not args.agent_id or args.agent_id == "" then
            return tool_result.domain_error("agent_id required")
        end
        result, request_err = transport.list_containers(conn, args.agent_id)
    elseif action == "get_container" then
        if not args.container_id or args.container_id == "" then
            return tool_result.domain_error("container_id required")
        end
        result, request_err = transport.get_container(conn, args.container_id, CONTAINER_QUERY)
    elseif action == "get_container_output" then
        if not args.container_id or args.container_id == "" then
            return tool_result.domain_error("container_id required")
        end
        if args.mode and args.mode ~= "" and args.mode ~= "json" and args.mode ~= "raw" then
            return tool_result.domain_error("mode must be json or raw")
        end
        result, request_err = transport.get_container_output(conn, args.container_id, args.mode)
    elseif action == "get_result" then
        if not args.container_id or args.container_id == "" then
            return tool_result.domain_error("container_id required")
        end
        result, request_err = transport.get_result_object(conn, args.container_id)
    else
        return tool_result.domain_error("unknown action '"
            .. tostring(action)
            .. "'. Use: get_org, get_org_resources, list_running_containers, list_agents, get_agent, list_deleted_agents, get_agent_output, list_containers, get_container, get_container_output, get_result")
    end

    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, result) end
    if action == "list_agents" then
        return output.sanitize(list_page(result.data, "agents", "agents", requested_limit :: number, args.offset))
    end
    if action == "list_deleted_agents" then
        return output.sanitize(list_page(result.data, nil, "agents", requested_limit :: number, args.offset))
    end
    if action == "list_containers" or action == "list_running_containers" then
        return output.sanitize(list_page(result.data, "containers", "containers", requested_limit :: number, args.offset))
    end
    return output.sanitize(result.data)
end

return { handler = handler }
