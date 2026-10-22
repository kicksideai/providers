-- Shared vocabulary of the memory engine: item kinds, scopes, statuses, ledger
-- event types, run types, and the small value helpers every layer uses.

local time = require("time")
local json = require("json")
local canonical_json = require("canonical_json")
local security = require("security")

local M = {}

M.KB_TYPE = "memory"
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
}

M.SCOPE = {
    AGENT = "agent",
    OWNER = "owner",
}

-- How many current values a key holds in one scope. Kind is a presentation
-- label; cardinality and the canonical key decide uniqueness.
M.CARDINALITY = {
    SINGLE = "single",
    MULTI = "multi",
}

-- archived is reversible; forgotten is an erase: the item keeps its place in
-- the history but no text, value, vector or provenance.
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

-- Normalize an RFC3339 instant to UTC seconds; nil when it does not parse.
function M.utc(value: any): string?
    if type(value) ~= "string" or value == "" then return nil end
    local text = value
    if text:match("^%d%d%d%d%-%d%d%-%d%d %d%d:%d%d:%d%d") then
        -- SQLite datetime() text is UTC without a zone designator.
        text = text:sub(1, 10) .. "T" .. text:sub(12, 19) .. "Z"
    end
    local parsed, err = time.parse(time.RFC3339, text)
    if err or not parsed then return nil end
    return parsed:utc():format(time.RFC3339)
end

-- RFC3339 instant `seconds` after now.
function M.after_seconds(seconds: number): string
    return time.now():add(math.floor(seconds) * time.SECOND):utc():format(time.RFC3339)
end

function M.normalize_key(value: any): string
    local text = M.trim(type(value) == "string" and value or tostring(value or "")):lower()
    text = text:gsub("[%s%p]+", "_"):gsub("^_+", ""):gsub("_+$", "")
    return text
end

-- Topic identity is independent of the text and value it labels.
function M.topic_key(value: any, content: string, claim_value: any?): (string?, error?)
    local key = M.normalize_key(value)
    if #key == 0 or #key > 64 or not key:match("^[a-z][a-z0-9_]*$") then
        return nil, M.invalid("a topic key of up to 64 letters, digits and underscores is required")
    end
    local compact = key:gsub("_", "")
    local content_key = M.normalize_key(content):gsub("_", "")
    if content_key ~= "" and compact:find(content_key, 1, true) then return nil, M.invalid("topic key must not contain memory content") end
    if claim_value ~= nil then
        local value_text, encode_err = json.encode(claim_value)
        if encode_err then return nil, M.invalid("memory value must be JSON", { cause = tostring(encode_err) }) end
        local value_key = M.normalize_key(value_text):gsub("_", "")
        if value_key ~= "" and compact:find(value_key, 1, true) then
            return nil, M.invalid("topic key must not contain the memory value")
        end
    end
    return key, nil
end

-- The calling actor's id, or "" without one.
function M.actor_id(): string
    local actor = security.actor()
    return actor and actor:id() or ""
end

function M.scope_key(scope_family: string, scope_id: string): string
    return scope_family .. ":" .. scope_id
end

-- A value as a tagged tuple, so an absent value hashes apart from every
-- present one.
local function typed(value: any): { any }
    if value == nil then return { "none" } end
    return { "value", value }
end

-- Canonical hash of a typed tuple: value types and object keys are kept, so
-- true, "true", 1 and "1" are four different claims.
function M.digest(parts: any): (string?, error?)
    local digest, err = canonical_json.hash(parts)
    if err then return nil, err end
    return digest, nil
end

-- A claim: one typed value of a key in a scope. The same claim made again is
-- the same claim, whenever and however it is phrased; a text value compares
-- without case or spacing differences.
function M.claim_id(component_id: string, scope_key: string, key: string, value: any): (string?, error?)
    if type(value) == "string" then value = (M.trim(value):lower():gsub("%s+", " ")) end
    return M.digest({ "claim", component_id, scope_key, key, typed(value) })
end

-- Hash of an item's text and value, kept with the structure so erasure can
-- find every stored copy without the ledger holding the text.
function M.content_hash(component_id: string, content: string, value: any): (string?, error?)
    return M.digest({ "content", component_id, content, typed(value) })
end

function M.decode_json(value: any): any
    if type(value) == "table" then return value end
    if type(value) ~= "string" or value == "" then return nil end
    local decoded, err = json.decode(value)
    if err then return nil end
    return decoded
end

function M.invalid(message: string, details: any?): error
    return errors.new({ kind = errors.INVALID, message = message, details = details })
end

function M.not_found(message: string): error
    return errors.new({ kind = errors.NOT_FOUND, message = message })
end

function M.unavailable(message: string, details: any?): error
    return errors.new({ kind = errors.UNAVAILABLE, message = message, retryable = true, details = details })
end

-- A failed dependency call: what failed, with the dependency's own kind and
-- retry flag. An error without a kind is internal and not retried.
function M.failed(message: string, err: any): error
    if type(err) == "userdata" then
        return errors.new({ kind = err:kind(), retryable = err:retryable() == true, message = message .. ": " .. err:message(), details = err:details() })
    end
    return errors.new({ kind = errors.INTERNAL, retryable = false, message = message .. ": " .. tostring(err) })
end

function M.internal(message: string, details: any?): error
    return errors.new({ kind = errors.INTERNAL, message = message, retryable = false, details = details })
end

return M
