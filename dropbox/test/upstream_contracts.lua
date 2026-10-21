local json = require("json")
-- Extracted from Dropbox SDK lib/routes.js at the revision in UPSTREAM.md.
return json.decode([=[{
  "get_account": {
    "path": "/users/get_current_account",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": true
  },
  "get_space_usage": {
    "path": "/users/get_space_usage",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": true
  },
  "get_metadata": {
    "path": "/files/get_metadata",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "list_folder": {
    "path": "/files/list_folder",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "continue_list_folder": {
    "path": "/files/list_folder/continue",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "get_folder_cursor": {
    "path": "/files/list_folder/get_latest_cursor",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "search": {
    "path": "/files/search_v2",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "continue_search": {
    "path": "/files/search/continue_v2",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "list_revisions": {
    "path": "/files/list_revisions",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "get_temporary_link": {
    "path": "/files/get_temporary_link",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "download_file": {
    "path": "/files/download",
    "endpoint": "content",
    "mode": "download",
    "null_body": false
  },
  "export_file": {
    "path": "/files/export",
    "endpoint": "content",
    "mode": "download",
    "null_body": false
  },
  "list_shared_links": {
    "path": "/sharing/list_shared_links",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "list_shared_folders": {
    "path": "/sharing/list_folders",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "continue_shared_folders": {
    "path": "/sharing/list_folders/continue",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "list_folder_members": {
    "path": "/sharing/list_folder_members",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "continue_folder_members": {
    "path": "/sharing/list_folder_members/continue",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "create_folder": {
    "path": "/files/create_folder_v2",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "copy": {
    "path": "/files/copy_v2",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "move": {
    "path": "/files/move_v2",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "delete": {
    "path": "/files/delete_v2",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "restore_file": {
    "path": "/files/restore",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "upload_file": {
    "path": "/files/upload",
    "endpoint": "content",
    "mode": "upload",
    "null_body": false
  },
  "start_upload_session": {
    "path": "/files/upload_session/start",
    "endpoint": "content",
    "mode": "upload",
    "null_body": false
  },
  "append_upload_session": {
    "path": "/files/upload_session/append_v2",
    "endpoint": "content",
    "mode": "upload",
    "null_body": false
  },
  "finish_upload_session": {
    "path": "/files/upload_session/finish",
    "endpoint": "content",
    "mode": "upload",
    "null_body": false
  },
  "create_shared_link": {
    "path": "/sharing/create_shared_link_with_settings",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "update_shared_link": {
    "path": "/sharing/modify_shared_link_settings",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "revoke_shared_link": {
    "path": "/sharing/revoke_shared_link",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "share_folder": {
    "path": "/sharing/share_folder",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "add_folder_members": {
    "path": "/sharing/add_folder_member",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "remove_folder_member": {
    "path": "/sharing/remove_folder_member",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "update_folder_member": {
    "path": "/sharing/update_folder_member",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  },
  "unshare_folder": {
    "path": "/sharing/unshare_folder",
    "endpoint": "api",
    "mode": "rpc",
    "null_body": false
  }
}]=])
