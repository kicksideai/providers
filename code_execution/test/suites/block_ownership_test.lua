local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local blocks = require("blocks")
local lower = require("lower")

local BLOCK = "kickside.code_execution:block.run_code"
local RUN_CODE = "kickside.code_execution:run_code"
local ACTOR = "code-block-tester"

local function suite_scope(): any
    local policy, perr = security.policy("app:code_execution_suite_policy")
    if perr or not policy then error("suite policy: " .. tostring(perr)) end
    local scope, serr = security.new_scope({ policy })
    if serr or not scope then error("suite scope: " .. tostring(serr)) end
    return scope
end

local function call(input: any): (any?, any?)
    local actor, aerr = security.new_actor(ACTOR, {})
    if aerr or not actor then return nil, aerr end
    return funcs.new():with_actor(actor):with_scope(suite_scope()):call(RUN_CODE, input)
end

local function declaration(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry)
    return entry
end

local function define_tests()
    test.describe("code execution Block ownership", function()
        test.it("publishes exactly one owner-namespaced canonical Block", function()
            local block = declaration(BLOCK)
            test.is_nil(blocks.validate(block))
            test.eq((block :: any).meta.type, "kickside.block")
            test.eq((block :: any).data.block.presentation.config_wc, "kickside-code-body")
            test.is_nil(select(1, registry.get("kickside.code_execution:block.code")))
            test.is_nil(select(1, registry.get("kickside.code_execution:block.action")))
            test.is_nil(select(1, registry.get("kickside.code_execution:code_block")))
            test.is_nil(select(1, registry.get("kickside.code_execution:action_block")))
            test.is_nil(select(1, registry.get("kickside.workflows:definition")),
                "Code Execution must not pull visual Workflows into its package graph")
            test.is_nil(select(1, registry.get("kickside.code_execution:dep.kickside.blocks")),
                "Block declarations must not make the provider depend on the Block consumer library")
        end)

        test.it("lowers Run Code directly to the strict provider function", function()
            local plan, err = lower.plan(declaration(BLOCK), {
                config = { code = "return __cx_args" },
            })
            test.is_nil(err)
            test.eq((plan :: any).config.func_id, RUN_CODE)
            test.eq((plan :: any).config.args.config.code, "return __cx_args")
        end)

        test.it("runs with Block input as sandbox args under the caller", function()
            local out, err = call({
                input = { message = "from-flow" },
                config = {
                    code = [[return { message = __cx_args.message }]],
                    tool_ids = {},
                },
            })
            test.is_nil(err, tostring(err))
            test.is_true((out :: any).ok)
            test.eq((out :: any).result.message, "from-flow")
        end)

        test.it("keeps the function directly callable and rejects flat legacy input", function()
            local out, err = call({ code = "return true" })
            test.is_nil(err, tostring(err))
            test.is_false((out :: any).ok)
            test.eq((out :: any).error.kind, "invalid")
            test.contains((out :: any).error.message, "unsupported request field: code")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
