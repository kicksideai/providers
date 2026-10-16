local config = require("config")

local M = {}

type Properties = { [string]: unknown }
type Row = { id: unknown, properties: Properties? }
type Config = { connection_id: string? }
type Result = { success: boolean?, data: unknown?, error: unknown? }
type Connection = { component_id: unknown }
type Transport = {
    list_properties: fun(Connection, string): (Result?, unknown?),
    batch_read_objects: fun(Connection, string, { string }, { string }): (Result?, unknown?),
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return value:gsub("^%s+", ""):gsub("%s+$", "")
end

local function slice(values: { string }, first: number, last: number): { string }
    local out: { string } = {}
    for index = first, math.min(last, #values) do out[#out + 1] = values[index] end
    return out
end

function M.hydrate(tp: Transport, conn: Connection, object_type: string, source_config: Config, rows: { Row })
    local mirror, config_err = config.mirrors_all_properties(source_config, object_type)
    if config_err then return nil, config_err end
    if not mirror then return rows, nil end
    if type(tp.list_properties) ~= "function" or type(tp.batch_read_objects) ~= "function" then
        return nil, { success=false, error="HubSpot full-property mirror requires property discovery and batch read support" }
    end

    local schema, schema_err = tp.list_properties(conn, object_type)
    if schema_err then return nil, schema_err end
    if type(schema) ~= "table" or schema.success ~= true then return nil, schema end
    local schema_data = type(schema.data) == "table" and schema.data :: { results: unknown } or {}
    local definitions = type(schema_data.results) == "table" and schema_data.results :: { Properties } or {}
    local property_names: { string } = {}
    for _, definition in ipairs(definitions) do
        local name = trim(definition.name)
        if name ~= "" then property_names[#property_names + 1] = name end
    end
    table.sort(property_names)

    local by_id: { [string]: Row } = {}
    local ids: { string } = {}
    for _, row in ipairs(rows) do
        local id = trim(row.id)
        if id ~= "" then by_id[id], ids[#ids + 1] = row, id end
    end
    if #ids == 0 or #property_names == 0 then return rows, nil end

    for id_start = 1, #ids, 100 do
        local id_chunk = slice(ids, id_start, id_start + 99)
        for property_start = 1, #property_names, 100 do
            local property_chunk = slice(property_names, property_start, property_start + 99)
            local batch, batch_err = tp.batch_read_objects(conn, object_type, id_chunk, property_chunk)
            if batch_err then return nil, batch_err end
            if type(batch) ~= "table" or batch.success ~= true then return nil, batch end
            local batch_data = type(batch.data) == "table" and batch.data :: { results: unknown } or {}
            local results = type(batch_data.results) == "table" and batch_data.results :: { Row } or {}
            for _, result in ipairs(results) do
                local target = by_id[trim(result.id)]
                if target then
                    target.properties = type(target.properties) == "table" and target.properties or {}
                    for key, value in pairs(type(result.properties) == "table" and result.properties or {}) do
                        target.properties[key] = value
                    end
                end
            end
        end
    end
    return rows, nil
end

return M
