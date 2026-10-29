-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local json = require("json")
local uuid = require("uuid")
local types = require("types")
local evidence_policy = require("evidence_policy")
local prompts = require("model_prompts")
local schema_util = require("model_schema")
local model_calls = require("model_calls")

local M = {}

local CANDIDATE_KINDS = types.MEMORY_KINDS
local CANDIDATE_KIND_SET = {}
for _, kind in ipairs(CANDIDATE_KINDS) do CANDIDATE_KIND_SET[kind] = true end

M.is_statement = evidence_policy.is_statement
M.scope_family = evidence_policy.scope_family
M.conversation = evidence_policy.conversation

local function extraction_evidence(span: { any }, agent_id: string?): ({ string }?, string?, error?)
    local ids: { string } = {}
    local evidence = nil
    for _, message in ipairs(span) do
        if M.is_statement(message, agent_id) then
            local kind = message.author.kind == "document" and "document" or "conversation"
            if evidence and evidence ~= kind then
                return nil, nil, types.invalid("memory extraction does not accept mixed document and conversation evidence")
            end
            evidence = kind
            ids[#ids + 1] = message.id
        end
    end
    return ids, evidence or "conversation", nil
end

function M.extraction_capacity(model: string, span: { any }?, agent_id: string?): (integer?, error?)
    local limit, limit_err = schema_util.output_limit(model)
    if limit_err then return nil, limit_err end
    local ids, evidence, evidence_err = extraction_evidence(span or {}, agent_id)
    if evidence_err then return nil, evidence_err end
    if #ids == 0 then ids[1] = uuid.v7() end
    local count = 0
    -- Capacity uses typical compact ASCII output so 8,192-token models remain usable;
    -- call budgets cover the four-byte bound up to the model card limit.
    while true do
        local size, size_err = schema_util.schema_bytes(schema_util.extraction_schema(ids, count + 1, evidence), 1)
        if size_err then return nil, size_err end
        if (size :: integer) > (limit :: integer) then break end
        count = count + 1
    end
    if count == 0 then
        return nil, types.invalid("memory extraction model " .. model .. " output limit cannot hold one statement")
    end
    return count, nil
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

local function canonicalize_keys(items: { any }?)
    if type(items) ~= "table" then return end
    for _, item in ipairs(items) do
        if type(item) == "table" and type(item.key) == "string" then item.key = types.normalize_key(item.key) end
    end
end

local function read_candidates(response: any, step: string, event_ids: { [string]: boolean }?, keys: { any }?, evidence_scopes: any?): (any?, error?, { [string]: integer }?)
    local data = response.result
    local known = {}
    for _, row in ipairs(keys or {}) do known[(row.scope_family and (row.scope_family .. ":") or "") .. row.key] = row end
    local out = {}
    local rejected: { [string]: integer } = {}
    local function read(collection: any, plans: boolean): error?
        for _, item in ipairs(collection) do
            local reason = candidate_reason(item)
            local reject = false
            local existing = nil
            if not reason then
                local family = evidence_scopes and M.scope_family(item, evidence_scopes.authors[item.event_id], evidence_scopes.owner_id)
                local known_key = (family and (family .. ":") or "") .. item.key
                existing = known[known_key]
            end
            if existing then
                if not types.compatible_kinds(existing.kind, item.kind) then reason = "kind"
                else item.cardinality = existing.cardinality end
            end
            if not reason and step == "extraction" then
                if (item.kind == types.KIND.PLAN) ~= plans then reason = "kind"
                elseif not event_ids[item.event_id] then reason = "evidence" end
                local author = evidence_scopes.authors[item.event_id]
                if not reason and type(author) == "table" and author.kind == "document" and item.kind ~= types.KIND.FACT then
                    rejected.kind = (rejected.kind or 0) + 1
                    reject = true
                end
                if not reason and not reject and (item.kind == types.KIND.PROFILE_SLOT or item.kind == types.KIND.PREFERENCE or item.kind == types.KIND.PLAN)
                    and M.scope_family(item, evidence_scopes.authors[item.event_id], evidence_scopes.owner_id) ~= types.SCOPE.OWNER then
                    rejected.kind = (rejected.kind or 0) + 1
                    reject = true
                end
            elseif not reason and step == "reflection" and item.kind ~= types.KIND.LESSON then reason = "kind" end
            if reason then return model_calls.invalid(step, reason, data) end
            if not reject then out[#out + 1] = item end
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
    return out, nil, rejected
end

local function key_listing(keys: { any }): (string?, error?)
    local lines: { string } = {}
    local kind, family, names = nil, nil, {}
    local function flush()
        if kind then lines[#lines + 1] = "- " .. kind .. ": " .. table.concat(names, ", ") end
    end
    for _, row in ipairs(keys) do
        if row.kind ~= kind or row.scope_family ~= family then flush(); kind, family, names = row.kind, row.scope_family, {} end
        local description = row.key .. " (" .. tostring(row.cardinality) .. ")"
        if family then description = description .. " [" .. family .. " scope]" end
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

function M.extract(request: any): (any?, error?, { [string]: integer }?)
    local model = request.model
    local span = request.span or {}
    local keys = request.keys or {}
    local instructions = request.instructions
    local context = request.context
    local isolated = request.isolated
    local owner_id = request.owner_id
    local agent_id = request.agent_id
    local ids, evidence, evidence_err = extraction_evidence(span, agent_id)
    if evidence_err then return nil, evidence_err end
    if #ids == 0 then return {}, nil end
    local allowed = {}
    for _, id in ipairs(ids) do allowed[id] = true end
    local system = evidence == "document" and prompts.DOCUMENT_EXTRACTION_PROMPT
        or (isolated and prompts.ISOLATED_EXTRACTION_PROMPT or prompts.EXTRACTION_PROMPT)
    if #keys > 0 then
        local listing, listing_err = key_listing(keys)
        if listing_err then return nil, listing_err end
        system = system .. "\n\nKinds and keys already in use; an item about one of these attributes reuses its kind and key:\n" .. (listing :: string)
    end
    system = prompts.with_policy(system, instructions)
    local conversation = M.conversation(span, context, agent_id)
    local schema = schema_util.extraction_schema(ids, #ids, evidence, keys)
    local data, call_err = model_calls.structured("extraction", schema, system .. prompts.JSON_FORMAT, conversation, model)
    if call_err then return nil, call_err end
    canonicalize_keys(data.items)
    canonicalize_keys(data.lessons)
    canonicalize_keys(data.plans)
    data, call_err = model_calls.validate("extraction", schema, data)
    if call_err then return nil, call_err end
    local response = { result = data }
    local evidence_scopes = {authors = {}, owner_id = owner_id}
    for _, message in ipairs(span) do evidence_scopes.authors[message.id] = message.author end
    local candidates, read_err, rejected = read_candidates(response, "extraction", allowed, keys, evidence_scopes)
    if read_err then return nil, read_err end
    return candidates, nil, rejected
end

-- A typed value or a lesson maps to exactly one topic; a scalar attribute may
-- split into independent parts.
local function single_part(candidate: any): boolean
    return type(candidate.value) ~= "string" or candidate.kind == types.KIND.LESSON
end

function M.normalize(model: string, candidates: { any }, keys: { any }, conversation: string?, instructions: string?): (any?, error?)
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
            key = schema_util.compatible_topic(candidate.kind, keys), kind = schema_util.enum_string(kinds),
            cardinality = schema_util.enum_string(lesson and { "multi" } or { "single", "multi" }),
        }
        local mapping_required = { "key", "kind", "cardinality" }
        local mappings: any = { type = "array", minItems = 1, maxItems = single_part(candidate) and 1 or schema_util.LIMITS.parts }
        if type(candidate.value) == "string" then
            mapping_properties.value = schema_util.bounded_string(schema_util.LIMITS.value, 1)
            mapping_properties.content = schema_util.bounded_string(schema_util.LIMITS.content, 1)
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
    local payload, encode_err = json.encode({ candidates = candidates, existing_keys = keys, conversation = conversation })
    if encode_err then return nil, types.internal("memory normalization input encode failed", { cause = tostring(encode_err) }) end
    local data, call_err = model_calls.structured("normalization", schema, prompts.with_policy(prompts.NORMALIZATION_PROMPT, instructions) .. prompts.JSON_FORMAT, payload, model)
    if call_err then return nil, call_err end
    if type(data.mappings) == "table" then
        for _, parts in pairs(data.mappings) do canonicalize_keys(parts) end
    end
    data, call_err = model_calls.validate("normalization", schema, data)
    if call_err then return nil, call_err end
    local mappings = data.mappings
    local out = {}
    for i, candidate in ipairs(candidates) do
        local parts = mappings[tostring(i)]
        if #parts == 0 or (single_part(candidate) and #parts ~= 1) then
            return nil, model_calls.invalid("normalization", "mapping", data)
        end
        for _, mapping in ipairs(parts) do
            local reason = nil
            local normalized = {}
            for k, v in pairs(candidate) do normalized[k] = v end
            if type(mapping) ~= "table" or type(mapping.key) ~= "string"
                or not types.CARDINALITY_SET[mapping.cardinality] then reason = "shape"
            else
                local existing = known[mapping.key]
                normalized.kind = mapping.kind
                normalized.key = mapping.key
                normalized.cardinality = existing and existing.cardinality or mapping.cardinality
                if type(candidate.value) == "string" then
                    normalized.value = mapping.value
                    normalized.content = mapping.content
                end
                reason = candidate_reason(normalized, type(candidate.value) ~= "string")
                if not reason and (not types.compatible_kinds(mapping.kind, candidate.kind)
                    or (existing and not types.compatible_kinds(existing.kind, mapping.kind))) then reason = "kind" end
            end
            if reason then return nil, model_calls.invalid("normalization", reason, data) end
            normalized.content = types.trim(normalized.content)
            if type(normalized.value) == "string" then normalized.value = types.trim(normalized.value) end
            out[#out + 1] = normalized
        end
    end
    return out, nil
end

function M.reflect(request: any): (any?, error?)
    local model = request.model
    local items = request.items or {}
    local instructions = request.instructions
    if #items < schema_util.REFLECTION_MIN_SOURCES then return {}, nil end
    local lines: { string } = {}
    local numbers: { integer } = {}
    for index, item in ipairs(items) do
        lines[#lines + 1] = string.format("%d. (%s/%s) %s", index, item.kind, item.key, item.content)
        numbers[index] = index
    end
    local schema = schema_util.reflection_schema(numbers, math.min(schema_util.LIMITS.lessons, math.floor(#items / schema_util.REFLECTION_MIN_SOURCES)))
    local system = prompts.with_policy(prompts.REFLECTION_PROMPT, instructions)
    local data, call_err = model_calls.structured("reflection", schema, system .. prompts.JSON_FORMAT, table.concat(lines, "\n"), model)
    if call_err then return nil, call_err end
    canonicalize_keys(data.items)
    data, call_err = model_calls.validate("reflection", schema, data)
    if call_err then return nil, call_err end
    local candidates, read_err = read_candidates({ result = data }, "reflection", nil, nil)
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
        if valid and #source_ids >= schema_util.REFLECTION_MIN_SOURCES then
            candidate.source_ids = source_ids
            grounded[#grounded + 1] = candidate
        else return nil, model_calls.invalid("reflection", "grounding", data) end
    end
    return M.normalize(model, grounded, items, nil, instructions)
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
        properties[number] = schema_util.enum_string(types.compatible_kinds(candidate.kind, item.kind) and allowed or { "unrelated" })
        listing[number] = { id = item.id, kind = item.kind, key = item.key, cardinality = item.cardinality,
            value = item.value, content = item.content, valid_at = item.valid_at }
    end
    local schema = {
        type = "object",
        additionalProperties = false,
        required = { "relations", "reason" },
        properties = {
            relations = { type = "object", additionalProperties = false, required = required, properties = properties },
            reason = schema_util.bounded_string(schema_util.LIMITS.reason),
        },
    }
    local payload, encode_err = json.encode({
        new_memory = { kind = candidate.kind, key = candidate.key, cardinality = candidate.cardinality, value = candidate.value,
            content = candidate.content, valid_at = candidate.valid_at, stated = candidate.stated },
        conversation = candidate.conversation, existing_memories = listing,
    })
    if encode_err then return nil, types.internal("memory reconcile judge input encode failed", { cause = tostring(encode_err) }) end
    local data, call_err = model_calls.structured("reconcile judge", schema, prompts.JUDGE_PROMPT .. prompts.JSON_FORMAT, payload, model)
    if call_err then return nil, call_err end
    data, call_err = model_calls.validate("reconcile judge", schema, data)
    if call_err then return nil, call_err end
    local relations = data.relations
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
    return model_calls.embed(model, texts)
end

function M.working_summary(model: string, text: string, max_tokens: integer): (string?, any?, error?)
    return model_calls.summary(model, prompts.WORKING_SUMMARY_PROMPT, text, max_tokens)
end

return M
