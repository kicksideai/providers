local endpoints = require("endpoints")
-- Discord Gateway wire-protocol constants (opcodes, intents, endpoint). Kept
-- apart from the REST `kickside.discord.client:types` so the gateway transport has
-- one source for the protocol it speaks.
local M = {}

-- v10 JSON gateway. Discord may hand back a per-session resume_gateway_url in
-- READY; this is the entry point used for the initial connect.
function M.gateway_url(): string
    return endpoints.get("kickside.discord:endpoints", "gateway")
end

-- Gateway opcodes — https://discord.com/developers/docs/topics/opcodes-and-status-codes
M.OP = {
    DISPATCH = 0,
    HEARTBEAT = 1,
    IDENTIFY = 2,
    RESUME = 6,
    RECONNECT = 7,
    INVALID_SESSION = 9,
    HELLO = 10,
    HEARTBEAT_ACK = 11,
}

-- Intent bits we subscribe to. MESSAGE_CONTENT is a privileged intent that must
-- be enabled for the bot in the Discord developer portal; without it Discord
-- delivers message bodies only for mentions of the bot and direct messages.
M.INTENTS = {
    GUILDS = 1,           -- 1 << 0
    GUILD_MESSAGES = 512, -- 1 << 9
    DIRECT_MESSAGES = 4096, -- 1 << 12
    MESSAGE_CONTENT = 32768, -- 1 << 15
}

-- Intents that need no portal approval.
M.BASE_INTENTS = M.INTENTS.GUILDS
    + M.INTENTS.GUILD_MESSAGES
    + M.INTENTS.DIRECT_MESSAGES

-- BASE_INTENTS | MESSAGE_CONTENT = 37377
M.DEFAULT_INTENTS = M.BASE_INTENTS + M.INTENTS.MESSAGE_CONTENT

-- Identify with the privileged intent only when the application is approved for
-- it; Discord closes the gateway (4014) for an intent the bot lacks.
function M.intents(message_content: boolean): number
    if message_content then return M.DEFAULT_INTENTS end
    return M.BASE_INTENTS
end

-- HELLO carries the real heartbeat_interval; this is only a fallback if it is
-- missing or malformed.
M.DEFAULT_HEARTBEAT_INTERVAL_MS = 41250

-- Process registry name the gateway hub registers itself under, so the connection
-- lifecycle handler can wake it for an immediate reconcile instead of waiting for
-- the periodic re-scan.
M.HUB_NAME = "kickside.discord.gateway.hub"

return M
