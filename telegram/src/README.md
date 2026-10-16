# kickside.telegram

Telegram provider registry package.

The package is split into:

- `client`: Bot API HTTP client and connection-context transport.
- `connection`: connection and reply-provider contract binding.
- `inbound`: Telegram update normalization for DM/channel receivers.
- `polling`: per-connection `getUpdates` supervisor and dispatch processes.
- `traits`: agent-facing read/write tools and traits.
