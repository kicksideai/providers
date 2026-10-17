# KickSide Fireflies

API-key connection provider for [Fireflies.ai](https://fireflies.ai) meeting
transcripts.

- **Connection** — a stored API key (`kickside.connection:connection` binding,
  generic credential form). `test_connection` verifies the key against the
  Fireflies GraphQL API; `discover_resources` lists recent transcripts.
- **Transport** — a thin GraphQL client over `https://api.fireflies.ai/graphql`
  (Bearer token).
- **Reader trait** (`Fireflies Reader`) — gives an agent the `FirefliesRead`
  tool: `get_user`, `list_transcripts`, `get_transcript`, `get_transcript_text`.

- **Record writer** (`kickside.fireflies.writer`) — the one write Fireflies has:
  `updateMeetingTitle`. It is offered as a general capability, describing itself
  as one system, one record kind (`transcript`) and one writable field (`title`),
  so a product that renames a call can carry that name back to Fireflies without
  knowing whose API is behind it. There is no mutation for speaker names or
  transcript text, and none is faked: a request for any other field is refused by
  name.

Everything else the provider does is read-only, and the write is one field.
Polling / source-sync of new transcripts belongs to a module-owned data stream or
source-sync; this provider owns the connection, the transport, and the faces
above.
