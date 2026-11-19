-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local jobs = require("jobs")
local models = require("models")
local process = require("process")
local projections = require("projections")
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
    end)
end

return {run = test.run_cases(define_tests)}
