-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component_owner = require("projection_owner")
local deletion_worker = require("deletion_worker")
local fs = require("fs")
local funcs = require("funcs")
local jobs = require("jobs")
local json = require("json")
local models = require("models")
local node_store = require("node_store")
local process = require("process")
local security = require("security")
local sql = require("sql")
local store = require("store")
local test = require("test")
local time = require("time")
local uuid = require("uuid")

local PRODUCER = "kickside.kb10.graph:enroll_placement"
local UPGRADE = "kickside.kb10.graph:placement_upgrade"
local WIKI = "kickside.kb10:engine_wiki"
local EMBEDDABLE = "kickside.kb10:embeddable"
local PLACEMENT = "kickside.kb10.graph.placement"

local function db(run)
    local connection = assert(sql.get("app:db"))
    local ok, result = pcall(run, connection)
    assert(select(2, connection:release()) == nil)
    if not ok then error(result) end
    return result
end

local function as_user(user)
    local actor = assert(security.new_actor(user, {security_groups = {"app:user"}}))
    return assert(funcs.new()):with_actor(actor):with_scope(assert(security.named_scope("wippy.security:process")))
end

local function projection(id)
    return db(function(connection)
        return assert(connection:query([[SELECT s.placement_cursor_id, t.event_count AS thread_head, c.id AS cursor_id,
            c.last_seq, c.job_id, c.execution_identity_json, p.kind, p.projection_key,
            (SELECT COUNT(*) FROM kickside_projection pp WHERE pp.thread_id=t.id) AS slots
            FROM kb10_stores s JOIN kickside_thread t ON CAST(t.id AS TEXT)=s.component_id
            LEFT JOIN kickside_projection_cursor c ON CAST(c.id AS TEXT)=s.placement_cursor_id
            LEFT JOIN kickside_projection p ON p.id=c.projection_id WHERE s.id=$1]], {id}))[1]
    end)
end

local function verify_enrolled(row, sequence)
    assert(row, "missing store and thread")
    test.eq(row.placement_cursor_id, row.cursor_id)
    test.not_nil(row.job_id)
    test.eq(row.kind, PLACEMENT)
    test.eq(row.projection_key, "placement")
    test.eq(tonumber(row.last_seq), sequence)
    test.eq(tonumber(row.slots), 4)
    local context = assert(json.decode(row.execution_identity_json))
    test.eq(context.optional_projection_enrollment.producer, PRODUCER)
    local valid = uuid.validate(context.optional_projection_enrollment.incarnation)
    test.is_true(valid)
end

local function add_user(user)
    db(function(connection)
        assert(connection:execute("INSERT INTO app_users (user_id,email,password_hash) VALUES ($1,$2,'!fixture')",
            {user, user .. "@test.invalid"}))
        assert(connection:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,'app:user')", {user}))
    end)
end

local function create_wiki(user, id)
    local registered = assert(component_owner.register(user, id, EMBEDDABLE, {class = "knowledge_base", kb_type = "wiki"}))
    assert(registered.success, tostring(registered.error))
    local result, err = as_user(user):call("kickside.kb10.binding:create_store", {
        component_id = id, embedding_model = id,
        config = {extraction_model = "kb10-placement-planner-fixture", concept_context = "Use the fixture taxonomy"},
        opts = {kb_type = "wiki", is_graph = true},
    })
    assert(result, tostring(err))
    local root = assert(node_store:concept_taxonomy({store_id = id})).root_id
    for _, label in ipairs({"Existing target", "Alternate target"}) do
        assert(node_store:insert_graph_node({store_id = id, node = {node_type = "concept", metadata = {label = label}},
            parent_edge = {to_node_id = root, edge_type = "subtopic_of"}}))
    end
    local row = projection(id)
    verify_enrolled(row, 0)
    return row
end

local function placement_state(id)
    return db(function(connection)
        return assert(connection:query([[SELECT c.last_seq,c.last_error,j.scheduled_at,t.event_count,
            (SELECT COUNT(*) FROM kb10_nodes WHERE store_id=$1 AND node_type='document') AS documents,
            (SELECT COUNT(*) FROM kb10_edges WHERE store_id=$2 AND edge_type='categorized_as') AS categories,
            (SELECT COUNT(*) FROM kb10_nodes WHERE store_id=$3 AND placement_wake_id IS NOT NULL) AS pending
            FROM kickside_thread t JOIN kb10_stores s ON s.component_id=CAST(t.id AS TEXT)
            JOIN kickside_projection_cursor c ON CAST(c.id AS TEXT)=s.placement_cursor_id
            JOIN kickside_job j ON j.id=c.job_id WHERE t.id=$4]], {id, id, id, id}))[1]
    end)
end

local function registered_lifetime()
    local source, user = uuid.v7(), uuid.v7()
    local targets = {uuid.v7(), uuid.v7()}
    local threads = component_owner.create(user, source)
    db(function(connection)
        assert(connection:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
            model TEXT PRIMARY KEY,online INTEGER NOT NULL,calls INTEGER NOT NULL,failures INTEGER NOT NULL)]]))
    end)
    local first
    for index, id in ipairs(targets) do
        assert(models.upsert_card({name = id, provider_id = "app:checkpoint_model_provider", provider_model = id,
            capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
        db(function(connection)
            assert(connection:execute("INSERT INTO kb10_checkpoint_model VALUES ($1,1,0,0)", {id}))
        end)
        local row = create_wiki(user, id)
        if index == 1 then first = row end
    end
    local id = targets[1]
    local kind = "app:registered_fanout_event"
    assert(threads:register_projection({thread_id = source, kind = "knowledge.injection.source",
        worker_ref = "proc://kickside.kb10.injection:source_worker_proc", worker_input_mode = "prefetch_events",
        events = {input = {{type = kind}}}, worker_config = {target_kb_ids = targets,
            materialization = {summary_model = false, chunk_enrichment_model = false}}}))
    assert(threads:append_events({thread_id = source, events = {{type = kind, body = {text = "Fixture content"},
        external = {external_source = "actor:" .. user, external_id = "sealed-lifetime", external_version = "1"}}}}))
    local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
    local ok, err = pcall(function()
        assert(jobs.nudge_workers())
        local deadline = time.now():add("20s")
        for _, target in ipairs(targets) do
            while true do
                local row = placement_state(target)
                if tonumber(row.documents) == 2 and tonumber(row.categories) == 2 and tonumber(row.pending) == 0
                    and tonumber(row.last_seq) == tonumber(row.event_count) and not row.scheduled_at then break end
                assert(time.now():before(deadline), assert(json.encode(row)))
                time.sleep("20ms")
            end
        end
    end)
    process.terminate(scheduler)
    assert(ok, err)
    local purged, purge_err = threads:purge({component_id = id})
    test.is_nil(purged)
    test.is_true(errors.is(purge_err, errors.PERMISSION_DENIED), tostring(purge_err))
    local deleted, delete_err = as_user(user):call("kickside.knowledge.registry:kb_delete", {component_id = id})
    assert(deleted, tostring(delete_err))
    local done, worker_err = deletion_worker.run(id)
    assert(done and done.deleted, tostring(worker_err))
    test.is_nil(projection(id))
    db(function(connection)
        local rows = assert(connection:query("SELECT id FROM kickside_projection_cursor WHERE id=$1", {first.cursor_id}))
        test.eq(#rows, 0)
    end)
    local replacement = uuid.v7()
    add_user(replacement)
    local recreated = create_wiki(replacement, id)
    test.is_true(recreated.cursor_id ~= first.cursor_id)
    test.is_true(recreated.job_id ~= first.job_id)
    test.eq(tonumber(placement_state(id).documents), 0)
    local function incarnation(row)
        return assert(json.decode(row.execution_identity_json)).optional_projection_enrollment.incarnation
    end
    test.is_true(incarnation(recreated) ~= incarnation(first))
    local captured, old_owner_err = as_user(user):call(PRODUCER, {component_id = id})
    test.is_nil(captured)
    test.is_true(errors.is(old_owner_err, errors.PERMISSION_DENIED), tostring(old_owner_err))
end

return {run = test.run_cases(function()
    test.describe("Wiki placement enrollment lifecycle", function()
        test.it("enrolls canonical fresh and imported Wiki stores, and leaves document stores unchanged", function()
            local user = uuid.v7()
            add_user(user)
            local caller = as_user(user)
            local wiki, create_err = caller:call("kickside.knowledge.registry:kb_create",
                {name = "Wiki placement enrollment fixture", kb_type = "wiki", embedding_model = "class:embed"})
            assert(wiki, tostring(create_err))
            verify_enrolled(projection(wiki.component_id), 0)
            local plain = assert(caller:call("kickside.knowledge.registry:kb_create",
                {name = "Document placement control", kb_type = "document", embedding_model = "class:embed"}))
            local document = projection(plain.component_id)
            test.is_nil(document.placement_cursor_id)
            test.eq(tonumber(document.slots), 3)

            local id = uuid.v7()
            local registered = assert(component_owner.register(user, id, EMBEDDABLE, {kb_type = "wiki"}))
            assert(registered.success, tostring(registered.error))
            local storage = assert(fs.get("app:uploads"))
            local path = "placement-enrollment-" .. id
            assert(storage:mkdir(path))
            assert(storage:mkdir(path .. "/data"))
            assert(storage:writefile(path .. "/data/store.jsonl", '{"kb_type":"wiki","embedding_model":"class:embed"}\n'))
            assert(storage:writefile(path .. "/data/nodes.jsonl", assert(json.encode({
                id = uuid.v7(), node_type = "concept", content = "Imported root", metadata = {is_root = true},
            })) .. "\n"))
            local imported = assert(caller:with_context({component_id = id}):call(
                "kickside.kb10.portability:import_into_func", {storage_id = "app:uploads", path = path}))
            test.is_true(imported.success, tostring(imported.error))
            test.eq(#imported.warnings, 0)
            verify_enrolled(projection(id), 0)
        end)

        test.it("resumes a retained upgrade at the live head and reports unresolved Wikis", function()
            local earlier, retained, missing, pending = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
            for _, id in ipairs({earlier, retained, missing, pending}) do
                component_owner.create(uuid.v7(), id, WIKI, EMBEDDABLE)
                assert(store.create_store(id, "class:embed", {}, {kb_type = "wiki"}))
            end
            local pending_doc = uuid.v7()
            assert(store.insert_nodes(pending, {{id = pending_doc, node_type = "document", content = "unresolved intent"}}, {}))
            db(function(connection)
                assert(connection:execute("UPDATE kb10_nodes SET placement_wake_id=$1 WHERE id=$2", {uuid.v7(), pending_doc}))
                assert(connection:execute("UPDATE kickside_components SET secrets_incarnation = NULL WHERE component_id = $1", {missing}))
                assert(connection:execute("UPDATE kickside_thread SET event_count = 13, max_pruned_seq = 13 WHERE id = $1", {retained}))
                assert(connection:execute("DELETE FROM kb10_placement_enrollment WHERE id = 1"))
                assert(connection:execute([[INSERT INTO kb10_placement_enrollment
                    (id, upper_id, after_id, enrolled, skipped, unresolved, issues, done)
                    VALUES (1, $1, $2, 0, 1, 0, '[]', 0)]], {pending, earlier}))
            end)
            local report = assert(funcs.call(UPGRADE))
            test.eq(report.status, "success")
            test.eq(report.details.outcome, "unresolved")
            test.eq(report.details.enrolled, 1, assert(json.encode(report)))
            test.eq(report.details.skipped, 1)
            test.eq(report.details.unresolved, 2)
            test.eq(report.details.issues[1].component_id, missing)
            test.eq(report.details.issues[1].code, "component_incarnation_missing")
            test.eq(report.details.issues[2].component_id, pending)
            test.eq(report.details.issues[2].code, "unbound_placement_intent")
            test.is_nil(projection(earlier).placement_cursor_id)
            local settled = projection(retained)
            verify_enrolled(settled, 13)
            test.is_nil(projection(missing).placement_cursor_id)
            test.is_nil(projection(pending).placement_cursor_id)
            local retry = assert(funcs.call(UPGRADE))
            test.eq(retry.details.enrolled, 1)
            test.eq(projection(retained).job_id, settled.job_id)
            test.eq(projection(retained).cursor_id, settled.cursor_id)
        end)
        test.it("materializes registered source work, deletes the Wiki and recreates the same ID with a new seal", registered_lifetime)
    end)
end)}
