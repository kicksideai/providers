local endpoints = require("endpoints")
local M = {}

M.PROVIDER = "phantombuster"
M.CONNECTION_CLASS = "connection"
function M.api_base(): string
    return endpoints.get("kickside.phantombuster:endpoints", "api")
end

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

type Conn = {
    component_id: string?,
    api_key: string,
}

M.Result = Result
M.Conn = Conn

return M
