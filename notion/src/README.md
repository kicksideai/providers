# kickside/notion

Native Wippy HTTP driver for Notion. No shell, host SDK, or native executable is required.

## Connect

Install the package. In Settings → Integrations configure an OAuth app client ID and secret, then authorize Notion in Connections. The host supplies `kickside.notion:env_storage` and the OAuth database, authenticated/public routers, process host, and environment storage. Alternatively create an access-token connection. Tokens remain private. The OAuth app and token need the provider permissions for each operation.

Add **Notion Reader** and/or **Notion Writer** to an agent, and select the account in the capability picker. Writers require component WRITE access. An ambiguous account selection fails. List results expose native pagination and `next_cursor` where available. Reuse the provider cursor parameter on the next call.

Notion integrations must be connected to the target pages. API version is pinned to `2025-09-03`; database containers and data sources use distinct endpoints and IDs.

## Operations

| Capability | Action | Required params |
|---|---|---|
| Reader | `get_me` |  |
| Reader | `list_users` |  |
| Reader | `get_user` | `user_id` |
| Reader | `search` |  |
| Reader | `get_page` | `page_id` |
| Reader | `get_page_property` | `page_id`, `property_id` |
| Reader | `get_page_markdown` | `page_id` |
| Reader | `get_block` | `block_id` |
| Reader | `list_block_children` | `block_id` |
| Reader | `get_database` | `database_id` |
| Reader | `get_data_source` | `data_source_id` |
| Reader | `list_data_source_templates` | `data_source_id` |
| Reader | `query_data_source` | `data_source_id` |
| Reader | `list_comments` | `block_id` |
| Reader | `get_file_upload` | `file_upload_id` |
| Reader | `list_file_uploads` |  |
| Writer | `create_page` | `parent`, `properties` |
| Writer | `update_page` | `page_id` |
| Writer | `update_page_markdown` | `page_id`, `type` |
| Writer | `append_block_children` | `block_id`, `children` |
| Writer | `update_block` | `block_id` |
| Writer | `delete_block` | `block_id` |
| Writer | `create_database` | `parent` |
| Writer | `update_database` | `database_id` |
| Writer | `create_data_source` | `parent`, `properties` |
| Writer | `update_data_source` | `data_source_id` |
| Writer | `create_comment` | `rich_text` |
| Writer | `create_file_upload` |  |
| Writer | `complete_file_upload` | `file_upload_id` |
| Writer | `send_file_upload` | `file_upload_id`, `content_base64` |
| Reader | `get_comment` | `comment_id` |
| Writer | `update_comment` | `comment_id`, `rich_text` |
| Writer | `delete_comment` | `comment_id` |
| Writer | `move_page` | `page_id`, `parent` |

Tool schemas specify optional fields and provider-native nested structures. Read/get returns full provider records. API availability depends on workspace plan and scopes. Webhook-management actions manage provider subscriptions; inbound event processing is a separate host integration.

## Files and limits

Binary file actions use `content_base64`. Each HTTP request has a 30-second timeout narrowed by the caller deadline, a 10 MiB response limit, and an 8 MiB decoded upload limit. Dropbox upload sessions support larger files as bounded chunks. Box upload sessions support larger files as provider-sized parts, with computed part SHA-1, Content-Range, and explicit whole-file SHA-1 on commit. A 202 commit is pending; follow the provider delay and retry the same commit. Enterprise administration is outside this package. Downloads follow the host HTTP client's redirect policy. Provider URLs and routes are selected by the module, never by tool callers.

## Validation

`make lockrefresh lint test`; `make test-pg` uses the PostgreSQL profile. Tests use deterministic API fixtures; live tenant validation requires a provider account and is reported separately.

## Port provenance

See `UPSTREAM.md` for driver sources, pinned revisions, and license attribution. Endpoint behavior is adapted to Kickside components and capabilities rather than running upstream CLI code.

# Upstream driver provenance

Adapted for Kickside from [makenotion/notion-sdk-js](https://github.com/makenotion/notion-sdk-js/tree/0ffdbba3004b27438ca72df769412268e4fdede1), revision `0ffdbba3004b27438ca72df769412268e4fdede1`.

References:

- [`src/api-endpoints`](https://github.com/makenotion/notion-sdk-js/blob/0ffdbba3004b27438ca72df769412268e4fdede1/src/api-endpoints)
- [`src/Client.ts`](https://github.com/makenotion/notion-sdk-js/blob/0ffdbba3004b27438ca72df769412268e4fdede1/src/Client.ts)

License: MIT. Endpoint definitions, DTO fields, and protocol conventions were ported to native Wippy HTTP. The original host SDK is not executed or installed. Local modifications add component access checks, namespace declarations, schemas, split traits, and bounded binary transfers.

Upstream license notice:

```text
Copyright 2021 Notion Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

```
