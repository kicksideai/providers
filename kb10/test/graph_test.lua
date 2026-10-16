local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")

local kb10_types = require("kb10_types")
local materializer_lib = require("materializer_lib")
local node_store = require("node_store")

local TEST_ACTOR_ID = "graph_test_user"

local function test_runtime_identity(): (any, any)
    local actor = security.new_actor(TEST_ACTOR_ID, {})
    local scope = security.named_scope("wippy.security:process")
    return actor, scope
end

local function kb_store(): any
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
            origin = "graph_test",
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

local function uuid()
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function tool_exec(store_id, extra_context)
    local actor, scope = test_runtime_identity()
    local context = {
        graph_store_id = store_id,
    }
    if type(extra_context) == "table" then
        for k, v in pairs(extra_context) do
            context[k] = v
        end
    end
    return funcs.new():with_actor(actor):with_scope(scope):with_context(context)
end

local function fetch_concept_tree(store_id)
    return tool_exec(store_id):call("app:graph_fetch_tree", { store_id = store_id })
end

local function define_tests()
    test.describe("graph placement tools", function()
        local db
        local test_component_id
        local test_store_id
        local root_concept_id
        local all_stores: {string} = {}
        local all_components: {string} = {}

        local function setup_store()
            local db_err
            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)

            test_component_id = uuid()
            local store_id, err = kb_store():create_store({ component_id = test_component_id, embedding_model = "test-model", config = {} })
            if err then
                error("create_store failed for component_id=" .. tostring(test_component_id) .. ": " .. tostring(err))
            end
            test.is_nil(err)
            test.not_nil(store_id)
            test_store_id = store_id
            all_stores[#all_stores + 1] = store_id
            all_components[#all_components + 1] = test_component_id

            local rid, rerr = kb_store():insert_node({ store_id = test_store_id, node = {
                node_type = "concept",
                content = "Top-level knowledge",
                metadata = { label = "Root", is_root = true },
            } })
            test.is_nil(rerr)
            root_concept_id = rid
        end

        local function cleanup_store()
            local opened, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not opened then error("app:db unavailable: " .. tostring(db_err)) end
            local cdb = opened :: sql.DB
            local function execute(query, params)
                local _, err = cdb:execute(query, params)
                test.is_nil(err)
            end
            for _, sid in ipairs(all_stores) do
                execute("DELETE FROM kb10_edges WHERE store_id = $1", { sid })
                execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { sid })
                if cdb:type() == sql.type.SQLITE then
                    execute("DELETE FROM kb10_nodes_fts WHERE node_id IN "
                        .. "(SELECT id FROM kb10_nodes WHERE store_id = $1)", { sid })
                end
                execute("DELETE FROM kb10_nodes WHERE store_id = $1", { sid })
                execute("DELETE FROM kb10_stores WHERE id = $1", { sid })
            end
            for _, cid in ipairs(all_components) do
                execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
                execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
                execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
            end
            cdb:release()
            db:release()
            db = nil
            all_stores = {}
            all_components = {}
        end

        -- Each group starts with its own root, including on runners that scope
        -- ancestor hooks around the whole tree instead of each child group.
        local function with_store(name, define_group)
            test.describe(name, function()
                test.before_all(setup_store)
                test.after_all(cleanup_store)
                define_group()
            end)
        end

        with_store("fetch_concept_tree", function()
            test.it("returns tree with root concept", function()
                local result, err = fetch_concept_tree(test_store_id)
                test.is_nil(err)
                test.not_nil(result)
                test.eq(root_concept_id, result.root_id)
                test.eq(1, result.concept_count)
            end)

            -- Regression: fetch_concept_tree must not ipairs() a nil concept
            -- list. browse_nodes returns (nil, err) on a DB error; the old code
            -- cast that nil and crashed. A store with no concepts is the
            -- deterministic no-row case the guard also covers: a valid empty
            -- tree, never a raise.
            test.it("returns an empty tree without crashing for a store with no concepts", function()
                local empty_component = uuid()
                local empty_store, cerr = kb_store():create_store({ component_id = empty_component, embedding_model = "test-model", config = {} })
                test.is_nil(cerr)
                all_stores[#all_stores + 1] = empty_store
                all_components[#all_components + 1] = empty_component

                local result, err = fetch_concept_tree(empty_store :: string)
                test.is_nil(err, "no error for an empty store")
                test.not_nil(result, "returns a valid empty tree, not a crash")
                test.eq(result.concept_count, 0)
            end)

            test.it("builds tree with root and children", function()
                local child_id, err2 = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Programming topics",
                    metadata = { label = "Programming" },
                } })
                test.is_nil(err2)

                local _, edge_err = kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = child_id,
                    to_node_id = root_concept_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                test.is_nil(edge_err)

                local result, fetch_err = fetch_concept_tree(test_store_id)
                test.is_nil(fetch_err)
                test.not_nil(result)
                test.eq(root_concept_id, result.root_id)
                test.eq(2, result.concept_count)

                local text = result.tree_text
                test.not_nil(text)
                test.is_true(text:find("Root") ~= nil)
                test.is_true(text:find("Programming") ~= nil)
            end)
        end)

        with_store("fetch_concept_tree multi-level", function()
            test.it("renders 3-level deep tree with document counts", function()
                local mid_id, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Design topics",
                    metadata = { label = "Design" },
                } })
                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = mid_id,
                    to_node_id = root_concept_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })

                local leaf_id, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "UI design patterns",
                    metadata = { label = "UI Patterns" },
                } })
                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = leaf_id,
                    to_node_id = mid_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })

                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "UI patterns guide",
                    metadata = { title = "UI Guide" },
                })
                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = leaf_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })

                local result, err = fetch_concept_tree(test_store_id)
                test.is_nil(err)
                test.not_nil(result)

                local text = result.tree_text
                test.is_true(text:find("Root") ~= nil)
                test.is_true(text:find("Design") ~= nil)
                test.is_true(text:find("UI Patterns") ~= nil)
                test.is_true(text:find("docs=1") ~= nil)
                test.is_true(text:find("UI Guide") ~= nil)
            end)
        end)

        with_store("browse_tree tool", function()
            test.it("returns the full concept tree with documents under each concept", function()
                local long_label = string.rep("é", 200)
                local leaf_id = nil
                for index = 1, 121 do
                    local label = index == 121 and long_label or ("Concept " .. tostring(index))
                    local id, insert_err = kb_store():insert_node({ store_id = test_store_id, node = {
                        node_type = "concept", content = label, metadata = { label = label },
                    } })
                    test.is_nil(insert_err)
                    local _, edge_err = kb_store():insert_edge({ store_id = test_store_id, edge = {
                        from_node_id = id, to_node_id = root_concept_id, edge_type = "subtopic_of", weight = 1.0,
                    } })
                    test.is_nil(edge_err)
                    leaf_id = id
                end
                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document", content = "guide", metadata = { title = "Long Label Guide" },
                })
                test.is_nil(doc_err)
                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id, to_node_id = leaf_id, edge_type = "categorized_as", weight = 1.0,
                } })

                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:browse_tree", {})
                test.is_nil(err)
                test.eq(type(result), "string")
                test.contains(result, "id=" .. root_concept_id)
                test.contains(result, "[Concept 1] (id=")
                test.contains(result, "Concept 120")
                test.contains(result, long_label)
                test.contains(result, "Long Label Guide")
            end)
        end)

        with_store("attach_document tool", function()
            test.it("creates categorized_as edge between document and concept", function()
                local concept_id, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Test concept",
                    metadata = { label = "Attach Test" },
                } })
                test.not_nil(concept_id)

                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Test document content",
                    metadata = { title = "Test Doc" },
                })
                test.not_nil(doc_id)

                local exec = tool_exec(test_store_id)
                local result_str, err = exec:call("kickside.kb10.graph:attach_document", {
                    document_node_id = doc_id,
                    concept_id = concept_id,
                })
                test.is_nil(err)
                test.is_true((result_str :: any).success)
                test.is_true((result_str :: any).result == "attached")
                test.eq((result_str :: any).document_node_id, doc_id)
                test.eq((result_str :: any).concept_id, concept_id)

                local edges, _ = kb_store():get_edges({ store_id = test_store_id, node_id = concept_id, opts = { direction = "in", limit = 50 } })
                test.not_nil(edges)
                local found = false
                for _, e in ipairs(edges) do
                    if e.edge_type == "categorized_as" and e.from_node_id == doc_id then
                        found = true
                    end
                end
                test.is_true(found)
            end)

            test.it("returns already_attached for duplicate attachment", function()
                local concept_id, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Dedup concept",
                    metadata = { label = "Dedup Test" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Dedup doc",
                    metadata = { title = "Dedup Doc" },
                })

                local exec = tool_exec(test_store_id)
                exec:call("kickside.kb10.graph:attach_document", {
                    document_node_id = doc_id,
                    concept_id = concept_id,
                })

                local result_str, err = exec:call("kickside.kb10.graph:attach_document", {
                    document_node_id = doc_id,
                    concept_id = concept_id,
                })
                test.is_nil(err)
                test.is_true((result_str :: any).success)
                test.eq((result_str :: any).result, "unchanged")

                local edges, _ = kb_store():get_edges({ store_id = test_store_id, node_id = concept_id, opts = { direction = "in", limit = 50 } })
                local count = 0
                if edges then
                    for _, e in ipairs(edges) do
                        if e.edge_type == "categorized_as" and e.from_node_id == doc_id then
                            count = count + 1
                        end
                    end
                end
                test.eq(1, count)
            end)

            test.it("rejects attaching documents to root", function()
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Root attachment should fail",
                    metadata = { title = "Root Attach" },
                })

                local exec = tool_exec(test_store_id)
                local result, err = exec:call("kickside.kb10.graph:attach_document", {
                    document_node_id = doc_id,
                    concept_id = root_concept_id,
                })
                test.is_nil(err)
                test.is_false((result :: any).success)
                test.contains((result :: any).error, "root concept")
            end)

            test.it("requires both document_node_id and concept_id", function()
                local exec = tool_exec(test_store_id)
                local result, err = exec:call("kickside.kb10.graph:attach_document", {})
                test.is_nil(err)
                test.is_false((result :: any).success)
            end)
        end)

        with_store("move_document tool", function()
            test.it("removes old categorized_as edge and creates new one", function()
                local concept_a, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Concept A",
                    metadata = { label = "Move Source" },
                } })
                local concept_b, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Concept B",
                    metadata = { label = "Move Target" },
                } })
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Movable doc",
                    metadata = { title = "Move Doc" },
                })

                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc_id,
                    to_node_id = concept_a,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })

                local exec = tool_exec(test_store_id)
                local result_str, err = exec:call("kickside.kb10.graph:move_document", {
                    document_node_id = doc_id,
                    concept_id = concept_b,
                })
                test.is_nil(err)
                test.is_true((result_str :: any).success)
                test.is_true((result_str :: any).result == "moved")

                local edges_a, _ = kb_store():get_edges({ store_id = test_store_id, node_id = concept_a, opts = { direction = "in", limit = 50 } })
                local still_on_a = false
                if edges_a then
                    for _, e in ipairs(edges_a) do
                        if e.edge_type == "categorized_as" and e.from_node_id == doc_id then
                            still_on_a = true
                        end
                    end
                end
                test.is_true(not still_on_a)

                local edges_b, _ = kb_store():get_edges({ store_id = test_store_id, node_id = concept_b, opts = { direction = "in", limit = 50 } })
                local on_b = false
                if edges_b then
                    for _, e in ipairs(edges_b) do
                        if e.edge_type == "categorized_as" and e.from_node_id == doc_id then
                            on_b = true
                        end
                    end
                end
                test.is_true(on_b)
            end)

            test.it("requires both document_node_id and concept_id", function()
                local exec = tool_exec(test_store_id)
                local result, err = exec:call("kickside.kb10.graph:move_document", {})
                test.is_nil(err)
                test.is_false((result :: any).success)
            end)

            test.it("rejects moving documents to root", function()
                local doc_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Root move should fail",
                    metadata = { title = "Root Move" },
                })

                local exec = tool_exec(test_store_id)
                local result, err = exec:call("kickside.kb10.graph:move_document", {
                    document_node_id = doc_id,
                    concept_id = root_concept_id,
                })
                test.is_nil(err)
                test.is_false((result :: any).success)
                test.contains((result :: any).error, "root concept")
            end)
        end)

        local function concept_under(parent_id: string, label: string, metadata: any?): string
            local meta = metadata or {}
            meta.label = label
            local id, err = kb_store():insert_graph_node({ store_id = test_store_id, node = {
                node_type = "concept", content = label, metadata = meta,
            }, parent_edge = { to_node_id = parent_id, edge_type = "subtopic_of", weight = 1.0 } })
            test.is_nil(err)
            return id
        end

        local function categorize(doc_id: string, concept_id: string)
            local _, err = kb_store():insert_edge({ store_id = test_store_id, edge = {
                from_node_id = doc_id, to_node_id = concept_id, edge_type = "categorized_as", weight = 1.0,
            } })
            test.is_nil(err)
        end

        local function categorized_targets(doc_id: string): { [string]: boolean }, number
            local edges, err = kb_store():get_edges({ store_id = test_store_id, node_id = doc_id,
                opts = { direction = "out", edge_type = "categorized_as", limit = 5000 } })
            test.is_nil(err)
            local targets: { [string]: boolean } = {}
            for _, e in ipairs(edges) do targets[e.to_node_id] = true end
            return targets, #edges
        end

        with_store("placement tools over large edge sets", function()
            test.it("browse_tree lists every concept and every document title", function()
                local last_id = ""
                for index = 1, 501 do
                    last_id = concept_under(root_concept_id, "Wide Concept " .. tostring(index))
                end
                for index = 1, 6 do
                    local doc_id, doc_err = insert_materialized_node(test_store_id, {
                        node_type = "document", content = "doc", metadata = { title = "Wide Doc " .. tostring(index) },
                    })
                    test.is_nil(doc_err)
                    categorize(doc_id, last_id)
                end
                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:browse_tree", {})
                test.is_nil(err)
                test.contains(result, "[Wide Concept 501] (id=" .. last_id .. ", docs=6)")
                for index = 1, 6 do
                    test.contains(result, "* Wide Doc " .. tostring(index))
                end
            end)

            test.it("attach_document finds an existing categorization beyond the first edge page", function()
                local parent = concept_under(root_concept_id, "Attach Many")
                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document", content = "doc", metadata = { title = "Attach Many Doc" },
                })
                test.is_nil(doc_err)
                local last = ""
                for index = 1, 51 do
                    last = concept_under(parent, "Attach Many " .. tostring(index))
                    categorize(doc_id, last)
                end
                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:attach_document", {
                    document_node_id = doc_id, concept_id = last,
                })
                test.is_nil(err)
                test.eq((result :: any).error, nil)
                test.eq((result :: any).result, "unchanged")
            end)

            test.it("move_document replaces every categorization of the document", function()
                local parent = concept_under(root_concept_id, "Move Many")
                local target = concept_under(parent, "Move Many Target")
                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document", content = "doc", metadata = { title = "Move Many Doc" },
                })
                test.is_nil(doc_err)
                for index = 1, 51 do
                    categorize(doc_id, concept_under(parent, "Move Many " .. tostring(index)))
                end
                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:move_document", {
                    document_node_id = doc_id, concept_id = target,
                })
                test.is_nil(err)
                test.eq((result :: any).result, "moved")
                local targets, count = categorized_targets(doc_id)
                test.eq(count, 1)
                test.is_true(targets[target] == true)
            end)

            test.it("move_document honours a locked target beyond the first edge page", function()
                local parent = concept_under(root_concept_id, "Locked Many")
                local target = concept_under(parent, "Locked Many Target")
                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document", content = "doc", metadata = { title = "Locked Many Doc" },
                })
                test.is_nil(doc_err)
                for index = 1, 100 do
                    categorize(doc_id, concept_under(parent, "Locked Many " .. tostring(index)))
                end
                local locked = concept_under(parent, "Locked Many Pinned", { locked = true })
                categorize(doc_id, locked)
                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:move_document", {
                    document_node_id = doc_id, concept_id = target,
                })
                test.is_nil(err)
                test.is_false((result :: any).success)
                test.eq((result :: any).error, "document target concept is locked")
                local targets, count = categorized_targets(doc_id)
                test.eq(count, 101)
                test.is_true(targets[locked] == true)
            end)

            test.it("concept placement skips a document whose categorization is locked beyond the first edge page", function()
                local parent = concept_under(root_concept_id, "Placement Many")
                local doc_id, doc_err = insert_materialized_node(test_store_id, {
                    node_type = "document", content = "Placement body", metadata = { title = "Placement Many Doc" },
                })
                test.is_nil(doc_err)
                for index = 1, 100 do
                    categorize(doc_id, concept_under(parent, "Placement Many " .. tostring(index)))
                end
                categorize(doc_id, concept_under(parent, "Placement Many Pinned", { locked = true }))
                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:concept_placement", {
                    store_id = test_store_id, document_node_id = doc_id, extraction_model = "class:fast",
                })
                test.is_nil(err)
                test.eq((result :: any).action, "locked_categorization_skipped")
            end)

            test.it("merge_concept refuses to merge a concept into its own descendant", function()
                local from_id = concept_under(root_concept_id, "Merge Cycle Source")
                local child_id = concept_under(from_id, "Merge Cycle Child")
                local into_id = concept_under(child_id, "Merge Cycle Grandchild")
                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:merge_concept", {
                    from_id = from_id, into_id = into_id,
                })
                test.is_nil(err)
                test.is_false((result :: any).success)
                test.eq((result :: any).error, "cannot merge a concept into its own descendant")
                local still, still_err = kb_store():get_node({ store_id = test_store_id, node_id = from_id })
                test.is_nil(still_err)
                test.not_nil(still)
            end)

            test.it("node_store answers taxonomy descent and reads node batches beyond one page", function()
                local top = concept_under(root_concept_id, "Descent Top")
                local middle = concept_under(top, "Descent Middle")
                local leaf = concept_under(middle, "Descent Leaf")
                local below, below_err = kb_store():is_descendant({ store_id = test_store_id, ancestor_id = top, node_id = leaf })
                test.is_nil(below_err)
                test.is_true(below)
                local above, above_err = kb_store():is_descendant({ store_id = test_store_id, ancestor_id = leaf, node_id = top })
                test.is_nil(above_err)
                test.is_false(above)
                local ids: { string } = {}
                for index = 1, 501 do ids[index] = concept_under(top, "Batch " .. tostring(index)) end
                local nodes, nodes_err = kb_store():get_nodes({ store_id = test_store_id, node_ids = ids })
                test.is_nil(nodes_err)
                test.eq(#nodes, 501)
            end)

            test.it("merge_concept re-points every inbound edge before deleting the source", function()
                local from_id = concept_under(root_concept_id, "Merge Many Source")
                local into_id = concept_under(root_concept_id, "Merge Many Target")
                for index = 1, 2001 do
                    concept_under(from_id, "Merge Many Child " .. tostring(index))
                end
                local result, err = tool_exec(test_store_id):call("kickside.kb10.graph:merge_concept", {
                    from_id = from_id, into_id = into_id,
                })
                test.is_nil(err)
                test.eq((result :: any).result, "merged")
                test.eq((result :: any).moved_edges, 2001)
                local children, children_err = kb_store():get_edges({ store_id = test_store_id, node_id = into_id,
                    opts = { direction = "in", edge_type = "subtopic_of", limit = 5000 } })
                test.is_nil(children_err)
                test.eq(#children, 2001)
            end)
        end)

        with_store("concept root rule", function()
            local function fresh_store(): string
                local component_id = uuid()
                local store_id, err = kb_store():create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
                test.is_nil(err)
                all_stores[#all_stores + 1] = store_id
                all_components[#all_components + 1] = component_id
                return store_id
            end
            local function concept_in(store_id: string, label: string, parent_id: string?, metadata: any?): string
                local meta = metadata or {}
                meta.label = label
                local node = { node_type = "concept", content = label, metadata = meta }
                if parent_id then
                    local id, err = kb_store():insert_graph_node({ store_id = store_id, node = node,
                        parent_edge = { to_node_id = parent_id, edge_type = "subtopic_of", weight = 1.0 } })
                    test.is_nil(err)
                    return id
                end
                local id, err = kb_store():insert_node({ store_id = store_id, node = node })
                test.is_nil(err)
                return id
            end

            test.it("takes the concept flagged as root", function()
                concept_under(root_concept_id, "Rule Child")
                local taxonomy, err = kb_store():concept_taxonomy({ store_id = test_store_id })
                test.is_nil(err)
                test.eq(taxonomy.root_id, root_concept_id)
            end)

            test.it("takes the single parentless concept when none is flagged", function()
                local store_id = fresh_store()
                local placeholder = concept_in(store_id, "Placeholder")
                local top = concept_in(store_id, "Top")
                local _, edge_err = kb_store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = placeholder, to_node_id = top, edge_type = "subtopic_of", weight = 1.0 } })
                test.is_nil(edge_err)
                local taxonomy, err = kb_store():concept_taxonomy({ store_id = store_id })
                test.is_nil(err)
                test.eq(taxonomy.root_id, top)
                local tree, tree_err = tool_exec(store_id):call("kickside.kb10.graph:browse_tree", {})
                test.is_nil(tree_err)
                test.eq(tree:sub(1, #("[Top] (id=" .. top)), "[Top] (id=" .. top)
            end)

            test.it("refuses an ambiguous root", function()
                local flagged = fresh_store()
                concept_in(flagged, "Root A", nil, { is_root = true })
                concept_in(flagged, "Root B", nil, { is_root = true })
                local _, flagged_err = kb_store():concept_taxonomy({ store_id = flagged })
                test.not_nil(flagged_err)
                test.contains(tostring(flagged_err), "ambiguous root concept")

                local orphans = fresh_store()
                concept_in(orphans, "Loose A")
                concept_in(orphans, "Loose B")
                local _, orphan_err = kb_store():concept_taxonomy({ store_id = orphans })
                test.contains(tostring(orphan_err), "ambiguous root concept")
                local created, create_err = tool_exec(orphans):call("kickside.kb10.graph:create_concept", { label = "New" })
                test.is_nil(created)
                test.contains(tostring(create_err), "ambiguous root concept")
            end)
        end)

        with_store("get_concept_documents tool", function()
            test.it("lists documents attached to a concept", function()
                local concept_id, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Docs concept",
                    metadata = { label = "List Test" },
                } })
                local doc1_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Doc one",
                    metadata = { title = "First Document" },
                })
                local doc2_id, _ = insert_materialized_node(test_store_id, {
                    node_type = "document",
                    content = "Doc two",
                    metadata = { title = "Second Document" },
                })

                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc1_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })
                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = doc2_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                } })

                local exec = tool_exec(test_store_id)
                local result, err = exec:call("kickside.kb10.graph:get_concept_documents", {
                    concept_id = concept_id,
                })
                test.is_nil(err)
                test.is_true(result.success)
                local by_title = {}
                for _, document in ipairs(result.documents) do by_title[document.metadata.title] = document end
                test.eq(by_title["First Document"].id, doc1_id)
                test.eq(by_title["Second Document"].id, doc2_id)
                test.eq(by_title["First Document"].content, "Doc one")
                test.eq(by_title["Second Document"].node_type, "document")
                test.is_nil(result.next_offset)
            end)

            test.it("pages document records by a native offset", function()
                local concept_id, concept_err = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept", content = "Paged docs", metadata = { label = "Paged docs" },
                } })
                test.is_nil(concept_err)
                for index = 1, 3 do
                    local document_id, document_err = insert_materialized_node(test_store_id, {
                        node_type = "document", content = "document " .. tostring(index), metadata = { title = "Paged " .. tostring(index) },
                    })
                    test.is_nil(document_err)
                    local _, edge_err = kb_store():insert_edge({ store_id = test_store_id, edge = {
                        from_node_id = document_id, to_node_id = concept_id, edge_type = "categorized_as", weight = 1.0,
                    } })
                    test.is_nil(edge_err)
                end

                local exec = tool_exec(test_store_id)
                local first: any, first_err = exec:call("kickside.kb10.graph:get_concept_documents", { concept_id = concept_id, limit = 2 })
                test.is_nil(first_err)
                test.eq(#first.documents, 2)
                test.eq(first.next_offset, 2)

                local second: any, second_err = exec:call("kickside.kb10.graph:get_concept_documents", { concept_id = concept_id, limit = 2, offset = first.next_offset })
                test.is_nil(second_err)
                test.eq(#second.documents, 1)
                test.is_nil(second.next_offset)
            end)

            test.it("returns complete document titles", function()
                local concept_id, concept_err = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept", content = "Long titles", metadata = { label = "Long titles" },
                } })
                test.is_nil(concept_err)
                local title = string.rep("é", 300) .. "\nextra"
                local document_id, document_err = insert_materialized_node(test_store_id, {
                    node_type = "document", content = "long title document", metadata = { title = title },
                })
                test.is_nil(document_err)
                local _, edge_err = kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = document_id, to_node_id = concept_id, edge_type = "categorized_as", weight = 1.0,
                } })
                test.is_nil(edge_err)

                local result: any, err = tool_exec(test_store_id):call("kickside.kb10.graph:get_concept_documents", { concept_id = concept_id })
                test.is_nil(err)
                test.eq(result.documents[1].id, document_id)
                test.eq(result.documents[1].metadata.title, title)
                test.eq(result.documents[1].content, "long title document")
            end)

            test.it("returns message when no documents attached", function()
                local concept_id, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Empty concept",
                    metadata = { label = "Empty" },
                } })

                local exec = tool_exec(test_store_id)
                local result, err = exec:call("kickside.kb10.graph:get_concept_documents", {
                    concept_id = concept_id,
                })
                test.is_nil(err)
                test.eq(#result.documents, 0)
                test.is_nil(result.next_offset)
            end)

            test.it("requires concept_id", function()
                local exec = tool_exec(test_store_id)
                local result: any, err = exec:call("kickside.kb10.graph:get_concept_documents", {})
                test.is_nil(err)
                test.is_false(result.success)
                test.eq(result.error, "concept_id is required")
            end)
        end)

        with_store("concept label identity", function()
            test.it("reuses a labeled concept beyond the first 5000 nodes", function()
                local exec = tool_exec(test_store_id)
                local created, create_err = exec:call("kickside.kb10.graph:create_concept", { label = "Tail Topic" })
                test.is_nil(create_err)
                local target_id = (created :: any).concept_id
                test.not_nil(target_id)
                local db = assert(sql.get("app:db"))
                local _, date_err = db:execute("UPDATE kb10_nodes SET created_at = $1 WHERE id = $2",
                    { "2999-01-01T00:00:00Z", target_id })
                test.is_nil(date_err)
                local prefix = uuid():sub(1, 24)
                for first = 1, 5000, 100 do
                    local values: { string } = {}
                    local params: { any } = { test_store_id }
                    for index = first, first + 99 do
                        local id_parameter = #params + 1
                        params[#params + 1] = prefix .. string.format("%012d", index)
                        params[#params + 1] = json.encode({ label = "Filler " .. index })
                        values[#values + 1] = "($1, $" .. id_parameter .. ", 'concept', $" .. (id_parameter + 1) .. ", '2026-01-01T00:00:00Z')"
                    end
                    local _, insert_err = db:execute("INSERT INTO kb10_nodes (store_id, id, node_type, metadata, created_at) VALUES " .. table.concat(values, ","), params)
                    test.is_nil(insert_err)
                end
                db:release()
                local before, count_err = kb_store():count_nodes({ store_id = test_store_id })
                test.is_nil(count_err)
                local reused, reuse_err = exec:call("kickside.kb10.graph:create_concept", { label = "  TAIL   Topic " })
                test.is_nil(reuse_err)
                test.eq((reused :: any).result, "reused")
                test.eq((reused :: any).concept_id, target_id)
                local after, after_err = kb_store():count_nodes({ store_id = test_store_id })
                test.is_nil(after_err)
                test.eq(after, before)
            end)

        end)

        with_store("create_concept tool", function()
            test.it("creates concept node with subtopic_of edge to root", function()
                local exec = tool_exec(test_store_id)
                local result_str, err = exec:call("kickside.kb10.graph:create_concept", {
                    label = "Test Topic",
                    description = "A test topic for unit tests",
                })
                test.is_nil(err)
                test.not_nil(result_str, "create_concept returned nil: " .. tostring(err))
                test.is_true((result_str :: any).success)
                test.eq((result_str :: any).result, "created")
                test.eq((result_str :: any).label, "Test Topic")
                local concept_id = (result_str :: any).concept_id
                test.not_nil(concept_id, "could not parse concept id from: " .. tostring(result_str))

                local node, _ = kb_store():get_node({ store_id = test_store_id, node_id = concept_id })
                test.not_nil(node)
                test.eq("concept", node.node_type)
                local meta = node.metadata or {}
                test.eq("Test Topic", meta.label)
            end)

            test.it("creates nested concept under specified parent", function()
                local exec = tool_exec(test_store_id)

                local parent_str, _ = exec:call("kickside.kb10.graph:create_concept", {
                    label = "Parent Topic",
                    description = "A parent topic",
                    parent_id = root_concept_id,
                })
                test.is_true((parent_str :: any).success)
                local parent_id = (parent_str :: any).concept_id
                test.not_nil(parent_id)

                local child_str, err = exec:call("kickside.kb10.graph:create_concept", {
                    label = "Child Topic",
                    description = "A nested topic",
                    parent_id = parent_id,
                })
                test.is_nil(err)
                test.is_true((child_str :: any).success)
                local child_id = (child_str :: any).concept_id
                test.not_nil(child_id)
                test.eq((child_str :: any).parent_id, parent_id)

                local edges, _ = kb_store():get_edges({ store_id = test_store_id, node_id = parent_id, opts = { direction = "in", limit = 50 } })
                local found = false
                if edges then
                    for _, e in ipairs(edges) do
                        if e.edge_type == "subtopic_of" and e.from_node_id == child_id then
                            found = true
                        end
                    end
                end
                test.is_true(found)
            end)

            test.it("requires explicit parent once the tree has concepts", function()
                local exec = tool_exec(test_store_id)

                local seed_str, seed_err = exec:call("kickside.kb10.graph:create_concept", {
                    label = "Explicit Seed " .. uuid(),
                    description = "A seed topic",
                    parent_id = root_concept_id,
                })
                test.is_nil(seed_err)
                test.is_true((seed_str :: any).success)

                local result, err = exec:call("kickside.kb10.graph:create_concept", {
                    label = "Missing Parent " .. uuid(),
                    description = "This should require parent_id",
                })
                test.is_nil(err)
                test.is_false((result :: any).success)
                test.contains((result :: any).error, "parent_id is required")
            end)

            test.it("enforces configured link depth", function()
                local exec = tool_exec(test_store_id, { graph_link_depth = 1 })

                local parent_str, parent_err = exec:call("kickside.kb10.graph:create_concept", {
                    label = "Depth Parent " .. uuid(),
                    description = "A top-level topic",
                    parent_id = root_concept_id,
                })
                test.is_nil(parent_err)
                test.is_true((parent_str :: any).success)
                local parent_id = (parent_str :: any).concept_id
                test.not_nil(parent_id)

                local child_str, child_err = exec:call("kickside.kb10.graph:create_concept", {
                    label = "Depth Child " .. uuid(),
                    description = "A child beyond configured depth",
                    parent_id = parent_id,
                })
                test.is_nil(child_err)
                test.is_false((child_str :: any).success)
                test.contains((child_str :: any).error, "link depth limit")
            end)

            test.it("requires label", function()
                local exec = tool_exec(test_store_id)
                local result, err = exec:call("kickside.kb10.graph:create_concept", {})
                test.is_nil(err)
                test.is_false((result :: any).success)
            end)
        end)

        -- node_store is the canonical id boundary: node/edge ids are UUID columns,
        -- which some drivers return as UUID values that compare == but do not hash
        -- as table keys. These lock that the boundary returns plain string ids and
        -- that the graph's direct string-keyed lookups resolve (no tostring, no
        -- linear == scan).
        with_store("node_store id boundary", function()
            test.it("returns node ids as strings usable as direct table keys", function()
                local concept_id, cerr = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Boundary concept",
                    metadata = { label = "Boundary" },
                } })
                test.is_nil(cerr)
                test.eq("string", type(concept_id))

                local node, gerr = kb_store():get_node({ store_id = test_store_id, node_id = concept_id })
                test.is_nil(gerr)
                test.not_nil(node)
                test.eq("string", type(node.id), "get_node id must be a string")

                local batch, berr = kb_store():get_nodes({ store_id = test_store_id, node_ids = { concept_id } })
                test.is_nil(berr)
                test.eq(1, #batch)
                test.eq("string", type(batch[1].id), "get_nodes id must be a string")

                local by_id: {[string]: any} = {}
                by_id[batch[1].id] = batch[1]
                test.not_nil(by_id[concept_id], "returned id must key and read back by a plain string")
            end)

            test.it("returns browse_nodes ids as strings", function()
                local rows, err = kb_store():browse_nodes({ store_id = test_store_id, opts = { node_type = "concept", limit = 100 } })
                test.is_nil(err)
                test.not_nil(rows)
                test.is_true(#rows > 0)
                for _, r in ipairs(rows) do
                    test.eq("string", type(r.id), "browse_nodes id must be a string")
                end
            end)

            test.it("returns edge endpoint ids as strings for direct-key lookup", function()
                local child_id, _ = kb_store():insert_node({ store_id = test_store_id, node = {
                    node_type = "concept",
                    content = "Boundary child",
                    metadata = { label = "BoundaryChild" },
                } })
                kb_store():insert_edge({ store_id = test_store_id, edge = {
                    from_node_id = child_id,
                    to_node_id = root_concept_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })

                local edges, err = kb_store():get_edges({ store_id = test_store_id, node_id = root_concept_id, opts = { direction = "in", limit = 50 } })
                test.is_nil(err)
                test.not_nil(edges)
                local by_from: {[string]: any} = {}
                for _, e in ipairs(edges) do
                    test.eq("string", type(e.id), "edge id must be a string")
                    test.eq("string", type(e.from_node_id), "from_node_id must be a string")
                    test.eq("string", type(e.to_node_id), "to_node_id must be a string")
                    by_from[e.from_node_id] = e
                end
                test.not_nil(by_from[child_id], "edge from_node_id must key and read back by a plain string")

                local ebatch, berr = kb_store():get_edges_batch({ store_id = test_store_id, node_ids = { root_concept_id }, opts = { direction = "in" } })
                test.is_nil(berr)
                test.not_nil(ebatch)
                for _, e in ipairs(ebatch) do
                    test.eq("string", type(e.from_node_id), "get_edges_batch from_node_id must be a string")
                    test.eq("string", type(e.to_node_id), "get_edges_batch to_node_id must be a string")
                end
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
