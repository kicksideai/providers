-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local ctx = require("ctx")
local component = require("component")
local types = require("types")
local context = require("agent_context")
local history = require("agent_history")
local items = require("memory_items")
local models = require("memory_models")
local writer = require("memory_writer")
local ops = require("memory_ops")
local recall = require("memory_recall")
local reconcile = require("memory_reconcile")

local M = {}

local SEARCH_MAX = 50

local function tool_error(err: any): any
    return { success = false, error = tostring(err) }
end

local function writable(): (string?, any?, any?)
    if context.setting({}, "write_enabled") == false then return nil, nil, tool_error("this agent's memory is read-only") end
    local memory_id, store, err = context.memory({}, component.ACCESS.WRITE)
    if err then return nil, nil, tool_error(err) end
    return memory_id, store, nil
end

function M.remember(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    local content = types.trim(input.content)
    if content == "" then return tool_error("content is required"), nil end
    local kind = types.trim(input.kind)
    if kind == "" then kind = types.KIND.FACT end
    if not types.KIND_SET[kind] or kind == types.KIND.IDENTITY or kind == types.KIND.RULE then
        return tool_error("kind must be one of " .. table.concat(types.MEMORY_KINDS, ", ")), nil
    end
    local cardinality = types.trim(input.cardinality)
    if cardinality ~= "" and not types.CARDINALITY_SET[cardinality] then return tool_error("cardinality must be single or multi"), nil end
    local memory_id, store, refusal = writable()
    if refusal then return refusal, nil end
    local owner = types.actor_id()
    if owner == "" then return tool_error("remember requires a signed-in user"), nil end
    local value = input.value
    if value == nil then return tool_error("value is required"), nil end
    local key, key_err = types.topic_key(input.key, content, value)
    if key_err then return tool_error(key_err), nil end
    local idempotency, hash_err = types.digest({ "tool.remember", owner, key, value, content })
    if hash_err then return nil, hash_err end
    local run = ctx.get("agent_run")
    local host_kind, host_id = context.host_ref(type(run) == "table" and run.host or nil)
    local statement, statement_err = history.latest_statement(run)
    if statement_err then return nil, statement_err end
    local written, write_err = writer.write(memory_id :: string, idempotency :: string, {
        source = types.ITEM_SOURCE.TOOL, actor = owner, keyed_by_head = true,
    }, function(d: any): (any?, error?)
        local keys, keys_err = items.keys(memory_id :: string, types.scope_key(types.SCOPE.OWNER, owner), 200)
        if keys_err then return nil, keys_err end
        local candidates, normalize_err = models.normalize((store :: any).effective.judge_model, {
            { kind = kind, key = key, cardinality = cardinality ~= "" and cardinality or nil, value = value, content = content,
                valid_at = input.valid_at or (statement and statement.created_at), event_id = statement and statement.id, confidence = 1 },
        }, keys :: any, statement and statement.text)
        if normalize_err then return nil, normalize_err end
        local err = reconcile.decide(d, candidates :: any, {
            embedding_model = (store :: any).embedding_model, judge_model = (store :: any).effective.judge_model,
            scope_family = types.SCOPE.OWNER, scope_id = owner, explicit = true,
            host_kind = host_kind ~= "" and host_kind or nil, host_id = host_id,
        })
        return nil, err
    end)
    if write_err then return nil, write_err end
    return { success = true, memory_id = memory_id, item_ids = (written :: any).item_ids, outcome = (written :: any).stats }, nil
end

function M.forget(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    local key = types.trim(input.key)
    if key == "" then return tool_error("key is required"), nil end
    local memory_id, _, refusal = writable()
    if refusal then return refusal, nil end
    if types.actor_id() == "" then return tool_error("forget requires a signed-in user"), nil end
    local forgotten, forget_err = ops.forget_key(memory_id :: string, key, input.value)
    if forget_err then
        if forget_err:kind() == errors.INVALID or forget_err:kind() == errors.NOT_FOUND then
            return tool_error(forget_err:message()), nil
        end
        return nil, forget_err
    end
    return { success = true, memory_id = memory_id, key = key, forgotten = (forgotten :: any).forgotten }, nil
end

function M.search(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    if context.setting({}, "read_enabled") == false then
        return tool_error("memory search is disabled for this agent"), nil
    end
    local query = types.trim(input.query)
    if query == "" then return tool_error("query is required"), nil end
    local limit = math.floor(tonumber(input.limit) or tonumber(context.setting({}, "recall_limit")) or 5)
    if limit < 1 or limit > SEARCH_MAX then return tool_error("limit must be between 1 and " .. SEARCH_MAX), nil end
    local offset = math.floor(tonumber(input.cursor) or 0)
    if offset < 0 then return tool_error("cursor is invalid"), nil end
    local memory_id, _, err = context.memory({}, component.ACCESS.READ)
    if err then return tool_error(err), nil end
    local scopes = recall.visible_scopes(ctx.get("agent_id"))
    local rows, search_err = recall.search({
        component_id = memory_id :: string, query = query, limit = offset + limit + 1,
        scopes = scopes,
    })
    if search_err then return nil, search_err end
    local page: { any } = {}
    for i = offset + 1, math.min(offset + limit, #(rows :: any)) do
        local row = (rows :: any)[i]
        local out: { [string]: any } = {
            id = row.id, kind = row.kind, key = row.key, value = row.value,
            content = row.content, valid_at = row.valid_at, recorded_at = row.recorded_at,
            score = row.similarity, source = row.source,
        }
        page[#page + 1] = out
    end
    local contested, contested_err = recall.search({
        component_id = memory_id :: string, query = query, limit = offset + limit + 1, group_by = "conflict_group",
        scopes = scopes, statuses = { types.STATUS.CONFLICT },
    })
    if contested_err then return nil, contested_err end
    local group_ids: { string } = {}
    for _, row in ipairs(contested :: any) do group_ids[#group_ids + 1] = row.id end
    local page_groups: { string } = {}
    for i = offset + 1, math.min(offset + limit, #group_ids) do page_groups[#page_groups + 1] = group_ids[i] end
    local members, members_err = items.group_members(memory_id :: string, page_groups, scopes)
    if members_err then return nil, members_err end
    local groups: { [string]: any } = {}
    local alternatives: { any } = {}
    for _, group_id in ipairs(page_groups) do
        local group = { group_id = group_id, status = "unresolved", options = {} }
        groups[group_id] = group
        alternatives[#alternatives + 1] = group
    end
    for _, row in ipairs(members :: any) do
        local group = groups[row.conflict_group]
        if group then
            group.options[#group.options + 1] = { id = row.id, kind = row.kind, key = row.key, value = row.value,
                content = row.content, valid_at = row.valid_at, recorded_at = row.recorded_at, source = row.source }
        end
    end
    local result: { [string]: any } = {
        success = true, query = query, count = #page, items = page, alternatives = alternatives,
        note = "Memory is derived from prior conversations and may be incomplete or out of date. Alternatives are " ..
            "unresolved: the person has said contradicting things; ask before relying on either.",
    }
    if #(rows :: any) > offset + limit or #group_ids > offset + limit then result.next_cursor = tostring(offset + limit) end
    return result, nil
end

return M
