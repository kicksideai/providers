local test = require("test")
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
    -- kb10 owns /kb10/{id}/..., and /knowledge/* is the platform knowledge
    -- module's public API: a second engine installed alongside kb10 would claim
    -- the same paths there.
    test.describe("kb10 maintenance routes", function()
        test.it("serves every maintenance route on the kb10 namespace", function()
            test.eq("/kb10/{id}/resummarize", endpoint("kickside.kb10.api:resummarize.endpoint").path)
            test.eq("/kb10/{id}/reembed", endpoint("kickside.kb10.api:reembed.endpoint").path)
            test.eq("/kb10/{id}/maintenance", endpoint("kickside.kb10.api:maintenance_get.endpoint").path)
        end)
    end)

    -- One knowledge base, one unfinished run per type. The surface checks before
    -- it inserts, but a check is not a claim: the store is what makes the rule
    -- true when two requests read the same free knowledge base at once.
    test.describe("kb10 maintenance run store", function()
        test.it("admits one unfinished run per knowledge base and run type", function()
            local id = kb_id()
            local d = db()

            local first, first_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(first_err, "first create: " .. tostring(first_err))
            test.not_nil(first)

            local second, second_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(second, "the store admits no second active run")
            test.is_true(errors.is(second_err, errors.CONFLICT), "the refusal is the standing-run conflict")
            test.eq(runs.ERR_ACTIVE_RUN, tostring(second_err),
                "the refusal names the standing run rather than a driver's sentence")
            test.eq(1, run_count(d, id))

            -- The two types are separate claims: a re-embed may stand beside a
            -- resummarize, and the queue's shared key is what orders them.
            local other, other_err = runs.create(id, "reembed", test_identity_row)
            test.is_nil(other_err, "reembed create: " .. tostring(other_err))
            test.not_nil(other)
            test.eq(2, run_count(d, id))

            -- A run that finished holds nothing: the next one takes the type.
            local _, close_err = runs.update((first :: any).id, {
                status = runs.STATUS.SUCCEEDED,
                finished_at = runs.now(),
            })
            test.is_nil(close_err, "close first run: " .. tostring(close_err))

            local rerun, rerun_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(rerun_err, "re-run create: " .. tostring(rerun_err))
            test.not_nil(rerun)
            test.eq(3, run_count(d, id))

            cleanup(d, id)
        end)
    end)

    test.describe("kb10 maintenance scheduling", function()
        test.it("mints a job under the caller's frozen identity instead of running the work", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local result, err = maintenance.start(id, "resummarize")
            test.is_nil(err, "start: " .. tostring(err))
            test.is_true((result :: any).scheduled)
            test.eq(id, (result :: any).kb_id)
            test.eq("job-1", (result :: any).job_id)
            test.eq("scheduled", (result :: any).run.status)
            test.is_true((result :: any).run.in_flight)

            test.eq(1, #queue.calls, "exactly one job is minted")
            local params = queue.calls[1]
            test.eq(id, params.thread_id)
            test.eq("func://kickside.kb10.engine:maintenance_worker", params.job_type)
            test.eq("kb10.maintenance:" .. id, params.concurrency_key)
            test.eq("kb10.maintenance", params.namespace)
            test.eq(id, params.scope)
            test.eq((result :: any).run.id, params.key)
            test.eq("actor-under-test", params.owner_locator.id)
            test.is_nil((result :: any).run.actor_id)
            test.is_nil((result :: any).run.actor_context)
            -- A whole-knowledge-base rewrite restarted from scratch spends the
            -- entire model cost a second time, so the queue is given one attempt.
            test.eq(1, params.max_attempts)
            test.eq(id, params.immutable_payload.kb_id)
            test.eq("resummarize", params.immutable_payload.run_type)
            test.eq((result :: any).run.id, params.immutable_payload.run_id)

            cleanup(db(), id)
            restore()
        end)

        -- Two runs of the same kind on one KB would rewrite the same summaries
        -- past each other, so the second is refused rather than queued.
        test.it("refuses a second run of the same kind while one is in flight", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local first, first_err = maintenance.start(id, "resummarize")
            test.is_nil(first_err, "first start: " .. tostring(first_err))
            test.not_nil(first)

            local second, second_err, status = maintenance.start(id, "resummarize")
            test.is_nil(second)
            test.eq(409, status)
            test.not_nil(second_err)
            test.eq(1, #queue.calls, "the refused start mints no job")

            cleanup(db(), id)
            restore()
        end)

        -- The in-flight check reads the knowledge base's state before it writes,
        -- so a request that started while another was still minting its run sees
        -- a free knowledge base. The store refuses that second run, and the
        -- surface reports it the same way it reports a sequential second run.
        test.it("refuses a start that loses the store's race to a concurrent run", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local standing, create_err = runs.create(id, "resummarize", test_identity_row)
            test.is_nil(create_err, "create the concurrent run: " .. tostring(create_err))

            -- The concurrent run landed after this request read the knowledge
            -- base, so the check above the insert cannot see it.
            local blind: any = {}
            for key, value in pairs(runs :: any) do blind[key] = value end
            blind.latest_by_type = function(_id: string): (any?, string?) return {}, nil end
            maintenance._runs = blind

            local second, second_err, status = maintenance.start(id, "resummarize")
            test.is_nil(second)
            test.eq(409, status)
            test.is_true(tostring(second_err):find("already in flight", 1, true) ~= nil,
                "the refusal reads as an in-flight run: " .. tostring(second_err))
            test.eq(0, #queue.calls, "the refused start mints no job")

            local d = db()
            test.eq(1, run_count(d, id), "one run stands for the knowledge base")

            maintenance._runs = LIVE.runs
            local report, read_err = maintenance.status(id)
            test.is_nil(read_err, "status: " .. tostring(read_err))
            test.eq((standing :: any).id, (report :: any).resummarize.id,
                "the run that stands is the one the surface reports")

            cleanup(d, id)
            restore()
        end)

        -- Different kinds do not block each other here; the shared concurrency
        -- key is what keeps them from running at the same time.
        test.it("schedules a re-embed while a resummarize is in flight", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local _, first_err = maintenance.start(id, "resummarize")
            test.is_nil(first_err, "resummarize start: " .. tostring(first_err))
            local second, second_err = maintenance.start(id, "reembed")
            test.is_nil(second_err, "reembed start: " .. tostring(second_err))
            test.eq("func://kickside.kb10.engine:maintenance_worker", queue.calls[2].job_type)
            test.eq("reembed", queue.calls[2].immutable_payload.run_type)
            test.eq(queue.calls[1].concurrency_key, queue.calls[2].concurrency_key)

            cleanup(db(), id)
            restore()
        end)

        test.it("gives a deliberate re-run its own job once the previous run is terminal", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local first, first_err = maintenance.start(id, "resummarize")
            test.is_nil(first_err, "first start: " .. tostring(first_err))
            local _, close_err = runs.update((first :: any).run.id, {
                status = runs.STATUS.SUCCEEDED,
                finished_at = runs.now(),
            })
            test.is_nil(close_err, "close first run: " .. tostring(close_err))

            local second, second_err = maintenance.start(id, "resummarize")
            test.is_nil(second_err, "second start: " .. tostring(second_err))
            test.eq(2, #queue.calls)
            test.neq(queue.calls[1].key, queue.calls[2].key,
                "a re-run is its own job, not a duplicate of the last one")
            test.neq((first :: any).run.id, (second :: any).run.id)

            cleanup(db(), id)
            restore()
        end)

        -- A run whose worker died leaves its record open, and the queue is what
        -- knows the work is over. The knowledge base must not stay closed to
        -- maintenance because of it.
        test.it("releases a knowledge base whose job settled without closing its record", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local first, first_err = maintenance.start(id, "resummarize")
            test.is_nil(first_err, "first start: " .. tostring(first_err))
            local d = db()
            local _, exec_err = d:execute(
                "UPDATE kb10_maintenance_runs SET status = $1 WHERE id = $2",
                { runs.STATUS.RUNNING, (first :: any).run.id }
            )
            test.is_nil(exec_err, "open the run: " .. tostring(exec_err))
            maintenance._job_status = jobs_in_state("dead")

            local status, status_err = maintenance.status(id)
            test.is_nil(status_err, "status: " .. tostring(status_err))
            test.is_false((status :: any).resummarize.in_flight)
            test.is_true((status :: any).resummarize.stale)

            local second, second_err = maintenance.start(id, "resummarize")
            test.is_nil(second_err, "second start: " .. tostring(second_err))
            test.not_nil(second)

            -- The abandoned run is closed by the run that replaces it: nothing
            -- else ever closes it, and a knowledge base keeps one settled fact
            -- per run rather than a record that stays open forever.
            local abandoned, read_err = runs.get((first :: any).run.id)
            test.is_nil(read_err, "read abandoned run: " .. tostring(read_err))
            test.eq("failed", (abandoned :: any).status)
            test.eq("the run stopped reporting", (abandoned :: any).last_error)
            test.not_nil((abandoned :: any).finished_at)

            cleanup(d, id)
            restore()
        end)

        -- The maintenance tier does not age: a re-embed can wait behind a long
        -- resummarize for hours and is in flight for every second of it.
        test.it("reads a run whose job is still queued as in flight however long it waits", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local started, start_err = maintenance.start(id, "reembed")
            test.is_nil(start_err, "start: " .. tostring(start_err))
            local d = db()
            local _, exec_err = d:execute(
                "UPDATE kb10_maintenance_runs SET created_at = $1, heartbeat_at = $1 WHERE id = $2",
                { "2020-01-01T00:00:00Z", (started :: any).run.id }
            )
            test.is_nil(exec_err, "age the record: " .. tostring(exec_err))

            local status, status_err = maintenance.status(id)
            test.is_nil(status_err, "status: " .. tostring(status_err))
            test.is_true((status :: any).reembed.in_flight)
            test.is_false((status :: any).reembed.stale)

            local second, _, conflict = maintenance.start(id, "reembed")
            test.is_nil(second)
            test.eq(409, conflict)

            cleanup(d, id)
            restore()
        end)

        -- Whether a knowledge base is free is the queue's fact. A queue that
        -- cannot answer is not an empty answer.
        test.it("refuses to start a run while the queue's own state is unreadable", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local _, first_err = maintenance.start(id, "resummarize")
            test.is_nil(first_err, "first start: " .. tostring(first_err))
            maintenance._job_status = function(_kb: string, _run_type: string, _job: string): (string?, string?)
                return nil, "jobs db unavailable"
            end

            local second, second_err, status = maintenance.start(id, "resummarize")
            test.is_nil(second)
            test.eq(500, status)
            test.is_true(tostring(second_err):find("jobs db unavailable", 1, true) ~= nil,
                "the refusal carries the queue's reason: " .. tostring(second_err))
            test.eq(1, #queue.calls, "no job is minted while the queue cannot be read")

            local read, read_err = maintenance.status(id)
            test.is_nil(read)
            test.not_nil(read_err)

            cleanup(db(), id)
            restore()
        end)

        -- Nothing durable exists before the identity does, so a freeze that
        -- fails cannot leave a record holding the knowledge base.
        test.it("leaves no run standing when the requester's identity cannot be frozen", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)
            maintenance._identity = {
                capture = function(_tag: string): (any?, string?)
                    return nil, "no actor on this request"
                end,
                to_row = function(_identity: any): (any?, string?)
                    return nil, "unreachable"
                end,
            }

            local refused, refused_err, status = maintenance.start(id, "resummarize")
            test.is_nil(refused)
            test.eq(500, status)
            test.not_nil(refused_err)
            test.eq(0, #queue.calls)

            local after, after_err = maintenance.status(id)
            test.is_nil(after_err, "status: " .. tostring(after_err))
            test.is_nil((after :: any).resummarize, "a failed freeze records no run")

            cleanup(db(), id)
            restore()
        end)
    end)


end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
