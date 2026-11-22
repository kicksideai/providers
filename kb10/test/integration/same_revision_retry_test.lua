-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local artifact_cleanup = require("artifact_cleanup")
local artifacts = require("artifacts")
local contract = require("contract")
local fixture = require("source_checkpoint_fixture")
local groups = require("groups")
local hash = require("hash")
local http_client = require("http_client")
local jobs = require("jobs")
local json = require("json")
local models = require("models")
local owner = require("projection_owner")
local process = require("process")
local projections = require("projections")
local provision = require("provision")
local registry = require("registry")
local security = require("security")
local session = require("session")
local store = require("store")
local test = require("test")
local uploads = require("uploads")
local uuid = require("uuid")

local UPSERT = "kickside.knowledge.events:content.upserted"

local function same_revision_retry()
    test.it("indexes an unchanged Drive delivery after an explicit retry", function()
        local id, user_id, upload_id = uuid.v7(), uuid.v7(), uuid.v7()
        local model = "kb10-retry-" .. id
        local content = "The retained Drive revision has a searchable quokka."
        local source_url = "https://docs.google.com/document/d/fixture-unchanged/edit"
        local external_id = "fixture:google:drive:unchanged"
        local config = {summary_model = false, chunk_enrichment_model = false, max_document_content_chars = 10}
        assert(models.upsert_card({name = model, provider_id = "app:checkpoint_model_provider", provider_model = model,
            capabilities = {"embed"}, dimensions = 512, max_tokens = 4096}))
        assert(store.create_store(id, model, config))
        owner.create(user_id, id, "kickside.kb10:embeddable", "kickside.kb10:embeddable")
        assert(uploads.create(upload_id, user_id, #content, "text/plain", "app:uploads", "fixture.txt",
            "document", {filename = "Drive fixture.txt", source_url = source_url}, "completed", hash.sha256(content)))
        assert(artifacts.create_artifact({upload_id = upload_id, kind = "markdown", role = "primary",
            mime_type = "text/plain", content = content, storage_id = "app:uploads"}))
        local registered = fixture.in_db(function(db)
            assert(db:execute([[CREATE TABLE IF NOT EXISTS kb10_checkpoint_model (
                model TEXT PRIMARY KEY, online INTEGER NOT NULL, calls INTEGER NOT NULL, failures INTEGER NOT NULL)]]))
            assert(db:execute("INSERT INTO kb10_checkpoint_model (model,online,calls,failures) VALUES ($1,1,0,0)", {model}))
            return assert(assert(db:query([[SELECT id AS cursor_id,job_id,projection_id
                FROM kickside_projection_cursor WHERE thread_id=$1 AND cursor_key='source']], {id}))[1])
        end)
        local actor = assert(security.new_actor(user_id, {security_groups = {"app:user"}}))
        local scope = assert(security.named_scope("wippy.security:process"))
        assert(provision.ensure_user(actor, scope, user_id))
        local sink = assert(assert(contract.get("kickside.data:writable"))
            :with_actor(actor):with_scope(scope):open("kickside.knowledge.sink:kb_upload_sink"))
        local request = {origin = "fixture", config = {kb_id = id}, sink_op = "upsert",
            identity_key = external_id, idempotency_key = "fixture-drive-revision-7", resume_effect = false,
            input = {upload_id = upload_id, source_version = "7"}}
        local scheduler
        local ok, err = pcall(function()
            local delivery = assert(sink:write(request))
            test.is_true(delivery.success, tostring(delivery.error and delivery.error.message))
            scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
            assert(jobs.nudge_workers())
            local failed = fixture.wait_state(registered, id, fixture.caught_up).roots[1]
            test.eq(fixture.metadata(failed).status, "failed")
            test.contains(fixture.metadata(failed).error, "document content too large")
            local unchanged = assert(sink:write(request))
            test.eq(unchanged.result, "noop")
            test.eq(unchanged.dest_ref.publication_id, delivery.dest_ref.publication_id)

            process.terminate(scheduler)
            scheduler = nil
            local member = assert(groups.get_user_with_groups(user_id))
            local token = assert(session.mint(member)).token
            local gateway = assert(registry.get("app:gateway"))
            local port = assert(gateway.data.addr:match(":(%d+)$"))
            local url = "http://127.0.0.1:" .. port .. "/retry-fixture/knowledge/" .. id .. "/retry-source"
            local function retry(node, expected_status)
                local body = assert(json.encode({node_id = node.id, failed_event_id = fixture.metadata(node).thread_event_id}))
                local response = assert(http_client.request("POST", url, {
                    headers = {Authorization = "Bearer " .. token, ["Content-Type"] = "application/json"}, body = body,
                }))
                test.eq(response.status_code, expected_status, response.body)
                return assert(json.decode(response.body))
            end
            local first = retry(failed, 202)
            test.eq(first.status, "queued")
            local duplicate = retry(failed, 202)
            test.eq(duplicate.event_id, first.event_id)
            test.is_true(duplicate.duplicate)
            fixture.in_db(function(db)
                local upserts = assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1 AND type=$2", {id, UPSERT}))
                test.eq(#upserts, 2)
            end)

            scheduler = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
            assert(jobs.nudge_workers())
            local failed_again = fixture.wait_state(registered, id, fixture.caught_up).roots[1]
            test.eq(failed_again.id, failed.id)
            test.eq(fixture.metadata(failed_again).status, "failed")
            test.eq(fixture.metadata(failed_again).thread_event_id, first.event_id)
            test.eq(fixture.metadata(failed_again).upload_publication_id, delivery.dest_ref.publication_id)
            test.is_false(retry(failed, 409).success)
            config.max_document_content_chars = 0
            assert(store.update_config(id, config))
            local second = retry(failed_again, 202)
            test.is_false(second.event_id == first.event_id)
            local done = fixture.wait_state(registered, id, fixture.caught_up)
            test.eq(#done.roots, 1)
            local document = done.roots[1]
            test.eq(document.id, failed.id)
            test.eq(document.content, content)
            test.eq(fixture.metadata(document).status, "completed")
            test.eq(fixture.metadata(document).source_version, "7")
            test.eq(fixture.metadata(document).source_ref.source_url, source_url)
            test.eq(fixture.metadata(document).upload_publication_id, delivery.dest_ref.publication_id)
            local vector = {}
            for i = 1, 512 do vector[i] = i == 1 and #content / 1024 or 0 end
            local hits = assert(store.vector_search(id, vector, {query_text = "quokka", node_types = {"chunk"}, limit = 5}))
            test.eq(#hits, 1)
            test.eq(hits[1].parent_id, failed.id)
            test.is_false(retry(failed_again, 409).success)
        end)
        if scheduler then process.terminate(scheduler) end
        fixture.in_db(function(db)
            assert(projections.remove_projection(db, id, {projection_id = registered.projection_id}))
            assert(db:execute("DELETE FROM kb10_checkpoint_model WHERE model=$1", {model}))
            assert(db:execute("DELETE FROM kickside_event WHERE thread_id=$1", {id}))
            assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
            owner.cleanup(db, user_id, id)
        end)
        assert(store.delete_store(id))
        assert(models.delete_card(model))
        assert(select(2, artifact_cleanup.delete_for_upload(upload_id)) == nil)
        fixture.in_db(function(db) assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", {upload_id})) end)
        if not ok then error(err) end
    end)
end


return {run = test.run_cases(function()
    test.describe("Knowledge publication retry", same_revision_retry)
end)}
