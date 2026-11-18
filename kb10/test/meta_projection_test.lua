local test = require("test")
local worker = require("meta_projection")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")

local function define_tests()
    test.describe("Knowledge graph meta projection", function()
        test.it("publishes saved counts during upgrade without advancing the projection", function()
            local db = assert(sql.get("app:db"))
            local cases = {
                { body = '{"counts":{"pending_source_count":2},"graph_updated_at":"2026-01-01T00:00:00Z"}', expected = "2" },
                { body = '{"counts":{"pending_source_count":0}}', expected = "0" },
                { body = '{"counts":{"pending_source_count":2}}', existing = "1", expected = "1" },
                { body = '{"counts":{"document_count":2}}' },
            }
            for _, case in ipairs(cases) do
                case.id, case.projection = uuid.v7(), uuid.v7()
                assert(db:execute([[INSERT INTO kickside_components (component_id, impl_id)
                    VALUES ($1, 'kickside.kb10:engine_document')]], { case.id }))
                assert(db:execute([[INSERT INTO kickside_thread (id, thread_class, component_id)
                    VALUES ($1, 'test', $2)]], { case.id, case.id }))
                assert(db:execute([[INSERT INTO kickside_projection (id, thread_id, kind, projection_key, body, last_event_seq)
                    VALUES ($1, $2, 'knowledge.graph.meta', 'graph_meta', $3, 2)]], { case.projection, case.id, case.body }))
                if case.existing then
                    assert(db:execute([[INSERT INTO kickside_component_meta (meta_id, component_id, key, value)
                        VALUES ($1, $2, 'pending_source_count', $3)]], { uuid.v7(), case.id, case.existing }))
                end
            end

            local ok, failure = pcall(function()
                local saved = {}
                for _, target in ipairs({ "app:kb10_migration_ledger", "app:db" }) do
                    local migration_id = "kb10-pending-count-" .. uuid.v7()
                    local result, err = funcs.call("kickside.kb10.migrations:08_publish_pending_source_count", {
                        database_id = target, id = migration_id, direction = "up",
                    })
                    test.is_nil(err, tostring(err))
                    assert(result)
                    test.eq(result.failed, 0, tostring(result.error))
                    local ledger = assert(sql.get(target))
                    assert(ledger:execute("DELETE FROM _migrations WHERE id = $1", { migration_id }))
                    assert(ledger:release())
                    for _, case in ipairs(cases) do
                        local row = assert(db:query([[SELECT m.value, m.meta_id, m.updated_at, p.last_event_seq
                            FROM kickside_projection p LEFT JOIN kickside_component_meta m
                            ON m.component_id = p.thread_id AND m.key = 'pending_source_count'
                            WHERE p.id = $1]], { case.projection }))[1]
                        test.eq(row.value, case.expected)
                        test.eq(tonumber(row.last_event_seq), 2)
                        if saved[case.id] then
                            test.eq(row.meta_id, saved[case.id].meta_id)
                            test.eq(row.updated_at, saved[case.id].updated_at)
                        end
                        saved[case.id] = row
                    end
                end
            end)
            for _, case in ipairs(cases) do
                assert(db:execute("DELETE FROM kickside_thread WHERE id = $1", { case.id }))
                assert(db:execute("DELETE FROM kickside_components WHERE component_id = $1", { case.id }))
            end
            assert(db:release())
            if not ok then error(failure) end
        end)

        test.it("publishes pending counts only when the fold changes them", function()
            local body = { counts = { pending_source_count = 2 } }
            local fields
            local function fold(event)
                local result, err = worker.run({
                    thread_id = "kb-1", projection = { body = body }, events = { event },
                    component = { set_meta = function(_, meta) fields = meta; return true end },
                })
                test.is_nil(err)
                body = result.body
            end
            fold({ type = "kickside.knowledge.events:graph.changed", body = { concept_delta = 1 } })
            test.eq(fields.concept_count, 1)
            test.is_nil(fields.pending_source_count)
            fold({ type = "kickside.knowledge.events:graph.changed", body = { source_processed_delta = 2 } })
            test.eq(fields.pending_source_count, 0)
        end)

        test.it("folds graph.changed deltas into component public meta", function()
            local writes: { any } = {}
            local result, err = worker.run({
                worker_config = { target_kb_ids = { "kb-1" } },
                projection = { body = {} },
                range = { to_seq = 2 },
                events = {
                    {
                        id = "ev-1",
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:01Z",
                        body = { reason = "concept.created", concept_delta = 1 },
                    },
                    {
                        id = "ev-2",
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:02Z",
                        body = { kb_id = "kb-1", reason = "concept.created", concept_delta = 2 },
                    },
                },
                component = {
                    set_meta = function(component_id: string, fields: any)
                        writes[#writes + 1] = { component_id = component_id, fields = fields }
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(2, result.last_seq)
            test.eq(3, result.body.counts.concept_count)
            test.eq("2026-01-01T00:00:02Z", result.body.graph_updated_at)
            test.eq(1, #writes)
            local first = writes[1] :: any
            test.eq("kb-1", first.component_id)
            test.eq("ready", first.fields.status)
            test.eq(0, first.fields.document_count)
            test.eq(0, first.fields.chunk_count)
            test.eq(0, first.fields.summary_count)
            test.eq(0, first.fields.embedding_count)
            test.eq(0, first.fields.failed_count)
            test.eq(3, first.fields.concept_count)
            test.eq("2026-01-01T00:00:02Z", first.fields.graph_updated_at)
        end)

        test.it("uses the projection thread when a page starts with another knowledge base's notice", function()
            local published_id
            local result, err = worker.run({
                thread_id = "kb-1",
                range = { to_seq = 2 },
                events = {
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-2", document_delta = 4, status = "ready" },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-1", document_delta = 1 },
                    },
                },
                component = {
                    set_meta = function(id)
                        published_id = id
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(published_id, "kb-1")
            test.eq(result.body.counts.document_count, 1)
            test.eq(result.last_seq, 2)
        end)

        test.it("folds source queue and materialization deltas into the same public meta snapshot", function()
            local writes: { any } = {}
            local result, err = worker.run({
                worker_config = { target_kb_ids = { "kb-1" } },
                projection = { body = {} },
                range = { to_seq = 2 },
                events = {
                    {
                        type = "kickside.knowledge.events:content.upserted",
                        created_at = "2026-01-01T00:00:01Z",
                        body = { kb_id = "kb-1" },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:02Z",
                        body = {
                            kb_id = "kb-1",
                            reason = "source.materialized",
                            status = "ready",
                            last_error = "",
                            source_processed_delta = 1,
                            document_delta = 1,
                            chunk_delta = 4,
                            summary_delta = 1,
                            embedding_delta = 5,
                        },
                    },
                },
                component = {
                    set_meta = function(component_id: string, fields: any)
                        writes[#writes + 1] = { component_id = component_id, fields = fields }
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(1, result.body.counts.document_count)
            test.eq(4, result.body.counts.chunk_count)
            test.eq(1, result.body.counts.summary_count)
            test.eq(5, result.body.counts.embedding_count)
            test.eq("ready", result.body.counts.status)
            local fields = (writes[1] :: any).fields
            test.eq("ready", fields.status)
            test.eq(0, fields.pending_source_count)
            test.eq(1, fields.document_count)
            test.eq(4, fields.chunk_count)
            test.eq(1, fields.summary_count)
            test.eq(5, fields.embedding_count)
        end)

        test.it("keeps status syncing while source events remain unmaterialized", function()
            local writes: { any } = {}
            local result, err = worker.run({
                worker_config = { target_kb_ids = { "kb-1" } },
                projection = { body = {} },
                range = { to_seq = 3 },
                events = {
                    {
                        type = "kickside.knowledge.events:content.upserted",
                        created_at = "2026-01-01T00:00:01Z",
                        body = { kb_id = "kb-1" },
                    },
                    {
                        type = "kickside.knowledge.events:content.upserted",
                        created_at = "2026-01-01T00:00:02Z",
                        body = { kb_id = "kb-1" },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:03Z",
                        body = {
                            kb_id = "kb-1",
                            reason = "source.materialized",
                            status = "ready",
                            source_processed_delta = 1,
                            document_delta = 1,
                            chunk_delta = 2,
                            summary_delta = 1,
                            embedding_delta = 3,
                        },
                    },
                },
                component = {
                    set_meta = function(component_id: string, fields: any)
                        writes[#writes + 1] = { component_id = component_id, fields = fields }
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq(1, result.body.counts.pending_source_count)
            test.eq("ready", result.body.counts.status)
            local fields = (writes[1] :: any).fields
            test.eq("syncing", fields.status)
            test.eq(1, fields.pending_source_count)
            test.eq(1, fields.document_count)
            test.eq(2, fields.chunk_count)
            test.eq(1, fields.summary_count)
            test.eq(3, fields.embedding_count)
        end)

        test.it("clamps concept_count at zero on deletes", function()
            local result, err = worker.run({
                worker_config = { target_kb_ids = { "kb-1" } },
                projection = { body = { counts = { concept_count = 1 } } },
                range = { to_seq = 3 },
                events = {
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-1", reason = "concept.deleted", concept_delta = -5 },
                    },
                },
                component = { set_meta = function() return true, nil end },
            })

            test.is_nil(err)
            test.eq(0, result.body.counts.concept_count)
        end)

        test.it("folds digest summary fields and preserves them across later counter updates", function()
            local writes: { any } = {}
            local result, err = worker.run({
                worker_config = { target_kb_ids = { "kb-1" } },
                projection = { body = {} },
                range = { to_seq = 5 },
                events = {
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:04Z",
                        body = {
                            kb_id = "kb-1",
                            reason = "digest.updated",
                            auto_summary = "Current summary",
                            auto_description = "Current description",
                        },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:05Z",
                        body = {
                            kb_id = "kb-1",
                            reason = "source.materialized",
                            status = "ready",
                            source_processed_delta = 1,
                            document_delta = 1,
                            chunk_delta = 2,
                            summary_delta = 1,
                            embedding_delta = 3,
                        },
                    },
                },
                component = {
                    set_meta = function(component_id: string, fields: any)
                        writes[#writes + 1] = { component_id = component_id, fields = fields }
                        return true, nil
                    end,
                },
            })

            test.is_nil(err)
            test.eq("Current summary", result.body.counts.auto_summary)
            test.eq("Current description", result.body.counts.auto_description)
            test.eq(1, result.body.counts.document_count)
            local fields = (writes[1] :: any).fields
            test.eq("Current summary", fields.auto_summary)
            test.eq("Current description", fields.auto_description)
            test.eq(1, fields.document_count)
            test.eq(2, fields.chunk_count)
            test.eq(3, fields.embedding_count)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return {
    run = function(options: any): any
        return run_cases(options)
    end,
}
