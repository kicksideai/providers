-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function embed(args: any): (any, any)
    local vectors = {}
    for _, input in ipairs(args.input) do
        if args.model == "source-unavailable"
            or (args.model == "source-prefix" and input:find("Blocked document", 1, true)) then
            return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = "embedding backend unavailable" })
        end
        if args.model == "source-string-error" then
            return nil, "embedding provider rejected the input"
        end
        if args.model == "source-content-invalid" then
            if input:find("Over limit document", 1, true) then
                return nil, errors.new({ kind = errors.INVALID, message = "input exceeds model token limit" })
            end
            if input:find("Blocked document", 1, true) then
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "embedding backend unavailable" })
            end
        end
        local vector = {}
        for i = 1, 512 do vector[i] = i == 1 and 1 or 0 end
        vectors[#vectors + 1] = vector
    end
    return { success = true, result = { embeddings = vectors } }, nil
end
local function structured_output(args: any): (any, any)
    if args.model == "unavailable" then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "No models found for class: provider response" })
    end
    local documents = {}
    for _, id in ipairs(args.schema.properties.documents.items.properties.document_id.enum) do
        documents[#documents + 1] = { document_id = id, relevant = true, search_query = "reference" }
    end
    return { success = true, result = { data = { documents = documents } } }, nil
end
return { embed = embed, structured_output = structured_output, status = function() return { success = true } end }
