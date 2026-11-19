-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local contract = require("contract")
local security = require("security")
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

local function get_store_snapshot(scope, args)
    local lifecycle = assert(contract.get("kickside.knowledge:kb_store_lifecycle"))
    local actor = security.new_actor("store-statistics-fixture", {})
    local binding = assert(lifecycle:with_scope(scope):with_actor(actor):open("kickside.kb10:kb_store_lifecycle"))
    return binding:get_store(args)
end

local function assert_statistics(row, expected)
    for name, count in pairs(expected) do test.eq(row.stats[name], count, name) end
    test.is_nil(row.stats.claim_count)
end

return {run = test.run_cases(function()
    test.describe("Store-owned document populations", function()
        test.it("returns the same failed-root delta on an ordinary rejection replay", function()
            with_store(function(id)
                local metadata = source_metadata("missing", 7)
                local first = assert(writer.reject_source_revision(id, id, metadata, "artifact_bytes_not_found"))
                local replay = assert(writer.reject_source_revision(id, id, metadata, "artifact_bytes_not_found"))
                test.eq(first.retained, false)
                test.eq(first.failed_delta, 1)
                test.eq(replay.document_node_id, first.document_node_id)
                test.eq(replay.failed_delta, first.failed_delta)
                assert_pages(id, 0, 1)
            end)
        end)

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

        test.it("returns complete scoped statistics together with detail config or as a batch", function()
            local runtime = assert(security.policy("app:runtime_calls_only"))
            local authority = assert(security.policy("app:store_statistics_fixture_authority"))
            local scoped = assert(security.new_scope({runtime, authority}))
            local untrusted = assert(security.new_scope({runtime}))
            with_store(function(id)
                with_store(function(other)
                    local doc, concept, chunk, summary = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
                    assert(store.insert_nodes(id, {
                        {id = doc, node_type = "document"},
                        {node_type = "document", metadata = {status = "failed"}},
                        {id = chunk, node_type = "chunk", parent_id = doc},
                        {id = summary, node_type = "summary", parent_id = doc},
                        {id = concept, node_type = "concept"},
                        {node_type = "concept", metadata = {is_root = true}},
                    }))
                    assert(store.insert_edges(id, {{from_node_id = doc, to_node_id = concept, edge_type = "categorized_as"}}))
                    local vector = {}
                    for i = 1, 512 do vector[i] = i == 1 and 1 or 0 end
                    assert(store.insert_embeddings(id, {
                        {node_id = chunk, node_type = "chunk", parent_id = doc, embedding = vector},
                        {node_id = summary, node_type = "summary", parent_id = doc, embedding = vector},
                    }))
                    assert(store.insert_nodes(other, {{node_type = "document"}}))

                    local expected = {
                        document_count = 1, failed_count = 1, node_count = 6, edge_count = 1,
                        embedding_count = 2, concept_count = 1, chunk_count = 1, summary_count = 1,
                    }
                    local before = assert(get_store_snapshot(scoped, {component_id = id, stats = true}))
                    test.eq(before.embedding_model, "test-model")
                    test.not_nil(before.config)
                    test.not_nil(before.config_snapshot)
                    assert_statistics(before, expected)

                    local ids = {id}
                    for i = 2, 65 do ids[i] = uuid.v7() end
                    local batch = assert(get_store_snapshot(scoped, {component_ids = ids}))
                    test.eq(#batch.stores, 1)
                    test.eq(batch.stores[1].component_id, id)
                    test.is_nil(batch.stores[1].config)
                    assert_statistics(batch.stores[1], expected)

                    local _, duplicate_err = get_store_snapshot(scoped, {component_ids = {id, id}})
                    test.is_true(errors.is(duplicate_err, errors.INVALID))
                    local _, refused = get_store_snapshot(untrusted, {component_ids = {other}})
                    test.is_true(errors.is(refused, errors.PERMISSION_DENIED))
                    local detail = assert(get_store_snapshot(untrusted, {component_id = id}))
                    test.is_nil(detail.stats)
                    test.eq(detail.embedding_model, "test-model")

                    assert(store.delete_node(id, doc))
                    local after = assert(get_store_snapshot(scoped, {component_id = id, stats = true}))
                    assert_statistics(after, {
                        document_count = 0, failed_count = 1, node_count = 3, edge_count = 0,
                        embedding_count = 0, concept_count = 1, chunk_count = 0, summary_count = 0,
                    })
                end)
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
