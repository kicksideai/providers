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
        test.describe("edge retrieval", function()
            test.it("retrieves edges by direction=out", function()
                local concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Target concept",
                    metadata = { label = "Edge Target" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Source document",
                    metadata = { title = "Edge Source Doc" },
                })
                store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })

                local edges, err = store():get_edges({ store_id = test_store_id, node_id = doc_id, opts = { direction = "out" } })
                test.is_nil(err)
                test.not_nil(edges)
                test.is_true(#edges >= 1)

                local found = false
                for _, e in ipairs(edges) do
                    if e.from_node_id == doc_id and e.to_node_id == concept_id then
                        test.eq("categorized_as", e.edge_type)
                        found = true
                    end
                end
                test.is_true(found)
            end)

            test.it("retrieves edges by direction=in", function()
                local parent_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "In-edge parent",
                    metadata = { label = "In Parent" },
                } })
                local child_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "In-edge child",
                    metadata = { label = "In Child" },
                } })
                store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = child_id,
                    to_node_id = parent_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })

                local edges, err = store():get_edges({ store_id = test_store_id, node_id = parent_id, opts = { direction = "in" } })
                test.is_nil(err)
                test.not_nil(edges)
                test.is_true(#edges >= 1)

                local found = false
                for _, e in ipairs(edges) do
                    if e.from_node_id == child_id and e.to_node_id == parent_id then
                        test.eq("subtopic_of", e.edge_type)
                        found = true
                    end
                end
                test.is_true(found)
            end)

            test.it("filters edges by edge_type", function()
                local concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Multi-edge concept",
                    metadata = { label = "Multi Edge" },
                } })
                local child_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Sub concept",
                    metadata = { label = "Sub" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Attached doc",
                    metadata = { title = "Multi Doc" },
                })

                store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = child_id,
                    to_node_id = concept_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })

                local subtopic_edges, err = store():get_edges({ store_id = test_store_id, node_id = concept_id, opts = {
                    direction = "in",
                    edge_type = "subtopic_of",
                } })
                test.is_nil(err)
                for _, e in ipairs(subtopic_edges) do
                    test.eq("subtopic_of", e.edge_type)
                end

                local cat_edges, _ = store():get_edges({ store_id = test_store_id, node_id = concept_id, opts = {
                    direction = "in",
                    edge_type = "categorized_as",
                } })
                for _, e in ipairs(cat_edges) do
                    test.eq("categorized_as", e.edge_type)
                end
            end)
        end)

        test.describe("node deletion", function()
            test.it("reassigns incoming edges and deletes a concept via graph patch", function()
                local old_concept, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Old patch target",
                    metadata = { label = "Old Patch Target" },
                } })
                local new_concept, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "New patch target",
                    metadata = { label = "New Patch Target" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Reassigned by graph patch",
                    metadata = { title = "Patch Reassign Doc" },
                })
                local old_edge_id, ins_err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = old_concept,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(ins_err)

                local result, patch_err = store():apply_graph_patch({
                    store_id = test_store_id,
                    delete_edge_ids = { old_edge_id },
                    insert_edges = {{
                        from_node_id = doc_id,
                        to_node_id = new_concept,
                        edge_type = "categorized_as",
                        weight = 1.0,
                    }},
                    delete_node_id = old_concept,
                })
                test.is_nil(patch_err)
                test.not_nil(result)
                test.is_true(result.deleted_node)

                local deleted, deleted_err = store():get_node({ store_id = test_store_id, node_id = old_concept })
                test.is_nil(deleted)
                test.not_nil(deleted_err)

                local edges, edge_err = store():get_edges({ store_id = test_store_id, node_id = doc_id, opts = {
                    direction = "out",
                    edge_type = "categorized_as",
                    limit = 10,
                } })
                test.is_nil(edge_err)
                test.eq(1, #edges)
                test.eq(new_concept, edges[1].to_node_id)
            end)

            test.it("removes a node and its edges", function()
                local concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Deletable concept",
                    metadata = { label = "Delete Me" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Linked to deletable",
                    metadata = { title = "Linked Doc" },
                })
                store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })

                local ok, err = store():delete_node({ store_id = test_store_id, node_id = concept_id })
                test.is_nil(err)
                test.is_true(ok)

                local node, get_err = store():get_node({ store_id = test_store_id, node_id = concept_id })
                test.is_nil(node)
                test.not_nil(get_err)

                local edges, _ = store():get_edges({ store_id = test_store_id, node_id = concept_id, opts = { direction = "both" } })
                test.eq(0, edges and #edges or 0)
            end)

            test.it("deletes source subtrees with edges, embeddings, and fts rows through the materializer", function()
                local concept_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Source cleanup concept",
                    metadata = { label = "Source Cleanup" },
                } })
                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Source cleanup document",
                    content_type = "text/plain",
                    metadata = { title = "Source Cleanup Doc" },
                })
                test.is_nil(doc_err)
                local chunk_id, chunk_err = insert_materialized_node(test_store_id, {
                    parent_id = doc_id,
                    node_type = "chunk",
                    content = "Source cleanup chunk",
                    content_type = "text/plain",
                    metadata = { title = "Source Cleanup Chunk" },
                })
                test.is_nil(chunk_err)
                local _, doc_emb_err = materializer_store():insert_embedding({
                    store_id = test_store_id,
                    node_id = doc_id,
                    node_type = "document",
                    embedding = test_vector(),
                })
                test.is_nil(doc_emb_err)
                local _, chunk_emb_err = materializer_store():insert_embedding({
                    store_id = test_store_id,
                    node_id = chunk_id,
                    node_type = "chunk",
                    parent_id = doc_id,
                    embedding = test_vector(),
                })
                test.is_nil(chunk_emb_err)
                local edge_id, edge_err = store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(edge_err)
                test.not_nil(edge_id)

                local before_embeddings = db:query(
                    "SELECT node_id FROM kb10_embeddings WHERE node_id IN ($1, $2)",
                    { doc_id, chunk_id }
                )
                test.eq(2, #before_embeddings)
                local search_rows = db:type() == sql.type.POSTGRES
                    and "SELECT id AS node_id FROM kb10_nodes WHERE id IN ($1, $2)"
                        .. " AND search_vector @@ plainto_tsquery('english', 'cleanup')"
                    or "SELECT node_id FROM kb10_nodes_fts WHERE node_id IN ($1, $2)"
                local before_fts = db:query(search_rows, { doc_id, chunk_id })
                test.eq(2, #before_fts)

                local ok, del_err = materializer_store():delete_node({
                    store_id = test_store_id,
                    node_id = doc_id,
                })
                test.is_true(ok)
                test.is_nil(del_err)

                local nodes = db:query(
                    "SELECT id FROM kb10_nodes WHERE store_id = $1 AND id IN ($2, $3)",
                    { test_store_id, doc_id, chunk_id }
                )
                test.eq(0, #nodes)
                local embeddings = db:query(
                    "SELECT node_id FROM kb10_embeddings WHERE node_id IN ($1, $2)",
                    { doc_id, chunk_id }
                )
                test.eq(0, #embeddings)
                local fts = db:query(search_rows, { doc_id, chunk_id })
                test.eq(0, #fts)
                local edges = db:query(
                    "SELECT id FROM kb10_edges WHERE store_id = $1 AND (from_node_id IN ($2, $3) OR to_node_id IN ($4, $5))",
                    { test_store_id, doc_id, chunk_id, doc_id, chunk_id }
                )
                test.eq(0, #edges)
            end)

            test.it("protects the root concept from low-level deletion", function()
                local root_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Protected root",
                    metadata = { label = "Protected Root", concept_type = "root", is_root = true },
                } })
                test.not_nil(root_id)

                local ok, err = store():delete_node({ store_id = test_store_id, node_id = root_id })
                test.is_nil(ok)
                test.not_nil(err)
                test.is_true(string.find(tostring(err), "root concept cannot be deleted", 1, true) ~= nil)

                local node, get_err = store():get_node({ store_id = test_store_id, node_id = root_id })
                test.is_nil(get_err)
                test.not_nil(node)
            end)

            test.it("protects the root concept from graph patch deletion", function()
                local root_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Patch protected root",
                    metadata = { label = "Patch Protected Root", concept_type = "root", is_root = true },
                } })
                test.not_nil(root_id)

                local result, err = store():apply_graph_patch({
                    store_id = test_store_id,
                    delete_node_id = root_id,
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(string.find(tostring(err), "root concept cannot be deleted", 1, true) ~= nil)

                local node, get_err = store():get_node({ store_id = test_store_id, node_id = root_id })
                test.is_nil(get_err)
                test.not_nil(node)
            end)

            test.it("deleted node no longer appears in browse results", function()
                local node_id, _ = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Vanishing concept",
                    metadata = { label = "Vanish" },
                } })
                test.not_nil(node_id)

                store():delete_node({ store_id = test_store_id, node_id = node_id })

                local nodes, _ = store():browse_nodes({ store_id = test_store_id, opts = {
                    parent_id = "",
                    limit = 200,
                } })
                for _, n in ipairs(nodes) do
                    test.is_true(n.id ~= node_id)
                end
            end)
        end)


    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
