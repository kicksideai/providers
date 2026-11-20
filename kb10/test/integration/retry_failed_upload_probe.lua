-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local reingest = require("reingest")

return {run = function(input)
    return reingest.retry_failed_source(input.kb_id, input.node_id, input.failed_event_id)
end}
