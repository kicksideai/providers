local M = { flags = 0, channel_result = { success = true }, history_result = { success = true }, request_err = nil }
function M.connect(id: string?) return { component_id = id, bot_token = "fixture-token" }, nil end
function M.test_connection(_)
    if M.request_err then return nil, M.request_err end
    return { success = true, data = { id = "bot-1", bot = true } }
end
function M.get_application(_) return { success = true, data = { flags = M.flags } } end
function M.get_channel(_) return M.channel_result end
function M.get_channel_messages(_) return M.history_result end
return M
