local writer = require("memory_writer")
local items = require("memory_items")
local models = require("memory_models")
local types = require("types")
local sql = require("sql")

local function call(a: any): (any?, error?)
    if a.op == "seed" then
        local vectors, err = models.embed("test-embed", { "Synthetic evidence." })
        if err then return nil, err end
        return writer.write(a.component_id, a.idempotency or "seed", { source = "owner" }, function(d: any): (any?, error?)
            local out = {}
            for i = 1, a.count do
                local item, add_err = d:add({ scope_family = "owner", scope_id = a.user }, {
                    kind = "fact", key = a.key or "interests", cardinality = a.cardinality or "multi",
                    value = a.same_value and "shared" or tostring(i), content = "Synthetic evidence " .. tostring(i),
                    valid_at = "2026-01-01T00:00:00Z", vector = vectors[1],
                })
                if add_err then return nil, add_err end
                out[#out + 1] = item
            end
            if a.conflict then
                local conflict_err = d:conflict(out)
                if conflict_err then return nil, conflict_err end
            end
            return out, nil
        end)
    elseif a.op == "append_race" then
        return writer.write(a.component_id, "refused", { source = "owner" }, function(d: any): (any?, error?)
            local vectors, err = models.embed("test-embed", { "Unaccepted evidence." })
            if err then return nil, err end
            local item, add_err = d:add({ scope_family = "owner", scope_id = a.user }, {
                kind = "fact", key = "unaccepted", cardinality = "multi", value = "private", content = "Unaccepted evidence.",
                valid_at = d.now, vector = vectors[1],
            })
            if add_err then return nil, add_err end
            local _, race_err = writer.write(a.component_id, "accepted", {
                source = "owner", extra_events = { { type = types.EVENT.CONSOLIDATION_COMPLETED, body = {} } },
            }, function(_inner: any): (any?, error?) return nil, nil end)
            if race_err then return nil, race_err end
            return item, nil
        end)
    elseif a.op == "expand" then
        return writer.write(a.component_id, "expand", { source = "owner" }, function(d: any): (any?, error?)
            local member, err = d:get(a.item_id)
            if err then return nil, err end
            local added, add_err = d:add({ scope_family = "owner", scope_id = a.user }, {
                kind = "fact", key = "interests", cardinality = "multi", value = "new", content = "New evidence.", valid_at = d.now,
            })
            if add_err then return nil, add_err end
            return nil, d:conflict({ member, added })
        end)
    elseif a.op == "nearest" then
        local vectors, err = models.embed("test-embed", { a.content })
        if err then return nil, err end
        return items.search(a.component_id, vectors[1], { statuses = { "current" }, limit = 1 })
    elseif a.op == "reembed" then
        local vectors, err = models.embed("test-embed", { a.content })
        if err then return nil, err end
        return items.set_embedding(a.component_id, a.item_id, vectors[1], a.content_hash)
    elseif a.op == "replay" then
        local db, err = sql.get("app:db")
        if err then return nil, err end
        local rows, query_err = db:query("SELECT seq, type, body, created_at FROM kickside_event WHERE thread_id = $1 ORDER BY seq", { a.component_id })
        if query_err then db:release(); return nil, query_err end
        for _, statement in ipairs({
            "DELETE FROM kickside_memory_provenance WHERE component_id = $1",
            "DELETE FROM kickside_memory_keys WHERE component_id = $1",
            "DELETE FROM kickside_memory_items WHERE component_id = $1",
        }) do
            local _, del_err = db:execute(statement, { a.component_id })
            if del_err then db:release(); return nil, del_err end
        end
        db:release()
        for _, row in ipairs(rows) do row.body = types.decode_json(row.body) end
        return items.fold(a.component_id, rows)
    end
    return nil, errors.new({ kind = errors.INVALID, message = "unknown regression operation" })
end

return { call = call }
