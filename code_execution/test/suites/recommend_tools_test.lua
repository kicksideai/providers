local test = require("test")
local funcs = require("funcs")
local security = require("security")
local recommender = require("recommender")
local model_fixture = require("model_fixture")

local RECOMMEND = "kickside.code_execution:recommend_tools"
local TOOL = "kickside.code_execution.traits:recommend_tools_tool"
local ECHO = "app:stub_echo_tool"
local SECRET = "app:stub_secret_tool"
local ACTOR = "cx-recommend-tester"

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

-- recommend_as invokes the backend directly under a fixed actor+scope.
local function recommend_as(input: any): (any, any?)
    return funcs.new()
        :with_actor(new_actor())
        :with_scope(suite_scope())
        :call(RECOMMEND, input)
end

-- call_tool invokes the trait tool as an agent step would — the whitelist arrives ONLY
-- through the exec context (trait config), never as a tool argument.
local function call_tool(config: any, args: any): (any, any?)
    return funcs.new()
        :with_actor(new_actor())
        :with_scope(suite_scope())
        :with_context(config)
        :call(TOOL, args)
end

local function find_tool(tools: any, id: string): any
    if type(tools) ~= "table" then return nil end
    for _, t in ipairs(tools :: { any }) do
        if (t :: any).id == id then return t end
    end
    return nil
end

local function define_tests()
    test.describe("code_execution.recommend_tools", function()
        test.it("preserves a model failure without returning keyword matches", function()
            local cause = errors.new({ message = "model unavailable", kind = errors.UNAVAILABLE })
            model_fixture.set({ error = cause })
            local out, err = recommender.recommend({ need = "echo a message", tool_ids = { ECHO } })
            test.is_nil(out)
            test.eq(err, cause)
        end)

        test.it("rejects malformed model results instead of recommending leading tools", function()
            for _, response in ipairs({ {}, { result = {} }, { result = { tool_ids = "echo" } } }) do
                model_fixture.set({ response = response })
                local out, err = recommender.recommend({ need = "echo", tool_ids = { ECHO } })
                test.is_nil(out)
                test.not_nil(err)
            end
        end)

        test.it("returns compact recommendations by default", function()
            model_fixture.set({response = {result = {tool_ids = {ECHO}}}})
            local out, err = recommender.recommend({need = "echo", tool_ids = {ECHO}})
            test.is_nil(err)
            test.eq(out.tools[1].id, ECHO)
            test.is_nil(out.tools[1].input_schema)
            test.is_nil(out.tools[1].description)
        end)

        test.it("returns model selections with both schemas within the whitelist", function()
            model_fixture.set({ response = { result = { tool_ids = { SECRET, ECHO, ECHO } } } })
            local out, err = recommender.recommend({ need = "unrelated", tool_ids = { ECHO }, fields = {"input_schema", "output_schema", "input_schema_json"} })
            test.is_nil(err, tostring(err))
            test.eq(#out.tools, 1)
            test.eq(out.tools[1].id, ECHO)
            test.eq(out.tools[1].input_schema.properties.message.type, "string")
            test.is_nil(out.tools[1].input_schema_json)
            test.eq(out.tools[1].output_schema.properties.actor_id.type, "string")
        end)

        test.it("accepts an empty model selection", function()
            model_fixture.set({ response = { result = { tool_ids = {} } } })
            local out, err = recommender.recommend({ need = "unrelated", tool_ids = { ECHO } })
            test.is_nil(err, tostring(err))
            test.eq(#out.tools, 0)
        end)

        test.it("propagates failures from the bound model provider", function()
            local out, err = recommend_as({ need = "echo a message", tool_ids = { ECHO } })
            test.is_nil(out)
            test.not_nil(err)
        end)

        test.it("rejects a missing need", function()
            local out, err = recommend_as({ tool_ids = { ECHO } })
            test.is_nil(out)
            test.not_nil(err)
            test.contains(tostring(err), "need is required")
        end)
    end)

    test.describe("code_execution.RecommendTools trait tool", function()
        test.it("fails with the typed model failure", function()
            local out, err = call_tool({ tool_ids = { ECHO } }, { need = "echo a message" })
            test.is_nil(out)
            test.not_nil(err)
        end)

        test.it("rejects a run with no need", function()
            local out, err = call_tool({ tool_ids = { ECHO } }, {})
            test.is_nil(err, tostring(err))
            test.is_false(out.success)
            test.contains(out.error, "need is required")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
