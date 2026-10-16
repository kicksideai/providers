local time = require("time")
local channel = require("channel")
local logger = require("logger")
local protocol = require("protocol")
local backoff = require("backoff")
local socket_api = require("socket_api")

local DM_DISPATCH_PROC_ID = "kickside.slack.socket:dm_dispatch_proc"
local CHANNEL_DISPATCH_PROC_ID = "kickside.slack.socket:channel_dispatch_proc"

-- One per-connection Slack Socket Mode worker: open a fresh wss url via
-- apps.connections.open, receive envelopes, ack each ack-required envelope by
-- echoing its envelope_id, dispatch message events, and reconnect with
-- exponential backoff on any disconnect. All protocol decisions come from
-- socket.protocol and all pacing from socket.backoff -- both unit-tested -- so
-- this file is the thin I/O loop that executes their decisions.
local log = logger:named("slack.socket.worker")

-- Each message event is handled in its OWN process: the socket loop spawns a
-- per-message dispatch process so a slow agent run never blocks frame reads /
-- acks and a crash is contained to that message. A channel message goes to
-- kickside.channel:receive (routed to the responder, run as the installer); a DM
-- goes to kickside.dm:receive (resolves the linked user). The transport carries
-- no routing -- it just forwards. An on_message hook short-circuits this for
-- integration drivers. args.host is where dispatch processes spawn.
local function dispatch_event(args: any, event: any, route: string)
    if type(args.on_message) == "function" then
        local ok, err = pcall(args.on_message, event, route)
        if not ok then log:error("on_message failed", { error = tostring(err) }) end
        return
    end
    local proc_id = route == "dm" and DM_DISPATCH_PROC_ID or CHANNEL_DISPATCH_PROC_ID
    log:info("slack message routed", { route = route, channel = type(event) == "table" and (event :: any).channel or nil })
    local _, err = process.spawn(proc_id, args.host :: string, {
        component_id = args.component_id,
        event = event,
    })
    if err then
        log:warn("slack dispatch spawn failed", { error = tostring(err), route = route })
    end
end

-- Sleep `ms`, waking early (returning true) if the process is cancelled, so a
-- shutdown is never blocked by a backoff window.
local function wait_or_stop(events_ch: any, ms: number): boolean
    local timer = time.after(tostring(math.max(0, math.floor(ms))) .. "ms")
    local r = channel.select({ events_ch:case_receive(), timer:case_receive() })
    if r.channel == events_ch then
        return type(r.value) == "table" and (r.value :: any).kind == process.event.CANCEL
    end
    return false
end

-- One socket lifetime. Returns "stop" | "reconnect"; sets session.ready on HELLO
-- (the caller uses that to reset the backoff).
local function run_session(ws: any, args: any, events_ch: any, session: any): string
    local ws_ch = ws:channel()

    while true do
        local result = channel.select({ events_ch:case_receive(), ws_ch:case_receive() })

        if result.channel == events_ch then
            if type(result.value) == "table" and (result.value :: any).kind == process.event.CANCEL then
                return "stop"
            end
        elseif result.channel == ws_ch then
            local frame = result.value
            if frame == nil then return "reconnect" end -- socket closed
            local payload, derr = socket_api.decode(frame)
            if not derr and payload then
                local action = protocol.on_frame(payload)
                local k = action.kind
                if k == "hello" then
                    session.ready = true
                    log:info("slack socket ready")
                elseif k == "reconnect" then
                    log:info("slack socket disconnect", { reason = action.reason })
                    return "reconnect"
                elseif k == "ack" then
                    if action.envelope_id ~= nil then
                        socket_api.send(ws, protocol.ack_payload(action.envelope_id))
                    end
                elseif k == "event" then
                    -- Ack first (within Slack's 3s window), then route. Acking before
                    -- the agent run keeps Slack from retrying a slow-but-received event.
                    if action.envelope_id ~= nil then
                        socket_api.send(ws, protocol.ack_payload(action.envelope_id))
                    end
                    local route = protocol.route_event(action.event)
                    if route then dispatch_event(args, action.event, route) end
                end
            end
        end
    end
    return "reconnect" -- unreachable; the loop only exits via an explicit return
end

local function main(args: any)
    args = type(args) == "table" and args or {}
    if type(args.app_token) ~= "string" or (args.app_token :: string) == "" then
        log:error("slack socket worker requires an app_token")
        return
    end

    local events_ch = process.events()
    local attempt = 0
    log:info("slack socket worker started")

    while true do
        local url, oerr = socket_api.open_url(args.app_token :: string)
        local ws: any = nil
        local cerr = oerr
        if url then ws, cerr = socket_api.connect(url) end

        if not ws then
            attempt = attempt + 1
            log:warn("slack socket open failed; backing off", { attempt = attempt, error = cerr })
            if wait_or_stop(events_ch, backoff.delay_ms(attempt)) then break end
        else
            local session = { ready = false }
            local outcome = run_session(ws, args, events_ch, session)
            socket_api.close(ws, outcome)
            if outcome == "stop" then break end
            -- A socket that reached HELLO resets the escalation; one that never did
            -- keeps the backoff growing.
            if session.ready then attempt = 0 end
            attempt = attempt + 1
            if wait_or_stop(events_ch, backoff.delay_ms(attempt)) then break end
        end
    end
    log:info("slack socket worker stopped")
end

return { main = main }
