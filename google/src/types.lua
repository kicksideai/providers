-- Shared type surfaces for the Google provider. Reference cross-module via the
-- import alias (e.g. google_types.Result). Google REST payloads are dynamic
-- JSON, so Result.data stays `any`; the Connection handle is the minimal OAuth
-- connection contract surface this provider actually calls.

local M = {}

M.OAUTH_CONTRACT = "kickside.oauth:oauth_connection_contract"
M.CONNECTION_CLASS = "connection"
M.PROVIDER = "google"
M.DEFAULT_TOKEN_TYPE = "Bearer"

-- Uniform envelope returned by every transport and service call. `data` holds
-- the decoded Google response (JSON object/array) or, for raw exports, a
-- { text } table; it is dynamic by nature.
type Result = {
    kind: string?,
    message: string?,
    retryable: boolean?,
    details: any?,
    retry_after_ms: integer?,
    success: boolean,
    data: any?,
    error: string?,
    status_code: number?,
}

-- The token view returned by the OAuth connection's get_access_token method.
type AccessToken = {
    success: boolean,
    access_token: string?,
    token_type: string?,
    expires_at: number?,
    is_expired: boolean?,
    error: string?,
}

-- An opened kickside.oauth:oauth_connection_contract instance. Wippy's typed
-- colon calls expose methods without an explicit `self` parameter here.
type TokenRequest = { rejected_access_token: string? }

type Connection = {
    component_id: string?,
    get_access_token: ((TokenRequest?) -> (AccessToken?, any?)),
    get_info: ((any?) -> (any?, any?))?,
}

M.TokenRequest = TokenRequest
M.Connection = Connection
M.Result = Result
M.AccessToken = AccessToken

return M
