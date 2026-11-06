-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local registry = require("registry")
local types = require("types")
local models = require("memory_models")

local M = {}

local ENGINE_ID = "kickside.memory:engine_memory"

local function descriptor(): (any?, error?)
    local entry, err = registry.get(ENGINE_ID)
    if err or type(entry) ~= "table" then
        return nil, types.internal("memory engine descriptor is unavailable: " .. tostring(err))
    end
    local meta = (entry :: any).meta
    local meta_err = M.validate_descriptor(meta)
    if meta_err then return nil, meta_err end
    return meta, nil
end

function M.defaults(): (any?, error?)
    local meta, err = descriptor()
    if err then return nil, err end
    local out = {}
    for key, value in pairs((meta :: any).default_config) do out[key] = value end
    return out, nil
end

function M.schema(): (any?, error?)
    local meta, err = descriptor()
    if err then return nil, err end
    return (meta :: any).config_schema, nil
end

local function check_value(key: string, spec: any, value: any): error?
    local expected = spec.type
    if expected == "integer" then
        if type(value) ~= "number" or math.floor(value) ~= value then
            return types.invalid("config." .. key .. " must be an integer")
        end
    elseif expected == "number" then
        if type(value) ~= "number" then return types.invalid("config." .. key .. " must be a number") end
    elseif expected == "boolean" then
        if type(value) ~= "boolean" then return types.invalid("config." .. key .. " must be a boolean") end
    elseif expected == "string" then
        if type(value) ~= "string" then return types.invalid("config." .. key .. " must be a string") end
        if spec.minLength and #value < spec.minLength then
            return types.invalid("config." .. key .. " must not be empty")
        end
    end
    if type(value) == "number" then
        if spec.minimum ~= nil and value < spec.minimum then
            return types.invalid("config." .. key .. " must be at least " .. tostring(spec.minimum))
        end
        if spec.maximum ~= nil and value > spec.maximum then
            return types.invalid("config." .. key .. " must be at most " .. tostring(spec.maximum))
        end
    end
    return nil
end

function M.validate_descriptor(meta: any): error?
    if type(meta) ~= "table" then return types.internal("memory engine descriptor metadata is required") end
    if type(meta.default_config) ~= "table" or next(meta.default_config) == nil then
        return types.internal("memory engine descriptor default_config must be a nonempty object")
    end
    local schema = meta.config_schema
    if type(schema) ~= "table" or schema.type ~= "object" or type(schema.properties) ~= "table" or next(schema.properties) == nil then
        return types.internal("memory engine descriptor config_schema requires object properties")
    end
    local supported = { string = true, number = true, integer = true, boolean = true }
    for key, spec in pairs(schema.properties) do
        if type(key) ~= "string" or type(spec) ~= "table" or not supported[spec.type] or meta.default_config[key] == nil then
            return types.internal("memory engine descriptor has an invalid property or missing default: " .. tostring(key))
        end
    end
    for key, value in pairs(meta.default_config) do
        local spec = schema.properties[key]
        if not spec or check_value(key, spec, value) then
            return types.internal("memory engine descriptor has an invalid default: " .. tostring(key))
        end
    end
    return nil
end

function M.validate(config: any): error?
    if config == nil then config = {} end
    if type(config) ~= "table" then return types.invalid("config must be an object") end
    local schema, err = M.schema()
    if err then return err end
    local properties = (schema :: any).properties
    for key, value in pairs(config) do
        local spec = properties[key]
        if type(spec) ~= "table" then return types.invalid("config." .. tostring(key) .. " is not a memory setting") end
        local value_err = check_value(tostring(key), spec, value)
        if value_err then return value_err end
    end
    local effective, effective_err = M.effective(config)
    if effective_err then return effective_err end
    local _, capacity_err = models.extraction_capacity((effective :: any).extraction_model)
    return capacity_err
end

function M.effective(stored: any): (any?, error?)
    local merged, err = M.defaults()
    if err then return nil, err end
    for key, value in pairs(stored or {}) do (merged :: any)[key] = value end
    return merged, nil
end

return M
