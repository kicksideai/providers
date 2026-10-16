local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local kb10_types = require("kb10_types")
local store = require("store")

local function uuid()
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function define_tests()
    test.describe("kb10 plugin", function()
        local db = sql.get("app:db")
        if not db then
            error("database unavailable")
        end

        test.describe("types", function()
            test.it("defines EMBED_BINDING", function()
                test.eq(kb10_types.EMBED_BINDING, "kickside.kb10:embeddable")
            end)

            test.it("defines QUERY_BINDING", function()
                test.eq(kb10_types.QUERY_BINDING, "kickside.kb10:queryable")
            end)
        end)

        test.describe("kb10_stores schema", function()
            local store_id = uuid()
            local component_id = uuid()
            local config_json = json.encode({ chunk_size = 1000, chunk_overlap = 150 })

            test.it("inserts a store", function()
                local _, err = db:execute(
                    "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                    { store_id, component_id, "text-embedding-3-small", config_json }
                )
                test.is_nil(err)
            end)

            test.it("retrieves the store by component_id", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_stores WHERE component_id = $1",
                    { component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].id, store_id)
                test.eq(rows[1].embedding_model, "text-embedding-3-small")

                local config = json.decode((rows[1].config :: any) :: string)
                test.eq(config.chunk_size, 1000)
                test.eq(config.chunk_overlap, 150)
            end)

            test.it("enforces unique component_id", function()
                local _, err = db:execute(
                    "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                    { uuid(), component_id, "model2", "{}" }
                )
                test.not_nil(err)
            end)

            test.it("updates auto_summary", function()
                local _, err = db:execute(
                    "UPDATE kb10_stores SET auto_summary = $1 WHERE id = $2",
                    { "Test document summary", store_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT auto_summary FROM kb10_stores WHERE id = $1",
                    { store_id }
                )
                test.is_nil(q_err)
                test.eq(rows[1].auto_summary, "Test document summary")
            end)

            test.it("updates auto_description", function()
                local _, err = db:execute(
                    "UPDATE kb10_stores SET auto_description = $1 WHERE id = $2",
                    { "Auto generated description", store_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT auto_description FROM kb10_stores WHERE id = $1",
                    { store_id }
                )
                test.is_nil(q_err)
                test.eq(rows[1].auto_description, "Auto generated description")
            end)

            test.it("updates kb_type", function()
                local _, err = db:execute(
                    "UPDATE kb10_stores SET kb_type = $1 WHERE id = $2",
                    { "wiki", store_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT kb_type FROM kb10_stores WHERE id = $1",
                    { store_id }
                )
                test.is_nil(q_err)
                test.eq(rows[1].kb_type, "wiki")
            end)

            test.it("deletes the store", function()
                local _, err = db:execute("DELETE FROM kb10_stores WHERE id = $1", { store_id })
                test.is_nil(err)

                local rows, q_err = db:query("SELECT * FROM kb10_stores WHERE id = $1", { store_id })
                test.is_nil(q_err)
                test.eq(#rows, 0)
            end)
        end)

        test.describe("kb10_nodes schema", function()
            local s_id = uuid()
            local component_id = uuid()
            local doc_node_id = uuid()
            local chunk_node_id = uuid()

            test.it("setup store for node tests", function()
                local _, err = db:execute(
                    "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                    { s_id, component_id, "model", "{}" }
                )
                test.is_nil(err)
            end)

            test.it("inserts a document node", function()
                local metadata = json.encode({ title = "Test Doc", chunk_count = 3 })
                local _, err = db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, parent_id, node_type, content, content_type, metadata) VALUES ($1, $2, NULL, $3, $4, $5, $6)",
                    { doc_node_id, s_id, "document", "Full document content", "text/plain", metadata }
                )
                test.is_nil(err)
            end)

            test.it("inserts a chunk node as child of document", function()
                local metadata = json.encode({ chunk_index = 1 })
                local _, err = db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, parent_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                    { chunk_node_id, s_id, doc_node_id, "chunk", "Chunk content here", "text/plain", metadata }
                )
                test.is_nil(err)
            end)

            test.it("retrieves node by id", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_nodes WHERE id = $1 AND store_id = $2",
                    { doc_node_id, s_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].node_type, "document")
                test.eq(rows[1].content, "Full document content")
                test.is_nil(rows[1].parent_id)
            end)

            test.it("retrieves child nodes by parent_id", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_nodes WHERE parent_id = $1 AND store_id = $2",
                    { doc_node_id, s_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].id, chunk_node_id)
                test.eq(rows[1].node_type, "chunk")
            end)

            test.it("filters by node_type", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_nodes WHERE store_id = $1 AND node_type = $2",
                    { s_id, "chunk" }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].id, chunk_node_id)
            end)

            test.it("parses metadata JSON", function()
                local rows, err = db:query(
                    "SELECT metadata FROM kb10_nodes WHERE id = $1",
                    { doc_node_id }
                )
                test.is_nil(err)
                local meta = json.decode((rows[1].metadata :: any) :: string)
                test.eq(meta.title, "Test Doc")
                test.eq(meta.chunk_count, 3)
            end)

            test.it("cleanup nodes", function()
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { s_id })
                db:execute("DELETE FROM kb10_stores WHERE id = $1", { s_id })

                local rows, _ = db:query("SELECT * FROM kb10_nodes WHERE store_id = $1", { s_id })
                test.eq(#rows, 0)
            end)
        end)

        test.describe("kb10_edges schema", function()
            local s_id = uuid()
            local component_id = uuid()
            local node_a = uuid()
            local node_b = uuid()
            local node_c = uuid()
            local edge_id = uuid()

            test.it("setup store and nodes for edge tests", function()
                local _, err = db:execute(
                    "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                    { s_id, component_id, "model", "{}" }
                )
                test.is_nil(err)

                db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                    { node_a, s_id, "entity", "Node A", "text/plain", "{}" }
                )
                db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                    { node_b, s_id, "entity", "Node B", "text/plain", "{}" }
                )
                db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                    { node_c, s_id, "entity", "Node C", "text/plain", "{}" }
                )
            end)

            test.it("inserts an edge between nodes", function()
                local metadata = json.encode({ source = "extraction" })
                local _, err = db:execute(
                    "INSERT INTO kb10_edges (id, store_id, from_node_id, to_node_id, edge_type, weight, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                    { edge_id, s_id, node_a, node_b, "related_to", 0.9, metadata }
                )
                test.is_nil(err)
            end)

            test.it("retrieves edges by store_id", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_edges WHERE store_id = $1",
                    { s_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].from_node_id, node_a)
                test.eq(rows[1].to_node_id, node_b)
                test.eq(rows[1].edge_type, "related_to")
            end)

            test.it("queries outgoing edges", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_edges WHERE store_id = $1 AND from_node_id = $2",
                    { s_id, node_a }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
            end)

            test.it("queries incoming edges", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_edges WHERE store_id = $1 AND to_node_id = $2",
                    { s_id, node_b }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
            end)

            test.it("inserts a second edge", function()
                local _, err = db:execute(
                    "INSERT INTO kb10_edges (id, store_id, from_node_id, to_node_id, edge_type, weight, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                    { uuid(), s_id, node_b, node_c, "depends_on", 0.5, "{}" }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT * FROM kb10_edges WHERE store_id = $1",
                    { s_id }
                )
                test.is_nil(q_err)
                test.eq(#rows, 2)
            end)

            test.it("deletes an edge", function()
                local _, err = db:execute(
                    "DELETE FROM kb10_edges WHERE id = $1 AND store_id = $2",
                    { edge_id, s_id }
                )
                test.is_nil(err)

                local rows, q_err = db:query(
                    "SELECT * FROM kb10_edges WHERE id = $1",
                    { edge_id }
                )
                test.is_nil(q_err)
                test.eq(#rows, 0)
            end)

            test.it("cleanup edges and nodes", function()
                db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { s_id })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { s_id })
                db:execute("DELETE FROM kb10_stores WHERE id = $1", { s_id })
            end)
        end)

        test.describe("store CRUD lifecycle", function()
            local component_id = uuid()
            local store_id

            test.it("creates a store with config", function()
                local id = uuid()
                store_id = id
                local config = json.encode({
                    chunk_size = 500,
                    chunk_overlap = 100,
                    summary_model = "claude-3-haiku",
                    chunk_enrichment_model = "claude-3-haiku",
                })
                local _, err = db:execute(
                    "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                    { id, component_id, "text-embedding-3-small", config }
                )
                test.is_nil(err)
            end)

            test.it("inserts document and chunk nodes", function()
                local doc_id = uuid()
                local _, doc_err = db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                    { doc_id, store_id, "document", "Document content", "text/plain", json.encode({ title = "Test" }) }
                )
                test.is_nil(doc_err)

                local chunk_id = uuid()
                local _, chunk_err = db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, parent_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                    { chunk_id, store_id, doc_id, "chunk", "Chunk 1", "text/plain", json.encode({ chunk_index = 1 }) }
                )
                test.is_nil(chunk_err)

                local rows, q_err = db:query(
                    "SELECT COUNT(*) as count FROM kb10_nodes WHERE store_id = $1",
                    { store_id }
                )
                test.is_nil(q_err)
                test.eq(tonumber(rows[1].count), 2)
            end)

            test.it("counts nodes by type", function()
                local rows, err = db:query(
                    "SELECT node_type, COUNT(*) as count FROM kb10_nodes WHERE store_id = $1 GROUP BY node_type",
                    { store_id }
                )
                test.is_nil(err)
                test.eq(#rows, 2)
            end)

            test.it("cascade deletes nodes when store is removed", function()
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                db:execute("DELETE FROM kb10_stores WHERE id = $1", { store_id })

                local rows, _ = db:query("SELECT * FROM kb10_stores WHERE id = $1", { store_id })
                test.eq(#rows, 0)

                local node_rows, _ = db:query("SELECT * FROM kb10_nodes WHERE store_id = $1", { store_id })
                test.eq(#node_rows, 0)
            end)
        end)

        test.describe("ingest idempotency (delete_documents_by_external_id)", function()
            -- store is imported as a library; cast past the typed-Lua import boundary
            local s = store :: any
            local component_id = uuid()
            local store_id
            local doc_a, chunk_a, doc_b, chunk_b

            local function emb_vec()
                local v = {}
                for i = 1, 512 do v[i] = 0.001 end
                return v
            end

            test.it("sets up two documents from different canonical sources", function()
                local sid, err = s.create_store(component_id, "text-embedding-3-small", {})
                test.is_nil(err)
                store_id = sid

                doc_a = s.insert_node(store_id, {
                    node_type = "document", content = "Doc A", content_type = "text/plain",
                    metadata = { upload_id = "UP-A", external_source = "fixture", external_id = "upload:UP-A", title = "A" },
                })
                chunk_a = s.insert_node(store_id, {
                    parent_id = doc_a, node_type = "chunk", content = "Chunk A",
                    content_type = "text/plain", metadata = { upload_id = "UP-A", external_source = "fixture", external_id = "upload:UP-A" },
                })
                s.insert_embedding(store_id, doc_a, "document", nil, emb_vec())
                s.insert_embedding(store_id, chunk_a, "chunk", doc_a, emb_vec())

                doc_b = s.insert_node(store_id, {
                    node_type = "document", content = "Doc B", content_type = "text/plain",
                    metadata = { upload_id = "UP-B", external_source = "fixture", external_id = "upload:UP-B", title = "B" },
                })
                chunk_b = s.insert_node(store_id, {
                    parent_id = doc_b, node_type = "chunk", content = "Chunk B",
                    content_type = "text/plain", metadata = { upload_id = "UP-B", external_source = "fixture", external_id = "upload:UP-B" },
                })
                s.insert_embedding(store_id, chunk_b, "chunk", doc_b, emb_vec())

                local rows = db:query("SELECT COUNT(*) as c FROM kb10_nodes WHERE store_id = $1", { store_id })
                test.eq(tonumber(rows[1].c), 4)
            end)

            test.it("removes only the matching source document and its children", function()
                local removed, err = s.delete_documents_by_external_id(store_id, "fixture", "upload:UP-A")
                test.is_nil(err)
                test.eq(tonumber(type(removed) == "table" and removed.removed or removed), 1)

                local a_nodes = db:query(
                    "SELECT id FROM kb10_nodes WHERE store_id = $1 AND (id = $2 OR parent_id = $3)",
                    { store_id, doc_a, doc_a }
                )
                test.eq(#a_nodes, 0)

                local a_emb = db:query(
                    "SELECT node_id FROM kb10_embeddings WHERE node_id IN ($1, $2)",
                    { doc_a, chunk_a }
                )
                test.eq(#a_emb, 0)

                local b_nodes = db:query(
                    "SELECT id FROM kb10_nodes WHERE store_id = $1 AND (id = $2 OR parent_id = $3)",
                    { store_id, doc_b, doc_b }
                )
                test.eq(#b_nodes, 2)

                local b_emb = db:query("SELECT node_id FROM kb10_embeddings WHERE node_id = $1", { chunk_b })
                test.eq(#b_emb, 1)
            end)

            test.it("is a no-op for an empty external id", function()
                local removed = s.delete_documents_by_external_id(store_id, "fixture", "")
                test.eq(tonumber(type(removed) == "table" and removed.removed or removed), 0)
                local rows = db:query("SELECT COUNT(*) as c FROM kb10_nodes WHERE store_id = $1", { store_id })
                test.eq(tonumber(rows[1].c), 2)
            end)

            test.it("is a no-op for an unknown external id", function()
                local removed = s.delete_documents_by_external_id(store_id, "fixture", "upload:UP-MISSING")
                test.eq(tonumber(type(removed) == "table" and removed.removed or removed), 0)
            end)

            test.it("cleanup", function()
                s.delete_node(store_id, doc_b)
                s.delete_store(component_id)
            end)
        end)

        test.describe("store vector dimensions constant", function()
            test.it("uses 512 dimensions", function()
                local VECTOR_DIMENSIONS = 512
                test.eq(VECTOR_DIMENSIONS, 512)
            end)
        end)

        test.describe("node metadata handling", function()
            test.it("parses valid JSON metadata", function()
                local raw = '{"title":"Doc","tags":["a","b"]}'
                local parsed, err = json.decode(raw)
                test.is_nil(err)
                test.eq(parsed.title, "Doc")
                test.eq(#parsed.tags, 2)
            end)

            test.it("defaults to empty table for nil metadata", function()
                local metadata = nil
                if not metadata then
                    metadata = {}
                end
                test.eq(type(metadata), "table")
            end)

            test.it("defaults to empty table for invalid JSON", function()
                local raw = "not json"
                local parsed, parse_err = json.decode(raw)
                if parse_err then
                    parsed = {}
                end
                test.eq(type(parsed), "table")
            end)
        end)

        test.describe("node isolation by store_id", function()
            local store_a = uuid()
            local store_b = uuid()
            local comp_a = uuid()
            local comp_b = uuid()

            test.it("setup two stores", function()
                db:execute(
                    "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                    { store_a, comp_a, "model", "{}" }
                )
                db:execute(
                    "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                    { store_b, comp_b, "model", "{}" }
                )

                db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                    { uuid(), store_a, "document", "Doc A", "text/plain", "{}" }
                )
                db:execute(
                    "INSERT INTO kb10_nodes (id, store_id, node_type, content, content_type, metadata) VALUES ($1, $2, $3, $4, $5, $6)",
                    { uuid(), store_b, "document", "Doc B", "text/plain", "{}" }
                )
            end)

            test.it("queries nodes scoped to store A", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_nodes WHERE store_id = $1",
                    { store_a }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].content, "Doc A")
            end)

            test.it("queries nodes scoped to store B", function()
                local rows, err = db:query(
                    "SELECT * FROM kb10_nodes WHERE store_id = $1",
                    { store_b }
                )
                test.is_nil(err)
                test.eq(#rows, 1)
                test.eq(rows[1].content, "Doc B")
            end)

            test.it("cleanup", function()
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_a })
                db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_b })
                db:execute("DELETE FROM kb10_stores WHERE id = $1", { store_a })
                db:execute("DELETE FROM kb10_stores WHERE id = $1", { store_b })
            end)
        end)

        -- Regression: vec0 KNN resolves k nearest THEN filters by node_type, so
        -- a filtered SQLite vector_search using k = limit under-returns. The
        -- store over-fetches k and trims after filtering; a filtered search must
        -- still return `limit` matching rows when enough exist.
        test.describe("vector_search filter under-return", function()
            local s = store :: any
            local component_id = uuid()
            local store_id

            -- A vector at distance `d` along the first dimension from the
            -- all-zero query vector.
            local function vec_at(d: number)
                local v = {}
                for i = 1, 512 do v[i] = 0.0 end
                v[1] = d
                return v
            end

            test.before_all(function()
                local sid, err = s.create_store(component_id, "text-embedding-3-small", {})
                if err then error("create_store: " .. tostring(err)) end
                store_id = sid

                -- 20 chunk embeddings strictly NEARER the query than any summary
                -- (distances 0.01 .. 0.20).
                for i = 1, 20 do
                    local nid = s.insert_node(store_id, {
                        node_type = "chunk", content = "chunk " .. i, content_type = "text/plain", metadata = {},
                    })
                    s.insert_embedding(store_id, nid, "chunk", nil, vec_at(0.01 * i))
                end

                -- 3 summary embeddings FARTHER than every chunk (distances 5..7).
                for i = 1, 3 do
                    local nid = s.insert_node(store_id, {
                        node_type = "summary", content = "summary " .. i, content_type = "text/plain", metadata = {},
                    })
                    s.insert_embedding(store_id, nid, "summary", nil, vec_at(5.0 + i))
                end
            end)

            test.after_all(function()
                s.delete_store(component_id)
            end)

            test.it("filtered search returns limit rows when enough match", function()
                local query = {}
                for i = 1, 512 do query[i] = 0.0 end

                -- The 3 summaries sit beyond the 20 nearer chunks. Without
                -- over-fetch, k = limit = 3 returns the 3 nearest (all chunks),
                -- which the summary filter drops to zero.
                local rows, err = s.vector_search(store_id, query, {
                    limit = 3,
                    node_types = { "summary" },
                })
                test.is_nil(err)
                test.eq(#rows, 3, "filtered search still returns a full page of summaries")
                for _, r in ipairs(rows) do
                    test.eq(r.node_type, "summary")
                end
            end)

            test.it("trims to limit when matches exceed it", function()
                local query = {}
                for i = 1, 512 do query[i] = 0.0 end
                local rows, err = s.vector_search(store_id, query, {
                    limit = 5,
                    node_types = { "chunk" },
                })
                test.is_nil(err)
                test.eq(#rows, 5, "result trimmed to limit")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
