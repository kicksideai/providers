-- Candidate-then-judge reconciliation. Each candidate memory is matched by its
-- content-derived id first, then against same-key items of any kind and the
-- nearest items of its scope. Only an ambiguous neighborhood reaches the model, which
-- classifies the relationship over stable ids from a closed action set. Which
-- value wins a supersession is decided here by event time.

local types = require("types")
local items = require("memory_items")
local models = require("memory_models")

local M = {}

local NEIGHBORS = 5

type Candidate = {
    kind: string,
    key: string,
    value: any,
    content: string,
    event_id: string?,
    valid_at: string?,
    confidence: number?,
}

type Options = {
    component_id: string,
    embedding_model: string,
    judge_model: string,
    scope_family: string,
    scope_id: string,
    source: string,
    host_kind: string?,
    host_id: string?,
    -- Span messages candidates cite, by id: when it was said and its text.
    events: { [string]: { at: string?, text: string? } }?,
}

local LIVE = { types.STATUS.CURRENT, types.STATUS.CONFLICT }

-- Reflection derives new memories from what people said; it never replaces,
-- merges or contests their own statements.
local REFLECTION_ACTIONS = { types.ACTION.ADD, types.ACTION.NOOP }

-- A key names one attribute of a person whatever kind carries it, and a profile
-- slot holds one value: when the candidate or a same-key neighbor is a profile
-- slot, the candidate can replace, merge with or contest the held value, never
-- be added beside it.
local function allowed_actions(base: { string }, kind: string, key: string, neighbors: { any }): { string }
    local held = false
    for _, row in ipairs(neighbors) do
        if row.key == key and (kind == types.KIND.PROFILE_SLOT or row.kind == types.KIND.PROFILE_SLOT) then held = true end
    end
    if not held then return base end
    local out: { string } = {}
    for _, action in ipairs(base) do
        if action ~= types.ACTION.ADD then out[#out + 1] = action end
    end
    return out
end

local function provenance_of(opts: Options, candidate: Candidate): { any }
    local event_id = types.trim(candidate.event_id)
    if event_id == "" or not opts.host_kind then return {} end
    return { { host_kind = opts.host_kind, host_id = opts.host_id or "", event_id = event_id } }
end

-- Returns { events, vectors = { [item_id] = vector }, stats }.
function M.decide(candidates: { Candidate }, opts: Options): (any?, error?)
    local events: { any } = {}
    local vectors: { [string]: any } = {}
    local stats = { added = 0, superseded = 0, merged = 0, conflicted = 0, noop = 0, restored = 0, judged = 0 }
    if #candidates == 0 then return { events = events, vectors = vectors, stats = stats }, nil end

    local texts: { string } = {}
    for i, candidate in ipairs(candidates) do texts[i] = candidate.content end
    local embedded, embed_err = models.embed(opts.embedding_model, texts)
    if embed_err then return nil, embed_err end

    local scope_key = types.scope_key(opts.scope_family, opts.scope_id)
    local now = types.now()
    -- Items this batch adds or changes, so later candidates see earlier ones.
    local overlay: { [string]: any } = {}

    -- Records that an item was seen again in host records it has no
    -- provenance for yet; a replayed span adds nothing.
    local recorded: { [string]: boolean } = {}
    local function see_again(id: string, refs: { any }): error?
        for _, ref in ipairs(refs) do
            local key = id .. "|" .. ref.host_kind .. "|" .. ref.host_id .. "|" .. ref.event_id
            if not recorded[key] then
                recorded[key] = true
                local known, err = items.has_provenance(opts.component_id, id, ref)
                if err then return err end
                if not known then
                    events[#events + 1] = { type = types.EVENT.PROVENANCE_ADDED, body = {
                        item_id = id, host_kind = ref.host_kind, host_id = ref.host_id, event_id = ref.event_id,
                    } }
                end
            end
        end
        return nil
    end

    local function item_state(id: string): (any?, error?)
        if overlay[id] then return overlay[id], nil end
        return items.get(opts.component_id, id)
    end

    for index, candidate in ipairs(candidates) do
        local key = types.normalize_key(candidate.key)
        local value = candidate.value
        if type(value) == "string" then value = types.trim(value) end
        local event = opts.events and opts.events[types.trim(candidate.event_id)] or {}
        local valid_at = types.utc(candidate.valid_at) or event.at or now
        local id, id_err = types.item_id(opts.component_id, candidate.kind, opts.scope_family, opts.scope_id, key, value)
        if id_err then return nil, id_err end
        local item_id = id :: string
        local provenance = provenance_of(opts, candidate)
        local vector = (embedded :: any)[index]

        local existing, read_err = item_state(item_id)
        if read_err then return nil, read_err end

        if existing and (existing.status == types.STATUS.CURRENT or existing.status == types.STATUS.CONFLICT
            or existing.status == types.STATUS.FORGOTTEN) then
            -- The same typed content is already known (or explicitly forgotten,
            -- which capture must not resurrect): record where it was seen again.
            local seen_err = see_again(item_id, provenance)
            if seen_err then return nil, seen_err end
            stats.noop = stats.noop + 1
        else
            local by_id: { [string]: any } = {}
            local neighbors: { any } = {}
            local function admit(row: any)
                if row.id ~= item_id and not by_id[row.id] then
                    local state = overlay[row.id] or row
                    if state.status == types.STATUS.CURRENT or state.status == types.STATUS.CONFLICT then
                        by_id[row.id] = state
                        neighbors[#neighbors + 1] = state
                    end
                end
            end
            local same_key, key_err = items.list(opts.component_id, {
                statuses = LIVE, scope_keys = { scope_key }, key = key, limit = NEIGHBORS,
            })
            if key_err then return nil, key_err end
            for _, row in ipairs(same_key :: any) do admit(row) end
            for _, row in pairs(overlay) do
                if row.scope_key == scope_key and row.key == key then admit(row) end
            end
            -- Nearest items of every kind in the scope: the same fact can arrive
            -- as a preference from one span and a profile slot from another.
            local near, near_err = items.search(opts.component_id, vector, {
                statuses = LIVE, scope_keys = { scope_key },
                query_text = candidate.content, limit = NEIGHBORS,
            })
            if near_err then return nil, near_err end
            for _, row in ipairs(near :: any) do admit(row) end

            local actions = allowed_actions(opts.source == types.ITEM_SOURCE.REFLECTION and REFLECTION_ACTIONS or types.ACTIONS,
                candidate.kind, key, neighbors)
            local verdict: any = { action = types.ACTION.ADD, target_ids = {} }
            if #actions == 1 then
                verdict = { action = actions[1], target_ids = {} }
            elseif #neighbors > 0 then
                local judged, judge_err = models.judge(opts.judge_model, {
                    kind = candidate.kind, key = key, content = candidate.content, valid_at = valid_at, stated = event.text,
                }, neighbors, actions)
                if judge_err then return nil, judge_err end
                verdict = judged
                stats.judged = stats.judged + 1
            end

            local action = verdict.action
            local targets: { any } = {}
            for _, target_id in ipairs(verdict.target_ids) do targets[#targets + 1] = by_id[target_id] end

            if action == types.ACTION.NOOP then
                for _, target in ipairs(targets) do
                    local seen_err = see_again(target.id, provenance)
                    if seen_err then return nil, seen_err end
                end
                stats.noop = stats.noop + 1
            else
                -- The candidate becomes an item: a superseded twin is restored,
                -- anything else is added.
                local state = {
                    id = item_id, kind = candidate.kind, scope_family = opts.scope_family, scope_id = opts.scope_id,
                    scope_key = scope_key, key = key, content = candidate.content, valid_at = valid_at,
                    status = types.STATUS.CURRENT,
                }
                if existing then
                    events[#events + 1] = { type = types.EVENT.ITEM_RESTORED, body = {
                        item_id = item_id, actor = opts.source, reason = "restated",
                    } }
                    state.valid_at = valid_at >= (existing.valid_at or "") and valid_at or existing.valid_at
                    stats.restored = stats.restored + 1
                else
                    events[#events + 1] = { type = types.EVENT.ITEM_ADDED, body = {
                        item_id = item_id, kind = candidate.kind, scope_family = opts.scope_family, scope_id = opts.scope_id,
                        key = key, value = value, content = candidate.content, valid_at = valid_at, source = opts.source,
                        provenance = provenance, confidence = candidate.confidence, priority = 0,
                    } }
                    vectors[item_id] = vector
                    stats.added = stats.added + 1
                end
                overlay[item_id] = state

                if action == types.ACTION.SUPERSEDE then
                    local newest = targets[1]
                    for _, target in ipairs(targets) do
                        if (target.valid_at or "") > (newest.valid_at or "") then newest = target end
                    end
                    if state.valid_at >= (newest.valid_at or "") then
                        for _, target in ipairs(targets) do
                            events[#events + 1] = { type = types.EVENT.ITEM_SUPERSEDED, body = {
                                item_id = target.id, by = item_id, invalid_at = state.valid_at,
                            } }
                            overlay[target.id] = { id = target.id, status = types.STATUS.SUPERSEDED, scope_key = target.scope_key,
                                kind = target.kind, key = target.key, valid_at = target.valid_at }
                            stats.superseded = stats.superseded + 1
                        end
                    else
                        -- An older statement arriving late is history, not the
                        -- current value.
                        events[#events + 1] = { type = types.EVENT.ITEM_SUPERSEDED, body = {
                            item_id = item_id, by = newest.id, invalid_at = newest.valid_at,
                        } }
                        state.status = types.STATUS.SUPERSEDED
                        stats.superseded = stats.superseded + 1
                    end
                elseif action == types.ACTION.MERGE then
                    local merged: { string } = {}
                    for _, target in ipairs(targets) do
                        merged[#merged + 1] = target.id
                        overlay[target.id] = { id = target.id, status = types.STATUS.SUPERSEDED, scope_key = target.scope_key,
                            kind = target.kind, key = target.key, valid_at = target.valid_at }
                    end
                    events[#events + 1] = { type = types.EVENT.ITEM_MERGED, body = { item_ids = merged, into = item_id } }
                    stats.merged = stats.merged + #merged
                elseif action == types.ACTION.CONFLICT then
                    local ids: { string } = { item_id }
                    for _, target in ipairs(targets) do ids[#ids + 1] = target.id end
                    table.sort(ids)
                    local group, group_err = types.sha256(table.concat(ids, "|"))
                    if group_err then return nil, group_err end
                    events[#events + 1] = { type = types.EVENT.ITEM_CONFLICTED, body = { item_ids = ids, group_id = group } }
                    for _, conflict_id in ipairs(ids) do
                        local row = overlay[conflict_id] or by_id[conflict_id]
                        if row then
                            overlay[conflict_id] = { id = conflict_id, status = types.STATUS.CONFLICT, scope_key = row.scope_key,
                                kind = row.kind, key = row.key, valid_at = row.valid_at, content = row.content }
                        end
                    end
                    stats.conflicted = stats.conflicted + 1
                end
            end
        end
    end
    return { events = events, vectors = vectors, stats = stats }, nil
end

return M
