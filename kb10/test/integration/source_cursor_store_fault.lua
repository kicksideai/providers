-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local source_worker = require("source_worker")
local source_materializer = require("source_materializer")
local materializer_store = require("materializer_store")
local job_types = require("job_types")

local function fault()
    return nil, errors.new({ kind = errors.INTERNAL, message = "store fixture failure" })
end

local function deadlock()
    return nil, errors.new({ kind = errors.CONFLICT, retryable = true, message = "store fixture deadlock" })
end

local function run(input)
    local config = input.worker_config
    if type(config) ~= "table" then config = input.projection.body.worker_config end
    local result, err = source_worker.run_with_deps(input, {
        resolve_materialized_store = function(kb_id)
            local row = assert(materializer_store:get_store({ component_id = kb_id }))
            local store = materializer_store
            local fault_target = config.target_kb_ids[#config.target_kb_ids]
            if kb_id == fault_target and not row.config.fixture_recovered then
                store = setmetatable({}, { __index = materializer_store })
                if config.store_fault == "replace" then store.replace_document = fault end
                if config.store_fault == "delete" then store.delete_documents_by_external_id = fault end
                if config.store_fault == "deadlock" then store.delete_documents_by_external_id = deadlock end
            end
            return { store = store, store_row = row, engine = assert(source_materializer.resolve_engine(row)) }
        end,
    })
    if err then return { ok = false, error_native = job_types.error_to_data(err) } end
    return result
end

return { run = run }
