local M = {}

M.PROVIDER = "simplefin"
M.CONNECTION_CLASS = "connection"
M.PROTOCOL_VERSION = "1.0"

type Result = {
    success: boolean,
    data: any?,
    error: string?,
    code: string?,
    status_code: integer?,
    kind: string?,
    message: string?,
    retryable: boolean?,
    details: any?,
    retry_after_ms: number?,
}

-- A resolved connection: the base URL of the bridge and the Basic authorization
-- header derived from the access URL's userinfo.
type Conn = {
    component_id: string?,
    access_url: string,
    base_url: string,
    authorization: string,
}

M.Result = Result
M.Conn = Conn

return M
