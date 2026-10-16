local test = require("test")
local service = require("query_service")

local function query(config: table, generation: any, gen_error: any): (any, any, any)
    local previous_ctx, previous_store, previous_llm, previous_tuner = service._ctx, service._store, service._llm, service._tuner
    local calls = { generated = 0, embedded = {}, observed = 0 }
    service._ctx = { get = function(): any return "kb" end }
    service._store = {
        get_store = function(): (any, any)
            return { id = "store", embedding_model = "class:embed", config = config }, nil
        end,
        vector_search = function(_, _, options: any): (any, any)
            test.eq(options.query_text, "How do actors communicate?")
            return {}, nil
        end,
    }
    service._llm = {
        generate = function(_, options: any): (any, any)
            calls.generated = calls.generated + 1
            test.eq(options.model, "class:fast")
            test.eq(options.max_tokens, 400)
            test.eq(options.timeout, 20)
            return generation, gen_error
        end,
        embed = function(texts: any): (any, any)
            calls.embedded = texts
            return { result = { { 1, 0 } } }, nil
        end,
    }
    service._tuner = {
        observe = function(component_id: string, row: any, request: any, items: any): (any, any)
            calls.observed = calls.observed + 1
            test.eq(component_id, "kb")
            test.eq(row.id, "store")
            test.eq(request.query, "How do actors communicate?")
            test.eq(#items, 0)
            return { status = "waiting", observed = 1, interval = 25 }, nil
        end,
    }
    local result, err = service.handle({ query = "How do actors communicate?" })
    service._ctx, service._store, service._llm, service._tuner = previous_ctx, previous_store, previous_llm, previous_tuner
    return result, calls, err
end

local function define_tests()
    test.describe("declared retrieval settings", function()
        test.it("keeps omitted and explicitly plain settings raw", function()
            for _, config in ipairs({ { summary_model = "class:fast" }, { query_strategy = "plain", analysis_model = "class:fast" } }) do
                local result, calls = query(config, nil, nil)
                test.is_true(result.success)
                test.eq(calls.generated, 0)
                test.eq(calls.observed, 0)
                test.eq(calls.embedded[1], "How do actors communicate?")
            end
        end)
        test.it("embeds the question and hypothetical answer with the declared model", function()
            local result, calls = query({ query_strategy = "hyde", analysis_model = "class:fast" }, { result = "Actors communicate through mailboxes." }, nil)
            test.is_true(result.success)
            test.eq(calls.generated, 1)
            test.eq(calls.embedded[1], "How do actors communicate?\n\nActors communicate through mailboxes.")
            test.eq(result.retrieval.strategy, "hyde")
        end)
        test.it("preserves UTF-8 when bounding a hypothetical passage", function()
            local result, calls = query({ query_strategy = "hyde", analysis_model = "class:fast" }, { result = string.rep("p", 1999) .. "🌱" }, nil)
            test.is_true(result.success)
            test.eq(calls.embedded[1], "How do actors communicate?\n\n" .. string.rep("p", 1999))
        end)
        test.it("returns a typed generation failure without embedding the raw query", function()
            local result, calls, err = query({ query_strategy = "hyde", analysis_model = "class:fast" }, nil, "provider unavailable")
            test.is_nil(result)
            test.eq(err:kind(), "Internal")
            test.ok(tostring(err):find("provider unavailable", 1, true) ~= nil)
            test.eq(#calls.embedded, 0)
        end)
        test.it("requires a declared model when HyDE is enabled", function()
            local result, calls, err = query({ query_strategy = "hyde", summary_model = "class:fast" }, nil, nil)
            test.is_nil(result)
            test.eq(err:kind(), "Invalid")
            test.eq(calls.generated, 0)
            test.eq(#calls.embedded, 0)
        end)
        test.it("refuses an empty hypothetical answer", function()
            local result, calls, err = query({ query_strategy = "hyde", analysis_model = "class:fast" }, { result = "" }, nil)
            test.is_nil(result)
            test.eq(err:kind(), "Internal")
            test.eq(#calls.embedded, 0)
        end)
        test.it("observes successful searches only when autonomous tuning is declared", function()
            local result, calls = query({ self_tuning = true, analysis_model = "class:fast" }, nil, nil)
            test.is_true(result.success)
            test.eq(calls.observed, 1)
            test.eq(result.retrieval.tuning.status, "waiting")
        end)
    end)
end
local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
