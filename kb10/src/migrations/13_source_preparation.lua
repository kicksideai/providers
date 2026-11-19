-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local ops = require("ops")

local function execute(tx, statement)
    local _, err = tx:execute(statement)
    if err then error(err) end
end

-- The cursor's nonempty continuation owns this private work. Pause and
-- resume keep it. Clearing it (including rewind and worker replacement) or
-- deleting the cursor releases it in the transaction that changed ownership.
local function install_cleanup(tx, dialect)
    local sqlite = dialect == "sqlite"
    local cursor = sqlite and "OLD.id" or "OLD.id::text"
    local predicate = " WHERE cursor_id="
        .. cursor
        .. " AND store_id=(SELECT store_id FROM kb10_source_preparations WHERE cursor_id="
        .. cursor
        .. ");"
    local cleanup = "DELETE FROM kb10_source_preparation_rows"
        .. predicate
        .. " DELETE FROM kb10_source_blocks"
        .. predicate
        .. " DELETE FROM kb10_source_preparations WHERE cursor_id="
        .. cursor
        .. ";"
    if not sqlite then
        execute(
            tx,
            "CREATE FUNCTION kb10_release_source_preparation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN "
                .. cleanup
                .. " RETURN NULL; END $$"
        )
    end
    for _, event in ipairs({ "DELETE", "UPDATE OF continuation" }) do
        local removing = event == "DELETE"
        local name = removing and "kb10_remove_source_preparation" or "kb10_reset_source_preparation"
        local condition = "OLD.continuation <> ''" .. (removing and "" or " AND NEW.continuation = ''")
        local action = sqlite and ("BEGIN " .. cleanup .. " END") or "EXECUTE FUNCTION kb10_release_source_preparation()"
        execute(
            tx,
            "CREATE TRIGGER "
                .. name
                .. " AFTER "
                .. event
                .. " ON kickside_projection_cursor FOR EACH ROW WHEN ("
                .. condition
                .. ") "
                .. action
        )
    end
end

return require("migration").define(function()
    migration("13 checkpointed source preparation", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(tx)
                    execute(
                        tx,
                        [[CREATE TABLE kb10_source_preparations (
                        store_id TEXT NOT NULL REFERENCES kb10_stores(id) ON DELETE CASCADE,
                        cursor_id TEXT NOT NULL, event_id TEXT NOT NULL,
                        source TEXT NOT NULL, progress TEXT NOT NULL,
                        UNIQUE(cursor_id), PRIMARY KEY(store_id,cursor_id))]]
                    )
                    execute(
                        tx,
                        [[CREATE TABLE kb10_source_blocks (
                        store_id TEXT NOT NULL, cursor_id TEXT NOT NULL, start_byte INTEGER NOT NULL, content TEXT NOT NULL,
                        PRIMARY KEY(store_id,cursor_id,start_byte), FOREIGN KEY(store_id,cursor_id)
                        REFERENCES kb10_source_preparations(store_id,cursor_id) ON DELETE CASCADE)]]
                    )
                    local vector = dialect == "postgres" and "vector(512)" or "BLOB"
                    execute(tx, [[CREATE TABLE kb10_source_preparation_rows (
                        store_id TEXT NOT NULL, cursor_id TEXT NOT NULL, ordinal INTEGER NOT NULL,
                        content TEXT NOT NULL, metadata TEXT NOT NULL, embedding ]] .. vector .. [[,
                        PRIMARY KEY(store_id,cursor_id,ordinal), FOREIGN KEY(store_id,cursor_id)
                        REFERENCES kb10_source_preparations(store_id,cursor_id) ON DELETE CASCADE)]])
                    if apply.require_shared_database(ops.db_id()) then install_cleanup(tx, dialect) end
                end)
            end)
        end
    end)
end)
