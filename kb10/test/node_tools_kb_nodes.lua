-- In-memory kb_nodes seam for the node explorer tools: one KB with two
-- documents and a store failure switch.
local M = { failure = nil :: error? }

local NODES = {
    { id = "doc-1", node_type = "document", parent_id = nil, content = "Northwind ships tea in two business days.",
      metadata = { title = "Shipping" }, created_at = "2026-10-01T00:00:00Z" },
    { id = "doc-2", node_type = "document", parent_id = nil, content = "Returns are accepted for thirty days.",
      metadata = { title = "Returns" }, created_at = "2026-10-02T00:00:00Z" },
}

function M.get_node(_kb_id: string, node_id: any): (any?, error?)
    if M.failure then return nil, M.failure end
    for _, node in ipairs(NODES) do
        if node.id == node_id then return node, nil end
    end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "node not found" })
end
function M.browse(_kb_id: string, opts: any): (any?, error?)
    if M.failure then return nil, M.failure end
    local out = {}
    for _, node in ipairs(NODES) do
        local row = {}
        for key, value in pairs(node) do row[key] = value end
        if opts.include_content ~= true then row.content = nil end
        out[#out + 1] = row
    end
    return out, nil
end
function M.get_store_statistics(kb_ids: {string}, _include_config: boolean): (any?, error?)
    if M.failure then return nil, M.failure end
    local rows = {}
    for index = #kb_ids, 1, -1 do
        local kb_id = kb_ids[index]
        local stats = { document_count = kb_id == "kb-1" and #NODES or 1, summary_count = 0, chunk_count = 0, concept_count = 0 }
        rows[#rows + 1] = { component_id = kb_id, stats = stats }
    end
    return rows, nil
end

function M.public_meta(kb_id: string): (any?, error?)
    return { title = kb_id == "kb-1" and "Policies" or "Archive", document_count = 99 }, nil
end
function M.is_graph(_kb_id: string): (boolean, error?) return false, nil end
function M.concept_doc_counts(): (any?, error?) return {}, nil end
function M.graph(): (any?, error?)
    if M.failure then return nil, M.failure end
    return { nodes = {}, edges = {} }, nil
end

return M
