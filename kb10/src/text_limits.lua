local M = {}

function M.prefix(value: string, byte_limit: integer): string
    local last = math.min(#value, byte_limit)
    local next_byte = value:byte(last + 1)
    while last > 0 and next_byte and next_byte >= 128 and next_byte < 192 do
        last = last - 1
        next_byte = value:byte(last + 1)
    end
    return value:sub(1, last)
end

return M
