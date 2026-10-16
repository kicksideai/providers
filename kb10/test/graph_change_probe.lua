local thread_ingest = require("thread_ingest")

local function handle(args)
    local result, err = thread_ingest.append_graph_change(args.kb_id, { reason = "probe" })
    if not result then return { success = false, error = tostring(err) } end
    return { success = true }
end

return { handle = handle }
