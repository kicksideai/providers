-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local source_worker = require("source_worker")
local fixtures = require("fixtures")
local job_types = require("job_types")

local function run(input)
    local result, err = source_worker.run_with_deps(input, {
        dispatcher = fixtures.document_handler,
        embedder = fixtures.fake_embedder,
        resolve_materialized_store = function(id)
            return {
                store = {
                    vector_dimensions = function() return fixtures.DIMS end,
                    replace_document = function()
                        return nil, errors.new({kind = errors.CONFLICT, message = "document revision changed"})
                    end,
                },
                store_row = {id = id, component_id = id, embedding_model = "class:embed", kb_type = "document"},
                engine = {default_config = fixtures.MATERIALIZATION_CONFIG},
            }
        end,
    })
    if err then return {ok = false, error_native = job_types.error_to_data(err)} end
    return result
end

return {run = run}
