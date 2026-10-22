-- Explicit typed operations on a memory by a person with WRITE access: add or
-- edit identity and rules, resolve a conflict group, forget and restore. Each
-- operation is a set of ledger events appended at the settled head.

local security = require("security")
local types = require("types")
local items = require("memory_items")
local stores = require("memory_stores")
local models = require("memory_models")
local writer = require("memory_writer")

local M = { _items = items, _stores = stores, _models = models, _writer = writer }

-- Stores the vector of an item an operation adds, so it is searchable.
local function embed(component_id: string, item_id: string, content: string): error?
    local store, err = M._stores.get(component_id)
    if err then return err end
    local vectors, embed_err = M._models.embed((store :: any).embedding_model, { content })
    if embed_err then return embed_err end
    local _, vector_err = M._items.set_embedding(component_id, item_id, (vectors :: any)[1])
    return vector_err
end

local function actor_id(): string
    local actor = security.actor()
    return actor and actor:id() or ""
end

local function load(component_id: string, item_id: string): (any?, error?)
    local item, err = M._items.get(component_id, types.trim(item_id))
    if err then return nil, err end
    if not item then return nil, types.not_found("memory item not found: " .. tostring(item_id)) end
    return item, nil
end

local function added_event(component_id: string, fields: any): (any?, string?, error?)
    local kind = types.trim(fields.kind)
    local scope_family = types.trim(fields.scope_family)
    local scope_id = types.trim(fields.scope_id)
    local content = types.trim(fields.content)
    if not types.KIND_SET[kind] then return nil, nil, types.invalid("unknown memory kind: " .. kind) end
    if not types.SCOPE_SET[scope_family] then return nil, nil, types.invalid("unknown memory scope: " .. scope_family) end
    if scope_id == "" then return nil, nil, types.invalid("memory scope id is required") end
    if content == "" then return nil, nil, types.invalid("memory content is required") end
    local key = types.normalize_key(fields.key ~= nil and fields.key or content)
    if key == "" then return nil, nil, types.invalid("memory key is required") end
    local value = fields.value
    if value == nil then value = content end
    local id, id_err = types.item_id(component_id, kind, scope_family, scope_id, key, value)
    if id_err then return nil, nil, id_err end
    return { type = types.EVENT.ITEM_ADDED, body = {
        item_id = id, kind = kind, scope_family = scope_family, scope_id = scope_id, key = key, value = value,
        content = content, valid_at = types.now(), source = types.ITEM_SOURCE.OWNER, provenance = {},
        priority = math.floor(tonumber(fields.priority) or 0),
    } }, id, nil
end

-- Adds an item. Owner-scoped items always belong to the caller.
function M.create(component_id: string, fields: any): (any?, error?)
    local scoped = {}
    for k, v in pairs(type(fields) == "table" and fields or {}) do scoped[k] = v end
    if scoped.scope_family == types.SCOPE.OWNER then scoped.scope_id = actor_id() end
    local event, id, err = added_event(component_id, scoped)
    if err then return nil, err end
    local vector_err = embed(component_id, id :: string, (event :: any).body.content)
    if vector_err then return nil, vector_err end
    local _, append_err = M._writer.apply(component_id, { event }, "owner.create:" .. tostring(id))
    if append_err then return nil, append_err end
    return { item_id = id }, nil
end

-- Replaces an item's content with a new version in the same scope and kind.
function M.edit(component_id: string, item_id: string, fields: any): (any?, error?)
    local item, err = load(component_id, item_id)
    if err then return nil, err end
    local event, id, event_err = added_event(component_id, {
        kind = item.kind, scope_family = item.scope_family, scope_id = item.scope_id,
        key = fields.key ~= nil and fields.key or item.key,
        value = fields.value, content = fields.content ~= nil and fields.content or item.content,
        priority = fields.priority ~= nil and fields.priority or item.priority,
    })
    if event_err then return nil, event_err end
    if id == item.id then return { item_id = id, unchanged = true }, nil end
    local vector_err = embed(component_id, id :: string, (event :: any).body.content)
    if vector_err then return nil, vector_err end
    local events = {
        event,
        { type = types.EVENT.ITEM_SUPERSEDED, body = { item_id = item.id, by = id, invalid_at = (event :: any).body.valid_at } },
    }
    local _, append_err = M._writer.apply(component_id, events, "owner.edit:" .. item.id .. ":" .. tostring(id))
    if append_err then return nil, append_err end
    return { item_id = id, superseded = item.id }, nil
end

-- Keeps `winner_id` current and supersedes every other item of the group.
function M.resolve_conflict(component_id: string, group_id: string, winner_id: string): (any?, error?)
    local members, err = M._items.list(component_id, { conflict_group = types.trim(group_id), statuses = { types.STATUS.CONFLICT }, limit = 100 })
    if err then return nil, err end
    local winner = nil
    for _, member in ipairs(members :: any) do
        if member.id == winner_id then winner = member end
    end
    if not winner then return nil, types.invalid("the chosen memory is not part of this conflict") end
    local events: { any } = {
        { type = types.EVENT.ITEM_RESTORED, body = { item_id = winner_id, actor = actor_id(), reason = "conflict resolved" } },
    }
    for _, member in ipairs(members :: any) do
        if member.id ~= winner_id then
            events[#events + 1] = { type = types.EVENT.ITEM_SUPERSEDED, body = {
                item_id = member.id, by = winner_id, invalid_at = types.now(), resolved_conflict = group_id,
            } }
        end
    end
    local _, append_err = M._writer.apply(component_id, events, "owner.resolve:" .. group_id .. ":" .. winner_id)
    if append_err then return nil, append_err end
    return { winner = winner_id, superseded = #events - 1 }, nil
end

function M.forget(component_id: string, item_id: string, reason: string?): (any?, error?)
    local item, err = load(component_id, item_id)
    if err then return nil, err end
    if item.status == types.STATUS.FORGOTTEN then return { item_id = item.id, unchanged = true }, nil end
    local event = { type = types.EVENT.ITEM_FORGOTTEN, body = { item_id = item.id, actor = actor_id(), reason = types.trim(reason) } }
    local _, append_err = M._writer.apply(component_id, { event }, "forget:" .. item.id .. ":" .. tostring(item.last_seq))
    if append_err then return nil, append_err end
    return { item_id = item.id }, nil
end

function M.restore(component_id: string, item_id: string): (any?, error?)
    local item, err = load(component_id, item_id)
    if err then return nil, err end
    if item.status ~= types.STATUS.FORGOTTEN then return nil, types.invalid("only a forgotten memory can be restored") end
    local event = { type = types.EVENT.ITEM_RESTORED, body = { item_id = item.id, actor = actor_id(), reason = "restored" } }
    local _, append_err = M._writer.apply(component_id, { event }, "restore:" .. item.id .. ":" .. tostring(item.last_seq))
    if append_err then return nil, append_err end
    return { item_id = item.id }, nil
end

return M
