-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local artifact_cleanup = require("artifact_cleanup")
local artifacts = require("artifacts")
local channel = require("channel")
local enrichment_consts = require("enrichment_consts")
local fs = require("fs")
local hash = require("hash")
local jobs = require("jobs")
local json = require("json")
local models = require("models")
local process = require("process")
local projections = require("projections")
local owner = require("projection_owner")
local sql = require("sql")
local store = require("store")
local test = require("test")
local threads = require("threads")
local time = require("time")
local uploads = require("uploads")
local uuid = require("uuid")

local UPSERT = "kickside.knowledge.events:content.upserted"
local DELETE = "kickside.knowledge.events:content.deleted"
local GRAPH = "kickside.knowledge.events:graph.changed"
local DIGEST = "kickside.knowledge.events:digest.requested"
local TREAT = "kickside.knowledge.events:treatment.requested"
local EMPTY = "app:finalizer_empty_source"

local function in_db(check)
    local db = assert(sql.get("app:db"))
    local ok, result = pcall(check, db)
    db:release()
    if not ok then error(result) end
    return result
end

local function read_store(db, registration, id)
    return {
        cursor = assert(db:query([[SELECT c.last_seq,c.last_error,j.attempts,j.max_attempts,j.status,j.scheduled_at,t.event_count,
            j.last_error AS job_error FROM kickside_projection_cursor c
            JOIN kickside_job j ON j.id=c.job_id JOIN kickside_thread t ON t.id=c.thread_id WHERE c.id=$1]],
            {registration.cursor_id}))[1],
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

local function outputs(db, id)
    local result = {graph = {}, digest = {}, treatment = {}}
    local kinds = {[GRAPH] = result.graph, [DIGEST] = result.digest, [TREAT] = result.treatment}
    local rows = assert(db:query([[SELECT type,body FROM kickside_event WHERE thread_id=$1
        AND type IN ($2,$3,$4) ORDER BY seq]], {id, GRAPH, DIGEST, TREAT}))
    for _, row in ipairs(rows) do
        local body = type(row.body) == "table" and row.body or assert(json.decode(row.body))
        table.insert(kinds[row.type], body)
    end
    return result
end

local function caught_up(cursor)
    return tonumber(cursor.last_seq) == tonumber(cursor.event_count) and cursor.status == "pending" and not cursor.scheduled_at
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
    local result = assert(threads.append_system(db, id, {{type = DELETE, role = role,
        body_json = assert(json.encode({kb_id = id, metadata = {node_id = selected}})),
        external = {external_source = "knowledge.kb", external_id = external_id, external_version = "delete"},
    }}))
    return tonumber(result.events[1].seq)
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

local function scenario(ordinary)
    test.describe("scheduled KB10 source worker", function()
        test.it("recovers the existing slot without losing or replaying accepted documents", function()
            local id, actor = uuid.v7(), uuid.v7()
            local model = "kb10-checkpoint-" .. id
            assert(models.upsert_card({name = model, provider_id = "app:checkpoint_model_provider", provider_model = model,
                capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
            assert(store.create_store(id, model, {}))
            local upload_id, missing = absent_artifact()
            local descriptor = not ordinary and "app:checkpoint_fixture_descriptor" or nil
            local member_threads = owner.create(actor, id, descriptor)
            if ordinary then
                assert(member_threads:register_projection({
                    thread_id = id, kind = "knowledge.injection.source", projection_key = "source", cursor_key = "source",
                    worker_ref = "proc://kickside.kb10.injection:source_worker_proc", worker_input_mode = "prefetch_events",
                    events = {input = {{type = UPSERT}, {type = DELETE}}},
                    worker_config = {materialization = {summary_model = false, chunk_enrichment_model = false}},
                }))
            end
            local registered = in_db(function(db)
                assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
                    model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]))
                assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,0,0,0)", {model}))
                append(db, id, "a", "1", {content = "Earlier good revision"})
                append(db, id, "a", "2", {content = "queued replacement"})
                local rows = assert(db:query([[SELECT c.id AS cursor_id,c.actor_id,c.job_id,c.projection_id
                    FROM kickside_projection_cursor c JOIN kickside_projection p ON p.id=c.projection_id
                    WHERE c.thread_id=$1 AND p.kind='knowledge.injection.source' AND c.cursor_key='source']], {id}))
                test.eq(#rows, 1)
                local registration = rows[1]
                test.eq(registration.actor_id, actor)
                if ordinary then
                    assert(db:execute("UPDATE kickside_job SET max_attempts=1 WHERE id=$1", {registration.job_id}))
                end
                return registration
            end)
            local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
            local ok, err = pcall(function()
                assert(jobs.nudge_workers())
                local outage = wait_state(registered, id, function(cursor)
                    return cursor.status == "pending" and (tonumber(cursor.attempts) > 0 or caught_up(cursor))
                end)
                test.eq(tonumber(outage.cursor.last_seq), 1, tostring(outage.cursor.last_error or outage.cursor.job_error))
                test.contains(outage.cursor.last_error, ordinary and "fixture model provider cannot be reached" or "knowledge source model unavailable")
                test.not_nil(outage.cursor.scheduled_at)
                test.eq(#outage.roots, 1)
                test.eq(outage.roots[1].content, "Earlier good revision")

                in_db(function(db)
                    local published = outputs(db, id)
                    test.eq(#published.graph, 1)
                    test.eq(published.graph[1].source_to_seq, 1)
                    test.eq(published.graph[1].document_delta, 1)
                    test.eq(#published.digest, 0)
                    test.eq(#published.treatment, 0)
                    append(db, id, "a", "3", missing)
                    append(db, id, "b", "1", missing)
                    append(db, id, "c", "1", {content = "Later good document"})
                    test.eq(read_store(db, registered, id).cursor.scheduled_at, outage.cursor.scheduled_at)
                end)
                if ordinary then
                    time.sleep("250ms")
                    local held = in_db(function(db) return read_store(db, registered, id) end)
                    test.eq(held.cursor.attempts, outage.cursor.attempts)
                    test.eq(held.cursor.scheduled_at, outage.cursor.scheduled_at)
                    test.eq(assert(store.browse_page(id, {scope = "failures"})).total, 0)
                    local retry = wait_state(registered, id, function(cursor)
                        return cursor.status == "pending" and tonumber(cursor.attempts) == 2
                    end)
                    test.eq(tonumber(retry.cursor.max_attempts), 1)
                    test.not_nil(retry.cursor.scheduled_at)
                    test.eq(tonumber(retry.cursor.last_seq), 1)
                    test.eq(#retry.roots, 1)
                    test.eq(metadata(retry.roots[1]).status, "completed")
                    test.is_true(tostring(retry.cursor.scheduled_at) > tostring(outage.cursor.scheduled_at))
                    in_db(function(db)
                        test.eq(#outputs(db, id).graph, 1)
                        local counts = assert(db:query("SELECT calls,failures FROM kb10_checkpoint_model WHERE model=$1", {model}))[1]
                        test.eq(tonumber(counts.calls), 4)
                        test.eq(tonumber(counts.failures), 3)
                    end)
                end
                in_db(function(db)
                    assert(db:execute("UPDATE kb10_checkpoint_model SET online=1 WHERE model=$1", {model}))
                end)
                local done = wait_state(registered, id, caught_up)
                test.is_nil(done.cursor.last_error)
                test.eq(#done.roots, 3)
                test.eq(done.roots[1].id, outage.roots[1].id)
                test.eq(done.roots[1].content, "queued replacement")
                test.eq(metadata(done.roots[1]).status, "completed")
                test.eq(metadata(done.roots[1]).source_rejection.code, "artifact_bytes_not_found")
                test.eq(metadata(done.roots[2]).status, "failed")
                test.eq(metadata(done.roots[2]).title, "Indexing failed")
                test.contains(metadata(done.roots[2]).error, "stored content is missing")
                test.eq(done.roots[3].content, "Later good document")
                local failures = assert(store.browse_page(id, {scope = "failures"}))
                test.eq(failures.total, 1)
                test.eq(failures.nodes[1].id, done.roots[2].id)
                test.contains(failures.nodes[1].metadata.error, "stored content is missing")

                in_db(function(db)
                    local published = outputs(db, id)
                    test.eq(#published.graph, 5)
                    test.eq(#published.digest, 1)
                    test.eq(#published.treatment, 1)
                    test.eq(published.digest[1].source_to_seq, published.graph[5].source_to_seq)
                    test.eq(published.treatment[1].source_target_seq, published.digest[1].source_target_seq)
                    test.eq(published.graph[2].document_delta, 0)
                    test.eq(published.graph[3].status, "degraded")
                    test.eq(published.graph[3].failed_delta, 0)
                    test.contains(published.graph[3].last_error, "stored content is missing")
                    test.eq(published.graph[4].status, "error")
                    test.eq(published.graph[4].failed_delta, 1)
                    test.contains(published.graph[4].last_error, "stored content is missing")
                    test.eq(published.graph[5].document_delta, 1)
                    local embeddings = 0
                    for _, graph in ipairs(published.graph) do
                        test.eq(graph.source_processed_delta, 1)
                        test.eq(graph.source_projection_id, registered.projection_id)
                        embeddings = embeddings + graph.embedding_delta
                    end
                    test.eq(embeddings, tonumber(assert(db:query([[SELECT COUNT(*) AS count
                        FROM kb10_embeddings WHERE store_id=$1]], {id}))[1].count))
                    local provider = assert(db:query("SELECT calls,failures FROM kb10_checkpoint_model WHERE model=$1", {model}))[1]
                    test.eq(tonumber(provider.calls), ordinary and 6 or 4)
                    test.eq(tonumber(provider.failures), ordinary and 3 or 1)
                    local runs = assert(db:query("SELECT status FROM kickside_job_run WHERE job_id=$1 ORDER BY execution_seq",
                        {registered.job_id}))
                    local failed = 0
                    for _, run in ipairs(runs) do
                        if run.status == "failed" then failed = failed + 1
                        else test.eq(run.status, "completed") end
                    end
                    test.eq(failed, ordinary and 2 or 1)
                    test.eq(#runs, ordinary and 5 or 3)
                    assert_replay_stays_bounded(db, registered, id, model)
                end)
                local delete_seq = in_db(function(db) return delete(db, id, "system", "c", done.roots[3].id) end)
                local deleted = wait_state(registered, id, function(cursor)
                    return tonumber(cursor.last_seq) >= delete_seq and caught_up(cursor)
                end)
                test.eq(#deleted.roots, 2)
                test.eq(deleted.roots[1].id, outage.roots[1].id)
                in_db(function(db)
                    local published = outputs(db, id)
                    test.eq(#published.graph, 6)
                    test.eq(published.graph[6].document_delta, -1)
                    test.eq(published.graph[6].source_to_seq, delete_seq)
                    delete(db, id, "user", "a", done.roots[1].id)
                end)
                local refused = wait_state(registered, id, function(cursor)
                    return cursor.status == "pending" and cursor.last_error ~= nil and not cursor.scheduled_at
                end)
                test.eq(tonumber(refused.cursor.last_seq), tonumber(deleted.cursor.last_seq))
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
                owner.cleanup(db, actor, id)
            end)
            assert(store.delete_store(id))
            assert(models.delete_card(model))
            assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
            in_db(function(db) assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {upload_id})) end)
            if not ok then error(err) end
        end)
    end)
end

local function immutable_file(uploads_to_clean, text)
    local id = uuid.v7()
    uploads_to_clean[#uploads_to_clean + 1] = id
    local checksum = assert(hash.sha256(text))
    assert(uploads.create(id, "test-user", #text, "text/plain", "app:uploads", "source.txt",
        "document", {}, "completed", checksum))
    local artifact = assert(artifacts.create_artifact({upload_id = id, kind = "markdown", role = "primary",
        mime_type = "text/plain", content = text, storage_id = "app:uploads"}))
    local blob = assert(artifacts.get_blob(artifact.blob_id))
    return {content_omitted = true, content_bytes = #text, content_sha256 = checksum,
        source_ref = {kind = "upload", upload_id = id, artifact_id = artifact.artifact_id}}, blob
end

local function ordinary_integrity()
    test.describe("ordinary KB10 immutable artifact integrity", function()
        for _, mode in ipairs({"length", "digest", "storage"}) do
            test.it("handles " .. mode .. " and the following immutable upload", function()
                local id, actor = uuid.v7(), uuid.v7()
                local model = "kb10-integrity-" .. id
                local uploads_to_clean = {}
                assert(models.upsert_card({name = model, provider_id = "app:checkpoint_model_provider", provider_model = model,
                    capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
                assert(store.create_store(id, model, {}))
                local member_threads = owner.create(actor, id)
                assert(member_threads:register_projection({
                    thread_id = id, kind = "knowledge.injection.source", projection_key = "source", cursor_key = "source",
                    worker_ref = "proc://kickside.kb10.injection:source_worker_proc", worker_input_mode = "prefetch_events",
                    events = {input = {{type = UPSERT}}},
                    worker_config = {materialization = {summary_model = false, chunk_enrichment_model = false}},
                }))
                local registered = in_db(function(db)
                    assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
                        model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]))
                    assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,1,0,0)", {model}))
                    append(db, id, "accepted", "1", {content = "Earlier accepted content"})
                    return assert(assert(db:query([[SELECT c.id AS cursor_id,c.job_id,c.projection_id
                        FROM kickside_projection_cursor c JOIN kickside_projection p ON p.id=c.projection_id
                        WHERE c.thread_id=$1 AND p.kind='knowledge.injection.source' AND c.cursor_key='source']], {id}))[1])
                end)
                local replacement = "Replacement " .. mode .. " file"
                local pending, blob = immutable_file(uploads_to_clean, replacement)
                local following = immutable_file(uploads_to_clean, "Following " .. mode .. " file")
                local function set_storage(storage_id)
                    in_db(function(db)
                        assert(db:execute("UPDATE kickside_upload_artifact_blobs SET storage_id=$1 WHERE blob_id=$2",
                            {storage_id, blob.blob_id}))
                    end)
                end
                local reopened = false
                local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
                local ok, err = pcall(function()
                    assert(jobs.nudge_workers())
                    local before = wait_state(registered, id, caught_up)
                    local accepted = before.roots[1]
                    test.eq(accepted.content, "Earlier accepted content")
                    local function accepted_tree()
                        return in_db(function(db)
                            local children = assert(db:query([[SELECT id,content FROM kb10_nodes
                                WHERE store_id=$1 AND parent_id=$2 ORDER BY id]], {id, accepted.id}))
                            local vectors = assert(db:query([[SELECT id,CAST(embedding AS TEXT) AS value FROM kb10_embeddings
                                WHERE store_id=$1 AND (parent_id=$2 OR node_id=$2) ORDER BY id]], {id, accepted.id}))
                            local keys = {}
                            for _, child in ipairs(children) do keys[#keys + 1] = child.id .. ":" .. child.content end
                            for _, vector in ipairs(vectors) do keys[#keys + 1] = vector.id .. ":" .. vector.value end
                            test.is_true(#children > 0 and #vectors > 0)
                            return table.concat(keys, "\n")
                        end)
                    end
                    local prior_tree = accepted_tree()
                    if mode == "storage" then
                        set_storage("app:unavailable_upload_storage")
                    else
                        local actual = mode == "length" and replacement .. "!" or string.rep("X", #replacement)
                        local storage = assert(fs.get(blob.storage_id))
                        assert(select(2, storage:writefile(blob.storage_path, actual)) == nil)
                        test.eq(assert(storage:readfile(blob.storage_path)), actual)
                    end
                    in_db(function(db)
                        append(db, id, "accepted", "2", pending)
                        append(db, id, "following", "1", following)
                    end)
                    local done = wait_state(registered, id, function(cursor)
                        return caught_up(cursor) or (cursor.status == "pending" and cursor.last_error ~= nil)
                    end)
                    if mode == "storage" then
                        test.is_false(caught_up(done.cursor))
                        test.not_nil(done.cursor.scheduled_at)
                        test.eq(tonumber(done.cursor.last_seq), tonumber(before.cursor.last_seq))
                        test.eq(#done.roots, 1)
                        test.is_nil(metadata(done.roots[1]).source_rejection)
                        test.eq(accepted_tree(), prior_tree)
                        set_storage(blob.storage_id)
                        reopened = true
                        done = wait_state(registered, id, caught_up)
                        test.eq(done.roots[1].content, replacement)
                    else
                        test.is_true(caught_up(done.cursor), assert(json.encode({
                            cursor = done.cursor, root_count = #done.roots, accepted = done.roots[1].content,
                        })))
                        test.eq(done.roots[1].content, accepted.content)
                        test.eq(accepted_tree(), prior_tree)
                        local rejected = metadata(done.roots[1]).source_rejection
                        test.eq(rejected.code, "artifact_" .. mode .. "_mismatch")
                        test.eq(rejected.kind, errors.INVALID)
                        test.eq(rejected.external_version, "2")
                    end
                    test.is_nil(done.cursor.last_error)
                    test.eq(#done.roots, 2)
                    test.eq(done.roots[1].id, accepted.id)
                    test.eq(done.roots[2].content, "Following " .. mode .. " file")
                end)
                process.terminate(scheduler)
                if mode == "storage" and not reopened then set_storage(blob.storage_id) end
                in_db(function(db)
                    assert(projections.remove_projection(db, id, {projection_id = registered.projection_id}))
                    assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", {model}))
                    assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {id}))
                    assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
                    owner.cleanup(db, actor, id)
                end)
                assert(store.delete_store(id))
                assert(models.delete_card(model))
                for _, upload_id in ipairs(uploads_to_clean) do
                    assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
                    in_db(function(db) assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {upload_id})) end)
                end
                if not ok then error(err) end
            end)
        end
    end)
end


local function capture_placements(listener)
    local received = {}
    local timeout = time.after("150ms")
    while true do
        local selected = channel.select({listener:case_receive(), timeout:case_receive()})
        if selected.channel == timeout then return received end
        received[#received + 1] = selected.value:payload():data()
    end
end

local function finalizers(id, registration, expected, target_seq, source_seq)
    return in_db(function(db)
        local rows = assert(db:query([[SELECT type,body,external_source,external_id,external_version
            FROM kickside_event WHERE thread_id=$1 AND type IN ($2,$3) ORDER BY seq]], {id, DIGEST, TREAT}))
        test.eq(#rows, expected * 2, "one digest/treatment pair per completed source boundary")
        local seen = {}
        for _, row in ipairs(rows) do
            local body = type(row.body) == "table" and row.body or assert(json.decode(row.body))
            test.eq(body.kb_id, id)
            test.eq(body.reason, "source_complete")
            test.eq(body.source_thread_id, id)
            test.eq(body.source_projection_id, registration.projection_id)
            test.eq(row.external_source, "knowledge.source.finalizer")
            test.eq(row.external_version, "v1")
            local prefix = row.type == DIGEST and "digest-request" or "treatment-request"
            local expected_id = table.concat({prefix, id, registration.projection_id, body.source_target_seq}, ":")
            test.eq(row.external_id, expected_id)
            test.is_nil(seen[row.external_id], "finalizer identity repeated")
            seen[row.external_id] = true
        end
        if target_seq then
            for i = #rows - 1, #rows do
                local body = type(rows[i].body) == "table" and rows[i].body or assert(json.decode(rows[i].body))
                test.eq(body.source_target_seq, target_seq)
                test.eq(body.source_to_seq, source_seq)
            end
        end
    end)
end

local function assert_placement(received, id, document_node_id)
    test.eq(#received, 1)
    test.eq(received[1].store_id, id)
    test.eq(received[1].component_id, id)
    test.eq(received[1].document_node_id, document_node_id)
    test.not_nil(received[1].execution_identity)
end

local function finalizer_case(mode)
    local id, actor = uuid.v7(), uuid.v7()
    local empty_sources = mode == "only-empty" and 2 or (mode == "empty-tail" and 1 or 0)
    local model = "kb170-finalizer-" .. id
    assert(models.upsert_card({name = model, provider_id = "app:checkpoint_model_provider", provider_model = model,
        capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
    in_db(function(db)
        assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
            model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]))
        assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,$2,0,0)",
            {model, mode == "retry" and 0 or 1}))
        assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_finalizer_empty_source (
            id TEXT PRIMARY KEY, calls INTEGER NOT NULL)]]))
        assert(db:execute("INSERT INTO kb10_finalizer_empty_source (id,calls) VALUES ($1,0)", {id}))
    end)
    assert(store.create_store(id, model, {}, {kb_type = "wiki", is_graph = true, name = "Finalizer fixture"}))
    local member_threads = owner.create(actor, id)
    assert(member_threads:register_projection({
        thread_id = id, kind = "knowledge.injection.source", projection_key = "source", cursor_key = "source",
        worker_ref = "proc://kickside.kb10.injection:source_worker_proc", worker_input_mode = "prefetch_events",
        events = {input = {{type = UPSERT}, {type = DELETE}, {type = EMPTY}}},
        worker_config = {materialization = {summary_model = false, chunk_enrichment_model = false}},
    }))
    local registered = in_db(function(db)
        if mode ~= "only-empty" then append(db, id, "a", "1", {content = "Earlier good revision"}) end
        for sequence = 1, empty_sources do
            assert(threads.append_system(db, id, {{type = EMPTY, role = "system",
                body_json = assert(json.encode({kb_id = id})),
                external = {external_source = "fixture.empty", external_id = tostring(sequence), external_version = "1"}}}))
        end
        if mode == "filtered-tail" then
            assert(threads.append_system(db, id, {{type = "app:conflict_page", role = "system",
                body_json = assert(json.encode({page_id = "skipped", title = "Skipped", text = "Filtered source"}))}}))
        end
        if mode == "retry" then append(db, id, "a", "2", {content = "queued replacement"}) end
        local row = assert(assert(db:query([[SELECT c.id AS cursor_id,c.job_id,c.projection_id
            FROM kickside_projection_cursor c JOIN kickside_projection p ON p.id=c.projection_id
            WHERE c.thread_id=$1 AND p.kind='knowledge.injection.source' AND c.cursor_key='source']], {id}))[1])
        local provider = assert(db:query("SELECT calls FROM kb10_checkpoint_model WHERE model=$1", {model}))
        row.initial_embed_calls = assert(tonumber(provider[1].calls))
        return row
    end)
    local listener = process.listen(enrichment_consts.TOPIC, {message = true})
    local registration, register_err = process.registry.register(enrichment_consts.PROCESS, nil, process.registry.CONSISTENT)
    assert(registration, tostring(register_err))
    local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
    local ok, err = pcall(function()
        assert(jobs.nudge_workers())
        if mode == "retry" then
            local held = wait_state(registered, id, function(cursor)
                return cursor.status == "pending" and tonumber(cursor.attempts) > 0
            end)
            test.eq(tonumber(held.cursor.last_seq), 1)
            test.eq(#held.roots, 1)
            local first_id = held.roots[1].id
            assert_placement(capture_placements(listener), id, first_id)
            finalizers(id, registered, 0)
            in_db(function(db)
                assert(db:execute("UPDATE kb10_checkpoint_model SET online=1 WHERE model=$1", {model}))
            end)
            local done = wait_state(registered, id, caught_up)
            test.eq(#done.roots, 1)
            test.eq(done.roots[1].id, first_id)
            test.eq(done.roots[1].content, "queued replacement")
            assert_placement(capture_placements(listener), id, first_id)
            finalizers(id, registered, 1, tonumber(held.cursor.event_count), 2)
            in_db(function(db)
                local duplicate = assert(threads.append_system(db, id, {{type = UPSERT, role = "user",
                    body_json = assert(json.encode({kb_id=id, content="queued replacement"})),
                    external={external_source="knowledge.kb", external_id="a", external_version="2"}}}))
                test.eq(tonumber(duplicate.inserted), 0)
            end)
            test.eq(#capture_placements(listener), 0)
            finalizers(id, registered, 1)
        else
            local done = wait_state(registered, id, caught_up)
            local received = capture_placements(listener)
            test.is_nil(done.cursor.last_error)
            in_db(function(db)
                local rows = assert(db:query("SELECT calls FROM kb10_finalizer_empty_source WHERE id=$1", {id}))
                test.eq(tonumber(rows[1].calls), empty_sources, "empty source extractor calls")
                local productive = mode == "only-empty" and 0 or 1
                local provider = assert(db:query("SELECT calls FROM kb10_checkpoint_model WHERE model=$1", {model}))
                local calls = assert(tonumber(provider[1].calls))
                test.eq(calls - registered.initial_embed_calls, productive, "one embedding call per indexed source")
                test.eq(#outputs(db, id).graph, productive, "one graph change per indexed source")
            end)
            if mode == "only-empty" then
                test.eq(#done.roots, 0)
                test.eq(#received, 0)
                finalizers(id, registered, 0)
            else
                test.eq(#done.roots, 1)
                assert_placement(received, id, done.roots[1].id)
                local target_seq = mode == "delete" and 1 or 2
                local source_seq = mode == "empty-tail" and 2 or 1
                finalizers(id, registered, 1, target_seq, source_seq)
                if mode == "delete" then
                    local seq = in_db(function(db) return delete(db, id, "system", "a", done.roots[1].id) end)
                    assert(jobs.nudge_workers())
                    local deleted = wait_state(registered, id, caught_up)
                    test.eq(#deleted.roots, 0)
                    test.eq(#capture_placements(listener), 0)
                    finalizers(id, registered, 2, seq, seq)
                end
            end
        end
    end)
    process.terminate(scheduler)
    process.unlisten(listener)
    process.registry.unregister(enrichment_consts.PROCESS)
    in_db(function(db)
        assert(projections.remove_projection(db, id, {projection_id = registered.projection_id}))
        assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", {model}))
        assert(db:execute("DELETE FROM kb10_finalizer_empty_source WHERE id=$1", {id}))
        assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {id}))
        assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
        owner.cleanup(db, actor, id)
    end)
    assert(store.delete_store(id))
    assert(models.delete_card(model))
    if not ok then error(err) end
end

local function define_finalizer_tests()
    test.describe("ordinary published KB10 source completion", function()
        for _, mode in ipairs({"only-empty", "empty-tail", "filtered-tail", "delete", "retry"}) do
            test.it("finalizer and placement uniqueness: " .. mode, function() finalizer_case(mode) end)
        end
    end)
end

return {
    finalizer_edges = test.run_cases(define_finalizer_tests),
    run = test.run_cases(function() scenario(false) end),
    ordinary = test.run_cases(function()
        scenario(true)
        ordinary_integrity()
    end),
}
