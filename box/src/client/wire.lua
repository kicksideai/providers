-- Box owns its upload envelopes, range headers, and SHA-1 commit protocol.
local uuid = require("uuid")
local json = require("json")
local hash = require("hash")
local base64 = require("base64")
local driver = require("driver")
local types = require("types")
local M = {}

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, message = message})
end

function M.prepare(config: types.Config, operation: types.Operation, params: types.Object): (types.Request?, error?)
    local mode = operation.mode
    if mode ~= "box_part" and mode ~= "box_commit" and mode ~= "multipart" then
        return driver.prepare(config, operation, params)
    end
    -- Clone the provider declaration so concurrent requests never mutate it.
    local native: types.Object = {}
    for key, value in pairs(operation) do native[key] = value end
    native.mode = mode ~= "box_commit" and "upload" or nil
    local request, err = driver.prepare(config, native :: types.Operation, params)
    if not request then return nil, err end
    local values: types.Object = {}
    for key, value in pairs(operation.defaults or {}) do values[key] = value end
    for key, value in pairs(params) do values[key] = value end
    if mode == "box_part" then
        local content = request.body :: string
        local offset, total = tonumber(values.offset) or 0, tonumber(values.total_size) or 0
        if #content == 0 or offset + #content > total then return nil, invalid("Upload part range is outside the file") end
        request.headers["Content-Range"] = "bytes " .. tostring(offset) .. "-" .. tostring(offset + #content - 1) .. "/" .. tostring(total)
        local digest, digest_err = hash.sha1(content, true)
        if digest_err or not digest then return nil, errors.new({kind = errors.INTERNAL, message = "Cannot calculate upload digest"}) end
        request.headers.Digest = "sha=" .. base64.encode(digest)
    elseif mode == "box_commit" then
        local digest = values.sha1_base64
        if type(digest) ~= "string" then return nil, invalid("Whole-file SHA-1 digest is required") end
        local decoded, digest_err = base64.decode(digest)
        if digest_err or not decoded or #decoded ~= 20 then return nil, invalid("Invalid whole-file SHA-1 digest") end
        request.headers.Digest = "sha=" .. base64.encode(decoded)
    else
        local boundary = "kickside-" .. tostring(uuid.v4())
        local attributes: types.Object = {}
        if values.name ~= nil then attributes = {name = values.name, parent = {id = values.parent_id}} end
        local encoded, encode_err = json.encode(attributes)
        if encode_err or not encoded then return nil, errors.new({kind = errors.INTERNAL, message = "Cannot encode upload attributes"}) end
        request.body = "--" .. boundary .. "\r\nContent-Disposition: form-data; name=\"attributes\"\r\nContent-Type: application/json\r\n\r\n"
            .. encoded .. "\r\n--" .. boundary
            .. "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"upload\"\r\nContent-Type: application/octet-stream\r\n\r\n"
            .. (request.body :: string) .. "\r\n--" .. boundary .. "--\r\n"
        request.headers["Content-Type"] = "multipart/form-data; boundary=" .. boundary
    end
    return request, nil
end
return M
