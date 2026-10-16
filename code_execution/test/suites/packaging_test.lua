local test = require("test")
local registry = require("registry")
local security = require("security")

local MODULE_PREFIX = "kickside.code_execution:"
-- The harness binds kickside.code_execution:api_router to this router (test/_index.yaml).
local HOST_API_ROUTER = "app:api"

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if key == "id" or key == "kind" or key == "meta" then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function requirement_targets(requirement: any): any
    local targets = {}
    for _, target in ipairs((value(requirement, "targets") or {}) :: { any }) do
        targets[tostring(target.entry)] = tostring(target.path)
    end
    return targets
end

local function module_endpoints(): { string }
    local entries, err = registry.find({})
    test.is_nil(err)
    local ids: { string } = {}
    for _, entry in ipairs(entries or {}) do
        local id = tostring(entry.id or "")
        if id:sub(1, #MODULE_PREFIX) == MODULE_PREFIX
            and tostring(value(entry, "kind") or "") == "http.endpoint" then
            ids[#ids + 1] = id
        end
    end
    table.sort(ids)
    return ids
end

local function define_tests()
    test.describe("authoring endpoint access", function()
        test.it("grants module access to each HTTP endpoint and isolates Core admission", function()
            local policy = assert(security.policy("kickside.code_execution.security:endpoint_access"))
            local baseline = assert(security.policy("kickside.contract.http:user_endpoint_access"))
            local scope = assert(security.new_scope({ policy }))
            local actor = assert(security.new_actor("author", {}))
            for _, id in ipairs({ "sdk_reference.endpoint", "assist.endpoint", "recommend_tools_api.endpoint" }) do
                test.eq(scope:evaluate(actor, "access", "kickside.code_execution:" .. id), "allow", id)
                test.eq(baseline:evaluate(actor, "access", "kickside.code_execution:" .. id), "undefined", id)
                test.eq(scope:evaluate(actor, "funcs.call", "kickside.code_execution:" .. id), "undefined", id)
            end
        end)
    end)
    test.describe("execution dispatch authority", function()
        test.it("adds dispatch authority only for the cancellable worker", function()
            local actor = assert(security.new_actor("author", {}))
            local eval_scope = assert(security.new_scope({
                assert(security.policy("kickside.code_execution.security:eval_grant")),
            }))
            test.eq(eval_scope:evaluate(actor, "funcs.call", "app:unrelated"), "undefined")
            local dispatch = assert(security.new_scope({
                assert(security.policy("kickside.code_execution.security:worker_dispatch")),
            }))
            test.eq(dispatch:evaluate(actor, "funcs.call", "kickside.code_execution:run_code_worker"), "allow")
            test.eq(dispatch:evaluate(actor, "funcs.call", "app:unrelated"), "undefined")
        end)
    end)
    test.describe("kickside.code_execution packaging", function()
        test.it("routes every API endpoint through the host requirement", function()
            local requirement, err = registry.get("kickside.code_execution:api_router")
            test.is_nil(err)
            test.not_nil(requirement)
            test.is_nil(value(requirement, "default"), "the host owns the router; the module ships no default")

            local targets = requirement_targets(requirement)
            local endpoints = module_endpoints()
            test.is_true(#endpoints > 0, "expected code-execution API endpoints")
            for _, id in ipairs(endpoints) do
                test.eq(targets[id], ".meta.router", id .. " is not host-routable")
                local endpoint = registry.get(id)
                local meta = value(endpoint, "meta") or {}
                test.eq(meta.router, HOST_API_ROUTER, id .. " did not receive the host api_router")
                targets[id] = nil
            end
            test.eq(next(targets), nil, "api_router contains a stale non-endpoint target")
        end)

        test.it("declares the runtime packages used by generator entries", function()
            for _, expected in ipairs({
                { "dataflow", "wippy/dataflow" },
                { "llm", "wippy/llm" },
            }) do
                local dep, err = registry.get("kickside.code_execution:dep.wippy." .. expected[1])
                test.is_nil(err)
                test.not_nil(dep)
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), "*", expected[2] .. " must stay unpinned")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
