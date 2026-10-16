-- Suite for the Code Execution agent trait. Proves the two things the trait adds on
-- top of run_code:
--
--   1. The RunCode tool takes ONLY `code` from the model; the tool whitelist comes from
--      the trait's per-agent config, carried in the exec context (ctx). The model cannot
--      widen its own reach — a restricted config exposes only its subset, while an empty
--      config falls back to allow-all (every reachable tool).
--   2. The init_code_execution build func folds the whitelisted surface (ids, purposes,
--      schemas) into the prompt, keyed as the sdk import exposes it.
--
-- Runs under the same broad suite scope as the run_code suite (funcs.call / registry). It
-- omits eval.* — run_code's own security block adds those — so a green suite proves the
-- trait dispatches through run_code, gaining no authority.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local json = require("json")

local TOOL = "kickside.code_execution.traits:run_code_tool"
local BUILD = "kickside.code_execution.traits:init_code_execution"
local ECHO = "app:stub_echo_tool"
local SECRET = "app:stub_secret_tool"
local ACTOR = "cx-trait-tester"

local function suite_scope(): any
    local policy, perr = security.policy("app:code_execution_suite_policy")
    if perr or not policy then error("suite policy: " .. tostring(perr)) end
    local scope, serr = security.new_scope({ policy })
    if serr or not scope then error("suite scope: " .. tostring(serr)) end
    return scope
end

local function new_actor(): any
    local actor, aerr = security.new_actor(ACTOR, {})
    if aerr or not actor then error("actor: " .. tostring(aerr)) end
    return actor
end

-- call_tool: invoke RunCode as an agent step would — the whitelist arrives ONLY through
-- the exec context (trait config), never as a tool argument.
local function call_tool(config: any, args: any): (any, any?)
    return funcs.new()
        :with_actor(new_actor())
        :with_scope(suite_scope())
        :with_context(config)
        :call(TOOL, args)
end

-- call_build: invoke the build func the way the compiler does — positional
-- (base_prompt, trait_context) under the caller's actor+scope.
local function call_build(context: any): (any, any?)
    return funcs.new()
        :with_actor(new_actor())
        :with_scope(suite_scope())
        :call(BUILD, "", context)
end

local function define_tests()
    test.describe("code_execution.trait RunCode tool", function()
        test.it("dispatches to run_code with the configured whitelist and honors it", function()
            local out, err = call_tool({ tool_ids = { ECHO } }, {
                code = [[
                    local res, e = sdk.tools["app:stub_echo_tool"]({ message = "hi" })
                    return { res = res, err = e, names = sdk.list() }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.not_nil(out)
            test.is_true(out.success, tostring(out.error))
            test.eq(out.result.res.echoed.message, "hi")
            -- the tool observed the caller's actor: identity flows through unchanged
            test.eq(out.result.res.actor_id, ACTOR)
            test.eq(#out.result.names, 1)
            -- sdk.list returns the real entry id, not a fabricated namespace:alias key
            test.eq(out.result.names[1], "app:stub_echo_tool")
        end)

        test.it("an empty config falls back to allow-all: every registered tool is reachable", function()
            -- The model supplies only `code`; the whitelist still comes from ctx, not the
            -- model. An empty configured whitelist is allow-all, so every registered tool
            -- (echo AND secret) is present -- the installer restricts by picking a subset.
            local out, err = call_tool({ tool_ids = {} }, {
                code = [[
                    return { has_echo = sdk.tools["app:stub_echo_tool"] ~= nil, has_secret = sdk.tools["app:stub_secret_tool"] ~= nil }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.success, tostring(out.error))
            test.is_true(out.result.has_echo)
            test.is_true(out.result.has_secret)
        end)

        test.it("exposes only the configured tools, not other registered ones", function()
            local out, err = call_tool({ tool_ids = { ECHO } }, {
                code = [[
                    return { has_echo = sdk.tools["app:stub_echo_tool"] ~= nil, has_secret = sdk.tools["app:stub_secret_tool"] ~= nil }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.success, tostring(out.error))
            test.is_true(out.result.has_echo)
            -- app:stub_secret_tool exists but is not in this agent's configured whitelist
            test.is_false(out.result.has_secret)
        end)

        test.it("rejects a run with no code", function()
            local out, err = call_tool({ tool_ids = { ECHO } }, {})
            test.is_nil(err, tostring(err))
            test.is_false(out.success)
            test.contains(out.error, "code is required")
        end)

        test.it("returns sandbox failures in the envelope with their kind", function()
            local out, err = call_tool({ tool_ids = { ECHO } }, { code = [[ error("Northwind missing warehouse") ]] })
            test.is_nil(err, tostring(err))
            test.is_false(out.success)
            test.contains(out.error, "Northwind missing warehouse")
            test.is_true(type(out.error_kind) == "string" and out.error_kind ~= "")
        end)
    end)

    test.describe("code_execution.trait build func (surface injection)", function()
        test.it("injects the whitelisted tool surface into the prompt, keyed by entry id", function()
            local out, err = call_build({ tool_ids = { ECHO } })
            test.is_nil(err, tostring(err))
            test.not_nil(out.prompt)
            local p = out.prompt
            test.contains(p, "function name is RunCode")
            test.contains(p, "schemas are keyed by registry id")
            test.contains(p, '"code":"return 24 * 12"')
            test.is_true(string.find(p, "Code execution SDK", 1, true) ~= nil, "header present")
            test.is_true(string.find(p, "sdk.tools", 1, true) ~= nil, "tools surface described")
            -- the surface names the tool under its real entry id
            test.is_true(string.find(p, "app:stub_echo_tool", 1, true) ~= nil, "tool id keyed")
        end)

        test.it("names only the configured tools in the injected surface", function()
            local out, err = call_build({ tool_ids = { ECHO } })
            test.is_nil(err, tostring(err))
            test.not_nil(out.prompt)
            -- secret is registered but not configured; it must not appear in the surface
            test.is_true(string.find(out.prompt, "stub_secret_tool", 1, true) == nil, "unconfigured tool absent")
        end)

        test.it("keeps native execution wrappers out of the sandbox catalog", function()
            local out, err = call_build({ tool_ids = {} })
            test.is_nil(err, tostring(err))
            test.not_nil(out.prompt)
            test.is_nil((string.find(out.prompt, 'sdk.tools["kickside.code_execution.traits:run_code_tool"]', 1, true)))
            test.is_nil((string.find(out.prompt, 'sdk.tools["kickside.code_execution.traits:recommend_tools_tool"]', 1, true)))
        end)

        test.it("an empty whitelist is allow-all: injects the full tool catalog", function()
            local out, err = call_build({})
            test.is_nil(err, tostring(err))
            test.not_nil(out.prompt)
            local p = out.prompt
            test.is_true(string.find(p, "Code execution SDK", 1, true) ~= nil, "header present")
            -- allow-all lists EVERY registered tool, including ones absent from a specific whitelist
            test.is_true(string.find(p, "app:stub_echo_tool", 1, true) ~= nil, "echo tool listed")
            test.is_true(string.find(p, "stub_secret_tool", 1, true) ~= nil, "allow-all also lists the secret tool")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
