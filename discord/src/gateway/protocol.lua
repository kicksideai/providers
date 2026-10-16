local consts = require("consts")

-- Pure Discord Gateway protocol state machine: no socket, no process, no I/O.
-- Feed it decoded gateway frames (and heartbeat-timer ticks); it mutates a plain
-- state table and returns the single action the transport must take next. This
-- keeps the wire protocol -- HELLO -> IDENTIFY/RESUME, heartbeat + sequence
-- tracking, session resume, and reconnect classification -- unit-testable, away
-- from the live websocket and process loop that the worker layer owns.
--
-- Action kinds returned to the transport:
--   identify  -- send an IDENTIFY payload
--   resume    -- send a RESUME payload (session_id + seq)
--   heartbeat -- send a HEARTBEAT payload (seq)
--   ack       -- heartbeat acknowledged; nothing to send
--   ready     -- session established (carries session_id)
--   resumed   -- session resumed
--   dispatch  -- a gateway event to route (carries { t, d })
--   reconnect -- close and reconnect (carries { resumable })
--   noop      -- ignore
local M = {}

-- State shape (a plain table, not a typed alias so the gateway library stays
-- portable): {
--   phase: string,              -- connecting | identifying | resuming | ready
--   heartbeat_interval: number, -- ms, from HELLO
--   seq: number?,               -- last dispatch sequence
--   session_id: string?,        -- from READY (for resume)
--   resume_url: string?,        -- from READY (resume_gateway_url)
--   heartbeat_acked: boolean,   -- was the last heartbeat ACKed
--   user_id: string?,           -- the bot's user id, from READY
--   message_content: boolean,   -- the application holds the MESSAGE_CONTENT intent
-- }
function M.new(): any
    return {
        phase = "connecting",
        heartbeat_interval = consts.DEFAULT_HEARTBEAT_INTERVAL_MS,
        seq = nil,
        session_id = nil,
        resume_url = nil,
        heartbeat_acked = true,
        user_id = nil,
        message_content = true,
    }
end

-- A session is resumable only when both the session id and a sequence are held.
local function can_resume(s: any): boolean
    return type(s.session_id) == "string" and (s.session_id :: string) ~= "" and s.seq ~= nil
end

-- on_frame(state, frame) -> action. `frame` is a decoded gateway payload of the
-- shape { op, d?, s?, t? }.
function M.on_frame(s: any, frame: any): any
    if type(frame) ~= "table" then return { kind = "noop" } end
    local op = (frame :: { op: any }).op

    if op == consts.OP.HELLO then
        local d = (frame :: { d: any }).d
        if type(d) == "table" and type(d.heartbeat_interval) == "number" and d.heartbeat_interval > 0 then
            s.heartbeat_interval = d.heartbeat_interval
        end
        s.heartbeat_acked = true
        if can_resume(s) then
            s.phase = "resuming"
            return { kind = "resume" }
        end
        s.phase = "identifying"
        return { kind = "identify" }

    elseif op == consts.OP.HEARTBEAT_ACK then
        s.heartbeat_acked = true
        return { kind = "ack" }

    elseif op == consts.OP.HEARTBEAT then
        -- The server can request an out-of-band heartbeat at any time.
        return { kind = "heartbeat" }

    elseif op == consts.OP.RECONNECT then
        return { kind = "reconnect", resumable = can_resume(s) }

    elseif op == consts.OP.INVALID_SESSION then
        -- `d` is a boolean: true => the existing session may still be resumed.
        local resumable = (frame :: { d: any }).d == true and can_resume(s)
        if not resumable then
            s.session_id = nil
            s.seq = nil
        end
        return { kind = "reconnect", resumable = resumable }

    elseif op == consts.OP.DISPATCH then
        local sn = (frame :: { s: any }).s
        if type(sn) == "number" then s.seq = sn end
        local t = (frame :: { t: any }).t
        if t == "READY" then
            s.phase = "ready"
            local d = (frame :: { d: any }).d
            if type(d) == "table" then
                if type(d.session_id) == "string" then s.session_id = d.session_id end
                if type(d.resume_gateway_url) == "string" then s.resume_url = d.resume_gateway_url end
                if type(d.user) == "table" and type(d.user.id) == "string" then s.user_id = d.user.id end
            end
            return { kind = "ready", session_id = s.session_id }
        elseif t == "RESUMED" then
            s.phase = "ready"
            return { kind = "resumed" }
        end
        return { kind = "dispatch", t = t, d = (frame :: { d: any }).d }
    end

    return { kind = "noop" }
end

-- on_heartbeat_tick(state) -> action. Called when the heartbeat timer fires: a
-- still-unacked previous heartbeat means a zombie connection -> reconnect
-- (resumably); otherwise emit the next heartbeat and await its ACK.
function M.on_heartbeat_tick(s: any): any
    if not s.heartbeat_acked then
        return { kind = "reconnect", resumable = can_resume(s), reason = "heartbeat timeout" }
    end
    s.heartbeat_acked = false
    return { kind = "heartbeat" }
end

-- admits_message(state, d) -> boolean. Without the MESSAGE_CONTENT intent Discord
-- delivers content only for mentions of the bot and direct messages; every other
-- guild message arrives empty and carries nothing to process.
function M.admits_message(s: any, d: any): boolean
    if s.message_content ~= false then return true end
    if type(d) ~= "table" then return false end
    local guild_id = (d :: any).guild_id
    if type(guild_id) ~= "string" or guild_id == "" then return true end
    local mentions = (d :: any).mentions
    if type(mentions) ~= "table" or type(s.user_id) ~= "string" then return false end
    for _, user in ipairs(mentions :: { any }) do
        if type(user) == "table" and user.id == s.user_id then return true end
    end
    return false
end

-- Payload builders for the actions the transport sends.
function M.identify_payload(token: string, intents: number?): any
    return {
        op = consts.OP.IDENTIFY,
        d = {
            token = token,
            intents = intents or consts.DEFAULT_INTENTS,
            properties = { os = "linux", browser = "kickside", device = "kickside" },
        },
    }
end

function M.resume_payload(token: string, session_id: string, seq: number?): any
    return {
        op = consts.OP.RESUME,
        d = { token = token, session_id = session_id, seq = seq or 0 },
    }
end

function M.heartbeat_payload(seq: number?): any
    return { op = consts.OP.HEARTBEAT, d = seq }
end

return M
