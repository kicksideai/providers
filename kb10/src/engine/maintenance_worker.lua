-- The body of a kb10 maintenance job: one resummarize or one re-embed over one
-- knowledge base.
--
-- Both verbs are minutes to hours of model work over every document in a KB, so
-- the endpoint that asks for one mints a job and answers immediately, and the
-- run happens HERE -- deferred, under the identity the job froze, never inside
-- the request that asked for it.
--
-- The worker owns the run record end to end: it claims the run before anything
-- else, hands the engine verb a progress sink that stamps the counters as the KB
-- is walked, and closes the record with its terminal counts or with the reason
-- it failed. That record is what the surface polls, so a run that ends -- either
-- way -- always leaves a fact behind. A verb that reports a reason beside its
-- counters closes the record failed and keeps the counters, so the surface reads
-- how far the run got and why it is not a success.
--
-- The claim is what makes "end to end" true on an at-least-once queue. The
-- scheduled -> running transition is guarded on the record, so an attempt that
-- finds the run already opened -- by a lease the queue reclaimed, or by a
-- retry -- leaves it to its owner and rewrites nothing, rather than starting the
-- whole knowledge base over at document one.
--
-- The access check is not a formality. This path is reachable without an HTTP
-- request, so it is the second enforcement point: a run whose frozen identity
-- may not write the KB gets no further than here and rewrites nothing.

local component = require("component")
local execution_identity = require("execution_identity")
local reembed = require("reembed")
local resummarize = require("resummarize")
local runs = require("maintenance_runs")

local M = {}

-- Injection points for the suite: the gate, the record and the two verbs are
-- swapped so the recorded terminal counts, the refusal and a failed run are
-- provable without a model round-trip.
M._component = component :: any
M._identity = execution_identity :: any
M._runs = runs :: any
M._verbs = {
    [runs.RUN_TYPE.RESUMMARIZE] = resummarize.run_with_deps,
    [runs.RUN_TYPE.REEMBED] = reembed.run_with_deps,
} :: any

type UnknownMap = { [string]: unknown }
type Outcome = { [string]: unknown }

local function map(value: unknown): UnknownMap
    return type(value) == "table" and (value :: UnknownMap) or {}
end

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return ((value :: string):gsub("^%s*(.-)%s*$", "%1"))
end

-- A worker reports failure by returning job_error, which the jobs engine records
-- as the attempt's error and retries or dead-letters. The worker never raises, so
-- a failure carries its own sentence rather than a stack.
local function failed(message: string): Outcome
    return { ok = false, job_error = message }
end

-- Close the record on the way out of a failure, so the surface reads the reason
-- rather than a run that stops moving. A record write that fails on top of the
-- original failure is reported alongside it, never in place of it.
local function fail_run(run_id: string, message: string): Outcome
    local _, update_err = M._runs.update(run_id, {
        status = runs.STATUS.FAILED,
        last_error = message,
        finished_at = runs.now(),
    })
    if update_err then
        return failed(message .. " (the run record also failed to close: " .. tostring(update_err) .. ")")
    end
    return failed(message)
end

function M.run_authorized(value: unknown): Outcome
    local payload = map(map(value).payload)
    local kb_id = trim(payload.kb_id)
    local run_id = trim(payload.run_id)
    local run_type = trim(payload.run_type)
    if kb_id == "" then return failed("kb10 maintenance payload is missing kb_id") end
    if run_id == "" then return failed("kb10 maintenance payload is missing run_id") end
    local verb = (M._verbs :: any)[run_type]
    if not verb then return failed("unknown kb10 maintenance run type: " .. run_type) end

    local record, read_err = M._runs.get(run_id)
    if not record then
        return failed("the maintenance run could not be read: " .. tostring(read_err))
    end
    -- The payload names the knowledge base this attempt gates access to and
    -- rewrites; the record names the knowledge base the run belongs to. A job
    -- that disagrees with its own record touches neither -- the record belongs to
    -- whatever job does match it.
    if tostring((record :: any).component_id) ~= kb_id then
        return failed("the maintenance run belongs to another knowledge base: " ..
            tostring((record :: any).component_id))
    end
    if tostring((record :: any).run_type) ~= run_type then
        return failed("the maintenance run is a " .. tostring((record :: any).run_type) ..
            ", not a " .. run_type)
    end

    -- The record is the claim on the knowledge base. Winning it opens the run and
    -- puts every exit below under the obligation to close it; losing it means
    -- another attempt owns this run, which is a clean end for this one.
    local claimed, claim_err = M._runs.claim(run_id)
    if claim_err then return failed("the maintenance run could not be opened: " .. tostring(claim_err)) end
    if not claimed then
        return { ok = true, outcome = "declined", kb_id = kb_id, run_id = run_id, run_type = run_type }
    end

    local _, access_err = M._component.validate_access(kb_id, M._component.ACCESS.WRITE)
    if access_err then
        return fail_run(run_id, "knowledge base access denied: " .. tostring(access_err))
    end

    -- The counters land on the record as the verb walks the KB, so a surface
    -- polling a 700-document regeneration sees it advance instead of waiting.
    local function progress(counts: any): (any?, string?)
        return M._runs.update(run_id, counts)
    end

    local result, run_err = verb(kb_id, { progress = progress })
    if not result then
        return fail_run(run_id, tostring(run_err or "the maintenance run produced no result"))
    end

    -- A verb that walked the knowledge base and still reports a reason has not
    -- succeeded, however far it got. The record closes with both: the counters
    -- the run reached, and the reason it is not a clean one.
    local terminal: { [string]: any } = {}
    for key, count in pairs(map(result)) do terminal[key] = count end
    terminal.finished_at = runs.now()
    if run_err then
        terminal.status = runs.STATUS.FAILED
        terminal.last_error = tostring(run_err)
    else
        terminal.status = runs.STATUS.SUCCEEDED
    end

    local _, finish_err = M._runs.update(run_id, terminal)
    if finish_err then
        return failed("the maintenance run finished but its record could not be closed: " .. tostring(finish_err))
    end

    if run_err then return failed(tostring(run_err)) end
    return { ok = true, outcome = "completed", kb_id = kb_id, run_id = run_id, run_type = run_type }
end

-- The queue frame is a worker, not the requester. Resolve the identity stored
-- by the run before executing the guarded claim and the knowledge base write.
function M.run(value: unknown): Outcome
    local payload = map(map(value).payload)
    local run_id = trim(payload.run_id)
    if run_id == "" then return failed("kb10 maintenance payload is missing run_id") end
    local record, read_err = M._runs.get(run_id)
    if not record then return failed("the maintenance run could not be read: " .. tostring(read_err)) end
    if trim(record.component_id) ~= trim(payload.kb_id) or trim(record.run_type) ~= trim(payload.run_type) then
        return failed("the maintenance job does not match its run record")
    end
    local identity, identity_err = M._identity.from_row(record.actor_id, record.actor_context)
    if identity_err or not identity then
        return fail_run(run_id, "the requester's stored identity is invalid: " .. tostring(identity_err))
    end
    local outcome, run_err = M._identity.run_as(identity,
        "kickside.kb10.engine:maintenance_worker_authorized", value,
        { deferred_owner = "kickside.kb10.engine:maintenance_worker" })
    if run_err or not outcome then
        return fail_run(run_id, "the requester's identity could not be re-admitted: " .. tostring(run_err))
    end
    return outcome :: Outcome
end

return M
