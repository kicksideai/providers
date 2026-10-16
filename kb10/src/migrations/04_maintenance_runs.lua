-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("04 maintenance runs", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kb10_maintenance_runs (
                    "id" text NOT NULL,
                    "component_id" text NOT NULL,
                    "run_type" text NOT NULL,
                    "job_id" text,
                    "status" text NOT NULL DEFAULT 'scheduled'::text,
                    "total" integer NOT NULL DEFAULT 0,
                    "scanned" integer NOT NULL DEFAULT 0,
                    "resummarized" integer NOT NULL DEFAULT 0,
                    "chunks_reenriched" integer NOT NULL DEFAULT 0,
                    "chunks_failed" integer NOT NULL DEFAULT 0,
                    "documents_skipped" integer NOT NULL DEFAULT 0,
                    "embedded" integer NOT NULL DEFAULT 0,
                    "last_error" text,
                    "created_at" text NOT NULL,
                    "started_at" text,
                    "heartbeat_at" text NOT NULL,
                    "finished_at" text,
                    "actor_id" text,
                    "actor_context" text,
                    CONSTRAINT "kb10_maintenance_runs_pkey" PRIMARY KEY (id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_maintenance_runs_kb ON kb10_maintenance_runs USING btree (component_id, run_type, created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_kb10_maintenance_runs_active ON kb10_maintenance_runs USING btree (component_id, run_type) WHERE (finished_at IS NULL)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kb10_maintenance_runs")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kb10_maintenance_runs (
                    id                  TEXT PRIMARY KEY,
                    component_id        TEXT NOT NULL,
                    run_type            TEXT NOT NULL,
                    job_id              TEXT,
                    status              TEXT NOT NULL DEFAULT 'scheduled',
                    total               INTEGER NOT NULL DEFAULT 0,
                    scanned             INTEGER NOT NULL DEFAULT 0,
                    resummarized        INTEGER NOT NULL DEFAULT 0,
                    chunks_reenriched   INTEGER NOT NULL DEFAULT 0,
                    chunks_failed       INTEGER NOT NULL DEFAULT 0,
                    documents_skipped   INTEGER NOT NULL DEFAULT 0,
                    embedded            INTEGER NOT NULL DEFAULT 0,
                    last_error          TEXT,
                    created_at          TEXT NOT NULL,
                    started_at          TEXT,
                    heartbeat_at        TEXT NOT NULL,
                    finished_at         TEXT
                    , actor_id TEXT, actor_context TEXT)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_maintenance_runs_kb
                    ON kb10_maintenance_runs(component_id, run_type, created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX idx_kb10_maintenance_runs_active
                    ON kb10_maintenance_runs(component_id, run_type)
                    WHERE finished_at IS NULL
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kb10_maintenance_runs")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
