# kickside/slack

Slack connection provider for KickSide.

It owns:

- a `kickside.connection:connection` binding for bot-token health checks and
  resource discovery
- a `kickside.connection:reply_provider` binding for sending messages back to
  Slack channels
- a normalized inbound adapter for Slack message events that calls
  `kickside.dm:receive` (DMs) and `kickside.channel:receive` (channels)

Inbound Slack messages arrive over Socket Mode, not ordinary webhooks. The socket
process opens a connection per Slack bot (via `apps.connections.open` with the
app-level token), receives Events API envelopes, acknowledges each, and passes the
connection component id and event into the inbound adapter as the system socket
process; DM resolves the sender from the link and handles thread ownership,
idempotency, and session routing.
