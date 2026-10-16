local test = require("test")
local placement = require("placement")
local flow = require("flow")
local node_store = require("node_store")

local function define_tests()
    test.describe("concept placement instructions", function()
        test.it("includes the configured taxonomy rules in the document task", function()
            local original_create = flow.create
            local original_get_node = node_store.get_node
            local original_get_all_edges = node_store.get_all_edges
            local original_browse_nodes = node_store.browse_nodes
            local original_get_store = node_store.get_store
            local input
            local rules = "Create a concept named Northwind returns operations and attach the document."
            node_store.get_node = function() return { content = "Northwind returns within 17 days", metadata = { title = "Handbook" } }, nil end
            node_store.get_all_edges = function() return {}, nil end
            node_store.browse_nodes = function() return {}, nil end
            node_store.get_store = function() return { config = { concept_prompt = rules, concept_context = "Northwind warehouses" } }, nil end
            flow.create = function()
                return {
                    with_title = function(self) return self end,
                    with_input = function(self, value) input = value return self end,
                    agent = function(self) return self end,
                    run = function() return { success = true }, nil end,
                }
            end
            local ok, result, err = pcall(placement.run, {
                store_id = "store", component_id = "kb", document_node_id = "document",
                embedding_model = "embed", extraction_model = "model",
            })
            flow.create = original_create
            node_store.get_node = original_get_node
            node_store.get_all_edges = original_get_all_edges
            node_store.browse_nodes = original_browse_nodes
            node_store.get_store = original_get_store
            if not ok then error(result) end
            test.is_nil(err)
            test.eq(result.action, "agent_placement")
            test.is_true(input.message:find(rules, 1, true) ~= nil)
            test.is_true(input.message:find("Northwind warehouses", 1, true) ~= nil)
            test.is_true(input.message:find("Document node ID: document", 1, true) ~= nil)
            test.is_true(input.message:find("Northwind returns within 17 days", 1, true) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
