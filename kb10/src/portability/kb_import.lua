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
local ops = require("ops")
local pio = require("portable_io")
local placement = require("placement_activation")

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

    -- Pass one remaps UUIDs and elects the bound root in legacy archives.
    local node_map: { [string]: string } = {}
    local legacy_roots, legacy_winners = {}, {}
    local _, scan_err = pio.scan_jsonl(storage, nodes_path, function(n: any)
        if type(n.id) ~= "string" then return end
        local id = n.id :: string
        node_map[id] = uuid.v7()
        if n.node_type ~= "document" or n.parent_id ~= nil or n.source_binding ~= nil then return end
        local binding, exact = ops.legacy_source_binding(store.component_id or store.id, n.metadata)
        if not binding then return end
        local scope, source, external_id = binding.source_scope, binding.external_source, binding.external_id
        legacy_roots[scope] = legacy_roots[scope] or {}
        local sources = legacy_roots[scope]
        sources[source] = sources[source] or {}
        local roots = sources[source]
        local prior = roots[external_id]
        if prior and ((prior.exact and not exact) or (prior.exact == exact and prior.id <= id)) then return end
        if prior then legacy_winners[prior.id] = nil end
        roots[external_id] = {id = id, exact = exact}
        legacy_winners[id] = true
    end)
    if scan_err then return { success = false, error = "read nodes.jsonl: " .. tostring(scan_err) } end
    legacy_roots = nil

    -- 3. Pass two: insert in file order, BATCHED -- one commit per BATCH, not one per
    --    row (a per-row commit turns a multi-million-node restore into hours). nodes.jsonl
    --    is exported ORDER BY id (uuid v7 == insert order) and a child's parent always
    --    pre-existed it (so it carries the smaller id and lands in this batch or an
    --    earlier one), so the self-FK holds within the transaction without per-row
    --    deferral. The node bodies and explicit bindings stay in the current batch.
    local BATCH = 500
    local function build(n: any): any
        return {
            id = node_map[(n.id :: string)],
            parent_id = (type(n.parent_id) == "string") and node_map[n.parent_id] or nil,
            node_type = n.node_type, content = n.content,
            content_type = n.content_type, metadata = n.metadata or {},
        }
    end
    local node_batch, bindings = {}, {}
    local function flush_nodes()
        if #node_batch == 0 then return end
        local _, err = store_lib.insert_nodes(component_id, node_batch, bindings)
        node_batch, bindings = {}, {}
        return err
    end
    local _, insert_err = pio.scan_jsonl(storage, nodes_path, function(n: any)
        if type(n.id) ~= "string" then return end
        local archived = n.source_binding
        local binding
        if archived ~= nil then
            if type(archived) ~= "table" then return nil, "invalid document source binding" end
            if archived.source_scope ~= nil then
                binding = ops.source_binding(nil, archived.external_source, archived.external_id, archived.source_scope)
                if type(archived.source_scope) ~= "string" or n.node_type ~= "document" or n.parent_id ~= nil or
                    not binding or binding.external_source ~= archived.external_source or binding.external_id ~= archived.external_id then
                    return nil, "invalid document source binding"
                end
            end
        elseif legacy_winners[n.id] then
            binding = ops.legacy_source_binding(store.component_id or store.id, n.metadata)
        end
        local i = #node_batch + 1
        node_batch[i], bindings[i] = build(n), binding
        if i >= BATCH then return nil, flush_nodes() end
    end)
    if not insert_err then insert_err = flush_nodes() end
    if insert_err then return { success = false, error = "import nodes: " .. tostring(insert_err) } end

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

    if placement.is_default_wiki(store.kb_type, store.enrichment_agent_id) then
        local warning = placement.after_create(component_id)
        if warning then warnings[#warnings + 1] = warning end
    end
    return { success = true, id_map = imap, warnings = warnings }
end

return M
