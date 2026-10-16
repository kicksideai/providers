local endpoints = require("endpoints")
-- Shared type surfaces for the Atlassian provider. Reference cross-module via the
-- import alias (e.g. atlassian_types.Result). Atlassian REST payloads are dynamic
-- JSON, so Result.data stays `any`.

local M = {}

M.OAUTH_CONTRACT = "kickside.oauth:oauth_connection_contract"
function M.accessible_resources(): string
    return endpoints.get("kickside.atlassian:endpoints", "resources")
end
M.DEFAULT_TOKEN_TYPE = "Bearer"

-- Uniform envelope returned by every transport and service call. `data` holds the
-- decoded Atlassian response (JSON object/array); it is dynamic by nature.
type Result = {
    success: boolean,
    data: any?,
    error: string?,
    status_code: integer?,
    kind: string?,
    message: string?,
    retryable: boolean?,
    details: any?,
    retry_after_ms: number?,
}

-- The token view returned by the OAuth connection's get_access_token method.
type AccessToken = {
    success: boolean,
    access_token: string?,
    token_type: string?,
    expires_at: integer?,
    is_expired: boolean?,
    error: string?,
}

-- A resolved connection handle. One shape for both auth modes: the service/tool
-- layers read jira_base/confluence_base and never branch on auth. `header` is set
-- for credential connections (static Basic/Bearer); `oauth_conn` is an opened
-- kickside.oauth:oauth_connection_contract instance whose token is fetched per
-- request for OAuth connections.
type Conn = {
    component_id: string?,
    mode: string,
    deployment: string,
    jira_base: string,
    confluence_base: string,
    header: string?,
    oauth_conn: any?,
    cloud_id: string?,
}

M.Result = Result
M.AccessToken = AccessToken
M.Conn = Conn

return M
