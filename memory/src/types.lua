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

M.SCOPE = {
    AGENT = "agent",
    OWNER = "owner",
}

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

M.EVENT = {
    ITEM_ADDED = "kickside.memory.events:item.added",
    ITEM_SUPERSEDED = "kickside.memory.events:item.superseded",
    ITEM_MERGED = "kickside.memory.events:item.merged",
    ITEM_CONFLICTED = "kickside.memory.events:item.conflicted",
    ITEM_FORGOTTEN = "kickside.memory.events:item.forgotten",
    ITEM_RESTORED = "kickside.memory.events:item.restored",
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

local function normalize_text(value: any): string
    local text = M.trim(value)
    return (text:lower():gsub("%s+", " "))
end

-- Canonical text of an item value for content addressing.
function M.value_text(value: any): string
    if value == nil then return "" end
    if type(value) == "string" then return normalize_text(value) end
    local encoded = json.encode(value)
    return normalize_text(encoded or "")
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

-- A failed dependency call: what failed and the error it returned.
function M.failed(message: string, err: any): error
    return M.unavailable(message .. ": " .. tostring(err))
end

function M.internal(message: string, details: any?): error
    return errors.new({ kind = errors.INTERNAL, message = message, retryable = false, details = details })
end

return M
