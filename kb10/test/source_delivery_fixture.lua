-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local kc = require("kc")
local M = {CONTENT = {JSON = "application/json"}, STATUS = {
    OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401, NOT_FOUND = 404, INTERNAL_ERROR = 500}, ACCESS = {READ = 1}}
function M.reset(access_error, delivery_error, metadata)
    M.access_error, M.delivery_error, M.metadata = access_error, delivery_error, metadata
    M.status, M.body, M.calls, M.upload_id, M.expiration = nil, nil, 0, nil, nil
end
function M.actor() return {} end
function M.request() return {param = function(_, key) return key == "id" and "knowledge" or "document" end} end
function M.response() return {set_content_type = function() end,
    set_status = function(_, value) M.status = value end,
    write_json = function(_, value) M.body = value end} end
function M.validate_access() return nil, M.access_error end
function M.get_service() return {get = function() return {success = true} end} end
function M:get_store(_params) return {id = "store"} end
function M:get_node(_params) return {node_type = kc.NODE_TYPE.DOCUMENT,
    metadata = M.metadata or {upload_id = "original", original_filename = "document.pdf", original_mime_type = "application/pdf"}} end
function M.delivery_url(id, options)
    M.upload_id, M.expiration = id, options.expires_in
    assert(options.audience == "kb.source")
    M.calls = M.calls + 1
    if M.delivery_error then return nil, M.delivery_error end
    return "https://objects.example/original.pdf?signature=test", nil
end
return M
