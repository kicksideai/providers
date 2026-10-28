-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local decision = require("memory_decision")
local writer = require("memory_writer")
local ledger = require("memory_ledger")
local items = require("memory_items")
local fold = require("memory_fold")
local payloads = require("memory_payloads")
local models = require("memory_models")
local types = require("types")
local sql = require("sql")
local index = require("search_index")
local measured_db = require("measured_db")
local runs = require("memory_runs")
local reconcile = require("memory_reconcile")

local function call(a: any): (any?, error?)
    if a.op == "record_provenance" then
        return writer.write(a.component_id, "refs:" .. (a.item_id or "new"), { source = "reflection" }, function(d: any): (any?, error?)
            local refs = { { host_kind = "item", host_id = a.source_id, event_id = "" } }
            if a.item_id then
                local item, err = d:get(a.item_id)
                if err then return nil, err end
                return true, d:seen(item, refs)
            end
            return d:add({ scope_family = "owner", scope_id = a.user }, {
                kind = "fact", key = "contact_guidance", cardinality = "multi", value = "evening",
                content = "Contact in the evening.", valid_at = d.now, provenance = refs,
            })
        end)
    elseif a.op == "decide_cost" then
        measured_db.reset()
        local d = decision.new(a.component_id, "decide-cost", "capture", a.user)
        local err = reconcile.decide(d, a.candidates, {
            embedding_model = "test-embed", judge_model = "test-fast", scope_family = "owner", scope_id = a.user,
        })
        if err then return nil, err end
        return { queries = #measured_db.statements(), records = measured_db.records(), added = d.stats.added }, nil
    elseif a.op == "check_cost" then
        local d = decision.new(a.component_id, "check-cost", "owner", a.user)
        for i = 1, a.count do
            local _, err = d:add({ scope_family = "owner", scope_id = a.user }, {
                kind = "fact", key = "attribute_" .. tostring(i), cardinality = a.cardinality,
                value = "recorded", content = "A recorded attribute.", valid_at = d.now,
            })
            if err then return nil, err end
        end
        measured_db.reset()
        local _, check_err = measured_db.write(a.component_id, function(tx: any): (any?, error?)
            return true, d:check(tx)
        end)
        if check_err then return nil, check_err end
        return { queries = #measured_db.statements() }, nil
    elseif a.op == "enroll_sources" then
        local run, read_err = runs.get(a.run_id)
        if read_err then return nil, read_err end
        local db, db_err = sql.get("app:db")
        if db_err then return nil, db_err end
        local tx, tx_err = db:begin()
        if tx_err then db:release(); return nil, tx_err end
        local err = runs.sources_tx(tx, run)
        if err then tx:rollback(); db:release(); return nil, err end
        local _, commit_err = tx:commit()
        db:release()
        return true, commit_err
    elseif a.op == "seed" then
        local vectors, err = models.embed("test-embed", { a.content or "Synthetic evidence." })
        if err then return nil, err end
        return writer.write(a.component_id, a.idempotency or "seed", { source = "owner" }, function(d: any): (any?, error?)
            local out = {}
            for i = 1, a.count do
                local item, add_err = d:add({ scope_family = "owner", scope_id = a.user }, {
                    kind = "fact", key = a.distinct_keys and "attribute_" .. tostring(i) or a.key or "interests", cardinality = a.cardinality or "multi",
                    value = a.distinct_keys and "initial" or a.same_value and "shared" or tostring(i), content = a.content or "Synthetic evidence " .. tostring(i),
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
    elseif a.op == "measure_run_reads" then
        measured_db.reset()
        local _, err = measured_db.read(function(conn: any): (any?, error?)
            return conn:query("SELECT input FROM kickside_memory_runs AS retained WHERE component_id = $1", { a.component_id })
        end)
        if err then return nil, err end
        return { queries = measured_db.run_reads(), rows = measured_db.run_rows() }, nil
    elseif a.op == "erase_cost" then
        local item, err = items.get(a.component_id, a.item_id)
        if err then return nil, err end
        measured_db.reset()
        local lineage, lineage_err = items.lineage(a.component_id, item)
        if lineage_err then return nil, lineage_err end
        local lineage_queries = #measured_db.statements()
        local db = assert(sql.get("app:db"))
        local sqlite = db:type() == sql.type.SQLITE
        local plan = ""
        if sqlite then
            local rows, plan_err = db:query("EXPLAIN QUERY PLAN " .. measured_db.statements()[1], { a.component_id, a.item_id, item.scope_key })
            if plan_err then db:release(); return nil, plan_err end
            for _, row in ipairs(rows) do plan = plan .. tostring(row.detail) .. "\n" end
        end
        db:release()
        local events = {}
        for _, row in ipairs(lineage) do
            events[#events + 1] = { type = types.EVENT.ITEM_FORGOTTEN, seq = a.seq, body = { item_id = row.id } }
        end
        local _, fold_err = fold.fold(a.component_id, events)
        if fold_err then return nil, fold_err end
        local scans = measured_db.run_reads()
        local run_rows = measured_db.run_rows()
        local source_plan = ""
        db = assert(sql.get("app:db"))
        for _, record in ipairs(measured_db.records()) do
            if record.statement:lower():match("^update%s+kickside_memory_runs%s") then
                local rows, plan_err = db:query((sqlite and "EXPLAIN QUERY PLAN " or "EXPLAIN ") .. record.statement, record.params)
                if plan_err then db:release(); return nil, plan_err end
                for _, row in ipairs(rows) do source_plan = source_plan .. tostring(sqlite and row.detail or row["QUERY PLAN"]) .. "\n" end
            end
        end
        db:release()
        return { run_scans = scans, run_rows = run_rows, lineage_queries = lineage_queries, erased = #lineage,
            sqlite = sqlite, plan = plan, source_plan = source_plan }, nil
    elseif a.op == "revision_race" or a.op == "revision_redelivery" then
        local item, err = items.get(a.component_id, a.item_id)
        if err then return nil, err end
        local vector: { number } = {}
        for i = 1, 512 do vector[i] = i == 2 and 1 or 0 end
        local payload_id = "revision-test:" .. a.item_id
        local content = a.op == "revision_race" and "Revised presentation." or "olderword"
        local hash, hash_err = types.content_hash(a.component_id, content, item.value)
        if hash_err then return nil, hash_err end
        local db, db_err = sql.get("app:db")
        if db_err then return nil, db_err end
        local tx, tx_err = db:begin()
        if tx_err then db:release(); return nil, tx_err end
        local stage_err = payloads.stage_tx(tx, a.component_id, { { payload_id = payload_id, owner_item_id = item.id,
            content = content, value = item.value, content_hash = hash :: string, vector = vector } })
        if stage_err then tx:rollback(); db:release(); return nil, stage_err end
        local _, commit_err = tx:commit()
        db:release()
        if commit_err then return nil, commit_err end
        local event = { type = types.EVENT.ITEM_REVISED, seq = item.last_seq + 1,
            body = { item_id = item.id, payload_id = payload_id, content_hash = hash } }
        if a.op == "revision_race" then
            db = assert(sql.get("app:db"))
            local staged = assert(db:query("SELECT content_hash FROM kickside_memory_embeddings WHERE item_id = $1", { item.id }))
            db:release()
            local stale, stale_err = payloads.set_embedding(a.component_id, item.id, vector, item.content_hash)
            if stale_err then return nil, stale_err end
            local _, fold_err = fold.fold(a.component_id, { event })
            if fold_err then return nil, fold_err end
            db = assert(sql.get("app:db"))
            local folded = assert(db:query("SELECT content_hash FROM kickside_memory_embeddings WHERE item_id = $1", { item.id }))
            db:release()
            return { stale_written = stale, staged_hash = staged[1].content_hash, original_hash = item.content_hash,
                vector_hash = folded[1].content_hash, item = items.get(a.component_id, item.id) }, nil
        end
        local _, fold_err = fold.fold(a.component_id, { event })
        if fold_err then return nil, fold_err end
        local revised_hash, revised_hash_err = types.content_hash(a.component_id, "newestword", item.value)
        if revised_hash_err then return nil, revised_hash_err end
        db = assert(sql.get("app:db"))
        tx = assert(db:begin())
        local latest_err = payloads.stage_tx(tx, a.component_id, { { payload_id = payload_id .. ":latest", owner_item_id = item.id,
            content = "newestword", value = item.value, content_hash = revised_hash :: string, vector = vector } })
        if latest_err then tx:rollback(); db:release(); return nil, latest_err end
        local _, latest_commit_err = tx:commit()
        db:release()
        if latest_commit_err then return nil, latest_commit_err end
        local latest = { type = types.EVENT.ITEM_REVISED, seq = item.last_seq + 2,
            body = { item_id = item.id, payload_id = payload_id .. ":latest", content_hash = revised_hash } }
        local _, latest_fold_err = fold.fold(a.component_id, { latest, event, latest, event })
        return true, latest_fold_err
    elseif a.op == "lexical" then
        local db, err = sql.get("app:db")
        if err then return nil, err end
        local rows, search_err = index.lexical_search(db, {
            vectors = "kickside_memory_embeddings", vector_key = "item_id", rows = "kickside_memory_items", row_key = "id",
            partition = "component_id", columns = { "content" }, fts = "kickside_memory_fts", fts_key = "item_id", tsvector = "search_vector",
        }, a.query, { partition = a.component_id, limit = 10 })
        db:release()
        return rows, search_err
    elseif a.op == "invariant_race" then
        return writer.write(a.component_id, "outdated-decision", { source = "owner" }, function(d: any): (any?, error?)
            local previous, read_err = d:get(a.item_id)
            if read_err then return nil, read_err end
            local held, held_err = d:held(previous.scope_key, previous.key)
            if held_err then return nil, held_err end
            local successor, add_err = d:add({ scope_family = "owner", scope_id = a.user }, {
                kind = "fact", key = previous.key, cardinality = "single", value = "Berlin", content = "The user lives in Berlin.", valid_at = d.now,
            })
            if add_err then return nil, add_err end
            local replace_err = d:replace(held, successor)
            if replace_err then return nil, replace_err end
            local _, concurrent_err = writer.write(a.component_id, "concurrent-decision", {source="owner"}, function(other: any): (any?, error?)
                local current, current_err = other:get(a.item_id)
                if current_err then return nil, current_err end
                local item, item_err = other:add({scope_family="owner", scope_id=a.user}, {
                    kind="fact", key=current.key, cardinality="single", value="Rome", content="The user lives in Rome.", valid_at=other.now,
                })
                if item_err then return nil, item_err end
                return item, other:replace({current}, item)
            end)
            if concurrent_err then return nil, concurrent_err end
            local _, settle_err = ledger.settled_head(a.component_id)
            return successor, settle_err
        end)
    elseif a.op == "append_race" then
        local attempts = 0
        return writer.write(a.component_id, "refused", { source = "owner" }, function(d: any): (any?, error?)
            attempts = attempts + 1
            local vectors, err = models.embed("test-embed", { "Unaccepted evidence." })
            if err then return nil, err end
            local item, add_err = d:add({ scope_family = "owner", scope_id = a.user }, {
                kind = "fact", key = "unaccepted", cardinality = "multi", value = "private", content = "Unaccepted evidence.",
                valid_at = d.now, vector = vectors[1],
            })
            if add_err then return nil, add_err end
            local _, race_err = writer.write(a.component_id, a.contended and "accepted:" .. tostring(attempts) or "accepted", {
                source = "owner", extra_events = { { type = types.EVENT.CONSOLIDATION_COMPLETED, body = {} } },
            }, function(_inner: any): (any?, error?) return nil, nil end)
            if race_err then return nil, race_err end
            return { item = item, attempts = attempts }, nil
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
        return payloads.set_embedding(a.component_id, a.item_id, vectors[1], a.content_hash)
    elseif a.op == "replay" then
        local db, err = sql.get("app:db")
        if err then return nil, err end
        local rows, query_err = db:query("SELECT seq, type, body, created_at FROM kickside_event WHERE thread_id = $1 ORDER BY seq", { a.component_id })
        if query_err then db:release(); return nil, query_err end
        for _, statement in ipairs({
            "DELETE FROM kickside_memory_provenance WHERE component_id = $1",
            "DELETE FROM kickside_memory_items WHERE component_id = $1",
        }) do
            local _, del_err = db:execute(statement, { a.component_id })
            if del_err then db:release(); return nil, del_err end
        end
        db:release()
        for _, row in ipairs(rows) do row.body = types.decode_json(row.body) end
        return fold.fold(a.component_id, rows)
    end
    return nil, errors.new({ kind = errors.INVALID, message = "unknown regression operation" })
end

return { call = call }
