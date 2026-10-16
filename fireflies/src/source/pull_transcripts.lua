-- kickside.data:pullable.pull for the Fireflies transcripts source. The binding
-- always emits the transcript shape (full structured detail).

local core = require("pull_core")

return { pull = function(req: any): any return core.pull(req, { default_shape = "transcript" }) end }
