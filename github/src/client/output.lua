local M = {}

local REDACTED = "[redacted]"

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
