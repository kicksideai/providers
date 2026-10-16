-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 kb10 schema", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE EXTENSION IF NOT EXISTS vector
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kb10_stores (
                    "id" text NOT NULL,
                    "component_id" text NOT NULL,
                    "embedding_model" text NOT NULL,
                    "config" jsonb NOT NULL DEFAULT '{}'::jsonb,
                    "kb_type" text NOT NULL DEFAULT 'document'::text,
                    "enrichment_agent_id" text,
                    "auto_summary" text,
                    "auto_description" text,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kb10_stores_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kb10_stores_component_id_key" UNIQUE (component_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kb10_nodes (
                    "id" uuid NOT NULL,
                    "store_id" text NOT NULL,
                    "parent_id" uuid,
                    "node_type" text NOT NULL,
                    "content" text,
                    "content_type" text,
                    "metadata" jsonb DEFAULT '{}'::jsonb,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "search_vector" tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, regexp_replace(COALESCE(content, ''::text), '[^[:alnum:]]+'::text, ' '::text, 'g'::text))) STORED,
                    CONSTRAINT "kb10_nodes_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kb10_nodes_store_id_fkey" FOREIGN KEY (store_id) REFERENCES kb10_stores(id) ON DELETE CASCADE,
                    CONSTRAINT "kb10_nodes_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES kb10_nodes(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_nodes_store ON kb10_nodes USING btree (store_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_nodes_parent ON kb10_nodes USING btree (store_id, parent_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_nodes_type ON kb10_nodes USING btree (store_id, node_type)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_nodes_fts ON kb10_nodes USING gin (search_vector)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kb10_embeddings (
                    "id" uuid NOT NULL,
                    "node_id" uuid NOT NULL,
                    "store_id" text NOT NULL,
                    "node_type" text NOT NULL,
                    "parent_id" uuid,
                    "embedding" vector(512) NOT NULL,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kb10_embeddings_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kb10_embeddings_node_id_key" UNIQUE (node_id),
                    CONSTRAINT "kb10_embeddings_node_id_fkey" FOREIGN KEY (node_id) REFERENCES kb10_nodes(id) ON DELETE CASCADE,
                    CONSTRAINT "kb10_embeddings_store_id_fkey" FOREIGN KEY (store_id) REFERENCES kb10_stores(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_emb_store ON kb10_embeddings USING btree (store_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_emb_node ON kb10_embeddings USING btree (node_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_emb_vector ON kb10_embeddings USING hnsw (embedding vector_cosine_ops)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kb10_edges (
                    "id" uuid NOT NULL,
                    "store_id" text NOT NULL,
                    "from_node_id" uuid NOT NULL,
                    "to_node_id" uuid NOT NULL,
                    "edge_type" text NOT NULL,
                    "weight" real NOT NULL DEFAULT 1.0,
                    "metadata" jsonb DEFAULT '{}'::jsonb,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kb10_edges_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kb10_edges_store_id_from_node_id_to_node_id_edge_type_key" UNIQUE (store_id, from_node_id, to_node_id, edge_type),
                    CONSTRAINT "kb10_edges_store_id_fkey" FOREIGN KEY (store_id) REFERENCES kb10_stores(id) ON DELETE CASCADE,
                    CONSTRAINT "kb10_edges_from_node_id_fkey" FOREIGN KEY (from_node_id) REFERENCES kb10_nodes(id) ON DELETE CASCADE,
                    CONSTRAINT "kb10_edges_to_node_id_fkey" FOREIGN KEY (to_node_id) REFERENCES kb10_nodes(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_edges_store ON kb10_edges USING btree (store_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_edges_from ON kb10_edges USING btree (store_id, from_node_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_edges_to ON kb10_edges USING btree (store_id, to_node_id)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kb10_edges")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kb10_embeddings")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kb10_nodes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kb10_stores")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kb10_stores (
                    id                  TEXT PRIMARY KEY,
                    component_id        TEXT NOT NULL UNIQUE,
                    embedding_model     TEXT NOT NULL,
                    config              TEXT NOT NULL DEFAULT '{}',
                    kb_type             TEXT NOT NULL DEFAULT 'document',
                    enrichment_agent_id TEXT,
                    auto_summary        TEXT,
                    auto_description    TEXT,
                    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kb10_nodes (
                    id              TEXT PRIMARY KEY,
                    store_id        TEXT NOT NULL REFERENCES kb10_stores(id) ON DELETE CASCADE,
                    parent_id       TEXT REFERENCES kb10_nodes(id) ON DELETE CASCADE,
                    node_type       TEXT NOT NULL,
                    content         TEXT,
                    content_type    TEXT,
                    metadata        TEXT DEFAULT '{}',
                    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE VIRTUAL TABLE kb10_embeddings USING vec0(
                    id TEXT PRIMARY KEY,
                    node_id TEXT,
                    store_id TEXT PARTITION KEY,
                    node_type TEXT,
                    parent_id TEXT,
                    embedding float[512]
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kb10_edges (
                    id              TEXT PRIMARY KEY,
                    store_id        TEXT NOT NULL REFERENCES kb10_stores(id) ON DELETE CASCADE,
                    from_node_id    TEXT NOT NULL REFERENCES kb10_nodes(id) ON DELETE CASCADE,
                    to_node_id      TEXT NOT NULL REFERENCES kb10_nodes(id) ON DELETE CASCADE,
                    edge_type       TEXT NOT NULL,
                    weight          REAL NOT NULL DEFAULT 1.0,
                    metadata        TEXT DEFAULT '{}',
                    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
                    UNIQUE(store_id, from_node_id, to_node_id, edge_type)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_nodes_store ON kb10_nodes(store_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_nodes_parent ON kb10_nodes(store_id, parent_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_nodes_type ON kb10_nodes(store_id, node_type)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_edges_store ON kb10_edges(store_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_edges_from ON kb10_edges(store_id, from_node_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kb10_edges_to ON kb10_edges(store_id, to_node_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[CREATE VIRTUAL TABLE kb10_nodes_fts USING fts5(
            node_id UNINDEXED, content, node_type UNINDEXED,
            tokenize = 'unicode61 remove_diacritics 2'
        )]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kb10_nodes_fts")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kb10_edges")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kb10_embeddings")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kb10_nodes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kb10_stores")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
