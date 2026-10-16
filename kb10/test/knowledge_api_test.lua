local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local contract = require("contract")
local ctx = require("ctx")
local kb10_types = require("kb10_types")
local materializer_lib = require("materializer_lib")
local node_store = require("node_store")
local kb_nodes = require("kb_nodes")


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
            origin = "knowledge_api_test",
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
local APP_DB = "app:db"

local function uuid()
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function count_rows(db: any, table_name: string, store_id: string): number
    local rows = db:query("SELECT COUNT(*) AS count FROM " .. table_name .. " WHERE store_id = $1", { store_id })
    return tonumber(rows and rows[1] and rows[1].count) or 0
end

local function define_tests()
    test.describe("knowledge API extended", function()
        local db

        test.before_all(function()
            db = sql.get(APP_DB)
            test.not_nil(db)
        end)

        test.after_all(function()
            if db then
                db:release()
            end
        end)

        test.describe("kb10 node deletion", function()
            local component_id = uuid()
            local store_id
            local doc_node_id
            local chunk_node_id

            test.before_all(function()
                local id, err = store():create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
                if err then error("store create: " .. tostring(err)) end
                store_id = id
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
            end)

            test.it("creates nodes for deletion test", function()
                local id, err = insert_materialized_node(store_id, {
                    node_type = "document",
                    content = "Document to be deleted",
                    content_type = "text/plain",
                    metadata = { title = "deletable" },
                })
                test.is_nil(err)
                test.not_nil(id)
                doc_node_id = id

                local cid, cerr = insert_materialized_node(store_id, {
                    parent_id = doc_node_id,
                    node_type = "chunk",
                    content = "Child chunk of deletable document",
                    content_type = "text/plain",
                    metadata = {},
                })
                test.is_nil(cerr)
                test.not_nil(cid)
                chunk_node_id = cid
            end)

            test.it("retrieves a node by id before deletion", function()
                local node, err = store():get_node({ store_id = store_id, node_id = doc_node_id })
                test.is_nil(err)
                test.not_nil(node)
                local n = (node :: any)
                test.eq(n.id, doc_node_id)
                test.eq(n.node_type, "document")
                test.eq(n.metadata.title, "deletable")
            end)

            -- Regression: the node read must return the node's CONTENT, not just its
            -- metadata header. node_store:get_node is the exact read the GetKBNode tool
            -- runs (kb_nodes -> node_store); a document/chunk read that dropped content
            -- would leave the agent unable to read the document.
            test.it("returns the full content for a document and its chunk", function()
                local doc, doc_err = store():get_node({ store_id = store_id, node_id = doc_node_id })
                test.is_nil(doc_err)
                test.eq((doc :: any).content, "Document to be deleted")

                local chunk, chunk_err = store():get_node({ store_id = store_id, node_id = chunk_node_id })
                test.is_nil(chunk_err)
                test.eq((chunk :: any).content, "Child chunk of deletable document")
            end)

            -- The GetKBNode tool reads through kb_nodes.get_node(kb_id, node_id): it
            -- resolves the KB by component id and returns the node's full content.
            test.it("kb_nodes.get_node returns the complete document content", function()
                local full, full_err = kb_nodes.get_node(component_id, doc_node_id)
                test.is_nil(full_err)
                test.eq((full :: any).content, "Document to be deleted")
                test.is_nil((full :: any).next_offset)
            end)

            test.it("deletes a leaf node", function()
                local ok, err = materializer_store():delete_node({ store_id = store_id, node_id = chunk_node_id })
                test.is_true(ok)
                test.is_nil(err)

                local node, get_err = store():get_node({ store_id = store_id, node_id = chunk_node_id })
                test.is_nil(node)
                test.not_nil(get_err)
            end)

            test.it("deletes a parent node", function()
                local ok, err = materializer_store():delete_node({ store_id = store_id, node_id = doc_node_id })
                test.is_true(ok)
                test.is_nil(err)

                local node, get_err = store():get_node({ store_id = store_id, node_id = doc_node_id })
                test.is_nil(node)
                test.not_nil(get_err)
            end)

            test.it("deletion removes all nodes", function()
                test.eq(count_rows(db, "kb10_nodes", store_id), 0)
            end)
        end)

        test.describe("kb10 browse_nodes pagination", function()
            local component_id = uuid()
            local store_id
            local node_ids = {}

            test.before_all(function()
                local id, err = store():create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
                if err then error("store create: " .. tostring(err)) end
                store_id = id

                for i = 1, 5 do
                    local nid, nerr = insert_materialized_node(store_id, {
                        node_type = "document",
                        content = "Browse test document " .. i,
                        content_type = "text/plain",
                        metadata = { index = i },
                    })
                    if nerr then error("node insert: " .. tostring(nerr)) end
                    table.insert(node_ids, nid)
                end

                local _, cerr = insert_materialized_node(store_id, {
                    node_type = "chunk",
                    content = "A chunk node at root level with explicit empty parent",
                    content_type = "text/plain",
                    metadata = {},
                })
                if cerr then error("chunk insert: " .. tostring(cerr)) end
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
            end)

            test.it("returns all nodes without filters", function()
                local nodes, err = store():browse_nodes({ store_id = store_id, opts = {} })
                test.is_nil(err)
                test.eq(#nodes, 6)
            end)

            test.it("filters by node_type", function()
                local docs, err = store():browse_nodes({ store_id = store_id, opts = { node_type = "document" } })
                test.is_nil(err)
                test.eq(#docs, 5)

                local chunks, cerr = store():browse_nodes({ store_id = store_id, opts = { node_type = "chunk" } })
                test.is_nil(cerr)
                test.eq(#chunks, 1)
            end)

            test.it("respects limit", function()
                local nodes, err = store():browse_nodes({ store_id = store_id, opts = { limit = 2 } })
                test.is_nil(err)
                test.eq(#nodes, 2)
            end)

            test.it("respects offset", function()
                local page1, err1 = store():browse_nodes({ store_id = store_id, opts = { limit = 2, offset = 0 } })
                test.is_nil(err1)
                test.eq(#page1, 2)

                local page2, err2 = store():browse_nodes({ store_id = store_id, opts = { limit = 2, offset = 2 } })
                test.is_nil(err2)
                test.not_nil(page2)
                test.ok(#page2 >= 1)
            end)

            test.it("returns empty past end", function()
                local nodes, err = store():browse_nodes({ store_id = store_id, opts = { limit = 10, offset = 100 } })
                test.is_nil(err)
                test.eq(#nodes, 0)
            end)

            test.it("counts the full match independent of limit and offset", function()
                -- The pager needs the whole match size, not the capped page. With a
                -- limit far below the seeded set (5 top-level documents), the page
                -- returns limit rows while the count still reports every match.
                local page, page_err = store():browse_nodes({
                    store_id = store_id, opts = { top_level = true, node_type = "document", limit = 2, offset = 0 },
                })
                test.is_nil(page_err)
                test.eq(#page, 2)

                local total, count_err = store():count_nodes({
                    store_id = store_id, opts = { top_level = true, node_type = "document" },
                })
                test.is_nil(count_err)
                test.eq(total, 5)

                -- Offset does not move the total either.
                local total_off, off_err = store():count_nodes({
                    store_id = store_id, opts = { top_level = true, node_type = "document", limit = 2, offset = 4 },
                })
                test.is_nil(off_err)
                test.eq(total_off, 5)
            end)
        end)

        test.describe("kb10 chunk ordering and windowing", function()
            -- A long document's chunks share created_at, so created_at alone gives a
            -- non-deterministic order. browse must order chunks by chunk_index so the
            -- agent can read them in document order and offset/limit yields a
            -- contiguous window around any chunk. Inserting in REVERSE chunk_index
            -- order makes insertion (created_at) order the opposite of document order,
            -- so only chunk_index ordering can produce the expected result.
            local component_id = uuid()
            local store_id
            local doc_id

            test.before_all(function()
                local id, err = store():create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
                if err then error("store create: " .. tostring(err)) end
                store_id = id
                local did, derr = insert_materialized_node(store_id, {
                    node_type = "document", content = "Long doc", content_type = "text/plain", metadata = { title = "Long doc" },
                })
                if derr then error("doc insert: " .. tostring(derr)) end
                doc_id = did
                for _, idx in ipairs({ 5, 4, 3, 2, 1 }) do
                    local _, cerr = insert_materialized_node(store_id, {
                        node_type = "chunk", parent_id = doc_id,
                        content = "chunk body " .. idx, content_type = "text/plain",
                        metadata = { chunk_index = idx },
                    })
                    if cerr then error("chunk insert: " .. tostring(cerr)) end
                end
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
            end)

            test.it("returns a document's chunks in chunk_index order", function()
                local chunks, err = store():browse_nodes({
                    store_id = store_id, opts = { parent_id = doc_id, node_type = "chunk", include_content = true },
                })
                test.is_nil(err)
                test.eq(#chunks, 5)
                for i, c in ipairs(chunks) do
                    test.eq(c.metadata.chunk_index, i)
                end
            end)

            test.it("offset and limit yield a contiguous window around a chunk", function()
                -- The window around chunk 3 (chunks 2,3,4): chunk_index order means
                -- offset 1, limit 3.
                local win, err = store():browse_nodes({
                    store_id = store_id, opts = { parent_id = doc_id, node_type = "chunk", limit = 3, offset = 1 },
                })
                test.is_nil(err)
                test.eq(#win, 3)
                test.eq(win[1].metadata.chunk_index, 2)
                test.eq(win[2].metadata.chunk_index, 3)
                test.eq(win[3].metadata.chunk_index, 4)
            end)

            test.it("paginates the same chunk order across pages", function()
                local p1 = store():browse_nodes({ store_id = store_id, opts = { parent_id = doc_id, node_type = "chunk", limit = 2, offset = 0 } })
                local p2 = store():browse_nodes({ store_id = store_id, opts = { parent_id = doc_id, node_type = "chunk", limit = 2, offset = 2 } })
                test.eq(p1[1].metadata.chunk_index, 1)
                test.eq(p1[2].metadata.chunk_index, 2)
                test.eq(p2[1].metadata.chunk_index, 3)
                test.eq(p2[2].metadata.chunk_index, 4)
            end)

            test.it("get_nodes returns every requested node by id with content", function()
                local chunks = store():browse_nodes({ store_id = store_id, opts = { parent_id = doc_id, node_type = "chunk", limit = 3 } })
                test.ok(#chunks >= 2)
                local ids = { chunks[1].id, chunks[2].id }
                local got, err = store():get_nodes({ store_id = store_id, node_ids = ids })
                test.is_nil(err)
                test.eq(#got, 2)
                local by_id: { [string]: any } = {}
                for _, n in ipairs(got) do by_id[n.id] = n end
                test.not_nil(by_id[ids[1]])
                test.not_nil(by_id[ids[2]])
                test.ok(type(by_id[ids[1]].content) == "string" and by_id[ids[1]].content ~= "")
            end)
        end)

        test.describe("kb10 edge operations", function()
            local component_id = uuid()
            local store_id
            local node_a_id, node_b_id, node_c_id
            local edge_ab_id, edge_bc_id

            test.before_all(function()
                local id, err = store():create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
                if err then error("store create: " .. tostring(err)) end
                store_id = id

                db:execute(
                    "UPDATE kb10_stores SET kb_type = 'wiki' WHERE id = $1",
                    { store_id }
                )

                local a, a_err = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Node A",
                    content_type = "text/plain",
                    metadata = { label = "A" },
                } })
                if a_err then error("node A: " .. tostring(a_err)) end
                node_a_id = a

                local b, b_err = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Node B",
                    content_type = "text/plain",
                    metadata = { label = "B" },
                } })
                if b_err then error("node B: " .. tostring(b_err)) end
                node_b_id = b

                local c, c_err = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Node C",
                    content_type = "text/plain",
                    metadata = { label = "C" },
                } })
                if c_err then error("node C: " .. tostring(c_err)) end
                node_c_id = c

                local eab, eab_err = store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = node_a_id,
                    to_node_id = node_b_id,
                    edge_type = "related_to",
                    weight = 0.8,
                    metadata = { reason = "test" },
                } })
                if eab_err then error("edge AB: " .. tostring(eab_err)) end
                edge_ab_id = eab

                local ebc, ebc_err = store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = node_b_id,
                    to_node_id = node_c_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                if ebc_err then error("edge BC: " .. tostring(ebc_err)) end
                edge_bc_id = ebc
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
            end)

            test.it("gets outgoing edges", function()
                local edges, err = store():get_edges({ store_id = store_id, node_id = node_a_id, opts = {
                    direction = "out",
                    limit = 50,
                } })
                test.is_nil(err)
                test.not_nil(edges)
                test.ok(#edges >= 1)
            end)

            test.it("gets incoming edges", function()
                local edges, err = store():get_edges({ store_id = store_id, node_id = node_b_id, opts = {
                    direction = "in",
                    limit = 50,
                } })
                test.is_nil(err)
                test.not_nil(edges)
                test.ok(#edges >= 1)
            end)

            test.it("gets both directions", function()
                local edges, err = store():get_edges({ store_id = store_id, node_id = node_b_id, opts = {
                    direction = "both",
                    limit = 50,
                } })
                test.is_nil(err)
                test.not_nil(edges)
                test.ok(#edges >= 2)
            end)

            test.it("filters edges by type", function()
                local edges, err = store():get_edges({ store_id = store_id, node_id = node_b_id, opts = {
                    direction = "both",
                    edge_type = "subtopic_of",
                    limit = 50,
                } })
                test.is_nil(err)
                test.not_nil(edges)
                test.ok(#edges >= 1)
            end)

            test.it("edge count via SQL", function()
                local rows, err = db:query(
                    "SELECT COUNT(*) as cnt FROM kb10_edges WHERE store_id = $1",
                    { store_id }
                )
                test.is_nil(err)
                test.ok(rows[1].cnt >= 2)
            end)

            test.it("deletes an edge", function()
                local extra_id, ins_err = store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = node_a_id,
                    to_node_id = node_c_id,
                    edge_type = "related_to",
                    weight = 0.5,
                } })
                test.is_nil(ins_err)

                local ok, err = store():delete_edge({ store_id = store_id, edge_id = extra_id })
                test.is_true(ok)
                test.is_nil(err)
            end)
        end)

        test.describe("kb10 graph_traverse", function()
            local component_id = uuid()
            local store_id
            local root_id, mid_id, leaf_id, isolated_id

            test.before_all(function()
                local id, err = store():create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
                if err then error("store create: " .. tostring(err)) end
                store_id = id

                db:execute(
                    "UPDATE kb10_stores SET kb_type = 'wiki' WHERE id = $1",
                    { store_id }
                )

                local r, re = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Root concept",
                    content_type = "text/plain",
                    metadata = { label = "root" },
                } })
                if re then error("root: " .. tostring(re)) end
                root_id = r

                local m, me = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Mid concept",
                    content_type = "text/plain",
                    metadata = { label = "mid" },
                } })
                if me then error("mid: " .. tostring(me)) end
                mid_id = m

                local l, le = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Leaf concept",
                    content_type = "text/plain",
                    metadata = { label = "leaf" },
                } })
                if le then error("leaf: " .. tostring(le)) end
                leaf_id = l

                local iso, iso_e = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Isolated concept",
                    content_type = "text/plain",
                    metadata = { label = "isolated" },
                } })
                if iso_e then error("isolated: " .. tostring(iso_e)) end
                isolated_id = iso

                local _, e1 = store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = mid_id,
                    to_node_id = root_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                if e1 then error("edge root->mid: " .. tostring(e1)) end

                local _, e2 = store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = leaf_id,
                    to_node_id = mid_id,
                    edge_type = "subtopic_of",
                    weight = 1.0,
                } })
                if e2 then error("edge mid->leaf: " .. tostring(e2)) end
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
            end)

            test.it("traverses depth 1 from root", function()
                local result, err = store():graph_traverse({ store_id = store_id, start_node_id = root_id, opts = { depth = 1, limit = 100 } })
                test.is_nil(err)
                test.not_nil(result)
                test.not_nil(result.nodes)
                test.not_nil(result.edges)

                test.is_true(#result.edges >= 1)

                local has_root = false
                local has_mid = false
                for _, n in ipairs(result.nodes) do
                    if n.id == root_id then has_root = true end
                    if n.id == mid_id then has_mid = true end
                end
                test.is_true(has_root)
                test.is_true(has_mid)
            end)

            test.it("traverses depth 2 from root to reach leaf", function()
                local result, err = store():graph_traverse({ store_id = store_id, start_node_id = root_id, opts = { depth = 2, limit = 100 } })
                test.is_nil(err)

                local node_ids = {}
                for _, n in ipairs(result.nodes) do
                    node_ids[n.id] = true
                end

                test.is_true(node_ids[root_id] == true)
                test.is_true(node_ids[mid_id] == true)
                test.is_true(node_ids[leaf_id] == true)
                test.eq(#result.edges, 2)
            end)

            test.it("does not reach isolated node", function()
                local result, err = store():graph_traverse({ store_id = store_id, start_node_id = root_id, opts = { depth = 10, limit = 100 } })
                test.is_nil(err)

                local has_isolated = false
                for _, n in ipairs(result.nodes) do
                    if n.id == isolated_id then has_isolated = true end
                end
                test.is_true(has_isolated == false)
            end)

            test.it("traverses from leaf upward", function()
                local result, err = store():graph_traverse({ store_id = store_id, start_node_id = leaf_id, opts = { depth = 2, limit = 100 } })
                test.is_nil(err)

                local node_ids = {}
                for _, n in ipairs(result.nodes) do
                    node_ids[n.id] = true
                end

                test.is_true(node_ids[leaf_id] == true)
                test.is_true(node_ids[mid_id] == true)
                test.is_true(node_ids[root_id] == true)
            end)

            test.it("returns node metadata in traversal", function()
                local result, err = store():graph_traverse({ store_id = store_id, start_node_id = root_id, opts = { depth = 1, limit = 100 } })
                test.is_nil(err)

                for _, n in ipairs(result.nodes) do
                    test.not_nil(n.metadata)
                    test.not_nil(n.metadata.label)
                end
            end)
        end)

        test.describe("kb10 get_summaries", function()
            local comp_a = uuid()
            local comp_b = uuid()
            local comp_c = uuid()

            test.before_all(function()
                local id_a, err_a = store():create_store({ component_id = comp_a, embedding_model = "test-model", config = {} })
                if err_a then error("store A: " .. tostring(err_a)) end
                db:execute(
                    "UPDATE kb10_stores SET auto_summary = $1 WHERE id = $2",
                    { "Summary for store A", id_a }
                )

                local id_b, err_b = store():create_store({ component_id = comp_b, embedding_model = "test-model", config = {} })
                if err_b then error("store B: " .. tostring(err_b)) end
                db:execute(
                    "UPDATE kb10_stores SET auto_summary = $1 WHERE id = $2",
                    { "Summary for store B", id_b }
                )

                local _, err_c = store():create_store({ component_id = comp_c, embedding_model = "test-model", config = {} })
                if err_c then error("store C: " .. tostring(err_c)) end
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { comp_a })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { comp_b })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { comp_c })
            end)

            test.it("returns summaries for components that have them", function()
                local summaries, err = store():get_summaries({ component_ids = { comp_a, comp_b, comp_c } })
                test.is_nil(err)
                test.not_nil(summaries)
                if summaries then
                    test.eq(summaries[comp_a], "Summary for store A")
                    test.eq(summaries[comp_b], "Summary for store B")
                    test.is_nil(summaries[comp_c])
                end
            end)

            test.it("returns empty table for empty input", function()
                local summaries = store():get_summaries({ component_ids = {} })
                test.not_nil(summaries)
                test.eq(next(summaries), nil)
            end)

            test.it("returns empty table for nonexistent components", function()
                local summaries, err = store():get_summaries({ component_ids = { uuid(), uuid() } })
                test.is_nil(err)
                test.eq(next(summaries), nil)
            end)
        end)

        test.describe("kb10 node deletion with edges", function()
            local component_id = uuid()
            local store_id
            local center_id, left_id, right_id

            test.before_all(function()
                local id, err = store():create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
                if err then error("store create: " .. tostring(err)) end
                store_id = id

                db:execute(
                    "UPDATE kb10_stores SET kb_type = 'wiki' WHERE id = $1",
                    { store_id }
                )

                local c, ce = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Center",
                    content_type = "text/plain",
                    metadata = {},
                } })
                if ce then error(tostring(ce)) end
                center_id = c

                local l, le = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Left",
                    content_type = "text/plain",
                    metadata = {},
                } })
                if le then error(tostring(le)) end
                left_id = l

                local r, re = store():insert_node({ store_id = store_id, node = {
                    node_type = "concept",
                    content = "Right",
                    content_type = "text/plain",
                    metadata = {},
                } })
                if re then error(tostring(re)) end
                right_id = r

                store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = left_id,
                    to_node_id = center_id,
                    edge_type = "related_to",
                    weight = 1.0,
                } })

                store():insert_edge({ store_id = store_id, edge = {
                    from_node_id = center_id,
                    to_node_id = right_id,
                    edge_type = "related_to",
                    weight = 1.0,
                } })
            end)

            test.after_all(function()
                db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
            end)

            test.it("removes edges when deleting a connected node", function()
                test.eq(count_rows(db, "kb10_edges", store_id), 2)

                local ok, err = store():delete_node({ store_id = store_id, node_id = center_id })
                test.is_true(ok)
                test.is_nil(err)

                test.eq(count_rows(db, "kb10_edges", store_id), 0)
                test.eq(count_rows(db, "kb10_nodes", store_id), 2)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
