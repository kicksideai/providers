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
        test.describe("concept nodes", function()
            test.it("inserts and retrieves a concept node", function()
                local node_id, err = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Machine learning fundamentals",
                    metadata = { label = "ML Fundamentals" },
                } })
                test.is_nil(err)
                test.not_nil(node_id)

                local node, get_err = store():get_node({ store_id = test_store_id, node_id = node_id })
                test.is_nil(get_err)
                test.not_nil(node)
                test.eq("concept", node.node_type)
                test.eq("Machine learning fundamentals", node.content)
                test.eq("ML Fundamentals", node.metadata.label)
            end)

            test.it("preserves metadata fields on concept nodes", function()
                local node_id, err = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Concept with rich metadata",
                    metadata = { label = "Rich", is_root = false, priority = 5 },
                } })
                test.is_nil(err)

                local node, _ = store():get_node({ store_id = test_store_id, node_id = node_id })
                test.not_nil(node)
                test.eq("Rich", node.metadata.label)
                test.eq(false, node.metadata.is_root)
                test.eq(5, node.metadata.priority)
            end)
        end)

        test.describe("document nodes", function()
            test.it("inserts and retrieves a document node", function()
                local node_id, err = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Introduction to neural networks",
                    content_type = "text/plain",
                    metadata = { title = "Neural Networks Intro" },
                })
                test.is_nil(err)
                test.not_nil(node_id)

                local node, get_err = store():get_node({ store_id = test_store_id, node_id = node_id })
                test.is_nil(get_err)
                test.not_nil(node)
                test.eq("document", node.node_type)
                test.eq("Introduction to neural networks", node.content)
                test.eq("text/plain", node.content_type)
                test.eq("Neural Networks Intro", node.metadata.title)
            end)

            test.it("supports document nodes without content_type", function()
                local node_id, err = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Plain document",
                    metadata = { title = "No Content Type" },
                })
                test.is_nil(err)

                local node, _ = store():get_node({ store_id = test_store_id, node_id = node_id })
                test.not_nil(node)
                test.eq("document", node.node_type)
            end)
        end)

        test.describe("node browsing", function()
            local browse_concept_id
            local browse_doc_id

            test.it("filters by node_type=concept", function()
                browse_concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Browsable concept",
                    metadata = { label = "Browse Concept" },
                } })
                browse_doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Browsable document",
                    metadata = { title = "Browse Doc" },
                })

                local nodes, err = store():browse_nodes({ store_id = test_store_id, opts = {
                    node_type = "concept",
                    parent_id = "",
                    limit = 100,
                } })
                test.is_nil(err)
                test.not_nil(nodes)

                local found = false
                for _, n in ipairs(nodes) do
                    test.eq("concept", n.node_type)
                    if n.id == browse_concept_id then found = true end
                end
                test.is_true(found)
            end)

            test.it("filters by node_type=document", function()
                local nodes, err = store():browse_nodes({ store_id = test_store_id, opts = {
                    node_type = "document",
                    parent_id = "",
                    limit = 100,
                } })
                test.is_nil(err)
                test.not_nil(nodes)

                local found = false
                for _, n in ipairs(nodes) do
                    test.eq("document", n.node_type)
                    if n.id == browse_doc_id then found = true end
                end
                test.is_true(found)
            end)

            test.it("respects limit and offset", function()
                local all, _ = store():browse_nodes({ store_id = test_store_id, opts = {
                    parent_id = "",
                    limit = 100,
                } })
                local total = #all

                local limited, _ = store():browse_nodes({ store_id = test_store_id, opts = {
                    parent_id = "",
                    limit = 2,
                    offset = 0,
                } })
                test.is_true(#limited <= 2)

                if total > 2 then
                    local offset_nodes, _ = store():browse_nodes({ store_id = test_store_id, opts = {
                        parent_id = "",
                        limit = 100,
                        offset = 2,
                    } })
                    test.eq(total - 2, #offset_nodes)
                end
            end)
        end)

        test.describe("edge creation", function()
            test.it("creates concept and parent edge via store.insert_graph_node", function()
                local parent_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Graph insert parent",
                    metadata = { label = "Graph Insert Parent" },
                } })

                local child_id, err = store():insert_graph_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Graph insert child",
                    metadata = { label = "Graph Insert Child" },
                }, parent_edge = {
                    to_node_id = parent_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                test.is_nil(err)
                test.not_nil(child_id)

                local edges, edge_err = store():get_edges({ store_id = test_store_id, node_id = child_id, opts = {
                    direction = "out",
                    edge_type = "subtopic_of",
                    limit = 10,
                } })
                test.is_nil(edge_err)
                test.eq(1, #edges)
                test.eq(parent_id, edges[1].to_node_id)
            end)

            test.it("rejects source nodes through store.insert_graph_node", function()
                local node_id, err = store():insert_graph_node({ store_id = test_store_id, node = {
                    node_type = "document",
                    content = "Source content must use materializer",
                    metadata = { title = "Blocked graph insert" },
                } })
                test.is_nil(node_id)
                test.not_nil(err)
            end)

            test.it("creates subtopic_of edge via store.insert_edge", function()
                local parent_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Parent topic",
                    metadata = { label = "Edge Parent" },
                } })
                local child_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Child topic",
                    metadata = { label = "Edge Child" },
                } })

                local edge_id, err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = child_id,
                    to_node_id = parent_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                test.is_nil(err)
                test.not_nil(edge_id)
            end)

            test.it("rejects non-categorization edges from source documents", function()
                local concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Related target",
                    metadata = { label = "Related Target" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Source document may only be categorized",
                    metadata = { title = "Source Edge Guard" },
                })

                local edge_id, err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_id,
                    edge_type = "related_to",
                    weight = 1.0,
                } })
                test.is_nil(edge_id)
                test.not_nil(err)
            end)

            test.it("rejects document categorization to the root concept", function()
                local root_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Root",
                    metadata = { label = "Root", concept_type = "root", is_root = true },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Root categorization must be rejected",
                    metadata = { title = "Root Guard Doc" },
                })

                local edge_id, err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = root_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(edge_id)
                test.not_nil(err)
                test.is_true(tostring(err):find("root concept", 1, true) ~= nil)
            end)

            test.it("rejects graph patch edges from source chunks", function()
                local concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Chunk target",
                    metadata = { label = "Chunk Target" },
                } })
                local chunk_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "chunk",
                    content = "Chunks are source internals, not graph anchors",
                    metadata = { title = "Source Chunk Guard" },
                })

                local result, err = store():apply_graph_patch({
                    store_id = test_store_id,
                    insert_edges = {{
                        from_node_id = chunk_id,
                        to_node_id = concept_id,
                        edge_type = "categorized_as",
                        weight = 1.0,
                    }},
                })
                test.is_nil(result)
                test.not_nil(err)
            end)

            test.it("applies graph edge replacement in one store mutation", function()
                local concept_a, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Patch category A",
                    metadata = { label = "Patch A" },
                } })
                local concept_b, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Patch category B",
                    metadata = { label = "Patch B" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Document moved by graph patch",
                    metadata = { title = "Patch Doc" },
                })
                local old_edge_id, edge_err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_a,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(edge_err)

                local result, patch_err = store():apply_graph_patch({
                    store_id = test_store_id,
                    delete_edge_ids = { old_edge_id },
                    insert_edges = {{
                        from_node_id = doc_id,
                        to_node_id = concept_b,
                        edge_type = "categorized_as",
                        weight = 1.0,
                    }},
                })
                test.is_nil(patch_err)
                test.not_nil(result)
                test.eq(1, result.deleted_edges)
                test.eq(1, #result.inserted_edge_ids)

                local edges, get_err = store():get_edges({ store_id = test_store_id, node_id = doc_id, opts = {
                    direction = "out",
                    edge_type = "categorized_as",
                    limit = 10,
                } })
                test.is_nil(get_err)
                test.eq(1, #edges)
                test.eq(concept_b, edges[1].to_node_id)
            end)

            test.it("rolls back graph patch edge deletes when a later insert is invalid", function()
                local concept_a, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Atomic patch category A",
                    metadata = { label = "Atomic Patch A" },
                } })
                local concept_b, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Atomic patch category B",
                    metadata = { label = "Atomic Patch B" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Document whose existing edge must survive failed patch",
                    metadata = { title = "Atomic Patch Doc" },
                })
                local chunk_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "chunk",
                    content = "Invalid graph anchor",
                    metadata = { title = "Atomic Patch Chunk" },
                })
                local old_edge_id, edge_err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_a,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(edge_err)

                local result, patch_err = store():apply_graph_patch({
                    store_id = test_store_id,
                    delete_edge_ids = { old_edge_id },
                    insert_edges = {{
                        from_node_id = chunk_id,
                        to_node_id = concept_b,
                        edge_type = "categorized_as",
                        weight = 1.0,
                    }},
                })
                test.is_nil(result)
                test.not_nil(patch_err)

                local edges, get_err = store():get_edges({ store_id = test_store_id, node_id = doc_id, opts = {
                    direction = "out",
                    edge_type = "categorized_as",
                    limit = 10,
                } })
                test.is_nil(get_err)
                test.eq(1, #edges)
                test.eq(old_edge_id, edges[1].id)
                test.eq(concept_a, edges[1].to_node_id)
            end)

            test.it("creates categorized_as edge between document and concept", function()
                local concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Category",
                    metadata = { label = "Doc Category" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Categorized document",
                    metadata = { title = "Cat Doc" },
                })

                local edge_id, err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(err)
                test.not_nil(edge_id)
            end)
        end)


    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
