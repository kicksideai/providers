-- Suite for the generator cycle node's suggested_trigger shaping: the model drafts a flat
-- mode/source guess (the structured-output schema), and normalize_trigger folds it into
-- trigger spec v1 ({ v = 1, source?, config?, schedule? }) — the shape the trigger resolver
-- and the config web component actually consume. No back-compat mode/source_binding field
-- may reach the caller.

local test = require("test")
local json = require("json")
local gen_node = require("gen_node")

local function define_tests()
    test.describe("code_execution.node_generate suggested_trigger shaping", function()
        test.it("provides complete schema-valid trigger examples with bounded model options", function()
            local system = ""
            local deps: any = {
                prompt = { new = function(): any return {
                    add_system = function(_self: any, value: string) system = value end,
                    add_user = function() end,
                } end },
                llm = { structured_output = function(schema: any, _prompt: any, options: any): any
                    test.eq(options.timeout, 15)
                    test.eq(options.max_tokens, 1536)
                    local count = 0
                    for example in system:gmatch("{[^}]+}") do
                        local value, err = json.decode(example)
                        test.is_nil(err, tostring(err))
                        for _, field in ipairs(schema.properties.suggested_trigger.required) do
                            test.eq(type(value[field]), "string", "example misses " .. field)
                        end
                        count = count + 1
                    end
                    test.eq(count, 3)
                    return { result = { code = "return true", suggested_trigger = { mode = "schedule" } } }
                end },
            }
            local code = gen_node._llm_draft({}, "test", "", "Sum orders", {}, deps)
            test.eq(code, "return true")
        end)

        test.it("preserves model provider failures", function()
            local deps: any = {
                prompt = { new = function(): any return { add_system = function() end, add_user = function() end } end },
                llm = { structured_output = function(): any return nil, "provider deadline exceeded" end },
            }
            local code, _trigger, err = gen_node._llm_draft({}, "test", "", "Sum orders", {}, deps)
            test.is_nil(code)
            test.contains(tostring(err), "provider deadline exceeded")
        end)

        test.it("validates the generated draft with the supplied sample arguments", function()
            local validate = gen_node._make_validate({ "app:stub_echo_tool" }, { orders = { { crates = 36 }, { crates = 12 } } })
            local ok, errors = validate("local total = 0; for _, order in ipairs(__cx_args.orders) do total = total + order.crates end; assert(total == 48); return { crates = total }")
            test.is_true(ok, tostring(errors[1]))
            local rejected = validate("error('Northwind dry-run error')")
            test.is_false(rejected)
        end)

        test.it("folds a schedule guess into a v1 timer spec", function()
            local out = gen_node._normalize_trigger({
                mode = "schedule", schedule_type = "cron", schedule_expression = "0 9 * * 1",
            })
            test.eq(out.v, 1)
            test.eq(out.schedule.type, "cron")
            test.eq(out.schedule.expression, "0 9 * * 1")
            test.is_nil(out.source)
            test.is_nil(out.mode)
        end)

        test.it("defaults an empty interval expression to 1h", function()
            local out = gen_node._normalize_trigger({
                mode = "schedule", schedule_type = "interval", schedule_expression = "",
            })
            test.eq(out.schedule.type, "interval")
            test.eq(out.schedule.expression, "1h")
        end)

        test.it("defaults an empty cron expression to the Monday-9am default", function()
            local out = gen_node._normalize_trigger({
                mode = "schedule", schedule_type = "cron", schedule_expression = "",
            })
            test.eq(out.schedule.expression, "0 9 * * 1")
        end)

        test.it("folds an event guess with a matching source into a v1 source spec", function()
            local out = gen_node._normalize_trigger({
                mode = "event", source = "kickside.discord.source:messages_source",
            })
            test.eq(out.v, 1)
            test.eq(out.source, "kickside.discord.source:messages_source")
            test.not_nil(out.config)
            test.is_nil(out.schedule)
            test.is_nil(out.mode)
            test.is_nil(out.source_binding)
        end)

        test.it("falls back to the default timer when an event guess names no source", function()
            local out = gen_node._normalize_trigger({ mode = "event", source = "" })
            test.eq(out.v, 1)
            test.eq(out.schedule.type, "interval")
            test.eq(out.schedule.expression, "1h")
            test.is_nil(out.source)
        end)

        test.it("falls back to the default timer for an ambiguous or missing mode", function()
            test.eq(gen_node._normalize_trigger(nil).schedule.expression, "1h")
            test.eq(gen_node._normalize_trigger({}).schedule.expression, "1h")
            test.eq(gen_node._normalize_trigger({ mode = "unknown" }).schedule.expression, "1h")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
