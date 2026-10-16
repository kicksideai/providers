-- Tests the generic source_worker in isolation. A fake dispatcher and a
-- fake materialized-store resolver stand in for the registry-based extractor
-- lookup and the live kb10 plugin, so the test exercises the worker's plumbing
-- (document reconcile, embed wiring, error isolation)
-- without depending on any specific plugin or live LLM.

local test = require("test")
local sql = require("sql")
local json = require("json")

local source_worker = require("source_worker_lib")
local kb10_store = require("kb10_store")

local fixtures = require("source_worker_fixtures")

local APP_DB = fixtures.APP_DB
local DIMS = fixtures.DIMS
local MATERIALIZATION_CONFIG = fixtures.MATERIALIZATION_CONFIG
local uuid = fixtures.uuid
local fake_embedder = fixtures.fake_embedder
local dispatcher_for = fixtures.dispatcher_for
local materialized_store_resolver_for = fixtures.materialized_store_resolver_for
local worker_deps = fixtures.worker_deps
local bootstrap_kb10_store = fixtures.bootstrap_kb10_store
local teardown_kb10_store = fixtures.teardown_kb10_store
local fetch_kb10_nodes = fixtures.fetch_kb10_nodes
local decode_metadata = fixtures.decode_metadata
local build_event = fixtures.build_event
local document_handler = fixtures.document_handler

local function define_tests()
    test.describe("source_worker", function()
        local db = sql.get(APP_DB)
        if not db then error("db unavailable") end

        local doc_dispatcher = dispatcher_for({ ["fixture.page"] = document_handler })

        test.it("rejects missing thread_id", function()
            local result, err = source_worker.run_with_deps({
                projection = { id = uuid() },
                events = {},
                worker_config = { target_kb_ids = { uuid() } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = function() return nil end }))
            test.is_nil(result)
            test.eq(type(err), "userdata")
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:message(), "thread_id is required")
        end)

        test.it("process entry transports native validation errors", function()
            local result = source_worker.run_proc({})
            test.is_false(result.ok)
            test.eq(result.error_native.kind, errors.INVALID)
            test.eq(result.error_native.message, "thread_id is required")
        end)

        test.it("library run keeps its native error return", function()
            local result, err = source_worker.run({})
            test.is_nil(result)
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:message(), "thread_id is required")
        end)

        test.it("rejects when neither target_kb_ids nor thread_id resolves a target", function()
            -- A declared source projection omits worker_config and derives its
            -- target from the primary thread (thread_id == kb_id). With neither a
            -- target_kb_ids nor a thread_id there is no KB to materialize into.
            local result, err = source_worker.run_with_deps({
                thread_id = "",
                projection = { id = uuid() },
                events = {},
                worker_config = { target_kb_ids = {} },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = function() return nil end }))
            test.is_nil(result)
            test.not_nil(err)
        end)

        test.it("returns skipped_no_events when batch is empty", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })
            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {},
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))
            test.is_nil(err)
            test.eq(result.patch.last_status, "skipped_no_events")
            teardown_kb10_store(db, cid)
        end)

        test.it("uses only the flat external identity emitted by projections", function()
            local observed = nil
            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    {
                        id = "identity-event", seq = 1, type = "fixture.identity", body = {},
                        external = {
                            external_source = "nested-source",
                            external_id = "nested-id",
                            external_version = "nested-version",
                        },
                        external_source = "flat-source",
                        external_id = "flat-id",
                        external_version = "flat-version",
                    },
                },
                worker_config = { target_kb_ids = { uuid() } },
            }, worker_deps({
                dispatcher = function(event)
                    observed = event.external
                    return nil, nil
                end,
            }))

            test.is_nil(err)
            test.not_nil(result)
            test.not_nil(observed)
            test.eq("flat-source", observed.external_source)
            test.eq("flat-id", observed.external_id)
            test.eq("flat-version", observed.external_version)
        end)

        local routing_cases = {
            { name = "routes using the projection identity instead of body identity",
                source = "knowledge.kb", body_source = "other-source", extracted = 1 },
            { name = "does not select a source-specific extractor from body identity",
                body_source = "knowledge.kb", extracted = 0 },
            { name = "keeps unambiguous event-type routing without source identity",
                body_source = "other-source", by_type = true, extracted = 1 },
        }
        for _, case in ipairs(routing_cases) do
            test.it(case.name, function()
                local cid = bootstrap_kb10_store(db)
                local event_type = "kickside.knowledge.events:content.upserted"
                local extractor = "kickside.kb10.injection:content_extractor"
                local result, err = source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = { {
                        id = uuid(), seq = 1, type = event_type,
                        external_source = case.source,
                        external_id = "routing-document",
                        external_version = "v1",
                        body = { content = "Source routing regression",
                            external_source = case.body_source },
                    } },
                    worker_config = { target_kb_ids = { cid } },
                }, worker_deps({
                    _extractor_map = {
                        by_source_type = { ["knowledge.kb:" .. event_type] = extractor },
                        by_type = case.by_type and { [event_type] = extractor } or {},
                    },
                    embedder = fake_embedder,
                    resolve_materialized_store = materialized_store_resolver_for({ [cid] = true }),
                }))

                test.is_nil(err)
                test.not_nil(result)
                test.eq(case.extracted, result.metrics.events_extracted)
                test.eq(1 - case.extracted, result.metrics.events_unsupported)
                test.eq(case.extracted, result.metrics.documents_inserted)
                teardown_kb10_store(db, cid)
            end)
        end

        test.it("durably retries when a target KB has no source materializer", function()
            local missing_kb_id = uuid()
            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        seq = 1, type = "fixture.page",
                        body = { page_id = "no-materializer", title = "No materializer", text = "body" },
                    }),
                },
                worker_config = { target_kb_ids = { missing_kb_id } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = function() return nil, nil end }))

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.patch.last_status, "retrying")
            test.is_true(string.find(tostring(result.patch.last_error), "no source materializer", 1, true) ~= nil)
            test.eq(result.patch.last_failed_batch.attempts, 1)
        end)

        test.it("inserts a document into a kb10 KB", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })

            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        id = "fixture-event-100", seq = 1, type = "fixture.page",
                        body = { page_id = "100", title = "Onboarding", text = "Welcome" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))

            test.is_nil(err)
            test.eq(result.body.last_status, "completed")
            test.eq(result.metrics.documents_inserted, 1)
            test.eq(result.metrics.documents_replaced, 0)
            local kb_result = (result.body.kb_results and result.body.kb_results[1]) :: any
            test.not_nil(kb_result)
            test.not_nil(kb_result.notifications)
            test.eq(#kb_result.notifications, 1)
            test.not_nil(kb_result.notifications[1].document_node_id)

            local nodes = fetch_kb10_nodes(db, cid) or {}
            local doc_nodes = {}
            for _, n in ipairs(nodes) do
                if n.node_type == "document" then doc_nodes[#doc_nodes + 1] = n end
            end
            test.eq(#doc_nodes, 1)
            test.is_true(string.find(doc_nodes[1].content, "Welcome", 1, true) ~= nil)
            local metadata = decode_metadata(doc_nodes[1].metadata)
            test.eq("fixture", metadata.external_source)
            test.eq("100", metadata.external_id)
            test.eq("event:fixture-event-100", metadata.external_version)
            test.eq("fixture-event-100", metadata.thread_event_id)
            test.eq(1, tonumber(metadata.thread_event_seq))
            local source_ref = metadata.source_ref or {}
            test.eq("fixture", source_ref.external_source)
            test.eq("100", source_ref.external_id)
            test.eq("event:fixture-event-100", source_ref.external_version)
            test.eq("fixture-event-100", source_ref.thread_event_id)
            test.eq(1, tonumber(source_ref.thread_event_seq))

            teardown_kb10_store(db, cid)
        end)

        test.it("requests a final digest when a source batch reaches the thread target", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })
            local thread_id = uuid()
            local projection_id = uuid()

            local result, err = source_worker.run_with_deps({
                thread_id = thread_id,
                projection = { id = projection_id },
                range = { from_seq = 1, to_seq = 1, target_seq = 1 },
                events = {
                    build_event({
                        id = "fixture-event-final", seq = 1, type = "fixture.page",
                        body = { page_id = "final", title = "Final", text = "Digest me" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.body.last_status, "completed")
            test.not_nil(result.append_events)
            test.eq(#result.append_events, 1)
            test.eq(result.append_events[1].thread_id, thread_id)
            test.eq(#result.append_events[1].events, 3)
            local ev = nil
            local treatment = nil
            local meta = nil
            for _, candidate in ipairs(result.append_events[1].events) do
                if candidate.type == "kickside.knowledge.events:digest.requested" then ev = candidate end
                if candidate.type == "kickside.knowledge.events:treatment.requested" then treatment = candidate end
                if candidate.type == "kickside.knowledge.events:graph.changed" then meta = candidate end
            end
            test.not_nil(ev)
            test.not_nil(treatment)
            test.not_nil(meta)
            test.eq(meta.body.reason, "source.materialized")
            test.eq(meta.body.status, "ready")
            test.eq(1, tonumber(meta.body.document_delta))
            test.eq(ev.type, "kickside.knowledge.events:digest.requested")
            test.eq(ev.role, "system")
            test.eq(ev.body.kb_id, cid)
            test.eq(ev.body.reason, "source_complete")
            test.eq(ev.body.source_thread_id, thread_id)
            test.eq(ev.body.source_projection_id, projection_id)
            test.eq(1, tonumber(ev.body.source_target_seq))
            test.eq(ev.external.external_source, "knowledge.source.finalizer")
            test.eq(ev.external.external_id, "digest-request:" .. cid .. ":" .. projection_id .. ":1")
            test.eq(ev.external.external_version, "v1")
            test.eq(treatment.role, "system")
            test.eq(treatment.body.kb_id, cid)
            test.eq(treatment.body.reason, "source_complete")
            test.eq(treatment.external.external_source, "knowledge.source.finalizer")
            test.eq(treatment.external.external_id, "treatment-request:" .. cid .. ":" .. projection_id .. ":1")
            test.eq(treatment.external.external_version, "v1")

            teardown_kb10_store(db, cid)
        end)

        test.it("does not request another digest for final no-item batches", function()
            local cid = bootstrap_kb10_store(db)
            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                range = { from_seq = 1, to_seq = 1, target_seq = 1 },
                events = {
                    build_event({
                        id = "digest-request-event", seq = 1,
                        type = "kickside.knowledge.events:digest.requested",
                        body = { kb_id = cid },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = function() return nil, nil end }))

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.patch.last_status, "skipped_no_items")
            test.is_nil(result.append_events)

            teardown_kb10_store(db, cid)
        end)

        test.it("does not leave partial nodes when materialization vectors are invalid", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })
            local bad_embedder = function(texts, _model)
                local vectors = {}
                for i, text in ipairs(texts) do
                    if i == 1 then
                        local vec = {}
                        for j = 1, DIMS do vec[j] = 0.0 end
                        vec[1] = #text % 1000 / 1000.0
                        vectors[i] = vec
                    else
                        vectors[i] = "not-a-vector"
                    end
                end
                return { result = vectors }, nil
            end

            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        seq = 1, type = "fixture.page",
                        body = { page_id = "bad-vector", title = "Bad vector", text = "body text" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = bad_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))

            test.is_nil(err)
            test.eq(result.patch.last_status, "retrying")
            test.eq(result.metrics.documents_inserted, 0)
            test.eq(result.metrics.items_failed, 1)

            local nodes = fetch_kb10_nodes(db, cid) or {}
            test.eq(#nodes, 0, "retryable vector failures must not leave materialized graph nodes")

            teardown_kb10_store(db, cid)
        end)

        test.it("publishes an error with the explicit chunk limit when every document is rejected", function()
            local cid = bootstrap_kb10_store(db)
            local result, err = source_worker.run_with_deps({
                thread_id = uuid(), projection = { id = uuid() },
                events = { build_event({ seq = 1, type = "fixture.page",
                    body = { page_id = "limited", text = string.rep("prose sentence. ", 200) } }) },
                worker_config = { target_kb_ids = { cid }, materialization = { max_chunks_per_doc = 1 } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                resolve_materialized_store = materialized_store_resolver_for({ [cid] = true }) }))
            test.is_nil(err)
            test.eq(result.metrics.items_failed, 1)
            local found = false
            for _, append in ipairs(result.append_events or {}) do
                for _, event in ipairs(append.events or {}) do
                    if event.type == "kickside.knowledge.events:graph.changed" then
                        found = true
                        test.eq(event.body.status, "error")
                        test.is_true(event.body.last_error:find("max 1", 1, true) ~= nil)
                    end
                end
            end
            test.is_true(found)
            local failed_nodes = fetch_kb10_nodes(db, cid)
            test.eq(#failed_nodes, 1)
            local saved = json.decode(failed_nodes[1].metadata)
            test.is_true(saved.title:find("Indexing failed:", 1, true) ~= nil)
            test.is_true(saved.title:find("max 1", 1, true) ~= nil)
            test.eq(failed_nodes[1].content, "\n\n" .. string.rep("prose sentence. ", 200))
            teardown_kb10_store(db, cid)
        end)

        test.it("durably retries when document embedding fails hard", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })
            local failing_embedder = function()
                return nil, "embed backend unavailable"
            end

            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        seq = 1, type = "fixture.page",
                        body = { page_id = "hard-embed-fail", title = "Hard embed fail", text = "body text" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = failing_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.patch.last_status, "retrying")
            test.is_true(string.find(tostring(result.patch.last_error), "embed failed", 1, true) ~= nil)
            test.eq(result.metrics.items_failed, 1)

            local nodes = fetch_kb10_nodes(db, cid) or {}
            test.eq(#nodes, 0, "retryable embedding failures must not leave materialized graph nodes")

            teardown_kb10_store(db, cid)
        end)

        test.it("preserves extractor source_ref into kb10 metadata", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })
            local source_ref = {
                kind = "url",
                origin = "fixture",
                source_url = "https://example.test/source",
            }
            local dispatcher = dispatcher_for({
                ["fixture.source_ref"] = function()
                    return {
                        documents = {
                            {
                                external_source = "fixture",
                                external_id = "source-ref-doc",
                                content_type = "text/plain",
                                title = "Source ref",
                                content = "Source ref\n\nDurable metadata check",
                                metadata = {
                                    external_source = "fixture",
                                    external_id = "source-ref-doc",
                                },
                                source_ref = source_ref,
                            },
                        },
                    }, nil
                end,
            })

            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = { build_event({ seq = 1, type = "fixture.source_ref" }) },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = dispatcher,
                 resolve_materialized_store = resolver }))

            test.is_nil(err)
            test.eq(result.body.last_status, "completed")

            local nodes = fetch_kb10_nodes(db, cid)
            local doc_meta
            for _, n in ipairs(nodes) do
                if n.node_type == "document" then
                    doc_meta = decode_metadata(n.metadata)
                    break
                end
            end
            test.not_nil(doc_meta)
            local stored_ref = doc_meta and doc_meta.source_ref or {}
            test.eq("url", stored_ref.kind)
            test.eq("https://example.test/source", stored_ref.source_url)

            teardown_kb10_store(db, cid)
        end)

        test.it("replaces a document on re-ingest with the same external_id", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })

            source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        seq = 1, type = "fixture.page",
                        body = { page_id = "200", title = "v1", text = "first" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))

            local v1_ids = {}
            local v1_document_id
            for _, n in ipairs(fetch_kb10_nodes(db, cid)) do
                if n.node_type == "document" then
                    v1_document_id = tostring(n.id)
                else
                    v1_ids[#v1_ids + 1] = n.id
                end
            end
            test.is_true(#v1_ids > 0, "first ingest should materialize retrieval nodes")
            test.not_nil(v1_document_id)

            local result = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({
                        seq = 2, type = "fixture.page",
                        body = { page_id = "200", title = "v2", text = "second" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))

            test.eq(result.metrics.documents_replaced, 1)
            test.eq(result.metrics.documents_inserted, 1)

            local nodes = fetch_kb10_nodes(db, cid)
            local doc_nodes = {}
            for _, n in ipairs(nodes) do
                if n.node_type == "document" then doc_nodes[#doc_nodes + 1] = n end
            end
            test.eq(#doc_nodes, 1)
            test.eq(v1_document_id, tostring(doc_nodes[1].id), "the document node keeps its id across the replacement")
            test.is_true(string.find(doc_nodes[1].content, "second", 1, true) ~= nil)
            test.is_true(string.find(doc_nodes[1].content, "first", 1, true) == nil)

            -- The prior generation leaves nothing behind: its retrieval nodes, their
            -- vectors and their fts rows all go. The document node above them carries
            -- the document's identity and stays.
            for _, old_id in ipairs(v1_ids) do
                local stale_nodes = db:query("SELECT id FROM kb10_nodes WHERE id = $1", { old_id }) or {}
                test.eq(#stale_nodes, 0, "old materialized node removed on replace")
                local stale_embeddings = db:query("SELECT node_id FROM kb10_embeddings WHERE node_id = $1", { old_id }) or {}
                test.eq(#stale_embeddings, 0, "old embedding removed on replace")
                local stale_fts = db:query("SELECT node_id FROM kb10_nodes_fts WHERE node_id = $1", { old_id }) or {}
                test.eq(#stale_fts, 0, "old fts row removed on replace")
            end

            teardown_kb10_store(db, cid)
        end)

        test.it("counts unsupported events without aborting", function()
            local cid = bootstrap_kb10_store(db)
            local resolver = materialized_store_resolver_for({ [cid] = true })

            local result, err = source_worker.run_with_deps({
                thread_id = uuid(),
                projection = { id = uuid() },
                events = {
                    build_event({ seq = 1, type = "unrelated.signal", body = {} }),
                    build_event({
                        seq = 2, type = "fixture.page",
                        body = { page_id = "300", title = "ok", text = "body" },
                    }),
                },
                worker_config = { target_kb_ids = { cid } },
            }, worker_deps({ embedder = fake_embedder, dispatcher = doc_dispatcher,
                 resolve_materialized_store = resolver }))

            test.is_nil(err)
            test.eq(result.metrics.events_unsupported, 1)
            test.eq(result.metrics.events_extracted, 1)
            test.eq(result.metrics.documents_inserted, 1)

            teardown_kb10_store(db, cid)
        end)

        test.describe("delete dispatch (kb10)", function()
            local function delete_dispatcher_for(handlers)
                return function(event)
                    local h = handlers[event.type]
                    if not h then return nil, nil end
                    return h(event)
                end
            end

            local doc_handler = function(event)
                local body = event.body or {}
                return {
                    documents = { {
                        external_source = "fixture",
                        external_id = tostring(body.page_id or ""),
                        node_type = "document",
                        content_type = "text/plain",
                        title = body.title or "",
                        content = (body.title or "") .. "\n\n" .. (body.text or ""),
                        embed_text = body.title or "",
                        metadata = {
                            external_source = "fixture",
                            external_id = tostring(body.page_id or ""),
                            title = body.title,
                        },
                    } },
                    claims = {},
                    deletes = {},
                }, nil
            end

            local delete_handler = function(event)
                local body = event.body or {}
                return {
                    documents = {},
                    claims = {},
                    deletes = { {
                        external_source = "fixture",
                        external_id = tostring(body.page_id or ""),
                    } },
                }, nil
            end

            test.it("removes prior nodes when extractor emits a delete", function()
                local cid = bootstrap_kb10_store(db)
                local resolver = materialized_store_resolver_for({ [cid] = true })
                local mixed_dispatcher = delete_dispatcher_for({
                    ["fixture.page"] = doc_handler,
                    ["fixture.deleted"] = delete_handler,
                })

                -- Seed: insert a document.
                source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = {
                        build_event({
                            seq = 1, type = "fixture.page",
                            body = { page_id = "777", title = "Doomed", text = "body" },
                        }),
                    },
                    worker_config = { target_kb_ids = { cid } },
                }, worker_deps({ embedder = fake_embedder, dispatcher = mixed_dispatcher,
                     resolve_materialized_store = resolver }))

                local before = fetch_kb10_nodes(db, cid)
                test.is_true(#before >= 1)

                -- Now delete it.
                local result = source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = {
                        build_event({
                            seq = 2, type = "fixture.deleted",
                            body = { page_id = "777" },
                        }),
                    },
                    worker_config = { target_kb_ids = { cid } },
                }, worker_deps({ embedder = fake_embedder, dispatcher = mixed_dispatcher,
                     resolve_materialized_store = resolver }))

                test.eq(result.metrics.deletes_emitted, 1)
                test.eq(result.metrics.documents_removed, 1)
                local kb_result = (result.body.kb_results and result.body.kb_results[1]) :: any
                test.not_nil(kb_result)
                test.not_nil(kb_result.notifications)
                test.eq(#kb_result.notifications, 1)
                test.eq(kb_result.notifications[1].external_id, "777")
                test.eq(kb_result.notifications[1].removed, 1)

                local after = fetch_kb10_nodes(db, cid)
                test.eq(#after, 0)

                teardown_kb10_store(db, cid)
            end)

            test.it("counts missing nodes without failing", function()
                local cid = bootstrap_kb10_store(db)
                local resolver = materialized_store_resolver_for({ [cid] = true })
                local del_dispatcher = delete_dispatcher_for({ ["fixture.deleted"] = delete_handler })

                local result, err = source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = {
                        build_event({
                            seq = 1, type = "fixture.deleted",
                            body = { page_id = "ghost-id" },
                        }),
                    },
                    worker_config = { target_kb_ids = { cid } },
                }, worker_deps({ embedder = fake_embedder, dispatcher = del_dispatcher,
                     resolve_materialized_store = resolver }))

                test.is_nil(err)
                test.eq(result.metrics.deletes_emitted, 1)
                test.eq(result.metrics.documents_removed, 0)

                teardown_kb10_store(db, cid)
            end)

            test.it("durably retries when materializer delete fails", function()
                local cid = bootstrap_kb10_store(db)
                local del_dispatcher = delete_dispatcher_for({ ["fixture.deleted"] = delete_handler })
                local resolver = function(component_id)
                    if component_id ~= cid then return nil, nil end
                    return {
                        store = {
                            delete_documents_by_external_id = function()
                                return nil, "delete backend unavailable"
                            end,
                        },
                        store_row = {
                            id = cid,
                            component_id = cid,
                            embedding_model = "class:embed",
                            kb_type = "document",
                        },
                        engine = { default_config = MATERIALIZATION_CONFIG },
                    }, nil
                end

                local result, err = source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = {
                        build_event({
                            seq = 1, type = "fixture.deleted",
                            body = { page_id = "delete-fail" },
                        }),
                    },
                    worker_config = { target_kb_ids = { cid } },
                }, worker_deps({ embedder = fake_embedder, dispatcher = del_dispatcher,
                     resolve_materialized_store = resolver }))

                test.is_nil(err)
                test.not_nil(result)
                test.eq(result.patch.last_status, "retrying")
                test.is_true(string.find(tostring(result.patch.last_error), "delete_documents_by_external_id failed", 1, true) ~= nil)
                test.eq(result.patch.last_failed_batch.attempts, 1)

                teardown_kb10_store(db, cid)
            end)

            test.it("delete-only batch does not insert anything", function()
                local cid = bootstrap_kb10_store(db)
                local resolver = materialized_store_resolver_for({ [cid] = true })
                local del_dispatcher = delete_dispatcher_for({ ["fixture.deleted"] = delete_handler })

                local result = source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = {
                        build_event({ seq = 1, type = "fixture.deleted", body = { page_id = "x" } }),
                    },
                    worker_config = { target_kb_ids = { cid } },
                }, worker_deps({ embedder = fake_embedder, dispatcher = del_dispatcher,
                     resolve_materialized_store = resolver }))

                test.eq(result.metrics.documents_emitted, 0)
                test.eq(result.metrics.documents_inserted, 0)
                test.eq(result.metrics.deletes_emitted, 1)

                teardown_kb10_store(db, cid)
            end)
        end)

        test.describe("embed_images materialization", function()
            -- A document carrying two references to the SAME image (same bytes,
            -- same checksum) plus a distinct second image. Dedup must collapse the
            -- repeated bytes into one node while keeping the distinct image separate.
            local function image_document_handler(event)
                local body = event.body or {}
                local page_id = tostring(body.page_id or "")
                local content = "Architecture\n\n" ..
                    "The system overview is shown below.\n\n" ..
                    "![overview](image1.png)\n\n" ..
                    "Later we revisit the overview again.\n\n" ..
                    "![overview again](image1.png)\n\n" ..
                    "A separate sequence diagram follows.\n\n" ..
                    "![sequence](image2.png)\n"
                return {
                    documents = { {
                        external_source = "fixture",
                        external_id = page_id,
                        node_type = "document",
                        content_type = "text/markdown",
                        title = "Architecture",
                        content = content,
                        metadata = {
                            external_source = "fixture",
                            external_id = page_id,
                            title = "Architecture",
                            -- image1 appears twice but shares one checksum, so it is
                            -- one logical image; image2 is distinct.
                            image_artifacts = {
                                {
                                    artifact_id = "art-img1-a",
                                    upload_id = "upload-img",
                                    checksum = "hash-image1",
                                    content_type = "image/png",
                                    name = "image1.png",
                                    source_artifact_id = "src-doc",
                                },
                                {
                                    artifact_id = "art-img1-b",
                                    upload_id = "upload-img",
                                    checksum = "hash-image1",
                                    content_type = "image/png",
                                    name = "image1.png",
                                    source_artifact_id = "src-doc",
                                },
                                {
                                    artifact_id = "art-img2",
                                    upload_id = "upload-img",
                                    checksum = "hash-image2",
                                    content_type = "image/png",
                                    name = "image2.png",
                                    source_artifact_id = "src-doc",
                                },
                            },
                        },
                    } },
                    claims = {},
                }, nil
            end

            local image_dispatcher = dispatcher_for({ ["fixture.image_page"] = image_document_handler })

            -- A captioner that records which images it was asked to caption and
            -- returns a deterministic description; a loader that returns fake bytes.
            local function recording_caption_deps()
                local captioned = {}
                local loaded = {}
                local image_loader = function(image)
                    loaded[#loaded + 1] = image.artifact_id
                    return "fake-bytes-" .. tostring(image.checksum), nil
                end
                local captioner = function(image, _context, _model)
                    captioned[#captioned + 1] = image.checksum
                    return "caption for " .. tostring(image.name), nil
                end
                return image_loader, captioner, captioned, loaded
            end

            local function image_nodes(db, cid)
                local nodes = fetch_kb10_nodes(db, cid)
                local out = {}
                for _, n in ipairs(nodes) do
                    local meta = decode_metadata(n.metadata)
                    if meta.role == "image" then out[#out + 1] = { node = n, meta = meta } end
                end
                return out
            end

            test.it("materializes one image node per unique image with a caption embedding", function()
                local cid = bootstrap_kb10_store(db)
                local resolver = materialized_store_resolver_for({ [cid] = true })
                local image_loader, captioner, captioned = recording_caption_deps()

                local result, err = source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = {
                        build_event({
                            id = "fixture-image-event", seq = 1, type = "fixture.image_page",
                            body = { page_id = "img-doc" },
                        }),
                    },
                    worker_config = {
                        target_kb_ids = { cid },
                        materialization = { embed_images = true, image_caption_model = "class:fast" },
                    },
                }, worker_deps({
                    embedder = fake_embedder,
                    dispatcher = image_dispatcher,
                    resolve_materialized_store = resolver,
                    image_loader = image_loader,
                    captioner = captioner,
                }))

                test.is_nil(err)
                test.eq(result.body.last_status, "completed")
                test.eq(result.metrics.documents_inserted, 1)

                -- Two unique images (image1 deduped from two refs, image2), so the
                -- captioner ran exactly twice — never re-captioning the same bytes.
                test.eq(#captioned, 2, "captions one node per unique image")

                local images = image_nodes(db, cid)
                test.eq(#images, 2, "one node per unique image")

                local by_checksum: { [string]: any } = {}
                for _, img in ipairs(images) do by_checksum[img.meta.image_checksum] = img end

                local overview = by_checksum["hash-image1"] :: any
                test.not_nil(overview, "deduped overview image node present")
                test.eq("upload-img", overview.meta.upload_id)
                test.not_nil(overview.meta.artifact_id)
                test.eq("image/png", overview.node.content_type)
                test.eq("caption for image1.png", overview.node.content)
                test.eq("caption for image1.png", overview.meta.caption)
                -- The repeated image carries both occurrences on one node.
                test.eq(2, #overview.meta.occurrences, "both occurrences recorded on one node")

                local sequence = by_checksum["hash-image2"] :: any
                test.not_nil(sequence, "distinct sequence image node present")
                test.eq(1, #sequence.meta.occurrences)

                -- Each image node has a backing embedding (caption-derived vector).
                for _, img in ipairs(images) do
                    local rows = db:query(
                        "SELECT node_id FROM kb10_embeddings WHERE node_id = $1", { img.node.id }) or {}
                    test.eq(#rows, 1, "image node has a caption embedding")
                end

                teardown_kb10_store(db, cid)
            end)

            test.it("does not materialize image nodes when embed_images is off", function()
                local cid = bootstrap_kb10_store(db)
                local resolver = materialized_store_resolver_for({ [cid] = true })
                local image_loader, captioner, captioned = recording_caption_deps()

                local result, err = source_worker.run_with_deps({
                    thread_id = uuid(),
                    projection = { id = uuid() },
                    events = {
                        build_event({
                            id = "fixture-image-off", seq = 1, type = "fixture.image_page",
                            body = { page_id = "img-off" },
                        }),
                    },
                    worker_config = { target_kb_ids = { cid } },
                }, worker_deps({
                    embedder = fake_embedder,
                    dispatcher = image_dispatcher,
                    resolve_materialized_store = resolver,
                    image_loader = image_loader,
                    captioner = captioner,
                }))

                test.is_nil(err)
                test.eq(result.metrics.documents_inserted, 1)
                test.eq(#captioned, 0, "captioner never runs with embed_images off")
                test.eq(#image_nodes(db, cid), 0, "no image nodes when embed_images off")

                teardown_kb10_store(db, cid)
            end)

            test.it("replaces image nodes on re-ingest of the same document", function()
                local cid = bootstrap_kb10_store(db)
                local resolver = materialized_store_resolver_for({ [cid] = true })
                local image_loader, captioner = recording_caption_deps()
                local deps = worker_deps({
                    embedder = fake_embedder,
                    dispatcher = image_dispatcher,
                    resolve_materialized_store = resolver,
                    image_loader = image_loader,
                    captioner = captioner,
                })
                local cfg = {
                    target_kb_ids = { cid },
                    materialization = { embed_images = true, image_caption_model = "class:fast" },
                }

                source_worker.run_with_deps({
                    thread_id = uuid(), projection = { id = uuid() },
                    events = { build_event({ id = "re-1", seq = 1, type = "fixture.image_page", body = { page_id = "img-re" } }) },
                    worker_config = cfg,
                }, deps)
                test.eq(#image_nodes(db, cid), 2, "first ingest materializes the unique images")

                source_worker.run_with_deps({
                    thread_id = uuid(), projection = { id = uuid() },
                    events = { build_event({ id = "re-2", seq = 2, type = "fixture.image_page", body = { page_id = "img-re" } }) },
                    worker_config = cfg,
                }, deps)
                test.eq(#image_nodes(db, cid), 2, "re-ingest replaces, not duplicates, image nodes")

                teardown_kb10_store(db, cid)
            end)
        end)

        test.describe("chunk_text helper", function()
            test.it("returns empty list for empty input", function()
                test.eq(#source_worker._chunk_text("", 1000, 100), 0)
                test.eq(#source_worker._chunk_text(nil, 1000, 100), 0)
            end)

            test.it("returns empty list for whitespace-only input", function()
                test.eq(#source_worker._chunk_text("   \n  \t ", 1000, 100), 0)
            end)

            test.it("returns one chunk for input shorter than size", function()
                local chunks = source_worker._chunk_text("short text", 1000, 100)
                test.eq(#chunks, 1)
                test.eq(chunks[1], "short text")
            end)

            test.it("splits long input with overlap", function()
                local body = string.rep("word ", 600)
                local chunks = source_worker._chunk_text(body, 1000, 150)
                test.is_true(#chunks >= 3)
                test.is_true(#chunks[1] <= 1000)
            end)

            test.it("clamps overlap when overlap >= size", function()
                local body = string.rep("word ", 300)
                local chunks = source_worker._chunk_text(body, 500, 600)
                test.is_true(#chunks >= 1)
                for _, c in ipairs(chunks) do
                    test.is_true(c:match("%S") ~= nil)
                end
                test.is_true(#chunks < 10)
            end)

            test.it("clamps tiny size to floor", function()
                local body = string.rep("a", 800)
                local chunks = source_worker._chunk_text(body, 50, 0)
                -- size floor is 200, so 800 / 200 = 4 chunks max
                test.is_true(#chunks <= 4)
            end)

            test.it("drops whitespace-only windows", function()
                local body = "abc" .. string.rep(" ", 500) .. "def"
                local chunks = source_worker._chunk_text(body, 250, 0)
                for _, c in ipairs(chunks) do
                    test.is_true(c:match("%S") ~= nil)
                end
            end)
        end)

        test.describe("build_summary_text helper", function()
            test.it("strips title prefix from body", function()
                local s = source_worker._build_summary_text({
                    title = "Runbook",
                    content = "Runbook\n\nStep 1",
                }, MATERIALIZATION_CONFIG)
                local _, count = s:gsub("Runbook", "")
                test.eq(count, 1)
                test.is_true(string.find(s, "Step 1", 1, true) ~= nil)
            end)

            test.it("falls back to external_id when title missing", function()
                local s = source_worker._build_summary_text({
                    title = "", external_id = "page-42", content = "body text",
                }, MATERIALIZATION_CONFIG)
                test.is_true(string.find(s, "page-42", 1, true) ~= nil)
            end)

            test.it("returns headline only when body is empty", function()
                local s = source_worker._build_summary_text({
                    title = "Just a title", content = "Just a title",
                }, MATERIALIZATION_CONFIG)
                test.eq(s, "Just a title")
            end)

            test.it("caps total length", function()
                local long_body = "Title\n\n" .. string.rep("x ", 5000)
                local s = source_worker._build_summary_text({
                    title = "Title", content = long_body,
                }, MATERIALIZATION_CONFIG)
                test.is_true(#s <= 1000)
            end)

            test.it("caps custom summary length across headline and body", function()
                local s = source_worker._build_summary_text({
                    title = "Very long headline",
                    content = "Very long headline\n\nbody",
                }, {
                    summary_max_chars = 8,
                })
                test.eq("Very lon", s)

                local disabled = source_worker._build_summary_text({
                    title = "No summary",
                    content = "No summary\n\nbody",
                }, {
                    summary_max_chars = 0,
                })
                test.eq("", disabled)
            end)

            test.it("handles empty doc gracefully", function()
                local s = source_worker._build_summary_text({})
                test.eq(s, "")
            end)
        end)

        -- The LLM-summary path never stores or returns a mid-word or
        -- mid-sentence fragment: a response cut short by the max_tokens ceiling
        -- is trimmed back to the last sentence the model finished.
        test.describe("trimmed_to_last_sentence helper", function()
            test.it("leaves a cleanly terminated summary untouched", function()
                local s = "This document covers scope risk escalation. It also covers mitigation."
                test.eq(s, source_worker._trimmed_to_last_sentence(s))
            end)

            test.it("trims a mid-word cutoff back to the last complete sentence", function()
                local cut = "This covers scope risk. It goes on to illustrate how these f"
                local trimmed = source_worker._trimmed_to_last_sentence(cut)
                test.eq("This covers scope risk.", trimmed)
                test.is_true(not trimmed:match("f$"))
            end)

            test.it("trims a cutoff after a closing quote or parenthesis", function()
                local cut = "It defines \"scope risk\" (the escalation trigger). Then it trails off mid"
                local trimmed = source_worker._trimmed_to_last_sentence(cut)
                test.eq("It defines \"scope risk\" (the escalation trigger).", trimmed)
            end)

            test.it("returns a single unterminated clause unchanged rather than emptying it", function()
                local s = "No sentence boundary in this fragment at all"
                test.eq(s, source_worker._trimmed_to_last_sentence(s))
            end)
        end)

        test.describe("plan_document_writes helper", function()
            test.it("packs summary + chunks into one flat embed list", function()
                local plans, embed_texts = source_worker._plan_document_writes({
                    {
                        title = "Doc A",
                        content = "Doc A\n\n" .. string.rep("a ", 600),
                        external_id = "a",
                    },
                    {
                        title = "Doc B",
                        content = "Doc B\n\nshort body",
                        external_id = "b",
                    },
                }, MATERIALIZATION_CONFIG)
                test.eq(#plans, 2)
                local total_indices = 0
                for _, plan in ipairs(plans) do
                    if plan.summary_index then total_indices = total_indices + 1 end
                    total_indices = total_indices + #plan.chunk_indices
                end
                test.eq(total_indices, #embed_texts)
                test.is_true(#embed_texts >= 3)  -- 2 summaries + at least 1 chunk
            end)

            test.it("skips embed slot for empty body", function()
                local plans, embed_texts = source_worker._plan_document_writes({
                    {
                        title = "Title only",
                        content = "Title only",
                        external_id = "x",
                    },
                }, MATERIALIZATION_CONFIG)
                test.eq(#plans, 1)
                -- Title-only doc: summary only, no chunks (body is empty after
                -- stripping title prefix).
                test.eq(#plans[1].chunk_indices, 0)
                test.not_nil(plans[1].summary_index)
                test.eq(#embed_texts, 1)
            end)

            test.it("uses configured chunking and summary limits", function()
                local content = "Tiny summary title\n\n" .. string.rep("abcdefghij ", 80)
                local default_plans = source_worker._plan_document_writes({
                    { title = "Tiny summary title", content = content, external_id = "cfg-default" },
                }, MATERIALIZATION_CONFIG)
                local tuned_plans = source_worker._plan_document_writes({
                    { title = "Tiny summary title", content = content, external_id = "cfg-tuned" },
                }, {
                    chunk_size = 220,
                    chunk_overlap = 0,
                    summary_max_chars = 60,
                })

                test.is_true(#tuned_plans[1].chunk_indices > #default_plans[1].chunk_indices)
                test.is_true(#tuned_plans[1].summary_text <= 60)
            end)

            test.it("derives materialization settings from store config with worker overrides", function()
                local opts, opts_err = source_worker._materialization_options({
                    config = json.encode({
                        chunk_size = 350,
                        chunk_overlap = 25,
                        summary_max_chars = 90,
                    }),
                })
                test.is_nil(opts_err)
                test.eq(350, opts.chunk_size)
                test.eq(25, opts.chunk_overlap)
                test.eq(90, opts.summary_max_chars)

                local overridden, override_err = source_worker._materialization_options({
                    config = { chunk_size = 350, chunk_overlap = 25, summary_max_chars = 90 },
                }, {
                    materialization = { chunk_size = 420, chunk_overlap = 10, summary_max_chars = 120 },
                })
                test.is_nil(override_err)
                test.eq(420, overridden.chunk_size)
                test.eq(10, overridden.chunk_overlap)
                test.eq(120, overridden.summary_max_chars)
            end)

            test.it("derives materialization settings from engine defaults for old rows", function()
                local opts, opts_err = source_worker._materialization_options({
                    store_row = { config = {} },
                    engine = { default_config = MATERIALIZATION_CONFIG },
                })
                test.is_nil(opts_err)
                test.eq(MATERIALIZATION_CONFIG.chunk_size, opts.chunk_size)
                test.eq(MATERIALIZATION_CONFIG.chunk_overlap, opts.chunk_overlap)
                test.eq(MATERIALIZATION_CONFIG.summary_max_chars, opts.summary_max_chars)
            end)
        end)

        -- Delete primitive: remove the matching document subtree (cascading to
        -- chunks) and nothing else. Re-ingest replacement now uses the atomic
        -- replace_document materializer path.
        test.describe("delete_documents_by_external_id", function()
            local function insert_doc(store_id, external_id, child)
                local doc_id, derr = kb10_store.insert_node(store_id, {
                    id = uuid(), node_type = "document", content = "doc " .. external_id,
                    content_type = "text/plain",
                    metadata = { external_source = "fixture", external_id = external_id },
                })
                if derr then error("insert_doc: " .. tostring(derr)) end
                if child then
                    local _, cerr = kb10_store.insert_node(store_id, {
                        id = uuid(), parent_id = doc_id, node_type = "chunk", content = "chunk",
                        content_type = "text/plain", metadata = { chunk_index = 0 },
                    })
                    if cerr then error("insert_chunk: " .. tostring(cerr)) end
                end
                return doc_id
            end

            test.it("removes only the matching document subtree and is repeatable", function()
                local store_id = bootstrap_kb10_store(db)
                insert_doc(store_id, "A", true)
                insert_doc(store_id, "B", false)

                local found, ferr = kb10_store.find_by_external_id(store_id, "fixture", "A")
                test.is_nil(ferr)
                test.eq(#found, 1, "A is findable by external id before delete")

                local removed = kb10_store.delete_documents_by_external_id(store_id, "fixture", "A")
                test.eq(tonumber(type(removed) == "table" and removed.removed or removed), 1, "exactly one document removed for external_id A")

                local gone, _ = kb10_store.find_by_external_id(store_id, "fixture", "A")
                test.eq(#gone, 0, "A and its chunk are gone after delete")
                local kept, _ = kb10_store.find_by_external_id(store_id, "fixture", "B")
                test.eq(#kept, 1, "B is untouched")

                -- The chunk child cascaded with its document.
                local chunks = db:query(
                    "SELECT id FROM kb10_nodes WHERE store_id = $1 AND node_type = 'chunk'", { store_id }) or {}
                test.eq(#chunks, 0, "A's chunk cascaded on document delete")

                -- Re-running the delete is a no-op (idempotent), not an error.
                local again = kb10_store.delete_documents_by_external_id(store_id, "fixture", "A")
                test.eq(tonumber(type(again) == "table" and again.removed or again), 0, "re-delete of an absent external_id removes nothing")

                teardown_kb10_store(db, store_id)
            end)
        end)

        test.describe("replace_document", function()
            local function lineage(external_id)
                local source_ref = {
                    external_source = "fixture",
                    external_id = external_id,
                    external_version = "v1",
                    thread_event_id = "event:" .. external_id,
                    thread_event_seq = 1,
                }
                return {
                    external_source = source_ref.external_source,
                    external_id = source_ref.external_id,
                    external_version = source_ref.external_version,
                    thread_event_id = source_ref.thread_event_id,
                    thread_event_seq = source_ref.thread_event_seq,
                    source_ref = source_ref,
                }
            end

            test.it("rolls back the document tree when a child embedding fails", function()
                local store_id = bootstrap_kb10_store(db)
                local metadata = lineage("atomic-fail")
                local ok, err = kb10_store.replace_document(store_id, {
                    document = {
                        node_type = "document",
                        content = "atomic document",
                        content_type = "text/plain",
                        metadata = metadata,
                    },
                    children = {
                        {
                            node = {
                                node_type = "summary",
                                content = "summary",
                                content_type = "text/plain",
                                metadata = lineage("atomic-fail"),
                            },
                            embedding = "not-a-vector",
                        },
                    },
                })

                test.is_nil(ok)
                test.not_nil(err)
                local nodes = fetch_kb10_nodes(db, store_id)
                test.eq(#nodes, 0)

                teardown_kb10_store(db, store_id)
            end)

            local function vector(seed)
                local vec = {}
                for i = 1, DIMS do vec[i] = 0.0 end
                vec[1] = seed / 1000.0
                return vec
            end

            -- One generation of a document: the document node plus a chunk per text.
            local function replace(store_id, external_id, content, chunks)
                local children = {}
                for i, text in ipairs(chunks) do
                    local child_meta = lineage(external_id)
                    child_meta.role = "chunk"
                    child_meta.chunk_index = i - 1
                    children[i] = {
                        node = {
                            node_type = "chunk",
                            content = text,
                            content_type = "text/plain",
                            metadata = child_meta,
                        },
                        embedding = vector(i),
                    }
                end
                local doc_meta = lineage(external_id)
                doc_meta.role = "document"
                return kb10_store.replace_document(store_id, {
                    document = {
                        node_type = "document",
                        content = content,
                        content_type = "text/plain",
                        metadata = doc_meta,
                    },
                    children = children,
                })
            end

            test.it("keeps the document node id when the external identity is unchanged", function()
                local store_id = bootstrap_kb10_store(db)

                local first, first_err = replace(store_id, "stable", "generation one", { "chunk one" })
                test.is_nil(first_err)
                test.not_nil(first)
                local doc_id = first.document_node_id

                local second, second_err = replace(store_id, "stable", "generation two", { "chunk two" })
                test.is_nil(second_err)
                test.not_nil(second)
                test.eq(doc_id, second.document_node_id, "the document node id names the document, not the generation")

                -- A consumer that pinned the id when the document was first folded
                -- still resolves it, and reads the new generation's content.
                local node, node_err = kb10_store.get_node(store_id, doc_id)
                test.is_nil(node_err)
                test.not_nil(node)
                test.eq("document", node.node_type)
                test.eq("generation two", node.content)

                teardown_kb10_store(db, store_id)
            end)

            test.it("carries the new generation's children under the kept document id", function()
                local store_id = bootstrap_kb10_store(db)

                local first = replace(store_id, "regenerate", "generation one", { "old chunk a", "old chunk b" })
                local doc_id = first.document_node_id
                local prior_chunks = db:query(
                    "SELECT id FROM kb10_nodes WHERE store_id = $1 AND node_type = 'chunk'", { store_id }) or {}
                test.eq(2, #prior_chunks)

                local second, second_err = replace(store_id, "regenerate", "generation two", { "new chunk" })
                test.is_nil(second_err)
                test.eq(1, tonumber(second.chunk_count))
                -- The prior generation still counts as a replaced document, so the
                -- read-model deltas the notification carries stay balanced.
                test.eq(1, tonumber(second.removed))
                test.eq(1, tonumber(second.removed_document_count))
                test.eq(2, tonumber(second.removed_chunk_count))

                local chunks = db:query(
                    "SELECT id, parent_id, content FROM kb10_nodes WHERE store_id = $1 AND node_type = 'chunk'",
                    { store_id }) or {}
                test.eq(1, #chunks, "only the new generation's chunks remain")
                test.eq("new chunk", chunks[1].content)
                test.eq(doc_id, tostring(chunks[1].parent_id))

                local embeddings = db:query(
                    "SELECT node_id FROM kb10_embeddings WHERE store_id = $1", { store_id }) or {}
                test.eq(1, #embeddings, "the prior generation's vectors are gone")
                test.eq(tostring(chunks[1].id), tostring(embeddings[1].node_id))

                for _, prior in ipairs(prior_chunks) do
                    local stale_nodes = db:query("SELECT id FROM kb10_nodes WHERE id = $1", { prior.id }) or {}
                    test.eq(0, #stale_nodes, "the prior generation's chunk is gone")
                    local stale_fts = db:query("SELECT node_id FROM kb10_nodes_fts WHERE node_id = $1", { prior.id }) or {}
                    test.eq(0, #stale_fts, "the prior generation's fts row is gone")
                end

                teardown_kb10_store(db, store_id)
            end)

            test.it("keeps document placement while removing stale descendant edges", function()
                local store_id = bootstrap_kb10_store(db)
                local first, first_err = replace(store_id, "placed", "generation one", { "old chunk" })
                test.is_nil(first_err)
                local doc_id = first.document_node_id

                -- Document placement is the one canonical materialization edge:
                -- the document stays categorized under its concept across a new
                -- content generation.
                local concept_id, concept_err = kb10_store.insert_node(store_id, {
                    node_type = "concept",
                    content = "Placed documents",
                    content_type = "text/plain",
                    metadata = { label = "Placed documents", concept_type = "topic" },
                })
                test.is_nil(concept_err)
                local placement_id, placement_err = kb10_store.insert_edge(store_id, {
                    from_node_id = doc_id,
                    to_node_id = concept_id,
                    edge_type = "categorized_as",
                    weight = 1.0,
                })
                test.is_nil(placement_err)

                local prior_chunks = db:query(
                    "SELECT id FROM kb10_nodes WHERE store_id = $1 AND node_type = 'chunk'", { store_id }) or {}
                test.eq(1, #prior_chunks)
                local stale_edge_id = uuid()
                -- Public writes correctly refuse source-node relationships other
                -- than document categorized_as placement. Seed one legacy child
                -- edge directly so replacement proves that subtree cleanup cannot
                -- leave a dangling descendant relationship behind.
                local _, stale_edge_err = db:execute(
                    "INSERT INTO kb10_edges (id, store_id, from_node_id, to_node_id, edge_type, weight, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                    { stale_edge_id, store_id, prior_chunks[1].id, concept_id, "related_to", 1.0, json.encode({}) }
                )
                test.is_nil(stale_edge_err)

                local second, second_err = replace(store_id, "placed", "generation two", { "new chunk" })
                test.is_nil(second_err)
                test.eq(doc_id, second.document_node_id)

                local placement_rows = db:query("SELECT id FROM kb10_edges WHERE id = $1", { placement_id }) or {}
                test.eq(1, #placement_rows, "the document's canonical placement survives")
                local stale_rows = db:query("SELECT id FROM kb10_edges WHERE id = $1", { stale_edge_id }) or {}
                test.eq(0, #stale_rows, "edges incident to removed descendants are gone")

                teardown_kb10_store(db, store_id)
            end)

            test.it("mints a new document node id for a new external identity", function()
                local store_id = bootstrap_kb10_store(db)

                local first = replace(store_id, "identity-a", "document a", { "chunk a" })
                local second, second_err = replace(store_id, "identity-b", "document b", { "chunk b" })
                test.is_nil(second_err)
                test.is_true(first.document_node_id ~= second.document_node_id)
                test.eq(0, tonumber(second.removed), "a new identity replaces nothing")

                local kept, kept_err = kb10_store.get_node(store_id, first.document_node_id)
                test.is_nil(kept_err)
                test.eq("document a", kept.content)

                teardown_kb10_store(db, store_id)
            end)

            test.it("keeps every child id above the document id it hangs from", function()
                -- The export streams nodes ORDER BY id and the import replays them in
                -- that order, so a parent must sort before its children for the
                -- self-FK to resolve. Reusing the document id only makes the parent
                -- older than the generation beneath it.
                local store_id = bootstrap_kb10_store(db)

                replace(store_id, "ordering", "generation one", { "chunk one" })
                local second = replace(store_id, "ordering", "generation two", { "chunk two", "chunk three" })
                local doc_id = second.document_node_id

                local rows = db:query(
                    "SELECT id, parent_id FROM kb10_nodes WHERE store_id = $1 ORDER BY id", { store_id }) or {}
                test.eq(3, #rows)
                test.eq(doc_id, tostring(rows[1].id), "the document sorts ahead of its children")
                for i = 2, #rows do
                    test.eq(doc_id, tostring(rows[i].parent_id))
                    test.is_true(tostring(rows[i].id) > doc_id)
                end

                teardown_kb10_store(db, store_id)
            end)
        end)

        test.describe("thread lifecycle cleanup", function()
            test.it("stamps materialized source nodes with thread_id", function()
                local store_id = bootstrap_kb10_store(db)
                local thread_id = "thread-stamp-" .. uuid()
                local event = build_event({
                    id = "event-stamp-" .. uuid(),
                    seq = 1,
                    body = { page_id = "stamp-doc", title = "Stamp", text = "thread stamped document" },
                })

                local result, err = source_worker.run_with_deps({
                    thread_id = thread_id,
                    projection = { id = uuid() },
                    events = { event },
                    worker_config = { target_kb_ids = { store_id } },
                }, worker_deps({
                    embedder = fake_embedder,
                    dispatcher = doc_dispatcher,
                    resolve_materialized_store = materialized_store_resolver_for({ [store_id] = true }),
                }))
                test.is_nil(err)
                test.not_nil(result)

                local rows = fetch_kb10_nodes(db, store_id)
                test.is_true(#rows >= 2, "expected materialized document plus retrieval nodes")
                for _, row in ipairs(rows) do
                    local meta = decode_metadata(row.metadata)
                    test.eq(thread_id, meta.thread_id)
                    test.eq(thread_id, meta.source_ref and meta.source_ref.thread_id)
                end

                teardown_kb10_store(db, store_id)
            end)
        end)

    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
