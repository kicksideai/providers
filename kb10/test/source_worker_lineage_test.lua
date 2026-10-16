local test = require("test")
local sql = require("sql")

local source_worker = require("source_worker_lib")
local fixtures = require("source_worker_fixtures")

local APP_DB = fixtures.APP_DB
local uuid = fixtures.uuid
local fake_embedder = fixtures.fake_embedder
local dispatcher_for = fixtures.dispatcher_for
local materialized_store_resolver_for = fixtures.materialized_store_resolver_for
local worker_deps = fixtures.worker_deps
local bootstrap_kb10_store = fixtures.bootstrap_kb10_store
local teardown_kb10_store = fixtures.teardown_kb10_store
local fetch_kb10_nodes = fixtures.fetch_kb10_nodes
local build_event = fixtures.build_event
local document_handler = fixtures.document_handler

local function define_tests()
    test.describe("source_worker lineage", function()
        local db = sql.get(APP_DB)
        if not db then error("db unavailable") end

        test.it("durably retries extractor lineage that points at a different thread", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })
            local dispatcher = dispatcher_for({
                ["fixture.bad_lineage"] = function()
                    return {
                        documents = {
                            {
                                external_source = "fixture",
                                external_id = "bad-lineage-doc",
                                content_type = "text/plain",
                                title = "Bad lineage",
                                content = "Bad lineage\n\nThis should never materialize",
                                metadata = {
                                    external_source = "fixture",
                                    external_id = "bad-lineage-doc",
                                },
                                source_ref = {
                                    external_source = "fixture",
                                    external_id = "bad-lineage-doc",
                                    thread_id = "other-thread",
                                },
                            },
                        },
                    }, nil
                end,
            })

            local result, err = source_worker.run_with_deps({
                thread_id = "canonical-thread-" .. uuid(),
                projection = { id = uuid() },
                events = { build_event({ seq = 1, type = "fixture.bad_lineage" }) },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({
                embedder = fake_embedder,
                dispatcher = dispatcher,
                resolve_materialized_store = resolver,
            }))

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.patch.last_status, "retrying")
            test.is_true(string.find(tostring(result.patch.last_error), "source_ref.thread_id mismatch", 1, true) ~= nil)
            test.eq(result.patch.last_failed_batch.attempts, 1)

            local nodes = fetch_kb10_nodes(db, cid)
            test.eq(#nodes, 0)

            teardown_kb10_store(db, cid)
        end)

        test.it("promotes delete canonical key from source_ref", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })
            local ref_delete_handler = function(event)
                local body = event.body or {}
                return {
                    documents = {},
                    deletes = { {
                        source_ref = {
                            external_source = "fixture",
                            external_id = tostring(body.page_id or ""),
                            external_version = "v1",
                        },
                    } },
                }, nil
            end
            local dispatcher = dispatcher_for({
                ["fixture.page"] = document_handler,
                ["fixture.ref_deleted"] = ref_delete_handler,
            })

            source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        seq = 1, type = "fixture.page",
                        body = { page_id = "ref-delete", title = "Delete by ref", text = "body" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({
                embedder = fake_embedder,
                dispatcher = dispatcher,
                resolve_materialized_store = resolver,
            }))

            local before = fetch_kb10_nodes(db, cid)
            test.is_true(#before >= 1)

            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        seq = 2, type = "fixture.ref_deleted",
                        body = { page_id = "ref-delete" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({
                embedder = fake_embedder,
                dispatcher = dispatcher,
                resolve_materialized_store = resolver,
            }))

            test.is_nil(err)
            test.eq(result.metrics.deletes_emitted, 1)
            test.eq(result.metrics.documents_removed, 1)

            local after = fetch_kb10_nodes(db, cid)
            test.eq(#after, 0)

            teardown_kb10_store(db, cid)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
