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

local EXTRACTION_PROMPT = [[You extract durable memory about the user from a conversation span.

Keep information the user states that will help in later conversations: attributes,
preferences, decisions, corrections, outcomes, and ongoing goals. A correction supplies
a new value; reconciliation determines its relationship to earlier values.

Interpret each statement in its preceding conversation and existing memory context.
An answer to a question about a task supplies that task's requested detail. It does not
assert or change a stable personal attribute. Hypothetical statements do not establish
personal attributes. Update a stable attribute only when the user states that attribute
or its change directly.

A request to get something done opens a plan, even when details remain unknown. Keep one
stable key per goal. A later answer or decision updates that goal's complete state:
carry forward known details and add the new information to value.details and content.
Different goals coexist under distinct keys. Mark a plan done on completion or cancellation.
Do not invent missing details or replace known state with an empty state.

Cite only a new user, tool or document statement that supplies the item's evidence.
Preceding context and existing memories explain meaning but are not new evidence.
Assistant suggestions, answers, narration and recalled-memory notes are not statements
by the user. Raw tool output is not itself a durable claim. Skip questions with no goal
or durable information, vague statements with no future use, task chatter that adds no
decision or constraint, greetings, thanks and acknowledgements.

Each item has:
- kind: fact | preference | profile_slot | skill | lesson | plan.
  profile_slot is a stable personal attribute with one value at a time.
- key: a short canonical topic naming the attribute or goal, not its value or sentence.
  Reuse an existing key naming the same attribute, regardless of phrasing.
- cardinality: single when only one value holds at a time; multi when independent values
  can hold simultaneously. Plans have cardinality single under their own goal key.
- value: the newly stated attribute value alone. Never combine it with an earlier,
  different value. Extract separate candidates for simultaneous values. A plan uses an
  object with status (open or done), next_step (the agreed next action, empty if unknown),
  and details (known decisions and constraints, including the goal itself).
- content: one self-contained sentence in the third person about the user or goal.
- event_id: the new user, tool or document message id supplying the evidence.
- valid_at: when the statement says the value became true (RFC3339), otherwise empty.
- confidence: a number from 0 to 1.

Return scalar attributes in items and goals in plans. Both arrays are required.
Return {"items": [], "plans": []} when nothing durable is stated.]]

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

local NORMALIZATION_PROMPT = [[Normalize candidate memory attributes before reconciliation.

For every numbered candidate return its canonical key, kind, cardinality and value.
Reuse an existing key whenever it names the same attribute, regardless of phrasing or
kind. Within the batch, candidates for the same attribute also share a key. Use a new
key only for an attribute or goal no existing key represents. Different attributes and
distinct goals keep different keys.

Conversation grounds the new claim. Existing values explain attribute identity but do
not authorize an unstated union of old and new values. Return the newly stated scalar
value alone, never a sentence about the user. Preserve typed non-string values; their
value field is not part of the mapping. Do not add information or alter meaning.

Plans never map onto personal attributes or other kinds. Each goal keeps one complete
state under its own key. Stable personal attributes use profile_slot and cardinality
single, even when a caller labels them fact. Independent simultaneous values use multi.]]

local REFLECTION_PROMPT = [[Derive concrete guidance for helping this person from their numbered memories.
Each lesson must combine at least two memories into guidance that no single memory
already states. Never restate or summarize one memory, repeat a profile attribute, or
guess beyond the evidence. Return {"items": []} when no grounded lesson follows.

Each lesson has kind lesson, a short stable key, cardinality multi, value (guidance in a
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

local function read_candidates(response: any, step: string): (any?, error?)
    local data = response and response.result
    if type(data) ~= "table" or type(data.items) ~= "table" then
        return nil, types.unavailable(step .. " returned malformed output")
    end
    local candidates = {}
    for _, item in ipairs(data.items) do candidates[#candidates + 1] = item end
    if step == "memory extraction" then
        if type(data.plans) ~= "table" then return nil, types.unavailable(step .. " returned malformed goals") end
        for _, item in ipairs(data.plans) do candidates[#candidates + 1] = item end
    end
    local out: { any } = {}
    for index, item in ipairs(candidates) do
        if type(item) ~= "table" or not types.KIND_SET[item.kind] or types.trim(item.key) == ""
            or types.trim(item.content) == "" or not types.CARDINALITY_SET[item.cardinality] then
            return nil, types.unavailable(step .. " returned a malformed item at " .. tostring(index))
        end
        if item.kind ~= types.KIND.PLAN and type(item.value) ~= "string" then
            return nil, types.unavailable(step .. " returned a non-scalar attribute")
        end
        if item.kind == types.KIND.PLAN and types.validate_value(item.kind, item.value) then
            return nil, types.unavailable(step .. " returned an invalid goal state")
        end
        out[#out + 1] = item
    end
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

function M.extract(model: string, span: { any }, keys: { any }, instructions: string?, context: { any }?): (any?, error?)
    local ids: { string } = {}
    for _, message in ipairs(span) do
        if STATEMENT_ROLES[message.role] then ids[#ids + 1] = message.id end
    end
    if #ids == 0 then return {}, nil end
    local system = EXTRACTION_PROMPT
    if #keys > 0 then
        system = system .. "\n\nKinds and keys already in use for this person; an item about one of these attributes reuses its kind and key:\n" .. key_listing(keys)
    end
    if instructions and instructions ~= "" then system = system .. "\n\nMemory policy:\n" .. instructions end
    local response, err = llm.structured_output(candidate_schema(ids), messages(system, M.conversation(span, context)), { model = model })
    if err then return nil, model_error("memory extraction", err) end
    local candidates, read_err = read_candidates(response, "memory extraction")
    if read_err then return nil, read_err end
    return M.normalize(model, candidates :: any, keys, M.conversation(span, context))
end

function M.normalize(model: string, candidates: { any }, keys: { any }, conversation: string?): (any?, error?)
    if #candidates == 0 then return candidates, nil end
    local names, named = {}, {}
    local known: { [string]: any } = {}
    local function name(key: string)
        if not named[key] then names[#names + 1] = key; named[key] = true end
    end
    for _, row in ipairs(keys) do name(row.key); known[row.key] = row end
    for _, candidate in ipairs(candidates) do name(candidate.key) end
    local properties, required, allowed = {}, {}, {}
    for i, candidate in ipairs(candidates) do
        local keys_for_candidate, kinds = {}, {}
        allowed[i] = {}
        for _, key in ipairs(names) do
            local existing = known[key]
            if not existing or ((candidate.kind == types.KIND.PLAN) == (existing.kind == types.KIND.PLAN)) then
                keys_for_candidate[#keys_for_candidate + 1] = key
                allowed[i][key] = true
            end
        end
        for _, kind in ipairs(CANDIDATE_KINDS) do
            if (kind == types.KIND.PLAN) == (candidate.kind == types.KIND.PLAN) then kinds[#kinds + 1] = kind end
        end
        local mapping_properties = {
            key = { type = "string", enum = keys_for_candidate },
            kind = { type = "string", enum = kinds }, cardinality = { type = "string", enum = { "single", "multi" } },
        }
        local mapping_required = { "key", "kind", "cardinality" }
        if type(candidate.value) == "string" then
            mapping_properties.value = { type = "string" }
            mapping_required[#mapping_required + 1] = "value"
        end
        properties[tostring(i)] = { type = "object", additionalProperties = false,
            required = mapping_required, properties = mapping_properties,
        }
        required[#required + 1] = tostring(i)
    end
    local schema = { type = "object", additionalProperties = false, required = { "mappings" }, properties = {
        mappings = { type = "object", additionalProperties = false, properties = properties, required = required },
    } }
    local response, err = llm.structured_output(schema, messages(NORMALIZATION_PROMPT, json.encode({ candidates = candidates, existing_keys = keys, conversation = conversation })), { model = model })
    if err then return nil, model_error("memory normalization", err) end
    local mappings = response and response.result and response.result.mappings
    if type(mappings) ~= "table" then return nil, types.unavailable("memory normalization returned malformed output") end
    local out = {}
    for i, candidate in ipairs(candidates) do
        local mapping = mappings[tostring(i)]
        if type(mapping) ~= "table" then return nil, types.unavailable("memory normalization returned an invalid mapping") end
        if not named[mapping.key] or (type(candidate.value) == "string" and type(mapping.value) ~= "string") then
            return nil, types.unavailable("memory normalization returned an invalid mapping")
        end
        if not allowed[i][mapping.key] or ((mapping.kind == types.KIND.PLAN) ~= (candidate.kind == types.KIND.PLAN)) then
            return nil, types.invalid("memory normalization maps different item kinds")
        end
        if not types.KIND_SET[mapping.kind] or not types.CARDINALITY_SET[mapping.cardinality] then
            return nil, types.unavailable("memory normalization returned an invalid item type")
        end
        local normalized = {}
        for k, v in pairs(candidate) do normalized[k] = v end
        normalized.key = mapping.key
        normalized.kind = mapping.kind
        normalized.cardinality = mapping.cardinality
        if type(candidate.value) == "string" then
            normalized.value = types.trim(mapping.value)
            if normalized.value == "" then return nil, types.unavailable("memory normalization returned an empty value") end
        end
        if known[mapping.key] then
            normalized.cardinality = known[mapping.key].cardinality
        end
        out[i] = normalized
    end
    return out, nil
end

local REFLECTION_MIN_SOURCES = 2

function M.reflect(model: string, items: { any }): (any?, error?)
    local lines: { string } = {}
    local numbers: { integer } = {}
    for index, item in ipairs(items) do
        lines[#lines + 1] = string.format("%d. (%s/%s) %s", index, item.kind, item.key, item.content)
        numbers[index] = index
    end
    local schema = candidate_schema(nil, { types.KIND.LESSON })
    local item_schema = schema.properties.items.items
    item_schema.properties.based_on = { type = "array", items = { type = "integer", enum = numbers }, minItems = REFLECTION_MIN_SOURCES }
    item_schema.required[#item_schema.required + 1] = "based_on"
    local response, err = llm.structured_output(schema, messages(REFLECTION_PROMPT, table.concat(lines, "\n")), { model = model })
    if err then return nil, model_error("memory reflection", err) end
    local candidates, read_err = read_candidates(response, "memory reflection")
    if read_err then return nil, read_err end
    local grounded: { any } = {}
    for _, candidate in ipairs(candidates :: any) do
        local sources: { [integer]: boolean } = {}
        local count = 0
        for _, number in ipairs(type(candidate.based_on) == "table" and candidate.based_on or {}) do
            local n = math.floor(tonumber(number) or 0)
            if items[n] and not sources[n] then sources[n] = true; count = count + 1 end
        end
        if candidate.kind == types.KIND.LESSON and count >= REFLECTION_MIN_SOURCES then grounded[#grounded + 1] = candidate end
    end
    return grounded, nil
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
            target_ids = { type = "array", items = { type = "string", enum = ids } },
            reason = { type = "string" },
        },
    }
    local response, err = llm.structured_output(schema, messages(JUDGE_PROMPT, json.encode({
            new_memory = { kind = candidate.kind, key = candidate.key, content = candidate.content, valid_at = candidate.valid_at,
                stated = candidate.stated }, conversation = candidate.conversation,
            existing_memories = listing,
        })), { model = model })
    if err then return nil, model_error("memory reconcile judge", err) end
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
