local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local contract = require("contract")
local kb10_types = require("kb10_types")
local materializer_lib = require("materializer_lib")
local node_store = require("node_store")


local function store(): any
    return node_store
end

-- Source-content writes go through the kb10-internal materializer surface directly
-- (the source-materialization contract was removed); it validates canonical lineage.
local function materializer_store(): any
    return materializer_lib
end

local materialized_seq = 0
local function with_materialized_lineage(node)
    materialized_seq = materialized_seq + 1
    node.metadata = type(node.metadata) == "table" and node.metadata or {}
    local metadata = node.metadata
    local external_id = metadata.external_id or ("fixture:" .. tostring(materialized_seq))
    local external_version = metadata.external_version or ("v" .. tostring(materialized_seq))
    metadata.external_source = metadata.external_source or "fixture"
    metadata.external_id = external_id
    metadata.external_version = external_version
    metadata.thread_event_id = metadata.thread_event_id or ("fixture-event:" .. tostring(materialized_seq))
    metadata.thread_event_seq = metadata.thread_event_seq or materialized_seq
    if type(metadata.source_ref) ~= "table" then
        metadata.source_ref = {
            kind = "fixture",
            origin = "graph_api_test",
            external_source = metadata.external_source,
            external_id = external_id,
            external_version = external_version,
            thread_event_id = metadata.thread_event_id,
            thread_event_seq = metadata.thread_event_seq,
        }
    end
    return node
end

local function insert_materialized_node(store_id, node)
    return materializer_store():insert_node({ store_id = store_id, node = with_materialized_lineage(node) })
end

local function uuid()
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function test_vector()
    local vec = {}
    for i = 1, 512 do vec[i] = 0.001 end
    return vec
end


local M = {
    sql = sql,
    json = json,
    crypto = crypto,
    contract = contract,
    kb10_types = kb10_types,
    store = store,
    materializer_store = materializer_store,
    insert_materialized_node = insert_materialized_node,
    uuid = uuid,
    test_vector = test_vector,
}

function M.new(): any
    local all_stores: { string } = {}
    local all_components: { string } = {}
    return {
        setup = function(): (any?, string?, string?, string?)
            local db, db_err = sql.get("app:db")
            if db_err or not db then return nil, nil, nil, tostring(db_err) end
            -- Component IDs are UUIDs on PostgreSQL, including in cleanup queries.
            local component_id = uuid()
            local store_id, store_err = store():create_store({
                component_id = component_id, embedding_model = "test-model", config = {},
            })
            if store_err or type(store_id) ~= "string" then
                db:release()
                return nil, nil, nil, "create_store failed: " .. tostring(store_err)
            end
            all_stores[#all_stores + 1] = store_id
            all_components[#all_components + 1] = component_id
            return db, component_id, store_id, nil
        end,
        cleanup = function(db: any): string?
            local cdb, db_err = sql.get("app:db")
            if db_err or not cdb then return tostring(db_err) end
            local function execute(query: string, params: any): string?
                local _, err = cdb:execute(query, params)
                if err then return tostring(err) end
                return nil
            end
            for _, store_id in ipairs(all_stores) do
                local err = execute("DELETE FROM kb10_edges WHERE store_id = $1", { store_id })
                if err then cdb:release(); return err end
                err = execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { store_id })
                if err then cdb:release(); return err end
                if cdb:type() == sql.type.SQLITE then
                    err = execute("DELETE FROM kb10_nodes_fts WHERE node_id IN "
                        .. "(SELECT id FROM kb10_nodes WHERE store_id = $1)", { store_id })
                    if err then cdb:release(); return err end
                end
                err = execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
                if err then cdb:release(); return err end
                err = execute("DELETE FROM kb10_stores WHERE id = $1", { store_id })
                if err then cdb:release(); return err end
            end
            for _, component_id in ipairs(all_components) do
                local err = execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { component_id })
                if err then cdb:release(); return err end
                err = execute("DELETE FROM kickside_component_access WHERE component_id = $1", { component_id })
                if err then cdb:release(); return err end
                err = execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
                if err then cdb:release(); return err end
            end
            cdb:release()
            db:release()
            return nil
        end,
    }
end

return M
