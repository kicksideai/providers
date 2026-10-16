local test = require("test")
local common = require("graph_api_fixture")
local sql = common.sql
local json = common.json
local crypto = common.crypto
local contract = common.contract
local kb10_types = common.kb10_types
local store = common.store
local materializer_store = common.materializer_store
local insert_materialized_node = common.insert_materialized_node
local uuid = common.uuid
local test_vector = common.test_vector

local function define_tests()
    test.describe("knowledge graph API", function()
        local db: any
        local test_component_id: string?
        local test_store_id: string?
        local context = common.new()
        test.before_all(function()
            local err: string?
            db, test_component_id, test_store_id, err = context.setup()
            test.is_nil(err)
            test.not_nil(db)
            test.not_nil(test_store_id)
        end)
        test.after_all(function()
            test.is_nil(context.cleanup(db))
        end)
        test.describe("graph data integrity", function()
            test.it("builds and verifies a mini-graph: root -> child -> document", function()
                local root_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Graph root",
                    metadata = { label = "Graph Root", is_root = true },
                } })
                test.not_nil(root_id)

                local child_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Graph child topic",
                    metadata = { label = "Graph Child" },
                } })
                test.not_nil(child_id)

                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Leaf document in the graph",
                    metadata = { title = "Graph Leaf Doc" },
                })
                test.not_nil(doc_id)

                local edge1_id, err1 = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = child_id,
                    to_node_id = root_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                test.is_nil(err1)
                test.not_nil(edge1_id)

                local edge2_id, err2 = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = child_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(err2)
                test.not_nil(edge2_id)

                local root_node, _ = store():get_node({ store_id = test_store_id, node_id = root_id })
                test.not_nil(root_node)
                if root_node then
                    test.eq("concept", root_node.node_type)
                    test.eq("Graph Root", root_node.metadata.label)
                end

                local child_node, _ = store():get_node({ store_id = test_store_id, node_id = child_id })
                test.not_nil(child_node)
                if child_node then
                    local c = (child_node :: any)
                    test.eq("concept", c.node_type)
                    test.eq("Graph Child", c.metadata.label)
                end

                local doc_node, _ = store():get_node({ store_id = test_store_id, node_id = doc_id })
                test.not_nil(doc_node)
                if doc_node then
                    local d = (doc_node :: any)
                    test.eq("document", d.node_type)
                    test.eq("Graph Leaf Doc", d.metadata.title)
                end

                local root_in_edges, _ = store():get_edges({ store_id = test_store_id, node_id = root_id, opts = { direction = "in" } })
                test.not_nil(root_in_edges)
                local child_linked = false
                for _, e in ipairs(root_in_edges) do
                    if e.from_node_id == child_id and e.edge_type == "subtopic_of" then
                        child_linked = true
                    end
                end
                test.is_true(child_linked)

                local child_in_edges, _ = store():get_edges({ store_id = test_store_id, node_id = child_id, opts = { direction = "in" } })
                test.not_nil(child_in_edges)
                local doc_linked = false
                for _, e in ipairs(child_in_edges) do
                    if e.from_node_id == doc_id and e.edge_type == "categorized_as" then
                        doc_linked = true
                    end
                end
                test.is_true(doc_linked)

                local child_out_edges, _ = store():get_edges({ store_id = test_store_id, node_id = child_id, opts = { direction = "out" } })
                test.not_nil(child_out_edges)
                local parent_linked = false
                for _, e in ipairs(child_out_edges) do
                    if e.to_node_id == root_id and e.edge_type == "subtopic_of" then
                        parent_linked = true
                    end
                end
                test.is_true(parent_linked)
            end)

            test.it("edges reference valid nodes via both directions", function()
                local a_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Bidirectional A",
                    metadata = { label = "Bi A" },
                } })
                local b_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Bidirectional B",
                    metadata = { label = "Bi B" },
                } })

                store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = b_id,
                    to_node_id = a_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })

                local both_from_a, _ = store():get_edges({ store_id = test_store_id, node_id = a_id, opts = { direction = "both" } })
                local both_from_b, _ = store():get_edges({ store_id = test_store_id, node_id = b_id, opts = { direction = "both" } })

                local a_sees_b = false
                for _, e in ipairs(both_from_a) do
                    if e.from_node_id == b_id or e.to_node_id == b_id then
                        a_sees_b = true
                    end
                end
                test.is_true(a_sees_b)

                local b_sees_a = false
                for _, e in ipairs(both_from_b) do
                    if e.from_node_id == a_id or e.to_node_id == a_id then
                        b_sees_a = true
                    end
                end
                test.is_true(b_sees_a)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
