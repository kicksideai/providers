-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local job_types = require("job_types")
local logger = require("logger"):named("kb10.registered.source")
local materializer_store = require("materializer_store")
local ops = require("ops")
local ordinary = require("ordinary")
local planner = require("planner")
local process = require("process")
local writer = require("writer")

local function publish(input)
    local assignment = input.checkpoint
    local events = input.events
    if not assignment or assignment.registered ~= true or not events or not events[1] then
        return nil, errors.new({kind = errors.INVALID, retryable = false, message = "registered source has no assigned input"})
    end
    local cursor = assignment.cursor
    cursor.body = input.projection.body
    local pages, page_order, stores, placements = {}, {}, {}, {}
    local function stage_fanout(recipients, stage)
        stores = recipients
        local store = setmetatable({}, {__index = materializer_store})
        store.plan = function(kind, args)
            local id = args.store_id
            if not stores[id] then
                return nil, errors.new({kind = errors.INVALID, message = "source mutation has no admitted destination"})
            end
            if not pages[id] then
                pages[id] = planner.new(id, input.thread_id, true)
                page_order[#page_order + 1] = id
            end
            return pages[id].store.plan(kind, args)
        end
        return stage(store)
    end
    local output, prepare_err = ordinary.run(input, {
        -- Close after one complete event so selectors from different events
        -- see the prior committed revision. Core leaves the suffix scheduled.
        close_before = function() return true end,
        stage_fanout = stage_fanout,
        execution_identity_row = {actor_id = cursor.actor_id, actor_context = cursor.execution_identity_json},
        send = function(pid, topic, message)
            placements[#placements + 1] = {pid = pid, topic = topic, message = message}
            return true, nil
        end,
    })
    if not output then return nil, prepare_err end
    output.last_seq = output.last_seq or assignment.prefetched_last
    local manifest = {{id = events[1].id, seq = events[1].seq}}
    local function write(tx, dialect)
        local lock_err = writer.lock_source_fanout_tx(tx, dialect, stores)
        if lock_err then return nil, lock_err end
        for _, id in ipairs(page_order) do
            local written, err = planner.write(tx, dialect, id, pages[id].plans, true)
            if not written then return nil, err end
        end
        return true, nil
    end
    local receipt, checkpoint_err = apply.checkpoint(ops.db_id(), assignment.job, cursor,
        assignment.prefetched_last, output, write, manifest)
    if not receipt then return nil, checkpoint_err end
    if checkpoint_err then
        logger:warn("registered source checkpoint follow-up failed", {cursor_id = cursor.id, error = tostring(checkpoint_err)})
    end
    -- Placement still uses its existing in-memory delivery channel.
    for _, request in ipairs(placements) do
        local called, sent, err = pcall(process.send, request.pid, request.topic, request.message)
        if not called or not sent or err then
            logger:warn("graph placement request failed", {component_id = request.message.component_id,
                error = tostring(err or sent)})
        end
    end
    return {checkpointed = true}, nil
end

return {run = function(input)
    local done, err = publish(input)
    if done then return done end
    return {ok = false, error_native = job_types.error_to_data(job_types.native_error(err) or errors.new({
        kind = errors.UNAVAILABLE, retryable = true, message = tostring(err)}))}
end}
