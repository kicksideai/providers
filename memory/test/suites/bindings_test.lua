-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("memory contract bindings", function()
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
                            from_event_id = "", last_event_id = "tail-event",
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
