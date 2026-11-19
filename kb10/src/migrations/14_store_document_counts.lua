-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local ops = require("ops")

local function execute(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

local function population(db_type: any, relation: string): string
    local failed = ops.failed_document_sql(db_type)
    return "SELECT store_id, count(*) FILTER (WHERE NOT " .. failed .. ") AS documents," ..
        " count(*) FILTER (WHERE " .. failed .. ") AS failures FROM " .. relation ..
        " WHERE " .. ops.SOURCE_ROOT .. " GROUP BY store_id"
end

local function select_member(db_type: any, prefix: string, failed: boolean): string
    local failure = ops.failed_document_sql(db_type, prefix)
    return "(CASE WHEN " .. ops.document_root_sql(prefix) .. " AND " ..
        (failed and failure or "NOT " .. failure) .. " THEN 1 ELSE 0 END)"
end

local function add_columns(db: any)
    execute(db, [[ALTER TABLE kb10_stores ADD COLUMN document_count BIGINT NOT NULL DEFAULT 0 CHECK (document_count >= 0)]])
    execute(db, [[ALTER TABLE kb10_stores ADD COLUMN failed_count BIGINT NOT NULL DEFAULT 0 CHECK (failed_count >= 0)]])
end

local function open_counts(db: any, db_type: any)
    execute(db, "WITH counts AS (" .. population(db_type, "kb10_nodes") .. [[)
        UPDATE kb10_stores SET document_count = counts.documents, failed_count = counts.failures
        FROM counts WHERE kb10_stores.id = counts.store_id]])
    execute(db, "CREATE INDEX idx_kb10_document_roots_by_status ON kb10_nodes (store_id, (" ..
        ops.failed_document_sql(db_type) .. "), created_at, id) WHERE " .. ops.SOURCE_ROOT)
end

local function postgres_triggers(db: any)
    local db_type = sql.type.POSTGRES
    -- Imports and bulk deletes aggregate once per changed store. Ordered store
    -- updates keep the lock order stable when a statement spans multiple stores.
    for _, event in ipairs({
        {name = "insert", tables = "NEW TABLE AS new_rows", changes = population(db_type, "new_rows")},
        {name = "delete", tables = "OLD TABLE AS old_rows", changes =
            "SELECT store_id, -documents AS documents, -failures AS failures FROM (" ..
            population(db_type, "old_rows") .. ") AS removed"},
    }) do
        local name = "kb10_count_document_" .. event.name
        execute(db, "CREATE FUNCTION " .. name .. [[() RETURNS trigger LANGUAGE plpgsql AS $$
            DECLARE delta record;
            BEGIN
                FOR delta IN ]] .. event.changes .. [[ ORDER BY store_id COLLATE "C" LOOP
                    UPDATE kb10_stores SET document_count = document_count + delta.documents,
                        failed_count = failed_count + delta.failures WHERE id = delta.store_id;
                END LOOP;
                RETURN NULL;
            END
        $$]])
        execute(db, "CREATE TRIGGER " .. name .. " AFTER " .. event.name ..
            " ON kb10_nodes REFERENCING " .. event.tables ..
            " FOR EACH STATEMENT EXECUTE FUNCTION " .. name .. "()")
    end

    local old_document, new_document = select_member(db_type, "OLD.", false), select_member(db_type, "NEW.", false)
    local old_failed, new_failed = select_member(db_type, "OLD.", true), select_member(db_type, "NEW.", true)
    execute(db, [[CREATE FUNCTION kb10_count_document_update() RETURNS trigger LANGUAGE plpgsql AS $$
        DECLARE delta record;
        BEGIN
            FOR delta IN SELECT store_id, sum(documents) AS documents, sum(failures) AS failures
                FROM (VALUES (OLD.store_id, -]] .. old_document .. ", -" .. old_failed .. [[),
                             (NEW.store_id, ]] .. new_document .. ", " .. new_failed .. [[))
                AS changes(store_id, documents, failures)
                GROUP BY store_id
                HAVING sum(documents) <> 0 OR sum(failures) <> 0
                ORDER BY store_id COLLATE "C" LOOP
                UPDATE kb10_stores SET document_count = document_count + delta.documents,
                    failed_count = failed_count + delta.failures WHERE id = delta.store_id;
            END LOOP;
            RETURN NULL;
        END
    $$]])
    execute(db, [[CREATE TRIGGER kb10_count_document_update
        AFTER UPDATE OF store_id, parent_id, node_type, metadata ON kb10_nodes FOR EACH ROW WHEN
        ((]] .. ops.document_root_sql("OLD.") .. " OR " .. ops.document_root_sql("NEW.") .. [[)
         AND (OLD.store_id <> NEW.store_id OR ]] .. old_document .. " <> " .. new_document ..
         " OR " .. old_failed .. " <> " .. new_failed .. [[))
        EXECUTE FUNCTION kb10_count_document_update()]])
end

local function sqlite_triggers(db: any)
    local db_type = sql.type.SQLITE
    for _, event in ipairs({
        {name = "insert", row = "NEW.", sign = "+"},
        {name = "delete", row = "OLD.", sign = "-"},
    }) do
        execute(db, "CREATE TRIGGER kb10_count_document_" .. event.name .. " AFTER " .. event.name ..
            " ON kb10_nodes WHEN " .. ops.document_root_sql(event.row) .. [[ BEGIN
                UPDATE kb10_stores SET document_count = document_count ]] .. event.sign ..
                " (NOT " .. ops.failed_document_sql(db_type, event.row) .. ")," ..
                " failed_count = failed_count " .. event.sign .. " " .. ops.failed_document_sql(db_type, event.row) ..
                " WHERE id = " .. event.row .. "store_id; END")
    end

    local old_document, new_document = select_member(db_type, "OLD.", false), select_member(db_type, "NEW.", false)
    local old_failed, new_failed = select_member(db_type, "OLD.", true), select_member(db_type, "NEW.", true)
    execute(db, [[CREATE TRIGGER kb10_count_document_update
        AFTER UPDATE OF store_id, parent_id, node_type, metadata ON kb10_nodes
        WHEN (]] .. ops.document_root_sql("OLD.") .. " OR " .. ops.document_root_sql("NEW.") .. [[)
         AND (OLD.store_id <> NEW.store_id OR ]] .. old_document .. " <> " .. new_document ..
         " OR " .. old_failed .. " <> " .. new_failed .. [[)
        BEGIN
            UPDATE kb10_stores SET
                document_count = document_count - (id = OLD.store_id) * ]] .. old_document ..
                " + (id = NEW.store_id) * " .. new_document .. [[,
                failed_count = failed_count - (id = OLD.store_id) * ]] .. old_failed ..
                " + (id = NEW.store_id) * " .. new_failed .. [[
            WHERE (id = OLD.store_id AND (]] .. ops.document_root_sql("OLD.") .. [[))
               OR (id = NEW.store_id AND (]] .. ops.document_root_sql("NEW.") .. [[));
        END]])
end

return require("migration").define(function()
    migration("14 store document counts", function()
        database("postgres", function()
            up(function(tx)
                add_columns(tx)
                -- CREATE TRIGGER excludes node writes until the opening counts
                -- and the migration ledger commit together.
                postgres_triggers(tx)
                open_counts(tx, sql.type.POSTGRES)
            end)
        end)
        database("sqlite", function()
            up(function(tx)
                add_columns(tx)
                sqlite_triggers(tx)
                open_counts(tx, sql.type.SQLITE)
            end)
        end)
    end)
end)
