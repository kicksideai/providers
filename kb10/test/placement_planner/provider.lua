local json = require("json")

local function call(name, index, arguments)
    return {success = true, finish_reason = "tool_call", result = {
        content = "", tool_calls = {{name = name, id = "draft-" .. tostring(index), arguments = arguments}},
    }}
end

local function generate(args)
    assert(args.model == "placement-planner-fixture")
    local tools = {}
    for _, tool in ipairs(args.tools or args.options.tools) do tools[tool.name] = tool end
    assert(tools.CreateConcept.schema.properties.label.type == "string")
    assert(tools.GetConceptDocuments.schema.properties.concept_id.type == "string")
    local calls, results, user = {}, {}, nil
    for _, message in ipairs(args.messages) do
        if message.role == "system" then
            assert(message.content[1].text:find("concept taxonomy agent", 1, true))
            assert(message.content[1].text:find("Use the fixture taxonomy", 1, true))
        elseif message.role == "user" then user = message.content[1].text
        elseif message.role == "function_call" then calls[#calls + 1] = message.function_call
        elseif message.role == "function_result" then results[#results + 1] = message end
    end
    local document_id = assert(user:match("Document node ID: ([^\n]+)"))
    local target_count = #results
    assert(target_count == #calls)
    for i, result in ipairs(results) do
        assert(result.function_call_id == calls[i].id and result.name == calls[i].name)
    end
    if user:find("refuse-tool", 1, true) then return call("ForeignTool", 1, {}) end
    if user:find("invalid-args-tool", 1, true) then
        if target_count == 0 then
            return call("CreateConcept", 1, {label = "Draft topic", store_id = "other-store"})
        end
        local refused = assert(json.decode(results[1].content[1].text))
        assert(not refused.success and refused.error == "unexpected tool argument")
        return {success = true, finish_reason = "stop", result = {content = "rejected", tool_calls = {}}}
    end
    if user:find("incomplete-tool", 1, true) then
        return {success = true, finish_reason = "stop", result = {content = "no calls", tool_calls = {}}}
    end
    assert(not user:find("must-not-generate", 1, true))
    if target_count == 0 then return call("BrowseTree", 1, {}) end
    assert(calls[1].arguments == "{}")
    local tree = results[1].content[1].text
    local root = assert(tree:match("id=([^,%)]+)"), tree)
    local existing = assert(tree:match("%[Existing target%] %(id=([^,%)]+)"))
    local alternate = assert(tree:match("%[Alternate target%] %(id=([^,%)]+)"))
    assert(tree:find("[Existing target] (id=" .. existing .. ", parent=" .. root .. ")", 1, true))
    assert(tree:find("[Alternate target] (id=" .. alternate .. ", parent=" .. root .. ")", 1, true))
    local read = function(index) return assert(json.decode(results[index].content[1].text)) end
    if user:find("large-wiki-probe", 1, true) then
        assert(tree:find("More concepts are omitted", 1, true))
        assert(not tree:find("Hidden", 1, true))
        if target_count == 1 then
            return call("CreateConcept", 2, {label = " hidden  NORMALIZED label ", parent_id = root})
        end
        local hidden = read(2)
        assert(hidden.success and hidden.result == "reused" and hidden.concept_id:sub(1, 8) == "ffffffff")
        if target_count == 2 then return call("GetConceptDocuments", 3, {limit = 3, concept_id = hidden.concept_id}) end
        local first = read(3)
        assert(#first.documents == 3 and first.next_offset == 3)
        if target_count == 3 then
            return call("GetConceptDocuments", 4, {limit = 3, offset = first.next_offset, concept_id = hidden.concept_id})
        end
        local second = read(4)
        assert(#second.documents == 3 and second.next_offset == 6)
        for _, prior in ipairs(first.documents) do
            for _, later in ipairs(second.documents) do assert(prior.id ~= later.id) end
        end
        if target_count == 4 then
            return call("MergeConcept", 5, {from_id = hidden.concept_id, into_id = existing})
        end
        local blocked = read(5)
        assert(not blocked.success and blocked.error:find("too many incident relationships", 1, true))
        if target_count == 5 then
            return call("AttachDocument", 6, {document_node_id = document_id, concept_id = hidden.concept_id})
        end
        assert(read(6).result == "attached")
        return {success = true, finish_reason = "stop", result = {content = "large placement drafted", tool_calls = {}}}
    end
    if target_count == 1 then return call("CreateConcept", 2, {label = "Draft topic", parent_id = root}) end
    local created = read(2)
    assert(created.success and created.result == "created")
    if target_count == 2 then return call("AttachDocument", 3, {document_node_id = document_id, concept_id = created.concept_id}) end
    assert(read(3).result == "attached")
    if target_count == 3 then return call("GetConceptDocuments", 4, {concept_id = created.concept_id}) end
    assert(read(4).documents[1].id == document_id)
    if target_count == 4 then return call("MergeConcept", 5, {from_label = " draft TOPIC ", into_id = existing}) end
    assert(read(5).moved_edges == 1 and read(5).into_id == existing)
    if target_count == 5 then return call("GetConceptDocuments", 6, {concept_id = existing}) end
    assert(read(6).documents[1].id == document_id)
    if target_count == 6 then return call("MoveDocument", 7, {document_node_id = document_id, concept_id = alternate}) end
    assert(read(7).result == "moved")
    if target_count == 7 then return call("GetConceptDocuments", 8, {concept_id = alternate}) end
    local on_target = false
    for _, document in ipairs(read(8).documents) do
        if document.id == document_id then on_target = true; break end
    end
    assert(on_target)
    return {success = true, finish_reason = "stop", result = {content = "placement drafted", tool_calls = {}}}
end

return {generate = generate, status = function() return {success = true} end}
