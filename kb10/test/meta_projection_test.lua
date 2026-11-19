local test = require("test")
local worker = require("meta_projection")

local function define_tests()
    test.describe("Knowledge graph meta projection", function()
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
                        body = { kb_id = "kb-1", reason = "concept.created", concept_delta = 1 },
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

        test.it("advances the cursor without publishing a foreign-only batch", function()
            local result, err = worker.run({
                thread_id = "kb-1",
                projection = { body = {} },
                range = { to_seq = 10 },
                events = {
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-2", reason = "source.materialized", document_delta = 10 },
                    },
                    {
                        type = "kickside.knowledge.events:content.deleted",
                        body = { kb_id = "kb-2" },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { reason = "source.materialized", document_delta = 20 },
                    },
                },
                component = { set_meta = function() error("foreign batch published metadata") end },
            })

            test.is_nil(err)
            test.eq(10, result.last_seq)
            test.is_nil(result.body)
        end)

        test.it("folds only the configured target's pending work, receipts and graph updates", function()
            local published: any
            local result, err = worker.run({
                thread_id = "shared-thread",
                projection = { body = { worker_config = { target_kb_ids = { "kb-1" } } } },
                range = { to_seq = 16 },
                events = {
                    { type = "kickside.knowledge.events:content.upserted", body = { kb_id = "kb-1" } },
                    { type = "kickside.knowledge.events:content.deleted", body = { kb_id = "kb-1" } },
                    { type = "kickside.knowledge.events:content.upserted", body = { kb_id = "kb-2" } },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-1", reason = "source.materialized", source_processed_delta = 1,
                            document_delta = 1, chunk_delta = 2, summary_delta = 1, embedding_delta = 3,
                            failed_delta = 1, status = "degraded", last_error = "local error" },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-1", reason = "concept.created", concept_delta = 1 },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:12Z",
                        body = { kb_id = "kb-1", reason = "digest.updated",
                            auto_summary = "Local summary", auto_description = "Local description" },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-2", reason = "source.materialized", source_processed_delta = 3,
                            document_delta = 10, chunk_delta = 20, summary_delta = 10, embedding_delta = 30,
                            failed_delta = 10, status = "ready", last_error = "" },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        body = { kb_id = "kb-2", reason = "concept.created", concept_delta = 10 },
                    },
                    {
                        type = "kickside.knowledge.events:graph.changed",
                        created_at = "2026-01-01T00:00:16Z",
                        body = { kb_id = "kb-2", reason = "digest.updated",
                            auto_summary = "Foreign summary", auto_description = "Foreign description" },
                    },
                },
                component = { set_meta = function(id: string, fields: any)
                    test.eq("kb-1", id)
                    published = fields
                    return true
                end },
            })

            test.is_nil(err)
            test.eq(16, result.last_seq)
            test.eq(1, result.body.counts.pending_source_count)
            test.eq("degraded", result.body.counts.status)
            test.eq("syncing", published.status)
            test.eq("local error", published.last_error)
            test.eq(1, published.document_count)
            test.eq(2, published.chunk_count)
            test.eq(1, published.summary_count)
            test.eq(3, published.embedding_count)
            test.eq(1, published.failed_count)
            test.eq(1, published.concept_count)
            test.eq("Local summary", published.auto_summary)
            test.eq("Local description", published.auto_description)
            test.eq("2026-01-01T00:00:12Z", published.graph_updated_at)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return {
    run = function(options: any): any
        return run_cases(options)
    end,
}
