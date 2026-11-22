-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local ctx = require("ctx")
local engines = require("engines")
local graph = require("graph_functions")
local job_types = require("job_types")
local json = require("json")
local logger = require("logger"):named("kb10.placement")
local ops = require("ops")
local planner = require("planner")
local reader = require("reader")
local security = require("security")
local threads = require("threads_writer")
local trace = require("trace")
local tools = require("placement_tools")
local uuid = require("uuid")
local writer = require("writer")

local REQUESTED = "kickside.kb10.graph.events:placement.requested"
local GRAPH_CHANGED = "kickside.knowledge.events:graph.changed"
local KIND = "kickside.kb10.graph.placement"
local PRODUCER = "kickside.kb10.graph:enroll_placement"
local MAX_EMPTY_EVENTS = 16

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, retryable = false, message = message})
end

local function prepare(store: table, wake_id: string, id: string): (table?, number?, error?)
    local config = engines.apply_default_config(store.config, engines.resolve(store.kb_type))
    local plan, err = planner.plan({component_id = store.component_id, store_id = store.id,
        document_node_id = id, wake_id = wake_id, extraction_model = config.extraction_model,
        graph_link_depth = config.depth})
    if not plan then return nil, nil, err end
    for _, op in ipairs(plan.operations) do
        if op.kind == "create_concept" then
            op.node = tools.concept_node(op.label, op.description)
            op.node.id = op.id
            if store.embedding_model and store.embedding_model ~= "" then
                local description = op.description
                local content = description == "" and op.label or (op.label .. ": " .. description)
                local embedding, embed_err = graph.embed_text(content, graph.resolve_model(store.embedding_model))
                if embedding and #embedding == ops.VECTOR_DIMENSIONS then
                    op.embedding = embedding
                else
                    logger:warn("placement concept embedding unavailable", {store_id = store.id, error = tostring(embed_err)})
                end
            end
        end
    end
    return plan, tools.link_depth(config.depth), nil
end

local function graph_output(tx: any, dialect: string, thread_id: string, wake_id: string,
        document_id: string, actor_id: string, changes: {table}, assignment: table, event: table): (boolean?, error?)
    if #changes == 0 then return true, nil end
    local fallback
    if not event.trace_context then fallback = trace.begin("kb.graph", document_id) end
    local context, trace_err = trace.inherit(event, fallback)
    if not context then return nil, trace_err end
    local output = {}
    for index, change in ipairs(changes) do
        change.kb_id, change.actor_id = thread_id, actor_id
        local body, err = json.encode(change)
        if err then return nil, err end
        output[#output + 1] = {
            type = GRAPH_CHANGED, role = "system", body_json = body,
            external = {external_source = "knowledge.graph",
                external_id = table.concat({wake_id, document_id, tostring(index)}, ":"), external_version = "1"},
            trace_context = context,
        }
    end
    -- Core has already locked the component thread and cursor. The append and
    -- sibling wake demand commit with the graph, exact revision, and position.
    local appended, err = threads.append_system_tx(tx, dialect, thread_id, output, assignment.job.id)
    if not appended then return nil, err end
    if appended.inserted ~= #output then return nil, invalid("placement graph event already exists") end
    return true, nil
end

local function checkpoint(assignment: table, output: table, write: (any, string) -> (boolean?, error?)): (table?, error?)
    local receipt, err = apply.checkpoint(ops.db_id(), assignment.job, assignment.cursor,
        assignment.prefetched_last, output, write)
    if receipt and err then logger:warn("placement checkpoint follow-up failed", {error = tostring(err)}) end
    return receipt, err
end

local function no_graph_write(): (boolean, nil) return true, nil end

local function process_wake(input: table, assignment: table, event: table, pinned: table?): (boolean?, error?)
    local wake_id = event.body and event.body.wake_id
    if type(wake_id) ~= "string" or not uuid.validate(wake_id) then return nil, invalid("placement wake ID is invalid") end
    local store, read_err = reader.get_store(input.thread_id, true)
    if read_err and not errors.is(read_err, errors.NOT_FOUND) then return nil, read_err end
    local output = {last_seq = tonumber(event.seq)}
    local write = no_graph_write
    if store and store.kb_type == "wiki" and store.placement_cursor_id == assignment.cursor.id then
        local rows, pending_err = reader.pending_placements(store.id, wake_id, 2)
        if pending_err then return nil, pending_err end
        if #rows > 0 then
            local document_id = tostring(rows[1].id)
            local plan, max_depth, plan_err
            local custom = store.enrichment_agent_id and store.enrichment_agent_id ~= ""
            if not custom then plan, max_depth, plan_err = prepare(store, wake_id, document_id) end
            if #rows > 1 then
                output.last_seq = tonumber(assignment.cursor.last_seq)
                output.continuation = {event_id = event.id, item = pinned and pinned.item + 1 or 1, step = 1}
            end
            write = function(tx, dialect)
                local exact, claim_err = writer.consume_placement_tx(tx, dialect, store.id, wake_id, document_id, store)
                if claim_err then return nil, claim_err end
                if not exact or custom then return true, nil end
                if not plan or not max_depth then return nil, plan_err or invalid("placement plan did not return operations") end
                local changes, write_err = writer.apply_placement_tx(tx, dialect, store.id, document_id, plan, max_depth)
                if not changes then return nil, write_err end
                return graph_output(tx, dialect, input.thread_id, wake_id, document_id, assignment.cursor.actor_id,
                    changes, assignment, event)
            end
        end
    end
    local result, err = checkpoint(assignment, output, write)
    if not result then return nil, err end
    return true, nil
end

local function run(input: table): (boolean?, error?)
    local assignment = type(input) == "table" and input.checkpoint
    local proof, proof_err = ctx.get("kickside.core.projection_checkpoint")
    if proof_err then return nil, proof_err end
    local actor = security.actor()
    local cursor = assignment and assignment.cursor
    if not actor or type(proof) ~= "table" or type(proof.owner) ~= "table"
        or type(proof.owner.enrollment) ~= "table" or proof.owner.enrollment.producer ~= PRODUCER
        or type(cursor) ~= "table" or type(assignment.job) ~= "table" or cursor.actor_id ~= actor:id()
        or proof.owner.component_id ~= input.thread_id or cursor.thread_id ~= input.thread_id
        or proof.cursor_id ~= cursor.id or proof.job_id ~= assignment.job.id
        or not input.projection or input.projection.kind ~= KIND or not input.events or not input.events[1] then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "placement requires its admitted Wiki checkpoint and execution identity"})
    end
    local pinned, pin_err = apply.continuation(cursor)
    if pin_err then return nil, pin_err end
    local first = input.events[1]
    if first.type == REQUESTED then return process_wake(input, assignment, first, pinned) end
    if pinned then return nil, invalid("placement continuation requires its original wake") end

    -- Physical progress includes unrelated events and this worker's graph
    -- outputs. They require no model work and cannot publish further events.
    for index, event in ipairs(input.events) do
        if index > MAX_EMPTY_EVENTS or event.type == REQUESTED then break end
        local receipt, err = checkpoint(assignment, {last_seq = tonumber(event.seq)}, no_graph_write)
        if not receipt then return nil, err end
        cursor.last_seq, cursor.continuation = receipt.last_seq, receipt.continuation
    end
    return true, nil
end

return {run = function(input)
    local done, err = run(input)
    if done then return {checkpointed = true} end
    return {ok = false, error_native = job_types.error_to_data(job_types.native_error(err) or errors.new({
        kind = errors.UNAVAILABLE, retryable = true, message = tostring(err)}))}
end}
