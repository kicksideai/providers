-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Reconciliation of candidate memories (capture, tools, reflection) into one
-- decision. A candidate is a claim: a typed value of a canonical key in a scope.
--
-- - The claim already current: seen again (provenance only).
-- - A claim the person had forgotten: not learned again from capture or
--   reflection.
-- - A single-valued key holding another value: the candidate relates to that
--   value only. An explicit statement (a Remember call) replaces it; capture
--   asks the judge whether it replaces, merges with, restates or contests it.
--   Reflection never touches a held value.
-- - Otherwise the nearest live items of the scope reach the judge, which picks
--   one relationship from a closed action set over their stable ids.
--
-- Which value wins a supersession is decided by event time in the decision.

local types = require("types")
local items = require("memory_items")
local models = require("memory_models")

local M = {}

local NEIGHBORS = 5

type Candidate = {
    kind: string,
    key: string,
    cardinality: string?,
    value: any,
    content: string,
    event_id: string?,
    valid_at: string?,
    confidence: number?,
}

type Options = {
    embedding_model: string,
    judge_model: string,
    scope_family: string,
    scope_id: string,
    -- The candidate states the person's own explicit request (Remember), so it
    -- replaces a held single value without a judge.
    explicit: boolean?,
    host_kind: string?,
    host_id: string?,
    -- Span messages candidates cite, by id: when it was said and its text.
    events: { [string]: { at: string?, text: string? } }?,
    run_id: string?,
}

local LIVE = { types.STATUS.CURRENT, types.STATUS.CONFLICT }

-- Reflection derives new memories from what people said; it never replaces,
-- merges or contests their own statements.
local REFLECTION_ACTIONS = { types.ACTION.ADD, types.ACTION.NOOP }

-- Relationships a candidate can have with the value a single-valued key holds.
local HELD_ACTIONS = { types.ACTION.SUPERSEDE, types.ACTION.MERGE, types.ACTION.NOOP, types.ACTION.CONFLICT }

local function provenance_of(opts: Options, candidate: Candidate): { any }
    local event_id = types.trim(candidate.event_id)
    if event_id == "" or not opts.host_kind then return {} end
    return { { host_kind = opts.host_kind, host_id = opts.host_id or "", event_id = event_id } }
end

-- Applies a judged (or decided) action between a new candidate and `targets`.
local function apply(d: any, action: string, scope: any, fields: any, targets: { any }, provenance: { any }): error?
    if action == types.ACTION.NOOP then
        for _, target in ipairs(targets) do
            local seen_err = d:seen(target, provenance)
            if seen_err then return seen_err end
        end
        d.stats.noop = d.stats.noop + 1
        return nil
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
        kind = fields.kind, key = fields.key, content = fields.content, valid_at = fields.valid_at, stated = stated,
    }, neighbors, actions)
    if err then return nil, err end
    d.stats.judged = d.stats.judged + 1
    return verdict, nil
end

-- Reconciles `candidates` into decision `d`.
function M.decide(d: any, candidates: { Candidate }, opts: Options): error?
    if #candidates == 0 then return nil end
    local texts: { string } = {}
    for i, candidate in ipairs(candidates) do texts[i] = candidate.content end
    local embedded, embed_err = models.embed(opts.embedding_model, texts)
    if embed_err then return embed_err end

    local scope = { scope_family = opts.scope_family, scope_id = opts.scope_id }
    local scope_key = types.scope_key(opts.scope_family, opts.scope_id)
    local reflection = d.source == types.ITEM_SOURCE.REFLECTION

    for index, candidate in ipairs(candidates) do
        local key = types.normalize_key(candidate.key)
        local value = candidate.value
        if type(value) == "string" then value = types.trim(value) end
        local event = opts.events and opts.events[types.trim(candidate.event_id)] or {}
        local provenance = provenance_of(opts, candidate)
        local established, card_err = d:cardinality_of(scope_key, key)
        if card_err then return card_err end
        local fields = {
            kind = candidate.kind, key = key, value = value, content = candidate.content,
            cardinality = established or candidate.cardinality or types.CARDINALITY.MULTI,
            valid_at = types.utc(candidate.valid_at) or event.at or d.now,
            confidence = candidate.confidence, provenance = provenance, vector = (embedded :: any)[index], run_id = opts.run_id,
        }
        local claim_id, claim_err = types.claim_id(d.component_id, scope_key, key, value)
        if claim_err then return claim_err end

        local live, live_err = d:claimed(scope_key, claim_id :: string, LIVE)
        if live_err then return live_err end
        local erased, erased_err = d:claimed(scope_key, claim_id :: string, { types.STATUS.FORGOTTEN })
        if erased_err then return erased_err end
        local held, held_err = d:held(scope_key, key)
        if held_err then return held_err end

        if #(live :: any) > 0 then
            local seen_err = d:reuse((live :: any)[1], provenance, {})
            if seen_err then return seen_err end
            d.stats.noop = d.stats.noop + 1
        elseif #(erased :: any) > 0 and not opts.explicit then
            d.stats.suppressed = d.stats.suppressed + 1
        elseif fields.cardinality == types.CARDINALITY.SINGLE and #(held :: any) > 0 then
            if reflection then
                d.stats.noop = d.stats.noop + 1
            elseif opts.explicit then
                local err = apply(d, types.ACTION.SUPERSEDE, scope, fields, held :: any, provenance)
                if err then return err end
            else
                local verdict, err = judge(d, opts, fields, event.text, held :: any, HELD_ACTIONS)
                if err then return err end
                local apply_err = apply(d, verdict.action, scope, fields, held :: any, provenance)
                if apply_err then return apply_err end
            end
        else
            local near, near_err = items.search(d.component_id, fields.vector, {
                statuses = LIVE, scope_keys = { scope_key }, query_text = candidate.content, limit = NEIGHBORS,
            })
            if near_err then return near_err end
            local neighbors: { any } = {}
            local by_id: { [string]: any } = {}
            local function consider(row: any)
                local state = d.overlay[row.id] or row
                if not by_id[state.id] and (state.status == types.STATUS.CURRENT or state.status == types.STATUS.CONFLICT) then
                    neighbors[#neighbors + 1] = state
                    by_id[state.id] = state
                end
            end
            for _, row in ipairs(held :: any) do consider(row) end
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
