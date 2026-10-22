-- Creates a memory knowledge base the way the knowledge control plane does:
-- register the component under the engine impl, create the engine store
-- through the engine's store lifecycle binding, publish the initial meta, and
-- ensure the ledger thread under the engine descriptor so its projection is
-- provisioned.

local contract = require("contract")
local security = require("security")
local uuid = require("uuid")
local component = require("component")

local STORE_BINDING = "kickside.memory:store_lifecycle"

local function open(contract_id: string, binding: string?): (any, any)
    local def, err = contract.get(contract_id)
    if err then return nil, err end
    return def:with_actor(security.actor()):with_scope(security.scope()):open(binding)
end

local function run(args: any): (any, any)
    local svc, svc_err = open("kickside.component:component_service", nil)
    if svc_err then return nil, svc_err end
    local component_id = uuid.v4()
    local registered, reg_err = svc:register({
        component_id = component_id,
        impl_id = "kickside.memory:memory_kb",
        meta = { title = args.name or "memory", class = "knowledge_base", kb_type = "memory", embedding_model = "test-embed" },
    })
    if reg_err then return nil, reg_err end
    if not registered or not registered.success then return nil, "register failed: " .. tostring(registered and registered.error) end
    local store, store_err = open("kickside.knowledge:kb_store_lifecycle", STORE_BINDING)
    if store_err then return nil, store_err end
    local _, create_err = store:create_store({
        component_id = component_id, embedding_model = "test-embed", config = args.config or {},
        opts = { kb_type = "memory", name = args.name or "memory" },
    })
    if create_err then return nil, create_err end
    local _, meta_err = component.set_meta(component_id, { status = "ready", kb_type = "memory" })
    if meta_err then return nil, meta_err end
    local threads, threads_err = open("kickside.core:threads", nil)
    if threads_err then return nil, threads_err end
    local _, ensure_err = threads:ensure_thread({ component_id = component_id, impl_id = "kickside.memory:engine_memory" })
    if ensure_err then return nil, ensure_err end
    return { component_id = component_id }, nil
end

return { run = run }
