-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local outcomes=require("outcomes")

local function node(publication: string, status: string, error: string?): any
    return {node_type="document",parent_id=nil,metadata={upload_publication_id=publication,status=status,error=error}}
end

return {run=test.run_cases(function()
    test.describe("KB10 publication Activity outcomes",function()
        test.it("projects indexed and failed materialization from the exact publication",function()
            test.eq(outcomes.classify_for_test({node("publication-a","completed")},"publication-a").status,"indexed")
            local failed=outcomes.classify_for_test({node("publication-a","failed","invalid UTF-8")},"publication-a")
            test.eq(failed.status,"failed");test.eq(failed.reason,"invalid UTF-8")
        end)
        test.it("keeps an unmatched receipt pending rather than inferring cross-host chronology",function()
            local result=outcomes.classify_for_test({node("another-publication","completed")},"publication-a")
            test.eq(result.status,"pending")
        end)
    end)
end)}
