-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local sql = require("sql")
local time = require("time")

local function in_db(check)
    local db = assert(sql.get("app:db"))
    local ok, result = pcall(check, db)
    db:release()
    if not ok then error(result) end
    return result
end

local function read_store(db, registration, id)
    return {
        cursor = assert(db:query([[SELECT c.last_seq,c.last_error,j.attempts,j.max_attempts,j.status,j.scheduled_at,t.event_count,
            j.last_error AS job_error FROM kickside_projection_cursor c
            JOIN kickside_job j ON j.id=c.job_id JOIN kickside_thread t ON t.id=c.thread_id WHERE c.id=$1]],
            {registration.cursor_id}))[1],
        roots = assert(db:query([[SELECT id,content,metadata,external_id FROM kb10_nodes
            WHERE store_id=$1 AND node_type='document' ORDER BY external_id]], {id})),
    }
end

local function wait_state(registration, store_id, accepts)
    local deadline = time.now():add("30s")
    local state
    repeat
        state = in_db(function(db) return read_store(db, registration, store_id) end)
        if accepts(state.cursor) then return state end
        if state.cursor.job_error and state.cursor.status == "pending" and not state.cursor.scheduled_at then break end
        time.sleep("25ms")
    until time.now():after(deadline)
    error("scheduled KB10 checkpoint did not reach expected state: " .. assert(json.encode(state.cursor)))
end

local function caught_up(cursor)
    return tonumber(cursor.last_seq) == tonumber(cursor.event_count) and cursor.status == "pending" and not cursor.scheduled_at
end

local function metadata(row)
    return type(row.metadata) == "table" and row.metadata or assert(json.decode(row.metadata))
end

return {
    in_db = in_db,
    read_store = read_store,
    wait_state = wait_state,
    caught_up = caught_up,
    metadata = metadata,
}
