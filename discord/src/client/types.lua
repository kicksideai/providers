local endpoints = require("endpoints")
local M = {}

M.PROVIDER = "discord"
M.CONNECTION_CLASS = "connection"
function M.api_base(): string
    return endpoints.get("kickside.discord:endpoints", "api")
end
M.MESSAGE_MAX_LENGTH = 2000

type Result = {
    success: boolean,
    data: any?,
    error: string?,
    status_code: integer?,
    -- Provider rate-limit wait, attached on a 429 failure so callers on the
    -- no-retry path can hand the wait to a durable scheduler instead of sleeping.
    retry_after_ms: number?,
    kind: string?,
    message: string?,
    retryable: boolean?,
    details: any?,
}

type Conn = {
    component_id: string?,
    bot_token: string,
    -- The bot token is the only submitted credential -- the connection is shared
    -- transport and owns no DM identity. Channel agents are designated per channel
    -- by a responder automation; DMs route to the linked user's own agents and run
    -- as that user, while the bot reply reads this token at the system level.
    allow_bot_messages: boolean?,
}

M.Result = Result
M.Conn = Conn

return M
