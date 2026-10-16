local ctx = require("ctx")
local transport = require("transport")
local api = require("api")
local tool_result = require("tool_result")

local M = {}
M._transport = transport :: any
M._api = api :: any

local VALID = {
    get_me = true,
    get_chat = true,
}

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function open(): (any?, error?)
    return M._transport.connect(ctx.get("connection_id") :: string?)
end

-- A failed Telegram answer is the tool's domain error carrying the failed
-- Result: Telegram's description, HTTP status and response body.
local function telegram_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

function M.handler(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local action = trim(args.action)
    if action == "" then return tool_result.domain_error("action is required (get_me, get_chat)") end
    if not VALID[action] then return tool_result.domain_error("unknown action '" .. action .. "'") end

    local chat_id = trim(args.chat_id)
    if action == "get_chat" and chat_id == "" then return tool_result.domain_error("chat_id is required for get_chat") end

    local conn, conn_err = open()
    if not conn then return nil, conn_err end

    if action == "get_me" then
        local r, err = M._api.test_connection(conn)
        if err then return nil, err end
        if not r.success then return telegram_error(r) end
        return { success = true, action = action, bot = r.data }
    end

    local r, err = M._api.get_chat(conn, chat_id)
    if err then return nil, err end
    if not r.success then return telegram_error(r) end
    return { success = true, action = action, chat = r.data }
end

return M
