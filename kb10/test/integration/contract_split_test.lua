local test = require("test")
local registry = require("registry")

-- Locks the kb10 side of the kb_store contract split:
--   * kb10 no longer binds node/edge/graph methods as contract functions — those
--     ops are internal (persist:node_store), reached without a contract.
--   * kb10 implements the model-agnostic lifecycle binding toward knowledge.
--   * a graph-shaped (wiki) KB declares a query_binding, so its query dispatches
--     through the engine's queryable contract (kb_search never does node search).

local function meta_of(entry: any): any
    if type(entry) ~= "table" then return {} end
    if type(entry.meta) == "table" then return entry.meta end
    if type(entry.data) == "table" and type(entry.data.meta) == "table" then return entry.data.meta end
    return {}
end

local function define_tests()
    test.describe("kickside.kb10 contract split", function()
        test.it("no longer exposes node/edge/graph methods as contract functions", function()
            for _, name in ipairs({
                "kickside.kb10:insert_node", "kickside.kb10:browse_nodes",
                "kickside.kb10:vector_search", "kickside.kb10:graph_traverse",
                "kickside.kb10:insert_edge", "kickside.kb10:apply_graph_patch",
                "kickside.kb10:list_document_summaries",
            }) do
                local entry = registry.get(name)
                test.is_true(entry == nil, name .. " must not be a bound contract method after the split")
            end
        end)

        test.it("binds the model-agnostic store lifecycle toward knowledge", function()
            local entry = registry.get("kickside.kb10:kb_store_lifecycle")
            test.not_nil(entry, "kb10 must provide the kb_store_lifecycle binding")
            for _, name in ipairs({
                "kickside.kb10.binding:create_store", "kickside.kb10.binding:get_store",
                "kickside.kb10.binding:update_config", "kickside.kb10.binding:delete_store",
            }) do
                test.not_nil(registry.get(name), name .. " lifecycle method is missing")
            end
        end)

        test.it("declares a query_binding on the graph (wiki) engine so queries dispatch through the contract", function()
            local wiki = registry.get("kickside.kb10:engine_wiki")
            test.not_nil(wiki, "engine_wiki descriptor is missing")
            local m = meta_of(wiki)
            test.eq(m.is_graph, true)
            test.eq(type(m.query_binding), "string")
            test.is_true(m.query_binding ~= "", "graph engine must declare a query_binding")
            test.eq(m.store_contract, "kickside.knowledge:kb_store_lifecycle")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
