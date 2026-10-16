local M = {}
M.MESSAGE_CONTENT_WARNING = {
    reason = "message_content_intent_missing",
    message = "MESSAGE CONTENT intent is disabled; only messages that mention the bot and direct messages are available. Enable it in the Discord Developer Portal to read other channel messages.",
}
function M.application(result: any): (boolean, string?, string?)
    if type(result) ~= "table" or result.success ~= true then
        local reason = result and result.status_code == 401 and "bot_token_invalid" or "application_probe_failed"
        return false, reason, tostring(result and result.error or "Discord application probe returns no result")
    end
    local flags = type(result.data) == "table" and tonumber(result.data.flags) or nil
    if not flags then return false, "application_probe_failed", "Discord application flags are missing" end
    return true, nil, nil
end
-- message_content(result) -> boolean. The application holds the MESSAGE_CONTENT
-- intent (full or limited flag); without it Discord still delivers content for
-- mentions of the bot and direct messages.
function M.message_content(result: any): boolean
    local flags = type(result) == "table" and type(result.data) == "table" and tonumber(result.data.flags) or nil
    if not flags then return false end
    return math.floor(flags / 262144) % 2 == 1 or math.floor(flags / 524288) % 2 == 1
end
-- warnings(result) -> typed warnings for a reachable bot that works with reduced capability.
function M.warnings(result: any): { any }
    if M.message_content(result) then return {} end
    return { M.MESSAGE_CONTENT_WARNING }
end
function M.rest(result: any): string
    local code = type(result) == "table" and tonumber(result.status_code) or 0
    if code == 401 then return "bot_token_invalid" end
    if code == 403 then return "discord_permission_missing" end
    if code == 404 then return "discord_channel_missing" end
    if code == 429 then return "discord_rate_limited" end
    return "discord_request_failed"
end
return M
