-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function fails_read(table_name: string, column: string, fn: any)
    local db = fixture.db()
    local tx, begin_err = db:begin()
    test.is_nil(begin_err, tostring(begin_err))
    local _, setup_err = tx:execute("ALTER TABLE " .. table_name .. " RENAME COLUMN " .. column .. " TO app_broken_column")
    test.is_nil(setup_err, tostring(setup_err))
    local ok, result, read_err = pcall(fn, tx)
    local _, rollback_err = tx:rollback()
    db:release()
    test.is_nil(rollback_err, tostring(rollback_err))
    test.is_false(ok and read_err == nil, "A failed helper observation returns success")
    local failure = ok and read_err or result
    test.is_true(tostring(failure):find("column", 1, true) ~= nil, tostring(failure))
end

local function fails_write(table_name: string, operation: string, predicate: any, fn: any)
    local db = fixture.db()
    local sqlite = db:type() == "sqlite"
    if not sqlite then
        local _, err = db:execute([[CREATE FUNCTION app_support_reject_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
            RAISE EXCEPTION 'support write rejected'; END $$]])
        test.is_nil(err, tostring(err))
    end
    local _, trigger_err = db:execute(sqlite and
        ("CREATE TRIGGER app_support_reject BEFORE " .. operation .. " ON " .. table_name .. " WHEN " .. predicate.sqlite .. " BEGIN SELECT RAISE(ABORT, 'support write rejected'); END") or
        ("CREATE TRIGGER app_support_reject BEFORE " .. operation .. " ON " .. table_name .. " FOR EACH ROW WHEN (" .. predicate.postgres .. ") EXECUTE FUNCTION app_support_reject_fn()"))
    db:release()
    test.is_nil(trigger_err, tostring(trigger_err))
    local ok, failure = pcall(fn)
    db = fixture.db()
    local _, drop_err = db:execute(sqlite and "DROP TRIGGER app_support_reject" or ("DROP TRIGGER app_support_reject ON " .. table_name))
    test.is_nil(drop_err, tostring(drop_err))
    if not sqlite then
        local _, err = db:execute("DROP FUNCTION app_support_reject_fn()")
        test.is_nil(err, tostring(err))
    end
    db:release()
    test.is_false(ok, "A failed helper mutation returns success")
    test.is_true(tostring(failure):find("support write rejected", 1, true) ~= nil, tostring(failure))
end

local function define_tests()
    test.describe("test support database failures", function()
        test.before_each(function() fixture.script.reset("support"); fixture.history.ensure() end)
        test.it("raises isolated script and history read errors", function()
            fails_read("app_llm_requests", "schema", function(conn: any) return fixture.script.requests_from(conn, "support", "structured_output") end)
            fails_read("app_llm_requests", "messages", function(conn: any) return fixture.script.prompts_from(conn, "support", "structured_output") end)
            fails_read("app_llm_script", "method", function(conn: any) return fixture.script.pending_from(conn, "support", "structured_output") end)
            fails_read("app_history", "content", function(conn: any) return fixture.history.get_history_from(conn, { host = { session_id = "read-failure" } }) end)
        end)
        test.it("raises isolated script write errors", function()
            fixture.script.respond("support", "structured_output", { items = {}, plans = {}, lessons = {} })
            local support_script = { sqlite = "OLD.scope = 'support'", postgres = "OLD.scope = 'support'" }
            fails_write("app_llm_script", "DELETE", support_script, function() fixture.script.reset("support") end)
            fails_write("app_llm_script", "DELETE", support_script, function() fixture.script.take("support", "structured_output") end)
            fails_write("app_llm_requests", "INSERT", { sqlite = "NEW.scope = 'support'", postgres = "NEW.scope = 'support'" },
                function() fixture.script.record("support", "structured_output", {}, {}) end)
        end)
        test.it("raises isolated history and user setup write errors", function()
            fails_write("app_history", "INSERT", { sqlite = "NEW.host_id = 'write-failure'", postgres = "NEW.host_id = 'write-failure'" },
                function() fixture.history.record("write-failure", { { id = "e", role = "user", content = "Evidence." } }) end)
            fails_write("app_users", "INSERT", { sqlite = "NEW.user_id GLOB 'support_*'", postgres = "NEW.user_id LIKE 'support_%'" },
                function() fixture.user("support") end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
