local M = {}

function M.page_size(value: any, default_value: integer, max_value: integer, name: string?): (string?, string?)
    if value == nil or value == "" then
        return tostring(default_value), nil
    end
    if type(value) ~= "number" or value ~= math.floor(value) then
        return nil, (name or "max_results") .. " must be an integer"
    end
    local n = value :: integer
    if n < 1 or n > max_value then
        return nil, (name or "max_results") .. " must be between 1 and " .. tostring(max_value)
    end
    return tostring(n), nil
end

function M.integer(value: any, default_value: integer, min_value: integer, max_value: integer, name: string): (integer?, string?)
    if value == nil or value == "" then
        return default_value, nil
    end
    if type(value) ~= "number" or value ~= math.floor(value) then
        return nil, name .. " must be an integer"
    end
    local n = value :: integer
    if n < min_value or n > max_value then
        return nil, name .. " must be between " .. tostring(min_value) .. " and " .. tostring(max_value)
    end
    return n, nil
end

return M
