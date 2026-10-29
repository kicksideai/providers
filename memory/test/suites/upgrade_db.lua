-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
return {
    write = function(_component_id: string, fn: any): (any?, error?)
        local db, err = sql.get("app:migration_db")
        if err then return nil, err end
        local tx, tx_err = db:begin()
        if tx_err then db:release(); return nil, tx_err end
        local result, write_err = fn(tx, db:type() == sql.type.SQLITE)
        if write_err then tx:rollback(); db:release(); return nil, write_err end
        local _, commit_err = tx:commit()
        db:release()
        return result, commit_err
    end,
    read = function(fn: any): (any?, error?)
        local db, err = sql.get("app:migration_db")
        if err then return nil, err end
        local result, read_err = fn(db, db:type() == sql.type.SQLITE)
        db:release()
        return result, read_err
    end,
}
