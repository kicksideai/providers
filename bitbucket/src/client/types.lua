local M = {}

M.API_BASE = "https://api.bitbucket.org/2.0"
M.AUTH_API_TOKEN = "api_token"
M.AUTH_ACCESS_TOKEN = "access_token"

-- RATE_LIMIT_BACKOFF_MS is the wait on a 429 without Retry-After. Bitbucket
-- documents no backoff; its limits run over a one-hour rolling window in which
-- capacity returns as each minute passes, so one minute is the earliest retry
-- that can succeed. RFC 9110 section 10.2.3 defines no default.
-- https://support.atlassian.com/bitbucket-cloud/docs/api-request-limits/
M.RATE_LIMIT_BACKOFF_MS = 60000

-- Result.error_kind values on a failed request.
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
    auth_type: string,
    authorization: string,
    workspace: string?,
}

type PageQuery = {
    page: integer,
    pagelen: integer,
    q: string?,
}

M.Result = Result
M.Conn = Conn
M.PageQuery = PageQuery

return M
