local test = require("test")
local policy = require("policy")

local function define_tests()
    test.describe("kb10 query policy", function()
        test.it("resolves the analysis model independently of its summary model", function()
            local config = { summary_model = "model:summary", query_strategy = "hyde" }
            test.is_nil(policy.resolve_analysis_model(config))
            for _, off in ipairs({ "", false }) do
                config.analysis_model = off
                test.is_nil(policy.resolve_analysis_model(config))
                local hyde_model, err = policy.resolve_hyde_model(config)
                test.is_nil(hyde_model)
                test.is_true(errors.is(err, errors.INVALID))
            end
            config.analysis_model = "model:query"
            test.eq(policy.resolve_analysis_model(config), "model:query")
            test.eq((policy.resolve_hyde_model(config)), "model:query")
        end)

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
