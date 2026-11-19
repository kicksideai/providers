-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test=require("test")
local registry=require("registry")
local security=require("security")

return {run=test.run_cases(function()
    test.describe("Knowledge source token authority",function()
        test.it("keeps model resolution outside the query function's private grants",function()
            local query=assert(registry.get("kickside.kb10.binding:query_func"))
            local actor=assert(security.new_actor("key-owner-member",{}))
            for _,id in ipairs(query.data.security and query.data.security.policies or {}) do
                local policy=assert(security.policy(id))
                test.eq(policy:evaluate(actor,"funcs.call","kickside.models.persist:reload_profiles"),"undefined")
                test.eq(policy:evaluate(actor,"store.get","kickside.models:cache"),"undefined")
                test.eq(policy:evaluate(actor,"env.get","ENCRYPTION_KEY"),"undefined")
            end
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
            test.eq(policy:evaluate(actor,"funcs.call","kickside.uploads.tokens:pack_read"),"allow")
            test.eq(policy:evaluate(actor,"env.get","ENCRYPTION_KEY"),"undefined")
            test.eq(policy:evaluate(actor,"funcs.call","kickside.uploads.persist:token_pack"),"undefined")
        end)
    end)
end)}
