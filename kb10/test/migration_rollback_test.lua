-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local registry = require("registry")
local sql = require("sql")
local test = require("test")

local DATABASE = "app:kb10_rollback_db"

local function migrate(id, direction)
    local result, err = funcs.call(id, { id = id, database_id = DATABASE, direction = direction })
    test.is_nil(err, tostring(err))
    test.eq(result.failed, 0, id .. ": " .. tostring(result.error))
end

local function define_tests()
    test.describe("KB10 migration rollback", function()
        test.it("preserves a store across schema rollback and permits a full reinstall", function()
            local app_db = assert(sql.get("app:db"))
            local rollback_db = assert(sql.get(DATABASE))
            local dialect = app_db:type()
            test.eq(rollback_db:type(), dialect)
            if dialect == sql.type.POSTGRES then
                local function database_name(db)
                    local rows = assert(db:query("SELECT current_database() AS name"))
                    return rows[1].name
                end
                test.is_true(database_name(app_db) ~= database_name(rollback_db),
                    "rollback requires a separate PostgreSQL database")
            end
            rollback_db:release()
            app_db:release()

            local entries, err = registry.find({ ["meta.type"] = "migration" })
            test.is_nil(err, tostring(err))
            local ids = {}
            for _, entry in ipairs(entries) do
                local id = tostring(entry.id)
                if id:match("^kickside%.kb10%.migrations:") then ids[#ids + 1] = id end
            end
            table.sort(ids)
            local checkpoint
            for index, id in ipairs(ids) do
                migrate(id, "up")
                if id == "kickside.kb10.migrations:06_source_text_index" then checkpoint = index end
            end
            test.is_true(checkpoint ~= nil)
            local store_id = "54bf5bf9-d88e-4bea-8190-9bfddb93792e"
            local db = assert(sql.get(DATABASE))
            local _, insert_err = db:execute(
                "INSERT INTO kb10_stores(id,component_id,embedding_model) VALUES ($1,$2,$3)",
                {store_id, store_id, "class:embed"})
            test.is_nil(insert_err, tostring(insert_err))
            local _, node_err = db:execute(
                "INSERT INTO kb10_nodes(id,store_id,node_type,content) VALUES ($1,$2,'document',$3)",
                {"348eab76-adfb-4213-b4cd-4bdd0bdb8033", store_id, "Durable document"})
            db:release()
            test.is_nil(node_err, tostring(node_err))

            for i = #ids, checkpoint, -1 do migrate(ids[i], "down") end
            for i = checkpoint, #ids do migrate(ids[i], "up") end
            db = assert(sql.get(DATABASE))
            local rows, read_err = db:query(
                [[SELECT s.embedding_model, s.document_count, s.failed_count, n.content
                    FROM kb10_stores s JOIN kb10_nodes n ON n.store_id=s.id WHERE s.id=$1]], {store_id})
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq(#rows, 1)
            test.eq(rows[1].embedding_model, "class:embed")
            test.eq(rows[1].content, "Durable document")
            test.eq(tonumber(rows[1].document_count), 1)
            test.eq(tonumber(rows[1].failed_count), 0)

            for i = #ids, 1, -1 do migrate(ids[i], "down") end
            for _, id in ipairs(ids) do migrate(id, "up") end
            for i = #ids, 1, -1 do migrate(ids[i], "down") end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
