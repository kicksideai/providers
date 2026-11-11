-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local uuid = require("uuid")
local store = require("store")
local funcs = require("funcs")
local sql = require("sql")

local function define_tests()
    test.describe("source document text indexing", function()
        local store_id = uuid.v7()
        local migration_id = "source-index-upgrade-" .. uuid.v7()
        test.before_all(function()
            local _, err = store.create_store(store_id, "class:embed", {}, nil)
            test.is_nil(err)
        end)
        test.after_all(function()
            local _, err = store.delete_store(store_id)
            test.is_nil(err)
            local db, db_err = sql.get("app:db")
            if db_err or not db then error(tostring(db_err or "database unavailable")) end
            local _, ledger_err = db:execute("DELETE FROM _migrations WHERE id = $1", { migration_id })
            db:release()
            test.is_nil(ledger_err)
        end)
        test.it("migrates an existing source tree without changing its data", function()
            local vector = {}
            for i = 1, 512 do vector[i] = i == 1 and 1 or 0 end
            local written, write_err = store.replace_document(store_id, {
                document = { node_type = "document", content = "Existing source content", content_type = "text/plain",
                    metadata = { external_source = "fixture", external_id = "existing-source", status = "completed" } },
                children = {{ node_type = "chunk", content = "existingindexmarker", content_type = "text/plain",
                    metadata = { chunk_index = 1 }, embedding = vector }},
            })
            test.is_nil(write_err)
            local before, before_err = store.get_node(store_id, written.document_node_id)
            test.is_nil(before_err)
            for _ = 1, 2 do
                local result, migrate_err = funcs.call("kickside.kb10.migrations:06_source_text_index", {
                    database_id = "app:db", id = migration_id, direction = "up",
                })
                test.is_nil(migrate_err)
                test.eq(result.failed, 0, tostring(result.error))
            end
            local after, after_err = store.get_node(store_id, written.document_node_id)
            test.is_nil(after_err)
            test.eq(after.id, before.id)
            test.eq(after.content, before.content)
            test.eq(after.content_type, before.content_type)
            test.eq(after.created_at, before.created_at)
            test.eq(after.updated_at, before.updated_at)
            for key, value in pairs(before.metadata) do test.eq(after.metadata[key], value) end
            local hits, search_err = store.vector_search(store_id, vector, {
                query_text = "existingindexmarker", node_types = { "chunk" }, limit = 5,
            })
            test.is_nil(search_err)
            test.eq(#hits, 1)
            test.eq(hits[1].parent_id, before.id)
            local _, delete_err = store.delete_node(store_id, before.id)
            test.is_nil(delete_err)
        end)
        test.it("preserves a large source and searches its bounded passages", function()
            local words = {}
            for i = 1, 1024 do
                words[i] = string.format("reference%08x%08x%08x%08x", i, i * 3, i * 7, i * 11) .. string.rep("abcdefghijklmnop", 110)
            end
            local marker = "sourceindexendmarker"
            local content = table.concat(words, " ") .. " " .. marker
            local vector = {}
            for i = 1, 512 do vector[i] = i == 1 and 1 or 0 end
            local metadata = { external_source = "fixture", external_id = "large-source", status = "completed" }
            local written, write_err = store.replace_document(store_id, {
                document = { node_type = "document", content = content, content_type = "text/plain", metadata = metadata },
                children = {{ node_type = "chunk", content = marker, content_type = "text/plain", metadata = { chunk_index = 1 }, embedding = vector }},
            })
            test.is_nil(write_err)
            test.not_nil(written)
            local source, source_err = store.get_node(store_id, written.document_node_id)
            test.is_nil(source_err)
            test.eq(source.content, content)
            local hits, search_err = store.vector_search(store_id, vector, {
                query_text = marker, node_types = { "chunk" }, limit = 5,
            })
            test.is_nil(search_err)
            test.eq(#hits, 1)
            test.eq(hits[1].content, marker)
            test.eq(hits[1].parent_id, written.document_node_id)

            metadata.status = "failed"
            metadata.error = "Document policy rejects this source"
            local failed, failure_err = store.replace_document(store_id, {
                document = { node_type = "document", content = content, content_type = "text/plain", metadata = metadata }, children = {},
            })
            test.is_nil(failure_err)
            test.eq(failed.document_node_id, written.document_node_id)
            local preserved, preserve_err = store.get_node(store_id, failed.document_node_id)
            test.is_nil(preserve_err)
            test.eq(preserved.content, content)
            test.eq(preserved.metadata.status, "failed")
            test.eq(preserved.metadata.error, metadata.error)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
