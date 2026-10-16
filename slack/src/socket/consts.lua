local endpoints = require("endpoints")
-- Slack Socket Mode wire constants. Kept apart from the Web API
-- `kickside.slack.client:types` so the socket transport has one source for the
-- protocol it speaks.
local M = {}

-- apps.connections.open mints a fresh, single-use wss url; the app-level token
-- (xapp-) authenticates it via the Authorization header.
function M.open_url(): string
    return endpoints.get("kickside.slack:endpoints", "socket")
end

-- Inbound envelope types Slack sends over the socket.
M.HELLO = "hello"
M.EVENTS_API = "events_api"
M.DISCONNECT = "disconnect"
M.SLASH_COMMANDS = "slash_commands"
M.INTERACTIVE = "interactive"

-- Envelope types that must be acknowledged by echoing { envelope_id } within 3s.
-- hello and disconnect are never acked. (Valid disconnect.reason values are
-- warning, refresh_requested, link_disabled, too_many_websockets; the worker
-- treats them all the same -- drop and re-open -- so they need no table.)
M.ACK_TYPES = {
    events_api = true,
    slash_commands = true,
    interactive = true,
}

-- Process registry name the socket hub registers itself under, so the connection
-- lifecycle handler can wake it for an immediate reconcile.
M.HUB_NAME = "kickside.slack.socket.hub"

return M
