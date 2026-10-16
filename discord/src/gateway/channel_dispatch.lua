local funcs = require("funcs")
local logger = require("logger")

-- Channel dispatch: handle ONE Discord guild message in its own process, as the
-- SYSTEM gateway process. It just normalizes + hands the message to
-- kickside.channel:receive; routing (which responder covers the channel) and
-- identity (running the agent as the frozen installer) live there, not in the
-- transport. The connection component_id is the reply route. Spawned per message
-- so a slow agent run never blocks the gateway loop.
local M = {}

-- Runtime seam, swapped in tests so run is verified without a live func runtime.
M._funcs = funcs :: any

local log = logger:named("discord.gateway.channel_dispatch")

local INBOUND = "kickside.discord.inbound:receive_channel_message"

-- run(component_id, message) -> result. Runs the channel receiver as the gateway
-- process, passing the connection component_id as the reply route.
function M.run(component_id: string, message: any): any
    local res, ferr = M._funcs.new()
        :call(INBOUND, {
            component_id = component_id,
            event = message,
        })
    if ferr then return { ok = false, reason = "channel_dispatch_failed", error = ferr } end
    if type(res) ~= "table" then return { ok = false, reason = "channel_dispatch_failed", error = "channel receiver returns no result" } end
    if res.accepted ~= true and res.status ~= "ignored" and res.status ~= "unrouted" then
        return { ok = false, reason = res.reason or "channel_unrouted", error = res.error or res.status, result = res }
    end
    return { ok = true, result = res }
end

-- main(args): per-message process entrypoint. The worker spawns this with the
-- connection's component id + raw message; failures are logged and contained to
-- this process. Per-message outcomes never touch connection health, which belongs
-- to the gateway.
local function main(args: any)
    args = type(args) == "table" and args or {}
    local result = M.run(tostring(args.component_id or ""), args.event)
    if type(result) == "table" and (result :: any).error then
        log:warn("discord channel dispatch failed", {
            error = tostring((result :: any).error),
            channel_id = type(args.event) == "table" and (args.event :: any).channel_id or nil,
        })
    end
end
M.main = main

return M
