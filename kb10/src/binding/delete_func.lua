local ctx = require("ctx")
local store = require("store")
local thread_ingest = require("thread_ingest")

-- deletable contract method: tears down the kb10 store row and all its
-- children (nodes, edges, embeddings, fts) for the component in context, and
-- removes the KB-owned ingest thread if this binding is used directly.
local function handle(request_dto)
    local component_id, err = ctx.get("component_id")
    if err or not component_id then
        return { success = false, error = "no component context" }
    end

    -- Stop ingestion FIRST: deleting the thread halts further materialization, so
    -- if the store delete then fails the leftover is inert data (safely
    -- re-deletable) rather than a live thread writing into a vanished store.
    local _, thread_err = thread_ingest.purge_thread(component_id)
    if thread_err then
        return nil, thread_err
    end

    local ok, del_err = store.delete_store(component_id)
    if del_err or not ok then
        return nil, del_err or errors.new({ message = "store deletion returns no proof", kind = errors.INTERNAL })
    end

    return { success = true }
end

return { handle = handle }
