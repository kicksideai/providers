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

function M.connection(message: string): any
    return M.failure("auth_expired", message, false, "connection")
end

function M.invalid_config(message: string): any
    return M.failure("invalid_config", message, false, "flow")
end

function M.from_result(result: any, action: string): any
    local r = type(result) == "table" and result or {}
    local status = tonumber((r :: any).status_code) or 0
    local message = action .. ": " .. tostring((r :: any).error or "request failed")
    if (r :: any).error_kind == "rate_limited" or status == 429 then return capacity_http.carry(M.failure("rate_limited", message, true, "provider", tonumber((r :: any).retry_after_ms)), result) end
    if status == 401 then return capacity_http.carry(M.failure("auth_expired", message, false, "connection"), result) end
    if status == 403 then return capacity_http.carry(M.failure("permission_denied", message, false, "flow"), result) end
    if status == 404 then return capacity_http.carry(M.failure("not_found", message, false, "flow"), result) end
    if status >= 500 or status == 0 then return capacity_http.carry(M.failure("provider_unavailable", message, true, "provider"), result) end
    return capacity_http.carry(M.failure("provider_error", message, true, "provider"), result)
end

return M
