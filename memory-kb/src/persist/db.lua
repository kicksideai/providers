-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Connection and transaction helpers for the memory read model on target_db.

local sql = require("sql")
local registry = require("registry")
local component = require("component")
local types = require("types")

local M = {}

local DB_CONFIG = "kickside.memory_kb:db_config"

function M.db_id(): (string?, error?)
    local entry, err = registry.get(DB_CONFIG)
    if err or type(entry) ~= "table" then
        return nil, types.internal("memory database configuration is unavailable: " .. tostring(err))
    end
    local db_id = (entry :: any).meta and (entry :: any).meta.db_id
    if type(db_id) ~= "string" or db_id == "" then
        return nil, types.internal("kickside.memory_kb:target_db is not linked into kickside.memory_kb:db_config")
    end
    return db_id, nil
end

-- A pooled connection, whether it is SQLite, and the database id.
function M.open(): (any?, boolean, string?, error?)
    local db_id, id_err = M.db_id()
    if id_err then return nil, false, nil, id_err end
    local db, err = sql.get(db_id :: string)
    if err or not db then return nil, false, nil, types.failed("memory database is unavailable", err) end
    local db_type, type_err = db:type()
    if type_err then
        db:release()
        return nil, false, nil, types.failed("memory database type is unavailable", type_err)
    end
    return db, db_type == sql.type.SQLITE, db_id, nil
end

-- Runs fn(db, sqlite) on a pooled connection and releases it.
function M.read(fn: (any, boolean) -> (any, error?)): (any, error?)
    local db, sqlite, _, err = M.open()
    if err then return nil, err end
    local result, fn_err = fn(db, sqlite)
    db:release()
    return result, fn_err
end

-- Runs fn(tx, sqlite) in one transaction. When component_id is given, the
-- component existence fence runs first, so a write to a deleted or deleting
-- memory commits nothing.
function M.write(component_id: string?, fn: (any, boolean) -> (any, error?)): (any, error?)
    local db, sqlite, db_id, err = M.open()
    if err then return nil, err end
    local tx, tx_err = db:begin()
    if tx_err then
        db:release()
        return nil, types.failed("memory transaction could not begin", tx_err)
    end
    if component_id then
        local fence_err = component.fence(tx, component_id, db_id :: string)
        if fence_err then
            tx:rollback()
            db:release()
            return nil, fence_err
        end
    end
    local result, fn_err = fn(tx, sqlite)
    if fn_err then
        tx:rollback()
        db:release()
        return nil, fn_err
    end
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        db:release()
        return nil, types.failed("memory transaction could not commit", commit_err)
    end
    db:release()
    return result, nil
end

return M
