local endpoints = require("endpoints")
local hash = require("hash")
local M = {}

M.PROVIDER = "discord"
M.CONNECTION_CLASS = "connection"
function M.api_base(): string
    return endpoints.get("kickside.discord:endpoints", "api")
end
M.MESSAGE_MAX_LENGTH = 2000
-- Create Message accepts a nonce of at most 25 characters. With enforce_nonce,
-- Discord answers a repeated nonce from the same author within its dedup window
-- with the message it already created instead of creating another.
M.NONCE_MAX_LENGTH = 25

-- message_nonce(idempotency_key) -> the deterministic Create Message nonce of
-- one delivery key, so every retry of that delivery carries the same nonce.
function M.message_nonce(idempotency_key: string): (string?, error?)
    local digest, digest_err = hash.sha256(idempotency_key)
    if digest_err then return nil, errors.wrap(digest_err, "Discord message nonce digest failed") end
    if type(digest) ~= "string" or #(digest :: string) < M.NONCE_MAX_LENGTH then
        return nil, errors.new({ message = "Discord message nonce digest is invalid", kind = errors.INTERNAL })
    end
    return string.sub((digest :: string):lower(), 1, M.NONCE_MAX_LENGTH), nil
end

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
