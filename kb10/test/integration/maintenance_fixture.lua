-- Proves the kb10 maintenance seam: the endpoint mints a job and answers,
-- the run record carries progress and outcome, and the worker is what actually
-- runs the verb.
--
-- The queue, its view of a job, the identity freeze and the access gate are
-- injected, and the two engine verbs are stubbed at the worker's seam, so the
-- scheduling contract and the recorded facts are provable without a live queue
-- or a model round-trip. The run records themselves are written through the real
-- persist layer against the harness database -- they are the surface's source of
-- truth, so a test that faked them would prove nothing.

local contract = require("contract")
local registry = require("registry")
local security = require("security")
local sql = require("sql")
local kb10 = require("kb10")
local fixtures = require("source_worker_fixtures")
local maintenance = require("maintenance")
local worker = require("maintenance_worker")
local runs = require("maintenance_runs")
local schedule_resummarize = require("schedule_resummarize")
local schedule_reembed = require("schedule_reembed")
local maintenance_status = require("maintenance_status")

-- The live wiring, kept so every case hands it back after swapping its own in.
local LIVE = {
    jobs = maintenance._jobs,
    identity = maintenance._identity,
    job_status = maintenance._job_status,
    runs = maintenance._runs,
    validate_access = maintenance._validate_access,
    worker_component = worker._component,
    worker_identity = worker._identity,
    verbs = worker._verbs,
}

local function db(): any
    local d, err = sql.get("app:db")
    if err then error("db connect failed: " .. tostring(err)) end
    return d
end

local function cleanup(d: any, kb_id: string): ()
    local _, err = d:execute("DELETE FROM kb10_maintenance_runs WHERE component_id = $1", { kb_id })
    if err then error("cleanup failed: " .. tostring(err)) end
end

-- A run is keyed by KB component id; the suite only needs a value no other case
-- shares.
local function kb_id(): string
    return fixtures.uuid()
end

-- A queue that records what it was asked to schedule.
local function fake_jobs(): any
    local recorded: { any } = {}
    local minted = 0
    return {
        calls = recorded,
        enqueue = function(params: any): (any?, any?)
            minted = minted + 1
            recorded[#recorded + 1] = params
            return { id = "job-" .. tostring(minted) }, nil
        end,
    }
end

local function fake_identity(): any
    return {
        capture = function(): (any?, string?)
            return { principal = { kind = "user", id = "actor-under-test" } }, nil
        end,
        to_row = function(_identity: any): (any?, string?)
            return { actor_id = "actor-under-test", actor_context = '{"scopes":["kb.write"]}' }, nil
        end,
    }
end

local function allowing_component(): any
    return {
        ACCESS = { READ = "read", WRITE = "write" },
        validate_access = function(_id: string, _access: any): (any?, string?)
            return true, nil
        end,
    }
end

local function denying_component(): any
    return {
        ACCESS = { READ = "read", WRITE = "write" },
        validate_access = function(_id: string, _access: any): (any?, string?)
            return nil, "insufficient access"
        end,
    }
end

-- What the queue says about the job carrying a run. A run is in flight exactly
-- while the queue still owes it work, so a case names the job state it means
-- rather than aging a record against a clock.
local function jobs_in_state(state: string): any
    return function(_kb_id: string, _run_type: string, _job_id: string): (string?, string?)
        return state, nil
    end
end

local function install(jobs_stub: any): ()
    maintenance._jobs = jobs_stub
    maintenance._identity = fake_identity()
    maintenance._job_status = jobs_in_state("pending")
    maintenance._validate_access = function(_id: string, _access: any): (any?, string?, number?)
        return true, nil, nil
    end
end

local function restore(): ()
    maintenance._jobs = LIVE.jobs
    maintenance._identity = LIVE.identity
    maintenance._job_status = LIVE.job_status
    maintenance._runs = LIVE.runs
    maintenance._validate_access = LIVE.validate_access
    worker._component = LIVE.worker_component
    worker._identity = LIVE.worker_identity
    worker._verbs = LIVE.verbs
end

-- A knowledge base as the component layer sees one: the component row plus the
-- grant that answers the binding's access gate. The gate reads the live
-- component service, so a case that means "this caller may write this KB" says
-- it in the rows rather than by swapping the gate out.
local function seed_component(d: any, component_id: string, subject_id: string?, mask: number): ()
    local _, err = d:execute(
        "INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at) " ..
        "VALUES ($1, $2, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        { component_id, kb10.MAINTENANCE_BINDING }
    )
    if err then error("component insert failed: " .. tostring(err)) end
    if not subject_id then return end
    local _, access_err = d:execute(
        "INSERT INTO kickside_component_access " ..
        "(access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at) " ..
        "VALUES ($1, 'user', $2, $3, $4, $5, CURRENT_TIMESTAMP)",
        { fixtures.uuid(), subject_id, component_id, component_id, mask }
    )
    if access_err then error("access insert failed: " .. tostring(access_err)) end
end

local function drop_component(d: any, component_id: string): ()
    local _, access_err = d:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { component_id })
    if access_err then error("access cleanup failed: " .. tostring(access_err)) end
    local _, err = d:execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
    if err then error("component cleanup failed: " .. tostring(err)) end
end

local function run_count(d: any, component_id: string): number
    local rows, err = d:query("SELECT COUNT(*) AS n FROM kb10_maintenance_runs WHERE component_id = $1",
        { component_id })
    if err then error("count runs failed: " .. tostring(err)) end
    return tonumber((rows :: any)[1].n) or 0
end

local function endpoint(id: string): any
    local entry, err = registry.get(id)
    if err then error("registry get " .. id .. " failed: " .. tostring(err)) end
    if type(entry) ~= "table" then error("missing endpoint entry: " .. id) end
    return (entry :: any).data
end

return {
    contract = contract,
    registry = registry,
    security = security,
    sql = sql,
    kb10 = kb10,
    fixtures = fixtures,
    maintenance = maintenance,
    worker = worker,
    runs = runs,
    schedule_resummarize = schedule_resummarize,
    schedule_reembed = schedule_reembed,
    maintenance_status = maintenance_status,
    LIVE = LIVE,
    db = db,
    cleanup = cleanup,
    kb_id = kb_id,
    fake_jobs = fake_jobs,
    fake_identity = fake_identity,
    allowing_component = allowing_component,
    denying_component = denying_component,
    jobs_in_state = jobs_in_state,
    install = install,
    restore = restore,
    seed_component = seed_component,
    drop_component = drop_component,
    run_count = run_count,
    endpoint = endpoint,
}
