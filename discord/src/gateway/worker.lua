local time = require("time")
local channel = require("channel")
local logger = require("logger")
local protocol = require("protocol")
local backoff = require("backoff")
local consts = require("consts")
local gateway_api = require("gateway_api")
local api = require("api")
local preconditions = require("preconditions")
local health = require("health")

local function construct(dependencies: any): any
local process = dependencies.process or process

local DM_DISPATCH_PROC_ID = "kickside.discord.gateway:dm_dispatch_proc"
local CHANNEL_DISPATCH_PROC_ID = "kickside.discord.gateway:channel_dispatch_proc"

-- One per-bot Discord Gateway connection: HELLO -> IDENTIFY/RESUME, jittered
-- heartbeats with zombie detection, dispatch of MESSAGE_CREATE, and reconnect
-- with exponential backoff (resuming when the session is still valid, else a
-- fresh identify). All wire-protocol decisions come from gateway.protocol and
-- all pacing from gateway.backoff -- both unit-tested -- so this file is the thin
-- I/O loop that executes their decisions.
local log = logger:named("discord.gateway.worker")

-- Each MESSAGE_CREATE is handled in its OWN process: the websocket loop spawns a
-- per-message dispatch process so a slow agent run never blocks heartbeats or
-- frame reads and a crash is contained to that message. A guild message goes to
-- kickside.channel:receive (which routes it to the responder and runs the agent
-- as the installer); a DM goes to kickside.dm:receive (which resolves the linked
-- user). The transport carries no routing -- it just forwards. An on_message hook
-- short-circuits this for integration drivers. args.host is where dispatch
-- processes spawn.
local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function report(args: any, reason: string, message: any, state: string?)
    local ok, err = health.report(tostring(args.component_id or ""), reason, message, state)
    if not ok then error("Discord health write failed: " .. tostring(err)) end
end

local function dispatch_message(args: any, d: any)
    if type(args.on_message) == "function" then
        local _, err = args.on_message(d)
        if err then report(args, "message_dispatch_failed", err) end
        return
    end
    local channel_id = type(d) == "table" and trim((d :: any).channel_id) or ""
    local author = type(d) == "table" and type((d :: any).author) == "table" and (d :: any).author or {}
    local author_id = trim((author :: any).id)
    local is_dm = type(d) == "table" and trim((d :: any).guild_id) == ""

    -- A DM has no responder: coverage comes from the connection. Dispatch as the
    -- system gateway process; the receiver resolves the linked user and the bot
    -- reply reads this connection's token at the system level.
    if is_dm then
        log:info("discord dm routed", { channel_id = channel_id, author_id = author_id })
        local _, err = process.spawn(DM_DISPATCH_PROC_ID, args.host :: string, {
            component_id = args.component_id,
            event = d,
        })
        if err then
            report(args, "message_dispatch_failed", err)
        end
        return
    end

    -- A guild message is handed to kickside.channel:receive, which routes it to
    -- the responder automation covering the channel and runs the agent as the
    -- frozen installer. Routing + identity live there, not in the transport.
    log:info("discord channel message routed", { channel_id = channel_id, author_id = author_id })
    local _, err = process.spawn(CHANNEL_DISPATCH_PROC_ID, args.host :: string, {
        component_id = args.component_id,
        event = d,
    })
    if err then
        report(args, "message_dispatch_failed", err)
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

-- One connection lifetime. Returns "stop" | "reconnect"; sets session.ready when
-- the gateway reaches READY/RESUMED (the caller uses that to reset the backoff).
local function run_session(state: any, ws: any, args: any, events_ch: any, session: any): string
    local ws_ch, channel_err = ws:channel()
    if channel_err or not ws_ch then
        report(args, "gateway_channel_failed", channel_err)
        return "reconnect"
    end
    local hb_timer: any = nil
    local hb_interval = 0

    local function send(payload: any)
        local err = gateway_api.send(ws, payload)
        if err then report(args, "gateway_send_failed", err) end
        return err
    end

    local function execute(action: any): string?
        local k = action.kind
        if k == "identify" then
            if send(protocol.identify_payload(args.token, consts.intents(state.message_content))) then return "reconnect" end
        elseif k == "resume" then
            if send(protocol.resume_payload(args.token, state.session_id, state.seq)) then return "reconnect" end
        elseif k == "heartbeat" then
            if send(protocol.heartbeat_payload(state.seq)) then return "reconnect" end
        elseif k == "ready" or k == "resumed" then
            session.ready = true
            if state.message_content then
                report(args, "gateway_ready", "Discord gateway receives messages", "ready")
            else
                local warning = preconditions.MESSAGE_CONTENT_WARNING
                report(args, warning.reason, warning.message, "warning")
            end
            log:info("discord gateway ready", { resumed = k == "resumed" })
        elseif k == "reconnect" then
            report(args, "gateway_reconnecting", action.reason or "Discord requests reconnection")
            return "reconnect"
        elseif k == "dispatch" then
            if action.t == "MESSAGE_CREATE" and protocol.admits_message(state, action.d) then
                dispatch_message(args, action.d)
            end
        end
        return nil
    end

    while true do
        -- Arm the heartbeat timer once HELLO has set the interval. The first beat
        -- is jittered (Discord guidance); subsequent beats use the full interval.
        if hb_timer == nil and state.heartbeat_interval > 0 then
            hb_interval = state.heartbeat_interval
            hb_timer = time.after(tostring(backoff.first_heartbeat_ms(hb_interval)) .. "ms")
        end

        local cases = { events_ch:case_receive(), ws_ch:case_receive() }
        if hb_timer then cases[#cases + 1] = hb_timer:case_receive() end
        local result = channel.select(cases)

        if result.channel == events_ch then
            if type(result.value) == "table" and (result.value :: any).kind == process.event.CANCEL then
                return "stop"
            end
        elseif hb_timer and result.channel == hb_timer then
            local a = protocol.on_heartbeat_tick(state)
            hb_timer = time.after(tostring(hb_interval) .. "ms")
            if execute(a) == "reconnect" then return "reconnect" end
        elseif result.channel == ws_ch then
            local frame = result.value
            if frame == nil then
                report(args, "gateway_disconnected", "Discord closes the gateway connection")
                return "reconnect"
            end
            local payload, derr = gateway_api.decode(frame)
            if derr then
                report(args, "gateway_frame_invalid", derr)
                return "reconnect"
            end
            if payload then
                if execute(protocol.on_frame(state, payload)) == "reconnect" then return "reconnect" end
            end
        end
    end
    return "reconnect" -- unreachable; the loop only exits via an explicit return
end

local function main(args: any)
    args = type(args) == "table" and args or {}
    if type(args.token) ~= "string" or (args.token :: string) == "" then
        report(args, "bot_token_missing", "Discord gateway requires a bot token")
        return
    end

    local events_ch = process.events()
    local state = protocol.new()
    local attempt = 0
    log:info("discord gateway worker started")

    while true do
        local application, application_err = api.get_application({ bot_token = args.token })
        local ready, reason, message = preconditions.application(application)
        if not ready then
            report(args, reason :: string, application_err or message)
            attempt = attempt + 1
            if wait_or_stop(events_ch, backoff.delay_ms(attempt)) then break end
        else
            state.message_content = preconditions.message_content(application)
            report(args, "gateway_connecting", "Connecting to Discord gateway", "pending")
            local ws, cerr = gateway_api.connect(state.resume_url or consts.gateway_url())
            if not ws then
                attempt = attempt + 1
                report(args, "gateway_connect_failed", cerr)
                if wait_or_stop(events_ch, backoff.delay_ms(attempt)) then break end
            else
                local session = { ready = false }
                local outcome = run_session(state, ws, args, events_ch, session)
                local _, close_err = gateway_api.close(ws, outcome)
                if close_err then report(args, "gateway_close_failed", close_err) end
                if outcome == "stop" then break end
                -- A session that established (READY/RESUMED) resets the escalation; a
                -- session that never got there keeps the backoff growing.
                if session.ready then attempt = 0 end
                attempt = attempt + 1
                if wait_or_stop(events_ch, backoff.delay_ms(attempt)) then break end
            end
        end
    end
    log:info("discord gateway worker stopped")
end

return { main = main, new = construct }
end
return construct({})
