-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local sql = require("sql")
local db = require("memory_db")
local types = require("types")
local index = require("search_index")
local items = require("memory_items")
local payloads = require("memory_payloads")
local runs = require("memory_runs")

local M = {}

local PROVENANCE_INSERT = "INSERT INTO kickside_memory_provenance (item_id, component_id, host_kind, host_id, event_id, recorded_at) "

local CLEAR = {}

local function event_string(body: any, name: string): (string?, error?)
    local value = body[name]
    if type(value) ~= "string" or value == "" then return nil, types.internal("malformed ledger event") end
    return value, nil
end

local function event_array(value: any): ({ any }?, error?)
    if type(value) ~= "table" then return nil, types.internal("malformed ledger event") end
    local count = 0
    for index, _ in pairs(value) do
        if type(index) ~= "number" or index ~= math.floor(index) or index < 1 then
            return nil, types.internal("malformed ledger event")
        end
        count = count + 1
    end
    for index = 1, count do
        if value[index] == nil then return nil, types.internal("malformed ledger event") end
    end
    return value, nil
end

local function event_ids(body: any): ({ string }?, error?)
    local ids, array_err = event_array(body.item_ids)
    if array_err then return nil, array_err end
    for _, id in ipairs(ids :: { any }) do
        if type(id) ~= "string" or id == "" then return nil, types.internal("malformed ledger event") end
    end
    return ids :: { string }, nil
end
local function set_fts_tx(tx: any, sqlite: boolean, item_id: string, content: string?): error?
    if not sqlite then return nil end
    local _, del_err = tx:execute("DELETE FROM kickside_memory_fts WHERE item_id = $1", { item_id })
    if del_err then return types.failed("memory full-text delete failed", del_err) end
    if content and content ~= "" then
        local _, ins_err = tx:execute("INSERT INTO kickside_memory_fts (item_id, content) VALUES ($1, $2)", { item_id, content })
        if ins_err then return types.failed("memory full-text insert failed", ins_err) end
    end
    return nil
end

local function provenance_refs(refs: any): ({ any }?, error?)
    local values, array_err = event_array(refs)
    if array_err then return nil, array_err end
    for _, ref in ipairs(values :: { any }) do
        if type(ref) ~= "table" or type(ref.host_kind) ~= "string" or type(ref.host_id) ~= "string" or type(ref.event_id) ~= "string"
            or (ref.event_id == "" and (ref.host_kind ~= "item" or ref.host_id == "")) then return nil, types.internal("malformed ledger event") end
    end
    return values, nil
end

local function add_provenance_tx(tx: any, component_id: string, item_id: string, refs: any, recorded_at: string): error?
    local values, refs_err = provenance_refs(refs)
    if refs_err then return refs_err end
    for _, ref in ipairs(values :: { any }) do
        local _, err = tx:execute(
            PROVENANCE_INSERT .. "VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
            { item_id, component_id, ref.host_kind, ref.host_id, ref.event_id, recorded_at })
        if err then return types.failed("memory provenance insert failed", err) end
    end
    return nil
end

local function set_status_tx(tx: any, component_id: string, item_id: string, seq: integer, fields: { [string]: any }): error?
    local sets: { string } = {}
    local params: { any } = {}
    for _, name in ipairs({ "status", "superseded_by", "invalid_at", "conflict_group", "content", "value", "content_hash", "priority", "source" }) do
        if fields[name] == CLEAR then
            sets[#sets + 1] = name .. " = NULL"
        elseif fields[name] ~= nil then
            params[#params + 1] = fields[name]
            sets[#sets + 1] = name .. " = $" .. #params
        end
    end
    params[#params + 1] = seq
    sets[#sets + 1] = "last_seq = $" .. #params
    params[#params + 1] = component_id
    params[#params + 1] = item_id
    params[#params + 1] = seq
    local _, err = tx:execute("UPDATE kickside_memory_items SET " .. table.concat(sets, ", ") ..
        " WHERE component_id = $" .. (#params - 2) .. " AND id = $" .. (#params - 1) .. " AND last_seq < $" .. #params, params)
    if err then return types.failed("memory item update failed", err) end
    return nil
end

local function item_before_seq_tx(tx: any, component_id: string, item_id: string, seq: integer): (any?, boolean?, error?)
    local item, read_err = items.get_tx(tx, component_id, item_id)
    if read_err then return nil, nil, read_err end
    return item, item ~= nil and item.last_seq < seq, nil
end

local function next_version_tx(tx: any, component_id: string, scope_key: string, key: string): (integer?, error?)
    local rows, err = tx:query(
        "SELECT MAX(version) AS version FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND key = $3",
        { component_id, scope_key, key })
    if err then return nil, types.failed("memory version read failed", err) end
    return (rows and rows[1] and tonumber(rows[1].version) or 0) + 1, nil
end

local function apply_added(tx: any, sqlite: boolean, component_id: string, seq: integer, body: any, recorded_at: string): error?
    local item_id = types.trim(body.item_id)
    if item_id == "" then return types.invalid("item.added requires item_id") end
    local _, provenance_err = provenance_refs(body.provenance)
    if provenance_err then return provenance_err end
    local existing, read_err = items.get_tx(tx, component_id, item_id)
    if read_err then return read_err end
    if existing then
        if existing.last_seq >= seq then return nil end
        local provenance_err = add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at)
        if provenance_err then return provenance_err end
        return set_status_tx(tx, component_id, item_id, seq, {})
    end
    local payload, payload_err = payloads.get_tx(tx, component_id, item_id)
    if payload_err then return payload_err end
    local scope_key = types.scope_key(body.scope_family, body.scope_id)
    local keys, key_err = tx:query("SELECT key FROM kickside_memory_keys WHERE component_id = $1 AND id = $2", { component_id, body.key_id })
    if key_err then return types.failed("memory key read failed", key_err) end
    if not keys or not keys[1] then return types.internal("memory item has no topic key") end
    local key = keys[1].key
    local version, version_err = next_version_tx(tx, component_id, scope_key, key)
    if version_err then return version_err end
    local status = payload and types.STATUS.CURRENT or types.STATUS.FORGOTTEN
    local content = payload and payload.content or ""
    local value, value_err = sql.NULL, nil
    if payload then value, value_err = payloads.encode_value(payload.value) end
    if value_err then return value_err end
    local _, err = tx:execute(
        "INSERT INTO kickside_memory_items (id, component_id, claim_id, kind, scope_family, scope_id, scope_key, key, cardinality, " ..
        "content, value, content_hash, status, version, valid_at, recorded_at, confidence, source, run_id, priority, last_seq) " ..
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)",
        { item_id, component_id, body.claim_id, body.kind, body.scope_family, body.scope_id, scope_key, key, body.cardinality,
            content, value, body.content_hash, status, version, body.valid_at, recorded_at,
            tonumber(body.confidence) or sql.NULL, body.source, body.run_id or sql.NULL, tonumber(body.priority) or 0, seq })
    if err then return types.failed("memory item insert failed", err) end
    if not payload then return nil end
    local _, vector_err = payloads.replace_embedding_tx(tx, sqlite, component_id, item_id, payload.embedding, payload.content_hash)
    if vector_err then return vector_err end
    local fts_err = set_fts_tx(tx, sqlite, item_id, content)
    if fts_err then return fts_err end
    return add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at)
end

local function apply_revised(tx: any, sqlite: boolean, component_id: string, seq: integer, body: any): error?
    local item_id = types.trim(body.item_id)
    local current, read_err = items.get_tx(tx, component_id, item_id)
    if read_err then return read_err end
    if not current or current.last_seq >= seq then return nil end
    local payload, payload_err = payloads.get_tx(tx, component_id, types.trim(body.payload_id))
    if payload_err then return payload_err end
    local fields: { [string]: any } = { content_hash = body.content_hash }
    if body.source ~= nil then fields.source = body.source end
    if body.priority ~= nil then fields.priority = math.floor(tonumber(body.priority) or 0) end
    if payload then
        fields.content = payload.content
        fields.content_hash = payload.content_hash
    end
    local update_err = set_status_tx(tx, component_id, item_id, seq, fields)
    if update_err then return update_err end
    if not payload then return nil end
    local _, vector_err = payloads.replace_embedding_tx(tx, sqlite, component_id, item_id, payload.embedding, payload.content_hash)
    if vector_err then return vector_err end
    return set_fts_tx(tx, sqlite, item_id, payload.content)
end

local function supersede_tx(tx: any, component_id: string, item_id: string, successor_id: string, seq: integer, invalid_at: string): error?
    return set_status_tx(tx, component_id, item_id, seq, {
        status = types.STATUS.SUPERSEDED, superseded_by = successor_id, invalid_at = invalid_at, conflict_group = CLEAR,
    })
end

-- Source ownership joins identify the retained inputs that erasure clears.
local function scrub_runs_tx(tx: any, component_id: string, forgotten: { string }): error?
    for first = 1, #forgotten, 200 do
        local params: { any } = { component_id }
        for i = first, math.min(first + 199, #forgotten) do params[#params + 1] = forgotten[i] end
        local ids = index.placeholders(#params - 1, 2)
        local source_identities = "(SELECT p.component_id, p.host_kind, p.host_id, p.event_id FROM kickside_memory_items i " ..
            "JOIN kickside_memory_provenance p ON p.component_id = i.component_id AND p.item_id = i.id " ..
            "WHERE i.component_id = $1 AND i.id IN (" .. ids .. ") " ..
            "GROUP BY p.component_id, p.host_kind, p.host_id, p.event_id) p"
        local source_runs = "SELECT s.run_id FROM " .. source_identities .. " JOIN kickside_memory_run_sources s " ..
            "ON s.component_id = p.component_id AND s.event_id = p.event_id JOIN kickside_memory_runs r " ..
            "ON r.component_id = s.component_id AND r.id = s.run_id AND r.host_kind = p.host_kind AND r.host_id = p.host_id"
        local _, err = tx:execute("UPDATE kickside_memory_runs SET input = '{}' WHERE component_id = $1 AND " ..
            "id IN (SELECT run_id FROM kickside_memory_items WHERE component_id = $1 AND id IN (" .. ids .. ") UNION " ..
            source_runs .. ")", params)
        if err then return types.failed("memory source input erase failed", err) end
    end
    return nil
end

local function invalidate_pins_tx(tx: any, component_id: string, owner_scope_key: string): error?
    local _, err = tx:execute("UPDATE kickside_memory_cursors SET pinned_prompt = NULL, pinned_ids = NULL, pinned_head = NULL WHERE component_id = $1 AND (owner_scope_key = $2 OR 'agent:' || agent_id = $2)",
        { component_id, owner_scope_key })
    if err then return types.failed("memory pin invalidation failed", err) end
    return nil
end

local function apply_forgotten(tx: any, sqlite: boolean, component_id: string, seq: integer, item_id: string, recorded_at: string): error?
    local item, before, item_err = item_before_seq_tx(tx, component_id, item_id, seq)
    if item_err then return item_err end
    if not item then return types.internal("memory forgotten item is missing") end
    if not before then return nil end
    for _, statement in ipairs({
        "DELETE FROM kickside_memory_payloads WHERE component_id = $1 AND owner_item_id = $2",
        "DELETE FROM kickside_memory_embeddings WHERE component_id = $1 AND item_id = $2",
        "DELETE FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2",
    }) do
        local _, err = tx:execute(statement, { component_id, item_id })
        if err then return types.failed("memory erase failed", err) end
    end
    local fts_err = set_fts_tx(tx, sqlite, item_id, nil)
    if fts_err then return fts_err end
    local pin_err = invalidate_pins_tx(tx, component_id, item.scope_key)
    if pin_err then return pin_err end
    return set_status_tx(tx, component_id, item_id, seq, {
        status = types.STATUS.FORGOTTEN, invalid_at = recorded_at, content = "", value = CLEAR, conflict_group = CLEAR,
    })
end

local function apply_event(tx: any, sqlite: boolean, component_id: string, event: any): error?
    if type(event) ~= "table" or type(event.seq) ~= "number" or event.seq ~= math.floor(event.seq) or event.seq < 1
        or type(event.body) ~= "table" then return types.internal("malformed ledger event") end
    local recorded_at = types.utc(event.created_at)
    if not recorded_at then return types.internal("malformed ledger event") end
    local seq = event.seq :: integer
    local body = event.body
    local kind = event.type
    if kind == types.EVENT.ITEM_ADDED then
        return apply_added(tx, sqlite, component_id, seq, body, recorded_at)
    elseif kind == types.EVENT.ITEM_REVISED then
        return apply_revised(tx, sqlite, component_id, seq, body)
    elseif kind == types.EVENT.ITEM_SUPERSEDED then
        local item_id, item_err = event_string(body, "item_id")
        if item_err then return item_err end
        local by, by_err = event_string(body, "by")
        if by_err then return by_err end
        local invalid_at = types.utc(body.invalid_at)
        if not invalid_at then return types.internal("malformed ledger event") end
        return supersede_tx(tx, component_id, item_id :: string, by :: string, seq, invalid_at)
    elseif kind == types.EVENT.ITEM_MERGED then
        local into, into_err = event_string(body, "into")
        if into_err then return into_err end
        local ids, ids_err = event_ids(body)
        if ids_err then return ids_err end
        local destination, destination_before, destination_err = item_before_seq_tx(tx, component_id, into :: string, seq)
        if destination_err then return destination_err end
        if not destination then return types.internal("memory merge destination is missing") end
        if not destination_before then return nil end
        for _, item_id in ipairs(ids :: { string }) do
            local _, source_before, source_err = item_before_seq_tx(tx, component_id, item_id, seq)
            if source_err then return source_err end
            if source_before then
                local _, copy_err = tx:execute(
                    PROVENANCE_INSERT .. "SELECT $1, component_id, host_kind, host_id, event_id, recorded_at FROM kickside_memory_provenance " ..
                    "WHERE component_id = $2 AND item_id = $3 ON CONFLICT DO NOTHING", { into, component_id, item_id })
                if copy_err then return types.failed("memory provenance merge failed", copy_err) end
                local err = supersede_tx(tx, component_id, item_id, into, seq, recorded_at)
                if err then return err end
            end
        end
        return set_status_tx(tx, component_id, into :: string, seq, {})
    elseif kind == types.EVENT.ITEM_CONFLICTED then
        local ids, ids_err = event_ids(body)
        if ids_err then return ids_err end
        local group_id, group_err = event_string(body, "group_id")
        if group_err then return group_err end
        for _, item_id in ipairs(ids :: { string }) do
            local err = set_status_tx(tx, component_id, item_id, seq, { status = types.STATUS.CONFLICT, conflict_group = group_id })
            if err then return err end
        end
        return nil
    elseif kind == types.EVENT.ITEM_ARCHIVED then
        local item_id, id_err = event_string(body, "item_id")
        if id_err then return id_err end
        local item, item_err = items.get_tx(tx, component_id, item_id :: string)
        if item_err then return item_err end
        if not item then return types.internal("memory archived item is missing") end
        if item.last_seq >= seq then return nil end
        local pin_err = invalidate_pins_tx(tx, component_id, item.scope_key)
        if pin_err then return pin_err end
        return set_status_tx(tx, component_id, item_id :: string, seq, {
            status = types.STATUS.ARCHIVED, invalid_at = recorded_at, conflict_group = CLEAR,
        })
    elseif kind == types.EVENT.ITEM_RESTORED then
        local item_id, id_err = event_string(body, "item_id")
        if id_err then return id_err end
        local item, item_err = items.get_tx(tx, component_id, item_id :: string)
        if item_err then return item_err end
        if not item then return types.internal("memory restored item is missing") end
        if item.last_seq >= seq then return nil end
        local pin_err = invalidate_pins_tx(tx, component_id, item.scope_key)
        if pin_err then return pin_err end
        return set_status_tx(tx, component_id, item_id :: string, seq, {
            status = types.STATUS.CURRENT, invalid_at = CLEAR, superseded_by = CLEAR, conflict_group = CLEAR,
        })
    elseif kind == types.EVENT.ITEM_FORGOTTEN then
        local item_id, item_err = event_string(body, "item_id")
        if item_err then return item_err end
        return apply_forgotten(tx, sqlite, component_id, seq, item_id :: string, recorded_at)
    elseif kind == types.EVENT.PROVENANCE_ADDED then
        local item_id, item_err = event_string(body, "item_id")
        if item_err then return item_err end
        local item, before, read_err = item_before_seq_tx(tx, component_id, item_id :: string, seq)
        if read_err then return read_err end
        if not item then return types.internal("memory provenance item is missing") end
        if not before then return nil end
        local provenance_err = add_provenance_tx(tx, component_id, item_id :: string, { body }, recorded_at)
        if provenance_err then return provenance_err end
        return set_status_tx(tx, component_id, item_id :: string, seq, {})
    elseif kind == types.EVENT.CAPTURE_ADVANCED then
        for _, name in ipairs({ "host_kind", "host_id", "last_event_id" }) do
            if type(body[name]) ~= "string" or body[name] == "" then return types.internal("malformed ledger event") end
        end
        for _, name in ipairs({ "agent_id", "from_event_id" }) do
            if body[name] ~= nil and (type(body[name]) ~= "string" or body[name] == "") then return types.internal("malformed ledger event") end
        end
        return runs.advance_cursor_tx(tx, component_id, body, recorded_at)
    elseif kind == types.EVENT.CONSOLIDATION_COMPLETED then
        return nil
    end
    return types.internal("unknown memory ledger event: " .. tostring(kind))
end

function M.fold(component_id: string, events: { any }): (any?, error?)
    return db.write(component_id, function(tx: any, sqlite: boolean): (any, error?)
        local event_index = 1
        while event_index <= #events do
            local event = events[event_index]
            if type(event) ~= "table" or type(event.body) ~= "table" then return nil, types.internal("malformed ledger event") end
            if event.type ~= types.EVENT.ITEM_FORGOTTEN then
                local err = apply_event(tx, sqlite, component_id, event)
                if err then return nil, err end
                event_index = event_index + 1
            else
                local forgotten: { string } = {}
                local block_end = event_index
                while block_end <= #events do
                    local candidate = events[block_end]
                    if type(candidate) ~= "table" or type(candidate.body) ~= "table" then
                        return nil, types.internal("malformed ledger event")
                    end
                    if candidate.type ~= types.EVENT.ITEM_FORGOTTEN then break end
                    if type(candidate.seq) ~= "number"
                        or candidate.seq ~= math.floor(candidate.seq) or candidate.seq < 1 or not types.utc(candidate.created_at) then
                        return nil, types.internal("malformed ledger event")
                    end
                    local item_id, item_err = event_string(candidate.body, "item_id")
                    if item_err then return nil, item_err end
                    local item, before, read_err = item_before_seq_tx(tx, component_id, item_id :: string, candidate.seq :: integer)
                    if read_err then return nil, read_err end
                    if not item then return nil, types.internal("memory forgotten item is missing") end
                    if before then forgotten[#forgotten + 1] = item_id :: string end
                    block_end = block_end + 1
                end
                local scrub_err = scrub_runs_tx(tx, component_id, forgotten)
                if scrub_err then return nil, scrub_err end
                for current = event_index, block_end - 1 do
                    local err = apply_event(tx, sqlite, component_id, events[current])
                    if err then return nil, err end
                end
                event_index = block_end
            end
        end
        return true, nil
    end)
end

return M
