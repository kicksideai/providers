-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local time = require("time")
local json = require("json")
local canonical_json = require("canonical_json")
local security = require("security")

local M = {}

M.STORE_TYPE = "memory"
M.THREAD_KIND = "kickside.memory.ledger"
M.SOURCE = "kickside.memory"
M.EMBEDDING_DIMENSIONS = 512

M.KIND = {
    IDENTITY = "identity",
    RULE = "rule",
    PROFILE_SLOT = "profile_slot",
    FACT = "fact",
    PREFERENCE = "preference",
    SKILL = "skill",
    LESSON = "lesson",
    PLAN = "plan",
}

M.MEMORY_KINDS = { M.KIND.FACT, M.KIND.PREFERENCE, M.KIND.PROFILE_SLOT, M.KIND.SKILL, M.KIND.LESSON, M.KIND.PLAN }

M.SCOPE = {
    AGENT = "agent",
    OWNER = "owner",
}

M.CARDINALITY = {
    SINGLE = "single",
    MULTI = "multi",
}

M.STATUS = {
    CURRENT = "current",
    SUPERSEDED = "superseded",
    CONFLICT = "conflict",
    ARCHIVED = "archived",
    FORGOTTEN = "forgotten",
}

M.ITEM_SOURCE = {
    CAPTURE = "capture",
    TOOL = "tool",
    REFLECTION = "reflection",
    OWNER = "owner",
}

M.EVENT = {
    ITEM_ADDED = "kickside.memory.events:item.added",
    ITEM_SUPERSEDED = "kickside.memory.events:item.superseded",
    ITEM_MERGED = "kickside.memory.events:item.merged",
    ITEM_CONFLICTED = "kickside.memory.events:item.conflicted",
    ITEM_REVISED = "kickside.memory.events:item.revised",
    ITEM_ARCHIVED = "kickside.memory.events:item.archived",
    ITEM_RESTORED = "kickside.memory.events:item.restored",
    ITEM_FORGOTTEN = "kickside.memory.events:item.forgotten",
    PROVENANCE_ADDED = "kickside.memory.events:provenance.added",
    CAPTURE_ADVANCED = "kickside.memory.events:capture.advanced",
    CONSOLIDATION_COMPLETED = "kickside.memory.events:consolidation.completed",
}

M.CONTENT_UPSERTED = "kickside.knowledge.events:content.upserted"

M.RUN_TYPE = {
    DERIVE = "derive",
    CONSOLIDATE = "consolidate",
    REEMBED = "reembed",
}

M.RUN_STATUS = {
    SCHEDULED = "scheduled",
    RUNNING = "running",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    REJECTED = "rejected",
}

M.ACTION = {
    ADD = "ADD",
    SUPERSEDE = "SUPERSEDE",
    MERGE = "MERGE",
    NOOP = "NOOP",
    CONFLICT = "CONFLICT",
}
M.ACTIONS = { M.ACTION.ADD, M.ACTION.SUPERSEDE, M.ACTION.MERGE, M.ACTION.NOOP, M.ACTION.CONFLICT }

local function set_of(map: { [string]: string }): { [string]: boolean }
    local out: { [string]: boolean } = {}
    for _, value in pairs(map) do out[value] = true end
    return out
end

M.KIND_SET = set_of(M.KIND)
M.SCOPE_SET = set_of(M.SCOPE)
M.CARDINALITY_SET = set_of(M.CARDINALITY)

function M.trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

function M.now(): string
    return time.now():utc():format(time.RFC3339)
end

-- SQLite datetime text represents UTC; both database formats normalize to seconds.
function M.utc(value: any): string?
    if type(value) ~= "string" or value == "" then return nil end
    local text = value
    if text:match("^%d%d%d%d%-%d%d%-%d%d %d%d:%d%d:%d%d") then
        text = text:sub(1, 10) .. "T" .. text:sub(12, 19) .. "Z"
    end
    local parsed, err = time.parse(time.RFC3339, text)
    if err or not parsed then return nil end
    return parsed:utc():format(time.RFC3339)
end

function M.after_seconds(seconds: number): string
    return time.now():add(math.floor(seconds) * time.SECOND):utc():format(time.RFC3339)
end

function M.normalize_key(value: any): string
    local text = M.trim(type(value) == "string" and value or tostring(value or "")):lower()
    text = text:gsub("[%s%p]+", "_"):gsub("^_+", ""):gsub("_+$", "")
    return text
end

function M.default_cardinality(kind: string): string
    return kind == M.KIND.PLAN and M.CARDINALITY.SINGLE or M.CARDINALITY.MULTI
end

function M.render_content(row: any): string
    if row.kind ~= M.KIND.PLAN then return row.content end
    return row.content .. " Details: " .. row.value.details .. " Next step: " .. row.value.next_step .. " Status: " .. row.value.status .. "."
end

function M.validate_value(kind: string, value: any): error?
    if kind ~= M.KIND.PLAN then return nil end
    if type(value) ~= "table" or (value.status ~= "open" and value.status ~= "done")
        or type(value.next_step) ~= "string" or type(value.details) ~= "string" then
        return M.invalid("a plan requires status open or done, next_step and details")
    end
    return nil
end

function M.topic_key(value: any, content: string, claim_value: any?, kind: string?): (string?, error?)
    local key = M.normalize_key(value)
    if #key == 0 or #key > 64 or not key:match("^[a-z][a-z0-9_]*$") then
        return nil, M.invalid("a topic key of up to 64 letters, digits and underscores is required")
    end
    local tokens: { string } = {}
    for token in key:gmatch("[^_]+") do tokens[#tokens + 1] = token end
    local function copied(text: string): boolean
        local normalized = M.normalize_key(text):gsub("_", "")
        if normalized == "" then return false end
        for first = 1, #tokens do
            local combined = ""
            for last = first, #tokens do
                combined = combined .. tokens[last]
                if combined == normalized then return true end
            end
        end
        return false
    end
    if copied(content) then return nil, M.invalid("topic key must not contain memory content") end
    if claim_value ~= nil then
        local _, encode_err = json.encode(claim_value)
        if encode_err then return nil, M.invalid("memory value must be JSON", { cause = tostring(encode_err) }) end
        local function copied_leaf(leaf: any): boolean
            if type(leaf) == "table" then
                for _, child in pairs(leaf) do if copied_leaf(child) then return true end end
                return false
            end
            return leaf ~= nil and copied(tostring(leaf))
        end
        if kind ~= M.KIND.PLAN and copied_leaf(claim_value) then
            return nil, M.invalid("topic key must not contain the memory value")
        end
    end
    return key, nil
end

function M.actor_id(): string
    local actor = security.actor()
    return actor and actor:id() or ""
end

function M.scope_key(scope_family: string, scope_id: string): string
    return scope_family .. ":" .. scope_id
end

-- The tag distinguishes an absent value from every JSON value in a canonical hash.
local function value_tuple(value: any): { any }
    if value == nil then return { "none" } end
    return { "value", value }
end

-- Repeated string claims share identity after case and whitespace normalization.
function M.claim_id(component_id: string, scope_key: string, key: string, value: any): (string?, error?)
    if type(value) == "string" then value = (M.trim(value):lower():gsub("%s+", " ")) end
    return canonical_json.hash({ "claim", component_id, scope_key, key, value_tuple(value) })
end

function M.content_hash(component_id: string, content: string, value: any): (string?, error?)
    return canonical_json.hash({ "content", component_id, content, value_tuple(value) })
end

function M.decode_json(value: any): (any?, error?)
    if type(value) == "table" then return value, nil end
    if type(value) ~= "string" then return nil, M.internal("memory JSON value is missing or invalid") end
    local decoded, err = json.decode(value)
    if err then return nil, M.failed("memory JSON decode failed", err) end
    return decoded, nil
end

function M.invalid(message: string, details: any?): error
    return errors.new({ kind = errors.INVALID, retryable = false, message = message, details = details })
end

function M.not_found(message: string): error
    return errors.new({ kind = errors.NOT_FOUND, message = message })
end

function M.unavailable(message: string, details: any?): error
    return errors.new({ kind = errors.UNAVAILABLE, message = message, retryable = true, details = details })
end

function M.failed(message: string, err: any): error
    if type(err) == "userdata" then
        return errors.new({ kind = err:kind(), retryable = err:retryable() == true, message = message, details = err:details() })
    end
    return errors.new({ kind = errors.INTERNAL, retryable = false, message = message })
end

function M.failure(err: any): (string?, error?)
    local failure = { kind = errors.INTERNAL, code = errors.INTERNAL, explanation = "Memory operation violates an internal invariant.", retryable = false }
    if type(err) == "userdata" then
        local details = err:details() or {}
        failure.kind, failure.code = err:kind(), details.code or details.cause_kind or err:kind()
        failure.explanation = err:message()
        failure.retryable = err:retryable() == true
    end
    return json.encode(failure)
end

function M.internal(message: string, details: any?): error
    return errors.new({ kind = errors.INTERNAL, message = message, retryable = false, details = details })
end

return M
