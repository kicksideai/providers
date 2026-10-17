# KickSide Atlassian

Jira and Confluence provider for KickSide.

## Auth

Two connection modes resolve to a single authenticated transport, so the service
and tool layers never branch on auth:

- **OAuth (3LO)** — self-declared `oauth_provider: atlassian`, discovered by
  `kickside/oauth` and run through `kickside.oauth:base_connector`. Tokens are
  stored and refreshed by the oauth subsystem, keyed by the connection
  `component_id`. `transport.connect` resolves the Atlassian `cloudId` from
  `/oauth/token/accessible-resources` to build the `api.atlassian.com/ex` base.
- **Stored credentials** — one `kickside.connection:connection` binding
  (`provider: atlassian`) covers both Jira and Confluence. Cloud uses Basic
  `email:api_token`; Server/Data Center uses Bearer PAT. Secrets live in the
  connection component's `private_context`.

## Layout

- `core/` — shared transport (auth + HTTP), site/base-url resolution, types.
- `connection/` — shared Atlassian connection binding and live Jira/Confluence
  resource discovery.
- `jira/` — Jira REST client and agent traits/tools.
- `confluence/` — Confluence REST client and agent traits/tools.

## Planes

- **A — agent tools**: JiraRead/JiraWrite, ConfluenceRead/ConfluenceWrite over
  OAuth or credential connections.
- **B — source flows**: pullable source ports expose Jira issues and Confluence pages.
  Data Sync selects the connection and source configuration; the shared
  Automation engine owns scheduling, cursors, rounds, and delivery.

## Jira source payload and cursor

The Jira Issues port declares the fields in `item.payload` as its output schema.
Pull envelopes carry `item_key`, `dedup_key`, `op`, and `source_version` separately.
`issue_priority` contains the Jira priority name; `properties.priority` retains
its original object. Content destinations can use `title`, `content`, and
`content_type` directly with a pass-through transform.

Cloud search uses `nextPageToken` and `isLast`. Each nonfinal cursor holds the
continuation token, the fixed JQL query, and the greatest observed update time.
A resumed or replayed page uses that same query. The final cursor clears the
page position and starts live polling after the committed update watermark.
Server/Data Center search retains `startAt` pagination with the same fixed-query
behavior. JiraRead and the Jira source render ADF descriptions as readable text, preserving
inline boundaries and line breaks. JiraRead also renders ADF comment bodies.
