local test = require("test")
local registry = require("registry")

-- The concept-graph enrichment service is a supervised process.service owned by
-- the kb10 engine (it runs the placement/treatment dataflow agents over the kb10
-- node store). It must declare the process security scope so its dataflow client
-- has a non-empty actor id.
local SERVICE_IDS = {
    "kickside.kb10.graph:enrichment_service.service",
}

local DEPENDENCY_PREFIX = "kickside.kb10:dep."

local REQUIRED_DEPENDENCIES = {
    ["kickside.kb10:dep.kickside.component"] = { "kickside/component", "*" },
    ["kickside.kb10:dep.kickside.contract"] = { "kickside/contract", "*" },
    ["kickside.kb10:dep.kickside.core"] = { "kickside/core", "*" },
    ["kickside.kb10:dep.kickside.execution"] = { "kickside/execution", "*" },
    ["kickside.kb10:dep.kickside.jobs"] = { "kickside/jobs", "*" },
    -- The maintainable binding implements a contract knowledge defines from
    -- 0.1.46; the floor makes that requirement part of the graph.
    ["kickside.kb10:dep.kickside.knowledge"] = { "kickside/knowledge", "*" },
    ["kickside.kb10:dep.kickside.uploads"] = { "kickside/uploads", "*" },
    ["kickside.kb10:dep.wippy.agent"] = { "wippy/agent", "*" },
    ["kickside.kb10:dep.wippy.dataflow"] = { "wippy/dataflow", "*" },
    ["kickside.kb10:dep.wippy.llm"] = { "wippy/llm", "*" },
    ["kickside.kb10:dep.wippy.migration"] = { "wippy/migration", "*" },
    ["kickside.kb10:dep.wippy.security"] = { "wippy/security", "*" },
}

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if key == "id" or key == "kind" or key == "meta" then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function has_process_scope(entry: any): boolean
    local lifecycle = value(entry, "lifecycle")
    if type(lifecycle) ~= "table" or type(lifecycle.security) ~= "table" then
        return false
    end
    local groups = lifecycle.security.groups
    if type(groups) ~= "table" then
        return false
    end
    for _, group_id in ipairs(groups) do
        if group_id == "wippy.security:process" then return true end
    end
    return false
end

local function define_tests()
    test.describe("kickside.kb10 packaging", function()
        test.it("routes each knowledge engine maintenance through one binding and summary setting", function()
            for _, id in ipairs({ "kickside.kb10:engine_document", "kickside.kb10:engine_wiki" }) do
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry)
                test.eq(entry.meta.maintenance_binding, "kickside.kb10:maintainable")
                local schema = entry.meta.config_schema.properties
                test.not_nil(schema.summary_prompt)
            end
            local binding, err = registry.get("kickside.kb10:maintainable")
            test.is_nil(err)
            test.not_nil(binding)
            local contracts = value(binding, "contracts")
            test.eq(contracts[1].contract, "kickside.knowledge:maintainable")
            test.eq(contracts[1].methods.schedule_reembed, "kickside.kb10.binding:schedule_reembed_func")
        end)

        test.it("declares its complete direct module dependency set", function()
            local entries, err = registry.find({ [".kind"] = "ns.dependency" })
            test.is_nil(err)

            local actual = {}
            for _, entry in ipairs(entries or {}) do
                local id = tostring(entry.id or "")
                if id:sub(1, #DEPENDENCY_PREFIX) == DEPENDENCY_PREFIX then
                    actual[id] = entry
                end
            end

            for id, expected in pairs(REQUIRED_DEPENDENCIES) do
                local dependency = actual[id]
                test.not_nil(dependency, id .. " is missing")
                test.eq(value(dependency, "component"), expected[1], id .. " has the wrong component")
                test.eq(value(dependency, "version"), expected[2], id .. " has the wrong version range")
                actual[id] = nil
            end
            test.eq(next(actual), nil, "KB10 declares an unexpected direct dependency")
        end)

        test.it("owns dataflow registry authority only inside concept placement", function()
            local policy, policy_err = registry.get("kickside.kb10.graph:placement_registry")
            test.is_nil(policy_err)
            test.not_nil(policy)
            test.is_nil(value(policy, "groups"))
            local rules = value(policy, "policy")
            test.eq(rules.resources, "dataflow.*")
            local actions = { "process.registry.register", "process.registry.unregister", "process.registry.lookup" }
            test.eq(#rules.actions, #actions)
            for index, action in ipairs(actions) do test.eq(rules.actions[index], action) end
            local placement = registry.get("kickside.kb10.graph:concept_placement")
            local policies = value(placement, "security").policies
            test.eq(#policies, 2)
            test.eq(policies[1], "kickside.kb10.graph:placement_registry")
            test.eq(policies[2], "kickside.kb10.graph:placement_agent_spawn")
        end)

        test.it("owns only the agent node spawn required by concept placement", function()
            local policy, err = registry.get("kickside.kb10.graph:placement_agent_spawn")
            test.is_nil(err)
            test.not_nil(policy)
            test.is_nil(value(policy, "groups"))
            local rules = value(policy, "policy")
            test.eq(rules.resources, "userspace.dataflow.node.agent:node")
            test.eq(#rules.actions, 3)
            test.eq(rules.actions[1], "process.spawn")
            test.eq(rules.actions[2], "process.spawn.monitored")
            test.eq(rules.actions[3], "process.spawn.linked")
        end)

        test.it("starts supervised services with the process security scope", function()
            for _, id in ipairs(SERVICE_IDS) do
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry, id .. " is missing")
                test.eq(value(entry, "kind"), "process.service")
                test.is_true(has_process_scope(entry),
                    id .. " must declare lifecycle.security.groups wippy.security:process")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
