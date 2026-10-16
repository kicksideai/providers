local test = require("test")
local json = require("json")
local registry = require("registry")

local READ_TOOL = "kickside.simplefin.traits:read_tool"
local READER = "kickside.simplefin.traits:reader"

local function get_entry(id: string): any
    local entries, err = registry.find({ [".id"] = id })
    test.is_nil(err)
    test.not_nil(entries, id .. " lookup failed")
    test.eq(#entries, 1, id .. " should resolve once")
    return entries[1]
end

local function enum_contains(enum: any, value: string): boolean
    for _, item in ipairs(enum or {}) do
        if item == value then return true end
    end
    return false
end

local function define_tests()
    test.describe("SimpleFIN traits", function()
        test.it("publishes the read tool with a model-facing schema", function()
            local entry = get_entry(READ_TOOL)
            test.eq(entry.meta.type, "tool")
            test.eq(entry.meta.llm_alias, "SimpleFINRead")
            local schema, err = json.decode(tostring(entry.meta.input_schema))
            test.is_nil(err)
            test.eq(schema.additionalProperties, false)
            test.eq(schema.required[1], "action")
            for _, action in ipairs({ "list_accounts", "list_transactions", "list_holdings" }) do
                test.is_true(enum_contains(schema.properties.action.enum, action), action)
            end
            test.eq(entry.meta.mcp.required_scopes[1], "state.read")
        end)

        test.it("publishes the reader trait wired to the generic connection picker", function()
            local entry = get_entry(READER)
            test.eq(entry.meta.type, "agent.trait")
            test.eq(entry.meta.provider, "simplefin")
            test.eq(entry.meta.web_component, "kickside-connection-trait-picker")
            test.eq(entry.meta.context_schema.properties.connection_id.type, "string")
            local tools: any = entry.data and entry.data.tools
            test.not_nil(tools)
            test.eq(tools[1], READ_TOOL)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
