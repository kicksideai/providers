-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Private, single-event work. Core fences every mutation of these rows with
-- the existing registered cursor, execution, event and continuation.
local json = require("json")
local sql = require("sql")
local ops = require("ops")
local search = require("search")
local M = {}

local function query(statement, params)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local rows, err = db:query(statement, params)
    local _, release_err = db:release()
    if err or release_err then return nil, err or release_err end
    return rows, nil
end

function M.content(store_id, cursor, event_id)
    local rows, err = query(
        [[SELECT content FROM kb10_source_preparations
        WHERE store_id=$1 AND cursor_id=$2 AND generation=$3 AND event_id=$4]],
        { store_id, cursor.id, cursor.generation, event_id }
    )
    if not rows then return nil, err end
    if not rows[1] then
        return nil, errors.new({ kind = errors.INTERNAL, message = "source preparation content missing" })
    end
    return rows[1].content, nil
end

function M.load(store_id, cursor, event_id)
    local rows, err = query(
        [[SELECT source,progress FROM kb10_source_preparations
        WHERE store_id=$1 AND cursor_id=$2 AND generation=$3 AND event_id=$4]],
        { store_id, cursor.id, cursor.generation, event_id }
    )
    if not rows then return nil, err end
    if not rows[1] then
        return nil, errors.new({ kind = errors.INTERNAL, message = "source preparation missing at committed continuation" })
    end
    local source, decode_err = json.decode(rows[1].source)
    if decode_err then return nil, decode_err end
    local progress, progress_err = json.decode(rows[1].progress)
    if progress_err then return nil, progress_err end
    if progress.phase == "plan" then
        local content, content_err = M.content(store_id, cursor, event_id)
        if not content then return nil, content_err end
        source.document.content = content
    end
    return { source = source, progress = progress }, nil
end

function M.begin_tx(tx, dialect, store_id, cursor, event_id, source, progress)
    -- Rewind replaces this cursor's private work. Unregistered cursors can
    -- leave private rows until the next preparation or the store teardown.
    local owner = dialect == sql.type.POSTGRES and "CAST(p.cursor_id AS UUID)" or "p.cursor_id"
    local stale = [[SELECT p.cursor_id FROM kb10_source_preparations p WHERE p.store_id=$1
        AND (p.cursor_id=$2 OR NOT EXISTS (SELECT 1 FROM kickside_projection_cursor c
            WHERE c.id=]] .. owner .. [[ AND c.generation=p.generation))]]
    for _, table_name in ipairs({ "kb10_source_preparation_rows", "kb10_source_preparations" }) do
        local _, err = tx:execute(
            "DELETE FROM " .. table_name .. " WHERE store_id=$1 AND cursor_id IN (" .. stale .. ")",
            { store_id, cursor.id }
        )
        if err then return nil, err end
    end
    local content = source.document.content
    source.document.content = nil
    local encoded, encode_err = json.encode(source)
    source.document.content = content
    if encode_err then return nil, encode_err end
    local state, state_err = json.encode(progress)
    if state_err then return nil, state_err end
    local _, err = tx:execute(
        [[INSERT INTO kb10_source_preparations
        (store_id,cursor_id,generation,event_id,content,source,progress) VALUES ($1,$2,$3,$4,$5,$6,$7)]],
        { store_id, cursor.id, cursor.generation, event_id, content, encoded, state }
    )
    if err then return nil, err end
    return true, nil
end

function M.rows_tx(tx, store_id, cursor_id, rows)
    local values = {}
    for i, row in ipairs(rows) do
        local metadata, err = json.encode(row.metadata)
        if err then return nil, err end
        values[i] = { store_id, cursor_id, row.ordinal, row.content, metadata }
    end
    local err = search.insert_rows_tx(
        tx,
        "kb10_source_preparation_rows",
        { "store_id", "cursor_id", "ordinal", "content", "metadata" },
        values
    )
    if err then return nil, err end
    return true, nil
end

function M.page(store_id, cursor_id, ordinal, limit)
    return query(
        [[SELECT ordinal,content,metadata FROM kb10_source_preparation_rows
        WHERE store_id=$1 AND cursor_id=$2 AND ordinal>=$3 ORDER BY ordinal LIMIT $4]],
        { store_id, cursor_id, ordinal, limit }
    )
end

function M.vectors_tx(tx, dialect, store_id, cursor_id, first, vectors)
    local rows = {}
    for i, vector in ipairs(vectors) do
        rows[i] = { ordinal = first + i - 1, embedding = ops.vector_to_string(vector) }
    end
    local encoded, encode_err = json.encode(rows)
    if encode_err then return nil, encode_err end
    local statement
    if dialect == sql.type.SQLITE then
        statement = [[UPDATE kb10_source_preparation_rows AS r SET embedding=vec_f32(json_extract(j.value,'$.embedding'))
            FROM json_each($1) AS j WHERE r.store_id=$2 AND r.cursor_id=$3 AND r.embedding IS NULL
            AND r.ordinal=json_extract(j.value,'$.ordinal')]]
    else
        statement = [[UPDATE kb10_source_preparation_rows AS r SET embedding=(j.value->>'embedding')::vector
            FROM jsonb_array_elements($1::jsonb) j WHERE r.store_id=$2 AND r.cursor_id=$3 AND r.embedding IS NULL
            AND r.ordinal=(j.value->>'ordinal')::integer]]
    end
    local result, err = tx:execute(statement, { encoded, store_id, cursor_id })
    if err then return nil, err end
    if tonumber(result.rows_affected) ~= #vectors then
        return nil, errors.new({ kind = errors.INTERNAL, message = "prepared source embedding range changed" })
    end
    return true, nil
end

function M.progress_tx(tx, store_id, cursor_id, state)
    local encoded, encode_err = json.encode(state)
    if encode_err then return nil, encode_err end
    local updated, err = tx:execute(
        [[UPDATE kb10_source_preparations SET progress=$1 WHERE store_id=$2 AND cursor_id=$3]],
        { encoded, store_id, cursor_id }
    )
    if err then return nil, err end
    if tonumber(updated.rows_affected) ~= 1 then
        return nil, errors.new({ kind = errors.INTERNAL, message = "source preparation disappeared" })
    end
    return true, nil
end

function M.children_tx(tx, store_id, cursor_id, first, base, limit)
    local rows, err = tx:query(
        [[SELECT ordinal,content,metadata FROM kb10_source_preparation_rows
        WHERE store_id=$1 AND cursor_id=$2 AND ordinal>=$3 AND embedding IS NOT NULL ORDER BY ordinal LIMIT $4]],
        { store_id, cursor_id, first, limit }
    )
    if err then return nil, err end
    local children = {}
    for i, row in ipairs(rows) do
        if tonumber(row.ordinal) ~= first + i - 1 then
            return nil, errors.new({ kind = errors.INTERNAL, message = "source preparation has an incomplete child" })
        end
        local metadata, decode_err = json.decode(row.metadata)
        if decode_err then return nil, decode_err end
        for key, value in pairs(base) do
            if metadata[key] == nil then metadata[key] = value end
        end
        local kind = first + i - 1 == 0 and "summary" or "chunk"
        metadata.role = kind
        children[i] =
            { node = { node_type = kind, content = row.content, content_type = "text/plain", metadata = metadata } }
    end
    return children, nil
end

function M.clear_tx(tx, store_id, cursor_id)
    for _, table_name in ipairs({ "kb10_source_preparation_rows", "kb10_source_preparations" }) do
        local _, err =
            tx:execute("DELETE FROM " .. table_name .. " WHERE store_id=$1 AND cursor_id=$2", { store_id, cursor_id })
        if err then return nil, err end
    end
    return true, nil
end

return M
