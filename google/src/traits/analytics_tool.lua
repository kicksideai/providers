local transport = require("transport")
local analytics = require("analytics")
local pagination = require("pagination")
local ctx = require("ctx")
local tool_result = require("tool_result")

type Args = {
    action: string,
    fields: string?,
    property_id: string?,
    account_id: string?,
    date_start: string?,
    date_end: string?,
    metrics: any?,
    dimensions: any?,
    limit: number?,
    max_results: number?,
    page_token: string?,
    offset: number?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function trim(value: string): string
    local out = value:gsub("^%s+", "")
    out = out:gsub("%s+$", "")
    return out
end

local function string_list(value: any, defaults: { string }): { string }
    local out: { string } = {}
    if type(value) == "table" then
        for _, item in ipairs(value) do
            local text = trim(tostring(item or ""))
            if text ~= "" then out[#out + 1] = text end
        end
    elseif type(value) == "string" then
        for part in value:gmatch("[^,]+") do
            local text = trim(part)
            if text ~= "" then out[#out + 1] = text end
        end
    end
    if #out == 0 then return defaults end
    return out
end

local function named_objects(names: { string }): { any }
    local out: { any } = {}
    for _, name in ipairs(names) do out[#out + 1] = { name = name } end
    return out
end

local function normalize_property(property_id: string): string
    if property_id:sub(1, 11) == "properties/" then return property_id end
    return "properties/" .. property_id
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

    if action == "list_properties" then
        if args.account_id and args.account_id ~= "" then
            local r, r_err = analytics.list_properties(conn, args.account_id, args.max_results, args.page_token, args.fields)
            if not r then return nil, r_err end
            if not r.success then return google_error(r) end
            return { success = true, properties = r.data and r.data.properties or {}, next_page_token = r.data and r.data.nextPageToken }
        end
        local r, r_err = analytics.list_account_summaries(conn, args.max_results, args.page_token)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, accounts = r.data and r.data.accountSummaries or {}, next_page_token = r.data and r.data.nextPageToken }

    elseif action == "run_report" then
        local property_id = args.property_id
        if not property_id or property_id == "" then return tool_result.domain_error("property_id required") end
        local metric_names = string_list(args.metrics, { "activeUsers", "sessions", "screenPageViews" })
        local dimension_names = string_list(args.dimensions, { "date" })
        local limit, limit_err = pagination.integer(args.limit, 50, 1, 1000, "limit")
        if limit_err or not limit then return tool_result.domain_error(limit_err or "invalid limit") end
        local offset, offset_err = pagination.integer(args.offset, 0, 0, 2147483647, "offset")
        if offset_err or offset == nil then return tool_result.domain_error(offset_err or "invalid offset") end
        local body = {
            dateRanges = {
                {
                    startDate = args.date_start or "28daysAgo",
                    endDate = args.date_end or "yesterday",
                },
            },
            metrics = named_objects(metric_names),
            dimensions = named_objects(dimension_names),
            limit = tostring(limit),
            offset = tostring(offset),
        }
        local r, r_err = analytics.run_report(conn, property_id, body)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local data: any = r.data or {}
        local rows = data.rows or {}
        local next_offset: number? = nil
        if data.rowCount and offset + #rows < data.rowCount then next_offset = offset + #rows end
        return { success = true, property = normalize_property(property_id), dimension_headers = data.dimensionHeaders or {},
            metric_headers = data.metricHeaders or {}, rows = rows, row_count = data.rowCount,
            offset = offset, next_offset = next_offset }

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) .. "'. Use: list_properties, run_report")
    end
end

return { handler = handler }
