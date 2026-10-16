local M = {}

M.PROVIDER = "gitlab"
M.DEFAULT_BASE_URL = "https://gitlab.com"
M.API_PATH = "/api/v4"
M.MODE_CREDENTIAL = "credential"

-- RATE_LIMIT_BACKOFF_MS is the wait on a 429 that states neither Retry-After
-- nor an exhausted RateLimit-Reset. GitLab sends Retry-After on every throttled
-- request and documents no fallback, and RFC 9110 section 10.2.3 defines no
-- default; one minute matches the per-minute quota GitLab reports in
-- RateLimit-Limit.
-- https://docs.gitlab.com/administration/settings/user_and_ip_rate_limits/#response-headers
M.RATE_LIMIT_BACKOFF_MS = 60000

-- Result.error_kind values on a failed request.
M.ERROR_CONNECTION = "connection"
M.ERROR_TRANSPORT = "transport"
M.ERROR_INVALID_RESPONSE = "invalid_response"
M.ERROR_UNAUTHORIZED = "unauthorized"
M.ERROR_FORBIDDEN = "forbidden"
M.ERROR_NOT_FOUND = "not_found"
M.ERROR_RATE_LIMITED = "rate_limited"
M.ERROR_SERVER = "server_error"
M.ERROR_REQUEST_FAILED = "request_failed"

type Result = {
    success: boolean,
    data: any?,
    error: string?,
    status_code: integer?,
    headers: { [string]: any }?,
    error_kind: string?,
    retry_after_ms: integer?,
}

type Conn = {
    component_id: string,
    mode: string,
    base_url: string,
    token: string?,
}

M.Result = Result
M.Conn = Conn

return M
