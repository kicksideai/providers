-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local registry=require("registry")
local security=require("security")

return {run=test.run_cases(function()
    test.describe("Knowledge source token authority",function()
        test.it("allows the query to load models without a caller key grant",function()
            local query=assert(registry.get("kickside.kb10.binding:query_func"))
            local found=false
            for _,id in ipairs(query.data.security and query.data.security.policies or {}) do
                if id=="kickside.kb10:models_reload_call" then found=true end
            end
            test.is_true(found)
            local policy=assert(security.policy("kickside.kb10:models_reload_call"))
            local actor=assert(security.new_actor("key-owner-member",{}))
            test.eq(policy:evaluate(actor,"funcs.call","kickside.models.persist:reload_profiles"),"allow")
            test.eq(policy:evaluate(actor,"env.get","ENCRYPTION_KEY"),"undefined")
        end)

        test.it("keeps the token grant on the source operation and grants no key access",function()
            local source=assert(registry.get("kickside.kb10.api:source"))
            local found=false
            for _,id in ipairs(source.data.security and source.data.security.policies or {}) do
                if id=="kickside.kb10:upload_read_token_call" then found=true end
            end
            test.is_true(found)
            local policy=assert(security.policy("kickside.kb10:upload_read_token_call"))
            local actor=assert(security.new_actor("key-owner-member",{}))
            test.eq(policy:evaluate(actor,"funcs.call","kickside.uploads.persist:token_pack_read"),"allow")
            test.eq(policy:evaluate(actor,"env.get","ENCRYPTION_KEY"),"undefined")
            test.eq(policy:evaluate(actor,"funcs.call","kickside.uploads.persist:token_pack"),"undefined")
        end)
    end)
end)}
