local capacity_http = require("capacity_http")
-- Maps a Discord client Result onto the kickside.data DataError envelope shared
-- by the pullable source and the writable sink. The envelope shape is normative:
-- { success = false, error = { code, message, retriable, scope, auth_expired? },
--   retry_after_ms? } -- retry_after_ms rides the top level only, where the sync
-- engine reads it to reschedule past a provider rate-limit wait.

local M = {}

type DataError = {
    kind: string?,
    retryable: boolean?,
    details: any?,
    code: string,
    message: string,
    retriable: boolean,
    scope: string,
    auth_expired: boolean?,
}

type Envelope = {
    success: boolean,
    error: DataError,
    retry_after_ms: number?,
}

function M.failure(code: string, message: string, retriable: boolean, scope: string, retry_after_ms: number?): Envelope
    local envelope: Envelope = {
        success = false,
        error = { code = code, message = tostring(message), retriable = retriable, scope = scope },
    }
    if code == "auth_expired" then envelope.error.auth_expired = true end
    if retry_after_ms ~= nil then envelope.retry_after_ms = retry_after_ms end
    return envelope
end

-- Connection resolution failed: no usable bot token for the flow's connection.
function M.connection(message: string): Envelope
    return M.failure("auth_expired", message, false, "connection")
end

function M.invalid_config(message: string): Envelope
    return M.failure("invalid_config", message, false, "flow")
end

function M.invalid_request(message: string): Envelope
    return M.failure("invalid_request", message, false, "item")
end

-- Classify a failed client Result by HTTP status. 429 carries the provider wait
-- as retry_after_ms; 401 marks the connection credential dead; 403/404 are
-- flow-scoped (the configured channel is wrong or unreadable, retrying the same
-- request cannot help); 5xx and transport errors are retriable provider faults.
function M.from_result(res: any, context: string): Envelope
    local r = type(res) == "table" and res or {}
    local status = tonumber((r :: any).status_code) or 0
    local message = context .. ": " .. tostring((r :: any).error or "request failed")
    if status == 429 then
        local wait = tonumber((r :: any).retry_after_ms) or 1000
        return capacity_http.carry(M.failure("rate_limited", message, true, "provider", wait), res)
    end
    if status == 401 then return capacity_http.carry(M.failure("auth_expired", message, false, "connection"), res) end
    if status == 403 then return capacity_http.carry(M.failure("permission_denied", message, false, "flow"), res) end
    if status == 404 then return capacity_http.carry(M.failure("not_found", message, false, "flow"), res) end
    if status >= 500 then return capacity_http.carry(M.failure("provider_unavailable", message, true, "provider"), res) end
    return capacity_http.carry(M.failure("provider_error", message, true, "provider"), res)
end

return M
