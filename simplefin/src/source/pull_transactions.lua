-- kickside.data:pullable.pull for the SimpleFIN transactions source.

local core = require("pull_core")

return { pull = function(req: any): any return core.pull(req, { shape = core.SHAPE_TRANSACTIONS }) end }
