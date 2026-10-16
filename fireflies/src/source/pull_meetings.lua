-- kickside.data:pullable.pull for the Fireflies meetings source. Forces the event
-- shape (list metadata only), so this source never fetches per-transcript detail
-- because shape belongs to the selected binding.

local core = require("pull_core")

return { pull = function(req: any): any return core.pull(req, { force_shape = "event" }) end }
