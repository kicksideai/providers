-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local claim = require("claim")
local clock = require("clock")
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
local tabular = require("tabular")
local time = require("time")
local uploads = require("uploads")
local uuid = require("uuid")

local UPSERT = "kickside.knowledge.events:content.upserted"
local DELETE = "kickside.knowledge.events:content.deleted"
local GRAPH = "kickside.knowledge.events:graph.changed"
local DIGEST = "kickside.knowledge.events:digest.requested"
local TREAT = "kickside.knowledge.events:treatment.requested"

local function in_db(check)
    local db = assert(sql.get("app:db"))
    local ok, result = pcall(check, db)
    db:release()
    if not ok then error(result) end
    return result
end

local function seed_abandoned_page(db, store_id)
    local abandoned = uuid.v7()
    assert(db:execute([[INSERT INTO kb10_source_preparations
        (store_id,cursor_id,generation,event_id,content,source,progress)
        VALUES ($1,$2,1,$3,'orphaned input','{}','{}')]], {store_id, abandoned, uuid.v7()}))
    assert(db:execute([[INSERT INTO kb10_source_preparation_rows
        (store_id,cursor_id,ordinal,content,metadata) VALUES ($1,$2,0,'orphaned child','{}')]], {store_id, abandoned}))
end

local function assert_no_preparation(db, store_id)
    for _, name in ipairs({"kb10_source_preparations", "kb10_source_preparation_rows"}) do
        local rows = assert(db:query("SELECT count(*) AS n FROM " .. name .. " WHERE store_id=$1", {store_id}))
        test.eq(tonumber(rows[1].n), 0)
    end
end

local function read_store(db, registration, id)
    return {
        cursor = assert(db:query([[SELECT c.last_seq,c.last_error,j.attempts,j.status,j.scheduled_at,t.event_count,
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
                test.eq(done.roots[3].content, "Later good document")

                in_db(function(db)
                    local published = outputs(db, id)
                    test.eq(#published.graph, 5)
                    test.eq(#published.digest, 1)
                    test.eq(#published.treatment, 1)
                    test.eq(published.digest[1].source_target_seq, published.graph[5].source_to_seq)
                    test.eq(published.treatment[1].source_target_seq, published.graph[5].source_to_seq)
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
                    test.eq(tonumber(provider.calls), 4)
                    test.eq(tonumber(provider.failures), 1)
                    local runs = assert(db:query("SELECT status FROM kickside_job_run WHERE job_id=$1 ORDER BY execution_seq",
                        {registered.job_id}))
                    test.eq(#runs, 3)
                    test.eq(runs[1].status, "failed")
                    test.eq(runs[2].status, "completed")
                    test.eq(runs[3].status, "completed")
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
            end)
            assert(store.delete_store(id))
            assert(models.delete_card(model))
            assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
            in_db(function(db) assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {upload_id})) end)
            if not ok then error(err) end
        end)
            test.it("resumes sheet parsing and embeddings on the same registered slot across process exits", function()
                local id, upload_id = uuid.v7(), uuid.v7()
                local model = "kb10-sheet-" .. id
                assert(
                    models.upsert_card({
                        name = model,
                        provider_id = "app:checkpoint_model_provider",
                        provider_model = model,
                        capabilities = { "embed" },
                        dimensions = 512,
                        max_tokens = 4096,
                    })
                )
                assert(store.create_store(id, model, {}))
                local csv = { "sku,description" }
                for i = 1, 192 do
                    csv[#csv + 1] = ("sku%d,"):format(i)
                        .. (i == 125 and "queued replacement " or "")
                        .. string.rep("detail ", 19)
                end
                local content = table.concat(csv, "\n")
                local expected, expected_meta = tabular.chunk_document({ content = content, title = "catalog.csv" }, 200)
                assert(expected and expected_meta)
                assert(
                    uploads.create(
                        upload_id,
                        "test-user",
                        #content,
                        "text/csv",
                        "app:uploads",
                        "catalog.csv",
                        "document",
                        {},
                        "completed",
                        "fixture"
                    )
                )
                local artifact = assert(
                    artifacts.create_artifact({
                        upload_id = upload_id,
                        kind = "text",
                        role = "primary",
                        mime_type = "text/csv",
                        content = content,
                        storage_id = "app:uploads",
                    })
                )
                local blob = assert(artifacts.get_blob(artifact.blob_id))
                local registration, job, cursor, event
                in_db(function(db)
                    assert(
                        db:execute(
                            [[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
                    model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]
                        )
                    )
                    assert(db:execute("INSERT INTO kb10_checkpoint_model VALUES ($1,0,0,0)", { model }))
                    assert(
                        db:execute(
                            "INSERT INTO kickside_thread(id,thread_class,component_id) VALUES ($1,'test',$2)",
                            { id, id }
                        )
                    )
                    append(
                        db,
                        id,
                        "catalog",
                        "1",
                        {
                            content_omitted = true,
                            content_bytes = #content,
                            content_sha256 = hash.sha256(content),
                            title = "catalog.csv",
                            content_type = "text/csv",
                            source_ref = { kind = "upload", upload_id = upload_id, artifact_id = artifact.artifact_id },
                        }
                    )
                    registration = assert(projections.register_projection(db, id, {
                        kind = "knowledge.injection.source",
                        worker_input_mode = "prefetch_events",
                        system_identity = true,
                        worker_ref = "proc://kickside.kb10.injection:checkpoint_source_worker",
                        events = { input = { { type = UPSERT } } },
                        worker_config = {
                            materialization = {
                                chunk_size = 200,
                                chunk_overlap = 0,
                                summary_model = false,
                                chunk_enrichment_model = false,
                            },
                        },
                    }))
                    seed_abandoned_page(db, id)
                    local dialect = assert(db:type())
                    local token = uuid.v7()
                    local tx = assert(db:begin())
                    local leased = assert(
                        claim.lease_row(
                            tx,
                            dialect,
                            registration.job_id,
                            token,
                            clock.format(time.now():add("1m"), dialect),
                            clock.now(dialect)
                        )
                    )
                    assert(select(2, tx:commit()) == nil)
                    job = { id = registration.job_id, lease_token = token, execution_seq = tonumber(leased.execution_seq) }
                    cursor = assert(db:query(
                        [[SELECT c.*,p.body FROM kickside_projection_cursor c JOIN kickside_projection p
                    ON p.id=c.projection_id WHERE c.id=$1]],
                        { registration.cursor_id }
                    ))[1]
                    event = assert(
                        db:query(
                            [[SELECT id,seq,type,body,external_source,external_id,external_version FROM kickside_event
                    WHERE thread_id=$1 AND seq=1]],
                            { id }
                        )
                    )[1]
                    for _, value in ipairs({ cursor, event }) do
                        if type(value.body) == "string" then value.body = assert(json.decode(value.body)) end
                    end
                end)
                local scheduler
                local ok, err = pcall(function()
                    local exits = process.events()
                    local pid =
                        assert(process.spawn_monitored("kickside.kb10.injection:checkpoint_source_worker", "app:processes", {
                            checkpoint = { job = job, cursor = cursor, prefetched_last = 1 },
                            events = { event },
                            execution_deadline_ns = time.now():unix_nano() + 500000000,
                        }))
                    local overdue = time.after("10s")
                    while true do
                        local selected = channel.select({ exits:case_receive(), overdue:case_receive() })
                        test.eq(selected.channel, exits)
                        if tostring(selected.value.from) == tostring(pid) then
                            test.is_nil(selected.value.result.error)
                            test.is_true(
                                selected.value.result.value.checkpointed,
                                tostring(selected.value.result.value.error_native)
                            )
                            break
                        end
                    end
                    in_db(function(db)
                        local pos = assert(
                            db:query(
                                "SELECT last_seq,continuation FROM kickside_projection_cursor WHERE id=$1",
                                { cursor.id }
                            )
                        )[1]
                        test.eq(tonumber(pos.last_seq), 0)
                        test.is_true(#pos.continuation > 0)
                        cursor.last_seq, cursor.continuation = pos.last_seq, pos.continuation
                        local partial = assert(db:query(
                            [[SELECT count(*) AS n FROM kb10_source_preparation_rows
                        WHERE store_id=$1 AND embedding IS NULL]],
                            { id }
                        ))[1]
                        test.eq(tonumber(partial.n), 65)
                        test.eq(#read_store(db, registration, id).roots, 0)
                    end)
                    assert(apply.finish_checkpointed("app:db", job, cursor, 0))
                    assert(assert(fs.get(blob.storage_id)):remove(blob.storage_path))
                    scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
                    assert(jobs.nudge_workers())
                    local outage = wait_state(
                        registration,
                        id,
                        function(c) return c.status == "pending" and tonumber(c.attempts) > 0 end
                    )
                    test.eq(tonumber(outage.cursor.last_seq), 0)
                    test.eq(#outage.roots, 0)
                    in_db(function(db)
                        local done = assert(
                            db:query(
                                "SELECT count(*) AS n FROM kb10_source_preparation_rows WHERE store_id=$1 AND embedding IS NOT NULL",
                                { id }
                            )
                        )[1]
                        test.eq(tonumber(done.n), 96, assert(json.encode(outage.cursor)))
                        test.eq(#outputs(db, id).graph, 0)
                        assert(db:execute("UPDATE kb10_checkpoint_model SET online=1 WHERE model=$1", { model }))
                    end)
                    local done = wait_state(registration, id, caught_up)
                    test.eq(#done.roots, 1)
                    test.eq(done.roots[1].content, content)
                    in_db(function(db)
                        local graph = outputs(db, id).graph
                        test.eq(#graph, 1)
                        test.eq(graph[1].chunk_delta, #expected)
                        local children = assert(
                            db:query(
                                "SELECT content,metadata FROM kb10_nodes WHERE store_id=$1 AND node_type='chunk'",
                                { id }
                            )
                        )
                        test.eq(#children, #expected)
                        for _, child in ipairs(children) do
                            local m = type(child.metadata) == "table" and child.metadata
                                or assert(json.decode(child.metadata))
                            local i = tonumber(m.chunk_index)
                            test.eq(child.content, expected[i])
                            test.eq(m.row_start, expected_meta[i].row_start)
                            test.eq(m.contextual_prefix, expected_meta[i].contextual_prefix)
                        end
                        test.eq(graph[1].summary_delta, 1)
                        local calls =
                            assert(db:query("SELECT calls,failures FROM kb10_checkpoint_model WHERE model=$1", { model }))[1]
                        test.eq(
                            assert(tonumber(calls.calls)) - assert(tonumber(calls.failures)),
                            math.ceil((#expected + 1) / 96)
                        )
                        assert_no_preparation(db, id)
                    end)
                end)
                if scheduler then process.terminate(scheduler) end
                in_db(function(db)
                    assert(projections.remove_projection(db, id, { projection_id = registration.projection_id }))
                    assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", { model }))
                    assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", { id }))
                    assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", { id }))
                end)
                in_db(function(db) seed_abandoned_page(db, id) end)
                assert(store.delete_store(id))
                in_db(function(db) assert_no_preparation(db, id) end)
                assert(models.delete_card(model))
                assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
                in_db(function(db) assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", { upload_id })) end)
                if not ok then error(err) end
            end)
    end)
end)}
