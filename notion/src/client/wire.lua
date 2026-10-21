-- Notion file uploads own their multipart envelope and part-number field.
local uuid = require("uuid")
local driver = require("driver")
local types = require("types")
local M = {}

function M.prepare(config: types.Config, operation: types.Operation, params: types.Object): (types.Request?, error?)
    if operation.mode ~= "notion_upload" then return driver.prepare(config, operation, params) end
    -- Clone the provider declaration so concurrent requests never mutate it.
    local native: types.Object = {}
    for key, value in pairs(operation) do native[key] = value end
    native.mode = "upload"
    local request, err = driver.prepare(config, native :: types.Operation, params)
    if not request then return nil, err end
    local boundary = "kickside-" .. tostring(uuid.v4())
    local prefix = ""
    local part = params.part_number or (operation.defaults and operation.defaults.part_number)
    if part then
        prefix = "--" .. boundary .. "\r\nContent-Disposition: form-data; name=\"part_number\"\r\n\r\n" .. tostring(part) .. "\r\n"
    end
    request.body = prefix .. "--" .. boundary
        .. "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"upload\"\r\nContent-Type: application/octet-stream\r\n\r\n"
        .. (request.body :: string) .. "\r\n--" .. boundary .. "--\r\n"
    request.headers["Content-Type"] = "multipart/form-data; boundary=" .. boundary
    return request, nil
end
return M
