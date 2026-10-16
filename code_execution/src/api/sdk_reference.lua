-- SDK catalog: compact rows with limit/cursor paging. fields selects additional
-- descriptor fields; the reference panel and generator explicitly request schemas.

local http = require("http")
local security = require("security")
local surface = require("surface")

local MAX_LIMIT = 100

local function csv_ids(raw: any): any
    if type(raw) ~= "string" or raw == "" then return {} end
    local out: { string } = {}
    for id in string.gmatch(raw :: string, "([^,]+)") do
        local trimmed = id:match("^%s*(.-)%s*$")
        if trimmed ~= "" then out[#out + 1] = trimmed end
    end
    return out
end

local function query_limit(raw: any): (number?, string?)
    if raw == nil or raw == "" then return 25, nil end
    local value = tonumber(raw)
    if not value or value ~= math.floor(value) or value < 1 or value > MAX_LIMIT then
        return nil, "limit must be an integer between 1 and " .. tostring(MAX_LIMIT)
    end
    return value, nil
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local ids = req:query("ids")
    local whitelist = type(ids) == "string" and ids ~= "" and ids or req:query("tool_ids")
    local tools, terr = surface.resolve_tools(csv_ids(whitelist))
    if terr then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(terr) })
        return
    end

    local limit, limit_err = query_limit(req:query("limit"))
    if limit_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = limit_err })
        return
    end

    local cursor = req:query("cursor")
    if cursor and (not tonumber(cursor) or tonumber(cursor) < 0 or tonumber(cursor) ~= math.floor(tonumber(cursor))) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({success = false, error = "cursor must be a nonnegative tool offset"})
        return
    end
    local reference = surface.build_reference(tools, {q = req:query("q"), limit = limit, cursor = cursor,
        fields = csv_ids(req:query("fields"))})
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, count = #reference.tools, tools = reference.tools, next_cursor = reference.next_cursor })
end

return { handler = handler }
