-- Dropbox's content API carries ASCII JSON arguments in a provider header.
local json = require("json")
local driver = require("driver")
local types = require("types")
local M = {}

local function header_json(value: types.Object): (string?, error?)
    local encoded, err = json.encode(value)
    if err or not encoded then
        return nil, errors.new({kind = errors.INTERNAL, message = "Cannot encode content API arguments"})
    end
    return (encoded:gsub("[\194-\244][\128-\191]*", function(sequence: string): string
        local first = string.byte(sequence, 1)
        local code = first % (2 ^ (7 - #sequence))
        for index = 2, #sequence do code = code * 64 + string.byte(sequence, index) - 128 end
        if code < 65536 then return string.format("\\u%04x", code) end
        code = code - 65536
        return string.format("\\u%04x\\u%04x", 55296 + math.floor(code / 1024), 56320 + code % 1024)
    end):gsub("\127", "\\u007f")), nil
end

function M.prepare(config: types.Config, operation: types.Operation, params: types.Object): (types.Request?, error?)
    local request, err = driver.prepare(config, operation, params)
    if not request then return nil, err end
    if operation.argument then
        local values: types.Object = {}
        for key, value in pairs(operation.defaults or {}) do values[key] = value end
        for key, value in pairs(params) do values[key] = value end
        local argument: types.Object = {}
        for _, name in ipairs(operation.argument) do argument[name] = values[name] end
        local encoded, encode_err = header_json(argument)
        if not encoded then return nil, encode_err end
        request.headers["Dropbox-API-Arg"] = encoded
        if operation.mode == "download" then
            request.body = ""
            request.headers["Content-Type"] = "application/octet-stream"
        end
    end
    return request, nil
end
return M
