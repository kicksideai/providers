local test = require("test")
local json = require("json")
local digest_worker = require("digest_worker")
local enrichment_consts = require("enrichment_consts")

local function make_input(events)
    return {
        thread_id = "thread-1",
        projection = { id = "proj-1", kind = "knowledge.injection.digest" },
        worker_config = { target_kb_ids = { "kb-1" } },
        events = events,
    }
end

local function make_fake_digest_deps()
    local calls: { any } = {}
    local deps = {
        execution_identity_row = {
            actor_id = "owner@example.test",
            actor_context = "{\"version\":1,\"scope_id\":\"app.security:user\",\"claims\":{\"status\":\"active\",\"security_groups\":[]}}",
        },
        digest = {
            run_for_component = function(component_id: string, unexpected: unknown?): ({
                component_id: string,
                store_id: string,
                auto_summary: string,
                auto_description: string,
                summary_count: integer,
            }?, string?)
                calls[#calls + 1] = {
                    kb_id = component_id,
                    unexpected = unexpected,
                }
                return {
                    component_id = "kb-1",
                    store_id = "store-1",
                    auto_summary = "Fresh source summary",
                    auto_description = "Fresh source description",
                    summary_count = 2,
                }, nil
            end,
        },
    }
    return deps, calls
end

local function define_tests()
    test.describe("digest_worker", function()
        test.it("does not run digest for raw content events without source finalizer request", function()
            local deps, calls = make_fake_digest_deps()
            local result, err = digest_worker.run_with_deps(make_input({
                {
                    id = "evt-1",
                    seq = 1,
                    type = "kickside.knowledge.events:content.upserted",
                    body = json.encode({
                        kb_id = "kb-1",
                        actor_id = "user-1",
                    }),
                },
            }), deps)

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.patch.last_status, "skipped_no_request")
            test.eq(result.metrics.digest_requested, false)
            test.eq(#calls, 0)
        end)

        test.it("runs digest when source appends a final digest request", function()
            local deps, calls = make_fake_digest_deps()
            local input: any = make_input({
                {
                    id = "evt-1",
                    seq = 1,
                    type = "kickside.knowledge.events:content.upserted",
                    body = {
                        kb_id = "kb-1",
                        actor_id = "user-1",
                    },
                },
                {
                    id = "evt-2",
                    seq = 2,
                    type = "kickside.knowledge.events:digest.requested",
                    body = {
                        kb_id = "kb-1",
                        reason = "source_complete",
                    },
                },
                {
                    id = "evt-3",
                    seq = 3,
                    type = "kickside.knowledge.events:digest.requested",
                    body = { kb_id = "kb-2", reason = "source_complete" },
                },
            })
            input.thread_id = "kb-1"
            input.worker_config = nil
            local result, err = digest_worker.run_with_deps(input, deps)

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.patch.last_status, "digested")
            test.eq(result.metrics.kb_id, "kb-1")
            test.eq(#calls, 1)
            local call = (calls[1] :: any)
            test.eq(call.kb_id, "kb-1")
            test.is_nil(call.unexpected)
            test.not_nil(result.append_events)
            test.eq(1, #result.append_events)
            local write = (result.append_events[1] :: any)
            test.eq("kb-1", write.thread_id)
            test.eq(1, #write.events)
            local ev = (write.events[1] :: any)
            test.eq("kickside.knowledge.events:graph.changed", ev.type)
            test.eq("kb-1", ev.body.kb_id)
            test.eq("knowledge.graph.meta", ev.external.external_source)
            test.eq("digest-updated:kb-1:proj-1:2", ev.external.external_id)
            test.eq("digest.updated", ev.body.reason)
            test.eq("Fresh source summary", ev.body.auto_summary)
            test.eq("Fresh source description", ev.body.auto_description)
        end)

        test.it("forwards treatment under the projection owner's execution identity", function()
            local sent: { any } = {}
            local deps, _ = make_fake_digest_deps()
            deps.send = function(process_id: string, topic: string, payload: { [string]: any })
                sent[#sent + 1] = { process_id = process_id, topic = topic, payload = payload }
                return true, nil
            end

            local result, err = digest_worker.run_with_deps(make_input({
                {
                    id = "evt-1",
                    seq = 1,
                    type = "kickside.knowledge.events:treatment.requested",
                    body = {
                        kb_id = "kb-1",
                        actor_id = "user-1",
                    },
                },
            }), deps)

            test.is_nil(err)
            test.eq(result.patch.last_status, "treatment_forwarded")
            test.eq(#sent, 1)
            local first = (sent[1] :: any)
            test.eq(first.process_id, enrichment_consts.PROCESS)
            test.eq(first.topic, enrichment_consts.TOPIC)
            test.eq(first.payload.component_id, "kb-1")
            test.eq(first.payload.execution_identity.actor_id, "owner@example.test")
        end)

        test.it("ignores foreign finalizer requests on the primary thread", function()
            local deps, calls = make_fake_digest_deps()
            deps.send = function(_pid: string, _topic: string, _payload: { [string]: any }): (any, string?)
                error("foreign request started treatment")
            end
            local input: any = make_input({
                { type = "kickside.knowledge.events:digest.requested", body = { kb_id = "kb-2" } },
                { type = "kickside.knowledge.events:treatment.requested", body = { kb_id = "kb-2" } },
            })
            input.thread_id = "kb-1"
            input.worker_config = nil

            local result, err = digest_worker.run_with_deps(input, deps)
            test.is_nil(err)
            test.eq(result.patch.last_status, "skipped_no_request")
            test.eq(result.metrics.kb_id, "kb-1")
            test.eq(#calls, 0)
            test.is_nil(result.append_events)
        end)

        test.it("uses only the configured target's finalizer requests", function()
            local deps, calls = make_fake_digest_deps()
            deps.send = function(_pid: string, _topic: string, payload: { [string]: any }): (any, string?)
                test.eq(payload.component_id, "kb-1")
                test.eq(payload.user_id, "local-user")
                return true, nil
            end
            local result, err = digest_worker.run_with_deps(make_input({
                { type = "kickside.knowledge.events:digest.requested", body = { kb_id = "kb-2" } },
                { type = "kickside.knowledge.events:treatment.requested", body = { kb_id = "kb-1", actor_id = "local-user" } },
                { type = "kickside.knowledge.events:treatment.requested", body = { kb_id = "kb-2", actor_id = "foreign-user" } },
            }), deps)

            test.is_nil(err)
            test.eq(result.patch.last_status, "treatment_forwarded")
            test.eq(#calls, 0)
            test.is_nil(result.append_events)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
