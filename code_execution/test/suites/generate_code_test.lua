-- Suite for the code generator's safety spine, exercised without an LLM:
--   * the generator draft -> validate -> accept/redraft loop, driven by injected
--     collaborators, so the accept-only-when-validated invariant is proven directly;
--   * the simulation-sdk dry-run (run_code_dry_run), proving it returns schema-shaped mock
--     data, dispatches nothing, and reports a validation failure for broken code.
-- The full LLM-backed flow is covered by the live assist endpoint.

local test = require("test")
local security = require("security")
local json = require("json")
local funcs = require("funcs")
local generator = require("generator")
local gen_flow = require("gen_flow")

local DRY_RUN = "kickside.code_execution:run_code_dry_run"
local ECHO = "app:stub_echo_tool"
local ACTOR = "cx-generator-tester"

local function suite_scope(): any
    local policy, perr = security.policy("app:code_execution_suite_policy")
    if perr or not policy then error("suite policy: " .. tostring(perr)) end
    local scope, serr = security.new_scope({ policy })
    if serr or not scope then error("suite scope: " .. tostring(serr)) end
    return scope
end

-- dry_run_as invokes run_code_dry_run under a fixed actor+scope. The sim dispatches
-- nothing, so a call must still succeed regardless of the actor's grants.
local function dry_run_as(input: any): (any, any?)
    local actor, aerr = security.new_actor(ACTOR, {})
    if aerr or not actor then return nil, aerr end
    return funcs.new()
        :with_actor(actor)
        :with_scope(suite_scope())
        :call(DRY_RUN, input)
end

local function define_tests()
    test.describe("code_execution.generator", function()
        test.it("cancels an expired generation and returns a timeout error", function()
            local deadline, response = {}, { case_receive = function() return "response" end }
            function deadline:case_receive(): any return "deadline" end
            local cancelled = false
            local future: any = {
                response = function() return response end,
                cancel = function(): boolean cancelled = true; return true end,
            }
            local proposal, err = gen_flow._await_generation(future, deadline, function(): any return { channel = deadline } end)
            test.is_true(cancelled)
            test.is_nil(proposal)
            test.contains(tostring(err), "60-second")
        end)

        test.it("surfaces generation cancellation failures", function()
            local deadline: any = { case_receive = function() return "deadline" end }
            local future: any = {
                response = function() return { case_receive = function() return "response" end } end,
                cancel = function(): any return false, "cancellation denied" end,
            }
            local proposal, err = gen_flow._await_generation(future, deadline, function(): any return { channel = deadline } end)
            test.is_nil(proposal)
            test.contains(tostring(err), "cancellation denied")
        end)

        test.it("accepts a draft that validates on the first attempt", function()
            local res = generator.generate({
                draft_fn = function(): any return "return true" end,
                validate_fn = function(_code: any): (boolean, any) return true, {} end,
                max_attempts = 3,
            })
            test.is_true(res.validated)
            test.eq(res.code, "return true")
            test.eq(res.attempts, 1)
            -- suggested_trigger is optional: a draft_fn that returns no trigger leaves it unset.
            test.is_nil(res.suggested_trigger)
        end)

        test.it("threads the draft's suggested_trigger through to the accepted proposal", function()
            local res = generator.generate({
                draft_fn = function(): (any, any)
                    return "return true", { mode = "event", source = "app:webhook" }
                end,
                validate_fn = function(_code: any): (boolean, any) return true, {} end,
                max_attempts = 3,
            })
            test.is_true(res.validated)
            test.not_nil(res.suggested_trigger)
            test.eq(res.suggested_trigger.mode, "event")
            test.eq(res.suggested_trigger.source, "app:webhook")
        end)

        test.it("redrafts on failure, feeding the previous errors back, then accepts", function()
            local seen: { any } = {}
            local res = generator.generate({
                draft_fn = function(ctx: any): any
                    seen[#seen + 1] = ctx.last_errors
                    return "attempt " .. tostring(ctx.attempt)
                end,
                validate_fn = function(code: any): (boolean, any)
                    if code == "attempt 1" then return false, { "first draft failed" } end
                    return true, {}
                end,
                max_attempts = 3,
            })
            test.is_true(res.validated)
            test.eq(res.code, "attempt 2")
            -- the second draft received the first draft's gate errors
            local second = seen[2]
            test.is_true(type(second) == "table")
            test.eq((second :: { any })[1], "first draft failed")
        end)

        test.it("fails with the last gate errors when attempts are exhausted", function()
            local res = generator.generate({
                draft_fn = function(ctx: any): any return "bad " .. tostring(ctx.attempt) end,
                validate_fn = function(_code: any): (boolean, any) return false, { "never validates" } end,
                max_attempts = 2,
            })
            test.is_false(res.validated)
            test.is_nil(res.code)
            test.eq(res.errors[1], "never validates")
        end)

        test.it("retains the provider error after exhausted draft attempts", function()
            local res = generator.generate({
                draft_fn = function(): any return nil, nil, "provider deadline exceeded" end,
                validate_fn = function(): any error("no draft reaches validation") end,
                max_attempts = 2,
            })
            test.is_false(res.validated)
            test.eq(res.errors[1], "provider deadline exceeded")
        end)

        test.it("fails when the model returns no code", function()
            local res = generator.generate({
                draft_fn = function(): any return nil end,
                validate_fn = function(_code: any): (boolean, any) return true, {} end,
                max_attempts = 2,
            })
            test.is_false(res.validated)
            test.is_nil(res.code)
        end)
    end)

    test.describe("code_execution.dry_run (simulation sdk)", function()
        test.it("returns a schema-shaped mock for a tool without dispatching it", function()
            -- The real echo returns actor_id = the caller; the sim returns the output_schema
            -- mock (actor_id -> ""), proving no real dispatch happened.
            local out, err = dry_run_as({
                tool_ids = { ECHO },
                source = [[
                    local r, e = sdk.tools["app:stub_echo_tool"]({ message = "hi" })
                    return { r = r, has_err = e ~= nil }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.is_false(out.result.has_err)
            test.eq(out.result.r.actor_id, "")
            test.is_nil(out.result.r.echoed.message)
        end)

        test.it("sdk.sleep is an instant no-op that clamps to the cap", function()
            -- The dry-run must never actually wait, yet must return the same clamped duration
            -- the real sdk would (cap = 5s), so paced code validates instantly.
            local out, err = dry_run_as({
                tool_ids = {},
                source = [[
                    return { capped = sdk.sleep(1000), neg = sdk.sleep(-1), ok = sdk.sleep(2) }
                ]],
            })
            test.is_nil(err, tostring(err))
            test.is_true(out.ok, json.encode(out.error or {}))
            test.eq(out.result.capped, 5)
            test.eq(out.result.neg, 0)
            test.eq(out.result.ok, 2)
        end)

        test.it("reports a validation failure for broken code", function()
            local out, err = dry_run_as({
                tool_ids = {},
                source = [[ this is not valid lua ]],
            })
            test.is_nil(err, tostring(err))
            test.is_false(out.ok)
            test.not_nil(out.error)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
