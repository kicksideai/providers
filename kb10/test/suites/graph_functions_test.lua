-- The graph retrieval step runs through llm.structured_output, which Claude (and
-- other strict-schema providers) reject unless EVERY property is required — an
-- optional property must instead be required + nullable. This guards that shape
-- so the regression (only `action` required) can't come back.
local test = require("test")
local graph_fn = require("graph_fn")

local function nullable(def: any): boolean
    local t = (type(def) == "table") and (def :: { type: any }).type or nil
    if type(t) ~= "table" then return false end
    for _, tv in ipairs(t :: { any }) do
        if tv == "null" then return true end
    end
    return false
end

-- A fake node_store whose per-method returns are supplied per case, so a store
-- read failure can be driven without a live graph store.
local function fake_store(handlers: any): any
    local h = handlers or {}
    return {
        concept_taxonomy = function(_, _) local r = h.concept_taxonomy or { { concepts = {}, nodes_by_id = {}, parent_by_child = {} }, nil }; return r[1], r[2] end,
        get_all_edges_batch = function(_, _) local r = h.get_all_edges_batch or { {}, nil }; return r[1], r[2] end,
        get_nodes = function(_, _) local r = h.get_nodes or { {}, nil }; return r[1], r[2] end,
    }
end

local function define_tests()
    test.describe("graph store-read error propagation", function()
        test.it("fetch_concept_tree surfaces a store read error instead of an empty tree", function()
            -- the taxonomy yields one concept, so the traversal reaches the batched
            -- in-edge read; that read fails. The function must return (nil, err),
            -- never a plausible-but-empty tree that hides the failure.
            graph_fn._set_store(fake_store({
                concept_taxonomy = { { concepts = { { id = "c1", node_type = "concept", metadata = {} } },
                    nodes_by_id = { c1 = { id = "c1", node_type = "concept", metadata = {} } }, parent_by_child = {}, root_id = "c1" }, nil },
                get_all_edges_batch = { nil, "db timeout" },
            }))
            local tree, err = graph_fn.fetch_concept_tree({ store_id = "s1" })
            graph_fn._reset_store()
            test.is_nil(tree)
            test.not_nil(err)
        end)

        test.it("fetch_concept_tree returns a tree when every store read succeeds", function()
            graph_fn._set_store(fake_store({
                get_all_edges_batch = { {}, nil },
                get_nodes = { {}, nil },
            }))
            local tree, err = graph_fn.fetch_concept_tree({ store_id = "s1" })
            graph_fn._reset_store()
            test.is_nil(err)
            test.not_nil(tree)
            test.eq((tree :: any).concept_count, 0)
        end)
    end)

    test.describe("graph RETRIEVAL_STEP_SCHEMA (strict-schema safe)", function()
        test.it("marks every property required and makes conditional ones nullable", function()
            local schema = graph_fn.RETRIEVAL_STEP_SCHEMA
            test.not_nil(schema, "schema is exported")
            local props = (schema :: { properties: any }).properties
            local req: { [string]: boolean } = {}
            for _, k in ipairs((schema :: { required: any }).required :: { string }) do
                req[k] = true
            end
            for k, def in pairs(props :: { [string]: any }) do
                test.is_true(req[k] == true, k .. " must be in required")
                if k ~= "action" then
                    test.is_true(nullable(def), k .. " must be nullable (string|null)")
                end
            end
            test.eq((schema :: { additionalProperties: any }).additionalProperties, false)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
