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

local function define_tests()
    test.describe("kb10 maintenance status", function()
        test.it("reports nothing for a knowledge base that has never run maintenance", function()
            local id = kb_id()
            install(fake_jobs())
            local status, err = maintenance.status(id)
            test.is_nil(err, "status: " .. tostring(err))
            test.is_nil((status :: any).resummarize)
            test.is_nil((status :: any).reembed)
            restore()
        end)

        test.it("reports the run in flight, then its terminal counts", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local started, start_err = maintenance.start(id, "resummarize")
            test.is_nil(start_err, "start: " .. tostring(start_err))
            test.is_nil((started :: any).run.actor_id, "the schedule response omits the stored actor")
            test.is_nil((started :: any).run.actor_context, "the schedule response omits the stored identity")
            local run_id = (started :: any).run.id

            local in_flight, in_flight_err = maintenance.status(id)
            test.is_nil(in_flight_err, "status: " .. tostring(in_flight_err))
            test.eq("scheduled", (in_flight :: any).resummarize.status)
            test.is_nil((in_flight :: any).resummarize.actor_id, "status omits the stored actor")
            test.is_nil((in_flight :: any).resummarize.actor_context, "status omits the stored identity")
            test.is_true((in_flight :: any).resummarize.in_flight)
            test.is_false((in_flight :: any).resummarize.stale)

            local _, progress_err = runs.update(run_id, {
                status = runs.STATUS.RUNNING, total = 700, scanned = 128, resummarized = 120,
            })
            test.is_nil(progress_err, "progress: " .. tostring(progress_err))
            local midway, midway_err = maintenance.status(id)
            test.is_nil(midway_err, "status: " .. tostring(midway_err))
            test.eq(700, (midway :: any).resummarize.total)
            test.eq(128, (midway :: any).resummarize.scanned)
            test.is_true((midway :: any).resummarize.in_flight)

            local _, close_err = runs.update(run_id, {
                status = runs.STATUS.SUCCEEDED, scanned = 700, resummarized = 690,
                documents_skipped = 10, chunks_reenriched = 2100, chunks_failed = 4,
                finished_at = runs.now(),
            })
            test.is_nil(close_err, "close: " .. tostring(close_err))

            local terminal, terminal_err = maintenance.status(id)
            test.is_nil(terminal_err, "status: " .. tostring(terminal_err))
            test.eq("succeeded", (terminal :: any).resummarize.status)
            test.is_false((terminal :: any).resummarize.in_flight)
            test.is_false((terminal :: any).resummarize.stale)
            test.eq(690, (terminal :: any).resummarize.resummarized)
            test.eq(10, (terminal :: any).resummarize.documents_skipped)
            test.eq(2100, (terminal :: any).resummarize.chunks_reenriched)
            test.eq(4, (terminal :: any).resummarize.chunks_failed)

            cleanup(db(), id)
            restore()
        end)
    end)

    -- A caller outside kb10 reaches maintenance through these libraries rather
    -- than through a request, and defers a run exactly as the endpoint does. The
    -- queue and the identity freeze are swapped on the implementation the
    -- endpoint handlers run, so what the seam mints proves the two share one
    -- code path rather than two copies of it.
    test.describe("kb10 maintenance library seam", function()
        test.it("authorizes the library seam before it creates a run or job", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)
            maintenance._validate_access = function(_kb_id: string, access: any): (any?, string?, number?)
                test.eq(2, access)
                return nil, "access denied", 403
            end

            local receipt, err = schedule_resummarize.run(id)
            test.is_nil(receipt)
            test.eq("access denied", err)
            test.eq(0, #queue.calls, "an unauthorized library caller mints no job")
            test.eq(0, run_count(db(), id), "an unauthorized library caller mints no run")

            restore()
        end)

        test.it("authorizes status reads through the library seam", function()
            local id = kb_id()
            install(fake_jobs())
            maintenance._validate_access = function(_kb_id: string, access: any): (any?, string?, number?)
                test.eq(1, access)
                return nil, "access denied", 403
            end

            local report, err = maintenance_status.run(id)
            test.is_nil(report)
            test.eq("access denied", err)

            restore()
        end)

        test.it("mints the endpoint's job when the start seam is called as a library", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local receipt, err = schedule_resummarize.run(id)
            test.is_nil(err, "schedule: " .. tostring(err))
            test.is_true((receipt :: any).scheduled)
            test.eq(id, (receipt :: any).kb_id)
            test.eq("job-1", (receipt :: any).job_id)
            test.eq("scheduled", (receipt :: any).run.status)
            test.is_true((receipt :: any).run.in_flight)

            test.eq(1, #queue.calls, "exactly one job is minted")
            local params = queue.calls[1]
            test.eq(id, params.thread_id)
            test.eq("func://kickside.kb10.engine:maintenance_worker", params.job_type)
            test.eq("kb10.maintenance:" .. id, params.concurrency_key)
            test.eq("actor-under-test", params.owner_locator.id)
            test.eq(1, params.max_attempts)

            cleanup(db(), id)
            restore()
        end)

        test.it("refuses a second run of the same kind through the seam", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local _, first_err = schedule_reembed.run(id)
            test.is_nil(first_err, "first schedule: " .. tostring(first_err))

            local second, second_err = schedule_reembed.run(id)
            test.is_nil(second)
            test.not_nil(second_err, "the refusal crosses the seam as its reason")
            test.eq(1, #queue.calls, "the refused start mints no job")

            cleanup(db(), id)
            restore()
        end)

        test.it("follows the scheduled run through the status seam to its terminal counts", function()
            local id = kb_id()
            local queue = fake_jobs()
            install(queue)

            local receipt, start_err = schedule_reembed.run(id)
            test.is_nil(start_err, "schedule: " .. tostring(start_err))
            local run_id = (receipt :: any).run.id

            local report, read_err = maintenance_status.run(id)
            test.is_nil(read_err, "status: " .. tostring(read_err))
            test.is_nil((report :: any).resummarize, "a type this knowledge base never ran is absent")
            test.eq(run_id, (report :: any).reembed.id)
            test.is_true((report :: any).reembed.in_flight)

            local _, close_err = runs.update(run_id, {
                status = runs.STATUS.SUCCEEDED, scanned = 5, embedded = 5, finished_at = runs.now(),
            })
            test.is_nil(close_err, "close: " .. tostring(close_err))

            local terminal, terminal_err = maintenance_status.run(id)
            test.is_nil(terminal_err, "status: " .. tostring(terminal_err))
            test.eq("succeeded", (terminal :: any).reembed.status)
            test.is_false((terminal :: any).reembed.in_flight)
            test.eq(5, (terminal :: any).reembed.embedded)

            cleanup(db(), id)
            restore()
        end)
    end)

    -- The knowledge control plane holds no kb10 name: it reads maintenance_binding
    -- off the KB's engine descriptor and opens that binding with the knowledge
    -- base as context. These cases enter through exactly that binding and land on
    -- the same seam the library cases above call, so what knowledge dispatches to
    -- and what kb10 implements are proven to be one path.
    test.describe("kb10 maintainable contract binding", function()
        local function open_maintainable(component_id: string, subject_id: string): (any, string?)
            local def, def_err = contract.get(kb10.MAINTAINABLE_CONTRACT)
            if def_err or not def then
                return nil, "contract unavailable: " .. tostring(def_err)
            end
            local actor = security.new_actor(subject_id, {})
            local scope = security.named_scope("wippy.security:process")
            return (def :: any):with_actor(actor):with_scope(scope)
                :open(kb10.MAINTENANCE_BINDING, { component_id = component_id })
        end

        test.it("declares the knowledge injection thread class on every engine", function()
            for _, id in ipairs({ "kickside.kb10:engine_document", "kickside.kb10:engine_wiki" }) do
                local entry = registry.get(id)
                test.not_nil(entry)
                test.not_nil((entry :: any).meta.thread, id .. " must declare its primary thread")
                test.eq((entry :: any).meta.thread.class, "kickside.knowledge.injection")
            end
        end)

        test.it("declares the binding on every engine descriptor knowledge routes to", function()
            for _, id in ipairs({ "kickside.kb10:engine_document", "kickside.kb10:engine_wiki" }) do
                local entry = registry.get(id)
                test.not_nil(entry, id .. " descriptor is missing")
                local m: any = (entry :: any).meta or ((entry :: any).data or {}).meta or {}
                test.eq(kb10.MAINTENANCE_BINDING, m.maintenance_binding,
                    id .. " must name the maintenance binding knowledge dispatches through")
            end
        end)

        -- The binding runs in its own function context, so it reaches the live
        -- queue and the real run records rather than a case's stubbed wiring:
        -- what crosses the contract is exactly what the endpoint mints.
        test.it("mints a run per verb through the binding and reads both back through it", function()
            local id = kb_id()
            local subject = "kb10-maintenance-owner-" .. fixtures.uuid()
            local d = db()
            seed_component(d, id, subject, 15)
            test.is_nil(fixtures.seed_user(d, subject))
            test.is_nil(fixtures.seed_thread(d, id))

            local instance, open_err = open_maintainable(id, subject)
            test.is_nil(open_err, "open maintainable: " .. tostring(open_err))

            local resummarize, resummarize_err = (instance :: any):schedule_resummarize({})
            test.is_nil(resummarize_err, "schedule resummarize: " .. tostring(resummarize_err))
            test.eq(id, (resummarize :: any).kb_id)
            test.is_true((resummarize :: any).scheduled)
            test.eq("string", type((resummarize :: any).job_id))
            test.eq(runs.RUN_TYPE.RESUMMARIZE, (resummarize :: any).run.run_type)

            local reembed, reembed_err = (instance :: any):schedule_reembed({})
            test.is_nil(reembed_err, "schedule reembed: " .. tostring(reembed_err))
            test.eq(id, (reembed :: any).kb_id)
            test.is_true((reembed :: any).scheduled)
            test.eq(runs.RUN_TYPE.REEMBED, (reembed :: any).run.run_type)

            local report, read_err = (instance :: any):maintenance_status({})
            test.is_nil(read_err, "status: " .. tostring(read_err))
            test.eq((resummarize :: any).run.id, (report :: any).resummarize.id)
            test.eq((reembed :: any).run.id, (report :: any).reembed.id)

            cleanup(d, id)
            test.is_nil(fixtures.drop_thread(d, id))
            drop_component(d, id)
            test.is_nil(fixtures.drop_user(d, subject))
        end)

        -- The binding is reachable in-process by anyone who can name a knowledge
        -- base, so the component_id it reads from context authorizes nothing on
        -- its own. Starting a run is a write: it mints a durable record and a
        -- queued job that spends hours of model work rewriting the KB.
        test.it("refuses to schedule a run for a caller the knowledge base grants only reads", function()
            local id = kb_id()
            local reader = "kb10-maintenance-reader-" .. fixtures.uuid()
            local d = db()
            seed_component(d, id, reader, 1)

            local instance, open_err = open_maintainable(id, reader)
            test.is_nil(open_err, "open maintainable: " .. tostring(open_err))

            local resummarize, resummarize_err = (instance :: any):schedule_resummarize({})
            test.is_nil(resummarize, "a reader schedules no resummarize")
            test.not_nil(resummarize_err)

            local reembed, reembed_err = (instance :: any):schedule_reembed({})
            test.is_nil(reembed, "a reader schedules no re-embed")
            test.not_nil(reembed_err)

            test.eq(0, run_count(d, id), "a refused verb leaves no durable run behind")

            -- Reading what maintenance has done is a read of the knowledge base,
            -- which this caller is granted.
            local report, read_err = (instance :: any):maintenance_status({})
            test.is_nil(read_err, "status: " .. tostring(read_err))
            test.is_nil((report :: any).resummarize)
            test.is_nil((report :: any).reembed)

            cleanup(d, id)
            drop_component(d, id)
        end)

        -- Run counters and failure reasons are the knowledge base's own state; a
        -- caller with no access to it reads none of them.
        test.it("refuses every verb for a caller the knowledge base grants nothing", function()
            local id = kb_id()
            local stranger = "kb10-maintenance-stranger-" .. fixtures.uuid()
            local d = db()
            seed_component(d, id, nil, 0)

            local instance, open_err = open_maintainable(id, stranger)
            test.is_nil(open_err, "open maintainable: " .. tostring(open_err))

            local report, read_err = (instance :: any):maintenance_status({})
            test.is_nil(report, "a stranger reads no maintenance state")
            test.not_nil(read_err)

            local resummarize, resummarize_err = (instance :: any):schedule_resummarize({})
            test.is_nil(resummarize)
            test.not_nil(resummarize_err)

            local reembed, reembed_err = (instance :: any):schedule_reembed({})
            test.is_nil(reembed)
            test.not_nil(reembed_err)

            test.eq(0, run_count(d, id), "a refused verb leaves no durable run behind")

            cleanup(d, id)
            drop_component(d, id)
        end)
    end)


end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
