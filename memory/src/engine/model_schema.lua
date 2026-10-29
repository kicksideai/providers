-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local json = require("json")
local llm = require("llm")
local types = require("types")

local M = {}

local CONTROL_FREE = "^[^\\x00-\\x1F]*$"

function M.codepoints(text: string): integer
    local _, count = text:gsub("[^\128-\191]", "")
    return count
end

function M.bounded_string(maximum: integer, minimum: integer?): any
    return { type = "string", maxLength = maximum, minLength = minimum, pattern = CONTROL_FREE }
end

function M.enum_string(values: { string }): any
    local maximum = 0
    for _, value in ipairs(values) do maximum = math.max(maximum, M.codepoints(value)) end
    return { type = "string", enum = values, maxLength = maximum, pattern = CONTROL_FREE }
end

function M.topic_key(maximum: integer): any
    return { type = "string", maxLength = maximum, pattern = "^[a-z][a-z0-9_]{0," .. tostring(maximum - 1) .. "}$" }
end

function M.validate(schema: any, value: any): boolean
    local encoded, encode_err = json.encode(value)
    if encode_err then return false end
    local valid = json.validate_string(schema, encoded)
    return valid == true
end

M.LIMITS = { per_statement = 4, parts = 4, lessons = 4,
    key = types.KEY_MAX, value = 160, content = 240, details = 400, next_step = 160, valid_at = 35, reason = 192 }
local NUMBER_BYTES = 24
M.REFLECTION_MIN_SOURCES = 2

local CANDIDATE_KINDS = types.MEMORY_KINDS
local CANDIDATE_KIND_SET = {}
for _, kind in ipairs(CANDIDATE_KINDS) do CANDIDATE_KIND_SET[kind] = true end

-- Kind compatibility with existing topics is validated after decoding.
local TOPIC_SCHEMA = M.topic_key(M.LIMITS.key)

function M.item_schema(allowed: { string }, value: any, cardinalities: { string }, event_id: any, valid_at: any, based_on: any?): any
    local required = { "kind", "key", "cardinality", "value", "content", "event_id", "valid_at", "confidence" }
    local properties = {
        kind = M.enum_string(allowed), key = TOPIC_SCHEMA,
        cardinality = M.enum_string(cardinalities), value = value,
        content = M.bounded_string(M.LIMITS.content, 1), event_id = event_id,
        valid_at = valid_at, confidence = { type = "number", minimum = 0, maximum = 1 },
    }
    if based_on then
        required[#required + 1] = "based_on"
        properties.based_on = based_on
    end
    return { type = "object", additionalProperties = false, required = required, properties = properties }
end

function M.extraction_schema(event_ids: { string }, count: integer, evidence: string): any
    local event_id = M.enum_string(event_ids)
    local scalar_kinds = {}
    for _, kind in ipairs(CANDIDATE_KINDS) do
        if kind ~= types.KIND.PLAN and kind ~= types.KIND.LESSON
            and (evidence ~= "document" or kind == types.KIND.FACT) then scalar_kinds[#scalar_kinds + 1] = kind end
    end
    local scalar = M.item_schema(scalar_kinds, M.bounded_string(M.LIMITS.value, 1), { "single", "multi" }, event_id, M.bounded_string(M.LIMITS.valid_at))
    local goal = M.item_schema({ types.KIND.PLAN }, { type = "object", additionalProperties = false,
        required = { "status", "next_step", "details" }, properties = {
            status = M.enum_string({ "open", "done" }),
            next_step = M.bounded_string(M.LIMITS.next_step), details = M.bounded_string(M.LIMITS.details, 1),
        },
    }, { "single" }, event_id, M.bounded_string(M.LIMITS.valid_at))
    return { type = "object", additionalProperties = false, required = { "items", "lessons", "plans" }, properties = {
        items = { type = "array", maxItems = count * M.LIMITS.per_statement, items = scalar },
        lessons = { type = "array", maxItems = evidence == "document" and 0 or count * M.LIMITS.per_statement,
            items = M.item_schema({ types.KIND.LESSON }, M.bounded_string(M.LIMITS.value, 1), { "multi" }, event_id, M.bounded_string(M.LIMITS.valid_at)),
        },
        plans = { type = "array", maxItems = evidence == "document" and 0 or count, items = goal },
    } }
end

function M.reflection_schema(numbers: { integer }, count: integer): any
    return { type = "object", additionalProperties = false, required = { "items" }, properties = {
        items = { type = "array", maxItems = count,
            items = M.item_schema({ types.KIND.LESSON }, M.bounded_string(M.LIMITS.value, 1), { "multi" }, M.enum_string({ "" }), M.enum_string({ "" }),
                { type = "array", items = { type = "integer", enum = numbers }, minItems = M.REFLECTION_MIN_SOURCES, maxItems = #numbers }),
        },
    } }
end

-- Control-free compact UTF-8 JSON uses at most four bytes per code point,
-- including quote/backslash escapes. One token per byte bounds byte-level tokenizers.
function M.schema_bytes(schema: any, bytes_per_character: integer): (integer?, error?)
    local function encoded_size(value: any): (integer?, error?)
        local encoded, encode_err = json.encode(value)
        if encode_err then return nil, types.internal("memory result schema encode failed", { cause = tostring(encode_err) }) end
        return #encoded, nil
    end
    local function size(node: any): (integer?, error?)
        if node.enum then
            local longest = 0
            for _, value in ipairs(node.enum) do
                local value_size, value_err = encoded_size(value)
                if value_err then return nil, value_err end
                longest = math.max(longest, value_size :: integer)
            end
            return longest, nil
        elseif node.type == "object" then
            local total, count = 2, 0
            for key, child in pairs(node.properties) do
                local key_size, key_err = encoded_size(key)
                if key_err then return nil, key_err end
                local child_size, child_err = size(child)
                if child_err then return nil, child_err end
                total = total + (key_size :: integer) + 1 + (child_size :: integer)
                count = count + 1
            end
            return total + math.max(0, count - 1), nil
        elseif node.type == "array" then
            local item_size, item_err = size(node.items)
            if item_err then return nil, item_err end
            return 2 + node.maxItems * (item_size :: integer) + math.max(0, node.maxItems - 1), nil
        elseif node.type == "string" then
            return 2 + bytes_per_character * node.maxLength, nil
        elseif node.type == "number" then
            return NUMBER_BYTES, nil
        end
        return nil, types.internal("memory result schema is unbounded", { type = tostring(node.type) })
    end
    return size(schema)
end

function M.output_limit(model: string): (integer?, error?)
    local card, err = llm.resolve_model(model)
    if err then return nil, err end
    local limit = tonumber(card and card.output_tokens)
    if not limit or limit ~= limit or limit < 1 then
        return nil, types.invalid("memory model " .. model .. " requires a positive output limit")
    end
    return math.floor(limit), nil
end

function M.output_budget(schema: any, model: string): (integer?, error?)
    local limit, limit_err = M.output_limit(model)
    if limit_err then return nil, limit_err end
    local size, size_err = M.schema_bytes(schema, 4)
    if size_err then return nil, size_err end
    return math.min(limit :: integer, size :: integer), nil
end

return M
