-- The archived-object half of the HubSpot uniform pull: DELETE-op enumeration
-- of a portal's archived collection, paged by HubSpot's opaque `after` cursor.
-- The active-object half (search/incremental scan) stays in pull_core.lua.

local config_helper = require("config")
local data_error = require("data_error")
local item_builder = require("item_builder")
local rows_helper = require("pull_core_rows")

local M = {}

type Properties = { [string]: unknown }
type Cursor = {
    phase: string?, after: string?, active_hw: string?,
    active_hw_ids: { string }?, archived_hw: string?,
    tie_ts: string?, tie_last_id: string?, resume_ts: string?,
    connection_id: string?, object_type: string?,
}
type Config = {
    connection_id: string?, object_type: string?, backfill_since: string?,
}
type Connection = { component_id: unknown }
type TransportResult = { success: boolean?, data: unknown?, error: unknown?, status_code: number? }
type Transport = {
    list_objects: fun(Connection, string, Properties): (TransportResult?, unknown?),
}
type PullItem = item_builder.Item
type Coverage = { mode: string }
type PullResult = {
    success: boolean,
    items: { PullItem }?,
    next_cursor: Cursor?,
    has_more: boolean?,
    coverage: Coverage?,
    retry_after_ms: number?,
    error: data_error.DataError?,
}

function M.complete_unsupported(object_type: string, cursor: Cursor): PullResult
    local active_hw = cursor.active_hw
    local active_ids = cursor.active_hw_ids
    return {
        success = true,
        items = {},
        next_cursor = {
            phase = "live_active",
            active_hw = active_hw,
            active_hw_ids = active_ids,
            archived_hw = cursor.archived_hw,
            connection_id = cursor.connection_id,
            object_type = object_type,
        },
        has_more = false,
        coverage = { mode = "delta" },
    }
end

function M.pull(
    tp: Transport,
    conn: Connection,
    object_type: string,
    config: Config,
    cursor: Cursor,
    limit: number
): (PullResult?, config_helper.ConfigError?)
    if not config_helper.can_enumerate_archived(object_type) then
        return M.complete_unsupported(object_type, cursor)
    end
    local properties, config_err = config_helper.properties_for(config, object_type)
    if config_err then return nil, config_err end
    local query: Properties =
        { limit = limit, archived = "true", properties = table.concat(properties, ",") }
    if type(cursor.after) == "string" and cursor.after ~= "" then
        query.after = cursor.after
    end
    local res, list_err = tp.list_objects(conn, object_type, query)
    if list_err then return nil, list_err end
    if type(res) ~= "table" or not res.success then
        return data_error.from_result(res, "list archived " .. object_type)
    end
    local rows, rows_err = rows_helper.rows_from(res.data)
    if not rows then return data_error.invalid_request("invalid archived HubSpot " .. object_type .. " response: " .. tostring(rows_err)) end
    local items: { PullItem } = {}
    local origin_mode = cursor.phase == "live_archived" and "live" or "backfill"
    local watermark_property = config_helper.watermark_property_for(config, object_type)
    for _, row in ipairs(type(rows) == "table" and rows or {}) do
        local item, item_err = item_builder.from_row(row, object_type, "delete", origin_mode, watermark_property, config)
        if item_err then return nil, item_err end
        local archived_hw = cursor.archived_hw
        if
            type(archived_hw) ~= "string"
            or archived_hw == ""
            or (type(item.source_version) == "string" and item.source_version > archived_hw)
        then
            items[#items + 1] = item
        end
    end
    local after = rows_helper.next_after(res.data)
    local active_hw = cursor.active_hw
    local archived_hw = rows_helper.max_version(cursor.archived_hw, items)
    if after then
        local active_ids = cursor.active_hw_ids
        return {
            success = true,
            items = items,
            next_cursor = {
                phase = cursor.phase,
                after = after,
                active_hw = active_hw,
                active_hw_ids = active_ids,
                archived_hw = archived_hw,
                connection_id = cursor.connection_id,
                object_type = object_type,
            },
            has_more = true,
            coverage = { mode = "delta" },
        }
    end
    local active_ids = cursor.active_hw_ids
    return {
        success = true,
        items = items,
        next_cursor = {
            phase = "live_active",
            active_hw = active_hw,
            active_hw_ids = active_ids,
            archived_hw = archived_hw,
            connection_id = cursor.connection_id,
            object_type = object_type,
        },
        has_more = false,
        coverage = { mode = "delta" },
    }
end

return M
