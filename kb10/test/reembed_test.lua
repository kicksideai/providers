-- Proves the moved reembed reads and writes the kb10 store directly (no contract):
-- it resolves the store by component_id, scans nodes, and skips the raw document
-- node (never embeddable). The embed loop over chunk/summary nodes is covered by
-- the source-worker materialization suites; here we assert the kb10 store wiring
-- and result shape deterministically, without a live embedding round-trip.

local test = require("test")
local sql = require("sql")
local crypto = require("crypto")
local reembed = require("reembed")
local kb10_store = require("kb10_store")

local function uuid(): string
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function db(): any
    local d, err = sql.get("app:db")
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

local function cleanup(d: any, store_id: string): ()
    d:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { store_id })
    d:execute("DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM kb10_nodes WHERE store_id = $1)", { store_id })
    d:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
    d:execute("DELETE FROM kb10_stores WHERE id = $1", { store_id })
end

-- An embedder whose vectors are the wrong width for the store: the model
-- answered, so every node reaches its write, and the write is what the store
-- refuses. A real refused vector rather than a stubbed seam.
local function narrow_embedder(texts: any, _model: any, _dims: any): (any, string?)
    local vectors: { any } = {}
    for i, _text in ipairs(texts :: { string }) do
        local vec: { number } = {}
        for j = 1, 8 do vec[j] = 0.0 end
        vectors[i] = vec
    end
    return { result = vectors }, nil
end

local function define_tests()
    test.describe("kb10 reembed", function()
        test.it("errors for a missing knowledge base", function()
            local result, err = reembed.run(uuid())
            test.is_nil(result)
            test.not_nil(err)
        end)

        -- A node carries one current vector. Embedding the same node twice used
        -- to leave BOTH rows behind, so the stale vector kept competing with the
        -- fresh one in every search.
        test.it("replaces a node's vector instead of accumulating one per embed", function()
            local component_id = uuid()
            local store_id = uuid()
            local d = db()
            local _, serr = d:execute(
                "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                { store_id, component_id, "class:embed", "{}" }
            )
            test.is_nil(serr, "store insert: " .. tostring(serr))

            local node_id, nerr = kb10_store.insert_node(store_id, {
                node_type = "chunk",
                content = "a chunk that gets embedded more than once",
            })
            test.is_nil(nerr, "node insert: " .. tostring(nerr))

            local vector: { number } = {}
            for i = 1, kb10_store.VECTOR_DIMENSIONS do vector[i] = 0.01 * i end
            for _ = 1, 3 do
                local _, ierr = kb10_store.insert_embedding(store_id, node_id, "chunk", nil, vector)
                test.is_nil(ierr, "embedding insert: " .. tostring(ierr))
            end

            local rows = d:query("SELECT COUNT(*) AS n FROM kb10_embeddings WHERE store_id = $1 AND node_id = $2",
                { store_id, node_id })
            test.eq(tonumber((rows :: any)[1].n), 1)
            cleanup(d, store_id)
        end)

        -- A pass that could write no vector at all has done nothing the KB can
        -- search on. It reports what it reached and why it is not a success, so
        -- the run it belongs to settles as failed rather than clean.
        test.it("fails the pass when node vectors cannot be written, keeping the counters", function()
            local component_id = uuid()
            local store_id = uuid()
            local d = db()
            local _, serr = d:execute(
                "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                { store_id, component_id, "class:embed", "{}" }
            )
            test.is_nil(serr, "store insert: " .. tostring(serr))

            for i = 1, 2 do
                local _, nerr = kb10_store.insert_node(store_id, {
                    node_type = "chunk",
                    content = "chunk " .. tostring(i) .. " whose vector the store will refuse",
                })
                test.is_nil(nerr, "node insert: " .. tostring(nerr))
            end
            -- A document node is never embedded by design; a deliberate skip is
            -- not a failure and must not be counted as one.
            local _, derr = kb10_store.insert_node(store_id, {
                node_type = "document",
                content = "the raw document blob, never embedded directly",
            })
            test.is_nil(derr, "document insert: " .. tostring(derr))

            local result, err = reembed.run_with_deps(component_id, { embedder = narrow_embedder })
            test.not_nil(result, "the counters the pass reached are still reported")
            test.not_nil(err, "a pass that wrote no vector is not a success")
            test.is_true(tostring(err):find("2", 1, true) ~= nil,
                "the reason names how many vectors were not written: " .. tostring(err))
            test.eq(0, (result :: any).embedded)
            test.eq(3, (result :: any).scanned)
            test.is_false((result :: any).success)

            cleanup(d, store_id)
            d:release()
        end)

        test.it("resolves the kb10 store and scans nodes, skipping the raw document node", function()
            local component_id = uuid()
            local store_id = uuid()
            local d = db()
            local _, serr = d:execute(
                "INSERT INTO kb10_stores (id, component_id, embedding_model, config) VALUES ($1, $2, $3, $4)",
                { store_id, component_id, "class:embed", "{}" }
            )
            test.is_nil(serr, "store insert: " .. tostring(serr))

            local node_id, nerr = kb10_store.insert_node(store_id, {
                node_type = "document",
                content = "raw document blob content that is never embedded directly",
                content_type = "text/plain",
                metadata = { external_source = "reembed.test", external_id = "doc-1" },
            })
            test.is_nil(nerr, "insert_node: " .. tostring(nerr))
            test.not_nil(node_id)

            local result, err = reembed.run(component_id)
            test.is_nil(err, "reembed: " .. tostring(err))
            test.not_nil(result)
            test.is_true(result.success, "reembed success")
            test.is_true(result.scanned >= 1, "scanned at least the document node: " .. tostring(result.scanned))
            test.eq(0, result.embedded)

            cleanup(d, store_id)
            d:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
