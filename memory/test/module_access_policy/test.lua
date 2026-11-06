-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local security = require("security")

local ENDPOINTS = {
    "kickside.memory.api:list_memories.endpoint",
    "kickside.memory.api:list_topics.endpoint",
    "kickside.memory.api:list_items.endpoint",
    "kickside.memory.api:get_item.endpoint",
    "kickside.memory.api:create_item.endpoint",
    "kickside.memory.api:edit_item.endpoint",
    "kickside.memory.api:forget_item.endpoint",
    "kickside.memory.api:archive_item.endpoint",
    "kickside.memory.api:restore_item.endpoint",
    "kickside.memory.api:list_conflicts.endpoint",
    "kickside.memory.api:resolve_conflict.endpoint",
    "kickside.memory.api:status.endpoint",
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
    include("kickside.memory.security:module_access")
    local scope, scope_err = security.new_scope(policies)
    test.is_nil(scope_err)
    return scope
end

local function define_tests()
    test.describe("Memory module access", function()
        test.it("publishes one module_access policy composed of private runtime and endpoint policies", function()
            local declaration = registry.get("kickside.memory.security:module_access")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.memory")
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
                if id:sub(1, #"kickside.memory.api:") == "kickside.memory.api:" then
                    found = found + 1
                    test.is_true(listed[id] == true, id .. " is a memory endpoint without member access")
                end
                test.eq(scope:evaluate(actor, "access", id), listed[id] and "allow" or "undefined", id)
            end
            test.eq(found, #ENDPOINTS)
            test.eq(scope:evaluate(actor, "access", "kickside.memory.api:list_items.endpoint.unlisted"), "undefined")
        end)

        test.it("grants deferred execution only to the memory job workers", function()
            local policy = security.policy("kickside.memory.security:deferred_owner")
            local actor = security.new_actor("job-worker", {})
            for _, id in ipairs({ "kickside.memory.engine:derive_worker", "kickside.memory.engine:consolidate_worker",
                "kickside.memory.engine:reembed_worker" }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "kickside.execution.defer", id), "allow", id)
            end
            test.eq(policy:evaluate(actor, "kickside.execution.defer", "kickside.memory.engine:derive_authorized"), "undefined")
            test.eq(policy:evaluate(actor, "kickside.execution.defer", "unrelated.module:worker"), "undefined")
        end)

        test.it("grants module discovery without a blanket grant on other modules", function()
            local scope = composed()
            local actor = security.new_actor("memory-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.memory:memory_settings"), "allow")
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.memory.engine:query_func"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call", "kickside.execution.defer" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)

        test.it("binds endpoint access to the host security group", function()
            local requirement = registry.get("kickside.memory.security:user_security_scope")
            test.eq(requirement.data.default, "kickside.security.groups:members")
            test.eq(requirement.meta.value_kind, "security.scope")
            test.eq(requirement.data.targets[3].entry, "kickside.memory.security:endpoint_access")
        end)
        test.it("grants members the Memory capability runtime without a blanket grant", function()
            local requirement, err = registry.get("kickside.memory.security:user_security_scope")
            test.is_nil(err)
            test.not_nil(requirement)
            test.eq(requirement.kind, "ns.requirement")
            test.eq(requirement.data.default, "kickside.security.groups:members")
            local targets = requirement.data.targets or {}
            test.eq(#targets, 3)
            test.eq(targets[1].entry, "kickside.memory.security:module_access")
            test.eq(targets[1].path, ".groups +=")
            test.eq(targets[2].entry, "kickside.memory.security:module_runtime")
            test.eq(targets[2].path, ".groups +=")

            for _, policy_id in ipairs({
                "kickside.memory.security:module_access",
                "kickside.memory.security:module_runtime",
            }) do
                local policy = assert(registry.get(policy_id))
                test.eq(policy.data.groups[1], "app:memory_members", policy_id)
            end

            local member_policy = assert(security.policy("kickside.memory.security:module_access"))
            local actor = security.new_actor("memory-member", {})
            test.eq(member_policy:evaluate(actor, "registry.get", "kickside.memory:memory"), "allow")
            test.eq(member_policy:evaluate(actor, "registry.get", "unrelated.module:private_trait"), "undefined")
            test.eq(member_policy:evaluate(actor, "registry.get", "kickside.memory.private:private_trait"), "undefined")

            local explicit_deny = assert(security.policy("kickside.memory.test.module_access:explicit_memory_deny"))
            local scope = assert(security.new_scope({ member_policy, explicit_deny }))
            test.eq(scope:evaluate(actor, "registry.get", "kickside.memory:memory"), "deny",
                "an explicit deny must override the member capability grant")
        end)
        test.it("resolves member authority through the configured group without admitting outsiders", function()
            local policy = assert(registry.get("kickside.memory.security:module_access"))
            local scope = assert(security.named_scope(policy.data.groups[1]))
            local actor = security.new_actor("memory-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.memory:memory"), "allow")
            test.not_nil((registry.get("kickside.memory.agent:search_tool")))
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.memory.agent:search_tool"), "allow")
            for _, id in ipairs({"unrelated.module:private_trait", "kickside.memory.private:private_trait"}) do
                test.eq(scope:evaluate(actor, "registry.get", id), "undefined", id)
            end
            local outsider = assert(security.named_scope("app:memory_outsider"))
            test.eq(outsider:evaluate(actor, "registry.get", "kickside.memory:memory"), "undefined")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
