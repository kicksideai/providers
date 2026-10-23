local test = require("test")
local query_service = require("query_service")

local function define_tests()
    test.describe("kb10 query service", function()
        -- A store whose hybrid search answers `count` ranked chunks; summary search is empty.
        local function ranked_store(count: integer, windows: { integer }?): any
            return {
                get_store = function(): (any, any) return { id = "store", config = { analysis_model = false } }, nil end,
                vector_search = function(_, _, options: any): (any, any)
                    if options.node_types[1] == "summary" and #options.node_types == 1 then return {}, nil end
                    if windows then windows[#windows + 1] = options.limit end
                    local rows = {}
                    for index = 1, math.min(options.limit, count) do
                        rows[#rows + 1] = { id = "chunk-" .. tostring(index), node_type = "chunk", content = "text " .. tostring(index),
                            similarity = 1 - index / 1000, created_at = "2026-10-0" .. tostring(index % 9 + 1), store_id = "store" }
                    end
                    return rows, nil
                end,
            }
        end
        local function with_ranked_store(count: integer, windows: { integer }?, fn: any)
            local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
            query_service._ctx = { get = function(): any return "kb" end }
            query_service._llm = { embed = function(): (any, any) return { result = { { 1, 0 } } }, nil end }
            query_service._store = ranked_store(count, windows)
            local ok, failure = pcall(fn)
            query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
            if not ok then error(failure) end
        end

        test.it("pages the ranking by offset past the hundredth match to the last one", function()
            with_ranked_store(250, nil, function()
                local seen, offset, pages = {}, 0, 0
                repeat
                    local result, err = query_service.handle({ query = "tea", limit = 100, offset = offset })
                    test.is_nil(err)
                    for index, item in ipairs(result.items) do
                        test.eq(item.id, "chunk-" .. tostring(offset + index))
                        seen[item.id] = true
                    end
                    pages = pages + 1
                    offset = result.next_offset
                until offset == nil
                test.eq(pages, 3)
                test.is_true(seen["chunk-250"])
            end)
        end)

        test.it("ranks offset + limit + 1 candidates for a page", function()
            local windows = {}
            with_ranked_store(30, windows, function()
                local result, err = query_service.handle({ query = "tea", limit = 10, offset = 20 })
                test.is_nil(err)
                test.eq(result.count, 10)
                test.eq(result.items[1].id, "chunk-21")
                test.is_nil(result.next_offset)
                test.eq(windows[1], 31)
            end)
        end)

        test.it("returns every node field of a match in meta", function()
            with_ranked_store(1, nil, function()
                local result = query_service.handle({ query = "tea" })
                local item = result.items[1]
                test.eq(item.content, "text 1")
                test.eq(item.meta.node_type, "chunk")
                test.eq(item.meta.store_id, "store")
                test.eq(item.meta.created_at, "2026-10-02")
            end)
        end)

        test.it("returns invalid paging input as a domain error", function()
            with_ranked_store(1, nil, function()
                for _, request in ipairs({ { query = "tea", offset = -1 }, { query = "tea", offset = 1.5 }, { query = "tea", limit = 0 } }) do
                    local result, err = query_service.handle(request)
                    test.is_nil(err)
                    test.is_false(result.success)
                end
            end)
        end)

        test.it("fails with the store's typed error", function()
            local previous_ctx, previous_store = query_service._ctx, query_service._store
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "database unavailable" })
            query_service._ctx = { get = function(): any return "kb" end }
            query_service._store = { get_store = function(): (any, any) return nil, failure end }
            local result, err = query_service.handle({ query = "tea" })
            query_service._ctx, query_service._store = previous_ctx, previous_store
            test.is_nil(result)
            test.eq(err, failure)
        end)

        test.it("constrains analysis to document identities supplied by the summaries", function()
            local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
            local ids = { "document-a", "document-b" }
            local scoped = {}
            query_service._ctx = { get = function(): any return "kb" end }
            query_service._llm = {
                embed = function(texts: any): (any, any)
                    local vectors = {}
                    for _ in ipairs(texts) do vectors[#vectors + 1] = { 1, 0 } end
                    return { result = vectors }, nil
                end,
                structured_output = function(schema: any, prompt: string): (any, any)
                    local enum = schema.properties.documents.items.properties.document_id.enum
                    test.eq(#enum, #ids)
                    for index, id in ipairs(ids) do test.eq(enum[index], id) end
                    local documents = schema.properties.documents
                    local item = documents.items
                    test.eq(documents.maxItems, 20)
                    test.eq(item.properties.relevant.type, "boolean")
                    test.is_nil(item.properties.reasoning)
                    test.eq(item.properties.search_query.maxLength, 64)
                    test.is_true(string.find(prompt, "For EVERY document", 1, true) ~= nil)
                    test.is_true(string.find(prompt, "Do not explain your decisions", 1, true) ~= nil)
                    return { result = { documents = {
                        { document_id = ids[1], relevant = true, search_query = "first" },
                        { document_id = ids[2], relevant = true, search_query = "second" },
                    } } }, nil
                end,
            }
            query_service._store = {
                get_store = function(): (any, any) return { id = "store", config = { analysis_model = "analysis" } }, nil end,
                vector_search = function(_, _, options: any): (any, any)
                    if options.parent_id then
                        scoped[options.parent_id] = true
                        return {}, nil
                    end
                    return {
                        { id = "summary-a", parent_id = ids[1], node_type = "summary", similarity = 0.8 },
                        { id = "summary-b", parent_id = ids[2], node_type = "summary", similarity = 0.7 },
                        { id = "summary-a2", parent_id = ids[1], node_type = "summary", similarity = 0.6 },
                    }, nil
                end,
            }
            local ok, result = pcall(query_service.handle, { query = "question", limit = 3 })
            query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
            if not ok then error(result) end
            test.is_true(result.success)
            test.is_true(scoped[ids[1]])
            test.is_true(scoped[ids[2]])
        end)

        test.it("keeps every summary candidate eligible for a compact analysis decision", function()
            local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
            local ids, summaries, scoped = {}, {}, {}
            for index = 1, 20 do
                local id = "document-" .. tostring(index)
                ids[index] = id
                summaries[index] = { id = "summary-" .. tostring(index), parent_id = id,
                    node_type = "summary", content = "summary " .. tostring(index), similarity = 1 - index / 100 }
            end
            query_service._ctx = { get = function(): any return "kb" end }
            query_service._llm = {
                embed = function(texts: any): (any, any)
                    local vectors = {}
                    for _ in ipairs(texts) do vectors[#vectors + 1] = { 1, 0 } end
                    return { result = vectors }, nil
                end,
                structured_output = function(schema: any): (any, any)
                    test.eq(schema.properties.documents.maxItems, 20)
                    local decisions = {}
                    for _, id in ipairs(ids) do
                        decisions[#decisions + 1] = { document_id = id, relevant = true, search_query = "find " .. id }
                    end
                    return { result = { documents = decisions } }, nil
                end,
            }
            query_service._store = {
                get_store = function(): (any, any) return { id = "store", config = { analysis_model = "analysis" } }, nil end,
                vector_search = function(_, _, options: any): (any, any)
                    if options.parent_id then
                        scoped[options.parent_id] = true
                        return {}, nil
                    end
                    if options.node_types[1] == "summary" and #options.node_types == 1 then return summaries, nil end
                    return { { id = "original", parent_id = ids[1], node_type = "chunk", content = "evidence", similarity = 1 } }, nil
                end,
            }
            local ok, result = pcall(query_service.handle, { query = "question", limit = 10 })
            query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
            if not ok then error(result) end
            test.is_true(result.success)
            for _, id in ipairs(ids) do test.is_true(scoped[id], "scoped search: " .. id) end
        end)

        test.it("rejects invented analysis identities before issuing a scoped database query", function()
            for _, id in ipairs({ "01a1129b-e719-7916-920a2d107e0d", "f8827b90-8bcb-4ac2-bfd0-c5807bf8d9a6" }) do
                local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
                local scoped_calls = 0
                query_service._ctx = { get = function(): any return "kb" end }
                query_service._llm = {
                    embed = function(texts: any): (any, any)
                        local vectors = {}
                        for _ in ipairs(texts) do vectors[#vectors + 1] = { 1, 0 } end
                        return { result = vectors }, nil
                    end,
                    structured_output = function(): (any, any)
                        return { result = { documents = { { document_id = id, relevant = true, search_query = "refined" } } } }, nil
                    end,
                }
                query_service._store = {
                    get_store = function(): (any, any) return { id = "store", config = { analysis_model = "analysis" } }, nil end,
                    vector_search = function(_, _, options: any): (any, any)
                        if options.parent_id then scoped_calls = scoped_calls + 1 end
                        return { { id = "summary", parent_id = "known-document", node_type = "summary", similarity = 0.8 } }, nil
                    end,
                }
                local ok, result, err = pcall(query_service.handle, { query = "question", limit = 3 })
                query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
                if not ok then error(result) end
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(scoped_calls, 0)
            end
        end)

        test.it("uses direct hybrid retrieval when analysis_model is explicitly false", function()
            local previous_ctx = query_service._ctx
            local previous_llm = query_service._llm
            local previous_store = query_service._store
            local structured_calls = 0
            local search_calls = 0
            local embed_calls = 0

            query_service._ctx = {
                get = function(key: string): any
                    if key == "component_id" then return "kb-component" end
                    return nil
                end,
            }
            query_service._llm = {
                embed = function(texts: any, options: any): (any, any)
                    embed_calls = embed_calls + 1
                    test.eq(#texts, 1)
                    test.eq(options.model, "model:embed")
                    test.eq(options.dimensions, 512)
                    test.eq(options.timeout, 30)
                    return { result = { { 0.1, 0.2 } } }, nil
                end,
                structured_output = function(): (any, any)
                    structured_calls = structured_calls + 1
                    error("raw retrieval must not call structured output")
                end,
            }
            query_service._store = {
                get_store = function(): (any, any)
                    return {
                        id = "store-id",
                        embedding_model = "model:embed",
                        config = {
                            analysis_model = false,
                            summary_model = "class:fast",
                            enable_reranking = true,
                        },
                    }, nil
                end,
                vector_search = function(store_id: any, vector: any, options: any): (any, any)
                    test.eq(options.query_text, "actors")
                    search_calls = search_calls + 1
                    if search_calls == 1 then
                        return { {
                            id = "summary-id",
                            parent_id = "document-id",
                            node_type = "summary",
                            content = "document summary",
                            similarity = 0.9,
                        } }, nil
                    end
                    return { {
                        id = "chunk-id",
                        parent_id = "document-id",
                        node_type = "chunk",
                        content = "grounded chunk",
                        similarity = 0.95,
                    } }, nil
                end,
            }

            local ok, result = pcall(query_service.handle, { query = "actors", limit = 2 })
            query_service._ctx = previous_ctx
            query_service._llm = previous_llm
            query_service._store = previous_store
            if not ok then error(result) end

            test.is_true(result.success)
            test.eq(result.count, 1)
            test.eq(result.items[1].id, "chunk-id")
            test.eq(result.items[1].content, "grounded chunk")
            test.eq(structured_calls, 0)
            test.eq(embed_calls, 1)
            test.eq(search_calls, 2)
        end)
        test.it("returns model and scoped-search failures instead of a successful fallback", function()
            for _, stage in ipairs({ "analysis", "rerank", "scoped_search" }) do
                local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
                local structured_calls = 0
                query_service._ctx = { get = function(): any return "kb" end }
                query_service._llm = {
                    embed = function(texts: any): (any, any)
                        local vectors = {}
                        for _ in ipairs(texts) do vectors[#vectors + 1] = { 1, 0 } end
                        return { result = vectors }, nil
                    end,
                    structured_output = function(): (any, any)
                        structured_calls = structured_calls + 1
                        if stage == "analysis" or (stage == "rerank" and structured_calls == 2) then
                            return nil, errors.new({ kind = errors.INTERNAL, message = stage .. " unavailable" })
                        end
                        return { result = { documents = { { document_id = "doc", relevant = true, search_query = "derived" } } } }, nil
                    end,
                }
                query_service._store = {
                    get_store = function(): (any, any) return { id = "store", config = { analysis_model = "class:fast", enable_reranking = stage == "rerank" } }, nil end,
                    vector_search = function(_, _, options: any): (any, any)
                        if options.parent_id and stage == "scoped_search" then
                            return nil, errors.new({ kind = errors.INTERNAL, message = "scoped search unavailable" })
                        end
                        return { { id = "candidate", parent_id = "doc", content = "evidence", node_type = "summary", similarity = 0.8 } }, nil
                    end,
                }
                local result, err = query_service.handle({ query = "question", limit = 3 })
                query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
                test.is_nil(result, stage)
                test.is_true(errors.is(err, errors.INTERNAL), stage)
            end
        end)
        test.it("reports a schema-violating model answer as an upstream failure, not a missing resource", function()
            for _, stage in ipairs({ "analysis", "rerank" }) do
                local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
                local structured_calls = 0
                query_service._ctx = { get = function(): any return "kb" end }
                query_service._llm = {
                    embed = function(texts: any): (any, any)
                        local vectors = {}
                        for _ in ipairs(texts) do vectors[#vectors + 1] = { 1, 0 } end
                        return { result = vectors }, nil
                    end,
                    structured_output = function(): (any, any)
                        structured_calls = structured_calls + 1
                        if stage == "analysis" or structured_calls == 2 then
                            return nil, errors.new({
                                kind = errors.NOT_FOUND,
                                message = "Model failed to return valid JSON: jsontext: unexpected EOF within \"/documents/0\" after offset 5270",
                                details = { operation = "structured_output", raw_content = "{" },
                            })
                        end
                        return { result = { documents = { { document_id = "doc", relevant = true, search_query = "derived" } } } }, nil
                    end,
                }
                query_service._store = {
                    get_store = function(): (any, any) return { id = "store", config = { analysis_model = "class:fast", enable_reranking = stage == "rerank" } }, nil end,
                    vector_search = function(): (any, any)
                        return { { id = "candidate", parent_id = "doc", content = "evidence", node_type = "summary", similarity = 0.8 } }, nil
                    end,
                }
                local result, err = query_service.handle({ query = "question", limit = 3 })
                query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
                test.is_nil(result, stage)
                test.is_true(errors.is(err, errors.UNAVAILABLE), stage .. ": " .. tostring(err))
                test.is_false(errors.is(err, errors.NOT_FOUND), stage)
                test.contains(tostring(err), "Model failed to return valid JSON", stage)
                test.contains(tostring(err), stage == "analysis" and "document analysis" or "reranking", stage)
            end
        end)
        test.it("reports HyDE and embedding model failures as classified upstream errors", function()
            local not_found = function(): any
                return errors.new({ kind = errors.NOT_FOUND, message = "model is not registered" })
            end
            for _, stage in ipairs({ "hyde", "query_embed", "strategy_embed" }) do
                local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
                local embed_calls = 0
                query_service._ctx = { get = function(): any return "kb" end }
                query_service._llm = {
                    generate = function(): (any, any)
                        if stage == "hyde" then return nil, not_found() end
                        return { result = "hypothetical passage" }, nil
                    end,
                    embed = function(texts: any): (any, any)
                        embed_calls = embed_calls + 1
                        if stage == "query_embed" or (stage == "strategy_embed" and embed_calls == 2) then
                            return nil, not_found()
                        end
                        local vectors = {}
                        for _ in ipairs(texts) do vectors[#vectors + 1] = { 1, 0 } end
                        return { result = vectors }, nil
                    end,
                    structured_output = function(): (any, any)
                        return { result = { documents = { { document_id = "doc", relevant = true, search_query = "derived" } } } }, nil
                    end,
                }
                query_service._store = {
                    get_store = function(): (any, any)
                        return { id = "store", config = { analysis_model = "class:fast", query_strategy = "hyde" } }, nil
                    end,
                    vector_search = function(): (any, any)
                        return { { id = "candidate", parent_id = "doc", content = "evidence", node_type = "summary", similarity = 0.8 } }, nil
                    end,
                }
                local result, err = query_service.handle({ query = "question", limit = 3 })
                query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
                test.is_nil(result, stage)
                test.is_true(errors.is(err, errors.UNAVAILABLE), stage .. ": " .. tostring(err))
                test.contains(tostring(err), "model is not registered", stage)
            end
        end)
        test.it("keeps original lexical candidates when summary analysis selects another document", function()
            local previous_ctx, previous_llm, previous_store = query_service._ctx, query_service._llm, query_service._store
            local search_calls = 0
            query_service._ctx = { get = function(): any return "kb-component" end }
            query_service._llm = {
                embed = function(texts: any): (any, any)
                    local result = {}
                    for _ in ipairs(texts) do result[#result + 1] = { 1, 0 } end
                    return { result = result }, nil
                end,
                structured_output = function(): (any, any)
                    return { result = { documents = { { document_id = "wrong-doc", relevant = true, search_query = "rewritten" } } } }, nil
                end,
            }
            query_service._store = {
                get_store = function(): (any, any)
                    return { id = "store-id", embedding_model = "model", config = { analysis_model = "analysis" } }, nil
                end,
                vector_search = function(store_id: any, vector: any, options: any): (any, any)
                    search_calls = search_calls + 1
                    test.eq(options.query_text, "PART_NUMBER 82 Dimensions")
                    if search_calls == 1 then
                        return { { id = "summary", parent_id = "wrong-doc", node_type = "summary", content = "wrong document", similarity = 0.2 } }, nil
                    elseif search_calls == 2 then
                        return { { id = "exact", parent_id = "unselected-doc", node_type = "chunk", content = "PART_NUMBER: 82\nDimensions: precise value", similarity = 0.95 } }, nil
                    end
                    test.eq(options.parent_id, "wrong-doc")
                    return {}, nil
                end,
            }
            local ok, result = pcall(query_service.handle, { query = "PART_NUMBER 82 Dimensions", limit = 3 })
            query_service._ctx, query_service._llm, query_service._store = previous_ctx, previous_llm, previous_store
            if not ok then error(result) end
            test.is_true(result.success)
            test.eq(result.items[1].id, "exact")
            test.eq(search_calls, 3)
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
