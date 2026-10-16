local test = require("test")
local errors = require("errors")
local enrichment_service = require("enrichment_service")

local function define_tests()
    test.describe("kb10 enrichment service", function()
        test.it("fails graph placement when execution identity is missing", function()
            local ok, err = enrichment_service._run_concept_placement(
                "store-1",
                "kb-1",
                "doc-1",
                { embedding_model = "class:embed", config = {} },
                { default_config = {} },
                "user-1",
                nil
            )
            test.is_false(ok)
            test.is_true(string.find(tostring(err), "execution_identity", 1, true) ~= nil)
        end)

        test.it("maps a deleted enrichment agent to a NOT_FOUND error", function()
            local ctx = {
                add_tools = function() end,
                load_agent = function(_, id)
                    return nil, "agent not found: " .. tostring(id)
                end,
            }
            local store = {
                get_node = function()
                    return { content = "some document body", metadata = { title = "Doc" } }, nil
                end,
                browse_nodes = function()
                    return {}
                end,
            }
            local ok, err = enrichment_service._run_agent_enrichment(
                store, "store-1", "kb-1", "doc-1",
                { enrichment_agent_id = "gone-agent", embedding_model = "class:embed" },
                "user-1", ctx
            )
            test.is_false(ok)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("falls back to default placement and flags the KB when the custom enrichment agent is deleted", function()
            local placement_ran = false
            local states: { any } = {}
            local deps = {
                store_for_component = function(_component_id)
                    return {}, { enrichment_agent_id = "gone-agent", embedding_model = "class:embed", config = {} }, { is_graph = true }, nil
                end,
                run_agent_enrichment = function()
                    return false, (errors.new({ message = "agent gone", kind = errors.NOT_FOUND }) :: any)
                end,
                run_concept_placement = function()
                    placement_ran = true
                    return true, nil
                end,
                set_enrichment_state = function(component_id, state, _identity)
                    table.insert(states, { component_id = component_id, state = state })
                end,
            }
            enrichment_service._run_enrichment(
                "store-1", "kb-1", "doc-1", "user-1",
                { actor_id = "owner-1", actor_context = {} }, deps
            )
            test.is_true(placement_ran)
            test.eq(#states, 2)
            test.eq((states[1] :: any).component_id, "kb-1")
            test.eq((states[1] :: any).state.enrichment_agent_id, "gone-agent")
            -- The fallback succeeded, but the dangling agent reference remains
            -- configured: only the failure flag clears, the agent flags persist.
            test.eq((states[2] :: any).state.clear, "error")
        end)

        test.it("flags the KB with the failure reason when placement fails", function()
            local states: { any } = {}
            local deps = {
                store_for_component = function(_component_id)
                    return {}, { embedding_model = "class:embed", config = {} }, { is_graph = true }, nil
                end,
                run_concept_placement = function()
                    return false, "placement failed: No models found for class: nano"
                end,
                set_enrichment_state = function(component_id, state, _identity)
                    table.insert(states, { component_id = component_id, state = state })
                end,
            }
            enrichment_service._run_enrichment(
                "store-1", "kb-1", "doc-1", "user-1",
                { actor_id = "owner-1", actor_context = {} }, deps
            )
            test.eq(#states, 1)
            test.eq((states[1] :: any).component_id, "kb-1")
            test.is_true(string.find(tostring((states[1] :: any).state.error), "No models found for class: nano", 1, true) ~= nil)
        end)

        test.it("clears the attention flags after a successful pass", function()
            local states: { any } = {}
            local deps = {
                store_for_component = function(_component_id)
                    return {}, { embedding_model = "class:embed", config = {} }, { is_graph = true }, nil
                end,
                run_concept_placement = function()
                    return true, nil
                end,
                set_enrichment_state = function(component_id, state, _identity)
                    table.insert(states, { component_id = component_id, state = state })
                end,
            }
            enrichment_service._run_enrichment(
                "store-1", "kb-1", "doc-1", "user-1",
                { actor_id = "owner-1", actor_context = {} }, deps
            )
            test.eq(#states, 1)
            test.eq((states[1] :: any).component_id, "kb-1")
            test.eq((states[1] :: any).state.clear, "all")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
