-- Runtime-faithful tests for the KB node/graph explorer tools (kickside.kb10.traits:
-- kb_{get_node,browse,graph,summaries}_tool). The tools run inside the agent runtime
-- with the caller's actor + scope, so we drive them through a framed funcs executor
-- (matching traits_test.lua) rather than a bare funcs.call — that way the required_scopes
-- resolve and the access gate sees a real actor. Coverage here is shape, argument
-- validation, kb_id resolution (arg + context, including multi-KB disambiguation), and
-- the access gate; content/success assertions over a seeded KB live in the live e2e.

local test = require("test")
local funcs = require("funcs")
local security = require("security")

local GET = "kickside.kb10.traits:kb_get_node_tool"
local BROWSE = "kickside.kb10.traits:kb_browse_tool"
local GRAPH = "kickside.kb10.traits:kb_graph_tool"
local SUMMARIES = "kickside.kb10.traits:kb_summaries_tool"

local UNKNOWN_KB = "00000000-0000-0000-0000-000000000000"
local UNKNOWN_KB_2 = "11111111-1111-1111-1111-111111111111"

-- A framed executor mirroring the agent runtime: an actor + the process scope the
-- tools' required_scopes resolve against, plus an optional tool context.
local function executor(context: any?): any
    local actor: any = security.new_actor("kb_explorer_test_user", {})
    local scope: any = security.named_scope("wippy.security:process")
    local e: any = funcs.new():with_actor(actor):with_scope(scope)
    if context then e = e:with_context(context) end
    return e
end

local function define_tests()
    test.describe("kb node explorer tools", function()
        -- Every KB tool returns markdown on success. An unresolved kb_id is a domain
        -- error { success = false, error, kb_ids }; a refused read is the typed error
        -- of the access check.
        for _, case in ipairs({ { GET, { node_id = "n" } }, { BROWSE, {} }, { GRAPH, { node_id = "n" } }, { SUMMARIES, {} } }) do
            test.it(case[1] .. " requires a kb_id", function()
                local r: any, err = executor():call(case[1], case[2])
                test.is_nil(err)
                test.is_false(r.success)
                test.eq(r.error, "kb_id is required")
            end)
        end

        test.it("fails every markdown read tool with the typed access refusal", function()
            for _, id in ipairs({ GET, BROWSE, GRAPH, SUMMARIES }) do
                local r, err = executor():call(id, { kb_id = UNKNOWN_KB, query = "x", node_id = "n" })
                test.is_nil(r)
                test.not_nil(err)
            end
        end)

        -- Multi-KB pinning (the kb_reader trait writes kb_ids: string[]). A single
        -- pinned KB still resolves with no kb_id; several pinned changes how each
        -- tool resolves — survey spans every base, node tools demand one.

        test.it("summaries spans every pinned KB and gates each", function()
            local r, err = executor({ kb_ids = { UNKNOWN_KB, UNKNOWN_KB_2 } }):call(SUMMARIES, {})
            test.is_nil(r)
            test.not_nil(err)
        end)

        test.it("node tools require an explicit kb_id when several KBs are configured", function()
            -- Node tools act on one node/subtree, so with several pinned and no
            -- kb_id they return a domain error naming the choices.
            for _, id in ipairs({ GET, BROWSE, GRAPH }) do
                local r: any, err = executor({ kb_ids = { UNKNOWN_KB, UNKNOWN_KB_2 } }):call(id, { node_id = "n" })
                test.is_nil(err)
                test.is_false(r.success)
                test.contains(r.error, "several KBs are configured")
                test.eq(r.kb_ids[1], UNKNOWN_KB)
                test.eq(r.kb_ids[2], UNKNOWN_KB_2)
            end
        end)

        test.it("node tools accept an explicit kb_id to disambiguate among several", function()
            local r, err = executor({ kb_ids = { UNKNOWN_KB, UNKNOWN_KB_2 } }):call(GET, { kb_id = UNKNOWN_KB, node_id = "n" })
            test.is_nil(r)
            test.not_nil(err)
        end)

        test.it("node tools resolve the lone pinned KB without an explicit kb_id", function()
            local r, err = executor({ kb_ids = { UNKNOWN_KB } }):call(GET, { node_id = "n" })
            test.is_nil(r)
            test.not_nil(err)
        end)
    end)

    test.describe("kb node explorer tool results", function()
        test.after_each(function() kb_nodes.failure = nil end)

        test.it("browse returns compact nodes while get returns content", function()
            local r: any, err = node_tools.browse({ kb_id = "kb-1" })
            test.is_nil(err)
            test.contains(r, "- doc-1 [document] · Shipping")
            test.is_nil((r:find("Northwind ships tea", 1, true)))
            test.is_nil((r:find("Returns are accepted", 1, true)))
        end)

        test.it("get_node returns the node's full content", function()
            local r: any, err = node_tools.get_node({ kb_id = "kb-1", node_id = "doc-2" })
            test.is_nil(err)
            test.eq(r, "# doc-2 [document]\n\nReturns are accepted for thirty days.")
        end)

        test.it("fails with the typed access refusal", function()
            for _, tool in ipairs({ "get_node", "browse", "graph", "summaries" }) do
                local r, err = (node_tools :: any)[tool]({ kb_id = "denied-kb", node_id = "doc-1" })
                test.is_nil(r)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            end
        end)

        test.it("fails with the store's typed error", function()
            kb_nodes.failure = errors.new({ kind = errors.UNAVAILABLE, message = "node store unavailable" })
            for _, tool in ipairs({ "get_node", "browse", "graph", "summaries" }) do
                local r, err = (node_tools :: any)[tool]({ kb_id = "kb-1", node_id = "doc-1" })
                test.is_nil(r)
                test.eq(err, kb_nodes.failure)
            end
        end)

        test.it("fails get_node for a missing node with the typed not-found error", function()
            local r, err = node_tools.get_node({ kb_id = "kb-1", node_id = "missing" })
            test.is_nil(r)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
