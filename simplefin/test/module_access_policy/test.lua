local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Module access composition", function()
        test.it("admits exactly the listed endpoint identities", function()
            local policy_id = "kickside.simplefin.security:simplefin_endpoint_access"
            local declaration, declaration_err = registry.get(policy_id)
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.is_nil(declaration.data.policy.conditions)
            local expected = {
                ["kickside.simplefin.api:rotate.endpoint"] = true,
            }
            local listed = {}
            for _, id in ipairs(declaration.data.policy.resources) do
                test.is_true(expected[id] == true, id)
                test.is_nil(listed[id], id)
                listed[id] = true
                local entry, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
            end
            for id in pairs(expected) do test.is_true(listed[id] == true, id) end
            local policy, policy_err = security.policy(policy_id)
            test.is_nil(policy_err)
            local actor = security.new_actor("listed-endpoint-member", {})
            local endpoints, find_err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(find_err)
            for _, entry in ipairs(endpoints) do
                local id = tostring(entry.id)
                test.eq(policy:evaluate(actor, "access", id), expected[id] and "allow" or "undefined", id)
            end
            for id in pairs(expected) do
                test.eq(policy:evaluate(actor, "access", id .. ".unlisted"), "undefined", id)
            end
        end)
        test.it("preserves the published requirement and its real endpoint grant", function()
            local requirement, err = registry.get("kickside.simplefin.security:user_security_scope")
            test.is_nil(err)
            test.not_nil(requirement)
            test.eq(requirement.kind, "ns.requirement")
            test.eq(requirement.data.targets[1].entry, "kickside.simplefin.security:simplefin_endpoint_access")
            test.eq(requirement.data.targets[1].path, ".groups +=")
            local bundle = assert(registry.get("kickside.simplefin.security:module_access"))
            local included = false
            for _, id in ipairs(bundle.meta.includes) do
                if id == "kickside.simplefin.security:simplefin_endpoint_access" then included = true end
            end
            test.is_true(included)
            local component = assert(registry.get("kickside.simplefin.security:simplefin_endpoint_access"))
            test.is_true(component.meta.private)
            test.eq(component.data.groups[1], "app:user")
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.policy("kickside.simplefin.security:simplefin_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.simplefin.api:rotate.endpoint",
            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.simplefin_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local policies, seen = {}, {}
            local function include(id)
                if seen[id] then return end
                seen[id] = true
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                local policy, policy_err = security.policy(id)
                test.is_nil(policy_err, id)
                policies[#policies + 1] = policy
                for _, child in ipairs(entry.meta.includes or {}) do include(child) end
            end
            include("kickside.simplefin.security:module_access")
            local declaration = registry.get("kickside.simplefin.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.simplefin")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = security.new_scope(policies)
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.simplefin:connect_view"), "allow")
            local direct = assert(security.policy("kickside.simplefin.security:module_access"))
            local expected = {
                ["kickside.simplefin.api:rotate.endpoint"] = true,
            }
            for _, entry in ipairs(assert(registry.find({[".kind"] = "http.endpoint"}))) do
                if expected[tostring(entry.id)] then
                    test.eq(scope:evaluate(actor, "access", entry.id), "allow", entry.id)
                    test.eq(direct:evaluate(actor, "access", entry.id), "undefined", entry.id)
                end
            end
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
