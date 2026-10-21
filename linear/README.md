# kickside/linear

Native Wippy HTTP driver for Linear. No shell, host SDK, or native executable is required.

## Connect

Install the package. In Settings → Integrations configure an OAuth app client ID and secret, then authorize Linear in Connections. The host supplies `kickside.linear:env_storage` and the OAuth database, authenticated/public routers, process host, and environment storage. Alternatively create an access-token connection. Tokens remain private. The OAuth app and token need the provider permissions for each operation.

Add **Linear Reader** and/or **Linear Writer** to an agent, and select the account in the capability picker. Writers require component WRITE access. An ambiguous account selection fails. List results expose native pagination and `next_cursor` where available. Reuse the provider cursor parameter on the next call.

Linear uses closed GraphQL documents with variables; callers cannot submit arbitrary GraphQL. HTTP 200 GraphQL errors are failures.

Personal API keys use Linear's raw Authorization header; OAuth access tokens use Bearer authentication. To remove nullable values, use the update action's allowlisted `clear_fields`; an explicit empty label array clears labels.

## Operations

| Capability | Action | Required params |
|---|---|---|
| Reader | `get_viewer` |  |
| Reader | `list_issues` |  |
| Reader | `get_issue` | `id` |
| Reader | `list_teams` |  |
| Reader | `get_team` | `id` |
| Reader | `list_users` |  |
| Reader | `get_user` | `id` |
| Reader | `list_projects` |  |
| Reader | `get_project` | `id` |
| Reader | `list_cycles` |  |
| Reader | `get_cycle` | `id` |
| Reader | `list_comments` |  |
| Reader | `get_comment` | `id` |
| Reader | `list_documents` |  |
| Reader | `get_document` | `id` |
| Reader | `list_labels` |  |
| Reader | `get_label` | `id` |
| Reader | `list_workflow_states` |  |
| Reader | `get_workflow_state` | `id` |
| Reader | `search_issues` | `query` |
| Writer | `create_issue` | `input` |
| Writer | `update_issue` | `input`, `id` |
| Writer | `create_project` | `input` |
| Writer | `update_project` | `input`, `id` |
| Writer | `create_cycle` | `input` |
| Writer | `update_cycle` | `input`, `id` |
| Writer | `create_comment` | `input` |
| Writer | `update_comment` | `input`, `id` |
| Writer | `create_document` | `input` |
| Writer | `update_document` | `input`, `id` |
| Writer | `create_label` | `input` |
| Writer | `update_label` | `input`, `id` |
| Writer | `archive_issue` | `id` |
| Writer | `unarchive_issue` | `id` |
| Writer | `delete_issue` | `id` |
| Writer | `archive_project` | `id` |
| Writer | `unarchive_project` | `id` |
| Writer | `delete_project` | `id` |
| Writer | `delete_comment` | `id` |
| Writer | `delete_document` | `id` |
| Writer | `delete_label` | `id` |
| Writer | `delete_issueRelation` | `id` |
| Writer | `create_issue_relation` | `input` |

Tool schemas specify optional fields and provider-native nested structures. Read/get returns full provider records. API availability depends on workspace plan and scopes. Webhook-management actions manage provider subscriptions; inbound event processing is a separate host integration.

## Request limits

HTTP requests have a 30-second timeout narrowed by the caller deadline and a 10 MiB response limit. A network failure after a write has an unknown outcome; it is not replayed automatically. Provider 429 responses retain their rate-limit delay.

## Validation

`make lockrefresh lint test`; `make test-pg` uses the PostgreSQL profile. Tests use deterministic API fixtures; live tenant validation requires a provider account and is reported separately.

## Port provenance

See `UPSTREAM.md` for driver sources, pinned revisions, and license attribution. Endpoint behavior is adapted to Kickside components and capabilities rather than running upstream CLI code.
