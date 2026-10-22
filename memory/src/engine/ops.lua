-- Explicit operations on a memory by a person with WRITE access: add or edit
-- items, resolve a conflict group, archive and restore, forget. Each runs as
-- one decision through the settled-head writer, under the same state rules as
-- capture: owner authority skips the judge, never the rules.

local types = require("types")
local items = require("memory_items")
local stores = require("memory_stores")
local models = require("memory_models")
local writer = require("memory_writer")

local M = {}

local function vector_for(component_id: string, content: string): ({ number }?, error?)
    local store, err = stores.get(component_id)
    if err then return nil, err end
    local vectors, embed_err = models.embed((store :: any).embedding_model, { content })
    if embed_err then return nil, embed_err end
    return (vectors :: any)[1], nil
end

local function owner_write(component_id: string, idempotency: string, decide: (any) -> (any?, error?)): (any?, error?)
    local written, err = writer.write(component_id, idempotency, {
        source = types.ITEM_SOURCE.OWNER, actor = types.actor_id(), keyed_by_head = true,
    }, decide)
    if err then return nil, err end
    return (written :: any).result, nil
end

local function load(d: any, item_id: string): (any?, error?)
    local item, err = d:get(types.trim(item_id))
    if err then return nil, err end
    if not item then return nil, types.not_found("memory item not found: " .. tostring(item_id)) end
    return item, nil
end

-- Adds `fields` as a new item replacing what the claim's key holds when the
-- key is single-valued. A claim already current is left unchanged.
local function assert_claim(d: any, scope: any, fields: any, replaces: { any }): (any?, error?)
    local scope_key = types.scope_key(scope.scope_family, scope.scope_id)
    local claim_id, claim_err = types.claim_id(d.component_id, scope_key, fields.key, fields.value)
    if claim_err then return nil, claim_err end
    local live, live_err = d:claimed(scope_key, claim_id :: string, { types.STATUS.CURRENT })
    if live_err then return nil, live_err end
    if #(live :: any) > 0 then return { item_id = (live :: any)[1].id, unchanged = true }, nil end
    local targets: { any } = {}
    for _, item in ipairs(replaces) do targets[#targets + 1] = item end
    if fields.cardinality == types.CARDINALITY.SINGLE then
        local held, held_err = d:held(scope_key, fields.key)
        if held_err then return nil, held_err end
        for _, item in ipairs(held :: any) do targets[#targets + 1] = item end
    end
    local item, add_err = d:add(scope, fields)
    if add_err then return nil, add_err end
    if #targets > 0 then d:supersede(targets, item, nil) end
    return { item_id = (item :: any).id }, nil
end

-- Adds an item. Owner-scoped items always belong to the caller.
function M.create(component_id: string, fields: any): (any?, error?)
    local kind = types.trim(fields.kind)
    local scope_family = types.trim(fields.scope_family)
    local scope_id = scope_family == types.SCOPE.OWNER and types.actor_id() or types.trim(fields.scope_id)
    local content = types.trim(fields.content)
    if not types.KIND_SET[kind] then return nil, types.invalid("unknown memory kind: " .. kind) end
    if not types.SCOPE_SET[scope_family] then return nil, types.invalid("unknown memory scope: " .. scope_family) end
    if scope_id == "" then return nil, types.invalid("memory scope id is required") end
    if content == "" then return nil, types.invalid("memory content is required") end
    local key = types.normalize_key(fields.key ~= nil and fields.key or content)
    if key == "" then return nil, types.invalid("memory key is required") end
    local vector, vector_err = vector_for(component_id, content)
    if vector_err then return nil, vector_err end
    local idempotency, id_err = types.digest({ "owner.create", scope_family, scope_id, key, fields.value == nil and content or fields.value })
    if id_err then return nil, id_err end
    return owner_write(component_id, idempotency :: string, function(d: any): (any?, error?)
        local cardinality = types.trim(fields.cardinality)
        if cardinality == "" then
            local established, err = d:cardinality_of(types.scope_key(scope_family, scope_id), key)
            if err then return nil, err end
            cardinality = established or types.CARDINALITY.MULTI
        end
        return assert_claim(d, { scope_family = scope_family, scope_id = scope_id }, {
            kind = kind, key = key, cardinality = cardinality, value = fields.value == nil and content or fields.value,
            content = content, valid_at = d.now, priority = math.floor(tonumber(fields.priority) or 0), vector = vector,
        }, {})
    end)
end

-- Edits an item. A new value (or new text of an item whose value is its text)
-- is a new version replacing it; new text or priority alone is a revision of
-- the same claim.
function M.edit(component_id: string, item_id: string, fields: any): (any?, error?)
    local content = fields.content ~= nil and types.trim(fields.content) or nil
    if content == "" then return nil, types.invalid("memory content is required") end
    local vector: { number }? = nil
    if content then
        local embedded, vector_err = vector_for(component_id, content)
        if vector_err then return nil, vector_err end
        vector = embedded
    end
    local idempotency, id_err = types.digest({ "owner.edit", item_id, content or "", fields.value == nil and "" or fields.value })
    if id_err then return nil, id_err end
    return owner_write(component_id, idempotency :: string, function(d: any): (any?, error?)
        local item, err = load(d, item_id)
        if err then return nil, err end
        if item.status ~= types.STATUS.CURRENT and item.status ~= types.STATUS.CONFLICT then
            return nil, types.invalid("only a current memory can be edited")
        end
        local value = fields.value
        if value == nil and content and item.value == item.content then value = content end
        if value ~= nil then
            local claim_id, claim_err = types.claim_id(component_id, item.scope_key, item.key, value)
            if claim_err then return nil, claim_err end
            if claim_id == item.claim_id then value = nil end
        end
        if value == nil then
            local priority = fields.priority ~= nil and math.floor(tonumber(fields.priority) or 0) or nil
            if (content or item.content) == item.content and (priority == nil or priority == item.priority) then
                return { item_id = item.id, unchanged = true }, nil
            end
            local revise_err = d:revise(item, content or item.content, priority)
            if revise_err then return nil, revise_err end
            return { item_id = item.id, revised = true }, nil
        end
        return assert_claim(d, { scope_family = item.scope_family, scope_id = item.scope_id }, {
            kind = item.kind, key = item.key, cardinality = item.cardinality, value = value,
            content = content or item.content, valid_at = d.now,
            priority = fields.priority ~= nil and math.floor(tonumber(fields.priority) or 0) or item.priority, vector = vector,
        }, { item })
    end)
end

-- Keeps `winner_id` current and supersedes every other member of the group.
function M.resolve_conflict(component_id: string, group_id: string, winner_id: string): (any?, error?)
    return owner_write(component_id, "owner.resolve:" .. group_id .. ":" .. winner_id, function(d: any): (any?, error?)
        local members, err = items.group_members(component_id, { types.trim(group_id) })
        if err then return nil, err end
        local winner = nil
        local losers: { any } = {}
        for _, member in ipairs(members :: any) do
            if member.id == winner_id then winner = member else losers[#losers + 1] = member end
        end
        if not winner then return nil, types.invalid("the chosen memory is not part of this conflict") end
        d:supersede(losers, winner, group_id)
        local restore_err = d:restore(winner)
        if restore_err then return nil, restore_err end
        return { winner = winner_id, superseded = #losers }, nil
    end)
end

-- Hides an item from recall and the prompt; it can be restored.
function M.archive(component_id: string, item_id: string): (any?, error?)
    return owner_write(component_id, "owner.archive:" .. item_id, function(d: any): (any?, error?)
        local item, err = load(d, item_id)
        if err then return nil, err end
        if item.status == types.STATUS.ARCHIVED then return { item_id = item.id, unchanged = true }, nil end
        if item.status ~= types.STATUS.CURRENT and item.status ~= types.STATUS.CONFLICT then
            return nil, types.invalid("only a current memory can be archived")
        end
        d:archive(item)
        return { item_id = item.id }, nil
    end)
end

-- Brings an archived item back.
function M.restore(component_id: string, item_id: string): (any?, error?)
    return owner_write(component_id, "owner.restore:" .. item_id, function(d: any): (any?, error?)
        local item, err = load(d, item_id)
        if err then return nil, err end
        if item.status ~= types.STATUS.ARCHIVED then return nil, types.invalid("only an archived memory can be restored") end
        local restore_err = d:restore(item)
        if restore_err then return nil, restore_err end
        return { item_id = item.id }, nil
    end)
end

-- Erases the item's claim: every version's text, value, vector and provenance,
-- and the captured spans that stated it. It cannot be restored.
function M.forget(component_id: string, item_id: string): (any?, error?)
    return owner_write(component_id, "owner.forget:" .. item_id, function(d: any): (any?, error?)
        local item, err = load(d, item_id)
        if err then return nil, err end
        if item.status == types.STATUS.FORGOTTEN then return { item_id = item.id, unchanged = true }, nil end
        local forget_err = d:forget(item)
        if forget_err then return nil, forget_err end
        return { item_id = item.id, forgotten = d.stats.forgotten }, nil
    end)
end

return M
