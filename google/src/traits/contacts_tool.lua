local transport = require("transport")
local contacts = require("contacts")
local ctx = require("ctx")
local tool_result = require("tool_result")

type Args = {
    action: string,
    fields: string?,
    resource_name: string?,
    query: string?,
    max_results: number?,
    page_token: string?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function search_people(results: any): { any }
    local people: { any } = {}
    if type(results) ~= "table" then return people end
    for _, item in ipairs(results) do
        if type(item) == "table" and type(item.person) == "table" then
            people[#people + 1] = item.person
        end
    end
    return people
end

-- A failed Google answer is the tool's domain error carrying the failed Result:
-- Google's message, HTTP status and error body.
local function google_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

local function handler(args: Args): (any?, error?)
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local action = args.action

    if action == "list_contacts" then
        local r, r_err = contacts.list_connections(conn, args.max_results, args.page_token, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local data: any = r.data or {}
        return { success = true, contacts = data.connections or {}, next_page_token = data.nextPageToken, total_people = data.totalPeople }

    elseif action == "search_contacts" then
        local query = args.query
        if not query or query == "" then return tool_result.domain_error("query required") end
        local r, r_err = contacts.search_contacts(conn, query, args.max_results, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local data: any = r.data or {}
        return { success = true, contacts = search_people(data.results) }

    elseif action == "get_contact" then
        if not args.resource_name then return tool_result.domain_error("resource_name required") end
        local r, r_err = contacts.get_contact(conn, args.resource_name)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) .. "'. Use: list_contacts, search_contacts")
    end
end

return { handler = handler }
