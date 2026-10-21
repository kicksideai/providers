local driver = require("driver")
local config = require("config")
local types = require("types")
local wire = require("wire")

local function new(dependencies: types.Object?): types.Driver
    return driver.new(config.get(), dependencies, wire.prepare)
end
return {new = new, config = config.definition}
