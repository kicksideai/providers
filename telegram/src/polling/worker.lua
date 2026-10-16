local time = require("time")
local channel = require("channel")
local logger = require("logger")
local api = require("api")

local M = {}

local DM_DISPATCH_PROC_ID = "kickside.telegram.polling:dm_dispatch_proc"
local CHANNEL_DISPATCH_PROC_ID = "kickside.telegram.polling:channel_dispatch_proc"
local log = logger:named("telegram.polling.worker")

local function trim(value: any): string
    if type(value) ~= "string" then value = tostring(value or "") end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function chat_type(update: any): string
    local msg = type(update) == "table" and ((update :: any).message or (update :: any).channel_post) or nil
    local chat = type(msg) == "table" and (msg :: any).chat or nil
    return type(chat) == "table" and trim((chat :: any).type) or ""
end

local function dispatch(args: any, update: any): boolean
    local proc_id = chat_type(update) == "private" and DM_DISPATCH_PROC_ID or CHANNEL_DISPATCH_PROC_ID
    local pid, err = process.spawn(proc_id, args.host :: string, {
        component_id = args.component_id,
        update = update,
    })
    if not pid then
        log:warn("telegram update dispatch spawn failed", { error = tostring(err), component_id = args.component_id })
        return false
    end
    return true
end

local function wait_or_stop(events_ch: any, duration: string): boolean
    local timer = time.after(duration)
    local r = channel.select({ events_ch:case_receive(), timer:case_receive() })
    return r.channel == events_ch and type(r.value) == "table" and (r.value :: any).kind == process.event.CANCEL
end

function M.main(args: any)
    args = type(args) == "table" and args or {}
    local token = trim(args.bot_token)
    if token == "" then
        log:error("telegram polling worker requires a bot_token")
        return
    end
    local conn = { component_id = trim(args.component_id), bot_token = token }
    local events_ch = process.events()
    local offset: any = nil

    api.delete_webhook(conn)
    log:info("telegram polling worker started", { component_id = conn.component_id })

    while true do
        local poll_ch = channel.new(1)
        coroutine.spawn(function()
            poll_ch:send(api.get_updates(conn, { offset = offset, timeout = 25 }))
        end)

        local selected = channel.select({ events_ch:case_receive(), poll_ch:case_receive() })
        if selected.channel == events_ch then
            if type(selected.value) == "table" and (selected.value :: any).kind == process.event.CANCEL then break end
        else
            local result = selected.value
            if type(result) ~= "table" or result.success ~= true then
                log:warn("telegram getUpdates failed", { error = type(result) == "table" and result.error or "unknown" })
                if wait_or_stop(events_ch, "5s") then break end
            else
                local updates = type(result.data) == "table" and result.data or {}
                for _, update in ipairs(updates) do
                    if not dispatch(args, update) then
                        break
                    end
                    local update_id = type(update) == "table" and tonumber((update :: any).update_id) or nil
                    if update_id then offset = update_id + 1 end
                end
            end
        end
    end

    log:info("telegram polling worker stopped", { component_id = conn.component_id })
end

M._chat_type = chat_type

return M
