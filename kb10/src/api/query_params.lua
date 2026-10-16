local http = require("http")

local M = {}

local function bounds_error(name: string, min_value: integer?, max_value: integer?): string
    if min_value ~= nil and max_value ~= nil then
        return name .. " must be between " .. tostring(min_value) .. " and " .. tostring(max_value)
    end
    if min_value ~= nil then return name .. " must be >= " .. tostring(min_value) end
    if max_value ~= nil then return name .. " must be <= " .. tostring(max_value) end
    return name .. " is out of range"
end

function M.query_int(req: any, key: string, default_value: integer?, min_value: integer?, max_value: integer?): (integer?, string?)
    local raw = req:query(key)
    if raw == nil or raw == "" then return default_value, nil end
    if type(raw) ~= "string" then return nil, key .. " must be an integer" end
    if not (raw :: string):match("^-?%d+$") then
        return nil, key .. " must be an integer"
    end
    local value = tonumber(raw)
    if not value or value ~= math.floor(value) then
        return nil, key .. " must be an integer"
    end
    local n = value :: integer
    if min_value ~= nil and n < min_value then return nil, bounds_error(key, min_value, max_value) end
    if max_value ~= nil and n > max_value then return nil, bounds_error(key, min_value, max_value) end
    return n, nil
end

function M.bad_request(res: any, message: string): ()
    res:set_status(http.STATUS.BAD_REQUEST)
    res:write_json({ success = false, error = message })
end

return M
