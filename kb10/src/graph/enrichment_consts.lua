local M = {}

-- Process registry name: the id of the owning service entry.
M.PROCESS = "kickside.kb10.graph:enrichment_service.service"

-- Message topic the enrichment service listens on.
M.TOPIC = "kickside.kb10.graph.enrichment_service.request"

return M
