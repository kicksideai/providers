-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local llm = require("llm")
local json = require("json")
local uuid = require("uuid")
local types = require("types")
local error_envelope = require("error_envelope")

local M = {}

local TRANSIENT_KINDS = {
    [errors.UNAVAILABLE] = true,
    [errors.TIMEOUT] = true,
    [errors.RATE_LIMITED] = true,
}

local STATEMENT_ROLES = { user = true, tool = true, document = true }

function M.is_statement(message: any): boolean
    return STATEMENT_ROLES[message.role] == true
end

local EXTRACTION_PROMPT = [[You extract personal attributes and actionable goals from new conversation statements.

Treat memory-management requests as instructions about stored memory. Requests to forget,
delete or stop remembering information establish no personal attribute or actionable
goal. Extract only separately stated assertions about the person or their work.

First identify requests, intentions and ongoing work. Each request to accomplish a task
is an open plan from its first statement. A task needs no date, audience, destination,
method or other details to qualify. The requested outcome itself supplies value.details;
leave next_step empty when no next action is agreed. A request phrased as a question
still opens a plan. Later task answers add to the same goal's complete state. Carry
forward its known decisions and constraints. Mark completion or cancellation done.
Different goals coexist under distinct keys. Do not invent any missing information.

Then identify stated personal attributes, preferences, decisions, corrections, skills,
lessons and outcomes that help future conversations. Split independent attributes into
separate items whenever they can change independently, even when they share one statement. Assign each
stated value only to the attribute the statement names; a change of one attribute leaves related
attributes unchanged and never copies its value into them. A correction supplies a new value;
reconciliation determines its relationship to earlier values.

Interpret each statement in its preceding conversation and existing memory context.
Answers about a task change that goal's details, not stable personal attributes.
Hypotheticals do not establish personal attributes. Change a stable attribute only
when the user directly states it or its change.

Cite only new user, tool or document statements that supply evidence. Preceding context
and existing memories explain meaning but supply no new evidence. Assistant suggestions,
answers, narration and recalled-memory notes are not user statements. Raw tool output
alone is not a durable claim. Omit greetings, thanks, acknowledgements, questions that
request no task and state no useful information, and narration that changes neither a
goal nor an attribute. An actionable task qualifies even if it is short-lived or vague.

Each item has:
- kind: fact | preference | profile_slot | skill | lesson | plan.
  profile_slot is a stable personal attribute with one value at a time.
- key: a short canonical topic, never its value or sentence: lowercase letters, digits
  and underscores, starting with a letter, at most 64 characters. Reuse an existing
  topic key for the same attribute or goal. Keep one key for an attribute throughout
  the batch. Plans and lessons keep their own keys.
- cardinality: single for one value at a time; multi for independent simultaneous values.
  Plans use single under their own goal key.
- value: the newly stated attribute value alone, never a union with an earlier value.
  When one phrase combines values of attributes that can change independently, such as
  one thing at or for another, each attribute gets its own item, key and value.
  A plan uses an object with status (open or done), next_step (agreed action or empty),
  and details (the requested outcome plus known decisions and constraints).
- content: one self-contained third-person sentence about this attribute or goal.
- event_id: the new user, tool or document message id supplying the evidence.
- valid_at: RFC3339 time when a personal attribute became true as stated by the person,
  otherwise empty. A plan version takes the time of the statement that updates it;
  leave valid_at empty for plans. Event dates, schedules and deadlines are goal content
  in value.details or value.next_step, never the plan's effective time.
- confidence: a number from 0 to 1.

Return scalar attributes in items, lessons in lessons, and goals in plans. All three arrays
are required. Return {"items": [], "lessons": [], "plans": []} only when nothing qualifies.]]

local JUDGE_PROMPT = [[You reconcile one new memory against existing memories of the same person.

Return one relation for every numbered existing memory:
- unrelated: the new memory covers a distinct attribute, independent value or goal.
- same: the existing memory already says it, even under another kind or key.
- updates: the new memory updates or corrects the same attribute or goal. A direct
  statement that a single-valued attribute changed replaces its earlier value.
  Joining, leaving, moving, switching, starting or stopping states a change, even
  without an explicit correction or a reference to the previous value.
  The new value must belong to the existing memory's own attribute; a value of a
  related attribute is unrelated, never an update.
- rephrases: the memories express the same claim and the new wording is more complete.
- contradicts: the claims conflict with no basis to select one, such as uncertainty
  expressed by the person or disagreement between sources. Different values before
  and after an explicitly stated change are updates, not contradictions.

Use only the relations allowed by each numbered property's enum.
new_memory.stated is the original statement when available. Read it in conversation
context. An answer about a task supplies that task's detail; it never changes a stable
personal attribute. Hypotheticals do not establish attributes either. A stable attribute
changes only through a direct assertion about it. Plans for the same goal update as
their details or next step progress. Different attributes or goals remain separate.
Compare the attribute named by each key and its typed value, not incidental mentions
in content. Independently changeable attributes do not conflict merely because they
mention the same entity. A value and the time when it changes are separate attributes.
Decide the relationship from the statements; do not infer an update from record order.]]

local NORMALIZATION_PROMPT = [[Normalize candidate memories into independently changeable attributes before reconciliation.

For every numbered candidate return a nonempty array of attributes. Split compound
statements into separate attributes whenever either can change independently. Give
each its own topic key, kind, cardinality, value and self-contained content describing
only that attribute. All parts keep the candidate's evidence. Do not discard an
attribute when splitting or add information absent from the candidate.

Keys name topics, never their values, instructions or whole sentences. Use lowercase
letters, digits and underscores, starting with a letter, at most 64 characters. Reuse
an existing key for the same attribute regardless of phrasing or kind; candidates for
the same attribute share a key within the batch too. Create new topic keys for
independent attributes not represented by existing keys.

Conversation grounds the claim. Existing values explain attribute identity but never
authorize an unstated union of old and new values. Return only the newly stated scalar
value. Preserve non-string typed values unchanged as one item; their value and content
fields are not part of the mapping. Do not alter meaning.

Plans never map onto personal attributes or other kinds. Each goal keeps its own key
and complete typed state. Stable personal attributes use profile_slot and single.
Independent simultaneous values use multi. Lessons remain lessons.]]

local REFLECTION_PROMPT = [[Derive concrete guidance for helping this person from their numbered memories.
Each lesson must combine at least two memories into guidance that no single memory
already states. Never restate or summarize one memory, repeat a profile attribute, or
guess beyond the evidence. Return {"items": []} when no grounded lesson follows.

Keys name a reusable guidance topic, never the recommended action, a value, a person,
or the lesson sentence. Use lowercase letters, digits and underscores, starting with
a letter, at most 64 characters. The same guidance topic keeps its key as advice changes.

Each lesson has kind lesson, a short stable topic key, cardinality multi, value (guidance in a
few words), content (one sentence of guidance), based_on (at least two distinct memory
numbers), empty event_id and valid_at, and confidence from 0 to 1.]]

local JSON_FORMAT = "\n\nReturn one compact JSON object on one line, with no whitespace outside strings, reasoning or extra text."

local WORKING_SUMMARY_PROMPT = [[Summarize the conversation so far as working state for continuing it:
goals, decisions, open questions, constraints and the next step. Be compact and factual.]]

local function messages(system: string, user: string): { any }
    return {
        { role = "system", content = { { type = "text", text = system } } },
        { role = "user", content = { { type = "text", text = user } } },
    }
end

local LIMITS = { per_statement = 4, parts = 4, lessons = 4,
    key = types.KEY_MAX, value = 160, content = 240, details = 400, next_step = 160, valid_at = 35, reason = 192 }
local NUMBER_BYTES = 24
local REFLECTION_MIN_SOURCES = 2

local function codepoints(text: string): integer
    local _, count = text:gsub("[^\128-\191]", "")
    return count
end

local CONTROL_FREE = "^[^\\u0000-\\u001F]*$"

local function bounded_string(maximum: integer, minimum: integer?): any
    return { type = "string", maxLength = maximum, minLength = minimum, pattern = CONTROL_FREE }
end

local function enum_string(values: { string }): any
    local maximum = 0
    for _, value in ipairs(values) do maximum = math.max(maximum, codepoints(value)) end
    return { type = "string", enum = values, maxLength = maximum, pattern = CONTROL_FREE }
end

local CANDIDATE_KINDS = types.MEMORY_KINDS
local CANDIDATE_KIND_SET = {}
for _, kind in ipairs(CANDIDATE_KINDS) do CANDIDATE_KIND_SET[kind] = true end

-- Kind compatibility with existing topics is validated after decoding.
local TOPIC_SCHEMA = { type = "string", maxLength = LIMITS.key, pattern = "^[a-z][a-z0-9_]{0," .. tostring(types.KEY_MAX - 1) .. "}$" }

local function item_schema(allowed: { string }, value: any, cardinalities: { string }, event_id: any, valid_at: any, based_on: any?): any
    local required = { "kind", "key", "cardinality", "value", "content", "event_id", "valid_at", "confidence" }
    local properties = {
        kind = enum_string(allowed), key = TOPIC_SCHEMA,
        cardinality = enum_string(cardinalities), value = value,
        content = bounded_string(LIMITS.content, 1), event_id = event_id,
        valid_at = valid_at, confidence = { type = "number", minimum = 0, maximum = 1 },
    }
    if based_on then
        required[#required + 1] = "based_on"
        properties.based_on = based_on
    end
    return { type = "object", additionalProperties = false, required = required, properties = properties }
end

local function extraction_schema(event_ids: { string }, count: integer): any
    local event_id = enum_string(event_ids)
    local scalar_kinds = {}
    for _, kind in ipairs(CANDIDATE_KINDS) do
        if kind ~= types.KIND.PLAN and kind ~= types.KIND.LESSON then scalar_kinds[#scalar_kinds + 1] = kind end
    end
    local scalar = item_schema(scalar_kinds, bounded_string(LIMITS.value, 1), { "single", "multi" }, event_id, bounded_string(LIMITS.valid_at))
    local goal = item_schema({ types.KIND.PLAN }, { type = "object", additionalProperties = false,
        required = { "status", "next_step", "details" }, properties = {
            status = enum_string({ "open", "done" }),
            next_step = bounded_string(LIMITS.next_step), details = bounded_string(LIMITS.details, 1),
        },
    }, { "single" }, event_id, bounded_string(LIMITS.valid_at))
    return { type = "object", additionalProperties = false, required = { "items", "lessons", "plans" }, properties = {
        items = { type = "array", maxItems = count * LIMITS.per_statement, items = scalar },
        lessons = { type = "array", maxItems = count * LIMITS.per_statement,
            items = item_schema({ types.KIND.LESSON }, bounded_string(LIMITS.value, 1), { "multi" }, event_id, bounded_string(LIMITS.valid_at)),
        },
        plans = { type = "array", maxItems = count, items = goal },
    } }
end

local function reflection_schema(numbers: { integer }, count: integer): any
    return { type = "object", additionalProperties = false, required = { "items" }, properties = {
        items = { type = "array", maxItems = count,
            items = item_schema({ types.KIND.LESSON }, bounded_string(LIMITS.value, 1), { "multi" }, enum_string({ "" }), enum_string({ "" }),
                { type = "array", items = { type = "integer", enum = numbers }, minItems = REFLECTION_MIN_SOURCES, maxItems = #numbers }),
        },
    } }
end

-- Control-free compact UTF-8 JSON uses at most four bytes per code point,
-- including quote/backslash escapes. One token per byte bounds byte-level tokenizers.
local function schema_bytes(schema: any, bytes_per_character: integer): (integer?, error?)
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

local function output_limit(model: string): (integer?, error?)
    local card, err = llm.resolve_model(model)
    if err then return nil, err end
    local limit = tonumber(card and card.output_tokens)
    if not limit or limit ~= limit or limit < 1 then
        return nil, types.invalid("memory model " .. model .. " requires a positive output limit")
    end
    return math.floor(limit), nil
end

local function output_budget(schema: any, model: string): (integer?, error?)
    local limit, limit_err = output_limit(model)
    if limit_err then return nil, limit_err end
    local size, size_err = schema_bytes(schema, 4)
    if size_err then return nil, size_err end
    return math.min(limit :: integer, size :: integer), nil
end

function M.extraction_capacity(model: string, span: { any }?): (integer?, error?)
    local limit, limit_err = output_limit(model)
    if limit_err then return nil, limit_err end
    local ids = {}
    for _, message in ipairs(span or {}) do
        if M.is_statement(message) then ids[#ids + 1] = message.id end
    end
    if #ids == 0 then ids[1] = uuid.v7() end
    local count = 0
    -- Capacity uses typical compact ASCII output so 8,192-token models remain usable;
    -- call budgets cover the four-byte bound up to the model card limit.
    while true do
        local size, size_err = schema_bytes(extraction_schema(ids, count + 1), 1)
        if size_err then return nil, size_err end
        if (size :: integer) > (limit :: integer) then break end
        count = count + 1
    end
    if count == 0 then
        return nil, types.invalid("memory extraction model " .. model .. " output limit cannot hold one statement")
    end
    return count, nil
end

local function exceeds_bounds(value: any, schema: any): boolean
    if type(value) == "string" and value:find("[%z\1-\31]") then return true end
    if schema.enum then
        for _, option in ipairs(schema.enum) do if value == option then return false end end
        return true
    end
    if schema.type == "array" then
        if type(value) ~= "table" then return true end
        for key in pairs(value) do
            if type(key) ~= "number" or key < 1 or key > #value or key ~= math.floor(key) then return true end
        end
        if schema.minItems and #value < schema.minItems then return true end
        if schema.maxItems and #value > schema.maxItems then return true end
        for _, item in ipairs(value) do if exceeds_bounds(item, schema.items) then return true end end
        return false
    end
    if schema.type == "object" and type(value) ~= "table" then return true end
    if type(value) == "string" and schema.maxLength then
        return codepoints(value) > schema.maxLength
    elseif type(value) == "table" and schema.type == "object" then
        for _, key in ipairs(schema.required or {}) do if value[key] == nil then return true end end
        for key, child in pairs(value) do
            local property = schema.properties[key]
            if not property or exceeds_bounds(child, property) then return true end
        end
    end
    return false
end

local function malformed_error(step: string): error
    return types.unavailable("memory " .. step .. " returned malformed output", { step = step, code = "model_output_malformed" })
end

local function response_error(response: any, step: string, schema: any): error?
    if response and response.finish_reason == "length" then
        return types.unavailable("memory " .. step .. " output is truncated", { code = "model_output_truncated", step = step })
    end
    if not response or type(response.result) ~= "table" or exceeds_bounds(response.result, schema) then
        return malformed_error(step)
    end
    return nil
end

local function validation_error(step: string, reason: string): error
    local code = "model_output_invalid_" .. step .. "_" .. reason
    return types.unavailable("memory " .. step .. " returned invalid output: " .. code, { step = step, code = code })
end

local function model_error(step: string, err: any): error
    local message = "memory " .. step .. " failed"
    if type(err) ~= "userdata" then
        return types.internal(message, { step = step, cause = { message = tostring(err), retryable = false } })
    end
    local details = err:details() or {}
    if details.error_type == "model_error" and type(details.raw_content) == "string" then
        local _, decode_err = json.decode(details.raw_content)
        if decode_err then return malformed_error(step) end
    end
    local retryable = err:retryable() == true and TRANSIENT_KINDS[err:kind()] == true
    return errors.new({
        kind = retryable and err:kind() or errors.INTERNAL,
        retryable = retryable,
        message = message,
        details = { step = step, cause_kind = err:kind(), cause = error_envelope.encode(err) },
    })
end

local function candidate_reason(item: any, typed: boolean?): string?
    if type(item) ~= "table" or not CANDIDATE_KIND_SET[item.kind] or types.trim(item.key) == ""
        or types.trim(item.content) == "" or not types.CARDINALITY_SET[item.cardinality] then return "shape" end
    if item.kind == types.KIND.PLAN then
        if types.validate_value(item.kind, item.value) or item.cardinality ~= types.CARDINALITY.SINGLE
            or types.trim(item.value.details) == "" then return "value" end
    elseif not typed and (type(item.value) ~= "string" or types.trim(item.value) == "") then return "value" end
    if item.confidence ~= nil and (type(item.confidence) ~= "number" or item.confidence ~= item.confidence
        or item.confidence < 0 or item.confidence > 1) then return "confidence" end
    if item.valid_at ~= nil and item.valid_at ~= "" and not types.utc(item.valid_at) then return "time" end
    local key_err = types.check_topic_key(item.key, item.content, item.value, item.kind)
    if key_err then return "topic_key" end
    return nil
end

local function read_candidates(response: any, step: string, event_ids: { [string]: boolean }?, keys: { any }?, schema: any): (any?, error?)
    local err = response_error(response, step, schema)
    if err then return nil, err end
    local data = response.result
    local known = {}
    for _, row in ipairs(keys or {}) do known[row.key] = row end
    local out = {}
    local function read(collection: any, plans: boolean): error?
        for _, item in ipairs(collection) do
            if type(item) == "table" and type(item.key) == "string" then item.key = types.normalize_key(item.key) end
            local reason = candidate_reason(item)
            local existing = not reason and known[types.normalize_key(item.key)] or nil
            if existing then
                if not types.compatible_kinds(existing.kind, item.kind) then reason = "kind"
                else item.cardinality = existing.cardinality end
            end
            if not reason and step == "extraction" then
                if (item.kind == types.KIND.PLAN) ~= plans then reason = "kind"
                elseif not event_ids[item.event_id] then reason = "evidence" end
            elseif not reason and step == "reflection" and item.kind ~= types.KIND.LESSON then reason = "kind" end
            if reason then return validation_error(step, reason) end
            out[#out + 1] = item
        end
        return nil
    end
    local item_err = read(data.items, false)
    if item_err then return nil, item_err end
    if step == "extraction" then
        local lesson_err = read(data.lessons, false)
        if lesson_err then return nil, lesson_err end
        local plan_err = read(data.plans, true)
        if plan_err then return nil, plan_err end
    end
    return out, nil
end

local function key_listing(keys: { any }): (string?, error?)
    local lines: { string } = {}
    local kind, names = nil, {}
    local function flush()
        if kind then lines[#lines + 1] = "- " .. kind .. ": " .. table.concat(names, ", ") end
    end
    for _, row in ipairs(keys) do
        if row.kind ~= kind then flush(); kind, names = row.kind, {} end
        local description = row.key .. " (" .. tostring(row.cardinality) .. ")"
        if row.content then description = description .. ": " .. row.content end
        if row.value ~= nil then
            local value, encode_err = json.encode(row.value)
            if encode_err then return nil, types.internal("memory key value encode failed", { cause = tostring(encode_err) }) end
            description = description .. " State: " .. value
        end
        names[#names + 1] = description
    end
    flush()
    return table.concat(lines, "\n"), nil
end

function M.conversation(span: { any }, context: { any }?): string
    local lines: { string } = {}
    for _, message in ipairs(context or {}) do
        lines[#lines + 1] = string.format("(%s, preceding context only) %s", message.role, message.text)
    end
    for _, message in ipairs(span) do
        if M.is_statement(message) then
            lines[#lines + 1] = string.format("[%s][%s][%s] %s", message.id, message.created_at or "", message.role, message.text)
        else
            lines[#lines + 1] = string.format("(%s, context only) %s", message.role, message.text)
        end
    end
    return table.concat(lines, "\n")
end

function M.extract(model: string, span: { any }, keys: { any }, instructions: string?, context: { any }?): (any?, error?)
    local ids: { string } = {}
    local allowed = {}
    for _, message in ipairs(span) do
        if M.is_statement(message) then ids[#ids + 1] = message.id; allowed[message.id] = true end
    end
    if #ids == 0 then return {}, nil end
    local system = EXTRACTION_PROMPT
    if #keys > 0 then
        local listing, listing_err = key_listing(keys)
        if listing_err then return nil, listing_err end
        system = system .. "\n\nKinds and keys already in use for this person; an item about one of these attributes reuses its kind and key:\n" .. (listing :: string)
    end
    if instructions and instructions ~= "" then system = system .. "\n\nMemory policy:\n" .. instructions end
    local conversation = M.conversation(span, context)
    local schema = extraction_schema(ids, #ids)
    local budget, budget_err = output_budget(schema, model)
    if budget_err then return nil, budget_err end
    local response, err = llm.structured_output(schema, messages(system .. JSON_FORMAT, conversation), { model = model, max_tokens = budget })
    if err then return nil, model_error("extraction", err) end
    local candidates, read_err = read_candidates(response, "extraction", allowed, keys, schema)
    if read_err then return nil, read_err end
    return candidates, nil
end

-- A typed value or a lesson maps to exactly one topic; a scalar attribute may
-- split into independent parts.
local function single_part(candidate: any): boolean
    return type(candidate.value) ~= "string" or candidate.kind == types.KIND.LESSON
end

function M.normalize(model: string, candidates: { any }, keys: { any }, conversation: string?): (any?, error?)
    if #candidates == 0 then return candidates, nil end
    local known: { [string]: any } = {}
    for _, row in ipairs(keys) do known[row.key] = row end
    local properties, required = {}, {}
    for i, candidate in ipairs(candidates) do
        local kinds = {}
        for _, kind in ipairs(CANDIDATE_KINDS) do
            if types.compatible_kinds(kind, candidate.kind) then
                kinds[#kinds + 1] = kind
            end
        end
        local lesson = candidate.kind == types.KIND.LESSON
        local mapping_properties = {
            key = TOPIC_SCHEMA, kind = enum_string(kinds),
            cardinality = enum_string(lesson and { "multi" } or { "single", "multi" }),
        }
        local mapping_required = { "key", "kind", "cardinality" }
        local mappings: any = { type = "array", minItems = 1, maxItems = single_part(candidate) and 1 or LIMITS.parts }
        if type(candidate.value) == "string" then
            mapping_properties.value = bounded_string(LIMITS.value, 1)
            mapping_properties.content = bounded_string(LIMITS.content, 1)
            mapping_required[#mapping_required + 1] = "value"
            mapping_required[#mapping_required + 1] = "content"
        end
        mappings.items = { type = "object", additionalProperties = false,
            required = mapping_required, properties = mapping_properties,
        }
        properties[tostring(i)] = mappings
        required[#required + 1] = tostring(i)
    end
    local schema = { type = "object", additionalProperties = false, required = { "mappings" }, properties = {
        mappings = { type = "object", additionalProperties = false, properties = properties, required = required },
    } }
    local budget, budget_err = output_budget(schema, model)
    if budget_err then return nil, budget_err end
    local payload, encode_err = json.encode({ candidates = candidates, existing_keys = keys, conversation = conversation })
    if encode_err then return nil, types.internal("memory normalization input encode failed", { cause = tostring(encode_err) }) end
    local response, err = llm.structured_output(schema, messages(NORMALIZATION_PROMPT .. JSON_FORMAT, payload), { model = model, max_tokens = budget })
    if err then return nil, model_error("normalization", err) end
    local response_err = response_error(response, "normalization", schema)
    if response_err then return nil, response_err end
    local mappings = response.result.mappings
    local out = {}
    for i, candidate in ipairs(candidates) do
        local parts = mappings[tostring(i)]
        for _, mapping in ipairs(parts) do
            local reason = nil
            local normalized = {}
            for k, v in pairs(candidate) do normalized[k] = v end
            if type(mapping) ~= "table" or type(mapping.key) ~= "string"
                or not types.CARDINALITY_SET[mapping.cardinality] then reason = "shape"
            else
                local mapped_key = types.normalize_key(mapping.key)
                local existing = known[mapped_key]
                normalized.kind = mapping.kind
                normalized.key = mapped_key
                normalized.cardinality = existing and existing.cardinality or mapping.cardinality
                if type(candidate.value) == "string" then
                    normalized.value = mapping.value
                    normalized.content = mapping.content
                end
                reason = candidate_reason(normalized, type(candidate.value) ~= "string")
                if not reason and (not types.compatible_kinds(mapping.kind, candidate.kind)
                    or (existing and not types.compatible_kinds(existing.kind, mapping.kind))) then reason = "kind" end
            end
            if reason then return nil, validation_error("normalization", reason) end
            normalized.content = types.trim(normalized.content)
            if type(normalized.value) == "string" then normalized.value = types.trim(normalized.value) end
            out[#out + 1] = normalized
        end
    end
    return out, nil
end

function M.reflect(model: string, items: { any }): (any?, error?)
    if #items < REFLECTION_MIN_SOURCES then return {}, nil end
    local lines: { string } = {}
    local numbers: { integer } = {}
    for index, item in ipairs(items) do
        lines[#lines + 1] = string.format("%d. (%s/%s) %s", index, item.kind, item.key, item.content)
        numbers[index] = index
    end
    local schema = reflection_schema(numbers, math.min(LIMITS.lessons, math.floor(#items / REFLECTION_MIN_SOURCES)))
    local budget, budget_err = output_budget(schema, model)
    if budget_err then return nil, budget_err end
    local response, err = llm.structured_output(schema, messages(REFLECTION_PROMPT .. JSON_FORMAT, table.concat(lines, "\n")), { model = model, max_tokens = budget })
    if err then return nil, model_error("reflection", err) end
    local candidates, read_err = read_candidates(response, "reflection", nil, nil, schema)
    if read_err then return nil, read_err end
    local grounded: { any } = {}
    for _, candidate in ipairs(candidates :: any) do
        local sources: { [integer]: boolean } = {}
        local source_ids: { string } = {}
        local valid = true
        for _, number in ipairs(candidate.based_on) do
            if type(number) ~= "number" or number ~= math.floor(number) or not items[number] or sources[number] then
                valid = false
            else
                sources[number] = true
                source_ids[#source_ids + 1] = items[number].id
            end
        end
        if valid and #source_ids >= REFLECTION_MIN_SOURCES then
            candidate.source_ids = source_ids
            grounded[#grounded + 1] = candidate
        else return nil, validation_error("reflection", "grounding") end
    end
    return M.normalize(model, grounded, items, nil)
end

-- First matching relation wins. An update selects the first updated single-valued
-- key and keeps only that key's single-valued targets, preserving attribute identity.
local RELATION_ACTIONS = {
    { relation = "same", action = types.ACTION.NOOP },
    { relation = "updates", action = types.ACTION.SUPERSEDE },
    { relation = "rephrases", action = types.ACTION.MERGE },
    { relation = "contradicts", action = types.ACTION.CONFLICT },
    { relation = "unrelated", action = types.ACTION.ADD },
}

function M.judge(model: string, candidate: any, neighbors: { any }, actions: { string }): (any?, error?)
    local allowed: { string } = {}
    for _, choice in ipairs(RELATION_ACTIONS) do
        for _, action in ipairs(actions) do
            if choice.action == action then allowed[#allowed + 1] = choice.relation end
        end
    end
    local required: { string } = {}
    local properties, listing = {}, {}
    for index, item in ipairs(neighbors) do
        local number = tostring(index)
        required[#required + 1] = number
        properties[number] = enum_string(types.compatible_kinds(candidate.kind, item.kind) and allowed or { "unrelated" })
        listing[number] = { id = item.id, kind = item.kind, key = item.key, cardinality = item.cardinality,
            value = item.value, content = item.content, valid_at = item.valid_at }
    end
    local schema = {
        type = "object",
        additionalProperties = false,
        required = { "relations", "reason" },
        properties = {
            relations = { type = "object", additionalProperties = false, required = required, properties = properties },
            reason = bounded_string(LIMITS.reason),
        },
    }
    local budget, budget_err = output_budget(schema, model)
    if budget_err then return nil, budget_err end
    local payload, encode_err = json.encode({
        new_memory = { kind = candidate.kind, key = candidate.key, cardinality = candidate.cardinality, value = candidate.value,
            content = candidate.content, valid_at = candidate.valid_at, stated = candidate.stated },
        conversation = candidate.conversation, existing_memories = listing,
    })
    if encode_err then return nil, types.internal("memory reconcile judge input encode failed", { cause = tostring(encode_err) }) end
    local response, err = llm.structured_output(schema, messages(JUDGE_PROMPT .. JSON_FORMAT, payload), { model = model, max_tokens = budget })
    if err then return nil, model_error("reconcile judge", err) end
    local response_err = response_error(response, "reconcile judge", schema)
    if response_err then return nil, response_err end
    local relations = response.result.relations
    for _, choice in ipairs(RELATION_ACTIONS) do
        local targets: { string } = {}
        local single_key = nil
        if choice.action == types.ACTION.SUPERSEDE then
            for index, item in ipairs(neighbors) do
                if relations[tostring(index)] == choice.relation and item.cardinality == types.CARDINALITY.SINGLE then
                    single_key = item.key
                    break
                end
            end
        end
        for index, item in ipairs(neighbors) do
            if relations[tostring(index)] == choice.relation and
                (choice.action ~= types.ACTION.SUPERSEDE or item.cardinality ~= types.CARDINALITY.SINGLE or item.key == single_key) then
                targets[#targets + 1] = item.id
            end
        end
        if #targets > 0 then
            return { action = choice.action, target_ids = choice.action == types.ACTION.ADD and {} or targets }, nil
        end
    end
    return { action = types.ACTION.ADD, target_ids = {} }, nil
end

function M.embed(model: string, texts: { string }): (any?, error?)
    local response, err = llm.embed(texts, { model = model, dimensions = types.EMBEDDING_DIMENSIONS })
    if err then return nil, model_error("embedding", err) end
    local vectors = response and response.result
    if type(vectors) ~= "table" or #vectors ~= #texts then
        return nil, types.unavailable("memory embedding returned " .. tostring(type(vectors) == "table" and #vectors or 0) ..
            " vectors for " .. tostring(#texts) .. " texts")
    end
    for _, vector in ipairs(vectors) do
        if type(vector) ~= "table" or #vector ~= types.EMBEDDING_DIMENSIONS then
            return nil, types.unavailable("memory embedding returned a vector that is not " .. types.EMBEDDING_DIMENSIONS .. "-dimensional")
        end
    end
    return vectors, nil
end

function M.working_summary(model: string, text: string, max_tokens: integer): (string?, any?, error?)
    local response, err = llm.generate(messages(WORKING_SUMMARY_PROMPT, text), { model = model, max_tokens = max_tokens })
    if err then return nil, nil, model_error("working summary", err) end
    if not response or response.finish_reason ~= "stop" or type(response.result) ~= "string" or types.trim(response.result) == "" then
        return nil, nil, types.unavailable("working summary did not complete")
    end
    return types.trim(response.result), response.tokens, nil
end

return M
