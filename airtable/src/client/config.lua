local json = require("json")
local endpoints = require("endpoints")
local types = require("types")

-- Closed provider operations ported from the upstream schemas documented in README.
local config = json.decode([=[{
  "title": "Airtable",
  "endpoints": {
    "api": "https://api.airtable.com/v0",
    "content": "https://content.airtable.com/v0"
  },
  "operations": {
    "get_identity": {
      "method": "GET",
      "path": "/meta/whoami",
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
    "list_bases": {
      "method": "GET",
      "path": "/meta/bases",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "offset": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [
        "offset"
      ],
      "body": [],
      "cursor_field": "offset"
    },
    "list_tables": {
      "method": "GET",
      "path": "/meta/bases/{base_id}/tables",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "include": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 100
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "include"
      ],
      "body": []
    },
    "list_records": {
      "method": "GET",
      "path": "/{base_id}/{table_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "pageSize": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "offset": {
            "type": "string",
            "minLength": 1
          },
          "filterByFormula": {
            "type": "string"
          },
          "view": {
            "type": "string",
            "minLength": 1
          },
          "fields": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 100
          },
          "sort": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "field": {
                  "type": "string",
                  "minLength": 1
                },
                "direction": {
                  "type": "string",
                  "enum": [
                    "asc",
                    "desc"
                  ]
                }
              },
              "required": [
                "field"
              ],
              "additionalProperties": false
            },
            "maxItems": 100
          },
          "maxRecords": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100000
          },
          "returnFieldsByFieldId": {
            "type": "boolean"
          },
          "cellFormat": {
            "type": "string",
            "enum": [
              "json",
              "string"
            ]
          },
          "timeZone": {
            "type": "string",
            "minLength": 1
          },
          "userLocale": {
            "type": "string",
            "minLength": 1
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "pageSize",
        "offset",
        "filterByFormula",
        "view",
        "fields",
        "sort",
        "maxRecords",
        "returnFieldsByFieldId",
        "cellFormat",
        "timeZone",
        "userLocale"
      ],
      "body": [],
      "cursor_field": "offset"
    },
    "get_record": {
      "method": "GET",
      "path": "/{base_id}/{table_id}/{record_id}",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "returnFieldsByFieldId": {
            "type": "boolean"
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          },
          "record_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "record_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "returnFieldsByFieldId"
      ],
      "body": []
    },
    "create_records": {
      "method": "POST",
      "path": "/{base_id}/{table_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "records": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "fields": {
                  "type": "object",
                  "additionalProperties": true
                }
              },
              "required": [
                "fields"
              ],
              "additionalProperties": false
            },
            "maxItems": 10,
            "minItems": 1
          },
          "typecast": {
            "type": "boolean"
          },
          "returnFieldsByFieldId": {
            "type": "boolean"
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "records"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "records",
        "typecast",
        "returnFieldsByFieldId"
      ]
    },
    "update_records": {
      "method": "PATCH",
      "path": "/{base_id}/{table_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "records": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "minLength": 1
                },
                "fields": {
                  "type": "object",
                  "additionalProperties": true
                }
              },
              "required": [
                "id",
                "fields"
              ],
              "additionalProperties": false
            },
            "maxItems": 10,
            "minItems": 1
          },
          "typecast": {
            "type": "boolean"
          },
          "returnFieldsByFieldId": {
            "type": "boolean"
          },
          "performUpsert": {
            "type": "object",
            "properties": {
              "fieldsToMergeOn": {
                "type": "array",
                "items": {
                  "type": "string",
                  "minLength": 1
                },
                "maxItems": 3
              }
            },
            "required": [
              "fieldsToMergeOn"
            ],
            "additionalProperties": false
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "records"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "records",
        "typecast",
        "returnFieldsByFieldId",
        "performUpsert"
      ]
    },
    "replace_records": {
      "method": "PUT",
      "path": "/{base_id}/{table_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "records": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "minLength": 1
                },
                "fields": {
                  "type": "object",
                  "additionalProperties": true
                }
              },
              "required": [
                "id",
                "fields"
              ],
              "additionalProperties": false
            },
            "maxItems": 10,
            "minItems": 1
          },
          "typecast": {
            "type": "boolean"
          },
          "returnFieldsByFieldId": {
            "type": "boolean"
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "records"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "records",
        "typecast",
        "returnFieldsByFieldId"
      ]
    },
    "delete_records": {
      "method": "DELETE",
      "path": "/{base_id}/{table_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "records": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "maxItems": 10
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "records"
        ],
        "additionalProperties": false
      },
      "query": [
        "records"
      ],
      "body": []
    },
    "create_base": {
      "method": "POST",
      "path": "/meta/bases",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "workspaceId": {
            "type": "string",
            "minLength": 1
          },
          "tables": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          }
        },
        "required": [
          "name",
          "workspaceId",
          "tables"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "name",
        "workspaceId",
        "tables"
      ]
    },
    "create_table": {
      "method": "POST",
      "path": "/meta/bases/{base_id}/tables",
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
          "fields": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": true
            },
            "maxItems": 100
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "name",
          "fields"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "name",
        "description",
        "fields"
      ]
    },
    "update_table": {
      "method": "PATCH",
      "path": "/meta/bases/{base_id}/tables/{table_id}",
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
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "name",
        "description"
      ]
    },
    "create_field": {
      "method": "POST",
      "path": "/meta/bases/{base_id}/tables/{table_id}/fields",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string",
            "minLength": 1
          },
          "description": {
            "type": "string"
          },
          "options": {
            "type": "object",
            "additionalProperties": true
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "name",
          "type"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "name",
        "type",
        "description",
        "options"
      ]
    },
    "update_field": {
      "method": "PATCH",
      "path": "/meta/bases/{base_id}/tables/{table_id}/fields/{field_id}",
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
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          },
          "field_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "field_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "name",
        "description"
      ]
    },
    "list_comments": {
      "method": "GET",
      "path": "/{base_id}/{table_id}/{record_id}/comments",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "offset": {
            "type": "string",
            "minLength": 1
          },
          "pageSize": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          },
          "record_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "record_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "offset",
        "pageSize"
      ],
      "body": [],
      "cursor_field": "offset"
    },
    "create_comment": {
      "method": "POST",
      "path": "/{base_id}/{table_id}/{record_id}/comments",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string",
            "minLength": 1
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          },
          "record_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "record_id",
          "text"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "text"
      ],
      "cursor_field": null
    },
    "update_comment": {
      "method": "PATCH",
      "path": "/{base_id}/{table_id}/{record_id}/comments/{comment_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string",
            "minLength": 1
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          },
          "record_id": {
            "type": "string",
            "minLength": 1
          },
          "comment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "record_id",
          "comment_id",
          "text"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "text"
      ],
      "cursor_field": null
    },
    "delete_comment": {
      "method": "DELETE",
      "path": "/{base_id}/{table_id}/{record_id}/comments/{comment_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          },
          "record_id": {
            "type": "string",
            "minLength": 1
          },
          "comment_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "table_id",
          "record_id",
          "comment_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "cursor_field": null
    },
    "list_webhooks": {
      "method": "GET",
      "path": "/bases/{base_id}/webhooks",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "base_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "cursor_field": null
    },
    "create_webhook": {
      "method": "POST",
      "path": "/bases/{base_id}/webhooks",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "notificationUrl": {
            "type": "string",
            "minLength": 1
          },
          "specification": {
            "type": "object",
            "additionalProperties": true
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "specification"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "notificationUrl",
        "specification"
      ],
      "cursor_field": null
    },
    "refresh_webhook": {
      "method": "POST",
      "path": "/bases/{base_id}/webhooks/{webhook_id}/refresh",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "webhook_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "webhook_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "cursor_field": null
    },
    "delete_webhook": {
      "method": "DELETE",
      "path": "/bases/{base_id}/webhooks/{webhook_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "webhook_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "webhook_id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "cursor_field": null
    },
    "list_webhook_payloads": {
      "method": "GET",
      "path": "/bases/{base_id}/webhooks/{webhook_id}/payloads",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "cursor": {
            "type": "integer",
            "minimum": 1,
            "maximum": 2147483647
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 50
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "webhook_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "webhook_id"
        ],
        "additionalProperties": false
      },
      "query": [
        "cursor",
        "limit"
      ],
      "body": [],
      "cursor_field": "cursor",
      "has_more_field": "mightHaveMore"
    },
    "upload_attachment": {
      "method": "POST",
      "path": "/{base_id}/{record_id}/{field_id}/uploadAttachment",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "contentType": {
            "type": "string",
            "minLength": 1
          },
          "file": {
            "type": "string",
            "minLength": 1
          },
          "filename": {
            "type": "string",
            "minLength": 1
          },
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "record_id": {
            "type": "string",
            "minLength": 1
          },
          "field_id": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "base_id",
          "record_id",
          "field_id",
          "contentType",
          "file",
          "filename"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "contentType",
        "file",
        "filename"
      ],
      "endpoint": "content"
    },
    "clear_record_fields": {
      "method": "PATCH",
      "path": "/{base_id}/{table_id}/{record_id}",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "base_id": {
            "type": "string",
            "minLength": 1
          },
          "table_id": {
            "type": "string",
            "minLength": 1
          },
          "record_id": {
            "type": "string",
            "minLength": 1
          },
          "clear_fields": {
            "type": "array",
            "items": {
              "type": "string",
              "minLength": 1
            },
            "minItems": 1,
            "maxItems": 100
          }
        },
        "required": [
          "base_id",
          "table_id",
          "record_id",
          "clear_fields"
        ],
        "additionalProperties": false
      },
      "body": [
        "fields"
      ],
      "defaults": {
        "fields": {}
      },
      "clear_parent": "fields"
    }
  },
  "health_action": "get_identity",
  "discovery_action": "list_bases",
  "provider": "airtable"
}]=]) :: types.Config
local function get(): types.Config
    local resolved: types.Config = {provider = config.provider, title = config.title,
        headers = config.headers, operations = config.operations, endpoints = {}, api_key_scheme = config.api_key_scheme, query_array_format = config.query_array_format,
        health_action = config.health_action, discovery_action = config.discovery_action,
        discovery_params = config.discovery_params}
    for key in pairs(config.endpoints) do
        resolved.endpoints[key] = endpoints.get("kickside.airtable:endpoints", key)
    end
    return resolved
end
return {get = get, definition = config}
