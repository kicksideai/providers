local test = require("test")
local tools = require("tools")
local nodes = require("nodes")
local component = require("component")

return { run = test.run_cases(function()
    test.describe("KB read tool native errors", function()
        for _, method in ipairs({ "get_node", "browse", "graph", "summaries" }) do
            test.it("preserves native errors from " .. method, function()
                local source = errors.new({ kind = errors.NOT_FOUND, message = "knowledge record not found", details = { marker = method } })
                local original_gate, original_get, original_browse, original_graph, original_meta = component.validate_access, nodes.get_node, nodes.browse, nodes.graph, nodes.public_meta
                component.validate_access = function() return 1, nil end
                nodes.get_node = function() return nil, source end
                nodes.browse = function() return nil, source end
                nodes.graph = function() return nil, source end
                nodes.public_meta = function() return nil, source end
                local result, err = tools[method]({ kb_id = "kb", node_id = "missing" }, {})
                component.validate_access, nodes.get_node, nodes.browse, nodes.graph, nodes.public_meta = original_gate, original_get, original_browse, original_graph, original_meta
                test.is_nil(result)
                test.eq(err, source)
            end)
        end
    end)
end) }
