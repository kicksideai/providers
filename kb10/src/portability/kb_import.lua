-- kb10's kickside.contract:portable IMPORT_INTO adapter. The coordinator has
-- already registered the new KB component (component_id is in context); this
-- replays <path>/data/*.jsonl into that store, remapping the internal id graph:
-- a fresh uuid per node, with parent_id, edge endpoints, and embedding node refs
-- all rewritten through that map. Calls the persist layer directly so the
-- materializer/source-lineage guards on the kb_store binding don't reject a
-- faithful reconstruction.

local fs = require("fs")
local uuid = require("uuid")
local ctx = require("ctx")
local store_lib = require("store")
local pio = require("portable_io")

local M = {}

-- Vectors travel as either a JSON array or the "[f1,..]" literal; normalize to a
-- Lua number array for insert_embedding.
local function parse_vector(v: any): { number }
    if type(v) == "table" then return v :: { number } end
    local out: { number } = {}
    if type(v) == "string" then
        for num in string.gmatch(v :: string, "[-0-9.eE+]+") do
            local n = tonumber(num)
            if n then out[#out + 1] = n end
        end
    end
    return out
end

function M.handler(args: any): any
    local component_id = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "no component_id in context" }
    end
    local storage_id = type(args) == "table" and (args :: any).storage_id or nil
    local path = type(args) == "table" and (args :: any).path or nil
    if type(storage_id) ~= "string" or type(path) ~= "string" then
        return { success = false, error = "storage_id and path are required" }
    end
    local id_map: any = type(args) == "table" and (args :: any).id_map or {}
    if type(id_map) ~= "table" then id_map = {} end

    local storage, ferr = fs.get(storage_id :: string)
    if not storage then return { success = false, error = "storage: " .. tostring(ferr) } end

    local base = (path :: string) .. "/data/"
    local store_rows, store_read_err = pio.read_jsonl(storage, base .. "store.jsonl")
    if store_read_err then return { success = false, error = "read store.jsonl: " .. tostring(store_read_err) } end
    if type(store_rows) ~= "table" then return { success = false, error = "missing store.jsonl" } end

    local store = store_rows[1]
    if type(store) ~= "table" then return { success = false, error = "missing store.jsonl" } end

    -- 1. create the store under the NEW component id (is_graph=false: carry the
    --    exported root rather than auto-seeding a second one).
    local _, cerr = store_lib.create_store(component_id, (store :: any).embedding_model, (store :: any).config or {}, {
        kb_type = (store :: any).kb_type or "document",
        enrichment_agent_id = (store :: any).enrichment_agent_id or "",
        is_graph = false,
    })
    if cerr then return { success = false, error = "create_store: " .. tostring(cerr) } end

    -- create_store seeds only the structural columns; carry the KB's rollup
    -- descriptions across too (they are display state, not derived on import).
    if (store :: any).auto_summary ~= nil or (store :: any).auto_description ~= nil then
        store_lib.set_descriptions(component_id, (store :: any).auto_summary, (store :: any).auto_description)
    end

    local nodes_path = base .. "nodes.jsonl"

    -- 2. Pass one: a fresh id per node, recording old -> new. Only the id map is held
    --    in memory (the node bodies are never buffered), so a multi-GB KB imports fine.
    local node_map: { [string]: string } = {}
    pio.scan_jsonl(storage, nodes_path, function(n: any)
        if type(n.id) == "string" then node_map[n.id :: string] = uuid.v7() end
    end)

    -- 3. Pass two: insert in file order, BATCHED -- one commit per BATCH, not one per
    --    row (a per-row commit turns a multi-million-node restore into hours). nodes.jsonl
    --    is exported ORDER BY id (uuid v7 == insert order) and a child's parent always
    --    pre-existed it (so it carries the smaller id and lands in this batch or an
    --    earlier one), so the self-FK holds within the transaction without per-row
    --    deferral. Only the id map is buffered across the stream; each batch holds at
    --    most BATCH node bodies, so a multi-GB KB imports in bounded memory.
    local BATCH = 500
    local function build(n: any): any
        return {
            id = node_map[(n.id :: string)],
            parent_id = (type(n.parent_id) == "string") and node_map[n.parent_id] or nil,
            node_type = n.node_type, content = n.content,
            content_type = n.content_type, metadata = n.metadata or {},
        }
    end
    local insert_err: string? = nil
    local node_batch: { any } = {}
    local function flush_nodes()
        if #node_batch == 0 then return end
        local _, ferr = store_lib.insert_nodes(component_id, node_batch)
        if ferr then insert_err = tostring(ferr) end
        node_batch = {}
    end
    pio.scan_jsonl(storage, nodes_path, function(n: any)
        if insert_err or type(n.id) ~= "string" then return end
        node_batch[#node_batch + 1] = build(n)
        if #node_batch >= BATCH then flush_nodes() end
    end)
    flush_nodes()
    if insert_err then return { success = false, error = "insert nodes: " .. (insert_err :: string) } end

    -- 4. embeddings (verbatim, opt-in) + edges, streamed in batches with node refs
    --    remapped. Both stay best-effort: a failed batch is warned and skipped rather
    --    than aborting -- a node graph missing some vectors/edges still loads.
    local warnings: { string } = {}
    local emb_batch: { any } = {}
    local function flush_emb()
        if #emb_batch == 0 then return end
        local _, eerr = store_lib.insert_embeddings(component_id, emb_batch)
        if eerr then warnings[#warnings + 1] = "embedding batch: " .. tostring(eerr) end
        emb_batch = {}
    end
    pio.scan_jsonl(storage, base .. "embeddings.jsonl", function(e: any)
        local nid = node_map[e.node_id]
        if nid then
            emb_batch[#emb_batch + 1] = {
                node_id = nid, node_type = e.node_type,
                parent_id = (type(e.parent_id) == "string") and node_map[e.parent_id] or nil,
                embedding = parse_vector(e.embedding),
            }
            if #emb_batch >= BATCH then flush_emb() end
        end
    end)
    flush_emb()

    local edge_batch: { any } = {}
    local function flush_edges()
        if #edge_batch == 0 then return end
        local _, gerr = store_lib.insert_edges(component_id, edge_batch)
        if gerr then warnings[#warnings + 1] = "edge batch: " .. tostring(gerr) end
        edge_batch = {}
    end
    pio.scan_jsonl(storage, base .. "edges.jsonl", function(ed: any)
        local f = node_map[ed.from_node_id]
        local t = node_map[ed.to_node_id]
        if f and t then
            edge_batch[#edge_batch + 1] = {
                from_node_id = f, to_node_id = t,
                edge_type = ed.edge_type, weight = ed.weight or 1.0,
                metadata = ed.metadata or {},
            }
            if #edge_batch >= BATCH then flush_edges() end
        end
    end)
    flush_edges()

    -- record this KB's node remap into the coordinator's namespaced id_map, MERGING
    -- (not replacing) so a multi-KB batch keeps every store's node ids.
    local imap: any = id_map
    if type(imap.rows) ~= "table" then imap.rows = {} end
    if type(imap.rows.kb10_nodes) ~= "table" then imap.rows.kb10_nodes = {} end
    for k, v in pairs(node_map) do imap.rows.kb10_nodes[k] = v end

    return { success = true, id_map = imap, warnings = warnings }
end

return M
