local json = require("json")
local time = require("time")
local process = require("process")
local logger = require("logger"):named("knowledge.injection.digest_worker")
local digest = require("digest")
local execution_identity = require("execution_identity")
local enrichment_consts = require("enrichment_consts")

local DIGEST_REQUEST_EVENT_TYPE = "kickside.knowledge.events:digest.requested"
local TREATMENT_REQUEST_EVENT_TYPE = "kickside.knowledge.events:treatment.requested"
local GRAPH_CHANGED_EVENT_TYPE = "kickside.knowledge.events:graph.changed"
local GRAPH_CHANGED_EXTERNAL_SOURCE = "knowledge.graph.meta"

type DigestUserIds = { [string]: boolean }

type DigestResult = {
    component_id: string,
    store_id: string,
    auto_summary: string,
    auto_description: string,
    summary_count: integer,
}

type DigestLibrary = {
    run_for_component: (
        component_id: string
    ) -> ({
        component_id: string,
        store_id: string,
        auto_summary: string,
        auto_description: string,
        summary_count: integer,
    }?, string?),
}

type DigestWorkerDeps = {
    execution_identity_row: any?,
    digest: DigestLibrary?,
    send: ((process_id: string, topic: string, payload: { [string]: any }) -> (any, string?))?,
}

-- Durable digest projection worker. A second cursor on the KB's canonical ingest
-- thread. Raw content events are consumed for cursor progress only; the source
-- projection appends a durable digest.requested event after it has materialized
-- those documents. This makes the digest follow the document read-model commit
-- instead of racing it on a time window.
--
-- Input (projection worker contract): { thread_id, projection, worker_config, events }.
-- The worker regenerates the KB descriptions once for the target KB and broadcasts
-- the refreshed summary to the users who drove the events.

local function trim(s: any): string
    if type(s) ~= "string" then return "" end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function decode_object(value: any): { [string]: any }
    if type(value) == "table" then return value :: { [string]: any } end
    if type(value) ~= "string" or value == "" then return {} end
    local decoded, err = json.decode(value)
    if err or type(decoded) ~= "table" then return {} end
    return decoded :: { [string]: any }
end

-- The runtime delivers the projection's worker_config either inline on the input,
-- on the projection, or (as persisted) inside the projection's JSON body — the
-- same resolution source_worker uses.
local function resolve_worker_config(input: any, projection: any): { [string]: any }
    if type(input.worker_config) == "table" then return input.worker_config :: { [string]: any } end
    local proj = type(projection) == "table" and projection or {}
    if type(proj.worker_config) == "table" then return proj.worker_config :: { [string]: any } end
    local body = decode_object(proj.body)
    if type(body.worker_config) == "table" then return body.worker_config :: { [string]: any } end
    return {}
end

local function event_body(event: any): { [string]: any }
    if type(event) ~= "table" then return {} end
    local ev = event :: table
    if type(ev.body) == "table" then return ev.body :: { [string]: any } end
    if type(ev.body_json) == "string" and ev.body_json ~= "" then
        return decode_object(ev.body_json)
    end
    return decode_object(ev.body)
end

local function event_kb_id(event: any): string
    local body = event_body(event)
    return trim(body.kb_id)
end

local function event_user_id(event: any): string
    local body = event_body(event)
    local uid = trim(body.actor_id)
    if uid ~= "" then return uid end
    local meta = type(body.metadata) == "table" and body.metadata or {}
    return trim(meta.actor_id)
end

local function event_type(event: any): string
    if type(event) ~= "table" then return "" end
    return trim((event :: table).type)
end

local function max_event_seq(events: { any }): integer
    local max_seq = 0
    for _, ev in ipairs(events) do
        if type(ev) == "table" then
            local n = math.floor(tonumber((ev :: any).seq) or 0)
            if n > max_seq then max_seq = n end
        end
    end
    return max_seq
end

local function digest_meta_append(thread_id: string, projection_id: string, kb_id: string, digest_result: DigestResult, events: { any }): { table }?
    local summary = trim(digest_result.auto_summary)
    local description = trim(digest_result.auto_description)
    if summary == "" and description == "" then return nil end

    local seq_key = tostring(max_event_seq(events))
    if seq_key == "0" then
        seq_key = trim(digest_result.store_id)
        if seq_key == "" then seq_key = "latest" end
    end
    local projection_key = trim(projection_id)
    if projection_key == "" then projection_key = "digest" end

    return {
        {
            thread_id = thread_id,
            events = {
                {
                    type = GRAPH_CHANGED_EVENT_TYPE,
                    role = "system",
                    body = {
                        kb_id = kb_id,
                        reason = "digest.updated",
                        auto_summary = summary,
                        auto_description = description,
                    },
                    external = {
                        external_source = GRAPH_CHANGED_EXTERNAL_SOURCE,
                        external_id = "digest-updated:" .. kb_id .. ":" .. projection_key .. ":" .. seq_key,
                        external_version = "v1",
                    },
                },
            },
        },
    }
end

local function current_execution_identity_row(deps: DigestWorkerDeps?): (any?, string?)
    if deps and type(deps.execution_identity_row) == "table" then
        return deps.execution_identity_row, nil
    end
    local frozen, capture_err = execution_identity.capture()
    if capture_err or not frozen then
        return nil, tostring(capture_err or "capture failed")
    end
    local row, row_err = execution_identity.to_row(frozen)
    if row_err or not row then
        return nil, tostring(row_err or "encode failed")
    end
    return row, nil
end

local function run_with_deps(input_raw: any, deps: DigestWorkerDeps?)
    deps = deps or {}
    local input = decode_object(input_raw)

    local projection = type(input.projection) == "table" and input.projection or {}
    local worker_config = resolve_worker_config(input, projection)

    local events = type(input.events) == "table" and input.events or {}
    local digest_requested = false
    local treatment_requested = false

    -- Target KB: the projection pins it via worker_config; fall back to the events'
    -- own kb_id (every knowledge content event carries it).
    local kb_id = ""
    local targets = type(worker_config.target_kb_ids) == "table" and worker_config.target_kb_ids or {}
    for _, id in ipairs(targets) do
        local s = trim(tostring(id))
        if s ~= "" then kb_id = s; break end
    end

    local user_ids: DigestUserIds = {}
    for _, ev in ipairs(events) do
        local et = event_type(ev)
        if et == DIGEST_REQUEST_EVENT_TYPE then digest_requested = true end
        if et == TREATMENT_REQUEST_EVENT_TYPE then treatment_requested = true end
        if kb_id == "" then kb_id = event_kb_id(ev) end
        local uid = event_user_id(ev)
        if uid ~= "" then user_ids[uid] = true end
    end

    if not digest_requested and not treatment_requested then
        logger:debug("digest worker skipped: waiting for source finalizer request", { events = #events, kb_id = kb_id })
        return {
            patch = { last_run_at = time.now():utc():format(time.RFC3339), last_status = "skipped_no_request" },
            metrics = { events_seen = #events, digest_requested = false, kb_id = kb_id },
        }, nil
    end

    if kb_id == "" then
        logger:warn("digest worker skipped: no kb_id resolved", { events = #events })
        return {
            patch = { last_run_at = time.now():utc():format(time.RFC3339), last_status = "skipped_no_kb" },
            metrics = { events_seen = #events, digest_requested = true },
        }, nil
    end

    local append_events = nil
    if digest_requested then
        logger:info("digest worker invoked", { kb_id = kb_id, events = #events })
        local digest_lib: DigestLibrary = deps.digest or digest
        local digest_result, err = digest_lib.run_for_component(kb_id)
        if err then
            logger:error("digest run failed", { kb_id = kb_id, error = tostring(err) })
            return nil, "digest failed: " .. tostring(err)
        end
        if digest_result then
            local projection_id = trim((projection :: any).id) ~= "" and trim((projection :: any).id) or trim((projection :: any).projection_id)
            append_events = digest_meta_append(trim(input.thread_id), projection_id, kb_id, digest_result, events :: { any })
        end
    end

    -- Forward the treatment marker to the enrichment service, which holds the system
    -- actor required to run the treatment dataflow agent. It debounces per-KB and runs
    -- only when the KB is graph-shaped and treatment is enabled (or forced manually).
    if treatment_requested then
        local one_uid = ""
        for uid in pairs(user_ids) do one_uid = uid; break end
        local identity_row, identity_err = current_execution_identity_row(deps)
        if identity_err or not identity_row then
            return nil, "treatment identity capture failed: " .. tostring(identity_err)
        end
        local send = deps.send or process.send
        local sent, send_err = send(enrichment_consts.PROCESS, enrichment_consts.TOPIC, {
            kind = "treat",
            component_id = kb_id,
            user_id = one_uid ~= "" and one_uid or nil,
            execution_identity = identity_row,
        })
        if send_err or sent == false then
            logger:warn("treatment forward failed", { kb_id = kb_id, error = tostring(send_err) })
        else
            logger:info("treatment forwarded to enrichment service", { kb_id = kb_id })
        end
    end

    return {
        patch = { last_run_at = time.now():utc():format(time.RFC3339), last_status = digest_requested and "digested" or "treatment_forwarded" },
        metrics = { events_seen = #events, kb_id = kb_id },
        append_events = append_events,
    }, nil
end

local function run(input_raw)
    return run_with_deps(input_raw, { digest = digest })
end

return { run = run, run_with_deps = run_with_deps }
