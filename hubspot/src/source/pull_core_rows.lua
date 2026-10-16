-- HubSpot object-list response shape: row validation and paging value
-- extraction shared by the active and archived pull paths.

local M = {}

type Properties = { [string]: unknown }
type Row = {
    id: unknown, properties: Properties?, createdAt: unknown, updatedAt: unknown,
    archived: boolean?,
}
type PullItem = {
    item_key: string, dedup_key: string, op: string, source_version: string?,
    occurred_at: string?, payload: { provenance: { external_id: string } },
}

local function trim(value: unknown): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- HubSpot is an external provider. Do not let malformed success payloads turn
-- into synthetic empty pages or table-address identities.
function M.rows_from(data: unknown): ({ Row }?, string?)
    if type(data) ~= "table" then return nil, "response is missing data" end
    local results = (data :: { results: unknown }).results
    if type(results) ~= "table" then return nil, "response is missing results" end
    for _, row in ipairs(results :: { unknown }) do
        if type(row) ~= "table" then return nil, "result is not an object" end
        local candidate = row :: Row
        local id = candidate.id
        if (type(id) ~= "string" and type(id) ~= "number") or trim(tostring(id)) == "" then
            return nil, "result is missing a scalar id"
        end
        if candidate.properties ~= nil and type(candidate.properties) ~= "table" then
            return nil, "result properties are not an object"
        end
    end
    return results :: { Row }, nil
end

function M.next_after(data: unknown): string?
    local paging = type(data) == "table" and data.paging or nil
    local nextv = type(paging) == "table" and (paging :: { next: unknown }).next or nil
    local after = type(nextv) == "table" and (nextv :: { after: unknown }).after or nil
    if type(after) == "string" then
        return after
    end
    return nil
end

function M.max_version(hw: unknown, items: { PullItem }): string
    local max = type(hw) == "string" and hw or ""
    for _, item in ipairs(items) do
        local v = type(item.source_version) == "string" and item.source_version or ""
        if v > max then
            max = v
        end
    end
    return max
end

return M
