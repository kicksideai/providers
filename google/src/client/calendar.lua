local endpoints = require("endpoints")
-- Google Calendar domain service over the transport.

local transport = require("transport")
local google_types = require("types")
local pagination = require("pagination")

local calendar = {}

local function api(): string
    return endpoints.get("kickside.google:endpoints", "calendar")
end
local DEFAULT_EVENTS_PAGE_SIZE = 10
local MAX_EVENTS_PAGE_SIZE = 250

-- Options accepted by list_events; all optional.
type EventQuery = {
    fields: string?,
    time_min: string?,
    time_max: string?,
    max_results: number?,
    page_token: string?,
    q: string?,
    order_by: string?,
    single_events: boolean?,
    show_deleted: boolean?,
}

function calendar.list_calendars(conn: google_types.Connection, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, 20, 250, "max_results")
    if size_err then return { success = false, error = size_err } end
    local query: { [string]: any } = { maxResults = size, fields = "nextPageToken,items(" .. (fields or "id,summary,timeZone,primary,accessRole") .. ")" }
    if page_token then query.pageToken = page_token end
    return transport.get(conn, api() .. "/users/me/calendarList", query)
end

function calendar.get_calendar(conn: google_types.Connection, calendar_id: string?): (google_types.Result?, error?)
    return transport.get(conn, api() .. "/calendars/" .. (calendar_id or "primary"))
end

function calendar.list_events(conn: google_types.Connection, calendar_id: string?, opts: EventQuery?): (google_types.Result?, error?)
    local id = calendar_id or "primary"
    local o: EventQuery = opts or {}
    local size, size_err = pagination.page_size(o.max_results, DEFAULT_EVENTS_PAGE_SIZE, MAX_EVENTS_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local query: { [string]: any } = {}
    if o.time_min then query.timeMin = o.time_min end
    if o.time_max then query.timeMax = o.time_max end
    query.fields = "nextPageToken,items(" .. (o.fields or "id,summary,status,start,end,organizer,updated,htmlLink") .. ")"
    query.maxResults = size
    if o.page_token then query.pageToken = o.page_token end
    if o.q then query.q = o.q end
    if o.order_by then query.orderBy = o.order_by end
    if o.single_events ~= nil then query.singleEvents = tostring(o.single_events) end
    if o.show_deleted then query.showDeleted = "true" end
    return transport.get(conn, api() .. "/calendars/" .. id .. "/events", query)
end

function calendar.get_event(conn: google_types.Connection, calendar_id: string?, event_id: string): (google_types.Result?, error?)
    return transport.get(conn, api() .. "/calendars/" .. (calendar_id or "primary") .. "/events/" .. event_id)
end

function calendar.create_event(conn: google_types.Connection, calendar_id: string?, event_data: any): (google_types.Result?, error?)
    return transport.post(conn, api() .. "/calendars/" .. (calendar_id or "primary") .. "/events", event_data)
end

function calendar.update_event(conn: google_types.Connection, calendar_id: string?, event_id: string, event_data: any): (google_types.Result?, error?)
    return transport.put(conn, api() .. "/calendars/" .. (calendar_id or "primary") .. "/events/" .. event_id, event_data)
end

function calendar.delete_event(conn: google_types.Connection, calendar_id: string?, event_id: string): (google_types.Result?, error?)
    return transport.delete(conn, api() .. "/calendars/" .. (calendar_id or "primary") .. "/events/" .. event_id)
end

return calendar
