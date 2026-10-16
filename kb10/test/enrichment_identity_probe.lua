local enrichment_service = require("enrichment_service")

local function run(input: any): any
    local ok, err = enrichment_service._run_enrichment("store", input.component_id, "document", input.owner, input.identity, {
        store_for_component = function()
            return {}, { config = {}, embedding_model = "test-model" }, { is_graph = true }, nil
        end,
        run_concept_placement = function() return false, "controlled placement failure" end,
    })
    return { success = ok, error = err }
end

return { run = run }
