-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local types = require("types")
local items = require("memory_items")
local models = require("memory_models")
local stores = require("memory_stores")
local config = require("memory_config")

local M = {}

local NEIGHBORS = 5

type Candidate = {
    kind: string,
    key: string,
    cardinality: string?,
    value: any,
    content: string,
    event_id: string?,
    source_ids: { string }?,
    valid_at: string?,
    confidence: number?,
}

type Options = {
    embedding_model: string,
    judge_model: string,
    scope_family: string,
    scope_id: string,
    explicit: boolean?,
    host_kind: string?,
    host_id: string?,
    events: { [string]: { at: string?, text: string? } }?,
    run_id: string?,
    conversation: string?,
}

local LIVE = { types.STATUS.CURRENT, types.STATUS.CONFLICT }

local REFLECTION_ACTIONS = { types.ACTION.ADD, types.ACTION.NOOP }

local function provenance_of(opts: Options, candidate: Candidate): { any }
    local event_id = types.trim(candidate.event_id)
    local refs: { any } = {}
    if event_id ~= "" and opts.host_kind then
        refs[#refs + 1] = { host_kind = opts.host_kind, host_id = opts.host_id or "", event_id = event_id }
    end
    for _, source_id in ipairs(candidate.source_ids or {}) do
        refs[#refs + 1] = { host_kind = "item", host_id = source_id, event_id = "" }
    end
    return refs
end

local function explicitly_interpreted(d: any, held: { any }, provenance: { any }): (boolean?, error?)
    if d.source ~= types.ITEM_SOURCE.CAPTURE and d.source ~= types.ITEM_SOURCE.REFLECTION then return false, nil end
    for _, item in ipairs(held) do
        if item.source == types.ITEM_SOURCE.TOOL or item.source == types.ITEM_SOURCE.OWNER then
            for _, ref in ipairs(provenance) do
                if ref.event_id ~= "" then
                    local known, err = items.has_provenance(d.component_id, item.id, ref)
                    if err then return nil, err end
                    if known then return true, nil end
                end
            end
        end
    end
    return false, nil
end

local function apply(d: any, action: string, scope: any, fields: any, targets: { any }, provenance: { any }): error?
    for _, target in ipairs(targets) do
        if not types.compatible_kinds(fields.kind, target.kind) then
            return types.invalid("reconcile target kind is incompatible")
        end
    end
    if action == types.ACTION.NOOP then
        for _, target in ipairs(targets) do
            local seen_err = d:seen(target, provenance)
            if seen_err then return seen_err end
        end
        d.stats.noop = d.stats.noop + 1
        return nil
    end
    if action == types.ACTION.SUPERSEDE then
        for _, target in ipairs(targets) do
            if target.cardinality == types.CARDINALITY.SINGLE then
                fields.key, fields.cardinality = target.key, target.cardinality
                break
            end
        end
    end
    local item, add_err = d:add(scope, fields)
    if add_err then return add_err end
    if action == types.ACTION.SUPERSEDE then
        return d:supersede(targets, item, nil)
    elseif action == types.ACTION.MERGE then
        return d:merge(targets, item)
    elseif action == types.ACTION.CONFLICT then
        local contested: { any } = { item }
        for _, target in ipairs(targets) do contested[#contested + 1] = target end
        return d:conflict(contested)
    end
    return nil
end

local function judge(d: any, opts: Options, fields: any, stated: string?, neighbors: { any }, actions: { string }): (any?, error?)
    local verdict, err = models.judge(opts.judge_model, {
        kind = fields.kind, key = fields.key, cardinality = fields.cardinality, value = fields.value,
        content = fields.content, valid_at = fields.valid_at, stated = stated,
        conversation = opts.conversation,
    }, neighbors, actions)
    if err then return nil, err end
    d.stats.judged = d.stats.judged + 1
    return verdict, nil
end

function M.decide(d: any, candidates: { Candidate }, opts: Options): error?
    if #candidates == 0 then return nil end
    local texts: { string } = {}
    for i, candidate in ipairs(candidates) do texts[i] = candidate.content end
    local embedded, embed_err = models.embed(opts.embedding_model, texts)
    if embed_err then return embed_err end

    local store, store_err = stores.get(d.component_id)
    if store_err then return store_err end
    local effective, config_err = config.effective((store :: any).config)
    if config_err then return config_err end
    local threshold = (effective :: any).judge_min_similarity
    local scope = { scope_family = opts.scope_family, scope_id = opts.scope_id }
    local scope_key = types.scope_key(opts.scope_family, opts.scope_id)
    local reflection = d.source == types.ITEM_SOURCE.REFLECTION
    local curated = d.source == types.ITEM_SOURCE.TOOL or d.source == types.ITEM_SOURCE.OWNER

    for index, candidate in ipairs(candidates) do
        local key = types.normalize_key(candidate.key)
        local kind_err = d:check_key_kind(scope_key, key, candidate.kind)
        if kind_err then return kind_err end
        local value = candidate.value
        if type(value) == "string" then value = types.trim(value) end
        local event = opts.events and opts.events[types.trim(candidate.event_id)] or {}
        local provenance = provenance_of(opts, candidate)
        local established, card_err = d:cardinality_of(scope_key, key)
        if card_err then return card_err end
        local valid_at = event.at or d.now
        if candidate.kind ~= types.KIND.PLAN then valid_at = types.utc(candidate.valid_at) or valid_at end
        local fields = {
            kind = candidate.kind, key = key, value = value, content = candidate.content,
            cardinality = candidate.cardinality or established or types.default_cardinality(candidate.kind),
            valid_at = valid_at,
            confidence = candidate.confidence, provenance = provenance, vector = (embedded :: any)[index], run_id = opts.run_id,
        }
        if candidate.valid_at ~= nil and candidate.valid_at ~= "" and not types.utc(candidate.valid_at) then
            return types.invalid("memory valid_at must be an RFC3339 instant")
        end
        local validation_err = d:validate(scope, fields)
        if validation_err then return validation_err end
        local claim_id, claim_err = types.claim_id(d.component_id, scope_key, key, value)
        if claim_err then return claim_err end

        local live, live_err = d:claimed(scope_key, claim_id :: string, LIVE)
        if live_err then return live_err end
        local erased, erased_err = d:claimed(scope_key, claim_id :: string, { types.STATUS.FORGOTTEN })
        if erased_err then return erased_err end
        local held, held_err = d:held(scope_key, key)
        if held_err then return held_err end

        local interpreted, interpreted_err = explicitly_interpreted(d, held :: any, provenance)
        if interpreted_err then return interpreted_err end

        if interpreted then
            d.stats.noop = d.stats.noop + 1
        elseif #(live :: any) > 0 then
            local seen_err = d:reuse((live :: any)[1], provenance, {})
            if seen_err then return seen_err end
            d.stats.noop = d.stats.noop + 1
        elseif #(erased :: any) > 0 and not opts.explicit then
            d.stats.suppressed = d.stats.suppressed + 1
        elseif fields.cardinality == types.CARDINALITY.SINGLE and #(held :: any) > 0 then
            if reflection then
                d.stats.noop = d.stats.noop + 1
            else
                local err = apply(d, types.ACTION.SUPERSEDE, scope, fields, held :: any, provenance)
                if err then return err end
            end
        elseif curated then
            local _, add_err = d:add(scope, fields)
            if add_err then return add_err end
        else
            local compatible = {}
            for kind in pairs(types.KIND_SET) do
                if types.compatible_kinds(candidate.kind, kind) then compatible[#compatible + 1] = kind end
            end
            local near, near_err = items.search(d.component_id, fields.vector, {
                statuses = LIVE, scope_keys = { scope_key }, kinds = compatible, min_similarity = threshold, limit = NEIGHBORS,
            })
            if near_err then return near_err end
            local neighbors: { any } = {}
            local by_id: { [string]: any } = {}
            local function consider(row: any)
                local state = d.overlay[row.id] or row
                if not by_id[state.id] and types.compatible_kinds(fields.kind, state.kind) and (state.status == types.STATUS.CURRENT or state.status == types.STATUS.CONFLICT) then
                    neighbors[#neighbors + 1] = state
                    by_id[state.id] = state
                end
            end
            for _, staged in ipairs(d.staged) do
                local state = d.overlay[staged.owner_item_id]
                if state and state.scope_key == scope_key and state.key == key and staged.vector
                    and types.cosine_similarity(fields.vector, staged.vector) >= threshold then consider(state) end
            end
            for _, row in ipairs(near :: any) do consider(row) end
            if #neighbors == 0 then
                local _, add_err = d:add(scope, fields)
                if add_err then return add_err end
            else
                local verdict, err = judge(d, opts, fields, event.text, neighbors, reflection and REFLECTION_ACTIONS or types.ACTIONS)
                if err then return err end
                local targets: { any } = {}
                for _, target_id in ipairs(verdict.target_ids) do targets[#targets + 1] = by_id[target_id] end
                local apply_err = apply(d, verdict.action, scope, fields, targets, provenance)
                if apply_err then return apply_err end
            end
        end
    end
    return nil
end

return M
