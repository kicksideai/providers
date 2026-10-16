local core = require("pull_core")

return {
    pull_keys = function(req: any): any return core.pull_keys(req, {}) end,
    pull_balance_keys = function(req: any): any return core.pull_keys(req, { shape = core.SHAPE_BALANCES }) end,
    pull_holding_keys = function(req: any): any return core.pull_keys(req, { shape = core.SHAPE_HOLDINGS }) end,
}
