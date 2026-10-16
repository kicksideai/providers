local pull_core = require("pull_core")
local operation_policy = require("operation_policy")

local M = {}

type JsonMap = { [string]: unknown }
type JsonList = { unknown }
local SOURCE_ID = "kickside.phantombuster.research:source"
local CANDIDATES = "candidate_snapshot"
local ACTIVITIES = "activity_snapshot"

local function map(value: unknown): JsonMap
    return type(value) == "table" and value :: JsonMap or {}
end

local function list(value: unknown): JsonList
    return type(value) == "table" and value :: JsonList or {}
end

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function subject_refs(subject: unknown): JsonList
    return type(subject) == "table" and { subject } or {}
end

local function candidate_artifact(payload: JsonMap, subject: unknown): JsonMap?
    local provenance = map(payload.provenance)
    local external_id = trim(provenance.external_id)
    if external_id == "" then return nil end
    local profile_url = trim(provenance.source_url)
    local title = trim(payload.name)
    if title == "" then title = trim(payload.title) end
    if title == "" then title = external_id end
    return {
        source_artifact_key = "candidate:" .. external_id,
        canonical_uri = profile_url,
        title = title,
        media_type = "application/vnd.kickside.social-candidate+json",
        content = {
            name = trim(payload.name),
            first_name = trim(payload.first_name),
            last_name = trim(payload.last_name),
            company_name = trim(payload.company_name),
            title = trim(payload.title),
            jurisdiction = trim(payload.jurisdiction),
            profile_url = profile_url,
        },
        subject_refs = subject_refs(subject),
    }
end

local function activity_artifact(payload: JsonMap, subject: unknown): JsonMap?
    local post_id = trim(payload.post_id)
    if post_id == "" then return nil end
    local author = map(payload.author)
    local uri = trim(payload.url)
    return {
        source_artifact_key = "activity:" .. post_id,
        canonical_uri = uri,
        title = trim(author.name) ~= "" and ("Activity by " .. trim(author.name)) or post_id,
        media_type = "application/vnd.kickside.social-activity+json",
        published_at = trim(payload.published_at),
        content = {
            author_name = trim(author.name),
            author_profile_url = trim(author.profile_url),
            text = trim(payload.text),
            url = uri,
        },
        subject_refs = subject_refs(subject),
    }
end

local function pull_request(config: JsonMap, limits: JsonMap, operation: string): (JsonMap?, string?)
    local raw = limits.max_results
    if type(raw) ~= "number" or raw ~= math.floor(raw) then
        return nil, "input.limits.max_results is required and must be an integer"
    end
    local configured_rows = config.max_rows_per_pull
    if type(configured_rows) ~= "number" or configured_rows ~= math.floor(configured_rows) then
        return nil, "config.max_rows_per_pull is required and must be an integer"
    end
    if configured_rows ~= raw then
        return nil, "config.max_rows_per_pull must match input.limits.max_results"
    end
    local policy, policy_err = operation_policy.validate(config.operation_policy, {
        connection_id = trim(config.connection_id),
        max_results = raw,
        operation_id = operation,
        control_bounds = config.control_bounds,
    })
    if not policy then return nil, tostring(policy_err) end
    local request: JsonMap = {
        config = {
            connection_id = config.connection_id,
            actor_id = config.actor_id,
            query = config.actor_scope,
            max_rows_per_pull = raw,
            owner_component_id = config.owner_component_id,
            control_bounds = config.control_bounds,
            operation_policy = policy,
        },
        limit = raw,
    }
    local snapshot_id = trim(config.snapshot_id)
    if snapshot_id ~= "" then
        (request.config :: JsonMap).snapshot_id = snapshot_id
        request.snapshot_id = snapshot_id
    end
    if policy.snapshot_id ~= nil and request.snapshot_id == nil then
        request.snapshot_id = policy.snapshot_id
    end
    return request, nil
end

local function complete_receipt(response: JsonMap, policy: JsonMap, control: JsonMap): (JsonMap?, string?)
    local receipt = map(map(response.next_cursor).receipt)
    if receipt.complete ~= true then
        return nil, "PhantomBuster output read failed: provider receipt is not complete"
    end
    if trim(receipt.provider) ~= "phantombuster" then
        return nil, "PhantomBuster output read failed: provider receipt is missing"
    end
    if trim(receipt.actor_id) == "" or trim(receipt.snapshot_id) == "" or trim(receipt.captured_at) == "" then
        return nil, "PhantomBuster output read failed: provider receipt has no stable snapshot identity"
    end
    if type(receipt.rows_read) ~= "number" or receipt.rows_read ~= math.floor(receipt.rows_read) or receipt.rows_read < 0 then
        return nil, "PhantomBuster output read failed: provider receipt has invalid rows_read"
    end
    local actual_policy = map(receipt.policy_receipt)
    if not operation_policy.receipt_matches(actual_policy, policy) then
        return nil, "PhantomBuster output read failed: provider receipt policy does not match the effective policy"
    end
    local actual_control = map(receipt.control_receipt)
    if trim(receipt.control_digest) ~= control.digest
        or not operation_policy.control_receipt_matches(actual_control, control)
    then
        return nil, "PhantomBuster output read failed: provider receipt control does not match the effective control bounds"
    end
    return receipt, nil
end

local function completeness(response: JsonMap, receipt: JsonMap): (JsonMap?, string?)
    local coverage = map(response.coverage)
    if coverage.mode ~= "complete" or coverage.final ~= true or response.has_more ~= false then
        return nil, "PhantomBuster output read failed: snapshot completeness is not confirmed"
    end
    if trim(coverage.pass_key) ~= trim(receipt.snapshot_id) or trim(coverage.scope_key) == "" then
        return nil, "PhantomBuster output read failed: snapshot receipt and completeness disagree"
    end
    if receipt.rows_read ~= #list(response.items) then
        return nil, "PhantomBuster output read failed: snapshot completeness has invalid rows_read"
    end
    return {
        mode = "snapshot", complete = true, snapshot_id = receipt.snapshot_id,
        captured_at = receipt.captured_at, rows_read = receipt.rows_read,
    }, nil
end

function M.run(value: unknown, puller: any?): (JsonMap?, string?)
    local envelope = map(value)
    local input = map(envelope.input)
    local config = map(envelope.config)
    local operation = trim(input.operation)
    if operation ~= CANDIDATES and operation ~= ACTIVITIES then
        return nil, "unsupported PhantomBuster Research operation: " .. operation
    end
    if trim(config.connection_id) == "" then return nil, "connection_id is required" end
    if trim(config.actor_id) == "" then return nil, "actor_id is required" end
    if trim(config.actor_scope) == "" then return nil, "actor_scope is required" end
    if trim(config.owner_component_id) == "" then return nil, "owner_component_id is required" end
    local control, control_err = operation_policy.validate_bounds(config.control_bounds)
    if not control then return nil, control_err end

    local deps = puller or {
        candidates = function(request: unknown): unknown return pull_core.pull(request) end,
        activities = function(request: unknown): unknown return pull_core.pull_activities(request) end,
    }
    local request, request_err = pull_request(config, map(input.limits), operation)
    if not request then return nil, request_err end
    if (request.config.operation_policy :: JsonMap).ownership.owner_component_id ~= trim(config.owner_component_id) then
        return nil, "operation_policy.ownership.owner_component_id must match owner_component_id"
    end
    local result = operation == CANDIDATES and deps.candidates(request) or deps.activities(request)
    local response = map(result)
    if response.success ~= true then
        return nil, "PhantomBuster output read failed: " .. trim(map(response.error).message)
    end
    local receipt, receipt_err = complete_receipt(response, request.config.operation_policy :: JsonMap, control)
    if not receipt then return nil, receipt_err end
    local complete, complete_err = completeness(response, receipt)
    if not complete then return nil, complete_err end

    local artifacts: JsonList = {}
    for _, item_value in ipairs(list(response.items)) do
        local payload = map(map(item_value).payload)
        local artifact = operation == CANDIDATES
            and candidate_artifact(payload, input.subject)
            or activity_artifact(payload, input.subject)
        if artifact then artifacts[#artifacts + 1] = artifact end
    end
    return {
        source_id = SOURCE_ID,
        operation = operation,
        artifacts = artifacts,
        receipt = receipt,
        completeness = complete,
    }, nil
end

M._test = {
    activity_artifact = activity_artifact,
    candidate_artifact = candidate_artifact,
    pull_request = pull_request,
}

return M
