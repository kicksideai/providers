local json = require("json")
local endpoints = require("endpoints")
local types = require("types")

-- Closed provider operations ported from the upstream schemas documented in README.
local config = json.decode([=[{
  "title": "Notion",
  "endpoints": {
    "api": "https://api.notion.com/v1"
  },
  "headers": {
    "Notion-Version": "2025-09-03"
  },
  "operations": {
    "get_me": {
      "method": "GET",
      "path": "/users/me",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "list_users": {
      "method": "GET",
      "path": "/users",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "start_cursor",
        "page_size"
      ],
      "body": [],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "get_user": {
      "method": "GET",
      "path": "/users/{user_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "user_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "search": {
      "method": "POST",
      "path": "/search",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string"
          },
          "sort": {
            "type": "object",
            "properties": {
              "direction": {
                "type": "string",
                "enum": [
                  "ascending",
                  "descending"
                ]
              },
              "timestamp": {
                "type": "string",
                "enum": [
                  "last_edited_time"
                ]
              }
            },
            "required": [
              "direction",
              "timestamp"
            ],
            "additionalProperties": false
          },
          "filter": {
            "type": "object",
            "properties": {
              "value": {
                "type": "string",
                "enum": [
                  "page",
                  "data_source"
                ]
              },
              "property": {
                "type": "string",
                "enum": [
                  "object"
                ]
              }
            },
            "required": [
              "value",
              "property"
            ],
            "additionalProperties": false
          },
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "query",
        "sort",
        "filter",
        "start_cursor",
        "page_size"
      ],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "get_page": {
      "method": "GET",
      "path": "/pages/{page_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "page_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "page_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "get_page_property": {
      "method": "GET",
      "path": "/pages/{page_id}/properties/{property_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "page_id": {
            "type": "string",
            "minLength": 1
          },
          "property_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "page_id",
          "property_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "start_cursor",
        "page_size"
      ],
      "body": [],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "get_page_markdown": {
      "method": "GET",
      "path": "/pages/{page_id}/markdown",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "page_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "page_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "get_block": {
      "method": "GET",
      "path": "/blocks/{block_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "block_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "list_block_children": {
      "method": "GET",
      "path": "/blocks/{block_id}/children",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "block_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "block_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "start_cursor",
        "page_size"
      ],
      "body": [],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "get_database": {
      "method": "GET",
      "path": "/databases/{database_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "database_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "database_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "get_data_source": {
      "method": "GET",
      "path": "/data_sources/{data_source_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "data_source_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "data_source_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "list_data_source_templates": {
      "method": "GET",
      "path": "/data_sources/{data_source_id}/templates",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "data_source_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "data_source_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "start_cursor",
        "page_size"
      ],
      "body": [],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "query_data_source": {
      "method": "POST",
      "path": "/data_sources/{data_source_id}/query",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "filter": {
            "type": "object",
            "additionalProperties": true
          },
          "sorts": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "filter_properties": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 100
          },
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "data_source_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "data_source_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "filter_properties"
      ],
      "body": [
        "filter",
        "sorts",
        "start_cursor",
        "page_size"
      ],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "list_comments": {
      "method": "GET",
      "path": "/comments",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "minLength": 1
          },
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          }
        },
        "required": [
          "block_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "block_id",
        "start_cursor",
        "page_size"
      ],
      "body": [],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "get_file_upload": {
      "method": "GET",
      "path": "/file_uploads/{file_upload_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "file_upload_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_upload_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "list_file_uploads": {
      "method": "GET",
      "path": "/file_uploads",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "pending",
              "uploaded",
              "expired",
              "failed"
            ]
          },
          "start_cursor": {
            "type": "string",
            "minLength": 1
          },
          "page_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "status",
        "start_cursor",
        "page_size"
      ],
      "body": [],
      "cursor_field": "next_cursor",
      "has_more_field": "has_more"
    },
    "create_page": {
      "method": "POST",
      "path": "/pages",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "properties": {
            "type": "object",
            "additionalProperties": true
          },
          "children": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "icon": {
            "type": "object",
            "additionalProperties": true
          },
          "cover": {
            "type": "object",
            "additionalProperties": true
          },
          "markdown": {
            "type": "string"
          },
          "template": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "parent",
          "properties"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "parent",
        "properties",
        "children",
        "icon",
        "cover",
        "markdown",
        "template"
      ]
    },
    "update_page": {
      "method": "PATCH",
      "path": "/pages/{page_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "properties": {
            "type": "object",
            "additionalProperties": true
          },
          "icon": {
            "type": "object",
            "additionalProperties": true
          },
          "cover": {
            "type": "object",
            "additionalProperties": true
          },
          "archived": {
            "type": "boolean"
          },
          "in_trash": {
            "type": "boolean"
          },
          "is_locked": {
            "type": "boolean"
          },
          "page_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "page_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "properties",
        "icon",
        "cover",
        "archived",
        "in_trash",
        "is_locked"
      ]
    },
    "update_page_markdown": {
      "method": "PATCH",
      "path": "/pages/{page_id}/markdown",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "insert_content",
              "replace_content",
              "replace_content_range"
            ]
          },
          "insert_content": {
            "type": "object",
            "additionalProperties": true
          },
          "replace_content": {
            "type": "object",
            "additionalProperties": true
          },
          "replace_content_range": {
            "type": "object",
            "additionalProperties": true
          },
          "page_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "page_id",
          "type"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "type",
        "insert_content",
        "replace_content",
        "replace_content_range"
      ]
    },
    "append_block_children": {
      "method": "PATCH",
      "path": "/blocks/{block_id}/children",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "children": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "block_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "block_id",
          "children"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "children",
        "after"
      ]
    },
    "update_block": {
      "method": "PATCH",
      "path": "/blocks/{block_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "paragraph": {
            "type": "object",
            "additionalProperties": true
          },
          "heading_1": {
            "type": "object",
            "additionalProperties": true
          },
          "heading_2": {
            "type": "object",
            "additionalProperties": true
          },
          "heading_3": {
            "type": "object",
            "additionalProperties": true
          },
          "bulleted_list_item": {
            "type": "object",
            "additionalProperties": true
          },
          "numbered_list_item": {
            "type": "object",
            "additionalProperties": true
          },
          "quote": {
            "type": "object",
            "additionalProperties": true
          },
          "callout": {
            "type": "object",
            "additionalProperties": true
          },
          "to_do": {
            "type": "object",
            "additionalProperties": true
          },
          "toggle": {
            "type": "object",
            "additionalProperties": true
          },
          "code": {
            "type": "object",
            "additionalProperties": true
          },
          "image": {
            "type": "object",
            "additionalProperties": true
          },
          "video": {
            "type": "object",
            "additionalProperties": true
          },
          "file": {
            "type": "object",
            "additionalProperties": true
          },
          "pdf": {
            "type": "object",
            "additionalProperties": true
          },
          "bookmark": {
            "type": "object",
            "additionalProperties": true
          },
          "embed": {
            "type": "object",
            "additionalProperties": true
          },
          "table_row": {
            "type": "object",
            "additionalProperties": true
          },
          "synced_block": {
            "type": "object",
            "additionalProperties": true
          },
          "archived": {
            "type": "boolean"
          },
          "in_trash": {
            "type": "boolean"
          },
          "block_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "block_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "paragraph",
        "heading_1",
        "heading_2",
        "heading_3",
        "bulleted_list_item",
        "numbered_list_item",
        "quote",
        "callout",
        "to_do",
        "toggle",
        "code",
        "image",
        "video",
        "file",
        "pdf",
        "bookmark",
        "embed",
        "table_row",
        "synced_block",
        "archived",
        "in_trash"
      ]
    },
    "delete_block": {
      "method": "DELETE",
      "path": "/blocks/{block_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "block_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "create_database": {
      "method": "POST",
      "path": "/databases",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "title": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "description": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "initial_data_source": {
            "type": "object",
            "additionalProperties": true
          },
          "is_inline": {
            "type": "boolean"
          },
          "icon": {
            "type": "object",
            "additionalProperties": true
          },
          "cover": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "parent"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "parent",
        "title",
        "description",
        "initial_data_source",
        "is_inline",
        "icon",
        "cover"
      ]
    },
    "update_database": {
      "method": "PATCH",
      "path": "/databases/{database_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "title": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "description": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "icon": {
            "type": "object",
            "additionalProperties": true
          },
          "cover": {
            "type": "object",
            "additionalProperties": true
          },
          "in_trash": {
            "type": "boolean"
          },
          "is_inline": {
            "type": "boolean"
          },
          "database_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "database_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "title",
        "description",
        "icon",
        "cover",
        "in_trash",
        "is_inline"
      ]
    },
    "create_data_source": {
      "method": "POST",
      "path": "/data_sources",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "title": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "properties": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "parent",
          "properties"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "parent",
        "title",
        "properties"
      ]
    },
    "update_data_source": {
      "method": "PATCH",
      "path": "/data_sources/{data_source_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "title": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "properties": {
            "type": "object",
            "additionalProperties": true
          },
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "in_trash": {
            "type": "boolean"
          },
          "data_source_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "data_source_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "title",
        "properties",
        "parent",
        "in_trash"
      ]
    },
    "create_comment": {
      "method": "POST",
      "path": "/comments",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "discussion_id": {
            "type": "string",
            "minLength": 1
          },
          "rich_text": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "attachments": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "display_name": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "rich_text"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "parent",
        "discussion_id",
        "rich_text",
        "attachments",
        "display_name"
      ]
    },
    "create_file_upload": {
      "method": "POST",
      "path": "/file_uploads",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "mode": {
            "type": "string",
            "enum": [
              "single_part",
              "multi_part",
              "external_url"
            ]
          },
          "filename": {
            "type": "string",
            "minLength": 1
          },
          "content_type": {
            "type": "string",
            "minLength": 1
          },
          "external_url": {
            "type": "string",
            "minLength": 1
          },
          "number_of_parts": {
            "type": "integer",
            "minimum": 1,
            "maximum": 10000
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "mode",
        "filename",
        "content_type",
        "external_url",
        "number_of_parts"
      ]
    },
    "complete_file_upload": {
      "method": "POST",
      "path": "/file_uploads/{file_upload_id}/complete",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "file_upload_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_upload_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "send_file_upload": {
      "method": "POST",
      "path": "/file_uploads/{file_upload_id}/send",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "content_base64": {
            "type": "string"
          },
          "file_upload_id": {
            "type": "string",
            "minLength": 1
          },
          "part_number": {
            "type": "integer",
            "minimum": 1,
            "maximum": 10000
          }
        },
        "required": [
          "file_upload_id",
          "content_base64"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "content_base64"
      ],
      "mode": "notion_upload"
    },
    "get_comment": {
      "method": "GET",
      "path": "/comments/{comment_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "comment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "comment_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "update_comment": {
      "method": "PATCH",
      "path": "/comments/{comment_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "rich_text": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "comment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "comment_id",
          "rich_text"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "rich_text"
      ]
    },
    "delete_comment": {
      "method": "DELETE",
      "path": "/comments/{comment_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "comment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "comment_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "move_page": {
      "method": "POST",
      "path": "/pages/{page_id}/move",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "page_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "page_id",
          "parent"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "parent"
      ]
    }
  },
  "health_action": "get_me",
  "discovery_action": "search",
  "discovery_params": {
    "page_size": 100
  },
  "query_array_format": "repeat",
  "provider": "notion"
}]=]) :: types.Config
local function get(): types.Config
    local resolved: types.Config = {provider = config.provider, title = config.title,
        headers = config.headers, operations = config.operations, endpoints = {}, api_key_scheme = config.api_key_scheme, query_array_format = config.query_array_format,
        health_action = config.health_action, discovery_action = config.discovery_action,
        discovery_params = config.discovery_params}
    for key in pairs(config.endpoints) do
        resolved.endpoints[key] = endpoints.get("kickside.notion:endpoints", key)
    end
    return resolved
end
return {get = get, definition = config}
