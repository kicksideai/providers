local driver = require("driver")
local config = require("config")
local types = require("types")

local function new(dependencies: types.Object?): types.Driver
    local client = driver.new(config.get(), dependencies)
    return {run = function(action: string, params: types.Object?, selected: string?, write: boolean, deadline: string?): (types.Result?, error?)
        local result, err = client.run(action, params, selected, write, deadline)
        -- A webhook's MAC key is a receiver credential, not agent-visible data.
        -- Webhook receivers own signature verification and private key storage.
        if result and type(result.data) == "table" then
            (result.data :: types.Object).macSecretBase64 = nil
        end
        return result, err
    end}
end
return {new = new, config = config.definition}
