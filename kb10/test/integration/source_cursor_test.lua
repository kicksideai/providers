-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local store = require("store")
local meta_projection = require("meta_projection")
local models = require("models")
local invoke = require("invoke")
local projections = require("projections")
local claim = require("claim")
local lifecycle = require("lifecycle")
local jobs = require("jobs")
local job_types = require("job_types")

local UPSERT = "kickside.knowledge.events:content.upserted"
local JOB_TYPE = "kickside.core.projections:advance"
local SOURCE_WORKER = "proc://kickside.kb10.injection:source_worker_proc"

local function query(statement, args)
    local db = assert(sql.get("app:db"))
    local rows, err = db:query(statement, args)
    assert(select(2, db:release()) == nil)
    assert(rows, tostring(err))
    return rows
end

local function cursor(fixture)
    return query([[SELECT c.last_seq,c.status,c.last_error,p.body FROM kickside_projection_cursor c
        JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]], { fixture.cursor_id })[1]
end

local function append(fixture, contents)
    local db = assert(sql.get("app:db"))
    local tx = assert(db:begin())
    local rows = assert(tx:query("SELECT event_count FROM kickside_thread WHERE id=$1", { fixture.thread }))
    local head = assert(tonumber(rows[1].event_count))
    for i, content in ipairs(contents) do
        local seq = head + i
        local body = assert(json.encode({ kb_id = fixture.thread, content = content }))
        assert(tx:execute([[INSERT INTO kickside_event
            (id,thread_id,type,role,body,seq,external_source,external_id,external_version)
            VALUES ($1,$2,$3,'user',$4,$5,'upload',$6,'1')]],
            { uuid.v7(), fixture.thread, UPSERT, body, seq, "document-" .. tostring(seq) }))
    end
    assert(tx:execute("UPDATE kickside_thread SET event_count=$1 WHERE id=$2", { head + #contents, fixture.thread }))
    assert(jobs.wake_tx(tx, "thread:" .. fixture.thread))
    assert(select(2, tx:commit()) == nil)
    assert(select(2, db:release()) == nil)
    return head + #contents
end

local function attempt(fixture)
    local db = assert(sql.get("app:db"))
    local dbtype = tostring(db:type())
    assert(db:execute("UPDATE kickside_job SET scheduled_at=created_at WHERE id=$1 AND status='pending'",
        { fixture.job_id }))
    local claimed = assert(claim.claim_batch(db, dbtype, 16, nil, nil, nil, { JOB_TYPE }))
    assert(select(2, db:release()) == nil)
    local job
    for _, entry in ipairs(claimed) do
        if entry.id == fixture.job_id then job = entry end
    end
    assert(job, "source projection slot was not claimed")
    local output, err = invoke.run({ job = job, payload = { cursor_id = fixture.cursor_id } })
    if err then
        db = assert(sql.get("app:db"))
        local failure_class = job_types.is_deterministic_kind(err:kind()) and "deterministic" or "infrastructure"
        local persist_err = lifecycle.fail_job(db, job, dbtype, tostring(err), failure_class)
        assert(select(2, db:release()) == nil)
        assert(persist_err == nil, tostring(persist_err))
    end
    return output, err
end

local function set_model(name, provider_model)
    local _, err = models.upsert_card({ name = name, provider_id = "app.analysis:provider",
        provider_model = provider_model, capabilities = { "embed" }, dimensions = 512, max_tokens = 4096 })
    assert(err == nil, tostring(err))
end

local function with_source(modes, config, check)
    local targets, model_names = {}, {}
    for i, mode in ipairs(modes) do
        targets[i] = uuid.v7()
        model_names[i] = "source-cursor-" .. targets[i]
        set_model(model_names[i], mode)
        assert(store.create_store(targets[i], model_names[i], {}, { kb_type = "document" }))
    end

    local db = assert(sql.get("app:db"))
    local thread = targets[1]
    assert(db:execute("INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)", { thread, thread }))
    config.target_kb_ids = targets
    local registered = assert(projections.register_projection(db, thread, {
        kind = "knowledge.injection.source", worker_ref = SOURCE_WORKER,
        worker_input_mode = "prefetch_events", worker_config = config, system_identity = true,
        events = { input = { { type = UPSERT } } },
    }))
    assert(select(2, db:release()) == nil)
    registered.thread = thread
    local ok, failure = pcall(check, registered, targets, model_names)
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
    return query("SELECT id,content FROM kb10_nodes WHERE store_id=$1 AND node_type='document' ORDER BY content", { kb_id })
end

local function source_count(fixture, kb_id)
    local events = query("SELECT seq,type,body,created_at FROM kickside_event WHERE thread_id=$1 ORDER BY seq", { fixture.thread })
    local count
    local result, err = meta_projection.run({
        worker_config = { target_kb_ids = { kb_id } },
        events = events,
        component = { set_meta = function(_, meta) count = meta.document_count; return true end },
    })
    test.is_nil(err)
    test.not_nil(result)
    return count
end

local function recover(fixture, targets, head, expected)
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

local function define_tests()
    test.describe("source projection availability", function()
        test.it("holds the cursor through four failures and materializes the same events on recovery", function()
            with_source({ "source-unavailable" }, {}, function(fixture, targets, names)
                local head = append(fixture, { "First document", "Second document", "Third document" })
                for _ = 1, 4 do
                    local output, err = attempt(fixture)
                    local row = cursor(fixture)
                    test.eq(#documents(targets[1]), 0)
                    test.eq(tonumber(row.last_seq), 0, "unavailable embedding must hold the cursor")
                    test.eq(row.status, "active")
                    test.contains(tostring(row.last_error), "embedding backend unavailable")
                    test.is_nil(output)
                    test.eq(err:kind(), errors.UNAVAILABLE)
                    test.is_true(err:retryable())
                    local job = query("SELECT status,scheduled_at FROM kickside_job WHERE id=$1", { fixture.job_id })[1]
                    test.eq(job.status, "pending")
                    test.not_nil(job.scheduled_at)
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

        test.it("dead-letters a deterministic batch once and ingests later events", function()
            with_source({ "available" }, { max_pending_documents = 1 }, function(fixture, targets)
                local head = append(fixture, { "First document", "Second document" })
                local _, err = attempt(fixture)
                test.is_nil(err, tostring(err))
                local row = cursor(fixture)
                test.eq(tonumber(row.last_seq), head)
                local body = assert(json.decode(row.body))
                test.eq(body.last_status, "dead_lettered")
                test.eq(#body.dead_lettered_batches, 1)
                test.eq(#documents(targets[1]), 0)
                recover(fixture, targets, append(fixture, { "Later document" }), 1)
                test.eq(#assert(json.decode(cursor(fixture).body)).dead_lettered_batches, 1)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
