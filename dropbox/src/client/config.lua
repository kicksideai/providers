local json = require("json")
local endpoints = require("endpoints")
local types = require("types")

-- Closed provider operations ported from the upstream schemas documented in README.
local config = json.decode([=[{
  "title": "Dropbox",
  "endpoints": {
    "api": "https://api.dropboxapi.com/2",
    "content": "https://content.dropboxapi.com/2"
  },
  "operations": {
    "get_account": {
      "method": "POST",
      "path": "/users/get_current_account",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "mode": "null"
    },
    "get_space_usage": {
      "method": "POST",
      "path": "/users/get_space_usage",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "mode": "null"
    },
    "get_metadata": {
      "method": "POST",
      "path": "/files/get_metadata",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "include_media_info": {
            "type": "boolean"
          },
          "include_deleted": {
            "type": "boolean"
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "include_media_info",
        "include_deleted"
      ]
    },
    "list_folder": {
      "method": "POST",
      "path": "/files/list_folder",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string"
          },
          "recursive": {
            "type": "boolean"
          },
          "include_deleted": {
            "type": "boolean"
          },
          "include_non_downloadable_files": {
            "type": "boolean"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 2000
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "recursive",
        "include_deleted",
        "include_non_downloadable_files",
        "limit"
      ],
      "cursor_field": "cursor",
      "has_more_field": "has_more"
    },
    "continue_list_folder": {
      "method": "POST",
      "path": "/files/list_folder/continue",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "cursor": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "cursor"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "cursor"
      ],
      "cursor_field": "cursor",
      "has_more_field": "has_more"
    },
    "get_folder_cursor": {
      "method": "POST",
      "path": "/files/list_folder/get_latest_cursor",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string"
          },
          "recursive": {
            "type": "boolean"
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "recursive"
      ]
    },
    "search": {
      "method": "POST",
      "path": "/files/search_v2",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "minLength": 1
          },
          "options": {
            "type": "object",
            "properties": {
              "path": {
                "type": "string"
              },
              "max_results": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1000
              },
              "filename_only": {
                "type": "boolean"
              },
              "file_status": {
                "type": "string",
                "enum": [
                  "active",
                  "deleted"
                ]
              },
              "file_extensions": {
                "type": "array",
                "items": {
                  "type": "string",
                  "minLength": 1
                },
                "maxItems": 100
              }
            },
            "required": [],
            "additionalProperties": false
          }
        },
        "required": [
          "query"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "query",
        "options"
      ],
      "cursor_field": "cursor",
      "has_more_field": "has_more"
    },
    "continue_search": {
      "method": "POST",
      "path": "/files/search/continue_v2",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "cursor": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "cursor"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "cursor"
      ],
      "cursor_field": "cursor",
      "has_more_field": "has_more"
    },
    "list_revisions": {
      "method": "POST",
      "path": "/files/list_revisions",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "limit"
      ]
    },
    "get_temporary_link": {
      "method": "POST",
      "path": "/files/get_temporary_link",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path"
      ]
    },
    "download_file": {
      "method": "POST",
      "path": "/files/download",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path"
      ],
      "mode": "download",
      "endpoint": "content",
      "argument": [
        "path"
      ]
    },
    "export_file": {
      "method": "POST",
      "path": "/files/export",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "export_format": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "export_format"
      ],
      "mode": "download",
      "endpoint": "content",
      "argument": [
        "path",
        "export_format"
      ]
    },
    "list_shared_links": {
      "method": "POST",
      "path": "/sharing/list_shared_links",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "cursor": {
            "type": "string",
            "minLength": 1
          },
          "direct_only": {
            "type": "boolean"
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "cursor",
        "direct_only"
      ],
      "cursor_field": "cursor",
      "has_more_field": "has_more"
    },
    "list_shared_folders": {
      "method": "POST",
      "path": "/sharing/list_folders",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "limit"
      ],
      "cursor_field": "cursor"
    },
    "continue_shared_folders": {
      "method": "POST",
      "path": "/sharing/list_folders/continue",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "cursor": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "cursor"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "cursor"
      ],
      "cursor_field": "cursor"
    },
    "list_folder_members": {
      "method": "POST",
      "path": "/sharing/list_folder_members",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "shared_folder_id": {
            "type": "string",
            "minLength": 1
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          }
        },
        "required": [
          "shared_folder_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "shared_folder_id",
        "limit"
      ],
      "cursor_field": "cursor"
    },
    "continue_folder_members": {
      "method": "POST",
      "path": "/sharing/list_folder_members/continue",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "cursor": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "cursor"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "cursor"
      ],
      "cursor_field": "cursor"
    },
    "create_folder": {
      "method": "POST",
      "path": "/files/create_folder_v2",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "autorename": {
            "type": "boolean"
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "autorename"
      ]
    },
    "copy": {
      "method": "POST",
      "path": "/files/copy_v2",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "from_path": {
            "type": "string",
            "minLength": 1
          },
          "to_path": {
            "type": "string",
            "minLength": 1
          },
          "allow_shared_folder": {
            "type": "boolean"
          },
          "autorename": {
            "type": "boolean"
          },
          "allow_ownership_transfer": {
            "type": "boolean"
          }
        },
        "required": [
          "from_path",
          "to_path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "from_path",
        "to_path",
        "allow_shared_folder",
        "autorename",
        "allow_ownership_transfer"
      ]
    },
    "move": {
      "method": "POST",
      "path": "/files/move_v2",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "from_path": {
            "type": "string",
            "minLength": 1
          },
          "to_path": {
            "type": "string",
            "minLength": 1
          },
          "allow_shared_folder": {
            "type": "boolean"
          },
          "autorename": {
            "type": "boolean"
          },
          "allow_ownership_transfer": {
            "type": "boolean"
          }
        },
        "required": [
          "from_path",
          "to_path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "from_path",
        "to_path",
        "allow_shared_folder",
        "autorename",
        "allow_ownership_transfer"
      ]
    },
    "delete": {
      "method": "POST",
      "path": "/files/delete_v2",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "parent_rev": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "parent_rev"
      ]
    },
    "restore_file": {
      "method": "POST",
      "path": "/files/restore",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "rev": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "path",
          "rev"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "rev"
      ]
    },
    "upload_file": {
      "method": "POST",
      "path": "/files/upload",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "content_base64": {
            "type": "string"
          },
          "mode": {
            "type": "string",
            "enum": [
              "add",
              "overwrite"
            ]
          },
          "autorename": {
            "type": "boolean"
          },
          "mute": {
            "type": "boolean"
          },
          "strict_conflict": {
            "type": "boolean"
          }
        },
        "required": [
          "path",
          "content_base64"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "content_base64",
        "mode",
        "autorename",
        "mute",
        "strict_conflict"
      ],
      "mode": "upload",
      "endpoint": "content",
      "argument": [
        "path",
        "mode",
        "autorename",
        "mute",
        "strict_conflict"
      ]
    },
    "start_upload_session": {
      "method": "POST",
      "path": "/files/upload_session/start",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "content_base64": {
            "type": "string"
          },
          "close": {
            "type": "boolean"
          }
        },
        "required": [
          "content_base64"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "content_base64",
        "close"
      ],
      "mode": "upload",
      "endpoint": "content",
      "argument": [
        "close"
      ]
    },
    "append_upload_session": {
      "method": "POST",
      "path": "/files/upload_session/append_v2",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "content_base64": {
            "type": "string"
          },
          "cursor": {
            "type": "object",
            "properties": {
              "session_id": {
                "type": "string",
                "minLength": 1
              },
              "offset": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              }
            },
            "required": [
              "session_id",
              "offset"
            ],
            "additionalProperties": false
          },
          "close": {
            "type": "boolean"
          }
        },
        "required": [
          "content_base64",
          "cursor"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "content_base64",
        "cursor",
        "close"
      ],
      "mode": "upload",
      "endpoint": "content",
      "argument": [
        "cursor",
        "close"
      ]
    },
    "finish_upload_session": {
      "method": "POST",
      "path": "/files/upload_session/finish",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "content_base64": {
            "type": "string"
          },
          "cursor": {
            "type": "object",
            "properties": {
              "session_id": {
                "type": "string",
                "minLength": 1
              },
              "offset": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              }
            },
            "required": [
              "session_id",
              "offset"
            ],
            "additionalProperties": false
          },
          "commit": {
            "type": "object",
            "properties": {
              "path": {
                "type": "string",
                "minLength": 1
              },
              "mode": {
                "type": "string",
                "enum": [
                  "add",
                  "overwrite"
                ]
              },
              "autorename": {
                "type": "boolean"
              },
              "mute": {
                "type": "boolean"
              }
            },
            "required": [
              "path"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "content_base64",
          "cursor",
          "commit"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "content_base64",
        "cursor",
        "commit"
      ],
      "mode": "upload",
      "endpoint": "content",
      "argument": [
        "cursor",
        "commit"
      ]
    },
    "create_shared_link": {
      "method": "POST",
      "path": "/sharing/create_shared_link_with_settings",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "settings": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "settings"
      ]
    },
    "update_shared_link": {
      "method": "POST",
      "path": "/sharing/modify_shared_link_settings",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "minLength": 1
          },
          "settings": {
            "type": "object",
            "additionalProperties": true
          },
          "remove_expiration": {
            "type": "boolean"
          }
        },
        "required": [
          "url",
          "settings"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "url",
        "settings",
        "remove_expiration"
      ]
    },
    "revoke_shared_link": {
      "method": "POST",
      "path": "/sharing/revoke_shared_link",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "url"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "url"
      ]
    },
    "share_folder": {
      "method": "POST",
      "path": "/sharing/share_folder",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "minLength": 1
          },
          "member_policy": {
            "type": "string",
            "minLength": 1
          },
          "acl_update_policy": {
            "type": "string",
            "minLength": 1
          },
          "shared_link_policy": {
            "type": "string",
            "minLength": 1
          },
          "force_async": {
            "type": "boolean"
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "path",
        "member_policy",
        "acl_update_policy",
        "shared_link_policy",
        "force_async"
      ]
    },
    "add_folder_members": {
      "method": "POST",
      "path": "/sharing/add_folder_member",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "shared_folder_id": {
            "type": "string",
            "minLength": 1
          },
          "members": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "quiet": {
            "type": "boolean"
          }
        },
        "required": [
          "shared_folder_id",
          "members"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "shared_folder_id",
        "members",
        "quiet"
      ]
    },
    "remove_folder_member": {
      "method": "POST",
      "path": "/sharing/remove_folder_member",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "shared_folder_id": {
            "type": "string",
            "minLength": 1
          },
          "member": {
            "type": "object",
            "additionalProperties": true
          },
          "leave_a_copy": {
            "type": "boolean"
          }
        },
        "required": [
          "shared_folder_id",
          "member",
          "leave_a_copy"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "shared_folder_id",
        "member",
        "leave_a_copy"
      ]
    },
    "update_folder_member": {
      "method": "POST",
      "path": "/sharing/update_folder_member",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "shared_folder_id": {
            "type": "string",
            "minLength": 1
          },
          "member": {
            "type": "object",
            "additionalProperties": true
          },
          "access_level": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "shared_folder_id",
          "member",
          "access_level"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "shared_folder_id",
        "member",
        "access_level"
      ]
    },
    "unshare_folder": {
      "method": "POST",
      "path": "/sharing/unshare_folder",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "shared_folder_id": {
            "type": "string",
            "minLength": 1
          },
          "leave_a_copy": {
            "type": "boolean"
          }
        },
        "required": [
          "shared_folder_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "shared_folder_id",
        "leave_a_copy"
      ]
    }
  },
  "health_action": "get_account",
  "discovery_action": "list_folder",
  "discovery_params": {
    "path": "",
    "limit": 100
  },
  "provider": "dropbox"
}]=]) :: types.Config
local function get(): types.Config
    local resolved: types.Config = {provider = config.provider, title = config.title,
        headers = config.headers, operations = config.operations, endpoints = {}, api_key_scheme = config.api_key_scheme, query_array_format = config.query_array_format,
        health_action = config.health_action, discovery_action = config.discovery_action,
        discovery_params = config.discovery_params}
    for key in pairs(config.endpoints) do
        resolved.endpoints[key] = endpoints.get("kickside.dropbox:endpoints", key)
    end
    return resolved
end
return {get = get, definition = config}
