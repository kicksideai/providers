-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local outcomes=require("outcomes")
local store=require("store")
local sql=require("sql")
local crypto=require("crypto")
local json=require("json")

local function row(status: string, error: string?): any
    return {status=status,error=error}
end

local function uuid(): string
    local value,err=crypto.random.uuid()
    if err then error(tostring(err)) end
    return value
end

local function cleanup(db: any, store_id: string): ()
    db:execute("DELETE FROM kb10_nodes WHERE store_id=$1",{store_id})
    db:execute("DELETE FROM kb10_stores WHERE id=$1",{store_id})
end

return {run=test.run_cases(function()
    test.describe("KB10 publication Activity outcomes",function()
        test.it("projects indexed and failed materialization from the exact publication",function()
            test.eq(outcomes.classify_for_test(row("completed")).status,"indexed")
            local failed=outcomes.classify_for_test(row("failed","invalid UTF-8"))
            test.eq(failed.status,"failed");test.eq(failed.reason,"invalid UTF-8")
        end)
        test.it("omits an unmatched historical receipt rather than inferring a queue state",function()
            test.eq(next(outcomes.classify_for_test(nil)),nil)
        end)
        test.it("groups one bounded read per authorized KB and omits denied or stale receipts",function()
            local kb1,kb2="018f0000-0000-7000-8000-000000000001","018f0000-0000-7000-8000-000000000002"
            local publication="018f0000-0000-7000-8000-000000000010"
            local access,stores,reads=0,0,0
            local component={ACCESS={READ=1},validate_access=function(id:any)
                access=access+1;if id == kb2 then return nil,"denied" end;return 1,nil end}
            local store={get_store=function(id:any) stores=stores+1;return {id=id},nil end,
                publication_outcomes=function(_id:any,refs:any)
                    reads=reads+1;test.eq(#refs,2)
                    return {{external_id="current",publication_id=publication,status="completed"}},nil
                end}
            local rows=assert(outcomes.lookup_for_test(component,store,{
                {kb_id=kb1,external_id="current",publication_id=publication},
                {kb_id=kb1,external_id="old",publication_id="018f0000-0000-7000-8000-000000000011"},
                {kb_id=kb2,external_id="private",publication_id=publication},
            }))
            test.eq(access,2);test.eq(stores,1);test.eq(reads,1)
            test.eq(rows[1].status,"indexed");test.is_nil(next(rows[2]));test.is_nil(next(rows[3]))
        end)
        test.it("reads indexed, missing and inaccessible publication receipts from the native store",function()
            local db=assert(sql.get("app:db"))
            local kb_id,indexed_publication,missing_publication,private_kb=uuid(),uuid(),uuid(),uuid()
            local created,create_err=store.create_store(kb_id,"",{}, {})
            test.is_nil(create_err,tostring(create_err));test.eq(created,kb_id)
            local metadata=assert(json.encode({external_source="knowledge.kb",external_id="visible",upload_publication_id=indexed_publication,status="completed"}))
            local _,insert_err=db:execute([[INSERT INTO kb10_nodes
                (id,store_id,parent_id,node_type,content,content_type,metadata,source_scope,external_source,external_id)
                VALUES ($1,$2,NULL,'document','fixture','text/plain',$3,'','knowledge.kb','visible')]],{uuid(),kb_id,metadata})
            test.is_nil(insert_err,tostring(insert_err))
            local component={ACCESS={READ=1},validate_access=function(id:any)
                if id == private_kb then return nil,"denied" end
                return true,nil
            end}
            local services={get_store=function(id:any) return {id=id},nil end,publication_outcomes=store.publication_outcomes}
            local results,read_err=outcomes.lookup_for_test(component,services,{
                {kb_id=kb_id,external_id="visible",publication_id=indexed_publication},
                {kb_id=kb_id,external_id="missing",publication_id=missing_publication},
                {kb_id=private_kb,external_id="private",publication_id=uuid()},
            })
            cleanup(db,kb_id);db:release()
            test.is_nil(read_err,tostring(read_err));test.eq(results[1].status,"indexed")
            test.is_nil(next(results[2]));test.is_nil(next(results[3]))
        end)
    end)
end)}
