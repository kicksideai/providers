-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ops = require("ops")
local component = require("component")
local sql = require("sql")
local uuid = require("uuid")

local M = {}
local function conflict()
    return errors.new({kind = errors.CONFLICT, retryable = true, message = "knowledge source publication owner changed"})
end

function M.read(id)
    local db, err = ops.get_db()
    if not db then return nil, err end
    local query = [[SELECT source_publication_token AS token,source_publication_result AS result
        FROM kb10_stores WHERE id=$1 AND component_id=$1]]
    local rows, read_err = db:query(query, {id})
    if not read_err and rows[1] and not rows[1].token then
        -- Stores created before migration 15 get their first token on demand.
        local _, init_err = db:execute([[UPDATE kb10_stores SET source_publication_token=$1
            WHERE id=$2 AND component_id=$2 AND source_publication_token IS NULL]], {uuid.v7(), id})
        if init_err then read_err = init_err else rows, read_err = db:query(query, {id}) end
    end
    local _, release_err = db:release()
    if read_err or release_err then return nil, read_err or release_err end
    return rows[1], rows[1] == nil and conflict() or nil
end

-- SQLite serializes writers for a file even when the host exposes two SQL
-- resource IDs. Use the Core transaction for a shared on-disk main database.
-- An empty main path can identify independent in-memory databases.
function M.shared(core_id)
    if ops.db_id() == core_id then return true, nil end
    local function main_file(resource_id)
        local db, err = sql.get(resource_id)
        if not db then return nil, err end
        local dialect, read_err = db:type()
        local rows
        if dialect == sql.type.SQLITE and not read_err then
            rows, read_err = db:query("SELECT file FROM pragma_database_list WHERE name='main'")
        end
        local _, release_err = db:release()
        if read_err or release_err then return nil, read_err or release_err end
        return rows and rows[1] and rows[1].file, nil
    end
    local target, err = main_file(ops.db_id())
    if err then return nil, err end
    if not target or target == "" then return false, nil end
    local core, core_err = main_file(core_id)
    return target == core, core_err
end

function M.check(tx, dialect, id, token)
    local lock = dialect == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, err = tx:query("SELECT id FROM kb10_stores WHERE id=$1 AND source_publication_token=$2" .. lock, {id, token})
    if err then return nil, err end
    if not rows[1] then return nil, conflict() end
    return true, nil
end

function M.current(id, token)
    local db, err = ops.get_db()
    if not db then return nil, err end
    local rows, read_err = db:query("SELECT id FROM kb10_stores WHERE id=$1 AND source_publication_token=$2", {id, token})
    local _, release_err = db:release()
    if read_err or release_err then return nil, read_err or release_err end
    if not rows[1] then return nil, conflict() end
    return true, nil
end

-- Keep the target transaction private until Core has authorized the output and
-- fenced the owner, lease, reset and exact inputs. Its writer only commits the
-- prepared target transaction. If Core subsequently rolls back, the store row
-- still carries the exact original result.
function M.publish(id, slot, encoded, write, acknowledge)
    local db, err = ops.get_db()
    if not db then return nil, err end
    local dialect, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local tx, begin_err = db:begin()
    if not tx then db:release(); return nil, begin_err end
    local committed = false
    local ok, receipt, failure = pcall(function()
        local changed, update_err = tx:execute([[UPDATE kb10_stores
            SET source_publication_token=$1,source_publication_result=$2
            WHERE id=$3 AND component_id=$3 AND source_publication_token=$4]],
            {uuid.v7(), encoded, id, slot.token})
        if update_err then return nil, update_err end
        if changed.rows_affected ~= 1 then return nil, conflict() end
        local applied, write_err = write(tx, dialect)
        if not applied then return nil, write_err end
        local _, access_err = component.validate_access(id, component.ACCESS.WRITE)
        if access_err then return nil, access_err end
        return acknowledge(function()
            local _, commit_err = tx:commit()
            if commit_err then return nil, commit_err end
            committed = true
            return true, nil
        end)
    end)
    if not committed then tx:rollback() end
    local _, release_err = db:release()
    if not ok then return nil, receipt end
    return receipt, failure or release_err
end

return M
