local ctx = require("ctx")
local transport = require("transport")
local output = require("output")
local tool_result = require("tool_result")

type JsonValue = nil | boolean | number | string | { JsonValue } | { [string]: JsonValue }
type JsonObject = { [string]: JsonValue }

type Args = {
    action: string,
    object_type: string?,
    object_id: string?,
    properties: JsonObject?,
    to_object_type: string?,
    to_object_id: string?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function handler(args: Args): (unknown, error?)
    if not transport.is_writable_object_type(args.object_type) then
        return tool_result.domain_error("object_type must be one of: contacts, companies, deals, tasks; engagement objects (meetings, notes, emails, and calls) are pull-only")
    end
    if args.action == "create_association" and not transport.is_writable_object_type(args.to_object_type) then
        return tool_result.domain_error("to_object_type must be one of: contacts, companies, deals, tasks; engagement objects (meetings, notes, emails, and calls) are pull-only")
    end
    local ot = args.object_type :: string
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local action = args.action
    local result, request_err

    if action == "create_object" then
        if type(args.properties) ~= "table" then return tool_result.domain_error("properties (an object of field:value) required for create_object") end
        result, request_err = transport.create_object(conn, ot, args.properties)
    elseif action == "update_object" then
        if not args.object_id or args.object_id == "" then return tool_result.domain_error("object_id required for update_object") end
        if type(args.properties) ~= "table" then return tool_result.domain_error("properties (an object of field:value) required for update_object") end
        result, request_err = transport.update_object(conn, ot, args.object_id, args.properties)
    elseif action == "archive_object" then
        if not args.object_id or args.object_id == "" then return tool_result.domain_error("object_id required for archive_object") end
        result, request_err = transport.archive_object(conn, ot, args.object_id)
    elseif action == "create_association" then
        if not args.object_id or args.object_id == "" then return tool_result.domain_error("object_id (the from object) required for create_association") end
        if not args.to_object_id or args.to_object_id == "" then return tool_result.domain_error("to_object_id required for create_association") end
        result, request_err = transport.create_association(conn, ot, args.object_id, args.to_object_type :: string, args.to_object_id)
    elseif action == "log_activity" then
        if type(args.properties) ~= "table" then return tool_result.domain_error("properties (raw HubSpot task fields) required for log_activity") end
        result, request_err = transport.create_object(conn, "tasks", args.properties)
    else
        return tool_result.domain_error("unknown action '" .. tostring(action) ..
            "'. Use: create_object, update_object, archive_object, create_association, log_activity")
    end

    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, result) end
    if action == "archive_object" then
        return tool_result.ok(output.sanitize({ archived = true, object_type = ot, object_id = args.object_id }))
    end
    return tool_result.ok(output.sanitize(result.data))
end

return { handler = handler }
