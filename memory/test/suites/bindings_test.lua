-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("memory contract bindings", function()

        test.it("retains projected content with document provenance", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.script.hold(id, "structured_output")
            local projected, project_err = fixture.call_as(user, "kickside.memory.engine:ledger_projection", {
                thread_id = id, range = { to_seq = 1 }, events = {
                    { id = "document-event", seq = 1, created_at = "2026-10-01T10:00:00Z",
                        type = "kickside.knowledge.events:content.upserted", body = { title = "Travel", content = "Book travel in advance." } },
                },
            })
            test.is_nil(project_err, tostring(project_err))
            test.eq(projected.last_seq, 1)
            local runs = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
            test.eq(#runs, 1)
            test.eq(runs[1].input.span[1].author.kind, "document")
            fixture.extraction(id, { fixture.candidate("fact", "travel_policy", "advance booking",
                "The document recommends advance booking.", "document-event") })
            fixture.script.release(id, "structured_output")
            local completed = fixture.wait_runs(user, id, "derive", 1)[1]
            test.eq(completed.status, "succeeded", tostring(completed.last_error))
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { kinds = { "fact" } }), 1)
        end)

        test.it("retains document facts and rejects non-facts through direct and projected content", function()
            for _, malformed in ipairs({ false, true }) do
                local user = fixture.user()
                local direct_id = fixture.memory(user)
                local projected_id = fixture.memory(user)
                local title = "Travel guidance"
                local content = "The route uses accessible transit. I live in Oslo."
                fixture.script.hold(direct_id, "structured_output")
                fixture.script.hold(projected_id, "structured_output")
                local direct, direct_err = fixture.op(user, "embed_contract", { component_id = direct_id, request = {
                    title = title, content = content, content_type = "text/plain", external_id = "guide", external_version = "1",
                } })
                test.is_nil(direct_err, tostring(direct_err))
                test.is_true(direct.success)
                local direct_run = fixture.op(user, "run", { run_id = direct.run_id })
                local projected, projected_err = fixture.call_as(user, "kickside.memory.engine:ledger_projection", {
                    thread_id = projected_id, range = { to_seq = 1 }, events = {
                        { id = "projected-document", seq = 1, created_at = "2026-10-01T10:00:00Z",
                            type = "kickside.knowledge.events:content.upserted", body = { title = title, content = content } },
                    },
                })
                test.is_nil(projected_err, tostring(projected_err))
                test.eq(projected.last_seq, 1)
                local projected_run = fixture.op(user, "runs", { component_id = projected_id, run_type = "derive" })[1]
                local direct_source = direct_run.input.span[1]
                local projected_source = projected_run.input.span[1]
                for _, source in ipairs({ direct_source, projected_source }) do
                    test.eq(source.role, "document")
                    test.eq(source.author.kind, "document")
                    test.is_nil(source.author.id)
                    test.eq(source.text, title .. "\n\n" .. content)
                end
                local function candidates(event_id: string): { any }
                    local items = { fixture.candidate("fact", "travel_access", "accessible transit", "The document records accessible transit.", event_id) }
                    if malformed then
                        items[#items + 1] = fixture.candidate("profile_slot", "home_city", "Oslo", "The owner lives in Oslo.", event_id, nil, "single")
                        items[#items + 1] = fixture.candidate("preference", "travel_mode", "transit", "The owner prefers transit.", event_id, nil, "single")
                        items[#items + 1] = fixture.candidate("plan", "trip", { status = "open", next_step = "", details = "Visit Oslo" }, "The owner plans a visit.", event_id)
                    end
                    return items
                end
                for attempt = 1, malformed and 3 or 1 do
                    fixture.extraction(direct_id, candidates(direct_source.id))
                    fixture.extraction(projected_id, candidates(projected_source.id))
                end
                fixture.script.release(direct_id, "structured_output")
                fixture.script.release(projected_id, "structured_output")
                local direct_done = fixture.wait_runs(user, direct_id, "derive", 1)[1]
                local projected_done = fixture.wait_runs(user, projected_id, "derive", 1)[1]
                for _, run in ipairs({ direct_done, projected_done }) do
                    if malformed then
                        test.eq(fixture.wait_job(run.job_id, "dead").attempts, 3)
                        local failed = fixture.op(user, "run", { run_id = run.id })
                        test.eq(failed.status, "failed")
                        test.eq(json.decode(failed.last_error).code, "model_output_malformed")
                    else
                        test.eq(run.status, "succeeded", tostring(run.last_error))
                        test.eq(run.stats.candidates, 1)
                    end
                end
                fixture.settle(user, direct_id)
                fixture.settle(user, projected_id)
                for _, id in ipairs({ direct_id, projected_id }) do
                    local facts = fixture.items(user, id, { kinds = { "fact" } })
                    test.eq(#facts, malformed and 0 or 1)
                    if not malformed then test.eq(facts[1].key, "travel_access") end
                    test.eq(#fixture.items(user, id, { kinds = { "profile_slot", "preference", "plan" } }), 0)
                end
            end
        end)

        test.it("rejects an oversized document without blocking later projection events", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local input = {
                thread_id = id, range = { to_seq = 2 }, events = {
                    { id = "large-document", seq = 1, created_at = "2026-10-01T10:00:00Z",
                        type = "kickside.knowledge.events:content.upserted", body = { content = string.rep("x", 24001) } },
                    { id = "cursor-advance", seq = 2, created_at = "2026-10-01T10:00:01Z",
                        type = "kickside.memory.events:capture.advanced", body = {
                            host_kind = "session", host_id = "projection-source", agent_id = "agent-a",
                            last_event_id = "tail-event",
                        } },
                },
            }
            local projected, project_err = fixture.call_as(user, "kickside.memory.engine:ledger_projection", input)
            test.is_nil(project_err, tostring(project_err))
            test.eq(projected.last_seq, 2)
            local redelivered, redeliver_err = fixture.call_as(user, "kickside.memory.engine:ledger_projection", input)
            test.is_nil(redeliver_err, tostring(redeliver_err))
            test.eq(redelivered.last_seq, 2)
            local rejected, runs_err = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
            test.is_nil(runs_err, tostring(runs_err))
            test.eq(#rejected, 1)
            test.eq(rejected[1].status, "rejected")
            test.eq(rejected[1].stats.rejected_source_too_large, 1)
            test.eq(rejected[1].stats.source_bytes, 24001)
            test.is_nil(rejected[1].job_id)
            test.is_nil(rejected[1].input.span)
            local cursor, cursor_err = fixture.op(user, "cursor", {
                component_id = id, host_kind = "session", host_id = "projection-source",
            })
            test.is_nil(cursor_err, tostring(cursor_err))
            test.eq(cursor.last_event_id, "tail-event")
            test.eq(#fixture.script.requests(id, "structured_output"), 0)
        end)

        test.it("reports idle maintenance before a consolidation run exists", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local db = fixture.db()
            local _, delete_err = db:execute("DELETE FROM kickside_memory_runs WHERE component_id = $1", { id })
            db:release()
            test.is_nil(delete_err, tostring(delete_err))
            local status, status_err = fixture.call_as(user,
                "kickside.memory.engine:maintenance_status_func", {}, { component_id = id })
            test.is_nil(status_err, tostring(status_err))
            test.is_nil(status.resummarize)
            test.is_nil(status.reembed)
        end)

        test.it("rejects malformed ledger events and accepts consolidation completion", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local function project(event: any): (any?, error?)
                return fixture.call_as(user, "kickside.memory.engine:ledger_projection", {
                    thread_id = id, range = { to_seq = 1 }, events = { event },
                })
            end
            for _, event in ipairs({
                { seq = 0, created_at = "2026-10-01T10:00:00Z", type = "kickside.memory.events:consolidation.completed", body = {} },
                { seq = 1, created_at = "invalid", type = "kickside.memory.events:consolidation.completed", body = {} },
                { seq = 1, created_at = "2026-10-01T10:00:00Z", type = "kickside.memory.events:consolidation.completed", body = "invalid" },
            }) do
                local result, err = project(event)
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.INTERNAL)
                test.is_true(err:message():find("malformed ledger event", 1, true) ~= nil, err:message())
            end
            local unknown, unknown_err = project({
                seq = 1, created_at = "2026-10-01T10:00:00Z", type = "kickside.memory.events:unknown", body = {},
            })
            test.is_nil(unknown)
            test.not_nil(unknown_err)
            test.eq(unknown_err:kind(), errors.INTERNAL)
            test.is_true(unknown_err:message():find("unknown memory ledger event", 1, true) ~= nil, unknown_err:message())
            local malformed_ids, malformed_ids_err = project({
                seq = 1, created_at = "2026-10-01T10:00:00Z", type = "kickside.memory.events:item.merged",
                body = { into = "target", item_ids = { ignored = "source" } },
            })
            test.is_nil(malformed_ids)
            test.not_nil(malformed_ids_err)
            test.eq(malformed_ids_err:kind(), errors.INTERNAL)
            test.is_true(malformed_ids_err:message():find("malformed ledger event", 1, true) ~= nil, malformed_ids_err:message())
            fixture.create_claim(user, id, "Dublin")
            local db = fixture.db()
            local rows, read_err = db:query([[SELECT seq, type, body, created_at FROM kickside_event
                WHERE thread_id = $1 AND type = 'kickside.memory.events:item.added' ORDER BY seq LIMIT 1]], { id })
            db:release()
            test.is_nil(read_err, tostring(read_err))
            local added = rows[1]
            local added_body, decode_err = json.decode(added.body)
            test.is_nil(decode_err, tostring(decode_err))
            added_body.provenance = { ignored = { host_kind = "session", host_id = "source", event_id = "event" } }
            local malformed_provenance, malformed_provenance_err = project({
                seq = tonumber(added.seq), created_at = added.created_at, type = added.type, body = added_body,
            })
            test.is_nil(malformed_provenance)
            test.not_nil(malformed_provenance_err)
            test.eq(malformed_provenance_err:kind(), errors.INTERNAL)
            test.is_true(malformed_provenance_err:message():find("malformed ledger event", 1, true) ~= nil, malformed_provenance_err:message())
            local completed, completed_err = project({
                seq = 1, created_at = "2026-10-01T10:00:00Z", type = "kickside.memory.events:consolidation.completed", body = {},
            })
            test.is_nil(completed_err, tostring(completed_err))
            test.eq(completed.last_seq, 1)
        end)

        test.it("rejects malformed query pagination at the registered binding", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            for _, request in ipairs({
                { query = "tea", limit = "again" },
                { query = "tea", limit = 1.5 },
                { query = "tea", offset = "again" },
                { query = "tea", offset = 1.5 },
            }) do
                local result, err = fixture.call_as(user,
                    "kickside.memory.engine:query_func", request, { component_id = id })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
