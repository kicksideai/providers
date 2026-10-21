local driver = require("driver")
local config = require("config")
local types = require("types")

local function new(dependencies: types.Object?): types.Driver
    return driver.new(config.get(), dependencies)
end
return {new = new, config = config.definition}
