-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local llm = require("llm")
local json = require("json")
local types = require("types")
local error_envelope = require("error_envelope")

local M = {}

local TRANSIENT_KINDS = {
    [errors.UNAVAILABLE] = true,
    [errors.TIMEOUT] = true,
    [errors.RATE_LIMITED] = true,
}

local function model_error(step: string, err: any): error
    local message = step .. " failed"
    if type(err) ~= "userdata" then
        return types.internal(message, { step = step, cause = { message = tostring(err), retryable = false } })
    end
    local retryable = err:retryable() == true and TRANSIENT_KINDS[err:kind()] == true
    return errors.new({
        kind = retryable and err:kind() or errors.INTERNAL,
        retryable = retryable,
        message = message,
        details = { step = step, cause_kind = err:kind(), cause = error_envelope.encode(err) },
    })
end

local STATEMENT_ROLES = { user = true, tool = true, document = true }

local EXTRACTION_PROMPT = [[You extract personal attributes and actionable goals from new conversation statements.

First identify requests, intentions and ongoing work. Each request to accomplish a task
is an open plan from its first statement. A task needs no date, audience, destination,
method or other details to qualify. The requested outcome itself supplies value.details;
leave next_step empty when no next action is agreed. A request phrased as a question
still opens a plan. Later task answers add to the same goal's complete state. Carry
forward its known decisions and constraints. Mark completion or cancellation done.
Different goals coexist under distinct keys. Do not invent any missing information.

Then identify stated personal attributes, preferences, decisions, corrections, skills,
lessons and outcomes that help future conversations. Split independent attributes into
separate items, even when they share one statement. A correction supplies a new value;
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
- key: a short canonical topic naming the attribute or goal, never its value or sentence.
  Reuse an existing key for the same topic, regardless of phrasing.
- cardinality: single for one value at a time; multi for independent simultaneous values.
  Plans use single under their own goal key.
- value: the newly stated attribute value alone, never a union with an earlier value.
  A plan uses an object with status (open or done), next_step (agreed action or empty),
  and details (the requested outcome plus known decisions and constraints).
- content: one self-contained third-person sentence about this attribute or goal.
- event_id: the new user, tool or document message id supplying the evidence.
- valid_at: RFC3339 time when the statement says the value became true, otherwise empty.
- confidence: a number from 0 to 1.

Return scalar attributes in items and goals in plans. Both arrays are required.
Return {"items": [], "plans": []} only when no attributes or actionable goals are stated.]]

local JUDGE_PROMPT = [[You reconcile one new memory against existing memories of the same person.

Choose exactly one action:
- ADD: the new memory covers a distinct attribute, independent value or goal.
- NOOP: an existing memory already says the same thing, even under another kind or key.
- SUPERSEDE: the new memory updates or corrects the same attribute or goal. A direct
  statement of changed state replaces the earlier state.
- MERGE: the memories express the same claim and the new wording is more complete.
- CONFLICT: the claims contradict each other with no basis to select one, such as
  uncertainty expressed by the person or disagreement between sources.

new_memory.stated is the original statement when available. Read it in conversation
context. An answer about a task supplies that task's detail; it never changes a stable
personal attribute. Hypotheticals do not establish attributes either. Choose NOOP for
a candidate that mistakes either for a personal attribute. A stable attribute changes
only through a direct assertion about it. Plans for the same goal update by SUPERSEDE
as their details or next step progress. Different attributes or goals remain separate.

target_ids contains only existing ids from the supplied list, empty for ADD.
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

local WORKING_SUMMARY_PROMPT = [[Summarize the conversation so far as working state for continuing it:
goals, decisions, open questions, constraints and the next step. Be compact and factual.]]

local function messages(system: string, user: string): { any }
    return {
        { role = "system", content = { { type = "text", text = system } } },
        { role = "user", content = { { type = "text", text = user } } },
    }
end

local CANDIDATE_KINDS = types.MEMORY_KINDS
local CANDIDATE_KIND_SET = {}
for _, kind in ipairs(CANDIDATE_KINDS) do CANDIDATE_KIND_SET[kind] = true end

local function candidate_schema(event_ids: { string }?, kinds: { string }?): any
    local event_id: any = { type = "string" }
    if event_ids then event_id = { type = "string", enum = event_ids } end
    local scalar_kinds = {}
    for _, kind in ipairs(kinds or CANDIDATE_KINDS) do
        if kind ~= types.KIND.PLAN then scalar_kinds[#scalar_kinds + 1] = kind end
    end
    local function item(allowed: { string }, value: any, cardinalities: { string }): any
        return { type = "object", additionalProperties = false,
            required = { "kind", "key", "cardinality", "value", "content", "event_id", "valid_at", "confidence" },
            properties = {
                kind = { type = "string", enum = allowed }, key = { type = "string" },
                cardinality = { type = "string", enum = cardinalities }, value = value,
                content = { type = "string" }, event_id = event_id, valid_at = { type = "string" }, confidence = { type = "number" },
            },
        }
    end
    local scalar = item(scalar_kinds, { type = "string" }, { "single", "multi" })
    local schema = { type = "object", additionalProperties = false, required = { "items" }, properties = {
        items = { type = "array", items = scalar },
    } }
    if not kinds then
        local goal = item({ types.KIND.PLAN }, { type = "object", additionalProperties = false,
            required = { "status", "next_step", "details" }, properties = {
                status = { type = "string", enum = { "open", "done" } },
                next_step = { type = "string" }, details = { type = "string", minLength = 1 },
            },
        }, { "single" })
        schema.properties.plans = { type = "array", items = goal }
        schema.required[#schema.required + 1] = "plans"
    end
    return schema
end

-- The schema bounds result size; the budget includes JSON structure and field text.
local OUTPUT = { max_tokens = 8192, min_tokens = 256, characters_per_token = 3,
    max_candidates = 16, max_parts = 8, characters_per_candidate = 120,
    string_lengths = { key = 64, value = 256, content = 384, details = 512, next_step = 256,
        event_id = 128, valid_at = 35, reason = 192 }, default_string_length = 128 }

local function output_budget(schema: any, field: string?): integer
    local function size(node: any, name: string?): number
        if node.enum then
            local longest = 0
            for _, value in ipairs(node.enum) do longest = math.max(longest, #json.encode(value)) end
            return longest
        elseif node.type == "object" then
            local total = 2
            for key, child in pairs(node.properties) do total = total + #key + 4 + size(child, key) end
            return total
        elseif node.type == "array" then
            return 2 + (node.maxItems or 1) * (size(node.items, name) + 1)
        elseif node.type == "string" then
            node.maxLength = node.maxLength or OUTPUT.string_lengths[name] or OUTPUT.default_string_length
            return node.maxLength + 2
        end
        return 24
    end
    return math.min(OUTPUT.max_tokens, math.max(OUTPUT.min_tokens, math.ceil(size(schema, field) / OUTPUT.characters_per_token)))
end

local function candidate_count(text: string): integer
    return math.min(OUTPUT.max_candidates, math.max(4, math.ceil(#text / OUTPUT.characters_per_candidate)))
end

local function is_array(value: any): boolean
    if type(value) ~= "table" then return false end
    for key in pairs(value) do
        if type(key) ~= "number" or key < 1 or key > #value or key ~= math.floor(key) then return false end
    end
    return true
end

local function response_error(response: any, step: string): error?
    if response and response.finish_reason == "length" then
        return types.invalid(step .. " output is truncated", { code = "model_output_truncated", step = step })
    end
    if not response or type(response.result) ~= "table" then
        return types.invalid(step .. " returned malformed output", { code = "model_output_malformed", step = step })
    end
    return nil
end

local function reject(stats: any, step: string, reason: string)
    stats.rejected = (stats.rejected or 0) + 1
    local code = "rejected_" .. step .. "_" .. reason
    stats[code] = (stats[code] or 0) + 1
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
    local _, key_err = types.topic_key(item.key, item.content, item.value)
    if key_err then return "topic_key" end
    return nil
end

local function read_candidates(response: any, step: string, stats: any, event_ids: { [string]: boolean }?): (any?, error?)
    local err = response_error(response, "memory " .. step)
    if err then return nil, err end
    local data = response.result
    if not is_array(data.items) or (step == "extraction" and not is_array(data.plans)) then
        return nil, types.invalid("memory " .. step .. " returned malformed output", { code = "model_output_malformed" })
    end
    local out = {}
    local function read(collection: any, plans: boolean)
        for _, item in ipairs(collection) do
            local reason = candidate_reason(item)
            if not reason and step == "extraction" then
                if (item.kind == types.KIND.PLAN) ~= plans then reason = "kind"
                elseif not event_ids[item.event_id] then reason = "evidence" end
            elseif not reason and step == "reflection" and item.kind ~= types.KIND.LESSON then reason = "kind" end
            if reason then reject(stats, step, reason) else out[#out + 1] = item end
        end
    end
    read(data.items, false)
    if step == "extraction" then read(data.plans, true) end
    return out, nil
end

local function key_listing(keys: { any }): string
    local lines: { string } = {}
    local kind, names = nil, {}
    local function flush()
        if kind then lines[#lines + 1] = "- " .. kind .. ": " .. table.concat(names, ", ") end
    end
    for _, row in ipairs(keys) do
        if row.kind ~= kind then flush(); kind, names = row.kind, {} end
        local description = row.key .. " (" .. tostring(row.cardinality) .. ")"
        if row.content then description = description .. ": " .. row.content end
        if row.value ~= nil then description = description .. " State: " .. json.encode(row.value) end
        names[#names + 1] = description
    end
    flush()
    return table.concat(lines, "\n")
end

function M.conversation(span: { any }, context: { any }?): string
    local lines: { string } = {}
    for _, message in ipairs(context or {}) do
        lines[#lines + 1] = string.format("(%s, preceding context only) %s", message.role, message.text)
    end
    for _, message in ipairs(span) do
        if STATEMENT_ROLES[message.role] then
            lines[#lines + 1] = string.format("[%s][%s][%s] %s", message.id, message.created_at or "", message.role, message.text)
        else
            lines[#lines + 1] = string.format("(%s, context only) %s", message.role, message.text)
        end
    end
    return table.concat(lines, "\n")
end

function M.extract(model: string, span: { any }, keys: { any }, instructions: string?, context: { any }?, stats: any?): (any?, error?)
    stats = stats or {}
    local ids: { string } = {}
    local allowed = {}
    for _, message in ipairs(span) do
        if STATEMENT_ROLES[message.role] then ids[#ids + 1] = message.id; allowed[message.id] = true end
    end
    if #ids == 0 then return {}, nil end
    local system = EXTRACTION_PROMPT
    if #keys > 0 then
        system = system .. "\n\nKinds and keys already in use for this person; an item about one of these attributes reuses its kind and key:\n" .. key_listing(keys)
    end
    if instructions and instructions ~= "" then system = system .. "\n\nMemory policy:\n" .. instructions end
    local conversation = M.conversation(span, context)
    local schema = candidate_schema(ids)
    schema.properties.items.maxItems = candidate_count(conversation)
    schema.properties.plans.maxItems = schema.properties.items.maxItems
    local response, err = llm.structured_output(schema, messages(system, conversation), { model = model, max_tokens = output_budget(schema) })
    if err then return nil, model_error("memory extraction", err) end
    local candidates, read_err = read_candidates(response, "extraction", stats, allowed)
    if read_err then return nil, read_err end
    return M.normalize(model, candidates :: any, keys, conversation, stats)
end

function M.normalize(model: string, candidates: { any }, keys: { any }, conversation: string?, stats: any?): (any?, error?)
    stats = stats or {}
    if #candidates == 0 then return candidates, nil end
    local known: { [string]: any } = {}
    for _, row in ipairs(keys) do known[row.key] = row end
    local properties, required = {}, {}
    for i, candidate in ipairs(candidates) do
        local kinds = {}
        for _, kind in ipairs(CANDIDATE_KINDS) do
            if (kind == types.KIND.PLAN) == (candidate.kind == types.KIND.PLAN)
                and (candidate.kind ~= types.KIND.LESSON or kind == types.KIND.LESSON) then
                kinds[#kinds + 1] = kind
            end
        end
        local mapping_properties = {
            key = { type = "string", pattern = "^[a-z][a-z0-9_]{0,63}$" }, kind = { type = "string", enum = kinds },
            cardinality = { type = "string", enum = { "single", "multi" } },
        }
        local excluded_keys = {}
        for _, row in ipairs(keys) do
            if (row.kind == types.KIND.PLAN) ~= (candidate.kind == types.KIND.PLAN) then
                excluded_keys[#excluded_keys + 1] = row.key
            end
        end
        if #excluded_keys > 0 then mapping_properties.key["not"] = { enum = excluded_keys } end
        local mapping_required = { "key", "kind", "cardinality" }
        local mappings: any = { type = "array", minItems = 1, maxItems = math.min(OUTPUT.max_parts,
            math.max(2, math.ceil((#candidate.content + #json.encode(candidate.value)) / OUTPUT.characters_per_candidate))) }
        if type(candidate.value) == "string" then
            mapping_properties.value = { type = "string", minLength = 1 }
            mapping_properties.content = { type = "string", minLength = 1 }
            mapping_required[#mapping_required + 1] = "value"
            mapping_required[#mapping_required + 1] = "content"
        else
            mappings.maxItems = 1
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
    local response, err = llm.structured_output(schema, messages(NORMALIZATION_PROMPT, json.encode({ candidates = candidates, existing_keys = keys, conversation = conversation })), { model = model, max_tokens = output_budget(schema) })
    if err then return nil, model_error("memory normalization", err) end
    local response_err = response_error(response, "memory normalization")
    if response_err then return nil, response_err end
    local mappings = response and response.result and response.result.mappings
    if type(mappings) ~= "table" then
        return nil, types.invalid("memory normalization returned malformed output", { code = "model_output_malformed" })
    end
    local out = {}
    for i, candidate in ipairs(candidates) do
        local parts = mappings[tostring(i)]
        if type(parts) ~= "table" then
            return nil, types.invalid("memory normalization returned malformed mappings", { code = "model_output_malformed" })
        end
        if not is_array(parts) or #parts == 0 or (type(candidate.value) ~= "string" and #parts ~= 1) then
            reject(stats, "normalization", "mapping")
        else
            for _, mapping in ipairs(parts) do
                local reason = nil
                local normalized = {}
                for k, v in pairs(candidate) do normalized[k] = v end
                if type(mapping) ~= "table" or not types.CARDINALITY_SET[mapping.cardinality] then reason = "shape"
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
                    if not reason and (((mapping.kind == types.KIND.PLAN) ~= (candidate.kind == types.KIND.PLAN))
                        or (existing and ((existing.kind == types.KIND.PLAN) ~= (candidate.kind == types.KIND.PLAN)))
                        or (candidate.kind == types.KIND.LESSON and mapping.kind ~= types.KIND.LESSON)) then reason = "kind" end
                end
                if reason then reject(stats, "normalization", reason)
                else
                    normalized.content = types.trim(normalized.content)
                    if type(normalized.value) == "string" then normalized.value = types.trim(normalized.value) end
                    out[#out + 1] = normalized
                end
            end
        end
    end
    return out, nil
end

local REFLECTION_MIN_SOURCES = 2

function M.reflect(model: string, items: { any }, stats: any?): (any?, error?)
    stats = stats or {}
    local lines: { string } = {}
    local numbers: { integer } = {}
    for index, item in ipairs(items) do
        lines[#lines + 1] = string.format("%d. (%s/%s) %s", index, item.kind, item.key, item.content)
        numbers[index] = index
    end
    local schema = candidate_schema(nil, { types.KIND.LESSON })
    schema.properties.items.maxItems = math.min(OUTPUT.max_parts, math.max(1, math.floor(#items / REFLECTION_MIN_SOURCES)))
    local item_schema = schema.properties.items.items
    item_schema.properties.key.pattern = "^[a-z][a-z0-9_]{0,63}$"
    item_schema.properties.cardinality.enum = { "multi" }
    item_schema.properties.based_on = { type = "array", items = { type = "integer", enum = numbers }, minItems = REFLECTION_MIN_SOURCES, maxItems = #items, uniqueItems = true }
    item_schema.required[#item_schema.required + 1] = "based_on"
    local response, err = llm.structured_output(schema, messages(REFLECTION_PROMPT, table.concat(lines, "\n")), { model = model, max_tokens = output_budget(schema) })
    if err then return nil, model_error("memory reflection", err) end
    local candidates, read_err = read_candidates(response, "reflection", stats)
    if read_err then return nil, read_err end
    local grounded: { any } = {}
    for _, candidate in ipairs(candidates :: any) do
        local sources: { [integer]: boolean } = {}
        local source_ids: { string } = {}
        local valid = is_array(candidate.based_on)
        for _, number in ipairs(valid and candidate.based_on or {}) do
            if type(number) ~= "number" or number ~= math.floor(number) or not items[number] or sources[number] then
                valid = false
            else
                sources[number] = true
                source_ids[#source_ids + 1] = items[number].id
            end
        end
        if valid and #source_ids >= REFLECTION_MIN_SOURCES and candidate.cardinality == types.CARDINALITY.MULTI then
            candidate.source_ids = source_ids
            grounded[#grounded + 1] = candidate
        else reject(stats, "reflection", "grounding") end
    end
    return M.normalize(model, grounded, items, nil, stats)
end

function M.judge(model: string, candidate: any, neighbors: { any }, actions: { string }): (any?, error?)
    local ids: { string } = {}
    local known: { [string]: boolean } = {}
    local listing: { any } = {}
    for _, item in ipairs(neighbors) do
        ids[#ids + 1] = item.id
        known[item.id] = true
        listing[#listing + 1] = { id = item.id, kind = item.kind, key = item.key, content = item.content, valid_at = item.valid_at }
    end
    local schema = {
        type = "object",
        additionalProperties = false,
        required = { "action", "target_ids", "reason" },
        properties = {
            action = { type = "string", enum = actions },
            target_ids = { type = "array", items = { type = "string", enum = ids }, maxItems = #ids },
            reason = { type = "string" },
        },
    }
    local response, err = llm.structured_output(schema, messages(JUDGE_PROMPT, json.encode({
            new_memory = { kind = candidate.kind, key = candidate.key, content = candidate.content, valid_at = candidate.valid_at,
                stated = candidate.stated }, conversation = candidate.conversation,
            existing_memories = listing,
        })), { model = model, max_tokens = output_budget(schema) })
    if err then return nil, model_error("memory reconcile judge", err) end
    local response_err = response_error(response, "memory reconcile judge")
    if response_err then return nil, response_err end
    local data = response and response.result
    if type(data) ~= "table" or type(data.action) ~= "string" or type(data.target_ids) ~= "table" then
        return nil, types.unavailable("memory reconcile judge returned malformed output")
    end
    local valid_action = false
    for _, action in ipairs(actions) do if action == data.action then valid_action = true end end
    if not valid_action then return nil, types.unavailable("memory reconcile judge returned an unknown action") end
    local targets: { string } = {}
    for _, id in ipairs(data.target_ids) do
        if not known[id] then return nil, types.unavailable("memory reconcile judge returned an unknown memory id") end
        targets[#targets + 1] = id
    end
    if data.action ~= types.ACTION.ADD and #targets == 0 then
        return nil, types.unavailable("memory reconcile judge returned " .. data.action .. " without targets")
    end
    return { action = data.action, target_ids = targets }, nil
end

function M.embed(model: string, texts: { string }): (any?, error?)
    local response, err = llm.embed(texts, { model = model, dimensions = types.EMBEDDING_DIMENSIONS })
    if err then return nil, model_error("memory embedding", err) end
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
