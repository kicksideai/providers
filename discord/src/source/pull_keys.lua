-- Keys-only Discord channel message listing used by Data Sync reconcile.

local core = require("pull_core")

return { pull_keys = function(req: any): any return core.pull_keys(req) end }
