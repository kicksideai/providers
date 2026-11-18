local test = require("test")
local policy = require("policy")
local analysis_model = require("analysis_model")
local registry = require("registry")

local function define_tests()
    test.describe("kb10 query policy", function()
        test.it("uses the default analysis model for omitted and empty settings", function()
            for _, kb_type in ipairs({ "document", "wiki" }) do
                local engine = registry.get("kickside.kb10:engine_" .. kb_type).meta
                local default = engine.default_config.analysis_model
                test.eq(analysis_model.configured({ summary_model = "class:summary" }), default)
                test.eq(analysis_model.configured({ analysis_model = "" }), default)
            end
        end)

        test.it("uses an explicit analysis model instead of the summary model", function()
            test.eq(analysis_model.configured({
                analysis_model = "model:query",
                summary_model = "model:summary"
            }), "model:query")
        end)

        test.it("treats explicit false as raw vector retrieval", function()
            test.is_nil(analysis_model.configured({
                analysis_model = false,
                summary_model = "class:fast",
                enable_reranking = true
            }))
        end)

        test.it("uses the default when a boolean enables analysis without naming a model", function()
            test.eq(analysis_model.configured({ analysis_model = true }), "class:fast")
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
