-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Model calls of the memory engine: candidate extraction from a captured span,
-- the closed-set reconcile judge, reflection over stored items, vectors, and
-- the working summary a checkpoint hands back to its host. Every failure is a
-- typed error that keeps a transient provider's kind and records a
-- deterministic provider failure as an internal memory failure; malformed
-- model output is never read as "nothing to remember".

local llm = require("llm")
local json = require("json")
local types = require("types")
local error_envelope = require("error_envelope")

local M = {}

-- A model request is an implementation detail of memory. Only transient provider
-- failures remain retryable in the provider's vocabulary; every other provider
-- failure is an internal memory failure that retains its diagnostic cause.
local TRANSIENT_KINDS = {
    [errors.UNAVAILABLE] = true,
    [errors.TIMEOUT] = true,
    [errors.RATE_LIMITED] = true,
}

local function model_error(step: string, err: any): error
    local message = step .. " failed: " .. tostring(err)
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

-- Span roles that state something: memories cite one of these messages.
-- Assistant text is context only and is shown without an id.
local STATEMENT_ROLES = { user = true, tool = true, document = true }

local EXTRACTION_PROMPT = [[You extract durable memory about the user from a conversation span.

Keep only what the user states about themselves, their work and their world that will
still matter in a later conversation: facts, preferences, decisions, corrections, and
outcomes of finished work. A correction is a new item with the corrected value.

Each item must be stated in the message it cites, in the user's own words. Skip:
- requests, questions and instructions to the assistant ("find me...", "where do I live?",
  "one trip idea please"): asking states nothing about the user; a request that also states
  something durable ("find a quiet hotel, I can't sleep with noise") keeps only that part;
- the current task's chatter: options picked, things to check later, scheduling of the
  work at hand;
- statements too vague to act on later ("I've traveled before", "I forgot where I was");
- greetings, thanks, acknowledgements and small talk;
- the assistant's suggestions, answers and narration, raw tool output, and anything inside
  recalled-memory notes - none of these is the user stating anything.

Each item has:
- kind: fact | preference | profile_slot | skill | lesson
  (profile_slot = a stable single-valued attribute such as name, home city, employer, role,
  diet, timezone)
- key: a short stable topic, e.g. "home_city", "preferred_language", "employer"
- cardinality: "single" when the person holds one value at a time (name, home city, diet,
  employer, birth date), "multi" when several hold together (allergies, children, pets)
- value: the value only, e.g. "Berlin"
- content: one self-contained sentence in the third person about the user
- event_id: the id of the user, tool or document message that states it
- valid_at: when it became true if the span says so (RFC3339), else ""
- confidence: 0..1

Return {"items": []} when nothing durable is stated.]]

local JUDGE_PROMPT = [[You reconcile one new memory against existing memories of the same person.

Choose exactly one action:
- ADD: the new memory is about something none of the existing memories cover.
- NOOP: an existing memory already says the same thing, even under another kind or key.
- SUPERSEDE: the new memory updates or corrects existing memories about the same thing. A
  statement that something changed ("I moved", "now", "since", "no longer", "actually") is
  an update.
- MERGE: the new memory and existing memories are the same memory phrased differently and the new one is the most complete.
- CONFLICT: the new memory contradicts existing memories and nothing says which is right:
  the person says they are unsure, or two sources disagree.

new_memory.stated, when present, is what the person said; it tells an update from a contradiction.
target_ids lists the existing memory ids the action applies to (empty for ADD).
Use only ids from the list. Decide only the relationship; do not judge which value is newer.]]

local REFLECTION_PROMPT = [[You review a person's numbered memories and derive lessons: concrete
ways to help this person that no single memory says. A lesson combines at least two
memories into guidance for acting, e.g. memories "the dog hates long car rides" and "always
travels with the dog" give "propose rail routes that allow dogs and avoid long car
transfers".

Never restate, rephrase or summarise one memory ("as the user is vegan, plan vegan food"),
never repeat a profile attribute, and never guess beyond what the memories say. Most
memory sets support no lesson; return {"items": []} then.

Each lesson has kind "lesson", key (a short stable topic), cardinality "multi", value (the
guidance in a few words), content (one sentence of guidance), based_on (the numbers of the memories it draws
on, at least two), event_id "", valid_at "", confidence.]]

local WORKING_SUMMARY_PROMPT = [[Summarize the conversation so far as working state for continuing it:
goals, decisions, open questions, constraints and the next step. Be compact and factual.]]

local function messages(system: string, user: string): { any }
    return {
        { role = "system", content = { { type = "text", text = system } } },
        { role = "user", content = { { type = "text", text = user } } },
    }
end

-- Kinds a model may propose; identity and rules are set by people.
local CANDIDATE_KINDS = { types.KIND.FACT, types.KIND.PREFERENCE, types.KIND.PROFILE_SLOT, types.KIND.SKILL, types.KIND.LESSON }

local function candidate_schema(event_ids: { string }?, kinds: { string }?): any
    local event_id: any = { type = "string" }
    if event_ids then event_id = { type = "string", enum = event_ids } end
    return {
        type = "object",
        additionalProperties = false,
        required = { "items" },
        properties = {
            items = {
                type = "array",
                items = {
                    type = "object",
                    additionalProperties = false,
                    required = { "kind", "key", "cardinality", "value", "content", "event_id", "valid_at", "confidence" },
                    properties = {
                        kind = { type = "string", enum = kinds or CANDIDATE_KINDS },
                        key = { type = "string" },
                        cardinality = { type = "string", enum = { types.CARDINALITY.SINGLE, types.CARDINALITY.MULTI } },
                        value = { type = "string" },
                        content = { type = "string" },
                        event_id = event_id,
                        valid_at = { type = "string" },
                        confidence = { type = "number" },
                    },
                },
            },
        },
    }
end

local function read_candidates(response: any, step: string): (any?, error?)
    local data = response and response.result
    if type(data) ~= "table" or type(data.items) ~= "table" then
        return nil, types.unavailable(step .. " returned malformed output")
    end
    local out: { any } = {}
    for index, item in ipairs(data.items) do
        if type(item) ~= "table" or not types.KIND_SET[item.kind] or types.trim(item.key) == ""
            or types.trim(item.content) == "" or not types.CARDINALITY_SET[item.cardinality] then
            return nil, types.unavailable(step .. " returned a malformed item at " .. tostring(index))
        end
        out[#out + 1] = item
    end
    return out, nil
end

-- Lists the keys a person's memories already use, grouped by kind.
local function key_listing(keys: { any }): string
    local lines: { string } = {}
    local kind, names = nil, {}
    local function flush()
        if kind then lines[#lines + 1] = "- " .. kind .. ": " .. table.concat(names, ", ") end
    end
    for _, row in ipairs(keys) do
        if row.kind ~= kind then flush(); kind, names = row.kind, {} end
        names[#names + 1] = row.key .. " (" .. tostring(row.cardinality) .. ")"
    end
    flush()
    return table.concat(lines, "\n")
end

-- span: { { id, role, text, created_at } }; keys: the { kind, key } pairs the
-- person's memories use. A span in which nobody states anything yields no
-- candidates without a model call.
function M.extract(model: string, span: { any }, keys: { any }, instructions: string?): (any?, error?)
    local lines: { string } = {}
    local ids: { string } = {}
    for _, message in ipairs(span) do
        if STATEMENT_ROLES[message.role] then
            ids[#ids + 1] = message.id
            lines[#lines + 1] = string.format("[%s][%s][%s] %s", message.id, message.created_at or "", message.role, message.text)
        else
            -- Context lines carry no id: nothing can cite them.
            lines[#lines + 1] = string.format("(%s, context only) %s", message.role, message.text)
        end
    end
    if #ids == 0 then return {}, nil end
    local system = EXTRACTION_PROMPT
    if #keys > 0 then
        system = system .. "\n\nKinds and keys already in use for this person; an item about one of these attributes reuses its kind and key:\n" .. key_listing(keys)
    end
    if instructions and instructions ~= "" then system = system .. "\n\nMemory policy:\n" .. instructions end
    local response, err = llm.structured_output(candidate_schema(ids), messages(system, table.concat(lines, "\n")), { model = model })
    if err then return nil, model_error("memory extraction", err) end
    return read_candidates(response, "memory extraction")
end

-- items: { { id, kind, key, content } }
-- Reflection may only propose lessons, each drawing on at least two of the
-- listed memories; a lesson that leans on one memory restates it and is dropped
-- here, whatever the model says.
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

-- Returns { action, target_ids } over the stable ids of `neighbors`, choosing
-- among `actions`.
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
                stated = candidate.stated },
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
