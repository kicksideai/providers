local test = require("test")
local engines = require("engines")

return test.run_cases(function()
    test.describe("engine query configuration", function()
        test.it("declares query controls with unchanged defaults and preserves stored overrides", function()
            for _, kind in ipairs({ "document", "wiki" }) do
                local engine, err = engines.resolve(kind)
                test.is_nil(err)
                local defaults = engine.default_config
                local properties = engine.config_schema.properties
                test.eq(defaults.analysis_model, "")
                test.eq(defaults.extra_prompt, "")
                test.eq(defaults.enable_reranking, false)
                test.not_nil(properties.analysis_model)
                test.not_nil(properties.extra_prompt)
                test.eq(properties.enable_reranking.type, "boolean")
                test.eq(defaults.retrieval_model, kind == "wiki" and "class:nano" or nil)
                test.is_nil(defaults.fallback_node_types)
                local stored = { analysis_model = false, extra_prompt = "Find citations", enable_reranking = true,
                    retrieval_model = "model:old", fallback_node_types = { "chunk" }, query_driver = "agentic",
                    search_limit = 17, max_retrieval_iterations = 6 }
                local config = engines.apply_default_config(stored, engine)
                for key, value in pairs(stored) do test.eq(config[key], value) end
                test.eq(defaults.query_driver, "built-in")
                test.eq(defaults.search_limit, 10)
                test.not_nil(defaults.max_retrieval_iterations)
            end
        end)
    end)
end)
