-- End-to-end round-trip for kb10's kickside.contract:portable adapters. Builds a
-- source KB whose node/embedding/edge counts cross the export pager's PAGE window
-- multiple times, exports it through export_func, imports the bundle into a fresh
-- component through import_into_func, and asserts exact count + content + graph
-- fidelity. This is the regression guard for the streaming export pagination and
-- the batched import path: a dropped or duplicated page, or a mis-remapped id,
-- fails here.

local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local fs = require("fs")
local funcs = require("funcs")
local security = require("security")
local kb10_store = require("kb10_store")

local APP_DB = "app:db"
local SCRATCH = "app:uploads"
local DIMS = 512

-- Cross the kb_export PAGE (1000) boundary twice with a partial final page so the
-- pager's "n < PAGE then break" tail and its multi-page seek both run.
local N_NODES = 2100
local N_EDGES = 1300

local function table_count(table_name: string, store_id: string): number
    local db = sql.get(APP_DB)
    if not db then error("db unavailable") end
    local rows = db:query("SELECT COUNT(*) AS count FROM " .. table_name .. " WHERE store_id = $1", { store_id })
    db:release()
    return tonumber(rows and rows[1] and rows[1].count) or 0
end

local function runtime_identity(): (any, any)
    return security.new_actor("kb_portability_user", {}), security.named_scope("wippy.security:process")
end

-- A distinct but cheap 512-dim vector per node (verbatim carry, no embedding cost).
local function vec_for(i: number): { number }
    local v: { number } = {}
    for j = 1, DIMS do v[j] = 0.0 end
    v[1] = (i % 1000) / 1000.0
    v[((i % (DIMS - 1)) + 2)] = 1.0
    return v
end

-- Build the source KB directly through the persist facade (the same surface the
-- import replays into). Returns the ordered list of node ids.
local function build_source(src: string): { string }
    local _, cerr = kb10_store.create_store(src, "class:embed", { note = "portability" }, {
        kb_type = "document", is_graph = false,
    })
    if cerr then error("create_store: " .. tostring(cerr)) end

    local ids: { string } = {}
    local nodes: { any } = {}
    local embeddings: { any } = {}
    for i = 1, N_NODES do
        local id = uuid.v7()
        -- Shallow tree: parents are always earlier (lower index) so the export's
        -- created_at,id order is parent-first.
        local parent = nil
        if i >= 5 then parent = ids[math.floor(i / 4)] end
        nodes[#nodes + 1] = {
            id = id, node_type = "concept",
            content = "node-" .. tostring(i), content_type = "text/plain",
            metadata = { n = i, half = (i % 2 == 0) }, parent_id = parent,
        }
        ids[i] = id
        embeddings[#embeddings + 1] = {
            node_id = id, node_type = "concept", parent_id = parent, embedding = vec_for(i),
        }
    end
    local _, nerr = kb10_store.insert_nodes(src, nodes)
    if nerr then error("insert_nodes: " .. tostring(nerr)) end
    local _, eerr = kb10_store.insert_embeddings(src, embeddings)
    if eerr then error("insert_embeddings: " .. tostring(eerr)) end

    -- concept->concept edges (neither endpoint is a source node, so they pass the
    -- writer's edge guard).
    local edges: { any } = {}
    for i = 1, N_EDGES do
        edges[#edges + 1] = {
            from_node_id = ids[i], to_node_id = ids[i + 1],
            edge_type = "related_to", weight = 1.0, metadata = { e = i },
        }
    end
    local _, gerr = kb10_store.insert_edges(src, edges)
    if gerr then error("insert_edges: " .. tostring(gerr)) end

    return ids
end

local function define_tests()
    test.describe("kb10 export directory errors", function()
        for _, stage in ipairs({ { name = "data directory", fail_at = 1, queries = 0 },
            { name = "paged file parent", fail_at = 5, queries = 1 } }) do
            test.it("returns the " .. stage.name .. " failure before writing files", function()
                local actor, scope = runtime_identity()
                local executor = funcs.new():with_actor(actor):with_scope(scope)
                    :with_context({ component_id = uuid.v7() })
                local probe, err = executor:call("app:export_fault_probe", { fail_at = stage.fail_at })
                test.is_nil(err)
                test.is_false(probe.response.success)
                test.contains(probe.response.error, "directory backend unavailable")
                test.eq(probe.counters.queries, stage.queries)
                test.eq(probe.counters.opens, 0)
                test.eq(probe.counters.releases, 1)
            end)
        end
    end)

    test.describe("kb10 portability round-trip", function()
        test.it("imports duplicate public addresses and binds one root per lineage", function()
            local dst = uuid.v7()
            local path = "portability/duplicates-" .. dst
            local storage = assert(fs.get(SCRATCH))
            test.is_true(storage:mkdir("portability") == true or storage:isdir("portability"))
            assert(storage:mkdir(path))
            assert(storage:mkdir(path .. "/data"))
            local base = path .. "/data/"
            local first = "00000000-0000-7000-8000-000000000001"
            local other = "00000000-0000-7000-8000-000000000002"
            local child = "00000000-0000-7000-8000-000000000003"
            local foreign = "00000000-0000-7000-8000-000000000004"
            local metadata = { external_source = "feed:é", external_id = string.rep("a:bñ", 2048) }
            local foreign_metadata = {
                external_source = metadata.external_source,
                external_id = metadata.external_id,
                source_ref = {thread_id = "source:thread"},
            }
            local padded_metadata = {external_source = " " .. metadata.external_source,
                external_id = metadata.external_id .. " \t"}
            local document = { id = first, node_type = "document", content = "first", metadata = padded_metadata }
            local rows = {
                json.encode(document),
                json.encode({ id = other, node_type = "document", content = "second", metadata = metadata }),
                json.encode({ id = child, node_type = "chunk", parent_id = other, content = "public child", metadata = metadata }),
                (json.encode({ id = foreign, node_type = "document", content = "another source", metadata = foreign_metadata })),
            }
            local _, store_err = storage:writefile(base .. "store.jsonl", '{"embedding_model":"class:embed"}\n')
            test.is_nil(store_err)
            local _, nodes_err = storage:writefile(base .. "nodes.jsonl", table.concat(rows, "\n") .. "\n")
            test.is_nil(nodes_err)

            local actor, scope = runtime_identity()
            local result, err = funcs.new():with_actor(actor):with_scope(scope)
                :with_context({ component_id = dst })
                :call("kickside.kb10.portability:import_into_func", { storage_id = SCRATCH, path = path })
            test.is_nil(err)
            test.is_true(result.success, tostring(result.error))
            local ids = result.id_map.rows.kb10_nodes
            document.id = nil
            document.content = "new generation"
            local replaced = assert(kb10_store.replace_document(dst, { document = document }))
            test.eq(replaced.document_node_id, ids[first])
            test.eq(assert(kb10_store.get_node(dst, ids[other])).content, "second")
            test.eq(tostring(assert(kb10_store.get_node(dst, ids[child])).parent_id), ids[other])
            local other_replaced = assert(kb10_store.replace_document(dst, {document = {
                node_type = "document", content = "another generation", metadata = foreign_metadata,
            }}))
            test.eq(other_replaced.document_node_id, ids[foreign])
            test.eq(#assert(kb10_store.find_by_external_id(dst, metadata.external_source, metadata.external_id)), 4)

            assert(kb10_store.delete_store(dst))
            storage:remove(base .. "store.jsonl")
            storage:remove(base .. "nodes.jsonl")
        end)

        test.it("returns the missing store part error before creating a knowledge store", function()
            local dst = uuid.v7()
            local actor, scope = runtime_identity()
            local result, call_err = funcs.new():with_actor(actor):with_scope(scope)
                :with_context({ component_id = dst })
                :call("kickside.kb10.portability:import_into_func", {
                    storage_id = SCRATCH, path = "missing-portability/" .. uuid.v7(),
                })
            test.is_nil(call_err, tostring(call_err))
            test.not_nil(result)
            test.is_false(result.success)
            test.not_nil(result.error)
            local row, read_err = kb10_store.get_store(dst)
            test.is_true(errors.is(read_err, errors.NOT_FOUND), tostring(read_err))
            test.is_nil(row)
        end)

        test.it("exports and re-imports a multi-page KB with exact fidelity", function()
            local src = uuid.v7()
            local dst = uuid.v7()
            local path = "portability/" .. src
            local actor, scope = runtime_identity()

            local src_ids = build_source(src)

            -- export ----------------------------------------------------------
            local exp = funcs.new():with_actor(actor):with_scope(scope)
                :with_context({ component_id = src })
                :call("kickside.kb10.portability:export_func", {
                    storage_id = SCRATCH, path = path, include_embeddings = true,
                })
            test.not_nil(exp)
            test.is_true(exp.success, "export failed: " .. tostring(exp and exp.error))
            local counts = exp.manifest.counts
            test.eq(counts.nodes, N_NODES)
            test.eq(counts.embeddings, N_NODES)
            test.eq(counts.edges, N_EDGES)

            -- import ----------------------------------------------------------
            local imp = funcs.new():with_actor(actor):with_scope(scope)
                :with_context({ component_id = dst })
                :call("kickside.kb10.portability:import_into_func", {
                    storage_id = SCRATCH, path = path,
                    id_map = { components = {}, rows = {} },
                })
            test.not_nil(imp)
            test.is_true(imp.success, "import failed: " .. tostring(imp and imp.error))

            -- counts must survive the round-trip exactly ----------------------
            test.eq(table_count("kb10_nodes", dst), N_NODES)
            test.eq(table_count("kb10_embeddings", dst), N_NODES)
            test.eq(table_count("kb10_edges", dst), N_EDGES)

            -- content + id remap fidelity on a node past the first page --------
            local node_map = imp.id_map.rows.kb10_nodes
            test.not_nil(node_map)
            local probe_idx = 1500
            local probe_new = node_map[src_ids[probe_idx]]
            test.not_nil(probe_new, "probe node was not remapped")
            local node = kb10_store.get_node(dst, probe_new)
            test.not_nil(node)
            test.eq(node.content, "node-" .. tostring(probe_idx))
            -- parent remapped to the mapped parent, not the source id.
            local src_parent = src_ids[math.floor(probe_idx / 4)]
            test.eq(tostring(node.parent_id), tostring(node_map[src_parent]))

            -- graph fidelity: the edge out of a node past the first page lands on
            -- the mapped neighbour (edge i links ids[i] -> ids[i+1]). The edge probe
            -- must be <= N_EDGES, since only the first N_EDGES nodes have out-edges.
            local edge_idx = 1200
            local edge_from = node_map[src_ids[edge_idx]]
            local out_edges = kb10_store.get_edges(dst, edge_from, { direction = "out" })
            test.not_nil(out_edges)
            local expect_to = node_map[src_ids[edge_idx + 1]]
            local found = false
            for _, e in ipairs(out_edges) do
                if tostring(e.to_node_id) == tostring(expect_to) then found = true end
            end
            test.is_true(found, "remapped out-edge missing for probe node")

            -- teardown --------------------------------------------------------
            kb10_store.delete_store(src)
            kb10_store.delete_store(dst)
            local storage = fs.get(SCRATCH)
            if storage then
                for _, rel in ipairs({ "store.jsonl", "nodes.jsonl", "embeddings.jsonl", "edges.jsonl" }) do
                    pcall(function() storage:remove(path .. "/data/" .. rel) end)
                end
            end
        end)

        test.describe("import from an unreadable bundle", function()
            local function import_from(path: string): any
                local actor, scope = runtime_identity()
                return funcs.new():with_actor(actor):with_scope(scope)
                    :with_context({ component_id = uuid.v7() })
                    :call("kickside.kb10.portability:import_into_func", {
                        storage_id = SCRATCH, path = path, id_map = { components = {}, rows = {} },
                    })
            end

            test.it("reports a store part that is not valid JSONL", function()
                local path = "portability/malformed-" .. uuid.v7()
                local storage = fs.get(SCRATCH)
                test.eq(storage:mkdir("portability") == true or storage:isdir("portability"), true)
                test.eq(storage:mkdir(path) == true, true)
                test.eq(storage:mkdir(path .. "/data") == true, true)
                local ok, werr = storage:writefile(path .. "/data/store.jsonl", "not json\n")
                test.is_nil(werr)
                local imp = import_from(path)
                storage:remove(path .. "/data/store.jsonl")
                test.is_false(imp.success)
                test.contains(imp.error, "read store")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
