-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component_owner = require("projection_owner")
local fs = require("fs")
local funcs = require("funcs")
local json = require("json")
local security = require("security")
local sql = require("sql")
local store = require("store")
local test = require("test")
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

        test.it("resumes a retained upgrade from the live head and reports missing owner proof", function()
            local earlier, retained, missing = uuid.v7(), uuid.v7(), uuid.v7()
            for _, id in ipairs({earlier, retained, missing}) do
                component_owner.create(uuid.v7(), id, WIKI, EMBEDDABLE)
                assert(store.create_store(id, "class:embed", {}, {kb_type = "wiki"}))
            end
            db(function(connection)
                assert(connection:execute("UPDATE kickside_components SET secrets_incarnation = NULL WHERE component_id = $1", {missing}))
                assert(connection:execute("UPDATE kickside_thread SET event_count = 13, max_pruned_seq = 13 WHERE id = $1", {retained}))
                assert(connection:execute("DELETE FROM kb10_placement_enrollment WHERE id = 1"))
                assert(connection:execute([[INSERT INTO kb10_placement_enrollment
                    (id, upper_id, after_id, enrolled, skipped, unresolved, issues, done)
                    VALUES (1, $1, $2, 0, 1, 0, '[]', 0)]], {missing, earlier}))
            end)
            local report = assert(funcs.call(UPGRADE))
            test.eq(report.status, "success")
            test.eq(report.details.outcome, "unresolved")
            test.eq(report.details.enrolled, 1, assert(json.encode(report)))
            test.eq(report.details.skipped, 1)
            test.eq(report.details.unresolved, 1)
            test.eq(report.details.issues[1].component_id, missing)
            test.eq(report.details.issues[1].code, "component_incarnation_missing")
            test.is_nil(projection(earlier).placement_cursor_id)
            local settled = projection(retained)
            verify_enrolled(settled, 13)
            test.is_nil(projection(missing).placement_cursor_id)
            local retry = assert(funcs.call(UPGRADE))
            test.eq(retry.details.enrolled, 1)
            test.eq(projection(retained).job_id, settled.job_id)
            test.eq(projection(retained).cursor_id, settled.cursor_id)
        end)
    end)
end)}
