local test = require("test")
local time = require("time")
local common = require("maintenance_fixture")
local contract = common.contract
local registry = common.registry
local security = common.security
local sql = common.sql
local kb10 = common.kb10
local fixtures = common.fixtures
local maintenance = common.maintenance
local worker = common.worker
local runs = common.runs
local schedule_resummarize = common.schedule_resummarize
local schedule_reembed = common.schedule_reembed
local maintenance_status = common.maintenance_status
local LIVE = common.LIVE
local db = common.db
local cleanup = common.cleanup
local kb_id = common.kb_id
local fake_jobs = common.fake_jobs
local fake_identity = common.fake_identity
local allowing_component = common.allowing_component
local denying_component = common.denying_component
local jobs_in_state = common.jobs_in_state
local install = common.install
local restore = common.restore
local seed_component = common.seed_component
local drop_component = common.drop_component
local run_count = common.run_count
local endpoint = common.endpoint

local test_identity_row = { actor_id = "actor-under-test", actor_context = "{}" }

local function define_tests()
    -- Every case above names the job state it means; this one proves the reader
    -- that produces those states really reaches the queue's own rows.
    test.describe("kb10 maintenance job state", function()
        test.it("reads the queue's own state for the job carrying a run", function()
            local id = kb_id()
            local d = db()
            test.is_nil(fixtures.seed_thread(d, id))
            local queued, enqueue_err = LIVE.jobs.enqueue({
                namespace = "kb10.maintenance", scope = id, key = "state-test",
                owner_locator = { kind = "user", id = "maintenance-test" },
                thread_id = id,
                job_type = "func://kickside.kb10.engine:maintenance_worker",
                concurrency_key = "kb10.maintenance:" .. id,
                immutable_payload = { kb_id = id },
                queue_tier = "maintenance",
                scheduled_at = time.now():utc():add(120 * time.SECOND):format(time.RFC3339),
                max_attempts = 1,
            })
            test.is_nil(enqueue_err, "enqueue: " .. tostring(enqueue_err))
            test.not_nil(queued)
            local job_id = (queued :: any).id

            local state, state_err = LIVE.job_status(id, "resummarize", tostring(job_id))
            test.is_nil(state_err, "job status: " .. tostring(state_err))
            test.eq("pending", state, "a queued job still owes its run")

            local unrelated, unrelated_err = LIVE.job_status(kb_id(), "resummarize", tostring(job_id))
            test.is_nil(unrelated_err)
            test.eq(maintenance.JOB_ABSENT, unrelated, "another KB cannot claim the job")

            local absent, absent_err = LIVE.job_status(id, "resummarize", fixtures.uuid())
            test.is_nil(absent_err, "job status: " .. tostring(absent_err))
            test.eq(maintenance.JOB_ABSENT, absent, "a job id the queue has no row for is absent")

            local _, delete_err = d:execute("DELETE FROM kickside_job WHERE thread_id = $1", { id })
            test.is_nil(delete_err, "cleanup job: " .. tostring(delete_err))
            test.is_nil(fixtures.drop_thread(d, id))
        end)
    end)

    test.describe("kb10 maintenance worker", function()
        test.it("re-admits the identity stored on the run before executing its verb", function()
            local id = kb_id()
            local run, create_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(create_err)

            local called = false
            worker._component = allowing_component()
            worker._verbs = {
                resummarize = function(): (any, string?)
                    called = true
                    return { total = 1, scanned = 1, resummarized = 1 }, nil
                end,
            }
            worker._identity = {
                from_row = function(actor_id: string, actor_context: string): (any, string?)
                    test.eq(test_identity_row.actor_id, actor_id)
                    test.eq(test_identity_row.actor_context, actor_context)
                    return { principal = actor_id }, nil
                end,
                run_as = function(identity: any, fn_id: string, value: any, opts: any): (any, string?)
                    test.eq(test_identity_row.actor_id, identity.principal)
                    test.eq("kickside.kb10.engine:maintenance_worker_authorized", fn_id)
                    test.eq("kickside.kb10.engine:maintenance_worker", opts.deferred_owner)
                    return worker.run_authorized(value), nil
                end,
            }

            local outcome = worker.run({ payload = { kb_id = id, run_id = (run :: any).id,
                run_type = "resummarize" } })
            test.is_true((outcome :: any).ok)
            test.is_true(called)
            cleanup(db(), id)
            restore()
        end)

        test.it("records the terminal counts of the run it carried out", function()
            local id = kb_id()
            local run, create_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(create_err, "create run: " .. tostring(create_err))

            worker._component = allowing_component()
            worker._verbs = {
                resummarize = function(_kb: string, _deps: any): (any, string?)
                    return { success = true, total = 3, scanned = 3, resummarized = 2,
                             documents_skipped = 1, chunks_reenriched = 7, chunks_failed = 1 }, nil
                end,
            }

            local outcome = worker.run_authorized({ payload = { kb_id = id, run_id = (run :: any).id,
                                                     run_type = "resummarize" } })
            test.is_true((outcome :: any).ok)
            test.eq("completed", (outcome :: any).outcome)

            local stored, read_err = runs.get((run :: any).id)
            test.is_nil(read_err, "read run: " .. tostring(read_err))
            test.eq("succeeded", (stored :: any).status)
            test.eq(3, (stored :: any).total)
            test.eq(2, (stored :: any).resummarized)
            test.eq(1, (stored :: any).documents_skipped)
            test.eq(7, (stored :: any).chunks_reenriched)
            test.eq(1, (stored :: any).chunks_failed)
            test.not_nil((stored :: any).started_at)
            test.not_nil((stored :: any).finished_at)
            test.is_nil((stored :: any).last_error)

            cleanup(db(), id)
            restore()
        end)

        test.it("stamps progress on the record while the verb walks the knowledge base", function()
            local id = kb_id()
            local run, create_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(create_err, "create run: " .. tostring(create_err))

            local seen_midway: any = nil
            worker._component = allowing_component()
            worker._verbs = {
                resummarize = function(_kb: string, deps: any): (any, string?)
                    local _, progress_err = deps.progress({ total = 700, scanned = 128, resummarized = 128 })
                    if progress_err then return nil, tostring(progress_err) end
                    seen_midway = runs.get((run :: any).id)
                    return { success = true, total = 700, scanned = 700, resummarized = 700 }, nil
                end,
            }

            local outcome = worker.run_authorized({ payload = { kb_id = id, run_id = (run :: any).id,
                                                     run_type = "resummarize" } })
            test.is_true((outcome :: any).ok)
            test.not_nil(seen_midway, "the record is readable while the run is in flight")
            test.eq("running", (seen_midway :: any).status)
            test.eq(700, (seen_midway :: any).total)
            test.eq(128, (seen_midway :: any).scanned)

            cleanup(db(), id)
            restore()
        end)

        test.it("records the reason a run failed and reports it to the queue", function()
            local id = kb_id()
            local run, create_err = runs.create(id, "reembed", test_identity_row)
            test.is_nil(create_err, "create run: " .. tostring(create_err))

            worker._component = allowing_component()
            worker._verbs = {
                reembed = function(_kb: string, _deps: any): (any, string?)
                    return nil, "kb has no embedding_model"
                end,
            }

            local outcome = worker.run_authorized({ payload = { kb_id = id, run_id = (run :: any).id,
                                                     run_type = "reembed" } })
            test.is_false((outcome :: any).ok)
            test.eq("kb has no embedding_model", (outcome :: any).job_error)

            local stored, read_err = runs.get((run :: any).id)
            test.is_nil(read_err, "read run: " .. tostring(read_err))
            test.eq("failed", (stored :: any).status)
            test.eq("kb has no embedding_model", (stored :: any).last_error)
            test.not_nil((stored :: any).finished_at)

            cleanup(db(), id)
            restore()
        end)

        -- A verb that walked the knowledge base and still reports a failure has
        -- not succeeded, however far it got. The record carries both: the
        -- counters it reached and the reason it is not a clean run.
        test.it("closes a run whose verb reported failures as failed, keeping its counters", function()
            local id = kb_id()
            local run, create_err = runs.create(id, "reembed", test_identity_row)
            test.is_nil(create_err, "create run: " .. tostring(create_err))

            local reason = "3 node embeddings could not be written"
            worker._component = allowing_component()
            worker._verbs = {
                reembed = function(_kb: string, _deps: any): (any, string?)
                    return { success = false, total = 40, scanned = 40, embedded = 37 }, reason
                end,
            }

            local outcome = worker.run_authorized({ payload = { kb_id = id, run_id = (run :: any).id,
                                                     run_type = "reembed" } })
            test.is_false((outcome :: any).ok)
            test.eq(reason, (outcome :: any).job_error)

            local stored, read_err = runs.get((run :: any).id)
            test.is_nil(read_err, "read run: " .. tostring(read_err))
            test.eq("failed", (stored :: any).status)
            test.eq(reason, (stored :: any).last_error)
            test.eq(40, (stored :: any).scanned, "the counters the run reached are kept")
            test.eq(37, (stored :: any).embedded)
            test.not_nil((stored :: any).finished_at)

            cleanup(db(), id)
            restore()
        end)

        -- The job path is reachable without an HTTP request, so the frozen
        -- identity is checked again here before the KB is rewritten.
        test.it("refuses a run whose frozen identity may not write the knowledge base", function()
            local id = kb_id()
            local run, create_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(create_err, "create run: " .. tostring(create_err))

            local ran = false
            worker._component = denying_component()
            worker._verbs = {
                resummarize = function(_kb: string, _deps: any): (any, string?)
                    ran = true
                    return { success = true }, nil
                end,
            }

            local outcome = worker.run_authorized({ payload = { kb_id = id, run_id = (run :: any).id,
                                                     run_type = "resummarize" } })
            test.is_false((outcome :: any).ok)
            test.is_false(ran, "a denied run rewrites nothing")

            local stored, read_err = runs.get((run :: any).id)
            test.is_nil(read_err, "read run: " .. tostring(read_err))
            test.eq("failed", (stored :: any).status)

            cleanup(db(), id)
            restore()
        end)

        -- The queue is at-least-once: a lapsed lease puts a job back on it while
        -- its body may still be walking the knowledge base. The record is the
        -- claim, so the second attempt rewrites nothing.
        test.it("declines a run another attempt already opened", function()
            local id = kb_id()
            local run, create_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(create_err, "create run: " .. tostring(create_err))
            local run_id = (run :: any).id

            local claimed, claim_err = runs.claim(run_id)
            test.is_nil(claim_err, "claim run: " .. tostring(claim_err))
            test.is_true(claimed, "the first claim opens the run")

            local ran = false
            worker._component = allowing_component()
            worker._verbs = {
                resummarize = function(_kb: string, _deps: any): (any, string?)
                    ran = true
                    return { success = true, total = 700, scanned = 700, resummarized = 700 }, nil
                end,
            }

            local outcome = worker.run_authorized({ payload = { kb_id = id, run_id = run_id,
                                                     run_type = "resummarize" } })
            test.is_true((outcome :: any).ok, "a run someone else owns is not this attempt's failure")
            test.eq("declined", (outcome :: any).outcome)
            test.is_false(ran, "the knowledge base is not rewritten a second time")

            local stored, read_err = runs.get(run_id)
            test.is_nil(read_err, "read run: " .. tostring(read_err))
            test.eq("running", (stored :: any).status, "the owning attempt keeps the run")
            test.is_nil((stored :: any).finished_at)

            cleanup(db(), id)
            restore()
        end)

        test.it("touches neither knowledge base when the payload and the record disagree", function()
            local id = kb_id()
            local other = kb_id()
            local run, create_err = runs.create(other, "resummarize", test_identity_row)
            test.is_nil(create_err, "create run: " .. tostring(create_err))

            local ran = false
            worker._component = allowing_component()
            worker._verbs = {
                resummarize = function(_kb: string, _deps: any): (any, string?)
                    ran = true
                    return { success = true }, nil
                end,
            }

            local outcome = worker.run_authorized({ payload = { kb_id = id, run_id = (run :: any).id,
                                                     run_type = "resummarize" } })
            test.is_false((outcome :: any).ok)
            test.is_false(ran, "a mismatched payload rewrites nothing")

            local stored, read_err = runs.get((run :: any).id)
            test.is_nil(read_err, "read run: " .. tostring(read_err))
            test.eq("scheduled", (stored :: any).status, "the record belongs to whatever job matches it")

            cleanup(db(), other)
            restore()
        end)

        test.it("refuses a payload that names no run", function()
            local outcome = worker.run_authorized({ payload = { kb_id = "kb-1", run_type = "resummarize" } })
            test.is_false((outcome :: any).ok)
            test.not_nil((outcome :: any).job_error)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
