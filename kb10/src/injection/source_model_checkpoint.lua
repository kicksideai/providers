-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local canonical = require("canonical")
local hash = require("hash")
local json = require("json")
local llm = require("llm")
local ops = require("ops")
local sql = require("sql")
local time = require("time")

local M = {}
local MIN_SOURCE_BYTES = 128 * 1024
local MAX_BATCH_BYTES = 1024 * 1024
local MAX_STAGE_BYTES = 128 * 1024 * 1024
local MAX_CALLS = 1024
local RESERVE_NS = 3 * 1000000000

local function conflict(message)
    return errors.new({kind = errors.CONFLICT, retryable = false, message = message})
end

local function fingerprint(value)
    local encoded, err = canonical.encode(value)
    if err then return nil, err end
    return hash.sha256(encoded), nil
end

local function query(statement, args)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local rows, err = db:query(statement, args)
    local _, release_err = db:release()
    if err or release_err then return nil, err or release_err end
    return rows[1], nil
end

local function write(tx, statement, args)
    local result, err = tx:execute(statement, args)
    if err then return nil, err end
    if type(result) ~= "table" or result.rows_affected ~= 1 then
        return nil, conflict("knowledge preparation write lost its exact row")
    end
    return true, nil
end

local function pack(vectors, dimensions)
    if type(vectors) ~= "table" or #vectors == 0 then return nil end
    local packed = {}
    local format = "<" .. string.rep("f", dimensions)
    for i, vector in ipairs(vectors) do
        if type(vector) ~= "table" or #vector ~= dimensions then return nil end
        for _, value in ipairs(vector) do
            if type(value) ~= "number" or value ~= value or math.abs(value) > 3.4028234663852886e38 then return nil end
        end
        packed[i] = string.pack(format, table.unpack(vector))
    end
    return table.concat(packed)
end

local function unpack_vectors(payload, count, dimensions)
    if not count or #payload ~= count * dimensions * 4 then return nil end
    local rows, offset = {}, 1
    local format = "<" .. string.rep("f", dimensions)
    for i = 1, count do
        local vector = {string.unpack(format, payload, offset)}
        offset = table.remove(vector)
        rows[i] = vector
    end
    return rows
end

local hex = {}
for byte = 0, 255 do hex[string.char(byte)] = string.format("%02x", byte) end

local function model_routes(row, opts)
    local routes = {}
    for _, name in pairs({embedding = row.embedding_model, summary = opts.summary_model,
            context = opts.chunk_enrichment_model}) do
        if type(name) == "string" and name ~= "" and not routes[name] then
            local card, err = llm.resolve_model(name)
            if err or not card or card.name ~= name or type(card.providers) ~= "table" or #card.providers ~= 1 then
                return nil
            end
            routes[name] = card.providers[1]
        end
    end
    return routes
end

function M.shared()
    return apply.require_shared_database(ops.db_id()) ~= nil
end

function M.eligible(event)
    local body = type(event.body) == "table" and event.body or {}
    local size = type(body.content) == "string" and #body.content or tonumber(body.content_bytes) or 0
    local images = type(body.metadata) == "table" and body.metadata.image_artifacts
    return event.type == "kickside.knowledge.events:content.upserted" and size >= MIN_SOURCE_BYTES
        and (type(images) ~= "table" or next(images) == nil)
        and (body.content_type == "text/markdown" or body.content_type == "text/plain" or body.content_type == "text/csv")
end

function M.open(input, row, opts, owner)
    local assignment = input.checkpoint
    local event, cursor = input.events[1], assignment.cursor
    local pin, pin_err = apply.continuation(cursor)
    if pin_err then return nil, pin_err end
    if not pin and not M.eligible(event) then return nil, nil end
    local routes = model_routes(row, opts)
    if not routes then
        return nil, pin and conflict("knowledge preparation model eligibility changed") or nil
    end
    local source, source_err = fingerprint({event = event.id, body = event.body, options = opts, routes = routes})
    if not source then return nil, source_err end
    local state = {ordinal = 0, step = pin and pin.step or 0, bytes = 0}
    if pin then
        local saved, err = query([[SELECT source,progress,owner_incarnation,authority_generation
            FROM kb10_source_preparations WHERE store_id=$1 AND cursor_id=$2 AND reset_generation=$3 AND event_id=$4]],
            {row.id, cursor.id, cursor.reset_generation, event.id})
        if err then return nil, err end
        if not saved or saved.source ~= source or saved.owner_incarnation ~= owner.incarnation
            or tonumber(saved.authority_generation) ~= owner.generation then
            return nil, conflict("knowledge preparation source or owner changed")
        end
        state.bytes = tonumber(saved.progress)
        if not state.bytes or state.bytes < 0 or state.bytes > MAX_STAGE_BYTES then
            return nil, conflict("knowledge preparation size is invalid")
        end
    end

    local manifest = {{id = event.id, seq = event.seq}}
    local function save(request, payload, count)
        local ordinal = state.ordinal
        local total = state.bytes + #payload
        if #payload > MAX_BATCH_BYTES or ordinal > MAX_CALLS or total > MAX_STAGE_BYTES then
            -- Still allow the ordinary planner to complete this input. Later
            -- calls in this claim bypass the cache once its contiguous prefix ends.
            state.full = true
            return true, nil
        end
        local saved, err = apply.checkpoint(ops.db_id(), assignment.job, cursor, assignment.prefetched_last,
            {last_seq = cursor.last_seq, continuation = {event_id = event.id, item = 1, step = ordinal}},
            function(tx, dialect)
                local ok, parent_err
                if state.step == 0 then
                    ok, parent_err = write(tx, [[INSERT INTO kb10_source_preparations
                        (store_id,cursor_id,reset_generation,event_id,owner_incarnation,authority_generation,source,progress)
                        VALUES($1,$2,$3,$4,$5,$6,$7,$8)]],
                        {row.id,cursor.id,cursor.reset_generation,event.id,owner.incarnation,owner.generation,source,tostring(total)})
                else
                    ok, parent_err = write(tx, [[UPDATE kb10_source_preparations SET progress=$1
                        WHERE store_id=$2 AND cursor_id=$3 AND reset_generation=$4 AND event_id=$5]],
                        {tostring(total),row.id,cursor.id,cursor.reset_generation,event.id})
                end
                if not ok then return nil, parent_err end
                local pg = dialect == sql.type.POSTGRES
                local value = pg and "decode($7,'hex')" or "CAST($7 AS BLOB)"
                return write(tx, [[INSERT INTO kb10_source_preparation_batches
                    (store_id,cursor_id,ordinal,input_sha,output_sha,vector_count,payload)
                    VALUES($1,$2,$3,$4,$5,$6,]] .. value .. ")",
                    {row.id,cursor.id,ordinal,request,hash.sha256(payload),count,pg and payload:gsub(".",hex) or payload})
            end, manifest)
        if not saved then return nil, err end
        cursor.continuation = saved.continuation
        state.step, state.bytes, state.progressed = ordinal, total, true
        return true, nil
    end

    local function call(kind, value, options)
        if state.failure then return nil, state.failure end
        local execute = kind == "embed" and llm.embed or llm.generate
        if not routes[options.model] then
            state.failure = conflict("knowledge preparation request used an unplanned model")
            return nil, state.failure
        end
        state.ordinal = state.ordinal + 1
        local shape = kind == "embed" and value or value.messages
        local key, err = fingerprint({kind, options.model, routes[options.model], options.dimensions or false,
            options.max_tokens or false, options.temperature or false, shape})
        if not key then state.failure = err return nil, err end
        if state.ordinal <= state.step then
            local batch, read_err = query([[SELECT input_sha,output_sha,vector_count,payload
                FROM kb10_source_preparation_batches WHERE store_id=$1 AND cursor_id=$2 AND ordinal=$3]],
                {row.id, cursor.id, state.ordinal})
            if read_err or not batch or batch.input_sha ~= key or hash.sha256(batch.payload) ~= batch.output_sha then
                state.failure = read_err or conflict("knowledge preparation request or response changed")
                return nil, state.failure
            end
            if kind == "embed" then
                local embedding = unpack_vectors(batch.payload, tonumber(batch.vector_count), options.dimensions)
                if embedding and #embedding == #value then return {result = embedding}, nil end
                state.failure = conflict("knowledge preparation vector shape changed")
                return nil, state.failure
            end
            local decoded, decode_err = json.decode(batch.payload)
            if decode_err or type(decoded) ~= "table" or tonumber(batch.vector_count) ~= 0 then
                state.failure = decode_err or conflict("knowledge preparation response shape changed")
                return nil, state.failure
            end
            return decoded.result and {result = decoded.result} or nil, decoded.error
        end
        if input.execution_deadline_ns - time.now():unix_nano() <= RESERVE_NS then
            state.yielded = true
            state.failure = errors.new({kind = errors.TIMEOUT, retryable = true,
                message = "knowledge preparation reached its execution deadline"})
            return nil, state.failure
        end
        local response, provider_err = execute(value, options)
        if state.full then return response, provider_err end
        local payload, count
        if kind == "embed" then
            local vectors = response and response.result
            if type(vectors) ~= "table" or #vectors ~= #value then return response, provider_err end
            count = #vectors
            if count * options.dimensions * 4 > MAX_BATCH_BYTES then
                state.full = true
                return response, provider_err
            end
            payload = pack(vectors, options.dimensions)
            if not payload then return response, provider_err end
        else
            local result = response and response.result
            if type(result) ~= "string" then result = nil end
            payload, err = json.encode({result = result, error = provider_err and tostring(provider_err) or nil})
            if not payload then state.failure = err return nil, err end
            count = 0
        end
        local ok, save_err = save(key, payload, count)
        if not ok then state.failure = save_err return nil, save_err end
        if kind == "embed" and not state.full then
            -- Match the float32 representation used by native indexing even
            -- when this attempt proceeds immediately to final publication.
            return {result = unpack_vectors(payload, count, options.dimensions)}, nil
        end
        return response, provider_err
    end
    state.embed = function(value, options) return call("embed", value, options) end
    state.generate = function(value, options) return call("generate", value, options) end
    return state, nil
end

return M
