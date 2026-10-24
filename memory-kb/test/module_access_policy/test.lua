-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local security = require("security")

local ENDPOINTS = {
    "kickside.memory_kb.api:list_memories.endpoint",
    "kickside.memory_kb.api:list_topics.endpoint",
    "kickside.memory_kb.api:list_items.endpoint",
    "kickside.memory_kb.api:get_item.endpoint",
    "kickside.memory_kb.api:create_item.endpoint",
    "kickside.memory_kb.api:edit_item.endpoint",
    "kickside.memory_kb.api:forget_item.endpoint",
    "kickside.memory_kb.api:archive_item.endpoint",
    "kickside.memory_kb.api:restore_item.endpoint",
    "kickside.memory_kb.api:list_conflicts.endpoint",
    "kickside.memory_kb.api:resolve_conflict.endpoint",
    "kickside.memory_kb.api:status.endpoint",
}

local function composed(): any
    local policies, seen = {}, {}
    local function include(id: string)
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
    include("kickside.memory_kb.security:module_access")
    local scope, scope_err = security.new_scope(policies)
    test.is_nil(scope_err)
    return scope
end

local function define_tests()
    test.describe("Memory module access", function()
        test.it("publishes one module_access policy composed of private runtime and endpoint policies", function()
            local declaration = registry.get("kickside.memory_kb.security:module_access")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.memory_kb")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.is_true(declaration.meta.private ~= true)
            test.eq(#declaration.meta.includes, 2)
            for _, id in ipairs(declaration.meta.includes) do
                test.eq(registry.get(id).meta.private, true, id)
            end
        end)

        test.it("grants member access to exactly the memory endpoints", function()
            local endpoints, err = registry.find({ [".kind"] = "http.endpoint" })
            test.is_nil(err)
            local listed = {}
            for _, id in ipairs(ENDPOINTS) do listed[id] = true end
            local found = 0
            local scope = composed()
            local actor = security.new_actor("memory-member", {})
            for _, entry in ipairs(endpoints) do
                local id = tostring(entry.id)
                if id:sub(1, #"kickside.memory_kb.api:") == "kickside.memory_kb.api:" then
                    found = found + 1
                    test.is_true(listed[id] == true, id .. " is a memory endpoint without member access")
                end
                test.eq(scope:evaluate(actor, "access", id), listed[id] and "allow" or "undefined", id)
            end
            test.eq(found, #ENDPOINTS)
            test.eq(scope:evaluate(actor, "access", "kickside.memory_kb.api:list_items.endpoint.unlisted"), "undefined")
        end)

        test.it("grants deferred execution only to the memory job workers", function()
            local policy = security.policy("kickside.memory_kb.security:deferred_owner")
            local actor = security.new_actor("job-worker", {})
            for _, id in ipairs({ "kickside.memory_kb.engine:derive_worker", "kickside.memory_kb.engine:consolidate_worker",
                "kickside.memory_kb.engine:reembed_worker" }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "kickside.execution.defer", id), "allow", id)
            end
            test.eq(policy:evaluate(actor, "kickside.execution.defer", "kickside.memory_kb.engine:derive_authorized"), "undefined")
            test.eq(policy:evaluate(actor, "kickside.execution.defer", "unrelated.module:worker"), "undefined")
        end)

        test.it("grants module discovery without a blanket grant on other modules", function()
            local scope = composed()
            local actor = security.new_actor("memory-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.memory_kb.agent:settings_component"), "allow")
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.memory_kb.engine:query_func"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call", "kickside.execution.defer" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)

        test.it("binds endpoint access to the host security group", function()
            local requirement = registry.get("kickside.memory_kb.security:user_security_scope")
            test.eq(requirement.data.default, "kickside.security.groups:members")
            test.eq(requirement.meta.value_kind, "security.scope")
            test.eq(requirement.data.targets[1].entry, "kickside.memory_kb.security:endpoint_access")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
