local process = require("process")
local consts = require("consts")

local function run(input: any): (any?, error?)
    return require("connection").wake_workers(process, consts.HUB_NAME, input)
end

local function register(): (boolean?, error?)
    return process.registry.register(consts.HUB_NAME, nil, process.registry.CONSISTENT)
end

return { run = run, register = register }
