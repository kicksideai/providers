local M = {}

local REDACTED = "[redacted]"

-- Used by the Fireflies source's explicit transcript-content limit.
function M.safe_prefix(text: string, max_bytes: number): string
    local limit = math.floor(max_bytes)
    if #text <= limit then return text end
    local finish = math.max(0, limit)
    -- finish is exclusive in zero-based byte offsets; a continuation byte at
    -- finish + 1 means the limit lands inside a code point.
    while finish > 0 do
        local next_byte = string.byte(text, finish + 1)
        if next_byte == nil or next_byte < 128 or next_byte >= 192 then break end
        finish = finish - 1
    end
    if finish == 0 and #text > 0 then
        finish = 1
        while finish < #text do
            local next_byte = string.byte(text, finish + 1)
            if next_byte == nil or next_byte < 128 or next_byte >= 192 then break end
            finish = finish + 1
        end
    end
    return text:sub(1, finish)
end

local function normalized_key(key: any): string
    return tostring(key or ""):lower():gsub("[^a-z0-9]", "")
end

local function is_sensitive_key(key: any): boolean
    local name = normalized_key(key)
    if name == "" then return false end
    return name:find("token", 1, true) ~= nil
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

return M
