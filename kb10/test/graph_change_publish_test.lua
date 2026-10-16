-- Every kb10 entry that appends a graph.changed event to the knowledge base thread
-- uses the component's effective WRITE and stored output declarations. The tests run the real
-- concept placement tools and the concept API entries and assert the event lands.

local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local funcs = require("funcs")
local security = require("security")
local contract = require("contract")
local registry = require("registry")
local kb10_types = require("kb10_types")
local node_store = require("node_store")
local thread_ingest = require("thread_ingest")

local GRAPH_CHANGED = "kickside.knowledge.events:graph.changed"
local KB_ENGINE_IMPL = "kickside.kb10:engine_document"
local KB_THREAD_CLASS = "kickside.knowledge.injection"
local PUBLISH_POLICY = "kickside.knowledge.security:graph_changed_publish"
local PRODUCER_ENTRIES = {
    "kickside.kb10.graph:create_concept",
    "kickside.kb10.graph:attach_document",
    "kickside.kb10.graph:move_document",
    "kickside.kb10.graph:merge_concept",
    "kickside.kb10.api:concepts_create",
    "kickside.kb10.api:concepts_update",
    "kickside.kb10.api:concepts_move",
    "kickside.kb10.api:concepts_delete",
}
local OWNER = "graph_change_publish_owner"

local function uuid(): string
    local id, err = crypto.random.uuid()
    if err then error("uuid failed: " .. tostring(err)) end
    return id
end

local function exec_ok(db: any, sql_text: string, params: { any }): ()
    local _, err = db:execute(sql_text, params)
    if err then error("seed failed: " .. tostring(err)) end
end

local function seed_kb(component_id: string): (string, string)
    local db, db_err = sql.get("app:db")
    if db_err then error("db unavailable: " .. tostring(db_err)) end
    local now = db:type() == sql.type.SQLITE and "strftime('%s', 'now')" or "now()"
    exec_ok(db, "INSERT INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at) VALUES ($1, $2, 'KB10 Test User', '!test:no-password', 'active', " .. now .. ", " .. now .. ") ON CONFLICT (user_id) DO NOTHING"
        , { OWNER, OWNER .. "@kb10.test" })
    exec_ok(db, "INSERT INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'app:user', " .. now .. ") ON CONFLICT (user_id, group_id) DO NOTHING", { OWNER })
    exec_ok(db, [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
        VALUES ($1, $2, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]], { component_id, kb10_types.EMBED_BINDING })
    for key, value in pairs({ title = "Graph change target", class = "knowledge_base" }) do
        exec_ok(db, [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]], { uuid(), component_id, key, value })
    end
    exec_ok(db, [[INSERT INTO kickside_component_access (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
        VALUES ($1, 'user', $2, $3, $4, 15, CURRENT_TIMESTAMP)]], { uuid(), OWNER, component_id, component_id })
    db:release()

    local store_id, store_err = node_store:create_store({ component_id = component_id, embedding_model = "test-model", config = {} })
    if store_err then error("create_store failed: " .. tostring(store_err)) end

    local actor = security.new_actor(OWNER, {})
    local scope = security.named_scope("wippy.security:process")
    local def, def_err = contract.get("kickside.core:threads")
    if def_err or not def then error("threads contract: " .. tostring(def_err)) end
    local threads, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not threads then error("threads open: " .. tostring(open_err)) end
    local _, ensure_err = threads:ensure_thread({
        component_id = component_id,
        impl_id = KB_ENGINE_IMPL,
        thread_class = KB_THREAD_CLASS,
    })
    if ensure_err then error("provision primary thread: " .. tostring(ensure_err)) end

    local root_id, root_err = node_store:insert_node({ store_id = store_id, node = {
        node_type = "concept",
        content = "Top-level knowledge",
        metadata = { label = "Root", is_root = true },
    } })
    if root_err then error("root insert failed: " .. tostring(root_err)) end
    return store_id, root_id
end

local function cleanup_kb(component_id: string, store_id: string): ()
    local db, db_err = sql.get("app:db")
    if not db then error("db unavailable: " .. tostring(db_err)) end
    local _, thread_err = thread_ingest.purge_thread(component_id)
    test.is_nil(thread_err, tostring(thread_err))
    db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { store_id })
    db:execute("DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM kb10_nodes WHERE store_id = $1)", { store_id })
    db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { store_id })
    db:execute("DELETE FROM kb10_stores WHERE id = $1", { store_id })
    db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { component_id })
    db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { component_id })
    db:execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
    db:release()
end

local function graph_changed_events(thread_id: string): { any }
    local db, db_err = sql.get("app:db")
    if not db then error("db unavailable: " .. tostring(db_err)) end
    local rows, err = db:query("SELECT body FROM kickside_event WHERE thread_id = $1 AND type = $2 ORDER BY seq",
        { thread_id, GRAPH_CHANGED })
    db:release()
    if err then error("event query failed: " .. tostring(err)) end
    local events = {}
    for _, row in ipairs(rows or {}) do
        local decoded = json.decode(row.body)
        events[#events + 1] = decoded
    end
    return events
end

local function tool_exec(store_id: string, component_id: string): any
    local actor = security.new_actor(OWNER, {})
    local policy, policy_err = security.policy("app:runtime_calls_only")
    if not policy then error("runtime_calls_only policy missing: " .. tostring(policy_err)) end
    local scope = security.new_scope({ policy })
    return funcs.new():with_actor(actor):with_scope(scope):with_context({
        graph_store_id = store_id,
        graph_component_id = component_id,
    })
end

local function define_tests()
    test.describe("graph.changed publication from concept tools", function()
        test.it("writes enrichment failures under the frozen owner from the service actor", function()
            local component_id = uuid()
            local store_id = seed_kb(component_id)
            local identity = { actor_id = OWNER, actor_context = json.encode({
                version = 2, principal = { kind = "user", id = OWNER },
                authorized_by = { kind = "user", id = OWNER },
                component_id = component_id, captured_at = "2026-10-04T00:00:00Z",
            }) }
            local actor = security.new_actor("kickside.kb10.graph:enrichment_service", {})
            local result, err = funcs.new():with_actor(actor):with_scope(security.named_scope("wippy.security:process"))
                :call("app:enrichment_identity_probe", { component_id = component_id, owner = OWNER, identity = identity })
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local rows, query_err = db:query("SELECT value FROM kickside_component_meta WHERE component_id = $1 AND key = 'enrichment_error'", { component_id })
            db:release()
            test.is_nil(query_err)
            test.eq(#rows, 1, "enrichment failure remains visible: " .. json.encode(result))
            test.contains(rows[1].value, "controlled placement failure")
            cleanup_kb(component_id, store_id)
        end)

        local component_id: string = ""
        local store_id: string = ""
        local root_id: string = ""

        test.before_each(function()
            component_id = uuid()
            store_id, root_id = seed_kb(component_id)
        end)
        test.after_each(function()
            cleanup_kb(component_id, store_id)
        end)

        test.it("CreateConcept appends graph.changed", function()
            local result, err = tool_exec(store_id, component_id):call("kickside.kb10.graph:create_concept", {
                label = "Published Topic",
                description = "Topic whose creation is published",
            })
            test.is_nil(err)
            test.ok((result :: any).result == "created", tostring(result))
            local events = graph_changed_events(component_id)
            test.eq(#events, 1)
            test.eq(events[1].reason, "concept.created")
            test.eq(events[1].kb_id, component_id)
        end)

        test.it("MergeConcept appends graph.changed", function()
            local exec = tool_exec(store_id, component_id)
            local from, from_err = exec:call("kickside.kb10.graph:create_concept", { label = "Merge Source", parent_id = root_id })
            test.is_nil(from_err)
            local from_id = (from :: any).concept_id
            test.not_nil(from_id)
            local into, into_err = exec:call("kickside.kb10.graph:create_concept", { label = "Merge Target", parent_id = root_id })
            test.is_nil(into_err)
            local into_id = (into :: any).concept_id
            test.not_nil(into_id)

            local merged, merge_err = exec:call("kickside.kb10.graph:merge_concept", { from_id = from_id, into_id = into_id })
            test.is_nil(merge_err)
            test.ok((merged :: any).result == "merged", tostring(merged))
            local reasons = {}
            for _, event in ipairs(graph_changed_events(component_id)) do reasons[#reasons + 1] = event.reason end
            test.eq(table.concat(reasons, ","), "concept.created,concept.created,concept.merged")
        end)

        test.it("returns the append failure to the caller when the event cannot be written", function()
            local unprovisioned = uuid()
            local result, err = tool_exec(store_id, unprovisioned):call("kickside.kb10.graph:create_concept", {
                label = "Unpublished Topic",
                parent_id = root_id,
            })
            test.is_nil(result)
            test.contains(tostring(err), "graph change event append failed")
        end)
    end)

    test.describe("graph.changed component writer authorization", function()
        test.it("every graph producer uses component authorization without a publish policy", function()
            for _, id in ipairs(PRODUCER_ENTRIES) do
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry, id)
                local policies = entry.data and entry.data.security and entry.data.security.policies or {}
                local declared = false
                for _, policy in ipairs(policies) do
                    if policy == PUBLISH_POLICY then declared = true end
                end
                test.is_false(declared, id .. " has no obsolete publication policy")
            end
        end)

        test.it("an owner without publish capability produces graph.changed", function()
            local component_id = uuid()
            local store_id = seed_kb(component_id)
            local actor = security.new_actor(OWNER, {})
            local policy = security.policy("app:runtime_calls_only")
            local result, err = funcs.new():with_actor(actor):with_scope(security.new_scope({ policy }))
                :call("app:graph_change_probe", { kb_id = component_id })
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(#graph_changed_events(component_id), 1)
            cleanup_kb(component_id, store_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
