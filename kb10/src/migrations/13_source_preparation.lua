-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("13 checkpointed source preparation", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(tx)
                    local _, root_err = tx:execute([[CREATE TABLE kb10_source_preparations (
                        store_id TEXT NOT NULL REFERENCES kb10_stores(id) ON DELETE CASCADE,
                        cursor_id TEXT NOT NULL, generation INTEGER NOT NULL, event_id TEXT NOT NULL,
                        content TEXT NOT NULL, source TEXT NOT NULL, progress TEXT NOT NULL,
                        PRIMARY KEY(store_id,cursor_id))]])
                    if root_err then error(tostring(root_err)) end
                    local vector = dialect == "postgres" and "vector(512)" or "BLOB"
                    local _, rows_err = tx:execute([[CREATE TABLE kb10_source_preparation_rows (
                        store_id TEXT NOT NULL, cursor_id TEXT NOT NULL, ordinal INTEGER NOT NULL,
                        content TEXT NOT NULL, metadata TEXT NOT NULL, embedding ]] .. vector .. [[,
                        PRIMARY KEY(store_id,cursor_id,ordinal), FOREIGN KEY(store_id,cursor_id)
                        REFERENCES kb10_source_preparations(store_id,cursor_id) ON DELETE CASCADE)]])
                    if rows_err then error(tostring(rows_err)) end
                end)
            end)
        end
    end)
end)
