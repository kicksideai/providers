-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local claim = require("claim")
local clock = require("clock")
local json = require("json")
local jobs = require("jobs")
local models = require("models")
local ops = require("ops")
local process = require("process")
local projections = require("projections")
local source_repair = require("source_repair")
local sql = require("sql")
local store = require("store")
local test = require("test")
local threads = require("threads")
local time = require("time")
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

local function read_state(db, registration, id)
    return {
        cursor = assert(db:query([[SELECT c.status AS cursor_status,c.last_seq,c.last_error,p.state AS projection_state,
            j.attempts,j.status,j.scheduled_at,t.event_count FROM kickside_projection_cursor c
            JOIN kickside_projection p ON p.id=c.projection_id
            JOIN kickside_job j ON j.id=c.job_id JOIN kickside_thread t ON t.id=c.thread_id WHERE c.id=$1]],
            {registration.cursor_id}))[1],
        roots = assert(db:query([[SELECT id,content FROM kb10_nodes
            WHERE store_id=$1 AND node_type='document' ORDER BY external_id]], {id})),
    }
end

local function wait_state(registration, id, accepts)
    local deadline = time.now():add("30s")
    local state
    repeat
        state = in_db(function(db) return read_state(db, registration, id) end)
        if accepts(state.cursor) then return state end
        time.sleep("25ms")
    until time.now():after(deadline)
    error("KB10 source projection did not reach expected state: " .. assert(json.encode(state.cursor)))
end

local function append(db, id, external_id, content)
    assert(threads.append_system(db, id, {{
        type = UPSERT, role = "user", body_json = assert(json.encode({kb_id = id, content = content})),
        external = {external_source = "knowledge.kb", external_id = external_id, external_version = "1"},
    }}))
end

local function define_tests()
    test.describe("KB10 source worker with a rejecting embedding provider", function()
        test.it("keeps the source projection active and indexes once the provider accepts", function()
            local id, actor = uuid.v7(), uuid.v7()
            local model = "kb10-rejection-" .. id
            assert(models.upsert_card({name = model, provider_id = "app:checkpoint_model_provider", provider_model = model,
                capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
            assert(store.create_store(id, model, {}))
            local registered = in_db(function(db)
                assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
                    model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]))
                assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,-1,0,0)", {model}))
                assert(db:execute("INSERT INTO app_users (user_id,email,password_hash) VALUES ($1,$2,'!fixture')",
                    {actor, actor .. "@test.invalid"}))
                assert(db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,'app:user')", {actor}))
                assert(db:execute([[INSERT INTO kickside_components (component_id,impl_id,private_context)
                    VALUES ($1,'kickside.kb10:embeddable','{}')]], {id}))
                assert(db:execute([[INSERT INTO kickside_component_access
                    (access_id,subject_type,subject_id,component_id,source_component_id,access_mask)
                    VALUES ($1,'user',$2,$3,$4,15)]], {uuid.v7(), actor, id, id}))
                local identity = {version = 2, principal = {kind = "user", id = actor}, authorized_by = {kind = "user", id = actor},
                    component_id = id, captured_at = time.now():utc():format(time.RFC3339)}
                assert(db:execute([[INSERT INTO kickside_thread (id,thread_class,component_id)
                    VALUES ($1,'kickside.knowledge.injection',$2)]], {id, id}))
                append(db, id, "note", "Plain text note uploaded while the provider key is wrong")
                return assert(projections.register_projection(db, id, {
                    kind = "knowledge.injection.source", worker_input_mode = "prefetch_events", execution_identity = identity,
                    worker_ref = "proc://kickside.kb10.injection:source_worker_proc",
                    events = {input = {{type = UPSERT}, {type = DELETE}}},
                    worker_config = {materialization = {summary_model = false, chunk_enrichment_model = false}},
                }))
            end)
            local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
            local ok, err = pcall(function()
                assert(jobs.nudge_workers())
                local rejected = wait_state(registered, id, function(cursor)
                    return tonumber(cursor.attempts) > 0 and cursor.last_error ~= nil
                end)
                test.eq(rejected.cursor.cursor_status, "active")
                test.is_true(rejected.cursor.projection_state ~= "invalid")
                test.contains(rejected.cursor.last_error, "fixture model provider rejects the API key")
                test.eq(tonumber(rejected.cursor.last_seq), 0)
                test.eq(#rejected.roots, 0)

                in_db(function(db)
                    assert(db:execute("UPDATE kb10_checkpoint_model SET online=1 WHERE model=$1", {model}))
                end)
                assert(jobs.nudge_workers())
                local done = wait_state(registered, id, function(cursor)
                    return tonumber(cursor.last_seq) == tonumber(cursor.event_count)
                end)
                test.eq(done.cursor.cursor_status, "active")
                test.eq(#done.roots, 1)
                test.contains(done.roots[1].content, "Plain text note")
            end)
            process.terminate(scheduler)
            in_db(function(db)
                assert(projections.remove_projection(db, id, {projection_id = registered.projection_id}))
                assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", {model}))
                assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {id}))
                assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
                assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id}))
                assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
                assert(db:execute("DELETE FROM app_user_groups WHERE user_id=$1", {actor}))
                assert(db:execute("DELETE FROM app_users WHERE user_id=$1", {actor}))
            end)
            assert(store.delete_store(id))
            assert(models.delete_card(model))
            if not ok then error(err) end
        end)

        test.it("classifies provider rejections apart from other projection failures", function()
            for _, message in ipairs({"OpenAI API key is required", "401 Unauthorized", "model_not_found",
                "You exceeded your current quota", "Permission denied by the embedding provider",
                "No models found for class: embed"}) do
                test.is_true(source_repair.is_provider_rejection(message), message)
            end
            for _, message in ipairs({"invalid selected document delete", "thread_id is required", "", nil}) do
                test.is_false(source_repair.is_provider_rejection(message), tostring(message))
            end
        end)

        -- Releases before the retryable provider failure handed the provider
        -- error to Core with its own kind, and Core invalidated the projection.
        local function legacy_invalidate(registration, thread_id, failure)
            local db = assert(sql.get("app:db"))
            local dialect = assert(db:type())
            local tx = assert(db:begin())
            local token = uuid.v7()
            local leased = assert(claim.lease_row(tx, dialect, registration.job_id, token,
                clock.format(time.now():add("1m"), dialect), clock.now(dialect)))
            assert(select(2, tx:commit()) == nil)
            local current = assert(db:query([[SELECT c.*, p.body FROM kickside_projection_cursor c
                JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]], {registration.cursor_id}))[1]
            db:release()
            current.body = type(current.body) == "table" and current.body or assert(json.decode(current.body))
            local job = {id = registration.job_id, lease_token = token, execution_seq = tonumber(leased.execution_seq)}
            assert(apply.fail(ops.db_id(), job, current, failure, true))
            local state = in_db(function(db2) return read_state(db2, registration, thread_id) end)
            test.eq(state.cursor.cursor_status, "invalid")
            test.eq(state.cursor.projection_state, "invalid")
        end

        test.it("resumes a source projection an earlier release invalidated on a provider rejection", function()
            local ids = {}
            local registrations = {}
            local actor = uuid.v7()
            local model = "kb10-repair-" .. actor
            assert(models.upsert_card({name = model, provider_id = "app:checkpoint_model_provider", provider_model = model,
                capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
            in_db(function(db)
                assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
                    model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]))
                assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,1,0,0)", {model}))
                assert(db:execute("INSERT INTO app_users (user_id,email,password_hash) VALUES ($1,$2,'!fixture')",
                    {actor, actor .. "@test.invalid"}))
                assert(db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,'app:user')", {actor}))
            end)
            for index = 1, 2 do
                local id = uuid.v7()
                ids[index] = id
                assert(store.create_store(id, model, {}))
                registrations[index] = in_db(function(db)
                    assert(db:execute([[INSERT INTO kickside_components (component_id,impl_id,private_context)
                        VALUES ($1,'kickside.kb10:embeddable','{}')]], {id}))
                    assert(db:execute([[INSERT INTO kickside_component_access
                        (access_id,subject_type,subject_id,component_id,source_component_id,access_mask)
                        VALUES ($1,'user',$2,$3,$4,15)]], {uuid.v7(), actor, id, id}))
                    assert(db:execute([[INSERT INTO kickside_thread (id,thread_class,component_id)
                        VALUES ($1,'kickside.knowledge.injection',$2)]], {id, id}))
                    append(db, id, "note", "Spreadsheet export uploaded before the provider key was fixed")
                    local identity = {version = 2, principal = {kind = "user", id = actor},
                        authorized_by = {kind = "user", id = actor}, component_id = id,
                        captured_at = time.now():utc():format(time.RFC3339)}
                    return assert(projections.register_projection(db, id, {
                        kind = "knowledge.injection.source", worker_input_mode = "prefetch_events",
                        execution_identity = identity,
                        worker_ref = "proc://kickside.kb10.injection:source_worker_proc",
                        events = {input = {{type = UPSERT}, {type = DELETE}}},
                        worker_config = {materialization = {summary_model = false, chunk_enrichment_model = false}},
                    }))
                end)
            end
            legacy_invalidate(registrations[1], ids[1], errors.new({kind = errors.PERMISSION_DENIED,
                retryable = false, message = "OpenAI API key is required"}))
            legacy_invalidate(registrations[2], ids[2], errors.new({kind = errors.INVALID,
                retryable = false, message = "invalid selected document delete"}))

            local report = in_db(function(db) return assert(source_repair.repair(db)) end)
            test.eq(#report.failed, 0)
            local repaired = {}
            for _, cursor_id in ipairs(report.repaired) do repaired[tostring(cursor_id)] = true end
            test.is_true(repaired[tostring(registrations[1].cursor_id)] == true)
            test.is_nil(repaired[tostring(registrations[2].cursor_id)])

            local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
            local ok, err = pcall(function()
                assert(jobs.nudge_workers())
                local done = wait_state(registrations[1], ids[1], function(cursor)
                    return tonumber(cursor.last_seq) == tonumber(cursor.event_count)
                end)
                test.eq(done.cursor.cursor_status, "active")
                test.eq(#done.roots, 1)
                test.contains(done.roots[1].content, "Spreadsheet export")
                local kept = in_db(function(db) return read_state(db, registrations[2], ids[2]) end)
                test.eq(kept.cursor.cursor_status, "invalid")
                test.eq(#kept.roots, 0)
                local again = in_db(function(db) return assert(source_repair.repair(db)) end)
                test.eq(#again.repaired, 0)
            end)
            process.terminate(scheduler)
            in_db(function(db)
                for index, id in ipairs(ids) do
                    assert(projections.remove_projection(db, id, {projection_id = registrations[index].projection_id}))
                    assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {id}))
                    assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
                    assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id}))
                    assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
                end
                assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", {model}))
                assert(db:execute("DELETE FROM app_user_groups WHERE user_id=$1", {actor}))
                assert(db:execute("DELETE FROM app_users WHERE user_id=$1", {actor}))
            end)
            for _, id in ipairs(ids) do assert(store.delete_store(id)) end
            assert(models.delete_card(model))
            if not ok then error(err) end
        end)
    end)
end

return {run = test.run_cases(define_tests)}
