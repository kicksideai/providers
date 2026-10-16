local endpoints = require("endpoints")
local M = {}

M.PROVIDER = "github"
M.CONNECTION_CLASS = "connection"
M.OAUTH_CONTRACT = "kickside.oauth:oauth_connection_contract"
function M.api_base(): string
    return endpoints.get("kickside.github:endpoints", "api")
end
M.DEFAULT_TOKEN_TYPE = "Bearer"

-- RATE_LIMIT_BACKOFF_MS is the wait on a rate-limited response that states
-- neither retry-after nor an exhausted x-ratelimit-reset: GitHub says to "wait
-- for at least one minute before retrying".
-- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api#exceeding-the-rate-limit
M.RATE_LIMIT_BACKOFF_MS = 60000

-- Result.error_kind values on a failed request.
M.ERROR_CONNECTION = "connection"
M.ERROR_INVALID_REQUEST = "invalid_request"
M.ERROR_TRANSPORT = "transport"
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
    kind: string?,
    message: string?,
    retryable: boolean?,
    details: any?,
}

type AccessToken = {
    success: boolean,
    access_token: string?,
    token_type: string?,
    expires_at: integer?,
    is_expired: boolean?,
    error: string?,
}

type Conn = {
    component_id: string?,
    mode: string,
    token: string?,
    header: string?,
    oauth_conn: any?,
}

M.Result = Result
M.AccessToken = AccessToken
M.Conn = Conn

return M
