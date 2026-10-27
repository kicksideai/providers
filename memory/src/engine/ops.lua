-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local canonical_json = require("canonical_json")
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

local function assert_claim(d: any, scope: any, fields: any, replaces: { any }): (any?, error?)
    local scope_key = types.scope_key(scope.scope_family, scope.scope_id)
    local validation_err = d:validate(scope, fields)
    if validation_err then return nil, validation_err end
    local claim_id, claim_err = types.claim_id(d.component_id, scope_key, fields.key, fields.value)
    if claim_err then return nil, claim_err end
    local live, live_err = d:claimed(scope_key, claim_id :: string, { types.STATUS.CURRENT })
    if live_err then return nil, live_err end
    local targets: { any } = {}
    for _, item in ipairs(replaces) do targets[#targets + 1] = item end
    if #(live :: any) == 0 and fields.cardinality == types.CARDINALITY.SINGLE then
        local held, held_err = d:held(scope_key, fields.key)
        if held_err then return nil, held_err end
        for _, item in ipairs(held :: any) do targets[#targets + 1] = item end
    end
    local provenance: { any } = {}
    for _, target in ipairs(targets) do
        local refs, refs_err = items.provenance(d.component_id, target.id)
        if refs_err then return nil, refs_err end
        for _, ref in ipairs(refs :: any) do provenance[#provenance + 1] = ref end
    end
    if #(live :: any) > 0 then
        local destination = (live :: any)[1]
        local reuse_err = d:reuse(destination, provenance, replaces)
        if reuse_err then return nil, reuse_err end
        local revised = destination.content ~= fields.content or destination.priority ~= fields.priority or destination.source ~= d.source
        if revised then
            local revise_err = d:revise(destination, fields.content, fields.priority, fields.vector)
            if revise_err then return nil, revise_err end
        end
        return { item_id = destination.id, unchanged = #replaces == 0 and not revised }, nil
    end
    fields.provenance = provenance
    local item, add_err = d:add(scope, fields)
    if add_err then return nil, add_err end
    if #targets > 0 then
        local transition_err = d:replace(targets, item, nil)
        if transition_err then return nil, transition_err end
    end
    return { item_id = (item :: any).id }, nil
end

function M.create(component_id: string, fields: any): (any?, error?)
    local kind = types.trim(fields.kind)
    local scope_family = types.trim(fields.scope_family)
    local scope_id = scope_family == types.SCOPE.OWNER and types.actor_id() or types.trim(fields.scope_id)
    local content = types.trim(fields.content)
    if not types.KIND_SET[kind] then return nil, types.invalid("unknown memory kind: " .. kind) end
    if not types.SCOPE_SET[scope_family] then return nil, types.invalid("unknown memory scope: " .. scope_family) end
    if scope_id == "" then return nil, types.invalid("memory scope id is required") end
    if content == "" then return nil, types.invalid("memory content is required") end
    local value = fields.value
    if value == nil then return nil, types.invalid("memory value is required") end
    local key, key_err = types.topic_key(fields.key, content, value, kind)
    if key_err then return nil, key_err end
    local vector, vector_err = vector_for(component_id, content)
    if vector_err then return nil, vector_err end
    local idempotency, id_err = canonical_json.hash({ "owner.create", scope_family, scope_id, key, value })
    if id_err then return nil, id_err end
    return owner_write(component_id, idempotency :: string, function(d: any): (any?, error?)
        local cardinality = types.trim(fields.cardinality)
        if cardinality == "" then
            local established, err = d:cardinality_of(types.scope_key(scope_family, scope_id), key)
            if err then return nil, err end
            cardinality = established or types.default_cardinality(kind)
        end
        return assert_claim(d, { scope_family = scope_family, scope_id = scope_id }, {
            kind = kind, key = key, cardinality = cardinality, value = value,
            content = content, valid_at = d.now, priority = math.floor(tonumber(fields.priority) or 0), vector = vector,
        }, {})
    end)
end

function M.edit(component_id: string, item_id: string, fields: any): (any?, error?)
    local content = fields.content ~= nil and types.trim(fields.content) or nil
    if content == "" then return nil, types.invalid("memory content is required") end
    local idempotency, id_err = canonical_json.hash({ "owner.edit", item_id, content or "", fields.value == nil and "" or fields.value })
    if id_err then return nil, id_err end
    return owner_write(component_id, idempotency :: string, function(d: any): (any?, error?)
        local item, err = load(d, item_id)
        if err then return nil, err end
        if item.status ~= types.STATUS.CURRENT and item.status ~= types.STATUS.CONFLICT then
            return nil, types.invalid("only a current memory can be edited")
        end
        local vector, vector_err = vector_for(component_id, content or item.content)
        if vector_err then return nil, vector_err end
        local value = fields.value
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
            local revise_err = d:revise(item, content or item.content, priority, vector)
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
        local supersede_err = d:replace(losers, winner, group_id)
        if supersede_err then return nil, supersede_err end
        local restore_err = d:restore(winner)
        if restore_err then return nil, restore_err end
        return { winner = winner_id, superseded = #losers }, nil
    end)
end

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

local SUGGESTIONS = 5
local SUGGESTION_SCAN = 200

local function key_distance(a: string, b: string): integer
    local previous: { integer } = {}
    for j = 0, #b do previous[j + 1] = j end
    for i = 1, #a do
        local current: { integer } = { i }
        for j = 1, #b do
            local cost = a:sub(i, i) == b:sub(j, j) and 0 or 1
            current[j + 1] = math.min(current[j] + 1, previous[j + 1] + 1, previous[j] + cost)
        end
        previous = current
    end
    return previous[#b + 1]
end

function M.forget_key(component_id: string, key: string, value: any): (any?, error?)
    local owner = types.actor_id()
    if owner == "" then return nil, types.invalid("forget requires a signed-in user") end
    local scope_key = types.scope_key(types.SCOPE.OWNER, owner)
    local idempotency, hash_err = canonical_json.hash({ operation = "owner.forget_key", scope_key = scope_key, key = key, value = value })
    if hash_err then return nil, hash_err end
    return owner_write(component_id, idempotency :: string, function(d: any): (any?, error?)
        local rows, read_err = items.all(component_id, { scope_keys = { scope_key }, key = key })
        if read_err then return nil, read_err end
        local matches = {}
        for _, row in ipairs(rows :: any) do
            if row.status ~= types.STATUS.FORGOTTEN then matches[#matches + 1] = row end
        end
        if #matches == 0 then
            local known, known_err = items.keys(component_id, scope_key, SUGGESTION_SCAN)
            if known_err then return nil, known_err end
            local ranked, seen = {}, {}
            for _, row in ipairs(known :: any) do
                if not seen[row.key] then
                    seen[row.key] = true
                    ranked[#ranked + 1] = { key = row.key, distance = key_distance(key, row.key) }
                end
            end
            table.sort(ranked, function(a, b)
                if a.distance ~= b.distance then return a.distance < b.distance end
                return a.key < b.key
            end)
            local closest: { string } = {}
            for i = 1, math.min(SUGGESTIONS, #ranked) do closest[i] = ranked[i].key end
            return nil, types.not_found("unknown memory key: " .. key .. ". Existing keys, closest first: " .. table.concat(closest, ", "))
        end
        local multi = matches[1].cardinality == types.CARDINALITY.MULTI
        if multi and value == nil then return nil, types.invalid("value is required for a multi-valued key") end
        local claim, claim_err
        if multi then
            claim, claim_err = types.claim_id(component_id, scope_key, key, value)
            if claim_err then return nil, claim_err end
        end
        local selected = false
        for _, row in ipairs(matches) do
            if not multi or row.claim_id == claim then
                selected = true
                local err = d:forget(row)
                if err then return nil, err end
                break
            end
        end
        if not selected then return nil, types.not_found("memory value not found for key: " .. key) end
        return { key = key, forgotten = d.stats.forgotten }, nil
    end)
end

return M
