-- Memory engine configuration. The engine descriptor's default_config and
-- config_schema are the single declaration; this library merges stored values
-- over the defaults and validates every write against the schema.

local registry = require("registry")
local types = require("types")

local M = {}

M.ENGINE_ID = "kickside.memory:engine_memory"

local function descriptor(): (any?, error?)
    local entry, err = registry.get(M.ENGINE_ID)
    if err or type(entry) ~= "table" then
        return nil, types.internal("memory engine descriptor is unavailable: " .. tostring(err))
    end
    return (entry :: any).meta or {}, nil
end

function M.defaults(): (any?, error?)
    local meta, err = descriptor()
    if err then return nil, err end
    local out = {}
    for key, value in pairs((meta :: any).default_config or {}) do out[key] = value end
    return out, nil
end

function M.schema(): (any?, error?)
    local meta, err = descriptor()
    if err then return nil, err end
    return (meta :: any).config_schema or {}, nil
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
    if type(spec.enum) == "table" then
        local allowed = false
        for _, option in ipairs(spec.enum) do
            if option == value then allowed = true end
        end
        if not allowed then return types.invalid("config." .. key .. " is not an allowed value") end
    end
    return nil
end

-- Validates `config` against the engine schema. Unknown keys are refused, so
-- a typo cannot silently fall back to a default.
function M.validate(config: any): error?
    if config == nil then return nil end
    if type(config) ~= "table" then return types.invalid("config must be an object") end
    local schema, err = M.schema()
    if err then return err end
    local properties = (schema :: any).properties or {}
    for key, value in pairs(config) do
        local spec = properties[key]
        if type(spec) ~= "table" then return types.invalid("config." .. tostring(key) .. " is not a memory setting") end
        local value_err = check_value(tostring(key), spec, value)
        if value_err then return value_err end
    end
    return nil
end

-- Effective configuration: stored values over engine defaults.
function M.effective(stored: any): (any?, error?)
    local merged, err = M.defaults()
    if err then return nil, err end
    for key, value in pairs(type(stored) == "table" and stored or {}) do (merged :: any)[key] = value end
    return merged, nil
end

return M
