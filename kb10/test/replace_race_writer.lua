local store = require("store")

local function run(store_id)
    local result, err = store.replace_document(store_id, {
        document = {
            node_type = "document",
            content = "concurrent source document",
            metadata = { external_source = "fixture", external_id = "concurrent:document" },
        },
    })
    if err then error(err) end
    return result.document_node_id
end

return { run = run }
