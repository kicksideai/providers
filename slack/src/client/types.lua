local endpoints = require("endpoints")
local M = {}

M.PROVIDER = "slack"
M.CONNECTION_CLASS = "connection"
function M.api_base(): string
    return endpoints.get("kickside.slack:endpoints", "api")
end
M.MESSAGE_MAX_LENGTH = 40000

type Result = {
    success: boolean,
    data: any?,
    error: string?,
    status_code: integer?,
}

type Conn = {
    component_id: string?,
    bot_token: string,
    -- The app-level token (xapp-) is only used to open a Socket Mode connection;
    -- every Web API call authenticates with the bot token. Channel agents are
    -- designated per channel by a responder automation; DMs route to the linked
    -- user's own agents and run as that user, while the bot reply reads the bot
    -- token at the system level.
    app_token: string?,
    allow_bot_messages: boolean?,
}

M.Result = Result
M.Conn = Conn

return M
