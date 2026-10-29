-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local types = require("types")
local stores = require("memory_stores")
local items = require("memory_items")
local models = require("memory_models")

local M = {}

function M.visible_scopes(agent_id: string?): ({ string }?, error?)
    local scopes: { string } = {}
    local actor_id, actor_err = types.human_id()
    if actor_err then return nil, actor_err end
    if actor_id then scopes[#scopes + 1] = types.scope_key(types.SCOPE.OWNER, actor_id) end
    local agent = types.trim(agent_id)
    if agent ~= "" then scopes[#scopes + 1] = types.scope_key(types.SCOPE.AGENT, agent) end
    return scopes, nil
end

type SearchRequest = {
    group_by: string?,
    component_id: string,
    query: string,
    limit: integer,
    kinds: { string }?,
    scopes: { string },
    exclude: { [string]: boolean }?,
    statuses: { string }?,
}

function M.search(req: SearchRequest): (any?, error?)
    if #req.scopes == 0 then return {}, nil end
    local store, store_err = stores.get(req.component_id)
    if store_err then return nil, store_err end
    local vectors, embed_err = models.embed((store :: any).embedding_model, { req.query })
    if embed_err then return nil, embed_err end
    local exclude = req.exclude or {}
    local excluded = 0
    for _ in pairs(exclude) do excluded = excluded + 1 end
    local rows, err = items.search(req.component_id, (vectors :: any)[1], {
        kinds = req.kinds, statuses = req.statuses or { types.STATUS.CURRENT }, scope_keys = req.scopes,
        query_text = req.query, limit = req.limit + excluded, group_by = req.group_by,
    })
    if err then return nil, err end
    local out: { any } = {}
    for _, row in ipairs(rows :: any) do
        if not exclude[row.id] and #out < req.limit then out[#out + 1] = row end
    end
    return out, nil
end

return M
