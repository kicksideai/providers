local funcs = require("funcs")
local logger = require("logger")

local M = {}
M._funcs = funcs :: any

local log = logger:named("telegram.polling.dispatch")
local DM_INBOUND = "kickside.telegram.inbound:receive_message"
local CHANNEL_INBOUND = "kickside.telegram.inbound:receive_channel_message"

local function call_inbound(target: string, component_id: string, update: any): any
    local res, ferr = M._funcs.new()
        :call(target, {
            component_id = component_id,
            update = update,
        })
    if ferr then return { error = tostring(ferr) } end
    return { ok = true, result = res }
end

function M.run_dm(component_id: string, update: any): any
    return call_inbound(DM_INBOUND, component_id, update)
end

function M.run_channel(component_id: string, update: any): any
    return call_inbound(CHANNEL_INBOUND, component_id, update)
end

local function log_failure(kind: string, args: any, result: any)
    if type(result) == "table" and (result :: any).error then
        log:warn("telegram " .. kind .. " dispatch failed", { error = tostring((result :: any).error) })
        return
    end
    local receiver_result = type(result) == "table" and (result :: any).result or nil
    if type(receiver_result) == "table" and (receiver_result :: any).success == false then
        local status = tostring((receiver_result :: any).status or "")
        if status ~= "unrouted" then
            log:warn("telegram " .. kind .. " receiver returned failure", {
                status = status,
                error = tostring((receiver_result :: any).error or ""),
            })
        end
    end
end

function M.dm_main(args: any)
    args = type(args) == "table" and args or {}
    log_failure("dm", args, M.run_dm(tostring(args.component_id or ""), args.update))
end

function M.channel_main(args: any)
    args = type(args) == "table" and args or {}
    log_failure("channel", args, M.run_channel(tostring(args.component_id or ""), args.update))
end

return M
