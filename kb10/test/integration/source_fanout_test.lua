-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local test = require("test")
local owner = require("projection_owner")
local fixtures = require("fixtures")
local store = require("store")
local worker = require("source_worker")

local function materialize(input)
    local kb_a, kb_b = input.targets[1], input.targets[2]
    local calls, placements = {}, {}
    local result, err = worker.run_with_deps({
        thread_id = input.source,
        projection = {id = input.projection},
        worker_config = {
            target_kb_ids = {kb_a, kb_b, kb_a},
            materialization = {summary_model = false, chunk_enrichment_model = false, max_document_content_chars = 1000},
        },
        events = {fixtures.build_event({seq = input.seq})},
    }, {
        dispatcher = function(event)
            local documents = {}
            local selectors = input.mixed and {"first", "first", "second", "oversized"}
                or (input.seq == 1 and {"first", "second"} or {"first", "second", "third"})
            for _, id in ipairs(selectors) do
                local doc = fixtures.document_handler({body = {
                    page_id = id, title = id,
                    text = id == "oversized" and string.rep("x", 1100) or "Generation " .. tostring(event.seq) .. " of " .. id,
                }}).documents[1]
                documents[#documents + 1] = doc
            end
            if input.mixed then
                return {
                    documents = documents,
                    deletes = {{external_source = "fixture", external_id = "first"}},
                    rejection = {document = documents[3], code = "artifact_digest_mismatch"},
                }, nil
            end
            return {documents = documents}, nil
        end,
        embedder = function(texts, model)
            calls[model] = (calls[model] or 0) + 1
            if input.fail and model == kb_b and calls[model] == 2 then
                return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "second document unavailable"})
            end
            if input.revoke and model == kb_b and calls[model] == 2 then
                local db = assert(sql.get("app:db"))
                local _, err = db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {kb_b})
                db:release()
                assert(not err, tostring(err))
            end
            return fixtures.fake_embedder(texts, model)
        end,
        execution_identity_row = {fixture = true},
        send = function(_, _, message)
            placements[#placements + 1] = message
            return true, nil
        end,
    })
    return {result = result, error = err and tostring(err), retryable = err and err:retryable(),
        calls = calls, placements = placements}
end

local function snapshot(id)
    local db = assert(sql.get("app:db"))
    local rows, err = db:query([[SELECT id,node_type FROM kb10_nodes
        WHERE store_id=$1 AND node_type IN ('document','summary','chunk') ORDER BY id]], {id})
    db:release()
    assert(rows, tostring(err))
    local roots, children = {}, {}
    for _, row in ipairs(rows) do
        local list = row.node_type == "document" and roots or children
        list[#list + 1] = row.id
    end
    return roots, children
end

local function block_child_writes(id, enabled)
    local db = assert(sql.get("app:db"))
    local postgres = db:type() == sql.type.POSTGRES
    if enabled and postgres then
        assert(db:execute([[CREATE FUNCTION kb10_test_fail_fanout() RETURNS trigger AS $$
            BEGIN RAISE EXCEPTION 'fixture rejects destination write'; END; $$ LANGUAGE plpgsql]]))
        assert(db:execute([[CREATE TRIGGER kb10_test_fanout_fault BEFORE INSERT ON kb10_nodes
            FOR EACH ROW WHEN (NEW.store_id = ']] .. id .. [[' AND NEW.node_type = 'chunk')
            EXECUTE FUNCTION kb10_test_fail_fanout()]]))
    elseif enabled then
        assert(db:execute([[CREATE TRIGGER kb10_test_fanout_fault BEFORE INSERT ON kb10_nodes
            WHEN NEW.store_id = ']] .. id .. [[' AND NEW.node_type = 'chunk'
            BEGIN SELECT RAISE(ABORT, 'fixture rejects destination write'); END]]))
    elseif postgres then
        assert(db:execute("DROP TRIGGER IF EXISTS kb10_test_fanout_fault ON kb10_nodes"))
        assert(db:execute("DROP FUNCTION IF EXISTS kb10_test_fail_fanout()"))
    else
        assert(db:execute("DROP TRIGGER IF EXISTS kb10_test_fanout_fault"))
    end
    db:release()
end

local function verify()
    local actor_id, source, projection = fixtures.uuid(), fixtures.uuid(), fixtures.uuid()
    local targets = {fixtures.uuid(), fixtures.uuid()}
    owner.create(actor_id, source)
    local actor = assert(security.new_actor(actor_id, {security_groups = {"app:user"}}))
    local scope = assert(security.named_scope("wippy.security:process"))
    local components = assert(assert(contract.get("kickside.component:component_service")):with_actor(actor):with_scope(scope):open())
    local executor = funcs.new():with_actor(actor):with_scope(scope)
    local function ingest(seq, fault)
        local result, err = executor:call("app:fanout_materialize_fixture", {
            source = source, projection = projection, targets = targets, seq = seq,
            fail = fault == "model", revoke = fault == "revoke", mixed = fault == "mixed",
        })
        assert(result, tostring(err))
        return result
    end

    local ok, err = pcall(function()
        for _, id in ipairs(targets) do
            local row = assert(components:register({component_id = id, impl_id = "app:source_fixture_component"}))
            assert(row.success, tostring(row.error))
            -- Use the wiki engine without seeding an unrelated root concept.
            assert(store.create_store(id, id, {}, {kb_type = "wiki"}))
        end
        local initial = ingest(1)
        test.is_nil(initial.error)
        test.eq(#initial.placements, 4)
        local before = {}
        for _, id in ipairs(targets) do
            local roots, children = snapshot(id)
            test.eq(#roots, 2)
            test.eq(#children, 4)
            before[id] = {roots = roots, children = children}
        end

        local failed = ingest(2, "model")
        test.is_nil(failed.result)
        test.is_true(failed.retryable)
        test.contains(failed.error, "second document unavailable")
        test.eq(failed.calls[targets[1]], 3)
        test.eq(failed.calls[targets[2]], 2)
        test.eq(#failed.placements, 0)
        block_child_writes(targets[2], true)
        local rejected_write = ingest(2)
        block_child_writes(targets[2], false)
        test.is_nil(rejected_write.result)
        test.contains(rejected_write.error, "fixture rejects destination write")
        test.eq(#rejected_write.placements, 0)
        for _, id in ipairs(targets) do
            local roots, children = snapshot(id)
            test.eq(table.concat(roots), table.concat(before[id].roots))
            test.eq(table.concat(children), table.concat(before[id].children))
        end

        local recovered = ingest(2)
        test.is_nil(recovered.error)
        test.eq(#recovered.placements, 6)
        test.eq(#recovered.result.body.kb_results, 2)
        for index, id in ipairs(targets) do
            local graph = recovered.result.append_events[1].events[index].body
            test.eq(graph.kb_id, id)
            test.eq(graph.document_delta, 1)
            test.eq(graph.embedding_delta, 2)
            local roots, children = snapshot(id)
            test.eq(#roots, 3)
            test.eq(#children, 6)
            local present = {}
            for _, root in ipairs(roots) do present[root] = true end
            for _, root in ipairs(before[id].roots) do test.is_true(present[root]) end
            before[id] = {roots = roots, children = children}
        end

        local mixed = ingest(3, "mixed")
        test.is_nil(mixed.error)
        test.eq(#mixed.placements, 4)
        local expected = targets[1]
        for index, id in ipairs(targets) do
            local deletion = mixed.result.body.kb_results[2 * index - 1]
            local ingestion = mixed.result.body.kb_results[2 * index]
            local graph = mixed.result.append_events[1].events[index].body
            test.eq(deletion.removed, 1)
            test.eq(ingestion.inserted, 2)
            test.eq(ingestion.replaced, 1)
            test.eq(ingestion.notifications[1].document_node_id, ingestion.notifications[2].document_node_id)
            test.is_true(ingestion.notifications[3].retained)
            test.eq(ingestion.notifications[4].status, "failed")
            test.eq(graph.document_delta, 0)
            test.eq(graph.embedding_delta, 0)
            test.eq(graph.failed_delta, 1)
            local roots, children = snapshot(id)
            test.eq(#roots, 4)
            test.eq(#children, 6)
            before[id] = {roots = roots, children = children}
        end
        test.eq(mixed.placements[1].component_id, expected)

        local revoked = ingest(4, "revoke")
        test.is_nil(revoked.result)
        test.eq(revoked.calls[targets[2]], 3)
        test.eq(#revoked.placements, 0)
        for _, id in ipairs(targets) do
            local roots, children = snapshot(id)
            test.eq(table.concat(roots), table.concat(before[id].roots))
            test.eq(table.concat(children), table.concat(before[id].children))
        end
    end)

    block_child_writes(targets[2], false)
    for _, id in ipairs(targets) do assert(store.delete_store(id)) end
    local db = assert(sql.get("app:db"))
    for _, id in ipairs(targets) do
        assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id}))
        assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
    end
    assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {source}))
    owner.cleanup(db, actor_id, source)
    db:release()
    if not ok then error(err) end
end

return {run = test.run_cases(function()
    test.describe("ordinary KB10 fan-out", function()
        test.it("preserves both previous generations until all destination documents are prepared", verify)
    end)
end), materialize = materialize}
