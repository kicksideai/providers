# kickside/box

Native Wippy HTTP driver for Box. No shell, host SDK, or native executable is required.

## Connect

Install the package. In Settings → Integrations configure an OAuth app client ID and secret, then authorize Box in Connections. The host supplies `kickside.box:env_storage` and the OAuth database, authenticated/public routers, process host, and environment storage. Alternatively create an access-token connection. Tokens remain private. The OAuth app and token need the provider permissions for each operation.

Add **Box Reader** and/or **Box Writer** to an agent, and select the account in the capability picker. Writers require component WRITE access. An ambiguous account selection fails. List results expose native pagination and `next_cursor` where available. Reuse the provider cursor parameter on the next call.

## Operations

| Capability | Action | Required params |
|---|---|---|
| Reader | `get_me` |  |
| Reader | `get_file` | `file_id` |
| Reader | `get_folder` | `folder_id` |
| Reader | `list_folder_items` | `folder_id` |
| Reader | `search` | `query` |
| Reader | `download_file` | `file_id` |
| Reader | `get_download_url` | `file_id` |
| Reader | `list_file_versions` | `file_id` |
| Reader | `list_file_comments` | `file_id` |
| Reader | `list_file_collaborations` | `file_id` |
| Reader | `list_folder_collaborations` | `folder_id` |
| Reader | `get_collaboration` | `collaboration_id` |
| Reader | `list_collections` |  |
| Reader | `list_collection_items` | `collection_id` |
| Reader | `list_trash` |  |
| Reader | `get_trashed_file` | `file_id` |
| Reader | `get_trashed_folder` | `folder_id` |
| Reader | `list_file_metadata` | `file_id` |
| Reader | `get_file_metadata` | `file_id`, `scope`, `template_key` |
| Reader | `list_events` |  |
| Reader | `list_tasks` | `file_id` |
| Reader | `get_task` | `task_id` |
| Reader | `list_task_assignments` | `task_id` |
| Reader | `list_webhooks` |  |
| Reader | `get_webhook` | `webhook_id` |
| Writer | `create_folder` | `name`, `parent` |
| Writer | `update_file` | `file_id` |
| Writer | `copy_file` | `file_id`, `parent` |
| Writer | `delete_file` | `file_id` |
| Writer | `restore_file` | `file_id` |
| Writer | `update_folder` | `folder_id` |
| Writer | `copy_folder` | `folder_id`, `parent` |
| Writer | `delete_folder` | `folder_id` |
| Writer | `restore_folder` | `folder_id` |
| Writer | `upload_file` | `name`, `parent_id`, `content_base64` |
| Writer | `upload_file_version` | `file_id`, `content_base64` |
| Writer | `create_comment` | `item`, `message` |
| Writer | `update_comment` | `comment_id`, `message` |
| Writer | `delete_comment` | `comment_id` |
| Writer | `create_collaboration` | `item`, `accessible_by`, `role` |
| Writer | `update_collaboration` | `collaboration_id` |
| Writer | `delete_collaboration` | `collaboration_id` |
| Writer | `create_file_metadata` | `file_id`, `scope`, `template_key`, `metadata` |
| Writer | `update_file_metadata` | `file_id`, `scope`, `template_key`, `operations` |
| Writer | `delete_file_metadata` | `file_id`, `scope`, `template_key` |
| Writer | `create_task` | `item` |
| Writer | `update_task` | `task_id` |
| Writer | `delete_task` | `task_id` |
| Writer | `create_task_assignment` | `task`, `assign_to` |
| Writer | `update_task_assignment` | `task_assignment_id` |
| Writer | `delete_task_assignment` | `task_assignment_id` |
| Writer | `create_webhook` | `target`, `address`, `triggers` |
| Writer | `update_webhook` | `webhook_id` |
| Writer | `delete_webhook` | `webhook_id` |
| Writer | `create_upload_session` | `folder_id`, `file_size`, `file_name` |
| Writer | `create_file_version_upload_session` | `file_id`, `file_size` |
| Reader | `get_upload_session` | `upload_session_id` |
| Reader | `list_upload_session_parts` | `upload_session_id` |
| Writer | `upload_session_part` | `upload_session_id`, `offset`, `total_size`, `content_base64` |
| Writer | `commit_upload_session` | `upload_session_id`, `parts`, `sha1_base64` |
| Writer | `abort_upload_session` | `upload_session_id` |
| Writer | `remove_file_shared_link` | `file_id` |
| Writer | `remove_folder_shared_link` | `folder_id` |

Tool schemas specify optional fields and provider-native nested structures. Read/get returns full provider records. API availability depends on workspace plan and scopes. Webhook-management actions manage provider subscriptions; inbound event processing is a separate host integration.

## Files and limits

Binary file actions use `content_base64`. Each HTTP request has a 30-second timeout narrowed by the caller deadline, a 10 MiB response limit, and an 8 MiB decoded upload limit. Dropbox upload sessions support larger files as bounded chunks. Box upload sessions support larger files as provider-sized parts, with computed part SHA-1, Content-Range, and explicit whole-file SHA-1 on commit. A 202 commit is pending; follow the provider delay and retry the same commit. Enterprise administration is outside this package. Downloads follow the host HTTP client's redirect policy. Provider URLs and routes are selected by the module, never by tool callers.

## Validation

`make lockrefresh lint test`; `make test-pg` uses the PostgreSQL profile. Tests use deterministic API fixtures; live tenant validation requires a provider account and is reported separately.

## Port provenance

See `UPSTREAM.md` for driver sources, pinned revisions, and license attribution. Endpoint behavior is adapted to Kickside components and capabilities rather than running upstream CLI code.
