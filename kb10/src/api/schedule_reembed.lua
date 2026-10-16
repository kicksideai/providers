-- The cross-module start seam for a node re-embed.
--
-- Regenerating every vector in a knowledge base is minutes to hours of model
-- work, longer than any caller may hold open, so every caller defers it the same
-- way. This is the job-minting path POST /kb10/{id}/reembed runs -- the same
-- validation, the same standing-run close, the same frozen identity, the same
-- per-KB concurrency key -- reached as a library by a caller with no HTTP
-- request behind it. The answer is the scheduling receipt; what the run does is
-- read back through kickside.kb10.api:maintenance_status.

local maintenance = require("maintenance")
local runs = require("maintenance_runs")

local M = {}

-- run(kb_id) -> ({ success, kb_id, job_id, scheduled, run }, err). The HTTP
-- status the endpoint shapes its reply from is the HTTP layer's, so it stops
-- here and the refusal crosses as its reason.
function M.run(kb_id: string): (any?, string?)
    local receipt, err = maintenance.start(kb_id, runs.RUN_TYPE.REEMBED)
    if not receipt then return nil, tostring(err) end
    return receipt, nil
end

return M
