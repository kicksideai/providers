-- Closed validation for a resolved PhantomBuster source operation.
--
-- Operational bounds are never compiled into this module.  The caller must
-- inject a complete SourceOperationControlBounds/v1 document and a complete
-- SourceOperationPolicy/v1 document.  The bounds document is provider/deploy
-- control; the policy document is the owner-selected effective operation.
-- Both digests are carried into the read receipt.

local json = require("json")
local hash = require("hash")

local M = {}

type Map = { [string]: any }
type List = { any }

M.VERSION = "SourceOperationPolicy/v1"
M.BOUNDS_VERSION = "SourceOperationControlBounds/v1"
M.PROVIDER = "phantombuster"

local ROOT_KEYS = {
    version = true, policy_id = true, revision = true, digest = true,
    control_digest = true, source_binding_id = true, operation_id = true,
    limits = true, lifecycle = true, storage = true, ownership = true,
    snapshot_id = true,
}
local BOUNDS_KEYS = {
    version = true, provider = true, policy_ref = true, revision = true,
    digest = true, operation_id = true, limits = true, lifecycle = true,
    storage = true, tool = true,
}
local LIMIT_KEYS = { max_results = true, timeout_seconds = true }
local LIFECYCLE_KEYS = { stale_after_seconds = true }
local STORAGE_KEYS = { limit_chars = true, retention = true }
local POLICY_STORAGE_KEYS = { mode = true, limit_chars = true, retention = true }
local TOOL_KEYS = { list_limit = true, output_chars = true }
local RETENTION_KEYS = { class = true, max_age_seconds = true }
local OWNERSHIP_KEYS = { owner_component_id = true, owner_user_ref = true, connection_id = true }
local RANGE_KEYS = { minimum = true, maximum = true }

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function closed(value: Map, allowed: { [string]: boolean }, path: string): string?
    for key in pairs(value) do
        if type(key) ~= "string" or not allowed[key] then
            return path .. " contains unsupported field " .. tostring(key)
        end
    end
    return nil
end

local function identifier(value: any, path: string): (string?, string?)
    local text = trim(value)
    if text == "" or #text > 240 or text:find("[%c%s]", 1)
        or not text:match("^[a-z0-9][a-z0-9_.:%-]*$")
    then
        return nil, path .. " must be a bounded lower-case identifier"
    end
    return text, nil
end

local function positive_integer(value: any, path: string): (number?, string?)
    if type(value) ~= "number" or value ~= math.floor(value) or value < 1
        or value == math.huge or value == -math.huge
    then
        return nil, path .. " must be a positive integer"
    end
    return (value :: number), nil
end

local function bounded_integer(value: any, path: string, bounds: Map): (number?, string?)
    local number, number_err = positive_integer(value, path)
    if not number then return nil, number_err end
    local minimum = bounds.minimum :: number
    local maximum = bounds.maximum :: number
    if number < minimum or number > maximum then
        return nil, path .. " must be an integer between " .. tostring(minimum) .. " and " .. tostring(maximum)
    end
    return number, nil
end

-- Stable JSON is local to this contract so digests cover the exact fields,
-- independent of Lua map iteration order.
local function canonical(value: any): string?
    if value == nil then return "null" end
    if type(value) == "string" or type(value) == "number" or type(value) == "boolean" then
        local encoded, err = json.encode(value)
        if err or type(encoded) ~= "string" then return nil end
        return encoded
    end
    if type(value) ~= "table" then return nil end
    local item = value :: Map
    local numeric, count, highest = true, 0, 0
    for key in pairs(item) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 then numeric = false end
        if type(key) == "number" then
            count = count + 1
            if key > highest then highest = key end
        end
    end
    if numeric and count == highest and count > 0 then
        local parts: { string } = {}
        for index = 1, highest do
            local encoded = canonical((value :: List)[index])
            if not encoded then return nil end
            parts[#parts + 1] = encoded :: string
        end
        return "[" .. table.concat(parts, ",") .. "]"
    end
    local keys: { string } = {}
    for key in pairs(item) do
        if type(key) ~= "string" then return nil end
        keys[#keys + 1] = key
    end
    table.sort(keys)
    local parts: { string } = {}
    for _, key in ipairs(keys) do
        local encoded_key = canonical(key)
        local encoded_value = canonical(item[key])
        if not encoded_key or not encoded_value then return nil end
        parts[#parts + 1] = (encoded_key :: string) .. ":" .. (encoded_value :: string)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

local function without(value: Map, excluded: string): Map
    local result: Map = {}
    for key, item in pairs(value) do
        if key ~= excluded then result[key] = item end
    end
    return result
end

local function digest(value: Map): (string?, string?)
    local encoded = canonical(value)
    if not encoded then return nil, "operation_policy digest could not canonicalize policy" end
    local result, err = hash.sha256(encoded :: string)
    if err or type(result) ~= "string" or result == "" then
        return nil, "operation_policy digest could not be computed: " .. tostring(err)
    end
    return result:lower(), nil
end

local function digest_without(value: Map, field: string): (string?, string?)
    return digest(without(value, field))
end

local function range(value: any, path: string): (Map?, string?)
    if type(value) ~= "table" then
        return nil, path .. " must explicitly provide minimum and maximum"
    end
    local raw = value :: Map
    local unknown = closed(raw, RANGE_KEYS, path)
    if unknown then return nil, unknown end
    local minimum, minimum_err = positive_integer(raw.minimum, path .. ".minimum")
    if not minimum then return nil, minimum_err end
    local maximum, maximum_err = positive_integer(raw.maximum, path .. ".maximum")
    if not maximum then return nil, maximum_err end
    if (maximum :: number) < (minimum :: number) then
        return nil, path .. ".maximum must be greater than or equal to .minimum"
    end
    return { minimum = minimum, maximum = maximum }, nil
end

local function bounds_limits(value: any): (Map?, string?)
    if type(value) ~= "table" then return nil, "control_bounds.limits is required" end
    local raw = value :: Map
    local unknown = closed(raw, LIMIT_KEYS, "control_bounds.limits")
    if unknown then return nil, unknown end
    local max_results, max_results_err = range(raw.max_results, "control_bounds.limits.max_results")
    if not max_results then return nil, max_results_err end
    local timeout, timeout_err = range(raw.timeout_seconds, "control_bounds.limits.timeout_seconds")
    if not timeout then return nil, timeout_err end
    return { max_results = max_results, timeout_seconds = timeout }, nil
end

local function bounds_lifecycle(value: any): (Map?, string?)
    if type(value) ~= "table" then return nil, "control_bounds.lifecycle is required" end
    local raw = value :: Map
    local unknown = closed(raw, LIFECYCLE_KEYS, "control_bounds.lifecycle")
    if unknown then return nil, unknown end
    local stale_after, stale_err = range(raw.stale_after_seconds, "control_bounds.lifecycle.stale_after_seconds")
    if not stale_after then return nil, stale_err end
    return { stale_after_seconds = stale_after }, nil
end

local function bounds_storage(value: any): (Map?, string?)
    if type(value) ~= "table" then return nil, "control_bounds.storage is required" end
    local raw = value :: Map
    local unknown = closed(raw, STORAGE_KEYS, "control_bounds.storage")
    if unknown then return nil, unknown end
    local limit_chars, limit_err = range(raw.limit_chars, "control_bounds.storage.limit_chars")
    if not limit_chars then return nil, limit_err end
    if type(raw.retention) ~= "table" then return nil, "control_bounds.storage.retention is required" end
    local retention_raw = raw.retention :: Map
    local retention_unknown = closed(retention_raw, RETENTION_KEYS, "control_bounds.storage.retention")
    if retention_unknown then return nil, retention_unknown end
    local max_age, age_err = range(retention_raw.max_age_seconds, "control_bounds.storage.retention.max_age_seconds")
    if not max_age then return nil, age_err end
    local retention: Map = { max_age_seconds = max_age }
    if retention_raw.class ~= nil then
        local retention_class, class_err = identifier(retention_raw.class, "control_bounds.storage.retention.class")
        if not retention_class then return nil, class_err end
        retention.class = retention_class
    end
    return { limit_chars = limit_chars, retention = retention }, nil
end

local function bounds_tool(value: any): (Map?, string?)
    if type(value) ~= "table" then return nil, "control_bounds.tool is required" end
    local raw = value :: Map
    local unknown = closed(raw, TOOL_KEYS, "control_bounds.tool")
    if unknown then return nil, unknown end
    local list_limit, list_err = range(raw.list_limit, "control_bounds.tool.list_limit")
    if not list_limit then return nil, list_err end
    local output_chars, output_err = range(raw.output_chars, "control_bounds.tool.output_chars")
    if not output_chars then return nil, output_err end
    return { list_limit = list_limit, output_chars = output_chars }, nil
end

-- Validate the trusted provider/deployment control document.  It has ranges,
-- not compiled maxima; changing deployment capacity is a settings change and
-- changes the control digest carried by every receipt.
function M.validate_bounds(value: any): (Map?, string?)
    if type(value) ~= "table" then return nil, "control_bounds is required" end
    local raw = value :: Map
    local unknown = closed(raw, BOUNDS_KEYS, "control_bounds")
    if unknown then return nil, unknown end
    if trim(raw.version) ~= M.BOUNDS_VERSION then
        return nil, "control_bounds.version must be " .. M.BOUNDS_VERSION
    end
    if trim(raw.provider):lower() ~= M.PROVIDER then
        return nil, "control_bounds.provider must be " .. M.PROVIDER
    end
    local policy_ref, ref_err = identifier(raw.policy_ref, "control_bounds.policy_ref")
    if not policy_ref then return nil, ref_err end
    local revision, revision_err = identifier(raw.revision, "control_bounds.revision")
    if not revision then return nil, revision_err end
    local operation_id
    if raw.operation_id ~= nil then
        local operation_err
        operation_id, operation_err = identifier(raw.operation_id, "control_bounds.operation_id")
        if not operation_id then return nil, operation_err end
    end
    local parsed_limits, limits_err = bounds_limits(raw.limits)
    if not parsed_limits then return nil, limits_err end
    local parsed_lifecycle, lifecycle_err = bounds_lifecycle(raw.lifecycle)
    if not parsed_lifecycle then return nil, lifecycle_err end
    local parsed_storage, storage_err = bounds_storage(raw.storage)
    if not parsed_storage then return nil, storage_err end
    local parsed_tool, tool_err = bounds_tool(raw.tool)
    if not parsed_tool then return nil, tool_err end
    local normalized: Map = {
        version = M.BOUNDS_VERSION,
        provider = M.PROVIDER,
        policy_ref = policy_ref,
        revision = revision,
        limits = parsed_limits,
        lifecycle = parsed_lifecycle,
        storage = parsed_storage,
        tool = parsed_tool,
    }
    if operation_id then normalized.operation_id = operation_id end
    local expected, digest_err = digest_without(normalized, "digest")
    if not expected then return nil, digest_err end
    local provided = trim(raw.digest):lower()
    if #provided ~= 64 or not provided:match("^[a-f0-9]+$") then
        return nil, "control_bounds.digest is required and must be a SHA-256 hex digest"
    end
    if provided ~= expected then return nil, "control_bounds.digest does not match its canonical bounds" end
    normalized.digest = provided
    return normalized, nil
end

function M.bounds_digest(value: Map): string?
    local normalized, err = M.validate_bounds(value)
    if not normalized then return nil end
    return tostring(normalized.digest)
end

function M.with_bounds_digest(value: Map): (Map?, string?)
    local copy: Map = {}
    for key, item in pairs(value) do copy[key] = item end
    copy.digest = nil
    local computed, err = digest_without(copy, "digest")
    if not computed then return nil, err end
    copy.digest = computed
    return copy, nil
end

local function limits(value: any, control: Map): (Map?, string?)
    if type(value) ~= "table" then return nil, "operation_policy.limits is required" end
    local raw = value :: Map
    local unknown = closed(raw, LIMIT_KEYS, "operation_policy.limits")
    if unknown then return nil, unknown end
    local max_results, max_err = bounded_integer(raw.max_results, "operation_policy.limits.max_results", (control.max_results :: Map))
    if not max_results then return nil, max_err end
    local timeout, timeout_err = bounded_integer(raw.timeout_seconds, "operation_policy.limits.timeout_seconds", (control.timeout_seconds :: Map))
    if not timeout then return nil, timeout_err end
    return { max_results = max_results, timeout_seconds = timeout }, nil
end

local function lifecycle(value: any, control: Map): (Map?, string?)
    if type(value) ~= "table" then return nil, "operation_policy.lifecycle is required" end
    local raw = value :: Map
    local unknown = closed(raw, { stale_after_seconds = true, stale_action = true, not_found_action = true }, "operation_policy.lifecycle")
    if unknown then return nil, unknown end
    local stale_after, stale_err = bounded_integer(raw.stale_after_seconds, "operation_policy.lifecycle.stale_after_seconds", (control.stale_after_seconds :: Map))
    if not stale_after then return nil, stale_err end
    local stale_action = trim(raw.stale_action):lower()
    if stale_action ~= "unresolved" and stale_action ~= "retire" then return nil, "operation_policy.lifecycle.stale_action must be unresolved or retire" end
    local not_found_action = trim(raw.not_found_action):lower()
    if not_found_action ~= "unresolved" and not_found_action ~= "retire" then return nil, "operation_policy.lifecycle.not_found_action must be unresolved or retire" end
    return { stale_after_seconds = stale_after, stale_action = stale_action, not_found_action = not_found_action }, nil
end

local function storage(value: any, control: Map): (Map?, string?)
    if type(value) ~= "table" then return nil, "operation_policy.storage is required" end
    local raw = value :: Map
    local unknown = closed(raw, POLICY_STORAGE_KEYS, "operation_policy.storage")
    if unknown then return nil, unknown end
    local mode, mode_err = identifier(raw.mode, "operation_policy.storage.mode")
    if not mode then return nil, mode_err end
    local limit_chars, limit_err = bounded_integer(raw.limit_chars, "operation_policy.storage.limit_chars", (control.limit_chars :: Map))
    if not limit_chars then return nil, limit_err end
    if type(raw.retention) ~= "table" then return nil, "operation_policy.storage.retention is required" end
    local retention_raw = raw.retention :: Map
    local retention_unknown = closed(retention_raw, RETENTION_KEYS, "operation_policy.storage.retention")
    if retention_unknown then return nil, retention_unknown end
    local retention_class, class_err = identifier(retention_raw.class, "operation_policy.storage.retention.class")
    if not retention_class then return nil, class_err end
    local max_age, age_err = bounded_integer(retention_raw.max_age_seconds, "operation_policy.storage.retention.max_age_seconds", ((control.retention :: Map).max_age_seconds :: Map))
    if not max_age then return nil, age_err end
    return { mode = mode, limit_chars = limit_chars, retention = { class = retention_class, max_age_seconds = max_age } }, nil
end

local function ownership(value: any, connection_id: string): (Map?, string?)
    if type(value) ~= "table" then return nil, "operation_policy.ownership is required" end
    local raw = value :: Map
    local unknown = closed(raw, OWNERSHIP_KEYS, "operation_policy.ownership")
    if unknown then return nil, unknown end
    local owner_component, owner_err = identifier(raw.owner_component_id, "operation_policy.ownership.owner_component_id")
    if not owner_component then return nil, owner_err end
    local bound_connection, connection_err = identifier(raw.connection_id, "operation_policy.ownership.connection_id")
    if not bound_connection then return nil, connection_err end
    if bound_connection ~= connection_id then return nil, "operation_policy.ownership.connection_id must match config.connection_id" end
    local result: Map = { owner_component_id = owner_component, connection_id = bound_connection }
    if raw.owner_user_ref ~= nil then
        local owner_user, user_err = identifier(raw.owner_user_ref, "operation_policy.ownership.owner_user_ref")
        if not owner_user then return nil, user_err end
        result.owner_user_ref = owner_user
    end
    return result, nil
end

function M.validate(value: any, requirements: Map?): (Map?, string?)
    if type(value) ~= "table" then return nil, "operation_policy is required" end
    local raw = value :: Map
    local unknown = closed(raw, ROOT_KEYS, "operation_policy")
    if unknown then return nil, unknown end
    if trim(raw.version) ~= M.VERSION then return nil, "operation_policy.version must be " .. M.VERSION end
    local policy_id, policy_err = identifier(raw.policy_id, "operation_policy.policy_id")
    if not policy_id then return nil, policy_err end
    local revision, revision_err = identifier(raw.revision, "operation_policy.revision")
    if not revision then return nil, revision_err end
    local source_binding, binding_err = identifier(raw.source_binding_id, "operation_policy.source_binding_id")
    if not source_binding then return nil, binding_err end
    local operation_id, operation_err = identifier(raw.operation_id, "operation_policy.operation_id")
    if not operation_id then return nil, operation_err end
    local required = requirements or {}
    if required.operation_id and operation_id ~= required.operation_id then return nil, "operation_policy.operation_id must be " .. tostring(required.operation_id) end
    local control, control_err = M.validate_bounds(required.control_bounds)
    if not control then return nil, control_err end
    if control.operation_id ~= nil and control.operation_id ~= operation_id then return nil, "control_bounds.operation_id does not match operation_policy.operation_id" end
    local parsed_limits, limits_err = limits(raw.limits, (control.limits :: Map))
    if not parsed_limits then return nil, limits_err end
    if required.max_results and parsed_limits.max_results ~= required.max_results then return nil, "operation_policy.limits.max_results must match config.max_rows_per_pull" end
    local parsed_lifecycle, lifecycle_err = lifecycle(raw.lifecycle, (control.lifecycle :: Map))
    if not parsed_lifecycle then return nil, lifecycle_err end
    local parsed_storage, storage_err = storage(raw.storage, (control.storage :: Map))
    if not parsed_storage then return nil, storage_err end
    local parsed_ownership, ownership_err = ownership(raw.ownership, required.connection_id or "")
    if not parsed_ownership then return nil, ownership_err end
    local control_digest = trim(raw.control_digest):lower()
    if control_digest == "" or control_digest ~= control.digest then return nil, "operation_policy.control_digest must match control_bounds.digest" end
    local provided_digest = trim(raw.digest):lower()
    if #provided_digest ~= 64 or not provided_digest:match("^[a-f0-9]+$") then return nil, "operation_policy.digest is required and must be a SHA-256 hex digest" end
    local normalized: Map = {
        version = M.VERSION, policy_id = policy_id, revision = revision, digest = provided_digest,
        control_digest = control.digest, source_binding_id = source_binding, operation_id = operation_id,
        limits = parsed_limits, lifecycle = parsed_lifecycle, storage = parsed_storage,
        ownership = parsed_ownership,
    }
    local snapshot_id = trim(raw.snapshot_id)
    if snapshot_id ~= "" then normalized.snapshot_id = snapshot_id end
    local expected_digest, digest_err = digest_without(normalized, "digest")
    if not expected_digest then return nil, digest_err end
    if provided_digest ~= expected_digest then return nil, "operation_policy.digest does not match the effective policy" end
    return normalized, nil
end

function M.receipt(value: Map): Map
    local result: Map = {
        version = value.version, policy_id = value.policy_id, revision = value.revision,
        digest = value.digest, effective_policy_digest = value.digest,
        control_digest = value.control_digest, source_binding_id = value.source_binding_id,
        operation_id = value.operation_id, limits = value.limits, lifecycle = value.lifecycle,
        storage = value.storage, ownership = value.ownership,
    }
    if value.snapshot_id ~= nil then result.snapshot_id = value.snapshot_id end
    return result
end

function M.control_receipt(value: Map): Map
    return {
        version = value.version, provider = value.provider, policy_ref = value.policy_ref,
        revision = value.revision, digest = value.digest, control_digest = value.digest,
        operation_id = value.operation_id, limits = value.limits, lifecycle = value.lifecycle,
        storage = value.storage, tool = value.tool,
    }
end

function M.receipt_matches(value: any, expected: Map): boolean
    if type(value) ~= "table" then return false end
    local actual = canonical(value :: Map)
    local target = canonical(M.receipt(expected))
    return actual ~= nil and target ~= nil and actual == target
end

function M.control_receipt_matches(value: any, expected: Map): boolean
    if type(value) ~= "table" then return false end
    local actual = canonical(value :: Map)
    local target = canonical(M.control_receipt(expected))
    return actual ~= nil and target ~= nil and actual == target
end

-- Owner/deployment tooling helpers only; these functions never supply fields.
function M.with_digest(value: Map): (Map?, string?)
    local copy: Map = {}
    for key, item in pairs(value) do copy[key] = item end
    copy.digest = nil
    local result, err = digest_without(copy, "digest")
    if not result then return nil, err end
    copy.digest = result
    return copy, nil
end

M._test = {
    canonical = canonical, digest = digest, range = range,
    bounds = M.validate_bounds, limits = limits, lifecycle = lifecycle,
    storage = storage, ownership = ownership,
}

return M
