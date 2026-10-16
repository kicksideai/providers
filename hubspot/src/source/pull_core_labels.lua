local config = require("config")

local M = {}

type Properties = { [string]: unknown }
type Row = { properties: Properties? }
type Connection = { component_id: unknown }
type Result = { success: boolean?, data: unknown? }
type Transport = {
    list_owners: fun(Connection, Properties?): (Result?, unknown?),
    list_pipelines: fun(Connection, string): (Result?, unknown?),
}
type Owner = {
    id: unknown,
    firstName: unknown,
    lastName: unknown,
    email: unknown,
}
type Stage = { id: unknown, label: unknown }
type Pipeline = { id: unknown, label: unknown, stages: unknown }
type OwnerLabel = { name: string?, email: string? }
type StageLabel = { name: string?, pipeline_name: string? }

local function text(value: unknown): string?
    if type(value) ~= "string" then return nil end
    local trimmed = value:gsub("^%s+", ""):gsub("%s+$", "")
    if trimmed ~= "" then return trimmed end
    return nil
end

local function results_of(result: Result?): { unknown }
    if result.success ~= true or type(result.data) ~= "table" then return {} end
    local results = (result.data :: { results: unknown }).results
    return type(results) == "table" and results :: { unknown } or {}
end

local function owner_labels(tp: Transport, conn: Connection): ({ [string]: OwnerLabel }?, unknown?)
    local out: { [string]: OwnerLabel } = {}
    local result, err = tp.list_owners(conn, { limit = 500 })
    if err then return nil, err end
    if type(result) ~= "table" or result.success ~= true then return nil, result end
    for _, value in ipairs(results_of(result)) do
        if type(value) == "table" then
            local owner = value :: Owner
            local id = owner.id ~= nil and tostring(owner.id) or ""
            if id ~= "" then
                local first = text(owner.firstName)
                local last = text(owner.lastName)
                local parts: { string } = {}
                if first then parts[#parts + 1] = first end
                if last then parts[#parts + 1] = last end
                out[id] = {
                    name = #parts > 0 and table.concat(parts, " ") or text(owner.email),
                    email = text(owner.email),
                }
            end
        end
    end
    return out, nil
end

local function pipeline_labels(tp: Transport, conn: Connection): ({ [string]: string }?, { [string]: StageLabel }?, unknown?)
    local pipelines: { [string]: string } = {}
    local stages: { [string]: StageLabel } = {}
    local result, err = tp.list_pipelines(conn, "deals")
    if err then return nil, nil, err end
    if type(result) ~= "table" or result.success ~= true then return nil, nil, result end
    for _, value in ipairs(results_of(result)) do
        if type(value) == "table" then
            local pipeline = value :: Pipeline
            local pipeline_id = pipeline.id ~= nil and tostring(pipeline.id) or ""
            local pipeline_name = text(pipeline.label)
            if pipeline_id ~= "" and pipeline_name then pipelines[pipeline_id] = pipeline_name end
            if type(pipeline.stages) == "table" then
                for _, stage_value in ipairs(pipeline.stages :: { unknown }) do
                    if type(stage_value) == "table" then
                        local stage = stage_value :: Stage
                        local stage_id = stage.id ~= nil and tostring(stage.id) or ""
                        if stage_id ~= "" then
                            stages[pipeline_id .. "\0" .. stage_id] = {
                                name = text(stage.label),
                                pipeline_name = pipeline_name,
                            }
                        end
                    end
                end
            end
        end
    end
    return pipelines, stages, nil
end

function M.enrich(tp: Transport, conn: Connection, object_type: string, source_config: unknown, rows: { Row }): ({ Row }?, unknown?)
    if not config.resolves_labels(source_config, object_type) then return rows end

    local owners, owners_err = owner_labels(tp, conn)
    if owners_err then return nil, owners_err end
    local pipelines: { [string]: string } = {}
    local stages: { [string]: StageLabel } = {}
    if object_type == "deals" then
        local resolved_pipelines, resolved_stages
        local pipeline_err
        resolved_pipelines, resolved_stages, pipeline_err = pipeline_labels(tp, conn)
        if pipeline_err then return nil, pipeline_err end
        pipelines = resolved_pipelines :: { [string]: string }
        stages = resolved_stages :: { [string]: StageLabel }
    end

    for _, row in ipairs(rows) do
        local properties = type(row.properties) == "table" and row.properties or {}
        row.properties = properties

        local owner_id = properties.hubspot_owner_id
        local owner = owner_id ~= nil and (owners :: { [string]: OwnerLabel })[tostring(owner_id)] or nil
        if owner then
            properties.owner_name = owner.name
            properties.owner_email = owner.email
        end

        if object_type == "deals" then
            local pipeline_id = properties.pipeline ~= nil and tostring(properties.pipeline) or ""
            local stage_id = properties.dealstage ~= nil and tostring(properties.dealstage) or ""
            local stage = stages[pipeline_id .. "\0" .. stage_id]
            properties.pipeline_name = stage and stage.pipeline_name or pipelines[pipeline_id]
            properties.stage_name = stage and stage.name or nil
        end
    end
    return rows, nil
end

return M
