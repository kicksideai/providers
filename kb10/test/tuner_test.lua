local test = require("test")
local tuner = require("tuner")

local function define_tests()
    test.describe("bounded autonomous tuning", function()
        test.it("uses the declared model and bounds model evidence and output", function()
            local previous_llm = tuner._llm
            local calls = 0
            tuner._llm = { structured_output = function(schema: any, prompt: string, options: any): (any, any)
                calls = calls + 1
                test.eq(options.model, "class:fast")
                test.eq(options.max_tokens, 1200)
                test.eq(options.timeout, 30)
                test.ok(#prompt < 14000)
                return { result = { summary_prompt = string.rep("s", 900), extra_prompt = string.rep("q", 600), rationale = string.rep("r", 3000) } }, nil
            end }
            local samples, weak = {}, {}
            for i = 1, 100 do
                samples[i] = string.rep("sample", 1000)
                weak[i] = { query = string.rep("query", 1000), top_score = 0.1, results = 0 }
            end
            local proposal, err = tuner.propose({ config = { analysis_model = "class:fast" }, samples = samples, weak_queries = weak, stats = { total = 100, weak = 100 }, document_count = 100 })
            tuner._llm = previous_llm
            test.is_nil(err)
            test.eq(calls, 1)
            test.eq(#proposal.summary_prompt, 700)
            test.eq(#proposal.extra_prompt, 400)
            test.eq(#proposal.rationale, 2000)
        end)
        test.it("preserves complete UTF-8 characters at every proposal limit", function()
            local previous = tuner._llm
            tuner._llm = { structured_output = function(): (any, any)
                return { result = { summary_prompt = string.rep("s", 699) .. "🌱", extra_prompt = string.rep("q", 399) .. "🌱", rationale = string.rep("r", 1999) .. "🌱" } }, nil
            end }
            local proposal, err = tuner.propose({ config = { analysis_model = "class:fast" }, samples = { "summary" }, weak_queries = {}, stats = {}, document_count = 1 })
            tuner._llm = previous
            test.is_nil(err)
            test.eq(proposal.summary_prompt, string.rep("s", 699))
            test.eq(proposal.extra_prompt, string.rep("q", 399))
            test.eq(proposal.rationale, string.rep("r", 1999))
        end)
        test.it("returns a typed model failure", function()
            local previous_llm = tuner._llm
            tuner._llm = { structured_output = function(): (any, any) return nil, "provider unavailable" end }
            local proposal, err = tuner.propose({ config = { analysis_model = "class:fast" }, samples = { "summary" }, stats = {}, weak_queries = {}, document_count = 1 })
            tuner._llm = previous_llm
            test.is_nil(proposal)
            test.eq(err:kind(), "Internal")
            test.ok(tostring(err):find("provider unavailable", 1, true) ~= nil)
        end)
        test.it("applies a claimed tuning once and records its result without overwriting unrelated settings", function()
            local previous_llm, previous_store, previous_log, previous_component = tuner._llm, tuner._store, tuner._query_log, tuner._component
            local config = { self_tuning = true, self_tuning_query_interval = 5, analysis_model = "class:fast", unrelated = "preserved" }
            local generated, writes, finished, access_calls = 0, 0, 0, 0
            tuner._component = { ACCESS = { WRITE = 2 }, validate_access = function(): (any, any) access_calls = access_calls + 1; return true, nil end }
            tuner._llm = { structured_output = function(): (any, any)
                generated = generated + 1
                return { result = { summary_prompt = "Capture structure.", extra_prompt = "Find evidence.", rationale = "Weak results omit structure." } }, nil
            end }
            tuner._store = {
                count_nodes = function(): (any, any) return 2, nil end,
                browse_nodes = function(_, options: any): (any, any) test.eq(options.limit, 1); return { { content = "Document summary" } }, nil end,
                get_store = function(): (any, any) return { id = "store", config = config, config_snapshot = "snapshot" }, nil end,
                update_config = function(id: string, patched: any, snapshot: string, token: string): (any, any)
                    test.eq(id, "kb"); test.eq(snapshot, "snapshot"); test.eq(token, "token")
                    test.eq(patched.unrelated, "preserved")
                    test.eq(patched.extra_prompt, "Find evidence.")
                    test.eq(patched.tuning.queries_observed, 5)
                    writes = writes + 1
                    return true, nil
                end,
            }
            tuner._query_log = {
                record = function(): (any, any) return { observed = 5, claimed_observed = 0 }, nil end,
                claim = function(_, interval: integer): (any, any) test.eq(interval, 5); return "token", nil end,
                stats = function(): (any, any) return { total = 5, weak = 3 }, nil end,
                weak_samples = function(): (any, any) return {}, nil end,
                finish = function(id: string, token: string, result: any, err: any): (any, any)
                    test.eq(id, "store"); test.eq(token, "token"); test.is_nil(err); test.not_nil(result.applied_at)
                    finished = finished + 1
                    return true, nil
                end,
            }
            local outcome, err = tuner.observe("kb", { id = "store", config = config }, { query = "question" }, {})
            tuner._llm, tuner._store, tuner._query_log, tuner._component = previous_llm, previous_store, previous_log, previous_component
            test.is_nil(err)
            test.eq(outcome.status, "applied")
            test.eq(generated, 1); test.eq(writes, 1); test.eq(finished, 1); test.eq(access_calls, 2)
        end)
        test.it("makes read-only tuning admission observable without calling the model", function()
            local previous_log, previous_component = tuner._query_log, tuner._component
            tuner._query_log = { record = function(): (any, any) return { observed = 5, claimed_observed = 0 }, nil end }
            tuner._component = { ACCESS = { WRITE = 2 }, validate_access = function(): (any, any)
                return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "write access required" })
            end }
            local outcome, err = tuner.observe("kb", { id = "store", config = { self_tuning = true, self_tuning_query_interval = 5 } }, { query = "question" }, {})
            tuner._query_log, tuner._component = previous_log, previous_component
            test.is_nil(err)
            test.eq(outcome.status, "requires_write")
            test.eq(outcome.error_kind, errors.PERMISSION_DENIED)
            test.ok(outcome.error:find("write access required", 1, true))
        end)
        test.it("rejects malformed tuning intervals instead of disabling the loop", function()
            local interval, err = tuner.interval({ self_tuning_query_interval = 501 })
            test.is_nil(interval)
            test.eq(err:kind(), "Invalid")
            interval, err = tuner.interval({})
            test.is_nil(err)
            test.eq(interval, 25)
        end)
    end)
end
local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
