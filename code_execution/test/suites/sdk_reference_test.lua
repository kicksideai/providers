local test = require("test")
local surface = require("surface")

local function tools(): any
    return {
        ["example.tools:zulu"] = {
            id = "example.tools:zulu",
            namespace = "example.tools",
            label = "Zulu",
            description = "Last tool",
            input_schema = { type = "object", properties = { value = { type = "string" } } },
            output_schema = { type = "object", properties = { accepted = { type = "boolean" } } },
        },
        ["example.search:web"] = {
            id = "example.search:web",
            namespace = "example.search",
            label = "Web Search",
            description = "Find public pages",
            input_schema = { type = "object", properties = { query = { type = "string" } } },
            input_schema_json = "internal compiled schema",
            output_schema = { type = "object", properties = { results = { type = "array" } } },
        },
        ["example.tools:alpha"] = {
            id = "example.tools:alpha",
            namespace = "example.tools",
            label = "Alpha",
            description = "First tool",
            input_schema = { type = "object" },
        },
    }
end

local function define_tests()
    test.describe("code execution SDK reference catalog", function()
        test.it("rejects malformed tool schemas instead of dropping validation", function()
            local descriptor, err = surface._tool_descriptor({
                id = "example:invalid", meta = { input_schema = "{broken" },
            })
            test.is_nil(descriptor)
            test.contains(tostring(err), "input_schema")
            local output, output_err = surface._tool_descriptor({
                id = "example:invalid", meta = { output_schema = 42 },
            })
            test.is_nil(output)
            test.contains(tostring(output_err), "output_schema")
        end)

        test.it("sorts and bounds picker results", function()
            local reference = surface.build_reference(tools(), { limit = 2 })
            test.eq(#reference.tools, 2)
            test.eq(reference.tools[1].id, "example.tools:alpha")
            test.eq(reference.tools[2].id, "example.search:web")
            test.eq(reference.next_cursor, "2")
            local last = surface.build_reference(tools(), {limit = 2, cursor = reference.next_cursor})
            test.eq(last.tools[1].id, "example.tools:zulu")
            test.is_nil(last.next_cursor)
        end)

        test.it("searches canonical ids, labels, namespaces, and descriptions", function()
            local by_label = surface.build_reference(tools(), { q = "web" })
            test.eq(#by_label.tools, 1)
            test.eq(by_label.tools[1].id, "example.search:web")

            local by_description = surface.build_reference(tools(), { q = "first tool" })
            test.eq(#by_description.tools, 1)
            test.eq(by_description.tools[1].id, "example.tools:alpha")
        end)

        test.it("keeps picker rows compact and returns requested schemas", function()
            local compact = surface.build_reference(tools(), {q = "search"})
            test.is_nil(compact.tools[1].input_schema)
            test.is_nil(compact.tools[1].description)
            local reference = surface.build_reference(tools(), { q = "search", fields = {"input_schema", "output_schema", "input_schema_json"} })
            local row = reference.tools[1]
            test.eq(row.input_schema.properties.query.type, "string")
            test.is_nil(row.input_schema_json)
            test.eq(row.output_schema.properties.results.type, "array")
            test.eq(row.call, [[sdk.tools["example.search:web"](args)]])
        end)
    end)
end

return { run = test.run_cases(define_tests) }
