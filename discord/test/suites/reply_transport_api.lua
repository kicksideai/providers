local state = require("state")
local sql = require("sql")
local M = {}

function M.send_channel_message(conn, channel_id, payload)
    state.calls[#state.calls + 1] = "send"
    state.sent = { connection = conn, channel_id = channel_id, payload = payload }
    local db = sql.get("app:db")
    if db then
        db:execute("INSERT INTO discord_reply_transport_audit (token, channel_id, content) VALUES ($1, $2, $3)",
            { conn.bot_token, channel_id, payload.content })
        local receipt_failure_turn_id = type(payload.content) == "string"
            and payload.content:match("^break%-receipt:(.+)$") or nil
        if receipt_failure_turn_id then
            db:execute(
                "UPDATE kickside_channel_turns SET reply_hash = $1 WHERE turn_id = $2",
                { "injected-receipt-conflict", receipt_failure_turn_id })
        end
        db:release()
    end
    return state.send_result
end

return M
