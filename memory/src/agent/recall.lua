-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local ctx = require("ctx")
local component = require("component")
local types = require("types")
local context = require("agent_context")
local recall = require("memory_recall")
local prompt = require("agent_prompt")

local M = {}

local RECALL_KINDS = { types.KIND.FACT, types.KIND.SKILL, types.KIND.LESSON, types.KIND.PLAN }

local function recall_query(input: any): string
    local parts: { string } = {}
    if types.trim(input.working_on) ~= "" then parts[#parts + 1] = types.trim(input.working_on) end
    local actions = type(input.recent_actions) == "table" and input.recent_actions or {}
    for i = math.max(1, #actions - 2), #actions do
        local action = actions[i]
        local text = type(action) == "string" and action or (type(action) == "table" and action.content) or ""
        if types.trim(text) ~= "" then parts[#parts + 1] = types.trim(text) end
    end
    return table.concat(parts, "\n")
end

function M.recall(input: any): (any?, error?)
    local args = type(input) == "table" and input or {}
    local component_id, store, store_err = context.memory({}, component.ACCESS.READ)
    if store_err then return nil, store_err end
    local query = recall_query(args)
    if query == "" then return { memories = {} }, nil end
    local cfg = (store :: any).effective
    local constraints = type(args.constraints) == "table" and args.constraints or {}
    local max_items = math.floor(tonumber(constraints.max_items) or cfg.recall_max_items)
    local max_length = math.floor(tonumber(constraints.max_length) or cfg.recall_max_length)
    local exclude: { [string]: boolean } = {}
    for _, id in ipairs(type(args.previous_memories) == "table" and args.previous_memories or {}) do exclude[tostring(id)] = true end
    local snapshot, snapshot_err = prompt.snapshot({})
    if snapshot_err then return nil, snapshot_err end
    if snapshot then
        for _, id in ipairs(snapshot.pinned_ids) do exclude[id] = true end
    end
    local agent_id = types.trim(ctx.get("agent_id"))
    local scopes, scopes_err = recall.visible_scopes(agent_id)
    if scopes_err then return nil, scopes_err end
    local rows, err = recall.search({
        component_id = component_id :: string, query = query, limit = max_items, kinds = RECALL_KINDS,
        scopes = scopes :: { string }, exclude = exclude,
    })
    if err then return nil, err end
    local memories: { any } = {}
    local used = 0
    for _, row in ipairs(rows :: any) do
        local content = types.render_content(row)
        if used + #content > max_length then break end
        used = used + #content
        memories[#memories + 1] = {
            id = row.id,
            content = content,
            metadata = { type = row.kind, source = types.SOURCE, created_at = row.recorded_at, valid_at = row.valid_at },
        }
    end
    return { memories = memories }, nil
end

return M
