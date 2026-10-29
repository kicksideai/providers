-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local M = {}

M.JSON_FORMAT = "\n\nReturn one compact JSON object on one line, with no whitespace outside strings, reasoning or extra text."

function M.with_policy(prompt: string, instructions: string?): string
    if instructions and instructions ~= "" then return prompt .. "\n\nMemory policy:\n" .. instructions end
    return prompt
end

return M
