-- kickside.data:pullable.pull for the SimpleFIN balances source (one snapshot per account per tick).

local core = require("pull_core")

return { pull = function(req: any): any return core.pull(req, { shape = core.SHAPE_BALANCES }) end }
