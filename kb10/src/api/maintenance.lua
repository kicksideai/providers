-- The kb10 maintenance surface: POST /kb10/{id}/resummarize, POST
-- /kb10/{id}/reembed, and GET /kb10/{id}/maintenance.
--
-- Both verbs rewrite every document in a knowledge base and cost minutes to
-- hours of model work, which is longer than any gateway will hold a request
-- open. So the endpoints do not run them. They validate WRITE, freeze the
-- caller's identity, mint a run record and a job that carries it, and answer
-- { kb_id, job_id, scheduled } in milliseconds. The work happens in
-- kickside.kb10.engine:maintenance_worker, as the person who authorized it.
--
-- What was done is read back from the run record, never from the request:
-- GET /kb10/{id}/maintenance returns the latest run of each type with its
-- counters, its terminal status and, when it failed, the reason. Whether a run
-- is still going is the queue's fact rather than this layer's -- the record says
-- what a run has done, the job row says whether the queue still owes it work.
--
-- Two runs on one knowledge base must never interleave -- they rewrite the same
-- summaries and vectors -- so every maintenance job for a KB shares one
-- concurrency key and the queue serializes them. The idempotency key carries the
-- run id, which is fresh per request, so a deliberate re-run is always its own
-- job rather than a duplicate of the last one.
--
-- A knowledge base also holds at most one unfinished run per type, which the
-- record store enforces. The in-flight read below is the fast path: it answers
-- the ordinary second request with a conflict before anything durable is
-- written, and the store answers the one that raced past it with the same
-- conflict.

local http = require("http")
local time = require("time")
local component = require("component")
local execution_identity = require("execution_identity")
local jobs = require("jobs")
local job_types = require("job_types")
local request = require("request")
local runs = require("maintenance_runs")

local M = {}

-- Injection points for the suite: the queue, the queue's own view of a job, the
-- identity freeze and the record are swapped so the minted job, the refusal and
-- the reported status are provable without a live queue.
M._jobs = jobs :: any
M._identity = execution_identity :: any
M._runs = runs :: any
M._validate_access = request.validate_access :: any

local WORKER_REF = "func://kickside.kb10.engine:maintenance_worker"

local JOB_TYPE: { [string]: string } = {}
JOB_TYPE[runs.RUN_TYPE.RESUMMARIZE] = WORKER_REF
JOB_TYPE[runs.RUN_TYPE.REEMBED] = WORKER_REF

-- The queue has no row for this job id: it never landed, or it settled long ago
-- and job retention swept it.
M.JOB_ABSENT = "absent"

-- The queue states in which a job still owes its run. pending includes a job
-- waiting behind another maintenance run on the same knowledge base -- the
-- maintenance tier does not age, so a queued run may wait a long time and is in
-- flight for every second of it.
local ACTIVE_JOB_STATES: { [string]: boolean } = {}
ACTIVE_JOB_STATES[job_types.JOB_STATE.PENDING] = true
ACTIVE_JOB_STATES[job_types.JOB_STATE.RUNNING] = true

-- How long a record may exist without the queue knowing about its job. The
-- request that mints a run inserts the record, enqueues the job and only then
-- records the job id, so a status read landing inside that window finds a record
-- with nothing to point at and must still read it as in flight -- otherwise two
-- racing requests each mint a full regeneration. The bound is the length of one
-- request, never the length of a run: a run that reached the queue is measured
-- by its job row, not by the clock.
local MINTING_SECONDS = 60

-- The instant an age is measured against, as the same RFC3339 UTC string the
-- record stores, so the comparison is a plain string compare.
local function ago(seconds: number): string
    return time.now():utc():add(-seconds * time.SECOND):format(time.RFC3339)
end

-- The exact queue read checks the resource and verb carrying the run.
local function job_status(kb_id: string, run_type: string, job_id: string): (string?, string?)
    local row, read_err = M._jobs.get_job(job_id)
    if read_err then return nil, "read maintenance job: " .. tostring(read_err) end
    if not row or tostring(row.thread_id) ~= kb_id or row.job_type ~= JOB_TYPE[run_type] then
        return M.JOB_ABSENT, nil
    end
    return tostring(row.status), nil
end
M._job_status = job_status :: any

-- in_flight(run) -> (owns, err): whether this run still owns its knowledge base.
-- A terminal run never does. A live one does while the queue still owes it work.
function M.in_flight(run: any): (boolean, string?)
    if type(run) ~= "table" then return false, nil end
    local status = tostring((run :: any).status)
    if status ~= runs.STATUS.RUNNING and status ~= runs.STATUS.SCHEDULED then return false, nil end

    local job_id = (run :: any).job_id
    if type(job_id) == "string" and job_id ~= "" then
        local state, state_err = M._job_status(
            tostring((run :: any).component_id), tostring((run :: any).run_type), job_id :: string
        )
        if state_err then return false, state_err end
        if state ~= M.JOB_ABSENT then return ACTIVE_JOB_STATES[tostring(state)] == true, nil end
    end

    -- No job to ask about: the record is either still inside the request minting
    -- it, or was orphaned by a request that died before the queue took the work.
    -- Past the minting window it is orphaned, and start closes it.
    local created = (run :: any).created_at
    if type(created) ~= "string" then return false, nil end
    return (created :: string) > ago(MINTING_SECONDS), nil
end

-- The run as the surface reads it: the stored record plus the two things only
-- this layer can decide -- whether it is still in flight, and whether it stopped
-- reporting without ever closing.
local function view(run: any): (any?, string?)
    if type(run) ~= "table" then return nil, nil end
    local in_flight, err = M.in_flight(run)
    if err then return nil, err end
    local out: { [string]: any } = {}
    for key, field in pairs(run :: { [string]: any }) do
        if key ~= "actor_id" and key ~= "actor_context" then out[key] = field end
    end
    local status = tostring(out.status)
    out.in_flight = in_flight
    out.stale = not in_flight and (status == runs.STATUS.RUNNING or status == runs.STATUS.SCHEDULED)
    return out, nil
end

-- status(kb_id) -> ({ success, resummarize, reembed }, err): the latest run of
-- each type, or nil for a type this knowledge base has never run.
function M.status(kb_id: string): (any?, string?)
    local allowed, refusal = M._validate_access(kb_id, component.ACCESS.READ)
    if not allowed then return nil, tostring(refusal or "access denied") end

    local latest, err = M._runs.latest_by_type(kb_id)
    if not latest then return nil, tostring(err) end

    local resummarize, resummarize_err = view((latest :: any)[runs.RUN_TYPE.RESUMMARIZE])
    if resummarize_err then return nil, resummarize_err end
    local reembed, reembed_err = view((latest :: any)[runs.RUN_TYPE.REEMBED])
    if reembed_err then return nil, reembed_err end

    return {
        success = true,
        kb_id = kb_id,
        resummarize = resummarize,
        reembed = reembed,
    }, nil
end

-- Close a run nothing will carry, so the knowledge base is not left with a
-- record standing in the way of the next one. Returns the reason to report; a
-- record write that fails on top of it is reported alongside, never instead.
local function abandon(run_id: string, message: string): string
    local _, close_err = M._runs.update(run_id, {
        status = runs.STATUS.FAILED,
        last_error = message,
        finished_at = runs.now(),
    })
    if close_err then
        return message .. " (the run record also failed to close: " .. tostring(close_err) .. ")"
    end
    return message
end

-- start(kb_id, run_type) -> (result, err, status). The endpoint body minus the
-- HTTP context: refuse a second run on a KB that already has one in flight, then
-- mint the record and the job that will carry it.
function M.start(kb_id: string, run_type: string): (any?, string?, number?)
    if not runs.is_run_type(run_type) then
        return nil, "unknown maintenance run type: " .. tostring(run_type), http.STATUS.BAD_REQUEST
    end

    -- start() is also exported through library seams. Those callers have no
    -- HTTP preamble, so the mutation must authorize here rather than relying on
    -- a wrapper to remember the gate. The HTTP and binding paths may have
    -- already checked; repeating the same canonical decision is harmless.
    local allowed, refusal, refusal_status = M._validate_access(kb_id, component.ACCESS.WRITE)
    if not allowed then
        return nil, tostring(refusal or "access denied"), refusal_status or http.STATUS.FORBIDDEN
    end

    local latest, latest_err = M._runs.latest_by_type(kb_id)
    if not latest then return nil, tostring(latest_err), http.STATUS.INTERNAL_ERROR end
    local standing = (latest :: any)[run_type]
    local busy, busy_err = M.in_flight(standing)
    if busy_err then
        return nil, "the knowledge base's maintenance state could not be read: " .. tostring(busy_err),
            http.STATUS.INTERNAL_ERROR
    end
    if busy then
        return nil, "a " .. run_type .. " run is already in flight for this knowledge base",
            http.STATUS.CONFLICT
    end

    -- A run that is out of flight without ever closing itself was orphaned: its
    -- worker died, or the request that minted it never reached the queue. The
    -- record has no reaper, so the run that replaces it closes it first and the
    -- knowledge base keeps one settled fact per run.
    if type(standing) == "table" then
        local standing_status = tostring((standing :: any).status)
        if standing_status == runs.STATUS.RUNNING or standing_status == runs.STATUS.SCHEDULED then
            local _, close_err = M._runs.update(tostring((standing :: any).id), {
                status = runs.STATUS.FAILED,
                last_error = "the run stopped reporting",
                finished_at = runs.now(),
            })
            if close_err then
                return nil, "the abandoned run could not be closed: " .. tostring(close_err),
                    http.STATUS.INTERNAL_ERROR
            end
        end
    end

    -- The run happens as the caller, not as the queue: the identity is frozen
    -- while the request still carries it and before anything durable exists, so
    -- a freeze that fails leaves no record standing in the knowledge base's way.
    local identity, capture_err = M._identity.capture()
    if not identity then
        return nil, "the requester's identity could not be frozen: " .. tostring(capture_err),
            http.STATUS.INTERNAL_ERROR
    end
    local row, row_err = M._identity.to_row(identity)
    if not row then
        return nil, "the requester's identity is not storable: " .. tostring(row_err),
            http.STATUS.INTERNAL_ERROR
    end
    local frozen = row :: any

    local run, create_err = M._runs.create(kb_id, run_type, frozen)
    if not run then
        -- The check above ran before this insert, so a request that started
        -- while another was still minting its run reads a free knowledge base
        -- and arrives here anyway. The store is what refuses it, and it is
        -- refused for the same reason a sequential second run is.
        if errors.is(create_err, errors.CONFLICT) then
            return nil, "a " .. run_type .. " run is already in flight for this knowledge base",
                http.STATUS.CONFLICT
        end
        return nil, "the maintenance run could not be recorded: " .. tostring(create_err),
            http.STATUS.INTERNAL_ERROR
    end
    local run_id = tostring((run :: any).id)

    local queued, enqueue_err = M._jobs.enqueue({
        -- A knowledge base's thread IS the knowledge base: thread_id ==
        -- component_id == kb_id, the same identity its projections run under.
        namespace = "kb10.maintenance",
        scope = kb_id,
        key = run_id,
        owner_locator = { kind = identity.principal.kind, id = identity.principal.id },
        thread_id = kb_id,
        job_type = JOB_TYPE[run_type],
        concurrency_key = "kb10.maintenance:" .. kb_id,
        immutable_payload = { kb_id = kb_id, run_id = run_id, run_type = run_type },
        -- Hours of model work over a whole knowledge base is background work: it
        -- yields the queue to live jobs rather than holding a worker ahead of
        -- them.
        queue_tier = "maintenance",
        -- Rewriting every summary or vector in a knowledge base is not safely
        -- retryable from scratch: a second attempt starts at document one and
        -- spends the whole model cost again, so this job gets exactly one. The
        -- record's own guarded claim is what refuses an attempt that the queue
        -- reclaims anyway.
        max_attempts = 1,
    })
    if enqueue_err or type(queued) ~= "table" or type(queued.id) ~= "string" then
        return nil, abandon(run_id, "the maintenance run could not be scheduled: " ..
            tostring(enqueue_err or "the queue accepted no job")), http.STATUS.INTERNAL_ERROR
    end
    local job_id = queued.id

    local scheduled, attach_err = M._runs.update(run_id, { job_id = tostring(job_id) })
    if not scheduled then
        -- The job exists but nothing can match it to this record, so the record
        -- closes here; the job's own claim finds the run already settled and
        -- rewrites nothing.
        return nil, abandon(run_id, "the scheduled job could not be recorded: " .. tostring(attach_err)),
            http.STATUS.INTERNAL_ERROR
    end

    local reported, view_err = view(scheduled)
    if view_err then
        return nil, "the scheduled run could not be read back: " .. tostring(view_err), http.STATUS.INTERNAL_ERROR
    end

    return {
        success = true,
        kb_id = kb_id,
        job_id = tostring(job_id),
        scheduled = true,
        run = reported,
    }, nil, http.STATUS.OK
end

local function start_handler(run_type: string): (any?, string?)
    local res, kb_id, context_err = request.open(component.ACCESS.WRITE)
    if context_err then return nil, context_err end
    if not res or not kb_id then return end

    local result, err, status = M.start(kb_id :: string, run_type)
    if not result then
        request.reply(res, status or http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(err) })
        return
    end
    request.reply(res, http.STATUS.OK, result)
end

function M.resummarize_handler()
    return start_handler(runs.RUN_TYPE.RESUMMARIZE)
end

function M.reembed_handler()
    return start_handler(runs.RUN_TYPE.REEMBED)
end

-- Reading what maintenance has done to a KB is a read of the KB, so it is
-- available under READ -- the same access the other kb10 read APIs take. Only
-- starting a run requires WRITE.
function M.status_handler(): (any?, string?)
    local res, kb_id, context_err = request.open(component.ACCESS.READ)
    if context_err then return nil, context_err end
    if not res or not kb_id then return end

    local result, err = M.status(kb_id :: string)
    if not result then
        request.reply(res, http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(err) })
        return
    end
    request.reply(res, http.STATUS.OK, result)
end

return M
