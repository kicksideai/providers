# kickside/dropbox

Native Wippy HTTP driver for Dropbox. No shell, host SDK, or native executable is required.

## Connect

Install the package. In Settings → Integrations configure an OAuth app client ID and secret, then authorize Dropbox in Connections. The host supplies `kickside.dropbox:env_storage` and the OAuth database, authenticated/public routers, process host, and environment storage. Alternatively create an access-token connection. Tokens remain private. The OAuth app and token need the provider permissions for each operation.

Add **Dropbox Reader** and/or **Dropbox Writer** to an agent, and select the account in the capability picker. Writers require component WRITE access. An ambiguous account selection fails. List results expose native pagination and `next_cursor` where available. Reuse the provider cursor parameter on the next call.

## Operations

| Capability | Action | Required params |
|---|---|---|
| Reader | `get_account` |  |
| Reader | `get_space_usage` |  |
| Reader | `get_metadata` | `path` |
| Reader | `list_folder` | `path` |
| Reader | `continue_list_folder` | `cursor` |
| Reader | `get_folder_cursor` | `path` |
| Reader | `search` | `query` |
| Reader | `continue_search` | `cursor` |
| Reader | `list_revisions` | `path` |
| Reader | `get_temporary_link` | `path` |
| Reader | `download_file` | `path` |
| Reader | `export_file` | `path` |
| Reader | `list_shared_links` |  |
| Reader | `list_shared_folders` |  |
| Reader | `continue_shared_folders` | `cursor` |
| Reader | `list_folder_members` | `shared_folder_id` |
| Reader | `continue_folder_members` | `cursor` |
| Writer | `create_folder` | `path` |
| Writer | `copy` | `from_path`, `to_path` |
| Writer | `move` | `from_path`, `to_path` |
| Writer | `delete` | `path` |
| Writer | `restore_file` | `path`, `rev` |
| Writer | `upload_file` | `path`, `content_base64` |
| Writer | `start_upload_session` | `content_base64` |
| Writer | `append_upload_session` | `content_base64`, `cursor` |
| Writer | `finish_upload_session` | `content_base64`, `cursor`, `commit` |
| Writer | `create_shared_link` | `path` |
| Writer | `update_shared_link` | `url`, `settings` |
| Writer | `revoke_shared_link` | `url` |
| Writer | `share_folder` | `path` |
| Writer | `add_folder_members` | `shared_folder_id`, `members` |
| Writer | `remove_folder_member` | `shared_folder_id`, `member`, `leave_a_copy` |
| Writer | `update_folder_member` | `shared_folder_id`, `member`, `access_level` |
| Writer | `unshare_folder` | `shared_folder_id` |

Tool schemas specify optional fields and provider-native nested structures. Read/get returns full provider records. API availability depends on workspace plan and scopes. Webhook-management actions manage provider subscriptions; inbound event processing is a separate host integration.

## Files and limits

Binary file actions use `content_base64`. Each HTTP request has a 30-second timeout narrowed by the caller deadline, a 10 MiB response limit, and an 8 MiB decoded upload limit. Dropbox upload sessions support larger files as bounded chunks. Box upload sessions support larger files as provider-sized parts, with computed part SHA-1, Content-Range, and explicit whole-file SHA-1 on commit. A 202 commit is pending; follow the provider delay and retry the same commit. Enterprise administration is outside this package. Downloads follow the host HTTP client's redirect policy. Provider URLs and routes are selected by the module, never by tool callers.

## Validation

`make lockrefresh lint test`; `make test-pg` uses the PostgreSQL profile. Tests use deterministic API fixtures; live tenant validation requires a provider account and is reported separately.

## Port provenance

See `UPSTREAM.md` for driver sources, pinned revisions, and license attribution. Endpoint behavior is adapted to Kickside components and capabilities rather than running upstream CLI code.

# Upstream driver provenance

Adapted for Kickside from [dropbox/dropbox-sdk-js](https://github.com/dropbox/dropbox-sdk-js/tree/f48aa0db51951913bb65d3691b87174f1bd212d3), revision `f48aa0db51951913bb65d3691b87174f1bd212d3`.

References:

- [`lib/routes.js`](https://github.com/dropbox/dropbox-sdk-js/blob/f48aa0db51951913bb65d3691b87174f1bd212d3/lib/routes.js)

License: MIT. Endpoint definitions, DTO fields, and protocol conventions were ported to native Wippy HTTP. The original host SDK is not executed or installed. Local modifications add component access checks, namespace declarations, schemas, split traits, and bounded binary transfers.

Upstream license notice:

```text
Copyright (c) 2020 Dropbox Inc., http://www.dropbox.com/

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
