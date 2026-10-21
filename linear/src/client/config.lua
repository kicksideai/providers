local json = require("json")
local endpoints = require("endpoints")
local types = require("types")

-- Closed provider operations ported from the upstream schemas documented in README.
local config = json.decode([=[{
  "title": "Linear",
  "endpoints": {
    "api": "https://api.linear.app/graphql"
  },
  "operations": {
    "get_viewer": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [],
      "document": "query KicksideGetViewer { viewer { id name displayName email active } }",
      "extract": "viewer"
    },
    "list_issues": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListIssues($first: Int, $after: String, $filter: IssueFilter) { issues(first: $first, after: $after, filter: $filter) { nodes { id identifier title description url priority estimate dueDate createdAt updatedAt state { id name type } team { id key name } assignee { id name } project { id name } cycle { id name number } labels { nodes { id name } } } pageInfo { hasNextPage endCursor } } }",
      "extract": "issues",
      "defaults": {
        "first": 25
      }
    },
    "get_issue": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetIssue($id: String!) { issue(id: $id) { id identifier title description url priority estimate dueDate createdAt updatedAt state { id name type } team { id key name } assignee { id name } project { id name } cycle { id name number } labels { nodes { id name } } } }",
      "extract": "issue"
    },
    "list_teams": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListTeams($first: Int, $after: String, $filter: TeamFilter) { teams(first: $first, after: $after, filter: $filter) { nodes { id key name description } pageInfo { hasNextPage endCursor } } }",
      "extract": "teams",
      "defaults": {
        "first": 25
      }
    },
    "get_team": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetTeam($id: String!) { team(id: $id) { id key name description } }",
      "extract": "team"
    },
    "list_users": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListUsers($first: Int, $after: String, $filter: UserFilter) { users(first: $first, after: $after, filter: $filter) { nodes { id name displayName email active } pageInfo { hasNextPage endCursor } } }",
      "extract": "users",
      "defaults": {
        "first": 25
      }
    },
    "get_user": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetUser($id: String!) { user(id: $id) { id name displayName email active } }",
      "extract": "user"
    },
    "list_projects": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListProjects($first: Int, $after: String, $filter: ProjectFilter) { projects(first: $first, after: $after, filter: $filter) { nodes { id name description content url state progress startDate targetDate createdAt updatedAt } pageInfo { hasNextPage endCursor } } }",
      "extract": "projects",
      "defaults": {
        "first": 25
      }
    },
    "get_project": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetProject($id: String!) { project(id: $id) { id name description content url state progress startDate targetDate createdAt updatedAt } }",
      "extract": "project"
    },
    "list_cycles": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListCycles($first: Int, $after: String, $filter: CycleFilter) { cycles(first: $first, after: $after, filter: $filter) { nodes { id name number startsAt endsAt completedAt progress } pageInfo { hasNextPage endCursor } } }",
      "extract": "cycles",
      "defaults": {
        "first": 25
      }
    },
    "get_cycle": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetCycle($id: String!) { cycle(id: $id) { id name number startsAt endsAt completedAt progress } }",
      "extract": "cycle"
    },
    "list_comments": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListComments($first: Int, $after: String, $filter: CommentFilter) { comments(first: $first, after: $after, filter: $filter) { nodes { id body createdAt updatedAt url user { id name } issue { id identifier } } pageInfo { hasNextPage endCursor } } }",
      "extract": "comments",
      "defaults": {
        "first": 25
      }
    },
    "get_comment": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetComment($id: String!) { comment(id: $id) { id body createdAt updatedAt url user { id name } issue { id identifier } } }",
      "extract": "comment"
    },
    "list_documents": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListDocuments($first: Int, $after: String, $filter: DocumentFilter) { documents(first: $first, after: $after, filter: $filter) { nodes { id title content url createdAt updatedAt } pageInfo { hasNextPage endCursor } } }",
      "extract": "documents",
      "defaults": {
        "first": 25
      }
    },
    "get_document": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetDocument($id: String!) { document(id: $id) { id title content url createdAt updatedAt } }",
      "extract": "document"
    },
    "list_labels": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListLabels($first: Int, $after: String, $filter: IssueLabelFilter) { issueLabels(first: $first, after: $after, filter: $filter) { nodes { id name description color } pageInfo { hasNextPage endCursor } } }",
      "extract": "issueLabels",
      "defaults": {
        "first": 25
      }
    },
    "get_label": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetLabel($id: String!) { issueLabel(id: $id) { id name description color } }",
      "extract": "issueLabel"
    },
    "list_workflow_states": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "filter": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "first",
        "after",
        "filter"
      ],
      "document": "query KicksideListWorkflowStates($first: Int, $after: String, $filter: WorkflowStateFilter) { workflowStates(first: $first, after: $after, filter: $filter) { nodes { id name type color position } pageInfo { hasNextPage endCursor } } }",
      "extract": "workflowStates",
      "defaults": {
        "first": 25
      }
    },
    "get_workflow_state": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "query KicksideGetWorkflowState($id: String!) { workflowState(id: $id) { id name type color position } }",
      "extract": "workflowState"
    },
    "search_issues": {
      "method": "POST",
      "path": "",
      "write": false,
      "schema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "minLength": 1
          },
          "first": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100
          },
          "after": {
            "type": "string",
            "minLength": 1
          },
          "includeArchived": {
            "type": "boolean"
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
        "first",
        "after",
        "includeArchived"
      ],
      "document": "query KicksideSearchIssues($query: String!, $first: Int, $after: String, $includeArchived: Boolean) { issueSearch(query: $query, first: $first, after: $after, includeArchived: $includeArchived) { nodes { id identifier title description url priority estimate dueDate createdAt updatedAt state { id name type } team { id key name } assignee { id name } project { id name } cycle { id name number } labels { nodes { id name } } } pageInfo { hasNextPage endCursor } } }",
      "extract": "issueSearch",
      "defaults": {
        "first": 25
      }
    },
    "create_issue": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "assigneeId": {
                "type": "string"
              },
              "completedAt": {
                "type": "string"
              },
              "createAsUser": {
                "type": "string"
              },
              "createdAt": {
                "type": "string"
              },
              "cycleId": {
                "type": "string"
              },
              "delegateId": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "descriptionData": {},
              "displayIconUrl": {
                "type": "string"
              },
              "dueDate": {
                "type": "string"
              },
              "estimate": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "id": {
                "type": "string"
              },
              "inheritsSharedAccess": {
                "type": "boolean"
              },
              "labelIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "lastAppliedTemplateId": {
                "type": "string"
              },
              "parentId": {
                "type": "string"
              },
              "preserveSortOrderOnCreate": {
                "type": "boolean"
              },
              "priority": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "prioritySortOrder": {
                "type": "number"
              },
              "projectId": {
                "type": "string"
              },
              "projectMilestoneId": {
                "type": "string"
              },
              "referenceCommentId": {
                "type": "string"
              },
              "releaseIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "slaBreachesAt": {
                "type": "string"
              },
              "slaStartedAt": {
                "type": "string"
              },
              "slaType": {
                "type": "string",
                "enum": [
                  "all",
                  "onlyBusinessDays"
                ]
              },
              "sortOrder": {
                "type": "number"
              },
              "sourceCommentId": {
                "type": "string"
              },
              "sourcePullRequestCommentId": {
                "type": "string"
              },
              "stateId": {
                "type": "string"
              },
              "subIssueSortOrder": {
                "type": "number"
              },
              "subscriberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "teamId": {
                "type": "string"
              },
              "templateId": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "useDefaultTemplate": {
                "type": "boolean"
              }
            },
            "required": [
              "teamId"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "input"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input"
      ],
      "document": "mutation KicksideCreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier title description url priority estimate dueDate createdAt updatedAt state { id name type } team { id key name } assignee { id name } project { id name } cycle { id name number } labels { nodes { id name } } } } }",
      "extract": "issueCreate"
    },
    "update_issue": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "addedLabelIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "addedReleaseIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "assigneeId": {
                "type": "string"
              },
              "autoClosedByParentClosing": {
                "type": "boolean"
              },
              "cycleId": {
                "type": "string"
              },
              "delegateId": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "descriptionData": {},
              "dueDate": {
                "type": "string"
              },
              "estimate": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "inheritsSharedAccess": {
                "type": "boolean"
              },
              "labelIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "lastAppliedTemplateId": {
                "type": "string"
              },
              "parentId": {
                "type": "string"
              },
              "priority": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "prioritySortOrder": {
                "type": "number"
              },
              "projectId": {
                "type": "string"
              },
              "projectMilestoneId": {
                "type": "string"
              },
              "releaseIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "removedLabelIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "removedReleaseIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "slaBreachesAt": {
                "type": "string"
              },
              "slaStartedAt": {
                "type": "string"
              },
              "slaType": {
                "type": "string",
                "enum": [
                  "all",
                  "onlyBusinessDays"
                ]
              },
              "snoozedById": {
                "type": "string"
              },
              "snoozedUntilAt": {
                "type": "string"
              },
              "sortOrder": {
                "type": "number"
              },
              "stateId": {
                "type": "string"
              },
              "subIssueSortOrder": {
                "type": "number"
              },
              "subscriberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "teamId": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "trashed": {
                "type": "boolean"
              },
              "trusted": {
                "type": "boolean"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "id": {
            "type": "string",
            "minLength": 1
          },
          "clear_fields": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "teamId",
                "description",
                "assigneeId",
                "stateId",
                "projectId",
                "cycleId",
                "estimate",
                "dueDate",
                "parentId"
              ]
            },
            "minItems": 1,
            "maxItems": 9
          }
        },
        "required": [
          "input",
          "id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input",
        "id"
      ],
      "document": "mutation KicksideUpdateIssue($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success issue { id identifier title description url priority estimate dueDate createdAt updatedAt state { id name type } team { id key name } assignee { id name } project { id name } cycle { id name number } labels { nodes { id name } } } } }",
      "extract": "issueUpdate",
      "clear_parent": "input"
    },
    "create_project": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "color": {
                "type": "string"
              },
              "content": {
                "type": "string"
              },
              "convertedFromIssueId": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "icon": {
                "type": "string"
              },
              "id": {
                "type": "string"
              },
              "labelIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "lastAppliedTemplateId": {
                "type": "string"
              },
              "leadId": {
                "type": "string"
              },
              "leadTeamId": {
                "type": "string"
              },
              "memberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "name": {
                "type": "string"
              },
              "priority": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "prioritySortOrder": {
                "type": "number"
              },
              "sortOrder": {
                "type": "number"
              },
              "startDate": {
                "type": "string"
              },
              "startDateResolution": {
                "type": "string",
                "enum": [
                  "halfYear",
                  "month",
                  "quarter",
                  "year"
                ]
              },
              "statusId": {
                "type": "string"
              },
              "targetDate": {
                "type": "string"
              },
              "targetDateResolution": {
                "type": "string",
                "enum": [
                  "halfYear",
                  "month",
                  "quarter",
                  "year"
                ]
              },
              "teamIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "templateId": {
                "type": "string"
              },
              "useDefaultTemplate": {
                "type": "boolean"
              }
            },
            "required": [
              "name",
              "teamIds"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "input"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input"
      ],
      "document": "mutation KicksideCreateProject($input: ProjectCreateInput!) { projectCreate(input: $input) { success project { id name description content url state progress startDate targetDate createdAt updatedAt } } }",
      "extract": "projectCreate"
    },
    "update_project": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "canceledAt": {
                "type": "string"
              },
              "color": {
                "type": "string"
              },
              "completedAt": {
                "type": "string"
              },
              "content": {
                "type": "string"
              },
              "convertedFromIssueId": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "frequencyResolution": {
                "type": "string",
                "enum": [
                  "daily",
                  "weekly"
                ]
              },
              "icon": {
                "type": "string"
              },
              "labelIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "lastAppliedTemplateId": {
                "type": "string"
              },
              "leadId": {
                "type": "string"
              },
              "leadTeamId": {
                "type": "string"
              },
              "memberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "name": {
                "type": "string"
              },
              "priority": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              },
              "prioritySortOrder": {
                "type": "number"
              },
              "projectUpdateRemindersPausedUntilAt": {
                "type": "string"
              },
              "slackIssueComments": {
                "type": "boolean"
              },
              "slackIssueStatuses": {
                "type": "boolean"
              },
              "slackNewIssue": {
                "type": "boolean"
              },
              "sortOrder": {
                "type": "number"
              },
              "startDate": {
                "type": "string"
              },
              "startDateResolution": {
                "type": "string",
                "enum": [
                  "halfYear",
                  "month",
                  "quarter",
                  "year"
                ]
              },
              "statusId": {
                "type": "string"
              },
              "targetDate": {
                "type": "string"
              },
              "targetDateResolution": {
                "type": "string",
                "enum": [
                  "halfYear",
                  "month",
                  "quarter",
                  "year"
                ]
              },
              "teamIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "trashed": {
                "type": "boolean"
              },
              "updateReminderFrequency": {
                "type": "number"
              },
              "updateReminderFrequencyInWeeks": {
                "type": "number"
              },
              "updateRemindersDay": {
                "type": "string",
                "enum": [
                  "Friday",
                  "Monday",
                  "Saturday",
                  "Sunday",
                  "Thursday",
                  "Tuesday",
                  "Wednesday"
                ]
              },
              "updateRemindersHour": {
                "type": "integer",
                "minimum": -2147483648,
                "maximum": 2147483647
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "id": {
            "type": "string",
            "minLength": 1
          },
          "clear_fields": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "description",
                "leadId",
                "startDate",
                "targetDate",
                "icon",
                "color"
              ]
            },
            "minItems": 1,
            "maxItems": 6
          }
        },
        "required": [
          "input",
          "id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input",
        "id"
      ],
      "document": "mutation KicksideUpdateProject($id: String!, $input: ProjectUpdateInput!) { projectUpdate(id: $id, input: $input) { success project { id name description content url state progress startDate targetDate createdAt updatedAt } } }",
      "extract": "projectUpdate",
      "clear_parent": "input"
    },
    "create_cycle": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "completedAt": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "endsAt": {
                "type": "string"
              },
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "startsAt": {
                "type": "string"
              },
              "teamId": {
                "type": "string"
              }
            },
            "required": [
              "endsAt",
              "startsAt",
              "teamId"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "input"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input"
      ],
      "document": "mutation KicksideCreateCycle($input: CycleCreateInput!) { cycleCreate(input: $input) { success cycle { id name number startsAt endsAt completedAt progress } } }",
      "extract": "cycleCreate"
    },
    "update_cycle": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "completedAt": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "endsAt": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "startsAt": {
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "id": {
            "type": "string",
            "minLength": 1
          },
          "clear_fields": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "description"
              ]
            },
            "minItems": 1,
            "maxItems": 1
          }
        },
        "required": [
          "input",
          "id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input",
        "id"
      ],
      "document": "mutation KicksideUpdateCycle($id: String!, $input: CycleUpdateInput!) { cycleUpdate(id: $id, input: $input) { success cycle { id name number startsAt endsAt completedAt progress } } }",
      "extract": "cycleUpdate",
      "clear_parent": "input"
    },
    "create_comment": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "body": {
                "type": "string"
              },
              "bodyData": {},
              "createAsUser": {
                "type": "string"
              },
              "createOnSyncedSlackThread": {
                "type": "boolean"
              },
              "createdAt": {
                "type": "string"
              },
              "displayIconUrl": {
                "type": "string"
              },
              "doNotSubscribeToIssue": {
                "type": "boolean"
              },
              "documentContentId": {
                "type": "string"
              },
              "id": {
                "type": "string"
              },
              "initiativeId": {
                "type": "string"
              },
              "initiativeUpdateId": {
                "type": "string"
              },
              "issueId": {
                "type": "string"
              },
              "parentId": {
                "type": "string"
              },
              "postId": {
                "type": "string"
              },
              "projectId": {
                "type": "string"
              },
              "projectUpdateId": {
                "type": "string"
              },
              "quotedText": {
                "type": "string"
              },
              "subscriberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              }
            },
            "required": [],
            "additionalProperties": false
          }
        },
        "required": [
          "input"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input"
      ],
      "document": "mutation KicksideCreateComment($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id body createdAt updatedAt url user { id name } issue { id identifier } } } }",
      "extract": "commentCreate"
    },
    "update_comment": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "body": {
                "type": "string"
              },
              "bodyData": {},
              "doNotSubscribeToIssue": {
                "type": "boolean"
              },
              "quotedText": {
                "type": "string"
              },
              "resolvingCommentId": {
                "type": "string"
              },
              "resolvingUserId": {
                "type": "string"
              },
              "subscriberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "id": {
            "type": "string",
            "minLength": 1
          },
          "clear_fields": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": []
            },
            "minItems": 1,
            "maxItems": 0
          }
        },
        "required": [
          "input",
          "id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input",
        "id"
      ],
      "document": "mutation KicksideUpdateComment($id: String!, $input: CommentUpdateInput!) { commentUpdate(id: $id, input: $input) { success comment { id body createdAt updatedAt url user { id name } issue { id identifier } } } }",
      "extract": "commentUpdate",
      "clear_parent": "input"
    },
    "create_document": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "color": {
                "type": "string"
              },
              "content": {
                "type": "string"
              },
              "cycleId": {
                "type": "string"
              },
              "icon": {
                "type": "string"
              },
              "id": {
                "type": "string"
              },
              "initiativeId": {
                "type": "string"
              },
              "issueId": {
                "type": "string"
              },
              "lastAppliedTemplateId": {
                "type": "string"
              },
              "ownerId": {
                "type": "string"
              },
              "parentDocumentId": {
                "type": "string"
              },
              "projectId": {
                "type": "string"
              },
              "releaseId": {
                "type": "string"
              },
              "resourceFolderId": {
                "type": "string"
              },
              "sortOrder": {
                "type": "number"
              },
              "subDocumentSortOrder": {
                "type": "number"
              },
              "subscriberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "teamId": {
                "type": "string"
              },
              "title": {
                "type": "string"
              }
            },
            "required": [
              "title"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "input"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input"
      ],
      "document": "mutation KicksideCreateDocument($input: DocumentCreateInput!) { documentCreate(input: $input) { success document { id title content url createdAt updatedAt } } }",
      "extract": "documentCreate"
    },
    "update_document": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "color": {
                "type": "string"
              },
              "content": {
                "type": "string"
              },
              "cycleId": {
                "type": "string"
              },
              "hiddenAt": {
                "type": "string"
              },
              "icon": {
                "type": "string"
              },
              "initiativeId": {
                "type": "string"
              },
              "issueId": {
                "type": "string"
              },
              "lastAppliedTemplateId": {
                "type": "string"
              },
              "ownerId": {
                "type": "string"
              },
              "parentDocumentId": {
                "type": "string"
              },
              "personalUserId": {
                "type": "string"
              },
              "projectId": {
                "type": "string"
              },
              "releaseId": {
                "type": "string"
              },
              "resourceFolderId": {
                "type": "string"
              },
              "sortOrder": {
                "type": "number"
              },
              "subDocumentSortOrder": {
                "type": "number"
              },
              "subscriberIds": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "maxItems": 100
              },
              "teamId": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "trashed": {
                "type": "boolean"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "id": {
            "type": "string",
            "minLength": 1
          },
          "clear_fields": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "projectId",
                "issueId",
                "icon",
                "color"
              ]
            },
            "minItems": 1,
            "maxItems": 4
          }
        },
        "required": [
          "input",
          "id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input",
        "id"
      ],
      "document": "mutation KicksideUpdateDocument($id: String!, $input: DocumentUpdateInput!) { documentUpdate(id: $id, input: $input) { success document { id title content url createdAt updatedAt } } }",
      "extract": "documentUpdate",
      "clear_parent": "input"
    },
    "create_label": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "color": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "groupType": {
                "type": "string",
                "enum": [
                  "multiSelect",
                  "singleSelect"
                ]
              },
              "id": {
                "type": "string"
              },
              "isGroup": {
                "type": "boolean"
              },
              "name": {
                "type": "string"
              },
              "parentId": {
                "type": "string"
              },
              "retiredAt": {
                "type": "string"
              },
              "teamId": {
                "type": "string"
              }
            },
            "required": [
              "name"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "input"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input"
      ],
      "document": "mutation KicksideCreateLabel($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { success issueLabel { id name description color } } }",
      "extract": "issueLabelCreate"
    },
    "update_label": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "color": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "groupType": {
                "type": "string",
                "enum": [
                  "multiSelect",
                  "singleSelect"
                ]
              },
              "isGroup": {
                "type": "boolean"
              },
              "name": {
                "type": "string"
              },
              "parentId": {
                "type": "string"
              },
              "retiredAt": {
                "type": "string"
              }
            },
            "required": [],
            "additionalProperties": false
          },
          "id": {
            "type": "string",
            "minLength": 1
          },
          "clear_fields": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "description",
                "color",
                "parentId"
              ]
            },
            "minItems": 1,
            "maxItems": 3
          }
        },
        "required": [
          "input",
          "id"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input",
        "id"
      ],
      "document": "mutation KicksideUpdateLabel($id: String!, $input: IssueLabelUpdateInput!) { issueLabelUpdate(id: $id, input: $input) { success issueLabel { id name description color } } }",
      "extract": "issueLabelUpdate",
      "clear_parent": "input"
    },
    "archive_issue": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideArchiveIssue($id: String!) { issueArchive(id: $id) { success } }",
      "extract": "issueArchive"
    },
    "unarchive_issue": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideUnarchiveIssue($id: String!) { issueUnarchive(id: $id) { success } }",
      "extract": "issueUnarchive"
    },
    "delete_issue": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideDeleteIssue($id: String!) { issueDelete(id: $id) { success } }",
      "extract": "issueDelete"
    },
    "archive_project": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideArchiveProject($id: String!) { projectArchive(id: $id) { success } }",
      "extract": "projectArchive"
    },
    "unarchive_project": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideUnarchiveProject($id: String!) { projectUnarchive(id: $id) { success } }",
      "extract": "projectUnarchive"
    },
    "delete_project": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideDeleteProject($id: String!) { projectDelete(id: $id) { success } }",
      "extract": "projectDelete"
    },
    "delete_comment": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideDeleteComment($id: String!) { commentDelete(id: $id) { success } }",
      "extract": "commentDelete"
    },
    "delete_document": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideDeleteDocument($id: String!) { documentDelete(id: $id) { success } }",
      "extract": "documentDelete"
    },
    "delete_label": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideDeleteLabel($id: String!) { issueLabelDelete(id: $id) { success } }",
      "extract": "issueLabelDelete"
    },
    "delete_issueRelation": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
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
      "query": [],
      "body": [
        "id"
      ],
      "document": "mutation KicksideDeleteIssuerelation($id: String!) { issueRelationDelete(id: $id) { success } }",
      "extract": "issueRelationDelete"
    },
    "create_issue_relation": {
      "method": "POST",
      "path": "",
      "write": true,
      "schema": {
        "type": "object",
        "properties": {
          "input": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "issueId": {
                "type": "string"
              },
              "relatedIssueId": {
                "type": "string"
              },
              "type": {
                "type": "string",
                "enum": [
                  "blocks",
                  "duplicate",
                  "related",
                  "similar"
                ]
              }
            },
            "required": [
              "issueId",
              "relatedIssueId",
              "type"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "input"
        ],
        "additionalProperties": false
      },
      "query": [],
      "body": [
        "input"
      ],
      "document": "mutation KicksideCreateIssueRelation($input: IssueRelationCreateInput!) { issueRelationCreate(input: $input) { success issueRelation { id type issue { id identifier } relatedIssue { id identifier } } } }",
      "extract": "issueRelationCreate"
    }
  },
  "health_action": "get_viewer",
  "discovery_action": "list_teams",
  "discovery_params": {
    "first": 100
  },
  "api_key_scheme": "raw",
  "provider": "linear"
}]=]) :: types.Config
local function get(): types.Config
    local resolved: types.Config = {provider = config.provider, title = config.title,
        headers = config.headers, operations = config.operations, endpoints = {}, api_key_scheme = config.api_key_scheme, query_array_format = config.query_array_format,
        health_action = config.health_action, discovery_action = config.discovery_action,
        discovery_params = config.discovery_params}
    for key in pairs(config.endpoints) do
        resolved.endpoints[key] = endpoints.get("kickside.linear:endpoints", key)
    end
    return resolved
end
return {get = get, definition = config}
