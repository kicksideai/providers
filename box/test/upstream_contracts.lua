local json = require("json")
-- Independently extracted from the pinned official SDK/OpenAPI source in UPSTREAM.md.
return json.decode([=[[
  {
    "path": "/files/{}",
    "method": "GET",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/files/{}",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/files/{}",
    "method": "PUT",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/files/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/files/{}/content",
    "method": "GET",
    "queryParams": [
      "version",
      "access_token"
    ]
  },
  {
    "path": "/files/{}/content",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/files/content",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/files/upload_sessions",
    "method": "POST",
    "queryParams": []
  },
  {
    "path": "/files/{}/upload_sessions",
    "method": "POST",
    "queryParams": []
  },
  {
    "path": "/files/upload_sessions/{}",
    "method": "GET",
    "queryParams": []
  },
  {
    "path": "/files/upload_sessions/{}",
    "method": "PUT",
    "queryParams": []
  },
  {
    "path": "/files/upload_sessions/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/files/upload_sessions/{}/parts",
    "method": "GET",
    "queryParams": [
      "offset",
      "limit"
    ]
  },
  {
    "path": "/files/upload_sessions/{}/commit",
    "method": "POST",
    "queryParams": []
  },
  {
    "path": "/files/{}/copy",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/files/{}/collaborations",
    "method": "GET",
    "queryParams": [
      "fields",
      "limit",
      "marker"
    ]
  },
  {
    "path": "/files/{}/comments",
    "method": "GET",
    "queryParams": [
      "fields",
      "limit",
      "offset"
    ]
  },
  {
    "path": "/files/{}/tasks",
    "method": "GET",
    "queryParams": []
  },
  {
    "path": "/files/{}/trash",
    "method": "GET",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/files/{}/versions",
    "method": "GET",
    "queryParams": [
      "fields",
      "limit",
      "offset"
    ]
  },
  {
    "path": "/files/{}/metadata",
    "method": "GET",
    "queryParams": [
      "view"
    ]
  },
  {
    "path": "/files/{}/metadata/{}/{}",
    "method": "GET",
    "queryParams": [
      "view"
    ]
  },
  {
    "path": "/files/{}/metadata/{}/{}",
    "method": "POST",
    "queryParams": []
  },
  {
    "path": "/files/{}/metadata/{}/{}",
    "method": "PUT",
    "queryParams": []
  },
  {
    "path": "/files/{}/metadata/{}/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/folders/{}",
    "method": "GET",
    "queryParams": [
      "fields",
      "sort",
      "direction",
      "offset",
      "limit"
    ]
  },
  {
    "path": "/folders/{}",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/folders/{}",
    "method": "PUT",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/folders/{}",
    "method": "DELETE",
    "queryParams": [
      "recursive"
    ]
  },
  {
    "path": "/folders/{}/items",
    "method": "GET",
    "queryParams": [
      "fields",
      "usemarker",
      "marker",
      "offset",
      "limit",
      "sort",
      "direction"
    ]
  },
  {
    "path": "/folders",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/folders/{}/copy",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/folders/{}/collaborations",
    "method": "GET",
    "queryParams": [
      "fields",
      "limit",
      "marker"
    ]
  },
  {
    "path": "/folders/{}/trash",
    "method": "GET",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/folders/trash/items",
    "method": "GET",
    "queryParams": [
      "fields",
      "limit",
      "offset",
      "usemarker",
      "marker",
      "direction",
      "sort"
    ]
  },
  {
    "path": "/comments/{}",
    "method": "PUT",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/comments/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/comments",
    "method": "POST",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/collaborations/{}",
    "method": "GET",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/collaborations/{}",
    "method": "PUT",
    "queryParams": []
  },
  {
    "path": "/collaborations/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/collaborations",
    "method": "POST",
    "queryParams": [
      "fields",
      "notify"
    ]
  },
  {
    "path": "/search",
    "method": "GET",
    "queryParams": [
      "query",
      "scope",
      "file_extensions",
      "created_at_range",
      "updated_at_range",
      "size_range",
      "owner_user_ids",
      "recent_updater_user_ids",
      "ancestor_folder_ids",
      "content_types",
      "type",
      "trash_content",
      "mdfilters",
      "sort",
      "direction",
      "limit",
      "include_recent_shared_links",
      "fields",
      "offset",
      "deleted_user_ids",
      "deleted_at_range"
    ]
  },
  {
    "path": "/tasks",
    "method": "POST",
    "queryParams": []
  },
  {
    "path": "/tasks/{}",
    "method": "GET",
    "queryParams": []
  },
  {
    "path": "/tasks/{}",
    "method": "PUT",
    "queryParams": []
  },
  {
    "path": "/tasks/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/tasks/{}/assignments",
    "method": "GET",
    "queryParams": []
  },
  {
    "path": "/task_assignments",
    "method": "POST",
    "queryParams": []
  },
  {
    "path": "/task_assignments/{}",
    "method": "PUT",
    "queryParams": []
  },
  {
    "path": "/task_assignments/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/users/me",
    "method": "GET",
    "queryParams": [
      "fields"
    ]
  },
  {
    "path": "/webhooks",
    "method": "GET",
    "queryParams": [
      "marker",
      "limit"
    ]
  },
  {
    "path": "/webhooks",
    "method": "POST",
    "queryParams": []
  },
  {
    "path": "/webhooks/{}",
    "method": "GET",
    "queryParams": []
  },
  {
    "path": "/webhooks/{}",
    "method": "PUT",
    "queryParams": []
  },
  {
    "path": "/webhooks/{}",
    "method": "DELETE",
    "queryParams": []
  },
  {
    "path": "/events",
    "method": "GET",
    "queryParams": [
      "stream_type",
      "stream_position",
      "limit",
      "event_type",
      "created_after",
      "created_before"
    ]
  },
  {
    "path": "/collections",
    "method": "GET",
    "queryParams": [
      "fields",
      "offset",
      "limit"
    ]
  },
  {
    "path": "/collections/{}/items",
    "method": "GET",
    "queryParams": [
      "fields",
      "offset",
      "limit"
    ]
  }
]]=])
