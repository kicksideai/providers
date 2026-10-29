-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local ctx = require("ctx")
local component = require("component")
local types = require("types")
local context = require("agent_context")
local items = require("memory_items")
local ops = require("memory_ops")
local recall = require("memory_recall")

local M = {}

local SEARCH_MAX = 50

local function tool_error(err: any, code: string?): any
    return { success = false, error = tostring(err), code = code }
end

function M.forget(args: any): (any?, error?)
    local input = type(args) == "table" and args or {}
    local key = types.trim(input.key)
    if key == "" then return tool_error("key is required"), nil end
    local memory_id, _, memory_err = context.memory({}, component.ACCESS.WRITE)
    if memory_err then return tool_error(memory_err), nil end
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
    local query = types.trim(input.query)
    if query == "" then return tool_error("query is required"), nil end
    local memory_id, store, err = context.memory({}, component.ACCESS.READ)
    if err then return tool_error(err), nil end
    local limit = math.floor(tonumber(input.limit) or (store :: any).effective.recall_max_items)
    if limit < 1 or limit > SEARCH_MAX then return tool_error("limit must be between 1 and " .. SEARCH_MAX), nil end
    local offset = 0
    if input.cursor ~= nil then
        local parsed = tonumber(input.cursor)
        if not parsed or parsed < 0 or math.floor(parsed) ~= parsed then return tool_error("cursor is invalid", "invalid_input"), nil end
        offset = math.floor(parsed)
    end
    local scopes, scopes_err = recall.visible_scopes(ctx.get("agent_id"))
    if scopes_err then return nil, scopes_err end
    local rows, search_err = recall.search({
        component_id = memory_id :: string, query = query, limit = offset + limit + 1,
        scopes = scopes :: { string },
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
        scopes = scopes :: { string }, statuses = { types.STATUS.CONFLICT },
    })
    if contested_err then return nil, contested_err end
    local group_ids: { string } = {}
    for _, row in ipairs(contested :: any) do group_ids[#group_ids + 1] = row.id end
    local page_groups: { string } = {}
    for i = offset + 1, math.min(offset + limit, #group_ids) do page_groups[#page_groups + 1] = group_ids[i] end
    local members, members_err = items.group_members(memory_id :: string, page_groups, scopes :: { string })
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
        note = "Alternatives are unresolved: the person has said contradicting things; ask before relying on either.",
    }
    if #(rows :: any) > offset + limit or #group_ids > offset + limit then result.next_cursor = tostring(offset + limit) end
    return result, nil
end

return M
