-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local deletion_worker = require("deletion_worker")
local json = require("json")
local function define_tests()
    test.describe("bounded memory cleanup", function()
        test.it("finishes bounded memory cleanup without exhausting deletion attempts", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local db = fixture.db()
            assert(db:execute([[WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<12001)
                INSERT INTO kickside_memory_kb_items
                (id,component_id,claim_id,kind,scope_family,scope_id,scope_key,key,cardinality,content,content_hash,status,version,valid_at,recorded_at,source,last_seq)
                SELECT 'bulk-' || CAST(n AS TEXT),$1,'claim-' || CAST(n AS TEXT),'fact','owner',$2,'owner','key-' || CAST(n AS TEXT),
                    'many','synthetic content','hash','active',1,'2026-01-01T00:00:00Z','2026-01-01T00:00:00Z','test',0 FROM seq]], {id,user}))
            local accepted, delete_err = fixture.delete_memory(user,id)
            test.is_nil(delete_err,tostring(delete_err))
            assert(db:release())
            local finished, finish_err = deletion_worker.await(id)
            db = fixture.db()
            local jobs
            jobs = assert(db:query("SELECT status,attempts,last_error FROM kickside_job WHERE id=$1",{accepted.job_id}))
            local items = assert(db:query("SELECT COUNT(*) AS n FROM kickside_memory_kb_items WHERE component_id=$1",{id}))
            assert(db:release())
            test.is_true(finished,json.encode({job=jobs[1],remaining=items[1].n,error=tostring(finish_err)}))
        end)
    end)
end
return {run=test.run_cases(define_tests)}
