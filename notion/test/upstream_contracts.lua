local json = require("json")
-- Independently extracted from the pinned official SDK/OpenAPI source in UPSTREAM.md.
return json.decode([=[[
  {
    "method": "POST",
    "path": "/file_uploads",
    "queryParams": [],
    "bodyParams": [
      "mode",
      "filename",
      "content_type",
      "number_of_parts",
      "external_url"
    ]
  },
  {
    "method": "GET",
    "path": "/file_uploads",
    "queryParams": [
      "status",
      "start_cursor",
      "page_size"
    ],
    "bodyParams": []
  },
  {
    "method": "POST",
    "path": "/file_uploads/{file_upload_id}/send",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "POST",
    "path": "/file_uploads/{file_upload_id}/complete",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/file_uploads/{file_upload_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "POST",
    "path": "/search",
    "queryParams": [],
    "bodyParams": [
      "sort",
      "query",
      "start_cursor",
      "page_size",
      "filter"
    ]
  },
  {
    "method": "POST",
    "path": "/pages",
    "queryParams": [
      "filter_properties"
    ],
    "bodyParams": [
      "parent",
      "properties",
      "icon",
      "cover",
      "content",
      "children",
      "markdown",
      "allow_async",
      "template",
      "position"
    ]
  },
  {
    "method": "GET",
    "path": "/pages/{page_id}",
    "queryParams": [
      "filter_properties"
    ],
    "bodyParams": []
  },
  {
    "method": "PATCH",
    "path": "/pages/{page_id}",
    "queryParams": [
      "filter_properties"
    ],
    "bodyParams": [
      "archived",
      "properties",
      "icon",
      "cover",
      "is_locked",
      "template",
      "erase_content",
      "in_trash",
      "is_archived"
    ]
  },
  {
    "method": "POST",
    "path": "/pages/{page_id}/move",
    "queryParams": [],
    "bodyParams": [
      "parent"
    ]
  },
  {
    "method": "GET",
    "path": "/pages/{page_id}/properties/{property_id}",
    "queryParams": [
      "start_cursor",
      "page_size"
    ],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/pages/{page_id}/markdown",
    "queryParams": [
      "include_transcript"
    ],
    "bodyParams": []
  },
  {
    "method": "PATCH",
    "path": "/pages/{page_id}/markdown",
    "queryParams": [],
    "bodyParams": [
      "allow_async",
      "type",
      "insert_content",
      "replace_content_range",
      "update_content",
      "replace_content"
    ]
  },
  {
    "method": "POST",
    "path": "/comments",
    "queryParams": [],
    "bodyParams": [
      "attachments",
      "display_name",
      "parent",
      "rich_text",
      "markdown",
      "discussion_id"
    ]
  },
  {
    "method": "GET",
    "path": "/comments",
    "queryParams": [
      "block_id",
      "start_cursor",
      "page_size"
    ],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/comments/{comment_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "PATCH",
    "path": "/comments/{comment_id}",
    "queryParams": [],
    "bodyParams": [
      "rich_text",
      "markdown"
    ]
  },
  {
    "method": "DELETE",
    "path": "/comments/{comment_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/users/me",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/users/{user_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/users",
    "queryParams": [
      "start_cursor",
      "page_size"
    ],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/blocks/{block_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "PATCH",
    "path": "/blocks/{block_id}",
    "queryParams": [],
    "bodyParams": [
      "archived",
      "embed",
      "type",
      "in_trash",
      "bookmark",
      "image",
      "video",
      "pdf",
      "file",
      "audio",
      "code",
      "equation",
      "divider",
      "breadcrumb",
      "tab",
      "table_of_contents",
      "link_to_page",
      "table_row",
      "heading_1",
      "heading_2",
      "heading_3",
      "heading_4",
      "paragraph",
      "bulleted_list_item",
      "numbered_list_item",
      "quote",
      "to_do",
      "toggle",
      "template",
      "callout",
      "synced_block",
      "table",
      "column"
    ]
  },
  {
    "method": "DELETE",
    "path": "/blocks/{block_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "GET",
    "path": "/blocks/{block_id}/children",
    "queryParams": [
      "start_cursor",
      "page_size"
    ],
    "bodyParams": []
  },
  {
    "method": "PATCH",
    "path": "/blocks/{block_id}/children",
    "queryParams": [],
    "bodyParams": [
      "after",
      "children",
      "position"
    ]
  },
  {
    "method": "GET",
    "path": "/databases/{database_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "PATCH",
    "path": "/databases/{database_id}",
    "queryParams": [],
    "bodyParams": [
      "parent",
      "title",
      "description",
      "is_inline",
      "icon",
      "cover",
      "in_trash",
      "is_locked"
    ]
  },
  {
    "method": "POST",
    "path": "/databases",
    "queryParams": [],
    "bodyParams": [
      "parent",
      "title",
      "description",
      "is_inline",
      "initial_data_source",
      "database_type",
      "icon",
      "cover"
    ]
  },
  {
    "method": "GET",
    "path": "/data_sources/{data_source_id}",
    "queryParams": [],
    "bodyParams": []
  },
  {
    "method": "PATCH",
    "path": "/data_sources/{data_source_id}",
    "queryParams": [],
    "bodyParams": [
      "archived",
      "title",
      "icon",
      "properties",
      "in_trash",
      "parent"
    ]
  },
  {
    "method": "POST",
    "path": "/data_sources/{data_source_id}/query",
    "queryParams": [
      "filter_properties"
    ],
    "bodyParams": [
      "archived",
      "sorts",
      "filter",
      "start_cursor",
      "page_size",
      "in_trash",
      "result_type"
    ]
  },
  {
    "method": "POST",
    "path": "/data_sources",
    "queryParams": [],
    "bodyParams": [
      "parent",
      "properties",
      "title",
      "icon"
    ]
  },
  {
    "method": "GET",
    "path": "/data_sources/{data_source_id}/templates",
    "queryParams": [
      "name",
      "start_cursor",
      "page_size"
    ],
    "bodyParams": []
  }
]]=])
