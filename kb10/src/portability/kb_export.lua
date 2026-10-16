-- kb10's kickside.contract:portable EXPORT adapter. kb10 owns its own data: this
-- streams the store row + every node, embedding, and edge of one KB into
-- <path>/data/*.jsonl. The component shell (impl_id + meta) is written by the
-- generic coordinator; this is only kb10's backing tables. Opened on the KB
-- component (component_id is bound into context by component.open).
--
-- Embeddings are carried VERBATIM (the "[f1,..,f512]" literal both pgvector and
-- sqlite-vec0 accept) so import never has to re-embed — no cost, no drift. There is
-- no reader primitive that returns the raw vector, so the four reads are direct,
-- read-only SELECTs against the dual-dialect db handle.

local fs = require("fs")
local json = require("json")
local sql = require("sql")
local ctx = require("ctx")
local ops = require("ops")
local pio = require("portable_io")

local M = {}

-- Decode a JSON-text column into a table in place (config/metadata are stored as
-- JSON strings; we want nested objects in the JSONL, not double-encoded strings).
local function decode_col(rows: any, col: string)
    for _, r in ipairs((rows or {}) :: { any }) do
        local rr: any = r
        if type(rr[col]) == "string" then
            local parsed, err = json.decode(rr[col] :: string)
            rr[col] = err and {} or parsed
        elseif rr[col] == nil then
            rr[col] = {}
        end
    end
end


local PAGE = 1000
-- Sorts before every real (canonical, lowercase) uuid, so it is the start cursor that
-- makes one keyset query form serve both the first page and every page after it.
local ZERO_UUID = "00000000-0000-0000-0000-000000000000"

-- "col > $p" keyset predicate. SQLite ids/node_ids are TEXT; Postgres are UUID, so the
-- cursor (always carried as text) is cast back to uuid there. The seek rides the primary
-- key index either way.
local function cursor_cmp(db_type: any, col: string, p: string): string
    return (db_type == sql.type.SQLITE) and (col .. " > " .. p) or (col .. " > " .. p .. "::uuid")
end

-- Stream a table to <path> as JSONL via KEYSET pagination: page_query(cursor, limit)
-- returns the next rows ordered by `cursor_field` (a stable unique key); the seek is
-- WHERE key > cursor, never OFFSET, so the whole export stays O(N) at any size -- a
-- million-row table never re-scans the pages already written. The empty/zero start
-- cursor sorts before every key. opts.decode_field JSON-decodes a column in place;
-- opts.strip drops cursor-only columns before encoding. Returns (count, nil) | (nil, err).
local function write_paged(storage: any, path: string, page_query: any, cursor_field: string, opts: any): (number?, string?)
    local options: any = type(opts) == "table" and opts or {}
    local parent_ok, parent_err = pio.ensure_parent(storage, path)
    if not parent_ok then return nil, tostring(parent_err) end
    local f, oerr = storage:open(path, "w")
    if not f then return nil, "open: " .. tostring(oerr) end
    local total = 0
    local cursor: any = ZERO_UUID
    while true do
        local rows = page_query(cursor, PAGE)
        if type(rows) ~= "table" then break end
        local n = #(rows :: { any })
        if n == 0 then break end
        if options.decode_field then decode_col(rows, options.decode_field :: string) end
        -- advance the cursor before stripping (the cursor column may be strip-only).
        cursor = tostring(((rows :: { any })[n] :: any)[cursor_field])
        local lines = {}
        for _, r in ipairs(rows :: { any }) do
            if options.strip then
                for _, k in ipairs(options.strip :: { any }) do (r :: any)[k] = nil end
            end
            lines[#lines + 1] = json.encode(r)
        end
        f:write(table.concat(lines, "\n") .. "\n")
        total = total + n
        if n < PAGE then break end
    end
    f:close()
    return total
end

local function impl(args: any): any
    local component_id = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "no component_id in context" }
    end
    local storage_id = type(args) == "table" and (args :: any).storage_id or nil
    local path = type(args) == "table" and (args :: any).path or nil
    if type(storage_id) ~= "string" or type(path) ~= "string" then
        return { success = false, error = "storage_id and path are required" }
    end

    local storage, ferr = fs.get(storage_id :: string)
    if not storage then return { success = false, error = "storage: " .. tostring(ferr) } end

    local db, derr = ops.get_db()
    if not db then return { success = false, error = "db: " .. tostring(derr) } end
    local db_type = ops.get_db_type(db)

    -- Vectors are embedding-model-specific: a bundle carried to a machine running a
    -- different model can't reuse them, and they are the bulk of the bytes (a 36k-node
    -- KB is ~250MB of vector text). EXCLUDED by default -- the target regenerates them
    -- from node content. Opt in with include_embeddings for a same-model transfer.
    local include_embeddings = type(args) == "table" and (args :: any).include_embeddings == true
    local base = path .. "/data/"
    local function done(msg: string): any
        db:release()
        return { success = false, error = msg }
    end

    local dir_ok, dir_err = pio.ensure_dir(storage, path .. "/data")
    if not dir_ok then return done(tostring(dir_err)) end

    -- store: one row.
    local store_rows = db:query(
        "SELECT id, component_id, embedding_model, config, kb_type, enrichment_agent_id, auto_summary, auto_description FROM kb10_stores WHERE component_id = $1",
        { component_id })
    decode_col(store_rows, "config")
    local sok, serr = pio.write_jsonl(storage, base .. "store.jsonl", store_rows)
    if not sok then return done("write store: " .. tostring(serr)) end

    -- nodes / edges (+ optional embeddings): keyset-paged, never the whole table in
    -- memory and never re-scanning prior pages. Nodes seek by id (uuid v7, so id order
    -- is insert order -> a parent precedes its children; import's deferred pass covers
    -- any rare inversion).
    local node_count, nerr = write_paged(storage, base .. "nodes.jsonl", function(cursor, lim)
        return db:query(
            "SELECT id, parent_id, node_type, content, content_type, metadata FROM kb10_nodes WHERE store_id = $1 AND " .. cursor_cmp(db_type, "id", "$2") .. " ORDER BY id LIMIT $3",
            { component_id, cursor, lim })
    end, "id", { decode_field = "metadata" })
    if not node_count then return done("write nodes: " .. tostring(nerr)) end

    local emb_count = 0
    if include_embeddings then
        -- One embedding per node (UNIQUE node_id), so node_id is a stable seek key.
        local emb_cols = (db_type == sql.type.SQLITE)
            and "node_id, node_type, parent_id, vec_to_json(embedding) AS embedding"
            or  "node_id, node_type, parent_id, embedding::text AS embedding"
        local emb_sql = "SELECT " .. emb_cols .. " FROM kb10_embeddings WHERE store_id = $1 AND " .. cursor_cmp(db_type, "node_id", "$2") .. " ORDER BY node_id LIMIT $3"
        local c, eerr = write_paged(storage, base .. "embeddings.jsonl", function(cursor, lim)
            return db:query(emb_sql, { component_id, cursor, lim })
        end, "node_id", {})
        if not c then return done("write embeddings: " .. tostring(eerr)) end
        emb_count = c
    else
        -- An empty part keeps the manifest shape; import reads zero rows and re-embeds later.
        local ok, eerr = pio.write_jsonl(storage, base .. "embeddings.jsonl", {})
        if not ok then return done("write embeddings (empty): " .. tostring(eerr)) end
    end

    -- Edges seek by id (carried only as the cursor; import keys edges off node ids).
    local edge_count, gerr = write_paged(storage, base .. "edges.jsonl", function(cursor, lim)
        return db:query(
            "SELECT id, from_node_id, to_node_id, edge_type, weight, metadata FROM kb10_edges WHERE store_id = $1 AND " .. cursor_cmp(db_type, "id", "$2") .. " ORDER BY id LIMIT $3",
            { component_id, cursor, lim })
    end, "id", { decode_field = "metadata", strip = { "id" } })
    if not edge_count then return done("write edges: " .. tostring(gerr)) end

    db:release()

    return {
        success = true,
        manifest = {
            files = { "data/store.jsonl", "data/nodes.jsonl", "data/embeddings.jsonl", "data/edges.jsonl" },
            counts = { nodes = node_count, embeddings = emb_count, edges = edge_count },
        },
    }
end

function M.handler(args: any): any
    local ok, res = pcall(impl, args)
    if not ok then return { success = false, error = "export crashed: " .. tostring(res) } end
    return res
end

return M
