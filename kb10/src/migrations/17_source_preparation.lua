-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local ops = require("ops")

local function execute(db, statement)
    local _, err = db:execute(statement)
    if err then error(err) end
end

return require("migration").define(function()
    migration("17 shared source preparation", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                up(function(db)
                    -- A split store cannot share a Core checkpoint transaction.
                    -- Its installed source worker needs no preparation tables.
                    if not apply.require_shared_database(ops.db_id()) then return end
                    execute(db, [[CREATE TABLE kb10_source_preparations (
                        store_id TEXT NOT NULL REFERENCES kb10_stores(id) ON DELETE CASCADE,
                        cursor_id TEXT NOT NULL,
                        reset_generation BIGINT NOT NULL,
                        event_id TEXT NOT NULL,
                        owner_incarnation TEXT NOT NULL,
                        authority_generation BIGINT NOT NULL,
                        source TEXT NOT NULL,
                        progress TEXT NOT NULL,
                        PRIMARY KEY(store_id,cursor_id),
                        UNIQUE(cursor_id),
                        FOREIGN KEY(cursor_id,reset_generation,event_id)
                            REFERENCES kickside_filtered_checkpoint_pin(cursor_id,reset_generation,event_id)
                            ON DELETE CASCADE
                    )]])
                    execute(db, [[CREATE TABLE kb10_source_blocks (
                        store_id TEXT NOT NULL,
                        cursor_id TEXT NOT NULL,
                        start_byte INTEGER NOT NULL,
                        content TEXT NOT NULL,
                        PRIMARY KEY(store_id,cursor_id,start_byte),
                        FOREIGN KEY(store_id,cursor_id)
                            REFERENCES kb10_source_preparations(store_id,cursor_id) ON DELETE CASCADE
                    )]])
                    execute(db, [[CREATE TABLE kb10_source_preparation_rows (
                        store_id TEXT NOT NULL,
                        cursor_id TEXT NOT NULL,
                        ordinal INTEGER NOT NULL,
                        content TEXT NOT NULL,
                        metadata TEXT NOT NULL,
                        PRIMARY KEY(store_id,cursor_id,ordinal),
                        FOREIGN KEY(store_id,cursor_id)
                            REFERENCES kb10_source_preparations(store_id,cursor_id) ON DELETE CASCADE
                    )]])
                    local bytes = dialect == "postgres" and "BYTEA" or "BLOB"
                    execute(db, [[CREATE TABLE kb10_source_preparation_batches (
                        store_id TEXT NOT NULL,
                        cursor_id TEXT NOT NULL,
                        ordinal INTEGER NOT NULL,
                        input_sha TEXT NOT NULL,
                        output_sha TEXT NOT NULL,
                        vector_count INTEGER NOT NULL CHECK (vector_count>=0),
                        payload ]] .. bytes .. [[ NOT NULL,
                        PRIMARY KEY(store_id,cursor_id,ordinal),
                        FOREIGN KEY(store_id,cursor_id)
                            REFERENCES kb10_source_preparations(store_id,cursor_id) ON DELETE CASCADE
                    )]])
                end)
            end)
        end
    end)
end)
