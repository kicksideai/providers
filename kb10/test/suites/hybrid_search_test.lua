local test = require("test")
local store = require("store")
local crypto = require("crypto")
local sql = require("sql")
local ops = require("ops")

local function id(): string
    return crypto.random.uuid()
end
local function vector(first: number): { number }
    local v = {}
    for i = 1, 512 do v[i] = i == 1 and first or 0 end
    return v
end

local function define_tests()
    test.describe("kb10 hybrid retrieval", function()
        for _, term in ipairs({ "82", "MT26Z101282", "264HG-3/16", "GAL 13/8 626", "THIMBLE 11/8-11/4", "CS-16-10" }) do
            test.it("finds exact identifier " .. term .. " outside vector candidates", function()
                local component_id = id()
                local s, err = store.create_store(component_id, "model", {}, {})
                test.is_nil(err)
                local doc = store.insert_node(s, { node_type = "document", content = "Catalog" })
                for i = 1, 12 do
                    local n = store.insert_node(s, { node_type = "chunk", parent_id = doc,
                        content = "PART_NUMBER: OTHER" .. i .. "\nMaterial: steel\nDimensions: other" })
                    test.is_nil(select(2, store.insert_embedding(s, n, "chunk", doc, vector(1))))
                end
                local target = store.insert_node(s, { node_type = "chunk", parent_id = doc,
                    content = "PART_NUMBER: " .. term .. "\nDimensions: precise value" })
                test.is_nil(select(2, store.insert_embedding(s, target, "chunk", doc, vector(-1))))
                local dense = store.vector_search(s, vector(1), { limit = 3, node_types = { "chunk" } })
                for _, row in ipairs(dense) do test.neq(row.id, target) end
                local rows, search_err = store.vector_search(s, vector(1), {
                    query_text = "What are the Dimensions for PART_NUMBER " .. term .. "?", limit = 3, node_types = { "chunk" } })
                test.is_nil(search_err)
                test.eq(rows[1].id, target)
                store.delete_store(component_id)
            end)
        end

        test.it("retrieves names without embeddings and honors store, type and parent filters", function()
            local component_id = id()
            local s = store.create_store(component_id, "model", {}, {})
            local doc = store.insert_node(s, { node_type = "document", content = "Guide" })
            local target = store.insert_node(s, { node_type = "chunk", parent_id = doc, content = "Quillfeather Operations Manual" })
            local other = store.insert_node(s, { node_type = "summary", parent_id = doc, content = "Quillfeather" })
            local rows, err = store.vector_search(s, vector(1), { query_text = "Quillfeather", limit = 3, node_types = { "chunk" }, parent_id = doc })
            test.is_nil(err)
            test.eq(#rows, 1)
            test.eq(rows[1].id, target)
            test.eq(#store.vector_search(s, vector(1), { query_text = "Quillfeather", parent_id = other }), 0)
            test.eq(#store.vector_search("missing-store", vector(1), { query_text = "Quillfeather" }), 0)
            store.delete_store(component_id)
        end)

        test.it("keeps lexical content current on updates and deletes", function()
            local component_id = id()
            local s = store.create_store(component_id, "model", {}, {})
            local n = store.insert_node(s, { node_type = "chunk", content = "UNIQUEOLD246" })
            test.eq(#store.vector_search(s, vector(1), { query_text = "UNIQUEOLD246" }), 1)
            test.is_nil(select(2, store.update_node(s, n, { content = "UNIQUENEW357" })))
            test.eq(#store.vector_search(s, vector(1), { query_text = "UNIQUEOLD246" }), 0)
            test.eq(#store.vector_search(s, vector(1), { query_text = "UNIQUENEW357" }), 1)
            store.delete_node(s, n)
            test.eq(#store.vector_search(s, vector(1), { query_text = "UNIQUENEW357" }), 0)
            store.delete_store(component_id)
        end)


        test.it("rolls back lexical rows with a failed node batch", function()
            local component_id = id()
            local s = store.create_store(component_id, "model", {}, {})
            local duplicate = id()
            local ok, err = store.insert_nodes(s, {
                { id = duplicate, node_type = "chunk", content = "ROLLBACKZX819" },
                { id = duplicate, node_type = "chunk", content = "ROLLBACKZX819 duplicate" },
            })
            test.is_nil(ok)
            test.not_nil(err)
            test.eq(#store.vector_search(s, vector(1), { query_text = "ROLLBACKZX819" }), 0)
            store.delete_store(component_id)
        end)

        test.it("replaces a document's lexical chunks atomically and cascades deletion", function()
            local component_id = id()
            local s = store.create_store(component_id, "model", {}, {})
            local document = { node_type = "document", content = "Catalog", metadata = { external_source = "test", external_id = "catalog" } }
            local first, err = store.replace_document(s, { document = document, children = {
                { node = { node_type = "chunk", content = "REPLACEOLDZX991" }, embedding = vector(1) },
            } })
            test.is_nil(err)
            test.not_nil(first)
            test.eq(#store.vector_search(s, vector(1), { query_text = "REPLACEOLDZX991" }), 1)
            local second, replace_err = store.replace_document(s, { document = document, children = {
                { node = { node_type = "chunk", content = "REPLACENEWZX992" }, embedding = vector(1) },
            } })
            test.is_nil(replace_err)
            test.eq(store.vector_search(s, vector(1), { query_text = "REPLACEOLDZX991" })[1].content, "REPLACENEWZX992")
            test.eq(#store.vector_search(s, vector(1), { query_text = "REPLACENEWZX992" }), 1)
            store.delete_node(s, second.document_node_id)
            test.eq(#store.vector_search(s, vector(1), { query_text = "REPLACENEWZX992" }), 0)
            store.delete_store(component_id)
        end)

        test.it("bounds SQL round trips while preserving all document children", function()
            local component_id = id()
            local s, create_err = store.create_store(component_id, "model", {}, {})
            test.is_nil(create_err)
            local inserts = 0
            ops._modules = { sql = { get = function(db_id: string): (any, any)
                local db, err = sql.get(db_id)
                if err then return nil, err end
                return {
                    type = function() return db:type() end,
                    release = function() return db:release() end,
                    begin = function(): (any, any)
                        local tx, tx_err = db:begin()
                        if tx_err then return nil, tx_err end
                        return {
                            query = function(_self: any, query: string, args: any) return tx:query(query, args) end,
                            execute = function(_self: any, query: string, args: any): (any, any)
                                if query:match("^INSERT INTO") then inserts = inserts + 1 end
                                return tx:execute(query, args)
                            end,
                            commit = function() return tx:commit() end,
                            rollback = function() return tx:rollback() end,
                        }, nil
                    end,
                }, nil
            end } }
            local children = {}
            for i = 1, 201 do
                children[i] = { node = { node_type = "chunk", content = "BULKZX" .. i,
                    metadata = { chunk_index = i } }, embedding = vector(1) }
            end
            local result, replace_err = store.replace_document(s, {
                document = { node_type = "document", content = "Catalog",
                    metadata = { external_source = "test", external_id = "bulk" } },
                children = children,
            })
            ops._modules = {}
            test.is_nil(replace_err)
            test.not_nil(result)
            test.eq(result.chunk_count, 201)
            local db, db_err = sql.get("app:db")
            if db_err or not db then error("open test database: " .. tostring(db_err)) end
            local rows, query_err = db:query("SELECT COUNT(*) AS count FROM kb10_embeddings WHERE store_id = $1", { s })
            db:release()
            test.is_nil(query_err)
            test.eq(tonumber(rows[1].count), 201)
            local found, search_err = store.vector_search(s, vector(1), { query_text = "BULKZX201", limit = 1 })
            test.is_nil(search_err)
            test.eq(found[1].metadata.chunk_index, 201)
            test.is_nil(select(2, store.delete_store(component_id)))
            test.is_true(inserts <= 11, "document insertion uses bounded multi-row statements; got " .. inserts)
        end)

        test.it("treats FTS syntax as literal text and preserves semantic fallback", function()
            local component_id = id()
            local s = store.create_store(component_id, "model", {}, {})
            local target = store.insert_node(s, { node_type = "chunk", content = "Honeybees communicate using a waggle dance." })
            store.insert_embedding(s, target, "chunk", nil, vector(1))
            for _, query in ipairs({ '" OR * - : ( )', "UNSEEN999999", "How do insects signal food locations?", "" }) do
                local rows, err = store.vector_search(s, vector(1), { query_text = query, limit = 3 })
                test.is_nil(err)
                test.eq(rows[1].id, target)
            end
            store.delete_store(component_id)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
