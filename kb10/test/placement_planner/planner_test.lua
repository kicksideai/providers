local contract = require("contract")
local funcs = require("funcs")
local materializer = require("materializer")
local node_store = require("node_store")
local planner = require("planner")
local reader = require("reader")
local security = require("security")
local sql = require("sql")
local store = require("store")
local test = require("test")
local tools = require("tools")
local uuid = require("uuid")
local writer = require("writer")

local PLAN_REF = "app.placement_planner:plan"

local function executor(id)
    local actor = assert(security.new_actor(id, {}))
    local scope = assert(security.named_scope("wippy.security:process"))
    local components = assert(assert(contract.get("kickside.component:component_service")):with_actor(actor):with_scope(scope):open())
    return funcs.new():with_actor(actor):with_scope(scope), components
end

local function fixture(summary, legacy)
    local exec, components = executor("placement-planner-owner")
    local component_id, event = uuid.v7(), uuid.v7()
    local registered, register_err = components:register({component_id = component_id, impl_id = "kickside.kb10:embeddable"})
    assert(registered and registered.success, tostring(register_err or (registered and registered.error)))
    local store_id = assert(node_store:create_store({component_id = component_id, embedding_model = "fixture",
        config = {concept_context = "Use the fixture taxonomy"}, opts = {kb_type = "wiki", is_graph = true}}))
    local taxonomy = assert(node_store:concept_taxonomy({store_id = store_id}))
    local function concept(label)
        local id = legacy and ("legacy-concept:" .. label) or uuid.v7()
        return assert(node_store:insert_graph_node({store_id = store_id,
            node = {id = id, node_type = "concept", metadata = {label = label}},
            parent_edge = {to_node_id = taxonomy.root_id, edge_type = "subtopic_of"}}))
    end
    local existing, alternate = concept("Existing target"), concept("Alternate target")
    local materialized = assert(materializer:replace_document({store_id = store_id,
        document = {id = legacy and "legacy-document:plan" or nil, node_type = "document", content = summary, metadata = {
            status = "completed", external_source = "fixture", external_id = "doc", external_version = "1",
            thread_event_id = event, thread_event_seq = 1,
            source_ref = {thread_id = component_id, external_source = "fixture", external_id = "doc",
                external_version = "1", thread_event_id = event, thread_event_seq = 1}}},
        children = {}}))
    return exec, {component_id = component_id, store_id = store_id, document_node_id = materialized.document_node_id,
        extraction_model = "kb10-placement-planner-fixture"}, existing, alternate
end

local function read_edges(args)
    return assert(node_store:get_edges({store_id = args.store_id, node_id = args.document_node_id,
        opts = {direction = "out", edge_type = "categorized_as"}}))
end

local function run_placement(legacy)
    local exec, args, existing, alternate = fixture("Plan a small piece of content.", legacy)
    if legacy then test.eq(args.document_node_id, "legacy-document:plan") end
    local planned, plan_err = exec:call(PLAN_REF, args)
    assert(planned, tostring(plan_err))
    test.eq(planned.version, 1)
    test.eq(planned.action, "planned")
    test.eq(planned.store_id, args.store_id)
    test.eq(planned.document_node_id, args.document_node_id)
    local ops = planned.operations
    test.eq(#ops, 4)
    test.eq(ops[1].kind, "create_concept")
    test.is_true(uuid.validate(ops[1].id))
    test.eq(ops[2].kind, "attach_document")
    test.eq(ops[2].concept_id, ops[1].id)
    test.eq(ops[3].kind, "merge_concepts")
    test.eq(ops[3].from_id, ops[1].id)
    test.eq(ops[3].into_id, existing)
    test.eq(ops[4].kind, "move_document")
    test.eq(ops[4].concept_id, alternate)
    test.eq(#assert(node_store:concept_taxonomy({store_id = args.store_id})).concepts, 3)
    test.eq(#read_edges(args), 0)
end

local function populated_wiki()
    local exec, args = fixture("large-wiki-probe")
    local graph = assert(node_store:concept_taxonomy({store_id = args.store_id}))
    local root, hidden = graph.root_id, "ffffffff" .. uuid.v7():sub(9)
    local nodes = {{id = hidden, node_type = "concept", metadata = {label = "Before retitling"}}}
    local edges = {{from_node_id = hidden, to_node_id = root, edge_type = "subtopic_of"}}
    for i = 1, 520 do
        local id = uuid.v7()
        nodes[#nodes + 1] = {id = id, node_type = "concept", metadata = {label = "Ordinary concept " .. i}}
        edges[#edges + 1] = {from_node_id = id, to_node_id = root, edge_type = "subtopic_of"}
    end
    for i = 1, 4200 do
        local id = uuid.v7()
        nodes[#nodes + 1] = {id = id, node_type = "document", metadata = {title = "Indexed document " .. i}}
        edges[#edges + 1] = {from_node_id = id, to_node_id = hidden, edge_type = "categorized_as"}
    end
    -- These are the same bulk writer entry points used by import.
    assert(store.insert_nodes(args.store_id, nodes))
    assert(store.insert_edges(args.store_id, edges))
    local _, update_err = node_store:update_node({store_id = args.store_id, node_id = hidden,
        metadata = {label = "  Hidden    normalized LABEL  "}})
    test.is_nil(update_err)
    local planned, err = exec:call(PLAN_REF, args)
    assert(planned, tostring(err))
    test.eq(planned.action, "planned")
    test.eq(#planned.operations, 1)
    test.eq(planned.operations[1].kind, "attach_document")
    test.eq(planned.operations[1].concept_id, hidden)
    test.eq(#read_edges(args), 0)
end

local function replay_revision()
    local exec, args, _, alternate = fixture("Replay the draft graph for this document.")
    local wake, newer, cursor_id = uuid.v7(), uuid.v7(), uuid.v7()
    local db = assert(sql.get("app:db"))
    assert(db:execute("UPDATE kb10_stores SET placement_cursor_id=$1 WHERE id=$2", {cursor_id, args.store_id}))
    local function seed(wake_id)
        assert(db:execute("UPDATE kb10_nodes SET placement_wake_id=$1,placement_identity=$2 WHERE id=$3",
            {wake_id, "{}", args.document_node_id}))
    end
    seed(wake)
    assert(db:release())

    args.wake_id = wake
    local plan = assert(exec:call(PLAN_REF, args))
    for _, operation in ipairs(plan.operations) do
        if operation.kind == "create_concept" then
            operation.node = tools.concept_node(operation.label, operation.description)
            operation.node.id = operation.id
        end
    end
    local expected = assert(reader.get_store(args.component_id, true))
    db = assert(sql.get("app:db"))
    local dialect = assert(db:type())
    local function replay(tx)
        assert(writer.consume_placement_tx(tx, dialect, args.store_id, wake, args.document_node_id, expected))
        local changes, write_err = writer.apply_placement_tx(tx, dialect, args.store_id, args.document_node_id, plan, 3)
        assert(changes, tostring(write_err))
        local reasons = {}
        for _, change in ipairs(changes) do reasons[#reasons + 1] = change.reason end
        test.eq(table.concat(reasons, ","), "concept.created,document.attached,concept.merged,document.moved")
    end

    local tx = assert(db:begin())
    replay(tx)
    assert(tx:rollback())
    test.eq(assert(db:query("SELECT placement_wake_id FROM kb10_nodes WHERE id=$1", {args.document_node_id}))[1].placement_wake_id, wake)
    seed(newer)
    tx = assert(db:begin())
    local claimed, claim_err = writer.consume_placement_tx(tx, dialect, args.store_id, wake, args.document_node_id, expected)
    test.is_nil(claim_err)
    test.eq(claimed, false)
    assert(tx:commit())
    test.eq(assert(db:query("SELECT placement_wake_id FROM kb10_nodes WHERE id=$1", {args.document_node_id}))[1].placement_wake_id, newer)
    seed(wake)
    tx = assert(db:begin())
    replay(tx)
    assert(tx:commit())
    test.eq(#assert(db:query("SELECT id FROM kb10_nodes WHERE id=$1 AND placement_wake_id IS NOT NULL",
        {args.document_node_id})), 0)
    assert(db:release())
    local edges = read_edges(args)
    test.eq(#edges, 1)
    test.eq(edges[1].to_node_id, alternate)
end

local function define()
    test.describe("default placement planner", function()
        test.it("replays graph edits and acknowledges only the exact committed revision", replay_revision)
        test.it("uses indexed label and document pages after bounded discovery on a populated Wiki", populated_wiki)
        test.it("plans real model-tool turns and dependent draft reads without graph writes", function()
            run_placement(false)
        end)
        test.it("preserves stored legacy SQLite IDs", function()
            local db = assert(sql.get("app:db"))
            local is_sqlite = db:type() == sql.type.SQLITE
            assert(db:release())
            if is_sqlite then run_placement(true) end
        end)
        test.it("refuses cross-component graph addresses, foreign tools, and incomplete plans", function()
            local exec, args = fixture("refuse-tool")
            local unrelated, other_args = fixture("incomplete-tool")
            local wrong = {component_id = other_args.component_id, store_id = args.store_id,
                document_node_id = args.document_node_id, extraction_model = args.extraction_model}
            local absent, mismatched = unrelated:call(PLAN_REF, wrong)
            test.is_nil(absent)
            test.contains(tostring(mismatched), "store not found")
            local stranger = executor("placement-planner-stranger")
            local unauthorized, access_err = stranger:call(PLAN_REF, args)
            test.is_nil(unauthorized)
            test.is_true(errors.is(access_err, errors.PERMISSION_DENIED), tostring(access_err))
            local foreign, foreign_err = exec:call(PLAN_REF, args)
            test.is_nil(foreign)
            test.contains(tostring(foreign_err), "unrecognized tool call")
            local incomplete, incomplete_err = unrelated:call(PLAN_REF, other_args)
            test.is_nil(incomplete)
            test.contains(tostring(incomplete_err), "did not attach")
            local invalid_exec, invalid_args = fixture("invalid-args-tool")
            local invalid_plan, invalid_err = invalid_exec:call(PLAN_REF, invalid_args)
            test.is_nil(invalid_plan)
            test.contains(tostring(invalid_err), "did not attach")
            test.eq(#assert(node_store:concept_taxonomy({store_id = invalid_args.store_id})).concepts, 3)
            test.eq(#read_edges(args), 0)
        end)
        test.it("respects an existing manual categorization without calling the model", function()
            local exec, args, existing = fixture("must-not-generate")
            assert(node_store:insert_edge({store_id = args.store_id, edge = {from_node_id = args.document_node_id,
                to_node_id = existing, edge_type = "categorized_as", metadata = {manual = true}}}))
            local planned, err = exec:call(PLAN_REF, args)
            assert(planned, tostring(err))
            test.eq(planned.action, "locked_categorization_skipped")
            test.eq(#planned.operations, 0)
            test.is_true(read_edges(args)[1].metadata.manual)
        end)
    end)
end

return {run = test.run_cases(define), plan = planner.plan}
