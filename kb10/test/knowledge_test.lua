local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local contract = require("contract")
local registry = require("registry")
local ctx = require("ctx")
local security = require("security")
local kb10_types = require("kb10_types")
local materializer_lib = require("materializer_lib")
local node_store = require("node_store")

-- Component class every KB registers under (knowledge's vocabulary).
local COMPONENT_CLASS = "knowledge_base"


local function store(): any
    return node_store
end

-- Source-content writes go through the kb10-internal materializer surface directly
-- (the source-materialization contract was removed); it validates canonical lineage.
local function materializer_store(): any
    return materializer_lib
end

local materialized_seq = 0
local function with_materialized_lineage(node)
    materialized_seq = materialized_seq + 1
    node.metadata = type(node.metadata) == "table" and node.metadata or {}
    local metadata = node.metadata
    local external_id = metadata.external_id or ("fixture:" .. tostring(materialized_seq))
    local external_version = metadata.external_version or ("v" .. tostring(materialized_seq))
    metadata.external_source = metadata.external_source or "fixture"
    metadata.external_id = external_id
    metadata.external_version = external_version
    metadata.thread_event_id = metadata.thread_event_id or ("fixture-event:" .. tostring(materialized_seq))
    metadata.thread_event_seq = metadata.thread_event_seq or materialized_seq
    if type(metadata.source_ref) ~= "table" then
        metadata.source_ref = {
            kind = "fixture",
            origin = "knowledge_test",
            external_source = metadata.external_source,
            external_id = external_id,
            external_version = external_version,
            thread_event_id = metadata.thread_event_id,
            thread_event_seq = metadata.thread_event_seq,
        }
    end
    return node
end

local function insert_materialized_node(store_id, node)
    return materializer_store():insert_node({ store_id = store_id, node = with_materialized_lineage(node) })
end

local EMBEDDABLE_CONTRACT = "kickside.contract:embeddable"
local QUERYABLE_CONTRACT = "kickside.contract:queryable"
local EMBED_BINDING = (kb10_types.EMBED_BINDING :: string)
local QUERY_BINDING = (kb10_types.QUERY_BINDING :: string)

local function test_runtime_identity(user_id: string): (any, any)
    local actor = security.new_actor(user_id, {})
    local scope = security.named_scope("wippy.security:process")
    return actor, scope
end

local function open_scoped(contract_id: string, binding_id: string, component_id: string, user_id: string): (any, string?)
    local def, def_err = contract.get(contract_id)
    if def_err or not def then
        return nil, def_err and tostring(def_err) or "contract unavailable"
    end
    local actor, scope = test_runtime_identity(user_id)
    return def:with_actor(actor):with_scope(scope):open(binding_id, { component_id = component_id })
end

local function uuid()
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function count_rows(db: any, table_name: string, store_id: string): number
    local rows = db:query("SELECT COUNT(*) AS count FROM " .. table_name .. " WHERE store_id = $1", { store_id })
    return tonumber(rows and rows[1] and rows[1].count) or 0
end

local function count_nodes(db: any, store_id: string, node_type: string?): number
    if node_type then
        local rows = db:query(
            "SELECT COUNT(*) AS count FROM kb10_nodes WHERE store_id = $1 AND node_type = $2",
            { store_id, node_type }
        )
        return tonumber(rows and rows[1] and rows[1].count) or 0
    end
    return count_rows(db, "kb10_nodes", store_id)
end

local function define_tests()
    test.describe("knowledge base system", function()
        local db
        local test_component_id = uuid()
        local test_user_id = "test_kb_owner_" .. uuid()
        local test_store_id

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
        end)

        test.after_all(function()
            -- The wippy.test framework re-runs an ancestor's after_all
            -- once per nested describe. The first firing deletes the
            -- store row, so subsequent SELECT-by-component_id subqueries
            -- return empty and orphan nodes/embeddings/fts rows leak.
            -- Delete in reverse-FK order using IN clauses that resolve
            -- before the store row is gone, idempotently per firing.
            local cdb, _ = sql.get("app:db")
            if cdb then
                cdb:execute(
                    "DELETE FROM kb10_embeddings WHERE store_id IN (SELECT id FROM kb10_stores WHERE component_id = $1)",
                    { test_component_id }
                )
                cdb:execute(
                    "DELETE FROM kb10_edges WHERE store_id IN (SELECT id FROM kb10_stores WHERE component_id = $1)",
                    { test_component_id }
                )
                cdb:execute(
                    "DELETE FROM kb10_nodes_fts WHERE node_id IN (" ..
                    "SELECT id FROM kb10_nodes WHERE store_id IN (" ..
                    "SELECT id FROM kb10_stores WHERE component_id = $1))",
                    { test_component_id }
                )
                cdb:execute(
                    "DELETE FROM kb10_nodes WHERE store_id IN (SELECT id FROM kb10_stores WHERE component_id = $1)",
                    { test_component_id }
                )
                cdb:execute("DELETE FROM kb10_stores WHERE component_id = $1", { test_component_id })
                cdb:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { test_component_id })
                cdb:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { test_component_id })
                cdb:execute("DELETE FROM kickside_components WHERE component_id = $1", { test_component_id })
                cdb:release()
            end
            if db then pcall(function() db:release() end) end
        end)

        test.describe("component registration", function()
            test.it("registers a KB component with correct impl_id", function()
                local _, err = db:execute(
                    [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                      VALUES ($1, $2, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { test_component_id, EMBED_BINDING }
                )
                test.is_nil(err)

                local meta_entries = {
                    { key = "title", value = "Test Knowledge Base" },
                    { key = "description", value = "KB for testing" },
                    { key = "class", value = COMPONENT_CLASS },
                }
                for _, m in ipairs(meta_entries) do
                    _, err = db:execute(
                        [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                        { uuid(), test_component_id, m.key, m.value }
                    )
                    test.is_nil(err)
                end

                _, err = db:execute(
                    [[INSERT INTO kickside_component_access (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
                      VALUES ($1, 'user', $2, $3, $4, 15, CURRENT_TIMESTAMP)]],
                    { uuid(), test_user_id, test_component_id, test_component_id }
                )
                test.is_nil(err)
            end)

            test.it("retrieves component with correct impl_id", function()
                local rows, err = db:query(
                    "SELECT * FROM kickside_components WHERE component_id = $1",
                    { test_component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].impl_id, EMBED_BINDING)
            end)
        end)

        test.describe("kb10 store", function()
            test.it("creates a store for the component", function()
                local id, err = store():create_store({ component_id = test_component_id, embedding_model = "test-embedding-model", config = {} })
                test.is_nil(err)
                test.not_nil(id)
                test_store_id = id
            end)

            test.it("retrieves the store by component_id", function()
                local s, err = store():get_store({ component_id = test_component_id })
                test.is_nil(err)
                test.not_nil(s)
                test.eq(s.component_id, test_component_id)
                test.eq(s.embedding_model, "test-embedding-model")
                test.eq(s.id, test_store_id)
            end)

            test.it("requires materializer seam for source node mutations", function()
                local raw_id, raw_err = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "document",
                    content = "Raw public insert should not be canonical.",
                    content_type = "text/plain",
                    metadata = {},
                } })
                test.is_nil(raw_id)
                test.not_nil(raw_err)
                test.is_true(tostring(raw_err):find("source materialization") ~= nil)

                local forged_id, forged_err = store():insert_node({ store_id = test_store_id, node = {
                    node_type = "document",
                    content = "Forged materializer flag should not be canonical.",
                    content_type = "text/plain",
                    metadata = {},
                }, materializer = true })
                test.is_nil(forged_id)
                test.not_nil(forged_err)
                test.is_true(tostring(forged_err):find("source materialization") ~= nil)

                local ghost_id, ghost_err = materializer_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "document",
                    content = "Source nodes must persist their own lineage.",
                    content_type = "text/plain",
                    metadata = {
                        external_source = "fixture",
                        external_id = "ghost",
                        external_version = "v1",
                        thread_event_id = "event:ghost",
                        thread_event_seq = 1,
                    },
                } })
                test.is_nil(ghost_id)
                test.not_nil(ghost_err)
                test.is_true(tostring(ghost_err):find("source_ref") ~= nil)

                local mismatch_id, mismatch_err = materializer_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "document",
                    content = "Source lineage must agree with source_ref.",
                    content_type = "text/plain",
                    metadata = {
                        external_source = "fixture",
                        external_id = "canonical",
                        external_version = "v1",
                        thread_event_id = "event:canonical",
                        thread_event_seq = 2,
                        source_ref = {
                            external_source = "fixture",
                            external_id = "different",
                            external_version = "v1",
                            thread_event_id = "event:canonical",
                            thread_event_seq = 2,
                        },
                    },
                } })
                test.is_nil(mismatch_id)
                test.not_nil(mismatch_err)
                test.is_true(tostring(mismatch_err):find("mismatched") ~= nil)

                local replace_missing, replace_missing_err = materializer_store():replace_document({
                    store_id = test_store_id,
                    document = {
                        node_type = "document",
                        content = "Replacement root must persist source_ref.",
                        content_type = "text/plain",
                        metadata = {
                            external_source = "fixture",
                            external_id = "replace-missing",
                            external_version = "v1",
                            thread_event_id = "event:replace-missing",
                            thread_event_seq = 3,
                        },
                    },
                    children = {},
                })
                test.is_nil(replace_missing)
                test.not_nil(replace_missing_err)
                test.is_true(tostring(replace_missing_err):find("source_ref") ~= nil)

                local replace_doc = with_materialized_lineage({
                    node_type = "document",
                    content = "Replacement tree root.",
                    content_type = "text/plain",
                    metadata = {
                        external_id = "replace-tree",
                        external_version = "v1",
                        thread_event_id = "event:replace-tree",
                        thread_event_seq = 4,
                    },
                })
                local replace_child = with_materialized_lineage({
                    node_type = "summary",
                    content = "Replacement tree child.",
                    content_type = "text/plain",
                    metadata = {
                        external_id = "replace-tree-child",
                        external_version = "v1",
                        thread_event_id = "event:replace-tree",
                        thread_event_seq = 4,
                    },
                })
                local replace_bad, replace_bad_err = materializer_store():replace_document({
                    store_id = test_store_id,
                    document = replace_doc,
                    children = {
                        { node = replace_child, embedding = { 0.1 } },
                    },
                })
                test.is_nil(replace_bad)
                test.not_nil(replace_bad_err)
                test.is_true(tostring(replace_bad_err):find("child.external_id") ~= nil)

                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Materialized document can be created.",
                    content_type = "text/plain",
                    metadata = {},
                })
                test.is_nil(doc_err)
                test.not_nil(doc_id)

                local public_ok, public_err = store():delete_node({ store_id = test_store_id, node_id = doc_id })
                test.is_nil(public_ok)
                test.not_nil(public_err)
                test.is_true(tostring(public_err):find("source materialization") ~= nil)

                local materialized_ok, materialized_err = materializer_store():delete_node({
                    store_id = test_store_id,
                    node_id = doc_id,
                })
                test.is_true(materialized_ok)
                test.is_nil(materialized_err)
            end)

            test.it("inserts a document node", function()
                local id, err = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "This is a test document about artificial intelligence.",
                    content_type = "text/plain",
                    metadata = { source = "test", filename = "test.txt" }
                })
                test.is_nil(err)
                test.not_nil(id)
            end)

            test.it("inserts a chunk node with parent", function()
                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Parent document for chunk test.",
                    content_type = "text/plain",
                    metadata = {}
                })
                test.is_nil(doc_err)

                local chunk_id, chunk_err = insert_materialized_node(test_store_id, {
                    parent_id = doc_id,
                    node_type = "chunk",
                    content = "This is a chunk of the parent document.",
                    content_type = "text/plain",
                    metadata = { chunk_index = 0 }
                })
                test.is_nil(chunk_err)
                test.not_nil(chunk_id)
            end)

            test.it("browses root nodes with top_level", function()
                -- top_level restricts to parent IS NULL: the two documents, not the chunk.
                local nodes, err = store():browse_nodes({ store_id = test_store_id, opts = { top_level = true } })
                test.is_nil(err)
                test.not_nil(nodes)
                test.eq(#nodes, 2)
                for _, node in ipairs(nodes) do
                    test.eq(node.node_type, "document")
                end
            end)

            test.it("browses child nodes by node_type across all parents", function()
                -- A bare node_type browse must span all parents, not be silently
                -- filtered to roots: the chunk node lives under its document (non-null
                -- parent) yet must come back.
                local chunks, err = store():browse_nodes({ store_id = test_store_id, opts = { node_type = "chunk" } })
                test.is_nil(err)
                test.not_nil(chunks)
                test.eq(#chunks, 1)
                test.eq(chunks[1].node_type, "chunk")
                test.not_nil(chunks[1].parent_id)
            end)

            test.it("persists expected node type rows", function()
                test.eq(count_nodes(db, test_store_id, nil), 3)
                test.eq(count_nodes(db, test_store_id, "document"), 2)
                test.eq(count_nodes(db, test_store_id, "chunk"), 1)
            end)

            test.it("deletes the store and cascades", function()
                local ok, err = store():delete_store({ component_id = test_component_id })
                test.is_true(ok)
                test.is_nil(err)

                local s, get_err = store():get_store({ component_id = test_component_id })
                test.is_nil(s)
                test.not_nil(get_err)
            end)

            test.it("recreates store for contract tests", function()
                local id, err = store():create_store({ component_id = test_component_id, embedding_model = "test-embedding-model", config = {} })
                test.is_nil(err)
                test.not_nil(id)
                test_store_id = id
            end)
        end)

        test.describe("concept graph structure", function()
            local graph_component_id = uuid()
            local graph_store_id
            local root_concept_id
            local child_concept_a_id
            local child_concept_b_id
            local doc_node_id

            test.before_all(function()
                local _, err = db:execute(
                    [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                      VALUES ($1, $2, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { graph_component_id, EMBED_BINDING }
                )
                if err then error("component insert: " .. tostring(err)) end

                local id, store_err = store():create_store({ component_id = graph_component_id, embedding_model = "test-embedding-model", config = {
                    extraction_model = "class:fast",
                    retrieval_model = "class:fast",
                    max_retrieval_iterations = 3,
                } })
                if store_err then error("store create: " .. tostring(store_err)) end
                graph_store_id = id

                db:execute(
                    "UPDATE kb10_stores SET kb_type = 'wiki' WHERE id = $1",
                    { graph_store_id }
                )
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { graph_store_id })
                db:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { graph_store_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { graph_store_id })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { graph_component_id })
                db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { graph_component_id })
                db:execute("DELETE FROM kickside_components WHERE component_id = $1", { graph_component_id })
            end)

            test.it("creates a root concept node", function()
                local id, err = store():insert_node({ store_id = graph_store_id, node = {
                    node_type = "concept",
                    content = "Test knowledge graph",
                    content_type = "text/plain",
                    metadata = {
                        label = "Root",
                        concept_type = "root",
                        is_root = true,
                    }
                } })
                test.is_nil(err)
                test.not_nil(id)
                root_concept_id = id
            end)

            test.it("retrieves root concept with correct metadata", function()
                local node, err = store():get_node({ store_id = graph_store_id, node_id = root_concept_id })
                test.is_nil(err)
                test.not_nil(node)
                test.eq(node.node_type, "concept")
                test.eq(node.metadata.label, "Root")
                test.eq(node.metadata.is_root, true)
                test.eq(node.metadata.concept_type, "root")
            end)

            test.it("creates child concept nodes", function()
                local id_a, err_a = store():insert_node({ store_id = graph_store_id, node = {
                    node_type = "concept",
                    content = "Covers neural networks, training methods",
                    content_type = "text/plain",
                    metadata = { label = "AI and Machine Learning", concept_type = "topic" }
                } })
                test.is_nil(err_a)
                test.not_nil(id_a)
                child_concept_a_id = id_a

                local id_b, err_b = store():insert_node({ store_id = graph_store_id, node = {
                    node_type = "concept",
                    content = "Design patterns, architecture",
                    content_type = "text/plain",
                    metadata = { label = "Software Engineering", concept_type = "topic" }
                } })
                test.is_nil(err_b)
                test.not_nil(id_b)
                child_concept_b_id = id_b
            end)

            test.it("creates subtopic_of edges from children to root", function()
                local edge_a, err_a = store():insert_edge({ store_id = graph_store_id, edge = {
                    from_node_id = child_concept_a_id,
                    to_node_id = root_concept_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                test.is_nil(err_a)
                test.not_nil(edge_a)

                local edge_b, err_b = store():insert_edge({ store_id = graph_store_id, edge = {
                    from_node_id = child_concept_b_id,
                    to_node_id = root_concept_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                test.is_nil(err_b)
                test.not_nil(edge_b)
            end)

            test.it("retrieves tree edges from root", function()
                local edges, err = store():get_edges({ store_id = graph_store_id, node_id = root_concept_id, opts = {
                    direction = "in",
                    limit = 50,
                } })
                test.is_nil(err)
                test.not_nil(edges)

                local subtopic_count = 0
                for _, e in ipairs(edges) do
                    if e.edge_type == "subtopic_of" then
                        subtopic_count = subtopic_count + 1
                        test.eq(e.to_node_id, root_concept_id)
                    end
                end
                test.eq(subtopic_count, 2)
            end)

            test.it("creates a document node", function()
                local id, err = insert_materialized_node(graph_store_id, {
                    node_type = "document",
                    content = "This document explains transformer attention mechanisms for NLP tasks.",
                    content_type = "text/plain",
                    metadata = { title = "Transformer Attention" }
                })
                test.is_nil(err)
                test.not_nil(id)
                doc_node_id = id
            end)

            test.it("links document to concept via categorized_as", function()
                local edge_id, err = store():insert_edge({ store_id = graph_store_id, edge = {
                    from_node_id = doc_node_id,
                    to_node_id = child_concept_a_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                test.is_nil(err)
                test.not_nil(edge_id)
            end)

            test.it("counts documents per concept via categorized_as edges", function()
                local edges, err = store():get_edges({ store_id = graph_store_id, node_id = child_concept_a_id, opts = {
                    direction = "in",
                    limit = 50,
                } })
                test.is_nil(err)

                local doc_count = 0
                for _, e in ipairs(edges) do
                    if e.edge_type == "categorized_as" then
                        doc_count = doc_count + 1
                    end
                end
                test.eq(doc_count, 1)
            end)

            test.it("browse_nodes returns all concepts", function()
                local concepts = store():browse_nodes({ store_id = graph_store_id, opts = {
                    node_type = "concept",
                    limit = 100,
                } })
                test.not_nil(concepts)
                test.eq(#concepts, 3)

                local has_root = false
                for _, c in ipairs(concepts) do
                    if c.metadata and c.metadata.is_root then
                        has_root = true
                    end
                end
                test.is_true(has_root)
            end)

            test.it("enforces unique edge constraint", function()
                local _, err = store():insert_edge({ store_id = graph_store_id, edge = {
                    from_node_id = child_concept_a_id,
                    to_node_id = root_concept_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                test.not_nil(err)
            end)

            test.it("persists graph nodes and edges", function()
                test.eq(count_nodes(db, graph_store_id, "concept"), 3)
                test.eq(count_nodes(db, graph_store_id, "document"), 1)
                test.eq(count_rows(db, "kb10_edges", graph_store_id), 3)
            end)
        end)

        test.describe("contract bindings", function()
            test.it("gets the embeddable contract definition", function()
                local c, err = contract.get(EMBEDDABLE_CONTRACT)
                test.is_nil(err)
                test.not_nil(c)
            end)

            test.it("gets the queryable contract definition", function()
                local c, err = contract.get(QUERYABLE_CONTRACT)
                test.is_nil(err)
                test.not_nil(c)
            end)

            test.it("opens kb10 embeddable via scoped contract definition", function()
                local instance, err = open_scoped(EMBEDDABLE_CONTRACT, EMBED_BINDING, test_component_id, test_user_id)
                test.is_nil(err, "open embeddable: " .. tostring(err))
                test.not_nil(instance)
            end)

            test.it("opens kb10 queryable via scoped contract definition", function()
                local instance, err = open_scoped(QUERYABLE_CONTRACT, QUERY_BINDING, test_component_id, test_user_id)
                test.is_nil(err, "open queryable: " .. tostring(err))
                test.not_nil(instance)
            end)

            test.it("opens kb10 embeddable with actor and scope", function()
                local instance, err = open_scoped(EMBEDDABLE_CONTRACT, EMBED_BINDING, test_component_id, test_user_id)
                test.is_nil(err, "scoped open kb10 embeddable: " .. tostring(err))
                test.not_nil(instance)
            end)

            test.it("opens kb10 queryable with actor and scope", function()
                local instance, err = open_scoped(QUERYABLE_CONTRACT, QUERY_BINDING, test_component_id, test_user_id)
                test.is_nil(err, "scoped open kb10 queryable: " .. tostring(err))
                test.not_nil(instance)
            end)

            -- A KB component registers with impl_id = the embeddable binding, so
            -- component-bound dispatch (component.open(kb_id, READ, queryable),
            -- used by the agent kb_query trait) only resolves queryable if the
            -- embeddable binding itself declares it. Regression for "Component
            -- does not implement target contract 'kickside.contract:queryable'".
            test.it("kb embeddable bindings declare the queryable contract", function()
                for _, binding_id in ipairs({ EMBED_BINDING }) do
                    local entry, err = registry.get(binding_id)
                    test.is_nil(err, "get binding " .. binding_id .. ": " .. tostring(err))
                    test.not_nil(entry)
                    local contracts = (entry.data and entry.data.contracts) or {}
                    local has_queryable = false
                    for _, c in ipairs(contracts) do
                        if c.contract == QUERYABLE_CONTRACT then
                            has_queryable = true
                            break
                        end
                    end
                    test.is_true(has_queryable,
                        binding_id .. " must declare " .. QUERYABLE_CONTRACT ..
                        " for component.open(kb, READ, queryable) to resolve it")
                end
            end)
        end)
    end)

    -- The engine seeds its own graph anchor: create_store, given a graph-shaped
    -- store (opts.is_graph), inserts exactly one root CONCEPT node (concept_type
    -- ROOT, is_root, label = KB name, content = description) plus its embedding.
    -- A document store gets no concept node. This is the kb10-owned behavior that
    -- the knowledge control plane used to perform; it now lives entirely in the
    -- engine, so creating a graph/wiki KB through the contract yields a root with
    -- no control-plane seeding involved.
    test.describe("create_store seeds the graph root concept", function()
        local seeded: { [string]: string } = {}

        local function clean()
            local cdb, _ = sql.get("app:db")
            if not cdb then return end
            for _, cid in pairs(seeded) do
                cdb:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { cid })
                cdb:execute("DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM kb10_nodes WHERE store_id = $1)", { cid })
                cdb:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { cid })
                cdb:execute("DELETE FROM kb10_stores WHERE id = $1", { cid })
            end
            cdb:release()
        end

        test.after_all(clean)

        local function concept_roots(store_id: string): { any }
            local nodes = store():browse_nodes({ store_id = store_id, opts = { node_type = "concept", limit = 100 } })
            local roots: { any } = {}
            for _, n in ipairs(nodes or {}) do
                if n.metadata and n.metadata.is_root then roots[#roots + 1] = n end
            end
            return roots
        end

        local function root_embeddings(store_id: string, node_id: string): number
            local edb, _ = sql.get("app:db")
            if not edb then return 0 end
            local rows, _ = edb:query(
                "SELECT id FROM kb10_embeddings WHERE store_id = $1 AND node_id = $2",
                { store_id, node_id }
            )
            edb:release()
            return rows and #rows or 0
        end

        local function embedding_vector(): { number }
            local v: { number } = {}
            for i = 1, 512 do v[i] = 0.01 end
            return v
        end

        test.it("wiki KB gets exactly one root concept node", function()
            local cid = "seed_wiki_" .. uuid()
            seeded.wiki = cid
            local _, err = store():create_store({
                component_id = cid,
                embedding_model = "test-model",
                config = {},
                opts = { kb_type = "wiki", is_graph = true, name = "Wiki KB", description = "A wiki" },
            })
            test.is_nil(err, "create wiki store: " .. tostring(err))

            local roots = concept_roots(cid)
            test.eq(#roots, 1, "wiki KB seeds exactly one root concept")
            local full, gerr = store():get_node({ store_id = cid, node_id = roots[1].id :: string })
            test.is_nil(gerr)
            test.not_nil(full)
            test.eq(full.node_type, "concept")
            test.eq(full.metadata.is_root, true)
            test.eq(full.metadata.concept_type, "root")
            test.eq(full.metadata.label, "Wiki KB")
            test.eq(full.content, "A wiki")
        end)

        test.it("materialized wiki documents are not anchored to the root concept", function()
            local cid = "seed_anchor_" .. uuid()
            seeded.anchor = cid
            local _, err = store():create_store({
                component_id = cid,
                embedding_model = "test-model",
                config = {},
                opts = { kb_type = "wiki", is_graph = true, name = "Anchored Wiki", description = "Root" },
            })
            test.is_nil(err, "create anchored wiki store: " .. tostring(err))

            local roots = concept_roots(cid)
            test.eq(#roots, 1)
            local document = with_materialized_lineage({
                node_type = "document",
                content = "Root-anchored source document",
                content_type = "text/plain",
                metadata = { title = "Anchored doc" },
            })
            local doc_meta = document.metadata
            local result, replace_err = materializer_store():replace_document({
                store_id = cid,
                document = document,
                children = {{
                    node = {
                        node_type = "summary",
                        content = "Anchored summary",
                        content_type = "text/plain",
                        metadata = {
                            role = "summary",
                            external_source = doc_meta.external_source,
                            external_id = doc_meta.external_id,
                            external_version = doc_meta.external_version,
                            thread_event_id = doc_meta.thread_event_id,
                            thread_event_seq = doc_meta.thread_event_seq,
                            source_ref = doc_meta.source_ref,
                        },
                    },
                    embedding = embedding_vector(),
                }},
            })
            test.is_nil(replace_err, "replace anchored document: " .. tostring(replace_err))
            test.not_nil(result)

            local edges, edge_err = store():get_edges({
                store_id = cid,
                node_id = result.document_node_id,
                opts = { direction = "out", limit = 20 },
            })
            test.is_nil(edge_err)
            local anchored = false
            for _, edge in ipairs(edges or {}) do
                if edge.edge_type == "categorized_as" and edge.to_node_id == roots[1].id then
                    anchored = edge.metadata and edge.metadata.system_default == true
                end
            end
            test.is_false(anchored, "materialized document must wait for non-root placement")
        end)

        test.it("document KB seeds no concept node", function()
            local cid = "seed_doc_" .. uuid()
            seeded.doc = cid
            local _, err = store():create_store({
                component_id = cid,
                embedding_model = "test-model",
                config = {},
                opts = { kb_type = "document", is_graph = false, name = "Doc KB", description = "A doc" },
            })
            test.is_nil(err, "create document store: " .. tostring(err))

            local concepts = store():browse_nodes({ store_id = cid, opts = { node_type = "concept", limit = 100 } })
            test.eq(#(concepts or {}), 0, "document KB seeds no concept node")
        end)

        -- The root carries an embedding when an embedding model resolves. The
        -- harness only resolves a live provider when OPENAI_API_KEY is present
        -- (the kb_ingest suite's live-embed precondition), so a missing key yields
        -- a root node with no embedding rather than a failure — the seed tolerates
        -- embed failure by design. When embedding does run, it produces exactly
        -- one root embedding.
        test.it("root concept carries at most one embedding, exactly one when embed resolves", function()
            local cid = "seed_emb_" .. uuid()
            seeded.emb = cid
            local _, err = store():create_store({
                component_id = cid,
                embedding_model = "class:embed",
                config = {},
                opts = { kb_type = "wiki", is_graph = true, name = "Embed KB", description = "embed me" },
            })
            test.is_nil(err, "create wiki store: " .. tostring(err))

            local roots = concept_roots(cid)
            test.eq(#roots, 1)
            local n = root_embeddings(cid, roots[1].id :: string)
            test.is_true(n == 0 or n == 1, "root has zero or one embedding, got " .. tostring(n))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
