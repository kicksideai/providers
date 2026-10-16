local transport = require("transport")
local get_tool = require("get_tool")
local write_tool = require("write_tool")

-- Runs a PhantomBuster tool handler inside the caller's context against
-- canned provider responses (responses), failed answers (rejections) and
-- transport failures (failures: name -> message). calls records each
-- transport call's arguments; a typed error comes back as its kind and message.
local function run(request: any): any
    local calls: { [string]: any } = {}
    transport.connect = function(): (any, any) return { api_key = "fixture" }, nil end
    for name, data in pairs(request.responses or {}) do
        transport[name] = function(...: any): any calls[name] = { ... }; return { success = true, data = data } end
    end
    for name, rejection in pairs(request.rejections or {}) do
        transport[name] = function(): any return rejection end
    end
    for name, message in pairs(request.failures or {}) do
        transport[name] = function(): (any?, error?) return nil, errors.new({ kind = errors.UNAVAILABLE, message = message }) end
    end
    local tool = request.tool == "write" and write_tool or get_tool
    local result, err = tool.handler(request.args)
    return { result = result, error = err and { kind = err:kind(), message = err:message() } or nil, calls = calls }
end

return { run = run }
