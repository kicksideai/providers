local ctx = require("ctx")
local transport = require("transport")
local output = require("output")
local tool_result = require("tool_result")

local DEFAULT_LIMIT = 25
local MAX_LIMIT = 100

type JsonValue = nil | boolean | number | string | { JsonValue } | { [string]: JsonValue }
type Query = { [string]: string | number }
type Property = { [string]: JsonValue }
type PropertyData = { results: { Property }? }

type Args = {
    action: string,
    object_type: string?,
    object_id: string?,
    property_name: string?,
    query: string?,
    properties: { string }?,
    limit: number?,
    after: string?,
}

local SUMMARY_PROPERTIES = {
    contacts = {"firstname", "lastname", "email", "hubspot_owner_id"},
    companies = {"name", "domain", "hubspot_owner_id"},
    deals = {"dealname", "dealstage", "amount", "closedate", "hubspot_owner_id"},
    tasks = {"hs_task_subject", "hs_task_status", "hs_timestamp", "hubspot_owner_id"},
    meetings = {"hs_meeting_title", "hs_timestamp", "hs_meeting_start_time", "hs_meeting_end_time", "hubspot_owner_id"},
    notes = {"hs_timestamp", "hubspot_owner_id"},
    emails = {"hs_email_subject", "hs_timestamp", "hubspot_owner_id"},
    calls = {"hs_call_title", "hs_call_status", "hs_timestamp", "hubspot_owner_id"},
}

-- The connection pinned on the trait when present; otherwise the transport auto-selects the
-- single HubSpot connection in scope.
local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function clamp_limit(args: Args): number
    local n = tonumber(args.limit) or DEFAULT_LIMIT
    if n < 1 then n = 1 end
    if n > MAX_LIMIT then n = MAX_LIMIT end
    return math.floor(n)
end

local function props_csv(args: Args): string?
    if type(args.properties) == "table" and #(args.properties :: { string }) > 0 then
        return table.concat(args.properties :: { string }, ",")
    end
    return nil
end

local function require_type(args: Args): (string?, string?)
    if not transport.is_object_type(args.object_type) then
        return nil, "object_type must be one of: contacts, companies, deals, tasks, meetings, notes, emails, calls"
    end
    return args.object_type :: string, nil
end

local function handler(args: Args): (unknown, error?)
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local action = args.action
    local result, request_err

    if action == "list_objects" then
        local ot, terr = require_type(args)
        if not ot then return tool_result.domain_error(terr) end
        local q: Query = { limit = clamp_limit(args) }
        if args.after and args.after ~= "" then q.after = args.after end
        local p = props_csv(args)
        q.properties = p or table.concat(SUMMARY_PROPERTIES[ot], ",")
        result, request_err = transport.list_objects(conn, ot, q)
    elseif action == "get_object" then
        local ot, terr = require_type(args)
        if not ot then return tool_result.domain_error(terr) end
        if not args.object_id or args.object_id == "" then return tool_result.domain_error("object_id required for get_object") end
        local q: Query = {}
        local p = props_csv(args)
        if not p then
            local definitions, definitions_err = transport.list_properties(conn, ot)
            if not definitions then return nil, definitions_err end
            if not definitions.success then return tool_result.domain_error(definitions.error, definitions) end
            local names: {string} = {}
            for _, property in ipairs(definitions.data.results or {}) do names[#names + 1] = property.name end
            p = table.concat(names, ",")
        end
        q.properties = p
        result, request_err = transport.get_object(conn, ot, args.object_id, q)
    elseif action == "search_objects" then
        local ot, terr = require_type(args)
        if not ot then return tool_result.domain_error(terr) end
        local body: { [string]: JsonValue } = { limit = clamp_limit(args) }
        if args.query and args.query ~= "" then body.query = args.query end
        if args.after and args.after ~= "" then body.after = args.after end
        body.properties = args.properties or SUMMARY_PROPERTIES[ot]
        result, request_err = transport.search_objects(conn, ot, body)
    elseif action == "get_property" then
        local ot, terr = require_type(args)
        if not ot then return tool_result.domain_error(terr) end
        if not args.property_name or args.property_name == "" then return tool_result.domain_error("property_name required for get_property") end
        result, request_err = transport.get_property(conn, ot, args.property_name)
    elseif action == "get_pipeline" then
        local ot, terr = require_type(args)
        if not ot then return tool_result.domain_error(terr) end
        if not args.object_id or args.object_id == "" then return tool_result.domain_error("object_id required for get_pipeline") end
        result, request_err = transport.get_pipeline(conn, ot, args.object_id)
    elseif action == "get_owner" then
        if not args.object_id or args.object_id == "" then return tool_result.domain_error("object_id required for get_owner") end
        result, request_err = transport.get_owner(conn, args.object_id)
    elseif action == "list_owners" then
        local q: Query = { limit = clamp_limit(args) }
        if args.after and args.after ~= "" then q.after = args.after end
        result, request_err = transport.list_owners(conn, q)
    elseif action == "list_pipelines" then
        local ot = type(args.object_type) == "string" and args.object_type or "deals"
        if ot == "" then ot = "deals" end
        local valid, terr = require_type({ object_type = ot } :: Args)
        if not valid then return tool_result.domain_error(terr) end
        result, request_err = transport.list_pipelines(conn, valid)
    elseif action == "list_properties" then
        local ot, terr = require_type(args)
        if not ot then return tool_result.domain_error(terr) end
        result, request_err = transport.list_properties(conn, ot)
    else
        return tool_result.domain_error("unknown action '" .. tostring(action) ..
            "'. Use: list_objects, get_object, search_objects, list_owners, list_pipelines, list_properties")
    end

    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, result) end
    local data = result.data

    -- HubSpot answers every property definition at once; the tool pages them by
    -- offset (after) with compact property rows.
    if action == "list_properties" then
        local property_data = type(data) == "table" and (data :: PropertyData) or ({} :: PropertyData)
        local list = property_data.results or {}
        local out: { Property } = {}
        local offset = math.max(0, math.floor(tonumber(args.after) or 0))
        local limit = clamp_limit(args)
        local total = #list
        for index = offset + 1, math.min(total, offset + limit) do
            local property = list[index]
            out[#out + 1] = {name = property.name, label = property.label, type = property.type, fieldType = property.fieldType, groupName = property.groupName}
        end
        local next_after = offset + #out < total and tostring(offset + #out) or nil
        return tool_result.ok(output.sanitize({
            object_type = args.object_type,
            total = total,
            count = #out,
            after = tostring(offset),
            next_after = next_after,
            properties = out,
        }))
    end

    if action == "list_objects" or action == "search_objects" then
        local selected = args.properties or SUMMARY_PROPERTIES[args.object_type]
        for _, row in ipairs(data.results or {}) do
            local properties: any = {}
            for _, name in ipairs(selected) do properties[name] = (row.properties or {})[name] end
            row.properties = properties
        end
    elseif action == "list_owners" then
        local rows: {any} = {}
        for _, owner in ipairs(data.results or {}) do
            rows[#rows + 1] = {id = owner.id, firstName = owner.firstName, lastName = owner.lastName,
                email = owner.email, archived = owner.archived, createdAt = owner.createdAt, updatedAt = owner.updatedAt}
        end
        data.results = rows
    elseif action == "list_pipelines" then
        local rows: {any} = {}
        local source = data.results or {}
        local offset = math.max(0, math.floor(tonumber(args.after) or 0))
        local limit = clamp_limit(args)
        for index = offset + 1, math.min(#source, offset + limit) do
            local pipeline = source[index]
            rows[#rows + 1] = {id = pipeline.id, label = pipeline.label, displayOrder = pipeline.displayOrder,
                createdAt = pipeline.createdAt, updatedAt = pipeline.updatedAt, archived = pipeline.archived}
        end
        data.results = rows
        data.next_after = offset + #rows < #source and tostring(offset + #rows) or nil
    end
    return tool_result.ok(output.sanitize(data))
end

return { handler = handler }
