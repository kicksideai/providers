-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local artifact_input = require("artifact_input")
local artifacts = require("artifacts")
local artifact_cleanup = require("artifact_cleanup")
local claim = require("claim")
local clock = require("clock")
local fs = require("fs")
local json = require("json")
local ops = require("ops")
local projections = require("projections")
local sql = require("sql")
local store = require("store")
local test = require("test")
local time = require("time")
local uploads = require("uploads")
local uuid = require("uuid")
local writer = require("writer")
local publication_plan = require("publication_plan")
local publication_slot = require("publication_slot")

local UPSERT = "kickside.knowledge.events:content.upserted"
local GRAPH = "kickside.knowledge.events:graph.changed"
local DATABASE = "app:db"

local function row(statement, args)
    local db = assert(sql.get(DATABASE))
    local rows, err = db:query(statement, args)
    assert(select(2, db:release()) == nil)
    assert(rows, tostring(err))
    return rows[1]
end

local function snapshot(cursor_id)
    local current = assert(row([[SELECT c.*, p.body FROM kickside_projection_cursor c
        JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]], {cursor_id}))
    current.body = type(current.body) == "table" and current.body or assert(json.decode(current.body))
    return current
end

local function with_registration(check)
    local kb_id = uuid.v7()
    assert(store.create_store(kb_id, "fixture-embed", {}))
    local db = assert(sql.get(DATABASE))
    local dialect = assert(db:type())
    assert(db:execute([[INSERT INTO kickside_thread (id,thread_class,component_id,event_count)
        VALUES ($1,'test',$2,2)]], {kb_id, kb_id}))
    local events = {}
    for position = 1, 2 do
        local event_id = uuid.v7()
        events[position] = event_id
        assert(db:execute([[INSERT INTO kickside_event (id,thread_id,type,role,body,seq)
            VALUES ($1,$2,$3,'user','{}',$4)]], {event_id, kb_id, UPSERT, position}))
    end
    local registered = assert(projections.register_projection(db, kb_id, {
        kind = "knowledge.injection.source", worker_ref = "proc://kickside.kb10.injection:source_worker_proc",
        worker_input_mode = "prefetch_events", system_identity = true,
        events = {input = {{type = UPSERT}}}, worker_config = {target_kb_ids = {kb_id}},
    }))
    local tx = assert(db:begin())
    local token = uuid.v7()
    local leased = assert(claim.lease_row(tx, dialect, registered.job_id, token,
        clock.format(time.now():add("1m"), dialect), clock.now(dialect)))
    assert(select(2, tx:commit()) == nil)
    assert(select(2, db:release()) == nil)

    local job = {id = registered.job_id, lease_token = token, execution_seq = tonumber(leased.execution_seq)}
    local ok, err = pcall(check, kb_id, events, job, snapshot(registered.cursor_id))
    db = assert(sql.get(DATABASE))
    assert(projections.remove_projection(db, kb_id, {projection_id = registered.projection_id}))
    assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {kb_id}))
    assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {kb_id}))
    assert(select(2, db:release()) == nil)
    assert(store.delete_store(kb_id))
    if not ok then error(err) end
end

local function replacement(kb_id, event_id, position, external_id)
    external_id = external_id or "same-document"
    local metadata = {
        external_source = "knowledge.kb", external_id = external_id,
        external_version = tostring(position), thread_event_id = event_id, thread_event_seq = position,
        source_ref = {thread_id = kb_id, thread_event_id = event_id, thread_event_seq = position,
            external_source = "knowledge.kb", external_id = external_id, external_version = tostring(position)},
        status = "completed",
    }
    local vector = {}
    for dimension = 1, store.VECTOR_DIMENSIONS do vector[dimension] = 0.1 end
    local content = position == 1 and "original quokka" or "updated kangaroo"
    return {
        source_thread_id = kb_id,
        document = {node_type = "document", content = content, content_type = "text/plain", metadata = metadata},
        children = {{node = {node_type = "chunk", content = content, content_type = "text/plain", metadata = metadata},
            embedding = vector}},
    }
end

local function with_missing_blob(check)
    local upload_id = uuid.v7()
    local content = "An immutable artifact whose bytes are absent"
    assert(uploads.create(upload_id, "test-user", #content, "text/plain", "app:uploads", "source.txt",
        "document", {}, "completed", "test-checksum"))
    local artifact = assert(artifacts.create_artifact({upload_id = upload_id, kind = "markdown", role = "primary",
        mime_type = "text/plain", content = content, storage_id = "app:uploads"}))
    local blob = assert(artifacts.get_blob(artifact.blob_id))
    assert((assert(fs.get(blob.storage_id))):remove(blob.storage_path))
    local ok, err = pcall(check, upload_id, artifact.artifact_id)
    assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
    local db = assert(sql.get(DATABASE))
    assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {upload_id}))
    assert(select(2, db:release()) == nil)
    if not ok then error(err) end
end

local function reject_missing(kb_id, upload_id, artifact_id, event_id, position, external_id)
    local content, err, code = artifact_input.read(upload_id, artifact_id)
    test.is_nil(content)
    test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
    test.eq(code, "artifact_bytes_not_found")
    local metadata = replacement(kb_id, event_id, position, external_id).document.metadata
    metadata.source_ref.kind = "upload"
    metadata.source_ref.upload_id = upload_id
    metadata.source_ref.artifact_id = artifact_id
    return function(tx, dialect)
        local node_id, write_err = writer.reject_source_revision_tx(tx, dialect, kb_id, kb_id, metadata, code)
        if write_err then return nil, write_err end
        return node_id ~= nil
    end
end

local function document(kb_id)
    return row([[SELECT doc.id, doc.content, child.id AS child_id
        FROM kb10_nodes doc JOIN kb10_nodes child ON child.parent_id=doc.id
        WHERE doc.store_id=$1 AND doc.node_type='document']], {kb_id})
end

local function effective_write(kb_id, event_id, position, failure)
    local prepared = replacement(kb_id, event_id, position)
    return function(tx, dialect)
        local written, err = writer.replace_document_tx(tx, dialect, kb_id, prepared)
        if err then return nil, err end
        if failure then return nil, failure end
        return written.document_node_id ~= nil
    end
end

return {run = test.run_cases(function()
    test.describe("fenced writes on a registered KB10 source", function()
        test.it("closes a prepared group before the next input would use its publication time", function()
            local page = publication_plan.new("store", "thread")
            test.eq(page.full(100, 150, 1), false)
            test.eq(page.full(115, 150, 1), false)
            -- A quick second input must not erase the cost of the first one.
            test.eq(page.full(118, 150, 1), true)
            local retry = publication_plan.new("store", "thread")
            test.eq(retry.full(101, 150, 2), true)
            test.eq(retry.full(101, 150, nil), true)
            local fast = publication_plan.new("store", "thread")
            for now = 100, 110 do test.eq(fast.full(now, 150, 1), false) end
        end)

        test.it("binds a first rejection to its planned document ID and retires the recreated store", function()
            with_registration(function(kb_id, events, job, current)
                local page = publication_plan.new(kb_id, kb_id)
                local slot = assert(publication_slot.read(kb_id))
                test.not_nil(slot.token)
                local revision = replacement(kb_id, events[1], 1).document.metadata
                local invalid = page.store:reject_source_revision({store_id = kb_id, metadata = {}, code = "artifact_bytes_not_found"})
                test.is_nil(invalid)
                test.eq(#page.plans, 0)
                local rejection = assert(page.store:reject_source_revision({store_id = kb_id, metadata = revision,
                    code = "artifact_bytes_not_found"}))
                test.eq(rejection.failed_delta, 1)
                test.is_nil(row("SELECT id FROM kb10_nodes WHERE store_id=$1", {kb_id}))
                local _, repeated = page.store:reject_source_revision({store_id = kb_id, metadata = revision,
                    code = "artifact_bytes_not_found"})
                test.is_true(errors.is(repeated, errors.CONFLICT))
                assert(apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1}, function(tx, dialect)
                    assert(publication_slot.check(tx, dialect, kb_id, slot.token))
                    return publication_plan.write(tx, dialect, kb_id, page.plans)
                end))
                test.eq(row("SELECT id FROM kb10_nodes WHERE store_id=$1", {kb_id}).id, rejection.document_node_id)
                assert(store.delete_store(kb_id))
                assert(store.create_store(kb_id, "fixture-embed", {}))
                local fresh = assert(publication_slot.read(kb_id))
                test.is_true(fresh.token ~= slot.token)
                local stale, changed = publication_slot.current(kb_id, slot.token)
                test.is_nil(stale)
                test.is_true(errors.is(changed, errors.CONFLICT))
                test.is_nil(fresh.result)
            end)
        end)

        test.it("commits the real document, descendants and checkpoint together", function()
            with_registration(function(kb_id, events, job, current)
                local first = assert(apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1},
                    effective_write(kb_id, events[1], 1)))
                test.eq(first.last_seq, 1)
                local accepted = assert(document(kb_id))
                test.eq(accepted.content, "original quokka")
                test.eq(tonumber(snapshot(current.id).last_seq), 1)
                local second = assert(apply.checkpoint(ops.db_id(), job, snapshot(current.id), 2, {last_seq = 2},
                    effective_write(kb_id, events[2], 2)))
                test.eq(second.last_seq, 2)
                local updated = assert(document(kb_id))
                test.eq(updated.id, accepted.id)
                test.is_true(updated.child_id ~= accepted.child_id)
                test.eq(updated.content, "updated kangaroo")
                assert(apply.finish_checkpointed(ops.db_id(), job, snapshot(current.id), 0))
                local history = row("SELECT COUNT(*) AS count FROM kickside_job_run WHERE job_id=$1", {job.id})
                test.eq(tonumber(history.count), 1)
            end)
        end)

        test.it("rolls back a real replacement and refuses it after pause", function()
            with_registration(function(kb_id, events, job, current)
                assert(apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1},
                    effective_write(kb_id, events[1], 1)))
                local accepted = assert(document(kb_id))
                current = snapshot(current.id)
                local failed, failure = apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 2},
                    effective_write(kb_id, events[2], 2, errors.new({kind = errors.UNAVAILABLE, retryable = true,
                        message = "fixture stopped after the replacement SQL"})))
                test.is_nil(failed)
                test.is_true(errors.is(failure, errors.UNAVAILABLE), tostring(failure))
                test.eq(tonumber(snapshot(current.id).last_seq), 1)
                test.eq(document(kb_id).child_id, accepted.child_id)

                local db = assert(sql.get(DATABASE))
                assert(projections.pause(db, kb_id, {cursor_id = current.id}))
                assert(select(2, db:release()) == nil)
                local stale, stale_err = apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 2},
                    effective_write(kb_id, events[2], 2))
                test.is_nil(stale)
                test.is_true(errors.is(stale_err, errors.CONFLICT), tostring(stale_err))
                local persisted = assert(document(kb_id))
                test.eq(persisted.id, accepted.id)
                test.eq(persisted.child_id, accepted.child_id)
                test.eq(persisted.content, accepted.content)
                test.eq(tonumber(snapshot(current.id).last_seq), 1)
            end)
        end)

        test.it("rejects stale output facts and rolls back owner writes when publishing fails", function()
            with_registration(function(kb_id, events, job, current)
                local selector = {source_thread_id = kb_id, external_source = "knowledge.kb", external_id = "same-document"}
                local change = {kind = "replace", replacement = replacement(kb_id, events[1], 1)}
                local empty = assert(writer.source_checkpoint_before(kb_id, selector, change.kind))
                assert(writer.replace_document(kb_id, replacement(kb_id, events[2], 2)))
                local existing = assert(document(kb_id))
                local write = function(before, outcome)
                    outcome = outcome or writer.source_checkpoint_outcome(before, change)
                    return function(tx, dialect)
                        return writer.write_source_checkpoint_tx(tx, dialect, kb_id, selector, before, change, outcome)
                    end
                end
                local stale, stale_err = apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1,
                    append_events = {{thread_id = kb_id, events = {{type = GRAPH}}}}}, write(empty))
                test.is_nil(stale)
                test.is_true(errors.is(stale_err, errors.CONFLICT), tostring(stale_err))
                test.eq(document(kb_id).child_id, existing.child_id)
                test.eq(tonumber(snapshot(current.id).last_seq), 0)

                local before_vector = assert(writer.source_checkpoint_before(kb_id, selector, change.kind))
                assert(writer.insert_embedding(kb_id, existing.id, "document", nil,
                    change.replacement.children[1].embedding))
                local changed, changed_err = apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1,
                    append_events = {{thread_id = kb_id, events = {{type = GRAPH}}}}}, write(before_vector))
                test.is_nil(changed)
                test.is_true(errors.is(changed_err, errors.CONFLICT), tostring(changed_err))
                test.eq(document(kb_id).child_id, existing.child_id)
                test.eq(tonumber(snapshot(current.id).last_seq), 0)

                local before = assert(writer.source_checkpoint_before(kb_id, selector, change.kind))
                local wrong = writer.source_checkpoint_outcome(before, change)
                wrong.embedding_delta = wrong.embedding_delta + 1
                local mismatched, mismatch_err = apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1,
                    append_events = {{thread_id = kb_id, events = {{type = GRAPH}}}}}, write(before, wrong))
                test.is_nil(mismatched)
                test.contains(tostring(mismatch_err), "source writer result differs from checkpoint outcome")
                test.eq(document(kb_id).child_id, existing.child_id)
                test.eq(tonumber(snapshot(current.id).last_seq), 0)

                local moved = false
                local execute = write(before)
                local refused, refusal = apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1,
                    append_events = {{thread_id = kb_id, events = {{type = GRAPH}}},
                        {thread_id = uuid.v7(), events = {{type = GRAPH}}}}}, function(tx, dialect)
                    local wrote, err = execute(tx, dialect)
                    moved = wrote == true
                    return wrote, err
                end)
                test.is_true(moved, tostring(refusal))
                test.is_nil(refused)
                test.is_true(errors.is(refusal, errors.NOT_FOUND), tostring(refusal))
                test.eq(document(kb_id).child_id, existing.child_id)
                test.eq(tonumber(snapshot(current.id).last_seq), 0)
                test.is_nil((row("SELECT id FROM kickside_event WHERE thread_id=$1 AND type=$2", {kb_id, GRAPH})))
            end)
        end)

        test.it("records a missing stored blob and accepts the next document in the same execution", function()
            with_missing_blob(function(upload_id, artifact_id)
                with_registration(function(kb_id, events, job, current)
                    assert(apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1},
                        reject_missing(kb_id, upload_id, artifact_id, events[1], 1, "missing-document")))
                    local rejected = assert(row("SELECT id FROM kb10_nodes WHERE store_id=$1 AND external_id=$2",
                        {kb_id, "missing-document"}))
                    local root = assert(store.get_node(kb_id, rejected.id))
                    test.eq(root.metadata.status, "failed")
                    test.eq(root.metadata.source_rejection.thread_event_id, events[1])
                    test.eq(root.metadata.source_rejection.code, "artifact_bytes_not_found")
                    test.is_nil(document(kb_id))

                    assert(apply.checkpoint(ops.db_id(), job, snapshot(current.id), 2, {last_seq = 2},
                        effective_write(kb_id, events[2], 2)))
                    test.eq(document(kb_id).content, "updated kangaroo")
                    test.eq(tonumber(snapshot(current.id).last_seq), 2)
                    test.eq(assert(store.get_node(kb_id, rejected.id)).metadata.status, "failed")
                    assert(apply.finish_checkpointed(ops.db_id(), job, snapshot(current.id), 0))
                end)
            end)
        end)

        test.it("keeps an accepted tree when a newer source revision loses its artifact", function()
            with_missing_blob(function(upload_id, artifact_id)
                with_registration(function(kb_id, events, job, current)
                    assert(apply.checkpoint(ops.db_id(), job, current, 2, {last_seq = 1},
                        effective_write(kb_id, events[1], 1)))
                    local before = assert(document(kb_id))
                    assert(apply.checkpoint(ops.db_id(), job, snapshot(current.id), 2, {last_seq = 2},
                        reject_missing(kb_id, upload_id, artifact_id, events[2], 2)))
                    local after = assert(document(kb_id))
                    test.eq(after.id, before.id)
                    test.eq(after.child_id, before.child_id)
                    test.eq(after.content, before.content)
                    test.eq(tonumber(snapshot(current.id).last_seq), 2)
                    local metadata = assert(store.get_node(kb_id, after.id)).metadata
                    test.eq(metadata.status, "completed")
                    test.eq(metadata.external_version, "1")
                    test.eq(metadata.source_rejection.external_version, "2")
                    test.eq(metadata.source_rejection.thread_event_id, events[2])
                end)
            end)
        end)
    end)
end)}
