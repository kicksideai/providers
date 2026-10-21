local json = require("json")
-- Input field contracts extracted from the pinned official GraphQL schema.
return json.decode([=[{
  "create_issue": {
    "fields": [
      "assigneeId",
      "completedAt",
      "createAsUser",
      "createdAt",
      "cycleId",
      "delegateId",
      "description",
      "descriptionData",
      "displayIconUrl",
      "dueDate",
      "estimate",
      "id",
      "inheritsSharedAccess",
      "labelIds",
      "lastAppliedTemplateId",
      "parentId",
      "preserveSortOrderOnCreate",
      "priority",
      "prioritySortOrder",
      "projectId",
      "projectMilestoneId",
      "referenceCommentId",
      "releaseIds",
      "slaBreachesAt",
      "slaStartedAt",
      "slaType",
      "sortOrder",
      "sourceCommentId",
      "sourcePullRequestCommentId",
      "stateId",
      "subIssueSortOrder",
      "subscriberIds",
      "teamId",
      "templateId",
      "title",
      "useDefaultTemplate"
    ],
    "required": [
      "teamId"
    ]
  },
  "update_issue": {
    "fields": [
      "addedLabelIds",
      "addedReleaseIds",
      "assigneeId",
      "autoClosedByParentClosing",
      "cycleId",
      "delegateId",
      "description",
      "descriptionData",
      "dueDate",
      "estimate",
      "inheritsSharedAccess",
      "labelIds",
      "lastAppliedTemplateId",
      "parentId",
      "priority",
      "prioritySortOrder",
      "projectId",
      "projectMilestoneId",
      "releaseIds",
      "removedLabelIds",
      "removedReleaseIds",
      "slaBreachesAt",
      "slaStartedAt",
      "slaType",
      "snoozedById",
      "snoozedUntilAt",
      "sortOrder",
      "stateId",
      "subIssueSortOrder",
      "subscriberIds",
      "teamId",
      "title",
      "trashed",
      "trusted"
    ],
    "required": []
  },
  "create_project": {
    "fields": [
      "color",
      "content",
      "convertedFromIssueId",
      "description",
      "icon",
      "id",
      "labelIds",
      "lastAppliedTemplateId",
      "leadId",
      "leadTeamId",
      "memberIds",
      "name",
      "priority",
      "prioritySortOrder",
      "sortOrder",
      "startDate",
      "startDateResolution",
      "statusId",
      "targetDate",
      "targetDateResolution",
      "teamIds",
      "templateId",
      "useDefaultTemplate"
    ],
    "required": [
      "name",
      "teamIds"
    ]
  },
  "update_project": {
    "fields": [
      "canceledAt",
      "color",
      "completedAt",
      "content",
      "convertedFromIssueId",
      "description",
      "frequencyResolution",
      "icon",
      "labelIds",
      "lastAppliedTemplateId",
      "leadId",
      "leadTeamId",
      "memberIds",
      "name",
      "priority",
      "prioritySortOrder",
      "projectUpdateRemindersPausedUntilAt",
      "slackIssueComments",
      "slackIssueStatuses",
      "slackNewIssue",
      "sortOrder",
      "startDate",
      "startDateResolution",
      "statusId",
      "targetDate",
      "targetDateResolution",
      "teamIds",
      "trashed",
      "updateReminderFrequency",
      "updateReminderFrequencyInWeeks",
      "updateRemindersDay",
      "updateRemindersHour"
    ],
    "required": []
  },
  "create_cycle": {
    "fields": [
      "completedAt",
      "description",
      "endsAt",
      "id",
      "name",
      "startsAt",
      "teamId"
    ],
    "required": [
      "endsAt",
      "startsAt",
      "teamId"
    ]
  },
  "update_cycle": {
    "fields": [
      "completedAt",
      "description",
      "endsAt",
      "name",
      "startsAt"
    ],
    "required": []
  },
  "create_comment": {
    "fields": [
      "body",
      "bodyData",
      "createAsUser",
      "createOnSyncedSlackThread",
      "createdAt",
      "displayIconUrl",
      "doNotSubscribeToIssue",
      "documentContentId",
      "id",
      "initiativeId",
      "initiativeUpdateId",
      "issueId",
      "parentId",
      "postId",
      "projectId",
      "projectUpdateId",
      "quotedText",
      "subscriberIds"
    ],
    "required": []
  },
  "update_comment": {
    "fields": [
      "body",
      "bodyData",
      "doNotSubscribeToIssue",
      "quotedText",
      "resolvingCommentId",
      "resolvingUserId",
      "subscriberIds"
    ],
    "required": []
  },
  "create_document": {
    "fields": [
      "color",
      "content",
      "cycleId",
      "icon",
      "id",
      "initiativeId",
      "issueId",
      "lastAppliedTemplateId",
      "ownerId",
      "parentDocumentId",
      "projectId",
      "releaseId",
      "resourceFolderId",
      "sortOrder",
      "subDocumentSortOrder",
      "subscriberIds",
      "teamId",
      "title"
    ],
    "required": [
      "title"
    ]
  },
  "update_document": {
    "fields": [
      "color",
      "content",
      "cycleId",
      "hiddenAt",
      "icon",
      "initiativeId",
      "issueId",
      "lastAppliedTemplateId",
      "ownerId",
      "parentDocumentId",
      "personalUserId",
      "projectId",
      "releaseId",
      "resourceFolderId",
      "sortOrder",
      "subDocumentSortOrder",
      "subscriberIds",
      "teamId",
      "title",
      "trashed"
    ],
    "required": []
  },
  "create_label": {
    "fields": [
      "color",
      "description",
      "groupType",
      "id",
      "isGroup",
      "name",
      "parentId",
      "retiredAt",
      "teamId"
    ],
    "required": [
      "name"
    ]
  },
  "update_label": {
    "fields": [
      "color",
      "description",
      "groupType",
      "isGroup",
      "name",
      "parentId",
      "retiredAt"
    ],
    "required": []
  },
  "create_issue_relation": {
    "fields": [
      "id",
      "issueId",
      "relatedIssueId",
      "type"
    ],
    "required": [
      "issueId",
      "relatedIssueId",
      "type"
    ]
  }
}]=])
