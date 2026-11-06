-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- HubSpot form-upload links -> file ids, without network or credentials.
--
-- A form file property holds one or more links separated by ";", each of the
-- shape https://<api-host>/form-integrations/v1/uploaded-files/signed-url-redirect/<id>?...
-- The <id> is the Files API v3 file id.

local M = {}

M.MAX_VALUE_BYTES = 64 * 1024

type Ref = { ref: string }
type Parsed = { refs: { Ref }, skipped: integer }

local function trim(value: string): string
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function file_id(link: string): string?
    local scheme, host, path = link:match("^(%a+)://([^/?#]+)(/[^?#]*)")
    if not scheme or not host or not path or scheme:lower() ~= "https" then return nil end
    host = host:lower()
    if host ~= "api.hubspot.com" and host ~= "api.hubapi.com"
        and not host:match("^api%-[%l]+%d+%.hubspot%.com$")
        and not host:match("^api%-[%l]+%d+%.hubapi%.com$") then return nil end
    return path:match("^/form%-integrations/v1/uploaded%-files/signed%-url%-redirect/(%d+)/?$")
end

-- parse(value) -> { refs = { {ref} }, skipped = n } in link order, without
-- duplicates; skipped counts non-empty entries that are not HubSpot form links.
function M.parse(value: unknown): (Parsed?, string?)
    if value == nil then return { refs = {}, skipped = 0 }, nil end
    if type(value) ~= "string" then return nil, "value must be a string" end
    if #value > M.MAX_VALUE_BYTES then return nil, "value is too long" end

    local refs: { Ref } = {}
    local seen: { [string]: boolean } = {}
    local skipped = 0
    for part in (value .. ";"):gmatch("([^;]*);") do
        local link = trim(part)
        if link ~= "" then
            local id = file_id(link)
            if not id then
                skipped = skipped + 1
            elseif not seen[id] then
                seen[id] = true
                refs[#refs + 1] = { ref = id }
            end
        end
    end
    return { refs = refs, skipped = skipped }, nil
end

return M
