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

-- Store valid UTF-8 strings while preserving immutable zero-based byte offsets.
local BLOCK_BYTES = 256 * 1024
local function blocks_tx(tx, store_id, cursor_id, content)
    local rows = {}
    local start = 1
    while start <= #content do
        local finish = math.min(#content, start + BLOCK_BYTES - 1)
        while finish >= start and finish < #content do
            local byte = string.byte(content, finish + 1)
            if byte < 128 or byte >= 192 then break end
            finish = finish - 1
        end
        if finish < start then return nil, "invalid UTF-8 source block" end
        rows[#rows + 1] = { store_id, cursor_id, start - 1, content:sub(start, finish) }
        if #rows == 16 or finish == #content then
            local err =
                search.insert_rows_tx(tx, "kb10_source_blocks", { "store_id", "cursor_id", "start_byte", "content" }, rows)
            if err then return nil, err end
            rows = {}
        end
        start = finish + 1
    end
    return true, nil
end

function M.reader(store_id, cursor_id, size)
    local first, block = 0, ""
    return function(offset, length)
        if offset >= size then return "", nil end
        if offset < first or offset >= first + #block then
            local rows, err = query(
                [[SELECT start_byte,content FROM kb10_source_blocks
                WHERE store_id=$1 AND cursor_id=$2 AND start_byte<=$3 ORDER BY start_byte DESC LIMIT 1]],
                { store_id, cursor_id, offset }
            )
            if not rows then return nil, err end
            if not rows[1] then return nil, "missing prepared source block" end
            local start_byte = tonumber(rows[1].start_byte)
            if not start_byte then return nil, "invalid prepared source block position" end
            first, block = start_byte, rows[1].content
            if offset >= first + #block then return nil, "incomplete prepared source block" end
        end
        return block:sub(offset - first + 1, offset - first + length), nil
    end
end

function M.content(store_id, cursor_id, size)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local dialect, type_err = db:type()
    if type_err then
        db:release()
        return nil, type_err
    end
    local aggregate = dialect == sql.type.POSTGRES and "string_agg(content,'' ORDER BY start_byte)"
        or "group_concat(content,'')"
    local rows, err = db:query(
        "SELECT "
            .. aggregate
            .. [[ AS content FROM
        (SELECT content,start_byte FROM kb10_source_blocks WHERE store_id=$1 AND cursor_id=$2 ORDER BY start_byte) b]],
        { store_id, cursor_id }
    )
    local _, release_err = db:release()
    if err or release_err then return nil, err or release_err end
    local content = rows[1] and rows[1].content
    if type(content) ~= "string" or #content ~= size then return nil, "incomplete prepared source document" end
    return content, nil
end

function M.load(store_id, cursor, event_id)
    local rows, err = query(
        [[SELECT source,progress FROM kb10_source_preparations
        WHERE store_id=$1 AND cursor_id=$2 AND event_id=$3]],
        { store_id, cursor.id, event_id }
    )
    if not rows then return nil, err end
    if not rows[1] then
        return nil, errors.new({ kind = errors.INTERNAL, message = "source preparation missing at committed continuation" })
    end
    local source, decode_err = json.decode(rows[1].source)
    if decode_err then return nil, decode_err end
    local progress, progress_err = json.decode(rows[1].progress)
    if progress_err then return nil, progress_err end
    return { source = source, progress = progress }, nil
end

function M.begin_tx(tx, store_id, cursor, event_id, source, progress)
    local content = source.document.content
    source.document.content = nil
    local encoded, encode_err = json.encode(source)
    source.document.content = content
    if encode_err then return nil, encode_err end
    local state, state_err = json.encode(progress)
    if state_err then return nil, state_err end
    local _, err = tx:execute(
        [[INSERT INTO kb10_source_preparations
        (store_id,cursor_id,event_id,source,progress) VALUES ($1,$2,$3,$4,$5)]],
        { store_id, cursor.id, event_id, encoded, state }
    )
    if err then return nil, err end
    return blocks_tx(tx, store_id, cursor.id, content)
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
    local values = {}
    for i, vector in ipairs(vectors) do
        values[i] = ops.vector_to_string(vector)
    end
    local encoded, encode_err = json.encode(values)
    if encode_err then return nil, encode_err end
    -- Drive the update from one indexed ordinal range. Joining json_each to
    -- every staged row makes later SQLite batches revisit the entire sheet.
    local element = dialect == sql.type.SQLITE and "vec_f32(json_extract($1,'$[' || (ordinal-$2) || ']'))"
        or "(($1::jsonb)->>(ordinal-$2))::vector"
    local result, err = tx:execute(
        "UPDATE kb10_source_preparation_rows SET embedding="
            .. element
            .. [[
        WHERE store_id=$3 AND cursor_id=$4 AND ordinal>=$2 AND ordinal<$5 AND embedding IS NULL]],
        { encoded, first, store_id, cursor_id, first + #values }
    )
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

return M
