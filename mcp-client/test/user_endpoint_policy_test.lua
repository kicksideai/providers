local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.mcp_client.security:module_access")
            test.is_nil(err)
            test.not_nil(policy)
            local baseline, baseline_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(baseline_err)
            test.not_nil(baseline)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.mcp_client.api:reconnect.endpoint",
            }) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
                test.eq(policy:evaluate(actor, "access", id, nil), "allow", id)
                test.eq(policy:evaluate(actor, "funcs.call", id, nil), "undefined", id)
                test.eq(baseline:evaluate(actor, "access", id, nil), "undefined", id)
                local unmarked = id .. ".unlisted"
                local legacy = registry.get(unmarked)
                test.is_nil(legacy, unmarked)
                test.eq(policy:evaluate(actor, "access", unmarked, nil), "undefined", unmarked)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
