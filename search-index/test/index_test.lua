local test = require("test")
local index = require("index")
local sql = require("sql")
local uuid = require("uuid")

local function vector(first: number, second: number?): { number }
    local v = {}
    for i = 1, 512 do v[i] = 0 end
    v[1] = first
    v[2] = second or 0
    return v
end

local function exec(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

local function open(): (any, boolean)
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local sqlite = index.is_sqlite(db)
    return db, sqlite :: boolean
end

local SPEC = {
    vectors = "si_vectors",
    vector_key = "row_id",
    rows = "si_rows",
    row_key = "id",
    partition = "part",
    columns = { "part", "kind", "status", "content", "meta" },
    fts = "si_fts",
    fts_key = "row_id",
    tsvector = "search_vector",
    json_columns = { "meta" },
}

local function create_schema()
    local db, sqlite = open()
    if sqlite then
        exec(db, "CREATE TABLE IF NOT EXISTS si_rows (id TEXT PRIMARY KEY, part TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL, content TEXT, meta TEXT)")
        exec(db, "CREATE VIRTUAL TABLE IF NOT EXISTS si_vectors USING vec0(row_id TEXT PRIMARY KEY, part TEXT PARTITION KEY, kind TEXT, embedding float[512])")
        exec(db, "CREATE VIRTUAL TABLE IF NOT EXISTS si_fts USING fts5(row_id UNINDEXED, content, tokenize='unicode61 remove_diacritics 2')")
    else
        exec(db, "CREATE EXTENSION IF NOT EXISTS vector")
        exec(db, "CREATE TABLE IF NOT EXISTS si_rows (id text PRIMARY KEY, part text NOT NULL, kind text NOT NULL, status text NOT NULL, content text, meta jsonb, " ..
            "search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', regexp_replace(COALESCE(content, ''), '[^[:alnum:]]+', ' ', 'g'))) STORED)")
        exec(db, "CREATE TABLE IF NOT EXISTS si_vectors (row_id text PRIMARY KEY, part text NOT NULL, kind text NOT NULL, embedding vector(512) NOT NULL)")
        exec(db, "CREATE INDEX IF NOT EXISTS si_vectors_hnsw ON si_vectors USING hnsw (embedding vector_cosine_ops)")
    end
    db:release()
end

local function insert(part: string, kind: string, status: string, content: string, vec: { number }?): string
    local db, sqlite = open()
    local tx, tx_err = db:begin()
    if tx_err then error(tostring(tx_err)) end
    local id = uuid.v7()
    local err = index.insert_rows_tx(tx, "si_rows", { "id", "part", "kind", "status", "content", "meta" },
        { { id, part, kind, status, content, '{"source":"test"}' } })
    if not err and sqlite then
        err = index.insert_rows_tx(tx, "si_fts", { "row_id", "content" }, { { id, content } })
    end
    if not err and vec then
        err = index.insert_rows_tx(tx, "si_vectors", { "row_id", "part", "kind", "embedding" },
            { { id, part, kind, index.vector_literal(vec) } })
    end
    if err then tx:rollback(); db:release(); error(tostring(err)) end
    tx:commit()
    db:release()
    return id
end

-- Inserts `count` rows in one transaction, each with a distinct vector near
-- (first, second).
local function insert_many(part: string, kind: string, count: integer, first: number, second: number)
    local db, sqlite = open()
    local tx, tx_err = db:begin()
    if tx_err then error(tostring(tx_err)) end
    local rows, vectors, texts = {}, {}, {}
    for i = 1, count do
        local id = uuid.v7()
        local v = vector(first, second)
        v[3 + (i % 500)] = 0.01 * ((i % 7) + 1)
        rows[i] = { id, part, kind, "current", kind .. " row " .. i, '{"source":"test"}' }
        vectors[i] = { id, part, kind, index.vector_literal(v) }
        texts[i] = { id, kind .. " row " .. i }
    end
    local err = index.insert_rows_tx(tx, "si_rows", { "id", "part", "kind", "status", "content", "meta" }, rows)
    if not err then err = index.insert_rows_tx(tx, "si_vectors", { "row_id", "part", "kind", "embedding" }, vectors) end
    if not err and sqlite then err = index.insert_rows_tx(tx, "si_fts", { "row_id", "content" }, texts) end
    if err then tx:rollback(); db:release(); error(tostring(err)) end
    tx:commit()
    if not sqlite then exec(db, "ANALYZE si_rows"); exec(db, "ANALYZE si_vectors") end
    db:release()
end

local function search(opts: any): any
    local db = open()
    local rows, err = index.search(db, SPEC, opts.vector or vector(1), opts)
    db:release()
    test.is_nil(err)
    return rows
end

local function define_tests()
    test.describe("search index", function()
        test.before_all(function() create_schema() end)

        test.it("ranks by vector distance inside one partition", function()
            local part = uuid.v7()
            local near = insert(part, "fact", "current", "alpha", vector(1, 0))
            local far = insert(part, "fact", "current", "beta", vector(0, 1))
            insert(uuid.v7(), "fact", "current", "alpha other partition", vector(1, 0))
            local rows = search({ partition = part, limit = 5 })
            test.eq(#rows, 2)
            test.eq(rows[1].id, near)
            test.eq(rows[2].id, far)
            test.ok(rows[1].similarity > rows[2].similarity)
            test.eq(rows[1].meta.source, "test")
        end)

        test.it("applies row and vector filters before the limit", function()
            local part = uuid.v7()
            for i = 1, 6 do insert(part, "fact", "superseded", "old " .. i, vector(1, 0)) end
            local current = insert(part, "fact", "current", "kept", vector(0.2, 1))
            local other_kind = insert(part, "rule", "current", "rule", vector(1, 0))
            local rows = search({ partition = part, limit = 1, filters = { { column = "status", values = { "current" } } } })
            test.eq(#rows, 1)
            test.eq(rows[1].id, other_kind)
            rows = search({ partition = part, limit = 3, filters = {
                { column = "status", values = { "current" } },
                { column = "kind", values = { "fact" }, table = "vectors" },
            } })
            test.eq(#rows, 1)
            test.eq(rows[1].id, current)
        end)

        test.it("returns every eligible row up to the limit when nearer rows of other partitions and scopes crowd the vector index", function()
            local part = uuid.v7()
            insert_many(uuid.v7(), "fact", 2000, 1, 0)
            insert_many(part, "fact", 1500, 1, 0)
            insert_many(part, "lesson", 600, 0, 1)
            local filters = { { column = "kind", values = { "lesson" }, table = "vectors" } }
            local rows = search({ partition = part, limit = 5, filters = filters })
            test.eq(#rows, 5)
            rows = search({ partition = part, limit = 50, filters = filters })
            test.eq(#rows, 50)
            for _, row in ipairs(rows) do test.eq(row.kind, "lesson") end
        end)

        test.it("fuses lexical identifier hits ahead of dense neighbors", function()
            local part = uuid.v7()
            for i = 1, 8 do insert(part, "fact", "current", "order note " .. i, vector(1, 0)) end
            local target = insert(part, "fact", "current", "order MT26Z101282 shipped", vector(-1, 0))
            local rows = search({ partition = part, limit = 3, query_text = "where is MT26Z101282" })
            test.eq(rows[1].id, target)
            test.not_nil(rows[1].lexical_rank)
            test.not_nil(rows[1].hybrid_score)
        end)

        test.it("returns lexical rows without vectors and falls back to dense on no lexical match", function()
            local part = uuid.v7()
            local textual = insert(part, "fact", "current", "Quillfeather manual", nil)
            local rows = search({ partition = part, limit = 3, query_text = "Quillfeather" })
            test.eq(#rows, 1)
            test.eq(rows[1].id, textual)
            local dense = insert(part, "fact", "current", "unrelated", vector(1, 0))
            rows = search({ partition = part, limit = 3, query_text = "zzzznotpresent" })
            test.eq(#rows, 1)
            test.eq(rows[1].id, dense)
        end)

        test.it("quotes query tokens and anchors digit-bearing terms", function()
            local q, anchored = index.lexical_query("it's A-1 now", true)
            test.eq(q, '("1") AND ("it" OR "s" OR "a" OR "1" OR "now")')
            test.is_true(anchored)
            local pg, pg_anchored = index.lexical_query("it's", false)
            test.eq(pg, "('it' | 's')")
            test.is_false(pg_anchored)
            test.is_nil((index.lexical_query("  ,;", true)))
        end)

        test.it("builds placeholders and vector literals", function()
            test.eq(index.placeholders(3, 4), "$4,$5,$6")
            test.eq(index.vector_literal({ 1, 0.5 }), "[1,0.5]")
            test.eq(index.VECTOR_DIMENSIONS, 512)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
