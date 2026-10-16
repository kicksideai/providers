# kickside/discord

Discord connection provider for KickSide.

It owns:

- a `kickside.connection:connection` binding for bot-token health checks and
  resource discovery
- a `kickside.connection:reply_provider` binding for sending messages back to
  Discord channels
- a normalized inbound adapter for Discord `MESSAGE_CREATE`-style events that
  calls `kickside.dm:receive`
- a polled `kickside.data:pullable` source, published as the `channel_messages`
  port (`kickside.discord.source:channel_messages`) backed by
  `kickside.discord.source:messages_source`, that pulls a channel's messages on a
  snowflake cursor — full backfill, edit re-emission via `source_version`,
  deletion propagation via the reconcile `pull_keys` listing, and 429s surfaced
  as `retry_after_ms` for the engine's pacing
- a `kickside.data:writable` sink, published as the `channel_message` port
  (`kickside.discord.sink:channel_message`) backed by
  `kickside.discord.sink:message_sink`, that converges items onto channel
  messages: post on first delivery (returning the message id as `dest_ref`), edit
  in place on redelivery with a `dest_ref`, delete by `dest_ref`

Known gap: a real-time trigger source over the Discord gateway websocket (a
trigger source port fed by the existing gateway hub) is not implemented yet —
the polled `channel_messages` port above is the only data-sync entry point. The
source and sink `channel_id` is a plain form field for now; a shared Discord
channel-picker web component is a follow-up.

Inbound Discord messages are Gateway events, not ordinary webhooks. The gateway
process passes the connection component id and event into
`kickside.discord.inbound:receive_message` as the system gateway process; DM
resolves the sender from the link and handles thread ownership, idempotency, and
session routing.
