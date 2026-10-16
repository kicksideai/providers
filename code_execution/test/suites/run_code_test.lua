-- Suite for kickside.code_execution:run_code. Proves the sandbox behavior: a
-- whitelisted tool is reachable through the injected SDK (keyed by its real registry
-- entry id) and runs as the ambient caller; a non-whitelisted tool is absent;
-- host/process modules and non-whitelisted stdlib stay blocked; input-schema validation
-- rejects bad args; and a runtime error returns a typed error rather than crashing. Tool
-- ids resolve against the stub tools the harness registers (app:stub_echo_tool /
-- app:stub_secret_tool).

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local json = require("json")
local registry = require("registry")
local time = require("time")
local sdk = require("sdk")
local sdk_sim = require("sdk_sim")

local RUN_CODE = "kickside.code_execution:run_code"
local ECHO = "app:stub_echo_tool"
local SECRET = "app:stub_secret_tool"
local ACTOR = "cx-tester"

-- suite_scope: the harness scope granting the caller the runtime capabilities a
-- session already holds (funcs.call / registry read). It deliberately omits eval.*;
-- run_code's own security block adds those, proving the grant is scoped to run_code.
local function suite_scope(): any
    local policy, perr = security.policy("app:code_execution_suite_policy")
    if perr or not policy then error("suite policy: " .. tostring(perr)) end
    local scope, serr = security.new_scope({ policy })
    if serr or not scope then error("suite scope: " .. tostring(serr)) end
    return scope
end

-- run_code_as: invoke the canonical Block function under a fixed actor+scope, the way a
-- session would. Tests pass Block config separately from the incoming value.
local function run_code_as(config: any, input: any?): (any, any?)
    local actor, aerr = security.new_actor(ACTOR, {})
    if aerr or not actor then return nil, aerr end
    return funcs.new()
        :with_actor(actor)
        :with_scope(suite_scope())
        :call(RUN_CODE, { input = input or {}, config = config })
end

local function define_tests()
    test.describe("code_execution.run_code", function()
        test.it("rejects SDK access when the run context is absent", function()
            local real_ok, real_err = pcall(sdk.list)
            local sim_ok, sim_err = pcall(sdk_sim.list)

            test.is_false(real_ok)
            test.not_nil(real_err)
            test.is_false(sim_ok)
            test.not_nil(sim_err)
        end)

        test.it("returns a large structured result whole", function()
            local out, err = run_code_as({
                code = [[ return { rows = { { name = "Ada", note = string.rep("x", 40000) } } } ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok)
            test.eq(out.result.rows[1].name, "Ada")
            test.eq(#out.result.rows[1].note, 40000)
        end)

        test.it("runs ordinary sandbox code with the supported eval budget", function()
            local out, err = run_code_as({ code = "return {value = 6 * 7, nested = {ok = true}}" })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.eq(out.result.value, 42)
            test.is_true(out.result.nested.ok)
        end)

        test.it("bounds a CPU-only infinite loop with a structured limit error", function()
            local started = time.now():unix_nano()
            local out, err = run_code_as({ code = "while true do end" })
            test.is_true((time.now():unix_nano() - started) < 6000000000, "the 5-second limit returns promptly")
            test.is_nil(err, tostring(err))
            test.is_false(out.ok)
            test.eq(out.error.kind, "timeout")
            test.not_nil(out.error.message)
        end)

        test.it("runs a whitelisted tool and returns its result under the ambient actor", function()
            local out, err = run_code_as({
                tool_ids = { ECHO },
                code = [[
                    local res, e = sdk.tools["app:stub_echo_tool"]({ message = "hi" })
                    return { res = res, err = e }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.not_nil(out)
            test.is_true(out.ok, json.encode(out.error or {}))
            test.eq(out.result.res.echoed.message, "hi")
            -- the tool observed the caller's actor: identity flows through unchanged
            test.eq(out.result.res.actor_id, ACTOR)
            test.is_nil(out.result.err)
        end)

        test.it("normalizes empty nested schema objects before SDK argument validation", function()
            local out, err = run_code_as({
                tool_ids = { "app:stub_filter_tool" },
                code = [[local result, err = sdk.tools["app:stub_filter_tool"]({filters={{value="Northwind"}}}); return {result=result,err=err}]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_nil(out.result.err, tostring(out.result.err))
            test.eq(out.result.result.echoed.filters[1].value, "Northwind")
        end)

        test.it("exposes only whitelisted tools on sdk.tools, keyed by entry id", function()
            local out, err = run_code_as({
                tool_ids = { ECHO },
                code = [[
                    return {
                        has_echo = sdk.tools["app:stub_echo_tool"] ~= nil,
                        has_secret = sdk.tools["app:stub_secret_tool"] ~= nil,
                        names = sdk.list(),
                    }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_true(out.result.has_echo)
            -- app:stub_secret_tool exists in the registry but was not whitelisted
            test.is_false(out.result.has_secret)
            test.eq(#out.result.names, 1)
            -- sdk.list returns the real entry id, not a fabricated namespace:alias key
            test.eq(out.result.names[1], "app:stub_echo_tool")
        end)

        test.it("allow-all: an empty tool_ids exposes every registered tool", function()
            -- Empty (or absent) tool_ids means ALL tools the ambient actor can reach, not
            -- none. Both stub tools are registered, so both are present on sdk.tools; the
            -- gate stays at dispatch (the ambient actor's own grants), not at population.
            local out, err = run_code_as({
                tool_ids = {},
                code = [[
                    return {
                        has_echo = sdk.tools["app:stub_echo_tool"] ~= nil,
                        has_secret = sdk.tools["app:stub_secret_tool"] ~= nil,
                    }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_true(out.result.has_echo)
            test.is_true(out.result.has_secret)
        end)

        test.it("cages the SDK's private modules and context", function()
            -- The whole point of the cage: ctx/funcs/time are private to the sdk import,
            -- never sandbox modules. User source that requires them must fail, and the
            -- private SDK context must not appear as a mutable global.
            local out, err = run_code_as({
                tool_ids = { ECHO },
                code = [[
                    local ctx_ok = pcall(function() return require("ctx") end)
                    local funcs_ok = pcall(function() return require("funcs") end)
                    local time_ok = pcall(function() return require("time") end)
                    local private_global_type = type(_G.__kickside_code_execution_context)
                    local res, e = sdk.tools["app:stub_echo_tool"]({ message = "private" })
                    return {
                        ctx_ok = ctx_ok,
                        funcs_ok = funcs_ok,
                        time_ok = time_ok,
                        private_global_type = private_global_type,
                        has_tool = sdk.tools["app:stub_echo_tool"] ~= nil,
                        has_secret = sdk.tools["app:stub_secret_tool"] ~= nil,
                        sleep = sdk.sleep(0),
                        res = res,
                        err = e,
                    }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_false(out.result.ctx_ok)
            test.is_false(out.result.funcs_ok)
            test.is_false(out.result.time_ok)
            test.eq(out.result.private_global_type, "nil")
            test.is_true(out.result.has_tool)
            test.is_false(out.result.has_secret)
            test.eq(out.result.sleep, 0)
            test.is_nil(out.result.err)
            test.eq(out.result.res.echoed.message, "private")
        end)

        test.it("keeps run args available only through the public args convenience global", function()
            local out, err = run_code_as({
                tool_ids = {},
                code = [[
                    return {
                        marker = __cx_args.marker,
                        has_sdk_context_global = _G.__kickside_code_execution_context ~= nil,
                    }
                ]],
            }, { marker = "arg-ok" })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.eq(out.result.marker, "arg-ok")
            test.is_false(out.result.has_sdk_context_global)
        end)

        test.it("blocks require of a host/process module", function()
            local out, err = run_code_as({
                tool_ids = {},
                code = [[ local p = require("process"); return p ]],
            })
            test.is_nil(err, tostring(err))
            test.not_nil(out)
            test.is_false(out.ok)
            test.not_nil(out.error)
        end)

        test.it("blocks require of a non-whitelisted stdlib module", function()
            local out, err = run_code_as({
                tool_ids = {},
                code = [[ local s = require("sql"); return s ]],
            })
            test.is_nil(err, tostring(err))
            test.is_false(out.ok)
            test.not_nil(out.error)
        end)

        test.it("validates empty object schemas while rejecting undeclared arguments", function()
            local out, err = run_code_as({
                tool_ids = { "app:stub_empty_object_tool" },
                code = [[
                    local accepted, ae = sdk.tools["app:stub_empty_object_tool"]({})
                    local rejected, re = sdk.tools["app:stub_empty_object_tool"]({ extra = true })
                    return { accepted = accepted, accept_error = ae, rejected = rejected, reject_error = re }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_nil(out.result.accept_error)
            test.not_nil(out.result.accepted)
            test.is_nil(out.result.rejected)
            test.contains(out.result.reject_error, "invalid arguments")
        end)

        test.it("rejects a tool call whose args fail the input schema", function()
            local out, err = run_code_as({
                tool_ids = { ECHO },
                code = [[
                    -- echo requires { message: string }; omit it
                    local res, e = sdk.tools["app:stub_echo_tool"]({})
                    return { res = res, err = e }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_nil(out.result.res)
            test.not_nil(out.result.err)
            test.contains(out.result.err, "invalid arguments")
        end)

        test.it("sdk.schema returns BOTH the input and output schema of a whitelisted tool", function()
            local out, err = run_code_as({
                tool_ids = { ECHO },
                code = [[
                    local s = sdk.schema("app:stub_echo_tool")
                    return {
                        in_type = s and s.input_schema and s.input_schema.properties.message.type or nil,
                        out_type = s and s.output_schema and s.output_schema.properties.actor_id.type or nil,
                        missing = sdk.schema("app:stub_secret_tool"),
                    }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            -- both schemas come back under the { input_schema, output_schema } shape
            test.eq(out.result.in_type, "string")
            test.eq(out.result.out_type, "string")
            -- a non-whitelisted id has no schema
            test.is_nil(out.result.missing)
        end)

        test.it("sdk.schemas returns the input+output pair for several tools in one call", function()
            local out, err = run_code_as({
                tool_ids = { ECHO, SECRET },
                code = [[
                    local m = sdk.schemas({ "app:stub_echo_tool", "app:stub_secret_tool", "app:nope" })
                    local echo = m["app:stub_echo_tool"]
                    return {
                        echo_in = echo and echo.input_schema and echo.input_schema.properties.message.type or nil,
                        echo_out = echo and echo.output_schema and echo.output_schema.properties.actor_id.type or nil,
                        has_secret = m["app:stub_secret_tool"] ~= nil,
                        has_unknown = m["app:nope"] ~= nil,
                    }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.eq(out.result.echo_in, "string")
            test.eq(out.result.echo_out, "string")
            -- a whitelisted tool with no declared schemas is still present in the batch
            test.is_true(out.result.has_secret)
            -- an id outside the whitelist is skipped, not errored
            test.is_false(out.result.has_unknown)
        end)

        test.it("sdk.sleep clamps its argument and never waits on a bad input", function()
            -- A negative, NaN, or non-number clamps to 0 (instant); a tiny positive value
            -- actually paces the run. The 5s cap itself is asserted on the instant sim sdk to
            -- keep this suite fast.
            local out, err = run_code_as({
                tool_ids = {},
                code = [[
                    return {
                        neg = sdk.sleep(-3),
                        nan = sdk.sleep(0/0),
                        str = sdk.sleep("nope"),
                        small = sdk.sleep(0.02),
                    }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.eq(out.result.neg, 0)
            test.eq(out.result.nan, 0)
            test.eq(out.result.str, 0)
            test.eq(out.result.small, 0.02)
        end)

        test.it("returns a typed error for a runtime error in the sandbox", function()
            local out, err = run_code_as({
                tool_ids = {},
                code = [[ error("boom") ]],
            })
            test.is_nil(err, tostring(err))
            test.not_nil(out)
            test.is_false(out.ok)
            test.not_nil(out.error)
            test.not_nil(out.error.kind)
            test.contains(out.error.message, "boom")
        end)

        test.it("rejects an unknown tool id in the whitelist", function()
            local out, err = run_code_as({
                tool_ids = { "app:does_not_exist" },
                code = [[ return true ]],
            })
            test.is_nil(err, tostring(err))
            test.is_false(out.ok)
            test.eq(out.error.kind, "invalid_tool")
        end)

        test.it("rejects a non-tool registry id in the whitelist", function()
            local out, err = run_code_as({
                tool_ids = { RUN_CODE },
                code = [[ return true ]],
            })
            test.is_nil(err, tostring(err))
            test.is_false(out.ok)
            test.eq(out.error.kind, "invalid_tool")
        end)

        test.it("rejects the retired source alias instead of accepting a dual ABI", function()
            local out, err = run_code_as({ source = [[ return true ]] })
            test.is_nil(err, tostring(err))
            test.is_false(out.ok)
            test.eq(out.error.kind, "invalid")
            test.contains(out.error.message, "unsupported config field: source")
        end)

        test.it("a picker-selected tool id flows end to end: whitelist -> run_code -> dispatch", function()
            -- The config UI hands the picked tool's registry entry id straight into a run's
            -- whitelist, and the SDK exposes it under that exact id -- no fabricated
            -- namespace:alias key in between. Reproduce the pick, then prove the same id
            -- dispatches.
            local entry, gerr = registry.get(ECHO)
            test.is_nil(gerr, tostring(gerr))
            test.not_nil(entry)
            test.eq(entry.id, ECHO)

            local out, err = run_code_as({
                tool_ids = { ECHO },
                code = [[
                    local res, e = sdk.tools["app:stub_echo_tool"]({ message = "cx" })
                    return { res = res, err = e }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_nil(out.result.err)
            test.eq(out.result.res.echoed.message, "cx")
            test.eq(out.result.res.actor_id, ACTOR)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
