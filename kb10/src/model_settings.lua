local engines = require("engines")

local M = {}

function M.resolve(config: any, engine: any, key: string, overrides: any?): (string?, any?)
    local value: any = nil
    if type(overrides) == "table" then value = overrides[key] end
    if value == nil and type(config) == "table" then value = config[key] end
    if value == nil or value == "" then
        if type(engine) ~= "table" then
            local descriptor, err = engines.resolve(engine or "document")
            if err then return nil, err end
            engine = descriptor
        end
        local defaults = engine.default_config
        value = type(defaults) == "table" and defaults[key] or nil
    end
    if type(value) == "string" and value:find("%S") then return value, nil end
    return nil, nil
end

return M
