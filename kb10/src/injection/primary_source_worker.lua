-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local json = require("json")
local process = require("process")
local component = require("component")
local enrichment = require("enrichment")
local logger = require("logger"):named("kb10.source.publication")
local ordinary = require("ordinary")
local extractor = require("extractor")
local materializer = require("materializer")
local store = require("materializer_store")
local planner = require("planner")
local slots = require("slots")
local apply = require("apply")
local core_db = require("core_db")
local jobs = require("job_types")

local GROUP_RECEIPT_BYTES = 1024 * 1024
local fold_fields = {"last_from_seq", "last_to_seq", "last_status", "last_run_at", "last_error", "kb_results",
    "source_finalizer_pending", "post_materialization_errors", "last_failed_batch", "dead_lettered_batches"}

local function conflict(message)
    return errors.new({kind = errors.CONFLICT, retryable = true, message = message})
end

local function same_projection(saved, cursor, owner)
    return saved.cursor == cursor.id and saved.projection == cursor.projection_id and
        saved.reset == cursor.reset_generation and saved.incarnation == owner.incarnation
end

local function save_output(out, keys, cursor, prior)
    local result = {patch = out.patch, last_seq = out.last_seq, append_events = out.append_events}
    if out.body then
        result.fields, result.removed, result.sources = {}, {}, {}
        for _, key in ipairs(fold_fields) do
            if key ~= "dead_lettered_batches" and out.body[key] ~= prior[key] then
                if out.body[key] == nil then result.removed[#result.removed + 1] = key else result.fields[key] = out.body[key] end
            end
        end
        if out.body.dead_lettered_batches ~= prior.dead_lettered_batches then
            local old, added = {}, {}
            for _, batch in ipairs(prior.dead_lettered_batches or {}) do old[batch] = true end
            for _, batch in ipairs(out.body.dead_lettered_batches or {}) do
                if not old[batch] then added[#added + 1] = batch end
            end
            result.dead_letters = {added = added, keep = #(out.body.dead_lettered_batches or {}) - #added}
        end
        local state = out.body.kbs and out.body.kbs[cursor.thread_id]
        if state then
            result.has_state = true
            for key in pairs(keys) do result.sources[key] = state.sources[key] or false end
        end
    end
    return result
end

local function restore(saved, cursor)
    local result = {patch = saved.patch, append_events = saved.append_events, last_seq = saved.last_seq}
    if saved.fields then
        local body = cursor.body
        body.kbs = body.kbs or {}
        if saved.has_state then
            local state = body.kbs[cursor.thread_id] or {}
            state.sources = state.sources or {}
            for key, value in pairs(saved.sources) do
                if value == false then state.sources[key] = nil else state.sources[key] = value end
            end
            body.kbs[cursor.thread_id] = state
        end
        if saved.dead_letters then
            local previous, updated = body.dead_lettered_batches or {}, {}
            for i = #previous - saved.dead_letters.keep + 1, #previous do updated[#updated + 1] = previous[i] end
            for _, batch in ipairs(saved.dead_letters.added) do updated[#updated + 1] = batch end
            body.dead_lettered_batches = updated
        end
        for key, value in pairs(saved.fields) do body[key] = value end
        for _, key in ipairs(saved.removed) do body[key] = nil end
        result.body = body
    end
    return result
end

local function publish(input)
    local a = input.checkpoint
    local proof, proof_err = ctx.get("kickside.core.projection_checkpoint")
    if proof_err then return nil, proof_err end
    if not a or not proof or not proof.owner then return nil, conflict("missing admitted knowledge source") end
    local cursor, owner = a.cursor, proof.owner
    local id = cursor.thread_id
    if not proof.filter or owner.component_id ~= id or proof.cursor_id ~= cursor.id or proof.job_id ~= a.job.id
        or proof.execution_seq ~= a.job.execution_seq or proof.lease_token ~= a.job.lease_token
        or proof.from_seq ~= cursor.last_seq or proof.to_seq ~= a.prefetched_last or proof.reset_generation ~= cursor.reset_generation then
        return nil, conflict("knowledge source assignment changed")
    end
    local targets = cursor.body.worker_config and cursor.body.worker_config.target_kb_ids
    if targets and (#targets ~= 1 or targets[1] ~= id) then
        return nil, errors.new({kind = errors.INVALID, message = "primary source publication requires a single local target"})
    end
    local _, access_err = component.validate_access(id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local slot, slot_err = slots.read(id)
    if not slot then return nil, slot_err end
    local saved, decode_err
    if slot.result then saved, decode_err = json.decode(slot.result) end
    if decode_err then return nil, decode_err end
    local db_id = core_db.id()
    local shared, shared_err = slots.shared(db_id)
    if shared_err then return nil, shared_err end
    local output, manifest, requests, write, receipt, ack_err
    local function acknowledge(writer)
        return apply.checkpoint(db_id, a.job, cursor, a.prefetched_last, output, writer, manifest)
    end
    if saved and same_projection(saved, cursor, owner) and saved.through > cursor.last_seq then
        if saved.authority ~= owner.generation or saved.prior ~= cursor.last_seq or saved.through > a.prefetched_last then
            return nil, conflict("pending knowledge publication belongs to another source position")
        end
        manifest = saved.manifest
        for index, required in ipairs(manifest) do
            local event = input.events[index]
            if not event or event.id ~= required.id or event.seq ~= required.seq then
                return nil, conflict("pending knowledge publication inputs changed")
            end
        end
        output, requests = restore(saved.output, cursor), saved.requests
        write = function(tx, dialect)
            if shared then return slots.check(tx, dialect, id, slot.token) end
            return slots.current(id, slot.token)
        end
    else
        local row, store_err = store.get_store(store, {component_id = id})
        if not row then return nil, store_err end
        local engine, engine_err = materializer.resolve_engine(row)
        if not engine then return nil, engine_err end
        local page = planner.new(row.id, id)
        local receipt_bytes, request_count = 0, 0
        local target = {store = page.store, store_row = row, engine = engine, source_thread_id = id}
        requests = {}
        local seen = {}
        local selected = false
        local function next_source(event)
            local body = type(event.body) == "table" and event.body or {}
            local meta = type(body.metadata) == "table" and body.metadata or {}
            local source, external_id, version = extractor.source_identity(event, meta)
            local key = source and external_id and source .. ":" .. external_id or event.id
            local node_delete = meta.node_id ~= nil
            local lineage_bytes = #key + #(version or "")
            local close = page.full() or receipt_bytes + lineage_bytes >= GROUP_RECEIPT_BYTES or seen[key] or selected or node_delete
            seen[key], selected = true, node_delete
            return close
        end
        next_source(input.events[1])
        local prior = {}
        for _, key in ipairs(fold_fields) do prior[key] = input.projection.body[key] end
        local events = input.events
        local previous_fields = {}
        for key, value in pairs(prior) do previous_fields[key] = value end
        local out, reduce_err = ordinary.run(input, {single_source = true, resolve_materialized_store = function() return target end,
            close_before = next_source,
            after_source = function(result, event)
                -- Sum complete per-input contributions, including diagnostics,
                -- manifest and placement requests. The final item can cross
                -- the grouping budget. Its accepted output still advances.
                local keys = {}
                if page.last_key then keys[page.last_key] = true end
                local contribution = save_output({body = input.projection.body, append_events = result.append_events}, keys, cursor, previous_fields)
                contribution.input = {id = event.id, seq = event.seq}
                contribution.requests = {}
                for i = request_count + 1, #requests do contribution.requests[#contribution.requests + 1] = requests[i] end
                receipt_bytes = receipt_bytes + #assert(json.encode(contribution))
                request_count, page.last_key = #requests, nil
                for _, key in ipairs(fold_fields) do previous_fields[key] = input.projection.body[key] end
            end,
            execution_identity_row = {actor_id = cursor.actor_id, actor_context = cursor.execution_identity_json},
            send = function(_pid, _topic, message)
                requests[#requests + 1] = {document_node_id = message.document_node_id, user_id = message.user_id}
                return true, nil
            end})
        if not out then return nil, reduce_err end
        out.last_seq = out.last_seq or input.range.to_seq
        manifest = {}
        for _, event in ipairs(events) do
            if event.seq <= out.last_seq then manifest[#manifest + 1] = {id = event.id, seq = event.seq} end
        end
        if #manifest == 0 then return nil, conflict("knowledge source publication made no progress") end
        output = out
        local function mutate(tx, dialect) return planner.write(tx, dialect, row.id, page.plans) end
        if #page.plans == 0 then
            write = function() return true, nil end
        elseif shared then
            write = function(tx, dialect)
                local fenced, err = slots.check(tx, dialect, id, slot.token)
                if not fenced then return nil, err end
                return mutate(tx, dialect)
            end
        else
            local encoded, encode_err = json.encode({cursor = cursor.id, projection = cursor.projection_id,
                reset = cursor.reset_generation, incarnation = owner.incarnation, authority = owner.generation,
                prior = cursor.last_seq, through = out.last_seq, manifest = manifest, requests = requests,
                output = save_output(out, page.sources, cursor, prior)})
            if not encoded then return nil, encode_err end
            receipt, ack_err = slots.publish(id, slot, encoded, mutate, acknowledge)
        end
    end
    if write then receipt, ack_err = acknowledge(write) end
    if not receipt then return nil, ack_err end
    for _, request in ipairs(requests or {}) do
        local sent, err = process.send(enrichment.PROCESS, enrichment.TOPIC, {store_id = id, component_id = id,
            document_node_id = request.document_node_id, user_id = request.user_id, execution_identity = {
                actor_id = cursor.actor_id, actor_context = cursor.execution_identity_json}})
        if err or sent == false then logger:warn("graph placement request failed", {component_id = id, error = tostring(err)}) end
    end
    return {checkpointed = true}, nil
end

return {run = function(input)
    local done, err = publish(input)
    if not done then
        return {ok = false, error_native = jobs.error_to_data(jobs.native_error(err) or errors.new({
            kind = errors.UNAVAILABLE, retryable = true, message = tostring(err)}))}
    end
    return done
end}
