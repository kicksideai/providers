-- The cross-module status seam for knowledge base maintenance.
--
-- A run that was scheduled is followed through its record: the latest
-- resummarize and the latest re-embed, each with its counters, its terminal
-- status or failure reason, and in_flight -- the queue's own answer to whether
-- it still owes the run work. This is the read GET /kb10/{id}/maintenance
-- answers with, reached as a library by a caller with no HTTP request behind it.

local maintenance = require("maintenance")

local M = {}

-- run(kb_id) -> ({ success, kb_id, resummarize, reembed }, err). A type this
-- knowledge base has never run is absent rather than empty.
function M.run(kb_id: string): (any?, string?)
    local report, err = maintenance.status(kb_id)
    if not report then return nil, tostring(err) end
    return report, nil
end

return M
