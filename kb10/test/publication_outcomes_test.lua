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
    end)
end)}
