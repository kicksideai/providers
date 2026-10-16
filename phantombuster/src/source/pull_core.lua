local capacity_http = require("capacity_http")
local ctx = require("ctx")
local json = require("json")
local time = require("time")
local transport = require("transport")
local operation_policy = require("operation_policy")

local M = {}

local function trim(v: any): string
    if type(v) ~= "string" then
        return ""
    end
    return (v:gsub("^%s*(.-)%s*$", "%1"))
end

local function value(row: any, ...): any
    if type(row) ~= "table" then
        return nil
    end
    for i = 1, select("#", ...) do
        local key = select(i, ...)
        local v = (row :: any)[key]
        if v ~= nil and v ~= "" then
            return v
        end
    end
    return nil
end

local function rows_from(data: any): { any }
    if type(data) == "string" then
        local decoded = json.decode(data)
        data = decoded or {}
    end
    if type(data) ~= "table" then
        return {}
    end
    if #data > 0 then
        return data :: { any }
    end
    for _, key in ipairs({ "results", "data", "items", "output" }) do
        if type((data :: any)[key]) == "table" then
            return (data :: any)[key] :: { any }
        end
    end
    return {}
end

local function map_value(map: any, ...): any
    if type(map) ~= "table" then return nil end
    for i = 1, select("#", ...) do
        local key = select(i, ...)
        local item = (map :: any)[key]
        if item ~= nil and item ~= "" then return item end
    end
    return nil
end

local function required_limit(config: any): (number?, string?)
    local raw = type(config) == "table" and (config :: any).max_rows_per_pull or nil
    if type(raw) ~= "number" or raw ~= math.floor(raw) then
        return nil, "config.max_rows_per_pull is required and must be an integer"
    end
    return raw, nil
end

local function resolved_policy(req: any, deps: any, config: any, operation_id: string, limit: number): (any?, string?, any?)
    local policy, policy_err = operation_policy.validate(config.operation_policy, {
        connection_id = trim(config.connection_id),
        max_results = limit,
        operation_id = operation_id,
        control_bounds = config.control_bounds,
    })
    if not policy then return nil, tostring(policy_err) end
    local dependency_component = trim(deps.component_id)
    local ambient_component = trim(ctx.get("component_id"))
    if dependency_component ~= "" and ambient_component ~= "" and dependency_component ~= ambient_component then
        return nil, "canonical component context component_id is ambiguous"
    end
    local canonical_component = ambient_component ~= "" and ambient_component or dependency_component
    if canonical_component == "" then return nil, "canonical component context component_id is required" end
    local configured_owner = trim(config.owner_component_id)
    if configured_owner == "" then return nil, "config.owner_component_id is required" end
    local configured_connection = trim(config.connection_id)
    if canonical_component ~= configured_connection and canonical_component ~= configured_owner then
        return nil, "component context must name the configured connection or policy owner"
    end
    if policy.ownership.owner_component_id ~= configured_owner then
        return nil, "operation_policy.ownership.owner_component_id does not match config.owner_component_id"
    end
    local control, control_err = operation_policy.validate_bounds(config.control_bounds)
    if not control then return nil, tostring(control_err) end
    return policy, nil, control
end

local function explicit_snapshot_id(req: any, result: any): (string?, string?)
    local request = type(req) == "table" and (req :: any) or {}
    local request_config = type(request.config) == "table" and (request.config :: any) or {}
    local request_policy = type(request_config.operation_policy) == "table" and (request_config.operation_policy :: any) or {}
    local cursor = type(request.cursor) == "table" and (request.cursor :: any) or {}
    local data = type(result) == "table" and (result :: any).data or nil
    local receipt = type(result) == "table" and (result :: any).receipt or nil
    local data_receipt = type(data) == "table" and (data :: any).receipt or nil
    local provider_id = map_value(result,
        "snapshot_id", "snapshotId", "pull_id", "pullId", "run_id", "runId", "container_id", "containerId")
        or map_value(receipt, "snapshot_id", "snapshotId", "pull_id", "pullId", "run_id", "runId", "container_id", "containerId")
        or map_value(data_receipt, "snapshot_id", "snapshotId", "pull_id", "pullId", "run_id", "runId", "container_id", "containerId")
        or map_value(data, "snapshot_id", "snapshotId", "pull_id", "pullId", "run_id", "runId", "container_id", "containerId")
    local requested_id = map_value(request, "snapshot_id", "snapshotId", "pull_id", "pullId")
        or map_value(request_config, "snapshot_id", "snapshotId", "pull_id", "pullId")
        or map_value(request_policy, "snapshot_id", "snapshotId", "pull_id", "pullId")
        or map_value(cursor, "snapshot_id", "snapshotId", "pull_id", "pullId")
    local provider_text = trim(provider_id)
    local requested_text = trim(requested_id)
    if provider_text ~= "" and requested_text ~= "" and provider_text ~= requested_text then
        return nil, "provider snapshot identity does not match the requested snapshot identity"
    end
    if provider_text ~= "" then return provider_text, nil end
    return requested_text, nil
end

local function snapshot_status(result: any): string
    local data = type(result) == "table" and (result :: any).data or nil
    local receipt = type(result) == "table" and (result :: any).receipt or nil
    local data_receipt = type(data) == "table" and (data :: any).receipt or nil
    for i = 1, 4 do
        local source = i == 1 and result or i == 2 and receipt or i == 3 and data_receipt or data
        local status = trim(map_value(source, "status", "state", "snapshot_status", "snapshotState"))
        if status ~= "" then return status end
    end
    return ""
end

local function snapshot_completion(result: any): (boolean?, string?)
    local data = type(result) == "table" and (result :: any).data or nil
    local receipt = type(result) == "table" and (result :: any).receipt or nil
    local data_receipt = type(data) == "table" and (data :: any).receipt or nil
    local completed = map_value(result, "completed", "complete")
    if completed == nil then completed = map_value(receipt, "completed", "complete") end
    if completed == nil then completed = map_value(data_receipt, "completed", "complete") end
    if completed == nil then completed = map_value(data, "completed", "complete") end
    if completed ~= nil then
        if completed == true or completed == "true" or completed == 1 then return true, nil end
        return false, "actor output is not a completed snapshot"
    end

    local status = snapshot_status(result):lower()
    if status == "queued" or status == "pending" or status == "running" or status == "launching" or status == "scheduled" then
        return false, "actor output is not a completed snapshot"
    end
    if status == "failed" or status == "error" or status == "aborted" or status == "cancelled" or status == "canceled" then
        return false, "actor output did not complete successfully"
    end
    if status == "complete" or status == "completed" or status == "done" or status == "ended"
        or status == "finished" or status == "finish" or status == "success" or status == "succeeded"
        or status == "terminated" or status == "stopped"
    then
        return true, nil
    end
    return nil, "completed actor output has no explicit completion evidence"
end

local function snapshot_timestamp(result: any): string
    local data = type(result) == "table" and (result :: any).data or nil
    local receipt = type(result) == "table" and (result :: any).receipt or nil
    local data_receipt = type(data) == "table" and (data :: any).receipt or nil
    local keys = {
        "completed_at", "completedAt", "finished_at", "finishedAt", "ended_at", "endedAt",
        "captured_at", "capturedAt", "updated_at", "updatedAt", "timestamp",
    }
    local sources = { result, receipt, data_receipt, data }
    for index = 1, 4 do
        local candidate = map_value(sources[index], table.unpack(keys))
        local text = trim(candidate)
        if text ~= "" then return text end
    end
    return ""
end

local function now_value(deps: any): string
    if type(deps) == "table" then
        local value = (deps :: any).now
        if type(value) == "function" then value = value() end
        if type(value) == "string" and trim(value) ~= "" then return trim(value) end
    end
    return time.now():utc():format(time.RFC3339)
end

local function snapshot_fresh(result: any, policy: any, deps: any): (string?, string?)
    local observed_at = snapshot_timestamp(result)
    if observed_at == "" then return nil, "completed actor output has no freshness timestamp" end
    local captured, captured_err = time.parse(time.RFC3339, observed_at)
    local current_text = now_value(deps)
    local current, current_err = time.parse(time.RFC3339, current_text)
    if captured_err or current_err or not captured or not current then
        return nil, "completed actor output freshness timestamp is invalid"
    end
    local age = current:sub(captured):hours() * 3600
    if age < 0 then return nil, "completed actor output freshness timestamp is in the future" end
    if age > policy.lifecycle.stale_after_seconds then
        return nil, "completed actor output is stale under operation_policy.lifecycle.stale_after_seconds"
    end
    return observed_at, nil
end

local function snapshot_ready(req: any, result: any, policy: any, deps: any): (string?, string?, string?)
    if type(result) ~= "table" or (result :: any).success ~= true then
        return nil, nil, "actor output unavailable"
    end
    local completed, completion_err = snapshot_completion(result)
    if completed ~= true then return nil, nil, completion_err end
    local observed_at, freshness_err = snapshot_fresh(result, policy, deps)
    if not observed_at then return nil, nil, freshness_err end
    local snapshot_id, identity_err = explicit_snapshot_id(req, result)
    if identity_err then return nil, nil, identity_err end
    if not snapshot_id or snapshot_id == "" then return nil, nil, "completed actor output has no stable snapshot identity" end
    return snapshot_id, observed_at, nil
end

local function invalid_config(message: string): any
    return {
        success = false,
        error = { code = "invalid_config", message = message, retriable = false, scope = "flow" },
    }
end

local function invalid_item(message: string): any
    return { success = false, error = { code = "invalid_request", message = message,
        retriable = false, scope = "item" } }
end

local function connection_failure(err: any): any
    local code, retriable = "auth_expired", false
    if err and errors.is(err, errors.PERMISSION_DENIED) then
        code = "permission_denied"
    elseif err and (errors.is(err, errors.UNAVAILABLE) or errors.is(err, errors.TIMEOUT)) then
        code, retriable = "provider_unavailable", true
    end
    local detail: any = { code = code, message = tostring(err or "connection unavailable"),
        retriable = retriable, scope = "connection" }
    if code == "auth_expired" then detail.auth_expired = true end
    return { success = false, error = detail }
end

local function snapshot_receipt(actor_id: string, snapshot_id: string, captured_at: string, rows: number, complete: boolean, policy: any, control: any): any
    return {
        provider = "phantombuster",
        actor_id = actor_id,
        snapshot_id = snapshot_id,
        captured_at = captured_at,
        complete = complete,
        rows_read = rows,
        policy_receipt = operation_policy.receipt(policy),
        control_receipt = operation_policy.control_receipt(control),
        control_digest = control.digest,
    }
end

function M.candidate_from(row: any, actor_id: string, query: string, pull_id: string): any
    row = type(row) == "table" and row or {}
    local first = trim(value(row, "first_name", "firstName", "firstname"))
    local last = trim(value(row, "last_name", "lastName", "lastname"))
    local id = trim(value(row, "id", "profile_id", "linkedinId", "url", "linkedin_url", "linkedinUrl", "email", "email_address", "emailAddress"))
    return {
        email = trim(value(row, "email", "email_address", "emailAddress")),
        name = trim(value(row, "name", "full_name", "fullName")),
        first_name = first,
        last_name = last,
        company_name = trim(value(row, "company_name", "company", "companyName")),
        title = trim(value(row, "title", "job_title", "jobTitle")),
        jurisdiction = trim(value(row, "jurisdiction", "country")),
        consent_basis = trim(value(row, "consent_basis", "consentBasis")),
        suppression = value(row, "suppression", "suppressed") == true,
        no_auto_send = true,
        source_pull_id = pull_id,
        provenance = {
            external_source = "phantombuster",
            external_id = id,
            actor_id = actor_id,
            query = query,
            source_url = trim(value(row, "url", "linkedin_url", "linkedinUrl")),
        },
    }
end

-- Activity normalization deliberately preserves the actor's post facts.  It is
-- not an engagement scorer: composition modules own all relevance policy.
function M.activity_from(row: any, actor_id: string, query: string, pull_id: string): any
    row = type(row) == "table" and row or {}
    local post_id =
        trim(value(row, "post_id", "postId", "id", "activity_id", "activityId", "url", "post_url", "postUrl"))
    return {
        post_id = post_id,
        author = {
            name = trim(value(row, "author_name", "authorName", "author", "name")),
            profile_url = trim(value(row, "author_url", "authorUrl", "profile_url", "profileUrl")),
        },
        text = trim(value(row, "text", "post_text", "postText", "content", "commentary")),
        url = trim(value(row, "url", "post_url", "postUrl")),
        published_at = trim(value(row, "published_at", "publishedAt", "date", "created_at", "createdAt")),
        source_pull_id = pull_id,
        provenance = { external_source = "phantombuster", external_id = post_id, actor_id = actor_id, query = query },
    }
end

local function page_window(req: any, count: number, configured_limit: number): (number?, number?, any?)
    local cursor = type(req.cursor) == "table" and req.cursor or {}
    local offset = cursor.offset == nil and 0 or cursor.offset
    if type(offset) ~= "number" or offset ~= math.floor(offset) or offset < 0 or (offset > 0 and offset >= count) then
        return nil, nil, invalid_config("cursor.offset is outside the completed snapshot")
    end
    local requested = req.limit
    if requested ~= nil and (type(requested) ~= "number" or requested ~= math.floor(requested) or requested < 1) then
        return nil, nil, invalid_config("limit must be a positive integer")
    end
    local limit = requested ~= nil and math.min(configured_limit, requested) or configured_limit
    return offset, limit, nil
end

local function source_page(items: { any }, offset: number, limit: number, snapshot_id: string,
        actor_id: string, captured_at: string, policy: any, control: any, kind: string): any
    local page: { any } = {}
    for index = offset + 1, math.min(#items, offset + limit) do page[#page + 1] = items[index] end
    local has_more = offset + limit < #items
    local receipt = snapshot_receipt(actor_id, snapshot_id, captured_at, #page, not has_more, policy, control)
    local next_cursor = has_more and { snapshot_id = snapshot_id, offset = offset + limit, receipt = receipt }
        or { offset = 0, receipt = receipt }
    return {
        success = true, items = page, next_cursor = next_cursor, has_more = has_more,
        coverage = { mode = "complete", pass_key = snapshot_id,
            scope_key = "phantombuster:" .. kind .. ":" .. actor_id, final = not has_more },
    }
end

function M.pull(req: any, _opts: any?, deps: any?): (any?, error?)
    req, deps = type(req) == "table" and req or {}, type(deps) == "table" and deps or {}
    local config = type((req :: any).config) == "table" and (req :: any).config or {}
    local actor_id, query = trim(config.actor_id), trim(config.query)
    if actor_id == "" then return invalid_config("config.actor_id is required") end
    if query == "" then return invalid_config("config.query is required") end
    local limit, limit_err = required_limit(config)
    if not limit then return invalid_config(tostring(limit_err)) end
    local policy, policy_err, control = resolved_policy(req, deps, config, "candidate_snapshot", limit)
    if not policy then return invalid_config(tostring(policy_err)) end
    local tp = deps.transport or transport
    local connection_id = trim(config.connection_id)
    if connection_id == "" then return invalid_config("config.connection_id is required") end
    local conn, cerr = tp.connect(connection_id)
    if not conn then return connection_failure(cerr) end
    local result, output_err = tp.get_agent_output(conn, actor_id, { timeout = policy.limits.timeout_seconds })
    if output_err then return nil, output_err end
    local pull_id, captured_at, snapshot_err = snapshot_ready(req, result, policy, deps)
    if not pull_id then
        return capacity_http.carry({
            success = false,
            error = {
                code = "provider_error",
                message = tostring(snapshot_err or (type(result) == "table" and result.error or "actor output unavailable")),
                retriable = true,
                scope = "provider",
            },
        }, result)
    end
    local items = {}
    for _, row in ipairs(rows_from((result :: any).data)) do
        local candidate = M.candidate_from(row, actor_id, query, pull_id)
        local external_id = trim(candidate.provenance.external_id)
        if external_id == "" then return invalid_item("candidate row has no stable id, profile URL, or email") end
        items[#items + 1] = {
            item_key = "phantombuster:" .. actor_id .. ":" .. external_id,
            dedup_key = pull_id .. ":" .. external_id,
            op = "upsert",
            source_version = captured_at,
            payload = candidate,
        }
    end
    local offset, page_limit, page_err = page_window(req, #items, limit)
    if page_err then return page_err end
    return source_page(items, offset :: number, page_limit :: number, pull_id, actor_id,
        captured_at :: string, policy, control, "candidate")
end

function M.pull_activities(req: any, _opts: any?, deps: any?): (any?, error?)
    req, deps = type(req) == "table" and req or {}, type(deps) == "table" and deps or {}
    local config = type((req :: any).config) == "table" and (req :: any).config or {}
    local actor_id, query = trim(config.actor_id), trim(config.query)
    if actor_id == "" then return invalid_config("config.actor_id is required") end
    if query == "" then return invalid_config("config.query is required") end
    local limit, limit_err = required_limit(config)
    if not limit then return invalid_config(tostring(limit_err)) end
    local policy, policy_err, control = resolved_policy(req, deps, config, "activity_snapshot", limit)
    if not policy then return invalid_config(tostring(policy_err)) end
    local tp = deps.transport or transport
    local connection_id = trim(config.connection_id)
    if connection_id == "" then return invalid_config("config.connection_id is required") end
    local conn, cerr = tp.connect(connection_id)
    if not conn then return connection_failure(cerr) end
    local result, output_err = tp.get_agent_output(conn, actor_id, { timeout = policy.limits.timeout_seconds })
    if output_err then return nil, output_err end
    local pull_id, captured_at, snapshot_err = snapshot_ready(req, result, policy, deps)
    if not pull_id then
        return capacity_http.carry({
            success = false,
            error = {
                code = "provider_error",
                message = tostring(snapshot_err or (type(result) == "table" and result.error or "actor output unavailable")),
                retriable = true,
                scope = "provider",
            },
        }, result)
    end
    local items = {}
    for _, row in ipairs(rows_from((result :: any).data)) do
        local activity = M.activity_from(row, actor_id, query, pull_id)
        if trim(activity.post_id) == "" then return invalid_item("activity row has no stable post id or URL") end
        items[#items + 1] = {
            item_key = "phantombuster:activity:" .. actor_id .. ":" .. activity.post_id,
            dedup_key = pull_id .. ":" .. activity.post_id,
            op = "upsert",
            source_version = captured_at,
            payload = activity,
        }
    end
    local offset, page_limit, page_err = page_window(req, #items, limit)
    if page_err then return page_err end
    return source_page(items, offset :: number, page_limit :: number, pull_id, actor_id,
        captured_at :: string, policy, control, "activity")
end

local function keys_page(page: any): any
    if page.success ~= true then return page end
    local keys: { any } = {}
    for _, item in ipairs(page.items) do
        keys[#keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key }
    end
    return { success = true, keys = keys, next_cursor = page.next_cursor,
        has_more = page.has_more, coverage = page.coverage }
end

function M.pull_candidate_keys(req: any, opts: any?, deps: any?): (any?, error?)
    local page, pull_err = M.pull(req, opts, deps)
    if pull_err then return nil, pull_err end
    return keys_page(page)
end

function M.pull_activity_keys(req: any, opts: any?, deps: any?): (any?, error?)
    local page, pull_err = M.pull_activities(req, opts, deps)
    if pull_err then return nil, pull_err end
    return keys_page(page)
end

return M
