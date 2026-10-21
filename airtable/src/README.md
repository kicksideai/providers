# kickside/airtable

Native Wippy HTTP driver for Airtable. No shell, host SDK, or native executable is required.

## Connect

Install the package. In Settings → Integrations configure an OAuth app client ID and secret, then authorize Airtable in Connections. The host supplies `kickside.airtable:env_storage` and the OAuth database, authenticated/public routers, process host, and environment storage. Alternatively create an access-token connection. Tokens remain private. The OAuth app and token need the provider permissions for each operation.

Add **Airtable Reader** and/or **Airtable Writer** to an agent, and select the account in the capability picker. Writers require component WRITE access. An ambiguous account selection fails. List results expose native pagination and `next_cursor` where available. Reuse the provider cursor parameter on the next call.

Use `clear_record_fields` with field names or IDs to clear cell values with JSON null.

## Operations

| Capability | Action | Required params |
|---|---|---|
| Reader | `get_identity` |  |
| Reader | `list_bases` |  |
| Reader | `list_tables` | `base_id` |
| Reader | `list_records` | `base_id`, `table_id` |
| Reader | `get_record` | `base_id`, `table_id`, `record_id` |
| Writer | `create_records` | `base_id`, `table_id`, `records` |
| Writer | `update_records` | `base_id`, `table_id`, `records` |
| Writer | `replace_records` | `base_id`, `table_id`, `records` |
| Writer | `delete_records` | `base_id`, `table_id`, `records` |
| Writer | `create_base` | `name`, `workspaceId`, `tables` |
| Writer | `create_table` | `base_id`, `name`, `fields` |
| Writer | `update_table` | `base_id`, `table_id` |
| Writer | `create_field` | `base_id`, `table_id`, `name`, `type` |
| Writer | `update_field` | `base_id`, `table_id`, `field_id` |
| Reader | `list_comments` | `base_id`, `table_id`, `record_id` |
| Writer | `create_comment` | `base_id`, `table_id`, `record_id`, `text` |
| Writer | `update_comment` | `base_id`, `table_id`, `record_id`, `comment_id`, `text` |
| Writer | `delete_comment` | `base_id`, `table_id`, `record_id`, `comment_id` |
| Reader | `list_webhooks` | `base_id` |
| Writer | `create_webhook` | `base_id`, `specification` |
| Writer | `refresh_webhook` | `base_id`, `webhook_id` |
| Writer | `delete_webhook` | `base_id`, `webhook_id` |
| Reader | `list_webhook_payloads` | `base_id`, `webhook_id` |
| Writer | `upload_attachment` | `base_id`, `record_id`, `field_id`, `contentType`, `file`, `filename` |
| Writer | `clear_record_fields` | `base_id`, `table_id`, `record_id`, `clear_fields` |

Tool schemas specify optional fields and provider-native nested structures. Read/get returns full provider records. API availability depends on workspace plan and scopes. Webhook-management actions manage provider subscriptions; inbound event processing is a separate host integration. Webhook MAC signing secrets are redacted from agent results; signature-verifying receivers provision and retain credentials through their own server-side integration.

## Request limits

HTTP requests have a 30-second timeout narrowed by the caller deadline and a 10 MiB response limit. A network failure after a write has an unknown outcome; it is not replayed automatically. Provider 429 responses retain their rate-limit delay.

## Validation

`make lockrefresh lint test`; `make test-pg` uses the PostgreSQL profile. Tests use deterministic API fixtures; live tenant validation requires a provider account and is reported separately.

## Port provenance

See `UPSTREAM.md` for driver sources, pinned revisions, and license attribution. Endpoint behavior is adapted to Kickside components and capabilities rather than running upstream CLI code.

# Upstream driver provenance

Adapted for Kickside from [Airtable/airtable.js](https://github.com/Airtable/airtable.js/tree/55cc755fa4f54e20927579a954c161ac2fe81135), revision `55cc755fa4f54e20927579a954c161ac2fe81135`.

References:

- [`src/query_params.ts`](https://github.com/Airtable/airtable.js/blob/55cc755fa4f54e20927579a954c161ac2fe81135/src/query_params.ts)
- [`src/table.ts`](https://github.com/Airtable/airtable.js/blob/55cc755fa4f54e20927579a954c161ac2fe81135/src/table.ts)
- [`src/record.ts`](https://github.com/Airtable/airtable.js/blob/55cc755fa4f54e20927579a954c161ac2fe81135/src/record.ts)

License: MIT. Endpoint definitions, DTO fields, and protocol conventions were ported to native Wippy HTTP. The original host SDK is not executed or installed. Local modifications add component access checks, namespace declarations, schemas, split traits, and bounded binary transfers.

Upstream license notice:

```text
Copyright (c) 2018-2019 Airtable https://airtable.com

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

```
