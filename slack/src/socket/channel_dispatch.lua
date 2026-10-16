local funcs = require("funcs")
local logger = require("logger")

-- Channel dispatch: handle ONE Slack channel message in its own process, as the
-- SYSTEM socket process. It just normalizes + hands the message to
-- kickside.channel:receive; routing (which responder covers the channel) and
-- identity (running the agent as the frozen installer) live there, not in the
-- transport. The connection component_id is the reply route. Spawned per message
-- so a slow agent run never blocks the socket loop.
local M = {}

-- Runtime seam, swapped in tests so run is verified without a live func runtime.
M._funcs = funcs :: any

local log = logger:named("slack.socket.channel_dispatch")

local INBOUND = "kickside.slack.inbound:receive_channel_message"

-- run(component_id, message) -> result. Runs the channel receiver as the socket
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
        log:warn("slack channel dispatch failed", {
            error = tostring((result :: any).error),
            channel = type(args.event) == "table" and (args.event :: any).channel or nil,
        })
        return
    end
    local receiver_result = type(result) == "table" and (result :: any).result or nil
    if type(receiver_result) == "table" and (receiver_result :: any).success == false then
        local status = tostring((receiver_result :: any).status or "")
        -- "unrouted" is a normal no-op: the channel has no responder attached.
        if status ~= "unrouted" then
            log:warn("slack channel receiver returned failure", {
                status = status,
                error = tostring((receiver_result :: any).error or ""),
                channel = type(args.event) == "table" and (args.event :: any).channel or nil,
            })
        end
    end
end
M.main = main

return M
