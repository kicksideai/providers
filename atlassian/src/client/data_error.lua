local capacity_http = require("capacity_http")
local M = {}

type Envelope = {
    success: boolean,
    error: any,
    retry_after_ms: number?,
}

function M.failure(code: string, message: string, retriable: boolean, scope: string, retry_after_ms: number?): Envelope
    local out: Envelope = {
        success = false,
        error = { code = code, message = tostring(message), retriable = retriable, scope = scope },
    }
    if code == "auth_expired" then out.error.auth_expired = true end
    if retry_after_ms ~= nil then out.retry_after_ms = retry_after_ms end
    return out
end

function M.connection(message: string): Envelope
    return M.failure("auth_expired", message, false, "connection")
end

function M.invalid_config(message: string): Envelope
    return M.failure("invalid_config", message, false, "flow")
end

function M.invalid_request(message: string): Envelope
    return M.failure("invalid_request", message, false, "item")
end

function M.from_result(res: any, context: string): Envelope
    local r = type(res) == "table" and res or {}
    local status = tonumber((r :: any).status_code) or 0
    local message = context .. ": " .. tostring((r :: any).error or "request failed")
    if status == 429 then return capacity_http.carry(M.failure("rate_limited", message, true, "provider", tonumber((r :: any).retry_after_ms) or 1000), res) end
    if status == 401 then return capacity_http.carry(M.failure("auth_expired", message, false, "connection"), res) end
    if status == 403 then return capacity_http.carry(M.failure("permission_denied", message, false, "flow"), res) end
    if status == 404 then return capacity_http.carry(M.failure("not_found", message, false, "flow"), res) end
    if status == 409 then return capacity_http.carry(M.failure("conflict", message, false, "item"), res) end
    if status >= 500 or status == 0 then return capacity_http.carry(M.failure("provider_unavailable", message, true, "provider"), res) end
    return capacity_http.carry(M.failure("provider_error", message, true, "provider"), res)
end

return M
