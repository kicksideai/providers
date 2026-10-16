local batching = {}

-- Split a list into consecutive sublists of at most size items, preserving order.
-- Used to keep embedding requests under the provider's per-call input limit so a
-- large document does not get sent to llm.embed as one oversized batch.
function batching.split(items: table, size: number): table
    local batches = {}
    if size < 1 then
        size = 1
    end

    local current = {}
    for i = 1, #items do
        current[#current + 1] = items[i]
        if #current == size then
            batches[#batches + 1] = current
            current = {}
        end
    end
    if #current > 0 then
        batches[#batches + 1] = current
    end

    return batches
end

return batching
