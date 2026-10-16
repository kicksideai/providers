local endpoints = require("endpoints")
local M = {}

M.PROVIDER = "hubspot"
M.CONNECTION_CLASS = "connection"
function M.api_base(): string
    return endpoints.get("kickside.hubspot:endpoints", "api")
end

type Result = {
    success: boolean,
    data: unknown?,
    error: string?,
    status_code: integer?,
    retry_after_ms: number?,
    kind: string?,
    message: string?,
    retryable: boolean?,
    details: unknown?,
}

type Conn = {
    component_id: string?,
    api_key: string,
    -- The caller's RFC3339 deadline (a sync round's work deadline): no
    -- request or rate-limit backoff outlasts it.
    deadline: string?,
}

type AssociationInput = {
    id: string,
    after: string?,
    -- Flatten-side resume: rows of the (id, after) page already emitted in an
    -- earlier engine-limited answer. Never sent to the transport.
    skip: number?,
}

type AssociationType = {
    category: string?,
    typeId: number?,
    label: string?,
}

type ObjectId = string | number

type AssociationTarget = {
    toObjectId: ObjectId?,
    associationTypes: { AssociationType }?,
}

type Paging = {
    next: {
        after: string,
        link: string?,
    }?,
}

type AssociationResult = {
    from: { id: ObjectId? }?,
    to: { AssociationTarget }?,
    paging: Paging?,
}

type AssociationBatchData = {
    results: { AssociationResult }?,
    numErrors: number?,
    errors: { {
        status: string?,
        category: string?,
        message: string?,
        context: { [string]: { string } }?,
    } }?,
}

type AssociationBatchResult = {
    success: boolean,
    data: AssociationBatchData?,
    error: string?,
    status_code: integer?,
    retry_after_ms: number?,
}

M.ObjectId = ObjectId
M.Result = Result
M.Conn = Conn
M.AssociationInput = AssociationInput
M.AssociationType = AssociationType
M.AssociationTarget = AssociationTarget
M.Paging = Paging
M.AssociationResult = AssociationResult
M.AssociationBatchData = AssociationBatchData
M.AssociationBatchResult = AssociationBatchResult

return M
