local store = require("store")
local process = require("process")

local function run(store_id, operation, parent)
    if operation == "teardown" then
        local ok, err = store.delete_store(store_id)
        if err then error(err) end
        return ok
    end
    if parent then assert(process.send(parent, "prepared", true)) end
    local result, err = store.replace_document(store_id, {
        document = {
            node_type = "document",
            content = "concurrent source document",
            metadata = {external_source = "fixture", external_id = "concurrent:document",
                source_ref = {thread_id = "source-thread"}},
        },
    })
    if operation == "replace_after_teardown" and err and errors.is(err, errors.NOT_FOUND) then
        return "store removed"
    end
    if err then error(err) end
    return result.document_node_id
end

return { run = run }
