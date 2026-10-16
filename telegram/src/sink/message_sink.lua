local capacity_http = require("capacity_http")
local transport = require("transport")
local api = require("api")
local types = require("types")
local writable = require("writable")
local M = {}
local trim = writable.trim

local function from_result(result: any): any
    local status = tonumber(result.status_code) or 0
    local message = tostring(result.error or "Telegram request failed")
    local code, retriable, scope = "provider_error", true, "provider"
    if status == 429 then code = "rate_limited"
    elseif status == 401 then code, retriable, scope = "auth_expired", false, "connection"
    elseif status == 403 then code, retriable, scope = "permission_denied", false, "flow"
    elseif status == 404 then code, retriable, scope = "not_found", false, "flow"
    elseif status >= 500 then code = "provider_unavailable"
    elseif status >= 400 then code, retriable, scope = "invalid_request", false, "item" end
    local failure = writable.fail(message, code, retriable, scope)
    if code == "auth_expired" then failure.error.auth_expired = true end
    if code == "rate_limited" then failure.retry_after_ms = tonumber(result.retry_after_ms) or 1000 end
    return capacity_http.carry(failure, result)
end

function M.write(req: any, deps: any?): (any?, any?)
    req = type(req) == "table" and req or {}
    local origin, origin_err = writable.origin(req)
    if origin_err then return origin_err end
    if trim(req.identity_key) == "" or trim(req.idempotency_key) == "" then
        return writable.fail("identity_key and idempotency_key are required")
    end
    local config = type(req.config) == "table" and req.config or {}
    local connection_id, chat_id = trim(config.connection_id), trim(config.chat_id)
    if connection_id == "" or chat_id == "" then
        return writable.fail("config.connection_id and config.chat_id are required", "invalid_config", false, "flow")
    end
    local op = trim(req.sink_op)
    if op ~= "upsert" and op ~= "delete" then return writable.fail("unsupported sink operation: " .. op) end
    local slot = trim(req.map_slot)
    if slot == "" then slot = "default" end
    local refs = type(req.dest_refs) == "table" and req.dest_refs or {}
    local selected = type(refs[slot]) == "table" and refs[slot] or {}
    local ref = type(req.dest_ref) == "table" and req.dest_ref or selected.dest_ref
    local message_id = type(ref) == "table" and trim(ref.message_id) or ""
    if type(ref) == "table" and trim(ref.chat_id) ~= "" then chat_id = trim(ref.chat_id) end
    if (op == "delete" or ref ~= nil) and message_id == "" then
        return writable.fail("dest_ref.message_id is required")
    end
    local input = type(req.input) == "table" and req.input or {}
    if op == "upsert" and (trim(input.content) == "" or #input.content > types.MESSAGE_MAX_LENGTH) then
        return writable.fail("input.content is required and must fit the Telegram message cap")
    end
    local d = type(deps) == "table" and deps or {}
    local tp, client = d.transport or transport, d.api or api
    local conn, conn_err = tp.connect_write(connection_id)
    if conn_err or not conn then
        return writable.fail(tostring(conn_err or "connection unavailable"), "permission_denied", false, "connection")
    end
    local method = op == "delete" and "deleteMessage" or (message_id ~= "" and "editMessageText" or "sendMessage")
    local params: any = { chat_id = chat_id }
    if message_id ~= "" then params.message_id = message_id end
    if op == "upsert" then params.text = input.content end
    local response, request_err = client.request_once(conn, method, params)
    if request_err then return nil, request_err end
    if type(response) ~= "table" then return writable.fail("Telegram returned no response", "provider_error", true, "provider") end
    if not response.success then return from_result(response) end
    if op == "delete" then return { success = true, result = "deleted" } end
    local result = message_id ~= "" and "updated" or "created"
    if message_id == "" then
        local data = type(response.data) == "table" and response.data or {}
        message_id = data.message_id ~= nil and tostring(data.message_id) or ""
        if message_id == "" then return writable.fail("Telegram returned no message id", "provider_error", true, "provider") end
    end
    local reference = { chat_id = chat_id, message_id = message_id }
    return { success = true, result = result, dest_ref = reference, dest_refs = { [slot] = { dest_ref = reference } } }
end
return M
