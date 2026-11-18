local test = require("test")
local policy = require("policy")
local registry = require("registry")

local function define_tests()
    test.describe("kb10 query policy", function()
        for _, kb_type in ipairs({ "document", "wiki" }) do
            test.it("resolves the " .. kb_type .. " analysis model independently of its summary model", function()
                local engine = registry.get("kickside.kb10:engine_" .. kb_type).meta
                local config = { summary_model = "model:summary", query_strategy = "hyde" }
                local default = engine.default_config.analysis_model
                test.eq(policy.resolve_analysis_model(config, engine), default)
                config.analysis_model = ""
                test.eq(policy.resolve_analysis_model(config, engine), default)
                test.eq((policy.resolve_hyde_model(config, engine)), default)
                config.analysis_model = false
                test.is_nil(policy.resolve_analysis_model(config, engine))
                config.analysis_model = "model:query"
                test.eq(policy.resolve_analysis_model(config, engine), "model:query")
            end)
        end

        test.it("fails closed to raw retrieval for malformed model values", function()
            test.is_nil(policy.resolve_analysis_model({ analysis_model = true }))
        end)

        test.it("hard-bounds document analysis", function()
            local options = policy.document_analysis_options("model:query")
            test.eq(options.model, "model:query")
            test.eq(options.temperature, 0.3)
            test.eq(options.max_tokens, 2048)
            test.eq(options.timeout, 30)
        end)

        test.it("hard-bounds reranking", function()
            local options = policy.rerank_options("model:query")
            test.eq(options.model, "model:query")
            test.eq(options.temperature, 0)
            test.eq(options.max_tokens, 1024)
            test.eq(options.timeout, 20)
        end)

        test.it("hard-bounds interactive query embedding", function()
            local options = policy.query_embed_options("model:embed", 768)
            test.eq(options.model, "model:embed")
            test.eq(options.dimensions, 768)
            test.eq(options.timeout, 30)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
