-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local deletion_worker = require("deletion_worker")
local json = require("json")
local function define_tests()
    test.describe("bounded memory cleanup", function()
        test.it("pages retained store data before completing deletion through the worker", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local other = fixture.memory(user)
            local db = fixture.db()
            local vector = {1}
            for i = 2, 512 do vector[i] = 0 end
            local seeds = {
                {"provenance", "item_id,component_id,host_kind,host_id,event_id,recorded_at", "'item',$1,'session','host',CAST(n AS TEXT),'2026-01-01T00:00:00Z'"},
                {"embeddings", "item_id,component_id,content_hash,embedding", "'vector-' || CAST(n AS TEXT),$1,'hash',$2"},
                {"payloads", "item_id,component_id,owner_item_id,content,content_hash,created_at", "'payload-' || CAST(n AS TEXT),$1,'item','content','hash','2026-01-01T00:00:00Z'"},
                {"keys", "id,component_id,scope_key,key,cardinality", "'key-' || CAST(n AS TEXT),$1,'owner','topic_' || CAST(n AS TEXT),'multi'"},
                {"cursors", "component_id,host_kind,host_id,updated_at", "$1,'session',CAST(n AS TEXT),'2026-01-01T00:00:00Z'"},
                {"run_sources", "component_id,run_id,event_id", "$1,'run',CAST(n AS TEXT)"},
                {"runs", "id,component_id,run_type,status,created_at", "'run-' || CAST(n AS TEXT),$1,'derive','succeeded','2026-01-01T00:00:00Z'"},
            }
            for _, seed in ipairs(seeds) do
                local params = {id}
                if seed[1] == "embeddings" then params[2] = assert(json.encode(vector)) end
                local _, err = db:execute("WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<401) INSERT INTO kickside_memory_" .. seed[1] .. " (" .. seed[2] .. ") SELECT " .. seed[3] .. " FROM seq", params)
                test.is_nil(err, tostring(err))
            end
            assert(db:release())
            local function count(name)
                return fixture.count("SELECT COUNT(*) AS n FROM kickside_memory_" .. name .. " WHERE component_id=$1", {id})
            end
            for _, seed in ipairs(seeds) do
                local before = count(seed[1])
                local page, err = fixture.persistence_op(user, "purge_page", {component_id = id})
                test.is_nil(err, tostring(err))
                test.is_false(page.done)
                test.eq(page.removed, 200)
                test.eq(count(seed[1]), before - 200)
                test.eq(count("stores"), 1)
                if seed[1] ~= "runs" then
                    while count(seed[1]) > 0 do
                        local remaining = count(seed[1])
                        page, err = fixture.persistence_op(user, "purge_page", {component_id = id})
                        test.is_nil(err, tostring(err))
                        test.is_false(page.done)
                        test.eq(page.removed, math.min(remaining, 200))
                        test.eq(count(seed[1]), remaining - page.removed)
                    end
                end
            end
            test.is_true(count("runs") > 200)
            local accepted, err = fixture.delete_memory(user, id)
            test.is_nil(err, tostring(err))
            test.is_true(accepted.in_progress)
            fixture.wait_job(accepted.job_id, "done")
            local finished, finish_err = deletion_worker.await(id)
            test.is_nil(finish_err, tostring(finish_err))
            test.is_true(finished)
            for _, seed in ipairs(seeds) do test.eq(count(seed[1]), 0) end
            test.eq(count("stores"), 0)
            test.eq(fixture.count("SELECT COUNT(*) AS n FROM kickside_memory_stores WHERE component_id=$1", {other}), 1)
        end)

        test.it("finishes bounded memory cleanup without exhausting deletion attempts", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local db = fixture.db()
            assert(db:execute([[WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<12001)
                INSERT INTO kickside_memory_items
                (id,component_id,claim_id,kind,scope_family,scope_id,scope_key,key,cardinality,content,content_hash,status,version,valid_at,recorded_at,source,last_seq)
                SELECT 'bulk-' || CAST(n AS TEXT),$1,'claim-' || CAST(n AS TEXT),'fact','owner',$2,'owner','key-' || CAST(n AS TEXT),
                    'many','synthetic content','hash','active',1,'2026-01-01T00:00:00Z','2026-01-01T00:00:00Z','test',0 FROM seq]], {id,user}))
            local accepted, delete_err = fixture.delete_memory(user,id)
            test.is_nil(delete_err,tostring(delete_err))
            test.is_false(accepted.deleted)
            test.is_true(accepted.in_progress)
            test.not_nil(accepted.job_id)
            assert(db:release())
            fixture.wait_job(accepted.job_id, "done")
            local finished, finish_err = deletion_worker.await(id)
            db = fixture.db()
            local jobs
            jobs = assert(db:query("SELECT status,attempts,last_error FROM kickside_job WHERE id=$1",{accepted.job_id}))
            local items = assert(db:query("SELECT COUNT(*) AS n FROM kickside_memory_items WHERE component_id=$1",{id}))
            assert(db:release())
            test.is_true(finished,json.encode({job=jobs[1],remaining=items[1].n,error=tostring(finish_err)}))
            test.is_nil(finish_err, tostring(finish_err))
            test.eq(tonumber(items[1].n), 0)
            test.eq(jobs[1].status, "done")
            test.eq(fixture.count("SELECT COUNT(*) AS n FROM kickside_components WHERE component_id=$1", {id}), 0)
        end)
    end)
end
return {run=test.run_cases(define_tests)}
