local capacity_http = require("capacity_http")
-- Google Calendar pull capability. It only authenticates and lists a bounded
-- connection window; compositions decide whether an event warrants action.

local ctx = require("ctx")
local time = require("time")
local calendar = require("calendar")
local transport = require("transport")

local M = {}

local DEFAULT_LOOKAHEAD_HOURS = 24
local DEFAULT_LIMIT = 100
local MAX_LIMIT = 250

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function positive_number(value: any, fallback: number): number
    local parsed = tonumber(value)
    if parsed == nil or parsed <= 0 then return fallback end
    return parsed
end

local function rfc3339(epoch: number): string
    return time.unix(epoch, 0):utc():format(time.RFC3339)
end

local function now_epoch(deps: any): number
    if type(deps) == "table" then
        if type((deps :: any).now) == "function" then return tonumber((deps :: any).now()) or time.now():unix() end
        if type((deps :: any).now) == "number" then return tonumber((deps :: any).now) or time.now():unix() end
    end
    return time.now():unix()
end

local function connection_id(config: any, deps: any): string
    local configured = type(config) == "table" and (config :: any).connection or nil
    if type(configured) == "table" then configured = (configured :: any).component_id or (configured :: any).id end
    local id = trim(type(deps) == "table" and (deps :: any).component_id or nil)
    if id == "" then id = trim(configured) end
    if id == "" then id = trim(ctx.get("component_id")) end
    return id
end

local function error(code: string, message: string, scope: string): any
    return { success = false, error = { code = code, message = message, retriable = scope ~= "flow", scope = scope } }
end

local function raw_item(event: any, attendee: any): any?
    local event_id = trim((event :: any).id)
    local email = string.lower(trim(type(attendee) == "table" and (attendee :: any).email or nil))
    local start = type((event :: any).start) == "table" and (event :: any).start or {}
    local starts_at = trim((start :: any).dateTime)
    if event_id == "" or email == "" or starts_at == "" then return nil end
    local key = "google:calendar:" .. event_id .. ":" .. email
    return {
        item_key = key,
        dedup_key = key,
        op = "upsert",
        occurred_at = starts_at,
        payload = {
            event_id = event_id,
            title = trim((event :: any).summary),
            starts_at = starts_at,
            attendee = attendee,
            calendar_url = trim((event :: any).htmlLink),
            source = "google_calendar",
        },
    }
end

function M.pull(req: any, _opts: any?, deps: any?): (any?, error?)
    req = type(req) == "table" and req or {}
    deps = type(deps) == "table" and deps or {}
    local config = type(req.config) == "table" and req.config or {}
    local tp: any = (deps :: any).transport or { connect = transport.connect, list_events = calendar.list_events }
    local id = connection_id(config, deps)
    if id == "" then return error("invalid_config", "config.connection is required", "flow") end

    local conn, cerr = tp.connect(id)
    if cerr then return nil, cerr end
    if not conn then return error("auth_expired", "no Google connection", "connection") end

    local limit = math.floor(tonumber(req.limit) or DEFAULT_LIMIT)
    if limit < 1 then limit = 1 end
    if limit > MAX_LIMIT then limit = MAX_LIMIT end
    local cursor = type(req.cursor) == "table" and req.cursor or {}
    local page_token = trim((cursor :: any).page_token)
    local now = now_epoch(deps)
    local lookahead_hours = positive_number((config :: any).lookahead_hours, DEFAULT_LOOKAHEAD_HOURS)
    local res, request_err = tp.list_events(conn, "primary", {
        fields = "*",
        time_min = rfc3339(now),
        time_max = rfc3339(now + math.floor(lookahead_hours * 3600)),
        max_results = limit,
        page_token = page_token ~= "" and page_token or nil,
        order_by = "startTime",
        single_events = true,
    })
    if request_err then return nil, request_err end
    if type(res) ~= "table" or res.success ~= true then
        return capacity_http.carry(error("provider_error", tostring(type(res) == "table" and res.error or "list Google Calendar events failed"), "provider"), res)
    end

    local data = type((res :: any).data) == "table" and (res :: any).data or {}
    local items: { any } = {}
    for _, event in ipairs(type((data :: any).items) == "table" and (data :: any).items or {}) do
        if (event :: any).status ~= "cancelled" then
            for _, attendee in ipairs(type((event :: any).attendees) == "table" and (event :: any).attendees or {}) do
                local item = raw_item(event, attendee)
                if item then items[#items + 1] = item end
            end
        end
    end
    local next_page_token = trim(type((data :: any).nextPageToken) == "string" and (data :: any).nextPageToken or nil)
    return {
        success = true,
        items = items,
        next_cursor = { page_token = next_page_token ~= "" and next_page_token or nil },
        has_more = next_page_token ~= "",
        retry_after_ms = next_page_token ~= "" and 1000 or nil,
    }
end

function M.pull_keys(req: any, opts: any?, deps: any?): (any?, error?)
    local page, pull_err = M.pull(req, opts, deps)
    if pull_err then return nil, pull_err end
    if page.success ~= true then return page end
    local keys: { any } = {}
    for _, item in ipairs(page.items or {}) do keys[#keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key } end
    page.items = nil
    page.keys = keys
    return page
end

return M
