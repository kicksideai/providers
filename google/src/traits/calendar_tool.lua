local transport = require("transport")
local calendar = require("calendar")
local time = require("time")
local ctx = require("ctx")
local tool_result = require("tool_result")

type Args = {
    action: string,
    fields: string?,
    calendar_id: string?,
    event_id: string?,
    time_min: string?,
    time_max: string?,
    query: string?,
    max_results: number?,
    summary: string?,
    description: string?,
    location: string?,
    start_time: string?,
    end_time: string?,
    start_date: string?,
    end_date: string?,
    attendees: { string }?,
    page_token: string?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function build_event(args: Args): any
    local body: { [string]: any } = {}
    if args.summary then body.summary = args.summary end
    if args.description then body.description = args.description end
    if args.location then body.location = args.location end
    if args.start_time then body.start = { dateTime = args.start_time }
    elseif args.start_date then body.start = { date = args.start_date } end
    if args.end_time then body["end"] = { dateTime = args.end_time }
    elseif args.end_date then body["end"] = { date = args.end_date } end
    if args.attendees and #args.attendees > 0 then
        local list: { any } = {}
        for _, email in ipairs(args.attendees) do list[#list + 1] = { email = email } end
        body.attendees = list
    end
    return body
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
    local calendar_id = args.calendar_id

    if action == "list_calendars" then
        local r, r_err = calendar.list_calendars(conn, args.max_results, args.page_token, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, calendars = r.data and r.data.items or {}, next_page_token = r.data and r.data.nextPageToken }

    elseif action == "list_events" then
        local time_min = args.time_min
        if not time_min or time_min == "" then time_min = time.now():format(time.RFC3339NANO) end
        local r, r_err = calendar.list_events(conn, calendar_id, {
            fields = args.fields,
            time_min = time_min,
            time_max = args.time_max,
            max_results = args.max_results or 10,
            page_token = args.page_token,
            q = args.query,
            order_by = "startTime",
            single_events = true,
        })
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, events = r.data and r.data.items or {}, next_page_token = r.data and r.data.nextPageToken }

    elseif action == "get_event" then
        local event_id = args.event_id
        if not event_id then return tool_result.domain_error("event_id required") end
        local r, r_err = calendar.get_event(conn, calendar_id, event_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "create_event" then
        if not args.summary then return tool_result.domain_error("summary required") end
        if not (args.start_time or args.start_date) then return tool_result.domain_error("start_time or start_date required") end
        if not (args.end_time or args.end_date) then return tool_result.domain_error("end_time or end_date required") end
        local r, r_err = calendar.create_event(conn, calendar_id, build_event(args))
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "update_event" then
        local event_id = args.event_id
        if not event_id then return tool_result.domain_error("event_id required") end
        local r, r_err = calendar.update_event(conn, calendar_id, event_id, build_event(args))
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "delete_event" then
        local event_id = args.event_id
        if not event_id then return tool_result.domain_error("event_id required") end
        local r, r_err = calendar.delete_event(conn, calendar_id, event_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, id = event_id, deleted = true }

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) .. "'")
    end
end

return { handler = handler }
