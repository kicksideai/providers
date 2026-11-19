-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local job_types = require("job_types")
local error_envelope = require("error_envelope")
local extractor = require("extractor")
local legacy_worker = require("legacy_worker")
local materializer = require("materializer")
local materializer_store = require("materializer_store")
local ops = require("ops")
local writer = require("writer")
local time = require("time")
local log = require("logger"):named("kb10.source.checkpoint")

local UPSERT = "kickside.knowledge.events:content.upserted"
local DELETE = "kickside.knowledge.events:content.deleted"

local function invalid(message)
    return errors.new({kind = errors.INVALID, retryable = false, message = message})
end

local function dependency(scope, failure)
    local cause = job_types.native_error(failure)
    local kind = cause and cause:kind() or errors.UNAVAILABLE
    if job_types.is_deterministic_kind(kind) then kind = errors.UNAVAILABLE end
    return errors.new({kind = kind, retryable = true, message = "knowledge source " .. scope .. " unavailable",
        details = {scope = scope, cause = cause and error_envelope.encode(cause) or nil}})
end

local function target_config(cursor)
    local config = cursor.body.worker_config or {}
    local targets = config.target_kb_ids
    if targets and (#targets ~= 1 or targets[1] ~= cursor.thread_id) then
        return nil, invalid("checkpointed knowledge source requires one registered local target")
    end
    local store, store_err = materializer_store:get_store({component_id = cursor.thread_id})
    if store_err or not store then return nil, dependency("store", store_err) end
    local engine, engine_err = materializer.resolve_engine(store)
    if not engine then return nil, invalid(tostring(engine_err)) end
    local admitted = {}
    for _, shape in ipairs(cursor.body.events and cursor.body.events.input or {}) do admitted[shape.type] = true end
    return {store = materializer_store, store_row = store, engine = engine, source_thread_id = cursor.thread_id,
        config = config, input_types = admitted}, nil
end

local function prepare(target, event, deadline)
    if event.type ~= UPSERT and event.type ~= DELETE then
        if target.input_types[event.type] then
            return nil, invalid("checkpointed knowledge source has no extractor for a declared event")
        end
        return function() return true end
    end
    event.external = {external_source = event.external_source, external_id = event.external_id,
        external_version = event.external_version}
    local extracted, extract_err = extractor.checkpoint_input(event)
    if not extracted then return nil, dependency("artifact", extract_err) end
    if extracted.error then return nil, invalid(extracted.error) end
    local rejected = extracted.rejection
    local doc = rejected and rejected.document or extracted.documents[1] or extracted.deletes[1]
    if not doc then return nil, invalid("knowledge event has no source item") end
    local _, lineage_err = legacy_worker.ensure_source_lineage(doc, event, target.source_thread_id)
    if lineage_err then return nil, invalid(lineage_err) end
    local store_id = target.store_row.id
    if rejected then
        return function(tx, dialect)
            local id, err = writer.reject_source_revision_tx(tx, dialect, store_id, target.source_thread_id,
                doc.metadata, rejected.code)
            return id ~= nil, err
        end
    end
    if event.type == DELETE then
        local body = type(event.body) == "table" and event.body or {}
        local selected = type(body.metadata) == "table" and body.metadata.node_id or nil
        return function(tx, dialect)
            local receipt, err = writer.delete_document_tx(tx, dialect, store_id, {
                node_id = selected, source_thread_id = target.source_thread_id,
                external_source = doc.external_source, external_id = doc.external_id,
            })
            return receipt ~= nil, err
        end
    end
    local replacement, model_err = legacy_worker.prepare_checkpoint_document(target, doc, target.config, deadline)
    if not replacement then return nil, dependency("model", model_err) end
    return function(tx, dialect)
        local receipt, err = writer.replace_document_tx(tx, dialect, store_id, replacement)
        return receipt ~= nil, err
    end
end

local function run(input)
    local assignment = type(input) == "table" and input.checkpoint or nil
    local deadline = type(input) == "table" and tonumber(input.execution_deadline_ns) or nil
    if type(assignment) ~= "table" or not deadline then
        return nil, invalid("checkpointed knowledge source requires a Core assignment and deadline")
    end
    local db_id, db_err = apply.require_shared_database(ops.db_id())
    if not db_id then return nil, db_err end
    local cursor = assignment.cursor
    local target, target_err = target_config(cursor)
    if not target then return nil, target_err end
    local progressed = false
    for _, event in ipairs(input.events) do
        if progressed and deadline - time.now():unix_nano() < 1000000000 then break end
        local write, prepare_err = prepare(target, event, deadline)
        if not write then return nil, prepare_err end
        local receipt, checkpoint_err = apply.checkpoint(db_id, assignment.job, cursor, assignment.prefetched_last,
            {last_seq = tonumber(event.seq)}, write)
        if not receipt then return nil, checkpoint_err end
        if checkpoint_err then log:warn("source checkpoint follow-up failed", {cursor_id = cursor.id}) end
        cursor.last_seq, cursor.continuation = receipt.last_seq, receipt.continuation
        progressed = true
    end
    return {checkpointed = true}, nil
end

return {run = function(input)
    local receipt, err = run(input)
    if err then return {ok = false, error_native = job_types.error_to_data(err)} end
    return receipt
end}
