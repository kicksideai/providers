-- One decision on a memory: the item transitions every writer shares. Capture,
-- tools, reflection and owner operations all build their change here, after
-- the writer settled the read model at the ledger head, so the same state
-- rules apply whoever decides:
--
-- - an item is a claim (a typed value of a canonical key in a scope) at one
--   occurrence; a recurring claim is a new item with its own valid_at;
-- - a single-valued key holds at most one current value per scope, whatever
--   kind labels its items;
-- - a conflict group is always complete: contesting any member contests the
--   whole group;
-- - an archived item can be restored; a forgotten one is erased.
--
-- The decision collects ledger events (structure only), the payloads and
-- vectors the writer stages before appending them, and an overlay of the
-- states it changed, so later steps of the same decision see earlier ones.

local types = require("types")
local items = require("memory_items")

local M = {}

local LIVE = { types.STATUS.CURRENT, types.STATUS.CONFLICT }

-- Rows read from one key or claim; a key holds few live items.
local READ_LIMIT = 200

type Fields = {
    kind: string,
    key: string,
    cardinality: string,
    value: any,
    content: string,
    valid_at: string,
    confidence: number?,
    priority: number?,
    provenance: { any }?,
    vector: { number }?,
}

local Decision = {}
Decision.__index = Decision

function M.new(component_id: string, key: string, source: string, actor: string?): any
    return setmetatable({
        component_id = component_id,
        key = key,
        source = source,
        actor = actor or "",
        now = types.now(),
        events = {},
        staged = {},
        overlay = {},
        added = {},
        touched_keys = {},
        sequence = 0,
        stats = {
            added = 0, superseded = 0, merged = 0, conflicted = 0, noop = 0, suppressed = 0, judged = 0,
            archived = 0, restored = 0, forgotten = 0, revised = 0,
        },
    }, Decision)
end

function Decision:emit(event_type: string, body: any)
    self.events[#self.events + 1] = { type = event_type, body = body }
end

-- The state of an item as this decision sees it.
function Decision:get(item_id: string): (any?, error?)
    if self.overlay[item_id] then return self.overlay[item_id], nil end
    return items.get(self.component_id, item_id)
end

function Decision:set(item: any, fields: { [string]: any })
    local state = {}
    for k, v in pairs(item) do state[k] = v end
    for k, v in pairs(fields) do state[k] = v end
    self.overlay[item.id] = state
    self.touched_keys[item.scope_key .. "\0" .. item.key] = { scope_key = item.scope_key, key = item.key }
end

-- Rows of a filter merged with this decision's overlay, keeping only live ones
-- unless `statuses` is given.
function Decision:rows(filter: any, matches: (any) -> boolean, statuses: { string }?): ({ any }?, error?)
    local listed, err = items.list(self.component_id, {
        scope_keys = filter.scope_keys, key = filter.key, claim_ids = filter.claim_ids, conflict_groups = filter.conflict_groups,
        statuses = statuses or LIVE, limit = READ_LIMIT,
    })
    if err then return nil, err end
    local wanted: { [string]: boolean } = {}
    for _, status in ipairs(statuses or LIVE) do wanted[status] = true end
    local seen: { [string]: boolean } = {}
    local out: { any } = {}
    for _, row in ipairs(listed :: any) do
        local state = self.overlay[row.id] or row
        seen[row.id] = true
        if wanted[state.status] then out[#out + 1] = state end
    end
    for id, state in pairs(self.overlay) do
        if not seen[id] and wanted[state.status] and matches(state) then out[#out + 1] = state end
    end
    table.sort(out, function(a: any, b: any): boolean return a.id < b.id end)
    return out, nil
end

-- Live items of a key in a scope.
function Decision:held(scope_key: string, key: string): ({ any }?, error?)
    return self:rows({ scope_keys = { scope_key }, key = key }, function(state: any): boolean
        return state.scope_key == scope_key and state.key == key
    end)
end

-- Items of a claim in a scope, in any of the given statuses.
function Decision:claimed(scope_key: string, claim_id: string, statuses: { string }): ({ any }?, error?)
    return self:rows({ scope_keys = { scope_key }, claim_ids = { claim_id } }, function(state: any): boolean
        return state.scope_key == scope_key and state.claim_id == claim_id
    end, statuses)
end

-- The cardinality a key already has in a scope, or nil for a new key.
function Decision:cardinality_of(scope_key: string, key: string): (string?, error?)
    local held, err = self:held(scope_key, key)
    if err then return nil, err end
    local first = (held :: any)[1]
    return first and first.cardinality or nil, nil
end

type Scope = { scope_family: string, scope_id: string }

-- A new item for a claim, with its payload staged and its structure on the
-- ledger. The caller decides what it replaces.
function Decision:add(scope: Scope, fields: Fields): (any?, error?)
    local scope_key = types.scope_key(scope.scope_family, scope.scope_id)
    local key = types.normalize_key(fields.key)
    if key == "" then return nil, types.invalid("memory key is required") end
    if not types.CARDINALITY_SET[fields.cardinality] then return nil, types.invalid("unknown cardinality: " .. tostring(fields.cardinality)) end
    local claim_id, claim_err = types.claim_id(self.component_id, scope_key, key, fields.value)
    if claim_err then return nil, claim_err end
    local content_hash, hash_err = types.content_hash(self.component_id, fields.content, fields.value)
    if hash_err then return nil, hash_err end
    self.sequence = self.sequence + 1
    local item_id, id_err = types.digest({ "item", claim_id :: string, self.key, self.sequence })
    if id_err then return nil, id_err end
    local item = {
        id = item_id, claim_id = claim_id, kind = fields.kind, scope_family = scope.scope_family, scope_id = scope.scope_id,
        scope_key = scope_key, key = key, cardinality = fields.cardinality, content = fields.content, value = fields.value,
        content_hash = content_hash, status = types.STATUS.CURRENT, valid_at = fields.valid_at, priority = fields.priority or 0,
        source = self.source,
    }
    self:emit(types.EVENT.ITEM_ADDED, {
        item_id = item_id, claim_id = claim_id, content_hash = content_hash, kind = fields.kind, key = key,
        cardinality = fields.cardinality, scope_family = scope.scope_family, scope_id = scope.scope_id,
        valid_at = fields.valid_at, source = self.source, provenance = fields.provenance or {},
        confidence = fields.confidence, priority = fields.priority or 0,
    })
    self.staged[#self.staged + 1] = {
        payload_id = item_id, content = fields.content, value = fields.value, content_hash = content_hash, vector = fields.vector,
    }
    self.added[#self.added + 1] = item_id
    self:set(item, {})
    self.stats.added = self.stats.added + 1
    return self.overlay[item_id :: string], nil
end

-- Records that an item was seen again in host records it has no provenance
-- for yet.
function Decision:seen(item: any, provenance: { any }): error?
    for _, ref in ipairs(provenance) do
        local known, err = items.has_provenance(self.component_id, item.id, ref)
        if err then return err end
        if not known then
            self:emit(types.EVENT.PROVENANCE_ADDED, {
                item_id = item.id, host_kind = ref.host_kind, host_id = ref.host_id, event_id = ref.event_id,
            })
        end
    end
    return nil
end

-- `successor` replaces `targets`. An older successor (by valid_at) than the
-- newest target is history instead: it is recorded as replaced by that target.
function Decision:supersede(targets: { any }, successor: any, resolved_group: string?)
    local newest = nil
    for _, target in ipairs(targets) do
        if not newest or (target.valid_at or "") > (newest.valid_at or "") then newest = target end
    end
    if newest and not resolved_group and (successor.valid_at or "") < (newest.valid_at or "") then
        self:emit(types.EVENT.ITEM_SUPERSEDED, { item_id = successor.id, by = newest.id, invalid_at = newest.valid_at })
        self:set(successor, { status = types.STATUS.SUPERSEDED, superseded_by = newest.id })
        self.stats.superseded = self.stats.superseded + 1
        return
    end
    for _, target in ipairs(targets) do
        if target.id ~= successor.id then
            self:emit(types.EVENT.ITEM_SUPERSEDED, {
                item_id = target.id, by = successor.id, invalid_at = successor.valid_at or self.now, resolved_conflict = resolved_group,
            })
            self:set(target, { status = types.STATUS.SUPERSEDED, superseded_by = successor.id, conflict_group = false })
            self.stats.superseded = self.stats.superseded + 1
        end
    end
end

-- `into` replaces `targets` as the same memory phrased better.
function Decision:merge(targets: { any }, into: any)
    local ids: { string } = {}
    for _, target in ipairs(targets) do
        if target.id ~= into.id then
            ids[#ids + 1] = target.id
            self:set(target, { status = types.STATUS.SUPERSEDED, superseded_by = into.id, conflict_group = false })
        end
    end
    if #ids == 0 then return end
    self:emit(types.EVENT.ITEM_MERGED, { item_ids = ids, into = into.id })
    self.stats.merged = self.stats.merged + #ids
end

-- Contests `contested` against each other. Any member already in a conflict
-- group brings its whole group, so the result is one complete group.
function Decision:conflict(contested: { any }): error?
    local members: { [string]: any } = {}
    local groups: { string } = {}
    local seen_groups: { [string]: boolean } = {}
    for _, item in ipairs(contested) do
        members[item.id] = item
        if item.conflict_group and not seen_groups[item.conflict_group] then
            seen_groups[item.conflict_group] = true
            groups[#groups + 1] = item.conflict_group
        end
    end
    local index = 1
    while index <= #groups do
        local group = groups[index]
        local listed, err = self:rows({ conflict_groups = { group } }, function(state: any): boolean
            return state.conflict_group == group
        end, { types.STATUS.CONFLICT })
        if err then return err end
        for _, member in ipairs(listed :: any) do
            members[member.id] = member
            if member.conflict_group and not seen_groups[member.conflict_group] then
                seen_groups[member.conflict_group] = true
                groups[#groups + 1] = member.conflict_group
            end
        end
        index = index + 1
    end
    local ids: { string } = {}
    for id in pairs(members) do ids[#ids + 1] = id end
    table.sort(ids)
    local group_id, digest_err = types.digest({ "conflict", self.component_id, ids })
    if digest_err then return digest_err end
    self:emit(types.EVENT.ITEM_CONFLICTED, { item_ids = ids, group_id = group_id })
    for _, id in ipairs(ids) do self:set(members[id], { status = types.STATUS.CONFLICT, conflict_group = group_id }) end
    self.stats.conflicted = self.stats.conflicted + 1
    return nil
end

-- New presentation (text, priority) for an item whose claim does not change.
function Decision:revise(item: any, content: string, priority: number?): error?
    local content_hash, hash_err = types.content_hash(self.component_id, content, item.value)
    if hash_err then return hash_err end
    local payload_id, id_err = types.digest({ "revision", item.id, self.key })
    if id_err then return id_err end
    self.staged[#self.staged + 1] = { payload_id = payload_id, content = content, value = item.value, content_hash = content_hash }
    self:emit(types.EVENT.ITEM_REVISED, { item_id = item.id, payload_id = payload_id, content_hash = content_hash, priority = priority })
    self:set(item, { content = content, content_hash = content_hash, priority = priority or item.priority })
    self.stats.revised = self.stats.revised + 1
    return nil
end

function Decision:archive(item: any)
    self:emit(types.EVENT.ITEM_ARCHIVED, { item_id = item.id, actor = self.actor })
    self:set(item, { status = types.STATUS.ARCHIVED, conflict_group = false })
    self.stats.archived = self.stats.archived + 1
end

-- Makes an archived or contested item current again; on a single-valued key it
-- replaces the value held meanwhile.
function Decision:restore(item: any): error?
    self:emit(types.EVENT.ITEM_RESTORED, { item_id = item.id, actor = self.actor })
    self:set(item, { status = types.STATUS.CURRENT, conflict_group = false, superseded_by = false })
    self.stats.restored = self.stats.restored + 1
    if item.cardinality ~= types.CARDINALITY.SINGLE then return nil end
    local held, err = self:held(item.scope_key, item.key)
    if err then return err end
    local others: { any } = {}
    for _, other in ipairs(held :: any) do
        if other.id ~= item.id then others[#others + 1] = other end
    end
    if #others > 0 then self:supersede(others, self.overlay[item.id], nil) end
    return nil
end

-- Erases every item of the claim: its text, value, vector, provenance and the
-- captured spans that stated it.
function Decision:forget(item: any): error?
    local versions, err = self:claimed(item.scope_key, item.claim_id, {
        types.STATUS.CURRENT, types.STATUS.CONFLICT, types.STATUS.SUPERSEDED, types.STATUS.ARCHIVED,
    })
    if err then return err end
    for _, version in ipairs(versions :: any) do
        self:emit(types.EVENT.ITEM_FORGOTTEN, { item_id = version.id, actor = self.actor })
        self:set(version, { status = types.STATUS.FORGOTTEN, content = "", value = nil, conflict_group = false })
        self.stats.forgotten = self.stats.forgotten + 1
    end
    return nil
end

-- The single-value invariant over every key this decision touched.
function Decision:check(): error?
    for _, touched in pairs(self.touched_keys) do
        local held, err = self:held(touched.scope_key, touched.key)
        if err then return err end
        local current = 0
        local single = false
        for _, item in ipairs(held :: any) do
            if item.status == types.STATUS.CURRENT then current = current + 1 end
            if item.cardinality == types.CARDINALITY.SINGLE then single = true end
        end
        if single and current > 1 then
            return types.internal("decision would leave " .. tostring(current) .. " current values of single-valued key "
                .. touched.key .. " in " .. touched.scope_key)
        end
    end
    return nil
end


return M
