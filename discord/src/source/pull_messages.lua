-- kickside.data:pullable.pull for the Discord channel-messages source.

local core = require("pull_core")

return { pull = function(req: any): any return core.pull(req) end }
