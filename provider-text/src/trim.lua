-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local function is_space(byte: integer): boolean
    return byte == 32 or (byte >= 9 and byte <= 13)
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end

    local first, last = 1, #value
    while first <= last and is_space(value:byte(first)) do
        first = first + 1
    end
    while last > first and is_space(value:byte(last)) do
        last = last - 1
    end
    return value:sub(first, last)
end

return { trim = trim }
