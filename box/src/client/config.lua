local json = require("json")
local endpoints = require("endpoints")
local types = require("types")

-- Closed provider operations ported from the upstream schemas documented in README.
local config = json.decode([=[{
  "title": "Box",
  "endpoints": {
    "api": "https://api.box.com/2.0",
    "upload": "https://upload.box.com/api/2.0"
  },
  "operations": {
    "get_me": {
      "method": "GET",
      "path": "/users/me",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "fields": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": []
    },
    "get_file": {
      "method": "GET",
      "path": "/files/{file_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": []
    },
    "get_folder": {
      "method": "GET",
      "path": "/folders/{folder_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": []
    },
    "list_folder_items": {
      "method": "GET",
      "path": "/folders/{folder_id}/items",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "marker": {
            "type": "string",
            "minLength": 1
          },
          "usemarker": {
            "type": "boolean"
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "marker",
        "usemarker",
        "fields"
      ],
      "body": [],
      "defaults": {
        "usemarker": true,
        "limit": 100
      },
      "cursor_field": "next_marker"
    },
    "search": {
      "method": "GET",
      "path": "/search",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string",
            "enum": [
              "file",
              "folder",
              "web_link"
            ]
          },
          "ancestor_folder_ids": {
            "type": "string",
            "minLength": 1
          },
          "file_extensions": {
            "type": "string",
            "minLength": 1
          },
          "content_types": {
            "type": "string",
            "minLength": 1
          },
          "scope": {
            "type": "string",
            "minLength": 1
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200
          },
          "offset": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100000
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "sort": {
            "type": "string",
            "enum": [
              "modified_at",
              "relevance"
            ]
          },
          "direction": {
            "type": "string",
            "enum": [
              "ASC",
              "DESC"
            ]
          }
        },
        "required": [
          "query"
        ],
        "additionalProperties": false
      },
      "query": [
        "query",
        "type",
        "ancestor_folder_ids",
        "file_extensions",
        "content_types",
        "scope",
        "limit",
        "offset",
        "fields",
        "sort",
        "direction"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "offset_page": true
    },
    "download_file": {
      "method": "GET",
      "path": "/files/{file_id}/content",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "version": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "version"
      ],
      "body": [],
      "mode": "download"
    },
    "get_download_url": {
      "method": "GET",
      "path": "/files/{file_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "fields": {
            "type": "string",
            "enum": [
              "download_url"
            ]
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": [],
      "defaults": {
        "fields": "download_url"
      }
    },
    "list_file_versions": {
      "method": "GET",
      "path": "/files/{file_id}/versions",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "offset": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100000
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "fields",
        "offset"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "offset_page": true
    },
    "list_file_comments": {
      "method": "GET",
      "path": "/files/{file_id}/comments",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "offset": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100000
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "offset",
        "fields"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "offset_page": true
    },
    "list_file_collaborations": {
      "method": "GET",
      "path": "/files/{file_id}/collaborations",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "marker": {
            "type": "string",
            "minLength": 1
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "marker",
        "fields"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "cursor_field": "next_marker"
    },
    "list_folder_collaborations": {
      "method": "GET",
      "path": "/folders/{folder_id}/collaborations",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "marker": {
            "type": "string",
            "minLength": 1
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "marker",
        "fields"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "cursor_field": "next_marker"
    },
    "get_collaboration": {
      "method": "GET",
      "path": "/collaborations/{collaboration_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "collaboration_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "collaboration_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": []
    },
    "list_collections": {
      "method": "GET",
      "path": "/collections",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "offset": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100000
          },
          "fields": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "offset",
        "fields"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "offset_page": true
    },
    "list_collection_items": {
      "method": "GET",
      "path": "/collections/{collection_id}/items",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "offset": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100000
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "collection_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "collection_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "offset",
        "fields"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "offset_page": true
    },
    "list_trash": {
      "method": "GET",
      "path": "/folders/trash/items",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "marker": {
            "type": "string",
            "minLength": 1
          },
          "usemarker": {
            "type": "boolean"
          },
          "fields": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "marker",
        "usemarker",
        "fields"
      ],
      "body": [],
      "defaults": {
        "usemarker": true,
        "limit": 100
      },
      "cursor_field": "next_marker"
    },
    "get_trashed_file": {
      "method": "GET",
      "path": "/files/{file_id}/trash",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": []
    },
    "get_trashed_folder": {
      "method": "GET",
      "path": "/folders/{folder_id}/trash",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": []
    },
    "list_file_metadata": {
      "method": "GET",
      "path": "/files/{file_id}/metadata",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "get_file_metadata": {
      "method": "GET",
      "path": "/files/{file_id}/metadata/{scope}/{template_key}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "scope": {
            "type": "string",
            "minLength": 1
          },
          "template_key": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id",
          "scope",
          "template_key"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "list_events": {
      "method": "GET",
      "path": "/events",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "stream_position": {
            "type": "string",
            "minLength": 1
          },
          "stream_type": {
            "type": "string",
            "minLength": 1
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 500
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "stream_position",
        "stream_type",
        "limit"
      ],
      "body": [],
      "cursor_field": "next_stream_position"
    },
    "list_tasks": {
      "method": "GET",
      "path": "/files/{file_id}/tasks",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "get_task": {
      "method": "GET",
      "path": "/tasks/{task_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "task_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "task_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "list_task_assignments": {
      "method": "GET",
      "path": "/tasks/{task_id}/assignments",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "task_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "task_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "list_webhooks": {
      "method": "GET",
      "path": "/webhooks",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "marker": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "limit",
        "marker"
      ],
      "body": [],
      "defaults": {
        "limit": 100
      },
      "cursor_field": "next_marker"
    },
    "get_webhook": {
      "method": "GET",
      "path": "/webhooks/{webhook_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "webhook_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "webhook_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "create_folder": {
      "method": "POST",
      "path": "/folders",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "parent": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "name",
          "parent"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "name",
        "parent"
      ]
    },
    "update_file": {
      "method": "PUT",
      "path": "/files/{file_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "description": {
            "type": "string"
          },
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "shared_link": {
            "type": "object",
            "additionalProperties": true
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 100
          },
          "collections": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "if_match": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": [
        "name",
        "description",
        "parent",
        "shared_link",
        "tags",
        "collections"
      ],
      "header_fields": {
        "if_match": "If-Match"
      }
    },
    "copy_file": {
      "method": "POST",
      "path": "/files/{file_id}/copy",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "name": {
            "type": "string",
            "minLength": 1
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id",
          "parent"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": [
        "parent",
        "name"
      ]
    },
    "delete_file": {
      "method": "DELETE",
      "path": "/files/{file_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "if_match": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "header_fields": {
        "if_match": "If-Match"
      }
    },
    "restore_file": {
      "method": "POST",
      "path": "/files/{file_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": [
        "name",
        "parent"
      ]
    },
    "update_folder": {
      "method": "PUT",
      "path": "/folders/{folder_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "description": {
            "type": "string"
          },
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "shared_link": {
            "type": "object",
            "additionalProperties": true
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 100
          },
          "collections": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          },
          "if_match": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": [
        "name",
        "description",
        "parent",
        "shared_link",
        "tags",
        "collections"
      ],
      "header_fields": {
        "if_match": "If-Match"
      }
    },
    "copy_folder": {
      "method": "POST",
      "path": "/folders/{folder_id}/copy",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "name": {
            "type": "string",
            "minLength": 1
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id",
          "parent"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": [
        "parent",
        "name"
      ]
    },
    "delete_folder": {
      "method": "DELETE",
      "path": "/folders/{folder_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "recursive": {
            "type": "boolean"
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          },
          "if_match": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "recursive"
      ],
      "body": [],
      "header_fields": {
        "if_match": "If-Match"
      }
    },
    "restore_folder": {
      "method": "POST",
      "path": "/folders/{folder_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "parent": {
            "type": "object",
            "additionalProperties": true
          },
          "fields": {
            "type": "string",
            "minLength": 1
          },
          "folder_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "fields"
      ],
      "body": [
        "name",
        "parent"
      ]
    },
    "upload_file": {
      "method": "POST",
      "path": "/files/content",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "parent_id": {
            "type": "string",
            "minLength": 1
          },
          "content_base64": {
            "type": "string"
          }
        },
        "required": [
          "name",
          "parent_id",
          "content_base64"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "name",
        "parent_id",
        "content_base64"
      ],
      "mode": "multipart",
      "endpoint": "upload"
    },
    "upload_file_version": {
      "method": "POST",
      "path": "/files/{file_id}/content",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "content_base64": {
            "type": "string"
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "if_match": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id",
          "content_base64"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "content_base64"
      ],
      "mode": "multipart",
      "endpoint": "upload",
      "header_fields": {
        "if_match": "If-Match"
      }
    },
    "create_comment": {
      "method": "POST",
      "path": "/comments",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "item": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "file",
                  "comment"
                ]
              },
              "id": {
                "type": "string",
                "minLength": 1
              }
            },
            "required": [
              "type",
              "id"
            ],
            "additionalProperties": false
          },
          "message": {
            "type": "string",
            "minLength": 1
          },
          "tagged_message": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "item",
          "message"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "item",
        "message",
        "tagged_message"
      ]
    },
    "update_comment": {
      "method": "PUT",
      "path": "/comments/{comment_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "message": {
            "type": "string",
            "minLength": 1
          },
          "comment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "comment_id",
          "message"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "message"
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
    "create_collaboration": {
      "method": "POST",
      "path": "/collaborations",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "item": {
            "type": "object",
            "additionalProperties": true
          },
          "accessible_by": {
            "type": "object",
            "additionalProperties": true
          },
          "role": {
            "type": "string",
            "enum": [
              "editor",
              "viewer",
              "previewer",
              "uploader",
              "previewer uploader",
              "viewer uploader",
              "co-owner"
            ]
          },
          "can_view_path": {
            "type": "boolean"
          },
          "expires_at": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "item",
          "accessible_by",
          "role"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "item",
        "accessible_by",
        "role",
        "can_view_path",
        "expires_at"
      ]
    },
    "update_collaboration": {
      "method": "PUT",
      "path": "/collaborations/{collaboration_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "role": {
            "type": "string",
            "minLength": 1
          },
          "status": {
            "type": "string",
            "enum": [
              "accepted",
              "pending",
              "rejected"
            ]
          },
          "expires_at": {
            "type": "string",
            "minLength": 1
          },
          "collaboration_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "collaboration_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "role",
        "status",
        "expires_at"
      ]
    },
    "delete_collaboration": {
      "method": "DELETE",
      "path": "/collaborations/{collaboration_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "collaboration_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "collaboration_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "create_file_metadata": {
      "method": "POST",
      "path": "/files/{file_id}/metadata/{scope}/{template_key}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "metadata": {
            "type": "object",
            "additionalProperties": true
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "scope": {
            "type": "string",
            "minLength": 1
          },
          "template_key": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id",
          "scope",
          "template_key",
          "metadata"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "metadata"
      ],
      "body_root": "metadata"
    },
    "update_file_metadata": {
      "method": "PUT",
      "path": "/files/{file_id}/metadata/{scope}/{template_key}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "operations": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "op": {
                  "type": "string",
                  "enum": [
                    "add",
                    "replace",
                    "remove",
                    "test",
                    "move",
                    "copy"
                  ]
                },
                "path": {
                  "type": "string",
                  "minLength": 1
                },
                "from": {
                  "type": "string",
                  "minLength": 1
                },
                "value": {}
              },
              "required": [
                "op",
                "path"
              ],
              "additionalProperties": false
            },
            "maxItems": 100
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "scope": {
            "type": "string",
            "minLength": 1
          },
          "template_key": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id",
          "scope",
          "template_key",
          "operations"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "operations"
      ],
      "body_root": "operations",
      "headers": {
        "Content-Type": "application/json-patch+json"
      }
    },
    "delete_file_metadata": {
      "method": "DELETE",
      "path": "/files/{file_id}/metadata/{scope}/{template_key}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "file_id": {
            "type": "string",
            "minLength": 1
          },
          "scope": {
            "type": "string",
            "minLength": 1
          },
          "template_key": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id",
          "scope",
          "template_key"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "create_task": {
      "method": "POST",
      "path": "/tasks",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "item": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "file"
                ]
              },
              "id": {
                "type": "string",
                "minLength": 1
              }
            },
            "required": [
              "type",
              "id"
            ],
            "additionalProperties": false
          },
          "action": {
            "type": "string",
            "enum": [
              "review",
              "complete"
            ]
          },
          "message": {
            "type": "string"
          },
          "due_at": {
            "type": "string",
            "minLength": 1
          },
          "completion_rule": {
            "type": "string",
            "enum": [
              "all_assignees",
              "any_assignee"
            ]
          }
        },
        "required": [
          "item"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "item",
        "action",
        "message",
        "due_at",
        "completion_rule"
      ]
    },
    "update_task": {
      "method": "PUT",
      "path": "/tasks/{task_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": [
              "review",
              "complete"
            ]
          },
          "message": {
            "type": "string"
          },
          "due_at": {
            "type": "string",
            "minLength": 1
          },
          "completion_rule": {
            "type": "string",
            "enum": [
              "all_assignees",
              "any_assignee"
            ]
          },
          "task_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "task_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "action",
        "message",
        "due_at",
        "completion_rule"
      ]
    },
    "delete_task": {
      "method": "DELETE",
      "path": "/tasks/{task_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "task_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "task_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "create_task_assignment": {
      "method": "POST",
      "path": "/task_assignments",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "task": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1
              }
            },
            "required": [
              "id"
            ],
            "additionalProperties": false
          },
          "assign_to": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1
              },
              "login": {
                "type": "string",
                "minLength": 1
              }
            },
            "required": [],
            "additionalProperties": false
          }
        },
        "required": [
          "task",
          "assign_to"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "task",
        "assign_to"
      ]
    },
    "update_task_assignment": {
      "method": "PUT",
      "path": "/task_assignments/{task_assignment_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          },
          "resolution_state": {
            "type": "string",
            "enum": [
              "completed",
              "incomplete",
              "approved",
              "rejected"
            ]
          },
          "task_assignment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "task_assignment_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "message",
        "resolution_state"
      ]
    },
    "delete_task_assignment": {
      "method": "DELETE",
      "path": "/task_assignments/{task_assignment_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "task_assignment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "task_assignment_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "create_webhook": {
      "method": "POST",
      "path": "/webhooks",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "target": {
            "type": "object",
            "additionalProperties": true
          },
          "address": {
            "type": "string",
            "minLength": 1
          },
          "triggers": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 100
          }
        },
        "required": [
          "target",
          "address",
          "triggers"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "target",
        "address",
        "triggers"
      ]
    },
    "update_webhook": {
      "method": "PUT",
      "path": "/webhooks/{webhook_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "target": {
            "type": "object",
            "additionalProperties": true
          },
          "address": {
            "type": "string",
            "minLength": 1
          },
          "triggers": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 100
          },
          "webhook_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "webhook_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "target",
        "address",
        "triggers"
      ]
    },
    "delete_webhook": {
      "method": "DELETE",
      "path": "/webhooks/{webhook_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "webhook_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "webhook_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": []
    },
    "create_upload_session": {
      "method": "POST",
      "path": "/files/upload_sessions",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "folder_id": {
            "type": "string",
            "minLength": 1
          },
          "file_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          "file_name": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id",
          "file_size",
          "file_name"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "folder_id",
        "file_size",
        "file_name"
      ],
      "endpoint": "upload"
    },
    "create_file_version_upload_session": {
      "method": "POST",
      "path": "/files/{file_id}/upload_sessions",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "file_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          "file_name": {
            "type": "string",
            "minLength": 1
          },
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id",
          "file_size"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "file_size",
        "file_name"
      ],
      "endpoint": "upload"
    },
    "get_upload_session": {
      "method": "GET",
      "path": "/files/upload_sessions/{upload_session_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "upload_session_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "upload_session_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "endpoint": "upload"
    },
    "list_upload_session_parts": {
      "method": "GET",
      "path": "/files/upload_sessions/{upload_session_id}/parts",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "offset": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100000
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "upload_session_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "upload_session_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "offset",
        "limit"
      ],
      "body": [],
      "endpoint": "upload",
      "offset_page": true
    },
    "upload_session_part": {
      "method": "PUT",
      "path": "/files/upload_sessions/{upload_session_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "offset": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "total_size": {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          "content_base64": {
            "type": "string"
          },
          "upload_session_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "upload_session_id",
          "offset",
          "total_size",
          "content_base64"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "mode": "box_part",
      "endpoint": "upload"
    },
    "commit_upload_session": {
      "method": "POST",
      "path": "/files/upload_sessions/{upload_session_id}/commit",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "parts": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "part_id": {
                  "type": "string",
                  "minLength": 1
                },
                "offset": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 9007199254740991
                },
                "size": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 9007199254740991
                },
                "sha1": {
                  "type": "string",
                  "minLength": 1
                }
              },
              "required": [
                "part_id",
                "offset",
                "size",
                "sha1"
              ],
              "additionalProperties": false
            },
            "maxItems": 10000
          },
          "sha1_base64": {
            "type": "string",
            "minLength": 1
          },
          "upload_session_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "upload_session_id",
          "parts",
          "sha1_base64"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "parts"
      ],
      "mode": "box_commit",
      "endpoint": "upload"
    },
    "abort_upload_session": {
      "method": "DELETE",
      "path": "/files/upload_sessions/{upload_session_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "upload_session_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "upload_session_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "endpoint": "upload"
    },
    "remove_file_shared_link": {
      "method": "PUT",
      "path": "/files/{file_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "file_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "file_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "defaults": {
        "clear_fields": [
          "shared_link"
        ]
      },
      "clear_parent": ""
    },
    "remove_folder_shared_link": {
      "method": "PUT",
      "path": "/folders/{folder_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "folder_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "folder_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "defaults": {
        "clear_fields": [
          "shared_link"
        ]
      },
      "clear_parent": ""
    }
  },
  "health_action": "get_me",
  "discovery_action": "list_folder_items",
  "discovery_params": {
    "folder_id": "0",
    "limit": 100
  },
  "provider": "box"
}]=]) :: types.Config
local function get(): types.Config
    local resolved: types.Config = {provider = config.provider, title = config.title,
        headers = config.headers, operations = config.operations, endpoints = {}, api_key_scheme = config.api_key_scheme, query_array_format = config.query_array_format,
        health_action = config.health_action, discovery_action = config.discovery_action,
        discovery_params = config.discovery_params}
    for key in pairs(config.endpoints) do
        resolved.endpoints[key] = endpoints.get("kickside.box:endpoints", key)
    end
    return resolved
end
return {get = get, definition = config}
