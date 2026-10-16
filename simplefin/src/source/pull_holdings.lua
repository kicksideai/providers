-- kickside.data:pullable.pull for the SimpleFIN holdings source (one snapshot per position per tick).

local core = require("pull_core")

return { pull = function(req: any): any return core.pull(req, { shape = core.SHAPE_HOLDINGS }) end }
