local M = {}

local REDACTED = "[redacted]"

local function normalized_key(key: any): string
    return tostring(key or ""):lower():gsub("[^a-z0-9]", "")
end

-- Keys that must never leave a tool answer. access_url carries the bridge
-- credentials in its userinfo, so it is listed by name next to the generic ones.
local function is_sensitive_key(key: any): boolean
    local name = normalized_key(key)
    if name == "" then return false end
    return name == "accessurl"
        or name == "setuptoken"
        or name:find("token", 1, true) ~= nil
        or name:find("secret", 1, true) ~= nil
        or name:find("password", 1, true) ~= nil
        or name:find("apikey", 1, true) ~= nil
        or name:find("authorization", 1, true) ~= nil
        or name:find("credential", 1, true) ~= nil
        or name:find("cookie", 1, true) ~= nil
end

local function sanitize(value: any, seen: { [any]: boolean }?): any
    if type(value) ~= "table" then return value end
    seen = seen or {}
    if seen[value] then return "[circular]" end
    seen[value] = true

    local out = {}
    for key, item in pairs(value) do
        if is_sensitive_key(key) then
            out[key] = REDACTED
        else
            out[key] = sanitize(item, seen)
        end
    end

    seen[value] = nil
    return out
end

M.sanitize = sanitize

-- Page and project a tool collection before redaction.
function M.rows(envelope: { [string]: any }, list_key: string, rows: { any }, options: any?, fields: {string}?): any
    options = options or {}
    local limit = options.limit or 25
    local offset = options.cursor == nil and 0 or tonumber(options.cursor)
    if type(limit) ~= "number" or limit < 1 or limit > 100 or limit ~= math.floor(limit) then
        return {success = false, error = "limit must be an integer between 1 and 100"}
    end
    if not offset or offset < 0 or offset ~= math.floor(offset) then
        return {success = false, error = "cursor must be a nonnegative row offset"}
    end
    local page = {}
    for index = offset + 1, math.min(#rows, offset + limit) do
        local source = rows[index]
        local row = {}
        for _, field in ipairs(options.fields or fields or {}) do
            if field == "*" then
                for key, value in pairs(source) do row[key] = value end
            else row[field] = source[field] end
        end
        page[#page + 1] = row
    end
    envelope[list_key] = page
    envelope.count = #page
    if envelope.total == nil then envelope.total = #rows end
    envelope.next_cursor = offset + #page < #rows and tostring(offset + #page) or nil
    return sanitize(envelope)
end

return M
