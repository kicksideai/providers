local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local funcs = require("funcs")
local security = require("security")
local contract = require("contract")
local artifact_content_repo = require("artifact_content_repo")
local upload_record_repo = require("upload_record_repo")
local kb10_types = require("kb10_types")
local kb10_store = require("kb10_store")
local thread_ingest = require("thread_ingest")
local source_worker = require("source_worker_lib")
local worker_fixtures = require("source_worker_fixtures")
local artifact_cleanup_repo = require("artifact_cleanup_repo")

local function uuid()
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local EMBED_BINDING = kb10_types.EMBED_BINDING
local EMBED_CONTRACT = "kickside.contract:embeddable"
local COMPONENT_CLASS = "knowledge_base"
local FIXTURE_URL = "http://localhost:8088/_kickside/_page/main/test-fixture.html"
local INGEST_CONTROL_METHOD = "kickside.knowledge.injection:thread_ingest_control"
local DELETE_CONTENT_METHOD = "app:agent_delete_content"
local TRAIT_EMBED_METHOD = "kickside.knowledge.traits:kb_embed_tool"
local MANAGED_INJECTION_ACTOR_ID = "system:knowledge.injection"
local SOURCE_WORKER_PROC_REF = "proc://kickside.kb10.injection:source_worker_proc"

local function ensure_test_user(db, user_id)
    if type(user_id) ~= "string" or user_id == "" then return nil end
    local safe_email_id = user_id:gsub("[^%w_%-]", "_")
    local email = safe_email_id .. "@kb10.test"
    if db:type() == sql.type.SQLITE then
        local _, uerr = db:execute(
            [[INSERT OR IGNORE INTO app_users
              (user_id, email, full_name, password_hash, status, created_at, updated_at)
              VALUES ($1, $2, 'KB10 Test User', '!test:no-password', 'active',
                      strftime('%s', 'now'), strftime('%s', 'now'))]],
            { user_id, email }
        )
        if uerr then return uerr end
        local _, gerr = db:execute(
            [[INSERT OR IGNORE INTO app_user_groups (user_id, group_id, created_at)
              VALUES ($1, 'kb_test', strftime('%s', 'now'))]],
            { user_id }
        )
        return gerr
    end
    local _, uerr = db:execute(
        [[INSERT INTO app_users
          (user_id, email, full_name, password_hash, status, created_at, updated_at)
          VALUES ($1, $2, 'KB10 Test User', '!test:no-password', 'active', now(), now())
          ON CONFLICT (user_id) DO NOTHING]],
        { user_id, email }
    )
    if uerr then return uerr end
    local _, gerr = db:execute(
        [[INSERT INTO app_user_groups (user_id, group_id, created_at)
          VALUES ($1, 'kb_test', now())
          ON CONFLICT (user_id, group_id) DO NOTHING]],
        { user_id }
    )
    return gerr
end

-- create_test_kb seeds a document KB the way the control plane would, then (unless
-- opts.provision == false) provisions its primary thread's declared projections via
-- the canonical threads.ensure_thread under the KB engine binding -- the same path
-- kickside.knowledge:knowledge_bases.create takes. thread_id == component_id.
local KB_ENGINE_IMPL = "kickside.kb10:engine_document"
local KB_THREAD_CLASS = "kickside.knowledge.injection"

local function provision_kb_thread(component_id, user_id)
    local actor = security.new_actor(user_id, {})
    local scope = security.named_scope("wippy.security:process")
    local def, gerr = contract.get("kickside.core:threads")
    if gerr or not def then return "threads contract: " .. tostring(gerr) end
    local threads, oerr = (def :: any):with_actor(actor):with_scope(scope):open()
    if oerr or not threads then return "threads open: " .. tostring(oerr) end
    local _, ensure_err = threads:ensure_thread({
        component_id = component_id,
        impl_id = KB_ENGINE_IMPL,
        thread_class = KB_THREAD_CLASS,
    })
    if ensure_err then return "provision primary thread: " .. tostring(ensure_err) end
    return nil
end

local function create_test_kb(component_id, user_id, opts)
    opts = type(opts) == "table" and opts or {}
    local db, db_err = sql.get("app:db")
    if db_err then return db_err end

    local user_err = ensure_test_user(db, user_id)
    if user_err then db:release() return user_err end

    local _, err = db:execute(
        [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
          VALUES ($1, $2, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
        { component_id, EMBED_BINDING }
    )
    if err then db:release() return err end

    local meta_entries = {
        { key = "title", value = "Test Ingest KB" },
        { key = "description", value = "KB for ingest testing" },
        { key = "class", value = COMPONENT_CLASS },
    }
    for _, m in ipairs(meta_entries) do
        _, err = db:execute(
            [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
              VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
            { uuid(), component_id, m.key, m.value }
        )
        if err then db:release() return err end
    end

    _, err = db:execute(
        [[INSERT INTO kickside_component_access (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
          VALUES ($1, 'user', $2, $3, $4, 15, CURRENT_TIMESTAMP)]],
        { uuid(), user_id, component_id, component_id }
    )
    if err then db:release() return err end

    _, err = db:execute(
        [[INSERT INTO kickside_component_access (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
          VALUES ($1, 'user', $2, $3, $4, 15, CURRENT_TIMESTAMP)]],
        { uuid(), MANAGED_INJECTION_ACTOR_ID, component_id, component_id }
    )
    if err then db:release() return err end

    local store_config = json.encode({
        chunk_enrichment_model = "class:fast",
        summary_model = "class:fast",
    })
    _, err = db:execute(
        [[INSERT INTO kb10_stores (id, component_id, embedding_model, config)
          VALUES ($1, $2, 'text-embedding-3-small', $3)]],
        { uuid(), component_id, store_config }
    )
    db:release()
    if err then return err end

    if opts.provision ~= false then
        return provision_kb_thread(component_id, user_id)
    end
    return nil
end

local function cleanup_test_kb(db, component_id, user_id)
    pcall(function()
        local _, thread_err = thread_ingest.purge_thread(component_id)
        test.is_nil(thread_err, tostring(thread_err))
    end)
    db:execute(
        "DELETE FROM kb10_embeddings WHERE store_id IN (SELECT id FROM kb10_stores WHERE component_id = $1)",
        { component_id }
    )
    db:execute(
        "DELETE FROM kb10_edges WHERE store_id IN (SELECT id FROM kb10_stores WHERE component_id = $1)",
        { component_id }
    )
    db:execute(
        "DELETE FROM kb10_nodes_fts WHERE node_id IN (" ..
        "SELECT id FROM kb10_nodes WHERE store_id IN (" ..
        "SELECT id FROM kb10_stores WHERE component_id = $1))",
        { component_id }
    )
    db:execute(
        "DELETE FROM kb10_nodes WHERE store_id IN (SELECT id FROM kb10_stores WHERE component_id = $1)",
        { component_id }
    )
    db:execute("DELETE FROM kb10_stores WHERE component_id = $1", { component_id })
    if type(user_id) == "string" and user_id ~= "" then
        db:execute("DELETE FROM token_usage WHERE user_id = $1", { user_id })
        db:execute("DELETE FROM app_user_groups WHERE user_id = $1", { user_id })
        db:execute("DELETE FROM app_users WHERE user_id = $1", { user_id })
    end
    db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { component_id })
    db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { component_id })
    db:execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
end

local function new_executor(user_id)
    local actor = security.new_actor(user_id, {})
    local scope = security.named_scope("wippy.security:process")
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function open_embed(component_id, user_id)
    local actor = security.new_actor(user_id, {})
    local scope = security.named_scope("wippy.security:process")
    local def, def_err = contract.get(EMBED_CONTRACT)
    if def_err or not def then return nil, def_err or "embeddable contract unavailable" end
    return def:with_actor(actor):with_scope(scope):open(EMBED_BINDING, { component_id = component_id })
end

local function cursor_for_projection(projection_id)
    local db, db_err = sql.get("app:db")
    if db_err then error("db unavailable: " .. tostring(db_err)) end
    local rows, qerr = db:query(
        [[SELECT c.id, c.projection_id, c.thread_id, c.cursor_key, c.status, c.generation,
                 c.last_seq, c.job_id, c.debounce_idle_ms, c.debounce_max_ms, c.last_error,
                 c.actor_id AS cursor_actor_id, c.execution_identity_json,
                 p.actor_id, p.body
          FROM kickside_projection_cursor c
          JOIN kickside_projection p ON p.id = c.projection_id
          WHERE c.projection_id = $1
          LIMIT 1]],
        { projection_id }
    )
    db:release()
    if qerr then error("cursor query failed: " .. tostring(qerr)) end
    local row = rows and rows[1] or nil
    if row then
        local body = row.body
        if type(body) == "string" then
            local decoded = json.decode(body)
            if type(decoded) == "table" then body = decoded end
        end
        local meta = type(body) == "table" and type(body.meta) == "table" and body.meta or {}
        row.worker_ref = meta.worker_ref
        row.worker_runtime = meta.worker_runtime
        row.projection_body = body
        row.body = nil
    end
    return row
end

local function has_input_event(body, event_type)
    local events = type(body) == "table" and type(body.events) == "table" and body.events or nil
    local input = events and type(events.input) == "table" and events.input or nil
    if not input then return false end
    for _, shape in ipairs(input) do
        if type(shape) == "table" and shape.type == event_type then return true end
    end
    return false
end

local function assert_source_projection_filter(body)
    test.is_true(has_input_event(body, "kickside.knowledge.events:content.upserted"))
    test.is_true(has_input_event(body, "kickside.knowledge.events:content.deleted"))
    test.is_false(has_input_event(body, "kickside.knowledge.events:digest.requested"))
    test.is_false(has_input_event(body, "kickside.knowledge.events:treatment.requested"))
end

local function thread_exists(thread_id)
    local db, db_err = sql.get("app:db")
    if db_err then error("db unavailable: " .. tostring(db_err)) end
    local rows, qerr = db:query(
        [[SELECT id FROM kickside_thread WHERE id = $1 LIMIT 1]],
        { thread_id }
    )
    db:release()
    if qerr then error("thread query failed: " .. tostring(qerr)) end
    return rows and rows[1] ~= nil
end

local function event_for_external(thread_id, external_id, event_type)
    local db, db_err = sql.get("app:db")
    if db_err then error("db unavailable: " .. tostring(db_err)) end
    local rows, qerr = db:query(
        [[SELECT id, type, external_source, external_id, external_version, body, seq
          FROM kickside_event
          WHERE thread_id = $1 AND external_id = $2 AND type = $3
          ORDER BY seq DESC
          LIMIT 1]],
        { thread_id, external_id, event_type }
    )
    db:release()
    if qerr then error("event query failed: " .. tostring(qerr)) end
    local row = rows and rows[1] or nil
    if row and type(row.body) == "string" and row.body ~= "" then
        local decoded, derr = json.decode(row.body)
        if not derr then row.body = decoded end
    end
    return row
end

local function define_tests()
    test.describe("kb_ingest agent tools", function()
        local test_kb_id
        local test_user_id

        test.before_all(function()
            test_kb_id = uuid()
            test_user_id = "test_ingest_" .. uuid()
            local err = create_test_kb(test_kb_id, test_user_id)
            test.is_nil(err)

            local vdb = sql.get("app:db")
            assert(vdb, "app:db not available")
            local rows, qerr = vdb:query("SELECT id FROM kb10_stores WHERE component_id = $1", { test_kb_id })
            vdb:release()
            test.is_nil(qerr)
            test.eq(1, #rows, "kb10_stores row missing for " .. test_kb_id)
        end)

        test.after_all(function()
            local db = sql.get("app:db")
            if db then
                cleanup_test_kb(db, test_kb_id, test_user_id)
                db:release()
            end
        end)

        test.describe("select_kb", function()
            test.it("rejects empty kb_id", function()
                local exec = new_executor(test_user_id)
                local result, err = exec:call("app:agent_select_kb", {})
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("kb_id is required") ~= nil)
            end)

            test.it("rejects nonexistent kb_id", function()
                local exec = new_executor(test_user_id)
                local result, err = exec:call("app:agent_select_kb", { kb_id = uuid() })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("cannot access KB") ~= nil)
            end)

            test.it("selects valid KB and returns _control directive", function()
                local exec = new_executor(test_user_id)
                local result, err = exec:call("app:agent_select_kb", { kb_id = test_kb_id })
                test.is_nil(err)
                test.is_true(result.success, "select_kb: " .. tostring(result.error))
                test.eq(test_kb_id, result.kb_id)
                test.not_nil(result._control)
                test.eq(test_kb_id, result._control.context.session.set.kb_id)
            end)
        end)

        test.describe("fetch_url", function()
            test.it("rejects missing url", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local result, err = exec:call("app:agent_fetch_url", {})
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("url is required") ~= nil)
            end)

            test.it("rejects missing kb_id when not in context", function()
                local exec = new_executor(test_user_id)
                local result, err = exec:call("app:agent_fetch_url", { url = FIXTURE_URL })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("no kb_id") ~= nil)
            end)

            test.it("rejects inaccessible KB", function()
                local exec = new_executor(test_user_id)
                local result, err = exec:call("app:agent_fetch_url", {
                    url = FIXTURE_URL,
                    kb_id = uuid(),
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("cannot access KB") ~= nil)
            end)

            -- The fixture is served on loopback (localhost), which the agent
            -- fetch_url SSRF guard correctly refuses: a model-chosen URL must
            -- never reach an internal host. These assert the guard across the
            -- tool's call shapes; the fetch->embed plumbing is covered by the
            -- embed_content tests below.
            test.it("rejects a loopback fixture URL (SSRF guard)", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local result, err = exec:call("app:agent_fetch_url", {
                    url = FIXTURE_URL,
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("host not allowed") ~= nil,
                    "expected SSRF rejection, got: " .. tostring(err))
            end)

            test.it("applies the SSRF guard even when embed=false", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local result, err = exec:call("app:agent_fetch_url", {
                    url = FIXTURE_URL,
                    embed = false,
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("host not allowed") ~= nil,
                    "expected SSRF rejection, got: " .. tostring(err))
            end)

            test.it("checks an explicit accessible kb_id before the URL guard", function()
                local other_kb_id = uuid()
                local err = create_test_kb(other_kb_id, test_user_id)
                test.is_nil(err)

                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local result, call_err = exec:call("app:agent_fetch_url", {
                    url = FIXTURE_URL,
                    kb_id = other_kb_id,
                })
                test.is_nil(result)
                test.not_nil(call_err)
                -- The explicit accessible kb_id passes the access gate, so the
                -- failure is the SSRF guard (not a "cannot access KB" error),
                -- proving the explicit kb_id resolved.
                test.is_true(tostring(call_err):find("host not allowed") ~= nil,
                    "expected SSRF rejection, got: " .. tostring(call_err))

                local cdb = sql.get("app:db")
                if cdb then cleanup_test_kb(cdb, other_kb_id) cdb:release() end
            end)
        end)

        test.describe("embed_content", function()
            test.it("reports ingest control status without creating a missing thread", function()
                local control_kb_id = uuid()
                local control_user_id = "test_ingest_control_" .. uuid()
                -- No provisioning: a KB whose primary thread was never created must
                -- report "missing" and status must not create it (pure read).
                local create_err = create_test_kb(control_kb_id, control_user_id, { provision = false })
                test.is_nil(create_err)

                local exec = new_executor(control_user_id)
                local status, err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = control_kb_id,
                    action = "status",
                })
                test.is_nil(err)
                test.is_true(status.success, "status: " .. tostring(status.error))
                test.eq(control_kb_id, status.kb_id)
                test.eq("missing", status.status)
                test.eq(false, status.exists)
                test.not_nil(status.thread_id)
                test.eq(false, thread_exists(status.thread_id))

                local db = sql.get("app:db")
                if db then cleanup_test_kb(db, control_kb_id) db:release() end
            end)

            test.it("rejects ingest control without KB access", function()
                local exec = new_executor("test_ingest_denied_" .. uuid())
                local status, err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = test_kb_id,
                    action = "status",
                })
                test.is_nil(err)
                test.eq(false, status.success)
                test.is_true(status.error:find("access denied") ~= nil,
                    "expected access denial, got: " .. tostring(status.error))
            end)

            test.it("rejects empty content", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local result, err = exec:call("app:agent_embed_content", {})
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("content is required") ~= nil)
            end)

            test.it("rejects missing kb_id when not in context", function()
                local exec = new_executor(test_user_id)
                local result, err = exec:call("app:agent_embed_content", {
                    content = "test content",
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("no kb_id") ~= nil)
            end)

            test.it("rejects inaccessible KB", function()
                local exec = new_executor(test_user_id)
                local result, err = exec:call("app:agent_embed_content", {
                    content = "test content",
                    kb_id = uuid(),
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(tostring(err):find("cannot access KB") ~= nil)
            end)

            test.it("embeds text content via contract", function()
                local instance, open_err = open_embed(test_kb_id, test_user_id)
                test.is_nil(open_err, "contract.open: " .. tostring(open_err))
                test.not_nil(instance)

                local result, embed_err = instance:embed_content({
                    content = "The capital of France is Paris. It is known for the Eiffel Tower.",
                    content_type = "text/plain",
                    metadata = { title = "Geography fact", source = "test" },
                })
                test.is_nil(embed_err, "embed_content: " .. tostring(embed_err))
                test.not_nil(result)
                test.is_true(result.success, "embed result: " .. tostring(result.error or json.encode(result)))
                test.eq("queued", result.status)
                test.eq(test_kb_id, result.kb_id)
                test.not_nil(result.thread_id)
                test.not_nil(result.projection_id)
                test.not_nil(result.external_id)
                test.not_nil(result.source_ref)
                test.eq(result.external_id, result.source_ref.external_id)

                local event = event_for_external(result.thread_id, result.external_id, "kickside.knowledge.events:content.upserted")
                test.not_nil(event)
                test.eq("knowledge.kb", event.external_source)
                test.eq("manual", event.body.source_ref.kind)
                test.eq("kb10.embed_content", event.body.source_ref.origin.type)
                test.eq(result.external_id, event.body.source_ref.origin.id)
                test.eq(result.external_id, event.body.source_ref.external_id)
            end)

            test.it("queues via agent tool with context", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local result, err = exec:call("app:agent_embed_content", {
                    content = "Berlin is the capital of Germany with a population of about 3.7 million.",
                    title = "Germany facts",
                })
                test.is_nil(err)
                test.is_true(result.success, "embed via tool: " .. tostring(result.error))
                test.eq(result.status, "queued")
                test.eq(result.kb_id, test_kb_id)
                test.not_nil(result.thread_id)
                test.not_nil(result.projection_id)
                test.not_nil(result.external_id)
                test.not_nil(result.content_length)

                local event = event_for_external(result.thread_id, result.external_id, "kickside.knowledge.events:content.upserted")
                test.not_nil(event)
                test.eq("manual", event.body.source_ref.kind)
                test.eq("agent.embed_content", event.body.source_ref.origin.type)
                test.eq(result.external_id, event.body.source_ref.origin.id)
                test.eq(result.external_id, event.body.source_ref.external_id)
                test.eq("manual", event.body.metadata.source_ref.kind)
            end)

            test.it("agent embed preserves stored source-ref identity", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local external_id = "agent-upsert-ref-" .. uuid()
                local result, err = exec:call("app:agent_embed_content", {
                    content = "Agent source-ref upsert regression content.",
                    source_ref = {
                        kind = "reference",
                        origin = "custom.agent.source",
                        external_id = external_id,
                        external_version = "agent-ref-v1",
                        reference_component_id = "agent-ref-component",
                        reference_context = { item_id = "99" },
                        storage_id = "private-storage",
                        storage_path = "/private/source.txt",
                    },
                })
                test.is_nil(err)
                test.is_true(result.success, "embed via tool: " .. tostring(result.error))
                test.eq(external_id, result.external_id)
                test.eq("agent-ref-v1", result.external_version)
                test.eq(external_id, result.source_ref.external_id)
                test.eq("agent-ref-v1", result.source_ref.external_version)

                local event = event_for_external(result.thread_id, external_id, "kickside.knowledge.events:content.upserted")
                test.not_nil(event)
                test.eq("agent-ref-v1", event.external_version)
                test.eq("reference", event.body.source_ref.kind)
                test.eq("custom.agent.source", event.body.source_ref.origin.type)
                test.eq(external_id, event.body.source_ref.origin.id)
                test.eq("agent-ref-component", event.body.source_ref.reference_component_id)
                test.eq("99", event.body.source_ref.reference_context.item_id)
                test.eq(nil, event.body.source_ref.storage_id)
                test.eq(nil, event.body.source_ref.storage_path)
            end)

            test.it("trait embed preserves stored source-ref identity", function()
                local exec = new_executor(test_user_id):with_context({ kb_ids = { test_kb_id } })
                local external_id = "trait-upsert-ref-" .. uuid()
                local result, err = exec:call(TRAIT_EMBED_METHOD, {
                    content = "Trait source-ref upsert regression content.",
                    source_ref = {
                        kind = "manual",
                        origin = "custom.trait.source",
                        external_id = external_id,
                        external_version = "trait-ref-v1",
                    },
                })
                test.is_nil(err)
                test.is_true(result.success, "embed via trait: " .. tostring(result.error))
                test.eq("queued", result.status)
                test.eq(external_id, result.external_id)
                test.eq("trait-ref-v1", result.external_version)
                test.eq(external_id, result.source_ref.external_id)
                test.eq("trait-ref-v1", result.source_ref.external_version)

                local event = event_for_external(result.thread_id, external_id, "kickside.knowledge.events:content.upserted")
                test.not_nil(event)
                test.eq("trait-ref-v1", event.external_version)
                test.eq("manual", event.body.source_ref.kind)
                test.eq("custom.trait.source", event.body.source_ref.origin.type)
                test.eq(external_id, event.body.source_ref.origin.id)
                test.eq(external_id, event.body.source_ref.external_id)
            end)

            test.it("materializes an upload larger than the event row bound", function()
                local upload_id = uuid()
                local marker = "Large artifact searchable content"
                local content = string.rep(" ", 5 * 1024 * 1024) .. "# Large artifact\n" .. marker
                local _, upload_err = upload_record_repo.create(upload_id, test_user_id, #content,
                    "text/plain", "app:uploads", "large.txt", "document", {}, "completed", "large-checksum")
                test.is_nil(upload_err)
                local artifact, artifact_err = artifact_content_repo.create_artifact({upload_id=upload_id,
                    kind="markdown",role="primary",mime_type="text/plain",content=content,
                    metadata={filename="large.txt"}})
                test.is_nil(artifact_err)
                local result, ingest_err = new_executor(test_user_id):call("kickside.knowledge.injection:on_upload_complete", {
                    upload_id=upload_id,status="completed",params={kb_id=test_kb_id}})
                test.is_nil(ingest_err)
                test.eq(result.success,true,tostring(result.error))
                test.is_nil(result.skipped)
                local event = event_for_external(test_kb_id,"upload:"..upload_id,"kickside.knowledge.events:content.upserted")
                test.not_nil(event)
                test.is_nil(event.body.content)
                test.eq(event.body.content_omitted,true)
                test.eq(event.body.content_bytes,#content)
                test.eq(event.body.source_ref.artifact_id,artifact.artifact_id)
                local materialized, worker_err = source_worker.run_with_deps({thread_id=test_kb_id,
                    projection={id=result.projection_id},events={event},range={from_seq=event.seq,to_seq=event.seq},
                    worker_config={target_kb_ids={test_kb_id}}},worker_fixtures.worker_deps({
                        embedder=worker_fixtures.fake_embedder,
                        summarizer=function() return "Large artifact summary",nil end,
                        enricher=function() return "",nil end,
                    }))
                test.is_nil(worker_err,tostring(worker_err))
                test.eq(materialized.metrics.items_failed,0)
                test.eq(materialized.metrics.documents_inserted,1)
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                local nodes, nodes_err = db:query([[SELECT content FROM kb10_nodes WHERE node_type='document'
                    AND store_id IN (SELECT id FROM kb10_stores WHERE component_id=$1)]],{test_kb_id})
                test.is_nil(nodes_err)
                local found = false
                for _, node in ipairs(nodes) do
                    if node.content == content then found = true end
                end
                test.eq(found,true,"the materialized document retains the complete stored artifact")
                local _, cleanup_err = artifact_cleanup_repo.delete_for_upload(upload_id)
                test.is_nil(cleanup_err)
                local retry,retry_err=source_worker.run_with_deps({thread_id=test_kb_id,
                    projection={id=result.projection_id},events={event},range={from_seq=event.seq,to_seq=event.seq},
                    worker_config={target_kb_ids={test_kb_id}}},worker_fixtures.worker_deps({
                        embedder=worker_fixtures.fake_embedder,
                        summarizer=function() return "unused",nil end,
                        enricher=function() return "",nil end,
                    }))
                test.is_nil(retry_err)
                test.eq(retry.patch.last_status,"retrying")
                test.eq(retry.patch.last_failed_batch.attempts,1)
                test.contains(retry.patch.last_error,"artifact")
                test.eq(retry.metrics.documents_inserted,0)
                local _, delete_err = db:execute("DELETE FROM kickside_uploads WHERE uuid=$1",{upload_id})
                test.is_nil(delete_err)
                db:release()
            end)

            test.it("upload completion preserves URL-backed canonical identity", function()
                local upload_id = "url-upload-" .. uuid()
                local source_url = "https://example.com/reports/source.pdf"
                local external_id = "url:" .. source_url
                local source_ref = {
                    kind = "url",
                    origin = "agent.fetch_url",
                    source_url = source_url,
                    external_id = external_id,
                    external_version = "source-v1",
                    title = "Source PDF",
                    content_type = "application/pdf",
                }

                local upload_row, upload_row_err = upload_record_repo.create(
                    upload_id,
                    test_user_id,
                    12,
                    "application/pdf",
                    "fixture-storage",
                    "/source.pdf",
                    "document",
                    {
                        filename = "source.pdf",
                        source_url = source_url,
                    },
                    "completed",
                    "fixture-upload-sha"
                )
                test.is_nil(upload_row_err)
                test.not_nil(upload_row)

                local content_record = artifact_content_repo.create_artifact({
                    upload_id = upload_id,
                    kind = "markdown",
                    role = "primary",
                    mime_type = "text/markdown",
                    label = "source.pdf",
                    ordinal = 0,
                    content = "# Source PDF",
                    metadata = {
                        filename = "source.pdf",
                        source = "agent.fetch_url",
                        source_url = source_url,
                        source_ref = source_ref,
                    },
                })
                test.not_nil(content_record)

                local exec = new_executor(test_user_id)
                local result, err = exec:call("kickside.knowledge.injection:on_upload_complete", {
                    upload_id = upload_id,
                    mime_type = "application/pdf",
                    storage_id = "fixture-storage",
                    storage_path = "/source.pdf",
                    size = 12,
                    params = { kb_id = test_kb_id },
                    metadata = {
                        filename = "source.pdf",
                        source_url = source_url,
                    },
                })
                test.is_nil(err)
                test.is_true(result.success, "upload complete: " .. tostring(result.error))
                test.eq(external_id, result.external_id)
                test.eq("source-v1", result.external_version)

                local event = event_for_external(result.thread_id, external_id, "kickside.knowledge.events:content.upserted")
                test.not_nil(event)
                test.eq("source-v1", event.external_version)
                test.eq("agent.fetch_url", event.body.metadata.source)
                test.eq(source_url, event.body.metadata.source_url)
                test.eq(upload_id, event.body.metadata.upload_id)
                test.eq("url", event.body.source_ref.kind)
                test.eq("agent.fetch_url", event.body.source_ref.origin.type)
                test.eq(external_id, event.body.source_ref.origin.id)
                test.eq(external_id, event.body.source_ref.external_id)
                test.eq("source-v1", event.body.source_ref.external_version)
                test.eq(upload_id, event.body.source_ref.upload_id)
                test.eq(source_url, event.body.source_ref.source_url)
                test.eq(nil, event.body.metadata.storage_id)
                test.eq(nil, event.body.metadata.storage_path)
                test.eq(nil, event.body.metadata.original_storage_id)
                test.eq(nil, event.body.metadata.original_storage_path)
                test.eq(nil, event.body.source_ref.storage_id)
                test.eq(nil, event.body.source_ref.storage_path)
            end)

            test.it("queues content deletes as managed thread events", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local external_id = "delete-control-" .. uuid()
                local first, first_err = exec:call("app:agent_embed_content", {
                    content = "Delete control regression document.",
                    title = "Delete control",
                    external_id = external_id,
                    external_version = "v1",
                })
                test.is_nil(first_err)
                test.is_true(first.success, "enqueue before delete: " .. tostring(first.error))
                test.eq(external_id, first.external_id)

                local deleted, delete_err = exec:call(DELETE_CONTENT_METHOD, {
                    external_id = external_id,
                    external_version = "delete-v1",
                })
                test.is_nil(delete_err)
                test.is_true(deleted.success, "delete enqueue: " .. tostring(deleted.error))
                test.eq("queued", deleted.status)
                test.eq(test_kb_id, deleted.kb_id)
                test.eq(first.thread_id, deleted.thread_id)
                test.eq(first.projection_id, deleted.projection_id)
                test.eq(external_id, deleted.external_id)

                local event = event_for_external(first.thread_id, external_id, "kickside.knowledge.events:content.deleted")
                test.not_nil(event)
                test.eq("knowledge.kb", event.external_source)
                test.eq("delete-v1", event.external_version)
                test.eq(test_kb_id, event.body.kb_id)
                test.eq(external_id, event.body.metadata.external_id)
                test.eq("knowledge.kb", event.body.metadata.external_source)
            end)

            test.it("queues content deletes by upload_id as canonical external ids", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local upload_id = "upload-control-" .. uuid()
                local expected_external_id = "upload:" .. upload_id

                local deleted, delete_err = exec:call(DELETE_CONTENT_METHOD, {
                    upload_id = upload_id,
                    external_version = "upload-delete-v1",
                })
                test.is_nil(delete_err)
                test.is_true(deleted.success, "delete enqueue: " .. tostring(deleted.error))
                test.eq("queued", deleted.status)
                test.eq(test_kb_id, deleted.kb_id)
                test.eq(expected_external_id, deleted.external_id)
                test.eq("upload-delete-v1", deleted.external_version)

                local event = event_for_external(deleted.thread_id, expected_external_id, "kickside.knowledge.events:content.deleted")
                test.not_nil(event)
                test.eq("knowledge.kb", event.external_source)
                test.eq("upload-delete-v1", event.external_version)
                test.eq(test_kb_id, event.body.kb_id)
                test.eq(upload_id, event.body.metadata.upload_id)
                test.eq(expected_external_id, event.body.metadata.external_id)
                test.eq("upload", event.body.source_ref.kind)
                test.eq(upload_id, event.body.source_ref.upload_id)
                test.eq(expected_external_id, event.body.source_ref.external_id)
            end)

            test.it("agent delete accepts stored source-ref identity", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local external_id = "agent-source-ref-" .. uuid()
                local deleted, delete_err = exec:call(DELETE_CONTENT_METHOD, {
                    source_ref = {
                        kind = "manual",
                        origin = "ui.document.delete",
                        external_id = external_id,
                        external_version = "agent-source-ref-delete-v1",
                    },
                })
                test.is_nil(delete_err)
                test.is_true(deleted.success, "delete enqueue: " .. tostring(deleted.error))
                test.eq("queued", deleted.status)
                test.eq(external_id, deleted.external_id)
                test.eq("agent-source-ref-delete-v1", deleted.external_version)

                local event = event_for_external(deleted.thread_id, external_id, "kickside.knowledge.events:content.deleted")
                test.not_nil(event)
                test.eq("agent-source-ref-delete-v1", event.external_version)
                test.eq("ui.document.delete", event.body.source_ref.origin.type)
                test.eq(external_id, event.body.source_ref.origin.id)
                test.eq(external_id, event.body.source_ref.external_id)
            end)

            test.it("agent delete lets explicit identity override stale source-ref identity", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local external_id = "agent-delete-explicit-" .. uuid()
                local deleted, delete_err = exec:call(DELETE_CONTENT_METHOD, {
                    external_id = external_id,
                    external_version = "explicit-delete-v1",
                    source_ref = {
                        kind = "manual",
                        origin = "stale.delete.source",
                        external_id = "stale-delete-id",
                        external_version = "stale-delete-v1",
                    },
                })
                test.is_nil(delete_err)
                test.is_true(deleted.success, "delete enqueue: " .. tostring(deleted.error))
                test.eq(external_id, deleted.external_id)
                test.eq("explicit-delete-v1", deleted.external_version)

                local event = event_for_external(deleted.thread_id, external_id, "kickside.knowledge.events:content.deleted")
                test.not_nil(event)
                test.eq("explicit-delete-v1", event.external_version)
                test.eq("stale.delete.source", event.body.source_ref.origin.type)
                test.eq(external_id, event.body.source_ref.origin.id)
                test.eq(external_id, event.body.source_ref.external_id)
                test.eq("explicit-delete-v1", event.body.source_ref.external_version)
                test.eq(external_id, event.body.metadata.source_ref.external_id)
                test.eq("explicit-delete-v1", event.body.metadata.source_ref.external_version)
            end)

            test.it("preserves source-ref identity on canonical deletes", function()
                local upload_id = "source-ref-delete-" .. uuid()
                local external_id = "upload:" .. upload_id
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local deleted, delete_err = exec:call(DELETE_CONTENT_METHOD, {
                    metadata = {
                        title = "Stored upload document",
                        source = "api.delete_content",
                    },
                    external_version = "source-ref-delete-v1",
                    source_ref = {
                        kind = "upload",
                        origin = "ui.document.delete",
                        external_id = external_id,
                        upload_id = upload_id,
                        filename = "stored-upload.txt",
                    },
                })
                test.is_nil(delete_err)
                test.is_true(deleted.success, "delete enqueue: " .. tostring(delete_err))
                test.eq(external_id, deleted.external_id)

                local event = event_for_external(deleted.thread_id, external_id, "kickside.knowledge.events:content.deleted")
                test.not_nil(event)
                test.eq("source-ref-delete-v1", event.external_version)
                test.eq("upload", event.body.source_ref.kind)
                test.eq("ui.document.delete", event.body.source_ref.origin.type)
                test.eq(external_id, event.body.source_ref.origin.id)
                test.eq(upload_id, event.body.source_ref.upload_id)
                test.eq("stored-upload.txt", event.body.source_ref.filename)
                test.eq(external_id, event.body.metadata.external_id)
                test.eq("Stored upload document", event.body.metadata.source_ref.title)
            end)

            test.it("uses stored source-ref external tuple on canonical deletes", function()
                local external_id = "source-ref-only-" .. uuid()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local deleted, delete_err = exec:call(DELETE_CONTENT_METHOD, {
                    metadata = {
                        title = "Stored source-ref document",
                        source = "api.delete_content",
                    },
                    source_ref = {
                        kind = "manual",
                        origin = "ui.document.delete",
                        external_id = external_id,
                        external_version = "stored-delete-v1",
                    },
                })
                test.is_nil(delete_err)
                test.is_true(deleted.success, "delete enqueue: " .. tostring(delete_err))
                test.eq(external_id, deleted.external_id)
                test.eq("stored-delete-v1", deleted.external_version)

                local event = event_for_external(deleted.thread_id, external_id, "kickside.knowledge.events:content.deleted")
                test.not_nil(event)
                test.eq("stored-delete-v1", event.external_version)
                test.eq("ui.document.delete", event.body.source_ref.origin.type)
                test.eq(external_id, event.body.source_ref.origin.id)
                test.eq(external_id, event.body.source_ref.external_id)
            end)

            test.it("derives reference identity from source-ref on canonical deletes", function()
                local ref_component_id = "reference-delete-" .. uuid()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local deleted, delete_err = exec:call(DELETE_CONTENT_METHOD, {
                    metadata = {
                        title = "Stored reference document",
                        source = "api.delete_content",
                    },
                    source_ref = {
                        kind = "reference",
                        origin = "ui.document.delete",
                        reference_component_id = ref_component_id,
                        reference_context = { item_id = "42" },
                    },
                })
                test.is_nil(delete_err)
                test.is_true(deleted.success, "delete enqueue: " .. tostring(delete_err))
                test.is_true(deleted.external_id:sub(1, #"reference:") == "reference:")

                local event = event_for_external(deleted.thread_id, deleted.external_id, "kickside.knowledge.events:content.deleted")
                test.not_nil(event)
                test.eq("reference", event.body.source_ref.kind)
                test.eq("ui.document.delete", event.body.source_ref.origin.type)
                test.eq(deleted.external_id, event.body.source_ref.origin.id)
                test.eq(ref_component_id, event.body.source_ref.reference_component_id)
                test.eq("42", event.body.source_ref.reference_context.item_id)
                test.eq(deleted.external_id, event.body.metadata.external_id)
            end)

            test.it("does not re-register or unpause the managed ingest projection on later enqueue", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local first, first_err = exec:call("app:agent_embed_content", {
                    content = "Pause control regression document one.",
                    title = "Pause control one",
                    external_id = "pause-control-" .. uuid(),
                    external_version = "v1",
                })
                test.is_nil(first_err)
                test.is_true(first.success, "first enqueue: " .. tostring(first.error))
                test.not_nil(first.thread_id)
                test.not_nil(first.projection_id)

                local before = cursor_for_projection(first.projection_id)
                test.not_nil(before)
                assert_source_projection_filter(before.projection_body)
                test.eq(nil, before.actor_id)
                test.eq("proc", before.worker_runtime)
                test.eq(before.worker_ref, SOURCE_WORKER_PROC_REF)
                local generation = assert(tonumber(before.generation), "cursor generation must be numeric")

                local paused, pause_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = test_kb_id,
                    action = "pause",
                })
                test.is_nil(pause_err)
                test.not_nil(paused)
                test.is_true(paused.success, "pause: " .. tostring(paused.error))
                test.eq(first.thread_id, paused.thread_id)
                test.eq(first.projection_id, paused.projection_id)
                test.eq(before.id, paused.cursor_id)
                test.eq(paused.status, "paused")

                local second, second_err = exec:call("app:agent_embed_content", {
                    content = "Pause control regression document two.",
                    title = "Pause control two",
                    external_id = "pause-control-" .. uuid(),
                    external_version = "v1",
                })
                test.is_nil(second_err)
                test.is_true(second.success, "second enqueue: " .. tostring(second.error))
                test.eq(second.thread_id, first.thread_id)
                test.eq(second.projection_id, first.projection_id)

                local after = cursor_for_projection(first.projection_id)
                test.not_nil(after)
                test.eq(after.id, before.id)
                test.eq(before.actor_id, after.actor_id)
                test.eq(before.cursor_actor_id, after.cursor_actor_id)
                test.eq(before.execution_identity_json, after.execution_identity_json)
                test.eq(after.status, "paused")
                test.eq("proc", after.worker_runtime)
                test.eq(after.worker_ref, SOURCE_WORKER_PROC_REF)
                test.eq(tonumber(after.generation), generation + 1)

                local resumed, resume_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = test_kb_id,
                    action = "resume",
                })
                test.is_nil(resume_err)
                test.is_true(resumed.success, "resume: " .. tostring(resumed.error))
                test.eq(after.id, resumed.cursor_id)
                test.is_true(resumed.status ~= "paused")
            end)

            test.it("configure writes per-KB materialization config and never tunes the declared source cursor", function()
                local exec = new_executor(test_user_id):with_context({ kb_id = test_kb_id })
                local first, first_err = exec:call("app:agent_embed_content", {
                    content = "Backpressure control regression document one.",
                    title = "Backpressure control one",
                    external_id = "pressure-control-" .. uuid(),
                    external_version = "v1",
                })
                test.is_nil(first_err)
                test.is_true(first.success, "first enqueue: " .. tostring(first.error))

                local before = cursor_for_projection(first.projection_id)
                test.not_nil(before)

                -- Legacy cursor-tuning arguments ride along to prove they are inert:
                -- cursors are declared (meta.projections), configure only persists the
                -- per-KB materialization config on the store row.
                local configured, configure_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = test_kb_id,
                    action = "configure",
                    config = { chunk_max_tokens = 512 },
                    batch_size = 7,
                    window_max_events = 3,
                })
                test.is_nil(configure_err)
                test.is_true(configured.success, "configure: " .. tostring(configured.error))
                test.eq(first.thread_id, configured.thread_id)
                test.eq(first.projection_id, configured.projection_id)
                test.not_nil(configured.cursor)
                test.eq(tonumber(before.debounce_idle_ms), tonumber(configured.cursor.debounce_idle_ms))
                test.eq(tonumber(before.debounce_max_ms), tonumber(configured.cursor.debounce_max_ms))
                test.eq("proc", configured.cursor.worker_runtime)
                test.eq(configured.cursor.worker_ref, SOURCE_WORKER_PROC_REF)

                local store_row, store_err = kb10_store.get_store(test_kb_id)
                test.is_nil(store_err)
                test.not_nil(store_row)
                test.eq(512, tonumber(store_row.config.chunk_max_tokens))

                local after_configure = cursor_for_projection(first.projection_id)
                test.not_nil(after_configure)
                test.eq(tonumber(before.debounce_idle_ms), tonumber(after_configure.debounce_idle_ms))
                test.eq(tonumber(before.debounce_max_ms), tonumber(after_configure.debounce_max_ms))
                test.eq("proc", after_configure.worker_runtime)
                test.eq(after_configure.worker_ref, SOURCE_WORKER_PROC_REF)
                test.eq(tonumber(before.generation), tonumber(after_configure.generation))

                local paused, pause_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = test_kb_id,
                    action = "pause",
                })
                test.is_nil(pause_err)
                test.is_true(paused.success, "pause: " .. tostring(paused.error))
                test.eq("paused", paused.status)

                local reconfigured, reconfigure_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = test_kb_id,
                    action = "configure",
                    config = { chunk_max_tokens = 640 },
                })
                test.is_nil(reconfigure_err)
                test.is_true(reconfigured.success, "reconfigure: " .. tostring(reconfigured.error))
                test.eq("paused", reconfigured.status)

                local after_paused = cursor_for_projection(first.projection_id)
                test.not_nil(after_paused)
                test.eq("paused", after_paused.status)
                test.eq(tonumber(before.debounce_idle_ms), tonumber(after_paused.debounce_idle_ms))
                test.eq(tonumber(before.debounce_max_ms), tonumber(after_paused.debounce_max_ms))
                test.eq("proc", after_paused.worker_runtime)
                test.eq(after_paused.worker_ref, SOURCE_WORKER_PROC_REF)
            end)

            test.it("configure without a config payload is a pure status read", function()
                local status_kb_id = uuid()
                local status_user_id = "test_ingest_status_" .. uuid()
                local create_err = create_test_kb(status_kb_id, status_user_id)
                test.is_nil(create_err)

                local exec = new_executor(status_user_id):with_context({ kb_id = status_kb_id })
                local queued, queue_err = exec:call("app:agent_embed_content", {
                    content = "Cursor status regression document.",
                    title = "Cursor status",
                    external_id = "cursor-status-" .. uuid(),
                    external_version = "v1",
                })
                test.is_nil(queue_err)
                test.is_true(queued.success, "queue: " .. tostring(queued.error))

                -- Event materialization is asynchronous: the source worker and its
                -- downstream digest/graph emissions legitimately move this cursor
                -- through pending/running/live. Pause through the public control
                -- surface before taking the baseline so this assertion isolates
                -- configure's behavior instead of racing the scheduler.
                local paused, pause_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = status_kb_id,
                    action = "pause",
                })
                test.is_nil(pause_err)
                test.is_true(paused.success, "pause: " .. tostring(paused.error))
                test.eq("paused", paused.status)

                local before = cursor_for_projection(queued.projection_id)
                test.not_nil(before)
                test.eq("paused", before.status)

                local configured, configure_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = status_kb_id,
                    action = "configure",
                })
                test.is_nil(configure_err)
                test.is_true(configured.success, "configure: " .. tostring(configured.error))
                test.eq(queued.projection_id, configured.projection_id)

                local after = cursor_for_projection(queued.projection_id)
                test.not_nil(after)
                test.eq(before.status, after.status)
                test.eq(tonumber(before.generation), tonumber(after.generation))
                test.eq(tonumber(before.debounce_idle_ms), tonumber(after.debounce_idle_ms))
                test.eq(tonumber(before.debounce_max_ms), tonumber(after.debounce_max_ms))
                test.eq(before.worker_ref, after.worker_ref)

                local db = sql.get("app:db")
                if db then cleanup_test_kb(db, status_kb_id, status_user_id) db:release() end
            end)

            test.it("idempotent enqueue keeps the existing source event and projection", function()
                local stale_kb_id = uuid()
                local stale_user_id = "test_ingest_meta_sync_" .. uuid()
                local create_err = create_test_kb(stale_kb_id, stale_user_id)
                test.is_nil(create_err)

                local exec = new_executor(stale_user_id):with_context({ kb_id = stale_kb_id })
                local external_id = "meta-sync-" .. uuid()
                local first, first_err = exec:call("app:agent_embed_content", {
                    content = "Public meta count refresh regression document.",
                    title = "Meta count refresh",
                    external_id = external_id,
                    external_version = "v1",
                })
                test.is_nil(first_err)
                test.is_true(first.success, "first enqueue: " .. tostring(first.error))

                local opened, db_err = sql.get("app:db")
                test.is_nil(db_err)
                if not opened then error("app:db unavailable: " .. tostring(db_err)) end
                local db = opened :: sql.DB
                local thread_rows = db:query("SELECT event_count FROM kickside_thread WHERE id = $1", { first.thread_id })
                local head = tonumber(thread_rows and thread_rows[1] and thread_rows[1].event_count) or 0
                local _, cursor_err = sql.builder.update("kickside_projection_cursor")
                    :set("status", "active")
                    :set("last_seq", head)
                    :set("last_error", nil)
                    :where(sql.builder.eq({ projection_id = first.projection_id }))
                    :run_with(db):exec()
                db:release()
                test.is_nil(cursor_err)

                local second, second_err = exec:call("app:agent_embed_content", {
                    content = "Public meta count refresh regression document.",
                    title = "Meta count refresh",
                    external_id = external_id,
                    external_version = "v1",
                })
                test.is_nil(second_err)
                test.is_true(second.success, "duplicate enqueue: " .. tostring(second.error))
                test.eq(first.thread_id, second.thread_id)
                test.eq(first.projection_id, second.projection_id)

                local count_opened, count_err = sql.get("app:db")
                if not count_opened then error("app:db unavailable: " .. tostring(count_err)) end
                local event_count_db = count_opened :: sql.DB
                local count_rows = event_count_db:query(
                    "SELECT event_count FROM kickside_thread WHERE id = $1",
                    { first.thread_id }
                )
                event_count_db:release()
                test.eq(head, tonumber(count_rows and count_rows[1] and count_rows[1].event_count))

                local db_cleanup = sql.get("app:db")
                if db_cleanup then cleanup_test_kb(db_cleanup, stale_kb_id, stale_user_id) db_cleanup:release() end
            end)

            test.it("configure ignores legacy runtime-migration arguments and keeps the declared proc wiring", function()
                local migrate_kb_id = uuid()
                local migrate_user_id = "test_ingest_migrate_" .. uuid()
                local create_err = create_test_kb(migrate_kb_id, migrate_user_id)
                test.is_nil(create_err)

                local exec = new_executor(migrate_user_id):with_context({ kb_id = migrate_kb_id })
                local queued, queue_err = exec:call("app:agent_embed_content", {
                    content = "Runtime migration regression document.",
                    title = "Runtime migration",
                    external_id = "runtime-migration-" .. uuid(),
                    external_version = "v1",
                })
                test.is_nil(queue_err)
                test.is_true(queued.success, "enqueue before runtime migration: " .. tostring(queued.error))

                local initial = cursor_for_projection(queued.projection_id)
                test.not_nil(initial)
                test.eq("proc", initial.worker_runtime)
                test.eq(initial.worker_ref, SOURCE_WORKER_PROC_REF)

                -- Cursor wiring is declared on the projection, not tunable through the
                -- control surface: legacy worker_runtime/batch_size arguments are inert
                -- and the call reports status instead of rewriting the cursor.
                local func_configured, func_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = migrate_kb_id,
                    action = "configure",
                    worker_runtime = "func",
                    batch_size = 5,
                })
                test.is_nil(func_err)
                test.is_true(func_configured.success, "configure: " .. tostring(func_configured.error))

                local after = cursor_for_projection(queued.projection_id)
                test.not_nil(after)
                test.eq("proc", after.worker_runtime)
                test.eq(after.worker_ref, SOURCE_WORKER_PROC_REF)
                test.eq(tonumber(initial.debounce_idle_ms), tonumber(after.debounce_idle_ms))
                test.eq(tonumber(initial.debounce_max_ms), tonumber(after.debounce_max_ms))
                test.eq(tonumber(initial.generation), tonumber(after.generation))

                local paused, pause_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = migrate_kb_id,
                    action = "pause",
                })
                test.is_nil(pause_err)
                test.is_true(paused.success, "pause migration cursor: " .. tostring(paused.error))
                test.eq("paused", paused.status)

                local proc_configured, proc_err = exec:call(INGEST_CONTROL_METHOD, {
                    kb_id = migrate_kb_id,
                    action = "configure",
                })
                test.is_nil(proc_err)
                test.is_true(proc_configured.success, "configure while paused: " .. tostring(proc_configured.error))
                test.eq("paused", proc_configured.status)
                test.eq("proc", proc_configured.cursor.worker_runtime)
                test.eq(proc_configured.cursor.worker_ref, SOURCE_WORKER_PROC_REF)

                local db = sql.get("app:db")
                if db then cleanup_test_kb(db, migrate_kb_id, migrate_user_id) db:release() end
            end)

            test.it("deletes the KB-owned ingest thread when the KB is deleted", function()
                local cleanup_kb_id = uuid()
                local cleanup_user_id = "test_ingest_cleanup_" .. uuid()
                local create_err = create_test_kb(cleanup_kb_id, cleanup_user_id)
                test.is_nil(create_err)

                local exec = new_executor(cleanup_user_id):with_context({ kb_id = cleanup_kb_id })
                local queued, queue_err = exec:call("app:agent_embed_content", {
                    content = "Lifecycle cleanup regression document.",
                    title = "Lifecycle cleanup",
                    external_id = "cleanup-control-" .. uuid(),
                    external_version = "v1",
                })
                test.is_nil(queue_err)
                test.is_true(queued.success, "enqueue before cleanup: " .. tostring(queued.error))
                test.is_true(thread_exists(queued.thread_id))

                local deleted, delete_err = exec:call("kickside.knowledge.registry:kb_delete", {
                    component_id = cleanup_kb_id,
                })
                test.is_nil(delete_err)
                test.not_nil(deleted)
                test.eq(cleanup_kb_id, deleted.component_id)
                test.is_false(thread_exists(queued.thread_id))
            end)

            test.it("direct deletable binding removes the KB-owned ingest thread", function()
                local direct_kb_id = uuid()
                local direct_user_id = "test_ingest_direct_delete_" .. uuid()
                local create_err = create_test_kb(direct_kb_id, direct_user_id)
                test.is_nil(create_err)

                local exec = new_executor(direct_user_id):with_context({ kb_id = direct_kb_id })
                local queued, queue_err = exec:call("app:agent_embed_content", {
                    content = "Direct delete binding cleanup regression document.",
                    title = "Direct delete cleanup",
                    external_id = "direct-delete-" .. uuid(),
                    external_version = "v1",
                })
                test.is_nil(queue_err)
                test.is_true(queued.success, "enqueue before direct delete: " .. tostring(queued.error))
                test.is_true(thread_exists(queued.thread_id))

                local instance, open_err = open_embed(direct_kb_id, direct_user_id)
                test.is_nil(open_err, "contract.open: " .. tostring(open_err))
                local deleted, delete_err = instance:delete({})
                test.is_nil(delete_err)
                test.is_true(deleted.success, "direct delete: " .. tostring(deleted.error))
                test.is_false(thread_exists(queued.thread_id))

                local db = sql.get("app:db")
                if db then cleanup_test_kb(db, direct_kb_id, direct_user_id) db:release() end
            end)
        end)

        test.describe("manual embed flow", function()
            test.it("embeds manually composed content via the embed binding", function()
                local instance, open_err = open_embed(test_kb_id, test_user_id)
                test.is_nil(open_err, "contract.open: " .. tostring(open_err))

                local result, embed_err = instance:embed_content({
                    content = "Paris is the capital of France.",
                    content_type = "text/plain",
                    metadata = { title = "manual", source = "test_fetch" },
                })
                test.is_nil(embed_err, "embed: " .. tostring(embed_err))
                test.not_nil(result)
                test.is_true(result.success, "embed result: " .. tostring(result.error or json.encode(result)))
                test.eq("queued", result.status)
                test.eq(test_kb_id, result.kb_id)
                test.not_nil(result.thread_id)
                test.not_nil(result.projection_id)
                test.not_nil(result.external_id)

                local event = event_for_external(result.thread_id, result.external_id, "kickside.knowledge.events:content.upserted")
                test.not_nil(event)
                test.eq("kb10.embed_content", event.body.source_ref.origin.type)
                test.eq(result.external_id, event.body.source_ref.origin.id)
                test.eq(result.external_id, event.body.source_ref.external_id)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
