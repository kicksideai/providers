-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Contract surface of the memory knowledge-base engine: the store lifecycle the
-- knowledge control plane drives, embeddable ingestion, scoped hybrid query,
-- bounded deletion, and maintenance.

local ctx = require("ctx")
local types = require("types")
local config = require("memory_config")
local stores = require("memory_stores")
local recall = require("memory_recall")
local runs = require("memory_runs")
local jobs = require("memory_jobs")
local thread_ingest = require("thread_ingest")
local component = require("component")

local M = {}

-- Store pages a single deletable call removes before reporting progress.
local DELETE_PAGES = 20
local QUERY_MAX = 100

local function args_of(value: any): any
    return type(value) == "table" and value or {}
end

local function context_component(): (string?, error?)
    local id = types.trim(ctx.get("component_id"))
    if id == "" then return nil, types.invalid("component_id is required in the binding context") end
    return id, nil
end

-- kb_store_lifecycle -------------------------------------------------------

function M.create_store(value: any): (any?, error?)
    local args = args_of(value)
    local component_id = types.trim(args.component_id)
    local embedding_model = types.trim(args.embedding_model)
    local opts = args_of(args.opts)
    if component_id == "" then return nil, types.invalid("component_id is required") end
    if embedding_model == "" then return nil, types.invalid("embedding_model is required") end
    local kb_type = types.trim(opts.kb_type)
    if kb_type ~= "" and kb_type ~= types.KB_TYPE then
        return nil, types.invalid("the memory engine stores kb_type '" .. types.KB_TYPE .. "', not '" .. kb_type .. "'")
    end
    local cfg = args.config or {}
    local invalid = config.validate(cfg)
    if invalid then return nil, invalid end
    local created, err = stores.create(component_id, types.KB_TYPE, embedding_model, cfg)
    if err then return nil, err end
    local effective, cfg_err = config.effective(cfg)
    if cfg_err then return nil, cfg_err end
    local _, arm_err = jobs.arm_consolidation(component_id, (effective :: any).consolidation_interval_hours)
    if arm_err then return nil, arm_err end
    return created, nil
end

function M.get_store(value: any): (any?, error?)
    local component_id = types.trim(args_of(value).component_id)
    if component_id == "" then return nil, types.invalid("component_id is required") end
    local row, err = stores.get(component_id)
    if err then return nil, err end
    local result = {}
    for k, v in pairs(row :: any) do result[k] = v end
    result.success = true
    return result, nil
end

function M.update_config(value: any): (any?, error?)
    local args = args_of(value)
    local component_id = types.trim(args.component_id)
    if component_id == "" then return nil, types.invalid("component_id is required") end
    if type(args.config) ~= "table" then return nil, types.invalid("config is required") end
    local invalid = config.validate(args.config)
    if invalid then return nil, invalid end
    local _, read_err = stores.get(component_id)
    if read_err then return nil, read_err end
    return stores.update_config(component_id, args.config)
end

local function purge(component_id: string, pages: integer): (boolean?, error?)
    for _ = 1, pages do
        local page, err = stores.purge_page(component_id)
        if err then return nil, err end
        if (page :: any).done then return true, nil end
    end
    return false, nil
end

function M.delete_store(value: any): (any?, error?)
    local component_id = types.trim(args_of(value).component_id)
    if component_id == "" then return nil, types.invalid("component_id is required") end
    while true do
        local page, err = stores.purge_page(component_id)
        if err then return nil, err end
        if (page :: any).done then return { success = true }, nil end
    end
end

-- deletable ----------------------------------------------------------------

-- Stops the ledger first, so a failed purge leaves inert rows, then removes a
-- bounded number of pages. A memory larger than one call reports pending
-- cleanup and the component teardown resumes it.
function M.delete(_value: any): (any?, error?)
    local component_id, id_err = context_component()
    if id_err then return nil, id_err end
    local _, thread_err = thread_ingest.purge_thread(component_id :: string)
    if thread_err then return nil, thread_err end
    local done, err = purge(component_id :: string, DELETE_PAGES)
    if err then return nil, err end
    if not done then
        return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "memory cleanup continues",
            details = { cleanup_pending = true, needs_continue = true } })
    end
    return { success = true }, nil
end

-- embeddable ---------------------------------------------------------------

-- Schedules content for derivation. The source id references a hash while the
-- text stays in the erasable run input.
function M.embed_content(value: any): (any?, error?)
    local req = args_of(value)
    local component_id, id_err = context_component()
    if id_err then return nil, id_err end
    local _, access_err = component.validate_access(component_id :: string, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local content = req.content
    if type(content) ~= "string" or types.trim(content) == "" then
        return { success = false, error = "content is required" }, nil
    end
    local source_event_id, hash_err = types.digest({ operation = "memory.embed_content", component_id = component_id, external_id = req.external_id, external_version = req.external_version, content = content })
    if hash_err then return { success = false, error = "memory ingest failed: " .. tostring(hash_err) }, nil end
    local queued, err = jobs.ingest(component_id :: string, source_event_id :: string, {
        { id = source_event_id, role = "document", text = types.trim(req.title) ~= "" and (types.trim(req.title) .. "\n\n" .. content) or content, created_at = types.now() },
    })
    if err or not queued then return { success = false, error = "memory ingest failed: " .. tostring(err) }, nil end
    return { success = true, status = "queued", kb_id = component_id,
        thread_id = component_id, run_id = (queued :: any).run_id, external_id = req.external_id, external_version = req.external_version }, nil
end

-- queryable ----------------------------------------------------------------

local function to_query_item(row: any): any
    return {
        id = row.id,
        content = row.content,
        meta = {
            node_type = row.kind,
            kind = row.kind,
            key = row.key,
            scope_family = row.scope_family,
            status = row.status,
            valid_at = row.valid_at,
            source = row.source,
            similarity = row.similarity,
            created_at = row.recorded_at,
        },
    }
end

function M.query(value: any): (any?, error?)
    local req = args_of(value)
    local component_id, id_err = context_component()
    if id_err then return nil, id_err end
    local query = types.trim(req.query)
    if query == "" then return nil, types.invalid("query is required") end
    local limit = math.floor(tonumber(req.limit) or 10)
    if limit < 1 or limit > QUERY_MAX then return nil, types.invalid("limit must be between 1 and " .. QUERY_MAX) end
    local offset = math.floor(tonumber(req.offset) or 0)
    if offset < 0 then return nil, types.invalid("offset must not be negative") end
    local rows, err = recall.search({
        component_id = component_id :: string, query = query, limit = offset + limit + 1,
        scopes = recall.visible_scopes(ctx.get("agent_id")),
    })
    if err then return nil, err end
    local page: { any } = {}
    for i = offset + 1, math.min(offset + limit, #(rows :: any)) do page[#page + 1] = to_query_item((rows :: any)[i]) end
    local result: { [string]: any } = { success = true, items = page, count = #page }
    if #(rows :: any) > offset + limit then result.next_offset = offset + limit end
    return result, nil
end

-- maintainable -------------------------------------------------------------

local function authorize(access: integer): (string?, error?)
    local component_id, id_err = context_component()
    if id_err then return nil, id_err end
    local _, access_err = component.validate_access(component_id :: string, access)
    if access_err then return nil, access_err end
    return component_id, nil
end

local function run_view(run: any): any?
    if not run then return nil end
    return {
        id = run.id, run_type = run.run_type, status = run.status, job_id = run.job_id, last_error = run.last_error,
        stats = run.stats, created_at = run.created_at, started_at = run.started_at, finished_at = run.finished_at,
        in_flight = run.status == types.RUN_STATUS.RUNNING or run.status == types.RUN_STATUS.SCHEDULED,
    }
end

-- Consolidation is the memory engine's whole-store rewrite; the control
-- plane's resummarize verb brings it forward.
function M.schedule_resummarize(_value: any): (any?, error?)
    local component_id, err = authorize(component.ACCESS.WRITE)
    if err then return nil, err end
    local woken, wake_err = jobs.wake_consolidation(component_id :: string)
    if wake_err then return nil, wake_err end
    local run, run_err = runs.get((woken :: any).run_id)
    if run_err then return nil, run_err end
    return { kb_id = component_id, job_id = (woken :: any).job_id, scheduled = true, run = run_view(run) }, nil
end

function M.schedule_reembed(_value: any): (any?, error?)
    local component_id, err = authorize(component.ACCESS.WRITE)
    if err then return nil, err end
    local scheduled, schedule_err = jobs.schedule_reembed(component_id :: string)
    if schedule_err then return nil, schedule_err end
    local run, run_err = runs.get((scheduled :: any).run_id)
    if run_err then return nil, run_err end
    return { kb_id = component_id, job_id = (scheduled :: any).job_id, scheduled = true, run = run_view(run) }, nil
end

function M.maintenance_status(_value: any): (any?, error?)
    local component_id, err = authorize(component.ACCESS.READ)
    if err then return nil, err end
    local consolidation, run_err = runs.get("consolidate:" .. component_id)
    if run_err then return nil, run_err end
    local reembeds, list_err = runs.list(component_id :: string, types.RUN_TYPE.REEMBED, 1)
    if list_err then return nil, list_err end
    return { resummarize = run_view(consolidation), reembed = run_view((reembeds :: any)[1]) }, nil
end

return M
