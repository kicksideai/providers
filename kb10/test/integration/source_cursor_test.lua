-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local uploads = require("uploads")
local artifacts = require("artifacts")
local artifact_cleanup = require("artifact_cleanup")
local store = require("store")
local meta_projection = require("meta_projection")
local models = require("models")
local invoke = require("invoke")
local projections = require("projections")
local claim = require("claim")
local lifecycle = require("lifecycle")
local jobs = require("jobs")
local job_types = require("job_types")
local job_clock = require("job_clock")
local job_config = require("job_config")

local UPSERT = "kickside.knowledge.events:content.upserted"
local DELETE = "kickside.knowledge.events:content.deleted"
local EXTRACTED = "fixture.source.extracted"
local SOURCE_WORKER = "proc://kickside.kb10.injection:source_worker_proc"

type SourceFixture = {
    cursor_id: string,
    job_id: string,
    projection_id: string,
    thread: string,
}

local function query(statement, args)
    local db = assert(sql.get("app:db"))
    local rows, err = db:query(statement, args)
    assert(select(2, db:release()) == nil)
    assert(rows, tostring(err))
    return rows
end

local function cursor(fixture: SourceFixture)
    return query([[SELECT c.last_seq,c.status,c.last_error,p.body FROM kickside_projection_cursor c
        JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]], { fixture.cursor_id })[1]
end

local function append(fixture: SourceFixture, contents)
    local db = assert(sql.get("app:db"))
    local tx = assert(db:begin())
    local rows = assert(tx:query("SELECT event_count FROM kickside_thread WHERE id=$1", { fixture.thread }))
    local head = assert(tonumber(rows[1].event_count))
    for i, input in ipairs(contents) do
        local seq = head + i
        local event = type(input) == "table" and input or { body = { kb_id = fixture.thread, content = input } }
        local body = assert(json.encode(event.body))
        assert(tx:execute([[INSERT INTO kickside_event
            (id,thread_id,type,role,body,seq,external_source,external_id,external_version)
            VALUES ($1,$2,$3,'user',$4,$5,$6,$7,$8)]],
            { uuid.v7(), fixture.thread, event.type or UPSERT, body, seq, event.source or (event.type == EXTRACTED and "fixture" or "knowledge.kb"), event.external_id or ("document-" .. tostring(seq)), tostring(seq) }))
    end
    assert(tx:execute("UPDATE kickside_thread SET event_count=$1 WHERE id=$2", { head + #contents, fixture.thread }))
    assert(jobs.wake_tx(tx, "thread:" .. fixture.thread))
    assert(select(2, tx:commit()) == nil)
    assert(select(2, db:release()) == nil)
    return head + #contents
end

local function attempt(fixture: SourceFixture)
    local db = assert(sql.get("app:db"))
    local dbtype = tostring(db:type())
    local statement = "SELECT *, CASE WHEN scheduled_at <= CURRENT_TIMESTAMP THEN 1 ELSE 0 END AS due"
        .. " FROM kickside_job WHERE id=$1 AND status='pending'"
    local job = assert(assert(db:query(statement, { fixture.job_id }))[1])
    while tonumber(job.due) ~= 1 do
        assert(job.scheduled_at, "source projection fixture slot has no scheduled time")
        time.sleep("50ms")
        job = assert(assert(db:query(statement, { fixture.job_id }))[1])
    end
    local tx = assert(db:begin())
    local token = uuid.v7()
    local lease_until = lifecycle.future_string(dbtype, 60)
    local leased = assert(claim.lease_row(tx, dbtype, fixture.job_id, token, lease_until, lifecycle.now_string(dbtype)))
    assert(select(2, tx:commit()) == nil)
    assert(select(2, db:release()) == nil)
    job.lease_token = token
    job.lease_until = lease_until
    job.attempts = leased.attempts
    job.execution_seq = leased.execution_seq
    local output, err = invoke.run({ job = job, payload = { cursor_id = fixture.cursor_id } })
    if err then
        db = assert(sql.get("app:db"))
        local failure_class = job_types.is_deterministic_kind(err:kind()) and "deterministic" or "infrastructure"
        local failure_started = time.now():unix_nano()
        local persist_err = lifecycle.fail_job(db, job, dbtype, tostring(err), failure_class)
        local failure_finished = time.now():unix_nano()
        assert(select(2, db:release()) == nil)
        assert(persist_err == nil, tostring(persist_err))
        return output, err, failure_started, failure_finished
    end
    return output, err
end

local function set_model(name, provider_model)
    local _, err = models.upsert_card({ name = name, provider_id = "app.analysis:provider",
        provider_model = provider_model, capabilities = { "embed" }, dimensions = 512, max_tokens = 4096 })
    assert(err == nil, tostring(err))
end

local function with_source(modes, config, check)
    local targets: {string} = {}
    local model_names: {string} = {}
    for i, mode in ipairs(modes) do
        targets[i] = uuid.v7()
        model_names[i] = "source-cursor-" .. targets[i]
        set_model(model_names[i], mode)
        assert(store.create_store(targets[i], model_names[i], {}, { kb_type = "document" }))
    end

    local db = assert(sql.get("app:db"))
    local thread = assert(targets[1], "source fixture requires a target")
    assert(db:execute("INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)", { thread, thread }))
    config.target_kb_ids = targets
    local registered = assert(projections.register_projection(db, thread, {
        kind = "knowledge.injection.source", worker_ref = config.store_fault and "proc://app:source_cursor_store_fault" or SOURCE_WORKER,
        worker_input_mode = "prefetch_events", worker_config = config, system_identity = true,
        events = { input = { { type = UPSERT }, { type = DELETE }, { type = EXTRACTED } } },
    }))
    assert(select(2, db:release()) == nil)
    local fixture: SourceFixture = {
        cursor_id = registered.cursor_id,
        job_id = registered.job_id,
        projection_id = registered.projection_id,
        thread = thread,
    }
    local ok, failure = pcall(check, fixture, targets, model_names)
    db = assert(sql.get("app:db"))
    assert(projections.remove_projection(db, thread, { projection_id = registered.projection_id }))
    assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", { thread }))
    assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", { thread }))
    assert(select(2, db:release()) == nil)
    for i, target in ipairs(targets) do
        test.is_nil(select(2, store.delete_store(target)))
        test.is_nil(select(2, models.delete_card(model_names[i])))
    end
    if not ok then error(failure) end
end

local function documents(kb_id)
    return query("SELECT id,content,metadata FROM kb10_nodes WHERE store_id=$1 AND node_type='document' ORDER BY content", { kb_id })
end

local function source_counts(fixture: SourceFixture, kb_id)
    local events = query("SELECT seq,type,body,created_at FROM kickside_event WHERE thread_id=$1 ORDER BY seq", { fixture.thread })
    local public_meta
    local result, err = meta_projection.run({
        thread_id = fixture.thread,
        events = events,
        component = {
            set_meta = function(id, meta)
                test.eq(id, kb_id)
                public_meta = meta
                return true
            end,
        },
    })
    test.is_nil(err)
    test.not_nil(result)
    test.not_nil(public_meta)
    return result.body.counts, public_meta.status, public_meta.document_count, public_meta.pending_source_count
end

local function source_count(fixture: SourceFixture, kb_id: string)
    return source_counts(fixture, kb_id).document_count
end

local function recover(fixture: SourceFixture, targets, head: number, expected: number)
    local initial = query("SELECT event_count FROM kickside_thread WHERE id=$1", { fixture.thread })[1]
    local target_seq = tonumber(initial.event_count)
    test.is_true(target_seq >= head)
    local _, err = attempt(fixture)
    test.is_nil(err, tostring(err))
    test.eq(tonumber(cursor(fixture).last_seq), target_seq)
    test.is_nil(cursor(fixture).last_error)
    for _, kb_id in ipairs(targets) do
        test.eq(#documents(kb_id), expected)
        if #targets == 1 then test.eq(source_count(fixture, kb_id), expected) end
    end
    local thread = query("SELECT event_count FROM kickside_thread WHERE id=$1", { fixture.thread })[1]
    if tonumber(thread.event_count) > target_seq then
        local _, drain_err = attempt(fixture)
        test.is_nil(drain_err, tostring(drain_err))
    end
    test.eq(tonumber(cursor(fixture).last_seq), tonumber(thread.event_count))
end

local function advance_to(fixture: SourceFixture, seq: number)
    local _, err = attempt(fixture)
    test.is_nil(err, tostring(err))
    local row = cursor(fixture)
    test.eq(tonumber(row.last_seq), seq)
    test.eq(row.status, "active")
    test.is_nil(row.last_error)
    return assert(json.decode(row.body))
end

local function assert_dead_letter(fixture: SourceFixture, body, seq: number, message: string, processed: number?)
    test.eq(body.last_status, "dead_lettered")
    test.eq(#body.dead_lettered_batches, 1)
    local entry = body.dead_lettered_batches[1]
    test.eq(entry.from_seq, seq)
    test.eq(entry.to_seq, seq)
    test.contains(entry.error, message)

    local notices = {}
    for _, event in ipairs(query("SELECT body FROM kickside_event WHERE thread_id=$1 AND type=$2",
        { fixture.thread, "kickside.knowledge.events:graph.changed" })) do
        local meta = assert(json.decode(event.body))
        if meta.reason == "source.dead_lettered" then notices[#notices + 1] = meta end
    end
    test.eq(#notices, 1)
    test.eq(notices[1].source_from_seq, seq)
    test.eq(notices[1].source_to_seq, seq)
    test.eq(notices[1].source_processed_delta, processed == nil and 1 or processed)
end

local function extracted(documents, deletes)
    return { type = EXTRACTED, body = { result = { documents = documents, deletes = deletes } } }
end

local function document(id, content)
    return { external_id = id, content = content }
end

local function deletion(id)
    return { type = DELETE, external_id = id, body = {} }
end

local function assert_unavailable(fixture: SourceFixture, seq: number, message: string)
    local output, err = attempt(fixture)
    test.is_nil(output)
    test.eq(err:kind(), errors.UNAVAILABLE)
    test.is_true(err:retryable())
    local row = cursor(fixture)
    test.eq(tonumber(row.last_seq), seq)
    test.eq(row.status, "active")
    test.contains(tostring(row.last_error), message)
end

local function requests(fixture: SourceFixture, name: string)
    return query("SELECT body FROM kickside_event WHERE thread_id=$1 AND type=$2 ORDER BY seq",
        { fixture.thread, "kickside.knowledge.events:" .. name .. ".requested" })
end

local function define_tests()
    test.describe("source projection availability", function()
        test.it("holds the cursor through four failures and materializes the same events on recovery", function()
            with_source({ "source-unavailable" }, {}, function(fixture, targets, names)
                local head = append(fixture, { "First document", "Second document", "Third document" })
                local previous_schedule
                local policy = assert(job_config.policy())
                local base_seconds = math.max(1, math.ceil(policy.slot_retry_after_ms / 1000))
                local cap_seconds = math.floor(policy.slot_retry_max_delay_ms / 1000)
                for failure = 1, 4 do
                    local output, err, failure_started, failure_finished = attempt(fixture)
                    local row = cursor(fixture)
                    test.eq(#documents(targets[1]), 0)
                    test.eq(tonumber(row.last_seq), 0, "unavailable embedding must hold the cursor")
                    test.eq(row.status, "active")
                    test.contains(tostring(row.last_error), "embedding backend unavailable")
                    test.is_nil(output)
                    test.eq(err:kind(), errors.UNAVAILABLE)
                    test.is_true(err:retryable())
                    local job = query([[SELECT status, attempts, CAST(scheduled_at AS TEXT) AS scheduled_at,
                        CASE WHEN scheduled_at > CURRENT_TIMESTAMP THEN 1 ELSE 0 END AS future
                        FROM kickside_job WHERE id=$1]], { fixture.job_id })[1]
                    test.eq(job.status, "pending")
                    test.eq(tonumber(job.attempts), failure)
                    test.eq(tonumber(job.future), 1)
                    local timestamp = job.scheduled_at:gsub("([+-]%d%d)$", "%1:00")
                    local scheduled = assert(job_clock.parse(timestamp)):unix_nano()
                    if previous_schedule then test.is_true(scheduled > previous_schedule) end
                    previous_schedule = scheduled
                    -- The configured retry window grows, and Jobs jitters the delay within it.
                    local ceiling_seconds = math.max(base_seconds, math.min(cap_seconds, base_seconds * 2 ^ (failure - 1)))
                    test.is_true(scheduled - failure_started >= base_seconds * time.SECOND - time.MICROSECOND)
                    test.is_true(scheduled - failure_finished <= ceiling_seconds * time.SECOND)
                end
                set_model(names[1], "available")
                recover(fixture, targets, head, 3)
            end)
        end)

        for _, modes in ipairs({ { "source-prefix" }, { "available", "source-prefix" } }) do
            local label = #modes == 1 and "one target" or "two targets"
            test.it("commits only the consumed event prefix across " .. label, function()
                with_source(modes, {}, function(fixture, targets, names)
                    local head = append(fixture, { "Available document", "Blocked document", "Remaining document" })
                    local _, err = attempt(fixture)
                    test.is_nil(err, tostring(err))
                    local lagging_documents = documents(targets[#targets])
                    test.eq(tonumber(cursor(fixture).last_seq), 1,
                        "the cursor must stop before the first failed event, stored documents: " .. tostring(#lagging_documents))
                    test.eq(#lagging_documents, 1, "no later document is attempted during the outage")
                    local ahead = #targets > 1 and documents(targets[1]) or nil
                    if ahead then test.eq(#ahead, 2, "the first target can write ahead within one event") end
                    local retry_output, retry_err = attempt(fixture)
                    test.is_nil(retry_output)
                    test.eq(retry_err:kind(), errors.UNAVAILABLE)
                    test.eq(tonumber(cursor(fixture).last_seq), 1)
                    set_model(names[#names], "available")
                    recover(fixture, targets, head, 3)
                    if ahead then
                        local recovered = documents(targets[1])
                        for i, doc in ipairs(ahead) do
                            test.eq(tostring(recovered[i].id), tostring(doc.id))
                        end
                    end
                end)
            end)
        end

        test.it("commits the prefix before a poison event and dead-letters only that event", function()
            with_source({ "available" }, {}, function(fixture, targets)
                local head = append(fixture, {
                    "First document",
                    { body = { content = "Poison document", source_ref = { thread_id = "different-thread" } } },
                    "Third document",
                })
                local body = advance_to(fixture, 1)
                test.is_nil(body.dead_lettered_batches)
                test.eq(#documents(targets[1]), 1)
                assert_dead_letter(fixture, advance_to(fixture, 2), 2, "source_ref.thread_id mismatch")
                recover(fixture, targets, head, 2)
                local stored = documents(targets[1])
                test.eq(stored[1].content, "First document")
                test.eq(stored[2].content, "Third document")
                test.eq(#assert(json.decode(cursor(fixture).body)).dead_lettered_batches, 1)
            end)
        end)

        test.it("consumes five events in pages bounded by the document cap", function()
            with_source({ "available" }, { max_pending_documents = 2 }, function(fixture, targets)
                local head = append(fixture, {
                    "First document", "Second document", "Third document", "Fourth document", "Fifth document",
                })
                for _, seq in ipairs({ 2, 4 }) do
                    local body = advance_to(fixture, seq)
                    test.is_nil(body.dead_lettered_batches)
                    test.eq(#documents(targets[1]), seq)
                    test.eq(source_count(fixture, targets[1]), seq)
                end
                recover(fixture, targets, head, 5)
                test.is_nil(assert(json.decode(cursor(fixture).body)).dead_lettered_batches)
            end)
        end)

        test.it("dead-letters an event that alone exceeds the document cap and ingests later events", function()
            with_source({ "available" }, { max_pending_documents = 1 }, function(fixture, targets)
                local head = append(fixture, {
                    { type = EXTRACTED, body = { result = { documents = {
                        { external_id = "overflow-first", content = "First document" },
                        { external_id = "overflow-second", content = "Second document" },
                    } } } },
                    "Later document",
                })
                assert_dead_letter(fixture, advance_to(fixture, 1), 1, "document cap exceeded", 0)
                test.eq(#documents(targets[1]), 0)
                recover(fixture, targets, head, 1)
                test.eq(#assert(json.decode(cursor(fixture).body)).dead_lettered_batches, 1)
            end)
        end)

        test.it("dead-letters a malformed content extractor return and keeps normalized results", function()
            with_source({ "available" }, {}, function(fixture, targets)
                local head = append(fixture, {
                    { type = EXTRACTED, body = { result = "unsupported extractor result" } },
                    { type = UPSERT, source = "fixture", body = { result = "invalid extractor result" } },
                    { type = EXTRACTED, body = { result = { documents = "invalid documents", deletes = false } } },
                    { type = EXTRACTED, body = { result = {
                        documents = { { content = "Valid document" } }, deletes = "invalid deletes",
                    } } },
                })
                advance_to(fixture, 1)
                assert_dead_letter(fixture, advance_to(fixture, 2), 2, "invalid result")
                recover(fixture, targets, head, 1)
                test.eq(documents(targets[1])[1].content, "Valid document")
                test.eq(source_counts(fixture, targets[1]).pending_source_count, 0)
            end)
        end)

        test.it("keeps the retired batch field through a small patch and clears it on a full commit", function()
            with_source({ "available" }, {}, function(fixture)
                local body = assert(json.decode(cursor(fixture).body))
                body.last_failed_batch = { from_seq = 1, to_seq = 1, attempts = 2, error = "prior failure" }
                body.unrelated_state = "preserved"
                local db = assert(sql.get("app:db"))
                assert(db:execute("UPDATE kickside_projection SET body=$1 WHERE id=$2",
                    { assert(json.encode(body)), fixture.projection_id }))
                assert(select(2, db:release()) == nil)
                local head = append(fixture, { { type = EXTRACTED, body = { result = {} } } })
                local committed = advance_to(fixture, head)
                test.eq(committed.last_status, "skipped_no_items")
                test.eq(committed.last_failed_batch.attempts, 2)
                test.eq(committed.unrelated_state, "preserved")
                advance_to(fixture, append(fixture, { "Normal document" }))
                local updated = assert(json.decode(cursor(fixture).body))
                test.is_nil(updated.last_failed_batch)
                test.eq(updated.unrelated_state, "preserved")
            end)
        end)

        for _, fault in ipairs({ "digest", "byte length" }) do
            test.it("dead-letters an upload with a mismatched artifact " .. fault, function()
                local upload_id = uuid.v7()
                local content = "Artifact document"
                assert(uploads.create(upload_id, "test-user", #content,
                    "text/plain", "app:uploads", "source.txt", "document", {}, "completed", "test-checksum"))
                local artifact = assert(artifacts.create_artifact({
                    upload_id = upload_id, kind = "markdown", role = "primary", mime_type = "text/plain",
                    content = content, storage_id = "app:uploads",
                }))
                local ok, err = pcall(function()
                    with_source({ "available" }, {}, function(fixture, targets)
                        local head = append(fixture, {
                            { body = {
                                kb_id = fixture.thread, content_omitted = true,
                                content_bytes = fault == "digest" and #content or #content + 1,
                                content_sha256 = string.rep("0", 64),
                                source_ref = { kind = "upload", upload_id = upload_id, artifact_id = artifact.artifact_id },
                            } },
                            "Valid document",
                        })
                        assert_dead_letter(fixture, advance_to(fixture, 1), 1, "artifact " .. fault .. " changed")
                        recover(fixture, targets, head, 1)
                        test.eq(documents(targets[1])[1].content, "Valid document")
                    end)
                end)
                assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
                local db = assert(sql.get("app:db"))
                assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", { upload_id }))
                assert(select(2, db:release()) == nil)
                if not ok then error(err) end
            end)
        end

        test.it("isolates a provider INVALID and indexes later documents", function()
            with_source({ "source-content-invalid" }, {}, function(fixture, targets)
                local head = append(fixture, { "Over limit document", "Valid document" })
                local body = advance_to(fixture, head)
                local rows = documents(targets[1])
                test.eq(#rows, 2)
                local metadata = assert(json.decode(rows[1].metadata))
                test.eq(metadata.status, "failed")
                test.contains(metadata.error, "input exceeds model token limit")
                test.eq(assert(json.decode(rows[2].metadata)).status, "completed")
                test.eq(body.kb_results[1].system_failed, 0)
                test.is_nil(body.kb_results[1].consumed)
                test.is_nil(body.dead_lettered_batches)
            end)
        end)

        test.it("holds for an INTERNAL store write error without writing a failed row", function()
            local config = { store_fault = "replace" }
            with_source({ "available" }, config, function(fixture, targets)
                local head = append(fixture, { "Recoverable document" })
                assert_unavailable(fixture, 0, "store fixture failure")
                test.eq(#documents(targets[1]), 0)
                query("UPDATE kb10_stores SET config=$1 WHERE component_id=$2 RETURNING id",
                    { '{"fixture_recovered":true}', targets[1] })
                recover(fixture, targets, head, 1)
            end)
        end)

        test.it("holds for an untyped embedding provider error and indexes after recovery", function()
            with_source({ "source-string-error" }, {}, function(fixture, targets, names)
                local head = append(fixture, { "Recoverable document" })
                assert_unavailable(fixture, 0, "embedding provider rejected the input")
                test.eq(#documents(targets[1]), 0)
                set_model(names[1], "available")
                recover(fixture, targets, head, 1)
            end)
        end)

        test.it("publishes the pending source count while an outage holds the cursor and after recovery", function()
            with_source({ "source-unavailable" }, {}, function(fixture, targets, names)
                local head = append(fixture, { "First document", "Second document" })
                assert_unavailable(fixture, 0, "embedding backend unavailable")
                local _, _, _, pending = source_counts(fixture, targets[1])
                test.eq(pending, 2)

                set_model(names[1], "available")
                recover(fixture, targets, head, 2)
                local _, _, _, caught_up = source_counts(fixture, targets[1])
                test.eq(caught_up, 0)
            end)
        end)

        test.it("keeps unrelated sequence gaps out of the pending event delta", function()
            with_source({ "source-prefix" }, {}, function(fixture, targets, names)
                local head = append(fixture, {
                    "First document", { type = "fixture.unrelated", body = {} }, "Second document", "Blocked document",
                })
                advance_to(fixture, 3)
                local pending, pending_status = source_counts(fixture, targets[1])
                test.eq(pending.pending_source_count, 1)
                test.eq(pending_status, "syncing")
                assert_unavailable(fixture, 3, "embedding backend unavailable")
                set_model(names[1], "available")
                recover(fixture, targets, head, 3)
                local ready, ready_status = source_counts(fixture, targets[1])
                test.eq(ready.pending_source_count, 0)
                test.eq(ready_status, "ready")
            end)
        end)

        test.it("publishes only the knowledge base's own counts after healthy ingestion across two targets", function()
            with_source({ "available", "available" }, {}, function(fixture, targets)
                local head = append(fixture, { "First document", "Second document" })
                recover(fixture, targets, head, 2)
                local counts, status, public_documents = source_counts(fixture, targets[1])
                test.eq(counts.document_count, 2)
                test.eq(public_documents, 2)
                test.eq(counts.pending_source_count, 0)
                test.eq(status, "ready")
            end)
        end)

        test.it("keeps a content event pending when the second of two targets is unavailable", function()
            with_source({ "available", "source-prefix" }, {}, function(fixture, targets, names)
                local head = append(fixture, { "First document", "Blocked document" })
                advance_to(fixture, 1)
                local pending, status = source_counts(fixture, targets[1])
                test.eq(pending.pending_source_count, 1)
                test.eq(status, "syncing")
                assert_unavailable(fixture, 1, "embedding backend unavailable")
                set_model(names[2], "available")
                recover(fixture, targets, head, 2)
                local ready, ready_status = source_counts(fixture, targets[1])
                test.eq(ready.pending_source_count, 0)
                test.eq(ready_status, "ready")
            end)
        end)

        for _, fault in ipairs({ "lineage conflict", "extractor timeout" }) do
            test.it("publishes one digest and treatment after a prefix and " .. fault, function()
                with_source({ "available" }, {}, function(fixture)
                    local final_event = fault == "lineage conflict"
                        and { body = { content = "Poison document", source_ref = { thread_id = "different-thread" } } }
                        or { source = "fixture", body = { kb_id = fixture.thread, timeout_until_event_type = "fixture.recovered" } }
                    local head = append(fixture, { "First document", final_event })
                    advance_to(fixture, 1)
                    test.eq(#requests(fixture, "digest"), 0)
                    if fault == "extractor timeout" then
                        assert_unavailable(fixture, 1, "extractor timeout")
                        append(fixture, { { type = "fixture.recovered", body = {} } })
                    else
                        advance_to(fixture, head)
                    end
                    recover(fixture, {}, head, 0)
                    local state = assert(json.decode(cursor(fixture).body))
                    test.is_true(state.digest_pending == nil or state.digest_pending == false)
                    for _, name in ipairs({ "digest", "treatment" }) do
                        local events = requests(fixture, name)
                        test.eq(#events, 1)
                        local body = assert(json.decode(events[1].body))
                        test.eq(body.source_from_seq, 1)
                        test.is_true(body.source_to_seq >= head)
                    end
                    local next_head = append(fixture, { { source = "fixture", body = { result = {} } } })
                    advance_to(fixture, next_head)
                    test.eq(#requests(fixture, "digest"), 1)
                    test.eq(#requests(fixture, "treatment"), 1)
                end)
            end)
        end

        for _, first in ipairs({ "Available document", "Over limit document" }) do
            test.it("replays a multi-document event after writing " .. first, function()
                with_source({ "source-content-invalid" }, {}, function(fixture, targets, names)
                    local head = append(fixture, { extracted({
                        document("first", first), document("second", "Blocked document"),
                    }) })
                    assert_unavailable(fixture, 0, "embedding backend unavailable")
                    local partial = documents(targets[1])
                    test.eq(#partial, 1)
                    test.eq(assert(json.decode(partial[1].metadata)).status,
                        first == "Available document" and "completed" or "failed")
                    set_model(names[1], "available")
                    advance_to(fixture, head)
                    local recovered = documents(targets[1])
                    test.eq(#recovered, 2)
                    for _, row in ipairs(recovered) do test.eq(assert(json.decode(row.metadata)).status, "completed") end
                end)
            end)
        end

        test.it("replays a delete partially applied across two targets", function()
            with_source({ "available", "available" }, { store_fault = "delete" }, function(fixture, targets)
                advance_to(fixture, append(fixture, { "Document to delete" }))
                test.eq(#documents(targets[1]), 1, "first target starts with the document")
                test.eq(#documents(targets[2]), 1, "second target starts with the document")
                local head = append(fixture, { deletion("document-1") })
                assert_unavailable(fixture, 1, "store fixture failure")
                test.eq(#documents(targets[1]), 0)
                test.eq(#documents(targets[2]), 1)
                query("UPDATE kb10_stores SET config=$1 WHERE component_id=$2 RETURNING id",
                    { '{"fixture_recovered":true}', targets[2] })
                recover(fixture, targets, head, 0)
                local counts, _, public_documents = source_counts(fixture, targets[1])
                test.eq(public_documents, 0)
                test.eq(counts.chunk_count, 0)
                local body = assert(json.decode(cursor(fixture).body))
                for _, target in ipairs(targets) do
                    test.is_nil(next(body.kbs[target].sources), "deleted source remains in the projection")
                end
            end)
        end)

        test.it("bounds a delete page and dead-letters only an oversized delete event", function()
            with_source({ "available" }, { max_pending_deletes = 1 }, function(fixture, targets)
                advance_to(fixture, append(fixture, { "First document", "Second document", "Third document" }))
                local start = append(fixture, {})
                local head = append(fixture, {
                    deletion("document-1"), deletion("document-2"),
                    extracted(nil, { { external_id = "document-3" }, { external_id = "other" } }),
                    deletion("document-3"),
                })
                advance_to(fixture, start + 1)
                test.eq(#documents(targets[1]), 2)
                advance_to(fixture, start + 2)
                test.eq(#documents(targets[1]), 1)
                assert_dead_letter(fixture, advance_to(fixture, start + 3), start + 3, "delete cap exceeded", 0)
                recover(fixture, targets, head, 0)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
