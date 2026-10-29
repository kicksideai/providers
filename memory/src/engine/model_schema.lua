-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local M = {}

local CONTROL_FREE = "^[^\\u0000-\\u001F]*$"

function M.codepoints(text: string): integer
    local _, count = text:gsub("[^\128-\191]", "")
    return count
end

function M.bounded_string(maximum: integer, minimum: integer?): any
    return { type = "string", maxLength = maximum, minLength = minimum, pattern = CONTROL_FREE }
end

function M.enum_string(values: { string }): any
    local maximum = 0
    for _, value in ipairs(values) do maximum = math.max(maximum, M.codepoints(value)) end
    return { type = "string", enum = values, maxLength = maximum, pattern = CONTROL_FREE }
end

function M.topic_key(maximum: integer): any
    return { type = "string", maxLength = maximum, pattern = "^[a-z][a-z0-9_]{0," .. tostring(maximum - 1) .. "}$" }
end

return M
