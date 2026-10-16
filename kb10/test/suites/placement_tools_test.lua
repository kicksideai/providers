local test = require("test")

local placement_tools = require("placement_tools")

-- A store answering concept_taxonomy the way node_store does: every concept, the
-- parent of each child and the resolved root.
local function taxonomy_store(concepts: { any }, parent_by_child: { [string]: string }, root_id: string?): any
    local nodes_by_id: { [string]: any } = {}
    for _, concept in ipairs(concepts) do nodes_by_id[concept.id] = concept end
    return {
        concept_taxonomy = function(_, _)
            return { concepts = concepts, nodes_by_id = nodes_by_id, parent_by_child = parent_by_child, root_id = root_id }, nil
        end,
    }
end

local function define_tests()
    test.describe("placement concept tree state", function()
        test.it("derives depth from the taxonomy root and parent edges", function()
            local concepts: { any } = { { id = "root", metadata = { label = "Root", is_root = true } } }
            local parents: { [string]: string } = {}
            for index = 1, 50 do
                local id = "c" .. tostring(index)
                concepts[#concepts + 1] = { id = id, metadata = { label = "Topic " .. index } }
                parents[id] = index == 1 and "root" or "c" .. tostring(index - 1)
            end
            local state, err = placement_tools._concept_tree_state_for_test(taxonomy_store(concepts, parents, "root"), "store")
            test.is_nil(err)
            test.eq(state.root_id, "root")
            test.eq(state.non_root_count, 50)
            test.eq(state.depth_by_id["root"], 0)
            test.eq(state.depth_by_id["c1"], 1)
            test.eq(state.depth_by_id["c50"], 50)
        end)

        test.it("preserves taxonomy read failures", function()
            local cause = errors.new({ message = "ambiguous root concept", kind = errors.CONFLICT })
            local state, err = placement_tools._concept_tree_state_for_test({ concept_taxonomy = function() return nil, cause end }, "store")
            test.is_nil(state)
            test.eq(err, cause)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
