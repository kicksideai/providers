local state = require("state")
local adapter = require("adapter")

local function run(args)
    state.reset(args.fail_at)
    return { response = adapter.handler({ storage_id = "fixture", path = "export" }), counters = state.counters() }
end
return { run = run }
