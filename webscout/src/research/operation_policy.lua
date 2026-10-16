-- Canonical SourceOperationPolicy/v1 validation for WebScout.
--
-- The provider never supplies an operational ceiling.  The host installs a
-- SourceOperationControlBounds/v1 document and the owner supplies the
-- effective SourceOperationPolicy/v1 values.  Both documents are normalized
-- and digested into every successful source receipt.  This module owns no
-- settings, cursor, retry, or scheduling state.

local json = require("json")
local hash = require("hash")

local M = {}
type Map = { [string]: any }

M.VERSION = "SourceOperationPolicy/v1"
M.BOUNDS_VERSION = "SourceOperationControlBounds/v1"

local ROOT_KEYS = {
    version = true, policy_id = true, revision = true, source_binding_id = true,
    operation_id = true, limits = true, catalog = true, lifecycle = true,
    storage = true, controls = true, search = true, effect = true, access_profile = true,
}
local BOUNDS_KEYS = {
    version = true, policy_ref = true, policy_id = true, revision = true,
    digest = true, operation_id = true, limits = true, catalog = true,
    lifecycle = true, storage = true, controls = true, search = true,
}
local LIMIT_KEYS = { max_results = true, timeout_seconds = true }
local CATALOG_KEYS = { page_size = true, max_provider_calls = true, max_provider_pages = true }
local LIFECYCLE_KEYS = { stale_after_seconds = true }
local STORAGE_KEYS = { mode = true, limit_chars = true, retention = true }
local RETENTION_KEYS = { class = true, max_age_seconds = true }
local RANGE_KEYS = { minimum = true, maximum = true }
local SEARCH_KEYS = { freshness = true, safe_search = true }
local ACCESS_KEYS = { id = true, decision = true, expires_at = true }

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
    if text == "" or #text > 240 or not text:match("^[a-z][a-z0-9_.:%-]*$") then
        return nil, path .. " must be a bounded lower-case identifier"
    end
    return text, nil
end

local function positive_integer(value: any, path: string): (number?, string?)
    local number = tonumber(value)
    if not number or number == math.huge or number == -math.huge
        or number % 1 ~= 0 or number < 1
    then
        return nil, path .. " must be a positive integer"
    end
    return number, nil
end

local function range(value: any, path: string): (Map?, string?)
    if type(value) ~= "table" then
        local maximum, maximum_err = positive_integer(value, path)
        if not maximum then return nil, maximum_err end
        return { minimum = 1, maximum = maximum }, nil
    end
    local raw = value :: Map
    local unknown = closed(raw, RANGE_KEYS, path)
    if unknown then return nil, unknown end
    local minimum, minimum_err = positive_integer(raw.minimum or 1, path .. ".minimum")
    if not minimum then return nil, minimum_err end
    local maximum, maximum_err = positive_integer(raw.maximum, path .. ".maximum")
    if not maximum then return nil, maximum_err end
    if (maximum :: number) < (minimum :: number) then
        return nil, path .. ".maximum must be greater than or equal to .minimum"
    end
    return { minimum = minimum, maximum = maximum }, nil
end

local function bounds_group(value: any, keys: { [string]: boolean }, path: string): (Map?, string?)
    if type(value) ~= "table" then return nil, path .. " is required" end
    local raw = value :: Map
    local unknown = closed(raw, keys, path)
    if unknown then return nil, unknown end
    local result: Map = {}
    for key in pairs(keys) do
        local parsed, parsed_err = range(raw[key], path .. "." .. key)
        if not parsed then return nil, parsed_err end
        result[key] = parsed
    end
    return result, nil
end

local function bounds_storage(value: any): (Map?, string?)
    if type(value) ~= "table" then return nil, "control_bounds.storage is required" end
    local raw = value :: Map
    local unknown = closed(raw, STORAGE_KEYS, "control_bounds.storage")
    if unknown then return nil, unknown end
    local chars, chars_err = range(raw.limit_chars, "control_bounds.storage.limit_chars")
    if not chars then return nil, chars_err end
    if type(raw.retention) ~= "table" then return nil, "control_bounds.storage.retention is required" end
    local retention_raw = raw.retention :: Map
    local retention_unknown = closed(retention_raw, RETENTION_KEYS, "control_bounds.storage.retention")
    if retention_unknown then return nil, retention_unknown end
    local age, age_err = range(retention_raw.max_age_seconds, "control_bounds.storage.retention.max_age_seconds")
    if not age then return nil, age_err end
    local result: Map = { limit_chars = chars, retention = { max_age_seconds = age } }
    if retention_raw.class ~= nil then
        local class, class_err = identifier(retention_raw.class, "control_bounds.storage.retention.class")
        if not class then return nil, class_err end
        result.retention.class = class
    end
    return result, nil
end

local function parse_access(value: any, required: boolean): (Map?, string?)
    if value == nil then
        if required then return nil, "operation_policy.access_profile is required" end
        return nil, nil
    end
    if type(value) ~= "table" then return nil, "operation_policy.access_profile must be an object" end
    local raw = value :: Map
    local unknown = closed(raw, ACCESS_KEYS, "operation_policy.access_profile")
    if unknown then return nil, unknown end
    local id, id_err = identifier(raw.id, "operation_policy.access_profile.id")
    if not id then return nil, id_err end
    local decision = trim(raw.decision)
    if decision ~= "allowed" and decision ~= "denied" and decision ~= "pending" then
        return nil, "operation_policy.access_profile.decision is invalid"
    end
    local result: Map = { id = id, decision = decision }
    if raw.expires_at ~= nil then
        local expiry = trim(raw.expires_at)
        if expiry == "" then return nil, "operation_policy.access_profile.expires_at is invalid" end
        result.expires_at = expiry
    end
    return result, nil
end

local function bounds_controls(value: any): (Map?, string?)
    if value == nil then return {}, nil end
    if type(value) ~= "table" then return nil, "control_bounds.controls must be an object" end
    local result: Map = {}
    for key, item in pairs(value :: Map) do
        local control, control_err = identifier(key, "control_bounds.controls key")
        if not control then return nil, control_err end
        local parsed, parsed_err = range(item, "control_bounds.controls." .. (control :: string))
        if not parsed then return nil, parsed_err end
        result[control :: string] = parsed
    end
    return result, nil
end

local function string_set(value: any, path: string): ({ string }?, string?)
    if type(value) ~= "table" then return nil, path .. " must explicitly provide allowed values" end
    local result: { string } = {}
    local seen: { [string]: boolean } = {}
    for index, item in ipairs(value :: { any }) do
        local text = trim(item)
        if text == "" or seen[text] then return nil, path .. " contains an invalid or duplicate value" end
        seen[text] = true
        result[index] = text
    end
    if #result == 0 then return nil, path .. " must contain at least one value" end
    return result, nil
end

local function bounds_search(value: any): (Map?, string?)
    if value == nil then return nil, nil end
    if type(value) ~= "table" then return nil, "control_bounds.search must be an object" end
    local unknown = closed(value :: Map, SEARCH_KEYS, "control_bounds.search")
    if unknown then return nil, unknown end
    local freshness, freshness_err = string_set((value :: Map).freshness, "control_bounds.search.freshness")
    if not freshness then return nil, freshness_err end
    local safe_search, safe_err = string_set((value :: Map).safe_search, "control_bounds.search.safe_search")
    if not safe_search then return nil, safe_err end
    return { freshness = freshness, safe_search = safe_search }, nil
end

local function canonical(value: any): string?
    if value == nil then return "null" end
    if type(value) == "string" or type(value) == "number" or type(value) == "boolean" then
        local encoded = json.encode(value)
        return encoded and (encoded :: string) or nil
    end
    if type(value) ~= "table" then return nil end
    local raw = value :: Map
    local numeric, count, highest = true, 0, 0
    for key in pairs(raw) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 then numeric = false end
        if type(key) == "number" then count = count + 1; if key > highest then highest = key end end
    end
    if numeric and count == highest then
        local parts: { string } = {}
        for index = 1, highest do
            local encoded = canonical((raw :: { any })[index])
            if not encoded then return nil end
            parts[#parts + 1] = encoded :: string
        end
        return "[" .. table.concat(parts, ",") .. "]"
    end
    local keys: { string } = {}
    for key in pairs(raw) do
        if type(key) ~= "string" then return nil end
        keys[#keys + 1] = key
    end
    table.sort(keys)
    local parts: { string } = {}
    for _, key in ipairs(keys) do
        local encoded_key, encoded_value = canonical(key), canonical(raw[key])
        if not encoded_key or not encoded_value then return nil end
        parts[#parts + 1] = (encoded_key :: string) .. ":" .. (encoded_value :: string)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

local function digest(value: Map): string?
    local encoded = canonical(value)
    if not encoded then return nil end
    local result, err = hash.sha256(encoded :: string)
    if err or type(result) ~= "string" or result == "" then return nil end
    -- Research's SourceOperationControlBounds/v1 receipt uses the canonical
    -- raw 64-hex digest (event envelopes may add their own sha256 prefix).
    return result
end

local function without(value: Map, excluded: string): Map
    local result: Map = {}
    for key, item in pairs(value) do if key ~= excluded then result[key] = item end end
    return result
end

function M.validate_bounds(value: any): (Map?, string?)
    if type(value) ~= "table" then return nil, "trusted control_bounds is required" end
    local raw = value :: Map
    local unknown = closed(raw, BOUNDS_KEYS, "control_bounds")
    if unknown then return nil, unknown end
    if trim(raw.version) ~= M.BOUNDS_VERSION then return nil, "control_bounds.version must be " .. M.BOUNDS_VERSION end
    local policy_ref, ref_err = identifier(raw.policy_ref ~= nil and raw.policy_ref or raw.policy_id, "control_bounds.policy_ref")
    if not policy_ref then return nil, ref_err end
    local revision, revision_err = identifier(raw.revision, "control_bounds.revision")
    if not revision then return nil, revision_err end
    local operation_id
    if raw.operation_id ~= nil then
        local operation_err
        operation_id, operation_err = identifier(raw.operation_id, "control_bounds.operation_id")
        if not operation_id then return nil, operation_err end
    end
    local limits, limits_err = bounds_group(raw.limits, LIMIT_KEYS, "control_bounds.limits")
    if not limits then return nil, limits_err end
    local catalog, catalog_err = bounds_group(raw.catalog, CATALOG_KEYS, "control_bounds.catalog")
    if not catalog then return nil, catalog_err end
    local lifecycle, lifecycle_err = bounds_group(raw.lifecycle, LIFECYCLE_KEYS, "control_bounds.lifecycle")
    if not lifecycle then return nil, lifecycle_err end
    local storage, storage_err = bounds_storage(raw.storage)
    if not storage then return nil, storage_err end
    -- `search` is the one OPTIONAL bounds group: bounds_search answers
    -- (nil, nil) when the document omits it, and the normalized table below
    -- adds it only when it is there. Refusing on a nil VALUE turned every
    -- bounds document without a search group into a refusal carrying no
    -- reason at all, which reached the caller as the Source's generic
    -- "control_bounds is invalid" -- a closed door with nothing written on it.
    local search, search_err = bounds_search(raw.search)
    if search_err then return nil, search_err end
    local controls, controls_err = bounds_controls(raw.controls)
    if not controls then return nil, controls_err end
    local normalized: Map = {
        version = M.BOUNDS_VERSION, policy_ref = policy_ref, revision = revision,
        limits = limits, catalog = catalog, lifecycle = lifecycle,
        storage = storage, controls = controls,
    }
    if operation_id then normalized.operation_id = operation_id end
    if search then normalized.search = search end
    local expected = digest(normalized)
    if not expected then return nil, "control_bounds digest could not be computed" end
    if trim(raw.digest) == "" then return nil, "control_bounds.digest is required" end
    if trim(raw.digest) ~= expected then
        return nil, "control_bounds.digest does not match its canonical policy"
    end
    normalized.digest = expected
    return normalized, nil
end

function M.with_bounds_digest(value: Map): (Map?, string?)
    local copy = without(value, "digest")
    local computed = digest(copy)
    if not computed then return nil, "control_bounds digest could not be computed" end
    copy.digest = computed
    return copy, nil
end

function M.with_digest(value: Map): (Map?, string?)
    local copy = without(value, "digest")
    local computed = digest(copy)
    if not computed then return nil, "operation_policy digest could not be computed" end
    copy.digest = computed
    return copy, nil
end

local function bounded(value: any, path: string, bounds: Map): (number?, string?)
    local number, number_err = positive_integer(value, path)
    if not number then return nil, number_err end
    if number < bounds.minimum or number > bounds.maximum then
        return nil, path .. " must be an integer between " .. tostring(bounds.minimum) .. " and " .. tostring(bounds.maximum)
    end
    return number, nil
end

local function parse_limits(value: any, required: boolean, bounds: Map): (Map?, string?)
    if value == nil then if required then return nil, "operation_policy.limits is required" else return nil, nil end end
    if type(value) ~= "table" then return nil, "operation_policy.limits must be an object" end
    local unknown = closed(value :: Map, LIMIT_KEYS, "operation_policy.limits")
    if unknown then return nil, unknown end
    local max_results, result_err = bounded((value :: Map).max_results, "operation_policy.limits.max_results", bounds.max_results :: Map)
    if not max_results then return nil, result_err end
    local timeout, timeout_err = bounded((value :: Map).timeout_seconds, "operation_policy.limits.timeout_seconds", bounds.timeout_seconds :: Map)
    if not timeout then return nil, timeout_err end
    return { max_results = max_results, timeout_seconds = timeout }, nil
end

local function parse_storage(value: any, required: boolean, bounds: Map): (Map?, string?)
    if value == nil then if required then return nil, "operation_policy.storage is required" else return nil, nil end end
    if type(value) ~= "table" then return nil, "operation_policy.storage must be an object" end
    local unknown = closed(value :: Map, STORAGE_KEYS, "operation_policy.storage")
    if unknown then return nil, unknown end
    local mode, mode_err = identifier((value :: Map).mode, "operation_policy.storage.mode")
    if not mode then return nil, mode_err end
    local chars, chars_err = bounded((value :: Map).limit_chars, "operation_policy.storage.limit_chars", bounds.limit_chars :: Map)
    if not chars then return nil, chars_err end
    local retention = (value :: Map).retention
    if type(retention) ~= "table" then return nil, "operation_policy.storage.retention is required" end
    local retention_unknown = closed(retention :: Map, RETENTION_KEYS, "operation_policy.storage.retention")
    if retention_unknown then return nil, retention_unknown end
    local class, class_err = identifier((retention :: Map).class, "operation_policy.storage.retention.class")
    if not class then return nil, class_err end
    local age, age_err = bounded((retention :: Map).max_age_seconds, "operation_policy.storage.retention.max_age_seconds", ((bounds.retention :: Map).max_age_seconds :: Map))
    if not age then return nil, age_err end
    return { mode = mode, limit_chars = chars, retention = { class = class, max_age_seconds = age } }, nil
end

local function parse_controls(value: any, required: boolean, bounds: Map): (Map?, string?)
    if value == nil then if required or next(bounds) ~= nil then return nil, "operation_policy.controls is required" else return nil, nil end end
    if type(value) ~= "table" then return nil, "operation_policy.controls must be an object" end
    local result: Map = {}
    for key, item in pairs(value :: Map) do
        local name, name_err = identifier(key, "operation_policy.controls key")
        if not name then return nil, name_err end
        local range_value = bounds[name :: string]
        if type(range_value) ~= "table" then return nil, "operation_policy.controls contains unsupported control " .. (name :: string) end
        local parsed, parsed_err = bounded(item, "operation_policy.controls." .. (name :: string), range_value :: Map)
        if not parsed then return nil, parsed_err end
        result[name :: string] = parsed
    end
    for key in pairs(bounds) do if result[key] == nil then return nil, "operation_policy.controls is missing " .. key end end
    return result, nil
end

local function parse_search(value: any, required: boolean, bounds: Map): (Map?, string?)
    bounds = type(bounds) == "table" and bounds or {}
    if value == nil then if required or next(bounds) ~= nil then return nil, "operation_policy.search is required" else return nil, nil end end
    if type(value) ~= "table" then return nil, "operation_policy.search must be an object" end
    local unknown = closed(value :: Map, SEARCH_KEYS, "operation_policy.search")
    if unknown then return nil, unknown end
    local result: Map = {}
    for key in pairs(SEARCH_KEYS) do
        local selected = trim((value :: Map)[key])
        if selected == "" then return nil, "operation_policy.search." .. key .. " is required" end
        local allowed = bounds[key]
        local found = false
        if type(allowed) == "table" then
            for _, candidate in ipairs(allowed :: { any }) do
                if selected == candidate then found = true; break end
            end
        end
        if not found then return nil, "operation_policy.search." .. key .. " is outside installed bounds" end
        result[key] = selected
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
    local operation_id, operation_err = identifier(raw.operation_id, "operation_policy.operation_id")
    if not operation_id then return nil, operation_err end
    local source_binding
    if raw.source_binding_id ~= nil then
        local source_err
        source_binding, source_err = identifier(raw.source_binding_id, "operation_policy.source_binding_id")
        if not source_binding then return nil, source_err end
    end
    local required = requirements or {}
    local control, control_err = M.validate_bounds(required.control_bounds)
    if not control then return nil, control_err end
    if control.operation_id ~= nil and control.operation_id ~= operation_id then return nil, "control_bounds.operation_id does not match operation_policy.operation_id" end
    if required.operation_id ~= nil and required.operation_id ~= operation_id then return nil, "operation_policy.operation_id must be " .. tostring(required.operation_id) end
    local limits, limits_err = parse_limits(raw.limits, required.limits == true, control.limits :: Map)
    if limits_err then return nil, limits_err end
    local storage, storage_err = parse_storage(raw.storage, required.storage == true, control.storage :: Map)
    if storage_err then return nil, storage_err end
    local controls, controls_err = parse_controls(raw.controls, required.controls == true, control.controls :: Map)
    if controls_err then return nil, controls_err end
    local search, search_err = parse_search(raw.search, required.search == true, control.search :: Map)
    if search_err then return nil, search_err end
    local effect
    if raw.effect ~= nil then
        effect = trim(raw.effect)
        if effect ~= "read_only" then return nil, "operation_policy.effect must be read_only for WebScout" end
    elseif required.effect == true then
        return nil, "operation_policy.effect is required"
    end
    local access, access_err = parse_access(raw.access_profile, required.access_profile == true)
    if access_err then return nil, access_err end
    local result: Map = { version = M.VERSION, policy_id = policy_id, revision = revision, operation_id = operation_id }
    if source_binding then result.source_binding_id = source_binding end
    if effect then result.effect = effect end
    if limits then result.limits = limits end
    if storage then result.storage = storage end
    if controls then result.controls = controls end
    if search then result.search = search end
    if access then result.access_profile = access end
    local effective = digest(result)
    if not effective then return nil, "operation_policy digest could not be computed" end
    result._control = {
        bounds_policy_ref = control.policy_ref,
        bounds_policy_revision = control.revision,
        bounds_policy_digest = control.digest,
        effective_policy_digest = effective,
    }
    return result, nil
end

function M.receipt(value: Map): Map
    local result: Map = {
        version = value.version, policy_id = value.policy_id, revision = value.revision,
        operation_id = value.operation_id,
    }
    if value.source_binding_id ~= nil then result.source_binding_id = value.source_binding_id end
    for _, field in ipairs({ "effect", "limits", "storage", "controls", "search", "access_profile" }) do if value[field] ~= nil then result[field] = value[field] end end
    local control = value._control
    if type(control) == "table" then
        result.bounds_policy_ref = control.bounds_policy_ref
        result.bounds_policy_revision = control.bounds_policy_revision
        result.bounds_policy_digest = control.bounds_policy_digest
        result.effective_policy_digest = control.effective_policy_digest
    end
    return result
end

function M.control_receipt(value: Map): Map
    local result: Map = {}
    for key, item in pairs(value) do if key ~= "digest" then result[key] = item end end
    result.digest = value.digest
    return result
end

M._test = { canonical = canonical, digest = digest, bounds = M.validate_bounds }
return M
