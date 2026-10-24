-- Tests for kickside.knowledge:knowledge_bases binding.

local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local funcs = require("funcs")
local security = require("security")
local engines = require("engines")
local contract = require("contract")

local NS = "kickside.knowledge.registry"
local node_store = require("node_store")
local kb10_store = require("kb10_store")

local function uuid(): string
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

-- A KB create now provisions the KB primary thread's declared projections, which
-- capture a reconstructable execution identity for the source worker. The scope
-- resolver reconstructs it from the acting user, so the executor's user must be a
-- real app_users row (with a group) for capture to succeed.
local function ensure_test_user(db: any, user_id: string): any
    local email = user_id:gsub("[^%w_%-]", "_") .. "@kb10.test"
    if db:type() == sql.type.SQLITE then
        local _, uerr = db:execute(
            [[INSERT OR IGNORE INTO app_users
              (user_id, email, full_name, password_hash, status, created_at, updated_at)
              VALUES ($1, $2, 'KB10 Registry Test User', '!test:no-password', 'active',
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
          VALUES ($1, $2, 'KB10 Registry Test User', '!test:no-password', 'active', now(), now())
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

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope("wippy.security:process")
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function provision_kb_thread(component_id: string, user_id: string, kb_type: string): string?
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope("wippy.security:process")
    local def, def_err = contract.get("kickside.core:threads")
    if def_err or not def then return "threads contract: " .. tostring(def_err) end
    local threads, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not threads then return "threads open: " .. tostring(open_err) end
    local impl_id = (kb_type == "wiki") and "kickside.kb10:engine_wiki" or "kickside.kb10:engine_document"
    local _, ensure_err = threads:ensure_thread({
        component_id = component_id,
        impl_id = impl_id,
        thread_class = "kickside.knowledge.injection",
    })
    if ensure_err then return "ensure_thread: " .. tostring(ensure_err) end
    return nil
end

local function call(exec: any, fn: string, args: any): (any, any)
    return exec:call(NS .. ":" .. fn, args)
end

local function cleanup(db: any, _prefix: string): ()
    -- Resolve every KB component (current + prior runs) and tear down its
    -- impl-level child rows in dependency order before removing the
    -- umbrella. SQLite per-connection FKs aren't reliable in the pool, so
    -- the vector table (kb10_embeddings) and FTS rows are deleted explicitly.
    local rows = db:query(
        "SELECT component_id FROM kickside_components " ..
        "WHERE impl_id = 'kickside.kb10:embeddable'"
    ) or {}
    for _, r in ipairs(rows) do
        local cid = (r :: any).component_id
        local kb_rows = db:query("SELECT id FROM kb10_stores WHERE component_id = $1", { cid }) or {}
        if #kb_rows > 0 then
            local kb_id = (kb_rows[1] :: any).id
            db:execute("DELETE FROM kb10_edges WHERE store_id = $1", { kb_id })
            db:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { kb_id })
            db:execute(
                "DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM kb10_nodes WHERE store_id = $1)",
                { kb_id }
            )
            db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { kb_id })
            db:execute("DELETE FROM kb10_stores WHERE id = $1", { kb_id })
        end
        db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
        db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
        db:execute("DELETE FROM kickside_component_group_access WHERE component_id = $1", { cid })
        db:execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
    end
end

local function define_tests()
    test.describe("kickside.knowledge:knowledge_bases binding", function()
        local db: any
        local exec: any
        local prefix = "kbtest_" .. uuid():sub(1, 8) .. "_"

        test.before_all(function()
            exec = new_executor("kb_test_user")
            db = sql.get("app:db")
            test.not_nil(db)
            local user_err = ensure_test_user(db, "kb_test_user")
            test.is_nil(user_err, "seed test user: " .. tostring(user_err))
            cleanup(db, prefix)
        end)

        test.after_all(function()
            cleanup(db, prefix)
            if db then db:release() end
        end)

        test.describe("argument validation", function()
            test.it("create requires name", function()
                local _, err = call(exec, "kb_create", { embedding_model = "class:embed" })
                test.not_nil(err)
                test.eq(tostring(err):find("name") ~= nil, true)
            end)

            test.it("create requires embedding_model", function()
                local _, err = call(exec, "kb_create", { name = prefix .. "x" })
                test.not_nil(err)
                test.eq(tostring(err):find("embedding_model") ~= nil, true)
            end)

            test.it("create rejects bad kb_type", function()
                local _, err = call(exec, "kb_create", {
                    name = prefix .. "x",
                    embedding_model = "class:embed",
                    kb_type = "invalid",
                })
                test.not_nil(err)
                test.eq(tostring(err):find("kb_type") ~= nil, true)
            end)

            test.it("find requires component_id or name", function()
                local _, err = call(exec, "kb_find", {})
                test.not_nil(err)
            end)

            test.it("update requires component_id", function()
                local _, err = call(exec, "kb_update", {})
                test.not_nil(err)
            end)

            test.it("delete requires component_id", function()
                local _, err = call(exec, "kb_delete", {})
                test.not_nil(err)
            end)

        end)

        test.describe("engine catalog", function()
            test.it("exposes document and wiki create choices", function()
                local list, err = engines.list()
                test.is_nil(err)

                local by_type: any = {}
                for _, e in ipairs(list or {}) do
                    by_type[(e :: any).kb_type] = e
                end

                local document = by_type.document
                local wiki = by_type.wiki
                test.not_nil(document)
                test.not_nil(wiki)
                test.eq(document.label, "Document")
                test.eq(wiki.label, "Wiki")
                test.eq(document.create_ui_id, "kx-kb-create")
                test.eq(wiki.create_ui_id, "kx-kb-create")
                test.eq(document.manage_ui_id, "kx-kb-document")
                test.eq(wiki.manage_ui_id, "kx-kb-wiki")
            end)
        end)

        test.describe("create + find + list + delete cycle (kb10)", function()
            local component_id: string?
            local kb_name = prefix .. "doc1"

            test.it("creates a document KB", function()
                local result, err = call(exec, "kb_create", {
                    name = kb_name,
                    embedding_model = "class:embed",
                    kb_type = "document",
                })
                test.is_nil(err, "create: " .. tostring(err))
                test.not_nil(result)
                test.not_nil(result.component_id)
                test.eq(result.kb_type, "document")
                component_id = result.component_id
            end)

            test.it("finds by name", function()
                local found, err = call(exec, "kb_find", { name = kb_name })
                test.is_nil(err)
                test.not_nil(found)
                test.eq(found.component_id, component_id)
            end)

            test.it("finds by component_id", function()
                local found, err = call(exec, "kb_find", { component_id = component_id })
                test.is_nil(err)
                test.not_nil(found)
            end)

            test.it("upsert is idempotent", function()
                local result, err = call(exec, "kb_upsert", {
                    name = kb_name,
                    embedding_model = "class:embed",
                })
                test.is_nil(err)
                test.eq(result.created, false)
            end)

            test.it("update patches description", function()
                local result, err = call(exec, "kb_update", {
                    component_id = component_id,
                    description = "test description",
                })
                test.is_nil(err, "update: " .. tostring(err))
                test.not_nil(result)
            end)

            test.it("update rejects immutable structural fields", function()
                local _, model_err = call(exec, "kb_update", {
                    component_id = component_id,
                    description = "should not apply",
                    embedding_model = "class:other",
                })
                test.not_nil(model_err)
                test.is_true(tostring(model_err):find("embedding_model is immutable", 1, true) ~= nil)

                local _, type_err = call(exec, "kb_update", {
                    component_id = component_id,
                    name = kb_name .. "_wiki",
                    kb_type = "wiki",
                })
                test.not_nil(type_err)
                test.is_true(tostring(type_err):find("kb_type is immutable", 1, true) ~= nil)
            end)

            test.it("list includes our KB", function()
                local list, err = call(exec, "kb_list", { kb_type = "document" })
                test.is_nil(err)
                local found = false
                for _, c in ipairs(list :: any) do
                    if (c :: any).component_id == component_id then
                        found = true; break
                    end
                end
                test.eq(found, true)
            end)

            test.it("a denied delete preserves the component and its backing store", function()
                local viewer = "kb-delete-viewer-" .. uuid()
                test.is_nil(ensure_test_user(db, viewer))
                local _, grant_err = db:execute([[INSERT INTO kickside_component_access
                    (access_id,subject_id,subject_type,component_id,source_component_id,access_mask,inherited)
                    VALUES ($1,$2,'user',$3,$4,1,0)]], { uuid(), viewer, component_id, component_id })
                test.is_nil(grant_err, tostring(grant_err))
                local _, delete_err = call(new_executor(viewer), "kb_delete", { component_id = component_id })
                test.not_nil(delete_err)
                local stores, store_err = db:query("SELECT id FROM kb10_stores WHERE component_id=$1", { component_id })
                test.is_nil(store_err, tostring(store_err))
                test.eq(#stores, 1, "a refused delete retains the backing store")
                local owner_kb, owner_err = call(exec, "kb_find", { component_id = component_id })
                test.is_nil(owner_err)
                test.eq(owner_kb.component_id, component_id)
            end)
            test.it("delete removes the KB", function()
                local result, err = call(exec, "kb_delete", { component_id = component_id })
                test.is_nil(err, "delete: " .. tostring(err))
                test.not_nil(result)
                component_id = nil
            end)
        end)

        test.describe("Bounded knowledge deletion", function()
            test.it("keeps the store fenced until thread cleanup completes", function()
                local created, create_err = call(exec, "kb_create", {
                    name = prefix .. "bounded", kb_type = "document", embedding_model = "class:embed",
                })
                test.is_nil(create_err, tostring(create_err))
                local id = created.component_id
                for i = 1, 305 do
                    local _, insert_err = db:execute("INSERT INTO kickside_projection (id,thread_id,kind,projection_key,body,state,last_event_seq,created_at,updated_at)"
                        .. " VALUES ($1,$2,$3,'default','{}','valid',0,$4,$4)",
                        { uuid(), id, "bounded-" .. tostring(i), "2026-01-01T00:00:00Z" })
                    test.is_nil(insert_err, tostring(insert_err))
                end
                local result, delete_err = call(exec, "kb_delete", { component_id = id })
                test.is_nil(delete_err, tostring(delete_err))
                test.is_true(result.in_progress)
                test.is_false(result.deleted)
                test.is_true(result.cleanup_pending)
                test.is_true(result.details.needs_continue)
                local rows, read_err = db:query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { id })
                test.is_nil(read_err)
                test.not_nil(rows[1].deleting_at)
                rows, read_err = db:query("SELECT id FROM kb10_stores WHERE component_id=$1", { id })
                test.is_nil(read_err)
                test.eq(#rows, 1)
                for i = 1, 8 do
                    local tick, tick_err = exec:call("kickside.component:retention", {})
                    test.is_nil(tick_err, tostring(tick_err))
                    test.is_true(tick.success, tostring(tick.error))
                end
                for _, table_name in ipairs({ "kickside_components", "kb10_stores", "kickside_component_thread_reap" }) do
                    rows, read_err = db:query("SELECT component_id FROM " .. table_name .. " WHERE component_id=$1", { id })
                    test.is_nil(read_err)
                    test.eq(#rows, 0, table_name .. " completes cleanup")
                end
                rows, read_err = db:query("SELECT id FROM kickside_thread WHERE id=$1", { id })
                test.is_nil(read_err)
                test.eq(#rows, 0)
            end)
        end)

        test.describe("QA-P05 ingested knowledge deletion", function()
            for _, kind in ipairs({ "document", "wiki" }) do
                test.it("immediately deletes an ingested " .. kind .. " and its complete backing state", function()
                    local created, create_err = call(exec, "kb_create", {
                        name = prefix .. "immediate-" .. kind, kb_type = kind, embedding_model = "class:embed",
                    })
                    test.is_nil(create_err, tostring(create_err))
                    local id = created.component_id
                    local _, rename_err = call(exec, "kb_update", { component_id = id, name = prefix .. "renamed-" .. kind })
                    test.is_nil(rename_err, tostring(rename_err))
                    local admitted, admit_err = exec:with_context({ kb_id = id }):call("app:agent_embed_content", {
                        title = "Northwind tea", content = "Northwind fictional tea ships in two business days.",
                        external_id = "qa-" .. uuid(), external_version = "v1",
                    })
                    test.is_nil(admit_err, tostring(admit_err))
                    test.is_true(admitted.success)
                    local deleted, delete_err = call(exec, "kb_delete", { component_id = id })
                    local delete_details = type(delete_err) == "userdata" and delete_err:details() or nil
                    test.is_nil(delete_err, tostring(delete_err) .. " " .. (json.encode(delete_details or {}) or ""))
                    test.eq(deleted.component_id, id)
                    for _, table_name in ipairs({ "kickside_components", "kb10_stores", "kb10_maintenance_runs" }) do
                        local rows, read_err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE component_id=$1", { id })
                        test.is_nil(read_err, tostring(read_err))
                        test.eq(tonumber(rows[1].n), 0, table_name .. " retains no deleted KB state")
                    end
                    local threads, thread_err = db:query("SELECT id FROM kickside_thread WHERE id=$1", { id })
                    test.is_nil(thread_err)
                    test.eq(#threads, 0)
                end)
            end
        end)

        -- Single declared path: creating a KB provisions its source/digest/graph_meta
        -- projections on the primary thread (thread_id == component_id) straight from
        -- the kb10 engine binding's meta.projections -- no imperative ensure.
        test.describe("declared projection provisioning", function()
            local function projections_for(cid: string): any
                local rows = db:query(
                    "SELECT kind, projection_key, body FROM kickside_projection WHERE thread_id = $1",
                    { cid }
                ) or {}
                local by_kind: any = {}
                for _, r in ipairs(rows) do
                    by_kind[(r :: any).kind] = r
                end
                return by_kind
            end

            local function cursor_kinds(cid: string): any
                local rows = db:query(
                    "SELECT p.kind AS kind FROM kickside_projection_cursor c " ..
                    "JOIN kickside_projection p ON p.id = c.projection_id WHERE c.thread_id = $1",
                    { cid }
                ) or {}
                local present: any = {}
                for _, r in ipairs(rows) do present[(r :: any).kind] = true end
                return present
            end

            local function assert_declared(cid: string, worker_probe: string): ()
                local proj = projections_for(cid)
                test.not_nil(proj["knowledge.injection.source"], "source projection")
                test.not_nil(proj["knowledge.injection.digest"], "digest projection")
                test.not_nil(proj["knowledge.graph.meta"], "graph_meta projection")

                local source_body = tostring((proj["knowledge.injection.source"] :: any).body)
                test.is_true(source_body:find(worker_probe, 1, true) ~= nil,
                    "source worker_ref points at kb10: " .. source_body)

                local cursors = cursor_kinds(cid)
                test.is_true(cursors["knowledge.injection.source"] == true, "source cursor")
                test.is_true(cursors["knowledge.injection.digest"] == true, "digest cursor")
                test.is_true(cursors["knowledge.graph.meta"] == true, "graph_meta cursor")
            end

            local function created_component_id(created: any): string
                test.not_nil(created)
                local cid = (type(created) == "table") and (created :: { component_id: any }).component_id or nil
                test.eq(type(cid), "string")
                return cid :: string
            end

            test.it("a document KB provisions source/digest/graph_meta cursors", function()
                local created, err = call(exec, "kb_create", {
                    name = prefix .. "provdoc",
                    embedding_model = "class:embed",
                    kb_type = "document",
                })
                test.is_nil(err, "create: " .. tostring(err))
                local cid = created_component_id(created)
                local provision_err = provision_kb_thread(cid, "kb_test_user", "document")
                test.is_nil(provision_err)
                assert_declared(cid, "kickside.kb10.injection:source_worker_proc")
                call(exec, "kb_delete", { component_id = cid })
            end)

            test.it("a wiki KB provisions source/digest/graph_meta cursors", function()
                local created, err = call(exec, "kb_create", {
                    name = prefix .. "provwiki",
                    embedding_model = "class:embed",
                    kb_type = "wiki",
                })
                test.is_nil(err, "create: " .. tostring(err))
                local cid = created_component_id(created)
                local provision_err = provision_kb_thread(cid, "kb_test_user", "wiki")
                test.is_nil(provision_err)
                assert_declared(cid, "kickside.kb10.injection:source_worker_proc")
                call(exec, "kb_delete", { component_id = cid })
            end)
        end)

        test.describe("KB explorer tools on a wiki KB", function()
            local function seeded_kb(name: string, kb_type: string): (string, string)
                local created, err = call(exec, "kb_create", { name = prefix .. name, embedding_model = "class:embed", kb_type = kb_type })
                test.is_nil(err, "create: " .. tostring(err))
                local cid = (created :: any).component_id
                local rows = db:query("SELECT id FROM kb10_stores WHERE component_id = $1", { cid })
                test.eq(#rows, 1)
                return cid, (rows[1] :: any).id
            end
            local function seeded_wiki(name: string): (string, string)
                local cid, store_id = seeded_kb(name, "wiki")
                return cid, store_id
            end

            test.it("SurveyKB maps every concept and names the BrowseKB call for the rest", function()
                local cid, store_id = seeded_wiki("survey")
                for index = 1, 40 do
                    local _, insert_err = node_store:insert_node({ store_id = store_id, node = {
                        node_type = "concept", content = "Topic " .. index, metadata = { label = string.format("Topic %02d", index) } } })
                    test.is_nil(insert_err)
                end
                local text, err = exec:call("kickside.kb10.traits:kb_summaries_tool", { kb_id = cid, limit = 35 })
                test.is_nil(err)
                test.contains(text, "## Concept map (35)")
                test.contains(text, "Topic 30")
                test.contains(text, "more concepts: list them with BrowseKB node_type=concept")
                local browse, browse_err = exec:call("kickside.kb10.traits:kb_browse_tool", { kb_id = cid, node_type = "concept", limit = 10 })
                test.is_nil(browse_err)
                test.contains(browse, "# Browse top (10)")
                test.contains(browse, "_More nodes: pass offset=10._")
                call(exec, "kb_delete", { component_id = cid })
            end)

            test.it("BrowseKB returns full labels without node content", function()
                local cid, store_id = seeded_wiki("browse-full")
                local label = "Northwind returns " .. string.rep("and refunds ", 30)
                local content = string.rep("Returns within 17 days need a receipt.\n", 300)
                local node_id, insert_err = node_store:insert_node({ store_id = store_id, node = {
                    node_type = "concept", content = content, metadata = { label = label } } })
                test.is_nil(insert_err)
                local rows, err = exec:call("kickside.kb10.traits:kb_browse_tool", { kb_id = cid, node_type = "concept" })
                test.is_nil(err)
                test.contains(rows, "- " .. node_id .. " [concept] · " .. label)
                test.is_nil((rows:find(content, 1, true)))
                local detail, detail_err = exec:call("kickside.kb10.traits:kb_get_node_tool", {kb_id = cid, node_id = node_id})
                test.is_nil(detail_err)
                test.contains(detail, content)
                call(exec, "kb_delete", { component_id = cid })
            end)

            test.it("TraverseKBGraph omits unlabelled node bodies", function()
                local cid, store_id = seeded_wiki("graph-summary")
                local content = string.rep("Full concept definition. ", 200)
                local node_id, insert_err = node_store:insert_node({store_id = store_id, node = {node_type = "concept", content = content, metadata = {}}})
                test.is_nil(insert_err)
                local graph, graph_err = exec:call("kickside.kb10.traits:kb_graph_tool", {kb_id = cid, node_id = node_id, depth = 1, limit = 2})
                test.is_nil(graph_err)
                test.contains(graph, node_id)
                test.is_nil((graph:find(content, 1, true)))
                local detail, detail_err = exec:call("kickside.kb10.traits:kb_get_node_tool", {kb_id = cid, node_id = node_id})
                test.is_nil(detail_err)
                test.contains(detail, content)
                call(exec, "kb_delete", {component_id = cid})
            end)

            test.it("SurveyKB lists summary identities and detail returns the full summary", function()
                local cid, store_id = seeded_kb("survey-full", "document")
                local doc_id, doc_err = kb10_store.insert_node(store_id, {
                    node_type = "document", content = "Handbook", content_type = "text/plain",
                    metadata = { external_source = "survey.test", external_id = "doc-1", title = "Handbook" },
                })
                test.is_nil(doc_err)
                local summary = string.rep("The handbook covers returns, refunds and warehouse routing. ", 40)
                local summary_id, summary_err = kb10_store.insert_node(store_id, {
                    node_type = "summary", parent_id = doc_id, content = summary, content_type = "text/plain",
                    metadata = { role = "summary" },
                })
                test.is_nil(summary_err)
                local text, err = exec:call("kickside.kb10.traits:kb_summaries_tool", { kb_id = cid })
                test.is_nil(err)
                test.contains(text, "- " .. summary_id .. " [summary]")
                test.contains(text, "document " .. doc_id)
                test.is_nil((text:find(summary, 1, true)))
                local detail, detail_err = exec:call("kickside.kb10.traits:kb_get_node_tool", {kb_id = cid, node_id = summary_id})
                test.is_nil(detail_err)
                test.contains(detail, summary)
                call(exec, "kb_delete", { component_id = cid })
            end)

            test.it("TraverseKBGraph says when the node limit leaves reachable nodes out", function()
                local cid, store_id = seeded_wiki("graph-limit")
                local hub, hub_err = node_store:insert_node({ store_id = store_id, node = {
                    node_type = "concept", content = "Hub", metadata = { label = "Hub" } } })
                test.is_nil(hub_err)
                for index = 1, 12 do
                    local _, child_err = node_store:insert_graph_node({ store_id = store_id, node = {
                        node_type = "concept", content = "Spoke", metadata = { label = "Spoke " .. tostring(index) } },
                        parent_edge = { to_node_id = hub, edge_type = "subtopic_of", weight = 1.0 } })
                    test.is_nil(child_err)
                end
                local cut, err = exec:call("kickside.kb10.traits:kb_graph_tool", { kb_id = cid, node_id = hub, depth = 1, limit = 5 })
                test.is_nil(err)
                test.contains(cut, "## Concepts (5)")
                test.contains(cut, "## Edges (4)")
                test.contains(cut, "_More nodes are reachable within this depth than limit=5 holds")
                local whole, whole_err = exec:call("kickside.kb10.traits:kb_graph_tool", { kb_id = cid, node_id = hub, depth = 1, limit = 13 })
                test.is_nil(whole_err)
                test.contains(whole, "## Concepts (13)")
                test.is_nil((whole:find("More nodes are reachable", 1, true)))
                call(exec, "kb_delete", { component_id = cid })
            end)

            test.it("GetKBNode returns the complete node content", function()
                local cid, store_id = seeded_wiki("node")
                local content = string.rep("Northwind returns policy. ", 2000)
                local node_id, insert_err = node_store:insert_node({ store_id = store_id, node = {
                    node_type = "concept", content = content, metadata = { label = "Long topic" } } })
                test.is_nil(insert_err)
                local text, err = exec:call("kickside.kb10.traits:kb_get_node_tool", { kb_id = cid, node_id = node_id })
                test.is_nil(err)
                test.contains(text, content)
                test.is_nil((text:find("truncated", 1, true)))
                call(exec, "kb_delete", { component_id = cid })
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
