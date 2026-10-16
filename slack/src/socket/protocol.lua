local consts = require("consts")

-- Pure Slack Socket Mode protocol: no socket, no process, no I/O. Feed it decoded
-- envelope frames; it classifies each into the single action the transport must
-- take next, and (separately) classifies a message event's routing target. This
-- keeps the wire protocol -- hello, the ack-by-envelope_id contract, disconnect
-- handling, and message routing -- unit-testable, away from the live websocket
-- and process loop the worker layer owns.
--
-- Action kinds returned by on_frame:
--   hello     -- session established; nothing to send
--   event     -- an Events API delivery (carries envelope_id + the unwrapped event)
--   ack       -- a non-event envelope (slash/interactive) that only needs an ack
--   reconnect -- close and re-open (carries reason)
--   noop      -- ignore
local M = {}

-- on_frame(frame) -> action. `frame` is a decoded Socket Mode envelope of the
-- shape { type, envelope_id?, payload?, reason? }.
function M.on_frame(frame: any): any
    if type(frame) ~= "table" then return { kind = "noop" } end
    local t = (frame :: { type: any }).type

    if t == consts.HELLO then
        return { kind = "hello" }

    elseif t == consts.DISCONNECT then
        return { kind = "reconnect", reason = (frame :: { reason: any }).reason }

    elseif t == consts.EVENTS_API then
        local payload = (frame :: { payload: any }).payload
        local event = type(payload) == "table" and (payload :: { event: any }).event or nil
        return { kind = "event", envelope_id = (frame :: { envelope_id: any }).envelope_id, event = event }

    elseif consts.ACK_TYPES[t] then
        -- events_api is handled above; the remaining ack-required envelopes
        -- (slash_commands, interactive) only need their envelope_id echoed back.
        return { kind = "ack", envelope_id = (frame :: { envelope_id: any }).envelope_id }
    end

    return { kind = "noop" }
end

-- The ack a non-hello/non-disconnect envelope requires: echo its envelope_id.
function M.ack_payload(envelope_id: any): any
    return { envelope_id = envelope_id }
end

-- route_event(event) -> "dm" | "channel" | nil. Decides where a Slack message
-- event is dispatched, or nil to drop it before spawning a process. Only plain
-- message events with a user and no non-conversational subtype are routed; the
-- bot-author filter (allow_bot_messages) is applied authoritatively downstream in
-- the inbound receiver, so this keeps bot_id messages flowing rather than dropping
-- them here. Pure.
function M.route_event(event: any): string?
    if type(event) ~= "table" then return nil end
    if (event :: { type: any }).type ~= "message" then return nil end
    local subtype = (event :: { subtype: any }).subtype
    if type(subtype) == "string" and (subtype :: string) ~= "" then return nil end
    local user = (event :: { user: any }).user
    if type(user) ~= "string" or (user :: string) == "" then return nil end
    return (event :: { channel_type: any }).channel_type == "im" and "dm" or "channel"
end

return M
