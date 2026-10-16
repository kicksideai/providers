# KickSide HubSpot

Private-app-token connection provider for the [HubSpot](https://hubspot.com) CRM.

- **Connection** — a stored private-app access token (`kickside.connection:connection`
  binding, generic credential form). `test_connection` verifies the token against
  the HubSpot account-info API; `discover_resources` lists the supported CRM object
  types.
- **Transport** — a thin REST client over `https://api.hubapi.com` (Bearer token):
  `crm/v3/objects` (list/get/search/create/update/archive), `crm/v3/owners`,
  `crm/v3/properties` (schema), and `crm/v4` associations. The client honors
  429 retry windows within the caller's RFC3339 deadline, narrows each request
  timeout to the remaining time, and returns retriable `rate_limited` with
  `retry_after_ms` when a 429 wait does not fit. It decodes 200/201/204 honestly, and
  builds incremental search bodies with the configured object watermark property `>= watermark`.
- **Source ports** — pull contacts, companies, deals, tasks, meetings, notes,
  emails, and calls as raw HubSpot records with normalized provenance
  (`external_source`, `external_id`, `external_version`) and a backfill-to-live
  cursor. Engagement objects (meetings, notes, emails, calls) are pull-only and
  carry their associated contact/deal ids, hydrated through paged batch reads.
  A generic typed association source pulls directed edges between any two
  object types, bounded to the requested item limit and resumed by stable
  association identity. Each emitted payload carries its own edge's endpoints
  and association type. Engagement hydration drains each input's continuations;
  a failed association read fails the page instead of returning an empty set.
- **Sink port** — writes raw HubSpot properties for contact/company/deal upsert
  and task-backed activity logs. Mapping is declared config for the mapping
  artifact; the provider does not transform canonical fields on write.
- **Config** — per-object enabled/direction, `watermark_property`, property
  selection, and editable `hubspot_property -> canonical field` map data seeded
  from production GTM/ICP/NPS property names. Defaults: contacts use
  `lastmodifieddate`; all other object types use `hs_lastmodifieddate`.
  Set `all_properties: true` (or select `["*"]` for one object) for a portal
  schema mirror. The source discovers every readable property and hydrates
  records with bounded batch reads.
- **Reader trait** (`HubSpot Reader`) — `HubSpotRead`: list, get, and search all
  eight object types (contacts / companies / deals / tasks / meetings / notes /
  emails / calls), plus owners and paged property schemas.
- **Writer trait** (`HubSpot Writer`) — `HubSpotWrite`: create, update, archive
  contacts / companies / deals / tasks and create associations; engagement objects
  are pull-only. Gate it behind the inbox for suggest-only flows.

Read and write are separate traits/tools so an agent can be granted suggest-only
(Reader) or write-through (Reader + Writer) access. Sync routines / polling are
module-owned data streams or source-syncs that use these traits/tools; this provider
only owns the connection and transport.

## Writable origins and schema creation

Calls through `kickside.data:writable` require an explicit `origin`. A round
supplies its automation ID; non-round producers supply a stable explicit origin. Writable
sink implementations use the shared `kickside.data:writable_sink` origin
check to reject missing origins or a mismatch with `automation_ref.id`.
The HubSpot adapter does not enforce this origin check itself.
This writable origin is separate from the source payload's backfill/live marker.
Fresh provider installs create the final SQLite and PostgreSQL schemas
directly without legacy conversion paths.
