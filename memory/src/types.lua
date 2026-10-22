-- Shared vocabulary of the memory engine: item kinds, scopes, statuses, ledger
-- event types, run types, and the small value helpers every layer uses.

local time = require("time")
local hash = require("hash")
local json = require("json")

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
M.KINDS = { "identity", "rule", "profile_slot", "fact", "preference", "skill", "lesson" }

-- Kinds rendered into the always-on soul block, in render order.
M.SOUL_KINDS = { "identity", "rule", "profile_slot", "preference" }

M.SCOPE = {
    AGENT = "agent",
    OWNER = "owner",
    SESSION = "session",
    GROUP = "group",
}
M.SCOPES = { "agent", "owner", "session", "group" }

M.STATUS = {
    CURRENT = "current",
    SUPERSEDED = "superseded",
    CONFLICT = "conflict",
    FORGOTTEN = "forgotten",
}

M.ITEM_SOURCE = {
    CAPTURE = "capture",
    TOOL = "tool",
    REFLECTION = "reflection",
    OWNER = "owner",
}
M.ITEM_SOURCES = { "capture", "tool", "reflection", "owner" }

M.EVENT = {
    ITEM_ADDED = "kickside.memory.events:item.added",
    ITEM_SUPERSEDED = "kickside.memory.events:item.superseded",
    ITEM_MERGED = "kickside.memory.events:item.merged",
    ITEM_CONFLICTED = "kickside.memory.events:item.conflicted",
    ITEM_FORGOTTEN = "kickside.memory.events:item.forgotten",
    ITEM_RESTORED = "kickside.memory.events:item.restored",
    PROVENANCE_ADDED = "kickside.memory.events:provenance.added",
    PROVENANCE_REMOVED = "kickside.memory.events:provenance.removed",
    CAPTURE_ADVANCED = "kickside.memory.events:capture.advanced",
    CONSOLIDATION_COMPLETED = "kickside.memory.events:consolidation.completed",
}

M.CONTENT_UPSERTED = "kickside.knowledge.events:content.upserted"
M.CONTENT_DELETED = "kickside.knowledge.events:content.deleted"

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
M.ACTIONS = { "ADD", "SUPERSEDE", "MERGE", "NOOP", "CONFLICT" }

local function set_of(list: { string }): { [string]: boolean }
    local out: { [string]: boolean } = {}
    for _, value in ipairs(list) do out[value] = true end
    return out
end

M.KIND_SET = set_of(M.KINDS)
M.SCOPE_SET = set_of(M.SCOPES)
M.ITEM_SOURCE_SET = set_of(M.ITEM_SOURCES)

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

function M.normalize_text(value: any): string
    local text = M.trim(type(value) == "string" and value or "")
    return (text:lower():gsub("%s+", " "))
end

-- Canonical text of an item value for content addressing.
function M.value_text(value: any): string
    if value == nil then return "" end
    if type(value) == "string" then return M.normalize_text(value) end
    local encoded = json.encode(value)
    return M.normalize_text(encoded or "")
end

function M.sha256(text: string): (string?, error?)
    local digest, err = hash.sha256(text)
    if err then return nil, errors.wrap(err, "sha256 failed") end
    return digest, nil
end

function M.scope_key(scope_family: string, scope_id: string): string
    return scope_family .. ":" .. scope_id
end

-- Content-derived item id: identical typed content in one memory always maps to
-- one id, so replayed or redelivered work is idempotent.
function M.item_id(component_id: string, kind: string, scope_family: string, scope_id: string, key: string, value: any): (string?, error?)
    return M.sha256(table.concat({ component_id, kind, scope_family, scope_id, M.normalize_key(key), M.value_text(value) }, "|"))
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

function M.internal(message: string, details: any?): error
    return errors.new({ kind = errors.INTERNAL, message = message, retryable = false, details = details })
end

return M
