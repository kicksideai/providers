local funcs = require("funcs")
local logger = require("logger")

-- DM dispatch: handle ONE Slack DM in its own process, as the SYSTEM socket
-- process. A connection is shared transport and owns no DM identity, so there is
-- no owner to reconstruct: the inbound receiver resolves the sender from the
-- kickside.identity link (external_id -> user_id) and runs the session as that
-- linked user. An unlinked sender gets the link prompt sent back over the bot's
-- transport. The reply reads the connection's bot token at the system level, so
-- the receiver needs no connection access. The connection component_id is the
-- reply route. A DM has no responder and no automation.
local M = {}

-- Runtime seam, swapped in tests so run is verified without a live func runtime.
M._funcs = funcs :: any

local log = logger:named("slack.socket.dm_dispatch")

local INBOUND = "kickside.slack.inbound:receive_message"

-- run(component_id, message) -> result. Runs the inbound receiver as the socket
-- process, passing the connection component_id as the reply route.
function M.run(component_id: string, message: any): any
    local res, ferr = M._funcs.new()
        :call(INBOUND, {
            component_id = component_id,
            event = message,
        })
    if ferr then return { error = tostring(ferr) } end
    return { ok = true, result = res }
end

-- main(args): per-message process entrypoint. The worker spawns this with the
-- connection's component id + raw event; failures are logged and contained to
-- this process.
local function main(args: any)
    args = type(args) == "table" and args or {}
    local result = M.run(tostring(args.component_id or ""), args.event)
    if type(result) == "table" and (result :: any).error then
        log:warn("slack dm dispatch failed", {
            error = tostring((result :: any).error),
            channel = type(args.event) == "table" and (args.event :: any).channel or nil,
        })
        return
    end
    local receiver_result = type(result) == "table" and (result :: any).result or nil
    if type(receiver_result) == "table" and (receiver_result :: any).success == false then
        log:warn("slack dm receiver returned failure", {
            status = tostring((receiver_result :: any).status or ""),
            error = tostring((receiver_result :: any).error or ""),
            channel = type(args.event) == "table" and (args.event :: any).channel or nil,
        })
    end
end
M.main = main

return M
