-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local outcomes=require("outcomes")

local function row(status: string, error: string?): any
    return {status=status,error=error}
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
    end)
end)}
