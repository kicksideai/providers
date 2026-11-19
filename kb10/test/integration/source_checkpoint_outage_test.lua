-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local artifact_cleanup = require("artifact_cleanup")
local artifacts = require("artifacts")
local fs = require("fs")
local hash = require("hash")
local jobs = require("jobs")
local json = require("json")
local models = require("models")
local process = require("process")
local projections = require("projections")
local sql = require("sql")
local store = require("store")
local test = require("test")
local threads = require("threads")
local time = require("time")
local uploads = require("uploads")
local uuid = require("uuid")

local UPSERT = "kickside.knowledge.events:content.upserted"
local DELETE = "kickside.knowledge.events:content.deleted"

local function in_db(check)
    local db = assert(sql.get("app:db"))
    local ok, result = pcall(check, db)
    db:release()
    if not ok then error(result) end
    return result
end

local function read_store(db, registration, id)
    return {
        cursor = assert(db:query([[SELECT c.last_seq,c.last_error,j.attempts,j.status,j.scheduled_at,
            j.last_error AS job_error FROM kickside_projection_cursor c
            JOIN kickside_job j ON j.id=c.job_id WHERE c.id=$1]], {registration.cursor_id}))[1],
        roots = assert(db:query([[SELECT id,content,metadata,external_id FROM kb10_nodes
            WHERE store_id=$1 AND node_type='document' ORDER BY external_id]], {id})),
    }
end

local function wait_state(registration, store_id, accepts)
    local deadline = time.now():add("30s")
    local state
    repeat
        state = in_db(function(db) return read_store(db, registration, store_id) end)
        if accepts(state.cursor) then return state end
        if state.cursor.job_error and state.cursor.status == "pending" and not state.cursor.scheduled_at then break end
        time.sleep("25ms")
    until time.now():after(deadline)
    error("scheduled KB10 checkpoint did not reach expected state: " .. assert(json.encode(state.cursor)))
end

local function append(db, id, external_id, version, body)
    body.kb_id = id
    assert(threads.append_system(db, id, {{
        type = UPSERT, role = "user", body_json = assert(json.encode(body)),
        external = {external_source = "knowledge.kb", external_id = external_id, external_version = version},
    }}))
end

local function absent_artifact()
    local id = uuid.v7()
    local text = "fixture immutable bytes"
    assert(uploads.create(id, "test-user", #text, "text/plain", "app:uploads", "source.txt",
        "document", {}, "completed", "test-checksum"))
    local artifact = assert(artifacts.create_artifact({upload_id = id, kind = "markdown", role = "primary",
        mime_type = "text/plain", content = text, storage_id = "app:uploads"}))
    local blob = assert(artifacts.get_blob(artifact.blob_id))
    assert((assert(fs.get(blob.storage_id))):remove(blob.storage_path))
    return id, {content_omitted = true, content_bytes = #text, content_sha256 = hash.sha256(text),
        source_ref = {kind = "upload", upload_id = id, artifact_id = artifact.artifact_id}}
end

local function metadata(row)
    return type(row.metadata) == "table" and row.metadata or assert(json.decode(row.metadata))
end

local function delete(db, id, role, external_id, selected)
    assert(threads.append_system(db, id, {{type = DELETE, role = role,
        body_json = assert(json.encode({kb_id = id, metadata = {node_id = selected}})),
        external = {external_source = "knowledge.kb", external_id = external_id, external_version = "delete"},
    }}))
end

local function assert_replay_stays_bounded(db, registered, store_id, model)
    local function population()
        return assert(db:query([[SELECT
            (SELECT COUNT(*) FROM kb10_nodes WHERE store_id=$1) AS nodes,
            (SELECT COUNT(*) FROM kb10_embeddings WHERE store_id=$1) AS vectors,
            (SELECT COUNT(*) FROM kickside_job_run WHERE job_id=$2) AS runs,
            (SELECT calls FROM kb10_checkpoint_model WHERE model=$3) AS calls,
            (SELECT event_count FROM kickside_thread WHERE id=$4) AS events]],
            {store_id, registered.job_id, model, store_id}))[1]
    end
    local before = population()
    for _, repetitions in ipairs({10, 100}) do
        local duplicate = {type = UPSERT, role = "user", body_json = assert(json.encode({
            kb_id = store_id, content = "Later good document",
        })), external = {external_source = "knowledge.kb", external_id = "c", external_version = "1"}}
        local drafts = {}
        for i = 1, repetitions do drafts[i] = duplicate end
        local response = assert(threads.append_system(db, store_id, drafts))
        test.eq(tonumber(response.inserted), 0)
        local after = population()
        for key, count in pairs(before) do test.eq(tonumber(after[key]), tonumber(count), key) end
    end
end

return {run = test.run_cases(function()
    test.describe("scheduled KB10 source checkpoints", function()
        test.it("recovers the existing slot without losing or replaying accepted documents", function()
            local id = uuid.v7()
            local model = "kb10-checkpoint-" .. id
            assert(models.upsert_card({name = model, provider_id = "app:checkpoint_model_provider", provider_model = model,
                capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
            assert(store.create_store(id, model, {}))
            local upload_id, missing = absent_artifact()
            local registered = in_db(function(db)
                assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
                    model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]))
                assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,0,0,0)", {model}))
                assert(db:execute("INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)", {id, id}))
                append(db, id, "a", "1", {content = "Earlier good revision"})
                append(db, id, "a", "2", {content = "queued replacement"})
                return assert(projections.register_projection(db, id, {
                    kind = "knowledge.injection.source", worker_input_mode = "prefetch_events", system_identity = true,
                    worker_ref = "proc://kickside.kb10.injection:checkpoint_source_worker",
                    events = {input = {{type = UPSERT}, {type = DELETE}}},
                    worker_config = {materialization = {summary_model = false, chunk_enrichment_model = false}},
                }))
            end)
            local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
            local ok, err = pcall(function()
                assert(jobs.nudge_workers())
                local outage = wait_state(registered, id, function(cursor)
                    return cursor.status == "pending" and tonumber(cursor.attempts) > 0
                end)
                test.eq(tonumber(outage.cursor.last_seq), 1, tostring(outage.cursor.last_error or outage.cursor.job_error))
                test.contains(outage.cursor.last_error, "knowledge source model unavailable")
                test.eq(#outage.roots, 1)
                test.eq(outage.roots[1].content, "Earlier good revision")

                in_db(function(db)
                    append(db, id, "a", "3", missing)
                    append(db, id, "b", "1", missing)
                    append(db, id, "c", "1", {content = "Later good document"})
                    test.eq(read_store(db, registered, id).cursor.scheduled_at, outage.cursor.scheduled_at)
                    assert(db:execute("UPDATE kb10_checkpoint_model SET online=1 WHERE model=$1", {model}))
                end)
                local done = wait_state(registered, id, function(cursor)
                    return tonumber(cursor.last_seq) == 5 and cursor.status == "pending" and not cursor.scheduled_at
                end)
                test.is_nil(done.cursor.last_error)
                test.eq(#done.roots, 3)
                test.eq(done.roots[1].id, outage.roots[1].id)
                test.eq(done.roots[1].content, "queued replacement")
                test.eq(metadata(done.roots[1]).status, "completed")
                test.eq(metadata(done.roots[1]).source_rejection.code, "artifact_bytes_not_found")
                test.eq(metadata(done.roots[2]).status, "failed")
                test.eq(done.roots[3].content, "Later good document")

                in_db(function(db)
                    local provider = assert(db:query("SELECT calls,failures FROM kb10_checkpoint_model WHERE model=$1", {model}))[1]
                    test.eq(tonumber(provider.calls), 4)
                    test.eq(tonumber(provider.failures), 1)
                    local runs = assert(db:query("SELECT status FROM kickside_job_run WHERE job_id=$1 ORDER BY execution_seq",
                        {registered.job_id}))
                    test.eq(#runs, 2)
                    test.eq(runs[1].status, "failed")
                    test.eq(runs[2].status, "completed")
                    assert_replay_stays_bounded(db, registered, id, model)
                    delete(db, id, "system", "c", done.roots[3].id)
                end)
                local deleted = wait_state(registered, id, function(cursor)
                    return tonumber(cursor.last_seq) == 6 and cursor.status == "pending" and not cursor.scheduled_at
                end)
                test.eq(#deleted.roots, 2)
                test.eq(deleted.roots[1].id, outage.roots[1].id)
                in_db(function(db) delete(db, id, "user", "a", done.roots[1].id) end)
                local refused = wait_state(registered, id, function(cursor)
                    return cursor.status == "pending" and cursor.last_error ~= nil and not cursor.scheduled_at
                end)
                test.eq(tonumber(refused.cursor.last_seq), 6)
                test.contains(refused.cursor.last_error, "invalid selected document delete")
                test.eq(#refused.roots, 2)
                test.eq(refused.roots[1].id, outage.roots[1].id)
            end)
            process.terminate(scheduler)
            in_db(function(db)
                assert(projections.remove_projection(db, id, {projection_id = registered.projection_id}))
                assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", {model}))
                assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {id}))
                assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
            end)
            assert(store.delete_store(id))
            assert(models.delete_card(model))
            assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
            in_db(function(db) assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {upload_id})) end)
            if not ok then error(err) end
        end)
    end)
end)}
