-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local channel = require("channel")
local contract = require("contract")
local enrichment = require("enrichment_consts")
local jobs = require("jobs")
local json = require("json")
local models = require("models")
local owner = require("projection_owner")
local process = require("process")
local projections = require("projections")
local security = require("security")
local sql = require("sql")
local store = require("store")
local test = require("test")
local time = require("time")
local uuid = require("uuid")

local EVENT = "app:registered_fanout_event"
local GRAPH = "kickside.knowledge.events:graph.changed"
local DIGEST = "kickside.knowledge.events:digest.requested"
local TREATMENT = "kickside.knowledge.events:treatment.requested"

local function in_db(run)
    local db = assert(sql.get("app:db"))
    local ok, result = pcall(run, db)
    assert(select(2, db:release()) == nil)
    if not ok then error(result) end
    return result
end

local function block_graph_output(source, enabled)
    in_db(function(db)
        local postgres = db:type() == sql.type.POSTGRES
        local trigger = "CREATE TRIGGER kb10_registered_test_fault BEFORE INSERT ON kickside_event "
        local condition = "NEW.thread_id = '" .. source .. "' AND NEW.type = '" .. GRAPH .. "'"
        if enabled then
            if postgres then
                assert(db:execute([[CREATE FUNCTION kb10_registered_test_fault() RETURNS trigger AS $$
                    BEGIN RAISE EXCEPTION 'fixture blocks registered graph output'; END; $$ LANGUAGE plpgsql]]))
                assert(db:execute(trigger .. "FOR EACH ROW WHEN (" .. condition .. ") EXECUTE FUNCTION kb10_registered_test_fault()"))
            else
                assert(db:execute(trigger .. "WHEN " .. condition .. " BEGIN SELECT RAISE(ABORT, 'fixture blocks registered graph output'); END"))
            end
        else
            assert(db:execute("DROP TRIGGER IF EXISTS kb10_registered_test_fault" .. (postgres and " ON kickside_event" or "")))
            if postgres then assert(db:execute("DROP FUNCTION IF EXISTS kb10_registered_test_fault()")) end
        end
    end)
end

local function read(cursor_id, source, targets)
    return in_db(function(db)
        local row = assert(db:query([[SELECT c.last_seq,c.last_error,j.id AS job_id,j.attempts,j.status,j.scheduled_at,t.event_count
            FROM kickside_projection_cursor c JOIN kickside_job j ON j.id=c.job_id
            JOIN kickside_thread t ON t.id=c.thread_id WHERE c.id=$1]], {cursor_id}))[1]
        row.outputs = assert(db:query([[SELECT type,body FROM kickside_event WHERE thread_id=$1 AND type IN ($2,$3,$4)
            ORDER BY seq]], {source, GRAPH, DIGEST, TREATMENT}))
        row.counts = {}
        for _, id in ipairs(targets) do
            row.counts[id] = assert(db:query([[SELECT COUNT(*) FILTER (WHERE node_type='document') AS documents,
                COUNT(*) FILTER (WHERE node_type IN ('summary','chunk')) AS children FROM kb10_nodes WHERE store_id=$1]], {id}))[1]
            row.counts[id].embeddings = assert(db:query("SELECT COUNT(*) AS n FROM kb10_embeddings WHERE store_id=$1", {id}))[1].n
        end
        return row
    end)
end

local function await(read_state, wanted)
    local limit = time.now():add("15s")
    repeat
        local state = read_state()
        if wanted(state) then return state end
        if time.now():after(limit) then error("registered source did not settle: " .. assert(json.encode(state))) end
        time.sleep("20ms")
    until false
end

local function placements(listener)
    local timeout = time.after("120ms")
    local count = 0
    while true do
        local selected = channel.select({listener:case_receive(), timeout:case_receive()})
        if selected.channel == timeout then return count end
        count = count + 1
    end
end

local function verify()
    local source, actor_id = uuid.v7(), uuid.v7()
    local targets = {uuid.v7(), uuid.v7()}
    local threads = owner.create(actor_id, source)
    local actor = assert(security.new_actor(actor_id, {security_groups = {"app:user"}}))
    local scope = assert(security.named_scope("wippy.security:process"))
    local components = assert(assert(contract.get("kickside.component:component_service")):with_actor(actor):with_scope(scope):open())
    local registered = assert(threads:register_projection({
        thread_id = source, kind = "knowledge.injection.source",
        worker_ref = "proc://kickside.kb10.injection:source_worker_proc",
        worker_input_mode = "prefetch_events", events = {input = {{type = EVENT}}},
        worker_config = {target_kb_ids = targets, materialization = {summary_model = false, chunk_enrichment_model = false}},
    })).projection
    in_db(function(db)
        assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
            model TEXT PRIMARY KEY,online INTEGER NOT NULL,calls INTEGER NOT NULL,failures INTEGER NOT NULL)]]))
    end)
    for _, target in ipairs(targets) do
        local row = assert(components:register({component_id = target, impl_id = "app:source_fixture_component"}))
        assert(row.success, tostring(row.error))
        assert(models.upsert_card({name = target, provider_id = "app:checkpoint_model_provider", provider_model = target,
            capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
        assert(store.create_store(target, target, {}, {kb_type = "wiki", is_graph = true}))
        in_db(function(db)
            assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,1,0,0)", {target}))
        end)
    end
    local function read_state() return read(registered.cursor_id, source, targets) end
    local listener = process.listen(enrichment.TOPIC, {message = true})
    assert(process.registry.register(enrichment.PROCESS, nil, process.registry.CONSISTENT))
    local scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
    local ok, err = pcall(function()
        block_graph_output(source, true)
        local event = {type = EVENT, role = "user", body = {text = "Source fixture content"},
            external = {external_source = "actor:" .. actor_id, external_id = "registered-test", external_version = "1"}}
        test.eq(tonumber(assert(threads:append_events({thread_id = source, events = {event}})).inserted), 1)
        assert(jobs.nudge_workers())
        local before = await(read_state, function(row) return row.status == "pending" and tonumber(row.attempts) > 0 end)
        test.contains(before.last_error, "fixture blocks registered graph output")
        test.eq(tonumber(before.last_seq), 0)
        test.eq(#before.outputs, 0)
        test.eq(placements(listener), 0)
        for _, id in ipairs(targets) do
            for _, count in pairs(before.counts[id]) do test.eq(tonumber(count), 0) end
        end
        block_graph_output(source, false)
        in_db(function(db)
            assert(db:execute("UPDATE kickside_job SET scheduled_at=created_at WHERE id=$1", {before.job_id}))
        end)
        assert(jobs.nudge_workers())
        local after = await(read_state, function(row)
            return row.status == "pending" and not row.scheduled_at and tonumber(row.last_seq) == tonumber(row.event_count)
        end)
        test.eq(#after.outputs, 6)
        test.eq(placements(listener), 4)
        test.eq(tonumber(assert(threads:append_events({thread_id = source, events = {event}})).inserted), 0)
        for _, id in ipairs(targets) do
            local counts = after.counts[id]
            test.eq(tonumber(counts.documents), 2)
            test.eq(tonumber(counts.children), 4)
            test.eq(tonumber(counts.embeddings), 4)
        end
        local graph = {}
        for _, event in ipairs(after.outputs) do
            if event.type == GRAPH then
                local body = type(event.body) == "table" and event.body or assert(json.decode(event.body))
                graph[body.kb_id] = body
            end
        end
        for _, id in ipairs(targets) do
            test.eq(tonumber(graph[id].document_delta), 2)
            test.eq(tonumber(graph[id].embedding_delta), 4)
        end
    end)
    process.terminate(scheduler)
    process.registry.unregister(enrichment.PROCESS)
    process.unlisten(listener)
    block_graph_output(source, false)
    for _, id in ipairs(targets) do
        assert(store.delete_store(id))
        assert(models.delete_card(id))
    end
    in_db(function(db)
        assert(projections.remove_projection(db, source, {projection_id = registered.projection_id}))
        assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {source}))
        assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {source}))
        for _, id in ipairs(targets) do
            assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", {id}))
            assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id}))
            assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
        end
        owner.cleanup(db, actor_id, source)
    end)
    if not ok then error(err) end
end

return {run = test.run_cases(function()
    test.describe("shared database registered KB10 source publication", function()
        test.it("rolls back the destination writes when the Core output append fails", verify)
    end)
end)}
