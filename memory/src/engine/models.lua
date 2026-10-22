-- Model calls of the memory engine: candidate extraction from a captured span,
-- the closed-set reconcile judge, reflection over stored items, vectors, and
-- the working summary a checkpoint hands back to its host. Every failure is a
-- typed error; malformed model output is never read as "nothing to remember".

local llm = require("llm")
local json = require("json")
local types = require("types")
local model_failure = require("model_failure")

local M = {}

-- Span roles that state something: memories cite one of these messages.
-- Assistant text is context only.
local STATEMENT_ROLES = { user = true, tool = true, document = true }

local EXTRACTION_PROMPT = [[You extract durable memory about the user from a conversation span.

Keep only what the user states or confirms about themselves, their work and their world:
facts, preferences, decisions, corrections, and outcomes of finished work. A correction is
a new item with the corrected value. Skip greetings, chit-chat, questions without an
answer, the assistant's suggestions and narration, raw tool output, and anything inside
recalled-memory notes.

Each item has:
- kind: fact | preference | profile_slot | skill | lesson
  (profile_slot = a stable attribute such as name, location, employer, role, timezone)
- key: a short stable topic, e.g. "home_city", "preferred_language", "employer"
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
- SUPERSEDE: the new memory updates or corrects existing memories about the same thing.
- MERGE: the new memory and existing memories are the same memory phrased differently and the new one is the most complete.
- CONFLICT: the new memory contradicts existing memories and the conversation does not say which is right.

new_memory.stated, when present, is what the person said; it tells an update from a contradiction.
target_ids lists the existing memory ids the action applies to (empty for ADD).
Use only ids from the list. Decide only the relationship; do not judge which value is newer.]]

local REFLECTION_PROMPT = [[You consolidate a person's memories. From the current memories, derive
stable profile attributes (kind profile_slot) and lessons about how to help this person
(kind lesson) that are not already stated. Use only what the memories support. Each item
has kind, key, value, content (one third-person sentence), event_id (use ""), valid_at
(use ""), confidence. Return {"items": []} when nothing new follows.]]

local WORKING_SUMMARY_PROMPT = [[Summarize the conversation so far as working state for continuing it:
goals, decisions, open questions, constraints and the next step. Be compact and factual.]]

-- Typed model errors keep their kind and retry flag; the llm library also
-- answers some failures as plain strings, which carry no classification and are
-- reported as retryable unavailability so a bounded job retries them.
local function wrap(step: string, err: any): error
    if type(err) == "userdata" then return model_failure.wrap(step, err) end
    return types.failed(step .. " failed", err)
end

local function messages(system: string, user: string): { any }
    return {
        { role = "system", content = { { type = "text", text = system } } },
        { role = "user", content = { { type = "text", text = user } } },
    }
end

-- Kinds a model may propose; identity and rules are set by people.
local CANDIDATE_KINDS = { types.KIND.FACT, types.KIND.PREFERENCE, types.KIND.PROFILE_SLOT, types.KIND.SKILL, types.KIND.LESSON }

local function candidate_schema(event_ids: { string }?): any
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
                    required = { "kind", "key", "value", "content", "event_id", "valid_at", "confidence" },
                    properties = {
                        kind = { type = "string", enum = CANDIDATE_KINDS },
                        key = { type = "string" },
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
            or types.trim(item.content) == "" then
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
        names[#names + 1] = row.key
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
        if STATEMENT_ROLES[message.role] then ids[#ids + 1] = message.id end
        lines[#lines + 1] = string.format("[%s][%s][%s] %s", message.id, message.created_at or "", message.role, message.text)
    end
    if #ids == 0 then return {}, nil end
    local system = EXTRACTION_PROMPT
    if #keys > 0 then
        system = system .. "\n\nKinds and keys already in use for this person; an item about one of these attributes reuses its kind and key:\n" .. key_listing(keys)
    end
    if instructions and instructions ~= "" then system = system .. "\n\nMemory policy:\n" .. instructions end
    local response, err = llm.structured_output(candidate_schema(ids), messages(system, table.concat(lines, "\n")), { model = model })
    if err then return nil, wrap("memory extraction", err) end
    return read_candidates(response, "memory extraction")
end

-- items: { { id, kind, key, content } }
function M.reflect(model: string, items: { any }): (any?, error?)
    local lines: { string } = {}
    for _, item in ipairs(items) do
        lines[#lines + 1] = string.format("- (%s/%s) %s", item.kind, item.key, item.content)
    end
    local response, err = llm.structured_output(candidate_schema(nil), messages(REFLECTION_PROMPT, table.concat(lines, "\n")), { model = model })
    if err then return nil, wrap("memory reflection", err) end
    return read_candidates(response, "memory reflection")
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
    if err then return nil, wrap("memory reconcile judge", err) end
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
    if err then return nil, wrap("memory embedding", err) end
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
    if err then return nil, nil, wrap("working summary", err) end
    if not response or response.finish_reason ~= "stop" or type(response.result) ~= "string" or types.trim(response.result) == "" then
        return nil, nil, types.unavailable("working summary did not complete")
    end
    return types.trim(response.result), response.tokens, nil
end

return M
