-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local store = require("store")
local writer = require("writer")

local function assert_pages(store_id, documents, failures)
    local accepted = assert(store.browse_page(store_id, {scope = "documents"}))
    local rejected = assert(store.browse_page(store_id, {scope = "failures"}))
    local all = assert(store.browse_page(store_id, {top_level = true, node_type = "document"}))
    test.eq(accepted.total, documents)
    test.eq(#accepted.nodes, documents)
    test.eq(rejected.total, failures)
    test.eq(#rejected.nodes, failures)
    test.eq(all.total, documents + failures)
    local beyond = assert(store.browse_page(store_id, {scope = "documents", offset = 100}))
    test.eq(beyond.total, documents)
    test.eq(#beyond.nodes, 0)
    return accepted.nodes, rejected.nodes
end

local function with_store(check)
    local id = uuid.v7()
    assert(store.create_store(id, "test-model", {}, {}))
    local ok, failure = pcall(check, id)
    assert(store.delete_store(id))
    if not ok then error(failure) end
end

local function source_metadata(key, sequence)
    return {
        status = "completed",
        external_source = "fixture",
        external_id = key,
        thread_event_id = uuid.v7(),
        thread_event_seq = sequence,
    }
end

local function accept(store_id, key, sequence)
    local result = assert(store.replace_document(store_id, {
        document = {node_type = "document", content = "accepted", metadata = source_metadata(key, sequence)},
    }))
    return result.document_node_id
end

local function reject(store_id, key, sequence, commit)
    local db = assert(sql.get("app:db"))
    local dialect = assert(db:type())
    local tx = assert(db:begin())
    local id = assert(writer.reject_source_revision_tx(tx, dialect, store_id, store_id,
        source_metadata(key, sequence), "artifact_bytes_not_found"))
    if commit then assert(tx:commit()) else assert(tx:rollback()) end
    assert(select(2, db:release()) == nil)
    return id
end

return {run = test.run_cases(function()
    test.describe("Store-owned document populations", function()
        test.it("follows replacements, rejected updates, rollback and idempotent deletes", function()
            with_store(function(id)
                assert_pages(id, 0, 0)
                local accepted = accept(id, "first", 1)
                assert_pages(id, 1, 0)
                test.eq(accept(id, "first", 2), accepted)
                test.eq(reject(id, "first", 3, true), accepted)
                local docs = assert_pages(id, 1, 0)
                test.eq(docs[1].metadata.source_rejection.code, "artifact_bytes_not_found")

                reject(id, "second", 4, false)
                assert_pages(id, 1, 0)
                local failed = reject(id, "second", 4, true)
                local _, failures = assert_pages(id, 1, 1)
                test.eq(failures[1].id, failed)
                test.eq(accept(id, "second", 5), failed)
                assert_pages(id, 2, 0)
                assert(store.delete_documents_by_external_id(id, "fixture", "missing"))
                assert_pages(id, 2, 0)
                assert(store.delete_documents_by_external_id(id, "fixture", "first"))
                assert(store.delete_documents_by_external_id(id, "fixture", "first"))
                assert_pages(id, 1, 0)
            end)
        end)

        test.it("counts imported/manual roots and ignores nested nodes", function()
            with_store(function(id)
                local root = uuid.v7()
                local failed = uuid.v7()
                assert(store.insert_nodes(id, {
                    {id = root, node_type = "document"},
                    {id = failed, node_type = "document", metadata = {status = "failed"}},
                    {node_type = "document", parent_id = root, metadata = {status = "failed"}},
                    {node_type = "chunk", parent_id = root},
                    {node_type = "concept", metadata = {status = "failed"}},
                }, {}))
                assert_pages(id, 1, 1)

                assert(store.update_node(id, root, {metadata = {title = "Renamed"}}))
                assert_pages(id, 1, 1)
                assert(store.update_node(id, root, {metadata = {status = "failed"}}))
                assert_pages(id, 0, 2)
                assert(store.delete_node(id, failed))
                assert_pages(id, 0, 1)
                assert(store.delete_node(id, root))
                assert_pages(id, 0, 0)
            end)
        end)
    end)
end)}
