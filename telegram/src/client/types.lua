local endpoints = require("endpoints")
local M = {}

M.PROVIDER = "telegram"
M.CONNECTION_CLASS = "connection"
function M.file_base(): string
    return endpoints.get("kickside.telegram:endpoints", "file")
end
function M.api_base(): string
    return endpoints.get("kickside.telegram:endpoints", "api")
end
M.MESSAGE_MAX_LENGTH = 4096

type Result = {
    success: boolean,
    data: any?,
    error: string?,
    status_code: integer?,
    retry_after_ms: number?,
    kind: string?,
    message: string?,
    retryable: boolean?,
    details: any?,
}

type Conn = {
    component_id: string?,
    bot_token: string,
    default_chat_id: string?,
    allow_bot_messages: boolean?,
}

M.Result = Result
M.Conn = Conn

return M
